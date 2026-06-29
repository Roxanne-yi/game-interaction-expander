// Manifest validator for game-interaction-prd-expander.
// Run with Figma use_figma after rendering. Replace CONFIG.manifest and set
// CONFIG.targetBoardId before running.

const CONFIG = {
  manifest: "__TEMPLATE_MANIFEST_JSON__",
  targetBoardId: "",
  tolerance: 4,
  versionRowExpectedMode: "auto"
};

function assertConfig() {
  if (!CONFIG.manifest || CONFIG.manifest === "__TEMPLATE_MANIFEST_JSON__") {
    throw new Error("CONFIG.manifest is not set. Paste assets/krad-template/template-manifest.json before running.");
  }
  if (!CONFIG.targetBoardId) throw new Error("CONFIG.targetBoardId is required.");
}

function isContainer(node) {
  return "children" in node;
}

function walk(node, visit) {
  visit(node);
  if (!isContainer(node)) return;
  for (const child of node.children) walk(child, visit);
}

function approx(a, b, tolerance = CONFIG.tolerance) {
  return Math.abs(Number(a || 0) - Number(b || 0)) <= tolerance;
}

function getBounds(node) {
  return node && node.absoluteBoundingBox ? node.absoluteBoundingBox : null;
}

function rel(node, root) {
  const nb = getBounds(node);
  const rb = getBounds(root);
  if (!nb || !rb) return null;
  return { x: nb.x - rb.x, y: nb.y - rb.y, width: nb.width, height: nb.height };
}

function parseJson(value) {
  try { return JSON.parse(value); } catch (_error) { return null; }
}

async function resolveFromSourceId(board, sourceRoot, sourceId, options = {}) {
  const source = await figma.getNodeByIdAsync(sourceId);
  if (!source) return null;
  const sr = rel(source, sourceRoot);
  if (!sr) return null;
  let found = null;
  walk(board, (node) => {
    if (found || !("width" in node) || !("height" in node)) return;
    if (options.type && node.type !== options.type) return;
    if (!options.type && node.type !== source.type) return;
    const nr = rel(node, board);
    if (!nr) return;
    if (!approx(nr.x, sr.x) || !approx(nr.y, sr.y) || !approx(nr.width, sr.width) || !approx(nr.height, sr.height)) return;
    if (options.name !== false && source.name && node.name !== source.name) return;
    found = node;
  });
  return found;
}

function issue(issues, level, code, message, node) {
  issues.push({ level, code, message, nodeId: node ? node.id : undefined, nodeName: node ? node.name : undefined });
}

function allTexts(root) {
  const texts = [];
  walk(root, (node) => {
    if (node.type === "TEXT") texts.push(node);
  });
  return texts;
}

function textContent(root) {
  return allTexts(root).filter(isActuallyVisible).map((node) => node.characters || "").join("\n");
}

function isActuallyVisible(node) {
  let current = node;
  while (current) {
    if ("visible" in current && current.visible === false) return false;
    current = current.parent;
  }
  return true;
}

function hasNumberedLines(text) {
  return String(text || "").split(/\n+/).some((line) => /^\s*\d+[.、]/.test(line));
}

function solidHex(paint) {
  if (!paint || paint.type !== "SOLID") return "";
  const part = (v) => Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0").toUpperCase();
  return `#${part(paint.color.r)}${part(paint.color.g)}${part(paint.color.b)}`;
}

function hasWarningRed(node, manifest) {
  const expected = (manifest.style_tokens.warning_red.fill || "").toUpperCase();
  let ok = false;
  walk(node, (child) => {
    if (ok || !("fills" in child) || !Array.isArray(child.fills)) return;
    for (const fill of child.fills) {
      if (solidHex(fill) === expected) ok = true;
    }
  });
  return ok;
}

function directChildrenBetween(board, top, bottom) {
  return board.children.filter((node) => "y" in node && node.y >= top && node.y < bottom);
}

async function main() {
  assertConfig();
  const manifest = CONFIG.manifest;
  const issues = [];
  const board = await figma.getNodeByIdAsync(CONFIG.targetBoardId);
  if (!board || !isContainer(board)) throw new Error(`Target board not found or not inspectable: ${CONFIG.targetBoardId}`);
  const template = await figma.getNodeByIdAsync(manifest.source_template.node_id);
  if (!template) throw new Error(`Template node not found: ${manifest.source_template.node_id}`);

  const record = parseJson(board.getSharedPluginData ? board.getSharedPluginData(manifest.namespace, "renderRecord") : "");
  if (!record) issue(issues, "fail", "RENDER_RECORD_MISSING", "Board has no manifest renderRecord. Use render-brief-board.js; do not validate old template-lock boards.", board);

  validateGlobalSectionUniqueness(board, issues);
  await validateHeader(board, template, manifest, record, issues);
  await validateOverview(board, template, manifest, record, issues);
  await validateAdaptation(board, template, manifest, issues);
  await validateFlows(board, template, manifest, issues);
  await validateFeatureDetails(board, template, manifest, issues);
  await validateFooter(board, template, manifest, issues);
  validatePlaceholders(board, issues);

  const failCount = issues.filter((item) => item.level === "fail").length;
  const warnCount = issues.filter((item) => item.level === "warn").length;
  const report = {
    validatorVersion: "manifest-validator-v0.4",
    passed: failCount === 0,
    boardId: board.id,
    boardName: board.name,
    failCount,
    warnCount,
    issues
  };
  if (board.setSharedPluginData) board.setSharedPluginData(manifest.namespace, "lastValidation", JSON.stringify(report));
  return report;
}

function validateGlobalSectionUniqueness(board, issues) {
  const marks = allTexts(board)
    .filter(isActuallyVisible)
    .filter((node) => /^[1-5]\.0$/.test(String(node.characters || "").trim()));
  const counts = {};
  for (const mark of marks) counts[mark.characters.trim()] = (counts[mark.characters.trim()] || 0) + 1;
  for (const section of ["1.0", "2.0", "3.0", "4.0"]) {
    if ((counts[section] || 0) !== 1) {
      issue(issues, "fail", "GLOBAL_SECTION_COUNT_INVALID", `${section} must appear exactly once. Found ${counts[section] || 0}. Duplicate global sections usually mean feature modules were rendered as full-board copies.`, board);
    }
  }
  if ((counts["5.0"] || 0) > 1) {
    issue(issues, "fail", "EXTENSION_SECTION_COUNT_INVALID", `5.0 may appear at most once. Found ${counts["5.0"]}.`, board);
  }
}

async function validateHeader(board, template, manifest, record, issues) {
  const snapshots = record && Array.isArray(record.protectedSnapshots) ? record.protectedSnapshots : [];
  const headerIds = new Set([
    manifest.slots.header.bar_frame,
    manifest.slots.header.background,
    ...manifest.slots.header.brand_assets
  ]);
  for (const snapshot of snapshots.filter((item) => headerIds.has(item.sourceId))) {
    const node = await figma.getNodeByIdAsync(snapshot.id);
    if (!node) {
      issue(issues, "fail", "HEADER_NODE_DELETED", `Header protected node was deleted: ${snapshot.sourceId}`);
      continue;
    }
    const nr = rel(node, board);
    if (!nr || !approx(nr.x, snapshot.rel.x) || !approx(nr.y, snapshot.rel.y) || !approx(nr.width, snapshot.rel.width) || !approx(nr.height, snapshot.rel.height)) {
      issue(issues, "fail", "HEADER_STYLE_OR_GEOMETRY_CHANGED", "Header/top floating bar style or geometry changed. Only header text may be edited.", node);
    }
  }
}

async function validateOverview(board, template, manifest, record, issues) {
  const overview = manifest.slots.overview;
  const sectionNumber = await resolveFromSourceId(board, template, overview.section_number, { type: "TEXT" });
  const sectionTitle = await resolveFromSourceId(board, template, overview.section_title, { type: "TEXT" });
  const containers = [];
  for (const slot of Object.values(overview.body_slots)) {
    const container = await resolveFromSourceId(board, template, slot.container, { name: false });
    const question = await resolveFromSourceId(board, template, slot.fixed_question, { type: "TEXT" });
    const body = await resolveFromSourceId(board, template, slot.body, { type: "TEXT" });
    if (!container || !question || !body) issue(issues, "fail", "OVERVIEW_SLOT_MISSING", `Overview slot missing: ${slot.fixed_question_text}`, board);
    if (question && question.characters !== slot.fixed_question_text) issue(issues, "fail", "OVERVIEW_FIXED_QUESTION_CHANGED", "Overview fixed question text was changed.", question);
    if (container) containers.push(container);
  }
  if (!sectionNumber || !sectionTitle) issue(issues, "fail", "OVERVIEW_SECTION_HEADER_MISSING", "1.0 section header missing.", board);
  if (containers.length === 3) {
    const widths = containers.map((node) => Math.round(node.width));
    if (Math.max(...widths) - Math.min(...widths) < 40) issue(issues, "fail", "OVERVIEW_EQUAL_WIDTH_CARDS", "1.0 looks like equal-width cards. It must keep the asymmetric template layout.", containers[0]);
  }
  await validateVersionRows(board, template, manifest, record, issues);
}

async function validateVersionRows(board, template, manifest, record, issues) {
  const table = manifest.slots.overview.version_table;
  const container = await resolveFromSourceId(board, template, table.container, { name: false });
  if (!container) {
    issue(issues, "fail", "VERSION_TABLE_MISSING", "Version table container missing.", board);
    return;
  }
  const rows = [];
  walk(container, (node) => {
    if (node.type === "INSTANCE" && node.name === "子项") rows.push(node);
  });
  const mode = record && record.mode ? record.mode : "create";
  if (mode === "create" && rows.length !== 1) issue(issues, "fail", "VERSION_ROW_COUNT_CREATE", `First generation must keep one version row; found ${rows.length}.`, container);
  if (mode !== "create" && rows.length < 1) issue(issues, "fail", "VERSION_ROW_COUNT_ITERATION", "Iteration must preserve existing version rows and append one.", container);
}

async function validateAdaptation(board, template, manifest, issues) {
  for (const sourceId of manifest.slots.adaptation.frames) {
    const frame = await resolveFromSourceId(board, template, sourceId, { name: false });
    if (!frame) {
      issue(issues, "fail", "ADAPTATION_FRAME_MISSING", `2.0 adaptation frame missing: ${sourceId}`, board);
      continue;
    }
    const content = textContent(frame).trim();
    if (content && !/^适配方案$/.test(content)) issue(issues, "warn", "ADAPTATION_FILLED", "2.0 appears to contain filled content. It should stay empty by default.", frame);
  }
}

async function validateFlows(board, template, manifest, issues) {
  const flow = manifest.slots.flow;
  const flowChips = [];
  walk(board, (node) => {
    if (isActuallyVisible(node) && node.name === "流程名") flowChips.push(node);
  });
  if (flowChips.length === 0) issue(issues, "fail", "FLOW_NAME_MISSING", "3.0 must include at least one flow name.", board);
  validateFlowNames(board, flowChips, issues);
  const diagram = await resolveFromSourceId(board, template, flow.diagram_group, { name: false });
  if (!diagram) issue(issues, "fail", "FLOW_DIAGRAM_MISSING", "3.0 flow diagram group missing.", board);
  if (diagram) {
    const screenGroups = [];
    walk(diagram, (node) => {
      if (!isContainer(node)) return;
      const text = textContent(node);
      const hasScreenTitle = /界面/.test(text);
      const hasPlaceholder = node.children && node.children.some((child) => "width" in child && child.width >= 500 && child.height >= 250);
      if (hasScreenTitle && hasPlaceholder) screenGroups.push(node);
    });
    if (screenGroups.length === 0) issue(issues, "fail", "FLOW_NODE_MISSING", "Flow diagram must contain interface nodes with screen placeholders.", diagram);
    const connectors = [];
    walk(diagram, (node) => {
      if (node.type === "VECTOR" && /Arrow|箭头/i.test(node.name || "")) connectors.push(node);
    });
    if (connectors.length === 0) issue(issues, "fail", "FLOW_CONNECTORS_MISSING", "Flow diagram must contain connectors.", diagram);
    if (!/触发|条件|点击|确认|分支|判断/.test(textContent(diagram))) issue(issues, "fail", "FLOW_CONDITION_LABEL_MISSING", "Flow diagram must contain condition labels.", diagram);
  }
}

function validateFlowNames(board, flowChips, issues) {
  const names = [];
  for (const chip of flowChips) {
    const chipTexts = allTexts(chip).filter(isActuallyVisible);
    const label = chipTexts.map((node) => node.characters || "").join("").trim();
    if (label) names.push({ label, chip, textNodes: chipTexts });
    for (const textNode of chipTexts) {
      const textRel = rel(textNode, board);
      if (textRel && (textRel.x < -CONFIG.tolerance || textRel.x + textRel.width > board.width + CONFIG.tolerance)) {
        issue(issues, "fail", "FLOW_NAME_TEXT_OVERFLOWS_BOARD", "Flow name text is clipped outside the board. Shorten the flow name or widen the template chip instead of letting text overflow.", textNode);
      }
    }
  }
  const seen = new Map();
  for (const item of names) {
    if (!seen.has(item.label)) seen.set(item.label, []);
    seen.get(item.label).push(item.chip);
  }
  for (const [label, chips] of seen.entries()) {
    if (chips.length > 1) {
      issue(issues, "fail", "DUPLICATE_FLOW_NAME", `Flow name is duplicated ${chips.length} times: ${label}. Secondary flows need distinct flow names and diagrams.`, chips[0]);
    }
  }
}

async function validateFeatureDetails(board, template, manifest, issues) {
  const detail = manifest.slots.feature_detail;
  const major = await resolveFromSourceId(board, template, detail.major_title.container, { name: false });
  const subtitle = await resolveFromSourceId(board, template, detail.subtitle.container, { name: false });
  const interfaceTitle = await resolveFromSourceId(board, template, detail.interface.title, { name: false });
  const screenFrame = await resolveFromSourceId(board, template, detail.interface.screen_frame, { name: false });
  if (!major) issue(issues, "fail", "MAJOR_TITLE_MISSING", "4.0 must contain template 主标题 group.", board);
  if (!subtitle) issue(issues, "fail", "SUBTITLE_MISSING", "4.0 must contain template 副标题 group.", board);
  if (!interfaceTitle) issue(issues, "fail", "INTERFACE_TITLE_MISSING", "4.0 must contain template 界面标题.", board);
  if (!screenFrame) issue(issues, "fail", "LEFT_SCREEN_FRAME_MISSING", "4.0 must contain the left screen frame shell.", board);

  const rightStartX = board.x + board.width * 0.45;
  const labelLike = [];
  const numberedNotes = [];
  const aiPending = [];
  walk(board, (node) => {
    const b = getBounds(node);
    if (!b || b.x < rightStartX) return;
    if (node.type === "TEXT") {
      const text = node.characters || "";
      if (/注意|标注|AI待确认|确认/.test(text)) labelLike.push(node);
      if (hasNumberedLines(text)) numberedNotes.push(node);
      if (/AI待确认/.test(text)) aiPending.push(node);
    }
  });
  if (labelLike.length === 0) issue(issues, "fail", "RIGHT_LABEL_MISSING", "4.0 right-side notes must use labels/tags.", board);
  if (numberedNotes.length === 0) issue(issues, "fail", "RIGHT_NOTE_NUMBERING_MISSING", "4.0 right-side explanation lines must be numbered.", board);
  for (const node of aiPending) {
    if (!hasWarningRed(node.parent || node, manifest) && !hasWarningRed(node, manifest)) {
      issue(issues, "fail", "AI_PENDING_NOT_WARNING_RED", "AI待确认 must use warning red styling.", node);
    }
  }
}

async function validateFooter(board, template, manifest, issues) {
  const footer = await resolveFromSourceId(board, template, manifest.slots.footer.node, { name: false });
  if (!footer) {
    issue(issues, "fail", "FOOTER_MISSING", "Footer decoration missing.", board);
    return;
  }
  const gap = board.height - (footer.y + footer.height);
  if (gap < -CONFIG.tolerance || gap > 80) issue(issues, "fail", "FOOTER_NOT_AT_BOTTOM", `Footer should sit at board bottom; gap=${gap}.`, footer);
  const contentBottom = maxVisibleDirectChildBottomBeforeFooter(board, footer);
  const gapBeforeFooter = footer.y - contentBottom;
  if (gapBeforeFooter > 1200) {
    issue(issues, "fail", "FOOTER_CONTENT_GAP_TOO_LARGE", `Footer is too far below the last visible content; gap=${Math.round(gapBeforeFooter)}. Recompute module height and move the footer up.`, footer);
  } else if (gapBeforeFooter > 600) {
    issue(issues, "warn", "FOOTER_CONTENT_GAP_LARGE", `Footer has a large blank gap before it; gap=${Math.round(gapBeforeFooter)}. Inspect the board height calculation.`, footer);
  }
}

function maxVisibleDirectChildBottomBeforeFooter(board, footer) {
  let bottom = 0;
  for (const child of board.children) {
    if (child.id === footer.id) continue;
    if (!isActuallyVisible(child)) continue;
    if (!("y" in child) || !("height" in child)) continue;
    if (child.y >= footer.y) continue;
    bottom = Math.max(bottom, child.y + child.height);
  }
  return bottom;
}

function validatePlaceholders(board, issues) {
  const bad = [];
  const section4 = allTexts(board)
    .filter(isActuallyVisible)
    .find((node) => String(node.characters || "").trim() === "4.0");
  const section4Y = section4 ? rel(section4, board).y : 0;
  walk(board, (node) => {
    if (node.type !== "TEXT") return;
    if (!isActuallyVisible(node)) return;
    const text = node.characters || "";
    const rb = rel(node, board);
    if (!rb || rb.y < section4Y + 120) return;
    if (/^主标题$|^副标题$|^界面名称$|备注内容（非必须）|红点流程名称/.test(text.trim())) bad.push(node);
  });
  if (bad.length > 0) issue(issues, "fail", "PLACEHOLDER_TEXT_REMAINS_IN_FILLED_SECTION", `Template placeholder text remains in filled 4.0 content (${bad.length}). Replace it, hide the unused block, or keep it only in reserved designer-owned sections.`, bad[0]);
}

return await main();
