# Figma Execution Protocol

Use this protocol whenever the skill writes a Figma pre-brief board. It is a manifest-enforced workflow, not optional advice.

The goal is to prevent recurring structural failures: drawing from scratch instead of using the template, editing designer-owned header areas, resizing adaptation placeholders, replacing label components with hand-drawn tags, and delivering boards that were not structurally checked.

The active KRAD template contract lives in `assets/krad-template/template-manifest.json`.

## 1. Prepare The Renderer Payload

Before Figma writing, create a compact `analysis` object from the PRD interpretation:

```json
{
  "boardName": "Feature name | interaction pre-brief v0.1",
  "mode": "create",
  "header": {
    "projectTitle": "",
    "planner": "",
    "ued": "",
    "date": ""
  },
  "overview": {
    "problem": "",
    "targetAudience": "",
    "expectedEffect": "",
    "versionRow": {
      "version": "v0.1",
      "change": "根据 PRD 生成交互预解析",
      "date": ""
    }
  },
  "flows": [
    {
      "name": "主流程",
      "steps": [
        { "screenName": "界面名称", "condition": "触发条件" }
      ]
    }
  ],
  "featureModules": [
    {
      "title": "主标题",
      "note": "",
      "subsections": [
        {
          "title": "副标题",
          "note": "",
          "interfaces": [
            {
              "title": "界面标题",
              "wireframe": { "description": "low-fidelity player-visible state" },
              "notes": [
                { "tag": "策划注意", "lines": ["1. ..."] }
              ]
            }
          ]
        }
      ]
    }
  ],
  "redDot": null,
  "extension": null
}
```

Keep the analysis object structural. Do not put rendering style decisions in it; styles come from the manifest and cloned template.

## 2. Render The Board

Run `scripts/render-brief-board.js` through `use_figma`.

Before running it:

- Paste `assets/krad-template/template-manifest.json` into `CONFIG.manifest`.
- Paste the prepared analysis object into `CONFIG.analysis`.
- Set `CONFIG.targetPageId` when the user specified a destination page node.
- Set `CONFIG.targetBoardId` only for an iteration of an existing rendered board.

The renderer must:

- Clone the template component from `manifest.source_template.node_id`.
- Resolve editable slots on the cloned board by manifest aliases and source-node locators.
- Keep the global section scaffold single-instance: exactly one `1.0`, one `2.0`, one `3.0`, and one `4.0`. Never duplicate the full template or global sections for each feature module.
- Auto-fill header text when a source exists; preserve placeholders when absent.
- Edit header text only. Never modify top floating bar style, images, fills, fonts, positions, or geometry.
- Fill `1.0` by replacing only body text below the fixed questions.
- Keep `1.0` asymmetric. Never convert it into equal-width cards.
- Use version rows according to iteration history: first generation has one filled row below the header; later iterations append a new row.
- Keep `2.0` empty by default.
- Generate `3.0` as one or more complete flow blocks. Each flow block contains flow name, screen nodes, connectors, and condition labels. Nodes contain only interface name and screen placeholder. Branches and judgment nodes may be derived from player flow.
- Generate `4.0` by hierarchy: major function -> `主标题`; minor function -> `副标题`; interface explanation -> `界面标题 + left wireframe + right notes`.
- Expand only the `4.0` feature-detail module prototype for multiple major functions. Do not clone or redraw `1.0`, `2.0`, or `3.0` while adding modules.
- Draw AI wireframes inside the left template frame only. Do not replace the frame shell.
- Build right-side notes with template labels above and numbered explanation lines below.
- Derive missing labels such as `AI待确认` from the label/tag style and use the manifest red warning color family.
- Create `5.0` only when content is truly outside overview, adaptation, flow, and feature details.
- Extend board height and move footer when needed.
- If red-dot content is absent or explicitly out of scope, hide/remove the red-dot template block instead of leaving `红点流程名称`, `界面名称`, or `备注内容（非必须）` placeholders visible.
- Stop and report an error if a required manifest slot or prototype cannot be resolved. Do not fall back to freehand drawing.
- Do not run ad-hoc post-render "repair" scripts that clone the whole board, rebuild global sections, or hand-draw template components. Fix the renderer/analysis payload, rerender, and revalidate.

## 3. Validate The Board

Run `scripts/figma-board-validator.js` through `use_figma` after rendering.

Before running it:

- Paste the same manifest into `CONFIG.manifest`.
- Set `CONFIG.targetBoardId` to the rendered board ID.

The validator must read the manifest and check:

- `1.0`, `2.0`, `3.0`, and `4.0` each appear exactly once.
- Header style is unchanged except allowed text.
- `1.0` still uses the asymmetric template layout.
- `1.0` body replacement changed only allowed body text slots.
- Version rows follow mode: first generation has one row; iteration appends rows.
- `2.0` remains untouched unless explicitly in scope.
- Every `3.0` flow has flow name, nodes, connectors, and condition labels.
- Flow names are distinct; secondary flows must not repeat the main-flow name.
- Flow-name text does not clip outside the board.
- Flow nodes contain only interface name plus screen placeholder.
- Every major function in `4.0` uses a template `主标题` group.
- Every minor function uses a template `副标题` group.
- Every interface explanation uses `界面标题` plus a left screen frame.
- Right-side notes use label/tag styling, numbered lines, and no overlap.
- `AI待确认` labels use the red warning color family and are not hand-drawn generic frames.
- Critical template prototypes are cloned or edited; chips, labels, version rows, dividers, and screen frames are not redrawn from generic rectangles.
- Footer sits at the board bottom after height expansion.
- Footer does not leave a large blank gap after the last visible content.
- No forbidden placeholder text remains in filled sections.

If the validator fails, repair the board and rerun it. Do not final-deliver a failed board unless the failure is impossible to resolve and is clearly reported to the user.

Validator warnings are not automatic blockers, but they require inspection and either repair or a brief explanation.

## 4. Pair Code Checks With Semantic Review

The scripts only catch deterministic structure problems. They do not prove that the PRD analysis is correct, that source facts were read carefully, or that wireframes are usable.

After validator pass, still run the review model in `output-quality-model.md`:

- Interaction blueprint gate.
- Basic usability gate.
- Player-screenshot gate.
- Flow ownership gate.
- Right-side explanation gate.
- AI follow-up gate.
- Source and scope gate.
- Template and Figma composition gate.
- Dual review gate.

## 5. Final Response Requirement

When delivering a Figma board, include a compact status line:

- Renderer: passed, failed, or blocked.
- Validator: passed, warnings, failed, or blocked.
- Any intentional exception, such as user-authorized non-template generation.

If no Figma board was generated in the current turn, this protocol does not need to be reported.
