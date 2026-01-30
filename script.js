/* ================= SUPABASE INIT SAFE ================= */

if (!window.SUPABASE_READY) {

  window.SUPABASE_READY = true;

  const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
  const SUPABASE_KEY = "sb_publishable_DrsxYXH_bJhWWgMaRdTSng_QyxiaVEB";

  window.db = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

}

/* ================= LOGOUT HTML COMPAT ================= */

window.logoutSistema = function () {
  logout();
};

/* ================= LOGIN LOCAL ================= */

const usuarios = [
  { usuario: "admin", senha: "123456", perfil: "admin", nome: "Administrador" },
  { usuario: "gestor", senha: "123456", perfil: "gestor", nome: "Gestor Frota" },
  { usuario: "financeiro", senha: "123456", perfil: "financeiro", nome: "Financeiro" },
  { usuario: "consulta", senha: "123456", perfil: "consulta", nome: "Consulta" }
];

let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

/* ================= CONTROLE DE SESSÃO ================= */

function verificarSessao() {

  const loginScreen = document.getElementById("loginScreen");
  const appSistema = document.getElementById("appSistema");

  if (!loginScreen || !appSistema) return;

  if (usuarioLogado) {

    loginScreen.style.display = "none";
    appSistema.style.display = "flex";

    const nomeEl = document.getElementById("nomeUsuario");
    const perfilEl = document.getElementById("perfilUsuario");

    if (nomeEl) nomeEl.textContent = usuarioLogado.nome || "";
    if (perfilEl) perfilEl.textContent = (usuarioLogado.perfil || "").toUpperCase();

  } else {

    loginScreen.style.display = "flex";
    appSistema.style.display = "none";

  }

}

/* ================= LOGIN ================= */

window.fazerLogin = function () {

  const userInput = document.getElementById("loginUser");
  const passInput = document.getElementById("loginPass");
  const erro = document.getElementById("loginErro");

  const user = userInput.value;
  const pass = passInput.value;

  const encontrado = usuarios.find(u =>
    u.usuario === user && u.senha === pass
  );

  if (!encontrado) {
    erro.textContent = "Usuário ou senha inválidos";
    return;
  }

  usuarioLogado = {
    usuario: encontrado.usuario,
    nome: encontrado.nome,
    perfil: encontrado.perfil
  };

  localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

  verificarSessao();
};

/* ================= LOGOUT ================= */

window.logout = function () {

  if (confirm("Deseja sair do sistema?")) {
    localStorage.removeItem("usuarioLogado");
    usuarioLogado = null;
    verificarSessao();
  }

};

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

/* ================= STORAGE LOCAL (FALLBACK) ================= */

let veiculos = [];
let motoristas = [];
let abastecimentos = [];
let manutencoes = [];

/* ================= SUPABASE LOAD ================= */

async function carregarDados() {

  const { data: v } = await db.from("veiculos").select("*");
  const { data: m } = await db.from("motoristas").select("*");
  const { data: a } = await db.from("abastecimentos").select("*");
  const { data: man } = await db.from("manutencoes").select("*");

  veiculos = v || [];
  motoristas = m || [];
  abastecimentos = a || [];
  manutencoes = man || [];

  renderVeiculos();
  renderMotoristas();
  renderAbastecimentos();
  renderManutencoes();
  atualizarDashboard();
}

/* ================= REALTIME ================= */

db.channel("sync-frota")

.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "veiculos" },
  () => carregarDados()
)

.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "motoristas" },
  () => carregarDados()
)

.on(
  "postgres_changes",
  { event: "*", schema: "public", table: "abastecimentos" },
  () => carregarDados()
)

.on(
  "postgres_changes", 
  { event: "*", schema: "public", table: "manutencoes" },
  () => carregarDados()
)

.subscribe();


/* ================= VARS ================= */

let grafV = null, grafM = null, grafTopVeiculos = null;

let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal;
let aKmAnterior, aKmAtual2, aKmRodado, aCustoKm, aData;
let manVeiculo;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  verificarSessao();

  aVeiculo = $("aVeiculo");
  aMotorista = $("aMotorista");
  aPreco = $("aPreco");
  aQuantidade = $("aQuantidade");
  aTotal = $("aTotal");
  aKmAtual2 = $("aKmAtual");
  aData = $("aData");
  manVeiculo = $("manVeiculo");

  carregarDados();
  abrirPagina("dashboard");

  document.querySelectorAll(".menu a").forEach(link => {

    link.onclick = e => {
      e.preventDefault();
      abrirPagina(link.dataset.page);
    };

  });

});

/* ================= SPA ================= */

function abrirPagina(id) {

  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));

  const page = $(id);
  const link = document.querySelector(`[data-page="${id}"]`);

  if (page) page.classList.remove("hidden");
  if (link) link.classList.add("active");

}

/* ================= CRUD SUPABASE ================= */

window.salvarVeiculo = async function () {

  const registro = {
    placa: vPlaca.value,
    marca: vMarca.value,
    modelo: vModelo.value,
    ano: vAno.value,
    categoria: vCategoria.value,
    cor: vCor.value,
    renavan: vRenavan.value,
    kmAtual: Number(vKmAtual.value) || 0,
    kmOleo: Number(vKmOleo.value) || 0
  };

  await db.from("veiculos").insert([registro]);
};

window.salvarMotorista = async function () {

  const registro = {
    nome: mNome.value,
    cpf: mCpf.value,
    cnh: mCnh.value,
    telefone: mTelefone.value
  };

  await db.from("motoristas").insert([registro]);
};

window.salvarAbastecimento = async function () {

  const registro = {
    veiculo: aVeiculo.value,
    motorista: aMotorista.value,
    preco: Number(aPreco.value) || 0,
    litros: Number(aQuantidade.value) || 0,
    total: Number(aTotal.value) || 0,
    kmAtual: Number(aKmAtual2.value) || 0,
    dataISO: new Date().toISOString()
  };

  await db.from("abastecimentos").insert([registro]);
};

window.salvarManutencao = async function () {

  const registro = {
    veiculo: manVeiculo.value,
    categoria: manCategoria.value,
    descricao: manDescricao.value,
    fornecedor: manFornecedor.value,
    valor: Number(manValor.value) || 0,
    km: Number(manKm.value) || 0,
    dataISO: new Date().toISOString()
  };

  await db.from("manutencoes").insert([registro]);
};

/* ================= DASHBOARD ================= */

function atualizarDashboard() {

  if (!window.cVeiculos) return;

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;
  cManutencoes.textContent = manutencoes.length;

  totalCombustivel.textContent =
    abastecimentos.reduce((s, a) => s + a.total, 0)
      .toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

}

/* ================= TV MODE ================= */

function ativarModoTV() {

  const btn = document.getElementById("btnTV");

  if (!btn) return;

  btn.addEventListener("click", () => {

    document.body.classList.toggle("tv-mode");

    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

  });

}

document.addEventListener("DOMContentLoaded", ativarModoTV);
