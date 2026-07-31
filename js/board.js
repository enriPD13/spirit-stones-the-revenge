/* board.js — Motore puzzle: griglia, gravita, catena/adiacenze, pattern bonus, rendering.
 * Spirit Stones: Remastered — codice e grafica originali. */

function genCell(){const r=Math.random();if(r<0.03)return{t:'portal'};if(battle&&(battle.s>0||battle.w>0)&&r<0.06)return{t:'stone'};if(r<0.16){return{t:'special',kind:['sword','bomb','bow','potion'][Math.floor(Math.random()*4)]};}return{t:'class',el:rnd4()};}
function newGrid(){grid=[];for(let r=0;r<ROWS;r++){grid.push([]);for(let c=0;c<COLS;c++)grid[r][c]=genCell();}}
function isColored(cell){return cell.t==='class'||cell.t==='special'||cell.t==='super';}
function cellClass(cell){if(cell.t==='portal')return'c-portal';if(cell.t==='stone')return'c-stone';if(cell.t==='special')return'c-special special';if(cell.t==='super')return'c-special super';return'c-'+COLORS[cell.el].key;}
function cellInner(cell){
  if(cell.t==='portal')return '<svg class="ic" viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 1-7 3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 8a4 4 0 1 0 3 6.7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>';
  if(cell.t==='stone')return '<svg class="ic" viewBox="0 0 24 24"><path d="M6 9l3-4 6 1 3 4-2 7-7 1-4-5z" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>';
  if(cell.t==='special'||cell.t==='super')return svgIc(ICON[cell.kind]||ICON.sword);
  return svgIc(ICON[COLORS[cell.el].key]);
}
function render(animate){boardEl.innerHTML='';for(let r=0;r<ROWS;r++){const row=document.createElement('div');row.className='brow '+(r%2?'odd':'even');for(let c=0;c<COLS;c++){const cell=grid[r][c];const d=document.createElement('div');d.className='cell '+cellClass(cell);d.dataset.r=r;d.dataset.c=c;d.innerHTML=cellInner(cell);row.appendChild(d);}boardEl.appendChild(row);}
  if(animate){const cells=boardEl.querySelectorAll('.cell');const first=cells[0];if(first){const h=first.getBoundingClientRect().height+5;const moved=[];cells.forEach(el=>{const src=fallMap[el.dataset.r+','+el.dataset.c];if(src===undefined)return;const dist=(+el.dataset.r)-src;if(dist>0){el.style.transition='none';el.style.transform='translateY('+(-dist*h)+'px)';moved.push(el);}});boardEl.getBoundingClientRect();requestAnimationFrame(()=>{moved.forEach(el=>{el.style.transition='transform .3s cubic-bezier(.25,1,.4,1)';el.style.transform='';});});}}}
function cellAt(x,y){const el=document.elementFromPoint(x,y);if(!el)return null;const c=el.closest('.cell');if(!c||!boardEl.contains(c))return null;return{r:+c.dataset.r,c:+c.dataset.c};}
function adjacent(a,b){return Math.abs(a.r-b.r)<=1&&Math.abs(a.c-b.c)<=1&&!(a.r===b.r&&a.c===b.c);}
function inChain(p){return chain.some(q=>q.r===p.r&&q.c===p.c);}
function chainState(){let started=false,activeColor=null,colorOpen=false;for(const p of chain){const cell=grid[p.r][p.c];if(cell.t==='portal'){colorOpen=true;}else if(cell.t==='special'||cell.t==='super'){}else{if(!started){activeColor=cell.el;started=true;colorOpen=false;}else if(colorOpen){activeColor=cell.el;colorOpen=false;}}}return{started,activeColor,colorOpen};}
function startChain(p){const t=grid[p.r][p.c].t;if(t==='stone'||t==='special'||t==='super')return;chain=[p];dragging=true;highlight();}
function extendChain(p){if(!dragging)return;if(inChain(p)){if(chain.length>=2){const prev=chain[chain.length-2];if(prev.r===p.r&&prev.c===p.c){chain.pop();highlight();}}return;}
  const cell=grid[p.r][p.c];if(cell.t==='stone')return;if(!adjacent(chain[chain.length-1],p))return;
  if(cell.t==='portal'||cell.t==='special'||cell.t==='super'){chain.push(p);highlight();return;}const st=chainState();if(!st.started||st.colorOpen||cell.el===st.activeColor){chain.push(p);highlight();}}
function highlight(){document.querySelectorAll('.cell.link').forEach(el=>el.classList.remove('link'));chain.forEach(p=>{const el=boardEl.querySelector(`.cell[data-r="${p.r}"][data-c="${p.c}"]`);if(el)el.classList.add('link');});drawLinks();}
function drawLinks(){linkLayer.innerHTML='';if(chain.length<2)return;const wrap=boardEl.parentElement;const b=wrap.getBoundingClientRect();linkLayer.setAttribute('viewBox',`0 0 ${b.width} ${b.height}`);
  const pts=chain.map(p=>{const el=cellEl(p.r,p.c);const r=el.getBoundingClientRect();return{x:r.left-b.left+r.width/2,y:r.top-b.top+r.height/2};});
  const st=chainState();const color=st.activeColor!=null?cvar(st.activeColor):'#ffffff';const path=document.createElementNS('http://www.w3.org/2000/svg','path');
  path.setAttribute('d','M'+pts.map(p=>`${p.x} ${p.y}`).join(' L'));path.setAttribute('fill','none');path.setAttribute('stroke',color);path.setAttribute('stroke-width','8');path.setAttribute('stroke-linecap','round');path.setAttribute('stroke-linejoin','round');path.setAttribute('opacity','.9');path.style.filter=`drop-shadow(0 0 8px ${color})`;linkLayer.appendChild(path);}
function clearVisual(){document.querySelectorAll('.cell.link').forEach(el=>el.classList.remove('link'));linkLayer.innerHTML='';}
function endChain(){dragging=false;clearVisual();const cc=chain.filter(p=>grid[p.r][p.c].t==='class').length;if(chain.length>=3&&cc>=2&&playing&&!busy)resolveChain();chain=[];}
function patternCells(kind,r,c){const out=[];const push=(rr,cc)=>{if(rr>=0&&cc>=0&&rr<ROWS&&cc<COLS)out.push([rr,cc]);};
  if(kind==='bomb'){for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)push(r+dr,c+dc);}
  else if(kind==='dynamite'){for(let dr=-2;dr<=2;dr++)for(let dc=-2;dc<=2;dc++)if(dr||dc)push(r+dr,c+dc);}
  else if(kind==='sword'){for(let d=1;d<ROWS;d++){push(r+d,c+d);push(r-d,c-d);push(r+d,c-d);push(r-d,c+d);}}
  else if(kind==='doublesword'){for(let d=1;d<ROWS;d++){push(r+d,c+d);push(r-d,c-d);push(r+d,c-d);push(r-d,c+d);push(r+d,c);push(r-d,c);push(r,c+d);push(r,c-d);}}return out;}
function cellEl(r,c){return boardEl.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`);}
let fallMap={};
function applyGravity(){fallMap={};for(let c=0;c<COLS;c++){let write=ROWS-1;for(let r=ROWS-1;r>=0;r--){if(grid[r][c]!==null){if(write!==r){grid[write][c]=grid[r][c];grid[r][c]=null;}fallMap[write+','+c]=r;write--;}}let above=-1;for(let r=write;r>=0;r--){grid[r][c]=genCell();fallMap[r+','+c]=above;above--;}}}
