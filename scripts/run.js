"use strict";

const fs = require("fs");
const path = require("path");
const { readUtf8Json, writeUtf8Json } = require("./_contract_lib");
const { validateSourceAnalysis } = require("./validate-source-analysis");
const { validateInteractionModel } = require("./validate-interaction-model");
const { validateAnalysisCoverage } = require("./validate-analysis-coverage");
const { buildRenderPayload } = require("./build-render-payload");
const { generateFigmaScripts } = require("./generate-figma-scripts");

const STATE_VERSION = "game-interaction-prd-expander/run-state/1.0";
const STAGES = ["initialized", "source_analysis_validated", "model_validated", "coverage_validated", "payload_ready", "render_ready", "figma_scripts_ready", "official_render_required"];

function usage() {
  console.error([
    "Usage:",
    "  node scripts/run.js prepare <run-dir> <source-analysis.json> <interaction-model.json> [--target-page-id <figma-page-id>] [--target-board-id <board-id>]",
    "  node scripts/run.js init <run-dir> <source-analysis.json> <interaction-model.json>",
    "  node scripts/run.js validate-source <run-dir>",
    "  node scripts/run.js validate-model <run-dir>",
    "  node scripts/run.js validate-coverage <run-dir>",
    "  node scripts/run.js build-payload <run-dir>",
    "  node scripts/run.js render-ready <run-dir>",
    "  node scripts/run.js generate-figma-scripts <run-dir> [--target-page-id <figma-page-id>] [--target-board-id <board-id>]",
    "  node scripts/run.js figma-next <run-dir> [--inline-code]",
    "  node scripts/run.js figma-record <run-dir> --status <pass|fail> [--board-id <board-id>] [--message <text>]",
    "  node scripts/run.js status <run-dir>"
  ].join("\n"));
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  const command = argv[0];
  if (!command) usage();
  if (command === "prepare") return prepareRun(argv[1], argv[2], argv[3], parseOptions(argv.slice(4)));
  if (command === "init") return initRun(argv[1], argv[2], argv[3]);
  if (command === "validate-source") return validateSourceStage(argv[1]);
  if (command === "validate-model") return validateModelStage(argv[1]);
  if (command === "validate-coverage") return validateCoverageStage(argv[1]);
  if (command === "build-payload") return buildPayloadStage(argv[1]);
  if (command === "render-ready") return markRenderReady(argv[1]);
  if (command === "generate-figma-scripts") return generateFigmaScriptsStage(argv[1], parseOptions(argv.slice(2)));
  if (command === "figma-next") return printNextFigmaPayload(argv[1], parseFigmaNextOptions(argv.slice(2)));
  if (command === "figma-record") return recordFigmaPayloadResult(argv[1], parseRecordOptions(argv.slice(2)));
  if (command === "status") return printStatus(argv[1]);
  usage();
}

function parseOptions(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--target-page-id") {
      options.targetPageId = value || "";
      i += 1;
    } else if (key === "--target-board-id") {
      options.targetBoardId = value || "";
      i += 1;
    } else if (key === "--out-dir") {
      options.outDir = value || "";
      i += 1;
    } else {
      usage();
    }
  }
  return options;
}

function parseRecordOptions(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--status") {
      options.status = value || "";
      i += 1;
    } else if (key === "--board-id") {
      options.boardId = value || "";
      i += 1;
    } else if (key === "--message") {
      options.message = value || "";
      i += 1;
    } else {
      usage();
    }
  }
  return options;
}

function parseFigmaNextOptions(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (key === "--inline-code") {
      options.inlineCode = true;
    } else {
      usage();
    }
  }
  return options;
}

function prepareRun(runDir, sourcePath, modelPath, options = {}) {
  if (!runDir || !sourcePath || !modelPath) usage();
  initRun(runDir, sourcePath, modelPath);
  validateSourceStage(runDir);
  validateModelStage(runDir);
  validateCoverageStage(runDir);
  buildPayloadStage(runDir);
  markRenderReady(runDir);
  return generateFigmaScriptsStage(runDir, options);
}

function initRun(runDir, sourcePath, modelPath) {
  if (!runDir || !sourcePath || !modelPath) usage();
  const resolvedRunDir = path.resolve(runDir);
  fs.mkdirSync(resolvedRunDir, { recursive: true });
  const sourceAnalysis = readUtf8Json(sourcePath);
  const model = readUtf8Json(modelPath);
  writeUtf8Json(path.join(resolvedRunDir, "source-analysis.json"), sourceAnalysis);
  writeUtf8Json(path.join(resolvedRunDir, "interaction-model.json"), model);
  const state = {
    schemaVersion: STATE_VERSION,
    currentStage: "initialized",
    artifacts: {
      sourceAnalysis: "source-analysis.json",
      interactionModel: "interaction-model.json"
    },
    history: [
      { stage: "initialized", at: new Date().toISOString(), message: "Copied source analysis and interaction model into run directory." }
    ]
  };
  writeState(resolvedRunDir, state);
  return printJson({ ok: true, runDir: resolvedRunDir, currentStage: state.currentStage, next: "validate-source" });
}

function validateSourceStage(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["initialized", "source_analysis_validated"]);
  const sourcePath = path.join(resolvedRunDir, "source-analysis.json");
  const sourceAnalysis = readUtf8Json(sourcePath);
  const report = validateSourceAnalysis(sourceAnalysis);
  writeUtf8Json(path.join(resolvedRunDir, "source-analysis.validation.json"), report);
  state.artifacts = {
    ...(state.artifacts || {}),
    sourceAnalysisValidation: "source-analysis.validation.json"
  };
  if (report.passed) {
    state.currentStage = "source_analysis_validated";
    state.history.push({ stage: "source_analysis_validated", at: new Date().toISOString(), message: "Source analysis validation passed." });
  } else {
    state.currentStage = "initialized";
    state.history.push({ stage: "source_analysis_validation_failed", at: new Date().toISOString(), message: `${report.failCount} failures.` });
  }
  writeState(resolvedRunDir, state);
  printJson({ ok: report.passed, runDir: resolvedRunDir, currentStage: state.currentStage, report, next: report.passed ? "validate-model" : "fix source-analysis.json and rerun validate-source" });
  if (!report.passed) process.exit(1);
}

function validateModelStage(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["source_analysis_validated", "model_validated"]);
  const modelPath = path.join(resolvedRunDir, "interaction-model.json");
  const model = readUtf8Json(modelPath);
  const report = validateInteractionModel(model);
  writeUtf8Json(path.join(resolvedRunDir, "interaction-model.validation.json"), report);
  state.artifacts = {
    ...(state.artifacts || {}),
    interactionModelValidation: "interaction-model.validation.json"
  };
  if (report.passed) {
    state.currentStage = "model_validated";
    state.history.push({ stage: "model_validated", at: new Date().toISOString(), message: "Interaction model validation passed." });
  } else {
    state.currentStage = "initialized";
    state.history.push({ stage: "model_validation_failed", at: new Date().toISOString(), message: `${report.failCount} failures.` });
  }
  writeState(resolvedRunDir, state);
  printJson({ ok: report.passed, runDir: resolvedRunDir, currentStage: state.currentStage, report, next: report.passed ? "validate-coverage" : "fix interaction-model.json and rerun validate-model" });
  if (!report.passed) process.exit(1);
}

function validateCoverageStage(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["model_validated", "coverage_validated"]);
  const sourceReport = readUtf8Json(path.join(resolvedRunDir, "source-analysis.validation.json"));
  const modelReport = readUtf8Json(path.join(resolvedRunDir, "interaction-model.validation.json"));
  if (!sourceReport.passed) throw new Error("Cannot validate coverage: source-analysis.validation.json did not pass.");
  if (!modelReport.passed) throw new Error("Cannot validate coverage: interaction-model.validation.json did not pass.");
  const sourceAnalysis = readUtf8Json(path.join(resolvedRunDir, "source-analysis.json"));
  const model = readUtf8Json(path.join(resolvedRunDir, "interaction-model.json"));
  const report = validateAnalysisCoverage(sourceAnalysis, model);
  writeUtf8Json(path.join(resolvedRunDir, "analysis-coverage.validation.json"), report);
  state.artifacts = {
    ...(state.artifacts || {}),
    analysisCoverageValidation: "analysis-coverage.validation.json"
  };
  if (report.passed) {
    state.currentStage = "coverage_validated";
    state.history.push({ stage: "coverage_validated", at: new Date().toISOString(), message: "Source-to-model coverage validation passed." });
  } else {
    state.currentStage = "model_validated";
    state.history.push({ stage: "coverage_validation_failed", at: new Date().toISOString(), message: `${report.failCount} failures.` });
  }
  writeState(resolvedRunDir, state);
  printJson({ ok: report.passed, runDir: resolvedRunDir, currentStage: state.currentStage, report, next: report.passed ? "build-payload" : "fix sourceCoverage/model coverage and rerun validate-coverage" });
  if (!report.passed) process.exit(1);
}

function buildPayloadStage(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["coverage_validated", "payload_ready"]);
  const report = readUtf8Json(path.join(resolvedRunDir, "interaction-model.validation.json"));
  if (!report.passed) throw new Error("Cannot build payload: interaction-model.validation.json did not pass.");
  const coverageReport = readUtf8Json(path.join(resolvedRunDir, "analysis-coverage.validation.json"));
  if (!coverageReport.passed) throw new Error("Cannot build payload: analysis-coverage.validation.json did not pass.");
  const modelPath = path.join(resolvedRunDir, "interaction-model.json");
  const model = readUtf8Json(modelPath);
  const payload = buildRenderPayload(model);
  writeUtf8Json(path.join(resolvedRunDir, "render-payload.json"), payload);
  state.artifacts = {
    ...(state.artifacts || {}),
    renderPayload: "render-payload.json"
  };
  state.currentStage = "payload_ready";
  state.history.push({ stage: "payload_ready", at: new Date().toISOString(), message: "Built official renderer payload from validated interaction model." });
  writeState(resolvedRunDir, state);
  return printJson({ ok: true, runDir: resolvedRunDir, currentStage: state.currentStage, modelSummary: payload.modelSummary, next: "render-ready" });
}

function markRenderReady(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["payload_ready", "render_ready"]);
  const report = readUtf8Json(path.join(resolvedRunDir, "interaction-model.validation.json"));
  if (!report.passed) throw new Error("Cannot mark render-ready: interaction-model.validation.json did not pass.");
  const payload = readUtf8Json(path.join(resolvedRunDir, "render-payload.json"));
  if (payload.schemaVersion !== "game-interaction-prd-expander/render-payload/1.0") {
    throw new Error(`Cannot mark render-ready: unsupported render-payload schemaVersion ${payload.schemaVersion || "missing"}.`);
  }
  state.currentStage = "render_ready";
  state.history.push({ stage: "render_ready", at: new Date().toISOString(), message: "Renderer payload is ready for manifest renderer." });
  writeState(resolvedRunDir, state);
  return printJson({
    ok: true,
    runDir: resolvedRunDir,
    currentStage: state.currentStage,
    next: "generate-figma-scripts, then run generated render payload scripts, validator, and gate scripts through use_figma"
  });
}

function generateFigmaScriptsStage(runDir, options = {}) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  requireStage(state, ["render_ready", "figma_scripts_ready", "official_render_required"]);
  const result = generateFigmaScripts(resolvedRunDir, options);
  state.artifacts = {
    ...(state.artifacts || {}),
    figmaScriptsIndex: "figma-scripts/figma-scripts.index.json",
    figmaRenderPayloads: result.files.renderPayloads,
    figmaRenderStageScripts: result.files.renderStages,
    figmaValidatorScript: "figma-scripts/figma-validator.generated.js",
    figmaGateScript: "figma-scripts/figma-gate.generated.js"
  };
  state.currentStage = "official_render_required";
  state.history.push({ stage: "official_render_required", at: new Date().toISOString(), message: "Generated official Figma payload batches, validator, and gate scripts. No fallback board is allowed." });
  writeState(resolvedRunDir, state);
  return printJson({
    ok: true,
    runDir: resolvedRunDir,
    currentStage: state.currentStage,
    figmaScripts: result.files,
    runnerVersion: result.runnerVersion,
    runnerScriptHash: result.runnerScriptHash,
    targetBoardIdPlaceholder: result.targetBoardIdPlaceholder,
    next: "run render payload scripts in order, then validator and gate through use_figma; if transport fails, stop with renderer_transport_failed"
  });
}

function getFigmaExecutionPath(runDir) {
  return path.join(runDir, "figma-execution-state.json");
}

function buildFigmaExecutionQueue(runDir) {
  const indexPath = path.join(runDir, "figma-scripts", "figma-scripts.index.json");
  if (!fs.existsSync(indexPath)) throw new Error(`Missing figma-scripts.index.json. Run generate-figma-scripts first: ${indexPath}`);
  const index = readUtf8Json(indexPath);
  const files = index.files || {};
  const queue = [];
  for (const item of files.renderPayloads || files.renderStages || []) queue.push({ kind: "render", file: item });
  if (files.validator) queue.push({ kind: "validator", file: files.validator });
  if (files.gate) queue.push({ kind: "gate", file: files.gate });
  if (queue.length === 0) throw new Error("figma-scripts.index.json has no executable payloads.");
  return { index, queue };
}

function readFigmaExecutionState(runDir) {
  const statePath = getFigmaExecutionPath(runDir);
  if (fs.existsSync(statePath)) return readUtf8Json(statePath);
  const { index, queue } = buildFigmaExecutionQueue(runDir);
  const state = {
    schemaVersion: "game-interaction-prd-expander/figma-execution-state/1.0",
    currentIndex: 0,
    boardId: index.targetBoardId || "",
    queue,
    history: []
  };
  writeUtf8Json(statePath, state);
  return state;
}

function writeFigmaExecutionState(runDir, state) {
  writeUtf8Json(getFigmaExecutionPath(runDir), state);
}

function printNextFigmaPayload(runDir, options = {}) {
  return printJson(getNextFigmaPayload(runDir, options));
}

function getNextFigmaPayload(runDir, options = {}) {
  const resolvedRunDir = requireRunDir(runDir);
  const runState = readState(resolvedRunDir);
  requireStage(runState, ["official_render_required"]);
  const execState = readFigmaExecutionState(resolvedRunDir);
  if (execState.currentIndex >= execState.queue.length) {
    return {
      ok: true,
      done: true,
      runDir: resolvedRunDir,
      message: "All generated Figma payloads have been recorded. Review validator/gate output and screenshot."
    };
  }
  const item = execState.queue[execState.currentIndex];
  const absolutePath = path.join(resolvedRunDir, item.file);
  if (!fs.existsSync(absolutePath)) throw new Error(`Missing generated Figma payload: ${absolutePath}`);
  let code = fs.readFileSync(absolutePath, "utf8");
  if (execState.boardId) code = code.split("__TARGET_BOARD_ID_AFTER_RENDER__").join(execState.boardId);
  const transfer = materializeFigmaTransferPayload(resolvedRunDir, execState.currentIndex, item, code);
  const result = {
    ok: true,
    done: false,
    runDir: resolvedRunDir,
    step: execState.currentIndex + 1,
    total: execState.queue.length,
    kind: item.kind,
    file: item.file,
    codeFile: transfer.codeFile,
    chars: transfer.chars,
    bytes: transfer.bytes,
    transferRule: "Use nodeRepl/read-payload to read codeFile as a UTF-8 string and pass that string directly to use_figma.code.",
    boardId: execState.boardId || "",
    inlineCode: !!options.inlineCode,
    instruction: [
      `This batch is ${transfer.chars} chars / ${transfer.bytes} bytes; large payload size is expected.`,
      "Do not skip, downgrade, rewrite, split again, or use a fallback because of payload size.",
      "Do not paste the payload into normal model context.",
      "Do not pass codeFile as the use_figma code value; use_figma accepts JavaScript source text only. Passing a path will cause a SyntaxError and means the transport was misused.",
      "After use_figma returns, run figma-record with --status pass and the returned boardId when available."
    ].join(" ")
  };
  if (options.inlineCode) result.code = code;
  return result;
}

function materializeFigmaTransferPayload(runDir, currentIndex, item, code) {
  const transferDir = path.join(runDir, "figma-scripts", "transfer");
  fs.mkdirSync(transferDir, { recursive: true });
  const baseName = path.basename(item.file).replace(/[^a-zA-Z0-9_.-]/g, "_");
  const codeFile = path.join(transferDir, `${String(currentIndex + 1).padStart(3, "0")}-${baseName}`);
  fs.writeFileSync(codeFile, code, "utf8");
  return {
    codeFile,
    chars: code.length,
    bytes: Buffer.byteLength(code, "utf8")
  };
}

function recordFigmaPayloadResult(runDir, options = {}) {
  const resolvedRunDir = requireRunDir(runDir);
  const runState = readState(resolvedRunDir);
  requireStage(runState, ["official_render_required"]);
  const status = String(options.status || "").toLowerCase();
  if (!["pass", "fail"].includes(status)) throw new Error("figma-record requires --status pass or --status fail.");
  const execState = readFigmaExecutionState(resolvedRunDir);
  const item = execState.queue[execState.currentIndex];
  if (!item) throw new Error("No pending Figma payload to record.");
  const record = {
    at: new Date().toISOString(),
    step: execState.currentIndex + 1,
    total: execState.queue.length,
    kind: item.kind,
    file: item.file,
    status,
    boardId: options.boardId || execState.boardId || "",
    message: options.message || ""
  };
  execState.history.push(record);
  if (options.boardId) execState.boardId = options.boardId;
  if (status === "pass") {
    execState.currentIndex += 1;
  } else {
    execState.failed = record;
  }
  writeFigmaExecutionState(resolvedRunDir, execState);
  return printJson({
    ok: status === "pass",
    runDir: resolvedRunDir,
    recorded: record,
    next: status === "pass" && execState.currentIndex < execState.queue.length ? "figma-next" : (status === "pass" ? "complete" : "stop and report renderer_transport_failed")
  });
}

function printStatus(runDir) {
  const resolvedRunDir = requireRunDir(runDir);
  const state = readState(resolvedRunDir);
  const nextByStage = {
    initialized: "validate-source",
    source_analysis_validated: "validate-model",
    model_validated: "validate-coverage",
    coverage_validated: "build-payload",
    payload_ready: "render-ready",
    render_ready: "generate-figma-scripts",
    figma_scripts_ready: "run generated Figma scripts through use_figma",
    official_render_required: "use figma-next to retrieve codeFile/chars/bytes/transferRule, pass the file contents to use_figma via nodeRepl/read-payload, then use figma-record; fallback is forbidden"
  };
  return printJson({ ok: true, runDir: resolvedRunDir, currentStage: state.currentStage, next: nextByStage[state.currentStage] || "inspect run-state.json", artifacts: state.artifacts || {} });
}

function requireRunDir(runDir) {
  if (!runDir) usage();
  const resolved = path.resolve(runDir);
  if (!fs.existsSync(resolved)) throw new Error(`Run directory does not exist: ${resolved}`);
  return resolved;
}

function readState(runDir) {
  const statePath = path.join(runDir, "run-state.json");
  if (!fs.existsSync(statePath)) throw new Error(`Missing run-state.json. Run init first: ${runDir}`);
  const state = readUtf8Json(statePath);
  if (state.schemaVersion !== STATE_VERSION) throw new Error(`Unsupported run-state schemaVersion: ${state.schemaVersion || "missing"}`);
  if (!Array.isArray(state.history)) state.history = [];
  return state;
}

function writeState(runDir, state) {
  if (!STAGES.includes(state.currentStage)) throw new Error(`Invalid run stage: ${state.currentStage}`);
  writeUtf8Json(path.join(runDir, "run-state.json"), state);
}

function requireStage(state, allowed) {
  if (!allowed.includes(state.currentStage)) {
    throw new Error(`Wrong stage: ${state.currentStage}. Allowed: ${allowed.join(", ")}.`);
  }
}

function printJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

if (require.main === module) main();

module.exports = {
  STATE_VERSION,
  buildPayloadStage,
  generateFigmaScriptsStage,
  getNextFigmaPayload,
  initRun,
  main,
  markRenderReady,
  printNextFigmaPayload,
  recordFigmaPayloadResult,
  prepareRun,
  validateCoverageStage,
  validateModelStage,
  validateSourceStage
};
