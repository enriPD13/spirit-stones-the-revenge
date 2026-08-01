# Spirit Stones: Remastered

Puzzle-RPG "connetti le gemme" con squadra di eroi, mondi/stage, negozio ed
evoluzione. Gira interamente nel browser, senza build né dipendenze runtime.

Il tabellone è un **nido d'ape a colonne** (colonne incolonnate, colonne alterne
sfasate in basso di mezza cella). Le grafiche (sprite eroi/nemici/boss, sfondi,
icone) sono **fornite dall'autore** e incorporate nel codice.

## Avvio

- Apri `index.html` con doppio clic (funziona da `file://`), oppure:
  ```bash
  npm run dev        # server statico su http://localhost:5173
  ```

## Architettura (script classici caricati in ordine, scope condiviso)

| File | Responsabilità |
|------|----------------|
| `js/persistence.js` | Salvataggio/caricamento (window.storage → localStorage → memoria) |
| `js/data.js` | Costanti, curve statistiche, eroi, equipaggiamento, mondi/stage, stato |
| `js/dom.js` | Riferimenti DOM, schermate, tema, sfondi, **barra di navigazione**, particelle |
| `js/assets.js` | **Immagini incorporate** (IMG/IMG3, base64), icone, figure/sprite, medaglioni |
| `js/ui.js` | Mappa dei mondi, roster/squadra, dettaglio eroe, negozio, evoluzione |
| `js/board.js` | Motore del puzzle: griglia a colonne, gravità, catene, pattern delle bonus |
| `js/battle.js` | Combattimento: catena, cascata armi (**cadi-poi-attiva**), effetti, nemici, danni |
| `js/main.js` | Punto d'ingresso: input, navigazione, inizializzazione |
| `styles/main.css` | Tutto lo stile |

> Nota: le immagini sono incorporate in `js/assets.js` come data-URI base64, così
> il progetto è autosufficiente (nessun file esterno richiesto). Se in futuro vuoi
> alleggerire il repo, si possono esternalizzare in `assets/img/` e sostituire i
> data-URI con percorsi relativi.

## Dove intervenire

- **Eroe** → `HEROES` in `js/data.js`; sprite in `heroFig()` (`js/assets.js`).
- **Nemico/Boss** → `enemyFig()` in `js/assets.js`; ondate in `makeStage()`.
- **Mondo/Stage** → `WORLDS` e `makeStage()` in `js/data.js`.
- **Gemma/elemento** → `COLORS` (`data.js`) + `ICON` (`assets.js`) + `.c-<key>` (CSS).
- **Bonus/arma** → `patternCells()` (`board.js`) ed `effect()` in `activateWeapons` (`battle.js`).
- **Disposizione tabellone** → `.bcol` / `render()` per la geometria a colonne.

## Pubblicare su GitHub

```bash
git init && git add . && git commit -m "Spirit Stones: Remastered"
git branch -M main
git remote add origin https://github.com/<utente>/spirit-stones-remastered.git
git push -u origin main
```

GitHub Pages: Settings → Pages → branch `main`, cartella `/ (root)`.

## Note

Personaggi, sfondi e icone sono grafiche originali dell'autore. Nessun asset di
terze parti è incluso. Scegli tu la licenza (vedi `LICENSE`).
