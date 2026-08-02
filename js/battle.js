/* battle.js — Combattimento: catena, cascata cadi-poi-attiva, effetti, nemici, danni, ricompense.
 * Spirit Stones: Remastered — codice originale; immagini fornite dall'autore. */

/* ===== BATTLE ===== */
function beginBattle(){teamHeroes=selected.map(id=>{const h=HEROES.find(x=>x.id===id);return {ref:h,color:h.color,face:h.face,name:h.name,atk:effAtk(h),hp:effHp(h),skill:COLORS[h.color].skill};});
  colorAtk=[0,0,0,0];teamHeroes.forEach(t=>colorAtk[t.color]+=t.atk);partyMax=teamHeroes.reduce((a,t)=>a+t.hp,0);partyHp=partyMax;
  charge=teamHeroes.map(()=>0);ready=teamHeroes.map(()=>false);dodge=0;enemyAtkDebuff=0;
  const {w,s}=pendingStage;battle={w,s,...makeStage(w,s),subIndex:0};
  newGrid();render();renderTeam();loadSub(0);updatePartyBar();setTheme(String(battle.w));playing=true;busy=false;showScreen('battle');}
function loadSub(i){battle.subIndex=i;enemies=battle.subs[i].map(e=>({...e,max:e.hp,alive:true,charge:e.every}));targetIdx=0;$('hudStage').textContent=`${battle.name} · ${i+1}/${battle.subs.length}`;renderEnemies();}
function renderTeam(){teamEl.innerHTML='';teamHeroes.forEach((t,i)=>{const col=COLORS[t.color];const pct=Math.min(100,charge[i]/t.skill.max*100);const d=document.createElement('div');d.className='unit hero '+col.key+(ready[i]?' ready':'');
  d.innerHTML=`${ready[i]?('<div class="sbadge amu">'+icSkill()+'</div>'):''}<div class="stand"><div class="ring ring-${col.key}"></div><div class="ava">${heroFig(col.key,t.ref.grade)}</div></div><div class="uname">${t.name}</div><div class="ubar"><i class="sgauge-fill" style="width:${pct}%"></i></div>`;
  d.addEventListener('click',()=>useSkill(i));teamEl.appendChild(d);});}
function addCharge(count){teamHeroes.forEach((t,i)=>{const n=count[t.color];if(n>0&&!ready[i]){charge[i]+=n;if(charge[i]>=t.skill.max){charge[i]=t.skill.max;ready[i]=true;}}});}
function useSkill(i){if(!ready[i]||!playing||busy)return;const t=teamHeroes[i],s=t.skill;
  if(s.type===9){damageEnemy(targetIdx,1200);damageFloats(targetIdx,[{dmg:1200,color:cvar(t.color)}]);enemyPanelShake();}
  else if(s.type===5){enemyAtkDebuff=3;showCombo(s.name+'\nATK nemici −40%');}
  else if(s.type===7){dodge+=2;showCombo(s.name+'\nSchiva ×2');}
  else if(s.type===8){const h=Math.round(partyMax*0.30);partyHp=Math.min(partyMax,partyHp+h);showCombo('+'+h+' ♥');}
  ready[i]=false;charge[i]=0;renderTeam();updatePartyBar();renderEnemies();checkState();}
function renderEnemies(){enemiesEl.innerHTML='';enemies.forEach((e,i)=>{const d=document.createElement('div');d.className='unit foe'+(e.boss?' bossunit':'')+(i===targetIdx&&e.alive?' target':'')+(e.alive?'':' dead');const seed=(e.name?e.name.length:3)+i*3+(battle?battle.w*7+battle.s*3:0);
  d.innerHTML=`<div class="eclock">${e.charge}</div>${enemyAtkDebuff>0?'<div class="edeb">⤵</div>':''}<div class="stand"><div class="ava">${enemyFig(seed,!!e.boss)}</div></div><div class="uname">${e.name}</div><div class="ubar big"><i class="hpfill" style="width:${e.hp/e.max*100}%"></i></div><div class="ehp">${e.hp}/${e.max}</div>`;
  d.addEventListener('click',()=>{if(e.alive){targetIdx=i;renderEnemies();}});enemiesEl.appendChild(d);});}
function damageFloats(i,entries){const card=enemiesEl.children[i];if(!card)return;const rc=card.getBoundingClientRect();entries.forEach((e,idx)=>{const f=document.createElement('div');f.className='dmgfloat';f.textContent=e.dmg;f.style.color=e.color;f.style.left=(rc.left+rc.width/2+(idx-(entries.length-1)/2)*18)+'px';f.style.top=(rc.top+6)+'px';document.body.appendChild(f);
  f.animate([{opacity:0,transform:'translate(-50%,8px) scale(.7)'},{opacity:1,transform:'translate(-50%,-18px) scale(1.15)',offset:.3},{opacity:0,transform:'translate(-50%,-54px) scale(1)'}],{duration:1000,delay:idx*70,easing:'ease-out'});setTimeout(()=>f.remove(),1120+idx*70);});}
function screenFlash(){let f=document.getElementById('sflash');if(!f){f=document.createElement('div');f.id='sflash';document.body.appendChild(f);}f.style.animation='none';void f.offsetWidth;f.style.animation='sflash .5s ease-out';}
function boardImpact(){const w=boardEl.parentElement;w.classList.remove('impact');void w.offsetWidth;w.classList.add('impact');}
function fxSpark(x,y,col){const layer=document.getElementById('fxLayer');if(!layer)return;const a=Math.random()*6.28,d=40+Math.random()*55;const s=document.createElement('div');s.className='fx fx-spark';s.style.left=x+'px';s.style.top=y+'px';s.style.background=col;s.style.color=col;s.style.setProperty('--dx',Math.cos(a)*d+'px');s.style.setProperty('--dy',Math.sin(a)*d+'px');layer.appendChild(s);setTimeout(()=>s.remove(),620);}
function fxSpecialBig(kind,r,c){const el=cellEl(r,c);if(!el)return;const wrap=boardEl.parentElement.getBoundingClientRect();const rc=el.getBoundingClientRect();const x=rc.left-wrap.left+rc.width/2,y=rc.top-wrap.top+rc.height/2;const RC=['#ff3b2b','#ffd21e','#3ddc46','#2ea6ef'];
  fxAt(x,y,'fx-shock');fxAt(x,y,'fx-shock');
  if(kind==='bomb'||kind==='dynamite'){fxAt(x,y,'fx-flash');fxAt(x,y,'fx-ring');fxAt(x,y,'fx-ring2');for(let i=0;i<18;i++)fxSpark(x,y,RC[i%4]);}
  else if(kind==='sword'||kind==='doublesword'){fxAt(x,y,'fx-slash',45);fxAt(x,y,'fx-slash',-45);if(kind==='doublesword'){fxAt(x,y,'fx-slash',0);fxAt(x,y,'fx-slash',90);}for(let i=0;i<14;i++)fxSpark(x,y,RC[i%4]);}
  else if(kind==='bow'||kind==='multiarrow'){const n=kind==='multiarrow'?16:10;for(let i=0;i<n;i++)fxArrow(x,y);for(let i=0;i<8;i++)fxSpark(x,y,RC[i%4]);}
  else if(kind==='potion'){fxAt(x,y,'fx-heal');fxAt(x,y,'fx-heal-ring');for(let i=0;i<10;i++)fxSpark(x,y,'#6bffa0');}}
function dealColorDamage(count,mult){const idx=targetIdx;const per=count.map((n,i)=>Math.round(n*colorAtk[i]*mult));const total=per.reduce((a,b)=>a+b,0);
  teamHeroes.forEach((tt,i)=>{if(count[tt.color]>0){const el=teamEl.children[i];if(el){el.classList.add('flash');setTimeout(()=>el.classList.remove('flash'),260);}}});
  if(total>0){damageEnemy(idx,total);renderEnemies();const entries=[];per.forEach((d,i)=>{if(d>0)entries.push({dmg:d,color:cvar(i)});});damageFloats(idx,entries);enemyPanelShake();}return total;}
function endMove(){updatePartyBar();advanceClocks();checkState();busy=false;}
function resolveChain(){busy=true;
  const chainCells=chain.map(p=>({r:p.r,c:p.c,cell:grid[p.r][p.c]}));
  const bonusCells=chainCells.filter(o=>o.cell.t==='special'||o.cell.t==='super');
  const baseCount=[0,0,0,0];chainCells.forEach(o=>{if(o.cell.t==='class')baseCount[o.cell.el]++;});
  const totalCount=baseCount.slice();
  // scoppiano solo i colori/portali selezionati; le bonus restano e CADRANNO
  chainCells.forEach(o=>{if(o.cell.t!=='special'&&o.cell.t!=='super'){const el=cellEl(o.r,o.c);if(el)el.classList.add('pop');}});
  bonusCells.forEach(o=>{o.cell._fire=true;});
  setTimeout(()=>{ // FASE 1: rimuovi i colori, poi tutto (bonus incluse) cade
    chainCells.forEach(o=>{if(o.cell.t!=='special'&&o.cell.t!=='super')grid[o.r][o.c]=null;});
    applyGravity();render(true);
    dealColorDamage(baseCount,1);
    if(!bonusCells.length){addCharge(totalCount);renderTeam();endMove();return;}
    setTimeout(()=>{ // FASE 2: solo DOPO che le bonus sono cadute, attivano il potere
      const seed=[];
      for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r][c];if(cell&&cell._fire){delete cell._fire;seed.push({r,c,kind:cell.kind});}}
      activateWeapons(seed,totalCount);
    },460);
  },240);}
function activateWeapons(seed,totalCount){const K=(r,c)=>r+','+c;let combo=0,firedCount=0,heal=0;const HITC=['#ff3b2b','#ffd21e','#3ddc46','#2ea6ef'];
  function effect(kind,r,c,seen){if(kind==='potion'){heal+=Math.round(partyMax*0.10);return[];}
    if(kind==='bow'||kind==='multiarrow'){const shots=kind==='multiarrow'?9:5;const pool=[];for(let rr=0;rr<ROWS;rr++)for(let cc=0;cc<COLS;cc++){if(grid[rr][cc]&&!seen.has(K(rr,cc)))pool.push([rr,cc]);}const out=[];for(let n=0;n<shots&&pool.length;n++)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out;}
    return patternCells(kind,r,c);}
  function finishAll(){if(firedCount>=3){const sk=['dynamite','multiarrow','doublesword'][Math.floor(Math.random()*3)];const c=Math.floor(Math.random()*COLS);grid[0][c]={t:'super',kind:sk};fallMap['0,'+c]=-1;render(true);}addCharge(totalCount);renderTeam();endMove();}
  function runWave(wave){
    if(!wave.length){finishAll();return;}
    combo++;firedCount+=wave.length;screenFlash();boardImpact();
    showCombo(combo>1?('CATENA \u00d7'+combo):'ARMA!');
    wave.forEach((b,idx)=>setTimeout(()=>fxSpecialBig(b.kind,b.r,b.c),idx*70));
    const clears=[];const seen=new Set(wave.map(b=>K(b.r,b.c)));
    wave.forEach(b=>{effect(b.kind,b.r,b.c,seen).forEach(([rr,cc])=>{const cell=grid[rr][cc];if(!cell)return;const k=K(rr,cc);if(seen.has(k))return;seen.add(k);if(cell.t==='special'||cell.t==='super'){cell._fire=true;}else{clears.push([rr,cc]);}});});
    const count=[0,0,0,0];clears.forEach(([r,c])=>{const cell=grid[r][c];if(cell&&cell.t==='class')count[cell.el]++;});
    for(let i=0;i<4;i++)totalCount[i]+=count[i];
    clears.forEach(([r,c],i)=>{const el=cellEl(r,c);if(el){el.style.setProperty('--hc',HITC[i%4]);el.classList.add('hit');}});
    for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r][c];if(cell&&cell._fire){const el=cellEl(r,c);if(el)el.classList.add('armed');}}
    setTimeout(()=>{clears.forEach(([r,c])=>{const el=cellEl(r,c);if(el){el.classList.remove('hit');el.classList.add('pop');}});wave.forEach(b=>{const cur=grid[b.r][b.c];if(cur&&!cur._fire){const el=cellEl(b.r,b.c);if(el)el.classList.add('pop');}});},340);
    setTimeout(()=>{clears.forEach(([r,c])=>{grid[r][c]=null;});wave.forEach(b=>{const cur=grid[b.r][b.c];if(cur&&!cur._fire)grid[b.r][b.c]=null;});
      applyGravity();render(true);dealColorDamage(count,Math.min(2.6,1+combo*0.22));
      if(heal>0){partyHp=Math.min(partyMax,partyHp+heal);showCombo('+'+heal+' \u2665');heal=0;}
      const nw=[];for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){const cell=grid[r][c];if(cell&&cell._fire){delete cell._fire;nw.push({r,c,kind:cell.kind});}}
      setTimeout(()=>runWave(nw),nw.length?340:60);},620);}
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
function rollLoot(w){const gr=Math.random();let mult,glabel='';
  if(gr<0.02){mult=12;glabel="Montagna d'oro!";}else if(gr<0.10){mult=5;glabel='Grande bottino';}else if(gr<0.30){mult=2;}else{mult=1;}
  const gold=Math.max(1,Math.round(battle.gold*mult));const items=[];const rb=Math.min(0.25,w*0.006);const drops=1+(Math.random()<0.35?1:0);
  for(let i=0;i<drops;i++){if(Math.random()<0.22)continue;const rr=Math.random();let rarity;
    if(rr<0.015+rb*0.3)rarity='leggendario';else if(rr<0.09+rb)rarity='raro';else if(rr<0.32+rb)rarity='non comune';else rarity='comune';
    const pool=ITEMS.filter(it=>it.rarity===rarity);if(pool.length)items.push(pool[Math.floor(Math.random()*pool.length)]);}
  return {gold,glabel,items};}
function winStage(){playing=false;const {w,s}=battle;const firstClear=!cleared.has(w+'-'+s);cleared.add(w+'-'+s);
  const gi=globalIndex(w,s);if(gi+1>unlocked&&gi+1<=GLOBAL)unlocked=Math.max(unlocked,gi+1);
  const loot=rollLoot(w);gold+=loot.gold;loot.items.forEach(it=>{inv[it.id]=(inv[it.id]||0)+1;});
  const lvups=[];
  teamHeroes.forEach(t=>{const h=t.ref;if(h.level>=MAXLV)return;h.exp+=battle.reward;while(h.level<MAXLV&&h.exp>=expToNext(h)){h.exp-=expToNext(h);h.level++;lvups.push(`${h.name} → Lv ${h.level}`);}});
  saveState();const done=cleared.size>=GLOBAL;
  showOverlay(done?'Brikeaz è salva':'Stage completato!',`+${battle.reward} EXP a ogni eroe`,[],done?'Rigioca':'Alla mappa',()=>{hideOverlay();showScreen('map');renderMap();});
  const el=$('ovLvups');if(el){let h='';if(loot.glabel)h+=`<div style="color:#ffd45e;font-weight:700;margin-bottom:3px">🏆 ${loot.glabel}</div>`;h+=`<div style="margin-bottom:5px;font-size:14px">${COIN} <b>+${loot.gold}</b> oro</div>`;if(loot.items.length){h+='<div class="lootbox">';loot.items.forEach(it=>{h+=`<div class="lootrow" style="color:${RARCOL[it.rarity]}"><span>${it.icon} ${it.name}</span><span style="opacity:.65;font-size:10px">${it.rarity} · vendi ${it.sell}</span></div>`;});h+='</div>';}if(lvups.length)h+='<div style="margin-top:7px;color:#bfe6c9">'+lvups.map(x=>'⭐ '+x).join('<br>')+'</div>';el.innerHTML=h;}}
function showCombo(t){const c=$('comboText');c.innerHTML=t.replace(/\n/g,'<br>');c.classList.remove('show');void c.offsetWidth;c.classList.add('show');}
function showOverlay(t,x,lvups,btn,cb){$('ovTitle').textContent=t;$('ovText').textContent=x;$('ovLvups').innerHTML=(lvups&&lvups.length)?('⭐ '+lvups.join('<br>⭐ ')):'';const b=$('ovBtn');b.textContent=btn;b.onclick=cb;$('overlay').classList.add('show');}
function hideOverlay(){$('overlay').classList.remove('show');}
