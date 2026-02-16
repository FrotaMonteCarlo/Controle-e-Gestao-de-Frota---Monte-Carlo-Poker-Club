function logout(){
  sessionStorage.removeItem("usuarioLogado");
  location.href = "index.html";
}

/* ================= LOGIN ================= */

const usuarios = [
  {user:"admin", senha:"201816.Ab", perfil:"ADMIN"},
  {user:"consulta", senha:"123456", perfil:"CONSULTA"}
];

let usuarioLogado = JSON.parse(sessionStorage.getItem("usuarioLogado"));

function loginSistema(user, senha){

  const u = usuarios.find(x=>x.user===user && x.senha===senha);

  if(!u){
    alert("Usuário inválido");
    return false;
  }

  sessionStorage.setItem("usuarioLogado", JSON.stringify(u));
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  if(usuario){
    const nome = document.getElementById("nomeUsuario");
    const perfil = document.getElementById("perfilUsuario");

    if(nome) nome.textContent = usuario.user;
    if(perfil) perfil.textContent = usuario.perfil;
  }

});


/* ================= REGISTRO GLOBAL ================= */

let grafV = null;
let grafM = null;
let grafTopVeiculos = null;

let aVeiculo, aMotorista, aPreco, aQuantidade, aTotal;
let aKmAnterior, aKmAtual2, aKmRodado, aCustoKm, aData;

/* ================= HELPERS ================= */

const $ = id => document.getElementById(id);

/* ================= STORAGE ================= */

let veiculos = JSON.parse(localStorage.getItem("veiculos")) || [];
let motoristas = JSON.parse(localStorage.getItem("motoristas")) || [];
let abastecimentos = JSON.parse(localStorage.getItem("abastecimentos")) || [];
let manutencoes = JSON.parse(localStorage.getItem("manutencoes")) || [];

/* ================= CONTROLE ================= */

let editVeiculo = null;
let editMotorista = null;
let editAbastecimento = null;

/* ================= INIT ================= */

document.addEventListener("DOMContentLoaded", () => {

  aVeiculo = $("aVeiculo");
  aMotorista = $("aMotorista");
  aPreco = $("aPreco");
  aQuantidade = $("aQuantidade");
  aTotal = $("aTotal");
  aKmAnterior = $("aKmAnterior");
  aKmAtual2 = $("aKmAtual");
  aKmRodado = $("aKmRodado");
  aCustoKm = $("aCustoKm");
  aData = $("aData");

  renderVeiculos();
  renderMotoristas();
  renderAbastecimentos();
  atualizarDashboard();
  atualizarBIExecutivo();

  abrirPagina("dashboard");

  ["filtroVeiculo","filtroMotorista","filtroInicio","filtroFim"]
  .forEach(id=>{
    const el=$(id);
    if(el) el.addEventListener("change",renderAbastecimentos);
  });

  if(aVeiculo){
    aVeiculo.addEventListener("change", atualizarKmAnterior);
  }

  [aPreco, aQuantidade, aKmAtual2].forEach(el=>{
    if(el) el.addEventListener("input", calcularAbastecimento);
  });

});

/* ================= SPA ================= */

function abrirPagina(id){

  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.querySelectorAll(".menu a").forEach(a=>a.classList.remove("active"));

  const page=$(id);
  const link=document.querySelector(`[data-page="${id}"]`);

  if(page) page.classList.remove("hidden");
  if(link) link.classList.add("active");

  atualizarDashboard();

  if(id==="abastecimento"){
    setTimeout(atualizarKmAnterior,50);
  }
}

document.querySelectorAll(".menu a").forEach(link=>{
  link.onclick=e=>{
    e.preventDefault();
    abrirPagina(link.dataset.page);
  };
});

/* ================= VEÍCULOS ================= */

window.salvarVeiculo=function(){

  const registro={
    placa:vPlaca.value,
    marca:vMarca.value,
    modelo:vModelo.value,
    ano:vAno.value,
    categoria:vCategoria.value,
    cor:vCor.value,
    renavan:vRenavan.value,
    kmAtual:Number(vKmAtual.value)||0,
    kmOleo:Number(vKmOleo.value)||0
  };

  editVeiculo!==null
  ? veiculos[editVeiculo]=registro
  : veiculos.push(registro);

  editVeiculo=null;

  localStorage.setItem("veiculos",JSON.stringify(veiculos));

  renderVeiculos();
  atualizarDashboard();
};

function renderVeiculos(){

  $("filtroVeiculo").innerHTML =
  `<option value="">Todos Veículos</option>` +
  veiculos.map(v=>`<option>${v.placa}</option>`).join("");

  listaVeiculos.innerHTML = veiculos.map((v,i)=>`
  <li class="registro-card">
    <div class="registro-info">
      <strong>${v.placa}</strong> — ${v.marca} ${v.modelo} (${v.ano})<br>
      KM Atual: ${v.kmAtual} | Óleo: ${v.kmOleo}
    </div>
    <div class="registro-acoes">
      <button class="btn-mini" onclick="editarVeiculo(${i})">Editar</button>
      <button class="btn-mini danger" onclick="excluirVeiculo(${i})">Excluir</button>
    </div>
  </li>`).join("");

  const options=veiculos.map(v=>`<option value="${v.placa}">${v.placa}</option>`).join("");

  if(aVeiculo) aVeiculo.innerHTML=options;
  if(manVeiculo) manVeiculo.innerHTML=options;

}
/* ================= EDITAR VEÍCULO ================= */

window.editarVeiculo = function(index){

  const v = veiculos[index];
  if(!v) return;

  editVeiculo = index;

  vPlaca.value = v.placa;
  vMarca.value = v.marca;
  vModelo.value = v.modelo;
  vAno.value = v.ano;
  vCategoria.value = v.categoria;
  vCor.value = v.cor;
  vRenavan.value = v.renavan;
  vKmAtual.value = v.kmAtual;
  vKmOleo.value = v.kmOleo;

  abrirPagina("veiculos");
};

/* ================= EXCLUIR VEÍCULO ================= */

window.excluirVeiculo = function(index){

  if(!confirm("Deseja realmente excluir este veículo?")) return;

  veiculos.splice(index,1);

  localStorage.setItem("veiculos",
    JSON.stringify(veiculos)
  );

  renderVeiculos();
  atualizarDashboard();
  atualizarBIExecutivo();

};

/* ================= MOTORISTAS ================= */

window.salvarMotorista=function(){

  const registro={
    nome:mNome.value,
    cpf:mCpf.value,
    cnh:mCnh.value,
    telefone:mTelefone.value
  };

  editMotorista!==null
  ? motoristas[editMotorista]=registro
  : motoristas.push(registro);

  editMotorista=null;

  localStorage.setItem("motoristas",JSON.stringify(motoristas));

  renderMotoristas();
  atualizarDashboard();
};

function renderMotoristas(){

  $("filtroMotorista").innerHTML =
    `<option value="">Todos Motoristas</option>` +
    motoristas.map(m=>`<option>${m.nome}</option>`).join("");

  listaMotoristas.innerHTML = motoristas.map((m,i)=>`
    <li class="registro-card">

      <div class="registro-info">
        <strong>${m.nome}</strong><br>

        <span><b>CPF:</b> ${m.cpf || "-"}</span><br>
        <span><b>CNH:</b> ${m.cnh || "-"}</span><br>
        <span><b>Telefone:</b> ${m.telefone || "-"}</span>
      </div>

      <div class="registro-acoes">
        <button class="btn-mini" onclick="editarMotorista(${i})">Editar</button>
        <button class="btn-mini danger" onclick="excluirMotorista(${i})">Excluir</button>
      </div>

    </li>
  `).join("");

  /* Atualiza select do abastecimento */

  if(aMotorista){
    aMotorista.innerHTML =
      `<option value="">Selecione Motorista</option>` +
      motoristas.map(m=>`<option>${m.nome}</option>`).join("");
  }
}

/* ================= ABASTECIMENTO ================= */

function obterKmAnterior(placa){

  if(!placa) return 0;

  const hist = abastecimentos
  .filter(a=>a.veiculo===placa)
  .sort((a,b)=>new Date(b.dataISO)-new Date(a.dataISO));

  if(hist.length) return Number(hist[0].kmAtual)||0;

  const v=veiculos.find(v=>v.placa===placa);
  return v?Number(v.kmAtual):0;
}

function atualizarKmAnterior(){

  if(!aVeiculo||!aKmAnterior) return;

  const km=obterKmAnterior(aVeiculo.value);

  aKmAnterior.value=km;

  calcularAbastecimento();
}

function calcularAbastecimento(){

  const preco=Number(aPreco.value)||0;
  const litros=Number(aQuantidade.value)||0;
  const kmAnterior=Number(aKmAnterior.value)||0;
  const kmAtual=Number(aKmAtual2.value)||0;

  const total=preco*litros;
  const kmRodado=kmAtual-kmAnterior;
  const custoKm=kmRodado>0?total/kmRodado:0;

  aTotal.value=total.toFixed(2);
  aKmRodado.value=kmRodado>0?kmRodado:0;
  aCustoKm.value=custoKm.toFixed(2);
}

window.salvarAbastecimento=function(){

  calcularAbastecimento();

  const registro={
    veiculo:aVeiculo.value,
    motorista:aMotorista.value,
    preco:Number(aPreco.value)||0,
    litros:Number(aQuantidade.value)||0,
    total:Number(aTotal.value)||0,
    kmAnterior:Number(aKmAnterior.value)||0,
    kmAtual:Number(aKmAtual2.value)||0,
    kmRodado:Number(aKmRodado.value)||0,
    custoKm:Number(aCustoKm.value)||0,
    data:aData.value||new Date().toLocaleDateString("pt-BR"),
    dataISO:new Date().toISOString()
  };

  editAbastecimento!==null
  ? abastecimentos[editAbastecimento]=registro
  : abastecimentos.push(registro);

  editAbastecimento=null;

  localStorage.setItem("abastecimentos",JSON.stringify(abastecimentos));

  renderAbastecimentos();
  atualizarDashboard();
};

function renderAbastecimentos(){

  let total=0, litros=0, km=0;

  listaAbastecimentos.innerHTML=abastecimentos.map((a,i)=>{

    total+=a.total||0;
    litros+=a.litros||0;
    km+=a.kmRodado||0;

    return `
    <tr>
      <td>${a.data}</td>
      <td>${a.veiculo}</td>
      <td>${a.motorista}</td>
      <td>${a.litros}</td>
      <td>${a.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
      <td>${a.kmRodado}</td>
      <td>R$ ${a.custoKm.toFixed(2)}</td>
      <td>
        <button class="btn-mini" onclick="editarAbastecimento(${i})">Editar</button>
        <button class="btn-mini danger" onclick="excluirAbastecimento(${i})">Excluir</button>
      </td>
    </tr>`;
  }).join("");

  $("resumoTotal").textContent=total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
  $("resumoLitros").textContent=litros.toFixed(2);
  $("resumoKm").textContent=km;
  $("resumoCustoKm").textContent=km>0?(total/km).toLocaleString("pt-BR",{style:"currency",currency:"BRL"}):"R$ 0,00";
}

/* ================= DASHBOARD ================= */

function atualizarDashboard(){

  cVeiculos.textContent=veiculos.length;
  cMotoristas.textContent=motoristas.length;
  cAbastecimentos.textContent=abastecimentos.length;
  cManutencoes.textContent=manutencoes.length;

  totalCombustivel.textContent=
  abastecimentos.reduce((s,a)=>s+a.total,0)
  .toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  atualizarGraficos();
  atualizarAlertas();
  calcularBIComparativo();
}

/* ================= GRÁFICOS ================= */

function atualizarGraficos(){

  const cv=$("grafVeiculos");
  const cm=$("grafMotoristas");

  if(!cv||!cm) return;

  const pv={}, pm={};

  abastecimentos.forEach(a=>{
    pv[a.veiculo]=(pv[a.veiculo]||0)+a.total;
    pm[a.motorista]=(pm[a.motorista]||0)+a.total;
  });

  if(grafV) grafV.destroy();
  if(grafM) grafM.destroy();

  grafV=new Chart(cv,{
    type:"bar",
    data:{labels:Object.keys(pv),datasets:[{
      label:"Consumo (R$)",
      data:Object.values(pv),
      borderRadius:6
    }]},
    options:{plugins:{legend:{display:false}}}
  });

  grafM=new Chart(cm,{
    type:"doughnut",
    data:{labels:Object.keys(pm),datasets:[{
      label:"Consumo (R$)",
      data:Object.values(pm)
    }]},
    options:{plugins:{legend:{position:"bottom"}}}
  });

}

/* ================= ALERTAS ================= */

function atualizarAlertas(){

  const painel=$("alertaOleo");
  if(!painel) return;

  let alertas=[];

  veiculos.forEach(v=>{
    const rodado=(v.kmAtual||0)-(v.kmOleo||0);
    if(rodado>=9000) alertas.push(`🛢️ ${v.placa} troca de óleo vencida`);
  });

  if(alertas.length===0){
    painel.className="alerta-oleo alerta-ok";
    painel.innerHTML="✔ Nenhum alerta ativo";
  }else{
    painel.className="alerta-oleo alerta-warning";
    painel.innerHTML="<strong>⚠ ALERTAS</strong><br>"+alertas.join("<br>");
  }

}

/* ================= BI EXECUTIVO ================= */

function atualizarBIExecutivo(){

  let total = 0;
  let litros = 0;
  let km = 0;

  const porVeiculo = {};
  const porMotorista = {};

  abastecimentos.forEach(a=>{

    total += a.total || 0;
    litros += a.litros || 0;
    km += a.kmRodado || 0;

    /* ===== AGRUPA POR VEÍCULO ===== */

    if(!porVeiculo[a.veiculo]){
      porVeiculo[a.veiculo] = { total:0, km:0 };
    }

    porVeiculo[a.veiculo].total += a.total || 0;
    porVeiculo[a.veiculo].km += a.kmRodado || 0;

    /* ===== AGRUPA POR MOTORISTA ===== */

    if(a.motorista && a.motorista.trim() !== ""){

      if(!porMotorista[a.motorista]){
        porMotorista[a.motorista] = { total:0, km:0 };
      }

      porMotorista[a.motorista].total += a.total || 0;
      porMotorista[a.motorista].km += a.kmRodado || 0;

    }

  });

  /* ===== KPIs ===== */

  $("biTotal").textContent =
    total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});

  $("biLitros").textContent = litros.toFixed(2);
  $("biKm").textContent = km;

  $("biCustoKm").textContent =
    km > 0
    ? (total/km).toLocaleString("pt-BR",{style:"currency",currency:"BRL"})
    : "R$ 0,00";

  /* ================= RANKING VEÍCULOS ================= */

  const rankingVeiculos = Object.entries(porVeiculo)
    .sort((a,b)=> b[1].total - a[1].total);

  $("rankingVeiculos").innerHTML = rankingVeiculos.map(([placa,d])=>{

    const custoKm = d.km > 0 ? d.total / d.km : 0;

    return `
      <tr>
        <td>${placa}</td>
        <td>${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
        <td>${d.km}</td>
        <td>R$ ${custoKm.toFixed(2)}</td>
      </tr>
    `;

  }).join("");

  /* ================= RANKING MOTORISTAS ================= */

  const rankingMotoristas = Object.entries(porMotorista)
    .filter(([nome]) => nome && nome.trim() !== "")
    .sort((a,b)=> b[1].total - a[1].total);

  $("rankingMotoristas").innerHTML = rankingMotoristas.map(([nome,d])=>{

    const custoKm = d.km > 0 ? d.total / d.km : 0;

    return `
      <tr>
        <td>${nome}</td>
        <td>${d.total.toLocaleString("pt-BR",{style:"currency",currency:"BRL"})}</td>
        <td>${d.km}</td>
        <td>R$ ${custoKm.toFixed(2)}</td>
      </tr>
    `;

  }).join("");

  /* ================= TOP 5 VEÍCULOS GRÁFICO ================= */

  const top5 = rankingVeiculos.slice(0,5);

  const labels = top5.map(v=>v[0]);
  const valores = top5.map(v=>v[1].total);

  const canvas = document.getElementById("grafTopVeiculos");

  if(canvas){

    if(grafTopVeiculos){
      grafTopVeiculos.destroy();
    }

    grafTopVeiculos = new Chart(canvas,{
      type:"bar",
      data:{
        labels,
        datasets:[{
          label:"Consumo (R$)",
          data: valores,
          borderRadius: 8
        }]
      },
      options:{
        responsive:true,
        plugins:{
          legend:{display:false}
        },
        scales:{
          y:{
            ticks:{
              callback:value=>{
                return value.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
              }
            }
          }
        }
      }
    });

  }

}

/* ================= BI MENSAL ================= */

function calcularBIComparativo(){

  const hoje=new Date();
  const mes=hoje.getMonth();
  const ano=hoje.getFullYear();

  let atual=0, anterior=0;

  abastecimentos.forEach(a=>{
    const d=new Date(a.dataISO);
    if(d.getMonth()===mes && d.getFullYear()===ano) atual+=a.total||0;
    if(d.getMonth()===mes-1 && d.getFullYear()===ano) anterior+=a.total||0;
  });

  aplicarBI("biCombustivel",atual,anterior);
}

function aplicarBI(id, atual, anterior){

  const el=$(id);
  if(!el) return;

  if(!anterior){
    el.innerHTML="Base inicial";
    el.className="bi-variacao bi-neutral";
    return;
  }

  const diff=((atual-anterior)/anterior)*100;
  el.innerHTML=`${diff>=0?"▲":"▼"} ${Math.abs(diff).toFixed(1)}%`;
  el.className=`bi-variacao ${diff>=0?"bi-up":"bi-down"}`;

}

function aplicarPermissoes(){

  const user = JSON.parse(sessionStorage.getItem("usuarioLogado"));
  if(!user) return;

  if(user.perfil === "CONSULTA"){

    /* desabilita botões de salvar */
    document.querySelectorAll("button").forEach(btn=>{
      if(btn.innerText.includes("Salvar")){
        btn.disabled = true;
      }
    });

    /* mostra badge */
    const area = document.querySelector(".user-area span");
    if(area){
      area.innerHTML += ' <span class="badge-consulta">CONSULTA</span>';
    }

  }
}

/* ================= EDITAR VEÍCULO ================= */

window.editarVeiculo = function(index){

  const v = veiculos[index];
  if(!v) return;

  editVeiculo = index;

  vPlaca.value = v.placa;
  vMarca.value = v.marca;
  vModelo.value = v.modelo;
  vAno.value = v.ano;
  vCategoria.value = v.categoria;
  vCor.value = v.cor;
  vRenavan.value = v.renavan;
  vKmAtual.value = v.kmAtual;
  vKmOleo.value = v.kmOleo;

  abrirPagina("veiculos");
};
document.addEventListener("DOMContentLoaded", () => {

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  if(!usuario){
    document.querySelector(".app").style.display = "none";
  }else{
    document.getElementById("loginTela").style.display = "none";
  }

});
/* ================= EDITAR VEÍCULO ================= */

window.editarVeiculo = function(index){

  const v = veiculos[index];
  if(!v) return;

  editVeiculo = index;

  vPlaca.value = v.placa;
  vMarca.value = v.marca;
  vModelo.value = v.modelo;
  vAno.value = v.ano;
  vCategoria.value = v.categoria;
  vCor.value = v.cor;
  vRenavan.value = v.renavan;
  vKmAtual.value = v.kmAtual;
  vKmOleo.value = v.kmOleo;

  abrirPagina("veiculos");
};

/* ================= EDITAR MOTORISTA ================= */

window.editarMotorista = function(index){

  const m = motoristas[index];
  if(!m) return;

  editMotorista = index;

  mNome.value = m.nome;
  mCpf.value = m.cpf;
  mCnh.value = m.cnh;
  mTelefone.value = m.telefone;

  abrirPagina("motoristas");
};

/* ================= EXCLUIR MOTORISTA ================= */

window.excluirMotorista = function(index){

  if(!confirm("Excluir motorista?")) return;

  motoristas.splice(index,1);

  localStorage.setItem("motoristas",
    JSON.stringify(motoristas)
  );

  renderMotoristas();
  atualizarDashboard();
};

/* ================= EDITAR ABASTECIMENTO ================= */

window.editarAbastecimento = function(index){

  const a = abastecimentos[index];
  if(!a) return;

  editAbastecimento = index;

  aVeiculo.value = a.veiculo;
  aMotorista.value = a.motorista;
  aPreco.value = a.preco;
  aQuantidade.value = a.litros;
  aKmAnterior.value = a.kmAnterior;
  aKmAtual2.value = a.kmAtual;
  aData.value = a.data;

  calcularAbastecimento();
  abrirPagina("abastecimento");
};

/* ================= EXCLUIR ABASTECIMENTO ================= */

window.excluirAbastecimento = function(index){

  if(!confirm("Excluir abastecimento?")) return;

  abastecimentos.splice(index,1);

  localStorage.setItem("abastecimentos",
    JSON.stringify(abastecimentos)
  );

  renderAbastecimentos();
  atualizarDashboard();
};

/* ================= EXCLUIR MANUTENÇÃO ================= */

window.excluirManutencao = function(index){

  if(!confirm("Excluir manutenção?")) return;

  manutencoes.splice(index,1);

  localStorage.setItem("manutencoes",
    JSON.stringify(manutencoes)
  );
};

/* ================= LOGIN VISIBILIDADE ================= */

document.addEventListener("DOMContentLoaded", () => {

  const usuario = JSON.parse(sessionStorage.getItem("usuarioLogado"));

  if(!usuario){
    document.querySelector(".app").style.display = "none";
  }else{
    document.getElementById("loginTela").style.display = "none";
  }

  aplicarPermissoes();

});
/* ================= FIX GLOBAL ABASTECIMENTO ================= */

window.editarAbastecimento = function(index){

  const a = abastecimentos[index];
  if(!a) return;

  editAbastecimento = index;

  aVeiculo.value = a.veiculo;
  aMotorista.value = a.motorista;
  aPreco.value = a.preco;
  aQuantidade.value = a.litros;
  aKmAnterior.value = a.kmAnterior;
  aKmAtual2.value = a.kmAtual;
  aData.value = a.data;

  calcularAbastecimento();
  abrirPagina("abastecimento");
};
