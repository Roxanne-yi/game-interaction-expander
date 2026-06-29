"use strict";

const { createReporter, ensureArray, isNonEmptyString, readUtf8Json, writeUtf8Json } = require("./_contract_lib");

const VALIDATOR_VERSION = "source-analysis-validator-v0.1";
const ITEM_ID_PATTERN = /^SA-[A-Z]+-[0-9]{3}$/;
const SECTION_RULES = [
  { key: "keyMechanisms", min: 3, label: "key mechanisms" },
  { key: "interfaceCandidates", min: 2, label: "interface candidates" },
  { key: "flowCandidates", min: 1, label: "flow candidates" },
  { key: "statesAndFeedback", min: 2, label: "states and feedback" },
  { key: "risksAndGaps", min: 1, label: "risks and gaps" },
  { key: "aiPendingQuestions", min: 1, label: "AI pending questions" }
];

function usage() {
  console.error("Usage: node scripts/validate-source-analysis.js <source-analysis.json> [--out <report.json>]");
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  const sourcePath = argv[0];
  if (!sourcePath) usage();
  let outPath = null;
  for (let i = 1; i < argv.length; i += 1) {
    if (argv[i] === "--out") {
      outPath = argv[i + 1];
      i += 1;
    } else {
      usage();
    }
  }
  const sourceAnalysis = readUtf8Json(sourcePath);
  const report = validateSourceAnalysis(sourceAnalysis);
  if (outPath) writeUtf8Json(outPath, report);
  else process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (!report.passed) process.exit(1);
}

function validateSourceAnalysis(sourceAnalysis) {
  const reporter = createReporter();
  if (!sourceAnalysis || typeof sourceAnalysis !== "object") {
    reporter.fail("SOURCE_ANALYSIS_NOT_OBJECT", "source-analysis.json must be an object.", "$");
    return reporter.result({ validator: VALIDATOR_VERSION, counts: emptyCounts() });
  }
  if (!isNonEmptyString(sourceAnalysis.schemaVersion)) {
    reporter.fail("SCHEMA_VERSION_MISSING", "source-analysis.json must include schemaVersion.", "schemaVersion");
  }
  validateSource(sourceAnalysis.source || {}, reporter);
  validateOverviewFindings(sourceAnalysis.overviewFindings || {}, reporter);

  const seenIds = new Set();
  const counts = {};
  for (const rule of SECTION_RULES) {
    const items = ensureArray(sourceAnalysis[rule.key]);
    counts[rule.key] = items.length;
    if (items.length < rule.min) {
      reporter.fail("SOURCE_SECTION_TOO_THIN", `${rule.label} must include at least ${rule.min} item(s).`, rule.key);
    }
    items.forEach((item, index) => validateItem(item, `${rule.key}[${index}]`, rule.key, seenIds, reporter));
  }

  const criticalMechanisms = ensureArray(sourceAnalysis.keyMechanisms).filter((item) => String(item.importance || "critical") === "critical");
  if (criticalMechanisms.length === 0) {
    reporter.warn("NO_CRITICAL_MECHANISMS", "At least one key mechanism should be marked critical.", "keyMechanisms");
  }
  return reporter.result({ validator: VALIDATOR_VERSION, counts });
}

function validateSource(source, reporter) {
  if (!source || typeof source !== "object") {
    reporter.fail("SOURCE_META_MISSING", "source metadata is required.", "source");
    return;
  }
  for (const key of ["title", "type"]) {
    if (!isNonEmptyString(source[key])) reporter.fail("SOURCE_META_FIELD_MISSING", `source.${key} is required.`, `source.${key}`);
  }
}

function validateOverviewFindings(overview, reporter) {
  for (const key of ["designProblem", "targetPlayers", "successCriteria"]) {
    const value = overview[key];
    if (!isNonEmptyString(value) || String(value).trim().length < 12) {
      reporter.fail("OVERVIEW_FINDING_TOO_THIN", `overviewFindings.${key} must be a concrete PRD-derived finding.`, `overviewFindings.${key}`);
    }
  }
}

function validateItem(item, path, sectionKey, seenIds, reporter) {
  if (!item || typeof item !== "object") {
    reporter.fail("SOURCE_ITEM_NOT_OBJECT", "Source-analysis item must be an object.", path);
    return;
  }
  if (!isNonEmptyString(item.id)) {
    reporter.fail("SOURCE_ITEM_ID_MISSING", "Source-analysis item id is required.", `${path}.id`);
  } else if (!ITEM_ID_PATTERN.test(item.id)) {
    reporter.fail("SOURCE_ITEM_ID_INVALID", "Source-analysis item id must look like SA-MECH-001.", `${path}.id`);
  } else if (seenIds.has(item.id)) {
    reporter.fail("SOURCE_ITEM_ID_DUPLICATE", `Duplicate source-analysis id ${item.id}.`, `${path}.id`);
  } else {
    seenIds.add(item.id);
  }
  for (const key of ["title", "description", "evidence"]) {
    if (!isNonEmptyString(item[key])) {
      reporter.fail("SOURCE_ITEM_FIELD_MISSING", `${key} is required.`, `${path}.${key}`);
    }
  }
  if (isNonEmptyString(item.description) && String(item.description).trim().length < 16) {
    reporter.warn("SOURCE_ITEM_DESCRIPTION_SHORT", "Description looks too short to preserve PRD semantics.", `${path}.description`);
  }
  if (isNonEmptyString(item.evidence) && String(item.evidence).trim().length < 8) {
    reporter.fail("SOURCE_ITEM_EVIDENCE_TOO_THIN", "Evidence must be specific enough to trace back to the source.", `${path}.evidence`);
  }
  if (sectionKey === "aiPendingQuestions" && !/待确认|不明确|缺少|未知|风险|confirm|unclear|missing|risk/i.test(`${item.title} ${item.description}`)) {
    reporter.warn("AI_PENDING_NOT_QUESTION_LIKE", "AI pending item should describe an unresolved decision, conflict, or design risk.", path);
  }
}

function emptyCounts() {
  return Object.fromEntries(SECTION_RULES.map((rule) => [rule.key, 0]));
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
  validateSourceAnalysis
};
