/* ================= SUPABASE ================= */

const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2JvaGJ5cWZjaHVyaGxzenR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODg0MDMsImV4cCI6MjA4NTM2NDQwM30.gKs1x9Y3s86D70uW207jilOYD4MZmk0rpUw6i1QRbaY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

/* ================= LOGIN ================= */

const usuarios = [
  { usuario: "admin", senha: "201816.Ab", perfil: "admin", nome: "Administrador" }
];

let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

window.fazerLogin = function () {

  const user = loginUser.value;
  const pass = loginPass.value;

  const encontrado = usuarios.find(u =>
    u.usuario === user && u.senha === pass
  );

  if (!encontrado) {
    loginErro.textContent = "Usuário ou senha inválidos";
    return;
  }

  usuarioLogado = encontrado;
  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));
  verificarSessao();
};

window.logoutSistema = function () {

  localStorage.removeItem("usuarioLogado");
  usuarioLogado = null;
  verificarSessao();
};

function verificarSessao() {

  if (!loginScreen || !appSistema) return;

  if (usuarioLogado) {

    loginScreen.style.display = "none";
    appSistema.style.display = "flex";

    nomeUsuario.textContent = usuarioLogado.nome;
    perfilUsuario.textContent = usuarioLogado.perfil.toUpperCase();

  } else {

    loginScreen.style.display = "flex";
    appSistema.style.display = "none";
  }
}

/* ================= DATA ================= */

let veiculos = [];
let motoristas = [];
let abastecimentos = [];
let manutencoes = [];

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  mapearInputs();
  verificarSessao();
  carregarDados();
  abrirPagina("dashboard");

  document.querySelectorAll(".menu a").forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      abrirPagina(link.dataset.page);
    };
  });

});

/* ================= MAP INPUTS ================= */

let vPlaca, vMarca, vModelo, vAno, vCategoria, vCor, vRenavan, vKmAtual, vKmOleo;
let mNome, mCpf, mCnh, mTelefone;
let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal, aKmAtual, aKmAnterior, aKmRodado, aCustoKm, aData;
let manVeiculo, manCategoria, manDescricao, manValor, manData;


function mapearInputs() {

  vPlaca = $("vPlaca");
  vMarca = $("vMarca");
  vModelo = $("vModelo");
  vAno = $("vAno");
  vCategoria = $("vCategoria");
  vCor = $("vCor");
  vRenavan = $("vRenavan");
  vKmAtual = $("vKmAtual");
  vKmOleo = $("vKmOleo");

  mNome = $("mNome");
  mCpf = $("mCpf");
  mCnh = $("mCnh");
  mTelefone = $("mTelefone");

  aVeiculo = $("aVeiculo");
  aMotorista = $("aMotorista");
  aPreco = $("aPreco");
  aQuantidade = $("aQuantidade");
  aTotal = $("aTotal");
  aKmAtual = $("aKmAtual");
  aKmAnterior = $("aKmAnterior");
  aKmRodado = $("aKmRodado");
  aCustoKm = $("aCustoKm");
  aData = $("aData");

  manVeiculo = $("manVeiculo");
  manCategoria = $("manCategoria");
  manDescricao = $("manDescricao");
  manValor = $("manValor");
  manData = $("manData");


  aPreco?.addEventListener("input", calcularTotal);
  aQuantidade?.addEventListener("input", calcularTotal);
  aKmAtual?.addEventListener("input", calcularKm);

  aVeiculo?.addEventListener("change", buscarKmAnterior);
}

/* ================= SPA ================= */

function abrirPagina(id) {

  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));

  const page = $(id);
  const link = document.querySelector(`[data-page="${id}"]`);

  if (page) page.classList.remove("hidden");
  if (link) link.classList.add("active");
}

/* ================= LOAD ================= */

async function carregarDados() {

  try {

    const resVeiculos = await db.from("veiculos").select("*");
    const resMotoristas = await db.from("motoristas").select("*");
    const resAbastecimentos = await db.from("abastecimentos").select("*");
    const resManutencoes = await db.from("manutencoes").select("*");

    veiculos = resVeiculos.data || [];
    motoristas = resMotoristas.data || [];
    abastecimentos = resAbastecimentos.data || [];
    manutencoes = resManutencoes.data || [];

    renderVeiculos();
    renderMotoristas();
    renderAbastecimentos();
    renderManutencoes();

    atualizarDashboard();
    atualizarBIExecutivo();

    atualizarRankingVeiculos();
    atualizarRankingMotoristas();
    atualizarRankingManutencao();

    graficoVeiculos();
    graficoMotoristas();
    graficoTopVeiculos();
    graficoTopManutencao();

    console.log("Sistema sincronizado com sucesso");

  } catch (erro) {

    console.error("Falha geral carregarDados:", erro);

  }
}

/* ================= VEICULOS ================= */

window.salvarVeiculo = async function () {

  const registro = {
    placa: vPlaca.value,
    marca: vMarca.value,
    modelo: vModelo.value,
    ano: Number(vAno.value),
    categoria: vCategoria.value,
    cor: vCor.value,
    renavan: vRenavan.value,
    kmAtual: Number(vKmAtual.value),
    kmOleo: Number(vKmOleo.value)
  };

  const { error } = await db.from("veiculos").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar veículo");
    return;
  }

  limparVeiculo();
  carregarDados();
};

function limparVeiculo() {

  vPlaca.value = "";
  vMarca.value = "";
  vModelo.value = "";
  vAno.value = "";
  vCategoria.value = "";
  vCor.value = "";
  vRenavan.value = "";
  vKmAtual.value = "";
  vKmOleo.value = "";
}

/* ================= MOTORISTAS ================= */

window.salvarMotorista = async function () {

  const registro = {
    nome: mNome.value,
    cpf: mCpf.value,
    cnh: mCnh.value,
    telefone: mTelefone.value
  };

  const { error } = await db.from("motoristas").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar motorista");
    return;
  }

  carregarDados();
};

/* ================= KM AUTOMÁTICO ================= */

async function buscarKmAnterior() {

  const placa = aVeiculo.value;
  if (!placa) return;

  const { data: ult } = await db
    .from("abastecimentos")
    .select("kmAtual")
    .eq("veiculo", placa)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ult?.kmAtual) {
    aKmAnterior.value = ult.kmAtual;
    return;
  }

  const { data: v } = await db
    .from("veiculos")
    .select("kmAtual")
    .eq("placa", placa)
    .maybeSingle();

  aKmAnterior.value = v?.kmAtual || 0;
}

/* ================= ABASTECIMENTO ================= */

window.salvarAbastecimento = async function () {

  const preco = Number(aPreco.value);
  const litros = Number(aQuantidade.value);

  const kmAnterior = Number(aKmAnterior.value);
  const kmAtual = Number(aKmAtual.value);

  if (!aVeiculo.value || !aMotorista.value || !aData.value) {
    alert("Preencha todos os campos");
    return;
  }

  const kmRodado = kmAtual - kmAnterior;

  if (kmRodado <= 0) {
    alert("KM Atual deve ser maior que o KM Anterior");
    return;
  }

  const total = preco * litros;
  const custoKm = total / kmRodado;

  const registro = {
    veiculo: aVeiculo.value,
    motorista: aMotorista.value,
    preco,
    litros,
    total,
    kmAnterior,
    kmAtual,
    kmRodado,
    custoKm,
    data: aData.value
  };

  const { error } = await db.from("abastecimentos").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar abastecimento");
    return;
  }

  limparAbastecimento();
  carregarDados();
};

function limparAbastecimento() {

  aPreco.value = "";
  aQuantidade.value = "";
  aTotal.value = "";
  aKmAtual.value = "";
  aKmRodado.value = "";
  aCustoKm.value = "";
}

/* ================= CALCULOS ================= */

function calcularTotal() {

  const preco = Number(aPreco.value) || 0;
  const litros = Number(aQuantidade.value) || 0;

  aTotal.value = (preco * litros).toFixed(2);
}

function calcularKm() {

  const atual = Number(aKmAtual.value) || 0;
  const anterior = Number(aKmAnterior.value) || 0;

  const rodado = atual - anterior;

  if (rodado > 0) {

    aKmRodado.value = rodado;
    aCustoKm.value = (Number(aTotal.value) / rodado).toFixed(2);
  }
}

/* ================= RENDERS ================= */

function renderVeiculos() {

  listaVeiculos.innerHTML = veiculos.map(v =>
    `<li><b>${v.placa}</b> — ${v.marca} ${v.modelo}</li>`
  ).join("");

  const options =
    `<option value="">Selecione</option>` +
    veiculos.map(v => `<option value="${v.placa}">${v.placa}</option>`).join("");

  // abastecimento
  if (aVeiculo) {
    aVeiculo.innerHTML = options;
  }

  // manutenção
  if (manVeiculo) {
    manVeiculo.innerHTML = options;
  }

}


function renderMotoristas() {

  listaMotoristas.innerHTML = motoristas.map(m =>
    `<li>${m.nome}</li>`
  ).join("");

  aMotorista.innerHTML =
    `<option value="">Selecione</option>` +
    motoristas.map(m => `<option>${m.nome}</option>`).join("");
}

function renderAbastecimentos() {

  listaAbastecimentos.innerHTML = abastecimentos.map(a =>
    `<tr>
      <td>${new Date(a.data).toLocaleDateString()}</td>
      <td>${a.veiculo}</td>
      <td>${a.motorista}</td>
      <td>${a.litros}</td>
      <td>R$ ${a.total.toFixed(2)}</td>
      <td>${a.kmRodado}</td>
      <td>${a.custoKm.toFixed(2)}</td>
      <td>-</td>
    </tr>`
  ).join("");
}

/* ================= DASHBOARD ================= */

function atualizarDashboard() {

  if (!window.cVeiculos) return;

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;

  const total = abastecimentos.reduce((s, a) => s + Number(a.total || 0), 0);

  totalCombustivel.textContent =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


/* ================= BI EXECUTIVO ================= */

function atualizarBIExecutivo() {

  let total = 0;
  let litros = 0;
  let km = 0;

  abastecimentos.forEach(a => {

    const gasto = Number(a.total);
    const lit = Number(a.litros);
    const rodado = Number(a.kmRodado);

    if (!isNaN(gasto)) total += gasto;
    if (!isNaN(lit)) litros += lit;

    if (!isNaN(rodado) && rodado > 0) {
      km += rodado;
    }

  });

  biTotal.textContent =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  biLitros.textContent = litros.toFixed(1);
  biKm.textContent = km.toFixed(0);

  biCustoKm.textContent =
    km > 0
      ? (total / km).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })
      : "R$ 0,00";
}


/* ================= RANKING VEÍCULOS ================= */

function atualizarRankingVeiculos() {

  if (!window.rankingVeiculos) return;

  const mapa = {};

  abastecimentos.forEach(a => {

    const placa = a.veiculo;
    const total = Number(a.total) || 0;
    const km = Number(a.kmRodado) || 0;

    if (!mapa[placa]) {
      mapa[placa] = { total: 0, km: 0 };
    }

    mapa[placa].total += total;
    mapa[placa].km += km;

  });

  const lista = Object.entries(mapa)
    .map(([veiculo, dados]) => ({
      veiculo,
      total: dados.total,
      km: dados.km,
      custoKm: dados.km > 0 ? dados.total / dados.km : 0
    }))
    .sort((a, b) => b.total - a.total);

  rankingVeiculos.innerHTML = lista.map(v => `
    <tr>
      <td>${v.veiculo}</td>
      <td>R$ ${v.total.toFixed(2)}</td>
      <td>${v.km.toFixed(0)}</td>
      <td>R$ ${v.custoKm.toFixed(2)}</td>
    </tr>
  `).join("");
}


/* ================= RANKING MOTORISTAS ================= */

function atualizarRankingMotoristas() {

  if (!window.rankingMotoristas) return;

  const mapa = {};

  abastecimentos.forEach(a => {

    const nome = a.motorista;
    const total = Number(a.total) || 0;
    const km = Number(a.kmRodado) || 0;

    if (!mapa[nome]) {
      mapa[nome] = { total: 0, km: 0 };
    }

    mapa[nome].total += total;
    mapa[nome].km += km;

  });

  const lista = Object.entries(mapa)
    .map(([motorista, dados]) => ({
      motorista,
      total: dados.total,
      km: dados.km,
      custoKm: dados.km > 0 ? dados.total / dados.km : 0
    }))
    .sort((a, b) => b.total - a.total);

  rankingMotoristas.innerHTML = lista.map(m => `
    <tr>
      <td>${m.motorista}</td>
      <td>R$ ${m.total.toFixed(2)}</td>
      <td>${m.km.toFixed(0)}</td>
      <td>R$ ${m.custoKm.toFixed(2)}</td>
    </tr>
  `).join("");
}


/* ================= RANKING MANUTENÇÃO ================= */

function atualizarRankingManutencao() {

  if (!window.rankingManutencao) return;

  const mapa = {};

  manutencoes.forEach(m => {

    const placa = m.veiculo;
    const valor = Number(m.valor) || 0;

    mapa[placa] = (mapa[placa] || 0) + valor;

  });

  const lista = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1]);

  rankingManutencao.innerHTML = lista.map(([veiculo, total]) => `
    <tr>
      <td>${veiculo}</td>
      <td>R$ ${total.toFixed(2)}</td>
    </tr>
  `).join("");
}


/* ================= GRAFICOS ================= */

let grafV = null;
let grafM = null;
let grafTopVeiculos = null;
let grafTopManutencao = null;


/* ===== GRAFICO VEÍCULOS ===== */

function graficoVeiculos() {

  const canvas = document.getElementById("grafVeiculos");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    const placa = a.veiculo;
    const total = Number(a.total) || 0;
    mapa[placa] = (mapa[placa] || 0) + total;
  });

  if (grafV) grafV.destroy();

  grafV = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        label: "Gasto por Veículo (R$)",
        data: Object.values(mapa)
      }]
    },
    options: { responsive: true }
  });
}


/* ===== GRAFICO MOTORISTAS ===== */

function graficoMotoristas() {

  const canvas = document.getElementById("grafMotoristas");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    const nome = a.motorista;
    const total = Number(a.total) || 0;
    mapa[nome] = (mapa[nome] || 0) + total;
  });

  if (grafM) grafM.destroy();

  grafM = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        label: "Gasto por Motorista (R$)",
        data: Object.values(mapa)
      }]
    },
    options: { responsive: true }
  });
}


/* ===== TOP VEÍCULOS ===== */

function graficoTopVeiculos() {

  const canvas = document.getElementById("grafTopVeiculos");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    const placa = a.veiculo;
    const total = Number(a.total) || 0;
    mapa[placa] = (mapa[placa] || 0) + total;
  });

  const top = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (grafTopVeiculos) grafTopVeiculos.destroy();

  grafTopVeiculos = new Chart(canvas, {
    type: "pie",
    data: {
      labels: top.map(i => i[0]),
      datasets: [{ data: top.map(i => i[1]) }]
    }
  });
}


/* ===== TOP MANUTENÇÃO ===== */

function graficoTopManutencao() {

  const canvas = document.getElementById("grafTopManutencao");
  if (!canvas) return;

  const mapa = {};

  manutencoes.forEach(m => {
    const placa = m.veiculo;
    const valor = Number(m.valor) || 0;
    mapa[placa] = (mapa[placa] || 0) + valor;
  });

  const top = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  if (grafTopManutencao) grafTopManutencao.destroy();

  grafTopManutencao = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: top.map(i => i[0]),
      datasets: [{ data: top.map(i => i[1]) }]
    }
  });
}


/* ================= RENDER MANUTENÇÕES ================= */

function renderManutencoes() {

  if (!$("listaManutencoes")) return;

  listaManutencoes.innerHTML = manutencoes.map(m => `
    <tr>
      <td>${new Date(m.data).toLocaleDateString()}</td>
      <td>${m.veiculo}</td>
      <td>${m.categoria}</td>
      <td>${m.descricao || ""}</td>
      <td>R$ ${Number(m.valor || 0).toFixed(2)}</td>
    </tr>
  `).join("");
}
function graficoMotoristas() {

  const canvas = document.getElementById("grafMotoristas");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {

    const nome = a.motorista;
    const total = Number(a.total) || 0;

    mapa[nome] = (mapa[nome] || 0) + total;

  });

  const labels = Object.keys(mapa);
  const valores = Object.values(mapa);

  if (window.grafM) grafM.destroy();

  grafM = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Gasto por Motorista (R$)",
        data: valores
      }]
    },
    options: {
      responsive: true
    }
  });

}
/* ================= MANUTENÇÃO ================= */

window.salvarManutencao = async function () {

  const veiculo = manVeiculo.value;
  const categoria = manCategoria.value;
  const descricao = manDescricao.value;
  const valor = Number(manValor.value);
  const data = manData.value;

  if (!veiculo || !categoria || !valor || !data) {
    alert("Preencha todos os campos da manutenção");
    return;
  }

  const registro = {
    veiculo,
    categoria,
    descricao,
    valor,
    data
  };

  const { error } = await db.from("manutencoes").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar manutenção");
    return;
  }

  limparManutencao();
  carregarDados();

  alert("Manutenção salva com sucesso ✅");
};
function limparManutencao() {

  manVeiculo.value = "";
  manCategoria.value = "";
  manDescricao.value = "";
  manValor.value = "";
  manData.value = "";

}
