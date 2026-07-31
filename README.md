# Spirit Stones: Remastered

Puzzle-RPG "connetti le gemme" con squadra di eroi, mondi/stage, negozio ed
evoluzione. Gira interamente nel browser, senza build né dipendenze runtime.
Tutta la grafica è **originale** (SVG/CSS): nessun asset di terze parti.

## Avvio rapido

- **Modo semplice:** apri `index.html` con doppio clic (funziona da `file://`).
- **Con server locale** (consigliato per GitHub Pages-like):
  ```bash
  npm run dev        # avvia un server statico su http://localhost:5173
  ```

## Architettura

Il codice è diviso per responsabilità. I file JS sono classici (non-module) e
vengono caricati in ordine da `index.html`; condividono lo scope globale.

| File | Responsabilità |
|------|----------------|
| `js/persistence.js` | Salvataggio/caricamento (window.storage → localStorage → memoria) |
| `js/data.js` | Costanti, curve statistiche, **eroi**, **equipaggiamento**, **mondi/stage**, stato di gioco |
| `js/dom.js` | Riferimenti DOM, helper, gestione schermate, tema e particelle di sfondo |
| `js/assets.js` | **Asset vettoriali**: icone (valuta/abilità/elementi), figure eroi/mostri, medaglioni mappa |
| `js/ui.js` | Mappa dei mondi, roster/squadra, dettaglio eroe, negozio, evoluzione |
| `js/board.js` | **Motore del puzzle**: griglia, gravità, catena/adiacenze, pattern delle bonus, rendering |
| `js/battle.js` | **Combattimento**: risoluzione catena, cascata armi, effetti, nemici, abilità, danni |
| `js/main.js` | Punto d'ingresso: input, navigazione, inizializzazione |
| `styles/main.css` | Tutto lo stile |

## Dove intervenire

- **Nuovo eroe** → aggiungi un oggetto in `HEROES` (`js/data.js`) e un colore
  capelli in `HAIR` (`js/assets.js`).
- **Nuovo mondo/stage** → `WORLDS` e `makeStage()` in `js/data.js`; il
  medaglione in `worldMedallion()` (`js/assets.js`).
- **Nuova gemma/elemento** → `COLORS` (`js/data.js`) + simbolo in `ICON`
  (`js/assets.js`) + stile `.c-<key>` in `styles/main.css`.
- **Nuova bonus/arma** → `patternCells()` e `effect()` in `board.js`/`battle.js`.
- **Nuovo pezzo d'equipaggiamento** → `EQUIP` in `js/data.js`.

## Pubblicare su GitHub

```bash
git init
git add .
git commit -m "Spirit Stones: Remastered — prima scomposizione modulare"
git branch -M main
git remote add origin https://github.com/<utente>/spirit-stones-remastered.git
git push -u origin main
```

**GitHub Pages:** Settings → Pages → Source: `Deploy from a branch` → branch
`main`, cartella `/ (root)`. Il gioco sarà su
`https://<utente>.github.io/spirit-stones-remastered/`.

## Prossimi passi consigliati

Per implementazioni più solide, il passo naturale è migrare a **moduli ES** con
`import`/`export` e un bundler (es. Vite), separando stato, motore e vista con
confini espliciti. La suddivisione attuale è già pronta a questo: ogni file è un
"dominio" candidato a diventare un modulo.

## Note su asset e diritti

Personaggi, mostri, gemme e icone sono **disegni originali** in SVG generati da
codice. Il pacchetto di asset usato come riferimento di stile **non** è incluso
nel repository. Scegli tu la licenza (vedi `LICENSE`).
