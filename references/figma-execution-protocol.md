# Figma Execution Protocol

Use this protocol whenever the skill writes a Figma pre-brief board. The default path is direct LLM drawing inside a cloned template shell. Do not run bundled renderer, validator, template-lock, generated script, or fallback renderer workflows.

The goal is to keep the old content strength: accurate PRD interpretation, useful low-fidelity interface design, readable player flows, and complete designer-facing notes, while making template reuse non-optional.

## 1. Read The Template Authority

Before any Figma write:

- Read `assets/krad-template/template-manifest.json`.
- Use `source_template.node_id` as the default source template (`1184:1331`) unless the user provides another template in the current request.
- Use manifest slot/prototype IDs and English semantic keys as the authority. Ignore corrupted Chinese display names in the manifest.
- Treat manifest `forbidden` rules as hard execution rules.

If the template node cannot be found, cloned, duplicated, instanced, or detached as needed, stop and report `template_clone_blocked`. Do not visually imitate the template.

## 2. Prepare The Board Plan

Before Figma writing, prepare a concise internal plan from the PRD interpretation:

- Board name and generation date.
- `1.0` product positioning: design background/problem, target players, expected experience/result.
- `3.0` player flows: main flow and secondary flows, excluding pure backend mechanisms.
- `4.0` feature details: major functions, minor functions, interface list, states, feedback, popups, failure/recovery, and external surfaces.
- `AI待确认` notes: missing rules, contradictions, inferred decisions, and design risks.
- Red-dot or notification content only when in scope.

Do not turn this into a renderer JSON contract. It is a design brief for direct Figma drawing.

## 3. Create The Template-Derived Board

Use `use_figma` directly.

Required first action:

- Clone, duplicate, or instantiate the active template node into the target page.
- Work only inside this derived board.
- Keep exactly one global `1.0`, `2.0`, `3.0`, and `4.0` section.

Never create the root board from scratch. Never hand-draw existing template chrome:

- top floating/header area
- logo or image assets
- section number/title/divider
- title chips and subtitle chips
- interface title labels
- flow-name chips and flow node shells
- right-side note labels
- version rows
- adaptation placeholders
- `1334x750` screen-frame shells
- footer

If a required template slot or prototype cannot be resolved, stop and report `template_slot_blocked`. A visually similar substitute is not acceptable unless the user explicitly approves a non-template exception after the blocker is reported.

## 4. Fill And Extend The Board

Required behavior:

- Edit header text only. Preserve top floating bar style, images, fills, fonts, positions, and geometry.
- Keep `1.0` in the asymmetric template layout and replace only the answer/body text.
- Use version rows according to iteration history: first generation has one filled row; later iterations append rows.
- Keep `2.0` empty by default unless adaptation is explicitly in scope.
- Draw `3.0` as one or more complete player-flow blocks. Each flow block needs a cloned flow-name style, screen/state nodes, connectors, and condition labels.
- Do not draw backend refresh, weekly reset, or system settlement as player flows unless the player actively operates them. Put those mechanisms into `4.0` states, reminders, toast, mail, red-dot, or notes.
- Draw `4.0` by hierarchy: major function -> major title; minor function -> subtitle; interface/state -> interface title + left wireframe + right notes.
- For every `4.0` module/subtitle/interface/note label, clone or reuse the template prototype style first, then edit text.
- Draw low-fidelity wireframes as plausible player-visible UI inside the cloned screen-frame area. Include hierarchy, controls, state changes, feedback, modal/toast/result states, and return paths when relevant.
- Do not draw wireframes as pure text cards, feature-name lists, backend diagrams, or mechanism summaries.
- Build right-side notes with cloned template labels above and numbered explanation lines below.
- Use meaningful discipline labels: `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`.
- Use red warning styling for `AI待确认`; keep it visible and independent from ordinary notes.
- Extend board height and move later sections/footer down as content grows.
- Hide unused reserved blocks instead of leaving placeholder text visible.

## 5. Self-Check The Board

Because renderer and validator scripts are removed from the default path, perform visual and semantic checks before delivery.

Template checks:

- Board is derived from the active template node (`1184:1331` by default) or the user-provided template.
- No freehand replacement for template chrome.
- No duplicated global `1.0`/`2.0`/`3.0`/`4.0` sections.
- Header/floating bar and footer still come from the template.
- `1.0` remains asymmetric.
- `2.0` remains untouched unless in scope.
- `3.0` flow names, nodes, connectors, and condition labels are readable and aligned.
- `4.0` modules move downward with content; no overlap with `3.0` or later modules.
- No visible placeholders such as `界面名称`, `备注内容（非必须）`, `注释内容`, `动效描述`, `原型`, or `副标题` remain in filled sections.

Content checks:

- `1.0` answers why the feature exists, who it affects, and what experience/result should improve.
- `3.0` is a real player experience flow, not a copy of the template path and not a backend mechanism map.
- Every important `3.0` node has a matching `4.0` interface/state explanation.
- `4.0` includes entry, main operation, selection/confirmation, success/failure feedback, edge states, and external surfaces when source-backed.
- Left wireframes look like usable low-fidelity game UI.
- Right notes explain purpose, module composition, state, player operation, post-action change, feedback, exception handling, and `AI待确认`.
- `AI待确认` is useful for design or planning decisions, not only edge-case QA.

## 6. Final Semantic Review

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

## 7. Final Response Requirement

When delivering a Figma board, include a compact status line:

- Template: cloned from active template, user-authorized exception, or blocked.
- Figma drawing: completed or blocked.
- Visual/template self-check: passed, warnings, failed, or blocked.
- Semantic review: passed, warnings, failed, or blocked.
- Any intentional exception, such as user-authorized non-template generation.

If no Figma board was generated in the current turn, this protocol does not need to be reported.
