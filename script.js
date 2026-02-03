let grafVeiculos = null;
let grafMotoristas = null;
let grafTopVeiculos = null;
let grafTopManutencao = null;


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
  { usuario: "admin", senha: "201816.Ab", perfil: "admin", nome: "Administrador" },
  { usuario: "consulta", senha: "123456", perfil: "consulta", nome: "Usuário Consulta" }
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

function isConsulta() {
  return usuarioLogado && usuarioLogado.perfil === "consulta";
}


// ===== ENTER PARA LOGIN =====

document.addEventListener("DOMContentLoaded", () => {

  const userInput = document.getElementById("loginUser");
  const passInput = document.getElementById("loginPass");

  if (!userInput || !passInput) return;

  function enterLogin(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      fazerLogin();
    }
  }

  userInput.addEventListener("keydown", enterLogin);
  passInput.addEventListener("keydown", enterLogin);

});


function verificarSessao() {

  if (!loginScreen || !appSistema) return;

  if (usuarioLogado) {

    // ===== BLOQUEIO PERFIL CONSULTA =====

if (usuarioLogado.perfil === "consulta") {

  // desativa todos botões de ação
  document.querySelectorAll("button").forEach(btn => {

    const texto = btn.innerText.toLowerCase();

    if (
      texto.includes("salvar") ||
      texto.includes("excluir") ||
      texto.includes("editar")
    ) {

      btn.disabled = true;
      btn.style.opacity = "0.5";
      btn.style.cursor = "not-allowed";

    }

  });

}

    loginScreen.style.display = "none";
    appSistema.style.display = "flex";

    nomeUsuario.textContent = usuarioLogado.nome;
    perfilUsuario.textContent = usuarioLogado.perfil.toUpperCase();

    // garante DOM visível antes de carregar dados
    setTimeout(() => {
      carregarDados();
      abrirPagina("dashboard");
      aplicarPermissoes();
    }, 100);

  } else {

    loginScreen.style.display = "flex";
    appSistema.style.display = "none";

  }
}

function aplicarPermissoes() {

  if (!usuarioLogado) return;

  // perfil consulta = somente leitura
  if (usuarioLogado.perfil === "consulta") {

    // Esconde botões de salvar
    document.querySelectorAll("button").forEach(btn => {

      const texto = btn.innerText.toLowerCase();

      if (
        texto.includes("salvar") ||
        texto.includes("excluir") ||
        texto.includes("editar") ||
        texto.includes("novo")
      ) {
        btn.style.display = "none";
      }

    });

    // Bloqueia inputs
    document.querySelectorAll("input, select, textarea").forEach(el => {
      el.disabled = true;
    });

    console.log("MODO CONSULTA ATIVADO");

  }

}


/* ================= MAP INPUTS ================= */

let vPlaca, vMarca, vModelo, vAno, vCategoria, vCor, vRenavan, vKmAtual, vKmOleo;
let mNome, mCpf, mCnh, mTelefone;
let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal, aKmAtual, aKmAnterior, aKmRodado, aCustoKm, aData;
let manVeiculo, manCategoria, manDescricao, manValor, manData;

function mapearInputs() {

  // ================= VEICULOS =================

  vPlaca = $("vPlaca");
  vMarca = $("vMarca");
  vModelo = $("vModelo");
  vAno = $("vAno");
  vCategoria = $("vCategoria");
  vCor = $("vCor");
  vRenavan = $("vRenavan");
  vKmAtual = $("vKmAtual");
  vKmOleo = $("vKmOleo");

  // ================= MOTORISTAS =================

  mNome = $("mNome");
  mCpf = $("mCpf");
  mCnh = $("mCnh");
  mTelefone = $("mTelefone");

  // ================= ABASTECIMENTO =================

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

  // ================= MANUTENÇÃO =================

  manVeiculo = $("manVeiculo");
  manCategoria = $("manCategoria");
  manDescricao = $("manDescricao");
  manValor = $("manValor");
  manData = $("manData");

  // ================= EVENTOS AUTOMÁTICOS =================

  if (aPreco) aPreco.addEventListener("input", calcularTotal);
  if (aQuantidade) aQuantidade.addEventListener("input", calcularTotal);
  if (aKmAtual) aKmAtual.addEventListener("input", calcularKm);
  if (aVeiculo) aVeiculo.addEventListener("change", buscarKmAnterior);

  console.log("MAPEAMENTO DE INPUTS CONCLUÍDO COM SUCESSO");



/* ================= MANUTENÇÃO ================= */

window.salvarManutencao = async function () {

if (isConsulta()) {
  alert("Usuário consulta não possui permissão para salvar");
  return;
}

  const registro = {
    veiculo: manVeiculo.value,
    categoria: manCategoria.value,
    descricao: manDescricao.value,
    valor: Number(manValor.value),
    data: manData.value
  };

  if (!registro.veiculo || !registro.categoria || !registro.valor || !registro.data) {
    alert("Preencha todos os campos obrigatórios da manutenção");
    return;
  }

  let res;

  // ===== SALVAR MANUTENÇÃO =====

  if (window.manutencaoEditando) {

    res = await db
      .from("manutencoes")
      .update(registro)
      .eq("id", window.manutencaoEditando);

    window.manutencaoEditando = null;

  } else {

    res = await db
      .from("manutencoes")
      .insert([registro]);
  }

  if (res.error) {
    console.error(res.error);
    alert("Erro ao salvar manutenção");
    return;
  }

  // ===== SE FOR TROCA DE ÓLEO → ATUALIZA VEÍCULO =====

  if (registro.categoria === "Troca de Óleo") {

    const veiculoAtual = veiculos.find(v => v.placa === registro.veiculo);

    if (veiculoAtual) {

      const kmAtual = Number(veiculoAtual.kmAtual || 0);

      await db
        .from("veiculos")
        .update({ kmOleo: kmAtual })
        .eq("placa", registro.veiculo);

      console.log("KM ÓLEO ATUALIZADO AUTOMATICAMENTE:", kmAtual);
    }
  }

  limparManutencao();
  carregarDados();

  alert("Manutenção salva com sucesso ✅");
};



function editarManutencao(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para editar");
  return;
}

  const m = manutencoes.find(item => item.id === id);

  if (!m) {
    alert("Registro de manutenção não encontrado");
    return;
  }

  // popula formulário
  manVeiculo.value = m.veiculo;
  manCategoria.value = m.categoria;
  manDescricao.value = m.descricao;
  manValor.value = m.valor;
  manData.value = m.data;

  window.manutencaoEditando = id;

  abrirPagina("manutencao");
}



async function excluirManutencao(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para excluir");
  return;
}

  if (!confirm("Deseja realmente excluir esta manutenção?")) return;

  console.log("Tentando excluir manutenção:", id);

  const { data, error } = await db
    .from("manutencoes")
    .delete()
    .match({ id: id })   // match é mais confiável que eq
    .select();           // força retorno real

  if (error) {
    console.error("ERRO DELETE MANUTENÇÃO:", error);
    alert("Erro ao excluir manutenção");
    return;
  }

  console.log("REMOVIDO DO BANCO:", data);

  carregarDados();
}


function limparManutencao() {

  manVeiculo.value = "";
  manCategoria.value = "";
  manDescricao.value = "";
  manValor.value = "";
  manData.value = "";

  window.manutencaoEditando = null;
}



/* ===== EXPORTAÇÃO GLOBAL (HTML ONCLICK) ===== */

window.salvarManutencao = salvarManutencao;
window.editarManutencao = editarManutencao;
window.excluirManutencao = excluirManutencao;


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

    const { data: m } = await db
  .from("motoristas")
  .select("id, nome, cpf, cnh, telefone");

const { data: v } = await db
  .from("veiculos")
  .select("*");

const { data: a } = await db
  .from("abastecimentos")
  .select("*");

const { data: man } = await db
  .from("manutencoes")
  .select("*");


    veiculos = v || [];
    motoristas = m || [];
    abastecimentos = a || [];
    manutencoes = man || [];

    renderVeiculos();
    renderMotoristas();
    renderAbastecimentos();
    renderManutencoes();
    verificarTrocaOleo();
    
    atualizarDashboard();
    if (typeof atualizarBIExecutivo === "function") atualizarBIExecutivo();
    renderAlertaTrocaOleo();

    // ===== BI =====
     atualizarRankingVeiculos();
     atualizarRankingMotoristas();
     atualizarRankingManutencao();

     // ===== GRÁFICOS =====
     setTimeout(() => {
     graficoVeiculos();
     graficoMotoristas();
    graficoTopVeiculos();
    graficoTopManutencao();
    }, 150);


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

function verificarTrocaOleo() {

  const alerta = $("alertaOleo");
  if (!alerta) return;

  const LIMITE_KM = 5000;

  const pendentes = veiculos.filter(v => {

    const atual = Number(v.kmAtual || 0);
    const ultimo = Number(v.kmOleo || 0);

    return (atual - ultimo) >= LIMITE_KM;
  });

  if (pendentes.length === 0) {

    alerta.className = "alerta-oleo alerta-ok";
    alerta.innerHTML = "✔ Nenhum veículo pendente";

  } else {

    alerta.className = "alerta-oleo alerta-warning";

    alerta.innerHTML =
      `⚠ ${pendentes.length} veículo(s) precisam trocar óleo:<br>` +
      pendentes.map(v =>
        `${v.placa} (${v.kmAtual - v.kmOleo} km)`
      ).join("<br>");
  }
}
verificarTrocaOleo();


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

function atualizarRankingVeiculos() {

  if (!window.rankingVeiculos) {
    window.rankingVeiculos = $("rankingVeiculos");
  }

  if (!rankingVeiculos) return;

  const mapa = {};

  abastecimentos.forEach(a => {

    const placa = a.veiculo;
    const total = Number(a.total || 0);
    const km = Number(a.kmRodado || 0);

    if (!mapa[placa]) mapa[placa] = { total: 0, km: 0 };

    mapa[placa].total += total;
    mapa[placa].km += km;
  });

  const lista = Object.entries(mapa)
    .sort((a, b) => b[1].total - a[1].total);

  rankingVeiculos.innerHTML = lista.map(([placa, d]) => `
    <tr>
      <td>${placa}</td>
      <td>R$ ${d.total.toFixed(2)}</td>
      <td>${d.km.toFixed(0)}</td>
    </tr>
  `).join("");
}

function atualizarRankingMotoristas() {

  if (!window.rankingMotoristas) {
    window.rankingMotoristas = $("rankingMotoristas");
  }

  if (!rankingMotoristas) return;

  const mapa = {};

  abastecimentos.forEach(a => {

    const nome = a.motorista;
    const total = Number(a.total || 0);

    mapa[nome] = (mapa[nome] || 0) + total;
  });

  const lista = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1]);

  rankingMotoristas.innerHTML = lista.map(([nome, total]) => `
    <tr>
      <td>${nome}</td>
      <td>R$ ${total.toFixed(2)}</td>
    </tr>
  `).join("");
}

function atualizarRankingManutencao() {

  if (!window.rankingManutencao) {
    window.rankingManutencao = $("rankingManutencao");
  }

  if (!rankingManutencao) return;

  const mapa = {};

  manutencoes.forEach(m => {

    const placa = m.veiculo;
    const valor = Number(m.valor || 0);

    mapa[placa] = (mapa[placa] || 0) + valor;
  });

  const lista = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1]);

  rankingManutencao.innerHTML = lista.map(([placa, total]) => `
    <tr>
      <td>${placa}</td>
      <td>R$ ${total.toFixed(2)}</td>
    </tr>
  `).join("");
}

function graficoVeiculos() {

  const canvas = document.getElementById("grafVeiculos");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    mapa[a.veiculo] = (mapa[a.veiculo] || 0) + Number(a.total || 0);
  });

  // destrói gráfico antigo corretamente
  if (grafVeiculos instanceof Chart) {
    grafVeiculos.destroy();
  }

  grafVeiculos = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        label: "Gasto por Veículo",
        data: Object.values(mapa)
      }]
    },
    options: {
      responsive: true
    }
  });
}


function graficoMotoristas() {

  const canvas = document.getElementById("grafMotoristas");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    mapa[a.motorista] = (mapa[a.motorista] || 0) + Number(a.total || 0);
  });

  if (grafMotoristas instanceof Chart) {
    grafMotoristas.destroy();
  }

  grafMotoristas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        label: "Gasto por Motorista",
        data: Object.values(mapa)
      }]
    },
    options: {
      responsive: true
    }
  });
}

function graficoTopVeiculos() {

  const canvas = document.getElementById("grafTopVeiculos");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    mapa[a.veiculo] = (mapa[a.veiculo] || 0) + Number(a.total || 0);
  });

  const top = Object.entries(mapa)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  if (grafTopVeiculos instanceof Chart) {
    grafTopVeiculos.destroy();
  }

  grafTopVeiculos = new Chart(canvas, {
    type: "pie",
    data: {
      labels: top.map(i => i[0]),
      datasets: [{
        data: top.map(i => i[1])
      }]
    }
  });
}


function graficoTopManutencao() {

  const canvas = document.getElementById("grafTopManutencao");
  if (!canvas) return;

  const mapa = {};

  manutencoes.forEach(m => {
    mapa[m.veiculo] = (mapa[m.veiculo] || 0) + Number(m.valor || 0);
  });

  const top = Object.entries(mapa)
    .sort((a,b)=>b[1]-a[1])
    .slice(0,5);

  if (grafTopManutencao instanceof Chart) {
    grafTopManutencao.destroy();
  }

  grafTopManutencao = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels: top.map(i => i[0]),
      datasets: [{
        data: top.map(i => i[1])
      }]
    }
  });
}


window.salvarMotorista = async function () {

if (isConsulta()) {
  alert("Usuário consulta não possui permissão para salvar");
  return;
}


  const registro = {
    nome: mNome.value,
    cpf: mCpf.value,
    cnh: mCnh.value,
    telefone: mTelefone.value
  };

  let res;

  if (window.motoristaEditando) {

    res = await db
      .from("motoristas")
      .update(registro)
      .eq("id", window.motoristaEditando);

    window.motoristaEditando = null;

  } else {

    res = await db
      .from("motoristas")
      .insert([registro]);
  }

  if (res.error) {
    console.error(res.error);
    alert("Erro ao salvar motorista");
    return;
  }

  limparMotorista();
  carregarDados();
};


function editarMotorista(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para editar");
  return;
}

  const m = motoristas.find(item => item.id === id);

  if (!m) {
    alert("Registro não encontrado");
    return;
  }

  mNome.value = m.nome;
  mCpf.value = m.cpf;
  mCnh.value = m.cnh;
  mTelefone.value = m.telefone;

  window.motoristaEditando = id;

  abrirPagina("motoristas");
}

async function excluirMotorista(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para excluir");
  return;
}

  if (!confirm("Deseja realmente excluir este motorista?")) return;

  console.log("Tentando excluir ID:", id);

  const { data, error } = await db
    .from("motoristas")
    .delete()
    .match({ id: id })   // match funciona melhor com UUID
    .select();           // força retorno real

  if (error) {
    console.error("ERRO DELETE:", error);
    alert("Erro ao excluir motorista");
    return;
  }

  console.log("REMOVIDO DO BANCO:", data);

  carregarDados();
}


function limparMotorista() {

  mNome.value = "";
  mCpf.value = "";
  mCnh.value = "";
  mTelefone.value = "";
}

/* ================= ABASTECIMENTO ================= */

window.salvarAbastecimento = async function () {

if (isConsulta()) {
  alert("Usuário consulta não possui permissão para salvar");
  return;
}

  const preco = Number(aPreco.value);
  const litros = Number(aQuantidade.value);

  const kmAnterior = Number(aKmAnterior.value);
  const kmAtual = Number(aKmAtual.value);

  if (!aVeiculo.value || !aMotorista.value || !aData.value) {
    alert("Preencha todos os campos do abastecimento");
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

  let error;

  // ===== EDITAR OU INSERIR =====

  if (window.abastecimentoEditando) {

    ({ error } = await db
      .from("abastecimentos")
      .update(registro)
      .eq("id", window.abastecimentoEditando));

    window.abastecimentoEditando = null;

  } else {

    ({ error } = await db
      .from("abastecimentos")
      .insert([registro]));
  }

  if (error) {
    console.error(error);
    alert("Erro ao salvar abastecimento");
    return;
  }

  limparAbastecimento();
  carregarDados();

  alert("Abastecimento salvo com sucesso ✅");
};


/* ================= VEÍCULOS ================= */

window.salvarVeiculo = async function () {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para salvar");
  return;
}

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

  // validação mínima
  if (!registro.placa || !registro.marca || !registro.modelo) {
    alert("Preencha Placa, Marca e Modelo");
    return;
  }

  let res;

  // ===== EDITAR =====
  if (window.veiculoEditando) {

    res = await db
      .from("veiculos")
      .update(registro)
      .eq("id", window.veiculoEditando);

    window.veiculoEditando = null;

  } else {

    // ===== INSERIR =====
    res = await db
      .from("veiculos")
      .insert([registro]);
  }

  if (res.error) {
    console.error(res.error);
    alert("Erro ao salvar veículo");
    return;
  }

  limparVeiculo();
  carregarDados();
};



function editarVeiculo(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para editar");
  return;
}

  const v = veiculos.find(item => item.id === id);

  if (!v) {
    alert("Veículo não encontrado");
    return;
  }

  // popula formulário
  vPlaca.value = v.placa;
  vMarca.value = v.marca;
  vModelo.value = v.modelo;
  vAno.value = v.ano;
  vCategoria.value = v.categoria;
  vCor.value = v.cor;
  vRenavan.value = v.renavan;
  vKmAtual.value = v.kmAtual;
  vKmOleo.value = v.kmOleo;

  window.veiculoEditando = id;

  abrirPagina("veiculos");
}



async function excluirVeiculo(id) {

if (isConsulta()) {
  alert("Usuário consulta não possui permissão para excluir");
  return;
}


  if (!confirm("Deseja realmente excluir este veículo?")) return;

  const { error } = await db
    .from("veiculos")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(error);
    alert("Erro ao excluir veículo");
    return;
  }

  carregarDados();
}



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

  window.veiculoEditando = null;
}



/* ===== EXPORTAÇÃO GLOBAL (HTML ONCLICK) ===== */

window.editarVeiculo = editarVeiculo;
window.excluirVeiculo = excluirVeiculo;
window.salvarVeiculo = salvarVeiculo;


/* ================= RENDERS ================= */

function renderVeiculos() {

  if (!listaVeiculos) return;

  // ===== TABELA VEÍCULOS =====

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

      <td>
        <button onclick="editarVeiculo('${v.id}')">✏️</button>
        <button onclick="excluirVeiculo('${v.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");



 // ===== SELECT ABASTECIMENTO =====

  if (aVeiculo) {

    aVeiculo.innerHTML =
      `<option value="">Selecione Veículo</option>` +
      veiculos.map(v =>
        `<option value="${v.placa}">${v.placa}</option>`
      ).join("");

  }

  // ===== SELECT MANUTENÇÃO =====

  if (manVeiculo) {

    manVeiculo.innerHTML =
      `<option value="">Selecione Veículo</option>` +
      veiculos.map(v =>
        `<option value="${v.placa}">${v.placa}</option>`
      ).join("");

  }

}


function renderMotoristas() {

  if (!listaMotoristas || !aMotorista) {
    console.warn("Lista ou select de motoristas não encontrado");
    return;
  }

  // ===== TABELA / EXTRATO =====
  listaMotoristas.innerHTML = motoristas.map(m => `
    <tr>
      <td>${m.nome}</td>
      <td>${m.cpf}</td>
      <td>${m.cnh}</td>
      <td>${m.telefone}</td>

      <td>
        <button onclick="editarMotorista('${m.id}')">✏️</button>
        <button onclick="excluirMotorista('${m.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");

  // ===== SELECT ABASTECIMENTO =====
  aMotorista.innerHTML =
    `<option value="">Selecione Motorista</option>` +
    motoristas.map(m =>
      `<option value="${m.nome}">${m.nome}</option>`
    ).join("");

  console.log("SELECT MOTORISTAS ATUALIZADO:", motoristas.length);
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
      <td>R$ ${Number(a.custoKm).toFixed(2)}</td>

      <td>
        <button onclick="editarAbastecimento('${a.id}')">✏️</button>
        <button onclick="excluirAbastecimento('${a.id}')">🗑️</button>
      </td>
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

      <td>
        <button onclick="editarManutencao('${m.id}')">✏️</button>
        <button onclick="excluirManutencao('${m.id}')">🗑️</button>
      </td>
    </tr>
  `).join("");
}

function renderAlertaTrocaOleo() {

  const box = document.getElementById("alertaOleo");
  if (!box) return;

  const lista = verificarTrocaOleo();
  const pendentes = lista.filter(v => v.status !== "OK");

  if (pendentes.length === 0) {
    box.innerHTML = "✅ Nenhum veículo pendente de troca de óleo";
    box.className = "alerta-ok";
    return;
  }

  box.className = "alerta-warning";

  box.innerHTML = `
    ⚠️ <strong>Alerta de Troca de Óleo</strong>
    <ul>
      ${pendentes.map(v => `
        <li>
          <strong>${v.placa}</strong> — ${v.kmRodado} km rodados
          (${v.status})
        </li>
      `).join("")}
    </ul>
  `;
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
async function excluirAbastecimento(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para excluir");
  return;
}

  if (!confirm("Excluir este abastecimento?")) return;

  const { error } = await db
    .from("abastecimentos")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro ao excluir abastecimento");
    console.error(error);
    return;
  }

  carregarDados();
}
function editarAbastecimento(id) {

  if (isConsulta()) {
  alert("Usuário consulta não possui permissão para editar");
  return;
}

  const a = abastecimentos.find(i => i.id === id);
  if (!a) return;

  aVeiculo.value = a.veiculo;
  aMotorista.value = a.motorista;
  aPreco.value = a.preco;
  aQuantidade.value = a.litros;
  aTotal.value = a.total;
  aKmAnterior.value = a.kmAnterior;
  aKmAtual.value = a.kmAtual;
  aKmRodado.value = a.kmRodado;
  aCustoKm.value = a.custoKm;
  aData.value = a.data;

  window.abastecimentoEditando = id;
}
/* ================= EXPORTA FUNÇÕES PARA HTML ================= */

// VEÍCULOS
window.editarVeiculo = editarVeiculo;
window.excluirVeiculo = excluirVeiculo;

// MOTORISTAS
window.editarMotorista = editarMotorista;
window.excluirMotorista = excluirMotorista;

// ABASTECIMENTO
window.editarAbastecimento = editarAbastecimento;
window.excluirAbastecimento = excluirAbastecimento;

// MANUTENÇÃO
window.editarManutencao = editarManutencao;
window.excluirManutencao = excluirManutencao;

function graficoVeiculos() {

  const canvas = document.getElementById("grafVeiculos");
  if (!canvas) return;

  // agrupa gasto por veículo
  const mapa = {};

  abastecimentos.forEach(a => {
    if (!mapa[a.veiculo]) mapa[a.veiculo] = 0;
    mapa[a.veiculo] += Number(a.total || 0);
  });

  const labels = Object.keys(mapa);
  const dados = Object.values(mapa);

  if (grafVeiculos instanceof Chart) {
    grafVeiculos.destroy();
  }

  grafVeiculos = new Chart(canvas, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Gasto por Veículo (R$)",
        data: dados,
        backgroundColor: "#d4af37"
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}
function graficoMotoristas() {

  const canvas = document.getElementById("grafMotoristas");
  if (!canvas) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    if (!mapa[a.motorista]) mapa[a.motorista] = 0;
    mapa[a.motorista] += Number(a.total || 0);
  });

  if (grafMotoristas instanceof Chart) {
    grafMotoristas.destroy();
  }

  grafMotoristas = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(mapa),
      datasets: [{
        data: Object.values(mapa),
        backgroundColor: [
          "#d4af37",
          "#1e293b",
          "#64748b",
          "#fbbf24"
        ]
      }]
    },
    options: {
      responsive: true
    }
  });
}
function atualizarRankingVeiculos() {

  const container = document.getElementById("rankingVeiculos");
  if (!container) return;

  const mapa = {};

  abastecimentos.forEach(a => {
    if (!mapa[a.veiculo]) mapa[a.veiculo] = 0;
    mapa[a.veiculo] += Number(a.total || 0);
  });

  const ranking = Object.entries(mapa)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  container.innerHTML = ranking.map(
    ([veiculo, total], i) => `
      <div>${i + 1}º ${veiculo} — 
        ${total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL"
        })}
      </div>
    `
  ).join("");
}
window.graficoVeiculos = graficoVeiculos;
window.graficoMotoristas = graficoMotoristas;
window.atualizarRankingVeiculos = atualizarRankingVeiculos;

// manutenção
window.editarManutencao = editarManutencao;
window.excluirManutencao = excluirManutencao;
function verificarTrocaOleo() {

  const LIMITE_ATENCAO = 8000;
  const LIMITE_CRITICO = 10000;

  const box = document.getElementById("alertaOleo");
  if (!box) return;

  let pendentesCritico = [];
  let pendentesAtencao = [];

  veiculos.forEach(v => {

    if (!v.kmOleo || !v.kmAtual) return;

    const rodado = v.kmAtual - v.kmOleo;

    if (rodado >= LIMITE_CRITICO) {

      pendentesCritico.push({
        placa: v.placa,
        km: rodado
      });

    } else if (rodado >= LIMITE_ATENCAO) {

      pendentesAtencao.push({
        placa: v.placa,
        km: rodado
      });

    }

  });

  // ===== PRIORIDADE CRÍTICA =====
  if (pendentesCritico.length > 0) {

    box.className = "alerta-oleo alerta-critico";

    box.innerHTML = `
      🔴 <strong>${pendentesCritico.length} veículos EM ATRASO na troca de óleo</strong><br>
      ${pendentesCritico.map(v => `${v.placa} — ${v.km} km`).join("<br>")}
    `;

    return;
  }

  // ===== ATENÇÃO =====
  if (pendentesAtencao.length > 0) {

    box.className = "alerta-oleo alerta-atencao";

    box.innerHTML = `
      🟡 <strong>${pendentesAtencao.length} veículos próximos da troca de óleo</strong><br>
      ${pendentesAtencao.map(v => `${v.placa} — ${v.km} km`).join("<br>")}
    `;

    return;
  }

  // ===== OK =====
  box.className = "alerta-oleo alerta-ok";
  box.innerHTML = "✔ Nenhum veículo pendente de troca de óleo";

}
