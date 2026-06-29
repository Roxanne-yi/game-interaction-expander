// Behavioral tests for P1 renderer rules that do not require Figma.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "scripts/render-brief-board.js"), "utf8")
  .replace(/\nreturn await main\(\);\s*$/, `
return {
  normalizeFlowEdges,
  countFlowEdges,
  normalizeRawRightNote,
  normalizeNoteTag,
  isAiPendingTag
};
`);

const loadRendererFunctions = new Function(source);
const {
  normalizeFlowEdges,
  countFlowEdges,
  normalizeRawRightNote,
  normalizeNoteTag,
  isAiPendingTag
} = loadRendererFunctions();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const aiNote = normalizeRawRightNote({
  tag: "策划注意",
  text: "缺少失败态文案，需要策划确认；空状态规则不明确"
});
assert(aiNote.tag === "AI待确认", "missing/unclear note text must become AI待确认");
assert(aiNote.lines.length === 2, "text notes must split into numbered-line source lines");
assert(isAiPendingTag(aiNote.tag), "AI note tag must be recognized");

const programNote = normalizeRawRightNote({
  tag: "策划注意",
  body: "服务端需要校验库存，并同步刷新出售状态"
});
assert(programNote.tag === "程序注意", "server/data note text must become 程序注意");

const uiNote = normalizeRawRightNote("按钮置灰规则和空列表文案需要在界面中表达");
assert(uiNote.tag === "UI注意", "UI note text must infer UI注意");

assert(normalizeNoteTag("动效注意", ["toast 成功反馈"]) === "动效注意", "toast note should stay 动效注意");

const flow = {
  steps: [
    { id: "entry", screenName: "入口", branches: [{ to: "sell", label: "出售" }, { to: "recover", label: "回收" }] },
    { id: "sell", screenName: "出售选择" },
    { id: "recover", screenName: "回收结果" }
  ]
};
const edges = normalizeFlowEdges(flow, flow.steps);
assert(edges.length === 2, "step.branches must create explicit flow edges");
assert(edges.some((edge) => edge.to === "sell" && edge.label === "出售"), "sell branch edge missing");
assert(edges.some((edge) => edge.to === "recover" && edge.label === "回收"), "recover branch edge missing");
assert(countFlowEdges({ flows: [flow] }) === 2, "expected flow edge count must use branch edges");

console.log("P1 renderer behavior tests passed");
