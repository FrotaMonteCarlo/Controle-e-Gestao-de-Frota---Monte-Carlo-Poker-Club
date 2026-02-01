/* ================= SUPABASE ================= */

const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2JvaGJ5cWZjaHVyaGxzenR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODg0MDMsImV4cCI6MjA4NTM2NDQwM30.gKs1x9Y3s86D70uW207jilOYD4MZmk0rpUw6i1QRbaY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

/* ================= LOGIN ================= */

const usuarios =  [

  {usuario: "admin", senha: "201816.Ab", perfil: "admin", nome: "Administrador"}
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

  const { data: v } = await db.from("veiculos").select("*");
  const { data: m } = await db.from("motoristas").select("*");
  const { data: a } = await db.from("abastecimentos").select("*");

  veiculos = v || [];
  motoristas = m || [];
  abastecimentos = a || [];

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

  aVeiculo.innerHTML =
    `<option value="">Selecione</option>` +
    veiculos.map(v => `<option>${v.placa}</option>`).join("");
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

    const gasto = Number(a.total) || 0;
    const lit = Number(a.litros) || 0;
    const rodado = Number(a.kmRodado) || 0;

    total += gasto;
    litros += lit;
    km += rodado;

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
