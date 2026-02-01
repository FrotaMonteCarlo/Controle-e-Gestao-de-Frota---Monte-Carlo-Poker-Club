/* ================= SUPABASE ================= */

const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
const SUPABASE_KEY = "SUA_ANON_KEY_PUBLICA_AQUI";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);


/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);


/* ================= LOGIN ================= */

const usuarios = [
  { usuario: "admin", senha: "123456", perfil: "admin", nome: "Administrador" }
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
let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal, aKmAtual2, aKmAnterior, aKmRodado, aCustoKm, aData;

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
  aKmAtual2 = $("aKmAtual");
  aKmAnterior = $("aKmAnterior");
  aKmRodado = $("aKmRodado");
  aCustoKm = $("aCustoKm");
  aData = $("aData");

  aPreco?.addEventListener("input", calcularTotal);
  aQuantidade?.addEventListener("input", calcularTotal);
  aKmAtual2?.addEventListener("input", calcularKm);
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

  atualizarDashboard();
  atualizarBIExecutivo();
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


/* ================= ABASTECIMENTO ================= */

window.salvarAbastecimento = async function () {

  const preco = Number(aPreco.value);
  const litros = Number(aQuantidade.value);
  const kmAtual = Number(aKmAtual2.value);

  const { data } = await db
    .from("abastecimentos")
    .select("kmAtual")
    .eq("veiculo", aVeiculo.value)
    .order("created_at", { ascending: false })
    .limit(1);

  const kmAnterior = data?.[0]?.kmAtual || 0;

  const kmRodado = kmAtual - kmAnterior;
  const total = preco * litros;
  const custoKm = kmRodado > 0 ? total / kmRodado : 0;

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

  carregarDados();
};


/* ================= CALCULOS ================= */

function calcularTotal() {

  const preco = Number(aPreco.value) || 0;
  const litros = Number(aQuantidade.value) || 0;

  aTotal.value = (preco * litros).toFixed(2);
}

function calcularKm() {

  const atual = Number(aKmAtual2.value) || 0;
  const anterior = Number(aKmAnterior.value) || 0;

  const rodado = atual - anterior;

  if (rodado > 0) {

    aKmRodado.value = rodado;
    aCustoKm.value = (Number(aTotal.value) / rodado).toFixed(2);

  }
}


/* ================= RENDERS ================= */

function renderVeiculos() {

  if (!$("listaVeiculos")) return;

  listaVeiculos.innerHTML = veiculos.map(v =>
    `<li><b>${v.placa}</b> — ${v.marca} ${v.modelo}</li>`
  ).join("");

  aVeiculo.innerHTML =
    `<option value="">Selecione</option>` +
    veiculos.map(v => `<option>${v.placa}</option>`).join("");
}

function renderMotoristas() {

  if (!$("listaMotoristas")) return;

  listaMotoristas.innerHTML = motoristas.map(m =>
    `<li>${m.nome}</li>`
  ).join("");

  aMotorista.innerHTML =
    `<option value="">Selecione</option>` +
    motoristas.map(m => `<option>${m.nome}</option>`).join("");
}

function renderAbastecimentos() {

  if (!$("listaAbastecimentos")) return;

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

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;

  const total = abastecimentos.reduce((s, a) => s + a.total, 0);

  totalCombustivel.textContent =
    total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}


/* ================= BI EXECUTIVO ================= */

function atualizarBIExecutivo() {

  let total = 0;
  let litros = 0;
  let km = 0;

  abastecimentos.forEach(a => {

    total += Number(a.total);
    litros += Number(a.litros);
    km += Number(a.kmRodado);

  });

  biTotal.textContent = total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  biLitros.textContent = litros.toFixed(1);
  biKm.textContent = km.toFixed(0);

  biCustoKm.textContent =
    km > 0
      ? (total / km).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "R$ 0,00";
}
