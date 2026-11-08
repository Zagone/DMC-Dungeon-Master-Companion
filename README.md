# Dungeon Master Companion — Crooked Realms R4.1

Progetto completo Vue 3 + Vite. R4.1 estende Crooked Realms a Libreria, Panoramica, Sessioni, Conduzione, Battaglia, Note, Bestiario, editor e archivio. Cornici illustrate più sottili nelle schermate operative, superfici uniformi sotto i dati, placche condivise e controlli nativi. La Dashboard R4 conserva panorama e card. Testi e dati rimangono HTML/Vue.

## Avvio in VS Code

Aprire questa cartella, quella che contiene `package.json`. Richiede Node.js `^22.18.0 || >=24.12.0`, come nella R3.

```sh
npm ci
npm run dev
```

Per la versione di produzione:

```sh
npm run build
npm run preview
```

Aprire l'indirizzo indicato da Vite. `dist/` contiene anche la build verificata alla consegna. `node_modules/` è esclusa dallo ZIP e viene ricreata da `npm ci`.

## Organizzazione R4.1

- `src/components/ui/`: componenti presentazionali riutilizzabili, senza dipendenze dallo stato delle campagne.
- `src/assets/ui/crooked-realms-r4/`: cornice e placche WebP trasparenti, traversa SVG e documentazione degli asset.
- `src/stili/dashboard.css`: unico foglio di composizione della Dashboard, caricato con scope dalla vista.
- `src/stili/design-system.css`: token condivisi, incluso il font illustrato R4.
- `src/stili/layout-globale.css`: navbar e strumenti esistenti; altezze della barra conservate.
- `docs/RESOCONTO_R4_1.md`: scelte, modifiche, risultati effettivi e limiti delle verifiche.

Routing, stato, catalogo SRD, salvataggi e import/export conservano i sorgenti R3. I dati salvati nel browser non sono inclusi nel progetto: per trasferirli fra origini o dispositivi usare l'archivio DMC già presente nell'app. Mantenere dominio e porta abituali per accedere allo stesso localStorage.

L'avviso Vite sul chunk del Bestiario superiore a 500 kB è già presente nella R3. Il catalogo resta differito e non viene richiesto dalla sola Dashboard. Nessuna dipendenza applicativa è stata aggiunta.
