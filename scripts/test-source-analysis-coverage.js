"use strict";

const { validateSourceAnalysis } = require("./validate-source-analysis");
const { validateAnalysisCoverage } = require("./validate-analysis-coverage");
const { validateInteractionModel } = require("./validate-interaction-model");

const AI_PENDING_TAG = "AI\u5f85\u786e\u8ba4";

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeSourceAnalysis() {
  return {
    schemaVersion: "game-interaction-prd-expander/source-analysis/1.0",
    source: { title: "Fixture PRD", type: "docx", path: "fixture.docx" },
    overviewFindings: {
      designProblem: "Players face unclear validation, disabled reasons, and feedback timing during the sell flow.",
      targetPlayers: "Players who use item selling and currency feedback systems.",
      successCriteria: "The board must expose interfaces, flow branches, states, feedback, risks, and AI pending questions."
    },
    keyMechanisms: [
      { id: "SA-MECH-001", title: "Sell loop", description: "Player selects an item and sells it for currency.", evidence: "PRD describes selling selected items for currency.", importance: "critical" },
      { id: "SA-MECH-002", title: "Validation", description: "System validates sellable state before confirming.", evidence: "PRD says invalid items cannot be sold.", importance: "critical" },
      { id: "SA-MECH-003", title: "Feedback", description: "System gives result feedback after sell succeeds.", evidence: "PRD mentions received currency feedback.", importance: "critical" }
    ],
    interfaceCandidates: [
      { id: "SA-IF-001", title: "Sell panel", description: "Inventory and selected item detail screen.", evidence: "PRD describes selecting item before selling." },
      { id: "SA-IF-002", title: "Result feedback", description: "Toast or dialog showing sell result.", evidence: "PRD describes result feedback after success." }
    ],
    flowCandidates: [
      { id: "SA-FLOW-001", title: "Main sell", description: "Open panel, select item, confirm, receive feedback.", evidence: "PRD describes main sell operation." },
      { id: "SA-FLOW-002", title: "Invalid branch", description: "Invalid item shows disabled reason and blocks submit.", evidence: "PRD lists invalid sell states." }
    ],
    statesAndFeedback: [
      { id: "SA-STATE-001", title: "Disabled state", description: "Invalid item appears disabled with reason.", evidence: "PRD lists invalid sell states." },
      { id: "SA-STATE-002", title: "Success feedback", description: "Success feedback shows granted currency.", evidence: "PRD mentions currency feedback." }
    ],
    risksAndGaps: [
      { id: "SA-RISK-001", title: "Missing disabled copy", description: "Source does not define disabled reason display.", evidence: "PRD has no disabled reason copy." }
    ],
    aiPendingQuestions: [
      { id: "SA-AI-001", title: "Need disabled copy confirmation", description: "Need to confirm player-facing copy for invalid sell states.", evidence: "Invalid state exists but copy is missing." }
    ]
  };
}

function makeModel() {
  return {
    schemaVersion: "game-interaction-prd-expander/interaction-model/1.0",
    overview: {
      problem: "Players may not understand validation failure, disabled states, and result feedback timing in the sell flow.",
      targetAudience: "Players using item selling.",
      expectedEffect: "Reduce confusion around sell validation and feedback."
    },
    featureModules: [
      {
        id: "MOD-001",
        title: "Sell",
        subsections: [
          {
            id: "SUB-001",
            title: "Item Selection",
            interfaces: [
              {
                id: "IF-001",
                title: "Sell Panel",
                wireframe: {
                  surface: "panel",
                  surfaceType: "selection",
                  layoutIntent: "selection",
                  primaryTask: "Select inventory item and sell it.",
                  regions: [{ id: "EL-list", type: "list", role: "inventory", title: "Inventory", items: ["Item"] }],
                  controls: [{ id: "EL-confirm", type: "primaryButton", role: "confirm", label: "Sell" }],
                  states: [{ id: "EL-disabled", type: "disabled", visualTarget: "EL-confirm", name: "Invalid" }],
                  feedback: [{ id: "EL-feedback", type: "toast", title: "Success" }]
                },
                notes: [
                  { tag: AI_PENDING_TAG, targetElementId: "EL-disabled", body: "Confirm disabled reason copy.", coverage: ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback", "aiPending"], basis: "inferredGap", evidence: "Source does not define disabled copy." }
                ]
              },
              {
                id: "IF-002",
                title: "Result Feedback",
                wireframe: {
                  surface: "toast",
                  surfaceType: "successFeedback",
                  layoutIntent: "successFeedback",
                  primaryTask: "Show sell result feedback.",
                  regions: [{ id: "EL-result", type: "detail", role: "result", title: "Result", items: ["Currency"] }],
                  controls: [{ id: "EL-close", type: "secondaryButton", role: "close", label: "Close" }],
                  states: [{ id: "EL-success", type: "success", visualTarget: "EL-result", name: "Granted" }],
                  feedback: [{ id: "EL-toast", type: "toast", title: "Received" }]
                },
                notes: [
                  { tag: AI_PENDING_TAG, targetElementId: "EL-toast", body: "Confirm amount format.", coverage: ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback", "aiPending"], basis: "designRisk", evidence: "Source omits display format." }
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
        title: "Main Sell",
        nodes: [
          { id: "NODE-001", title: "Open sell panel", interfaceId: "IF-001" },
          { id: "NODE-002", title: "Confirm sell", interfaceId: "IF-001" },
          { id: "NODE-003", title: "Show feedback", interfaceId: "IF-002" }
        ],
        edges: [
          { from: "NODE-001", to: "NODE-002", label: "select valid item", relationshipType: "navigation", evidence: "PRD main flow." },
          { from: "NODE-002", to: "NODE-003", label: "validation passes", relationshipType: "systemFeedback", evidence: "PRD success feedback." }
        ]
      },
      {
        flowId: "FLOW-002",
        title: "Invalid Branch",
        nodes: [
          { id: "NODE-004", title: "Select invalid item", interfaceId: "IF-001" },
          { id: "NODE-005", title: "Show disabled reason", interfaceId: "IF-001" }
        ],
        edges: [
          { from: "NODE-004", to: "NODE-005", label: "invalid item", relationshipType: "branchDecision", evidence: "PRD invalid state." }
        ]
      }
    ],
    sourceCoverage: [
      { sourceId: "SA-MECH-001", mappedTo: ["MOD-001", "IF-001", "FLOW-001"], coverageType: "module", rationale: "Main sell loop maps to sell module and flow." },
      { sourceId: "SA-MECH-002", mappedTo: ["IF-001", "EL-disabled"], coverageType: "wireframe", rationale: "Validation maps to disabled state." },
      { sourceId: "SA-MECH-003", mappedTo: ["IF-002", "EL-toast"], coverageType: "wireframe", rationale: "Feedback maps to result toast." },
      { sourceId: "SA-IF-001", mappedTo: ["IF-001"], coverageType: "interface", rationale: "Sell panel maps to IF-001." },
      { sourceId: "SA-IF-002", mappedTo: ["IF-002"], coverageType: "interface", rationale: "Result feedback maps to IF-002." },
      { sourceId: "SA-FLOW-001", mappedTo: ["FLOW-001", "NODE-001", "NODE-002", "NODE-003"], coverageType: "flow", rationale: "Main sell maps to FLOW-001." },
      { sourceId: "SA-FLOW-002", mappedTo: ["FLOW-002", "NODE-004", "NODE-005"], coverageType: "flow", rationale: "Invalid branch maps to FLOW-002." },
      { sourceId: "SA-STATE-001", mappedTo: ["EL-disabled"], coverageType: "wireframe", rationale: "Disabled state maps to EL-disabled." },
      { sourceId: "SA-STATE-002", mappedTo: ["EL-toast"], coverageType: "wireframe", rationale: "Success feedback maps to EL-toast." },
      { sourceId: "SA-RISK-001", mappedTo: ["IF-001", "EL-disabled"], coverageType: "aiPending", rationale: "Missing disabled copy maps to AI note." },
      { sourceId: "SA-AI-001", mappedTo: ["IF-001", "EL-disabled"], coverageType: "aiPending", rationale: "AI question maps to disabled state." }
    ]
  };
}

const source = makeSourceAnalysis();
const sourceReport = validateSourceAnalysis(source);
assert(sourceReport.passed, `valid source analysis should pass: ${JSON.stringify(sourceReport.issues)}`);

const model = makeModel();
const coverageReport = validateAnalysisCoverage(source, model);
assert(coverageReport.passed, `valid coverage should pass: ${JSON.stringify(coverageReport.issues)}`);

const thinSource = makeSourceAnalysis();
thinSource.interfaceCandidates = thinSource.interfaceCandidates.slice(0, 1);
const thinReport = validateSourceAnalysis(thinSource);
assert(!thinReport.passed, "thin source-analysis should fail");
assert(thinReport.issues.some((issue) => issue.code === "SOURCE_SECTION_TOO_THIN"), "thin source should report SOURCE_SECTION_TOO_THIN");

const noCoverage = makeModel();
noCoverage.sourceCoverage = [];
const noCoverageReport = validateAnalysisCoverage(source, noCoverage);
assert(!noCoverageReport.passed, "model with no sourceCoverage should fail");
assert(noCoverageReport.issues.some((issue) => issue.code === "SOURCE_COVERAGE_MISSING"), "missing coverage should report SOURCE_COVERAGE_MISSING");

const badRef = makeModel();
badRef.sourceCoverage[0].mappedTo = ["IF-999"];
const badRefReport = validateAnalysisCoverage(source, badRef);
assert(!badRefReport.passed, "coverage with missing model ref should fail");
assert(badRefReport.issues.some((issue) => issue.code === "COVERAGE_MODEL_REF_NOT_FOUND"), "bad ref should report COVERAGE_MODEL_REF_NOT_FOUND");

const backgroundFlow = makeModel();
backgroundFlow.flows.push({
  flowId: "FLOW-003",
  title: "每日价格刷新",
  playerParticipation: "system",
  nodes: [{ id: "NODE-006", title: "后台刷新价格", interfaceId: "IF-001" }],
  edges: []
});
const backgroundReport = validateInteractionModel(backgroundFlow);
assert(!backgroundReport.passed, "background mechanism should not pass as a player flow");
assert(backgroundReport.issues.some((issue) => issue.code === "BACKGROUND_MECHANISM_AS_FLOW"), "background flow should report BACKGROUND_MECHANISM_AS_FLOW");

console.log("source analysis coverage tests passed");
