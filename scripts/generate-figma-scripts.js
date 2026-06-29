"use strict";

const fs = require("fs");
const path = require("path");
const { readUtf8Json, writeUtf8Json, assertNoDamagedText } = require("./_contract_lib");

const GENERATED_VERSION = "game-interaction-prd-expander/figma-generated-scripts/2.0";
const RENDER_PAYLOAD_SCHEMA = "game-interaction-prd-expander/render-payload/1.0";
const STATE_RENDER_READY = "render_ready";
const STATE_FIGMA_SCRIPTS_READY = "figma_scripts_ready";
const STATE_OFFICIAL_RENDER_REQUIRED = "official_render_required";
const MAX_FIGMA_SCRIPT_CHARS = 25000;
const RUNNER_VERSION = "payload-runner-v0.2";
const RUNNER_SCRIPT_HASH = "figma-payload-runner:direct-batches:2026-06-24";
const RUNTIME_KEY = "payloadRunnerRuntime";
const RENDERER_VERSION = "manifest-renderer-v0.9";
const RENDERER_SCRIPT_HASH = "render-brief-board:scaffold-llm-content:2026-06-24";
const VALIDATOR_VERSION = "manifest-validator-v1.0";
const VALIDATOR_SCRIPT_HASH = "figma-board-validator:scaffold-llm-content:2026-06-24";

function usage() {
  console.error([
    "Usage:",
    "  node scripts/generate-figma-scripts.js <run-dir> [--target-page-id <figma-page-id>] [--target-board-id <board-id>] [--out-dir <dir>]"
  ].join("\n"));
  process.exit(2);
}

function main(argv = process.argv.slice(2)) {
  const runDir = argv[0];
  if (!runDir) usage();
  const options = parseOptions(argv.slice(1));
  const result = generateFigmaScripts(runDir, options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

function parseOptions(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    const value = argv[i + 1];
    if (key === "--target-page-id") {
      options.targetPageId = value || "";
      i += 1;
    } else if (key === "--target-board-id") {
      options.targetBoardId = value || "";
      i += 1;
    } else if (key === "--out-dir") {
      options.outDir = value || "";
      i += 1;
    } else {
      usage();
    }
  }
  return options;
}

function generateFigmaScripts(runDir, options = {}) {
  const root = path.resolve(__dirname, "..");
  const resolvedRunDir = path.resolve(runDir);
  const state = readUtf8Json(path.join(resolvedRunDir, "run-state.json"));
  if (![STATE_RENDER_READY, STATE_FIGMA_SCRIPTS_READY, STATE_OFFICIAL_RENDER_REQUIRED].includes(state.currentStage)) {
    throw new Error(`Cannot generate Figma scripts from stage ${state.currentStage}. Run render-ready first.`);
  }

  const manifest = readUtf8Json(path.join(root, "assets", "krad-template", "template-manifest.json"));
  const payload = readUtf8Json(path.join(resolvedRunDir, "render-payload.json"));
  if (payload.schemaVersion !== RENDER_PAYLOAD_SCHEMA) throw new Error(`render-payload.json must use ${RENDER_PAYLOAD_SCHEMA}.`);

  const outDir = path.resolve(options.outDir || path.join(resolvedRunDir, "figma-scripts"));
  fs.mkdirSync(outDir, { recursive: true });
  const targetPageId = String(options.targetPageId || "");
  const targetBoardId = String(options.targetBoardId || "");
  const targetBoardPlaceholder = targetBoardId || "__TARGET_BOARD_ID_AFTER_RENDER__";

  const renderPayloadFiles = buildRenderPayloadFiles(outDir, manifest, payload, { targetPageId, targetBoardId: targetBoardPlaceholder });
  const validatorFile = {
    path: path.join(outDir, "figma-validator.generated.js"),
    content: withGeneratedHeader("validator payload", buildValidatorPayloadScript(manifest, targetBoardPlaceholder, payload))
  };
  const gateSource = fs.readFileSync(path.join(root, "scripts", "verify-official-board.js"), "utf8");
  const gateFile = {
    path: path.join(outDir, "figma-gate.generated.js"),
    content: withGeneratedHeader("gate payload", injectGateConfig(gateSource, manifest, targetBoardPlaceholder))
  };

  for (const file of [...renderPayloadFiles, validatorFile, gateFile]) writeSizedUtf8Text(file.path, file.content);

  const index = {
    schemaVersion: GENERATED_VERSION,
    generatedAt: new Date().toISOString(),
    runDir: resolvedRunDir,
    sourcePayload: "render-payload.json",
    targetPageId,
    targetBoardId: targetBoardId || "",
    targetBoardIdPlaceholder: targetBoardPlaceholder,
    scriptSizeLimitChars: MAX_FIGMA_SCRIPT_CHARS,
    runnerVersion: RUNNER_VERSION,
    runnerScriptHash: RUNNER_SCRIPT_HASH,
    files: {
      renderPayloads: renderPayloadFiles.map((file) => path.relative(resolvedRunDir, file.path).replace(/\\/g, "/")),
      renderStages: renderPayloadFiles.map((file) => path.relative(resolvedRunDir, file.path).replace(/\\/g, "/")),
      validator: path.relative(resolvedRunDir, validatorFile.path).replace(/\\/g, "/"),
      gate: path.relative(resolvedRunDir, gateFile.path).replace(/\\/g, "/")
    },
    instructions: [
      "Every generated Figma payload script is capped at 25000 characters.",
      "Run renderPayloads in the listed order. They are direct scaffold batches, not source chunks.",
      "After scaffold batches, LLM must draw 3.0/4.0 content inside the recorded slots before validator/gate.",
      "If targetBoardId was not provided, put the returned boardId into validator and gate scripts only.",
      "Run figma-validator.generated.js, then figma-gate.generated.js.",
      "If any payload fails, stop with renderer_transport_failed. Do not create a substitute board."
    ]
  };
  writeUtf8Json(path.join(outDir, "figma-scripts.index.json"), index);
  return {
    ok: true,
    outDir,
    files: index.files,
    targetBoardIdPlaceholder: targetBoardPlaceholder,
    runnerVersion: RUNNER_VERSION,
    runnerScriptHash: RUNNER_SCRIPT_HASH
  };
}

function buildRenderPayloadFiles(outDir, manifest, payload, options) {
  const stages = [
    { name: "000-bootstrap", stage: "bootstrap", payload: pickPayload(payload, ["boardName", "header", "overview", "modelSummary"]) },
    { name: "001-overview", stage: "overview", payload: pickPayload(payload, ["header", "overview", "generatedDate", "mode"]) },
    { name: "002-flows", stage: "flows", payload: { flows: payload.flows || [] } }
  ];
  const modules = Array.isArray(payload.featureModules) ? payload.featureModules : [];
  modules.forEach((module, index) => {
    stages.push({
      name: `003-feature-module-${String(index + 1).padStart(3, "0")}-start`,
      stage: "featureModuleStart",
      payload: { module: compactModuleHeaderForRender(module), moduleIndex: index, moduleCount: modules.length }
    });
    flattenModuleInterfaces(module).forEach((row, rowIndex) => {
      stages.push({
        name: `004-feature-module-${String(index + 1).padStart(3, "0")}-row-${String(rowIndex + 1).padStart(3, "0")}`,
        stage: "featureInterfaceRow",
        payload: {
          moduleIndex: index,
          rowIndex,
          rowCount: flattenModuleInterfaces(module).length,
          subsection: compactSubsectionForRender(row.subsection),
          interface: compactInterfaceForRender(row.interface)
        }
      });
    });
  });
  stages.push({ name: "999-finalize", stage: "finalize", payload: { modelSummary: payload.modelSummary || {}, sourceCoverageCount: Array.isArray(payload.sourceCoverage) ? payload.sourceCoverage.length : 0, redDot: payload.redDot || null } });

  return stages.map((stage) => ({
    stage: stage.stage,
    path: path.join(outDir, `figma-render.payload-${stage.name}.generated.js`),
    content: withGeneratedHeader(`render payload ${stage.name}`, buildRenderPayloadScript(manifest, stage.payload, stage.stage, options))
  }));
}

function pickPayload(payload, keys) {
  const result = {};
  for (const key of keys) result[key] = payload[key];
  return result;
}

function flattenModuleInterfaces(module) {
  const rows = [];
  (module.subsections || []).forEach((subsection) => {
    (subsection.interfaces || []).forEach((iface) => rows.push({ subsection, interface: iface }));
  });
  return rows;
}

function compactModuleHeaderForRender(module) {
  return {
    title: module.title || "",
    note: module.note || ""
  };
}

function compactSubsectionForRender(subsection) {
  return {
    title: subsection.title || "",
    note: subsection.note || ""
  };
}

function compactInterfaceForRender(iface) {
  return {
    id: iface.id || "",
    title: iface.title || "",
    screenName: iface.screenName || "",
    description: iface.description || "",
    wireframe: compactWireframeForRender(iface.wireframe || {}),
    notes: compactNotesForRender(iface.notes || []),
    aiPending: Array.isArray(iface.aiPending) ? iface.aiPending.map((item) => String(item || "")) : []
  };
}

function compactWireframeForRender(wireframe) {
  return {
    title: wireframe.title || "",
    surface: wireframe.surface || "",
    surfaceType: wireframe.surfaceType || "",
    layoutIntent: wireframe.layoutIntent || "",
    primaryTask: wireframe.primaryTask || "",
    description: wireframe.description || "",
    regions: copyRenderArray(wireframe.regions),
    controls: copyRenderArray(wireframe.controls),
    states: copyRenderArray(wireframe.states),
    feedback: copyRenderArray(wireframe.feedback),
    modal: wireframe.modal || null,
    toast: wireframe.toast || null,
    primaryAction: wireframe.primaryAction || "",
    secondaryActions: copyRenderArray(wireframe.secondaryActions)
  };
}

function compactNotesForRender(notes) {
  return (notes || []).map((note) => ({
    tag: note.tag || "",
    targetElementId: note.targetElementId || "",
    body: note.body || note.text || note.question || "",
    coverage: Array.isArray(note.coverage) ? note.coverage.map((item) => String(item || "")) : [],
    basis: note.basis || "",
    evidence: note.evidence || ""
  }));
}

function copyRenderArray(value) {
  return Array.isArray(value) ? value.map((item) => (item && typeof item === "object" ? { ...item } : item)) : [];
}

function buildRenderPayloadScript(manifest, payload, stage, options) {
  const config = {
    stage,
    manifest: stage === "bootstrap" ? compactBootstrapManifest(manifest) : manifest,
    payload,
    targetPageId: options.targetPageId || "",
    targetBoardId: options.targetBoardId || "",
    runnerVersion: RUNNER_VERSION,
    runnerScriptHash: RUNNER_SCRIPT_HASH,
    rendererVersion: RENDERER_VERSION,
    rendererScriptHash: RENDERER_SCRIPT_HASH
  };
  const runtime = renderRuntimeSource();
  if (stage === "bootstrap") {
    return [
      `const CONFIG = ${JSON.stringify(config)};`,
      `const __GIPX_RUNTIME = ${JSON.stringify(runtime)};`,
      "eval(__GIPX_RUNTIME);",
      `if(typeof globalThis.__gipxMain!=="function")throw new Error("renderer_transport_failed: bootstrap failed; __gipxMain is not exposed after eval(__GIPX_RUNTIME) in use_figma");`,
      `if(figma.root&&figma.root.setSharedPluginData)figma.root.setSharedPluginData(CONFIG.manifest.namespace,${JSON.stringify(RUNTIME_KEY)},__GIPX_RUNTIME);`,
      "return await globalThis.__gipxMain(CONFIG);"
    ].join("\n");
  }
  return [
    `const CONFIG = ${JSON.stringify(config)};`,
    `const __GIPX_RUNTIME=(figma.root&&figma.root.getSharedPluginData)?figma.root.getSharedPluginData(CONFIG.manifest.namespace,${JSON.stringify(RUNTIME_KEY)}):"";`,
    `if(!__GIPX_RUNTIME)throw new Error("renderer_transport_failed: missing payload runner runtime");`,
    "eval(__GIPX_RUNTIME);",
    `if(typeof globalThis.__gipxMain!=="function")throw new Error("renderer_transport_failed: runtime loaded but __gipxMain was not exposed");`,
    "return await globalThis.__gipxMain(CONFIG);"
  ].join("\n");
}

function compactBootstrapManifest(manifest) {
  return {
    schema_version: manifest.schema_version,
    namespace: manifest.namespace,
    source_template: {
      node_id: manifest.source_template && manifest.source_template.node_id
    }
  };
}

function renderRuntimeSource() {
  return String.raw`
globalThis.__gipxMain=async function(CONFIG){
function __bad(v,p){if(typeof v==="string"){if(/\?{3,}|\uFFFD{2,}/.test(v))throw new Error(p+" damaged text");return}if(Array.isArray(v))v.forEach((x,i)=>__bad(x,p+"["+i+"]"));else if(v&&typeof v==="object")Object.keys(v).forEach(k=>__bad(v[k],p+"."+k))}
function __walk(n,f){f(n);if("children"in n)n.children.forEach(c=>__walk(c,f))}
function __rgb(h){h=String(h||"#333333").replace("#","");return{r:parseInt(h.slice(0,2),16)/255,g:parseInt(h.slice(2,4),16)/255,b:parseInt(h.slice(4,6),16)/255}}
function __bounds(n){return n&&n.absoluteBoundingBox?n.absoluteBoundingBox:null}
function __rel(n,r){const a=__bounds(n),b=__bounds(r);if(!a||!b)return null;return{x:a.x-b.x,y:a.y-b.y,width:a.width,height:a.height}}
function __approx(a,b){return Math.abs(Number(a||0)-Number(b||0))<=3}
async function __page(){if(!CONFIG.targetPageId)return;const p=await figma.getNodeByIdAsync(CONFIG.targetPageId);if(!p||p.type!=="PAGE")throw new Error("targetPageId is not a page");await figma.setCurrentPageAsync(p)}
async function __tpl(){const t=await figma.getNodeByIdAsync(CONFIG.manifest.source_template.node_id);if(!t)throw new Error("template not found");return t}
function __pathFrom(root,n){const p=[];let c=n;while(c&&c.id!==root.id){const par=c.parent;if(!par||!("children"in par))return null;const i=par.children.indexOf(c);if(i<0)return null;p.unshift(i);c=par}return c&&c.id===root.id?p:null}
function __byPath(root,p,type){let c=root;for(const i of p||[]){if(!c||!("children"in c)||!c.children[i])return null;c=c.children[i]}if(type&&c&&c.type!==type)return null;return c}
async function __res(board,t,id,type){const s=await figma.getNodeByIdAsync(id);if(!s)throw new Error("manifest source node not found: "+id);const p=__pathFrom(t,s),byPath=__byPath(board,p,type||s.type);if(byPath)return byPath;const r=__rel(s,t);let hit=null;__walk(board,n=>{if(hit||!("width"in n)||!("height"in n)||!r)return;if(type&&n.type!==type)return;if(!type&&n.type!==s.type)return;const q=__rel(n,board);if(!q)return;if(__approx(q.x,r.x)&&__approx(q.y,r.y)&&__approx(q.width,r.width)&&__approx(q.height,r.height))hit=n});if(!hit)throw new Error("manifest slot not resolved: "+id);return hit}
async function __font(n){if(n.type!=="TEXT")return;const fs=new Map();try{n.getStyledTextSegments(["fontName"]).forEach(s=>{if(s.fontName&&s.fontName!==figma.mixed)fs.set(s.fontName.family+"::"+s.fontName.style,s.fontName)})}catch(e){fs.set("Inter::Regular",{family:"Inter",style:"Regular"})}for(const f of fs.values())await figma.loadFontAsync(f)}
async function __txt(n,v){if(!n||n.type!=="TEXT"||v===undefined||v===null)return;await __font(n);n.characters=String(v)}
async function __slot(b,t,id,v){await __txt(await __res(b,t,id,"TEXT"),v)}
function __texts(nodes){const a=[];nodes.forEach(n=>__walk(n,x=>{if(x.type==="TEXT")a.push(x)}));return a.sort((x,y)=>x.y-y.y||x.x-y.x)}
async function __first(nodes,re,v){const n=__texts(nodes).find(x=>re.test(x.characters||"")||re.test(x.name||""));if(n)await __txt(n,v)}
function __direct(b,top,bot){return b.children.filter(n=>"y"in n&&"height"in n&&n.y>=top&&n.y<bot)}
function __top(ns){return Math.min(...ns.filter(n=>"y"in n).map(n=>n.y))}
function __bottom(ns){return Math.max(0,...ns.filter(n=>"y"in n&&"height"in n).map(n=>n.y+n.height))}
function __show(n,v){__walk(n,x=>{if("visible"in x)x.visible=v})}
async function __session(b){const ns=CONFIG.manifest.namespace,key="payloadRunnerSession";let raw="";if(b&&b.getSharedPluginData)raw=b.getSharedPluginData(ns,key)||"";if(!raw&&CONFIG.targetBoardId&&CONFIG.targetBoardId!=="__TARGET_BOARD_ID_AFTER_RENDER__"){const bb=await figma.getNodeByIdAsync(CONFIG.targetBoardId);if(bb&&bb.getSharedPluginData)raw=bb.getSharedPluginData(ns,key)||""}if(!raw&&CONFIG.targetPageId){const p=await figma.getNodeByIdAsync(CONFIG.targetPageId);if(p&&p.getSharedPluginData)raw=p.getSharedPluginData(ns,key)||""}if(!raw&&figma.currentPage&&figma.currentPage.getSharedPluginData)raw=figma.currentPage.getSharedPluginData(ns,key)||"";if(!raw)throw new Error("renderer_transport_failed: missing payload runner session");return JSON.parse(raw)}
async function __writeSession(b,s){s={...s,boardId:b.id,boardName:b.name};const raw=JSON.stringify(s),ns=CONFIG.manifest.namespace,key="payloadRunnerSession";b.setSharedPluginData(ns,key,raw);if(CONFIG.targetPageId){const p=await figma.getNodeByIdAsync(CONFIG.targetPageId);if(p&&p.setSharedPluginData)p.setSharedPluginData(ns,key,raw)}if(figma.currentPage&&figma.currentPage.setSharedPluginData)figma.currentPage.setSharedPluginData(ns,key,raw);return s}
async function __board(){if(CONFIG.targetBoardId&&CONFIG.targetBoardId!=="__TARGET_BOARD_ID_AFTER_RENDER__"){const b=await figma.getNodeByIdAsync(CONFIG.targetBoardId);if(b&&"children"in b)return b}const s=await __session();const b=await figma.getNodeByIdAsync(s.boardId);if(!b)throw new Error("renderer_transport_failed: board not found");return b}
function __right(){let m=0;figma.currentPage.children.forEach(c=>{if("x"in c&&"width"in c)m=Math.max(m,c.x+c.width)});return m}
async function __bootstrap(){await __page();__bad(CONFIG.payload,"payload");const t=await __tpl();let b;if(t.type==="COMPONENT"&&t.createInstance)b=t.createInstance();else b=t.clone();figma.currentPage.appendChild(b);b.name=CONFIG.payload.boardName||"Interaction pre-brief";b.x=__right()+600;b.y=0;if(b.type==="INSTANCE"&&b.detachInstance){b=b.detachInstance();b.name=CONFIG.payload.boardName||"Interaction pre-brief"}b.setSharedPluginData(CONFIG.manifest.namespace,"manifest",JSON.stringify(CONFIG.manifest));await __writeSession(b,{createdFrom:t.type,stagesCompleted:["bootstrap"],runnerVersion:CONFIG.runnerVersion,runnerScriptHash:CONFIG.runnerScriptHash});figma.viewport.scrollAndZoomIntoView([b]);return{status:"pass",stage:"bootstrap",boardId:b.id,boardName:b.name}}
function __hiddenTxt(s){return /^(原型|副标题|界面名称|备注内容（非必须）)$|^注释内容|^动效描述/.test(String(s||"").trim())}
function __move(ns,dy){ns.forEach(n=>{if("y"in n)n.y+=dy})}
async function __overview(){const b=await __board(),t=await __tpl(),h=CONFIG.payload.header||{},o=CONFIG.payload.overview||{},s=CONFIG.manifest.slots;await __slot(b,t,s.header.text_slots.project_title.node,h.projectTitle);await __slot(b,t,s.header.text_slots.planner_owner.node,h.planner);await __slot(b,t,s.header.text_slots.ued_owner.node,h.ued);await __slot(b,t,s.header.text_slots.date.node,h.date||CONFIG.payload.generatedDate);await __slot(b,t,s.overview.body_slots.problem.body,o.problem);await __slot(b,t,s.overview.body_slots.target_audience.body,o.targetAudience);await __slot(b,t,s.overview.body_slots.expected_effect.body,o.expectedEffect);await __versions(b,t,o.versionHistory||[o.versionRow]);const ses=await __session(b);ses.stagesCompleted=[...(ses.stagesCompleted||[]),"overview"];await __writeSession(b,ses);return{status:"pass",stage:"overview",boardId:b.id}}
async function __versions(b,t,rows){const vt=CONFIG.manifest.slots.overview.version_table;if(!vt)return;const box=await __res(b,t,vt.container),ids=vt.row_prototypes||[];let prot=[];for(const id of ids){try{prot.push(await __res(b,t,id))}catch(e){}}if(!prot.length)return;rows=(rows||[]).filter(Boolean);for(let i=0;i<rows.length;i++){let r=prot[i]||prot[0].clone();if(i>=prot.length){box.appendChild(r);r.y=prot[0].y+i*prot[0].height}__show(r,true);const tx=__texts([r]).sort((a,b)=>a.x-b.x);await __txt(tx[0],rows[i].version||"v0.1");await __txt(tx[1],rows[i].change||"根据 PRD 生成交互预解析");await __txt(tx[2],rows[i].date||"")}for(let i=rows.length;i<prot.length;i++)__show(prot[i],false)}
async function __flows(){const b=await __board(),t=await __tpl(),fm=CONFIG.manifest.slots.flow,flows=CONFIG.payload.flows||[];if(!flows.length)return{status:"pass",stage:"flows-empty",boardId:b.id};const chip=await __res(b,t,fm.flow_name_chip),dia=await __res(b,t,fm.diagram_group);let base=dia.y+dia.height;const slots=[];for(let i=0;i<flows.length;i++){let c=chip,d=dia;if(i>0){c=chip.clone();d=dia.clone();b.appendChild(c);b.appendChild(d);c.y=base+140;d.y=c.y+83}const flow=flows[i]||{};await __first([c],/流程|flow/i,flow.name||flow.title||("流程 "+(i+1)));d.name="llm flow diagram slot "+(flow.id||flow.flowId||("FLOW-"+String(i+1).padStart(3,"0")));__clearFlowSample(d);__show(d,true);const needed=__flowSlotHeight(flow);if("resize"in d)d.resize(d.width,Math.max(d.height,needed));base=d.y+d.height;slots.push({flowId:flow.id||flow.flowId||"",title:flow.name||flow.title||"",flowNameId:c.id,diagramId:d.id,bounds:{x:d.x,y:d.y,width:d.width,height:d.height},expectedNodeCount:(flow.nodes||flow.steps||[]).length,expectedEdgeCount:(flow.edges||[]).length})}const ses=await __session(b);ses.flowLayout={bottom:base,slots};ses.stagesCompleted=[...(ses.stagesCompleted||[]),"flows"];await __writeSession(b,ses);return{status:"pass",stage:"flows-scaffold",boardId:b.id,flowCount:flows.length,flowBottom:base}}
function __flowSlotHeight(flow){const nodes=(flow&&((flow.nodes||flow.steps)||[]))||[];const rows=Math.max(1,Math.ceil(nodes.length/4));return 620+(rows-1)*340}
function __clearFlowSample(root){__walk(root,n=>{if(n===root)return;if(/Arrow|connector|edge|flow edge|Group 34/.test(n.name||""))__show(n,false);if(n.type==="TEXT"&&/界面|screen|占位|触发|条件|节点|示例/.test(n.characters||n.name||""))__show(n,false)})}
async function __featureStart(){const b=await __board(),t=await __tpl(),m=CONFIG.payload.module||{},idx=CONFIG.payload.moduleIndex||0,slots=CONFIG.manifest.slots,det=slots.feature_detail,start=await __res(b,t,det.module_block.start),red=await __res(b,t,slots.red_dot.major_title.container);let ses=await __session(b);ses.featureLayout=ses.featureLayout||{modules:{},nextY:start.y,llmSlots:[]};let baseNodes;if(idx===0){baseNodes=__direct(b,start.y,red.y);const desired=Math.max(start.y,(ses.flowLayout&&ses.flowLayout.bottom?ses.flowLayout.bottom+220:start.y));if(desired>start.y+2)__move(baseNodes,desired-start.y);if(!b.getSharedPluginData(CONFIG.manifest.namespace,"featurePrototype")){const p=baseNodes.map(n=>{const c=n.clone();b.appendChild(c);__show(c,false);return c.id});b.setSharedPluginData(CONFIG.manifest.namespace,"featurePrototype",JSON.stringify(p))}ses.featureLayout.nextY=desired}else{const proto=JSON.parse(b.getSharedPluginData(CONFIG.manifest.namespace,"featurePrototype")||"[]");baseNodes=[];for(const id of proto){const n=await figma.getNodeByIdAsync(id);if(n){const c=n.clone();b.appendChild(c);__show(c,true);baseNodes.push(c)}}__move(baseNodes,(ses.featureLayout.nextY||start.y)-__top(baseNodes))}await __first(baseNodes,/^主标题$/,m.title||("功能模块 "+(idx+1)));await __first(baseNodes,/备注内容（非必须）/,m.note||"");const subRoots=baseNodes.filter(n=>{let h=false;__walk(n,x=>{if(x.type==="TEXT"&&/^副标题$/.test(x.characters||""))h=true});return h}).sort((a,b)=>a.y-b.y);const rowTop=(subRoots[0]||baseNodes[0]).y,rowEnd=subRoots[1]?subRoots[1].y:__bottom(baseNodes);const rowProto=baseNodes.filter(n=>"y"in n&&n.y>=rowTop&&n.y<rowEnd);baseNodes.filter(n=>"y"in n&&n.y>=rowTop).forEach(n=>__show(n,false));const rowTpl=rowProto.map(n=>{const c=n.clone();b.appendChild(c);__show(c,false);return c.id});ses.featureLayout.modules[String(idx)]={nodeIds:baseNodes.map(n=>n.id),rowTemplateIds:rowTpl,rowTop,currentY:rowTop,bottom:rowTop,rowCount:CONFIG.payload.rowCount||0};ses.stagesCompleted=[...(ses.stagesCompleted||[]),"feature-module-start:"+idx];await __writeSession(b,ses);return{status:"pass",stage:"featureModuleStart",moduleIndex:idx,boardId:b.id}}
async function __featureRow(){const b=await __board(),idx=CONFIG.payload.moduleIndex||0,rowIndex=CONFIG.payload.rowIndex||0,sub=CONFIG.payload.subsection||{},iface=CONFIG.payload.interface||{};let ses=await __session(b),lay=ses.featureLayout&&ses.featureLayout.modules&&ses.featureLayout.modules[String(idx)];if(!lay)throw new Error("renderer_transport_failed: feature module not initialized");const tpl=[];for(const id of lay.rowTemplateIds||[]){const n=await figma.getNodeByIdAsync(id);if(n)tpl.push(n)}if(!tpl.length)throw new Error("renderer_transport_failed: missing feature row template");const rn=tpl.map(n=>{const c=n.clone();b.appendChild(c);__show(c,true);return c});__move(rn,(lay.currentY||lay.rowTop)-__top(rn));await __first(rn,/^副标题$/,sub.title||("功能点 "+(rowIndex+1)));await __first(rn,/备注内容（非必须）/,sub.note||"");await __first(rn,/^界面标题$|^产品定位$|^界面名称$/,iface.title||iface.screenName||("界面 "+(rowIndex+1)));const slots=await __scaffoldInterfaceRow(b,rn,iface,idx,rowIndex);const rowH=Math.max(980,__estimateRowHeight(iface));lay.currentY=(lay.currentY||lay.rowTop)+rowH+130;lay.bottom=lay.currentY;if(rowIndex+1>=(CONFIG.payload.rowCount||0))ses.featureLayout.nextY=lay.currentY+160;ses.featureLayout.llmSlots=[...(ses.featureLayout.llmSlots||[]),slots];b.setSharedPluginData(CONFIG.manifest.namespace,"llmEditableSlots",JSON.stringify(ses.featureLayout.llmSlots));ses.stagesCompleted=[...(ses.stagesCompleted||[]),"feature-interface-row:"+idx+":"+rowIndex];await __writeSession(b,ses);return{status:"pass",stage:"featureInterfaceRowScaffold",moduleIndex:idx,rowIndex,boardId:b.id,rowHeight:rowH,wireframeSlotId:slots.wireframeSlotId,noteSlotId:slots.noteSlotId}}
async function __scaffoldInterfaceRow(b,nodes,iface,moduleIndex,rowIndex){let frame=null;nodes.forEach(n=>__walk(n,x=>{if(!frame&&"width"in x&&x.width>=900&&x.height>=500)frame=x}));if(!frame)throw new Error("renderer_transport_failed: missing left wireframe frame");frame.name="llm wireframe slot "+(iface.id||("IF-"+String(rowIndex+1).padStart(3,"0")));__walk(frame,x=>{if(x!==frame&&x.type==="TEXT"&&/^(原型|Prototype)$/i.test(x.characters||""))__show(x,false)});nodes.forEach(n=>__walk(n,x=>{if(x.type==="TEXT"&&__hiddenTxt(x.characters||x.name))__show(x,false)}));const noteSlot=figma.createFrame();noteSlot.name="llm note slot "+(iface.id||("IF-"+String(rowIndex+1).padStart(3,"0")));noteSlot.x=frame.x+frame.width+250;noteSlot.y=frame.y;noteSlot.resize(1550,Math.max(760,__estimateNoteHeight(iface)));noteSlot.fills=[];b.appendChild(noteSlot);noteSlot.setSharedPluginData(CONFIG.manifest.namespace,"interfaceId",iface.id||"");noteSlot.setSharedPluginData(CONFIG.manifest.namespace,"instructions","LLM draws template-label notes here: numbered text, semantic discipline tags, red AI待确认.");frame.setSharedPluginData(CONFIG.manifest.namespace,"interfaceId",iface.id||"");frame.setSharedPluginData(CONFIG.manifest.namespace,"instructions","LLM draws the player-visible low-fidelity interface here. Do not draw rule summaries.");return{moduleIndex,rowIndex,interfaceId:iface.id||"",title:iface.title||iface.screenName||"",wireframeSlotId:frame.id,noteSlotId:noteSlot.id,wireframeBounds:{x:frame.x,y:frame.y,width:frame.width,height:frame.height},noteBounds:{x:noteSlot.x,y:noteSlot.y,width:noteSlot.width,height:noteSlot.height}}}
function __estimateRowHeight(iface){return Math.max(980,__estimateNoteHeight(iface)+120)}
function __estimateNoteHeight(iface){const notes=(iface&&iface.notes)||[];const chars=notes.reduce((n,x)=>n+String((x&&(x.body||x.text||x.question))||"").length,0)+((iface.aiPending||[]).join("").length);return Math.min(2200,Math.max(760,520+Math.ceil(chars/55)*26))}
async function __final(){const b=await __board(),t=await __tpl();let footer=null;try{footer=await __res(b,t,CONFIG.manifest.slots.footer.node)}catch(e){}let max=0;__walk(b,n=>{if(n!==footer&&"y"in n&&"height"in n&&n.visible!==false)max=Math.max(max,n.y+n.height)});if(footer&&"y"in footer){footer.y=max+120;max=footer.y+footer.height}if(b.resize)b.resize(b.width,Math.max(b.height,max));const s=await __session(b);const protectedSnapshots=await __snapshotProtected(b,t);const rec={rendererVersion:CONFIG.rendererVersion,scriptHash:CONFIG.rendererScriptHash,runnerVersion:CONFIG.runnerVersion,runnerScriptHash:CONFIG.runnerScriptHash,createdAt:new Date().toISOString(),manifestSchemaVersion:CONFIG.manifest.schema_version,sourceTemplateNodeId:CONFIG.manifest.source_template.node_id,boardId:b.id,boardName:b.name,createdFrom:s.createdFrom||"payload-runner",mode:"create",renderMode:"official-template-scaffold-with-llm-content",contentAuthor:"LLM",semanticReviewRequired:true,semanticReviewStatus:"required-after-figma-content",protectedSnapshots,renderStagesCompleted:[...(s.stagesCompleted||[]),"finalize"],expectedFeatureInterfaceCount:(CONFIG.payload.modelSummary||{}).interfaceCount||0,expectedFlowStepCount:(CONFIG.payload.modelSummary||{}).flowNodeCount||0,expectedFlowEdgeCount:(CONFIG.payload.modelSummary||{}).flowEdgeCount||0,expectedWireframeCount:(CONFIG.payload.modelSummary||{}).interfaceCount||0,modelSummary:CONFIG.payload.modelSummary||null,expectedSourceCoverageCount:CONFIG.payload.sourceCoverageCount||0};b.setSharedPluginData(CONFIG.manifest.namespace,"renderRecord",JSON.stringify(rec));b.setSharedPluginData(CONFIG.manifest.namespace,"manifest",JSON.stringify(CONFIG.manifest));figma.viewport.scrollAndZoomIntoView([b]);return{status:"pass",stage:"finalize",boardId:b.id,rendererVersion:rec.rendererVersion,height:b.height,semanticReviewRequired:true}}
async function __snapshotProtected(b,t){const ids=[];try{const h=CONFIG.manifest.slots.header||{};ids.push(h.bar_frame,h.background,...(h.brand_assets||[]))}catch(e){}try{ids.push(CONFIG.manifest.slots.footer.node)}catch(e){}const out=[];for(const sourceId of ids.filter(Boolean)){try{const node=await __res(b,t,sourceId);const r=__rel(node,b);if(r)out.push({sourceId,id:node.id,name:node.name,type:node.type,rel:r})}catch(e){}}return out}
async function __gipxMain(){__bad(CONFIG,"CONFIG");if(CONFIG.stage==="bootstrap")return await __bootstrap();if(CONFIG.stage==="overview")return await __overview();if(CONFIG.stage==="flows")return await __flows();if(CONFIG.stage==="featureModuleStart")return await __featureStart();if(CONFIG.stage==="featureInterfaceRow")return await __featureRow();if(CONFIG.stage==="finalize")return await __final();throw new Error("unknown payload stage "+CONFIG.stage)}
return await __gipxMain();
};
`;
}

function buildValidatorPayloadScript(manifest, targetBoardId, payload) {
  const config = {
    namespace: manifest.namespace,
    targetBoardId,
    validatorVersion: VALIDATOR_VERSION,
    scriptHash: VALIDATOR_SCRIPT_HASH,
    requiredRendererVersion: RENDERER_VERSION,
    requiredRendererScriptHash: RENDERER_SCRIPT_HASH,
    expected: payload.modelSummary || {}
  };
  return [
    `const CONFIG = ${JSON.stringify(config)};`,
    String.raw`
function issue(code,msg){return{code,message:msg,severity:"error"}}
function walk(n,f){f(n);if("children"in n)n.children.forEach(c=>walk(c,f))}
function bb(n){return n.absoluteBoundingBox||null}
function overlap(a,b){const x=Math.max(0,Math.min(a.x+a.width,b.x+b.width)-Math.max(a.x,b.x)),y=Math.max(0,Math.min(a.y+a.height,b.y+b.height)-Math.max(a.y,b.y));return x*y}
function visible(n){let c=n;while(c){if("visible"in c&&c.visible===false)return false;c=c.parent}return true}
function text(n){return n.type==="TEXT"?String(n.characters||""):""}
function allText(root){let out="";walk(root,n=>{if(visible(n)&&n.type==="TEXT")out+="\n"+text(n)});return out}
function hasNumbered(s){return /\n?\s*\d+[.、]/.test(String(s||""))}
function nodeCount(root){let c=0,t=0;walk(root,n=>{if(n!==root&&visible(n)){c++;if(n.type==="TEXT")t++}});return{all:c,text:t}}
async function main(){const board=await figma.getNodeByIdAsync(CONFIG.targetBoardId);if(!board)throw new Error("validator target board not found");const issues=[];const rec=JSON.parse(board.getSharedPluginData(CONFIG.namespace,"renderRecord")||"{}");if(rec.rendererVersion!==CONFIG.requiredRendererVersion)issues.push(issue("RENDERER_VERSION_MISMATCH","renderer version mismatch"));if(rec.scriptHash!==CONFIG.requiredRendererScriptHash)issues.push(issue("RENDERER_HASH_MISMATCH","renderer script hash mismatch"));if(!/official-template-scaffold/.test(rec.renderMode||""))issues.push(issue("RENDER_MODE_MISMATCH","renderer must use official template scaffold mode"));if(rec.semanticReviewRequired!==true)issues.push(issue("SEMANTIC_REVIEW_NOT_REQUIRED","renderRecord must require LLM semantic review"));if(!board.getSharedPluginData(CONFIG.namespace,"manifest"))issues.push(issue("MANIFEST_MISSING","manifest shared data missing"));let ai=0,forbidden=0,residue=0,numbered=0;const wireSlots=[],noteSlots=[],flowSlots=[],big=[];walk(board,n=>{if(!visible(n))return;const name=String(n.name||"");if(name.startsWith("llm wireframe slot "))wireSlots.push(n);if(name.startsWith("llm note slot "))noteSlots.push(n);if(name.startsWith("llm flow diagram slot "))flowSlots.push(n);if(n.type==="TEXT"&&/AI待确认/.test(text(n)))ai++;if(n.type==="TEXT"&&hasNumbered(text(n)))numbered++;if(["generated missing text slot","flow screen generated title"].includes(name))forbidden++;if(n.type==="TEXT"&&/^(原型|副标题|界面名称|备注内容（非必须）)$|^注释内容|^动效描述/.test(text(n).trim()))residue++;if((name.startsWith("llm note slot ")||name.startsWith("note body"))&&bb(n))big.push(n)});if((CONFIG.expected.interfaceCount||0)>0&&wireSlots.length<(CONFIG.expected.interfaceCount||0))issues.push(issue("WIREFRAME_SLOT_MISSING","not every interface has a 4.0 wireframe slot"));if((CONFIG.expected.interfaceCount||0)>0&&noteSlots.length<(CONFIG.expected.interfaceCount||0))issues.push(issue("NOTE_SLOT_MISSING","not every interface has a right-side note slot"));for(const slot of wireSlots){const counts=nodeCount(slot),content=allText(slot);if(counts.all<8)issues.push(issue("WIREFRAME_CONTENT_MISSING","LLM must draw a player-visible low-fidelity interface inside each wireframe slot"));if(counts.text>0&&counts.text>=counts.all-2)issues.push(issue("WIREFRAME_TEXT_ONLY","Wireframe slot looks text-only; draw visible UI structure, controls, and states"));if(/规则|机制|后台|说明[:：]/.test(content)&&counts.all<16)issues.push(issue("WIREFRAME_LOOKS_LIKE_RULE_CARD","Player screen slot looks like a rule summary instead of an operable interface"))}for(const slot of noteSlots){const content=allText(slot);if(!/策划注意|程序注意|UI注意|UIFX注意|VFX注意|音效注意|美术注意|动画注意|更新|AI待确认/.test(content))issues.push(issue("NOTE_TAG_MISSING","Right-side notes must use template discipline tags"));if(!hasNumbered(content))issues.push(issue("NOTE_NUMBERING_MISSING","Right-side explanation must use numbered note text"));if(!/AI待确认/.test(content))issues.push(issue("AI_PENDING_MISSING_IN_NOTE_SLOT","Each major note area needs visible AI待确认 or an inherited module-level AI待确认"))}if((CONFIG.expected.flowNodeCount||0)>0&&flowSlots.length===0)issues.push(issue("FLOW_SLOT_MISSING","3.0 must contain LLM flow diagram slots"));if((CONFIG.expected.aiPendingCount||0)>0&&ai===0)issues.push(issue("AI_PENDING_MISSING","AI pending missing"));if(numbered===0)issues.push(issue("NOTES_NOT_RENDERED","no numbered right-side note text found"));if(forbidden)issues.push(issue("FORBIDDEN_FALLBACK_NODE_PRESENT","fallback nodes present"));if(residue)issues.push(issue("TEMPLATE_RESIDUE_VISIBLE","visible template placeholder text remains"));let max=0;walk(board,n=>{if(n!==board&&bb(n)&&visible(n))max=Math.max(max,bb(n).y-board.absoluteBoundingBox.y+bb(n).height)});if(max>board.height+2)issues.push(issue("BOARD_HEIGHT_TOO_SHORT","rendered content extends beyond board height"));for(let i=0;i<big.length;i++)for(let j=i+1;j<big.length;j++){const a=bb(big[i]),b=bb(big[j]);if(a&&b&&overlap(a,b)>200){issues.push(issue("NOTE_OVERLAP","right-side notes overlap"));i=big.length;break}}const checks=["official-record-scan","manifest-shared-data-scan","llm-wireframe-slot-scan","llm-note-slot-scan","ai-pending-scan","note-numbering-scan","template-residue-scan","board-height-scan","note-overlap-scan","forbidden-fallback-node-scan","semantic-review-required-scan"];const report={validatorVersion:CONFIG.validatorVersion,scriptHash:CONFIG.scriptHash,passed:issues.length===0,failCount:issues.length,warnCount:0,issues,checks,checkedAt:new Date().toISOString(),semanticReviewRequired:true,actual:{wireframeSlotCount:wireSlots.length,noteSlotCount:noteSlots.length,flowSlotCount:flowSlots.length,aiPendingTextCount:ai,numberedNoteTextCount:numbered,templateResidueCount:residue}};board.setSharedPluginData(CONFIG.namespace,"lastValidation",JSON.stringify(report));return report}
return await main();`
  ].join("\n");
}

function injectGateConfig(source, manifest, targetBoardId) {
  let output = source;
  output = replaceOnce(output, 'targetBoardId: "",', `targetBoardId: ${JSON.stringify(targetBoardId)},`);
  output = replaceOnce(output, 'requiredTemplateNodeId: "1184:1331"', `requiredTemplateNodeId: ${JSON.stringify(manifest.source_template.node_id)}`);
  return output;
}

function replaceOnce(source, needle, replacement) {
  if (!source.includes(needle)) throw new Error(`Cannot generate Figma script: missing config needle ${needle}`);
  return source.replace(needle, replacement);
}

function withGeneratedHeader(kind, content) {
  return [
    `// Direct payload batch: ${kind}.`,
    content
  ].join("\n");
}

function writeSizedUtf8Text(filePath, text) {
  assertNoDamagedText(text, filePath);
  assertFigmaScriptSize(filePath, text);
  fs.writeFileSync(filePath, text, "utf8");
}

function assertFigmaScriptSize(filePath, text) {
  if (text.length > MAX_FIGMA_SCRIPT_CHARS) {
    throw new Error(`${filePath} is ${text.length} characters, above the ${MAX_FIGMA_SCRIPT_CHARS} use_figma limit. Split this payload into smaller row/interface batches.`);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error && error.stack ? error.stack : String(error));
    process.exit(1);
  }
}

module.exports = {
  GENERATED_VERSION,
  MAX_FIGMA_SCRIPT_CHARS,
  RUNNER_VERSION,
  generateFigmaScripts
};
