const REFRESH_INTERVAL = 30000;
let services = [];
let direction = "arrivals";
let filter = "all";

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
function render(){
  const rows=services.filter(item=>filter==="all"||item.type.toLowerCase().includes(filter.toLowerCase()));
  count.textContent=rows.length+" "+(rows.length===1?"serviço":"serviços");
  if(!rows.length){
    list.innerHTML='<div class="empty"><p>Sem dados de circulação disponíveis.</p></div>';
    return;
  }
  list.innerHTML=rows.map(item=>{
    const status=item.cancelled?'<span class="status cancelled">Suprimido</span>':item.delay>0?'<span class="status late">+'+item.delay+' min</span>':'<span class="status">No horário</span>';
    return '<article class="train-row"><div class="time">'+escapeHtml(item.time)+'</div><div><div class="train-no">'+escapeHtml(item.number)+'</div><div class="train-type">'+escapeHtml(item.type)+'</div></div><div class="place">'+escapeHtml(item.origin)+'</div><div class="place">'+escapeHtml(item.destination)+'</div><div class="platform">'+escapeHtml(item.platform)+'</div><div>'+status+'</div></article>';
  }).join("");
}

// A integração de dados reais será ligada a um fornecedor validado.
// Até existir uma fonte confirmada, o painel não inventa horários nem estados.
function showNoLiveFeed(){
  dot.className="error";
  connectionLabel.textContent="Fonte de dados por configurar";
  updated.textContent="Dados em tempo real ainda não ligados";
  services=[];
  render();
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
showNoLiveFeed();
setInterval(showNoLiveFeed,REFRESH_INTERVAL);