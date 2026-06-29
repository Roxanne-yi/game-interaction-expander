# Output Quality Model

Use this reference as the quality model for the whole PRD-expansion output. It defines what counts as a usable game interaction pre-brief, not a list of past mistakes.

Do not expose this model as visible methodology on the Figma board. Use it internally before drawing and again before final delivery.

## 1. Interaction Blueprint Gate

Before creating Figma content, derive an internal blueprint for every important module. Do not jump from PRD headings directly to wireframes.

For each module, answer:

- Source fact class: which rules are confirmed facts/preconditions, which are interaction gaps, which are feature-design risks, and which are boundary QA.
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

## 4. Flow Ownership Gate

Feature flow must be organized by player goals, not PRD section order.

Before judging the board, confirm there is a clear internal `Flow inventory` and `Screen inventory`: each player-visible `3.0` node maps to a `4.0` interface/state, while non-screen mechanisms are intentionally classified as notes, external dependencies, or `AI待确认`.

The main flow should usually follow:

`entry -> main/key interface -> key operation -> validation/confirmation/resource consumption -> feedback/result/reward -> return/loop`

Fail the flow if result, reward, or benefit delivery appears before validation, confirmation, or resource/cost consumption.

Branch flows are only for player-operated subflows with their own goal, entry, operation loop, and destination. Examples include record/history, request/wish, receive/claim, save/manage, external jump, social collaboration, detail inspection, and secondary/tertiary interfaces that continue the task.

Do not promote boundary handling into `other flows` by default. Network failure, insufficient resource, refresh exception, timed reset, missing config, periodic update, and backend settlement usually belong beside the owning interface as states, feedback, or AI follow-ups unless they create a player-operated recovery path.

Flow readability must follow the template pattern:

- Each step is readable as `external node title -> grey action card`, not as a generic card with a title buried inside.
- Main flow should scan horizontally in one line when space allows; branch flows should be grouped separately without pretending to be the same sequence.
- Template node count and placeholder position must not limit flow count, branch count, or causal order.
- Flow cards should be short enough to understand the journey at a glance. Detailed validation, state sets, and exception rules belong in feature-detail modules.

## 5. Right-Side Explanation Gate

Right-side notes should read like designer-facing interaction-spec content, not AI reasoning.

They should explain:

- What this interface or module does.
- What regions/modules it contains.
- What states exist.
- What conditions trigger state changes.
- What happens after player actions.
- What feedback, toast, modal, animation, audio, VFX, lockout, refresh, or return behavior is needed.
- What PRD gaps require confirmation.

Right-side notes should be visual when state differences are visual:

- For multi-state modules, add compact local UI examples beside the relevant note.
- Local examples must mirror the owning component from the left wireframe: same card/button/node/slot/HUD/modal anatomy at smaller scale.
- Do not create unrelated generic state boxes that cannot be matched back to the left-side interface.
- Local examples support the explanation; they do not replace full player-screen frames.

Multi-state state-strip gate:

- If one component has multiple meaningful states, the module is incomplete until the right-side note includes a local state strip or an equivalent image-plus-text component example.
- The strip should make the state change visible at component level, not only describe it in prose. Typical targets are item cards, rows, buttons, material slots, reward nodes, progress nodes, HUD icons, modal actions, toast feedback, and red-dot entries.
- Judge the strip by traceability: can a reader point to the left-side component and immediately recognize that the right-side examples are variants of the same element? If not, redraw them.
- Generic status cards count as a failure even if their text is correct, because they do not reduce the designer's work of translating states into interface expression.
- The strip must pass a layout sanity check: no child text/UI overflows into nearby note text, and the card does not carry long rule descriptions that should be written in the note body.
- Do not confuse component states with player-operation stages. A multi-state strip is for the same component changing appearance or availability. If the content is a sequence of player-visible stages or branches after an action, model it as separate frames, a compact flow, or module notes instead.
- If multiple wireframes represent tabs, modes, or states of the same interface, the stable frame should remain consistent; if the frame changes substantially, it should be classified as a different surface.

Avoid exposing AI method, internal chains, config tables, raw field names, backend-only issues, or "left side/right side should" instructions.

## 6. AI Follow-Up Gate

AI follow-ups should help interaction designers avoid doing secondary planning from scratch. They must not devolve into only edge-case QA.

Prioritize:

1. Logic completion: missing entrance, state, precondition, result, return path, lifecycle, cross-surface update, or state transition.
2. Interaction gap after confirmed facts: how source-stated gates, permissions, limits, costs, quotas, and dependencies are communicated, disabled, guided, recovered from, refreshed, or returned from.
3. Feature loop: why the player acts, what they gain, how the system value is visible, whether the player has enough basis to decide, and whether reward, growth, social, collection, economy, or efficiency motivation closes.
4. Design reasonableness: use the absorbed game interaction principles to question whether the design is understandable, usable, and aligned with its product purpose.
5. Boundary QA: failure, refresh, empty state, repeated tap, network, rollback, capacity, sync, exception recovery.

For design reasonableness, ask principle-driven questions such as:

- Does the feature match the target player's motivation, cognition, and operation habits?
- Are rules visible, predictable, and feedback-rich before the player fails?
- Is the complexity appropriate for the player's stage and task urgency?
- Is backend/system complexity being pushed onto the player as mental burden?
- Is there a lighter, clearer, fewer-step way to achieve the same design goal?
- Should information be layered, hidden until needed, recommended by default, folded, filtered, batched, or automated?
- Does the design create avoidable pressure such as forced social behavior, forced memory, forced comparison, repeated confirmation, or excessive manual management?

Never ask about a scenario that the PRD already forbids, gates, or resolves. Ask about the next undefined interaction decision after the source fact is locked.

Do not flatten facts and flaws. A PRD-stated prerequisite is a confirmed fact first; an AI follow-up should ask where and how players learn or recover from it. A source-backed design can become a feature-design risk only when it weakens the product goal, player motivation, decision basis, operation loop, or system value.

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
- Do flow/screen inventories match: every player-visible flow node has a `4.0` interface/state, and mechanisms are not disguised as screens?
- Does the flow include entry, operation, validation, result, return, and loop where needed?
- Do AI follow-ups include logic completion, feature loop, and design reasonableness before boundary QA?
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
