// Static contract tests for the manifest Figma pipeline.
// This catches accidental removal of P0 guardrails before running Figma.

const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const read = (relative) => fs.readFileSync(path.join(root, relative), "utf8");
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const manifest = JSON.parse(read("assets/krad-template/template-manifest.json"));
const renderer = read("scripts/render-brief-board.js");
const validator = read("scripts/figma-board-validator.js");
const gate = read("scripts/verify-official-board.js");
const skill = read("SKILL.md");
const protocol = read("references/figma-execution-protocol.md");
const workflow = read("references/workflow-contracts.md");
const run = read("scripts/run.js");
const sourceValidator = read("scripts/validate-source-analysis.js");
const modelValidator = read("scripts/validate-interaction-model.js");
const coverageValidator = read("scripts/validate-analysis-coverage.js");
const payloadBuilder = read("scripts/build-render-payload.js");
const figmaScriptGenerator = read("scripts/generate-figma-scripts.js");

for (const contract of [
  "contracts/source-analysis.contract.json",
  "contracts/interaction-model.contract.json",
  "contracts/coverage.contract.json",
  "contracts/flow.contract.json",
  "contracts/wireframe.contract.json",
  "contracts/note.contract.json",
  "contracts/ai-pending.contract.json",
  "contracts/render.contract.json"
]) {
  const parsed = JSON.parse(read(contract));
  assert(parsed.schemaVersion, `${contract} missing schemaVersion`);
  assert(parsed.concern || parsed.purpose, `${contract} missing concern/purpose`);
}

assert(manifest.official_pipeline.renderer_version === "manifest-renderer-v0.9", "manifest renderer version mismatch");
assert(manifest.official_pipeline.validator_version === "manifest-validator-v1.0", "manifest validator version mismatch");
assert(manifest.official_pipeline.official_gate_version === "official-board-gate-v0.6", "manifest gate version mismatch");

assert(renderer.includes("const RENDERER_VERSION = \"manifest-renderer-v0.9\""), "renderer version constant missing");
assert(figmaScriptGenerator.includes("scaffold-llm-content"), "generated renderer script hash should use scaffold LLM content mode");
assert(figmaScriptGenerator.includes("llm wireframe slot"), "generated renderer must create LLM wireframe slots");
assert(figmaScriptGenerator.includes("llm note slot"), "generated renderer must create LLM note slots");
assert(figmaScriptGenerator.includes("llm flow diagram slot"), "generated renderer must create LLM flow slots");
assert(figmaScriptGenerator.includes("official-template-scaffold-with-llm-content"), "generated renderer must record scaffold render mode");
assert(figmaScriptGenerator.includes("semanticReviewRequired"), "generated renderer must require semantic review");
assert(renderer.includes("expectedWireframeCount"), "renderer must write expected wireframe count");
assert(renderer.includes("assertNoForbiddenFallbackNodes"), "renderer must scan forbidden fallback nodes");
assert(renderer.includes("RENDERER_SCRIPT_HASH"), "renderer must write script hash");
assert(renderer.includes("normalizeRawRightNote"), "renderer must normalize text/body right-side notes");
assert(renderer.includes("normalizeFlowEdges"), "renderer must honor explicit and branch flow edges");
assert(renderer.includes("REQUIRED_ANALYSIS_SCHEMA_VERSION"), "renderer must require official render payload schema");
assert(renderer.includes("scripts/build-render-payload.js"), "renderer must reject hand-assembled payloads");

assert(validator.includes("manifest-validator-v1.0"), "validator version missing");
assert(validator.includes("VALIDATOR_SCRIPT_HASH"), "validator script hash missing");
assert(validator.includes("validateForbiddenFallbackNodes"), "validator must detect fallback nodes");
assert(validator.includes("validateActualWireframes"), "validator must inspect actual wireframes");
assert(validator.includes("llm-wireframe-slot-scan"), "validator must report LLM wireframe slot check");
assert(validator.includes("llm-note-slot-scan"), "validator must report LLM note slot check");
assert(validator.includes("WIREFRAME_TEXT_ONLY"), "validator must fail text-only wireframes");
assert(validator.includes("SEMANTIC_REVIEW_NOT_REQUIRED"), "validator must require semantic review");
assert(validator.includes("WIREFRAME_PLACEHOLDER_REMAINS"), "validator must fail visible prototype placeholder");
assert(validator.includes("WIREFRAME_NOT_RENDERED"), "validator must fail empty wireframes");
assert(validator.includes("FORBIDDEN_FALLBACK_NODE_PRESENT"), "validator must fail fallback nodes");
assert(validator.includes("semantic-note-tag-scan"), "validator must report semantic note check");
assert(validator.includes("flow-edge-integrity-scan"), "validator must report flow edge integrity check");

assert(gate.includes("official-board-gate-v0.6"), "gate version missing");
assert(gate.includes("requiredRendererScriptHash"), "gate must require renderer script hash");
assert(gate.includes("requiredValidatorScriptHash"), "gate must require validator script hash");
assert(gate.includes("VALIDATOR_CHECKS_MISSING"), "gate must require validator check list");
assert(gate.includes("CODEX_LOCAL_RECORD_PRESENT"), "gate must reject fallback codexLocalRecord boards");
assert(gate.includes("validateActualBoardState"), "gate must rescan actual board state");
assert(run.includes("validate-source"), "run.js must expose validate-source stage");
assert(run.includes("validate-model"), "run.js must expose validate-model stage");
assert(run.includes("validate-coverage"), "run.js must expose validate-coverage stage");
assert(run.includes("prepare"), "run.js must expose prepare command");
assert(run.includes("source_analysis_validated"), "run.js must gate source_analysis_validated stage");
assert(run.includes("build-payload"), "run.js must expose build-payload stage");
assert(run.includes("coverage_validated"), "run.js must gate coverage_validated stage");
assert(run.includes("payload_ready"), "run.js must gate payload_ready stage");
assert(run.includes("render-ready"), "run.js must gate render-ready stage");
assert(run.includes("generate-figma-scripts"), "run.js must expose generated Figma script stage");
assert(run.includes("official_render_required"), "run.js must require official Figma rendering after script generation");
assert(run.includes("figma-next"), "run.js must expose figma-next payload reader");
assert(run.includes("--inline-code"), "run.js must expose inline-code fallback for figma-next");
assert(run.includes("codeFile"), "run.js must return codeFile for direct payload transfer");
assert(run.includes("chars") && run.includes("bytes"), "run.js must report payload chars and bytes");
assert(run.includes("figma-record"), "run.js must expose figma-record progress recorder");
assert(run.includes("figma-execution-state.json"), "run.js must persist Figma execution progress");
assert(sourceValidator.includes("validateSourceAnalysis"), "source validator must export validateSourceAnalysis");
assert(sourceValidator.includes("SOURCE_SECTION_TOO_THIN"), "source validator must reject thin source analysis");
assert(sourceValidator.includes("SOURCE_ITEM_FIELD_MISSING"), "source validator must require source item fields");
assert(sourceValidator.includes("SOURCE_ITEM_EVIDENCE_TOO_THIN"), "source validator must require traceable source evidence");
assert(modelValidator.includes("validateInteractionModel"), "model validator must export validateInteractionModel");
assert(modelValidator.includes("FLOW_EDGE_TO_NOT_FOUND"), "model validator must validate flow edge refs");
assert(modelValidator.includes("NOTE_TARGET_NOT_FOUND"), "model validator must validate note target refs");
assert(modelValidator.includes("AI_PENDING_MISSING_IN_MODULE"), "model validator must require AI pending per module");
assert(modelValidator.includes("NOTE_COVERAGE_INCOMPLETE"), "model validator must require complete interface note coverage");
assert(modelValidator.includes("BACKGROUND_MECHANISM_AS_FLOW"), "model validator must reject background mechanisms as player flows");
assert(!modelValidator.includes("WIREFRAME_LAYOUT_INTENT_MISSING"), "model validator must not require renderer-owned layoutIntent");
assert(modelValidator.includes("FLOW_NODE_TARGET_MISSING"), "model validator must allow interfaceId or stateId flow targets");
assert(coverageValidator.includes("validateAnalysisCoverage"), "coverage validator must export validateAnalysisCoverage");
assert(coverageValidator.includes("SOURCE_COVERAGE_MISSING"), "coverage validator must require sourceCoverage");
assert(coverageValidator.includes("COVERAGE_MODEL_REF_NOT_FOUND"), "coverage validator must fail missing model refs");
assert(coverageValidator.includes("MODEL_INTERFACE_COVERAGE_TOO_THIN"), "coverage validator must compare source and model interface counts");
assert(coverageValidator.includes("MODEL_FLOW_COVERAGE_TOO_THIN"), "coverage validator must compare source and model flow counts");
assert(payloadBuilder.includes("buildRenderPayload"), "payload builder must export buildRenderPayload");
assert(payloadBuilder.includes("render-payload/1.0"), "payload builder must write render payload schema");
assert(payloadBuilder.includes("modelSummary"), "payload builder must write summary counts for validator parity");
assert(payloadBuilder.includes("sourceCoverage"), "payload builder must preserve source coverage summary");
assert(figmaScriptGenerator.includes("generateFigmaScripts"), "Figma script generator must export generateFigmaScripts");
assert(figmaScriptGenerator.includes("RUNNER_VERSION"), "Figma script generator must declare payload runner version");
assert(figmaScriptGenerator.includes("buildRenderPayloadFiles"), "Figma script generator must build direct render payloads");
assert(figmaScriptGenerator.includes("figma-render.payload-"), "Figma script generator must write direct render payload scripts");
assert(figmaScriptGenerator.includes("flattenModuleInterfaces"), "Figma script generator must split feature modules into interface-row payloads");
assert(figmaScriptGenerator.includes("featureInterfaceRow"), "Figma script generator must render 4.0 by interface row");
assert(figmaScriptGenerator.includes("compactInterfaceForRender"), "Figma script generator must preserve complete interface payloads for rendering");
assert(figmaScriptGenerator.includes("compactWireframeForRender"), "Figma script generator must compact wireframe payloads for transport");
assert(figmaScriptGenerator.includes("controls: copyRenderArray"), "Figma script generator must preserve wireframe controls");
assert(figmaScriptGenerator.includes("states: copyRenderArray"), "Figma script generator must preserve wireframe states");
assert(figmaScriptGenerator.includes("feedback: copyRenderArray"), "Figma script generator must preserve wireframe feedback");
assert(figmaScriptGenerator.includes("llm note slot"), "Figma script generator must expose right-side note slots for LLM content");
assert(figmaScriptGenerator.includes("TEMPLATE_RESIDUE_VISIBLE"), "Figma script generator validator must fail visible template residue");
assert(figmaScriptGenerator.includes("BOARD_HEIGHT_TOO_SHORT"), "Figma script generator validator must fail board-height clipping");
assert(figmaScriptGenerator.includes("NOTES_NOT_RENDERED"), "Figma script generator validator must fail missing right-side notes");
assert(figmaScriptGenerator.includes("sourceCoverageCount"), "Figma script generator must not pass full sourceCoverage into finalize scripts");
assert(figmaScriptGenerator.includes("payloadRunnerRuntime"), "Figma script generator must store shared runtime instead of repeating it in every payload");
assert(figmaScriptGenerator.includes("globalThis.__gipxMain"), "Figma script generator must expose runtime entry through globalThis after eval");
assert(figmaScriptGenerator.includes("renderStages"), "Figma script generator must list staged render scripts");
assert(figmaScriptGenerator.includes("feature-module") && figmaScriptGenerator.includes("row-"), "Figma script generator must split 4.0 by feature module and interface row");
assert(figmaScriptGenerator.includes("renderer_transport_failed"), "Figma script generator must fail closed on transport errors");
assert(figmaScriptGenerator.includes("MAX_FIGMA_SCRIPT_CHARS = 25000"), "Figma script generator must cap each generated script at 25k");
assert(figmaScriptGenerator.includes("figma-validator.generated.js"), "Figma script generator must write validator script");
assert(figmaScriptGenerator.includes("figma-gate.generated.js"), "Figma script generator must write gate script");
assert(figmaScriptGenerator.includes("__TARGET_BOARD_ID_AFTER_RENDER__"), "Figma script generator must preserve board id placeholder");

for (const doc of [skill, protocol]) {
  assert(doc.includes("manifest-renderer-v0.9"), "docs must reference renderer v0.9");
  assert(doc.includes("source-analysis.json"), "docs must require source-analysis.json");
  assert(doc.includes("validate-coverage"), "docs must include coverage validation stage");
}
assert(skill.includes("workflow-contracts.md"), "SKILL must link workflow-contracts.md");
assert(skill.includes("sourceCoverage[]"), "SKILL must require sourceCoverage mappings");
assert(skill.includes("nodeRepl"), "SKILL must prefer direct nodeRepl payload transfer when available");
assert(skill.includes("LLM owns"), "SKILL must define LLM ownership of semantic/design work");
assert(skill.includes("--inline-code"), "SKILL must document inline-code as fallback only");
assert(skill.includes("codeFile"), "SKILL must document codeFile direct transfer");
assert(protocol.includes("run-state.json.currentStage"), "Figma protocol must require render_ready run-state");
assert(protocol.includes("analysis-coverage.validation.json"), "Figma protocol must require coverage validation");
assert(protocol.includes("render-payload.json"), "Figma protocol must require render-payload.json");
assert(protocol.includes("payload"), "Figma protocol must mention generated render payload scripts");
assert(protocol.includes("nodeRepl"), "Figma protocol must document direct nodeRepl payload transfer");
assert(protocol.includes("codeFile") && protocol.includes("chars") && protocol.includes("bytes"), "Figma protocol must document codeFile/chars/bytes metadata");
assert(protocol.includes("--inline-code"), "Figma protocol must document inline-code fallback");
assert(protocol.includes("SyntaxError"), "Figma protocol must warn that passing a path to use_figma causes SyntaxError");
assert(protocol.includes("Do not pass local file paths"), "Figma protocol must forbid local file path transport");
assert(protocol.includes("figma-next"), "Figma protocol must use figma-next to return script text");
assert(protocol.includes("figma-record"), "Figma protocol must use figma-record to advance execution");
assert(protocol.includes("Interaction Designer Review") && protocol.includes("Player Review"), "Figma protocol must require dual semantic review");
assert(workflow.includes("source_analysis_validated"), "workflow must document source analysis stage");
assert(workflow.includes("coverage_validated"), "workflow must document coverage stage");
assert(workflow.includes("contracts/flow.contract.json"), "workflow must link flow contract");
assert(workflow.includes("sourceCoverage[]"), "workflow must document sourceCoverage");
assert(workflow.includes("render-payload.json"), "workflow must document render payload artifact");
assert(workflow.includes("official_render_required"), "workflow must document official render required stage");
assert(workflow.includes("codeFile") && workflow.includes("--inline-code"), "workflow must document direct transfer metadata and inline fallback");
assert(workflow.includes("AI待确认"), "workflow must mention AI pending contract");

console.log("contract tests passed");
