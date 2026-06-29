# Figma Output Specification

Use this reference for the visible Figma board. It defines what designers should see, not how Codex thinks internally.

The board is not a PRD summary. It is a translation from planning facts into product intent, player flows, player-visible states, designer-facing explanations, and design risks.

For left-side wireframe usability, apply [wireframe-design-principles.md](wireframe-design-principles.md). Do not expose that reference as visible methodology.

For Figma execution, apply [figma-execution-protocol.md](figma-execution-protocol.md). The default path is direct `use_figma` drawing; renderer and validator scripts are not part of the workflow.

## 1. Destination and Template

Default template:

`https://www.figma.com/design/RbcXtsnRIfCVUXRjUXW99x/%E8%AE%BE%E8%AE%A1%E7%AE%A1%E7%BA%BF%E7%A0%94%E7%A9%B6?node-id=1184-1331&t=noJVA0YdED8KTxqt-4`

Rules:

- Require a Figma destination before generating.
- Use the user-provided template/page when present; otherwise use the default template above.
- Replaceable does not mean restylable. The active template is a strict visual language contract.
- Clone or visually follow the active template before drawing generated content.
- Preserve colors, typography, spacing rhythm, title badges, note labels, section order, top floating/header, footer, background, placeholder dimensions, and component styling.
- Do not shrink template text styles to fit dense content. Shorten wording, extend the module, or push later modules down.
- If more space is needed, extend the board height and move the footer.
- If exact cloning is blocked, report the blocker and preserve the template visually; do not switch to a renderer or draw an unrelated freeform board.

## 2. Board Structure

Default sections:

1. `1.0 Design overview`
2. `2.0 Adaptation plan`
3. `3.0 Feature flow`
4. `4.0 Feature details`
5. Optional `5.0` extension

`1.0`, `2.0`, `3.0`, and `4.0` are global sections and must appear exactly once. When a PRD has multiple major functions, expand only the `4.0` feature-detail module blocks under the single `4.0` section; do not repeat the full board scaffold per major function.

Do not create visible sections named after internal artifacts such as `analysis checklist`, `operation hotspot audit`, `source ledger`, `validator`, or `manifest`.

## 3. Design Overview

`1.0` must keep the template's asymmetric layout.

Product positioning must answer:

- Why this feature exists and what player problem or loop it solves.
- Which player motivation group is mainly affected.
- What experience outcome should improve: clarity, motivation, convenience, recognition, rhythm, recovery, or loop completion.

Use this translation path:

`source mechanic -> player motivation/problem -> desired experience outcome`

Keep the three answers concise and product-facing. Do not write PRD caveats, missing-state lists, config names, drawing instructions, module responsibilities, or process notes here.

Version rows describe the board iteration. First generation has one filled row; later iterations append rows rather than overwrite history.

## 4. Adaptation Plan

`2.0` stays as an empty template by default.

Do not fill adaptation frames, delete placeholders, or resize the template adaptation frames unless the user explicitly asks for adaptation output.

## 5. Feature Flow

`3.0` explains player experience flow, not every local tap or backend rule.

A good main flow shape is:

`entry surface -> main interface -> browse/configure -> primary action -> confirmation/transition -> result/refresh -> return or cross-system impact`

Each flow block should contain:

- Flow name.
- Player-visible screen/state nodes.
- Connectors.
- Condition labels.

Add secondary flows only when they have a distinct player goal, recognizable entry, operation loop, and return/destination. Examples: claim from mail, receive from another role, manage saved items, view record/history, external jump, visitor/owner branch.

Do not draw backend refresh, weekly reset, system settlement, permission matrix, pricing order, or forced recycling order as player flows unless the player actively operates them. Convert them into `4.0` states, reminders, toast, mail, red-dot behavior, or right-side notes.

## 6. Feature Detail Modules

`4.0` uses this fixed hierarchy:

- Major function = one complete module block.
- Minor function = one subtitle group.
- Interface/state explanation = one interface title plus left wireframe and right-side note group.

Module organization:

- Lead with the main interface and its important tabs/modes/panel/helper states.
- Then show primary action checks, confirmations, loading/performance stages, results, returns, secondary operation lifecycles, and cross-surface states.
- Group internal logic under its owning interface. Do not turn every PRD heading into a separate wireframe.
- If a helper fills, filters, sorts, recommends, repeats, or previews the main surface, show it as part of that surface, not as an equal top-level page.
- If a true mode changes content model or operation goal, show it as a visible tab/mode/panel state.

## 7. Player-Visible Interface Test

A left-side `1334x750` frame must look like something a player could plausibly see, tap, close, read, wait on, claim, or return to.

Allowed left-side content:

- main feature panels, tabs, lists, cards, slots, filters, sorting, detail/preview areas
- buttons, toggles, dropdowns, steppers, counters, selected/disabled/locked states
- modal confirmations, blocking errors, loading masks, result screens, toast positions
- mail/reward claim, inventory impact, external surface state, red-dot/notification state
- short player-facing copy such as disabled reason, price updated notice, insufficient resource, success/failure feedback

Not allowed as a left-side game frame:

- refresh schedules
- recycling/settlement order explanations
- permission matrices
- backend ownership boundary summaries
- pricing formulas or config tables
- QA checklists
- designer-facing rule cards
- text blocks that explain the feature instead of showing what players see

If mechanism content matters, anchor it to a visible UI result: updated value, disabled button reason, refreshed list, toast, modal, red dot, mail, return state, or right-side note.

## 8. State and Feedback Splitting

One wireframe represents one player-visible state.

Split these when the player sees a different stage over time:

- functional interface where the player acts
- selection or helper popover
- confirmation popup
- loading/sending/claiming/animation/performance stage
- success or failure result
- refreshed return surface showing what changed
- external surface such as mail, inventory, HUD, lobby, settlement, or visitor surface

Do not merge a primary operation with its result surface when the result changes what the player sees or receives. For make/craft/cook/claim/send/sell/save/replace/invite actions, account for success feedback, reward/result display, data refresh, and return state.

## 9. Right-Side Notes and AI Pending

Right-side notes are designer-facing PRD translation. They should explain the related left-side interface, not replace it.

Valid note content:

- source-backed interface/control/state/rule
- player operation and enable/disable conditions
- state changes after the operation
- feedback/performance: toast, modal, animation, audio, VFX, result, refresh, lockout, skip/interrupt
- implementation dependency: server validation, sync timing, persistence, rollback, capacity, failure recovery
- designer decision prompt: feedback strength, recognition priority, decision clarity, visual/audio/VFX hierarchy
- `AI待确认`: missing, conflicting, or inferred decision that affects design

Use meaningful labels such as `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`.

`AI待确认` should expose design risks first, not only edge-case QA:

- Why does the player want to do this?
- Is the decision basis visible enough?
- Does the route create a dead end or wasted visit?
- Is the rule taught before failure?
- Can the player recover from failure?
- Is the cognitive load reasonable?
- Does the feedback close the motivation loop?

Attach AI pending items to the affected module/control/state. Use red warning emphasis and keep them visually independent from ordinary notes.

## 10. Optional 5.0

Create `5.0` only when content is truly outside `1.0-4.0`.

Valid examples:

- global glossary
- independent cross-system dependency appendix
- appendix not tied to a feature module

If the content is a function risk, boundary, state, or rule, keep it in `4.0`.

## 11. Final QA

Before responding:

- Screenshot the board and inspect the actual visual result.
- Confirm the default/user-provided template visual language is preserved.
- Confirm no old placeholder body content remains.
- Confirm `1.0` explains product intent, not a feature summary.
- Confirm `3.0` is goal-level player flow, not backend mechanism flow.
- Confirm every important `3.0` node has a matching `4.0` interface/state explanation.
- Confirm every `1334x750` frame is player-visible UI, not a rule card or support diagram.
- Confirm material selection, empty states, confirmation, success/failure feedback, result/reward, mail/claim, and refreshed return states are split when relevant.
- Confirm daily refresh, weekly forced recovery, permission rules, and system settlement are anchored to visible UI consequences rather than drawn as standalone screens.
- Confirm right-side notes explain purpose, module composition, states, operation, post-action changes, feedback, exceptions, and AI pending.
- Confirm AI pending items expose design risks and decision gaps.
- Confirm modules and notes do not overlap; footer sits after final content with safe spacing.
