---
name: game-interaction-prd-expander
description: Convert game planning documents, Confluence/wiki pages, PDFs, DOCX files, and optional HTML prototypes into interaction-ready Figma pre-briefs. Use when Codex needs to help game interaction designers understand a complex PRD before design work by extracting product intent, main interface structure, player flows, state logic, missing rules, contradictions, design risks, edge cases, red-dot clues, and annotated low-fidelity wireframes in Figma. Treat HTML prototypes as functional evidence, not visual/layout reference, unless the user explicitly says otherwise.
---

# Game Interaction PRD Expander

## Mission

Turn dense game PRDs into a Figma pre-brief that helps interaction designers understand the feature faster and discuss the right questions earlier.

Highest priority: do not summarize the PRD into Figma. Translate planning facts into product intent, player-readable flows, player-visible interface states, designer-facing notes, and design risks that can be discussed before UE / interaction design begins.

The four core jobs are:

1. Extract product intent: why the feature exists, which player problem it solves, and what experience outcome it should create.
2. Expose `AI待确认` as design-risk prompts: player motivation, decision basis, dead-end risk, cognitive load, recoverability, value expression, and loop closure.
3. Find the main interface, then split player flows by the behavior lifecycle. Cover source-mentioned functions and infer necessary player-visible screens, states, feedback, operations, main flows, and branch flows.
4. In `4.0`, draw low-fidelity player-visible UI on the left, and write designer explanation plus pending questions on the right.

Do not act as a final UI generator. The output is an interaction analysis board with usable low-fidelity wireframes, not production UI.

## Reference Loading

Load only the references needed for the current step:

- Source analysis and PRD judgment: [analysis-checklist.md](references/analysis-checklist.md)
- Wireframe usability and game interaction principles: [wireframe-design-principles.md](references/wireframe-design-principles.md)
- Figma board structure and visible output rules: [figma-output-spec.md](references/figma-output-spec.md)
- Template-first Figma execution workflow: [figma-execution-protocol.md](references/figma-execution-protocol.md)
- Final semantic review: [output-quality-model.md](references/output-quality-model.md)

Before drawing `4.0`, read `wireframe-design-principles.md`. It prevents mechanism cards from pretending to be UI.

For every Figma write, use direct `use_figma` drawing inside a cloned template shell. Do not run renderer, validator, template-lock, generated script, or fallback renderer workflows.


## Encoding Safety

This skill is Chinese-heavy. Treat encoding as a hard reliability rule:

- Keep all skill text files as UTF-8 without BOM and LF line endings.
- On Windows, prefer PowerShell or .NET file APIs for file IO, but always read and write explicitly as UTF-8.
- When writing files from PowerShell, use a no-BOM UTF-8 writer such as `[System.Text.UTF8Encoding]::new($false)` instead of relying on default encoding.
- When running Python checks, use UTF-8 mode, for example `python -X utf8 ...`, or open files with `encoding='utf-8'`.
- Do not pass large Chinese payloads through bare shell strings when a file path, direct tool argument, or Figma node text write is available.
- If obvious mojibake, replacement characters, repeated question marks, or broken UTF-8/GBK-looking fragments appear, stop and fix the source text before generating a Figma board.
## Template Contract

Default to this template unless the user explicitly provides another template in the current request:

`https://www.figma.com/design/RbcXtsnRIfCVUXRjUXW99x/%E8%AE%BE%E8%AE%A1%E7%AE%A1%E7%BA%BF%E7%A0%94%E7%A9%B6?node-id=1184-1331&t=noJVA0YdED8KTxqt-4`

Before writing to Figma, read `assets/krad-template/template-manifest.json`. Use its `source_template.node_id` (`1184:1331` by default), slot IDs, prototype IDs, and forbidden rules as the template authority. Ignore corrupted Chinese display names in the manifest; rely on IDs and English semantic keys.

Template structure is low-freedom:

- The board must be derived from the active template by cloning, instancing, or duplicating the template node. Do not create the root board from scratch.
- Do not hand-draw existing template chrome: top floating/header, logo assets, section numbers, dividers, title chips, subtitle chips, interface title labels, right-side note labels, version rows, adaptation placeholders, screen-frame shells, footer, and spacing rhythm.
- Only edit declared text slots and content areas. Preserve fills, fonts, size, colors, images, icons, strokes, rounded corners, hierarchy, and component-like structure.
- `2.0` stays as the empty template unless adaptation output is explicitly in scope.
- If the template node, slot, or prototype cannot be cloned or resolved, stop and report `template_clone_blocked` or `template_slot_blocked`. Do not visually imitate the template and do not generate a substitute freehand board unless the user explicitly authorizes that exception.

Generated interaction content is high-freedom inside allowed areas:

- LLM owns PRD understanding, product intent, player flow design, low-fidelity interface composition, right-side explanations, and `AI待确认`.
- Code or scripts must not compress semantic content just to fit a template area. Extend modules downward and move later content/footer instead.

High-risk execution rules:

- Before Figma drawing, prepare a concise text precheck: `4.0 Surface / Note Inventory`, `Surface Transition / Branch Inventory`, and `3.0 Goal Flow Graph inventory`.
- `3.0` is a `Core Play Path Graph`, not a mechanism theme list, linear step strip, or control list. Each top-level graph must pass the stricter `Top-level Goal Promotion Gate`; use Designer Flow Grammar only when it improves core play readability.
- Split `3.0` flows when player motivation, entry/source surface, operating perspective, decision basis, or social/economic value changes. Do not merge paths only because they share the same final reward or backend action.
- `4.0` left wireframes show player-facing UI only. One frame = one player moment; local controls stay in `4.0` unless they trigger a new surface, branch, result, external surface, return target, or loop closure.
- `4.0 Surface Preservation Guard`: simplifying `3.0` must not reduce `4.0` coverage. If a player sees, operates, waits on, confirms, closes, claims, recovers from, or returns through a moment, express it in `4.0` even when it stays out of `3.0`.
- Overlay/modal surfaces are judged by transition role, not visual form. They enter `3.0` when they carry a new decision, confirmation, submit action, result trigger, failure recovery, destination change, or loop closure; otherwise keep them as `4.0` local surfaces.
- `AI待确认` coverage is goal/risk based, not presence-count based. Before selecting final items, run an `AI Risk Mining Pass` across product intent, key surface transitions, blocking/failure/recovery, passive-system impact, and interface expression; check motivation, decision basis, recovery, cognitive load, value expression, and feedback/loop closure.
- `AI待确认` is not one-per-surface. Low-risk surfaces can have none; high-risk surfaces can have 2-3 independent numbered risks. Never compress separate key risks into one item because of template slots, write helpers, or layout pressure.
- `AI待确认` visual QA must inspect visible child fills, vector/arrow shapes, text, and number markers: use red-series backgrounds with white high-contrast text, not only a red parent frame.
- Right-side notes are for interaction designers, not for the agent. Do not expose internal taxonomy or template reasoning in visible board text.
## Workflow

1. Confirm scope and destination.
   - If no Figma file URL/key is provided, ask for the target file before generating.
   - If a file is provided but no page/node is specified, use the requested page if available or create a new board in that file.
   - If iterating, work in the same page/board unless the user asks for a separate version.
   - Default platform is mobile game. Add PC, console, web, or responsive interaction only when the source/user explicitly says so.

2. Ingest sources.
   - PRD/wiki/PDF/DOCX is the source of truth.
   - HTML prototypes are functional evidence only: pages, labels, actions, sample states, and contradictions. Do not copy their layout unless the user asks.
   - If sources conflict, keep the conflict visible as an AI follow-up.
   - Establish the requested scope before expanding modules; keep global or sibling systems separate unless they directly affect the current feature.

3. Build the internal interaction interpretation.
   - Start with product meaning: `source mechanic -> player motivation/problem -> desired experience outcome`.
   - Find the main interface: the surface where the core player operation happens.
   - Expand outward from that surface: entry, navigation, tabs/modes, panels, helper operations, primary/secondary actions, validation, confirmation, loading/performance, result states, return paths, and affected external surfaces.
   - Analyze by player goals and operation hotspots, not by PRD headings.
   - Build a `Surface Transition / Branch Inventory`: list only the entries, CTAs, tabs/modes, messages, external jumps, close/back actions, or failure/return triggers that move the player between surfaces, create a branch, or close a loop.
   - Keep filters, sorting, dropdowns, item selection, quantity changes, tab-local states, and list selection inside `4.0` unless they open a new surface, overlay/modal, result, external surface, return target, loop closure, or change the flow branch.
   - For each important transition, reason internally: `source surface -> trigger/CTA -> immediate feedback -> validation/data update -> destination/result surface -> failure/recovery -> return/loop`.
   - Before asking questions, separate confirmed source facts/preconditions, interaction gaps, feature-design risks, and boundary QA.
   - Respect PRD-stated gates as facts; ask how the player learns, sees, recovers from, or routes around them.
   - Translate config and technical evidence into player-visible behavior, state, feedback, fallback, or recovery. Omit pure implementation cleanup from the main board.

4. Decide representation ownership for every important fact.
   - Direct player action or visible state -> `4.0` left wireframe.
   - Goal-level player journey -> `3.0` Goal Flow Graph.
   - Rule, dependency, condition, or implementation impact -> `4.0` right-side note.
   - Missing decision or design risk -> visible `AI待确认`.
   - Backend schedule, permission matrix, pricing formula, refresh order, or QA checklist -> never as a fake player screen; anchor it to a UI consequence or keep it in notes.

5. Pass mandatory text precheck before Figma output.
   - `4.0 Surface / Note Inventory`: list each surface name, surface type, player moment, related `3.0` goal/node, left wireframe intent, right-side note points, and `AI待确认` content.
   - `Surface Transition / Branch Inventory`: for each surface, list primary CTAs, branch triggers, external jumps, close/back actions, blocking/failure triggers, destination/result surfaces, and which local controls stay only in `4.0`.
   - `3.0 Goal Flow Graph inventory`: list each top-level graph after applying the `Top-level Goal Promotion Gate`, with player goal, entry, main success path, end/return, surface transitions, optional decision/failure/merge/loop/sub-flow units, and matching `4.0` surfaces.
   - `Top-level Goal Promotion Gate`: promote a `3.0` top-level graph only when all are true: the player actively enters a concrete surface/scene; performs a sequence of operations or choices rather than only receiving a system consequence; follows a clear CTA chain between surfaces (`entry -> operation -> decision/confirm -> feedback/result -> return/continue`); contributes directly to the feature core play value rather than only reminder/fallback/reset/prerequisite value; and omitting it would make designers unable to understand how the feature is played.
   - Demote system pressure, existing-system entries, prerequisite setup, passive reminders, fallback compensation, backend schedules/resets/settlement, limit explanations, and one-off notifications to pre-entry context, branch/failure/recovery under an owning core path, local state/toast, external-surface example, right-side note, or `AI待确认` risk unless they become an active player-operated loop.
   - Designer Flow Grammar is optional and context-driven: use diamonds, branches, merges, loops, dashed optional routes, mode lanes, external-surface nodes, or nested sub-flow nodes only when they make the player goal graph clearer.
   - Template visual language is mandatory, but template topology is not. Do not inherit template node count, single-line layout, fixed order, or branch shape.
   - Name `3.0` flow nodes as player-facing actions or moments, not PRD topic names: prefer action labels like `查看好友价并比价`, `按好友价出售`, or `确认获得回收币` over abstract labels like `价格/比价`, `出售页签`, or `结果反馈`.
   - Do not let template placeholder order change causality: validation/confirmation/resource consumption comes before result, reward, or benefit delivery.
6. Plan the board content directly.
   - Product meaning -> `1.0 Design overview`.
   - Text precheck -> confirm `4.0 Surface / Note Inventory`, `Surface Transition / Branch Inventory`, and `3.0 Goal Flow Graph inventory` before visible Figma drawing when practical.
   - Goal Flow Graph inventory -> `3.0 Feature flow`.
   - Player-visible feature groups, states, and lifecycle stages -> `4.0 Feature details`.
   - Missing rules, contradictions, inferred decisions, and design risks -> visible `AI待确认` notes.
   - Red-dot rules -> only when in scope, and only as player-visible entry/status/clearing behavior or concise notes.

7. Generate Figma output by template-first direct drawing.
   - Load `figma-execution-protocol.md` before writing to Figma.
   - Clone/duplicate/instance the active template node first. Fill and extend that derived board; never build the board shell freehand.
   - Keep `1.0`, `2.0`, `3.0`, and `4.0` as single global sections. Multiple major functions expand only inside `4.0`; never clone the whole board scaffold per module.
   - Use template prototypes for module headers, subtitle labels, interface titles, screen frames, flow-name chips, flow-node shells, note labels, version rows, and footer movement.
   - Use simple `1334x750` mobile-game wireframes unless the source/user says otherwise.
   - One wireframe represents one player-visible state. Split confirmation, loading/performance, success/failure, refreshed return, and mail/claim states when the player would see them separately.
   - Left wireframes must be plausible player-visible interface states, not rule cards, mechanism summaries, backend diagrams, permission matrices, refresh schedules, or lists of feature names.
   - Right-side notes must use cloned template label/note styling. `AI待确认` must stay on a template-derived label/component, use a red-series background with white text for strong contrast, remain visibly readable at a glance, and attach to the affected module/interface.
   - Extend board height and move later content/footer down as content grows.

8. Verify before delivery.
   - Screenshot and inspect the board visually.
   - Use `output-quality-model.md` for semantic review: interaction designer view first, player view second.
   - Check template derivation: board cloned from `1184:1331` or user-provided template; no hand-drawn template chrome; `2.0` untouched; footer moved rather than redrawn.
   - Check template adherence: no global section duplication, no visible placeholder residue, no overlap, header/footer preserved, right-side labels from template style.
   - Check content quality: `1.0` explains product intent; `3.0` is a real player flow; `4.0` contains usable player-visible UI; notes explain state/action/feedback; `AI待确认` exposes design risk rather than only edge-case QA.

## Output Contract

Default Figma board:

- `1.0 Design overview`: product intent, target players, desired experience/outcome, and version/source records in the fixed asymmetric template layout.
- `2.0 Adaptation plan`: preserve designer-owned placeholders unless adaptation is explicitly in scope.
- `3.0 Feature flow`: Goal Flow Graphs for top-level player goals; each graph uses template flow style plus optional designer flow grammar when needed.
- `4.0 Feature details`: major function modules; minor function subtitles; interface/state explanations with left wireframes and right notes.
- Optional `5.0`: only for content truly outside overview, adaptation, flows, and feature details.

Feature-detail modules must contain:

- Template-cloned module header badges.
- One or more player-visible `1334x750` wireframes inside the cloned left frame area.
- Right-side notes with cloned labels above and numbered explanation lines below.
- Visible `AI待确认` notes for missing rules, contradictions, decision gaps, motivation gaps, dead-end risk, cognitive load, unclear recovery, value expression, or loop closure.

## Non-Negotiables

- Do not run legacy renderer scripts, generated renderer scripts, template-lock scripts, or validator scripts as the default path.
- Do not freehand redraw the template shell. If cloning/slot/prototype use is blocked, stop and report the blocker.
- Do not let template placeholder count or position limit flow count, flow order, or interface quantity.
- Do not inherit the template example topology: 7-node strips, single-line paths, fixed branch shape, and placeholder order are not content rules.
- Do not pass AI pending QA by presence count; coverage must follow player goals and high-risk decisions.
- Do not expose internal taxonomy such as representation ownership, mechanism ownership, surface classification, backend classification, template reasoning, inventory, gate, validator, or renderer in visible right-side notes.
- Do not create standalone screens for backend refresh, reset, settlement, quota update, or mechanism-order rules; localize them to the owning interface, toast, note, or source-defined external surface.
- Do not draw unrelated versions of the same interface; use a stable frame for tabs/modes/states, or classify the surface as different.
- Do not summarize PRD text into Figma. Translate planning facts into product intent, player flows, player-visible UI states, designer notes, and design risks.
- Do not turn the board into a config summary, operation-chain table, permission matrix, refresh schedule, or internal checklist.
- Do not draw mechanism summaries inside game-screen wireframes.
- Do not let right-side text compensate for missing visible controls/states on the left.
- Do not treat backend refresh, weekly settlement, forced recycling, permission rules, or data order as standalone player screens.
- Do not ask AI follow-ups that contradict source-stated facts or preconditions.
- Do not let AI follow-ups become only edge-case QA; lead with logic completion, player motivation, decision basis, recovery path, and feature-design risks.
- Do not introduce unsupported functions such as ranking, rules, shop, mailbox, help, share, or guide unless source-backed or explicitly labeled as AI follow-up/suggestion.
- Do not use HTML prototype layout as the design reference unless explicitly authorized.
- Do not deliver a Figma board without screenshot inspection and semantic self-review.
