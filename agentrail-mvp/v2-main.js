function renderConnectors(){
  qs("#connectorGrid").innerHTML = app.state.connectors.map(conn => {
    const runs = app.state.runs.filter(r => r.connector === conn.id);
    const last = runs.at(-1);
    return `
      <div class="connector-card">
        <div class="row between">
          <div>
            <div>${conn.name}</div>
            <div class="small muted">${conn.kind} · env ${conn.environments.join(", ")}</div>
          </div>
          ${fmtBadge(statusClass(conn.status), conn.status)}
        </div>
        <div class="small muted" style="margin-top:10px">Scopes: ${conn.scopes.join(", ")}</div>
        <div class="small muted" style="margin-top:8px">Dernier run: ${last ? `${last.action} @ ${last.timestamp}` : "aucun"}</div>
      </div>
    `;
  }).join("");
}
function renderAudit(){
  const filter = qs("#auditFilter").value?.toLowerCase() || "";
  const decision = qs("#auditDecision").value || "all";
  const cards = app.state.runs.slice().reverse().filter(run => {
    const blob = [run.summary, run.action, run.connector, run.actor, JSON.stringify(run.payload)].join(" ").toLowerCase();
    return (decision === "all" || run.decision === decision) && (!filter || blob.includes(filter));
  });
  qs("#auditCards").innerHTML = cards.map(run => `
    <div class="audit-card clickable" onclick="openRun('${run.id}')">
      <div class="row between">
        <div>
          <div>${run.summary}</div>
          <div class="small muted">${run.timestamp} · ${run.actor} · ${run.connector}.${run.action}</div>
        </div>
        ${fmtBadge(statusClass(run.status), run.status)}
      </div>
      <div class="kv" style="margin-top:12px">
        <div>Policy</div><div>${run.matchedPolicy}</div>
        <div>Reason</div><div>${run.policyReason}</div>
        <div>Payload</div><div><code>${escapeHtml(JSON.stringify(run.payload))}</code></div>
      </div>
    </div>
  `).join("") || `<div class="empty-line">Aucun événement d’audit pour ce filtre.</div>`;
}
function renderAll(){
  renderNav();
  renderOverview();
  renderMission();
  renderApprovals();
  renderPolicies();
  renderSimulation();
  renderConnectors();
  renderAudit();
  setPage(app.currentPage);
}
function playScenario(id){
  const s = app.state.scenarios.find(x => x.id === id);
  if(!s) return;
  createRunFromRequest({
    actor: s.agent, connector: s.connector, action: s.action, objectCount: s.objectCount,
    context: s.context, environment: s.environment, summary: s.summary, payload: s.payload
  });
}
function runDryRun(){
  const policy = {
    name: qs("#policyName").value || "Untitled",
    connector: qs("#policyConnector").value,
    action: qs("#policyAction").value || "*",
    conditionType: qs("#policyConditionType").value,
    conditionValue: qs("#policyConditionValue").value || "*",
    maxObjects: Number(qs("#policyMaxObjects").value || 1),
    decision: qs("#policyDecision").value,
    approverGroup: qs("#policyApproverGroup").value || "ops-managers",
    active: true,
    priority: Number(qs("#policyPriority").value || 80)
  };
  const impacted = app.state.runs.map(run => {
    const req = {
      actor: run.actor, connector: run.connector, action: run.action, objectCount: run.objectCount,
      context: run.context, environment: run.environment, summary: run.summary, payload: run.payload
    };
    const original = evaluateRequest(req);
    const policiesBackup = structuredClone(app.state.policies);
    app.state.policies.push({ ...policy, id: "dry-run" });
    const next = evaluateRequest(req);
    app.state.policies = policiesBackup;
    return { run, original, next };
  });
  const changed = impacted.filter(x => x.original.decision !== x.next.decision).length;
  const approvals = impacted.filter(x => x.next.decision === "require_approval").length;
  const denied = impacted.filter(x => x.next.decision === "deny").length;
  qs("#dryRunSummary").innerHTML = `
    <div class="check-row"><strong>${policy.name}</strong> testerait ${impacted.length} runs historiques.</div>
    <div class="check-row">${changed} runs changeraient de décision.</div>
    <div class="check-row">${approvals} passeraient en approval.</div>
    <div class="check-row">${denied} seraient niés.</div>
  `;
  toast("Dry run calculé.");
}
function openRun(runId){
  const run = app.state.runs.find(r => r.id === runId);
  if(!run) return;
  qs("#drawerTitle").textContent = run.summary;
  qs("#drawerContent").innerHTML = `
    <div class="row gap">${fmtBadge(statusClass(run.status), run.status)} ${fmtBadge(statusClass(run.decision), run.decision)}</div>
    <div class="kv">
      <div>Run ID</div><div>${run.id}</div>
      <div>Actor</div><div>${run.actor}</div>
      <div>Connector</div><div>${run.connector}.${run.action}</div>
      <div>Scope</div><div>${run.context} · ${run.environment} · ${run.objectCount} objet(s)</div>
      <div>Risk</div><div>${run.risk}/100</div>
      <div>Matched policy</div><div>${run.matchedPolicy}</div>
      <div>Policy reason</div><div>${run.policyReason}</div>
      <div>Approver</div><div>${run.approver ? approverBy(run.approver)?.name || run.approver : "none"}</div>
      <div>Payload</div><div><pre>${escapeHtml(JSON.stringify(run.payload, null, 2))}</pre></div>
    </div>
  `;
  qs("#drawer").classList.remove("hidden");
}
function closeDrawer(){ qs("#drawer").classList.add("hidden"); }
function toast(msg){
  const el = qs("#toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => el.classList.add("hidden"), 2400);
}
function escapeHtml(str){
  return str.replace(/[&<>"']/g, m => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[m]));
}

function bindEvents(){
  qs("#runnerConnector").addEventListener("change", syncRunnerActions);
  qs("#runnerAction").addEventListener("change", fillPayloadPreset);
  qs("#fillScenarioBtn").addEventListener("click", () => {
    qs("#runnerConnector").value = "hubspot";
    syncRunnerActions();
    qs("#runnerAction").value = "update_deal";
    qs("#runnerCount").value = 12;
    qs("#runnerContext").value = "pipeline";
    qs("#runnerSummary").value = "High-risk bulk restage after revenue review";
    fillPayloadPreset(true);
  });
  qs("#runnerForm").addEventListener("submit", (e) => {
    e.preventDefault();
    let payload = {};
    try{ payload = JSON.parse(qs("#runnerPayload").value || "{}"); }catch(err){
      toast("Payload JSON invalide."); return;
    }
    const run = createRunFromRequest({
      actor: qs("#runnerAgent").value,
      connector: qs("#runnerConnector").value,
      action: qs("#runnerAction").value,
      objectCount: Number(qs("#runnerCount").value || 1),
      environment: qs("#runnerEnv").value,
      context: qs("#runnerContext").value,
      summary: qs("#runnerSummary").value || "Manual simulation",
      payload
    });
    qs("#runnerDecisionBadge").className = `badge ${statusClass(run.decision)}`;
    qs("#runnerDecisionBadge").textContent = run.decision;
    qs("#runnerResult").className = "result-card";
    qs("#runnerResult").innerHTML = `
      <div class="row gap">${fmtBadge(statusClass(run.decision), run.decision)} ${fmtBadge(statusClass(run.status), run.status)}</div>
      <div class="kv">
        <div>Matched policy</div><div>${run.matchedPolicy}</div>
        <div>Reason</div><div>${run.policyReason}</div>
        <div>Risk</div><div>${run.risk}/100</div>
        <div>Approver</div><div>${run.approver ? approverBy(run.approver)?.name || run.approver : "none"}</div>
      </div>
    `;
  });
  qs("#policyStudio").addEventListener("submit", (e) => {
    e.preventDefault();
    app.state.policies.push({
      id: randId("p"),
      name: qs("#policyName").value,
      connector: qs("#policyConnector").value,
      action: qs("#policyAction").value,
      conditionType: qs("#policyConditionType").value,
      conditionValue: qs("#policyConditionValue").value,
      maxObjects: Number(qs("#policyMaxObjects").value || 1),
      decision: qs("#policyDecision").value,
      priority: Number(qs("#policyPriority").value || 80),
      approverGroup: qs("#policyApproverGroup").value || "ops-managers",
      note: "Custom policy created in studio.",
      active: true
    });
    persist();
    renderAll();
    toast("Policy ajoutée.");
    e.target.reset();
    qs("#policyConditionValue").value = "*";
    qs("#policyMaxObjects").value = "5";
    qs("#policyPriority").value = "80";
  });
  qs("#dryRunBtn").addEventListener("click", runDryRun);
  qs("#seedScenariosBtn").addEventListener("click", seedRuns);
  qs("#exportBtn").addEventListener("click", exportState);
  qs("#resetBtn").addEventListener("click", resetState);
  qs("#runScenarioBtn").addEventListener("click", () => setPage("mission"));
  qs("#missionFilter").addEventListener("input", renderMission);
  qs("#missionStatus").addEventListener("change", renderMission);
  qs("#auditFilter").addEventListener("input", renderAudit);
  qs("#auditDecision").addEventListener("change", renderAudit);
  qsa("[data-close-drawer]").forEach(el => el.addEventListener("click", closeDrawer));
  qs("#globalSearch").addEventListener("input", e => {
    const value = e.target.value.toLowerCase().trim();
    if(!value) return;
    const target = app.state.runs.slice().reverse().find(run =>
      [run.summary, run.actor, run.connector, run.action, run.context].join(" ").toLowerCase().includes(value)
    );
    if(target){
      setPage("audit");
      qs("#auditFilter").value = value;
      renderAudit();
    }
  });
  document.addEventListener("keydown", (e) => {
    if((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"){
      e.preventDefault();
      qs("#globalSearch").focus();
    }
    if(e.key === "Escape") closeDrawer();
  });
}
window.openRun = openRun;
window.approveRun = approveRun;
window.togglePolicy = togglePolicy;
window.playScenario = playScenario;

renderAll();
bindEvents();
fillPayloadPreset();
