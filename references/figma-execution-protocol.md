# Figma Execution Protocol

Use this protocol whenever the skill writes a Figma pre-brief board. The default path is direct LLM drawing in Figma, guided by the template and references. Do not run bundled renderer or validator scripts.

The goal is to keep the old content strength: accurate PRD interpretation, useful low-fidelity interface design, readable player flows, and complete designer-facing notes, while still respecting the template's visual language.

The template manifest in `assets/krad-template/template-manifest.json` is a reference for the template source node, editable areas, and style anchors. It is not a required renderer payload.

## 1. Prepare The Board Plan

Before Figma writing, prepare a concise internal plan from the PRD interpretation:

- Board name and generation date.
- `1.0` product positioning: design background/problem, target players, expected experience/result.
- `3.0` player flows: main flow and secondary flows, excluding pure backend mechanisms.
- `4.0` feature details: major functions, minor functions, interface list, states, feedback, popups, failure/recovery, and external surfaces.
- AI pending-confirmation notes: missing rules, contradictions, inferred decisions, and design risks.
- Red-dot or notification content only when in scope.

Do not turn this into a renderer JSON contract. It is a design brief for direct Figma drawing.

## 2. Draw Directly In Figma

Use `use_figma` directly. Prefer cloning or closely matching the provided template/page. If cloning exact nodes is blocked, visually preserve the template style and report the blocker; do not switch to a renderer.

Required behavior:

- Keep exactly one global `1.0`, `2.0`, `3.0`, and `4.0` section.
- Edit header text only. Preserve the top floating bar style, images, fills, fonts, positions, and geometry.
- Keep `1.0` in the asymmetric template layout and replace only the answer/body text.
- Use version rows according to iteration history: first generation has one filled row; later iterations append rows.
- Keep `2.0` empty by default unless adaptation is explicitly in scope.
- Draw `3.0` as one or more complete player-flow blocks. Each flow block needs a flow name, screen/state nodes, connectors, and condition labels.
- Do not draw backend refresh, weekly reset, or system settlement as player flows unless the player actively operates them. Put those mechanisms into `4.0` states, reminders, toast, mail, red-dot, or notes.
- Draw `4.0` by hierarchy: major function -> major title; minor function -> subtitle; interface/state -> interface title + left wireframe + right notes.
- Draw low-fidelity wireframes as plausible player-visible UI. Include hierarchy, controls, state changes, feedback, modal/toast/result states, and return paths when relevant.
- Do not draw wireframes as pure text cards, feature-name lists, backend diagrams, or mechanism summaries.
- Build right-side notes with template-like labels above and numbered explanation lines below.
- Use meaningful discipline labels such as `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`.
- Use red warning styling for `AI待确认`; keep it visible and independent from ordinary notes.
- Extend board height and move later sections/footer down as content grows.
- Hide unused reserved blocks instead of leaving placeholder text visible.

## 3. Self-Check The Board

Because the renderer and validator are removed from the default path, perform visual and semantic checks before delivery.

Template checks:

- No duplicated global `1.0`/`2.0`/`3.0`/`4.0` sections.
- Header/floating bar and footer still look like the template.
- `1.0` remains asymmetric.
- `2.0` remains untouched unless in scope.
- `3.0` flow names, nodes, connectors, and condition labels are readable and aligned.
- `4.0` modules move downward with content; no overlap with 3.0 or later modules.
- No visible placeholders such as `界面名称`, `备注内容（非必须）`, `注释内容`, `动效描述`, `原型`, or `副标题` remain in filled sections.

Content checks:

- `1.0` answers why the feature exists, who it affects, and what experience/result should improve.
- `3.0` is a real player experience flow, not a copy of the template path and not a backend mechanism map.
- Every important `3.0` node has a matching `4.0` interface/state explanation.
- `4.0` includes entry, main operation, selection/confirmation, success/failure feedback, edge states, and external surfaces when source-backed.
- Left wireframes look like usable low-fidelity game UI.
- Right notes explain purpose, module composition, state, player operation, post-action change, feedback, exception handling, and AI pending-confirmation.
- AI pending-confirmation is useful for design or planning decisions, not only edge-case QA.

## 4. Final Semantic Review

Use `output-quality-model.md` after the visual self-check:

- Interaction blueprint gate.
- Basic usability gate.
- Player-screenshot gate.
- Flow ownership gate.
- Right-side explanation gate.
- AI follow-up gate.
- Source and scope gate.
- Template and Figma composition gate.
- Dual review gate: interaction designer view first, player view second.

## 5. Final Response Requirement

When delivering a Figma board, include a compact status line:

- Figma drawing: completed or blocked.
- Visual/template self-check: passed, warnings, failed, or blocked.
- Semantic review: passed, warnings, failed, or blocked.
- Any intentional exception, such as user-authorized non-template generation.

If no Figma board was generated in the current turn, this protocol does not need to be reported.