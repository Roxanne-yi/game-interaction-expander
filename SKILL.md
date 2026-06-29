---
name: game-interaction-prd-expander
description: Convert game planning documents, Confluence/wiki pages, PDFs, DOCX files, and optional HTML prototypes into interaction-ready Figma pre-briefs. Use when Codex needs to help game interaction designers understand a complex PRD before design work by extracting product intent, main interface structure, player flows, state logic, missing rules, contradictions, design risks, edge cases, red-dot clues, and annotated low-fidelity wireframes in Figma. Treat HTML prototypes as functional evidence, not visual/layout reference, unless the user explicitly says otherwise.
---

# Game Interaction PRD Expander

Turn dense game PRDs into a Figma pre-brief that helps interaction designers understand product intent, player flows, interface structure, states, actions, feedback, and unresolved decisions before design work begins.

This skill is not a final UI generator. It produces interaction analysis boards with usable low-fidelity wireframes and designer-facing notes.

Highest priority: preserve interaction-design content. LLM owns analysis, interpretation, product positioning, player-flow design, low-fidelity interface expression, right-side explanation writing, and AI待确认. Code owns template boundaries, stable section layout, style locks, transport, validator, and gate. Template fidelity must never compress, replace, or flatten the interaction content.

## Reference Routing

Load only the reference needed for the current step. Do not read every reference file at once.

- Starting a run or checking stage order: `references/workflow-contracts.md`
- Building `source-analysis.json`: `references/analysis-checklist.md` and `contracts/source-analysis.contract.json`
- Building `interaction-model.json`: `contracts/interaction-model.contract.json`, plus `contracts/flow.contract.json`, `contracts/wireframe.contract.json`, `contracts/note.contract.json`, and `contracts/ai-pending.contract.json` as needed
- Checking source-to-model coverage: `contracts/coverage.contract.json`
- Preparing Figma output: `references/figma-output-spec.md`
- Writing or validating Figma: `references/figma-execution-protocol.md` and `assets/krad-template/template-manifest.json`
- Improving low-fidelity wireframes: `references/wireframe-design-principles.md`
- Final semantic review only: `references/output-quality-model.md`

Use scripts as the execution source of truth. Read large scripts only when debugging or changing them.

## Workflow

1. Confirm scope and destination.
   - Get the PRD/wiki/DOCX/PDF source and target Figma file/page.
   - Treat HTML prototypes as functional evidence only unless the user explicitly approves visual/layout reuse.

2. Build `source-analysis.json`.
   - Use `references/analysis-checklist.md` to extract PRD facts into source-analysis sections before designing the model.
   - Capture mechanisms, candidate interfaces, candidate flows, states/feedback, risks/gaps, and AI pending questions with evidence.
   - If the source analysis is thin, do not compensate later in Figma; expand the source analysis first.

3. Build `interaction-model.json`.
   - Use PRD facts as source of truth.
   - Model product meaning, player goals, interfaces, flow nodes/edges, wireframe elements, right-side notes, and AI pending-confirmation questions.
   - Treat the model as LLM's design brief, not as renderer geometry. Do not reduce interface design into generic layout fields just to satisfy a script.
   - Add `sourceCoverage[]` entries that map every `source-analysis.json` item to concrete model ids such as `IF-*`, `FLOW-*`, `NODE-*`, and `EL-*`.
   - Do not put renderer geometry or template styling into the model.

4. Validate source analysis, model, and coverage locally before Figma rendering.
   - Prefer `node scripts/run.js prepare <run-dir> <source-analysis.json> <interaction-model.json> [--target-page-id <figma-page-id>]`.
   - For debugging, run the stages separately: `init`, `validate-source`, `validate-model`, `validate-coverage`, `build-payload`, `render-ready`, then `generate-figma-scripts`.
   - Do not run the Figma renderer from an unvalidated model or a hand-assembled payload.

5. Render the Figma board.
   - Before any Figma write, load `references/workflow-contracts.md`, `references/figma-execution-protocol.md`, and `assets/krad-template/template-manifest.json`.
   - Use only generated Figma scripts. Every generated script is capped at 25k characters.
   - Use `node scripts/run.js figma-next <run-dir>` to get `codeFile`, `chars`, `bytes`, and `transferRule`; by default it must not return inline `code`.
   - Prefer direct payload transfer: read `codeFile` through the runner/nodeRepl bridge as a UTF-8 string and pass that string directly into `use_figma.code`.
   - Treat large `chars` / `bytes` as expected for direct transfer. Do not skip, downgrade, rewrite, split again, or use a fallback because a payload is large.
   - Do not paste payload into normal reasoning text, base64 it, fetch it, use hidden UI, or change transport routes.
   - Do not pass the `codeFile` path itself to `use_figma`; `use_figma` accepts JavaScript source text only, and a path causing `SyntaxError` means the transport was misused.
   - If direct payload transfer is unavailable, use `node scripts/run.js figma-next <run-dir> --inline-code` as the only fallback that returns a `code` field, then run `node scripts/run.js figma-record <run-dir> --status pass --board-id <boardId>`.
   - Render payloads write by template section: bootstrap/clone template, 1.0 overview, 3.0 flow slots, 4.0 module/interface slots, then finalize.
   - Generated scripts create official template scaffolds and editable slot bounds. LLM must draw 3.0 flow content and 4.0 wireframes/notes inside those slots; scripts must not replace LLM design with fixed generic layouts.
   - Do not pass local file paths to `use_figma`; use the runner-returned script text. The runner injects the board id for validator/gate steps.
   - Use the manifest template and cloned prototypes.
   - If any payload transport fails, stop and report `renderer_transport_failed`. Do not run old template-lock workflows, custom fallback renderers, or hand-drawn substitute boards.

6. Validate and review.
   - Run `run-dir/figma-scripts/figma-validator.generated.js` through `use_figma`.
   - Run `run-dir/figma-scripts/figma-gate.generated.js` through `use_figma`.
   - Inspect a screenshot and run the semantic review in `references/output-quality-model.md`.
   - The semantic review must include both Interaction Designer Review and Player Review. A structural validator pass alone is not deliverable.

## Official Output

A Figma board is official only when the generated board records all match:

- `renderRecord.rendererVersion = manifest-renderer-v0.9`
- `renderRecord.scriptHash = render-brief-board:scaffold-llm-content:2026-06-24`
- `lastValidation.validatorVersion = manifest-validator-v1.0`
- `lastValidation.scriptHash = figma-board-validator:scaffold-llm-content:2026-06-24`
- `renderRecord.semanticReviewRequired = true`
- `officialGate.passed = true`

If any record is missing, mismatched, manually fabricated, or produced by a fallback renderer, mark the board as failed/not official.

## Encoding

This skill is mostly used with Chinese source documents and Chinese Figma output.

- Save skill files and run artifacts as UTF-8 without BOM with LF line endings.
- Prefer PowerShell for Windows file IO when preparing artifacts manually.
- Use explicit UTF-8 reads/writes: PowerShell `-Encoding utf8`, Node `fs.readFileSync(path, "utf8")` and `fs.writeFileSync(path, text, "utf8")`.
- Do not pipe raw Chinese JSON through shell command strings. Use UTF-8 files or the renderer's base64 fields.
- Stop on replacement characters, question-mark blocks, or mojibake. Rebuild the artifact; do not render a fallback board.

## Non-Negotiables

- Do not let 3.0 flow order come from template sample paths.
- Do not let 3.0 and 4.0 describe different designs. Every player-flow node must trace to a 4.0 interface or state, and every referenced 4.0 node must have a wireframe and notes.
- Do not hide or omit `AI待确认`; every major module needs visible AI pending-confirmation content.
- Do not draw mechanism summaries inside player-visible wireframes.
- Do not compensate for missing player-visible UI with explanatory text.
- Do not truncate right-side notes, wireframe controls, states, feedback, modal, toast, or AI待确认 content for script-size reasons.
- Do not accept line-frame output that is only function names or region labels; every low-fidelity frame must look like a plausible player-visible interface.
- Do not accept overlapping 4.0 rows, fixed-height module stacking, or footer/board height that fails to follow content growth.
- Do not accept validator `passed=true` without exact script hashes and official gate pass.
