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
- `4.0 Surface / Note Inventory`: list each surface name, surface type, player moment, related `3.0` goal/node, left wireframe intent, right-side note points, and `AI待确认` content.
- `Surface Transition / Branch Inventory`: list each surface's primary CTA, branch triggers, local controls, passive/system consequences, destination/result surfaces, and failure/recovery returns.
- `3.0 Goal Flow Graph inventory`: list each top-level graph after applying the `Top-level Goal Promotion Gate`; include entry, main success path, end/return, optional decision/failure/merge/loop/sub-flow units, and matching `4.0` surfaces.
- `3.0` player flows: draw from the goal flow graph inventory, not from template placeholder count, node count, placeholder order, or local control count.
- `4.0` feature details: draw from the surface/note inventory; include major functions, minor functions, interface list, states, feedback, popups, failure/recovery, and external surfaces.
- `AI待确认` notes: missing rules, contradictions, inferred decisions, and design risks, mined from product intent, action/flow branches, and interface expression before being filtered and attached to the affected surface/control/state.
- Red-dot or notification content only when in scope.

Do not turn this into a renderer JSON contract. It is a design brief for direct Figma drawing.

### 4.0 Surface / Note Inventory Gate

Before drawing `4.0`, create a concise text inventory. Each item must include: surface name, surface type, player moment, related `3.0` goal/node, what the left wireframe should express, right-side note points, `AI待确认` content, and draw mode (`full wireframe`, `overlay`, `local state`, or `note only`).

One frame = one player moment. Do not put mutually exclusive states in the same left wireframe. Loading, success, failure, price refresh, disabled reason, mail claim, modal confirmation, and toast feedback must be drawn as the true surface/layer where the player sees them, or moved to notes when they are not player-visible.
`4.0 Surface Preservation Guard`: if a local control, overlay, modal, result, toast, external surface, or component state is removed from `3.0`, it must still be represented in `4.0` when player-visible. Do not simplify `3.0` by thinning `4.0`.

A left wireframe must stand on its own. If the viewer must read the right-side notes to understand what the left UI is, redraw the left UI instead of adding more explanation.

### Surface Transition / Branch Inventory

Before drawing `3.0`, audit how planned `4.0` surfaces connect. Record only interactions that move the player between surfaces or change the flow branch: primary CTAs, branch triggers, modal/result openings, external jumps, close/back actions, blocking/failure triggers, destination/result surfaces, and recovery/return paths.

Keep local controls in `4.0`: filters, sorting, dropdowns, item selection, quantity changes, local selected states, and tab-local content do not become `3.0` nodes unless they open a new surface, trigger a branch, or close a loop.
For overlays and modals, inspect the CTA chain. If the overlay/modal contains the confirmation, submit action, result trigger, failure recovery, destination change, or loop closure, include it in `3.0`; if it only supports local choice and returns to the same step, keep it as `4.0` overlay/local state.

Do not collapse multiple branch triggers on one surface when they lead to different destinations, feedback, or recovery loops. Do not split a single surface into flow nodes just because it has many local controls.

### Goal Flow Graph Inventory

Before drawing `3.0`, create a concise goal flow graph inventory from the surface/note inventory and Surface Transition / Branch Inventory. Each top-level graph must pass the `Top-level Goal Promotion Gate`; if it cannot, demote it to entry context, local state, external-surface example, right-side note, or `AI待确认`.

For each graph, list: player goal, entry/source surface, main success path, key surface transitions, end/return destination, matching `4.0` surfaces, and any needed Designer Flow Grammar units.

`Top-level Goal Promotion Gate`: promote a top-level graph only when the player actively enters, operates, and decides; the goal mainly contributes to the current feature; it has a clear enter -> operate -> decide/confirm -> result -> return/continue loop; and omitting it would make the feature hard for designers to understand.

Designer Flow Grammar units are optional and context-driven: diamond decision, branch line, merge, loop, dashed optional route, mode lane, external-surface node, and nested sub-flow node. Use them only when they make the player goal graph clearer. Do not invent a decision or failure branch just to satisfy a format, and do not omit a real decision or failure branch to fit the template.

Do not create a top-level graph for existing-system entry, prerequisite setup, passive compensation, refresh, reset, settlement, permission, quota, validation, or backend rules. Attach these as pre-entry context, decision nodes, branches, local states, toasts, external surfaces, right-side notes, or `AI待确认` under the owning player goal.

### Template Prototype Boundary

Treat manifest flow nodes, connectors, and condition labels as style prototypes only. They define visual style for a flow name, one screen node, a screen title, a rectangular placeholder, connectors, and condition labels. They do not define node quantity, flow order, branch count, or layout. Use template visual language, not template topology.

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
- Draw `3.0` as one or more Goal Flow Graphs from the inventory. Each top-level graph uses a cloned flow-name style and must represent one `玩家想要...` goal.
- Arrange `3.0` nodes by actual player causality. Do not preserve template node order when it reverses causality; validation/confirmation/resource consumption must precede result, reward, or benefit delivery.
- The template's default flow-node count and example topology are not content limits. Add, remove, group, branch, merge, loop, or nest nodes according to player goals.
- Use screen thumbnails or placeholder cards only for player-visible interface/state nodes that map to `4.0`; use Designer Flow Grammar units for conditions, judgments, branches, merges, loops, mode lanes, optional routes, external surfaces, and nested sub-flows.
- Do not draw backend refresh, reset, settlement, quota update, or forced-order mechanisms as top-level player flows. Put those mechanisms into `4.0` local states, reminders, toast, source-defined external surfaces, red-dot, right-side notes, or `AI待确认`.
- Draw `4.0` by hierarchy from the surface plan: major function -> major title; minor function -> subtitle; surface/player moment -> interface title + left wireframe + right notes.
- For every `4.0` module/subtitle/interface/note label, clone or reuse the template prototype style first, then edit text.
- Draw low-fidelity wireframes as plausible player-visible UI inside the cloned screen-frame area. Include hierarchy, controls, state changes, feedback, modal/toast/result states, and return paths when relevant.
- Do not draw wireframes as pure text cards, feature-name lists, backend diagrams, or mechanism summaries.
- Build right-side notes with cloned template `note label / note box` styling: discipline label above, numbered explanation lines below.
- Right-side notes are for interaction designers, not for the agent. Each group answers only: what the interface/state shows, what the player can do, what feedback/result appears, where the player goes next or recovers, and what decision remains unresolved.
- Do not expose analysis taxonomy such as representation ownership, mechanism ownership, surface classification, backend classification, validation ownership, template reasoning, inventory, gate, validator, or renderer.
- Use meaningful discipline labels: `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`.
- Use the template-derived label/component for `AI待确认`. Set the label background/fill to a red-series warning color and the label text to white for strong contrast; keep the text visibly readable and independent from ordinary notes.
- When styling `AI待确认`, inspect the visible children of the label/component. Set actual visible fills, vector/arrow shapes, and number markers to red-series backgrounds with white text; changing only the parent frame fill is not enough. If a component instance prevents visible-child styling, detach or use the nearest template-derived clone while preserving the label shape.
- Support multiple AI risks per surface when needed. Treat `AI待确认` as independent numbered items, not one text slot; never combine unrelated high-risk questions only because the note component has limited space.
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
- Goal Flow Graph inventory, Surface Transition / Branch Inventory, and `4.0 Surface / Note Inventory` are consistent: every player-visible `3.0` node maps to a `4.0` surface/player moment; every primary CTA or branch trigger is represented in `3.0`, localized in `4.0`, or explained in notes/`AI待确认`; and local controls are not promoted into flow nodes.
- `3.0` causal order is correct: validation/confirmation/resource consumption comes before result/reward/benefit delivery.
- `4.0` includes entry, main operation, selection/confirmation, success/failure feedback, edge states, and source-backed external surfaces.
- `4.0` still includes player-visible local overlays, modal/picker states, result/toast states, and tab/component states that were intentionally not promoted into `3.0`.
- Left wireframes look like usable low-fidelity game UI.
- Right notes follow the Right-side Note Contract, reuse template note label / note box style, and keep `AI待确认` visually separate.
- `AI待确认` screenshot/visual QA confirms the actual visible label, arrow/vector shape, body emphasis, and numbered marker are red-series with white readable text where applicable.
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
