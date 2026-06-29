"use strict";

const { createReporter, ensureArray, isNonEmptyString, readUtf8Json, writeUtf8Json } = require("./_contract_lib");
const { validateSourceAnalysis } = require("./validate-source-analysis");
const { validateInteractionModel } = require("./validate-interaction-model");

const VALIDATOR_VERSION = "analysis-coverage-validator-v0.1";
const DESIGN_PROBLEM_RE = /问题|困惑|风险|缺少|缺失|不清楚|成本|失败|状态|反馈|校验|回退|unclear|risk|missing|confus|fail|feedback|state|validation|fallback/i;

function usage() {
  console.error("Usage: node scripts/validate-analysis-coverage.js <source-analysis.json> <interaction-model.json> [--out <report.json>]");
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  const sourcePath = argv[0];
  const modelPath = argv[1];
  if (!sourcePath || !modelPath) usage();
  let outPath = null;
  for (let i = 2; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      outPath = argv[i + 1];
      i += 1;
    } else {
      usage();
    }
  }
  const sourceAnalysis = readUtf8Json(sourcePath);
  const model = readUtf8Json(modelPath);
  const report = validateAnalysisCoverage(sourceAnalysis, model);
  if (outPath) writeUtf8Json(outPath, report);
  else process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exit(1);
}

function validateAnalysisCoverage(sourceAnalysis, model) {
  const reporter = createReporter();
  const sourceReport = validateSourceAnalysis(sourceAnalysis);
  const modelReport = validateInteractionModel(model);
  if (!sourceReport.passed) reporter.fail("SOURCE_ANALYSIS_INVALID", "source-analysis.json must pass before coverage validation.", "source-analysis.json");
  if (!modelReport.passed) reporter.fail("INTERACTION_MODEL_INVALID", "interaction-model.json must pass before coverage validation.", "interaction-model.json");

  const sourceItems = collectSourceItems(sourceAnalysis);
  const sourceById = new Map(sourceItems.map((item) => [item.id, item]));
  const modelIds = collectModelIds(model);
  const coverage = ensureArray(model && model.sourceCoverage);
  const coverageBySource = new Map();

  if (coverage.length === 0) {
    reporter.fail("SOURCE_COVERAGE_MISSING", "interaction-model.json must include sourceCoverage[] mapping source-analysis ids to model ids.", "sourceCoverage");
  }
  coverage.forEach((entry, index) => {
    validateCoverageEntry(entry, `sourceCoverage[${index}]`, sourceById, modelIds, coverageBySource, reporter);
  });

  for (const item of sourceItems) {
    const entries = coverageBySource.get(item.id) || [];
    if (entries.length === 0) {
      reporter.fail("SOURCE_ITEM_NOT_COVERED", `${item.section} item ${item.id} is not mapped into interaction-model.json.`, item.path);
      continue;
    }
    validateSectionSpecificCoverage(item, entries, reporter);
  }

  validateOverviewQuality(model, reporter);
  validateModelThicknessAgainstSource(sourceAnalysis, model, reporter);

  const counts = {
    sourceItems: sourceItems.length,
    coverageEntries: coverage.length,
    modelIds: modelIds.size,
    interfaces: countInterfaces(model),
    flows: ensureArray(model && model.flows).length,
    flowEdges: ensureArray(model && model.flows).reduce((sum, flow) => sum + ensureArray(flow.edges).length, 0)
  };
  return reporter.result({
    validator: VALIDATOR_VERSION,
    sourceValidatorPassed: sourceReport.passed,
    modelValidatorPassed: modelReport.passed,
    counts
  });
}

function collectSourceItems(sourceAnalysis) {
  const sections = [
    "keyMechanisms",
    "interfaceCandidates",
    "flowCandidates",
    "statesAndFeedback",
    "risksAndGaps",
    "aiPendingQuestions"
  ];
  const items = [];
  for (const section of sections) {
    ensureArray(sourceAnalysis && sourceAnalysis[section]).forEach((item, index) => {
      if (!item || typeof item !== "object") return;
      items.push({ ...item, section, path: `${section}[${index}]` });
    });
  }
  return items;
}

function validateCoverageEntry(entry, path, sourceById, modelIds, coverageBySource, reporter) {
  if (!entry || typeof entry !== "object") {
    reporter.fail("COVERAGE_ENTRY_NOT_OBJECT", "sourceCoverage entry must be an object.", path);
    return;
  }
  if (!isNonEmptyString(entry.sourceId)) {
    reporter.fail("COVERAGE_SOURCE_ID_MISSING", "sourceCoverage.sourceId is required.", `${path}.sourceId`);
    return;
  }
  if (!sourceById.has(entry.sourceId)) {
    reporter.fail("COVERAGE_SOURCE_ID_UNKNOWN", `sourceCoverage references unknown source id ${entry.sourceId}.`, `${path}.sourceId`);
  }
  const mappedTo = ensureArray(entry.mappedTo).filter((value) => isNonEmptyString(value));
  if (mappedTo.length === 0) {
    reporter.fail("COVERAGE_MAPPED_TO_MISSING", "sourceCoverage.mappedTo must include at least one model id.", `${path}.mappedTo`);
  }
  for (const ref of mappedTo) {
    if (!modelIds.has(ref)) {
      reporter.fail("COVERAGE_MODEL_REF_NOT_FOUND", `Mapped model id does not exist: ${ref}.`, `${path}.mappedTo`);
    }
  }
  if (!isNonEmptyString(entry.coverageType)) {
    reporter.fail("COVERAGE_TYPE_MISSING", "sourceCoverage.coverageType is required.", `${path}.coverageType`);
  }
  if (!isNonEmptyString(entry.rationale)) {
    reporter.fail("COVERAGE_RATIONALE_MISSING", "sourceCoverage.rationale is required.", `${path}.rationale`);
  }
  const existing = coverageBySource.get(entry.sourceId) || [];
  existing.push({ ...entry, mappedTo });
  coverageBySource.set(entry.sourceId, existing);
}

function validateSectionSpecificCoverage(item, entries, reporter) {
  const refs = entries.flatMap((entry) => ensureArray(entry.mappedTo));
  if (item.section === "interfaceCandidates" && !refs.some((ref) => /^IF-[0-9]{3}$/.test(ref))) {
    reporter.fail("INTERFACE_SOURCE_NOT_MAPPED_TO_INTERFACE", `${item.id} must map to at least one IF-* interface id.`, item.path);
  }
  if (item.section === "flowCandidates" && !refs.some((ref) => /^FLOW-[0-9]{3}$/.test(ref) || /^NODE-[0-9]{3}$/.test(ref))) {
    reporter.fail("FLOW_SOURCE_NOT_MAPPED_TO_FLOW", `${item.id} must map to at least one FLOW-* or NODE-* id.`, item.path);
  }
  if ((item.section === "risksAndGaps" || item.section === "aiPendingQuestions") && !refs.some((ref) => /^EL-/.test(ref) || /^IF-[0-9]{3}$/.test(ref))) {
    reporter.fail("RISK_SOURCE_NOT_MAPPED_TO_CONCRETE_UI", `${item.id} must map to a concrete interface or wireframe element id.`, item.path);
  }
}

function validateOverviewQuality(model, reporter) {
  const overview = model && model.overview ? model.overview : {};
  const problem = String(overview.problem || overview.designProblem || "").trim();
  if (problem.length < 28) {
    reporter.fail("OVERVIEW_PROBLEM_TOO_THIN", "overview.problem must be a concrete design/player interaction problem, not a short feature summary.", "overview.problem");
  } else if (!DESIGN_PROBLEM_RE.test(problem)) {
    reporter.warn("OVERVIEW_PROBLEM_NOT_DESIGN_ORIENTED", "overview.problem does not clearly mention player confusion, state, feedback, validation, risk, or fallback.", "overview.problem");
  }
}

function validateModelThicknessAgainstSource(sourceAnalysis, model, reporter) {
  const interfaceCandidates = ensureArray(sourceAnalysis && sourceAnalysis.interfaceCandidates).length;
  const flowCandidates = ensureArray(sourceAnalysis && sourceAnalysis.flowCandidates).length;
  const modelInterfaceCount = countInterfaces(model);
  const modelFlowCount = ensureArray(model && model.flows).length;
  const modelFlowEdges = ensureArray(model && model.flows).reduce((sum, flow) => sum + ensureArray(flow.edges).length, 0);
  const aiNotes = countAiPendingNotes(model);

  if (modelInterfaceCount < interfaceCandidates) {
    reporter.fail("MODEL_INTERFACE_COVERAGE_TOO_THIN", `interaction-model has ${modelInterfaceCount} interface(s), but source-analysis has ${interfaceCandidates} interface candidate(s).`, "featureModules");
  }
  if (modelFlowCount < flowCandidates) {
    reporter.fail("MODEL_FLOW_COVERAGE_TOO_THIN", `interaction-model has ${modelFlowCount} flow(s), but source-analysis has ${flowCandidates} flow candidate(s).`, "flows");
  }
  if (modelFlowEdges === 0) {
    reporter.fail("MODEL_FLOW_EDGES_MISSING", "interaction-model must include explicit flow edges before rendering 3.0.", "flows[].edges");
  }
  if (aiNotes === 0) {
    reporter.fail("MODEL_AI_PENDING_MISSING", "interaction-model must include visible AI pending notes tied to source risks/gaps.", "featureModules[].notes");
  }
}

function collectModelIds(model) {
  const ids = new Set(["overview", "OVERVIEW"]);
  for (const module of ensureArray(model && model.featureModules)) {
    addId(ids, module && module.id);
    for (const subsection of ensureArray(module && module.subsections)) {
      addId(ids, subsection && subsection.id);
      for (const iface of ensureArray(subsection && subsection.interfaces)) {
        addId(ids, iface && iface.id);
        collectWireframeIds(ids, iface && iface.wireframe);
      }
    }
  }
  for (const flow of ensureArray(model && model.flows)) {
    addId(ids, flow && (flow.flowId || flow.id));
    for (const node of ensureArray(flow && flow.nodes)) addId(ids, node && node.id);
  }
  return ids;
}

function collectWireframeIds(ids, wireframe) {
  if (!wireframe || typeof wireframe !== "object") return;
  for (const key of ["regions", "controls", "states", "feedback"]) {
    for (const item of ensureArray(wireframe[key])) addId(ids, item && item.id);
  }
  addId(ids, wireframe.modal && wireframe.modal.id);
  addId(ids, wireframe.toast && wireframe.toast.id);
}

function addId(ids, value) {
  if (isNonEmptyString(value)) ids.add(String(value).trim());
}

function countInterfaces(model) {
  let count = 0;
  for (const module of ensureArray(model && model.featureModules)) {
    for (const subsection of ensureArray(module && module.subsections)) {
      count += ensureArray(subsection && subsection.interfaces).length;
    }
  }
  return count;
}

function countAiPendingNotes(model) {
  let count = 0;
  for (const module of ensureArray(model && model.featureModules)) {
    for (const subsection of ensureArray(module && module.subsections)) {
      for (const iface of ensureArray(subsection && subsection.interfaces)) {
        for (const note of ensureArray(iface && iface.notes)) {
          if (/AI待确认/.test(String(note && note.tag || ""))) count += 1;
        }
      }
    }
  }
  return count;
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
  VALIDATOR_VERSION,
  validateAnalysisCoverage
};
