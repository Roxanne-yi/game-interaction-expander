"use strict";

const {
  createReporter,
  ensureArray,
  isNonEmptyString,
  readUtf8Json,
  writeUtf8Json
} = require("./_contract_lib");

const FLOW_RELATIONSHIP_TYPES = new Set([
  "navigation",
  "stateChange",
  "systemFeedback",
  "branchDecision",
  "returnPath",
  "externalSurface"
]);

const NOTE_TAGS = new Set([
  "策划注意",
  "程序注意",
  "UI注意",
  "动效注意",
  "UIFX注意",
  "VFX注意",
  "音效注意",
  "美术注意",
  "AI待确认"
]);

const NOTE_BASIS = new Set([
  "sourceExplicit",
  "prototypeVisible",
  "inferredGap",
  "sourceConflict",
  "designRisk",
  "ruleGenerated"
]);

const AI_BASIS = new Set(["inferredGap", "sourceConflict", "designRisk", "ruleGenerated"]);
const NOTE_COVERAGE = new Set(["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback", "aiPending"]);
const REQUIRED_INTERFACE_NOTE_COVERAGE = ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback", "aiPending"];
const WIREFRAME_LAYOUT_INTENTS = new Set(["primaryOperation", "selection", "confirmation", "successFeedback", "systemFeedback", "externalSurface"]);
const BACKGROUND_FLOW_VALUES = new Set(["system", "background", "backend", "refresh", "reset", "settlement", "scheduled", "timer", "mechanism"]);
const BACKGROUND_FLOW_PATTERN = /后台|系统刷新|定时刷新|每日.*刷新|每天.*刷新|每周.*强制|周.*强制|强制回收|系统结算|邮件兜底|自动刷新|自动结算|价格刷新/;

function usage() {
  console.error("Usage: node scripts/validate-interaction-model.js <interaction-model.json> [--out <report.json>]");
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  if (argv.length < 1) usage();
  const modelPath = argv[0];
  const outIndex = argv.indexOf("--out");
  const outPath = outIndex >= 0 ? argv[outIndex + 1] : "";
  const model = readUtf8Json(modelPath);
  const report = validateInteractionModel(model);
  if (outPath) writeUtf8Json(outPath, report);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exit(1);
}

function validateInteractionModel(model) {
  const reporter = createReporter();
  const interfaceIds = new Set();
  const elementIds = new Set();
  const moduleAi = new Map();
  const counts = {
    modules: 0,
    interfaces: 0,
    elements: 0,
    notes: 0,
    aiPendingNotes: 0,
    flows: 0,
    flowNodes: 0,
    flowEdges: 0
  };

  if (!isNonEmptyString(model.schemaVersion)) {
    reporter.fail("SCHEMA_VERSION_MISSING", "interaction-model.json must include schemaVersion.", "schemaVersion");
  }
  if (!model.overview || typeof model.overview !== "object") {
    reporter.fail("OVERVIEW_MISSING", "overview is required.", "overview");
  }

  const modules = ensureArray(model.featureModules);
  if (modules.length === 0) reporter.fail("FEATURE_MODULES_MISSING", "featureModules must contain at least one major module.", "featureModules");
  counts.modules = modules.length;

  modules.forEach((module, moduleIndex) => {
    const modulePath = `featureModules[${moduleIndex}]`;
    const moduleId = requireId(module.id, "MOD", reporter, `${modulePath}.id`);
    if (!isNonEmptyString(module.title)) reporter.fail("MODULE_TITLE_MISSING", "Major module title is required.", `${modulePath}.title`);
    moduleAi.set(moduleId || modulePath, 0);
    const subsections = ensureArray(module.subsections);
    if (subsections.length === 0) reporter.fail("SUBSECTIONS_MISSING", "Each major module needs at least one minor-function subsection.", `${modulePath}.subsections`);
    subsections.forEach((subsection, subsectionIndex) => {
      const subPath = `${modulePath}.subsections[${subsectionIndex}]`;
      if (!isNonEmptyString(subsection.title)) reporter.fail("SUBSECTION_TITLE_MISSING", "Minor subsection title is required.", `${subPath}.title`);
      const interfaces = ensureArray(subsection.interfaces);
      if (interfaces.length === 0) reporter.fail("INTERFACES_MISSING", "Each subsection needs at least one interface explanation.", `${subPath}.interfaces`);
      interfaces.forEach((iface, interfaceIndex) => {
        const ifacePath = `${subPath}.interfaces[${interfaceIndex}]`;
        validateInterface(iface, ifacePath, reporter, interfaceIds, elementIds, counts);
        const aiCount = ensureArray(iface.notes).filter((note) => note && note.tag === "AI待确认").length;
        moduleAi.set(moduleId || modulePath, (moduleAi.get(moduleId || modulePath) || 0) + aiCount);
      });
    });
  });

  for (const [moduleId, aiCount] of moduleAi.entries()) {
    if (aiCount < 1) reporter.fail("AI_PENDING_MISSING_IN_MODULE", "Every major module must include at least one AI待确认 note.", moduleId);
  }

  validateFlows(model.flows, reporter, interfaceIds, elementIds, counts);

  return reporter.result({ validator: "interaction-model-validator-v0.1", counts });
}

function validateInterface(iface, ifacePath, reporter, interfaceIds, elementIds, counts) {
  counts.interfaces += 1;
  const interfaceId = requireId(iface.id, "IF", reporter, `${ifacePath}.id`);
  if (interfaceId) {
    if (interfaceIds.has(interfaceId)) reporter.fail("DUPLICATE_INTERFACE_ID", `Duplicate interface id: ${interfaceId}.`, `${ifacePath}.id`);
    interfaceIds.add(interfaceId);
  }
  if (!isNonEmptyString(iface.title || iface.name)) reporter.fail("INTERFACE_TITLE_MISSING", "Interface title/name is required.", `${ifacePath}.title`);
  validateWireframe(iface.wireframe, ifacePath, reporter, elementIds, counts);
  validateNotes(iface.notes, ifacePath, reporter, elementIds, counts);
}

function validateWireframe(wireframe, ifacePath, reporter, elementIds, counts) {
  const path = `${ifacePath}.wireframe`;
  if (!wireframe || typeof wireframe !== "object") {
    reporter.fail("WIREFRAME_SCHEMA_MISSING", "Every interface must include a structured wireframe schema.", path);
    return;
  }
  if (!isNonEmptyString(wireframe.surface)) reporter.fail("WIREFRAME_SURFACE_MISSING", "wireframe.surface is required.", `${path}.surface`);
  if (isNonEmptyString(wireframe.layoutIntent) && !WIREFRAME_LAYOUT_INTENTS.has(wireframe.layoutIntent)) {
    reporter.fail("WIREFRAME_LAYOUT_INTENT_INVALID", `Invalid wireframe.layoutIntent: ${wireframe.layoutIntent}.`, `${path}.layoutIntent`);
  }
  if (!isNonEmptyString(wireframe.primaryTask)) reporter.fail("WIREFRAME_PRIMARY_TASK_MISSING", "wireframe.primaryTask is required.", `${path}.primaryTask`);
  const groups = [
    ["regions", ensureArray(wireframe.regions)],
    ["controls", ensureArray(wireframe.controls)],
    ["states", ensureArray(wireframe.states)],
    ["feedback", ensureArray(wireframe.feedback)]
  ];
  if (groups[0][1].length === 0) reporter.fail("WIREFRAME_REGIONS_MISSING", "wireframe.regions must contain player-visible content regions.", `${path}.regions`);
  groups.forEach(([groupName, items]) => {
    items.forEach((item, index) => {
      const itemPath = `${path}.${groupName}[${index}]`;
      if (!item || typeof item !== "object") {
        reporter.fail("WIREFRAME_ITEM_INVALID", "Wireframe items must be objects with stable ids.", itemPath);
        return;
      }
      const id = requireElementId(item.id, reporter, `${itemPath}.id`);
      if (!id) return;
      if (elementIds.has(id)) reporter.fail("DUPLICATE_ELEMENT_ID", `Duplicate wireframe element id: ${id}.`, itemPath);
      elementIds.add(id);
      counts.elements += 1;
      if (!isNonEmptyString(item.title || item.label || item.name || item.description)) {
        reporter.fail("WIREFRAME_ITEM_LABEL_MISSING", "Wireframe item needs title, label, name, or description.", itemPath);
      }
      if (groupName === "regions" && !isNonEmptyString(item.role || item.type)) {
        reporter.fail("WIREFRAME_REGION_ROLE_MISSING", "Wireframe region needs role/type so notes and renderer know its UI responsibility.", `${itemPath}.role`);
      }
      if (groupName === "controls" && !isNonEmptyString(item.role || item.type)) {
        reporter.fail("WIREFRAME_CONTROL_ROLE_MISSING", "Wireframe control needs role/type.", `${itemPath}.role`);
      }
      if (groupName === "states" && !isNonEmptyString(item.visualTarget || item.targetElementId || item.role || item.type)) {
        reporter.fail("WIREFRAME_STATE_TARGET_MISSING", "Wireframe state needs visualTarget/targetElementId/role to show where the state appears.", `${itemPath}.visualTarget`);
      }
    });
  });
}

function validateNotes(notes, ifacePath, reporter, elementIds, counts) {
  const list = ensureArray(notes);
  if (list.length === 0) reporter.fail("NOTES_MISSING", "Every interface must include right-side notes.", `${ifacePath}.notes`);
  let hasAi = false;
  const coverageSeen = new Set();
  list.forEach((note, index) => {
    counts.notes += 1;
    const notePath = `${ifacePath}.notes[${index}]`;
    if (!note || typeof note !== "object") {
      reporter.fail("NOTE_INVALID", "Note must be an object.", notePath);
      return;
    }
    if (!NOTE_TAGS.has(note.tag)) reporter.fail("NOTE_TAG_INVALID", `Invalid note tag: ${note.tag || "missing"}.`, `${notePath}.tag`);
    if (!isNonEmptyString(note.targetElementId)) {
      reporter.fail("NOTE_TARGET_MISSING", "Note must target a wireframe element id.", `${notePath}.targetElementId`);
    } else if (!elementIds.has(note.targetElementId)) {
      reporter.fail("NOTE_TARGET_NOT_FOUND", `Note targetElementId does not exist in wireframe: ${note.targetElementId}.`, `${notePath}.targetElementId`);
    }
    if (!isNonEmptyString(note.body)) reporter.fail("NOTE_BODY_MISSING", "Note body is required.", `${notePath}.body`);
    if (!NOTE_BASIS.has(note.basis)) reporter.fail("NOTE_BASIS_INVALID", `Invalid note basis: ${note.basis || "missing"}.`, `${notePath}.basis`);
    if (!isNonEmptyString(note.evidence)) reporter.fail("NOTE_EVIDENCE_MISSING", "Note evidence is required.", `${notePath}.evidence`);
    const coverage = normalizeCoverage(note.coverage);
    if (coverage.length === 0) {
      reporter.fail("NOTE_COVERAGE_MISSING", "Note must declare coverage so interface explanations can be checked for completeness.", `${notePath}.coverage`);
    }
    for (const item of coverage) {
      if (!NOTE_COVERAGE.has(item)) {
        reporter.fail("NOTE_COVERAGE_INVALID", `Invalid note coverage: ${item}.`, `${notePath}.coverage`);
      } else {
        coverageSeen.add(item);
      }
    }
    if (note.tag === "AI待确认") {
      hasAi = true;
      coverageSeen.add("aiPending");
      counts.aiPendingNotes += 1;
      if (!AI_BASIS.has(note.basis)) reporter.fail("AI_PENDING_BASIS_INVALID", "AI待确认 basis must be inferredGap, sourceConflict, designRisk, or ruleGenerated.", `${notePath}.basis`);
      if (/边界|异常|报错|兜底/.test(note.body) && !/缺少|未说明|不明确|冲突|待确认|需确认|风险/.test(note.body)) {
        reporter.warn("AI_PENDING_LOOKS_QA_ONLY", "AI待确认 looks like edge-case QA only; lead with missing decisions or design risk.", `${notePath}.body`);
      }
    }
  });
  if (!hasAi) reporter.fail("AI_PENDING_MISSING_IN_INTERFACE", "Each interface should expose at least one AI待确认 or inherit one at module level.", `${ifacePath}.notes`);
  const missingCoverage = REQUIRED_INTERFACE_NOTE_COVERAGE.filter((item) => !coverageSeen.has(item));
  if (missingCoverage.length > 0) {
    reporter.fail("NOTE_COVERAGE_INCOMPLETE", `Interface notes are incomplete. Missing coverage: ${missingCoverage.join(", ")}.`, `${ifacePath}.notes`);
  }
}

function validateFlows(flows, reporter, interfaceIds, elementIds, counts) {
  const list = ensureArray(flows);
  if (list.length === 0) reporter.fail("FLOWS_MISSING", "flows must contain at least one player flow.", "flows");
  counts.flows = list.length;
  const flowTitles = new Set();
  list.forEach((flow, flowIndex) => {
    const flowPath = `flows[${flowIndex}]`;
    const flowId = requireId(flow.id || flow.flowId, "FLOW", reporter, `${flowPath}.flowId`);
    if (!isNonEmptyString(flow.title || flow.name)) reporter.fail("FLOW_TITLE_MISSING", "Flow title is required.", `${flowPath}.title`);
    const title = flow.title || flow.name || "";
    if (isBackgroundMechanismFlow(flow, title)) {
      reporter.fail("BACKGROUND_MECHANISM_AS_FLOW", "3.0 must only render player-active operation paths. Background refresh/reset/settlement mechanisms should move to 4.0 notes/states/feedback unless the source explicitly requires player action.", flowPath);
    }
    if (flowTitles.has(title)) reporter.fail("DUPLICATE_FLOW_TITLE", `Duplicate flow title: ${title}.`, `${flowPath}.title`);
    flowTitles.add(title);
    const nodes = ensureArray(flow.nodes);
    const edges = ensureArray(flow.edges);
    if (nodes.length === 0) reporter.fail("FLOW_NODES_MISSING", "Flow nodes are required.", `${flowPath}.nodes`);
    if (nodes.length > 1 && edges.length === 0) reporter.fail("FLOW_EDGES_MISSING", "Multi-node flow must define edges.", `${flowPath}.edges`);
    counts.flowNodes += nodes.length;
    counts.flowEdges += edges.length;
    const nodeIds = new Set();
    const participation = new Map();
    nodes.forEach((node, nodeIndex) => {
      const nodePath = `${flowPath}.nodes[${nodeIndex}]`;
      const nodeId = requireId(node.id, "NODE", reporter, `${nodePath}.id`);
      if (nodeId) {
        if (nodeIds.has(nodeId)) reporter.fail("DUPLICATE_FLOW_NODE_ID", `Duplicate flow node id: ${nodeId}.`, nodePath);
        nodeIds.add(nodeId);
        participation.set(nodeId, 0);
      }
      if (!isNonEmptyString(node.title)) reporter.fail("FLOW_NODE_TITLE_MISSING", "Flow node title is required.", `${nodePath}.title`);
      const targetId = node.interfaceId || node.stateId;
      if (!isNonEmptyString(targetId)) {
        reporter.fail("FLOW_NODE_TARGET_MISSING", "Flow node must reference interfaceId or stateId from 4.0.", `${nodePath}.interfaceId`);
      } else if (!interfaceIds.has(targetId) && !elementIds.has(targetId) && !node.externalSurface) {
        reporter.fail("FLOW_NODE_TARGET_NOT_FOUND", `Flow node target not found in 4.0 interfaces/states: ${targetId}.`, `${nodePath}.interfaceId`);
      }
    });
    edges.forEach((edge, edgeIndex) => {
      const edgePath = `${flowPath}.edges[${edgeIndex}]`;
      if (!nodeIds.has(edge.from)) reporter.fail("FLOW_EDGE_FROM_NOT_FOUND", `Edge from node not found: ${edge.from}.`, `${edgePath}.from`);
      if (!nodeIds.has(edge.to)) reporter.fail("FLOW_EDGE_TO_NOT_FOUND", `Edge to node not found: ${edge.to}.`, `${edgePath}.to`);
      participation.set(edge.from, (participation.get(edge.from) || 0) + 1);
      participation.set(edge.to, (participation.get(edge.to) || 0) + 1);
      if (!isNonEmptyString(edge.label)) reporter.fail("FLOW_EDGE_LABEL_MISSING", "Flow edge label is required.", `${edgePath}.label`);
      if (!FLOW_RELATIONSHIP_TYPES.has(edge.relationshipType)) reporter.fail("FLOW_EDGE_TYPE_INVALID", `Invalid relationshipType: ${edge.relationshipType || "missing"}.`, `${edgePath}.relationshipType`);
      if (!isNonEmptyString(edge.evidence)) reporter.fail("FLOW_EDGE_EVIDENCE_MISSING", "Flow edge evidence is required.", `${edgePath}.evidence`);
    });
    if (nodes.length > 1) {
      for (const [nodeId, count] of participation.entries()) {
        if (count < 1) reporter.fail("FLOW_NODE_ISOLATED", `Flow node does not participate in any edge: ${nodeId}.`, `${flowPath}.nodes`);
      }
    }
    if (!flowId) return;
  });
}

function normalizeCoverage(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (isNonEmptyString(value)) return String(value).split(/[,，/、\s]+/).map((item) => item.trim()).filter(Boolean);
  return [];
}

function isBackgroundMechanismFlow(flow, title) {
  const values = [
    flow.participation,
    flow.playerParticipation,
    flow.flowType,
    flow.category,
    flow.type
  ].map((value) => String(value || "").trim().toLowerCase()).filter(Boolean);
  if (values.some((value) => BACKGROUND_FLOW_VALUES.has(value))) return true;
  if (BACKGROUND_FLOW_PATTERN.test(String(title || "")) && flow.playerInitiated !== true && flow.requiresPlayerAction !== true) return true;
  return false;
}

function requireId(value, prefix, reporter, path) {
  if (!isNonEmptyString(value)) {
    reporter.fail(`${prefix}_ID_MISSING`, `${prefix} id is required.`, path);
    return "";
  }
  const pattern = new RegExp(`^${prefix}-[0-9]{3}$`);
  if (!pattern.test(value)) reporter.fail(`${prefix}_ID_INVALID`, `${prefix} id must match ${prefix}-001 style.`, path);
  return value;
}

function requireElementId(value, reporter, path) {
  if (!isNonEmptyString(value)) {
    reporter.fail("ELEMENT_ID_MISSING", "Wireframe element id is required.", path);
    return "";
  }
  if (!/^EL-[A-Za-z0-9-]+$/.test(value)) reporter.fail("ELEMENT_ID_INVALID", "Element id must match EL-*.", path);
  return value;
}

if (require.main === module) main();

module.exports = { validateInteractionModel };
