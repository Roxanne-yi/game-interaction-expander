# Interaction Analysis Checklist

Use this reference as the internal reasoning method. It is not a visible board template.

For Figma wireframe usability, also apply [wireframe-design-principles.md](wireframe-design-principles.md). Use those principles as internal checks, not as visible section titles.

For whole-board quality gates, apply [output-quality-model.md](output-quality-model.md). Use it to derive the internal blueprint and final dual review; do not expose it as board methodology.

## 1. Source Model

- PRD/wiki/PDF is the primary source.
- HTML prototype is functional evidence only: pages, labels, available actions, sample states, and contradictions. Do not inherit its layout.
- Existing interaction specs may calibrate fidelity and writing style, but do not copy their decisions into a different feature.
- AI inference must be marked as inference or follow-up, not source fact.
- Keep numeric values source-backed. If values are unclear, ask follow-up; if later design specs differ, treat them as possible post-PRD decisions unless the PRD clearly says otherwise.
- Extract source facts and preconditions before generating AI follow-ups. A follow-up must not ask about a scenario that the source already forbids, gates, or resolves.
- Before judging a rule, classify it in an internal source fact ledger:
  - Confirmed fact or precondition: the PRD clearly states the rule, gate, permission, limit, order, cost, or dependency. Respect it as feature truth.
  - Interaction gap: the fact is valid, but player-facing communication, operation, feedback, recovery, return, or state change is not defined.
  - Feature-design risk: even if source-backed, the mechanism may not support the product goal, player motivation, decision clarity, or operation loop.
  - Boundary QA: failure, refresh, empty data, repeated tap, rollback, capacity, sync, or exception handling.
- Do not treat every restrictive rule as a design flaw. A source-stated gate is first a precondition; question how it is taught, surfaced, recovered from, or routed around.
- Do not treat every source-stated rule as automatically good. If the rule makes the feature goal hard to understand or operate, classify the concern as a feature-design risk rather than as a source contradiction.
- Treat configuration tables, field names, IDs, and enum names as source evidence, not designer-facing content. Extract what they imply for the interface: category names, sort/filter behavior, state conditions, fallback display, empty/error states, reward validity, red-dot behavior, or jump targets.
- Use a visible-function source gate. Every visible page, tab, navigation item, button, control, feature name, or system entry in the output must be one of:
  - explicitly described by the PRD/wiki/PDF
  - present in the HTML prototype as functional evidence
  - clearly labeled as AI follow-up, suggestion, or unresolved possibility
- Do not silently add common game functions such as ranking, rules, shop, help, mailbox, leaderboard, share, or guide just because the feature type often has them.
- Run a scope gate after the source gate. Source-backed content can still be out of scope if the user asked for only one feature, category, tab, phase, or module inside a larger PRD.
- Classify source-backed but out-of-scope content as global context, sibling module, future phase, cross-surface dependency, or AI follow-up. Do not merge it into the current feature's main interface, main flow, local notes, or red-dot priority unless it directly affects the current scope.
- Run a consistency scan before forming the final blueprint. Check whether terminology, numbers, limits, eligibility, state names, reset timing, reward/cost rules, process order, and old/new system behavior contradict each other across PRD sections, tables, images, and HTML functional evidence.
- Treat inconsistency as an interaction problem only when it affects what to draw, which state is valid, where the player goes, what feedback appears, or whether the player can understand the rule. Minor wording drift can stay out of the main board.
- Keep an internal source-location ledger for core modules, flows, and state rules. Track the PRD section, paragraph, table, image, or HTML evidence used to support each major claim so the analysis does not ask about facts the source already resolved.
- Do not expose the source-location ledger on the board by default. Mention source location only when resolving a contradiction, separating PRD fact from AI inference, or explaining why a rule is treated as confirmed.

## 2. Product Interpretation

Before drawing, write a short product thesis:

- Why does this feature exist in the game now?
- What player behavior, content loop, information problem, or social/economic need does it solve?
- Which player groups are mainly affected?
- What outcome should it create: motivation, clarity, convenience, recognition, rhythm, retention, progression, or loop completion?

Product interpretation should be positive and feature-facing. Do not put PRD quality warnings, HTML caveats, missing-state lists, config names, or AI process notes here.

Use this translation path before writing the thesis:

`mechanic/source fact -> player motivation or pain point -> product/experience outcome`

Then compress the thesis into three one-sentence answers:

1. Why: what resource, behavior, or loop is being transformed into what product value?
2. Who: which player motivation group is mainly served?
3. Outcome: what should players understand, feel, or continue doing after the feature works?

Use concise design-consensus sentences, not explanatory paragraphs. Each answer should contain one core judgment.

Reusable compression patterns:

- Background/problem: `将 [resource/behavior] 从 [current role] 转化为 [long-term goal or experience loop].`
- Target players: `服务 [core motivation group]，以及 [secondary goal group].`
- Desired outcome: `让玩家清楚 [current state/gap/next step]，并通过 [progress/reward/feedback] 持续驱动 [target behavior].`

Examples:

- `ingredient atlas added` -> `collection/exploration players need a centralized target` -> `strengthen collection desire and reduce cross-system lookup cost`
- `map source shown for ingredients` -> `players want to know where to keep exploring` -> `make missing-item recovery feel guided instead of blind`
- `progress reward exists` -> `long-term completion needs visible return` -> `turn reference browsing into a collectible progression loop`
- `cooking consumes battle drops` -> `all players need a light out-of-match resource loop` -> `connect combat drops, cooking, and next-match preparation`

Avoid stopping at a feature summary. A product-positioning sentence should explain why the function matters to players, not only what the function contains.

## 3. Main Interface First

Find the main interface: the surface where the core player operation happens.

Then expand outward:

- Entry: where the player comes from and why they would enter.
- Main interface regions: navigation, mode area, operation area, list/card/slot area, preview/status area, action area.
- True modes: change content model, operation goal, or success criteria.
- Helper operations: fill, repeat, recommend, filter, sort, preview, or assist the current operation.
- Embedded regions: visible information that supports the current operation.
- Modals/popups: confirmation, selection, password, overwrite, error, or blocking states.
- Temporal states: loading, sending, claiming, animation, transition, reveal.
- Result states: refreshed page, changed counter, reward/result page, toast, return cue.
- External surfaces: hub/lobby, inventory, mail, profile, battle prep, settlement, HUD, records, history, invitation, or receiver/passive surfaces.

The output hierarchy must match this analysis. Helpers should not look like equal top-level pages; true modes should be visible as tabs/modes/panels; external surfaces should be separate modules or explicit follow-ups.

Before drawing the main interface, derive a usable skeleton:

- Player goal: what the player is trying to do now.
- Entry/trigger: how the player reaches or starts this operation.
- Navigation: page/tab/mode/panel/close/back/return relationship.
- Main content: list, card grid, slots, preview, detail, progress, or HUD area.
- Main operation: primary action and its preconditions.
- Helper operations: filter, sort, select, repeat, recommend, preview, compare, batch, manage.
- Rule visibility: unavailable/locked/disabled/selected/owned/new/claimed/expired states.
- Feedback and loop: result, toast, modal, animation, refreshed state, return surface, next reason to come back.

Scope boundary check:

- If the PRD describes a whole system but the requested board is for one category or sub-feature, keep sibling categories and global systems out of the core flow.
- Include global systems only where they change the current feature's entry, red dot, return state, shared progress, or visible navigation.
- If a global system is source-backed but its relation to the current scope is unclear, mark it as an AI follow-up such as: "This is a system-level reminder; confirm whether this board should include it or leave it to the global board."

## 4. Operation Hotspot Audit

Apply this to every feature, including data-display or atlas-like features. Do not only move content taxonomy or config tables into the board.

Hotspots include places where the player:

- enters, exits, closes, backs, cancels, or returns
- taps, selects, switches tabs/modes, filters, sorts, searches, expands, previews, or opens detail
- claims, sends, saves, deletes, equips, invites, batches, confirms, replaces, overwrites, or consumes
- waits for loading/animation/server confirmation
- sees a counter, red dot, disabled state, empty state, lock, failure, or refreshed result

For each important hotspot, reason internally:

`trigger -> player operation -> immediate feedback -> validation/data update -> result state -> failure state -> next destination`

Before asking questions about a hotspot, separate:

- Established source fact: what the PRD already says.
- Preconditions: what must be true before the operation is available.
- Excluded states: what cannot happen because the PRD has gated it.
- Interaction gaps: what still affects screen structure, player understanding, feedback, recovery, or return path after the source fact is accepted.
- Feature-design risks: whether the accepted mechanism still fails to support the feature's value, such as missing comparison basis, hidden motivation, avoidable dead end, unclear reward, or excessive mental load.

Use the result to decide:

- draw as interface frame
- draw as modal/popup
- draw as transition/performance frame
- draw as result/return frame
- describe in right-side notes
- ask as AI follow-up

Do not output raw hotspot tables by default. A table is only appropriate when it makes a dense state comparison easier to scan.

If a rule is only a mechanism, schedule, permission matrix, refresh order, or backend condition, do not turn it into a fake player screen. Anchor it to the UI that changes because of the rule, such as an entry lock, disabled button, updated price, refreshed list, toast, modal, red dot, or return state.

## 5. Flow Modeling

Create two levels of flow.

Goal-level feature flow:

- Keep the main flow to the smallest readable journey, usually 5-8 steps.
- Example shape: entry surface -> main interface -> browse/configure -> primary action -> confirm/transition -> result/refresh -> return/cross-system impact.
- Add branch flows only when they are real player-operated subflows: they have their own player goal, recognizable entry, operation loop, and return/destination.
- Good branch examples: wish/make request, view record/history, receive/claim from another role, manage saved items, external jump to source, accept invitation.
- Do not put boundary handling into `other flows` just because it is important. Resource shortage, failed validation, missing data, no permission, reward/config exception, and unavailable state are usually state/risk notes beside the relevant module unless they create a player-operated recovery flow.

Local operation flow:

- Keep filters, card clicks, local state changes, detail panels, disabled reasons, and state sets beside their owning module.
- Do not promote every local tap into the main feature-flow section.
- Do not let a flow diagram replace the interface frames for player-visible states.

Representation ownership:

- Before drawing, decide whether each stage belongs as an independent interface, modal/popup, local component state, temporal/performance frame, result/return frame, right-side note, or AI follow-up.
- Mechanisms, refresh rules, permission matrices, schedules, configuration, and backend conditions are not standalone player screens. Anchor them to the interface they change: entry, navigation, button, card/list, red dot, toast, modal, result, or return state.
- Avoid squeezing multiple visible stages into one interface. If the player sees a different screen phase, operation goal, feedback rhythm, state update, or return path, draw it as a separate frame or module.
- Split across system surfaces by default. Lobby/hub, feature panel, friend/visitor surface, inventory/bag, mail, shop, HUD, settlement, profile, and notification surfaces should not be combined into one `1334x750` player screen unless the PRD explicitly describes an overlay on the same surface.
- If one action causes another system surface to change, connect them by flow, return cue, right-side note, or a separate frame. Do not place the other system's screen inside the current screen just to show the consequence.

Step merge boundary:

- Merge tiny implementation steps when they share the same player goal, same operation surface, and same feedback stage.
- Do not merge stages that change the player's visible task, decision basis, confirmation/reveal moment, success/failure feedback, lifecycle state, or destination.
- Boundary handling belongs beside the owning module unless it creates a real player-operated recovery flow.
- Do not merge a primary operation with its success/result surface when the result changes what the player sees or receives. For actions such as make/craft/cook/claim/send/sell/save/replace/invite, the analysis must account for success feedback, result/reward display, data refresh, and return state.

## 6. State and Lifecycle Scan

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

- For save/favorite/delete/equip/invite/record/claim/batch/replace/overwrite actions, check precondition, disabled state, capacity/full state, conflict/replacement path, success feedback, failure feedback, refresh, and return.

## 7. Control Fidelity

- Run the visible-function source gate before drawing controls. If a control is not source-supported, either remove it or mark it as a clearly labeled AI follow-up/suggestion.
- Draw the control family the source implies: filter, sort, toggle, checkbox, dropdown, segmented control, tab, slot, card, list row, copy button, batch action, modal, toast, HUD icon.
- If exact control type is unclear, draw the most neutral visible affordance and ask a follow-up.
- Floating controls and feedback layers must visually sit above base content: base list/card < pinned navigation/HUD < dropdown/filter/popover < modal/loading mask < toast/top notice.
- For expanded controls, plan two layers: first draw the base interface, then draw the expanded dropdown/filter/popover as a separate top layer. If overlap is unavoidable, dim, mask, crop, or move base content so the top layer is unmistakably above it.
- If notes mention a player-visible action/control/state, the wireframe should show the corresponding affordance unless the logic is intentionally hidden.
- Raw config/table/field names should become player-facing labels, fallback states, sorting/filtering rules, reward behavior, red-dot behavior, or follow-up questions.
- Player-screenshot test: a 1334x750 game frame should look like something a player could plausibly see, tap, close, read, or wait on. If it is mainly explaining rules to the designer, it is not a game frame.
- Control selection test: choose controls by behavior, not by convenience. Information uses labels/counters/bars/badges; navigation uses tabs/lists/close/back/jumps; commands use buttons/toggles/dropdowns/inputs/steppers. If the control type is wrong, the wireframe will look unreliable even at low fidelity.

## 8. Basic Wireframe Usability

Use this as a quick game-UE sanity pass before mapping modules to Figma.

- Useful: does the feature solve a player need or product goal visible enough to justify the operation?
- Usable: does the module have trigger, rule, feedback, and loop?
- Primary action: is there one dominant action or a clear reason none exists?
- Information hierarchy: are navigation, content, detail/preview, action, and feedback separated?
- Gestalt: are related items grouped, same-type controls consistent, rows/cards aligned, and continuation/scroll/pagination visible?
- Touch effort: are frequent actions close to the relevant content and large enough; are destructive/low-frequency actions less likely to be accidental?
- Navigation closure: can the player return, close, cancel, or recover from every secondary surface?
- Feedback placement: does feedback appear where the player expects to see the result?
- Consistency: are same concepts, actions, and states represented the same way across modules?
- Support material: if content is mainly mechanism, schedule, rule order, or QA, keep it out of 1334x750 game frames.

## 9. Configuration Translation

Before writing any designer-facing note, filter source configuration through this question: "What does this change for the player's interface or the designer's next decision?"

Interaction relevance gate:

- If a finding is only `table/field/ID/config is invalid or missing`, do not surface it as-is.
- First translate it into player impact: visible state, disabled action, fallback display, feedback, red-dot behavior, recovery path, return destination, or layout requirement.
- If no player-visible impact can be identified, omit it from the main board or compress it as a source dependency rather than a high-emphasis AI follow-up.
- Do not make designers read data-owner cleanup. Make them see the decision that affects interaction.

Keep:

- category/group names when they are player-visible
- sort/filter behavior and whether selection, count, or scroll resets
- states created by data: empty list, missing asset, unknown source, invalid reward, stale count, locked/unlocked, new/claimed
- boundary cases and player-facing recovery: no data, config not ready, resource missing, server failure, fallback image/text, disabled action, returned result
- concise source dependency only when it explains a real design risk

Compress:

- table names, field names, IDs, enum names, and config order into a plain rule such as `具体分类和排序以策划配置为准`
- long config provenance into a technical note only when traceability is necessary

Avoid:

- writing table names like `FoodMaterialBook` or `MapModeFilter` as normal planning notes
- explaining where the data comes from without saying what the player sees, what can fail, or what state must be designed
- treating configuration absence as a technical fact only; translate it into the visible question, such as whether the list shows empty state, placeholder cards, locked cards, or waits for release
- asking about invalid rewards, missing IDs, or config failures unless the question is phrased as player-facing behavior: whether the button recovers, whether the reward enters mail, whether the red dot remains, what feedback appears, or how retry works

Good conversion examples:

- Weak: `FoodMaterialBook 全量条目按 OrderID 升序。`
- Better: `食材分页按策划配置排序；分类切换后列表、计数和选中状态需要同步刷新。`
- Weak: `FoodMaterialBook 当前只有字段结构。`
- Better: `正式数据为空或资源未齐时，首页列表显示空态、灰卡占位还是等待配置开放，需要确认。`
- Weak: `MapModeFilter controls map filter.`
- Better: `地图筛选只改变列表结果和计数；切换后是否保留当前选中卡片需要确认。`
- Weak: `RewardID invalid.`
- Better: `领取失败后按钮恢复可领、保持领取中，还是进入重试态？这会影响失败反馈、红点清除和恢复路径。`

## 10. Local UI State Examples

Use compact local UI examples when state differences are visual and text alone would make the designer infer too much.

- Derive the example from the owning component in the left wireframe. Preserve the same component anatomy at smaller scale.
- For cards, keep the meaningful parts: icon or silhouette, item name, status badge, NEW marker, claim/progress label, lock/unknown mark, or selected state.
- For buttons, keep label, enabled/disabled/loading/claimed treatment, click feedback, and red-dot or counter if relevant.
- For progress nodes, keep node shape, reached/unreached/claimable/claimed treatment, connection line, reward marker, and current-position cue.
- For HUD/icons, keep anchor position, icon, timer/counter, detail tooltip, active/cleared state, and priority against other HUD elements.
- Do not draw unrelated generic rectangles. A local state miniature should be recognizable as the same control or object the module is explaining.
- Pair each miniature set with text that explains conditions, click behavior, feedback, and refresh/return result.

## 11. Cross-Surface and Role Scan

After the main flow, look for additional flows:

- different actor: sender/receiver, host/guest, owner/visitor, player/spectator, admin/system
- different entry: inventory, mail, invitation, settlement, HUD, activity entry, shortcut, external jump
- different affected surface: lobby display, inventory item, mail receipt, battle-prep slot, profile card, settlement, HUD status, notification, record/history
- different timing: before operation, after success, after failure, during match, after settlement, on return
- different goal: manage, review, receive, recover, edit, accept, consume, inspect

If source explicitly says another surface changes, draw it. If only implied, ask a follow-up near the related module.

Do not over-absorb global systems:

- A global reward, ranking, honor, account status, or shared notification can be source-backed but still belong outside the current feature detail.
- If it only shares the same entrance or red-dot layer, summarize it in the red-dot/global dependency area rather than adding it to the current module's local behavior.

## 12. Follow-Up Triage

Only surface questions that affect what to draw, what state to support, where the flow goes, what feedback appears, why the player acts, or how the player recovers.

Before writing visible AI follow-ups, triage design readiness internally:

- Directly drawable: entry, main operation, key states, result, and return are clear enough. Draw it normally.
- Drawable with assumption: the interface structure is clear, but copy, resource art, exact values, final config, or light feedback is missing. Draw with placeholders or representative UI, and mark the assumption in the note or follow-up.
- Blocking for reliable drawing: entry, scope, core flow, state ownership, permission, reward/cost, operation result, feedback, or return path is unclear. Do not silently invent it; raise a high-priority AI follow-up attached to the affected module.

Unfinalized resources, art, copy, values, or configuration are not automatically blockers. They become blockers only when they change layout structure, available operations, state logic, feedback/recovery, reward delivery, or flow destination.

AI follow-ups should not be only edge-case QA. Prioritize in this order:

1. PRD logic expansion: missing page, state, condition, transition, return path, lifecycle, or state update needed to make the feature understandable.
2. Interaction gaps after confirmed facts: how source-stated preconditions, gates, restrictions, costs, quotas, permissions, and dependencies are taught, shown, disabled, recovered from, or routed after player action.
3. Feature-design risks: player goal is unclear, value is not surfaced, the player lacks a decision basis, operation path creates avoidable frustration, motivation/reward loop is not closed, or system relationship is ambiguous.
4. Design reasonableness: apply the absorbed game interaction principles to ask whether the design fits the target player's cognition, motivation, task stage, information load, and product purpose; whether rules are visible/predictable/feedback-rich; and whether information should be layered, recommended, folded, filtered, batched, or automated.
5. State and feedback gaps: enabled/disabled/selected/claimed/expired/locked states, feedback strength, animation/result refresh, red-dot clearing.
6. Boundary QA: network failure, refresh timing, repeated tap, server rollback, capacity, stale data, cross-device sync.

- P0: blocks interface structure, state machine, flow destination, or core player operation.
- P1: may cause confusing feedback, wrong visual priority, cross-system desync, or implementation rework.
- P2: copy, polish, minor edge case, or non-blocking tuning.

Use priority internally to sharpen questions. Show visible priority labels only when they improve review readability.

Good follow-up question shape:

`When [module/control/state] meets [condition], should [decision A/B/C]? This affects [layout/state/feedback/return/recovery].`

Avoid weak questions such as "state needs confirmation" or "display strength needs confirmation".

Avoid contradicting the PRD:

- Weak: `If the player has no recycling machine, what does the friend recycling machine show?` when the PRD says friend recycling requires owning one first.
- Better: `Because friend recycling is gated by owning a recycling machine first, should that requirement be shown before visiting friends or only when tapping the friend machine? This affects whether players experience a wasted visit.`
- Feature-risk example: if a feature's core value is choosing the best target or route, but the PRD gives no comparison basis, source facts may be correct while the design goal still fails. Ask whether comparison, recommendation, sorting, or explanation is needed to make the decision meaningful.

Feature-design gap examples:

- If a price or reward is the decision driver, ask whether the UI exposes why it matters, its validity time, and how the player compares options.
- If a precondition blocks the main action, ask where it is taught, whether the player can recover immediately, and whether the route creates unnecessary dead ends.
- If a shared system affects several surfaces, ask where the player sees the authoritative state and how updates propagate.

Technical/config follow-up gate:

- Weak: `RewardID invalid`, `config missing`, `field unavailable`, `table has no data`.
- Better: ask what the player sees and how the UI recovers: empty/placeholder/locked card, disabled action, toast/modal, retry, mail fallback, red-dot retention, rollback, or refreshed result.
- If the answer would only tell planners/programmers to fix a table and would not change the wireframe or state behavior, keep it out of the main board.

Scope follow-up gate:

- If a source-backed item belongs to a broader system, ask whether it is in this board's scope before folding it into the current feature.
- Weak: `Chef level also has a red dot, so add it into the food atlas red-dot priority.`
- Better: `Chef level is a global atlas reminder. Confirm whether this food-atlas board should include its entrance priority, or leave it to the full atlas board.`

## 13. Common Game Patterns

- Event/sign-in/task: cycle reset, missed state, progress sync, reward preview, claim/batch claim, red dots.
- Shop/exchange: stock, limit, price, owned state, insufficient currency, sold out, refresh.
- Mail/reward: claimability, expiry, one-click exceptions, reward reveal, inventory full.
- Social/gifting: target eligibility, relationship threshold, sender/receiver quota, irreversible confirmation, record/history, passive receipt.
- Inventory/collection/atlas: owned/missing count, filters, sorting, source jump, locked/mystery state, detail panel, progress reward, external target return.
- Save/favorite/manage: save precondition, capacity, duplicate/conflict, replacement/overwrite, delete confirmation, success toast, refreshed list position.
- Progression/upgrade/craft/cook: material check, preview, before/after comparison, result quality, animation, rollback, save/share/consume.
- Multiplayer room: host/guest/spectator permissions, room lifecycle, invite/join/password, ready/start, disconnect, settlement, return.

Use these as prompts, not as assumptions. Source-supported or strongly implied behavior can be modeled; unclear behavior becomes AI follow-up.
