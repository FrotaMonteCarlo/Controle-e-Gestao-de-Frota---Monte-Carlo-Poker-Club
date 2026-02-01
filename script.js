/* ================= SUPABASE INIT ================= */

const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2JvaGJ5cWZjaHVyaGxzenR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODg0MDMsImV4cCI6MjA4NTM2NDQwM30.gKs1x9Y3s86D70uW207jilOYD4MZmk0rpUw6i1QRbaY"; // mantenha anon public

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* ================= LOGIN LOCAL ================= */

const usuarios = [
  { usuario: "admin", senha: "123456", perfil: "admin", nome: "Administrador" }
];

let usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));


/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);


/* ================= SESSION ================= */

function verificarSessao() {

  const login = $("loginScreen");
  const app = $("appSistema");

  if (!login || !app) return;

  if (usuarioLogado) {
    login.style.display = "none";
    app.style.display = "flex";
    $("nomeUsuario").textContent = usuarioLogado.nome;
    $("perfilUsuario").textContent = usuarioLogado.perfil.toUpperCase();
  } else {
    login.style.display = "flex";
    app.style.display = "none";
  }

}


/* ================= LOGIN ================= */

window.fazerLogin = function () {

  const u = loginUser.value;
  const s = loginPass.value;

  const ok = usuarios.find(x => x.usuario === u && x.senha === s);

  if (!ok) {
    loginErro.textContent = "Usuário ou senha inválidos";
    return;
  }

  usuarioLogado = ok;
  localStorage.setItem("usuarioLogado", JSON.stringify(ok));

  verificarSessao();
};


/* ================= LOGOUT ================= */

window.logoutSistema = function () {

  if (!confirm("Deseja sair?")) return;

  localStorage.removeItem("usuarioLogado");
  usuarioLogado = null;
  verificarSessao();

};


/* ================= DATA ================= */

let veiculos = [];
let motoristas = [];
let abastecimentos = [];
let manutencoes = [];


/* ================= LOAD ================= */

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
  atualizarBIExecutivo(); 
}



/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

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


/* ================= SPA ================= */

function abrirPagina(id) {

  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".menu a").forEach(a => a.classList.remove("active"));

  const page = $(id);
  const btn = document.querySelector(`[data-page="${id}"]`);

  if (page) page.classList.remove("hidden");
  if (btn) btn.classList.add("active");

}


/* ================= SALVAR VEÍCULO ================= */

window.salvarAbastecimento = async function () {

  const registro = {

    veiculo: aVeiculo.value,
    motorista: aMotorista.value,

    preco: Number(aPreco.value),
    litros: Number(aQuantidade.value),
    total: Number(aTotal.value),

    kmAnterior: Number(aKmAnterior.value),
    kmAtual: Number(aKmAtual2.value),
    kmRodado: Number(aKmRodado.value),
    custoKm: Number(aCustoKm.value),

    // IMPORTANTE: usa "data" (igual ao banco)
    data: aData.value
  };

  const { error } = await db
    .from("abastecimentos")
    .insert([registro]);

  if (error) {

    console.error("ERRO SUPABASE:", error);
    alert("Erro ao salvar abastecimento ❌");
    return;

  }

  alert("Abastecimento salvo com sucesso ✅");

  carregarDados();

};


/* ================= SALVAR MOTORISTA ================= */

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


/* ================= SALVAR ABASTECIMENTO ================= */

window.salvarAbastecimento = async function () {

  const registro = {
    veiculo: aVeiculo.value,
    motorista: aMotorista.value,
    preco: Number(aPreco.value),
    litros: Number(aQuantidade.value),
    total: Number(aTotal.value),
    kmAtual: Number(aKmAtual.value),
    data: aData.value

  };

  const { error } = await db.from("abastecimentos").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar abastecimento");
    return;
  }

  carregarDados();
};


/* ================= SALVAR MANUTENÇÃO ================= */

window.salvarManutencao = async function () {

  const registro = {
    veiculo: manVeiculo.value,
    categoria: manCategoria.value,
    descricao: manTipo.value,
    valor: Number(manValor.value),
    dataISO: manData.value || new Date().toISOString()
  };

  const { error } = await db.from("manutencoes").insert([registro]);

  if (error) {
    console.error(error);
    alert("Erro ao salvar manutenção");
    return;
  }

  carregarDados();
};


/* ================= DASHBOARD ================= */

function atualizarDashboard() {

  if (!$("cVeiculos")) return;

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;
  cManutencoes.textContent = manutencoes.length;

  const total = abastecimentos.reduce((s, a) => s + (a.total || 0), 0);

  totalCombustivel.textContent =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

}


/* ================= RENDERS ================= */

function renderVeiculos() {

  if (!$("listaVeiculos")) return;

  listaVeiculos.innerHTML = veiculos.map(v => `
    <li>
      <b>${v.placa}</b> — ${v.marca} ${v.modelo}
    </li>
  `).join("");

  if ($("aVeiculo")) {
    aVeiculo.innerHTML =
      `<option value="">Selecione</option>` +
      veiculos.map(v => `<option>${v.placa}</option>`).join("");
  }

  if ($("manVeiculo")) {
    manVeiculo.innerHTML =
      `<option value="">Selecione</option>` +
      veiculos.map(v => `<option>${v.placa}</option>`).join("");
  }

}


function renderMotoristas() {

  if (!$("listaMotoristas")) return;

  listaMotoristas.innerHTML = motoristas.map(m => `
    <li>${m.nome}</li>
  `).join("");

  if ($("aMotorista")) {
    aMotorista.innerHTML =
      `<option value="">Selecione</option>` +
      motoristas.map(m => `<option>${m.nome}</option>`).join("");
  }

}


function renderAbastecimentos() {

  if (!$("listaAbastecimentos")) return;

  listaAbastecimentos.innerHTML = abastecimentos.map(a => `
    <tr>
      <td>${new Date(a.dataISO).toLocaleDateString()}</td>
      <td>${a.veiculo}</td>
      <td>${a.motorista}</td>
      <td>${a.litros}</td>
      <td>R$ ${a.total}</td>
      <td>${a.kmAtual}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  `).join("");

}


function renderManutencoes() {

  if (!$("listaManutencoes")) return;

  listaManutencoes.innerHTML = manutencoes.map(m => `
    <tr>
      <td>${new Date(m.dataISO).toLocaleDateString()}</td>
      <td>${m.veiculo}</td>
      <td>${m.categoria}</td>
      <td>${m.descricao || ""}</td>
      <td>R$ ${m.valor}</td>
    </tr>
  `).join("");

}


/* ================= LIMPAR FORM ================= */

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
/* ================= ABASTECIMENTO AUTO CALC ================= */

function calcularTotal() {

  const preco = Number(aPreco.value) || 0;
  const litros = Number(aQuantidade.value) || 0;

  const total = preco * litros;

  aTotal.value = total.toFixed(2);

}

function calcularKm() {

  const atual = Number(aKmAtual.value) || 0;
  const anterior = Number(aKmAnterior.value) || 0;

  const rodado = atual - anterior;

  if (rodado > 0) {

    aKmRodado.value = rodado;

    const custoKm = Number(aTotal.value) / rodado;

    aCustoKm.value = custoKm.toFixed(2);

  }

}


/* ================= EVENTOS ================= */

aPreco?.addEventListener("input", calcularTotal);
aQuantidade?.addEventListener("input", calcularTotal);
aKmAtual?.addEventListener("input", calcularKm);
aVeiculo?.addEventListener("change", async () => {

  const placa = aVeiculo.value;

  if (!placa) return;

  // tenta pegar ultimo abastecimento
  const { data } = await db
    .from("abastecimentos")
    .select("kmAtual")
    .eq("veiculo", placa)
    .order("created_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {

    aKmAnterior.value = data[0].kmAtual;
    return;

  }

  // se não tiver abastecimento pega km do cadastro do veículo
  const { data: v } = await db
    .from("veiculos")
    .select("kmAtual")
    .eq("placa", placa)
    .single();

  if (v) {
    aKmAnterior.value = v.kmAtual;
  }

});
function atualizarBIExecutivo(){

  if(!window.biTotal) return;

  let total = 0;
  let litros = 0;
  let km = 0;

  abastecimentos.forEach(a=>{

    total += Number(a.total || 0);
    litros += Number(a.litros || 0);

    if(a.kmAtual){
      km += Number(a.kmAtual);
    }

  });

  biTotal.textContent = total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  biLitros.textContent = litros.toFixed(1);
  biKm.textContent = km;

  const custoKm = km > 0 ? total / km : 0;
  biCustoKm.textContent = custoKm.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

}
