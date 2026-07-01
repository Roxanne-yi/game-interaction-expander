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

`3.0` is a Core Play Path Graph, not a mechanism theme list or linear step strip. It explains the player-operated paths that carry the feature value: where the player enters, what they do, what they decide/confirm, what feedback/result they get, and where they return or continue.

Before drawing, create a `4.0 Surface / Note Inventory`, then a `Surface Transition / Branch Inventory`, then a `Goal Flow Graph inventory`. Promote a top-level graph only when it is a Core Play Path: the player actively enters a concrete surface/scene, performs a sequence of operations or choices, follows a visible CTA chain between surfaces (`entry -> operation -> decision/confirm -> feedback/result -> return/continue`), directly carries the feature core play value, and would leave designers unable to understand the feature if omitted. Otherwise demote the topic to pre-entry context, decision/branch under an owning core path, local state, external surface, right-side note, or `AI待确认`.

Each top-level graph should contain only what the real goal needs:
Split top-level graphs when player motivation, entry/source surface, operating perspective, decision basis, or value proposition changes. Do not merge two paths only because they share the same final reward, currency, inventory change, or backend action.

- Flow name in cloned template flow-name style.
- Player-visible screen/state nodes in cloned template node style.
- Main success path, surface transitions from primary CTAs or branch triggers, and return/destination.
- Optional Designer Flow Grammar units when needed: diamond decisions, branches, merges, loops, dashed optional routes, mode lanes, external-surface nodes, and nested sub-flow nodes.
- Condition labels and connectors in template-derived visual language.

Do not force every graph to include a decision or failure branch. Do not omit real checks, branches, failures, or returns to fit the template. If one surface contains multiple meaningful triggers, map them as branches only when they lead to different surfaces, destinations, feedback, recovery, or loop closure; keep filters, sorting, dropdowns, item selection, quantity adjustment, and selected states inside `4.0`. Do not draw system pressure, existing-system entry, prerequisite setup, passive reminders, fallback compensation, backend refresh, reset, settlement, permission matrix, pricing order, forced-order rules, quota updates, or limit updates as top-level player flows unless the player actively operates them as a core loop.

Use template visual language, not template topology. The template's example node count, single-line path, fixed order, and branch shape are not content rules.
Write `3.0` node labels as player-facing actions or moments, not mechanism themes or page taxonomy. Prefer `查看好友价并比价` over `价格/比价`, `按好友价出售` over `出售页签`, and `确认获得回收币` over `结果反馈`.

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
- `4.0 Surface Preservation Guard`: narrowing `3.0` to player goals must not delete player-visible surfaces from `4.0`. A picker, modal, toast, loading state, result, external surface, tab state, component state, or failure/recovery surface stays in `4.0` whenever the player actually sees or operates it, even when it is not a `3.0` node.
- Overlay/modal rule: decide by transition role. Include an overlay/modal in `3.0` when its CTA creates the next surface, confirmation, submit, result, failure recovery, destination change, or loop closure. Keep it only in `4.0` when it is a local picker/help/filter layer that returns to the same operation stage.
- Do not draw multiple unrelated versions of the same interface. For tabs, modes, or local states of the same interface, preserve the stable frame: title/close/back, navigation, main columns, and fixed controls. Change only the tab-controlled content, local state, overlay, or feedback layer unless the source implies a different surface.
- Stable Surface Frame: when two screens are tabs/modes/states of the same interface, title bar, close/back, tab position, main information structure, and fixed action area must stay consistent. If those structures change substantially, classify the item as a different surface instead of drawing two unrelated versions of one interface.

## 7. Player-Visible Interface Test

A left-side `1334x750` frame must look like something a player could plausibly see, tap, close, read, wait on, claim, or return to. One frame = one player moment; do not use the frame as a state collection or rule summary.

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
Passive mechanisms are not active results. If a reminder, periodic compensation, backend refresh, external mail, or fallback delivery is not the direct result of the player action being shown, do not place it inside that action success/result screen; localize it as a tip/toast, light external-surface example, right-side note, or `AI待确认` risk.

## 9. Right-Side Notes And AI Pending

Right-side notes are for interaction designers, not for the agent. They explain the related left-side interface and must not expose internal analysis taxonomy.

Each note group should answer only:

- What this interface/state shows.
- What the player can do.
- What feedback/result appears.
- Where the player goes next or how they recover.
- What design decision remains unresolved, if any.

Do not expose terms such as representation ownership, mechanism ownership, surface classification, backend classification, validation ownership, template reasoning, inventory, gate, validator, or renderer in visible board text.

Use meaningful labels: `策划注意`, `程序注意`, `UI注意`, `UIFX注意`, `VFX注意`, `音效注意`, `美术注意`, `动画注意`, `更新`, and `AI待确认`. Ordinary notes and `AI待确认` must be visually separated.

Right-side notes must reuse template `note label / note box` styling: discipline label above, numbered explanation lines below. Do not replace the template note component with a free grey text box.

`AI待确认` follows coverage, not count. Run an `AI Risk Mining Pass` across product intent, key surface transitions and flow branches, and interface expression. For each top-level player goal and high-risk transition/decision/recovery/reward/return point, check player motivation, decision basis, dead-end/recovery, cognitive load, value expression, and feedback/loop closure.

Attach `AI待确认` items to the affected module/control/state. Use the template-derived red warning label/style with white high-contrast text and keep it visibly independent from ordinary notes.
A surface can have zero, one, or several `AI待确认` items. Use an internal `aiRisks: []` list or equivalent grouping so each independent risk keeps its own number; do not merge motivation, decision-basis, recovery, value, and loop-closure risks into one long item to fit a single slot.

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
- Confirm `3.0` is a Goal Flow Graph, not a linear step strip or backend mechanism flow. Confirm the Surface Transition / Branch Inventory did not lose important primary CTAs, branch triggers, external jumps, failure/recovery paths, or loop closures.
- Confirm every player-visible `3.0` node has a matching `4.0` surface, and every non-screen node is intentionally classified as decision/branch/local state/external dependency/right-side note or `AI待确认`.
- Confirm every `1334x750` frame is one player-visible moment, not a rule card, support diagram, or mutually exclusive state collection.
- Confirm material selection, empty states, confirmation, success/failure feedback, result/reward, mail/claim, and refreshed return states are split when relevant.
- Confirm daily refresh, weekly forced recovery, permission rules, and system settlement are anchored to visible UI consequences rather than drawn as standalone screens.
- Confirm right-side notes follow the Right-side Note Contract and reuse template note label / note box styling.
- Confirm `AI待确认` coverage follows top-level player goals and high-risk decision points, not a board-level presence count.
- Confirm `4.0` retained player-visible local surfaces even when they were not promoted to `3.0`, including overlays/modals/pickers/results/toasts/tab states when relevant.
- Confirm same-interface tabs/modes/states share a stable frame, and passive/system consequences are not mixed into unrelated active result screens.
- Confirm modules and notes do not overlap; footer sits after final content with safe spacing.
