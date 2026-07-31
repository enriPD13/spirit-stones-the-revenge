/* data.js — Dati/config: costanti, curve statistiche, eroi, equipaggiamento, mondi/stage, stato.
 * Spirit Stones: Remastered — codice e grafica originali. */

/* ===== DATA dai file APK ===== */
const MAXLV=30;
const GRADES=[{star:1,atk1:48,atk30:106,hp1:580,hp30:743},{star:2,atk1:60,atk30:118,hp1:745,hp30:919},{star:3,atk1:72,atk30:130,hp1:890,hp30:1093}];
function statAt(a,b,L){return Math.round(a+(b-a)*(L-1)/(MAXLV-1));}
function heroAtk(h){const g=GRADES[h.grade-1];return statAt(g.atk1,g.atk30,h.level);}
function heroHp(h){const g=GRADES[h.grade-1];return statAt(g.hp1,g.hp30,h.level);}
function expToNext(h){return (9+h.level)*h.grade*3;}
const COLORS=[
  {key:'warrior',name:'Guerriero',glyph:'⚒',special:'sword', skill:{type:9,name:'Colpo Devastante',desc:'Infligge 1200',max:26}},
  {key:'thief',  name:'Ladro',    glyph:'†', special:'bomb',  skill:{type:5,name:'Ombra Snervante',desc:'ATK nemici −40%',max:24}},
  {key:'archer', name:'Arciere',  glyph:'➹', special:'bow',   skill:{type:7,name:"Passo d'Ombra",desc:'Schiva 2 attacchi',max:22}},
  {key:'mage',   name:'Mago',     glyph:'↯', special:'potion',skill:{type:8,name:'Mani Guaritrici',desc:'Cura 30% HP',max:24}},
];
const SP_ICON={sword:'⚔️',bomb:'💣',bow:'🏹',potion:'🧪',doublesword:'⚔️',dynamite:'🧨',multiarrow:'🎇'};
/* equipaggiamento (nomi/prezzi reali da item.json; ATK armi scalati per il range di questo prototipo) */
const EQUIP={
  sword1:{name:'Spada di Legno',slot:'weapon',color:0,atk:12,price:500}, sword2:{name:'Spada Lunga',slot:'weapon',color:0,atk:24,price:1500}, sword3:{name:'Spadone',slot:'weapon',color:0,atk:48,price:4000},
  dagger1:{name:'Pugnale di Legno',slot:'weapon',color:1,atk:12,price:500}, dagger2:{name:'Pugnale da Caccia',slot:'weapon',color:1,atk:24,price:1500}, dagger3:{name:'Stiletto',slot:'weapon',color:1,atk:48,price:4000},
  bow1:{name:'Arco di Legno',slot:'weapon',color:2,atk:12,price:500}, bow2:{name:'Arco Lungo',slot:'weapon',color:2,atk:24,price:1500}, bow3:{name:'Balestra',slot:'weapon',color:2,atk:48,price:4000},
  staff1:{name:'Bastone Magico',slot:'weapon',color:3,atk:12,price:500}, staff2:{name:'Sfera di Vetro',slot:'weapon',color:3,atk:24,price:1500}, staff3:{name:'Sfera di Cristallo',slot:'weapon',color:3,atk:48,price:4000},
  gloves:{name:'Guanti di Cuoio',slot:'acc',color:null,hp:280,price:1000}, mgloves:{name:'Guanti di Metallo',slot:'acc',color:null,hp:320,price:1500}, neck:{name:"Amuleto dell'Eroe",slot:'acc',color:null,hp:500,price:3000}, ring:{name:"Anello dell'Eroe",slot:'acc',color:null,hp:700,price:5000},
};
const WORLDS=[
  {name:'Foresta Marcia',em:'🌲',pool:[['Blightling','👹'],['Rotmaw','🐗'],['Sporeling','🍄'],['Thornback','🦔']]},
  {name:'Palude Cupa',em:'🕸️',pool:[['Gloomfang','🦇'],['Mirewyrm','🐛'],['Bogling','🐸'],['Cinderwing','🐦‍⬛']]},
  {name:'Trono Corrotto',em:'🔥',pool:[['Wraith','👻'],['Golem','🗿'],['Imp','😈'],['Ashmaw','🐉']]},
];
const STAGES_PER_WORLD=6, GLOBAL=WORLDS.length*STAGES_PER_WORLD, BOSS={name:'Custode Corrotto',sprite:'👁️'};
function makeStage(w,s){const boss=(s===STAGES_PER_WORLD-1),world=WORLDS[w],subCount=boss?1:(s>=3?3:2),subs=[];
  for(let sub=0;sub<subCount;sub++){
    if(boss){subs.push([{name:w===2?BOSS.name:world.name+' Signore',sprite:BOSS.sprite,hp:Math.round(2600+w*2200+s*300),dmg:Math.round(240+w*160),every:2}]);}
    else{const cnt=1+((s+sub)%2),arr=[];for(let k=0;k<cnt;k++){const p=world.pool[(s+sub+k)%world.pool.length];arr.push({name:p[0],sprite:p[1],hp:Math.round((320+s*150+w*620)*(1+sub*0.12)),dmg:Math.round(55+s*16+w*70),every:4-((s+sub)%2)});}subs.push(arr);}}
  return {name:`${world.name} · ${s+1}`,subs,reward:18+s*7+w*45,gold:300+s*120+w*500,boss};}
/* ===== STATE ===== */
let HEROES=[
  {id:1,name:'Pyra',color:0,grade:2,face:'🛡️',level:5,exp:0,equip:{weapon:null,acc:null}},
  {id:2,name:'Brand',color:0,grade:1,face:'🔥',level:3,exp:0,equip:{weapon:null,acc:null}},
  {id:3,name:'Vesper',color:1,grade:2,face:'🎭',level:4,exp:0,equip:{weapon:null,acc:null}},
  {id:4,name:'Nyx',color:1,grade:1,face:'🗡️',level:3,exp:0,equip:{weapon:null,acc:null}},
  {id:5,name:'Sylwen',color:2,grade:2,face:'🏹',level:5,exp:0,equip:{weapon:null,acc:null}},
  {id:6,name:'Fenn',color:2,grade:1,face:'🍃',level:2,exp:0,equip:{weapon:null,acc:null}},
  {id:7,name:'Lumen',color:3,grade:2,face:'🔮',level:4,exp:0,equip:{weapon:null,acc:null}},
  {id:8,name:'Cael',color:3,grade:1,face:'💧',level:3,exp:0,equip:{weapon:null,acc:null}},
];
let unlocked=1, cleared=new Set(), gold=3000, selected=[1,3,5,7], owned={};
function saveState(){Store.set('ss_save',{v:2,unlocked,cleared:[...cleared],gold,selected:[...selected],owned,heroes:HEROES.map(h=>({id:h.id,level:h.level,exp:h.exp,grade:h.grade,equip:h.equip}))});}
async function loadState(){const s=await Store.get('ss_save');if(!s)return;
  unlocked=s.unlocked??1;cleared=new Set(s.cleared||[]);gold=s.gold??gold;selected=s.selected||selected;owned=s.owned||{};
  (s.heroes||[]).forEach(hs=>{const h=HEROES.find(x=>x.id===hs.id);if(h){h.level=hs.level;h.exp=hs.exp;h.grade=hs.grade;h.equip=hs.equip||{weapon:null,acc:null};}});}
/* ===== equip helpers ===== */
function equipAtk(h){const w=h.equip&&h.equip.weapon?EQUIP[h.equip.weapon]:null;return w?(w.atk||0):0;}
function equipHp(h){const a=h.equip&&h.equip.acc?EQUIP[h.equip.acc]:null;return a?(a.hp||0):0;}
function effAtk(h){return heroAtk(h)+equipAtk(h);}
function effHp(h){return heroHp(h)+equipHp(h);}
const HAIR={1:'#2a6cd0',2:'#7a4a24',3:'#241a2e',4:'#8a3b7a',5:'#e0c24a',6:'#3a8a4a',7:'#8fd8ff',8:'#2a4a8a'};
