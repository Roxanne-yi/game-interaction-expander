// Manifest renderer for game-interaction-prd-expander.
// Run with Figma use_figma. Replace CONFIG.manifest and CONFIG.analysis before running.

const CONFIG = {
  manifest: "__TEMPLATE_MANIFEST_JSON__",
  analysis: "__ANALYSIS_JSON__",
  targetPageId: "",
  targetBoardId: "",
  gapFromRightmostFrame: 600,
  tolerance: 2
};

function assertConfig() {
  if (!CONFIG.manifest || CONFIG.manifest === "__TEMPLATE_MANIFEST_JSON__") {
    throw new Error("CONFIG.manifest is not set. Paste assets/krad-template/template-manifest.json before running.");
  }
  if (!CONFIG.analysis || CONFIG.analysis === "__ANALYSIS_JSON__") {
    throw new Error("CONFIG.analysis is not set. Paste the structured PRD analysis payload before running.");
  }
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
  if (node && node.absoluteBoundingBox) return node.absoluteBoundingBox;
  return null;
}

function relativeBounds(node, root) {
  const nb = getBounds(node);
  const rb = getBounds(root);
  if (!nb || !rb) return null;
  return {
    x: nb.x - rb.x,
    y: nb.y - rb.y,
    width: nb.width,
    height: nb.height
  };
}

function rightmostX(page) {
  let max = 0;
  for (const child of page.children) {
    if ("x" in child && "width" in child) max = Math.max(max, child.x + child.width);
  }
  return max;
}

async function setPageIfNeeded() {
  if (!CONFIG.targetPageId) return;
  const page = await figma.getNodeByIdAsync(CONFIG.targetPageId);
  if (!page || page.type !== "PAGE") throw new Error(`targetPageId is not a page: ${CONFIG.targetPageId}`);
  await figma.setCurrentPageAsync(page);
}

async function instantiateTemplate(manifest) {
  const template = await figma.getNodeByIdAsync(manifest.source_template.node_id);
  if (!template) throw new Error(`Template node not found: ${manifest.source_template.node_id}`);
  if (!("width" in template) || !("height" in template)) throw new Error("Template node is not frame-like.");

  let board;
  let createdFrom = template.type;
  if (template.type === "COMPONENT" && typeof template.createInstance === "function") {
    board = template.createInstance();
  } else if ("clone" in template) {
    board = template.clone();
  } else {
    throw new Error("Template node cannot be cloned or instantiated.");
  }

  figma.currentPage.appendChild(board);
  board.name = CONFIG.analysis.boardName || "Interaction pre-brief v0.1";
  board.x = rightmostX(figma.currentPage) + CONFIG.gapFromRightmostFrame;
  board.y = 0;

  if (board.type === "INSTANCE" && typeof board.detachInstance === "function") {
    board = board.detachInstance();
    board.name = CONFIG.analysis.boardName || "Interaction pre-brief v0.1";
  }

  return { board, template, createdFrom };
}

async function getBoard(manifest) {
  if (!CONFIG.targetBoardId) return instantiateTemplate(manifest);
  const board = await figma.getNodeByIdAsync(CONFIG.targetBoardId);
  if (!board || !("children" in board)) throw new Error(`targetBoardId is not a board-like node: ${CONFIG.targetBoardId}`);
  const template = await figma.getNodeByIdAsync(manifest.source_template.node_id);
  if (!template) throw new Error(`Template node not found: ${manifest.source_template.node_id}`);
  return { board, template, createdFrom: "existing-board" };
}

async function sourceRel(sourceRoot, sourceId) {
  const source = await figma.getNodeByIdAsync(sourceId);
  if (!source) throw new Error(`Manifest source node not found: ${sourceId}`);
  const rel = relativeBounds(source, sourceRoot);
  if (!rel) throw new Error(`Manifest source node has no bounds: ${sourceId}`);
  return { source, rel };
}

async function resolveFromSourceId(board, sourceRoot, sourceId, options = {}) {
  const { source, rel } = await sourceRel(sourceRoot, sourceId);
  const candidates = [];
  walk(board, (node) => {
    if (!("width" in node) || !("height" in node)) return;
    if (options.type && node.type !== options.type) return;
    if (!options.type && node.type !== source.type) return;
    const rb = relativeBounds(node, board);
    if (!rb) return;
    if (!approx(rb.x, rel.x) || !approx(rb.y, rel.y) || !approx(rb.width, rel.width) || !approx(rb.height, rel.height)) return;
    if (options.name !== false && source.name && node.name !== source.name) return;
    candidates.push(node);
  });
  if (candidates.length === 0) throw new Error(`Could not resolve manifest slot in cloned board: ${sourceId} (${source.name})`);
  return candidates[0];
}

async function loadTextFonts(textNode) {
  if (textNode.type !== "TEXT") return;
  const fonts = new Map();
  const segments = textNode.getStyledTextSegments(["fontName"]);
  for (const seg of segments) {
    if (seg.fontName && seg.fontName !== figma.mixed) fonts.set(`${seg.fontName.family}::${seg.fontName.style}`, seg.fontName);
  }
  for (const font of fonts.values()) await figma.loadFontAsync(font);
}

async function replaceText(textNode, value, options = {}) {
  if (!textNode || textNode.type !== "TEXT") throw new Error("replaceText target is not a TEXT node.");
  if (value === undefined || value === null || value === "") return false;
  await loadTextFonts(textNode);
  textNode.characters = String(value);
  if (options.name) textNode.name = options.name;
  return true;
}

async function replaceSlotText(board, template, sourceId, value, options = {}) {
  const node = await resolveFromSourceId(board, template, sourceId, { type: "TEXT" });
  await replaceText(node, value, options);
  return node.id;
}

async function snapshotProtected(board, template, ids) {
  const snapshots = [];
  for (const sourceId of ids) {
    const node = await resolveFromSourceId(board, template, sourceId, { name: false });
    snapshots.push({
      id: node.id,
      sourceId,
      name: node.name,
      type: node.type,
      rel: relativeBounds(node, board),
      text: node.type === "TEXT" ? node.characters : undefined
    });
  }
  return snapshots;
}

async function fillHeader(board, template, manifest, analysis) {
  const slots = manifest.slots.header.text_slots;
  const header = analysis.header || {};
  await replaceSlotText(board, template, slots.project_title.node, header.projectTitle);
  await replaceSlotText(board, template, slots.planner_owner.node, header.planner);
  await replaceSlotText(board, template, slots.ued_owner.node, header.ued);
  await replaceSlotText(board, template, slots.date.node, header.date || analysis.generatedDate);
}

async function fillOverview(board, template, manifest, analysis) {
  const overview = analysis.overview || {};
  const slots = manifest.slots.overview.body_slots;
  await replaceSlotText(board, template, slots.problem.body, overview.problem);
  await replaceSlotText(board, template, slots.target_audience.body, overview.targetAudience);
  await replaceSlotText(board, template, slots.expected_effect.body, overview.expectedEffect);
  await normalizeVersionTable(board, template, manifest, analysis);
}

async function normalizeVersionTable(board, template, manifest, analysis) {
  const table = manifest.slots.overview.version_table;
  const rowNodes = [];
  for (const rowId of table.row_prototypes) {
    rowNodes.push(await resolveFromSourceId(board, template, rowId, { name: false }));
  }
  rowNodes.sort((a, b) => a.y - b.y);

  const rowData = (analysis.overview && analysis.overview.versionRow) || {};
  const mode = analysis.mode || "create";
  if (mode === "create") {
    for (let i = 1; i < rowNodes.length; i += 1) rowNodes[i].remove();
    await fillVersionRow(rowNodes[0], rowData);
  } else {
    const newRow = rowNodes[rowNodes.length - 1].clone();
    rowNodes[0].parent.appendChild(newRow);
    newRow.y = rowNodes[rowNodes.length - 1].y + rowNodes[rowNodes.length - 1].height;
    await fillVersionRow(newRow, rowData);
  }
}

async function fillVersionRow(row, rowData) {
  const texts = [];
  walk(row, (node) => {
    if (node.type === "TEXT") texts.push(node);
  });
  texts.sort((a, b) => a.x - b.x);
  await replaceText(texts[0], rowData.version || "v0.1");
  await replaceText(texts[1], rowData.change || "根据 PRD 生成交互预解析");
  await replaceText(texts[2], rowData.date || new Date().toISOString().slice(0, 10));
}

function setVisible(node, visible) {
  if ("visible" in node) node.visible = visible;
}

function setVisibleDeep(node, visible) {
  walk(node, (child) => setVisible(child, visible));
}

function directChildrenInRange(board, top, bottom, excludeIds = new Set()) {
  return board.children.filter((node) => {
    if (!("y" in node) || !("height" in node)) return false;
    if (excludeIds.has(node.id)) return false;
    return node.y >= top && node.y < bottom;
  });
}

function bottomOf(nodes) {
  if (!nodes.length) return 0;
  return Math.max(...nodes.filter((node) => "y" in node && "height" in node).map((node) => node.y + node.height));
}

function topOf(nodes) {
  if (!nodes.length) return 0;
  return Math.min(...nodes.filter((node) => "y" in node).map((node) => node.y));
}

function shiftNodes(nodes, deltaY) {
  if (!deltaY) return;
  for (const node of nodes) {
    if ("y" in node) node.y += deltaY;
  }
}

async function fillFlows(board, template, manifest, analysis) {
  const flows = Array.isArray(analysis.flows) ? analysis.flows : [];
  if (flows.length === 0) return;
  const flowManifest = manifest.slots.flow;
  const sourceChip = await resolveFromSourceId(board, template, flowManifest.flow_name_chip, { name: false });
  const sourceDiagram = await resolveFromSourceId(board, template, flowManifest.diagram_group, { name: false });

  let previousBottom = sourceDiagram.y + sourceDiagram.height;
  for (let i = 0; i < flows.length; i += 1) {
    const flow = flows[i];
    let chip = sourceChip;
    let diagram = sourceDiagram;
    if (i > 0) {
      chip = sourceChip.clone();
      diagram = sourceDiagram.clone();
      board.appendChild(chip);
      board.appendChild(diagram);
      chip.y = previousBottom + 160;
      diagram.y = chip.y + 83;
      previousBottom = diagram.y + diagram.height;
    }
    await replaceTextInSubtree(chip, flow.name || (i === 0 ? "主流程" : `次流程 ${i}`), /流程名称|流程名/);
    await fillFlowDiagram(diagram, flowManifest, flow);
  }
}

async function replaceTextInSubtree(root, value, pattern) {
  let target = null;
  walk(root, (node) => {
    if (target || node.type !== "TEXT") return;
    if (!pattern || pattern.test(node.characters || "") || pattern.test(node.name || "")) target = node;
  });
  if (!target) throw new Error(`No text target found under ${root.name}`);
  await replaceText(target, value);
}

async function fillFlowDiagram(diagram, flowManifest, flow) {
  const steps = Array.isArray(flow.steps) ? flow.steps : [];
  if (steps.length > flowManifest.screen_node_prototypes.length) {
    throw new Error(`Flow "${flow.name}" has ${steps.length} steps but template supports ${flowManifest.screen_node_prototypes.length}. Split into secondary flows.`);
  }
  const nodeGroups = [];
  walk(diagram, (node) => {
    if (node.type === "GROUP" && /Group\s+\d+/.test(node.name || "")) {
      const hasPlaceholder = node.children && node.children.some((child) => "width" in child && child.width >= 500 && child.height >= 250);
      if (hasPlaceholder) nodeGroups.push(node);
    }
  });
  nodeGroups.sort((a, b) => a.y - b.y || a.x - b.x);
  for (let i = 0; i < nodeGroups.length; i += 1) {
    if (i >= steps.length) {
      setVisible(nodeGroups[i], false);
      continue;
    }
    await replaceTextInSubtree(nodeGroups[i], steps[i].screenName || `界面 ${i + 1}`, /界面名称/);
  }
  const labelTexts = [];
  walk(diagram, (node) => {
    if (node.type === "TEXT" && (/触发条件/.test(node.characters || "") || /condition/i.test(node.name || ""))) labelTexts.push(node);
  });
  if (labelTexts[0]) await replaceText(labelTexts[0], steps[0] && steps[0].condition ? steps[0].condition : "触发条件");
}

async function fillFeatureModules(board, template, manifest, analysis) {
  const modules = Array.isArray(analysis.featureModules) ? analysis.featureModules : [];
  if (modules.length === 0) return;
  const detail = manifest.slots.feature_detail;
  const sourceStart = await resolveFromSourceId(board, template, detail.module_block.start, { name: false });
  const redStart = await resolveFromSourceId(board, template, manifest.slots.red_dot.major_title.container, { name: false });
  const footer = await resolveFromSourceId(board, template, manifest.slots.footer.node, { name: false });
  const blockNodes = directChildrenInRange(board, sourceStart.y, redStart.y);
  const redDotNodes = directChildrenInRange(board, redStart.y, footer ? footer.y : Number.POSITIVE_INFINITY, new Set([footer && footer.id].filter(Boolean)));
  const blockTop = Math.min(...blockNodes.map((node) => node.y));
  const blockBottom = Math.max(...blockNodes.map((node) => node.y + node.height));
  const blockHeight = blockBottom - blockTop;
  const moduleGap = Number(manifest.slots.feature_detail.module_block.module_gap || 180);
  const blocks = [blockNodes];

  // Clone every extra module from the untouched template block before filling text.
  // Otherwise later clones inherit the first module's filled labels and lose slot anchors.
  for (let i = 1; i < modules.length; i += 1) {
    const clonedNodes = blockNodes.map((node) => {
        const cloned = node.clone();
        board.appendChild(cloned);
        cloned.y = node.y + i * (blockHeight + moduleGap);
        return cloned;
    });
    blocks.push(clonedNodes);
  }

  for (let i = 0; i < modules.length; i += 1) {
    await fillModuleBlock(blocks[i], modules[i], i + 1);
  }

  const generatedBottom = bottomOf(blocks.flat());
  if (analysis.redDot) {
    const redTop = topOf(redDotNodes);
    shiftNodes(redDotNodes, Math.max(0, generatedBottom + moduleGap - redTop));
  } else {
    for (const node of redDotNodes) setVisibleDeep(node, false);
  }
}

async function fillModuleBlock(nodes, module, index) {
  const texts = [];
  walkCollection(nodes, (node) => {
    if (node.type === "TEXT") texts.push(node);
  });
  const replaceFirst = async (pattern, value) => {
    const target = texts.find((node) => pattern.test(node.characters || "") || pattern.test(node.name || ""));
    if (!target) throw new Error(`Module ${index} missing text slot for ${pattern}`);
    await replaceText(target, value);
  };
  await replaceFirst(/^主标题$/, module.title || `功能模块 ${index}`);
  await replaceFirst(/备注内容（非必须）/, module.note || "");
  const firstSub = module.subsections && module.subsections[0] ? module.subsections[0] : {};
  await replaceFirst(/^副标题$/, firstSub.title || "主要操作");
  const firstInterface = firstSub.interfaces && firstSub.interfaces[0] ? firstSub.interfaces[0] : {};
  await replaceFirst(/^界面标题$|^产品定位$/, firstInterface.title || "界面说明");
  await fillRightNotes(nodes, firstInterface.notes || []);
}

function walkCollection(nodes, visit) {
  for (const node of nodes) walk(node, visit);
}

async function fillRightNotes(nodes, notes) {
  const textNodes = [];
  walkCollection(nodes, (node) => {
    if (node.type === "TEXT") textNodes.push(node);
  });
  const noteBodies = textNodes.filter((node) => /分点|重点|说明|备注内容/.test(node.name || "") || /分点|重点|说明|备注内容/.test(node.characters || ""));
  const labelTexts = textNodes.filter((node) => /注意|标注|AI|部门/.test(node.name || "") || /注意|AI|确认/.test(node.characters || ""));
  for (let i = 0; i < notes.length && i < Math.max(noteBodies.length, 1); i += 1) {
    const note = notes[i];
    if (labelTexts[i]) await replaceText(labelTexts[i], note.tag || "策划注意");
    if (note.tag === "AI待确认" && labelTexts[i]) applyWarningRed(labelTexts[i]);
    if (noteBodies[i]) await replaceText(noteBodies[i], formatNumberedLines(note.lines || []));
  }
}

function formatNumberedLines(lines) {
  const source = lines.length > 0 ? lines : ["待补充说明"];
  return source.map((line, index) => /^\d+[.、]/.test(line) ? line : `${index + 1}. ${line}`).join("\n");
}

function applyWarningRed(textNode) {
  const red = CONFIG.manifest.style_tokens.warning_red.fill;
  const rgb = hexToRgb(red);
  textNode.fills = [{ type: "SOLID", color: rgb }];
}

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  return {
    r: parseInt(normalized.slice(0, 2), 16) / 255,
    g: parseInt(normalized.slice(2, 4), 16) / 255,
    b: parseInt(normalized.slice(4, 6), 16) / 255
  };
}

async function moveFooter(board, template, manifest) {
  const footer = await resolveFromSourceId(board, template, manifest.slots.footer.node, { name: false });
  const bottom = maxChildBottom(board, footer.id);
  const desiredY = Math.max(footer.y, bottom + 180);
  const delta = desiredY - footer.y;
  if (delta > CONFIG.tolerance) {
    footer.y += delta;
    board.resize(board.width, footer.y + footer.height);
  }
}

function maxChildBottom(board, ignoredId) {
  let bottom = 0;
  for (const child of board.children) {
    if (child.id === ignoredId) continue;
    if ("visible" in child && child.visible === false) continue;
    if ("y" in child && "height" in child) bottom = Math.max(bottom, child.y + child.height);
  }
  return bottom;
}

async function main() {
  assertConfig();
  await setPageIfNeeded();
  const manifest = CONFIG.manifest;
  const { board, template, createdFrom } = await getBoard(manifest);

  const protectedIds = [
    manifest.slots.header.bar_frame,
    manifest.slots.header.background,
    ...manifest.slots.header.brand_assets,
    ...manifest.slots.adaptation.frames,
    manifest.slots.footer.node
  ];
  const protectedSnapshots = await snapshotProtected(board, template, protectedIds);

  await fillHeader(board, template, manifest, CONFIG.analysis);
  await fillOverview(board, template, manifest, CONFIG.analysis);
  await fillFlows(board, template, manifest, CONFIG.analysis);
  await fillFeatureModules(board, template, manifest, CONFIG.analysis);
  await moveFooter(board, template, manifest);

  const renderRecord = {
    rendererVersion: "manifest-renderer-v0.4",
    createdAt: new Date().toISOString(),
    manifestSchemaVersion: manifest.schema_version,
    sourceTemplateNodeId: manifest.source_template.node_id,
    boardId: board.id,
    boardName: board.name,
    createdFrom,
    mode: CONFIG.analysis.mode || "create",
    protectedSnapshots
  };
  board.setSharedPluginData(manifest.namespace, "renderRecord", JSON.stringify(renderRecord));
  board.setSharedPluginData(manifest.namespace, "manifest", JSON.stringify(manifest));
  figma.viewport.scrollAndZoomIntoView([board]);
  return { status: "pass", boardId: board.id, boardName: board.name, rendererVersion: renderRecord.rendererVersion };
}

return await main();
