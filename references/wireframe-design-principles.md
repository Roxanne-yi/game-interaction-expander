# Wireframe Design Principles

Use this reference before generating Figma wireframes. The goal is not to replace interaction designers or create final UI. The goal is to make low-fidelity game wireframes believable, usable, and helpful enough that designers can focus on experience tuning instead of fixing basic interaction mistakes.

## 1. Output Boundary

- The left side shows player-visible interface skeletons, not final UI.
- The wireframe can be rough, but it must not look wrong, unusable, or like a rule document pretending to be a screen.
- Do not pursue visual polish, material rendering, lighting, or finished icon art.
- Use simple vector placeholders/icons, but preserve clear meaning: item, reward, lock, red dot, state, selected, disabled, input, list, tab, modal, toast, HUD.
- The right side remains designer-facing interaction notes: what the interface is, what modules it contains, what states exist, what conditions trigger changes, what happens after player actions, what feedback appears, and what needs confirmation.
- Do not expose this reference's method as visible labels on the board.

### Left / Right Ownership

Left wireframes own UI structure, operation controls, player-facing information, visible states, feedback layers, and numbered callout anchors. Right notes own interaction details, function rules, state explanations, trigger/condition/result logic, implementation dependencies, design risks, and `AI待确认`.

Right-side notes are for interaction designers, not for the agent. They must use template note label / note box styling and answer what the interface shows, what the player can do, what feedback/result appears, where the player goes next or recovers, and what decision remains unresolved. Do not expose internal taxonomy such as representation ownership, mechanism ownership, surface classification, backend classification, template reasoning, inventory, gate, validator, or renderer.

Left wireframes may contain only player-facing copy. If the text is written for the designer, planner, programmer, or AI reader, move it to right notes.

Use numbered callout anchors in the wireframe when a rule needs explanation. Put the explanation in the right note; do not put long rule text inside the game frame.

## 2. Internal Closure Scan

Use `trigger -> rule -> feedback -> loop` internally to check whether the PRD has enough interaction information. Also build a `Surface Transition / Branch Inventory` before flow drawing: only primary CTAs, branch triggers, modal/result openings, external jumps, close/back actions, and blocking/failure triggers enter `3.0`; filters, sorting, dropdowns, item selection, quantity changes, and local selected states stay in `4.0` unless they open a new surface or branch.

- Trigger: where, when, and why the player enters; what control starts the operation; whether the entry is visible, locked, highlighted, or red-dotted.
- Rule: what can be done, what cannot be done, required preconditions, order, quota, cost, permission, ownership, time window, and whether those rules are visible before the player fails.
- Feedback: immediate response after tap, success, failure, animation, toast, modal, state update, refreshed data, reward reveal, red-dot clearing.
- Loop: where the player returns, what changed for next time, whether progress persists, whether the system gives a reason to come back, and whether external surfaces stay in sync.

This scan feeds AI follow-ups; it is not the right-side note format. If a primary CTA or branch trigger leads to a different destination, feedback, failure/recovery, or loop closure, represent it as a flow branch or explicit local state/note. If an interaction only changes local selection, sorting, quantity, or display state, keep it inside the owning wireframe.
Overlay/modal surfaces are not automatically local-only. Judge them by transition role: a confirmation, submit dialog, result-triggering modal, failure-recovery modal, or destination-changing overlay can enter `3.0`; a picker/help/filter overlay that returns to the same stage stays in `4.0` but still needs a visible wireframe or overlay state.

### AI Risk Mining Pass

Before choosing visible `AI待确认` notes, mine candidates from product intent, key surface transitions, blocking/failure/recovery, passive-system impact, and interface expression. Look for motivation gaps, weak decision basis, hidden value, wasted visit/action, irreversible cost, trust conflicts, unclear asset changes, late feedback, missing return/recovery, and cross-surface handoff ambiguity. Then attach only the strongest non-duplicate questions to affected surfaces.

## 3. AI Follow-Up Priority

AI follow-ups should support interaction designers' pre-work, not become only an edge-case QA list.

Prioritize:

1. Logic completion: missing core flow, page/state, precondition, return path, operation result, or lifecycle.
2. Feature-design gaps: unclear player goal, hidden value, late rule disclosure, broken motivation, dead-end route, unclear system relationship, or unclosed loop.
3. Boundary QA: failure, refresh, exception, empty state, repeated tap, network, rollback, sync, capacity, stale data.

Ask about the next undefined decision after source facts are locked. Do not ask questions that contradict preconditions the PRD already states.

## 4. Player-Screenshot Test

Every `1334x750` game frame should look like a plausible state a player could see, tap, read, close, wait on, or return to. Use this rule: one frame = one player moment.

Allowed inside game frames:

- visible navigation, tabs, filters, sort controls, slots, cards, rows, buttons, counters, red dots, locks, labels, input fields, modals, toasts, HUD anchors, loading states, empty states, result states
- short player-facing copy, such as disabled reasons, countdown, price updated notice, insufficient resource prompt, or success/failure toast

Not allowed as a game frame:

- permission matrices
- refresh schedules
- rule order cards
- backend/ownership boundary summaries
- pricing formulas
- source comparison diagrams
- QA checklists
- text blocks that explain the feature to designers
- operation-instruction sentences such as `点击...后...`, `如果...则...`, `需要...`, `读取配置...`, `服务端...`, `策划规则...`, or `实现逻辑...` unless that exact text is player-facing UI copy

If mechanism content matters, anchor it to a visible UI result: disabled/hidden/locked entry, updated value, countdown, refreshed list, modal, toast, red dot, or return state.

When repairing or enriching an existing wireframe, replace the weak part with a better player-visible state instead of adding explanatory side panels inside the game screen. Permission summaries, return instructions, validation matrices, and mechanism notes belong on the right side unless they are actual game UI.

Keep each frame state-consistent. Do not show one current state while also showing feedback for a different precondition in the same frame. If both states matter, split them into separate frames or show the alternate condition as a compact right-side note/state example.

### Surface Ownership Gate

Before drawing a frame, classify the content as `player interface`, `modal`, `toast/local tip`, `result screen`, `external surface`, `component state`, or `right-note-only`. Draw a separate wireframe only when the player's visible task changes: choose, compare, confirm, wait, receive result, recover from failure, return, or continue. Do not put mutually exclusive moments into the same frame.

Do not separately draw formula changes, backend refresh, quota reset, ownership rules, config/algorithm details, or system execution order unless they form a clear player-visible surface. Localize them to the owning interface as a small tip, changed value, disabled reason, toast, red dot, source-defined external surface, or right-side note.

Do not merge different surfaces into one wireframe. Toast, modal, feature panel, mail page, inventory page, HUD, and result screen stay separate unless the source explicitly nests them.
`3.0` simplification never deletes `4.0` surfaces. If a surface is demoted from flow because it is local or passive, still draw it in `4.0` when it is player-visible; otherwise attach it to the right-side notes or `AI待确认`.

The left frame must be understandable without the right notes. If the right notes are needed to identify the surface, operation, current state, or next action, redraw the left frame.

## 5. Useful and Usable

A game feature must first be useful, then usable.

- Useful: identify the player need or product goal the feature solves; if a mechanism has no player motivation, surface it as a feature-design risk.
- Usable: make sure the interaction closes logically and can coexist with related systems.
- A module is not usable until it has a trigger, visible rules, feedback, and a loop/return.
- A mechanism that is technically complete but invisible to the player is still interaction-incomplete.

## 6. Game Interface Framework

Choose a rough interface frame based on the system's role, not PRD section titles.

- Window/panel: good when the player should keep awareness of the main scene, frequently switch back, or perform light management.
- Full-screen: good for focused, single-threaded, immersive, or information-heavy systems.
- Full-screen plus windows: good when a large system needs immersion but common sub-actions should stay quick.
- Combination panel: good for heavy management, comparison, selection, and repeated switching, but it must stay ordered and not become a pile of panels.

Before drawing, decide:

- Does the game have a main scene that should remain visible?
- Is the player doing one focused task or switching between several tasks?
- Does the feature require immersion, comparison, or quick repeated operations?
- What happens to the previous surface when this opens: coexist, close, hide, or return after closing?
- What is shown when reopening: default state or last state?

## 7. Information Architecture and Navigation

Balance depth and breadth.

- Too deep: players get lost in nested pages.
- Too shallow: too many entries compete for memory and recognition.
- Tabs/modes are for same-level content changes.
- Panels are for local details or helper operations.
- Modals are for blocking decisions, confirmations, errors, or focused selection.
- Toasts are for lightweight feedback that should not interrupt the task.
- Draw return/close/cancel paths for every secondary surface.
- Do not promote every helper operation to a top-level page.

## 8. Gestalt and Layout

Use simple visual organization so the wireframe can be scanned quickly.

- Proximity: related labels, values, controls, and feedback should sit together.
- Similarity: same function/state should use the same structure across modules.
- Continuity: align repeated rows/cards/nodes to create predictable reading paths.
- Closure: if content continues off-screen, use partial rows, scroll containers, pagination, or tabs so continuation is obvious.
- Simplicity: remove controls and text that do not support the current player goal.
- Group by player task: navigation, list/card area, detail/preview area, action area, feedback area.

## 9. Primary Action and Touch Effort

Use Fitts' law as a wireframe sanity check, especially for mobile game screens.

- Primary actions should be large enough and close to the current operation area.
- Related actions that are used in sequence should be near each other.
- Destructive, skip, close, or low-frequency actions may be smaller, farther away, or require confirmation.
- Do not scatter equally weighted buttons across the screen.
- Every screen should have a clear dominant action or a clear reason it has none.
- Confirmation and result surfaces should stay simple: title, concise consequence, affected item/reward summary, one primary action, and one secondary/close path when needed. Do not stack comparison panels, validation notes, return instructions, and reward details into the same modal.

## 10. Consistency

Consistency reduces learning cost and prevents designers from doubting the wireframe itself.

- Concept consistency: similar objects expose similar operations and properties.
- Interaction consistency: similar actions use similar gestures, locations, and feedback.
- Visual consistency: similar cards, rows, buttons, tabs, modals, and tips share structure.
- Do not switch between card/list/modal styles without a feature reason.
- If the project/template has a component or label system, reuse it before drawing new shapes.

## 10.1 Stable Frame For Same Interface States

For tabs, modes, and local states of the same interface, keep the stable frame unchanged: title bar, close/back behavior, navigation location, main column structure, and fixed operation area.
Stable frame means the player recognizes it as the same interface at a glance. Keep the same title area, tab location, left/right column relationship, core list/detail structure, and primary action zone unless the source defines a different surface.

Only the tab-controlled content area, state area, overlay, toast, disabled reason, or feedback layer should change. If the frame changes substantially, classify it as a different surface instead of drawing unrelated versions of the same interface.

Background mechanisms such as refresh, reset, settlement, forced order, price/quota/limit update, or backend validation should not become large standalone screens. Localize them to the owning interface as small tips, refreshed values, disabled reasons, toast, red-dot state, source-defined external surface, or right-side note.
Do not mix passive/system consequences into an active operation result screen unless that consequence is directly caused by the current action. Passive reminders, periodic compensation, external mail fallback, and scheduled resets should remain local tips, source-defined external surfaces, right notes, or AI risks.

## 10.2 Low-Fidelity Visual Language

Wireframes are structural tools, not visual proposals.

- Use black, white, and neutral gray as the default visual language for player-facing wireframes.
- Use the template/theme accent color sparingly for selected states, key markers, counters, progress, and primary CTA buttons.
- Do not use high-saturation fills for panels, modals, backgrounds, cards, lists, or other large content areas.
- Do not introduce arbitrary blue, purple, or gradient fills to make the wireframe look "designed"; they reduce readability and make designers question the mockup instead of reading the interaction.
- Keep modals neutral: dimmed gray mask, white or very-light panel, dark title/body, one clear primary action in the accent color, and secondary/close actions in gray.
- Keep local UI examples visually consistent with the owning wireframe component and the same grayscale/accent rule.
- Reserve high-emphasis red for AI follow-up risks, errors, or blocking warnings, not ordinary UI decoration. For AI follow-up labels, use a red-series label background with white text so the warning is readable at a glance.

## 11. Feedback, Error Prevention, and Recovery

Players should understand what happened, what is happening, and what to do next.

- Show disabled/locked states with reasons when the player can plausibly attempt the action.
- High-cost, irreversible, or social/economic actions need confirmation or a clear recovery path.
- After an operation, show the result where the player expects it: button state, list item, counter, progress bar, red dot, toast, modal, result screen, or returned surface.
- Failure feedback should guide recovery, not punish exploration.
- If the operation can fail after a request, show whether the button returns, remains locked, retries, or refreshes.

## 12. Notifications, Tips, Floating Layers, and Red Dots

These are interface systems, not random decorations.

- Notification layers should respect importance, frequency, and interruption cost.
- Tips/floating layers need a clear anchor, position, close rule, and coexist rule.
- Red dots need source, propagation, priority, clearing condition, persistence, and refresh timing.
- Avoid using red dots as a generic "something changed" unless the change can be explained after entry.
- A red dot source shown in feature details should not be repeated as full content in the red-dot section; summarize hierarchy and conflicts there.

## 13. Control Selection

Choose controls by player behavior and information type.

- Information controls: labels, counters, bars, icons, badges, progress nodes, state marks.
- Navigation controls: tabs, side tabs, breadcrumbs, lists, carousel, close/back, external jump.
- Command controls: buttons, toggles, checkboxes, radio/segmented controls, dropdowns, inputs, steppers.
- Selection among one of many: list, card grid, radio, segmented control, or dropdown depending on quantity and visibility needs.
- Compare/preview before action: include preview/detail area near the selection.
- Repeated management: prefer stable list/card structure with persistent actions.
- Time, price, quota, count, ownership, and permission changes should be visible near the control they affect.

## 14. Wireframe QA

Before finalizing:

- Can a designer immediately tell what screen this is and what the player is trying to do?
- Is the main operation visible and placed near the relevant content?
- Are rules expressed as UI states rather than designer-facing rule cards?
- Do tabs/modes/states of the same interface keep the same frame and change only the owned content/state area?
- Are background mechanisms localized to the owning interface or notes instead of becoming standalone screens?
- Are player-visible feedback and return states drawn?
- Are related controls grouped and aligned?
- Are same-type controls consistent across modules?
- Does the frame still read as a low-fidelity wireframe: mostly gray, with accent color only for selected/CTA/key status?
- Does every modal have title/content/primary action/secondary or close path?
- Are unsupported or out-of-scope functions absent or clearly marked?
- Are AI follow-ups focused on logic completion and feature-design gaps before boundary QA?
- Are right-side labels component instances when available?

## Sources To Internalize

- General interaction principles: Fitts' law, Hick's law, Miller's law, Tesler's law, proximity/similarity/grouping, error prevention, consistency, and simplification.
- Nielsen usability heuristics: status visibility, match to user language/world, user control, consistency, error prevention, recognition over recall, efficient use, minimalist design, recovery, and help.
- Game UE principles from `设计原则.pdf`: useful + usable, trigger/rule/feedback/loop, error tolerance, visibility, predictability, Gestalt, Fitts' law, razor principle, consistency, interface framework, interaction layers, notifications, tips/floating layers, red dots, and control selection.
