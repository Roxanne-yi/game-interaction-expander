# Figma Execution Protocol

Use this protocol whenever the skill writes a Figma pre-brief board. It is a manifest-enforced workflow, not optional advice.

Before Figma rendering, complete the contract workflow:

```bash
node scripts/run.js prepare <run-dir> <source-analysis.json> <interaction-model.json> --target-page-id <figma-page-id>
```

For debugging only, run the stages separately:

```bash
node scripts/run.js init <run-dir> <source-analysis.json> <interaction-model.json>
node scripts/run.js validate-source <run-dir>
node scripts/run.js validate-model <run-dir>
node scripts/run.js validate-coverage <run-dir>
node scripts/run.js build-payload <run-dir>
node scripts/run.js render-ready <run-dir>
node scripts/run.js generate-figma-scripts <run-dir> --target-page-id <figma-page-id>
```

Do not run the Figma renderer from an unvalidated source analysis/model pair. The renderer may use only generated scripts under `run-dir/figma-scripts/`, generated from `run-dir/render-payload.json`, and only after `run-state.json.currentStage` is `official_render_required`.

## Official Records

A board is official only when all records match:

- `renderRecord.rendererVersion = manifest-renderer-v0.9`
- `renderRecord.scriptHash = render-brief-board:scaffold-llm-content:2026-06-24`
- `lastValidation.validatorVersion = manifest-validator-v1.0`
- `lastValidation.scriptHash = figma-board-validator:scaffold-llm-content:2026-06-24`
- `officialGate.gateVersion = official-board-gate-v0.6`
- `officialGate.passed = true`
- `renderRecord.semanticReviewRequired = true`

The board must also store manifest shared data under `game_interaction_prd_expander/manifest`.

## Renderer Payload

Build the renderer payload from the validated interaction model with `scripts/build-render-payload.js`, after `analysis-coverage.validation.json` passes. Keep renderer payload structural:

- `overview` comes from product meaning and version history.
- `flows` comes from validated flow nodes and edges.
- `featureModules` comes from validated modules, interfaces, wireframe design briefs, and notes.
- `redDot` is included only when in scope.
- `extension` is included only for true out-of-scope 5.0 content.

Do not place template style decisions in the payload. Styles come from the manifest and cloned template nodes.
Do not hand-assemble, patch, or fallback-generate the payload in the Figma generation step.

## Rendering Rules

Run only generated scripts through `use_figma`. Do not pass local file paths to `use_figma`.

`figma-next` default output must be metadata only: `codeFile`, `chars`, `bytes`, and `transferRule`. It must not return inline `code` unless called with `--inline-code`.

Prefer direct payload transfer when the environment provides a runner/nodeRepl/read-payload bridge:

- Read `codeFile` as a UTF-8 string and pass that exact string into `use_figma.code`.
- Treat `${next.chars}` chars / `${next.bytes}` bytes as expected for direct transfer.
- Do not skip, downgrade, rewrite, split again, or use a fallback because the payload is large.
- Do not paste payload into normal reasoning text.
- Do not base64/fetch/use hidden UI/change transport route.
- Do not pass `codeFile` itself as the value of `use_figma.code`; `use_figma` accepts JavaScript source text only. If passing a path causes a JS `SyntaxError`, that is expected from transport misuse and is not a renderer failure.
- Still record each result with `figma-record` so later batches receive the real board id.

If direct payload transfer is unavailable, use inline code only as fallback:

Repeat this runner loop until `done = true`:

1. Run `node scripts/run.js figma-next <run-dir>`.
2. Read the returned `codeFile`, `chars`, `bytes`, and `transferRule`.
3. Read `codeFile` through nodeRepl/read-payload and pass the file contents, not the path, to `use_figma`.
4. Run `node scripts/run.js figma-record <run-dir> --status pass --board-id <boardId>` when `use_figma` succeeds. Use the returned board id when present; otherwise reuse the existing board id.
5. If `use_figma` fails, run `node scripts/run.js figma-record <run-dir> --status fail --message <error>` and stop with `renderer_transport_failed`.

Only when the environment has no direct-transfer bridge, run `node scripts/run.js figma-next <run-dir> --inline-code` and pass the returned `code` string to `use_figma`. Inline code is a fallback, not the default path.

Every generated Figma script is capped at 25k characters before it is written. Render payloads are direct executable batches, not renderer-source chunks and not Figma-side source assembly. Payloads write by template section: bootstrap/clone template, 1.0 overview, 3.0 flow scaffold slots, 4.0 module start plus one interface row scaffold per script, and finalize. If any payload fails, stop with `renderer_transport_failed`; do not create a substitute board.

Script-size limits are never a reason to thin interaction content. Preserve full wireframe controls, states, feedback, modal, toast, right-side notes, and AI待确认 content; split into more row-level batches when needed.

The bootstrap payload installs the shared renderer runtime into Figma shared data. Later payloads must load that shared runtime instead of repeating the full runtime source. This keeps `--inline-code` fallback viable when nodeRepl/read-payload direct transfer is unavailable.

If `--target-board-id` was not passed to `prepare`, do not edit validator or gate files by hand. The runner injects the recorded board id into the returned `code` text for validator and gate steps.

Before running:

- Read `assets/krad-template/template-manifest.json`.
- Confirm generated scripts exist under `run-dir/figma-scripts/`.
- Confirm `run-state.json.currentStage` is `official_render_required`.
- Confirm `figma-scripts.index.json` lists `renderPayloads`, `validator`, `gate`, and `scriptSizeLimitChars = 25000`.
- Use `figma-next` / `figma-record`; do not open payload files manually unless debugging.

The official scaffold renderer must:

- Clone the manifest template from `manifest.source_template.node_id`.
- Resolve editable slots from the manifest.
- Keep exactly one global `1.0`, `2.0`, `3.0`, and `4.0` section.
- Fill the top header text only; never change header/floating-bar style.
- Keep `1.0` in the asymmetric template layout.
- Keep `2.0` empty unless adaptation is explicitly in scope.
- Create `3.0` flow-name and diagram slots from validated flow nodes and edges. Template sample connector order is not player logic, and final flow drawing belongs to LLM inside the slot.
- Render every `featureModules[].subsections[].interfaces[]` item as a complete 4.0 interface row.
- Create a left `llm wireframe slot <interfaceId>` inside the template player-screen frame.
- Create a right `llm note slot <interfaceId>` grouped with the owning interface.
- Preserve template title, subtitle, interface-name, numbered-note, discipline-label, and top floating/header styles.
- Hide unused reserved blocks instead of leaving placeholders visible.
- Extend board height and move footer when content grows.
- Push later interface rows and modules down according to actual note/wireframe height; never use fixed-height stacking that can overlap content.

After the scaffold is created, LLM must draw content inside the slots:

- Fill 1.0 product positioning from PRD understanding, not as a shallow feature summary.
- Draw 3.0 as player experience flows with main and branch flows where appropriate.
- Draw 4.0 as player-visible low-fidelity interfaces inside the left slots; do not draw pure text summaries or backend mechanism cards.
- Write 4.0 right-side notes inside the right slots using template discipline tags, numbered text, and red `AI待确认`.
- Reuse or visually match the 4.0 wireframe as the 3.0 node thumbnail for any referenced interface/state.

The renderer must stop when:

- A generated payload does not come from `scripts/build-render-payload.js`.
- A required manifest slot or prototype cannot be resolved.
- Chinese text is damaged into replacement characters, question-mark blocks, or mojibake.
- Required 3.0/4.0 model data is missing.
- A generated payload exceeds the 25k script limit or cannot be executed directly through `use_figma`.

Do not create fallback boards, hand-drawn substitute sections, `codexLocalRecord`, or `manifest-inspired-*` records.

## Validator

Run `run-dir/figma-scripts/figma-validator.generated.js` through `use_figma` after rendering.

Validator input:

- Same manifest used by the renderer.
- Rendered board id as `CONFIG.targetBoardId`.

The validator checks:

- Official renderer version and script hash.
- Manifest shared data.
- One global section each for `1.0`, `2.0`, `3.0`, and `4.0`.
- Header and fixed template areas are preserved.
- `1.0` keeps asymmetric layout.
- Version rows follow first-generation or iteration history.
- `2.0` remains untouched unless in scope.
- `3.0` has flow names, nodes, connectors, and condition labels.
- Rendered flow node/edge counts match the payload.
- Flow names are distinct.
- `4.0` uses template major-title, subtitle, interface-title, left-frame, and note prototypes.
- Rendered interface row count matches the payload.
- Every left frame has an `llm wireframe slot` with player-visible interface content and no visible `原型` placeholder.
- 4.0 wireframes are not text-only, rule-card-only, or repeated generic region labels.
- Right-side notes use template labels and numbered lines.
- Every major module has visible `AI待确认`.
- `AI待确认` uses warning red style.
- Right-side tags match note content instead of copied template defaults.
- Visible template placeholder text such as `注释内容`, `动效描述`, `备注内容（非必须）`, `界面名称`, `原型`, or `副标题` is absent.
- Board height covers all visible content, with footer moved below generated content.
- Footer is near the board bottom without excessive blank space.
- Forbidden fallback nodes and placeholder text are absent.

If validation fails, fix the model/payload/renderer and rerun. Do not manually patch the board around a failed validator.

## Official Gate

Run `run-dir/figma-scripts/figma-gate.generated.js` through `use_figma` after validator pass.

The official gate rechecks records and scans the actual board. If it fails, treat the board as not generated by this skill even when it looks acceptable.

Typical blockers:

- Missing manifest shared data.
- Renderer or validator version mismatch.
- Missing script hash.
- Missing validator check list.
- Fallback renderer names.
- Visible fallback nodes.
- Empty wireframe frames.
- Missing AI pending-confirmation notes.

## Final Review

Script checks are structural. They do not prove the PRD analysis is good.

After official gate pass, still review with `references/output-quality-model.md`:

- Interaction blueprint.
- Basic usability.
- Player-view screenshot.
- Flow ownership.
- Right-side explanation quality.
- AI follow-up quality.
- Source and scope consistency.
- Template and Figma composition.
- Dual Review Gate: Interaction Designer Review and Player Review.

Do not deliver the board until both are true:

- Code validator and official gate pass.
- LLM semantic review passes from both the interaction-designer and player perspectives.

## Final Response

When delivering a Figma board, report:

- Renderer version and status.
- Validator version and status.
- Official gate status.
- Any intentional exception or blocker.

If no Figma board was generated in the current turn, do not report renderer status.
