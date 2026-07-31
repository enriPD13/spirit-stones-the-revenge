/* battle.js — Combattimento: risoluzione catena, cascata armi, effetti, nemici, abilita, danni.
 * Spirit Stones: Remastered — codice e grafica originali. */

/* ===== BATTLE ===== */
function beginBattle(){teamHeroes=selected.map(id=>{const h=HEROES.find(x=>x.id===id);return {ref:h,color:h.color,face:h.face,name:h.name,atk:effAtk(h),hp:effHp(h),skill:COLORS[h.color].skill};});
  colorAtk=[0,0,0,0];teamHeroes.forEach(t=>colorAtk[t.color]+=t.atk);partyMax=teamHeroes.reduce((a,t)=>a+t.hp,0);partyHp=partyMax;
  charge=teamHeroes.map(()=>0);ready=teamHeroes.map(()=>false);dodge=0;enemyAtkDebuff=0;
  const {w,s}=pendingStage;battle={w,s,...makeStage(w,s),subIndex:0};
  newGrid();render();renderTeam();loadSub(0);updatePartyBar();setTheme(String(battle.w));playing=true;busy=false;showScreen('battle');}
function loadSub(i){battle.subIndex=i;enemies=battle.subs[i].map(e=>({...e,max:e.hp,alive:true,charge:e.every}));targetIdx=0;$('hudStage').textContent=`${battle.name} · ${i+1}/${battle.subs.length}`;renderEnemies();}
function renderTeam(){teamEl.innerHTML='';teamHeroes.forEach((t,i)=>{const col=COLORS[t.color];const pct=Math.min(100,charge[i]/t.skill.max*100);const d=document.createElement('div');d.className='unit hero '+col.key+(ready[i]?' ready':'');
  d.innerHTML=`${ready[i]?('<div class="sbadge amu">'+icSkill()+'</div>'):''}<div class="stand"><div class="ring ring-${col.key}"></div><div class="ava">${heroFig(col.key,HAIR[t.ref.id])}</div></div><div class="uname">${t.name}</div><div class="ubar"><i class="sgauge-fill" style="width:${pct}%"></i></div>`;
  d.addEventListener('click',()=>useSkill(i));teamEl.appendChild(d);});}
function addCharge(count){teamHeroes.forEach((t,i)=>{const n=count[t.color];if(n>0&&!ready[i]){charge[i]+=n;if(charge[i]>=t.skill.max){charge[i]=t.skill.max;ready[i]=true;}}});}
function useSkill(i){if(!ready[i]||!playing||busy)return;const t=teamHeroes[i],s=t.skill;
  if(s.type===9){damageEnemy(targetIdx,1200);damageFloats(targetIdx,[{dmg:1200,color:cvar(t.color)}]);enemyPanelShake();}
  else if(s.type===5){enemyAtkDebuff=3;showCombo(s.name+'\nATK nemici −40%');}
  else if(s.type===7){dodge+=2;showCombo(s.name+'\nSchiva ×2');}
  else if(s.type===8){const h=Math.round(partyMax*0.30);partyHp=Math.min(partyMax,partyHp+h);showCombo('+'+h+' ♥');}
  ready[i]=false;charge[i]=0;renderTeam();updatePartyBar();renderEnemies();checkState();}
function renderEnemies(){enemiesEl.innerHTML='';enemies.forEach((e,i)=>{const d=document.createElement('div');d.className='unit foe'+(i===targetIdx&&e.alive?' target':'')+(e.alive?'':' dead');const seed=(e.name?e.name.length:3)+i*3+(battle?battle.w*7+battle.s*3:0);
  d.innerHTML=`<div class="eclock">${e.charge}</div>${enemyAtkDebuff>0?'<div class="edeb">⤵</div>':''}<div class="stand"><div class="ava">${enemyFig(seed,!!e.boss)}</div></div><div class="uname">${e.name}</div><div class="ubar big"><i class="hpfill" style="width:${e.hp/e.max*100}%"></i></div><div class="ehp">${e.hp}/${e.max}</div>`;
  d.addEventListener('click',()=>{if(e.alive){targetIdx=i;renderEnemies();}});enemiesEl.appendChild(d);});}
function damageFloats(i,entries){const card=enemiesEl.children[i];if(!card)return;const rc=card.getBoundingClientRect();entries.forEach((e,idx)=>{const f=document.createElement('div');f.className='dmgfloat';f.textContent=e.dmg;f.style.color=e.color;f.style.left=(rc.left+rc.width/2+(idx-(entries.length-1)/2)*18)+'px';f.style.top=(rc.top+6)+'px';document.body.appendChild(f);
  f.animate([{opacity:0,transform:'translate(-50%,8px) scale(.7)'},{opacity:1,transform:'translate(-50%,-18px) scale(1.15)',offset:.3},{opacity:0,transform:'translate(-50%,-54px) scale(1)'}],{duration:1000,delay:idx*70,easing:'ease-out'});setTimeout(()=>f.remove(),1120+idx*70);});}
function screenFlash(){let f=document.getElementById('sflash');if(!f){f=document.createElement('div');f.id='sflash';document.body.appendChild(f);}f.style.animation='none';void f.offsetWidth;f.style.animation='sflash .5s ease-out';}
function boardImpact(){const w=boardEl.parentElement;w.classList.remove('impact');void w.offsetWidth;w.classList.add('impact');}
function fxSpark(x,y,col){const layer=document.getElementById('fxLayer');if(!layer)return;const a=Math.random()*6.28,d=40+Math.random()*55;const s=document.createElement('div');s.className='fx fx-spark';s.style.left=x+'px';s.style.top=y+'px';s.style.background=col;s.style.color=col;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');layer.appendChild(s);setTimeout(()=>s.remove(),620);}
function fxSpecialBig(kind,r,c){const el=cellEl(r,c);if(!el)return;const wrap=boardEl.parentElement.getBoundingClientRect();const rc=el.getBoundingClientRect();const x=rc.left-wrap.left+rc.width/2,y=rc.top-wrap.top+rc.height/2;
  fxAt(x,y,'fx-shock');
  if(kind==='bomb'||kind==='dynamite'){fxAt(x,y,'fx-flash');fxAt(x,y,'fx-ring');fxAt(x,y,'fx-ring2');for(let i=0;i<9;i++)fxSpark(x,y,'#ffb060');}
  else if(kind==='sword'||kind==='doublesword'){fxAt(x,y,'fx-slash',45);fxAt(x,y,'fx-slash',-45);if(kind==='doublesword'){fxAt(x,y,'fx-slash',0);fxAt(x,y,'fx-slash',90);}for(let i=0;i<7;i++)fxSpark(x,y,'#dcefff');}
  else if(kind==='bow'||kind==='multiarrow'){const n=kind==='multiarrow'?13:8;for(let i=0;i<n;i++)fxArrow(x,y);}
  else if(kind==='potion'){fxAt(x,y,'fx-heal');fxAt(x,y,'fx-heal-ring');for(let i=0;i<7;i++)fxSpark(x,y,'#6bffa0');}}
function dealColorDamage(count,mult){const idx=targetIdx;const per=count.map((n,i)=>Math.round(n*colorAtk[i]*mult));const total=per.reduce((a,b)=>a+b,0);
  teamHeroes.forEach((tt,i)=>{if(count[tt.color]>0){const el=teamEl.children[i];if(el){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),260);}}});
  if(total>0){damageEnemy(idx,total);renderEnemies();const entries=[];per.forEach((d,i)=>{if(d>0)entries.push({dmg:d,color:cvar(i)});});damageFloats(idx,entries);enemyPanelShake();}return total;}
function endMove(){updatePartyBar();advanceClocks();checkState();busy=false;}
function resolveChain(){busy=true;const K=(r,c)=>r+','+c;
  const chainCells=chain.map(p=>({r:p.r,c:p.c,cell:grid[p.r][p.c]}));
  const chainSet=new Set(chainCells.map(o=>K(o.r,o.c)));
  const bonuses=chainCells.filter(o=>o.cell.t==='special'||o.cell.t==='super').map(o=>({r:o.r,c:o.c,kind:o.cell.kind}));
  const baseCount=[0,0,0,0];chainCells.forEach(o=>{if(o.cell.t==='class')baseCount[o.cell.el]++;});
  const totalCount=baseCount.slice();
  chainCells.forEach(o=>{const el=cellEl(o.r,o.c);if(el)el.classList.add('pop');});
  setTimeout(()=>{ // FASE 1: rimuovi la selezione, cadono le nuove
    chainSet.forEach(k=>{const[r,c]=k.split(',').map(Number);grid[r][c]=null;});applyGravity();render(true);
    dealColorDamage(baseCount,1);
    if(!bonuses.length){addCharge(totalCount);renderTeam();endMove();return;}
    setTimeout(()=>activateWeapons(bonuses,totalCount),400); // FASE 2 dopo la caduta
  },240);}
function activateWeapons(seed,totalCount){const K=(r,c)=>r+','+c;const cleared=new Set();const activated=new Set();let heal=0,combo=0,firedCount=0;
  seed.forEach(b=>activated.add(K(b.r,b.c)));
  function effect(kind,r,c){if(kind==='potion'){heal+=Math.round(partyMax*0.10);return[];}
    if(kind==='bow'||kind==='multiarrow'){const shots=kind==='multiarrow'?9:5;const pool=[];for(let rr=0;rr<ROWS;rr++)for(let cc=0;cc<COLS;cc++)if(!cleared.has(K(rr,cc)))pool.push([rr,cc]);const out=[];for(let n=0;n<shots&&pool.length;n++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out;}
    return patternCells(kind,r,c);}
  function finish(){
    activated.forEach(k=>{const[r,c]=k.split(',').map(Number);const cell=grid[r][c];if(cell&&(cell.t==='special'||cell.t==='super'))cleared.add(k);});
    const count=[0,0,0,0];cleared.forEach(k=>{const[r,c]=k.split(',').map(Number);const cell=grid[r][c];if(cell&&cell.t==='class')count[cell.el]++;});
    for(let i=0;i<4;i++)totalCount[i]+=count[i];
    cleared.forEach(k=>{const[r,c]=k.split(',').map(Number);grid[r][c]=null;});applyGravity();
    if(firedCount>=3){const sk=['dynamite','multiarrow','doublesword'][Math.floor(Math.random()*3)];const c=Math.floor(Math.random()*COLS);grid[0][c]={t:'super',kind:sk};fallMap['0,'+c]=-1;}
    render(true);dealColorDamage(count,Math.min(2.6,1+combo*0.22));
    if(heal>0){partyHp=Math.min(partyMax,partyHp+heal);showCombo('+'+heal+' \u2665');}
    addCharge(totalCount);renderTeam();endMove();}
  function runWave(wave){
    if(!wave.length){setTimeout(finish,180);return;}
    combo++;firedCount+=wave.length;
    screenFlash();boardImpact();
    showCombo(combo>1?('CATENA \u00d7'+combo):'ARMA!');
    wave.forEach((b,idx)=>setTimeout(()=>fxSpecialBig(b.kind,b.r,b.c),idx*70));
    const next=[];const waveClears=[];
    wave.forEach(b=>{effect(b.kind,b.r,b.c).forEach(([rr,cc])=>{const cell=grid[rr][cc];if(!cell)return;const k=K(rr,cc);
      if((cell.t==='special'||cell.t==='super')&&!activated.has(k)){activated.add(k);next.push({r:rr,c:cc,kind:cell.kind});}
      else if(!cleared.has(k)){cleared.add(k);waveClears.push([rr,cc]);}});});
    setTimeout(()=>{waveClears.forEach(([r,c])=>{const el=cellEl(r,c);if(el)el.classList.add('pop');});
      next.forEach(b=>{const el=cellEl(b.r,b.c);if(el){el.classList.add('link');setTimeout(()=>{if(el)el.classList.remove('link');},400);}});},170);
    setTimeout(()=>runWave(next),next.length?560:420);}
  runWave(seed.slice());}
function fxAt(x,y,cls,rot){const layer=document.getElementById('fxLayer');if(!layer)return;const d=document.createElement('div');d.className='fx '+cls;d.style.left=x+'px';d.style.top=y+'px';if(rot!==undefined)d.style.setProperty('--rot',rot+'deg');layer.appendChild(d);setTimeout(()=>d.remove(),700);}
function fxArrow(x,y){const layer=document.getElementById('fxLayer');if(!layer)return;const ang=Math.random()*2*Math.PI,dist=55+Math.random()*55;const d=document.createElement('div');d.className='fx fx-arrow';d.textContent='\u279B';d.style.left=x+'px';d.style.top=y+'px';d.style.setProperty('--dx',Math.cos(ang)*dist+'px');d.style.setProperty('--dy',Math.sin(ang)*dist+'px');d.style.setProperty('--rot',(ang*180/Math.PI+45)+'deg');layer.appendChild(d);setTimeout(()=>d.remove(),600);}
function fxSpecial(kind,r,c){const el=boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);if(!el)return;const wrap=boardEl.parentElement.getBoundingClientRect();const rc=el.getBoundingClientRect();const x=rc.left-wrap.left+rc.width/2,y=rc.top-wrap.top+rc.height/2;
  if(kind==='bomb'||kind==='dynamite'){fxAt(x,y,'fx-flash');fxAt(x,y,'fx-ring');if(kind==='dynamite')fxAt(x,y,'fx-ring2');}
  else if(kind==='sword'||kind==='doublesword'){fxAt(x,y,'fx-slash',45);fxAt(x,y,'fx-slash',-45);if(kind==='doublesword'){fxAt(x,y,'fx-slash',0);fxAt(x,y,'fx-slash',90);}}
  else if(kind==='bow'||kind==='multiarrow'){const n=kind==='multiarrow'?9:5;for(let i=0;i<n;i++)fxArrow(x,y);}
  else if(kind==='potion'){fxAt(x,y,'fx-heal');fxAt(x,y,'fx-heal-ring');}}
function damageEnemy(i,d){const e=enemies[i];if(!e||!e.alive)return;e.hp=Math.max(0,e.hp-d);if(e.hp<=0){e.alive=false;if(i===targetIdx)pickTarget();}}
function pickTarget(){const idx=enemies.findIndex(e=>e.alive);if(idx>=0)targetIdx=idx;}
function advanceClocks(){if(enemyAtkDebuff>0)enemyAtkDebuff--;enemies.forEach(e=>{if(!e.alive)return;e.charge--;if(e.charge<=0){if(dodge>0){dodge--;showCombo('SCHIVATO!');}else{const dmg=Math.round(e.dmg*(enemyAtkDebuff>0?0.6:1));partyHp=Math.max(0,partyHp-dmg);bodyShake();}e.charge=e.every;}});updatePartyBar();renderEnemies();}
function bodyShake(){document.body.classList.add('shake');setTimeout(()=>document.body.classList.remove('shake'),400);}
function enemyPanelShake(){enemiesEl.classList.add('shake');setTimeout(()=>enemiesEl.classList.remove('shake'),400);}
function updatePartyBar(){$('partyHp').style.width=(partyHp/partyMax*100)+'%';$('partyHpTxt').textContent=partyHp;}
function checkState(){if(partyHp<=0){playing=false;setTimeout(()=>showOverlay('Sconfitta','La tua schiera è caduta. Potenzia gli eroi e riprova.',[],'Alla mappa',()=>{hideOverlay();showScreen('map');renderMap();}),300);return;}
  if(enemies.every(e=>!e.alive)){if(battle.subIndex<battle.subs.length-1){setTimeout(()=>{loadSub(battle.subIndex+1);showCombo('ONDATA '+(battle.subIndex+1));},450);}else setTimeout(winStage,450);}}
function winStage(){playing=false;const {w,s}=battle;const firstClear=!cleared.has(w+'-'+s);cleared.add(w+'-'+s);
  const gi=globalIndex(w,s);if(gi+1>unlocked&&gi+1<=GLOBAL)unlocked=Math.max(unlocked,gi+1);
  gold+=battle.gold;const lvups=[];
  teamHeroes.forEach(t=>{const h=t.ref;if(h.level>=MAXLV)return;h.exp+=battle.reward;while(h.level<MAXLV&&h.exp>=expToNext(h)){h.exp-=expToNext(h);h.level++;lvups.push(`${h.name} → Lv ${h.level}`);}});
  saveState();const done=cleared.size>=GLOBAL;
  showOverlay(done?'Brikeaz è salva':'Stage completato!',`+${battle.reward} EXP a ogni eroe · +${battle.gold} ${COIN}`,lvups,done?'Rigioca':'Alla mappa',()=>{hideOverlay();showScreen('map');renderMap();});}
function showCombo(t){const c=$('comboText');c.innerHTML=t.replace(/\n/g,'<br>');c.classList.remove('show');void c.offsetWidth;c.classList.add('show');}
function showOverlay(t,x,lvups,btn,cb){$('ovTitle').textContent=t;$('ovText').textContent=x;$('ovLvups').innerHTML=(lvups&&lvups.length)?('⭐ '+lvups.join('<br>⭐ ')):'';const b=$('ovBtn');b.textContent=btn;b.onclick=cb;$('overlay').classList.add('show');}
function hideOverlay(){$('overlay').classList.remove('show');}
