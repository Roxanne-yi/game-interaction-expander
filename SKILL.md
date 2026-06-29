---
name: game-interaction-prd-expander
description: Convert game planning documents, Confluence/wiki pages, PDFs, DOCX files, and optional HTML prototypes into interaction-ready Figma pre-briefs. Use when Codex needs to help game interaction designers understand a complex PRD before design work by extracting product intent, main interface structure, player flows, state logic, missing rules, contradictions, design risks, edge cases, red-dot clues, and annotated low-fidelity wireframes in Figma. Treat HTML prototypes as functional evidence, not visual/layout reference, unless the user explicitly says otherwise.
---

# Game Interaction PRD Expander

## Mission

Turn dense game PRDs into a Figma pre-brief that helps interaction designers understand the feature faster and discuss the right questions earlier.

Highest priority: do not summarize the PRD into Figma. Translate planning facts into product intent, player-readable flows, player-visible interface states, designer-facing notes, and design risks that can be discussed before UE / interaction design begins.

The four core jobs are:

1. Extract product intent: why the feature exists, which player problem it solves, and what experience outcome it should create.
2. Expose `AI待确认` as design-risk prompts: player motivation, decision basis, dead-end risk, cognitive load, recoverability, value expression, and loop closure.
3. Find the main interface, then split player flows by the behavior lifecycle. Cover source-mentioned functions and infer necessary player-visible screens, states, feedback, operations, main flows, and branch flows.
4. In `4.0`, draw low-fidelity player-visible UI on the left, and write designer explanation plus pending questions on the right.

Do not act as a final UI generator. The output is an interaction analysis board with usable low-fidelity wireframes, not production UI.

## Reference Loading

Load only the references needed for the current step:

- Source analysis and PRD judgment: [analysis-checklist.md](references/analysis-checklist.md)
- Wireframe usability and game interaction principles: [wireframe-design-principles.md](references/wireframe-design-principles.md)
- Figma board structure and visible output rules: [figma-output-spec.md](references/figma-output-spec.md)
- Direct Figma drawing workflow: [figma-execution-protocol.md](references/figma-execution-protocol.md)
- Final semantic review: [output-quality-model.md](references/output-quality-model.md)

Before drawing `4.0`, read `wireframe-design-principles.md`. It is the guardrail that prevents mechanism cards from pretending to be UI.

For Figma writes, use direct `use_figma` drawing. Do not run renderer, validator, template-lock, generated script, or fallback renderer workflows. The template manifest in `assets/krad-template/template-manifest.json` is a reference for the template source node, editable areas, and style anchors, not a required renderer input.

## Default Template

Default to this template unless the user explicitly provides another template in the current request:

`https://www.figma.com/design/RbcXtsnRIfCVUXRjUXW99x/%E8%AE%BE%E8%AE%A1%E7%AE%A1%E7%BA%BF%E7%A0%94%E7%A9%B6?node-id=1184-1331&t=noJVA0YdED8KTxqt-4`

Use the template's visual language for `1.0`, `2.0`, `3.0`, `4.0`, title badges, subtitle badges, interface-name labels, right-side note labels, top floating/header area, footer, and spacing rhythm. If exact cloning is blocked, visually preserve the template and report the blocker; do not switch to a renderer.

## Workflow

1. Confirm scope and destination.
   - If no Figma file URL/key is provided, ask for the target file before generating.
   - If a file is provided but no page/node is specified, use the requested page if available or create a new board in that file.
   - If iterating, work in the same page/board unless the user asks for a separate version.
   - Default platform is mobile game. Add PC, console, web, or responsive interaction only when the source/user explicitly says so.

2. Ingest sources.
   - PRD/wiki/PDF/DOCX is the source of truth.
   - HTML prototypes are functional evidence only: pages, labels, actions, sample states, and contradictions. Do not copy their layout unless the user asks.
   - If sources conflict, keep the conflict visible as an AI follow-up.
   - Establish the requested scope before expanding modules; keep global or sibling systems separate unless they directly affect the current feature.

3. Build the internal interaction interpretation.
   - Start with product meaning: `source mechanic -> player motivation/problem -> desired experience outcome`.
   - Find the main interface: the surface where the core player operation happens.
   - Expand outward from that surface: entry, navigation, tabs/modes, panels, helper operations, primary/secondary actions, validation, confirmation, loading/performance, result states, return paths, and affected external surfaces.
   - Analyze by player goals and operation hotspots, not by PRD headings.
   - For each important hotspot, reason internally: `trigger -> player operation -> immediate feedback -> validation/data update -> result state -> failure state -> next destination`.
   - Before asking questions, separate confirmed source facts/preconditions, interaction gaps, feature-design risks, and boundary QA.
   - Respect PRD-stated gates as facts; ask how the player learns, sees, recovers from, or routes around them.
   - Translate config and technical evidence into player-visible behavior, state, feedback, fallback, or recovery. Omit pure implementation cleanup from the main board.

4. Decide representation ownership for every important fact.
   - Direct player action or visible state -> `4.0` left wireframe.
   - Main or branch player journey -> `3.0` flow.
   - Rule, dependency, condition, or implementation impact -> `4.0` right-side note.
   - Missing decision or design risk -> visible `AI待确认`.
   - Backend schedule, permission matrix, pricing formula, refresh order, or QA checklist -> never as a fake player screen; anchor it to a UI consequence or keep it in notes.

5. Plan the board content directly.
   - Product meaning -> `1.0 Design overview`.
   - Goal-level player journey -> `3.0 Feature flow`.
   - Player-visible feature groups, states, and lifecycle stages -> `4.0 Feature details`.
   - Missing rules, contradictions, inferred decisions, and design risks -> visible AI pending-confirmation notes.
   - Red-dot rules -> only when in scope, and only as player-visible entry/status/clearing behavior or concise notes.

6. Generate Figma output by direct drawing.
   - Use the default template above unless the current user request provides another template.
   - Load `figma-execution-protocol.md` before writing to Figma.
   - Use `use_figma` directly to clone or visually follow the template structure and then draw/edit the board content.
   - Keep `1.0`, `2.0`, `3.0`, and `4.0` as single global sections. Multiple major functions expand only inside `4.0`; never clone the whole board scaffold per module.
   - Preserve fixed template areas, top floating/header, footer/logo decoration, adaptation placeholders, typography, spacing, component styling, and reserved designer-owned modules.
   - Use simple `1334x750` mobile-game wireframes unless the source/user says otherwise.
   - One wireframe represents one player-visible state. Split confirmation, loading/performance, success/failure, refreshed return, and mail/claim states when the player would see them separately.
   - Left wireframes must be plausible player-visible interface states, not rule cards, mechanism summaries, backend diagrams, permission matrices, refresh schedules, or lists of feature names.
   - Right-side notes must use the template label/note visual style. `AI待确认` must be visible, red warning styled, and attached to the affected module/interface.
   - Extend board height and move later content/footer down as content grows.

7. Verify before delivery.
   - Screenshot and inspect the board visually.
   - Use `output-quality-model.md` for semantic review: interaction designer view first, player view second.
   - Check template adherence: default template style, no global section duplication, no visible placeholder residue, no overlap, header/footer preserved, right-side labels styled consistently.
   - Check content quality: `1.0` explains product intent; `3.0` is a real player flow; `4.0` contains usable player-visible UI; notes explain state/action/feedback; `AI待确认` exposes design risk rather than only edge-case QA.

## Output Contract

Default Figma board:

- `1.0 Design overview`: product intent, target players, desired experience/outcome, and version/source records in the fixed asymmetric template layout.
- `2.0 Adaptation plan`: preserve designer-owned placeholders unless adaptation is explicitly in scope.
- `3.0 Feature flow`: main player flow plus secondary player flows when they have distinct goals, entries, operation loops, and return/destinations.
- `4.0 Feature details`: major function modules; minor function subtitles; interface/state explanations with left wireframes and right notes.
- Optional `5.0`: only for content truly outside overview, adaptation, flows, and feature details.

Feature-detail modules must contain:

- Template-like module header badges.
- One or more player-visible `1334x750` wireframes inside the left frame area.
- Right-side notes with a label above and numbered explanation lines below.
- Visible `AI待确认` notes for missing rules, contradictions, decision gaps, motivation gaps, dead-end risk, cognitive load, or unclear recovery.

## Non-Negotiables

- Do not run `render-brief-board.js`, generated renderer scripts, template-lock scripts, or validator scripts as the default path.
- Do not summarize PRD text into Figma. Translate planning facts into product intent, player flows, player-visible UI states, designer notes, and design risks.
- Do not turn the board into a config summary, operation-chain table, permission matrix, refresh schedule, or internal checklist.
- Do not draw mechanism summaries inside game-screen wireframes.
- Do not let right-side text compensate for missing visible controls/states on the left.
- Do not treat backend refresh, weekly settlement, forced recycling, permission rules, or data order as standalone player screens.
- Do not ask AI follow-ups that contradict source-stated facts or preconditions.
- Do not let AI follow-ups become only edge-case QA; lead with logic completion, player motivation, decision basis, recovery path, and feature-design risks.
- Do not introduce unsupported functions such as ranking, rules, shop, mailbox, help, share, or guide unless source-backed or explicitly labeled as AI follow-up/suggestion.
- Do not use HTML prototype layout as the design reference unless explicitly authorized.
- Do not deliver a Figma board without screenshot inspection and semantic self-review.
