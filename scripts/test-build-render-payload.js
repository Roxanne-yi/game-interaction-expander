"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildRenderPayload } = require("./build-render-payload");
const { initRun, validateSourceStage, validateModelStage, validateCoverageStage, buildPayloadStage, markRenderReady, generateFigmaScriptsStage, prepareRun, getNextFigmaPayload, recordFigmaPayloadResult } = require("./run");
const { writeUtf8Json, readUtf8Json } = require("./_contract_lib");

const AI_PENDING_TAG = "AI\u5f85\u786e\u8ba4";
const PLANNING_TAG = "\u7b56\u5212\u6ce8\u610f";
const asyncAssertions = [];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeValidModel() {
  return {
    schemaVersion: "game-interaction-prd-expander/interaction-model/1.0",
    boardName: "Black Market Brief",
    header: {
      projectTitle: "Black Market",
      planner: "\u5360\u4f4d",
      ued: "\u5360\u4f4d",
      date: "2026-06-22"
    },
    overview: {
      problem: "Players need clear sellable-item scope and result feedback.",
      targetAudience: "Players using the recycle and sell loop.",
      expectedEffect: "Reduce confusion before selling items.",
      versionRow: {
        version: "v0.1",
        change: "Initial generated brief.",
        date: "2026-06-22"
      },
      versionHistory: [
        { version: "v0.1", change: "Initial generated brief.", date: "2026-06-22" },
        { version: "v0.2", change: "Added recycle-machine branch.", date: "2026-06-23" }
      ]
    },
    featureModules: [
      {
        id: "MOD-001",
        title: "Manual Sell",
        note: "Sell selected inventory items for recycle currency.",
        subsections: [
          {
            id: "SUB-001",
            title: "Select Item And Confirm",
            interfaces: [
              {
                id: "IF-001",
                title: "Sell Panel",
                wireframe: {
                  surface: "panel",
                  surfaceType: "selection",
                  layoutIntent: "selection",
                  primaryTask: "Select inventory item and prepare sell confirmation.",
                  description: "Inventory list, selected item details, and confirm action.",
                  regions: [
                    { id: "EL-list", type: "list", role: "inventory", title: "Inventory", items: ["Item card", "Locked state"] },
                    { id: "EL-detail", type: "detail", role: "detail", title: "Selected Item", items: ["Price", "Ownership state"] }
                  ],
                  controls: [
                    { id: "EL-confirm", type: "primaryButton", role: "confirm", label: "Confirm Sell" }
                  ],
                  states: [
                    { id: "EL-disabled", type: "disabled", visualTarget: "EL-confirm", name: "Unsellable item" }
                  ],
                  feedback: [
                    { id: "EL-toast", type: "toast", title: "Sell success" }
                  ],
                  primaryAction: "Confirm Sell"
                },
                notes: [
                  {
                    tag: PLANNING_TAG,
                    targetElementId: "EL-confirm",
                    body: "Confirm action requires price and ownership validation before submit.",
                    coverage: ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback"],
                    basis: "sourceExplicit",
                    evidence: "PRD defines sell validation before currency is granted."
                  },
                  {
                    tag: AI_PENDING_TAG,
                    targetElementId: "EL-disabled",
                    body: "Source does not define player-facing copy for unsellable items.",
                    coverage: ["aiPending"],
                    basis: "inferredGap",
                    evidence: "No disabled reason copy is present in the source."
                  },
                  {
                    tag: "UI注意",
                    targetElementId: "EL-list",
                    body: "Inventory cards must expose selected, locked, sellable, and recently changed price states without relying on right-side explanatory text only.",
                    coverage: ["keyStates", "feedback"],
                    basis: "designRisk",
                    evidence: "The interaction model needs visible card state expression for designers."
                  }
                ]
              },
              {
                id: "IF-002",
                title: "Sell Result Toast",
                wireframe: {
                  surface: "toast",
                  surfaceType: "successFeedback",
                  layoutIntent: "successFeedback",
                  primaryTask: "Show sell result and currency feedback.",
                  regions: [
                    { id: "EL-result", type: "detail", role: "result", title: "Result", items: ["Currency amount", "Item removed"] }
                  ],
                  controls: [
                    { id: "EL-close", type: "secondaryButton", role: "close", label: "Close" }
                  ],
                  states: [
                    { id: "EL-success", type: "success", visualTarget: "EL-result", name: "Currency granted" }
                  ],
                  feedback: [
                    { id: "EL-feedback", type: "toast", title: "Currency received" }
                  ]
                },
                notes: [
                  {
                    tag: AI_PENDING_TAG,
                    targetElementId: "EL-feedback",
                    body: "Confirm whether the toast should show total balance or this transaction amount only.",
                    coverage: ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback", "aiPending"],
                    basis: "designRisk",
                    evidence: "Source only says currency is received, not display format."
                  }
                ]
              }
            ]
          }
        ]
      }
    ],
    flows: [
      {
        flowId: "FLOW-001",
        title: "Manual Sell Main Flow",
        nodes: [
          { id: "NODE-001", title: "Open sell panel", interfaceId: "IF-001" },
          { id: "NODE-002", title: "Confirm selected item", interfaceId: "IF-001" },
          { id: "NODE-003", title: "Show result feedback", interfaceId: "IF-002" }
        ],
        edges: [
          {
            from: "NODE-001",
            to: "NODE-002",
            label: "Select sellable item",
            relationshipType: "navigation",
            evidence: "PRD describes selecting item before selling."
          },
          {
            from: "NODE-002",
            to: "NODE-003",
            label: "Validation passes",
            relationshipType: "systemFeedback",
            evidence: "PRD describes currency feedback after successful sell."
          }
        ]
      },
      {
        flowId: "FLOW-002",
        title: "Unsellable Branch",
        nodes: [
          { id: "NODE-004", title: "Select locked item", interfaceId: "IF-001" },
          { id: "NODE-005", title: "Show disabled reason", interfaceId: "IF-001" }
        ],
        edges: [
          {
            from: "NODE-004",
            to: "NODE-005",
            label: "Item cannot be sold",
            relationshipType: "branchDecision",
            evidence: "PRD lists restricted item states."
          }
        ]
      }
    ],
    sourceCoverage: [
      { sourceId: "SA-MECH-001", mappedTo: ["MOD-001", "IF-001", "FLOW-001"], coverageType: "module", rationale: "Manual sell mechanism maps to the main module, sell panel, and main flow." },
      { sourceId: "SA-MECH-002", mappedTo: ["IF-001", "EL-confirm"], coverageType: "wireframe", rationale: "Sell confirmation validation maps to the confirm control." },
      { sourceId: "SA-MECH-003", mappedTo: ["IF-002", "EL-feedback"], coverageType: "note", rationale: "Result feedback maps to the result toast interface and feedback element." },
      { sourceId: "SA-IF-001", mappedTo: ["IF-001"], coverageType: "interface", rationale: "Sell panel candidate is represented by IF-001." },
      { sourceId: "SA-IF-002", mappedTo: ["IF-002"], coverageType: "interface", rationale: "Result toast candidate is represented by IF-002." },
      { sourceId: "SA-FLOW-001", mappedTo: ["FLOW-001", "NODE-001", "NODE-002", "NODE-003"], coverageType: "flow", rationale: "Main sell flow maps to FLOW-001 and its nodes." },
      { sourceId: "SA-FLOW-002", mappedTo: ["FLOW-002", "NODE-004", "NODE-005"], coverageType: "flow", rationale: "Unsellable branch maps to FLOW-002." },
      { sourceId: "SA-STATE-001", mappedTo: ["EL-disabled"], coverageType: "wireframe", rationale: "Unsellable disabled state maps to EL-disabled." },
      { sourceId: "SA-STATE-002", mappedTo: ["EL-feedback"], coverageType: "wireframe", rationale: "Currency feedback state maps to EL-feedback." },
      { sourceId: "SA-RISK-001", mappedTo: ["IF-001", "EL-disabled"], coverageType: "aiPending", rationale: "Missing disabled reason is covered by the AI pending note on EL-disabled." },
      { sourceId: "SA-AI-001", mappedTo: ["IF-001", "EL-disabled"], coverageType: "aiPending", rationale: "AI pending question maps to the disabled item state." }
    ]
  };
}

function makeValidSourceAnalysis() {
  return {
    schemaVersion: "game-interaction-prd-expander/source-analysis/1.0",
    source: {
      title: "Black Market PRD",
      type: "docx",
      path: "fixture.docx"
    },
    overviewFindings: {
      designProblem: "Players must understand sellable scope, disabled reasons, validation, and result feedback before selling.",
      targetPlayers: "Players using recycle/sell systems and comparing item prices.",
      successCriteria: "The pre-brief must expose player flow, disabled state, feedback, and missing confirmation decisions."
    },
    keyMechanisms: [
      { id: "SA-MECH-001", title: "Manual sell loop", description: "Player selects an item, confirms sell action, and receives recycle currency.", evidence: "PRD states item selling grants recycle currency.", importance: "critical" },
      { id: "SA-MECH-002", title: "Pre-submit validation", description: "Ownership, price, and sellable status must be checked before submit.", evidence: "PRD defines validation before currency grant.", importance: "critical" },
      { id: "SA-MECH-003", title: "Result feedback", description: "Successful sell removes item and shows currency feedback.", evidence: "PRD describes currency received feedback.", importance: "critical" }
    ],
    interfaceCandidates: [
      { id: "SA-IF-001", title: "Sell panel", description: "Panel for inventory list, selected item detail, and sell confirmation.", evidence: "PRD describes selecting an inventory item before selling." },
      { id: "SA-IF-002", title: "Sell result toast", description: "Feedback surface after sell success or blocked sale.", evidence: "PRD describes sell result feedback." }
    ],
    flowCandidates: [
      { id: "SA-FLOW-001", title: "Manual sell main flow", description: "Open panel, select sellable item, confirm, receive feedback.", evidence: "PRD describes the main sell operation." },
      { id: "SA-FLOW-002", title: "Unsellable branch", description: "Selecting a locked item shows disabled reason instead of submit.", evidence: "PRD lists restricted item states." }
    ],
    statesAndFeedback: [
      { id: "SA-STATE-001", title: "Unsellable disabled state", description: "Locked or invalid item cannot be sold and must show reason.", evidence: "PRD lists restricted item states." },
      { id: "SA-STATE-002", title: "Currency feedback", description: "Successful sell shows currency amount or balance feedback.", evidence: "PRD says recycle currency is granted." }
    ],
    risksAndGaps: [
      { id: "SA-RISK-001", title: "Disabled reason copy missing", description: "Source does not define player-facing disabled reason copy.", evidence: "No disabled reason copy is present in the source." }
    ],
    aiPendingQuestions: [
      { id: "SA-AI-001", title: "Confirm disabled reason display", description: "Need to confirm how unsellable item reasons are shown to players.", evidence: "Source defines restricted state but not the display copy." }
    ]
  };
}

const model = makeValidModel();
const payload = buildRenderPayload(model);
assert(payload.schemaVersion === "game-interaction-prd-expander/render-payload/1.0", "payload schema mismatch");
assert(payload.overview.versionHistory.length === 2, "payload should preserve complete versionHistory");
assert(payload.flows.length === 2, "payload should preserve main and branch flows");
assert(payload.flows[0].edges.length === 2, "payload should preserve explicit flow edges");
assert(payload.featureModules[0].subsections[0].interfaces.length === 2, "payload should preserve every interface row");
assert(payload.featureModules[0].subsections[0].interfaces[0].wireframe.regions.length === 2, "payload should preserve wireframe regions");
assert(payload.featureModules[0].subsections[0].interfaces[0].wireframe.controls.length === 1, "payload should preserve wireframe controls");
assert(payload.featureModules[0].subsections[0].interfaces[0].wireframe.states.length === 1, "payload should preserve wireframe states");
assert(payload.featureModules[0].subsections[0].interfaces[0].wireframe.feedback.length === 1, "payload should preserve wireframe feedback");
assert(payload.featureModules[0].subsections[0].interfaces[0].wireframe.layoutIntent === "selection", "payload should preserve wireframe layoutIntent");
assert(payload.featureModules[0].subsections[0].interfaces[0].notes.length === 3, "payload should not truncate interface notes before rendering");
assert(payload.featureModules[0].subsections[0].interfaces[0].notes[0].coverage.includes("purpose"), "payload should preserve note coverage");
assert(payload.modelSummary.interfaceCount === 2, "payload summary should count interfaces");
assert(payload.modelSummary.aiPendingCount === 2, "payload summary should count AI pending notes");
assert(payload.featureModules[0].subsections[0].interfaces[0].aiPending.length === 1, "payload should expose interface AI pending lines");

const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "gipx-payload-"));
const sourcePath = path.join(runDir, "source-analysis.json");
const modelPath = path.join(runDir, "source-model.json");
writeUtf8Json(sourcePath, makeValidSourceAnalysis());
writeUtf8Json(modelPath, model);
initRun(runDir, sourcePath, modelPath);
validateSourceStage(runDir);
validateModelStage(runDir);
validateCoverageStage(runDir);
buildPayloadStage(runDir);
let state = readUtf8Json(path.join(runDir, "run-state.json"));
assert(state.currentStage === "payload_ready", "run.js should stop at payload_ready after build-payload");
assert(state.artifacts.renderPayload === "render-payload.json", "run.js should record render payload artifact");
const builtPayload = readUtf8Json(path.join(runDir, "render-payload.json"));
assert(builtPayload.modelSummary.flowEdgeCount === 3, "run payload should preserve all flow edges");
markRenderReady(runDir);
state = readUtf8Json(path.join(runDir, "run-state.json"));
assert(state.currentStage === "render_ready", "run.js should mark render_ready after payload exists");
generateFigmaScriptsStage(runDir, { targetPageId: "299:1168" });
state = readUtf8Json(path.join(runDir, "run-state.json"));
assert(state.currentStage === "official_render_required", "run.js should require official render after generated scripts exist");
for (const artifact of ["figmaValidatorScript", "figmaGateScript", "figmaScriptsIndex"]) {
  assert(state.artifacts[artifact], `run-state should record ${artifact}`);
  assert(fs.existsSync(path.join(runDir, state.artifacts[artifact])), `${artifact} should exist`);
}
assert(Array.isArray(state.artifacts.figmaRenderPayloads) && state.artifacts.figmaRenderPayloads.length > 0, "run-state should record render payload artifacts");
assert(Array.isArray(state.artifacts.figmaRenderStageScripts) && state.artifacts.figmaRenderStageScripts.length >= 5, "run-state should record render stage scripts");
for (const stagePath of state.artifacts.figmaRenderStageScripts) {
  assert(fs.existsSync(path.join(runDir, stagePath)), `render stage script should exist: ${stagePath}`);
  const stageSource = fs.readFileSync(path.join(runDir, stagePath), "utf8");
  assert(stageSource.length <= 25000, `generated Figma render stage exceeds 25k: ${stagePath} (${stageSource.length})`);
  assert(stageSource.includes("Direct payload batch"), `render stage should be a direct payload batch: ${stagePath}`);
  assertFigmaScriptSyntax(stageSource, `generated render stage ${stagePath}`);
}
const generatedRender = fs.readFileSync(path.join(runDir, state.artifacts.figmaRenderStageScripts[0]), "utf8");
const generatedOverview = fs.readFileSync(path.join(runDir, state.artifacts.figmaRenderStageScripts[1]), "utf8");
const generatedValidator = fs.readFileSync(path.join(runDir, state.artifacts.figmaValidatorScript), "utf8");
const generatedGate = fs.readFileSync(path.join(runDir, state.artifacts.figmaGateScript), "utf8");
const index = readUtf8Json(path.join(runDir, state.artifacts.figmaScriptsIndex));
assert(Array.isArray(index.files.renderPayloads) && index.files.renderPayloads.length > 0, "generated index should list render payloads");
assert(Array.isArray(index.files.renderStages) && index.files.renderStages.length === state.artifacts.figmaRenderStageScripts.length, "generated index should list render stage scripts");
assert(index.files.renderStages[0].includes("000-bootstrap"), "generated index should start with bootstrap payload");
assert(index.files.renderStages.some((item) => item.includes("003-feature-module-001-start")), "generated index should include per-module start payload");
assert(index.files.renderStages.some((item) => item.includes("004-feature-module-001-row-001")), "generated index should include per-interface row payload");
assert(index.files.renderStages[index.files.renderStages.length - 1].includes("999-finalize"), "generated index should end with finalize payload");
assert(index.scriptSizeLimitChars === 25000, "generated index should declare 25k script size limit");
assert(index.runnerVersion, "generated index should declare runner version");
assert(generatedRender.includes("bootstrap"), "generated first render payload should be bootstrap");
assert(generatedRender.includes("function __pathFrom"), "generated renderer should resolve manifest slots by template child path before geometry");
assert(generatedRender.includes("function __byPath"), "generated renderer should mirror template node paths into the cloned board");
assert(generatedRender.includes("payloadRunnerRuntime"), "bootstrap should persist shared runtime for later payloads");
assert(generatedRender.includes("featureInterfaceRow"), "runtime should support per-interface row rendering");
assert(generatedRender.includes("llm wireframe slot"), "runtime should create LLM wireframe slots instead of drawing generic wireframes");
assert(generatedRender.includes("llm note slot"), "runtime should create LLM note slots instead of hand-drawing note labels");
assert(generatedRender.includes("official-template-scaffold-with-llm-content"), "runtime should record scaffold render mode");
assert(generatedRender.includes("semanticReviewRequired"), "runtime should require semantic review");
assert(generatedOverview.includes("payloadRunnerRuntime"), "later payloads should load shared runtime");
assert(!generatedOverview.includes("function __pathFrom"), "later payloads should not repeat full runtime source");
assert(generatedRender.includes("globalThis.__gipxMain=async function(CONFIG)"), "runtime should expose __gipxMain(CONFIG) through globalThis after eval");
assert(generatedRender.includes("return await globalThis.__gipxMain(CONFIG)"), "bootstrap should pass CONFIG into the exposed runtime entry");
assert(generatedOverview.includes("return await globalThis.__gipxMain(CONFIG)"), "later payloads should pass CONFIG into the exposed runtime entry");
assertBootstrapRuntimeSmoke(generatedRender);
for (const generated of [
  ["generated validator bootstrap", generatedValidator],
  ["generated gate bootstrap", generatedGate]
]) {
  assert(generated[1].length <= 25000, `${generated[0]} exceeds 25k (${generated[1].length})`);
}
assert(generatedValidator.includes("__TARGET_BOARD_ID_AFTER_RENDER__"), "generated validator should keep board id placeholder");
assert(generatedGate.includes("__TARGET_BOARD_ID_AFTER_RENDER__"), "generated gate should keep board id placeholder");
assertFigmaScriptSyntax(generatedRender, "generated render");
assertFigmaScriptSyntax(generatedValidator, "generated validator");
assertFigmaScriptSyntax(generatedGate, "generated gate");
const firstPageOnlyPayload = getNextFigmaPayload(runDir);
assert(!("code" in firstPageOnlyPayload), "figma-next default should not return inline code");
assert(firstPageOnlyPayload.codeFile && fs.existsSync(firstPageOnlyPayload.codeFile), "figma-next default should return a materialized codeFile");
assert(firstPageOnlyPayload.chars > 0 && firstPageOnlyPayload.bytes >= firstPageOnlyPayload.chars, "figma-next should return chars and bytes");
assert(firstPageOnlyPayload.transferRule.includes("nodeRepl"), "figma-next should explain nodeRepl direct transfer");
assert(fs.readFileSync(firstPageOnlyPayload.codeFile, "utf8").includes("__TARGET_BOARD_ID_AFTER_RENDER__"), "page-only bootstrap should carry the board id placeholder until a board exists");
recordFigmaPayloadResult(runDir, { status: "pass", boardId: "1353:1273" });
const secondPageOnlyPayload = getNextFigmaPayload(runDir);
assert(secondPageOnlyPayload.step === 2, "figma-next should advance to overview after bootstrap record");
const secondPageOnlyCode = fs.readFileSync(secondPageOnlyPayload.codeFile, "utf8");
assert(secondPageOnlyCode.includes('"targetBoardId":"1353:1273"'), "overview payload should inject recorded board id instead of relying on current page session");
assert(!secondPageOnlyCode.includes("__TARGET_BOARD_ID_AFTER_RENDER__"), "overview payload should not keep unresolved board id placeholder after bootstrap record");

const prepareRunDir = fs.mkdtempSync(path.join(os.tmpdir(), "gipx-prepare-"));
const prepareSourcePath = path.join(prepareRunDir, "source-analysis.json");
const prepareModelPath = path.join(prepareRunDir, "source-model.json");
writeUtf8Json(prepareSourcePath, makeValidSourceAnalysis());
writeUtf8Json(prepareModelPath, model);
prepareRun(prepareRunDir, prepareSourcePath, prepareModelPath, { targetBoardId: "123:456" });
const preparedState = readUtf8Json(path.join(prepareRunDir, "run-state.json"));
assert(preparedState.currentStage === "official_render_required", "prepare should finish at official_render_required");
const preparedValidator = fs.readFileSync(path.join(prepareRunDir, preparedState.artifacts.figmaValidatorScript), "utf8");
assert(preparedValidator.includes("123:456"), "prepare should inject provided target board id");
assert(Array.isArray(preparedState.artifacts.figmaRenderStageScripts) && preparedState.artifacts.figmaRenderStageScripts.length >= 5, "prepare should record render stage scripts");
assert(Array.isArray(preparedState.artifacts.figmaRenderPayloads) && preparedState.artifacts.figmaRenderPayloads.length >= 5, "prepare should record render payload scripts");
const nextPayload = getNextFigmaPayload(prepareRunDir);
assert(nextPayload.ok && !nextPayload.done, "figma-next should return the next executable payload");
assert(!("code" in nextPayload), "figma-next default should return metadata without inline code");
assert(nextPayload.codeFile && fs.existsSync(nextPayload.codeFile), "figma-next should return a transfer codeFile");
assert(fs.readFileSync(nextPayload.codeFile, "utf8").includes("Direct payload batch"), "figma-next codeFile should contain executable script text");
const inlinePayload = getNextFigmaPayload(prepareRunDir, { inlineCode: true });
assert(inlinePayload.code.includes("Direct payload batch"), "figma-next --inline-code should return script text as fallback");
recordFigmaPayloadResult(prepareRunDir, { status: "pass", boardId: "123:456" });
const executionState = readUtf8Json(path.join(prepareRunDir, "figma-execution-state.json"));
assert(executionState.currentIndex === 1, "figma-record should advance the payload queue");
assert(executionState.boardId === "123:456", "figma-record should preserve the board id for later validator/gate payloads");

Promise.all(asyncAssertions).then(() => {
  console.log("render payload builder tests passed");
}).catch((error) => {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
});

function assertFigmaScriptSyntax(source, label) {
  try {
    // Figma use_figma scripts are evaluated in an async wrapper with top-level return.
    new Function(`return (async function(){\n${source}\n})`);
  } catch (error) {
    throw new Error(`${label} script syntax failed: ${error.message}`);
  }
}

function assertBootstrapRuntimeSmoke(source) {
  const shared = {};
  const page = {
    id: "299:1168",
    type: "PAGE",
    children: [],
    setSharedPluginData(ns, key, value) { shared[`${ns}:${key}`] = value; },
    getSharedPluginData(ns, key) { return shared[`${ns}:${key}`] || ""; }
  };
  const figmaMock = {
    root: {
      setSharedPluginData(ns, key, value) { shared[`root:${ns}:${key}`] = value; },
      getSharedPluginData(ns, key) { return shared[`root:${ns}:${key}`] || ""; }
    },
    currentPage: page,
    viewport: { scrollAndZoomIntoView() {} },
    async setCurrentPageAsync(nextPage) { this.currentPage = nextPage; },
    async getNodeByIdAsync(id) {
      if (id === "299:1168") return page;
      return null;
    }
  };
  const smokeGlobal = {};
  const promise = (async () => {
    try {
      const fn = new Function("figma", "globalThis", `return (async function(){\n${source}\n})()`);
      await fn(figmaMock, smokeGlobal);
      throw new Error("bootstrap smoke should stop at missing template in mock Figma");
    } catch (error) {
      const message = String(error && error.message || error);
      assert(!/CONFIG is not defined|__gipxMain is not defined/.test(message), `bootstrap runtime smoke exposed a scope error: ${message}`);
      assert(/template not found|manifest source node not found|targetPageId is not a page/.test(message), `bootstrap runtime smoke failed before expected Figma mock boundary: ${message}`);
    }
  })();
  asyncAssertions.push(promise);
}
