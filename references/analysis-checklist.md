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

## 5. Representation Ownership

Before adding anything to the board, decide where it belongs.

- Product value or player problem -> `1.0`.
- Goal-level player journey -> `3.0`.
- Player-visible interface/state/feedback -> `4.0` left wireframe.
- Source rule, condition, dependency, or implementation impact -> `4.0` right note.
- Missing decision, contradiction, or feature-design risk -> `AI待确认`.
- Pure backend mechanism, schedule, permission matrix, refresh order, config source, or QA checklist -> not a left wireframe.

Mechanism-to-UI conversion rule:

- Daily refresh -> updated price/list, notice, countdown, toast, stale-state copy, or right note.
- Weekly forced recovery -> mail, claim state, red dot, returned currency result, or right note.
- Permission gate -> locked entry, disabled button, blocked toast, pre-entry warning, or AI pending about wasted visit.
- Server validation -> waiting state, retry/failure toast, button lockout, rollback/refresh state, or right note.
- Configuration/order -> visible category order, filter/sort result, empty fallback, or right note.

If no player-visible consequence can be identified, keep the mechanism out of the main board or ask whether it should be in scope.

## 6. Flow Modeling

Create two levels of flow.

Goal-level feature flow:

- Keep the main flow to the smallest readable journey, usually 5-8 steps.
- Good shape: entry surface -> main interface -> browse/configure -> primary action -> confirm/transition -> result/refresh -> return/cross-system impact.
- Add branch flows only when they have their own player goal, recognizable entry, operation loop, and return/destination.
- Good branch examples: receive/claim from another role, view record/history, manage saved items, external jump, accept invitation, mail claim, visitor/owner path.
- Do not put boundary handling into `other flows` just because it is important. Resource shortage, failed validation, missing data, no permission, reward/config exception, and unavailable state usually belong beside the relevant module unless they create a player-operated recovery flow.

Local operation flow:

- Keep filters, card clicks, local state changes, detail panels, disabled reasons, and state sets beside their owning module.
- Do not promote every local tap into the main flow section.
- Do not let a flow diagram replace the interface frames for player-visible states.

Step split boundary:

- Merge tiny implementation steps when they share the same player goal, same surface, and same feedback stage.
- Split stages that change the player's visible task, decision basis, confirmation/reveal moment, success/failure feedback, lifecycle state, or destination.
- Do not merge a primary operation with its success/result surface when the result changes what the player sees or receives.

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

## 9. AI Pending Triage

`AI待确认` exists to expose design risk, not to list every edge case.

Prioritize:

1. Product/logic completion: missing page, state, condition, transition, return path, lifecycle, or state update needed to make the feature understandable.
2. Player motivation and value: why the player wants to do this, whether the feature value is visible, whether the loop closes.
3. Decision basis: whether comparison, recommendation, sorting, pricing validity, reward preview, or reason copy is enough for a player to decide.
4. Dead-end and recovery risk: wasted visits, blocked actions, no return path, failure without recovery, hidden preconditions.
5. Cognitive load: too many rules, unclear hierarchy, late rule disclosure, conflicting surfaces.
6. Boundary QA: network failure, repeated tap, server rollback, capacity, stale data, cross-device sync.

Good question shape:

`When [module/control/state] meets [condition], should [decision A/B/C]? This affects [layout/state/feedback/return/recovery].`

Avoid weak questions such as `state needs confirmation` or `display strength needs confirmation`.

Do not ask about a state the PRD already excludes. Ask how confirmed restrictions are taught, shown, recovered from, or routed around.

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
