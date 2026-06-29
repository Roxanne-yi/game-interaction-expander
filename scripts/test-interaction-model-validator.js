"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { validateInteractionModel } = require("./validate-interaction-model");
const { writeUtf8Json } = require("./_contract_lib");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function makeValidModel() {
  return {
    schemaVersion: "game-interaction-prd-expander/interaction-model/1.0",
    overview: {
      problem: "玩家需要清楚知道可操作对象和结果反馈。",
      targetAudience: "参与功能的玩家。",
      expectedEffect: "降低理解成本。"
    },
    featureModules: [
      {
        id: "MOD-001",
        title: "核心操作",
        subsections: [
          {
            id: "SUB-001",
            title: "选择与确认",
            interfaces: [
              {
                id: "IF-001",
                title: "操作界面",
                wireframe: {
                  surface: "panel",
                  surfaceType: "primaryOperation",
                  layoutIntent: "primaryOperation",
                  primaryTask: "选择对象并确认操作",
                  regions: [
                    { id: "EL-list", type: "list", role: "inventory", title: "对象列表", items: ["对象 A", "对象 B"] },
                    { id: "EL-detail", type: "detail", role: "detail", title: "对象详情", items: ["状态", "结果"] }
                  ],
                  controls: [
                    { id: "EL-confirm", type: "primaryButton", role: "confirm", label: "确认" }
                  ],
                  states: [
                    { id: "EL-disabled", type: "disabled", visualTarget: "EL-confirm", name: "不可操作置灰" }
                  ],
                  feedback: [
                    { id: "EL-toast", type: "toast", title: "成功反馈" }
                  ]
                },
                notes: [
                  {
                    tag: "策划注意",
                    targetElementId: "EL-confirm",
                    body: "确认前需要校验对象是否仍然有效。",
                    coverage: ["purpose", "moduleComposition", "keyStates", "playerActions", "postActionChanges", "feedback"],
                    basis: "sourceExplicit",
                    evidence: "PRD 明确写到操作前校验。"
                  },
                  {
                    tag: "AI待确认",
                    targetElementId: "EL-disabled",
                    body: "PRD 未说明置灰原因文案，需要确认。",
                    coverage: ["aiPending"],
                    basis: "inferredGap",
                    evidence: "源文档没有不可操作原因展示规则。"
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
        title: "主流程",
        nodes: [
          { id: "NODE-001", title: "进入操作界面", interfaceId: "IF-001" },
          { id: "NODE-002", title: "完成确认", interfaceId: "IF-001" }
        ],
        edges: [
          {
            from: "NODE-001",
            to: "NODE-002",
            label: "点击确认",
            relationshipType: "navigation",
            evidence: "PRD 描述玩家点击确认完成操作。"
          }
        ]
      }
    ]
  };
}

const valid = makeValidModel();
const validReport = validateInteractionModel(valid);
assert(validReport.passed, `valid model should pass: ${JSON.stringify(validReport.issues)}`);
assert(validReport.counts.interfaces === 1, "valid model should count one interface");
assert(validReport.counts.aiPendingNotes === 1, "valid model should count AI pending note");

const badEdge = makeValidModel();
badEdge.flows[0].edges[0].to = "NODE-999";
const badReport = validateInteractionModel(badEdge);
assert(!badReport.passed, "bad edge model should fail");
assert(badReport.issues.some((issue) => issue.code === "FLOW_EDGE_TO_NOT_FOUND"), "bad edge should report FLOW_EDGE_TO_NOT_FOUND");

const badNote = makeValidModel();
badNote.featureModules[0].subsections[0].interfaces[0].notes[0].targetElementId = "EL-missing";
const badNoteReport = validateInteractionModel(badNote);
assert(!badNoteReport.passed, "bad note target should fail");
assert(badNoteReport.issues.some((issue) => issue.code === "NOTE_TARGET_NOT_FOUND"), "bad note should report NOTE_TARGET_NOT_FOUND");

const runDir = fs.mkdtempSync(path.join(os.tmpdir(), "gipx-model-"));
const modelPath = path.join(runDir, "interaction-model.json");
writeUtf8Json(modelPath, valid);
assert(fs.existsSync(modelPath), "writeUtf8Json should write model fixture");

console.log("interaction model validator tests passed");
