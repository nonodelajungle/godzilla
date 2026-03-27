function renderNav(){
  qs("#nav").innerHTML = app.state.nav.map(item => {
    const kpi = item.id === "approvals"
      ? app.state.runs.filter(r => r.status === "pending_approval").length
      : item.id === "audit"
      ? app.state.runs.length
      : "";
    return `
      <button class="${app.currentPage === item.id ? "active" : ""}" data-nav="${item.id}">
        <span>${item.icon}</span>
        <span>${item.label}</span>
        ${kpi !== "" ? `<span class="nav-kpi">${kpi}</span>` : ""}
      </button>
    `;
  }).join("");
  qsa("[data-nav]").forEach(btn => btn.onclick = () => setPage(btn.dataset.nav));
}
function setPage(page){
  app.currentPage = page;
  qsa(".page").forEach(p => p.classList.toggle("active", p.dataset.page === page));
  renderNav();
}
function renderOverview(){
  const runs = app.state.runs;
  const pending = runs.filter(r => r.status === "pending_approval");
  const blocked = runs.filter(r => r.status === "blocked");
  const executed = runs.filter(r => r.status === "executed");
  const avgRisk = Math.round(runs.reduce((s,r) => s + r.risk, 0) / Math.max(1, runs.length));
  const score = Math.max(40, 100 - blocked.length * 8 - pending.length * 3 + executed.length);
  qs("#healthValue").textContent = score;
  qs("#heroStats").innerHTML = [
    { label: "Runs total", value: runs.length },
    { label: "Executés", value: executed.length },
    { label: "Pending approvals", value: pending.length },
    { label: "Risk moyen", value: `${avgRisk}` }
  ].map(stat => `<div class="stat"><div class="eyebrow">${stat.label}</div><div class="value">${stat.value}</div></div>`).join("");

  const byConnector = countBy(runs, "connector");
  qs("#connectorRiskBars").innerHTML = app.state.connectors.map(conn => {
    const connRuns = runs.filter(r => r.connector === conn.id);
    const localRisk = connRuns.length ? Math.round(connRuns.reduce((s,r) => s+r.risk, 0) / connRuns.length) : 0;
    return `
      <div class="metric-row">
        <div>
          <div>${conn.name}</div>
          <div class="small muted">${byConnector[conn.id] || 0} runs</div>
        </div>
        <div class="pill">${localRisk}/100</div>
      </div>
      <div class="progress"><span style="width:${Math.max(6,localRisk)}%"></span></div>
    `;
  }).join("");

  qs("#approverStats").innerHTML = app.state.approvers.map(person => {
    const load = runs.filter(r => r.approver === person.id && r.status === "pending_approval").length;
    return `
      <div class="metric-row">
        <div>
          <div>${person.name}</div>
          <div class="small muted">${person.team}</div>
        </div>
        <div class="pill">${load} pending</div>
      </div>
    `;
  }).join("");

  qs("#timelineMeta").textContent = `${runs.length} événements`;
  qs("#timeline").innerHTML = runs.slice().reverse().slice(0,8).map(run => `
    <div class="timeline-item clickable" onclick="openRun('${run.id}')">
      <div class="row between">
        <div>
          <div>${run.summary}</div>
          <div class="small muted">${run.timestamp} · ${run.actor} · ${run.connector}.${run.action}</div>
        </div>
        ${fmtBadge(statusClass(run.status), run.status.replaceAll("_"," "))}
      </div>
      <div class="small muted" style="margin-top:8px">Policy: ${run.matchedPolicy} · Risk ${run.risk}/100 · ${run.objectCount} objet(s)</div>
    </div>
  `).join("");

  qs("#incidentList").innerHTML = app.state.incidents.map(incident => `
    <div class="incident">
      <div class="row between">
        <div>
          <div>${incident.title}</div>
          <div class="small muted">${incident.owner}</div>
        </div>
        ${fmtBadge(incident.severity === "high" ? "red" : incident.severity === "medium" ? "amber" : "blue", incident.severity)}
      </div>
      <div class="small muted" style="margin-top:10px">${incident.detail}</div>
    </div>
  `).join("");
}
function renderMission(){
  const connectors = app.state.connectors.filter(c => c.kind === "write");
  qs("#runnerAgent").innerHTML = app.state.agents.map(a => `<option value="${a.id}">${a.name}</option>`).join("");
  qs("#runnerConnector").innerHTML = connectors.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
  qs("#policyConnector").innerHTML = [`<option value="*">*</option>`].concat(app.state.connectors.map(c => `<option value="${c.id}">${c.name}</option>`)).join("");
  syncRunnerActions();

  const filter = qs("#missionFilter").value?.toLowerCase() || "";
  const status = qs("#missionStatus").value || "all";
  const rows = app.state.runs.slice().reverse().filter(run => {
    const okStatus = status === "all" || run.status === status;
    const blob = [run.summary, run.actor, run.action, run.connector, run.context].join(" ").toLowerCase();
    return okStatus && (!filter || blob.includes(filter));
  });
  qs("#missionTable").innerHTML = rows.map(run => `
    <tr class="clickable" onclick="openRun('${run.id}')">
      <td>${run.timestamp}</td>
      <td>${run.actor}</td>
      <td>${run.connector}.${run.action}</td>
      <td>${run.objectCount}</td>
      <td>${run.risk}</td>
      <td>${fmtBadge(statusClass(run.decision), run.decision)}</td>
      <td>${fmtBadge(statusClass(run.status), run.status)}</td>
    </tr>
  `).join("") || `<tr><td colspan="7" class="muted">Aucun run.</td></tr>`;

  qs("#runbook").innerHTML = [
    "1. L’agent produit une intention d’action.",
    "2. AgentRail calcule un score de risque contextuel.",
    "3. La meilleure policy active est sélectionnée par priorité.",
    "4. La requête passe en allow / approval / deny.",
    "5. Toute décision devient un événement d’audit rejouable."
  ].map(line => `<div class="check-row">${line}</div>`).join("");
}
function syncRunnerActions(){
  const connector = qs("#runnerConnector").value || "hubspot";
  const conn = connectorBy(connector);
  qs("#runnerAction").innerHTML = (conn?.scopes || []).map(scope => `<option value="${scope}">${scope}</option>`).join("");
  fillPayloadPreset();
}
function fillPayloadPreset(risky=false){
  const connector = qs("#runnerConnector").value;
  const action = qs("#runnerAction").value;
  let payload = {};
  if(connector === "hubspot" && action === "update_deal"){
    payload = risky
      ? { dealIds: [301,302,303,304,305,306,307,308,309,310,311,312], stage: "Closed Lost", owner: "AE-France" }
      : { dealIds: [301,302], stage: "Negotiation", owner: "AE-France" };
  } else if(connector === "hubspot" && action === "delete_contact"){
    payload = { contactId: 9001 };
  } else if(connector === "jira" && action === "create_issue"){
    payload = { project: "SUP", priority: "P2", title: "Customer blocked during checkout" };
  } else {
    payload = { issueIds: ["OPS-1","OPS-2"], status: "Ready for Review" };
  }
  qs("#runnerPayload").value = JSON.stringify(payload, null, 2);
}
function renderApprovals(){
  const pending = app.state.runs.filter(r => r.status === "pending_approval").slice().reverse();
  qs("#approvalList").innerHTML = pending.length ? pending.map(run => `
    <div class="approval-item">
      <div class="row between">
        <div>
          <div>${run.connector}.${run.action}</div>
          <div class="small muted">${run.summary}</div>
        </div>
        ${fmtBadge("amber", `risk ${run.risk}`)}
      </div>
      <div class="small muted" style="margin-top:10px">
        Approver: ${approverBy(run.approver)?.name || "n/a"} · Requested ${run.approvalRequestedAt || run.timestamp}
      </div>
      <div class="row gap" style="margin-top:12px">
        <button class="btn primary" onclick="approveRun('${run.id}', true)">Approuver</button>
        <button class="btn ghost" onclick="approveRun('${run.id}', false)">Refuser</button>
        <button class="btn ghost" onclick="openRun('${run.id}')">Inspecter</button>
      </div>
    </div>
  `).join("") : `<div class="empty-line">Aucune demande d’approbation en attente.</div>`;

  const load = app.state.approvers.map(person => {
    const pendingCount = app.state.runs.filter(r => r.approver === person.id && r.status === "pending_approval").length;
    return `
      <div class="check-row">
        <div class="row between">
          <div>${person.name}</div>
          <div class="pill">${pendingCount} pending · SLA ${person.maxSlaMin} min</div>
        </div>
      </div>
    `;
  }).join("");
  qs("#reviewerLoad").innerHTML = load;
  qs("#approvalInsights").innerHTML = [
    "Les runs en contexte security sont forcés en validation humaine.",
    "Les bulk updates HubSpot passent en queue au-delà de 5 objets.",
    "Les actions delete restent niées globalement en v1."
  ].map(x => `<div class="check-row">${x}</div>`).join("");
}
function renderPolicies(){
  qs("#policyCount").textContent = `${app.state.policies.length} policies`;
  qs("#policyCards").innerHTML = app.state.policies.slice().sort((a,b) => b.priority - a.priority).map(policy => `
    <div class="policy-card">
      <div class="row between">
        <div>
          <div>${policy.name}</div>
          <div class="small muted">${policy.connector}.${policy.action} · priority ${policy.priority}</div>
        </div>
        ${fmtBadge(policy.active ? statusClass(policy.decision) : "blue", policy.active ? policy.decision : "inactive")}
      </div>
      <div class="small muted" style="margin-top:10px">
        Condition: ${policy.conditionType === "any" ? "any" : `${policy.conditionType}=${policy.conditionValue}`} · max ${policy.maxObjects} objets · approver ${policy.approverGroup}
      </div>
      <div class="small muted" style="margin-top:8px">${policy.note || ""}</div>
      <div class="row gap" style="margin-top:12px">
        <button class="btn ghost" onclick="togglePolicy('${policy.id}')">${policy.active ? "Désactiver" : "Activer"}</button>
      </div>
    </div>
  `).join("");
}
function renderSimulation(){
  qs("#scenarioGrid").innerHTML = app.state.scenarios.map(s => `
    <div class="scenario-card">
      <div class="row between">
        <div>
          <div>${s.name}</div>
          <div class="small muted">${s.connector}.${s.action} · ${s.objectCount} objet(s)</div>
        </div>
        <button class="btn ghost" onclick="playScenario('${s.id}')">Jouer</button>
      </div>
      <div class="small muted" style="margin-top:10px">${s.summary}</div>
    </div>
  `).join("");

  const base = app.state.scenarios.slice(0,3).map(s => {
    const original = evaluateRequest({
      actor: s.agent, connector: s.connector, action: s.action, objectCount: s.objectCount,
      context: s.context, environment: s.environment, summary: s.summary, payload: s.payload
    });
    return `<div class="check-row"><strong>${s.name}</strong><br><span class="small muted">Current decision: ${original.decision} · risk ${original.risk} · policy ${original.matchedPolicy}</span></div>`;
  }).join("");
  qs("#sandboxCompare").innerHTML = base;
}
