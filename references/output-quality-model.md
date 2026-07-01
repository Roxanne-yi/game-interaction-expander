# Output Quality Model

Use this reference as the quality model for the whole PRD-expansion output. It defines what counts as a usable game interaction pre-brief, not a list of past mistakes.

Do not expose this model as visible methodology on the Figma board. Use it internally before drawing and again before final delivery.

## 1. Interaction Blueprint Gate

Before creating Figma content, derive an internal blueprint for every important module. Do not jump from PRD headings directly to wireframes.

For each module, answer:

- Source fact class: which rules are confirmed facts/preconditions, which are interaction gaps, which are feature-design risks, and which are boundary QA.
- Surface Transition / Branch Inventory: which primary CTAs, branch triggers, external jumps, close/back actions, blocking/failure triggers, passive/system consequences, and destination/result surfaces change the player flow; which local controls stay inside `4.0`.
- 4.0 Surface Preservation: which player-visible local overlays, modals, pickers, result/toast states, external surfaces, tab states, and component states stay in `4.0` even if they are not promoted to `3.0`.
- Player goal: what is the player trying to accomplish here?
- Surface type: main interface, secondary/tertiary interface, other-system surface, tab, mode, modal, list, detail, result, HUD, external entry, or feedback state.
- Entry and exit: where the player comes from, and where they return or continue.
- Visible content: what the player can see without reading designer notes.
- Player operations: what the player can tap, select, confirm, close, compare, claim, save, manage, wait for, or recover from.
- Operation result: what changes after the action, including state, feedback, data refresh, reward, red dot, or return surface.
- Required states: which states must be represented as frames or local UI examples.
- Non-screen rules: which rules belong in right-side notes/support diagrams instead of player-screen wireframes.

If the blueprint cannot answer a question that affects layout, state, flow, feedback, or player understanding, mark it as an AI follow-up rather than silently inventing a rule.

The blueprint must respect confirmed facts without becoming passive. A confirmed precondition is not automatically a flaw, but it still needs a visible teaching, disabled, guidance, recovery, or return decision. A source-backed mechanism can still be a feature-design risk when it prevents the player from understanding value, making a meaningful choice, or completing the intended loop.

Surface ownership check:

- Do not combine different system surfaces into one player-screen frame just to show cause and effect. Mail, bag, shop, HUD, settlement, lobby/hub, friend/visitor pages, and feature panels are separate surfaces unless the PRD clearly says one appears as an overlay inside another.
- If a feature action creates a mail, bag, HUD, shop, lobby, or friend-surface consequence, model it as a separate frame/module, return cue, flow step, or right-side note according to player visibility.
- Every primary operation chain must include the result closure if it is player-visible: success/failure feedback, reward/item display, counter refresh, red-dot change, return destination, or follow-up action.

## 2. Basic Usability Gate

Left-side wireframes are not final UI, but they must be basically usable game interfaces.

Every `1334x750` player-screen frame should have:

- A recognizable screen or surface type.
- Clear information regions and reading order.
- A visible primary action, or a visible reason why the current state has no available primary action.
- Back, close, cancel, next, return, or other navigation closure when the surface is secondary.
- Visible state feedback such as selected, disabled, success, failure, refreshing, empty, locked, owned, new, claimable, claimed, waiting, or expired.
- Controls that match behavior: filters as filter controls, lists as lists, popups as popups, toasts as toasts, HUD as HUD anchors.
- System rules expressed as visible UI states where relevant, not as large rule explanations inside the screen.

Low fidelity is acceptable. Interaction that looks impossible, confusing, or non-operable is not.

## 3. Player-Screenshot Gate

For every left-side player-screen frame, ask:

Could this plausibly be a game screenshot that a player can see, tap, wait on, close, or return from?

If the content is only refresh/reset/settlement/order/quota/limit logic, it is not a screen. It must be localized to the owning interface, a toast/local tip, a source-defined external surface, or a right-side note.

If not, move the content to right-side notes, support diagrams, state matrices, or AI follow-up questions. Do not disguise mechanism summaries, refresh schedules, ownership rules, permission matrices, backend logic, or QA lists as game screens.

## 4. Goal Flow Graph Gate

Feature flow must be organized as Core Play Path Graphs: player-operated paths that carry feature value. It must not be organized by PRD section order, mechanism themes, template placeholders, or linear step strips.

Before judging the board, confirm there is a clear `4.0 Surface / Note Inventory`, `Surface Transition / Branch Inventory`, and `Goal Flow Graph inventory`. Every top-level graph must pass the `Top-level Goal Promotion Gate`; every player-visible `3.0` node maps to a `4.0` surface/player moment; every primary CTA or branch trigger is represented as a transition, local state, note, or `AI待确认`; and local controls are not promoted into flow nodes.

`Top-level Goal Promotion Gate`: a top-level `3.0` graph must pass all Core Play Path checks: player actively enters a concrete surface/scene; player performs a sequence of operations or choices rather than only receiving a system consequence; the path has a visible CTA chain between surfaces (`entry -> operation -> decision/confirm -> feedback/result -> return/continue`); it directly carries the feature core play value; and omitting it would make designers unable to understand how the feature is played. Existing-system entries, prerequisite setup, passive compensation, backend schedules, limit explanations, one-off notifications, and pure failure reminders are not top-level graphs unless the source makes them an active player-operated loop.

Designer Flow Grammar is available when the goal needs it: diamond decisions, branch lines, merges, loops, dashed optional routes, mode lanes, external-surface nodes, and nested sub-flow nodes. These units are optional, not required decoration. Use them only to clarify the player goal graph.

Do not create a top-level graph for refresh, reset, settlement, permission, quota, validation, or backend rules. Attach them as decision nodes, branches, local states, toasts, external surfaces, right-side notes, or `AI待确认` under the owning player goal.
Split graph check: if player motivation, entry/source surface, operating perspective, decision basis, or value proposition changes, split the path even when the final reward or backend action is shared.

Fail the flow if result, reward, or benefit delivery appears before validation, confirmation, or resource/cost consumption.

Fail the board if:

- A `3.0` top-level flow does not pass the `Top-level Goal Promotion Gate`.
- A top-level graph is mainly a system pressure, passive reminder, fallback compensation, reset/settlement rhythm, prerequisite setup, or risk avoidance topic rather than a concrete player-operated core path.
- Multiple player goals are compressed into one template-like horizontal path.
- Distinct paths with different motivation, entry/source surface, operating perspective, decision basis, or social/economic value are merged only because they share a final reward or backend action.
- A template-like 6-7 node path appears while the source has multiple distinct player goals.
- Template node count, placeholder position, or example topology appears to determine the real flow.
- Flow titles or node labels read as mechanism themes or page taxonomy instead of player-facing actions/moments.
- A true action branch, decision, failure, or return is omitted to fit the template.
- A fake decision/failure is added only to satisfy a format.
- `3.0` uses interface cards for conditions or judgments.
- A primary CTA or branch trigger that changes destination, feedback, recovery, or loop closure is missing from `3.0` and not intentionally localized in `4.0` notes.
- A local control such as filtering, sorting, dropdown choice, item selection, quantity adjustment, or selected state is promoted into a `3.0` flow node without opening a new surface or branch.
- A player-visible overlay/modal that carries confirmation, submit, result trigger, failure recovery, destination change, or loop closure is incorrectly dropped from `3.0`; or a local picker/help/filter overlay is incorrectly promoted despite returning to the same step.
- Existing-system entry, prerequisite setup, passive compensation, backend schedule, limit explanation, or one-off reminder is given the same top-level weight as a core player-operated loop.
- A `3.0` interface node cannot map to one `4.0` surface/player moment.
- `3.0` simplification causes `4.0` to lose player-visible local surfaces, overlays, modals, results, toasts, tab states, component states, or external surfaces.
- Refresh, reset, settlement, permission, quota, validation, or backend rules are promoted to top-level player flows.
- A left wireframe contains designer-facing explanation instead of player-facing UI.
- A left wireframe is a state collection screen rather than one player moment; one frame = one player moment is violated.
- Mutually exclusive feedback states appear in one frame.
- Modal, toast, mail, HUD, feature panel, result screen, or other different surfaces are merged into one fake surface.
- Tabs, modes, or local states of the same interface use unrelated frame structures without being classified as different surfaces.
- Passive/system consequences such as scheduled reminder, periodic compensation, external mail fallback, or backend refresh are placed inside an unrelated active operation result screen.
- Right-side notes are required to understand what the left UI is.
- Department labels are edited as text instead of component variants/properties.
- The `AI待确认` label is not visibly readable, lacks a red-series visible label/arrow/vector background with white high-contrast text, or has red text on a red marker/body that reduces readability.

## 5. Right-Side Note Contract

Right-side notes are for interaction designers, not for the agent. They should read like designer-facing interaction-spec content, not internal reasoning.

Each note group should answer only:

- What this interface/state shows.
- What the player can do.
- What feedback/result appears.
- Where the player goes next or how they recover.
- What design decision remains unresolved, if any.

Do not expose analysis taxonomy such as representation ownership, mechanism ownership, surface classification, backend classification, validation ownership, template reasoning, inventory, gate, validator, renderer, or similar internal process terms.

Right-side notes must reuse template `note label / note box` styling: discipline label above, numbered explanation lines below. Ordinary notes and `AI待确认` must be visually separated; `AI待确认` uses the template-derived red warning label/style with white high-contrast text.

Right-side notes may include compact local state examples when state differences are visual, but those examples must trace back to the owning component from the left wireframe. They support explanation; they do not replace player-screen frames.

## 6. AI Pending Coverage Rule

`AI待确认` should help interaction designers avoid doing secondary planning from scratch. It must not devolve into only edge-case QA, and it must not pass by board-level presence count.

Before delivery, first run an `AI Risk Mining Pass`, then select and attach the strongest questions. Check each top-level player goal, key surface transition, blocking/failure/recovery, passive-system impact, value expression, and high-risk decision/reward/return point for `AI待确认` needs across:

- Player motivation: why the player wants to do this and whether system value is visible.
- Decision basis: whether comparison, recommendation, sorting, pricing validity, reward preview, or reason copy is enough to decide.
- Dead-end/recovery: wasted visits, blocked actions, no return path, hidden preconditions, failure without recovery.
- Cognitive load: too many rules, unclear hierarchy, late rule disclosure, conflicting surfaces.
- Value expression: whether reward, growth, social, collection, economy, or efficiency motivation is visible.
- Feedback/loop closure: whether success, failure, wait, consumed, refreshed, claimed, returned, or recovered state is clear.

If no `AI待确认` is added for a goal or risk point, the source must already resolve those concerns clearly. Fail the board if there is only one generic `AI待确认` while multiple player goals or high-risk branches remain under-discussed. Never ask about a scenario that the PRD already forbids, gates, or resolves; ask about the next undefined interaction decision after the source fact is locked.
Low-risk surfaces can have no AI item; high-risk surfaces can have several. Fail if independent motivation, decision-basis, recovery, value-expression, or loop-closure risks are compressed into one vague question because of template slot or layout pressure. Use separate numbered AI items when risks are independent.

## 7. Source and Scope Gate

Every visible function must be source-supported or explicitly marked as an AI suggestion/follow-up.

Allowed sources:

- PRD/wiki/PDF source truth.
- HTML prototype as functional evidence only: available pages, labels, actions, sample states, contradictions.
- Explicit AI suggestion/follow-up labels.

Do not add common game features such as ranking, rules, shop, mailbox, help, share, leaderboard, or guide only because the feature type often has them. Do not merge global systems, sibling modules, or future phases into the current main flow unless they directly affect the current feature's player journey or visible state.

## 8. Template and Figma Composition Gate

The active Figma template is a contract.

Required:

- Preserve top floating/header areas unless the user explicitly asks to edit them; if editing is requested, change text only and keep exact style/layout.
- Preserve adaptation placeholders and their dimensions.
- Preserve background, footer, logo decoration, typography, component style, and spacing rhythm.
- Preserve template information hierarchy. For feature-detail modules, keep the template's main title, note badge, subtitle, note badge, and interface-name row as separate visual roles.
- For AI pending note components, inspect visible child fills and screenshot result, not only parent frame properties. The warning label, arrow/vector shape, body emphasis when used, and numbered marker must read as red warning styling with white text where applicable.
- Do not replace template module headers with custom compact strips, numbered table rows, or merged title/description bars.
- Use smart-label/tag components when available.
- Keep modules and right-side notes non-overlapping.
- Keep every module on a readable two-column row: header badges aligned, left first wireframe and right first explanation aligned to the same reading band, and no large blank gap between module header and content.
- Keep fixed spacing between modules; push later content down instead of compressing.
- Widen text frames/background badges when labels do not fit; do not let badges wrap or collide.

## 9. Dual Review Gate

Before delivery, review the board from two roles.

### Interaction Designer Review

Ask whether the board can be used as a designer's next-step brief:

- Can the left side explain the interface set, hierarchy, modes, tabs, popups, feedback states, and cross-surface states?
- Can the right side explain function logic, states, conditions, player actions, feedback, and unresolved decisions?
- Are player screens truly operable wireframes, not rule cards, process cards, or backend diagrams?
- Are visible controls, states, and feedback drawn instead of only described in text?
- Is function ownership correct: main interface, secondary interface, helper operation, modal, result, external surface, and support material are not mixed together.
- Do Goal Flow Graph and 4.0 Surface / Note inventories match: every player-visible flow node has a `4.0` surface, and mechanisms are not disguised as screens?
- Does the flow include entry, operation, validation, result, return, and loop where needed?
- Do `AI待确认` items cover player goals and high-risk decisions before boundary QA?
- Are template fidelity, smart labels, spacing, and Figma composition clean enough that the viewer will focus on feature understanding instead of output mistakes?

### Player Review

Ask whether the feature would be understandable and usable for real players in different contexts.

Review through these lenses instead of a fixed checklist:

- Goal clarity: does the player know why they entered, what to do now, and what they will get?
- Path naturalness: can the player find entry, main action, next step, and return without reading long rules?
- Rule predictability: are cost, restriction, risk, quota, time window, ownership, and reward expectations visible before failure?
- Feedback closure: after action, does the player know success, failure, waiting, consumed, refreshed, claimed, returned, or recovered?
- Cognitive load: is too much information exposed at once; should content be layered, folded, recommended, filtered, defaulted, batched, or delayed?
- Player segmentation: would new, experienced, returning, completionist, social, non-social, efficiency-driven, collection-driven, resource-poor, and high-investment players still understand their path and value?
- Hidden-system visibility: if refresh, price change, periodic reset, permission, friend collaboration, red-dot propagation, or backend settlement matters, does the player perceive it at the right time?
- Purpose fit: does the interaction actually support the product intent, such as collection, social play, efficiency, progression, economy, exploration, delight, or mastery?

If either review fails on a structural issue, revise the board before final response.
