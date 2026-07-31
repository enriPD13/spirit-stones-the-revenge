/* ui.js — UI fuori battaglia: mappa, roster/squadra, dettaglio eroe, negozio, evoluzione.
 * Spirit Stones: Remastered — codice e grafica originali. */

/* ===== MAP ===== */
const globalIndex=(w,s)=>w*STAGES_PER_WORLD+s;
function renderMap(){renderHUD();setTheme('map');const cont=$('worlds');cont.innerHTML='';
  WORLDS.forEach((world,w)=>{const wd=document.createElement('div');wd.className='world';let html=`<h3><span>${world.em}</span> ${world.name}</h3><div class="stages">`;
    for(let s=0;s<STAGES_PER_WORLD;s++){const gi=globalIndex(w,s),key=w+'-'+s,isCleared=cleared.has(key),isUnlocked=gi<unlocked,isCurrent=gi===unlocked,boss=(s===STAGES_PER_WORLD-1);
      const cls=!isUnlocked&&!isCurrent?'locked':(isCleared?'cleared':(isCurrent?'current':''));
      html+=`<div class="node ${cls}" data-w="${w}" data-s="${s}">${isCleared?'<span class="chk">✔</span>':''}<div class="em">${worldMedallion(w,boss)}</div><div class="lab">${boss?'Boss':'Stage '+(s+1)}</div><div class="st">${(!isUnlocked&&!isCurrent)?'🔒':(boss?'Signore':'')}</div></div>`;}
    html+='</div>';wd.innerHTML=html;cont.appendChild(wd);});
  cont.querySelectorAll('.node:not(.locked)').forEach(n=>n.addEventListener('click',()=>{const w=+n.dataset.w,s=+n.dataset.s;if(globalIndex(w,s)>unlocked)return;pendingStage={w,s};showScreen('team');renderRoster();}));}
/* ===== TEAM ===== */
function renderRoster(){renderHUD();const r=$('roster');r.innerHTML='';
  HEROES.forEach(h=>{const col=COLORS[h.color],selIdx=selected.indexOf(h.id),need=expToNext(h),xpPct=Math.min(100,h.exp/need*100);
    const d=document.createElement('div');d.className='hcard'+(selIdx>=0?' sel':'');
    d.innerHTML=`<div class="cframe ${col.key}">${selIdx>=0?`<div class="selnum">${selIdx+1}</div>`:''}
      <div class="cbadge ${col.key}">${elemIcon(col.key)}</div>
      <div class="cstar">${'★'.repeat(h.grade)}${('<span class=cdim>★</span>').repeat(3-h.grade)}</div>
      <div class="cname">${h.name}</div>
      <div class="cart">${heroFig(col.key,HAIR[h.id])}</div>
      <div class="csub">${col.name} · Lv ${h.level}</div>
      <div class="cbar"><span class="cikn hp">${effHp(h)}</span><div class="cbart"><i class="hpf" style="width:${Math.min(100,effHp(h)/1300*100)}%"></i></div></div>
      <div class="cbar"><span class="cikn atk">${effAtk(h)}</span><div class="cbart"><i class="atf" style="width:${Math.min(100,effAtk(h)/230*100)}%"></i></div></div>
      <div class="gear">⚙️</div></div>`;
    d.querySelector('.gear').addEventListener('click',e=>{e.stopPropagation();openHero(h.id);});
    d.addEventListener('click',()=>toggleSelect(h.id));r.appendChild(d);});
  updatePartySummary();
  let sb=$('startBtn');if(!sb){sb=document.createElement('button');sb.id='startBtn';sb.className='btn';$('screen-team').querySelector('.topbar').appendChild(sb);}
  sb.textContent='Battaglia ▸';sb.disabled=selected.length===0;sb.onclick=beginBattle;}
function toggleSelect(id){const i=selected.indexOf(id);if(i>=0)selected.splice(i,1);else{if(selected.length>=4)selected.shift();selected.push(id);}saveState();renderRoster();}
function updatePartySummary(){const hs=selected.map(id=>HEROES.find(h=>h.id===id));const hp=hs.reduce((a,h)=>a+effHp(h),0);$('pHp').textContent=hp||'—';
  const cols=[0,0,0,0];hs.forEach(h=>cols[h.color]+=effAtk(h));$('pColors').innerHTML=COLORS.map((c,i)=>`<span style="color:${cvar(i)}">${c.glyph}${cols[i]||'·'}</span>`).join('  ');}
/* ===== HERO DETAIL (equip / potenzia / evolvi) ===== */
let heroOpen=null;
function openHero(id){heroOpen=id;renderHero();$('modal').classList.add('show');}
function renderHero(){const h=HEROES.find(x=>x.id===heroOpen);const col=COLORS[h.color];const need=expToNext(h);
  const wEq=h.equip.weapon?EQUIP[h.equip.weapon]:null,aEq=h.equip.acc?EQUIP[h.equip.acc]:null;
  const wOpts=Object.entries(EQUIP).filter(([k,e])=>e.slot==='weapon'&&e.color===h.color&&(owned[k]>0)||(wEq&&h.equip.weapon===k&&false));
  const ownedW=Object.entries(EQUIP).filter(([k,e])=>e.slot==='weapon'&&e.color===h.color&&owned[k]>0);
  const ownedA=Object.entries(EQUIP).filter(([k,e])=>e.slot==='acc'&&owned[k]>0);
  const canEvolve=h.level>=MAXLV&&h.grade<3, evoCost=1500*h.grade;
  let html=`<h2>${h.face} ${h.name}</h2><p>${col.name} · ${'★'.repeat(h.grade)}${'☆'.repeat(3-h.grade)} · Lv ${h.level}${h.level>=MAXLV?' (max)':''}</p>
    <div class="statline"><span>⚔ Attacco</span><b>${heroAtk(h)}${equipAtk(h)?` <span style="color:#7ce">+${equipAtk(h)}</span>`:''} = ${effAtk(h)}</b></div>
    <div class="statline"><span>❤ Salute</span><b>${heroHp(h)}${equipHp(h)?` <span style="color:#7ce">+${equipHp(h)}</span>`:''} = ${effHp(h)}</b></div>
    <div class="statline"><span>✦ EXP</span><b>${h.level>=MAXLV?'MAX':h.exp+' / '+need}</b></div>`;
  // potenzia
  html+=`<button class="btn sm" id="btnPotenzia" ${h.level>=MAXLV?'disabled':''} style="margin:8px 4px 0">Potenzia (200${COIN} → +60 EXP)</button>`;
  if(canEvolve)html+=`<button class="btn sm" id="btnEvolvi" style="margin:8px 4px 0">Evolvi ${icEvo()} (${evoCost}${COIN})</button>`;
  // weapon slot
  html+=`<div class="slotbox"><div class="h">🗡️ ARMA (${col.name})</div>`;
  html+=`<div class="opt"><span>${wEq?wEq.name+` <span class="st">+${wEq.atk} ATK</span>`:'<span class="st">vuoto</span>'}</span>${wEq?'<button class="btn ghost sm" data-uneq="weapon">rimuovi</button>':''}</div>`;
  ownedW.forEach(([k,e])=>{if(h.equip.weapon===k)return;html+=`<div class="opt"><span>${e.name} <span class="st">+${e.atk} ATK ×${owned[k]}</span></span><button class="btn sm" data-eq="${k}" data-slot="weapon">equipaggia</button></div>`;});
  if(ownedW.length===0&&!wEq)html+=`<div class="opt"><span class="st">Nessun'arma in inventario — compra in Bottega</span></div>`;
  html+=`</div>`;
  // acc slot
  html+=`<div class="slotbox"><div class="h">💍 ACCESSORIO</div>`;
  html+=`<div class="opt"><span>${aEq?aEq.name+` <span class="st">+${aEq.hp} HP</span>`:'<span class="st">vuoto</span>'}</span>${aEq?'<button class="btn ghost sm" data-uneq="acc">rimuovi</button>':''}</div>`;
  ownedA.forEach(([k,e])=>{if(h.equip.acc===k)return;html+=`<div class="opt"><span>${e.name} <span class="st">+${e.hp} HP ×${owned[k]}</span></span><button class="btn sm" data-eq="${k}" data-slot="acc">equipaggia</button></div>`;});
  if(ownedA.length===0&&!aEq)html+=`<div class="opt"><span class="st">Nessun accessorio — compra in Bottega</span></div>`;
  html+=`</div><div class="statline" style="margin-top:8px"><span>${COIN} Oro</span><b>${gold}</b></div>`;
  $('modalBody').innerHTML=html;
  const pot=$('btnPotenzia');if(pot)pot.onclick=()=>potenzia(h);
  const evo=$('btnEvolvi');if(evo)evo.onclick=()=>evolvi(h);
  $('modalBody').querySelectorAll('[data-eq]').forEach(b=>b.onclick=()=>equipItem(h,b.dataset.slot,b.dataset.eq));
  $('modalBody').querySelectorAll('[data-uneq]').forEach(b=>b.onclick=()=>unequip(h,b.dataset.uneq));}
function equipItem(h,slot,key){const cur=h.equip[slot];if(cur){owned[cur]=(owned[cur]||0)+1;}owned[key]--;if(owned[key]<=0)delete owned[key];h.equip[slot]=key;saveState();renderHero();}
function unequip(h,slot){const cur=h.equip[slot];if(cur){owned[cur]=(owned[cur]||0)+1;h.equip[slot]=null;}saveState();renderHero();}
function potenzia(h){if(h.level>=MAXLV||gold<200)return;gold-=200;h.exp+=60;while(h.level<MAXLV&&h.exp>=expToNext(h)){h.exp-=expToNext(h);h.level++;}saveState();renderHUD();renderHero();}
function evolvi(h){const cost=1500*h.grade;if(h.level<MAXLV||h.grade>=3||gold<cost)return;gold-=cost;h.grade++;h.level=1;h.exp=0;saveState();renderHUD();renderHero();}
/* ===== SHOP ===== */
function openShop(){renderShop();$('modal').classList.add('show');}
function renderShop(){let html=`<h2>🛒 Bottega</h2><div class="statline"><span>${COIN} Oro disponibile</span><b>${gold}</b></div><div class="shopgrid">`;
  const groups=[['Armi — Guerriero',0],['Armi — Ladro',1],['Armi — Arciere',2],['Armi — Mago',3],['Accessori',null]];
  groups.forEach(([label,color])=>{html+=`<div class="h" style="color:var(--gold-dim);font-family:'Cinzel',serif;font-size:11px;margin-top:6px">${label}</div>`;
    Object.entries(EQUIP).filter(([k,e])=>color===null?e.slot==='acc':(e.slot==='weapon'&&e.color===color)).forEach(([k,e])=>{
      const stat=e.slot==='weapon'?`+${e.atk} ATK`:`+${e.hp} HP`;const oc=owned[k]?` (hai ${owned[k]})`:'';
      html+=`<div class="opt"><span>${e.name} <span class="st">${stat}${oc}</span></span><button class="btn sm" data-buy="${k}" ${gold<e.price?'disabled':''}>${e.price}${COIN}</button></div>`;});});
  html+=`</div>`;$('modalBody').innerHTML=html;
  $('modalBody').querySelectorAll('[data-buy]').forEach(b=>b.onclick=()=>buy(b.dataset.buy));}
function buy(key){const e=EQUIP[key];if(gold<e.price)return;gold-=e.price;owned[key]=(owned[key]||0)+1;saveState();renderHUD();renderShop();}
