/* ================= SUPABASE ================= */

const SUPABASE_URL = "https://uxgbohbyqfchurhlsztt.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4Z2JvaGJ5cWZjaHVyaGxzenR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3ODg0MDMsImV4cCI6MjA4NTM2NDQwM30.gKs1x9Y3s86D70uW207jilOYD4MZmk0rpUw6i1QRbaY";

const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

/* ================= DATA ================= */

let veiculos = [];
let motoristas = [];
let abastecimentos = [];
let manutencoes = [];

let listaVeiculos;
let listaMotoristas;
let listaAbastecimentos;
let listaManutencoes;

let cVeiculos, cMotoristas, cAbastecimentos, totalCombustivel;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  mapearInputs();
  verificarSessao();

  document.querySelectorAll(".menu-link").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      abrirPagina(link.dataset.page);
    });
  });

});

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

    setTimeout(() => {
      carregarDados();
      abrirPagina("dashboard");
    }, 150);

  } else {

    loginScreen.style.display = "flex";
    appSistema.style.display = "none";
  }
}

/* ================= MAP INPUTS ================= */

let vPlaca, vMarca, vModelo, vAno, vCategoria, vCor, vRenavan, vKmAtual, vKmOleo;
let mNome, mCpf, mCnh, mTelefone;
let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal, aKmAtual, aKmAnterior, aKmRodado, aCustoKm, aData;
let manVeiculo, manCategoria, manDescricao, manValor, manData;

function mapearInputs() {

  // VEICULOS
  vPlaca = $("vPlaca");
  vMarca = $("vMarca");
  vModelo = $("vModelo");
  vAno = $("vAno");
  vCategoria = $("vCategoria");
  vCor = $("vCor");
  vRenavan = $("vRenavan");
  vKmAtual = $("vKmAtual");
  vKmOleo = $("vKmOleo");

  // MOTORISTAS
  mNome = $("mNome");
  mCpf = $("mCpf");
  mCnh = $("mCnh");
  mTelefone = $("mTelefone");

  // ABASTECIMENTO
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

  // MANUTENÇÃO
  manVeiculo = $("manVeiculo");
  manCategoria = $("manCategoria");
  manDescricao = $("manDescricao");
  manValor = $("manValor");
  manData = $("manData");

  // DASHBOARD
  cVeiculos = $("cVeiculos");
  cMotoristas = $("cMotoristas");
  cAbastecimentos = $("cAbastecimentos");
  totalCombustivel = $("totalCombustivel");

  // EXTRATOS
  listaVeiculos = $("listaVeiculos");
  listaMotoristas = $("listaMotoristas");
  listaAbastecimentos = $("listaAbastecimentos");
  listaManutencoes = $("listaManutencoes");

  // EVENTOS
  aPreco?.addEventListener("input", calcularTotal);
  aQuantidade?.addEventListener("input", calcularTotal);
  aKmAtual?.addEventListener("input", calcularKm);
  aVeiculo?.addEventListener("change", buscarKmAnterior);

}

/* ================= SPA ================= */

function abrirPagina(id) {

  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  document.querySelectorAll(".menu-link").forEach(a => a.classList.remove("active"));

  const page = document.getElementById(id);
  const link = document.querySelector(`[data-page="${id}"]`);

  if (page) page.classList.remove("hidden");
  if (link) link.classList.add("active");
}

/* ================= LOAD ================= */

async function carregarDados() {

  try {

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
    if (typeof atualizarBIExecutivo === "function") atualizarBIExecutivo();


    console.log("TELA ATUALIZADA COM SUCESSO");

  } catch (erro) {
    console.error("ERRO carregarDados:", erro);
  }
}

/* ================= DASHBOARD ================= */

function atualizarDashboard() {

  if (!cVeiculos) return;

  cVeiculos.textContent = veiculos.length;
  cMotoristas.textContent = motoristas.length;
  cAbastecimentos.textContent = abastecimentos.length;

  let total = 0;

  abastecimentos.forEach(a => {
    total += Number(a.total || 0);
  });

  totalCombustivel.textContent =
    total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });
}



/* ================= BI EXECUTIVO ================= */

function atualizarBIExecutivo() {

  if (!window.biTotal ||
      !window.biLitros ||
      !window.biKm ||
      !window.biCustoKm) {

    // mapeia se ainda não estiver ligado
    window.biTotal = $("biTotal");
    window.biLitros = $("biLitros");
    window.biKm = $("biKm");
    window.biCustoKm = $("biCustoKm");
  }

  if (!biTotal) return;

  let total = 0;
  let litros = 0;
  let km = 0;

  abastecimentos.forEach(a => {

    const gasto = Number(a.total || 0);
    const lit = Number(a.litros || 0);
    const rodado = Number(a.kmRodado || 0);

    total += gasto;
    litros += lit;

    if (rodado > 0) km += rodado;
  });

  biTotal.textContent =
    total.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

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

window.salvarMotorista = async function () {

  const registro = {
    nome: mNome.value,
    cpf: mCpf.value,
    cnh: mCnh.value,
    telefone: mTelefone.value
  };

  let error;

  if (window.motoristaEditando) {

    ({ error } = await db
      .from("motoristas")
      .update(registro)
      .eq("id", window.motoristaEditando));

    window.motoristaEditando = null;

  } else {

    ({ error } = await db
      .from("motoristas")
      .insert([registro]));
  }

  if (error) {
    alert("Erro ao salvar motorista");
    return;
  }

  limparMotorista();
  carregarDados();
};
function editarMotorista(id) {

  const m = motoristas.find(m => m.id === id);
  if (!m) return;

  mNome.value = m.nome;
  mCpf.value = m.cpf;
  mCnh.value = m.cnh;
  mTelefone.value = m.telefone;

  // ativa modo edição
  window.motoristaEditando = id;

  abrirPagina("motoristas");
}
async function excluirMotorista(id) {

  if (!confirm("Deseja excluir este motorista?")) return;

  const { error } = await db
    .from("motoristas")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir motorista");
    console.error(error);
    return;
  }

  carregarDados();
}
function limparMotorista() {

  mNome.value = "";
  mCpf.value = "";
  mCnh.value = "";
  mTelefone.value = "";
}

/* ================= RENDERS ================= */

function renderVeiculos() {

  if (!listaVeiculos) return;

  listaVeiculos.innerHTML = veiculos.map(v => `
    <tr>
      <td>${v.placa}</td>
      <td>${v.marca}</td>
      <td>${v.modelo}</td>
      <td>${v.ano}</td>
      <td>${v.categoria}</td>
      <td>${v.cor}</td>
      <td>${v.renavan}</td>
      <td>${v.kmAtual}</td>
      <td>${v.kmOleo}</td>
    </tr>
  `).join("");

  if (aVeiculo) {
    aVeiculo.innerHTML =
      `<option value="">Selecione</option>` +
      veiculos.map(v => `<option>${v.placa}</option>`).join("");
  }

  if (manVeiculo) {
    manVeiculo.innerHTML =
      `<option value="">Selecione</option>` +
      veiculos.map(v => `<option>${v.placa}</option>`).join("");
  }
}

function renderMotoristas() {

  if (!window.listaMotoristas) return;

  listaMotoristas.innerHTML = motoristas.map(m => `
    <tr>
      <td>${m.nome}</td>
      <td>${m.cpf}</td>
      <td>${m.cnh}</td>
      <td>${m.telefone}</td>

      <td>
        <button onclick="editarMotorista('${m.id}')" class="btn-edit">✏</button>
        <button onclick="excluirMotorista('${m.id}')" class="btn-delete">🗑</button>
      </td>
    </tr>
  `).join("");
}


function renderAbastecimentos() {

  if (!listaAbastecimentos) return;

  listaAbastecimentos.innerHTML = abastecimentos.map(a => `
    <tr>
      <td>${new Date(a.data).toLocaleDateString()}</td>
      <td>${a.veiculo}</td>
      <td>${a.motorista}</td>
      <td>${a.litros}</td>
      <td>R$ ${Number(a.total).toFixed(2)}</td>
      <td>${a.kmRodado}</td>
      <td>${Number(a.custoKm).toFixed(2)}</td>
    </tr>
  `).join("");
}

function renderManutencoes() {

  if (!listaManutencoes) return;

  listaManutencoes.innerHTML = manutencoes.map(m => `
    <tr>
      <td>${new Date(m.data).toLocaleDateString()}</td>
      <td>${m.veiculo}</td>
      <td>${m.categoria}</td>
      <td>${m.descricao || ""}</td>
      <td>R$ ${Number(m.valor).toFixed(2)}</td>
    </tr>
  `).join("");
}

/* ================= CALCULOS ================= */

function calcularTotal() {

  if (!aPreco || !aQuantidade || !aTotal) return;

  const preco = Number(aPreco.value) || 0;
  const litros = Number(aQuantidade.value) || 0;

  aTotal.value = (preco * litros).toFixed(2);
}

function calcularKm() {

  if (!aKmAtual || !aKmAnterior) return;

  const atual = Number(aKmAtual.value) || 0;
  const anterior = Number(aKmAnterior.value) || 0;

  const rodado = atual - anterior;

  if (rodado > 0) {
    aKmRodado.value = rodado;
    aCustoKm.value = (Number(aTotal.value || 0) / rodado).toFixed(2);
  }
}

/* ================= KM AUTO ================= */

function buscarKmAnterior() {

  if (!aVeiculo || !aKmAnterior) return;

  const placa = aVeiculo.value;
  if (!placa) return;

  db.from("abastecimentos")
    .select("kmAtual")
    .eq("veiculo", placa)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
    .then(({ data }) => {

      if (data?.kmAtual) {
        aKmAnterior.value = data.kmAtual;
        return;
      }

      return db.from("veiculos")
        .select("kmAtual")
        .eq("placa", placa)
        .maybeSingle();
    })
    .then(res => {
      aKmAnterior.value = res?.data?.kmAtual || 0;
    });
}
