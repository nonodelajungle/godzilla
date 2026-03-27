const STORAGE_KEY = "agentrail-v2-state";

const defaultState = {
  workspace: { name: "Acme Revenue Ops", stage: "pilot", region: "eu-west-1" },
  agents: [
    { id: "support-bot", name: "Support Bot", owner: "Support Ops", riskBias: 4 },
    { id: "revops-bot", name: "RevOps Bot", owner: "Revenue Ops", riskBias: 9 },
    { id: "ops-assistant", name: "Ops Assistant", owner: "IT Ops", riskBias: 14 },
    { id: "billing-guardian", name: "Billing Guardian", owner: "Finance Ops", riskBias: 11 }
  ],
  approvers: [
    { id: "marie", name: "Marie", team: "Ops Managers", maxSlaMin: 12 },
    { id: "nicolas", name: "Nicolas", team: "Security", maxSlaMin: 5 },
    { id: "ines", name: "Inès", team: "RevOps", maxSlaMin: 18 }
  ],
  connectors: [
    { id: "jira", name: "Jira", kind: "write", status: "healthy", scopes: ["create_issue", "update_issue"], environments: ["sandbox","prod"] },
    { id: "hubspot", name: "HubSpot", kind: "write", status: "healthy", scopes: ["update_deal", "create_contact", "delete_contact"], environments: ["sandbox","prod"] },
    { id: "slack", name: "Slack", kind: "read", status: "healthy", scopes: ["read_messages", "post_approvals"], environments: ["prod"] },
    { id: "drive", name: "Google Drive", kind: "read", status: "warning", scopes: ["read_docs"], environments: ["prod"] }
  ],
  policies: [
    {
      id: "p1", name: "Jira Support auto-create", connector: "jira", action: "create_issue",
      conditionType: "context", conditionValue: "SUP", maxObjects: 2, decision: "allow",
      priority: 120, active: true, approverGroup: "ops-managers", note: "Support tickets low risk"
    },
    {
      id: "p2", name: "HubSpot bulk updates need approval", connector: "hubspot", action: "update_deal",
      conditionType: "any", conditionValue: "*", maxObjects: 5, decision: "require_approval",
      priority: 100, active: true, approverGroup: "revops", note: "Mass edits must be checked"
    },
    {
      id: "p3", name: "Block deletes everywhere", connector: "*", action: "delete_*",
      conditionType: "any", conditionValue: "*", maxObjects: 999, decision: "deny",
      priority: 999, active: true, approverGroup: "security", note: "Global destructive action block"
    },
    {
      id: "p4", name: "Security contexts require human review", connector: "*", action: "*",
      conditionType: "context", conditionValue: "security", maxObjects: 999, decision: "require_approval",
      priority: 130, active: true, approverGroup: "security", note: "Security workflows are always reviewed"
    },
    {
      id: "p5", name: "Prod env over 15 objects denied", connector: "*", action: "update_*",
      conditionType: "environment", conditionValue: "prod", maxObjects: 15, decision: "deny",
      priority: 110, active: true, approverGroup: "ops-managers", note: "Large prod updates are stopped"
    }
  ],
  scenarios: [
    {
      id: "s1", name: "Bulk deal re-stage", connector: "hubspot", action: "update_deal", environment: "prod", context: "pipeline",
      objectCount: 12, agent: "revops-bot", summary: "Move 12 deals to Negotiation after pipeline review",
      payload: { dealIds: [111,112,114,116,119,120,125,128,131,135,144,152], stage: "Negotiation" }
    },
    {
      id: "s2", name: "Delete stale contact", connector: "hubspot", action: "delete_contact", environment: "prod", context: "crm",
      objectCount: 1, agent: "ops-assistant", summary: "Delete stale duplicated contact",
      payload: { contactId: 8871 }
    },
    {
      id: "s3", name: "Create support issue", connector: "jira", action: "create_issue", environment: "prod", context: "SUP",
      objectCount: 1, agent: "support-bot", summary: "Escalate payment problem from VIP customer",
      payload: { project: "SUP", priority: "P2", title: "Refund blocked after duplicate payment" }
    },
    {
      id: "s4", name: "Security patch run", connector: "jira", action: "update_issue", environment: "prod", context: "security",
      objectCount: 3, agent: "ops-assistant", summary: "Patch validation workflow update",
      payload: { issueIds: ["SEC-41","SEC-44","SEC-50"], status: "Ready for Review" }
    }
  ],
  runs: [
    {
      id: "run-001", timestamp: "2026-03-27 09:14", actor: "support-bot", connector: "jira", action: "create_issue",
      objectCount: 1, context: "SUP", environment: "prod", risk: 21, decision: "allow", status: "executed",
      summary: "Create Jira issue in SUP from customer escalation", matchedPolicy: "Jira Support auto-create",
      policyReason: "Support create_issue in SUP is low risk.", payload: { project: "SUP", priority: "P2", title: "Refund issue on order #8484" }, approver: null
    },
    {
      id: "run-002", timestamp: "2026-03-27 09:32", actor: "revops-bot", connector: "hubspot", action: "update_deal",
      objectCount: 8, context: "pipeline", environment: "prod", risk: 76, decision: "require_approval", status: "pending_approval",
      summary: "Move 8 deals to Negotiation", matchedPolicy: "HubSpot bulk updates need approval",
      policyReason: "Bulk update_deal over safe threshold.", payload: { dealIds: [102,104,111,116,118,120,128,132], stage: "Negotiation" }, approver: "ines", approvalRequestedAt: "2026-03-27 09:33"
    },
    {
      id: "run-003", timestamp: "2026-03-27 10:01", actor: "ops-assistant", connector: "hubspot", action: "delete_contact",
      objectCount: 1, context: "crm", environment: "prod", risk: 97, decision: "deny", status: "blocked",
      summary: "Delete contact requested by workflow", matchedPolicy: "Block deletes everywhere",
      policyReason: "Destructive actions globally denied.", payload: { contactId: 8871 }, approver: null
    },
    {
      id: "run-004", timestamp: "2026-03-27 10:17", actor: "billing-guardian", connector: "jira", action: "update_issue",
      objectCount: 2, context: "billing", environment: "prod", risk: 38, decision: "allow", status: "executed",
      summary: "Tag refund anomalies for finance review", matchedPolicy: "Default safe update", policyReason: "Low volume non-destructive change.",
      payload: { issueIds: ["BILL-17", "BILL-21"], label: "refund-risk" }, approver: null
    },
    {
      id: "run-005", timestamp: "2026-03-27 10:42", actor: "ops-assistant", connector: "jira", action: "update_issue",
      objectCount: 3, context: "security", environment: "prod", risk: 82, decision: "require_approval", status: "pending_approval",
      summary: "Move security remediation issues", matchedPolicy: "Security contexts require human review",
      policyReason: "Security workflows always reviewed.", payload: { issueIds: ["SEC-41","SEC-44","SEC-50"], status: "Ready for Review" }, approver: "nicolas", approvalRequestedAt: "2026-03-27 10:43"
    }
  ],
  incidents: [
    { id: "i1", severity: "medium", title: "2 approvals en attente > 10 min", detail: "Les approbations Security et RevOps dépassent la fenêtre SLA.", owner: "Ops" },
    { id: "i2", severity: "low", title: "Drive connector en warning", detail: "Le scope de lecture docs est valide mais la latence simulée augmente.", owner: "IT" }
  ],
  nav: [
    { id: "overview", label: "Overview", icon: "◉" },
    { id: "mission", label: "Mission Control", icon: "▶" },
    { id: "approvals", label: "Approvals", icon: "✓" },
    { id: "policies", label: "Policy Studio", icon: "◇" },
    { id: "simulation", label: "Simulation Lab", icon: "≈" },
    { id: "connectors", label: "Connectors", icon: "⎇" },
    { id: "audit", label: "Audit Explorer", icon: "☰" }
  ]
};

const app = {
  state: loadState(),
  currentPage: "overview",
  searchTerm: ""
};

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  return structuredClone(defaultState);
}
function persist(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(app.state)); }
function qs(sel){ return document.querySelector(sel); }
function qsa(sel){ return [...document.querySelectorAll(sel)]; }
function fmtBadge(cls, text){ return `<span class="badge ${cls}">${text}</span>`; }
function statusClass(v){
  if(v === "allow" || v === "executed" || v === "healthy") return "green";
  if(v === "require_approval" || v === "pending_approval" || v === "warning") return "amber";
  if(v === "deny" || v === "blocked" || v === "error") return "red";
  return "blue";
}
function countBy(arr, key){
  return arr.reduce((acc, item) => {
    const val = typeof key === "function" ? key(item) : item[key];
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
}
function nowStamp(){
  const d = new Date();
  const p = n => String(n).padStart(2,"0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
function randId(prefix="id"){ return `${prefix}-${Math.floor(Math.random()*100000)}`; }
function connectorBy(id){ return app.state.connectors.find(c => c.id === id); }
function agentBy(id){ return app.state.agents.find(a => a.id === id); }
function approverBy(id){ return app.state.approvers.find(a => a.id === id); }

function calculateRisk(req){
  let score = 12;
  if(req.environment === "prod") score += 18;
  if(req.connector === "hubspot") score += 14;
  if(req.connector === "jira") score += 8;
  if(req.action.includes("update")) score += 10;
  if(req.action.includes("create")) score += 6;
  if(req.action.includes("delete")) score += 52;
  if(req.objectCount > 1) score += Math.min(30, req.objectCount * 3);
  if(req.context === "security") score += 24;
  if(req.context === "billing") score += 12;
  if(req.context === "pipeline") score += 8;
  const agent = agentBy(req.actor);
  if(agent) score += agent.riskBias;
  return Math.min(100, score);
}
function actionMatch(pattern, action){
  return pattern === "*" || (pattern.endsWith("*") ? action.startsWith(pattern.slice(0,-1)) : pattern === action);
}
function conditionMatch(policy, req){
  if(policy.conditionType === "any") return true;
  if(policy.conditionType === "context") return policy.conditionValue === req.context;
  if(policy.conditionType === "environment") return policy.conditionValue === req.environment;
  return true;
}
function pickApprover(group){
  if(group === "security") return "nicolas";
  if(group === "revops") return "ines";
  return "marie";
}
function evaluateRequest(req){
  const risk = calculateRisk(req);
  const activePolicies = app.state.policies.filter(p => p.active).sort((a,b) => b.priority - a.priority);
  const matched = activePolicies.find(policy => {
    const connectorOk = policy.connector === "*" || policy.connector === req.connector;
    const actionOk = actionMatch(policy.action, req.action);
    const conditionOk = conditionMatch(policy, req);
    return connectorOk && actionOk && conditionOk;
  });
  if(!matched){
    return {
      risk,
      decision: "deny",
      status: "blocked",
      matchedPolicy: "Default deny",
      reason: "No active policy matched this request.",
      approver: null
    };
  }

  if(req.objectCount > matched.maxObjects){
    if(matched.decision === "allow"){
      return {
        risk: Math.max(risk, 72),
        decision: "require_approval",
        status: "pending_approval",
        matchedPolicy: matched.name,
        reason: `Threshold exceeded: ${req.objectCount} objects > safe cap ${matched.maxObjects}.`,
        approver: pickApprover(matched.approverGroup)
      };
    }
    if(matched.decision === "deny"){
      return {
        risk: Math.max(risk, 78),
        decision: "deny",
        status: "blocked",
        matchedPolicy: matched.name,
        reason: `Denied because object count exceeds limit ${matched.maxObjects}.`,
        approver: null
      };
    }
  }

  if(matched.decision === "require_approval"){
    return {
      risk,
      decision: "require_approval",
      status: "pending_approval",
      matchedPolicy: matched.name,
      reason: matched.note || "Human validation required.",
      approver: pickApprover(matched.approverGroup)
    };
  }
  if(matched.decision === "deny"){
    return {
      risk,
      decision: "deny",
      status: "blocked",
      matchedPolicy: matched.name,
      reason: matched.note || "Action denied by policy.",
      approver: null
    };
  }
  return {
    risk,
    decision: "allow",
    status: "executed",
    matchedPolicy: matched.name,
    reason: matched.note || "Request allowed by policy.",
    approver: null
  };
}

function createRunFromRequest(req){
  const result = evaluateRequest(req);
  const run = {
    id: randId("run"),
    timestamp: nowStamp(),
    actor: req.actor,
    connector: req.connector,
    action: req.action,
    objectCount: req.objectCount,
    context: req.context,
    environment: req.environment,
    risk: result.risk,
    decision: result.decision,
    status: result.status,
    summary: req.summary,
    matchedPolicy: result.matchedPolicy,
    policyReason: result.reason,
    payload: req.payload,
    approver: result.approver,
    approvalRequestedAt: result.approver ? nowStamp() : null
  };
  app.state.runs.push(run);
  maybeIncidentize(run);
  persist();
  renderAll();
  openRun(run.id);
  toast(`Run ${run.id} évalué : ${run.decision}`);
  return run;
}
function maybeIncidentize(run){
  if(run.status === "blocked" && run.risk >= 90){
    app.state.incidents.unshift({
      id: randId("incident"),
      severity: "high",
      title: `Blocage critique ${run.connector}.${run.action}`,
      detail: `Run ${run.id} bloqué à risque ${run.risk}/100 sur ${run.environment}.`,
      owner: "Security"
    });
  }
}
function seedRuns(){
  const scenarioIds = ["s1","s2","s3","s4"];
  for(let i=0;i<5;i++){
    const s = app.state.scenarios[i % scenarioIds.length];
    createRunFromRequest({
      actor: s.agent, connector: s.connector, action: s.action, objectCount: s.objectCount,
      context: s.context, environment: s.environment, summary: `${s.summary} · burst ${i+1}`, payload: s.payload
    });
  }
}
function resetState(){
  app.state = structuredClone(defaultState);
  persist();
  renderAll();
  toast("Workspace réinitialisé.");
}
function exportState(){
  const blob = new Blob([JSON.stringify(app.state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "agentrail-state.json";
  a.click();
  URL.revokeObjectURL(url);
}
function approveRun(runId, allow){
  const run = app.state.runs.find(r => r.id === runId);
  if(!run) return;
  run.status = allow ? "executed" : "blocked";
  run.decision = allow ? "allow" : "deny";
  run.policyReason = allow ? `${run.policyReason} Approved by ${approverBy(run.approver)?.name || "reviewer"}.` : `${run.policyReason} Rejected by ${approverBy(run.approver)?.name || "reviewer"}.`;
  persist();
  renderAll();
  toast(allow ? "Action approuvée." : "Action refusée.");
}
function togglePolicy(policyId){
  const p = app.state.policies.find(x => x.id === policyId);
  if(!p) return;
  p.active = !p.active;
  persist();
  renderAll();
  toast(`Policy ${p.active ? "activée" : "désactivée"}.`);
}
