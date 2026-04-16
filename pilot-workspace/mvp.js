const state = {
  shadowMode: true,
  scanned: false,
  runtimes: [
    { name: "Dust", type: "managed runtime" },
    { name: "Glean", type: "managed runtime" },
    { name: "Internal workflow bot", type: "internal runtime" },
    { name: "MCP action runner", type: "tool runtime" }
  ],
  systems: ["Salesforce", "HubSpot", "Okta", "GitHub", "Slack"],
  agents: [
    {
      id: "dust-agent",
      name: "Revenue Answers Agent",
      runtime: "Dust",
      identity: "dust-prod-service",
      environments: ["production"],
      systems: ["Salesforce", "Slack"],
      provider: "Anthropic",
      model: "Claude 3.7 Sonnet",
      orchestration: "Dust workspace",
      knowledge: "Sales playbooks + CRM summaries",
      risk: "medium"
    },
    {
      id: "glean-agent",
      name: "Knowledge Search Agent",
      runtime: "Glean",
      identity: "glean-shared-service",
      environments: ["production"],
      systems: ["Slack", "HubSpot"],
      provider: "Multi-model",
      model: "Workspace configured",
      orchestration: "Glean assistant",
      knowledge: "Enterprise search index",
      risk: "medium"
    },
    {
      id: "revops-bot",
      name: "RevOps Bot",
      runtime: "Internal workflow bot",
      identity: "revops-prod-service",
      environments: ["production", "sandbox"],
      systems: ["HubSpot", "Salesforce", "Slack"],
      provider: "OpenAI",
      model: "GPT-4.1",
      orchestration: "Temporal",
      knowledge: "CRM records + revenue rules",
      risk: "high"
    },
    {
      id: "it-bot",
      name: "Identity Admin Bot",
      runtime: "Internal workflow bot",
      identity: "it-admin-service",
      environments: ["production"],
      systems: ["Okta", "Slack"],
      provider: "OpenAI",
      model: "GPT-4.1",
      orchestration: "Service orchestration",
      knowledge: "Offboarding workflows + identity policy",
      risk: "critical"
    },
    {
      id: "mcp-bot",
      name: "Engineering MCP Agent",
      runtime: "MCP action runner",
      identity: "github-shared-token",
      environments: ["sandbox", "production"],
      systems: ["GitHub", "Slack"],
      provider: "Anthropic",
      model: "Claude 3.7 Sonnet",
      orchestration: "MCP server",
      knowledge: "Repo context + CI metadata",
      risk: "high"
    }
  ],
  findings: [],
  controls: [],
  policies: [
    { name: "Okta production actions require approval", decision: "review", reason: "Identity actions in production need human confirmation." },
    { name: "Bulk CRM writes above 5 objects require approval", decision: "review", reason: "Pipeline mutations above threshold need oversight." },
    { name: "Destructive deletes denied by default", decision: "deny", reason: "Delete actions remain blocked until explicitly approved by policy." },
    { name: "Sandbox support ticket creation auto-allowed", decision: "allow", reason: "Low-risk support actions remain inside the runtime envelope." }
  ],
  runs: [
    {
      time: "2026-04-15 09:14",
      agent: "Revenue Answers Agent",
      identity: "dust-prod-service",
      action: "Salesforce.read_account",
      risk: 24,
      decision: "allow",
      status: "executed"
    },
    {
      time: "2026-04-15 09:41",
      agent: "RevOps Bot",
      identity: "revops-prod-service",
      action: "HubSpot.update_deal",
      risk: 76,
      decision: "review",
      status: "pending"
    },
    {
      time: "2026-04-15 10:12",
      agent: "Identity Admin Bot",
      identity: "it-admin-service",
      action: "Okta.suspend_user",
      risk: 92,
      decision: "review",
      status: "pending"
    },
    {
      time: "2026-04-15 10:34",
      agent: "Engineering MCP Agent",
      identity: "github-shared-token",
      action: "GitHub.merge_pr",
      risk: 83,
      decision: "review",
      status: "pending"
    }
  ],
  pendingApprovals: [],
  selectedApproval: null,
  selectedView: "overview"
};

const actionMap = {
  Salesforce: ["read_account", "update_opportunity"],
  HubSpot: ["update_deal", "create_contact", "delete_contact"],
  Okta: ["add_group", "suspend_user", "reset_mfa"],
  GitHub: ["open_pr", "merge_pr", "comment_pr"],
  Slack: ["post_message", "route_approval"]
};

function $(selector) {
  return document.querySelector(selector);
}

function $$(selector) {
  return Array.from(document.querySelectorAll(selector));
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function badge(label, tone) {
  return `<span class="badge ${tone}">${escapeHtml(label)}</span>`;
}

function toneForDecision(value) {
  if (value === "allow") return "allow";
  if (value === "review") return "review";
  if (value === "deny") return "deny";
  if (value === "critical") return "critical";
  return "info";
}

function runDiscoveryScan() {
  state.scanned = true;
  state.findings = [
    {
      severity: "critical",
      title: "Privileged Okta action path discovered",
      copy: "Identity Admin Bot can suspend users in production through a service identity with no enforced reviewer group."
    },
    {
      severity: "high",
      title: "Shared engineering identity detected",
      copy: "Engineering MCP Agent runs with a shared GitHub token that can touch release workflows across environments."
    },
    {
      severity: "high",
      title: "Bulk CRM write path without threshold on the source system",
      copy: "RevOps Bot can update many HubSpot deals in one flow, creating a large business blast radius."
    },
    {
      severity: "medium",
      title: "Managed assistants already touch production systems",
      copy: "Dust and Glean powered assistants are present in production with Slack and CRM access paths."
    }
  ];

  state.controls = [
    {
      level: "critical",
      title: "Route Okta production actions to approval",
      copy: "Add a required reviewer group and prevent direct execution for suspend_user, reset_mfa, and add_group."
    },
    {
      level: "high",
      title: "Set CRM mutation thresholds",
      copy: "Require review for HubSpot and Salesforce updates above five records or when stage changes affect revenue reporting."
    },
    {
      level: "high",
      title: "Break shared identity paths",
      copy: "Replace shared service tokens with per-agent execution identities for better traceability and reduced blast radius."
    },
    {
      level: "medium",
      title: "Keep discovery in shadow mode first",
      copy: "Observe flows and approval load before switching sensitive actions into active enforcement."
    }
  ];

  render();
}

function formatTopStats() {
  const productionAgents = state.agents.filter((agent) => agent.environments.includes("production")).length;
  const sharedIdentities = state.agents.filter((agent) => agent.identity.includes("shared")).length;
  const pending = state.runs.filter((run) => run.status === "pending").length;
  const criticalPaths = state.findings.filter((finding) => finding.severity === "critical").length;

  return [
    { label: "Agents discovered", value: state.agents.length },
    { label: "Production-capable", value: productionAgents },
    { label: "Pending approvals", value: pending },
    { label: "Critical paths", value: criticalPaths || 1 },
    { label: "Shared identities", value: sharedIdentities },
    { label: "Connected systems", value: state.systems.length }
  ];
}

function renderOverview() {
  $("#modePill").textContent = state.shadowMode ? "Shadow mode" : "Enforcement mode";

  $("#topStats").innerHTML = formatTopStats()
    .slice(0, 4)
    .map((item) => `
      <div class="stat">
        <div class="stat-label">${escapeHtml(item.label)}</div>
        <div class="stat-value">${escapeHtml(item.value)}</div>
      </div>
    `)
    .join("");

  $("#eventFeed").innerHTML = state.runs
    .slice()
    .reverse()
    .slice(0, 4)
    .map((run) => `
      <div class="feed-item">
        <div><strong>${escapeHtml(run.action)}</strong></div>
        <div class="feed-meta">${escapeHtml(run.agent)} · risk ${run.risk} · ${escapeHtml(run.status)}</div>
      </div>
    `)
    .join("");

  const cards = [
    {
      title: "What matches the website well",
      copy: "Discovery, runtime decisioning, approvals, replay, and platform hooks are all visible in the MVP now."
    },
    {
      title: "What the buyer understands fast",
      copy: "Shared identities, privileged actions, bulk CRM changes, and missing review gates translate into immediate enterprise risk."
    },
    {
      title: "What makes the story stronger",
      copy: "The experience now starts with visibility and only then moves into governance activation, which is closer to the public narrative."
    }
  ];

  $("#overviewCards").innerHTML = cards
    .map((card) => `
      <article class="card">
        <div class="card-title">${escapeHtml(card.title)}</div>
        <p class="card-copy">${escapeHtml(card.copy)}</p>
      </article>
    `)
    .join("");
}

function renderDiscovery() {
  const stats = [
    { label: "Runtimes", value: state.runtimes.length },
    { label: "Agents", value: state.agents.length },
    { label: "Systems", value: state.systems.length },
    { label: "Findings", value: state.findings.length || 4 }
  ];

  $("#discoveryStats").innerHTML = stats
    .map((item) => `
      <div class="card">
        <div class="stat-label">${escapeHtml(item.label)}</div>
        <div class="stat-value">${escapeHtml(item.value)}</div>
      </div>
    `)
    .join("");

  const matrixHeader = ["Agent", ...state.systems]
    .map((item) => `<div class="matrix-head">${escapeHtml(item)}</div>`)
    .join("");

  const matrixRows = state.agents
    .map((agent) => {
      const firstCell = `<div class="matrix-head">${escapeHtml(agent.name)}</div>`;
      const cells = state.systems
        .map((system) => {
          if (!agent.systems.includes(system)) return `<div class="matrix-cell none">—</div>`;
          const tone = agent.risk === "critical" ? "critical" : agent.risk === "high" ? "high" : "low";
          return `<div class="matrix-cell ${tone}">Access</div>`;
        })
        .join("");
      return firstCell + cells;
    })
    .join("");

  $("#matrixWrap").innerHTML = `<div class="matrix">${matrixHeader}${matrixRows}</div>`;

  const findings = state.findings.length ? state.findings : [
    { severity: "critical", title: "Privileged identity path", copy: "Run discovery to generate findings." },
    { severity: "high", title: "Bulk CRM mutations", copy: "Run discovery to generate findings." },
    { severity: "medium", title: "Managed assistants in production", copy: "Run discovery to generate findings." }
  ];

  $("#findingsList").innerHTML = findings
    .map((finding) => `
      <div class="finding">
        <div class="finding-head">
          <div class="finding-title">${escapeHtml(finding.title)}</div>
          <div class="finding-severity ${escapeHtml(finding.severity)}">${escapeHtml(finding.severity)}</div>
        </div>
        <div class="finding-copy">${escapeHtml(finding.copy)}</div>
      </div>
    `)
    .join("");
}

function renderActivation() {
  const controls = state.controls.length ? state.controls : [
    { level: "critical", title: "Route Okta actions to review", copy: "Discovery findings will populate this list." },
    { level: "high", title: "Set bulk CRM thresholds", copy: "Discovery findings will populate this list." },
    { level: "medium", title: "Keep rollout in shadow mode", copy: "Discovery findings will populate this list." }
  ];

  $("#recommendedControls").innerHTML = controls
    .map((control) => `
      <div class="control">
        <div class="finding-head">
          <div class="control-title">${escapeHtml(control.title)}</div>
          <div class="control-status ${escapeHtml(control.level)}">${escapeHtml(control.level)}</div>
        </div>
        <div class="control-copy">${escapeHtml(control.copy)}</div>
      </div>
    `)
    .join("");
}

function populateRuntimeForm() {
  $("#runtimeAgent").innerHTML = state.agents
    .map((agent) => `<option value="${escapeHtml(agent.id)}">${escapeHtml(agent.name)}</option>`)
    .join("");

  $("#runtimeConnector").innerHTML = state.systems
    .map((system) => `<option value="${escapeHtml(system)}">${escapeHtml(system)}</option>`)
    .join("");

  syncRuntimeActions();
}

function syncRuntimeActions() {
  const connector = $("#runtimeConnector").value;
  $("#runtimeAction").innerHTML = (actionMap[connector] || [])
    .map((action) => `<option value="${escapeHtml(action)}">${escapeHtml(action)}</option>`)
    .join("");
}

function evaluateRequest(request) {
  let risk = 20;
  if (request.connector === "Okta") risk += 42;
  if (request.connector === "GitHub") risk += 24;
  if (["HubSpot", "Salesforce"].includes(request.connector)) risk += 18;
  if (request.environment === "production") risk += 18;
  if (request.objects > 5) risk += 18;
  if (request.action.includes("delete")) risk += 36;
  if (request.action.includes("merge") || request.action.includes("suspend") || request.action.includes("reset")) risk += 20;
  if (request.identity.includes("shared")) risk += 12;
  risk = Math.min(100, risk);

  let decision = "allow";
  let policy = "Runtime envelope default allow";
  let reason = "Action stays within the configured safe envelope.";
  let path = state.shadowMode ? "Observe in shadow mode" : "Execute automatically";

  if (request.action.includes("delete")) {
    decision = "deny";
    policy = "Destructive deletes denied by default";
    reason = "Delete actions remain blocked until explicitly approved by policy.";
    path = state.shadowMode ? "Observed only" : "Blocked before execution";
  } else if (request.connector === "Okta" && request.environment === "production") {
    decision = "review";
    policy = "Okta production actions require approval";
    reason = "Identity actions in production need human confirmation.";
    path = "Route to approval queue";
  } else if (["HubSpot", "Salesforce"].includes(request.connector) && request.objects > 5) {
    decision = "review";
    policy = "Bulk CRM writes above 5 objects require approval";
    reason = "Pipeline mutations above threshold need oversight.";
    path = "Route to approval queue";
  } else if (request.connector === "GitHub" && request.action === "merge_pr" && request.environment === "production") {
    decision = "review";
    policy = "Production merges require approval";
    reason = "Release-path merges should not execute without a human reviewer.";
    path = "Route to approval queue";
  }

  return { risk, decision, policy, reason, path };
}

function renderRuntimeResult(result, request, agent) {
  $("#runtimeResult").innerHTML = `
    <div class="result-grid">
      <div>${badge(result.decision === "review" ? "Require approval" : result.decision === "allow" ? "Allow" : "Deny", toneForDecision(result.decision))}</div>
      <div class="result-stats">
        <div class="result-stat">
          <div class="result-stat-label">Matched policy</div>
          <div class="result-stat-value">${escapeHtml(result.policy)}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-label">Risk score</div>
          <div class="result-stat-value">${result.risk}</div>
        </div>
        <div class="result-stat">
          <div class="result-stat-label">Execution path</div>
          <div class="result-stat-value">${escapeHtml(result.path)}</div>
        </div>
      </div>
      <div class="feed-item">
        <div><strong>${escapeHtml(agent.name)}</strong> → ${escapeHtml(request.connector)}.${escapeHtml(request.action)}</div>
        <div class="feed-meta">${escapeHtml(request.identity)} · ${escapeHtml(request.environment)} · ${request.objects} object(s)</div>
      </div>
      <div class="feed-item">
        <div><strong>Reason</strong></div>
        <div class="feed-meta">${escapeHtml(result.reason)}</div>
      </div>
      <div class="feed-item">
        <div><strong>Business justification</strong></div>
        <div class="feed-meta">${escapeHtml(request.justification)}</div>
      </div>
    </div>
  `;
}

function addRunFromRequest(request, result, agent) {
  const row = {
    time: new Date().toISOString().slice(0, 16).replace("T", " "),
    agent: agent.name,
    identity: request.identity,
    action: `${request.connector}.${request.action}`,
    risk: result.risk,
    decision: result.decision,
    status: result.decision === "review" ? "pending" : result.decision === "allow" ? (state.shadowMode ? "observed" : "executed") : "blocked",
    detail: {
      policy: result.policy,
      reason: result.reason,
      path: result.path,
      justification: request.justification,
      objects: request.objects,
      connector: request.connector,
      environment: request.environment
    }
  };

  state.runs.push(row);

  if (row.status === "pending") {
    state.pendingApprovals.unshift({
      id: `approval-${Date.now()}`,
      title: `${request.connector}.${request.action}`,
      agent: agent.name,
      risk: result.risk,
      identity: request.identity,
      policy: result.policy,
      reason: result.reason,
      justification: request.justification,
      environment: request.environment,
      objects: request.objects,
      connector: request.connector,
      action: request.action
    });
    state.selectedApproval = state.pendingApprovals[0]?.id || null;
  }
}

function renderApprovals() {
  if (!state.pendingApprovals.length) {
    $("#approvalList").innerHTML = `<div class="empty-state">No pending approvals yet. Generate one from the runtime view.</div>`;
    $("#approvalDetail").innerHTML = `<div class="empty-state">Select an approval request.</div>`;
    return;
  }

  $("#approvalList").innerHTML = state.pendingApprovals
    .map((approval) => `
      <div class="approval ${state.selectedApproval === approval.id ? "selected" : ""}" data-approval="${escapeHtml(approval.id)}">
        <div class="finding-head">
          <div class="approval-title">${escapeHtml(approval.title)}</div>
          ${badge(`risk ${approval.risk}`, "review")}
        </div>
        <div class="approval-copy">${escapeHtml(approval.agent)} · ${escapeHtml(approval.identity)} · ${escapeHtml(approval.environment)}</div>
      </div>
    `)
    .join("");

  const active = state.pendingApprovals.find((approval) => approval.id === state.selectedApproval) || state.pendingApprovals[0];
  state.selectedApproval = active.id;

  $("#approvalDetail").innerHTML = `
    <div class="result-grid">
      <div>${badge("Require approval", "review")}</div>
      <div class="feed-item">
        <div><strong>Action</strong></div>
        <div class="feed-meta">${escapeHtml(active.connector)}.${escapeHtml(active.action)} · ${active.objects} object(s) · ${escapeHtml(active.environment)}</div>
      </div>
      <div class="feed-item">
        <div><strong>Matched policy</strong></div>
        <div class="feed-meta">${escapeHtml(active.policy)}</div>
      </div>
      <div class="feed-item">
        <div><strong>Why review is required</strong></div>
        <div class="feed-meta">${escapeHtml(active.reason)}</div>
      </div>
      <div class="feed-item">
        <div><strong>Business justification</strong></div>
        <div class="feed-meta">${escapeHtml(active.justification)}</div>
      </div>
      <div class="approval-actions">
        <button class="btn primary" data-approval-action="approve">Approve</button>
        <button class="btn" data-approval-action="reject">Reject</button>
      </div>
    </div>
  `;

  $$('[data-approval]').forEach((element) => {
    element.addEventListener("click", () => {
      state.selectedApproval = element.dataset.approval;
      renderApprovals();
    });
  });

  $$('[data-approval-action]').forEach((button) => {
    button.addEventListener("click", () => resolveApproval(button.dataset.approvalAction));
  });
}

function resolveApproval(action) {
  const approval = state.pendingApprovals.find((item) => item.id === state.selectedApproval);
  if (!approval) return;

  const matchingRun = [...state.runs].reverse().find((run) => run.action === `${approval.connector}.${approval.action}` && run.identity === approval.identity && run.status === "pending");
  if (matchingRun) {
    matchingRun.status = action === "approve" ? (state.shadowMode ? "observed" : "executed") : "blocked";
    matchingRun.decision = action === "approve" ? "allow" : "deny";
  }

  state.pendingApprovals = state.pendingApprovals.filter((item) => item.id !== approval.id);
  state.selectedApproval = state.pendingApprovals[0]?.id || null;
  render();
}

function renderAudit() {
  $("#auditTable").innerHTML = state.runs
    .slice()
    .reverse()
    .map((run) => `
      <tr>
        <td>${escapeHtml(run.time)}</td>
        <td>${escapeHtml(run.agent)}</td>
        <td>${escapeHtml(run.identity)}</td>
        <td>${escapeHtml(run.action)}</td>
        <td>${run.risk}</td>
        <td>${badge(run.decision === "review" ? "Require approval" : run.decision === "allow" ? "Allow" : "Deny", toneForDecision(run.decision))}</td>
        <td>${badge(escapeHtml(run.status), run.status === "blocked" ? "deny" : run.status === "pending" ? "review" : "allow")}</td>
      </tr>
    `)
    .join("");
}

function renderPlatform() {
  // Static view only.
}

function render() {
  renderOverview();
  renderDiscovery();
  renderActivation();
  renderApprovals();
  renderAudit();
  renderPlatform();
  $("#modeBtn").textContent = state.shadowMode ? "Shadow mode" : "Enforcement mode";
}

function switchView(viewName) {
  state.selectedView = viewName;
  $$(".view").forEach((view) => view.classList.add("hidden"));
  $$(".nav-btn").forEach((button) => button.classList.remove("active"));
  $(`#view-${viewName}`).classList.remove("hidden");
  $(`.nav-btn[data-view="${viewName}"]`).classList.add("active");
}

function bindEvents() {
  $$(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  $$('[data-jump]').forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.jump));
  });

  ["#scanBtn", "#heroScanBtn", "#refreshScanBtn"].forEach((selector) => {
    $(selector).addEventListener("click", runDiscoveryScan);
  });

  $("#modeBtn").addEventListener("click", () => {
    state.shadowMode = !state.shadowMode;
    render();
  });

  $("#runtimeConnector").addEventListener("change", syncRuntimeActions);

  $("#runtimeForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const agent = state.agents.find((item) => item.id === $("#runtimeAgent").value) || state.agents[0];
    const request = {
      connector: $("#runtimeConnector").value,
      action: $("#runtimeAction").value,
      environment: $("#runtimeEnvironment").value,
      objects: Number($("#runtimeObjects").value),
      identity: $("#runtimeIdentity").value,
      justification: $("#runtimeJustification").value
    };
    const result = evaluateRequest(request);
    renderRuntimeResult(result, request, agent);
    addRunFromRequest(request, result, agent);
    render();
    switchView(result.decision === "review" ? "approvals" : "runtime");
  });

  $("#seedApprovalBtn").addEventListener("click", () => {
    $("#runtimeConnector").value = "Okta";
    syncRuntimeActions();
    $("#runtimeAction").value = "suspend_user";
    $("#runtimeEnvironment").value = "production";
    $("#runtimeObjects").value = "1";
    $("#runtimeIdentity").value = "it-admin-service";
    $("#runtimeJustification").value = "Offboard a departing employee and suspend their production account access.";
    $("#runtimeForm").dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  });
}

function init() {
  runDiscoveryScan();
  state.pendingApprovals = [
    {
      id: "approval-seeded-1",
      title: "HubSpot.update_deal",
      agent: "RevOps Bot",
      risk: 76,
      identity: "revops-prod-service",
      policy: "Bulk CRM writes above 5 objects require approval",
      reason: "Pipeline mutations above threshold need oversight.",
      justification: "Move a batch of opportunities after the weekly revenue review.",
      environment: "production",
      objects: 8,
      connector: "HubSpot",
      action: "update_deal"
    },
    {
      id: "approval-seeded-2",
      title: "Okta.suspend_user",
      agent: "Identity Admin Bot",
      risk: 92,
      identity: "it-admin-service",
      policy: "Okta production actions require approval",
      reason: "Identity actions in production need human confirmation.",
      justification: "Suspend a production user account during offboarding.",
      environment: "production",
      objects: 1,
      connector: "Okta",
      action: "suspend_user"
    }
  ];
  state.selectedApproval = state.pendingApprovals[0].id;
  populateRuntimeForm();
  bindEvents();
  render();
}

init();
