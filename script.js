const dataset = {
  contracts: {
    pa_sao_pedro: {
      label: "PA São Pedro",
      city: "Vitória",
      monthly: 5416666,
      annual: 65000000
    },
    hospital_materno: {
      label: "Hospital Materno Infantil",
      city: "Serra",
      monthly: 12300000,
      annual: 147600000
    },
    upa_prainha: {
      label: "UPA Prainha",
      city: "Vila Velha",
      monthly: 7800000,
      annual: 93600000
    }
  },
  months: {
    fev: {
      label: "Fev/2026",
      evidence: 84,
      total: 180,
      rate: 9,
      trend: [18, 14, 9],
      risk: [70, 22, 8],
      rows: [
        ["Escala médica", "8", "8", "low"],
        ["Produção assistencial", "1.100", "1.072", "medium"],
        ["Relatório mensal", "Sim", "Sim", "low"],
        ["Acolhimento com classificação", "100%", "92%", "medium"]
      ]
    },
    mar: {
      label: "Mar/2026",
      evidence: 76,
      total: 200,
      rate: 12,
      trend: [18, 14, 12],
      risk: [65, 20, 15],
      rows: [
        ["Médicos em escala", "8", "7", "medium"],
        ["Atendimentos realizados", "1.200", "1.164", "medium"],
        ["Documentação de acolhimento", "100%", "88%", "high"],
        ["Relatório mensal enviado", "Sim", "Sim", "low"]
      ]
    },
    abr: {
      label: "Abr/2026",
      evidence: 68,
      total: 220,
      rate: 18,
      trend: [18, 14, 12, 18],
      risk: [48, 31, 21],
      rows: [
        ["Cobertura noturna", "Completa", "Parcial", "high"],
        ["Escala pediátrica", "4", "3", "high"],
        ["Produção assistencial", "1.280", "1.184", "medium"],
        ["Plano de saneamento", "Sim", "Pendente", "high"]
      ]
    }
  }
};

let trendChart = null;
let riskChart = null;

function brl(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  });
}

function compactBRL(value) {
  if (value >= 1_000_000) {
    return "R$ " + (value / 1_000_000).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + "M";
  }
  return brl(value);
}

function riskLabel(key) {
  if (key === "low") return "Baixo";
  if (key === "medium") return "Médio";
  return "Alto";
}

function updateDashboard() {
  const contractKey = document.getElementById("contractSelect").value;
  const monthKey = document.getElementById("monthSelect").value;

  const contract = dataset.contracts[contractKey];
  const data = dataset.months[monthKey];

  const proven = Math.round((data.evidence / 100) * data.total);
  const exposure = contract.monthly * (data.rate / 100);

  document.getElementById("appContext").textContent =
    `${contract.city} · ${contract.label} · ${data.label}`;

  document.getElementById("kpiMonthly").textContent = compactBRL(contract.monthly);
  document.getElementById("kpiAnnual").textContent = `Contrato anual: ${compactBRL(contract.annual)}`;
  document.getElementById("kpiEvidence").textContent = `${data.evidence}%`;
  document.getElementById("kpiEvidenceSub").textContent = `${proven} de ${data.total} obrigações`;
  document.getElementById("kpiRate").textContent = `${data.rate}%`;
  document.getElementById("kpiStatus").textContent = data.rate >= 15 ? "Risco crítico" : data.rate >= 10 ? "Atenção técnica" : "Monitoramento";
  document.getElementById("kpiExposure").textContent = brl(exposure);
  document.getElementById("heroMoney").textContent = brl(dataset.contracts.pa_sao_pedro.monthly * 0.12);

  const tbody = document.getElementById("evidenceTable");
  tbody.innerHTML = data.rows.map(row => `
    <tr>
      <td>${row[0]}</td>
      <td>${row[1]}</td>
      <td>${row[2]}</td>
      <td><span class="risk-badge ${row[3]}">${riskLabel(row[3])}</span></td>
    </tr>
  `).join("");

  updateCharts(data);
  if (window.lucide) lucide.createIcons();
}

function updateCharts(data) {
  const trendCanvas = document.getElementById("trendChart");
  const riskCanvas = document.getElementById("riskChart");

  const trendLabels = ["Jan/26", "Fev/26", "Mar/26", "Abr/26"].slice(-data.trend.length);

  if (trendChart) trendChart.destroy();
  if (riskChart) riskChart.destroy();

  trendChart = new Chart(trendCanvas, {
    type: "line",
    data: {
      labels: trendLabels,
      datasets: [{
        label: "Taxa de inconsistência",
        data: data.trend,
        borderColor: "#d4618e",
        backgroundColor: "rgba(212,97,142,.10)",
        borderWidth: 3,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: "#d4618e",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        tension: .42
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 650, easing: "easeOutQuart" },
      plugins: { legend: { display: false } },
      scales: {
        y: {
          beginAtZero: true,
          max: 25,
          grid: { color: "rgba(13,59,102,.08)" },
          ticks: { callback: value => value + "%" }
        },
        x: { grid: { display: false } }
      }
    }
  });

  riskChart = new Chart(riskCanvas, {
    type: "doughnut",
    data: {
      labels: ["Baixo", "Médio", "Alto"],
      datasets: [{
        data: data.risk,
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: "rgba(255,255,255,.9)",
        borderWidth: 3,
        hoverOffset: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: { duration: 650, easing: "easeOutQuart" },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 16,
            usePointStyle: true,
            font: { size: 11, weight: "700" }
          }
        }
      }
    }
  });
}

function openModal(type) {
  const eyebrow = document.getElementById("modalEyebrow");
  const title = document.getElementById("modalTitle");
  const text = document.getElementById("modalText");

  if (type === "pilot") {
    eyebrow.textContent = "Piloto técnico de 30 dias";
    title.textContent = "Estruture um diagnóstico de contrato";
    text.textContent = "Envie seus dados para abrir uma conversa institucional sobre uma unidade, contrato ou competência específica.";
  } else {
    eyebrow.textContent = "Demonstração institucional";
    title.textContent = "Agende uma apresentação do AuditorES";
    text.textContent = "A demonstração apresenta a metodologia, a vitrine do SaaS e a lógica de auditoria técnico-documental aplicada à gestão pública.";
  }

  document.getElementById("mainModal").classList.add("open");
  document.getElementById("mainModal").setAttribute("aria-hidden", "false");
  if (window.lucide) lucide.createIcons();
}

function closeModal() {
  document.getElementById("mainModal").classList.remove("open");
  document.getElementById("mainModal").setAttribute("aria-hidden", "true");
  document.getElementById("leadForm").reset();
}

function handleFormSubmit(event) {
  event.preventDefault();
  const name = document.getElementById("leadName").value.trim() || "obrigada";
  showToast(`${name}, sua solicitação foi registrada. Em produção, este formulário será conectado ao CRM.`);
  closeModal();
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 4300);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initPushNotifications() {
  const messages = [
    "Nova inconsistência documental identificada: OBR-098 · Escala assistencial.",
    "Justificativa anexada pela OS para item crítico · Aguardando validação técnica.",
    "Prazo de resposta da diligência vence em 2 dias úteis.",
    "Matriz de evidências atualizada · Competência Mar/2026.",
    "Relatório executivo disponível para revisão pré-ateste."
  ];

  let index = 0;

  setTimeout(() => {
    showToast(messages[index]);
    index = (index + 1) % messages.length;
  }, 9500);

  setInterval(() => {
    showToast(messages[index]);
    index = (index + 1) % messages.length;
  }, 42000);
}

function initNavSpy() {
  const links = [...document.querySelectorAll(".nav a")];
  const ids = links.map(a => a.getAttribute("href").replace("#", ""));

  window.addEventListener("scroll", () => {
    let activeId = ids[0];

    ids.forEach(id => {
      const section = document.getElementById(id);
      if (!section) return;
      const rect = section.getBoundingClientRect();
      if (rect.top <= 140) activeId = id;
    });

    links.forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === `#${activeId}`);
    });
  }, { passive: true });
}

document.getElementById("mainModal").addEventListener("click", event => {
  if (event.target.id === "mainModal") closeModal();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeModal();
});

window.addEventListener("load", () => {
  if (window.lucide) lucide.createIcons();
  updateDashboard();
  initNavSpy();
  initPushNotifications();
});
