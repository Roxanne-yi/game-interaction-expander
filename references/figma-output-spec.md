# Figma Output Specification

Use this reference for the visible Figma board. It defines what designers should see, not how Codex thinks internally.

For left-side wireframe usability, apply [wireframe-design-principles.md](wireframe-design-principles.md). Do not expose that reference as visible methodology.

For executable Figma guardrails, apply [figma-execution-protocol.md](figma-execution-protocol.md). The manifest renderer and manifest validator are required for Figma board generation.

## 1. Destination and Template

- Require a Figma destination before generating.
- Use the user's provided template or target page as authoritative.
- If no template is provided, use the KRAD manifest fallback in `assets/krad-template/template-manifest.json`.
- Replaceable does not mean restylable. The active template is a strict style and layout contract.
- Before drawing generated content, run the manifest renderer from `figma-execution-protocol.md`.
- Before final delivery, run the manifest validator, repair failures, and rerun.

When using a template:

- Clone the active template first.
- Edit only manifest-approved text slots and cloned body prototypes.
- Do not create one full-board generated overlay on top of the template.
- Preserve colors, typography, spacing rhythm, component styling, section order, placeholder dimensions, frame fills, and footer/header styling.
- Do not shrink template text styles to fit dense content. Shorten wording, extend the module, or push later modules down.
- If more space is needed, extend the board height and move the footer.
- If a required slot cannot be found, stop and report the missing slot. Do not draw an imitation.

## 2. Board Structure

Default sections:

1. `1.0 Design overview`
2. `2.0 Adaptation plan`
3. `3.0 Feature flow`
4. `4.0 Feature details`
5. Optional `5.0` extension

Do not create visible sections named after internal artifacts such as `manifest`, `operation hotspot audit`, `acceptance gate`, or `analysis checklist`.

`1.0`, `2.0`, `3.0`, and `4.0` are global sections and must appear exactly once. When a PRD has multiple major functions, expand only the `4.0` feature-detail module blocks under the single `4.0` section; do not repeat the full board scaffold per major function.

## 3. Design Overview

`1.0` must keep the template's asymmetric layout.

Rules:

- Do not turn the overview into equal-width cards.
- Keep the product-positioning structure.
- Do not rewrite the fixed question labels:
  - `设计背景和要解决的问题`
  - `针对哪些人群？`
  - `期望达到怎样效果？`
- Replace only the body text below those questions.
- Keep the right-side version table style.
- First generation: table header plus one filled row.
- Later iteration: append a new row below existing rows.

Product positioning must read like a designer's product understanding:

`source mechanic -> player motivation/problem -> desired experience outcome`

Keep it concise. Do not include PRD caveats, AI process notes, missing-state lists, config names, drawing instructions, or module responsibility summaries.

## 4. Adaptation Plan

`2.0` stays as an empty template by default.

Do not fill adaptation frames, delete placeholders, or resize the `1334x750`, `1800x750`, or `1334x1001` frames unless the user explicitly asks for adaptation output.

## 5. Feature Flow

Each `3.0` flow block must contain:

- Flow name.
- Screen/interface nodes.
- Connectors.
- Condition labels.

Each screen node contains only:

- Interface name.
- Screen placeholder.

Main flow comes first. If the analysis finds secondary flows with their own player goal, entry, operation loop, and return/destination, create another complete flow name plus flow diagram. Do not force secondary flows into the main diagram if that makes it unreadable.

Flow names must be unique and specific. Do not reuse a generic name such as `主流程：完成核心操作并获得结果` for every flow or every module.

Flow connectors must reflect the analyzed player path. Do not keep the template's sample path if it changes action order, result timing, confirmation timing, return path, or branch ownership. If a process has judgments or branches, represent them as explicit `edges` instead of relying on visual row order.

When building the payload, put branch destinations in `flow.edges` or per-step `branches`/`next`. The renderer can lay out the diagram, but it must not invent player path order from the template sample.

Allowed flow variations:

- Branches.
- Judgment nodes.
- Return paths.
- Conditional paths.

Flow diagrams explain player flow, not high-fidelity UI. Interface placeholders are left for designers to fill.

## 6. Feature Detail Modules

`4.0` uses a fixed hierarchy:

- Major function = one complete module block = one `主标题`.
- Minor function = one `副标题`.
- Interface explanation = one `界面标题` plus one left screen frame and one right-side note group.

All three title levels must preserve template style.

Every subsection/interface from the analysis payload must appear. A major module fails if it only renders the first subsection or first interface while leaving later minor functions as naked headings or hidden data.

Left side:

- Keep the template screen frame shell.
- Draw AI low-fidelity wireframes inside the frame.
- Build each wireframe from a structured schema: `surface`, `regions`, `controls`, `states`, `feedback`, and optional `modal`/`toast`.
- Hide the template `原型` placeholder after drawing. Leaving the placeholder visible is a failed render.
- Wireframes express layout, state, operation entry, feedback position, and player-visible consequences.
- Do not draw rule cards, mechanism summaries, or backend diagrams inside player screens.

Right side:

- Use template label/tag style above each explanation group.
- Use numbered explanation lines below the label.
- Keep notes aligned with the related left frame.
- Source facts, interaction rules, state rules, feedback, dependencies, design risks, and AI follow-ups must stay visually grouped with the owning interface.
- Every major module must include at least one visible `AI待确认` note. The board fails if AI follow-up content is absent, hidden, or only implied by generic risk text.

Label rules:

- Reuse existing labels/tags where possible.
- If a label such as `AI待确认` does not exist, derive it from the template label/tag style.
- `AI待确认` uses a red warning color family.
- Do not hand-draw a new plain rectangle label.
- Choose labels from the actual note content. Do not keep the template's default `策划注意 / 程序注意 / UI注意 / 动效注意` sequence unless those labels genuinely match the explanation lines.
- Note input may be `lines`, `text`, `body`, or `question`; the renderer normalizes these into numbered lines and chooses the label from the note content. Avoid pre-filling default labels when the body says something else.

Feature-detail-related content belongs in `4.0`, including entry rules, state rules, interaction feedback, exceptional cases, server validation, red-dot logic, and design risks tied to a function.

If a reserved template block is not used, hide it or remove it. Do not leave visible placeholders such as `红点流程名称`, `界面名称`, or `备注内容（非必须）` inside generated `4.0` content.

## 7. Optional 5.0

Create `5.0` only when content is truly outside `1.0-4.0`.

Valid examples:

- Global glossary.
- Cross-system dependency appendix.
- Independent appendix not tied to a feature module.

If the content is a function risk, boundary, state, or rule, keep it in `4.0`.

## 8. Wireframe Rules

- Default platform is mobile game.
- Use `1334x750` for standard 16:9 player-visible game screens.
- Draw simple structural wireframes, not high-fidelity UI.
- Keep player-facing wireframes grayscale-first; use accent color only for selected states, key markers, progress, and primary CTA.
- Derive layout from game interaction rules, not HTML prototype layout.
- Every visible page, tab, navigation item, button, control, feature name, and system entry must be source-supported or explicitly labeled as AI follow-up/suggestion.
- Do not place large rule descriptions inside player screens. Show the visible state on the left and explain the rule on the right.
- Separate states over time into separate frames: functional interface, confirmation, loading/performance, result, refreshed return state, and exceptions.

## 9. Right-Side Notes

Right-side notes are designer-facing PRD translation.

Valid note types:

- Source fact.
- Interaction/state rule.
- Logic expansion.
- Feature-design risk.
- Feedback/performance.
- Implementation dependency.
- Designer decision prompt.
- AI follow-up question.

Writing style:

- Prefer short numbered lines.
- Start each note line with a number.
- Translate config facts into player-visible behavior or design impact.
- Do not expose raw IDs/table names/fields as the primary sentence.
- Do not write meta instructions such as "AI should", "wireframes must", "left side/right side", or "split into frames".

AI follow-ups:

- Use `AI待确认`.
- Use red warning styling from the manifest.
- Keep AI follow-ups visible in the right-side note group of the owning module, not only in hidden metadata or the internal analysis.
- Ask about missing logic and feature-design gaps first, not only edge-case QA.
- Do not ask about states the PRD already excludes.

## 10. Final QA

Before responding:

- Run the manifest validator.
- Screenshot the board and inspect the actual visual result.
- Run the semantic gates in `output-quality-model.md`.
- If the board fails structural validation or semantic review, revise it before delivery.
