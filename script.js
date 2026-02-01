/* ================= SUPABASE INIT SAFE ================= */

if (!window.db) {

  const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2JvaGJ5cWZjaHVyaGxzenR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODg0MDMsImV4cCI6MjA4NTM2NDQwM30.gKs1x9Y3s86D70uW207jilOYD4MZmk0rpUw6i1QRbaY";

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

  const user = loginUser.value;
  const pass = loginPass.value;

  const encontrado = usuarios.find(u =>
    u.usuario === user && u.senha === pass
  );

  if (!encontrado) {
    loginErro.textContent = "Usuário ou senha inválidos";
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

/* ================= STORAGE ================= */

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

.on("postgres_changes",{event:"*",schema:"public",table:"veiculos"},carregarDados)
.on("postgres_changes",{event:"*",schema:"public",table:"motoristas"},carregarDados)
.on("postgres_changes",{event:"*",schema:"public",table:"abastecimentos"},carregarDados)
.on("postgres_changes",{event:"*",schema:"public",table:"manutencoes"},carregarDados)

.subscribe();

/* ================= VARS ================= */

let grafV=null, grafM=null;
let aVeiculo,aMotorista,aPreco,aQuantidade,aTotal,aKmAtual2,aData,manVeiculo;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  verificarSessao();

  aVeiculo=$("aVeiculo");
  aMotorista=$("aMotorista");
  aPreco=$("aPreco");
  aQuantidade=$("aQuantidade");
  aTotal=$("aTotal");
  aKmAtual2=$("aKmAtual");
  aData=$("aData");
  manVeiculo=$("manVeiculo");

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

/* ================= CRUD ================= */

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

  const { error } = await db.from("veiculos").insert([registro]);

  if(error){
    alert("Erro ao salvar veículo");
    console.log(error);
    return;
  }

  await carregarDados();
};


window.salvarMotorista = async function () {

  const registro = {
    nome: mNome.value,
    cpf: mCpf.value,
    cnh: mCnh.value,
    telefone: mTelefone.value
  };

  const { error } = await db.from("motoristas").insert([registro]);

  if(error){
    alert("Erro ao salvar motorista");
    console.log(error);
    return;
  }

  await carregarDados();
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

  const { error } = await db.from("abastecimentos").insert([registro]);

  if(error){
    alert("Erro ao salvar abastecimento");
    console.log(error);
    return;
  }

  await carregarDados();
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

  const { error } = await db.from("manutencoes").insert([registro]);

  if(error){
    alert("Erro ao salvar manutenção");
    console.log(error);
    return;
  }

  await carregarDados();
};


/* ================= DASHBOARD ================= */

function atualizarDashboard() {

  if(!window.cVeiculos) return;

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;
  cManutencoes.textContent = manutencoes.length;

  totalCombustivel.textContent =
    abastecimentos.reduce((s,a)=>s+a.total,0)
    .toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

}

/* ================= TV MODE ================= */

function ativarModoTV(){

  const btn = document.getElementById("btnTV");
  if(!btn) return;

  btn.onclick = ()=>{

    document.body.classList.toggle("tv-mode");

    if(!document.fullscreenElement){
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }

  };

}

document.addEventListener("DOMContentLoaded", ativarModoTV);
function renderVeiculos(){

  if(!listaVeiculos) return;

  listaVeiculos.innerHTML = veiculos.map(v=>`
    <li>
      <b>${v.placa}</b> — ${v.marca} ${v.modelo} (${v.ano})
    </li>
  `).join("");

  if(aVeiculo){
    aVeiculo.innerHTML = 
      '<option value="">Selecione</option>' +
      veiculos.map(v=>`<option>${v.placa}</option>`).join("");
  }

  if(manVeiculo){
    manVeiculo.innerHTML = 
      '<option value="">Selecione</option>' +
      veiculos.map(v=>`<option>${v.placa}</option>`).join("");
  }

}
function renderMotoristas(){

  if(!listaMotoristas) return;

  listaMotoristas.innerHTML = motoristas.map(m=>`
    <li>
      <b>${m.nome}</b> — ${m.telefone || ""}
    </li>
  `).join("");

  if(aMotorista){
    aMotorista.innerHTML =
      '<option value="">Selecione</option>' +
      motoristas.map(m=>`<option>${m.nome}</option>`).join("");
  }

}
function renderAbastecimentos(){

  if(!listaAbastecimentos) return;

  listaAbastecimentos.innerHTML = abastecimentos.map(a=>`
    <tr>
      <td>${new Date(a.dataISO).toLocaleDateString()}</td>
      <td>${a.veiculo}</td>
      <td>${a.motorista}</td>
      <td>${a.litros}</td>
      <td>R$ ${a.total.toFixed(2)}</td>
      <td>${a.kmAtual}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  `).join("");

}
function renderManutencoes(){

  if(!listaManutencoes) return;

  listaManutencoes.innerHTML = manutencoes.map(m=>`
    <tr>
      <td>${new Date(m.dataISO).toLocaleDateString()}</td>
      <td>${m.veiculo}</td>
      <td>${m.categoria}</td>
      <td>${m.descricao || ""}</td>
      <td>R$ ${m.valor.toFixed(2)}</td>
    </tr>
  `).join("");

}
