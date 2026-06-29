---
name: game-interaction-prd-expander
description: Convert game planning documents, Confluence/wiki pages, PDFs, DOCX files, and optional HTML prototypes into interaction-ready Figma pre-briefs. Use when Codex needs to help game interaction designers understand a complex PRD before design work by extracting product intent, main interface structure, player flows, state logic, missing rules, contradictions, design risks, edge cases, red-dot clues, and annotated low-fidelity wireframes in Figma. Treat HTML prototypes as functional evidence, not visual/layout reference, unless the user explicitly says otherwise.
---

# Game Interaction PRD Expander

## Mission

Turn dense game PRDs into a Figma pre-brief that helps interaction designers understand the feature faster and discuss the right questions earlier.

Primary goal: make the feature understandable as product intent, interfaces, flows, states, actions, feedback, and unresolved decisions.

Secondary goal: expose logic gaps, design risks, and boundary QA so designers can focus on experience tuning instead of doing secondary planning from scratch.

Do not act as a final UI generator. The output is an interaction analysis board with usable low-fidelity wireframes, not production UI.

## Reference Loading

Load only the references needed for the current step:

- Source analysis and PRD judgment: [analysis-checklist.md](references/analysis-checklist.md)
- Wireframe usability and game interaction principles: [wireframe-design-principles.md](references/wireframe-design-principles.md)
- Figma board structure and visible output rules: [figma-output-spec.md](references/figma-output-spec.md)
- Direct Figma drawing workflow: [figma-execution-protocol.md](references/figma-execution-protocol.md)
- Final semantic review: [output-quality-model.md](references/output-quality-model.md)

For Figma writes, use direct `use_figma` drawing. Do not run renderer or validator scripts. The template manifest in `assets/krad-template/template-manifest.json` is a reference for the template source node, editable areas, and style anchors, not a required renderer input.

## Workflow

1. Confirm scope and destination.
   - If no Figma file URL/key is provided, ask for the target file before generating.
   - If a file is provided but no page/node is specified, create or use a destination page in that file.
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
   - Expand outward from that surface: entry, tabs/modes, panels, helper operations, primary/secondary actions, validation, feedback, popups, temporal stages, result states, return paths, and affected external surfaces.
   - Analyze by player goals and operation hotspots, not by PRD headings.
   - Before asking questions, separate source facts/preconditions, interaction gaps, feature-design risks, and boundary QA.
   - Respect PRD-stated gates as facts; ask about the next undefined player-facing decision after that fact.
   - Add visible functions only when source-backed by the PRD/HTML evidence or explicitly labeled as AI suggestion/follow-up.
   - Translate config and technical evidence into player-visible behavior, state, feedback, fallback, or recovery. Omit pure implementation cleanup from the main board.

4. Plan the board content directly.
   - Product meaning -> `1.0 Design overview`.
   - Goal-level player journey -> `3.0 Feature flow`.
   - Player-visible feature groups -> `4.0 Feature details`.
   - Source-backed interaction rules, states, actions, feedback, and dependencies -> right-side notes.
   - Missing rules, contradictions, inferred decisions, and design risks -> visible AI pending-confirmation notes.
   - Red-dot rules -> red-dot notes only when in scope.

5. Generate Figma output by direct drawing.
   - Use the user's provided template/page. If none is provided, use the manifest fallback template node in `assets/krad-template/template-manifest.json` as a style reference.
   - Load `figma-execution-protocol.md` before writing to Figma.
   - Use `use_figma` directly to clone or visually follow the template structure and then draw/edit the board content.
   - Keep `1.0`, `2.0`, `3.0`, and `4.0` as single global sections. Multiple major functions expand only inside `4.0`; never clone the whole board scaffold per module.
   - Preserve fixed template areas, top floating/header, footer/logo decoration, adaptation placeholders, typography, spacing, component styling, and reserved designer-owned modules.
   - Use simple `1334x750` mobile-game wireframes unless the source/user says otherwise.
   - Left wireframes must be plausible player-visible interface states, not rule cards, mechanism summaries, backend diagrams, or lists of feature names.
   - Right-side notes must use the template label/note visual style. The AI pending-confirmation label must use a red warning color family.
   - Hide unused reserved blocks, such as red-dot details, instead of leaving template placeholders visible.
   - Extend board height and move later content/footer down as content grows.

6. Verify before delivery.
   - Screenshot and inspect the board visually.
   - Use `output-quality-model.md` for semantic review: interaction designer view first, player view second.
   - Check template adherence manually: no visible template residue, no global section duplication, no overlap, header/footer preserved, right-side labels styled consistently.
   - Check content quality manually: product positioning is not empty, 3.0 is a real player flow, 4.0 contains usable wireframes, notes explain state/action/feedback, and AI pending-confirmation is visible.

## Output Contract

Default Figma board:

- `1.0 Design overview`: product positioning body text and version records in the fixed asymmetric template layout.
- `2.0 Adaptation plan`: preserve designer-owned placeholders unless adaptation is explicitly in scope.
- `3.0 Feature flow`: main flow plus secondary flows when they have distinct flow names and diagrams.
- `4.0 Feature details`: one major-function module per major-title slot; minor functions use subtitle slots; interface explanations use interface-title slots plus left wireframe and right notes.
- Optional `5.0`: create only when content is truly outside overview, adaptation, flow, and feature details.

Feature-detail modules must contain:

- Template module header badges.
- One or more player-visible `1334x750` wireframes inside the left frame area.
- Right-side notes with a label above and numbered explanation lines below.
- Custom labels such as AI pending-confirmation derived from the template label style, not hand-drawn as unrelated tags.

## Non-Negotiables

- Do not run `render-brief-board.js`, generated renderer scripts, template-lock scripts, or validator scripts as the default path.
- Do not merely repeat planning text; reframe it into product intent, interfaces, states, actions, feedback, and decisions.
- Do not turn the board into a config summary, operation-chain table, or internal checklist.
- Do not use HTML prototype layout as the design reference unless explicitly authorized.
- Do not introduce unsupported functions such as ranking, rules, shop, mailbox, help, share, or guide.
- Do not let right-side text compensate for missing visible controls/states on the left.
- Do not draw mechanism summaries inside game-screen wireframes.
- Do not ask AI follow-ups that contradict source-stated facts or preconditions.
- Do not let AI follow-ups become only edge-case QA; lead with logic completion and design risks.
- Do not replace the direct-drawing workflow with a renderer fallback when the template is hard to clone. Use the template visually and report any template-access blocker clearly.
- Do not deliver a Figma board without screenshot inspection and semantic self-review.