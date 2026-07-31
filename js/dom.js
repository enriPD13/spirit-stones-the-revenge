/* dom.js — Riferimenti DOM, helper, schermate, tema e particelle di sfondo.
 * Spirit Stones: Remastered — codice e grafica originali. */

/* ===== battle-time ===== */
let grid=[],enemies=[],targetIdx=0,partyHp=0,partyMax=0,playing=false,busy=false;
let chain=[],dragging=false,teamHeroes=[],colorAtk=[0,0,0,0],charge=[],ready=[],dodge=0,enemyAtkDebuff=0,battle=null,pendingStage=null;
const $=id=>document.getElementById(id);
const boardEl=$('board'),linkLayer=$('linkLayer'),teamEl=$('team'),enemiesEl=$('enemies');
const COLS=6,ROWS=6,rnd4=()=>Math.floor(Math.random()*4);
const cvar=i=>getComputedStyle(document.documentElement).getPropertyValue('--'+COLORS[i].key).trim();
function showScreen(n){['map','team','battle'].forEach(s=>$('screen-'+s).classList.toggle('on',s===n));
  $('subtitle').textContent=n==='battle'?'connetti · attiva · libera il regno':n==='team'?'prepara la tua schiera':'scegli lo stage';}
function renderHUD(){$('goldMap').textContent=gold;$('goldTeam').textContent=gold;}
/* init */

function setTheme(k){document.body.dataset.theme=k;}
function initMotes(){const cv=document.getElementById('motes');if(!cv)return;const ctx=cv.getContext('2d');let W,H;const P=[];
  function rs(){W=cv.width=innerWidth;H=cv.height=innerHeight;}rs();addEventListener('resize',rs);
  for(let i=0;i<48;i++)P.push({x:Math.random()*innerWidth,y:Math.random()*innerHeight,r:Math.random()*2+.6,s:Math.random()*.35+.12,a:Math.random()*.5+.18,d:Math.random()*6.28});
  (function tick(){ctx.clearRect(0,0,W,H);const col=(getComputedStyle(document.body).getPropertyValue('--mote')||'#e8c37a').trim();ctx.shadowColor=col;
    P.forEach(p=>{p.y-=p.s;p.x+=Math.sin(p.d+p.y*0.01)*0.18;if(p.y<-6){p.y=H+6;p.x=Math.random()*W;}ctx.globalAlpha=p.a;ctx.shadowBlur=9;ctx.fillStyle=col;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.28);ctx.fill();});ctx.globalAlpha=1;requestAnimationFrame(tick);})();}
