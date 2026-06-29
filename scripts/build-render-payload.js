"use strict";

const path = require("path");
const { readUtf8Json, writeUtf8Json } = require("./_contract_lib");
const { validateInteractionModel } = require("./validate-interaction-model");

const PAYLOAD_SCHEMA_VERSION = "game-interaction-prd-expander/render-payload/1.0";
const AI_PENDING_TAG = "AI\u5f85\u786e\u8ba4";
const DEFAULT_VERSION_CHANGE = "\u6839\u636e PRD \u751f\u6210\u4ea4\u4e92\u9884\u89e3\u6790";

function usage() {
  console.error([
    "Usage:",
    "  node scripts/build-render-payload.js <interaction-model.json> [--out <render-payload.json>]"
  ].join("\n"));
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  const modelPath = argv[0];
  if (!modelPath) usage();
  let outPath = null;
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      outPath = argv[i + 1];
      i += 1;
    } else {
      usage();
    }
  }
  const model = readUtf8Json(modelPath);
  const payload = buildRenderPayload(model);
  if (outPath) {
    writeUtf8Json(outPath, payload);
  } else {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  }
}

function buildRenderPayload(model) {
  const validation = validateInteractionModel(model);
  if (!validation.passed) {
    const messages = validation.issues
      .filter((issue) => issue.level === "fail")
      .slice(0, 8)
      .map((issue) => `${issue.code}: ${issue.path || ""} ${issue.message}`)
      .join("; ");
    throw new Error(`interaction-model validation failed before payload build: ${messages}`);
  }

  const featureModules = normalizeFeatureModules(model.featureModules || []);
  const payload = {
    schemaVersion: PAYLOAD_SCHEMA_VERSION,
    sourceModelSchemaVersion: model.schemaVersion,
    sourceModelId: model.id || model.modelId || "",
    boardName: firstText(model.boardName, model.title, model.header && model.header.projectTitle, "Interaction pre-brief v0.1"),
    mode: model.mode || "create",
    header: normalizeHeader(model.header || {}, model),
    overview: normalizeOverview(model.overview || {}),
    flows: normalizeFlows(model.flows || []),
    featureModules,
    sourceCoverage: Array.isArray(model.sourceCoverage) ? model.sourceCoverage.map((entry) => ({ ...entry })) : [],
    redDot: model.redDot || null,
    extension: model.extension || null,
    modelSummary: summarizeModel(model, featureModules)
  };
  return payload;
}

function normalizeHeader(header, model) {
  return {
    projectTitle: firstText(header.projectTitle, header.title, model.title, model.boardName, ""),
    planner: firstText(header.planner, header.designer, ""),
    ued: firstText(header.ued, header.UED, ""),
    date: firstText(header.date, todayLocalDate())
  };
}

function normalizeOverview(overview) {
  const versionHistory = normalizeVersionHistory(overview.versionHistory || overview.versions || overview.versionRows || overview.versionRow || overview.version);
  return {
    problem: firstText(overview.problem, overview.designProblem, overview.designBackground, overview.positioning, ""),
    targetAudience: firstText(overview.targetAudience, overview.targetPlayer, overview.player, overview.user, ""),
    expectedEffect: firstText(overview.expectedEffect, overview.expectedExperience, overview.goal, ""),
    versionHistory,
    versionRow: versionHistory[0]
  };
}

function normalizeVersionHistory(value) {
  const rows = Array.isArray(value) ? value : (value ? [value] : []);
  const normalized = rows
    .map((row) => normalizeVersionRow(row))
    .filter(Boolean);
  return normalized.length > 0 ? normalized : [normalizeVersionRow(null)];
}

function normalizeVersionRow(row) {
  if (row && typeof row === "object") {
    return {
      version: firstText(row.version, row.name, "v0.1"),
      change: firstText(row.change, row.description, row.content, DEFAULT_VERSION_CHANGE),
      date: firstText(row.date, row.time, todayLocalDate())
    };
  }
  return { version: "v0.1", change: DEFAULT_VERSION_CHANGE, date: todayLocalDate() };
}

function normalizeFlows(flows) {
  return flows.map((flow, index) => {
    const nodes = Array.isArray(flow.nodes) ? flow.nodes : [];
    return {
      id: firstText(flow.flowId, flow.id, `FLOW-${pad(index + 1)}`),
      name: firstText(flow.title, flow.name, index === 0 ? "\u4e3b\u6d41\u7a0b" : `\u6b21\u6d41\u7a0b ${index}`),
      steps: nodes.map((node, nodeIndex) => ({
        id: firstText(node.id, `NODE-${pad(nodeIndex + 1)}`),
        interfaceId: firstText(node.interfaceId, ""),
        screenName: firstText(node.title, node.screenName, node.name, `Interface ${nodeIndex + 1}`),
        condition: firstText(node.condition, node.caption, "")
      })),
      edges: (flow.edges || []).map((edge) => ({
        from: edge.from,
        to: edge.to,
        label: firstText(edge.label, edge.condition, ""),
        relationshipType: firstText(edge.relationshipType, ""),
        evidence: firstText(edge.evidence, "")
      }))
    };
  });
}

function normalizeFeatureModules(modules) {
  return modules.map((module, moduleIndex) => ({
    id: firstText(module.id, `MOD-${pad(moduleIndex + 1)}`),
    title: firstText(module.title, module.name, `Module ${moduleIndex + 1}`),
    note: firstText(module.note, module.summary, module.description, ""),
    subsections: normalizeSubsections(module, moduleIndex)
  }));
}

function normalizeSubsections(module, moduleIndex) {
  const subsections = Array.isArray(module.subsections) ? module.subsections : [];
  return subsections.map((subsection, subsectionIndex) => ({
    id: firstText(subsection.id, `${module.id || `MOD-${pad(moduleIndex + 1)}`}-SUB-${pad(subsectionIndex + 1)}`),
    title: firstText(subsection.title, subsection.name, `Subsection ${subsectionIndex + 1}`),
    note: firstText(subsection.note, subsection.summary, subsection.description, ""),
    interfaces: normalizeInterfaces(subsection.interfaces || [], module, subsection, subsectionIndex)
  }));
}

function normalizeInterfaces(interfaces, module, subsection, subsectionIndex) {
  return interfaces.map((iface, interfaceIndex) => {
    const notes = normalizeNotes(iface.notes || []);
    return {
      id: firstText(iface.id, `IF-${pad(interfaceIndex + 1)}`),
      title: firstText(iface.title, iface.screenName, iface.name, `Interface ${interfaceIndex + 1}`),
      screenName: firstText(iface.screenName, iface.title, iface.name, `Interface ${interfaceIndex + 1}`),
      description: firstText(iface.description, ""),
      wireframe: normalizeWireframe(iface, subsection, interfaceIndex),
      notes,
      aiPending: notes.filter((note) => note.tag === AI_PENDING_TAG).flatMap((note) => note.lines),
      sourceIds: {
        moduleId: firstText(module.id, ""),
        subsectionId: firstText(subsection.id, ""),
        interfaceId: firstText(iface.id, ""),
        subsectionIndex,
        interfaceIndex
      }
    };
  });
}

function normalizeWireframe(iface, subsection, index) {
  const wireframe = iface.wireframe || {};
  return {
    title: firstText(wireframe.title, wireframe.screenTitle, iface.title, iface.screenName, `Interface ${index + 1}`),
    surface: firstText(wireframe.surface, wireframe.surfaceType, "panel"),
    surfaceType: firstText(wireframe.surfaceType, wireframe.surface, "primaryOperation"),
    layoutIntent: firstText(wireframe.layoutIntent, wireframe.surfaceType, "primaryOperation"),
    primaryTask: firstText(wireframe.primaryTask, iface.primaryTask, iface.title, iface.screenName, ""),
    description: firstText(wireframe.description, iface.description, subsection.description, ""),
    regions: copyArray(wireframe.regions),
    controls: copyArray(wireframe.controls),
    states: copyArray(wireframe.states),
    feedback: copyArray(wireframe.feedback),
    modal: wireframe.modal || iface.modal || null,
    toast: wireframe.toast || iface.toast || null,
    primaryAction: firstText(wireframe.primaryAction, iface.primaryAction, ""),
    secondaryActions: copyArray(wireframe.secondaryActions || iface.secondaryActions)
  };
}

function normalizeNotes(notes) {
  return notes.map((note) => {
    const body = firstText(note.body, note.text, note.description, note.question, "");
    return {
      tag: firstText(note.tag, note.label, note.type, ""),
      targetElementId: firstText(note.targetElementId, ""),
      body,
      text: body,
      lines: splitLines(body),
      coverage: normalizeCoverage(note.coverage),
      basis: firstText(note.basis, ""),
      evidence: firstText(note.evidence, ""),
      sourceNote: {
        targetElementId: firstText(note.targetElementId, ""),
        basis: firstText(note.basis, ""),
        evidence: firstText(note.evidence, "")
      }
    };
  });
}

function normalizeCoverage(value) {
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean);
  if (value === undefined || value === null) return [];
  return String(value).split(/[,，/、\s]+/).map((item) => item.trim()).filter(Boolean);
}

function summarizeModel(model, featureModules) {
  const interfaces = featureModules.flatMap((module) => module.subsections.flatMap((subsection) => subsection.interfaces));
  const notes = interfaces.flatMap((iface) => iface.notes || []);
  const elements = interfaces.flatMap((iface) => {
    const wireframe = iface.wireframe || {};
    return []
      .concat(wireframe.regions || [])
      .concat(wireframe.controls || [])
      .concat(wireframe.states || [])
      .concat(wireframe.feedback || []);
  });
  return {
    moduleCount: featureModules.length,
    subsectionCount: featureModules.reduce((count, module) => count + module.subsections.length, 0),
    interfaceCount: interfaces.length,
    flowCount: Array.isArray(model.flows) ? model.flows.length : 0,
    flowNodeCount: (model.flows || []).reduce((count, flow) => count + (Array.isArray(flow.nodes) ? flow.nodes.length : 0), 0),
    flowEdgeCount: (model.flows || []).reduce((count, flow) => count + (Array.isArray(flow.edges) ? flow.edges.length : 0), 0),
    elementCount: elements.length,
    noteCount: notes.length,
    aiPendingCount: notes.filter((note) => note.tag === AI_PENDING_TAG).length,
    sourceCoverageCount: Array.isArray(model.sourceCoverage) ? model.sourceCoverage.length : 0
  };
}

function splitLines(value) {
  return String(value || "")
    .split(/\n|;/)
    .map((line) => line.replace(/^\s*\d+[.\u3001]\s*/, "").trim())
    .filter(Boolean);
}

function copyArray(value) {
  return Array.isArray(value) ? value.map((item) => copyPlainObject(item)) : [];
}

function copyPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  return { ...value };
}

function firstText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return "";
}

function todayLocalDate() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function pad(value) {
  return String(value).padStart(3, "0");
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(1);
  }
}

module.exports = {
  PAYLOAD_SCHEMA_VERSION,
  buildRenderPayload
};
