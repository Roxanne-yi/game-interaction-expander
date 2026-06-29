// Read-only helper for refreshing the KRAD template manifest from Figma.
// Run with use_figma after setting CONFIG.templateNodeId. It returns a compact
// structural inventory. Update assets/krad-template/template-manifest.json from
// the returned node IDs and rules; do not write to the source template.

const CONFIG = {
  templateNodeId: "1184:1331"
};

function round(n) {
  return typeof n === "number" ? Math.round(n * 100) / 100 : n;
}

function rel(node, root) {
  const nb = node.absoluteBoundingBox;
  const rb = root.absoluteBoundingBox;
  return {
    x: round(nb.x - rb.x),
    y: round(nb.y - rb.y),
    width: round(node.width),
    height: round(node.height)
  };
}

function textInfo(node) {
  if (node.type !== "TEXT") return undefined;
  return {
    text: node.characters,
    font: node.fontName === figma.mixed ? "mixed" : `${node.fontName.family} ${node.fontName.style}`,
    size: node.fontSize === figma.mixed ? "mixed" : round(node.fontSize)
  };
}

function nodeInfo(node, root, depth) {
  const out = {
    id: node.id,
    type: node.type,
    name: node.name,
    depth,
    rel: rel(node, root)
  };
  const text = textInfo(node);
  if (text) out.text = text;
  return out;
}

function walk(node, root, depth, out) {
  if ("absoluteBoundingBox" in node && node.absoluteBoundingBox && "width" in node) {
    out.push(nodeInfo(node, root, depth));
  }
  if ("children" in node && depth < 6) {
    for (const child of node.children) walk(child, root, depth + 1, out);
  }
}

const root = await figma.getNodeByIdAsync(CONFIG.templateNodeId);
if (!root) throw new Error(`Template node not found: ${CONFIG.templateNodeId}`);
if (!("children" in root)) throw new Error(`Template node is not inspectable: ${CONFIG.templateNodeId}`);

const nodes = [];
walk(root, root, 0, nodes);

return {
  source_template: {
    file_key: figma.fileKey,
    node_id: root.id,
    node_name: root.name,
    node_type: root.type,
    width: root.width,
    height: root.height
  },
  counts: nodes.reduce((acc, node) => {
    acc.total += 1;
    acc.byType[node.type] = (acc.byType[node.type] || 0) + 1;
    return acc;
  }, { total: 0, byType: {} }),
  sections: nodes.filter((node) => node.type === "TEXT" && node.text && /^\\d\\.0|设计概要|适配方案|功能流程|功能详情/.test(node.text.text)),
  header: nodes.filter((node) => node.rel.y >= -80 && node.rel.y <= 230),
  overview: nodes.filter((node) => node.rel.y >= 430 && node.rel.y <= 1500),
  flow: nodes.filter((node) => node.rel.y >= 4070 && node.rel.y <= 5000),
  feature_detail: nodes.filter((node) => node.rel.y >= 5280 && node.rel.y <= 8800),
  footer: nodes.filter((node) => node.name === "底部装饰" || node.rel.y >= root.height - 250)
};
