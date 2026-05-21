const tasks = [
  {
    id: "vault",
    title: "Stake demo USDC",
    description: "Approve exact USDC and deposit into a mock yield vault.",
    protocol: "USDC Vault",
    contract: "0x8aB4C6d7E8f9012345678901234567890AbCdEF1",
    action: "deposit(uint256 amount,address receiver)",
    asset: "USDC",
    token: "0x1F3a4e6B8C9012345678901234567890abcDeF22",
    sponsor: "Demo Sponsor",
    requiresApproval: true,
  },
  {
    id: "mint",
    title: "Claim loyalty NFT",
    description: "Claim a mock NFT where the sponsor pays the network fee.",
    protocol: "Loyalty Mint",
    contract: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    action: "claim(address account,uint256 campaignId)",
    asset: "NFT",
    token: "0x0000000000000000000000000000000000000000",
    sponsor: "Campaign Sponsor",
    requiresApproval: false,
  },
  {
    id: "swap",
    title: "Swap then deposit",
    description: "Review a two-call path before a mock sponsored execution.",
    protocol: "Route Vault",
    contract: "0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB",
    action: "swapAndDeposit(uint256 amount,uint256 minOut)",
    asset: "USDC",
    token: "0xB0b0000000000000000000000000000000000B0b",
    sponsor: "Route Sponsor",
    requiresApproval: true,
  },
];

const sponsorPolicies = {
  standard: {
    title: "标准赞助",
    label: "eligible",
    paidBy: "Demo Sponsor",
    userPays: "0 ETH",
    copy: "Sponsor covers gas when the target protocol is allow-listed and approval remains bounded.",
  },
  strict: {
    title: "严格赞助",
    label: "review",
    paidBy: "Policy Sponsor",
    userPays: "0 ETH",
    copy: "Sponsor covers gas only when the batch uses exact approval and a single protocol target.",
  },
  blocked: {
    title: "无匹配赞助",
    label: "blocked",
    paidBy: "None",
    userPays: "Requires ETH",
    copy: "No sponsor accepts this route. The wallet blocks the mock signature instead of hiding the gas requirement.",
  },
};

const state = {
  taskId: "vault",
  amount: 80,
  approval: "exact",
  sponsor: "standard",
  signed: false,
  mockHash: "",
};

const els = {
  taskGrid: document.querySelector("#taskGrid"),
  amountInput: document.querySelector("#amountInput"),
  approvalSelect: document.querySelector("#approvalSelect"),
  sponsorSelect: document.querySelector("#sponsorSelect"),
  riskBadge: document.querySelector("#riskBadge"),
  protocolName: document.querySelector("#protocolName"),
  sponsorState: document.querySelector("#sponsorState"),
  callList: document.querySelector("#callList"),
  sponsorTitle: document.querySelector("#sponsorTitle"),
  sponsorCopy: document.querySelector("#sponsorCopy"),
  gasPaidBy: document.querySelector("#gasPaidBy"),
  userPays: document.querySelector("#userPays"),
  policyState: document.querySelector("#policyState"),
  warningBox: document.querySelector("#warningBox"),
  warningTitle: document.querySelector("#warningTitle"),
  warningText: document.querySelector("#warningText"),
  signButton: document.querySelector("#signButton"),
  resultBox: document.querySelector("#resultBox"),
  resultTitle: document.querySelector("#resultTitle"),
  resultCopy: document.querySelector("#resultCopy"),
  mockHash: document.querySelector("#mockHash"),
  resetButton: document.querySelector("#resetButton"),
};

function currentTask() {
  return tasks.find((task) => task.id === state.taskId);
}

function approvalAmount() {
  if (state.approval === "unlimited") return "Unlimited";
  if (!currentTask().requiresApproval) return "No approval";
  if (state.approval === "buffer") return `${Math.ceil(state.amount * 1.2)} ${currentTask().asset}`;
  return `${state.amount} ${currentTask().asset}`;
}

function evaluateRisk() {
  if (state.sponsor === "blocked") {
    return {
      level: "Block",
      title: "Sponsor unavailable",
      text: "This route has no sponsor match, so the wallet blocks the mock signature.",
    };
  }

  if (currentTask().requiresApproval && state.approval === "unlimited") {
    return {
      level: "Danger",
      title: "Unlimited approval",
      text: "The batch asks for unlimited approval. The safer path is exact approval before signing.",
    };
  }

  if ((currentTask().requiresApproval && state.approval === "buffer") || state.sponsor === "strict") {
    return {
      level: "Warning",
      title: "Policy needs review",
      text: "The sponsor policy still passes, but the approval or route requires a closer review.",
    };
  }

  return {
    level: "Info",
    title: "Readable intent ready",
    text: "The sponsor covers gas and the approval is limited to the selected amount.",
  };
}

function buildCalls() {
  const task = currentTask();
  const calls = [];

  if (task.requiresApproval) {
    calls.push({
      kind: "Token approval",
      name: "approve(address spender,uint256 amount)",
      address: task.token,
      detail: `Grant ${approvalAmount()} to ${task.protocol}.`,
    });
  } else {
    calls.push({
      kind: "Eligibility check",
      name: "isEligible(address account,uint256 campaignId)",
      address: task.contract,
      detail: "Mock sponsor checks campaign eligibility without requesting token allowance.",
    });
  }

  calls.push({
    kind: "Protocol action",
    name: task.action,
    address: task.contract,
    detail: `${task.protocol} receives the action for ${state.amount} ${task.asset}.`,
  });

  if (task.id === "swap") {
    calls.splice(1, 0, {
      kind: "Route guard",
      name: "checkMinOut(uint256 minOut)",
      address: "0x6D1C1aB2c3D4e5F6789012345678901234567890",
      detail: "Mock route requires a minimum output before deposit continues.",
    });
  }

  return calls;
}

function renderTasks() {
  els.taskGrid.innerHTML = "";
  tasks.forEach((task) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `task-card${task.id === state.taskId ? " is-selected" : ""}`;
    button.dataset.taskId = task.id;
    button.innerHTML = `<strong>${task.title}</strong><span>${task.description}</span>`;
    button.addEventListener("click", () => {
      state.taskId = task.id;
      state.signed = false;
      state.mockHash = "";
      render();
    });
    els.taskGrid.append(button);
  });
}

function renderCalls() {
  els.callList.innerHTML = "";
  buildCalls().forEach((call, index) => {
    const row = document.createElement("article");
    row.className = "call-row";
    row.innerHTML = `
      <span class="call-index">${index + 1}</span>
      <div>
        <strong>${call.name}</strong>
        <p>${call.detail}</p>
        <code>${call.address}</code>
      </div>
      <span class="call-kind">${call.kind}</span>
    `;
    els.callList.append(row);
  });
}

function updateSteps(risk) {
  document.querySelectorAll(".step-button").forEach((button) => {
    button.classList.remove("is-active");
  });

  const step = state.signed ? "result" : risk.level === "Info" ? "review" : "sponsor";
  document.querySelector(`[data-step="${step}"]`).classList.add("is-active");
}

function renderSponsor(risk) {
  const policy = sponsorPolicies[state.sponsor];
  els.sponsorTitle.textContent = policy.title;
  els.sponsorCopy.textContent = policy.copy;
  els.gasPaidBy.textContent = policy.paidBy;
  els.userPays.textContent = policy.userPays;
  els.policyState.textContent = risk.level === "Block" ? "Block" : risk.level === "Danger" ? "Danger" : "Pass";
  els.sponsorState.textContent = policy.label;
}

function renderRisk(risk) {
  const normalized = risk.level.toLowerCase();
  els.riskBadge.textContent = risk.level;
  els.riskBadge.className = `badge badge-${normalized}`;
  els.warningBox.className = `warning-box is-${normalized}`;
  els.warningTitle.textContent = risk.title;
  els.warningText.textContent = risk.text;
  els.signButton.disabled = risk.level === "Block";
  els.signButton.textContent = risk.level === "Block" ? "Mock signature blocked" : "Create mock signature";
}

function renderResult(risk) {
  if (!state.signed) {
    els.resultBox.hidden = true;
    return;
  }

  els.resultBox.hidden = false;
  els.resultTitle.textContent = risk.level === "Danger" ? "Mock signature created with danger flag" : "Sponsor accepted the batch";
  els.mockHash.textContent = state.mockHash;
  els.resultCopy.textContent = "No RPC call, Paymaster request, or transaction broadcast was made.";
}

function render() {
  const task = currentTask();
  const risk = evaluateRisk();
  renderTasks();
  renderCalls();
  renderSponsor(risk);
  renderRisk(risk);
  renderResult(risk);
  updateSteps(risk);
  els.protocolName.textContent = task.protocol;
  els.approvalSelect.disabled = !task.requiresApproval;
}

els.amountInput.addEventListener("input", (event) => {
  const parsed = Number(event.target.value);
  state.amount = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
  state.signed = false;
  state.mockHash = "";
  render();
});

els.approvalSelect.addEventListener("change", (event) => {
  state.approval = event.target.value;
  state.signed = false;
  state.mockHash = "";
  render();
});

els.sponsorSelect.addEventListener("change", (event) => {
  state.sponsor = event.target.value;
  state.signed = false;
  state.mockHash = "";
  render();
});

els.signButton.addEventListener("click", () => {
  if (evaluateRisk().level === "Block") return;
  state.signed = true;
  state.mockHash = `mock_${Date.now().toString(16)}_${state.taskId}`;
  render();
});

els.resetButton.addEventListener("click", () => {
  state.taskId = "vault";
  state.amount = 80;
  state.approval = "exact";
  state.sponsor = "standard";
  state.signed = false;
  state.mockHash = "";
  els.amountInput.value = "80";
  els.approvalSelect.value = "exact";
  els.sponsorSelect.value = "standard";
  render();
});

render();
