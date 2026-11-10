let services = [];
let direction = "arrivals";
let filter = "all";
let station = null;
let requestInProgress = false;

const list = document.querySelector("#train-list");
const dot = document.querySelector("#connection-dot");
const connectionLabel = document.querySelector("#connection-label");
const updated = document.querySelector("#updated");
const count = document.querySelector("#count");

function updateClock(){
  const now = new Date();
  document.querySelector("#clock").textContent = now.toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Europe/Lisbon"});
  document.querySelector("#today").textContent = now.toLocaleDateString("pt-PT",{weekday:"long",day:"numeric",month:"long",timeZone:"Europe/Lisbon"}).toUpperCase();
}
setInterval(updateClock,1000);
updateClock();

function escapeHtml(value){
  return String(value ?? "—").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function serviceLabel(code){
  const value=String(code||"").toUpperCase();
  if(value.includes("URB")) return "Urbano";
  if(value.includes("REGIONAL")||value==="R") return "Regional";
  if(value==="IR"||value.includes("INTERREGIONAL")) return "InterRegional";
  if(value==="IC"||value.includes("INTERCIDADES")) return "Intercidades";
  if(value==="ALFA"||value==="AP"||value.includes("PENDULAR")) return "Alfa Pendular";
  if(value.includes("INTERNACIONAL")||value==="IN") return "Internacional";
  return value || "Outro serviço";
}
function normalizeTrain(train){
  const isDeparture = train.is_departure === true;
  const scheduled = isDeparture ? train.departure_time : train.arrival_time;
  const estimated = isDeparture ? train.estimated_departure : train.estimated_arrival;
  const delay = Number(train.delay || 0);
  const observations = String(train.observations || "");
  return {
    time: estimated || scheduled || "—",
    number: train.train_number ?? "—",
    type: serviceLabel(train.service_type),
    origin: train.origin_station_name || "—",
    destination: train.destination_station_name || "—",
    platform: train.platform || "—",
    delay,
    observations,
    cancelled: /suprim|cancelad|cancelled/i.test(observations),
    isDeparture
  };
}
function render(){
  const rows=services
    .filter(item=>item.isDeparture === (direction === "departures"))
    .filter(item=>filter==="all"||item.type.toLowerCase().includes(filter.toLowerCase()))
    .sort((a,b)=>a.time.localeCompare(b.time));
  count.textContent=rows.length+" "+(rows.length===1?"serviço":"serviços");
  if(!rows.length){
    list.innerHTML='<div class="empty"><p>Não há movimentos correspondentes para apresentar.</p></div>';
    return;
  }
  list.innerHTML=rows.map(item=>{
    const status=item.cancelled
      ? '<span class="status cancelled">Suprimido</span>'
      : item.delay>0
        ? '<span class="status late">+'+item.delay+' min</span>'
        : item.observations
          ? '<span class="status late">'+escapeHtml(item.observations)+'</span>'
          : '<span class="status">No horário</span>';
    return '<article class="train-row"><div class="time">'+escapeHtml(item.time)+'</div><div><div class="train-no">'+escapeHtml(item.number)+'</div><div class="train-type">'+escapeHtml(item.type)+'</div></div><div class="place">'+escapeHtml(item.origin)+'</div><div class="place">'+escapeHtml(item.destination)+'</div><div class="platform">'+escapeHtml(item.platform)+'</div><div>'+status+'</div></article>';
  }).join("");
}
async function fetchJson(url){
  const response=await fetch(url,{headers:{Accept:"application/json"}});
  if(!response.ok) throw new Error("Erro HTTP "+response.status+" em "+url);
  return response.json();
}
async function loadBoard(){
  if(requestInProgress) return;
  requestInProgress=true;
  try{
    if(!station){
      const search=await fetchJson("/stations?query=Paredes");
      const candidates=search.data || [];
      station=candidates.find(item=>String(item.designation||"").trim().toLocaleLowerCase("pt-PT")==="paredes")
        || candidates.find(item=>String(item.designation||"").toLocaleLowerCase("pt-PT").includes("paredes"));
      if(!station) throw new Error("A API não encontrou a estação de Paredes.");
    }
    const result=await fetchJson("/stations/timetable/"+encodeURIComponent(station.code));
    const boards=result.data || [];
    const board=boards.find(item=>String(item.station_id)===String(station.code)) || boards[0];
    if(!board) throw new Error("A API não devolveu o painel da estação.");
    services=(board.trains || []).map(normalizeTrain);
    dot.className="ok";
    connectionLabel.textContent="Dados ferroviários ligados";
    updated.textContent="Atualizado às "+new Date().toLocaleTimeString("pt-PT",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"Europe/Lisbon"});
    render();
  }catch(error){
    dot.className="error";
    connectionLabel.textContent="Não foi possível atualizar os dados";
    updated.textContent=error.message;
    if(!services.length) list.innerHTML='<div class="empty"><p>Não foi possível obter o painel em tempo real.</p><small>'+escapeHtml(error.message)+'</small></div>';
  }finally{
    requestInProgress=false;
  }
}
document.querySelectorAll("[data-direction]").forEach(button=>button.addEventListener("click",()=>{
  direction=button.dataset.direction;
  document.querySelectorAll("[data-direction]").forEach(item=>item.classList.toggle("active",item===button));
  render();
}));
document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
  filter=button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(item=>item.classList.toggle("active",item===button));
  render();
}));
// Consulta os dados apenas ao abrir/recarregar a página.
loadBoard();
