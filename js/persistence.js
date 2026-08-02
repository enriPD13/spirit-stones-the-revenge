/* persistence.js — Persistenza.
 * Spirit Stones: Remastered — codice originale; immagini fornite dall'autore. */

/* ===== persistenza: window.storage → localStorage → memoria ===== */
const Store={mem:{},
  async get(k){try{if(typeof window!=='undefined'&&window.storage&&window.storage.get){const r=await window.storage.get(k,false);return r&&r.value?JSON.parse(r.value):null;}}catch(e){}
    try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch(e){} return this.mem[k]||null;},
  async set(k,val){this.mem[k]=val;const s=JSON.stringify(val);try{if(typeof window!=='undefined'&&window.storage&&window.storage.set){await window.storage.set(k,s,false);return;}}catch(e){}try{localStorage.setItem(k,s);}catch(e){}},
  async del(k){delete this.mem[k];try{if(window.storage&&window.storage.delete){await window.storage.delete(k,false);return;}}catch(e){}try{localStorage.removeItem(k);}catch(e){}}};
