/* main.js — Ingresso: input, navigazione, init.
 * Spirit Stones: Remastered — codice originale; immagini fornite dall'autore. */

boardEl.style.gridTemplateColumns='repeat(7,1fr)';
boardEl.addEventListener('pointerdown',e=>{if(!playing||busy)return;const p=cellAt(e.clientX,e.clientY);if(p){e.preventDefault();startChain(p);}});
window.addEventListener('pointermove',e=>{if(!dragging)return;const p=cellAt(e.clientX,e.clientY);if(p)extendChain(p);});
window.addEventListener('pointerup',()=>{if(dragging)endChain();});
window.addEventListener('pointercancel',()=>{if(dragging)endChain();});
window.addEventListener('resize',()=>{if(dragging)drawLinks();});
$('toTeamBtn').onclick=()=>{let w=Math.floor(unlocked/STAGES_PER_WORLD),s=unlocked%STAGES_PER_WORLD;if(w>=WORLDS.length){w=WORLDS.length-1;s=STAGES_PER_WORLD-1;}pendingStage={w,s};showScreen('team');renderRoster();};
$('teamBack').onclick=()=>{showScreen('map');renderMap();};
$('pauseBtn').onclick=()=>{playing=false;showScreen('map');renderMap();};
$('shopBtn').onclick=openShop;
$('modalClose').onclick=()=>{$('modal').classList.remove('show');renderRoster();};
$('resetBtn').onclick=()=>{if(confirm('Azzerare tutti i progressi salvati?')){Store.del('ss_save');location.reload();}};
(async()=>{await loadState();initMotes();applyImageAssets();renderHUD();renderMap();showScreen('map');})();
