/* dom.js — DOM, helper, schermate, tema, sfondi/skin, navbar, particelle.
 * Spirit Stones: Remastered — codice originale; immagini fornite dall'autore. */

/* ===== battle-time ===== */
let grid=[],enemies=[],targetIdx=0,partyHp=0,partyMax=0,playing=false,busy=false;
let chain=[],dragging=false,teamHeroes=[],colorAtk=[0,0,0,0],charge=[],ready=[],dodge=0,enemyAtkDebuff=0,battle=null,pendingStage=null;
const $=id=>document.getElementById(id);
const boardEl=$('board'),linkLayer=$('linkLayer'),teamEl=$('team'),enemiesEl=$('enemies');
const COLS=7,ROWS=6,rnd4=()=>Math.floor(Math.random()*4);
const cvar=i=>getComputedStyle(document.documentElement).getPropertyValue('--'+COLORS[i].key).trim();
function showScreen(n){const _nb=document.getElementById('navbar');if(_nb)_nb.classList.toggle('hidden',n==='battle');['map','team','battle'].forEach(s=>$('screen-'+s).classList.toggle('on',s===n));
  $('subtitle').textContent=n==='battle'?'connetti · attiva · libera il regno':n==='team'?'prepara la tua schiera':'scegli lo stage';}
function renderHUD(){$('goldMap').textContent=gold;$('goldTeam').textContent=gold;}
/* init */


function applyImageAssets(){
  const s=document.createElement('style');
  s.textContent=`#screen-map,#screen-team{background-size:cover;background-position:center;border-radius:16px;padding:12px 10px;}#screen-map{background-image:linear-gradient(rgba(6,4,14,.5),rgba(6,4,14,.72)),url(${IMG3.bgMap});}#screen-team{background-image:linear-gradient(rgba(6,4,14,.5),rgba(6,4,14,.72)),url(${IMG3.bgTeam});}`;
  document.head.appendChild(s);
  const nb=document.getElementById('navbar');
  if(nb){nb.innerHTML=`<button class="navb" data-s="map"><img src="${IMG3.navMap}"><span>Mappa</span></button><button class="navb" data-s="team"><img src="${IMG3.navTeam}"><span>Squadra</span></button><button class="navb" data-s="shop"><img src="${IMG3.navShop}"><span>Bottega</span></button>`;
    nb.querySelectorAll('.navb').forEach(b=>b.addEventListener('click',()=>{const s=b.dataset.s;if(s==='map'){showScreen('map');renderMap();}else if(s==='team'){showScreen('team');renderRoster();}else{openShop();}}));}
}
function setTheme(k){document.body.dataset.theme=k;const a=document.getElementById('arena');if(a){const bg=(k==='map'?null:IMG3.bgArena);a.style.backgroundImage=bg?`linear-gradient(rgba(8,5,18,.22),rgba(8,5,18,.6)),url(${bg})`:'';a.style.backgroundSize='cover';a.style.backgroundPosition='center';}}
function applyImageSkins(){const s=document.createElement('style');s.textContent=`.c-warrior{background:url(${IMG.stoneRed}) center/cover no-repeat!important}.c-thief{background:url(${IMG.stoneGold}) center/cover no-repeat!important}.c-archer{background:url(${IMG.stoneGreen}) center/cover no-repeat!important}.c-mage{background:url(${IMG.stoneBlue}) center/cover no-repeat!important}.cell.c-warrior .ic,.cell.c-thief .ic,.cell.c-archer .ic,.cell.c-mage .ic{display:none}.c-warrior::before,.c-thief::before,.c-archer::before,.c-mage::before{opacity:.28}`;document.head.appendChild(s);}
function initMotes(){const cv=document.getElementById('motes');if(!cv)return;const ctx=cv.getContext('2d');let W,H;const P=[];
  function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<48;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+.6,s:Math.random()*.35+.12,a:Math.random()*.5+.18,d:Math.random()*6.28});
  (function tick(){ctx.clearRect(0,0,W,H);const col=(getComputedStyle(document.body).getPropertyValue('--mote')||'#e8c37a').trim();ctx.shadowColor=col;
    P.forEach(p=>{p.y-=p.s;p.x+=Math.sin(p.d+p.y*0.01)*0.18;if(p.y<-6){p.y=H+6;p.x=Math.random()*W;}ctx.globalAlpha=p.a;ctx.shadowBlur=9;ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(tick);})();}
