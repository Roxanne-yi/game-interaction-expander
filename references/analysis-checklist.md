# Interaction Analysis Checklist

Use this reference as the internal reasoning method. It is not a visible board template.

The purpose is to translate planning facts into a UE / interaction-design pre-brief: product intent, main interface, player flows, player-visible states, state logic, missing rules, and design risks.

Before drawing, also apply [wireframe-design-principles.md](wireframe-design-principles.md). Before delivery, apply [output-quality-model.md](output-quality-model.md).

## 1. Source Model

- PRD/wiki/PDF/DOCX is the primary source.
- HTML prototype is functional evidence only: pages, labels, available actions, sample states, and contradictions. Do not inherit its layout unless explicitly asked.
- Existing specs can calibrate fidelity and writing style, but do not copy their decisions into a different feature.
- AI inference must be labeled as assumption, suggestion, or `AI待确认`, not source fact.
- Keep numeric values source-backed. If values are unclear, ask a follow-up.
- Every visible page, tab, navigation item, button, control, feature name, or system entry must be source-supported or explicitly marked as AI follow-up/suggestion.
- Do not silently add common game functions such as ranking, rules, shop, help, mailbox, leaderboard, share, or guide.

Classify every important source fact:

- Confirmed fact/precondition: respect it as feature truth.
- Interaction gap: player-facing communication, operation, feedback, recovery, return, or state change is undefined.
- Feature-design risk: the source-backed mechanism may not support player motivation, decision clarity, or loop closure.
- Boundary QA: failure, refresh, empty data, repeated tap, rollback, capacity, sync, or exception handling.

Do not treat every restrictive rule as a design flaw. A source-stated gate is first a precondition; question how it is taught, surfaced, recovered from, or routed around.

## 2. Product Intent

Before drawing, write a short product thesis:

- Why does this feature exist?
- Which player behavior, content loop, information problem, social/economic need, or recovery problem does it solve?
- Which player motivation group is mainly affected?
- What outcome should it create: motivation, clarity, convenience, recognition, rhythm, retention, recovery, progression, or loop completion?

Use this translation path:

`mechanic/source fact -> player motivation or pain point -> product/experience outcome`

Compress the thesis into three `1.0` answers:

1. Why: what resource, behavior, or loop becomes what product value?
2. Who: which motivation group is served?
3. Outcome: what should players understand, feel, or continue doing?

Avoid feature summaries. A good product-positioning sentence explains why the function matters to players, not only what the function contains.

## 3. Main Interface First

Find the main interface: the surface where the core player operation happens.

Then expand outward:

- Entry: where the player comes from and why they enter.
- Entry surface: if the source describes an in-world interaction point, building/lobby/HUD entry, external jump, or mail/claim entry that belongs to the current scope, model that player-visible surface before the main panel.
- Main interface regions: navigation, mode area, operation area, list/card/slot area, preview/status area, action area.
- True modes: change content model, operation goal, or success criteria.
- Helper operations: fill, repeat, recommend, filter, sort, preview, compare, batch, manage.
- Embedded regions: information supporting the current operation.
- Modals/popups: confirmation, selection, overwrite, error, or blocking decisions.
- Temporal states: loading, sending, claiming, animation, transition, reveal.
- Result states: refreshed page, changed counter, reward/result page, toast, return cue.
- External surfaces: lobby, inventory, mail, profile, battle prep, settlement, HUD, records, history, invitation, visitor/owner surfaces.

The output hierarchy must match this analysis. Helpers should not look like equal top-level pages; true modes should be visible as tabs/modes/panels; external surfaces should become separate modules or clear follow-ups.

## 4. Operation Hotspot Audit

Apply this to every feature, including display-heavy features.

Hotspots include places where the player:

- enters, exits, closes, backs, cancels, or returns
- taps, selects, switches tabs/modes, filters, sorts, searches, expands, previews, or opens detail
- claims, sends, saves, deletes, equips, invites, batches, confirms, replaces, overwrites, consumes, sells, crafts, cooks, or collects
- waits for loading/animation/server confirmation
- sees a counter, red dot, disabled state, empty state, lock, failure, refreshed result, or returned surface

For each important hotspot, reason internally:

`trigger -> player operation -> immediate feedback -> validation/data update -> result state -> failure state -> next destination`

Use the result to decide whether to:

- draw as a player-visible interface frame
- draw as a modal/popup
- draw as a local component state
- draw as a transition/performance frame
- draw as a result/return frame
- describe in right-side notes
- ask as `AI待确认`

Do not output raw hotspot tables by default. Tables are only for dense state comparison when they help scanning.


### Surface Transition / Branch Inventory

Before converting goals into `3.0`, audit how planned `4.0` surfaces connect. This inventory is about interface/state transitions, not every local control.

For each surface, classify visible interactions as:

- `primary CTA`: the main action that advances to the next surface, result, confirmation, or loop closure.
- `branch trigger`: a tab, secondary CTA, message, entry, external jump, close/back action, or blocked/failure trigger that changes destination, feedback, recovery, or loop closure.
- `local control`: filters, sorting, dropdowns, item selection, quantity adjustment, local selected state, and other operations that stay within the same surface.
- `passive/system consequence`: background refresh, compensation, notification, external mail/result, red dot, or toast that the player may see but does not actively operate as a core goal.

Only `primary CTA` and `branch trigger` candidates enter `3.0`. `local control` stays in the owning `4.0` wireframe and notes. `passive/system consequence` becomes local state, toast, external-surface example, right-side note, or `AI待确认` risk unless it creates a real player-operated loop.

## 5. Representation Ownership

Before adding anything to the board, decide where it belongs.

- Product value or player problem -> `1.0`.
- Goal-level player journey -> `3.0`.
- Player-visible interface/state/feedback -> `4.0` left wireframe.
- Source rule, condition, dependency, or implementation impact -> `4.0` right note.
- Missing decision, contradiction, or feature-design risk -> `AI待确认`.
- Pure backend mechanism, schedule, permission matrix, refresh order, config source, or QA checklist -> not a left wireframe.

Mechanism-to-UI conversion rule:

- Refresh, reset, settlement, forced order, price/quota/limit update -> local value/list update, small tip, toast, disabled reason, countdown/stale-state copy, or right note.
- Source-defined external result -> draw the actual external surface only when the PRD defines that surface; otherwise keep it as a note.
- Permission gate -> locked entry, disabled button, blocked toast, pre-entry warning, or AI pending about wasted visit.
- Server validation -> waiting state, retry/failure toast, button lockout, rollback/refresh state, or right note.
- Configuration/order -> visible category order, filter/sort result, empty fallback, or right note.

Do not create a standalone mechanism screen or combine unrelated prompts with external claim/mail content. If no player-visible consequence can be identified, keep the mechanism out of the main board or ask whether it should be in scope.

## 6. Goal Flow Graph Modeling

Create `3.0` as player goal graphs, not as PRD-heading lists or template-shaped step strips.

Before drawing, create three concise internal inventories in this order:

- `4.0 Surface / Note Inventory`: each player-visible surface/state/feedback moment maps to a `4.0` interface/state; non-screen content is classified as decision/branch/local state/external dependency/right-side note or `AI待确认`.
- `Surface Transition / Branch Inventory`: each surface records primary CTAs, branch triggers, local controls, passive/system consequences, destination/result surfaces, and failure/recovery returns.
- `Goal Flow Graph inventory`: each top-level graph passes the `Top-level Goal Promotion Gate`, then records player goal, entry, main success path, surface transitions, end/return, optional decision/failure/merge/loop/sub-flow units, and matching `4.0` surfaces.

Template visual language is mandatory, but template topology is not. Do not inherit node count, single-line layout, fixed order, or branch shape from the template example.

Designer Flow Grammar:

- Available units: diamond decision, branch line, merge, loop, dashed optional route, mode lane, external-surface node, nested sub-flow node.
- Use these units only when they make the player goal graph clearer.
- Do not add a decision/failure branch just to satisfy a format.
- Do not omit a real decision/failure/return to fit the template.
- Complex sub-processes may be folded into a nested sub-flow node, but define its input, output, and return path.

Top-level Goal Promotion Gate:

Promote a candidate into a top-level `3.0` graph only when all are true: the player actively enters, operates, and decides; it mainly contributes to the current feature goal; it has a clear enter -> operate -> decide/confirm -> result -> return/continue loop; and omitting it would make the feature hard for designers to understand.

Do not promote existing-system entries, prerequisite setup, passive compensation, backend schedules, limit explanations, or one-off reminders. Demote them to pre-entry context, local state/toast, external-surface example, right-side note, or `AI待确认` risk unless the source makes them an active player-operated loop.

Surface transition ownership rule:

- If a `primary CTA` or `branch trigger` opens a new surface, modal, result, external surface, return target, failure/recovery path, or loop closure, represent it in `3.0`.
- If an interaction only changes local selection, quantity, filtering, sorting, disabled reason, value, toast, or explanatory note, keep it inside the owning `4.0` surface.
- Do not merge distinct branch triggers on the same surface when they lead to different destinations or feedback loops.

Mechanism ownership rule:

- Refresh, reset, settlement, permission, quota, validation, and backend-order rules are not top-level player goals.
- Attach them to the owning goal as a decision, branch, disabled/local state, toast, external surface, right-side note, or `AI待确认`.

Step split boundary:

- Merge tiny implementation steps when they share the same player goal, same surface, and same feedback stage.
- Split stages that change the player's visible task, decision basis, confirmation/reveal moment, success/failure feedback, lifecycle state, or destination.
- Do not merge a primary operation with its success/result surface when the result changes what the player sees or receives.

Surface split boundary:

- One left wireframe equals one player moment, not a state collection.
- Split modal confirmation, loading/waiting, success/failure result, toast/local tip, mail/external surface, and returned/refreshed state when they are different moments or layers.
- Keep mutually exclusive feedback states out of the same frame.
- If a surface is only a rule or backend mechanism, keep it as a right-side note unless the player sees a concrete UI consequence.

## 7. State and Lifecycle Scan

Run this scan for every important operation/control/object.

Entry and visibility:

- locked/unlocked, visible/hidden, highlighted, red dot, unavailable, expired

Data:

- loading, empty, error, stale, refreshed, failed, offline, partial data

Controls:

- default, active, selected, disabled, waiting, clicked, cooldown, repeated tap, cancelable

Lists/cards/items:

- available, unavailable, owned, unowned, new, locked, selected, completed, claimable, claimed, sold out, full

Economy and capacity:

- enough, insufficient, spending, refunded, quota used, inventory full, duplicate/conflict, cap reached

Navigation:

- close, back, cancel, confirm, outside tap, interrupted, return target, post-return refresh

Temporal feedback:

- loading, animation, VFX/audio, lockout, skip/interrupt, reward reveal, toast, result screen

Secondary lifecycle:

- For save/favorite/delete/equip/invite/record/claim/batch/replace/overwrite/craft/sell actions, check precondition, disabled state, capacity/full state, conflict/replacement path, success feedback, failure feedback, refresh, and return.

## 8. Control and Wireframe Fidelity

- Choose controls by player behavior: tabs for same-level content, lists/cards for selection, slots for placement, dropdown/filter for narrowing, steppers for quantity, buttons for commands, modals for blocking decisions, toast for lightweight feedback.
- Draw the actual affordance for visible functions. If notes mention a visible action/control/state, the wireframe should show it unless intentionally hidden.
- Use neutral low-fidelity UI. Accent color is for selected state, key marker, progress, or primary CTA.
- Do not place large rule descriptions inside player screens.
- Layer order: base list/card < pinned navigation/HUD < dropdown/filter/popover < modal/loading mask < toast/top notice.
- A `1334x750` game frame should pass the player-screenshot test: it looks like something a player could plausibly see, tap, close, read, wait on, or return to.

## 9. AI Pending Coverage Rule

`AI待确认` exists to expose design risk, not to list every edge case or satisfy a minimum count.

Run an `AI Risk Mining Pass` before selecting final visible questions. Mine candidates from three layers:

1. Product intent: unclear motivation, value expression, loop closure, first-time teaching, or why the player should care.
2. Action/flow branches: unclear entry, decision basis, failure/recovery, return target, wasted action, irreversible cost, or social/economic trust issue.
3. Interface expression: missing preview, hidden precondition, weak comparison, unclear copy hierarchy, feedback timing, reward visibility, or cross-surface handoff.

Select the strongest questions, attach them to the affected `4.0` surface/control/state, and remove duplicates. Do not shrink risk mining to one board-level item.


For every top-level player goal and every high-risk decision/failure/recovery/reward/return point, check:

1. Player motivation and value: why the player wants to do this, whether the feature value is visible, whether the loop closes.
2. Decision basis: whether comparison, recommendation, sorting, pricing validity, reward preview, or reason copy is enough for a player to decide.
3. Dead-end and recovery risk: wasted visits, blocked actions, no return path, failure without recovery, hidden preconditions.
4. Cognitive load: too many rules, unclear hierarchy, late rule disclosure, conflicting surfaces.
5. Feedback/loop closure: whether success, failure, waiting, consumed, refreshed, claimed, returned, or recovered state is clear.
6. Boundary QA: network failure, repeated tap, server rollback, capacity, stale data, cross-device sync.

Good question shape:

`When [module/control/state] meets [condition], should [decision A/B/C]? This affects [layout/state/feedback/return/recovery].`

If no `AI待确认` is added for a goal or risk point, the source must already resolve those concerns clearly. Do not ask about a state the PRD already excludes; ask how confirmed restrictions are taught, shown, recovered from, or routed around.

## 10. Common Game Patterns

Use these as prompts, not assumptions:

- Event/sign-in/task: cycle reset, missed state, progress sync, reward preview, claim/batch claim, red dots.
- Shop/exchange: stock, limit, price, owned state, insufficient currency, sold out, refresh.
- Mail/reward: claimability, expiry, one-click exceptions, reward reveal, inventory full.
- Social/gifting/visiting: target eligibility, relationship threshold, sender/receiver quota, irreversible confirmation, record/history, passive receipt.
- Inventory/collection/atlas: owned/missing count, filters, sorting, source jump, locked/mystery state, detail panel, progress reward, external target return.
- Save/favorite/manage: save precondition, capacity, duplicate/conflict, replacement/overwrite, delete confirmation, success toast, refreshed list position.
- Progression/upgrade/craft/cook/sell: material check, preview, before/after comparison, result quality, animation, rollback, consume, success/failure feedback.
- Multiplayer room: host/guest/spectator permissions, room lifecycle, invite/join/password, ready/start, disconnect, settlement, return.

Source-supported or strongly implied behavior can be modeled; unclear behavior becomes `AI待确认`.
