# Figma Output Specification

Use this reference for the visible Figma board. It defines what designers should see, not how Codex thinks internally.

The board is not a PRD summary. It is a translation from planning facts into product intent, player flows, player-visible states, designer-facing explanations, and design risks.

For left-side wireframe usability, apply [wireframe-design-principles.md](wireframe-design-principles.md). Do not expose that reference as visible methodology.

For Figma execution, apply [figma-execution-protocol.md](figma-execution-protocol.md). The default path is direct `use_figma` drawing inside a cloned template shell; renderer and validator scripts are not part of the workflow.

## 1. Destination And Template

Default template:

`https://www.figma.com/design/RbcXtsnRIfCVUXRjUXW99x/%E8%AE%BE%E8%AE%A1%E7%AE%A1%E7%BA%BF%E7%A0%94%E7%A9%B6?node-id=1184-1331&t=noJVA0YdED8KTxqt-4`

Default template node:

`1184:1331`

Rules:

- Require a Figma destination before generating.
- Use the user-provided template/page when present; otherwise use the default template above.
- Read `assets/krad-template/template-manifest.json` before writing. Use node IDs, slot IDs, prototype IDs, and English semantic keys; ignore corrupted Chinese display names in the manifest.
- The board must be derived from the active template by cloning, duplicating, or instancing the template node.
- Replaceable does not mean restylable. The active template is a strict visual and structural contract.
- Preserve colors, typography, spacing rhythm, title badges, note labels, section order, top floating/header, footer, background, placeholder dimensions, and component styling.
- Do not shrink template text styles to fit dense content. Shorten wording, extend the module, or push later modules down.
- If more space is needed, extend the board height and move the footer.
- If exact cloning, slot lookup, or prototype reuse is blocked, stop and report the blocker. Do not visually imitate the template or draw an unrelated freeform board unless the user explicitly authorizes that exception.

Do not hand-draw these template-owned elements:

- top floating/header area
- logo/image decoration
- section number/title/divider
- `1.0` overview card shell and version rows
- `2.0` adaptation placeholders
- `3.0` flow-name chips and node shells
- `4.0` major title chips, subtitle chips, interface-name labels, note labels, and `1334x750` screen-frame shells
- footer

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

`1.0` must keep the template's asymmetric layout. Only replace answer/body text and version-row text. Do not redraw the overview cards.

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

- Flow name in cloned template flow-name style.
- Player-visible screen/state nodes in cloned template node style.
- Connectors.
- Condition labels.

Before drawing, create an internal `Flow inventory` and `Screen inventory`. The template's default node count is not a content limit. Flow order must follow player causality; validation, confirmation, and cost/resource consumption come before result, reward, refresh, or benefit delivery.

Add secondary flows only when they have a distinct player goal, recognizable entry, operation loop, and return/destination. Examples: claim from mail, receive from another role, manage saved items, view record/history, external jump, visitor/owner branch.

Do not draw backend refresh, reset, settlement, permission matrix, pricing order, forced-order rules, quota updates, or limit updates as player flows unless the player actively operates them. Convert them into `4.0` local states, reminders, toast, source-defined external surfaces, red-dot behavior, or right-side notes.

## 6. Feature Detail Modules

`4.0` uses this fixed hierarchy:

- Major function = one complete module block.
- Minor function = one subtitle group.
- Interface/state explanation = one interface title plus left wireframe and right-side note group.

Template-owned parts must be cloned or reused before text is edited:

- major function title chip and note chip
- minor function subtitle chip and note chip
- interface-name label
- `1334x750` screen-frame shell
- right-side discipline label and numbered note group

Module organization:

- Lead with the player-visible entry surface when the source defines an in-world interaction point, building/lobby/HUD entry, external jump, or mail/claim entry in the current scope.
- Lead with the main interface and its important tabs/modes/panel/helper states.
- Then show primary action checks, confirmations, loading/performance stages, results, returns, secondary operation lifecycles, and cross-surface states.
- Group internal logic under its owning interface. Do not turn every PRD heading into a separate wireframe.
- If a helper fills, filters, sorts, recommends, repeats, or previews the main surface, show it as part of that surface, not as an equal top-level page.
- If a true mode changes content model or operation goal, show it as a visible tab/mode/panel state.
- Do not draw multiple unrelated versions of the same interface. For tabs, modes, or local states of the same interface, preserve the stable frame: title/close/back, navigation, main columns, and fixed controls. Change only the tab-controlled content, local state, overlay, or feedback layer unless the source implies a different surface.

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

If mechanism content matters, anchor it to a visible UI result: updated value, disabled button reason, refreshed list, local tip, toast, modal, red dot, source-defined external surface, return state, or right-side note. Do not create standalone mechanism-feedback screens or merge unrelated prompts with external claim/mail content.

## 8. State And Feedback Splitting

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

## 9. Right-Side Notes And AI Pending

Right-side notes are designer-facing PRD translation. They should explain the related left-side interface, not replace it.

Valid note content:

- source-backed interface/control/state/rule
- player operation and enable/disable conditions
- state changes after the operation
- feedback/performance: toast, modal, animation, audio, VFX, result, refresh, lockout, skip/interrupt
- implementation dependency: server validation, sync timing, persistence, rollback, capacity, failure recovery
- designer decision prompt: feedback strength, recognition priority, decision clarity, visual/audio/VFX hierarchy
- `AI待确认`: missing, conflicting, or inferred decision that affects design

Use meaningful labels: `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`.

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
- Confirm the board is derived from the default/user-provided template, not visually imitated.
- Confirm no hand-drawn replacement of template chrome exists.
- Confirm no old placeholder body content remains.
- Confirm `1.0` explains product intent, not a feature summary.
- Confirm `3.0` is goal-level player flow, not backend mechanism flow.
- Confirm every player-visible `3.0` node has a matching `4.0` interface/state explanation, and every non-screen node is intentionally classified as rule, mechanism note, external dependency, or `AI待确认`.
- Confirm every `1334x750` frame is player-visible UI, not a rule card or support diagram.
- Confirm material selection, empty states, confirmation, success/failure feedback, result/reward, mail/claim, and refreshed return states are split when relevant.
- Confirm daily refresh, weekly forced recovery, permission rules, and system settlement are anchored to visible UI consequences rather than drawn as standalone screens.
- Confirm right-side notes explain purpose, module composition, states, operation, post-action changes, feedback, exceptions, and `AI待确认`.
- Confirm `AI待确认` items expose design risks and decision gaps.
- Confirm modules and notes do not overlap; footer sits after final content with safe spacing.
