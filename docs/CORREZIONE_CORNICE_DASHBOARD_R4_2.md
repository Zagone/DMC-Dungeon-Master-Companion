# DMC — Correzione mirata cornice Dashboard R4.2

## Problema
La cornice decorativa delle tre card principali conteneva un riempimento quasi opaco nell'area centrale. Essendo usata tramite `border-image` sopra le immagini, la sezione superiore e inferiore dell'asset produceva fasce scure indesiderate e interferiva con il badge «IN SVILUPPO».

## Intervento
È stato corretto esclusivamente `src/assets/ui/crooked-realms-r4/cornice-ardesia.webp`: l'apertura interna è ora trasparente, conservando i bordi lapidei, le scheggiature e gli accenti ambra. Non sono stati cambiati template, logica Vue, routing, salvataggi o CSS delle altre schermate.

## Verifica
Trasparenza RGBA del centro dell'asset: alpha 0. Archivio ZIP verificato. Non è stato possibile effettuare `npm run build` in questo ambiente: `npm ci --offline` richiede pacchetti assenti dalla cache e l'ambiente usa Node 22.16.0, mentre il progetto richiede almeno Node 22.18.0 (o Node >=24.12.0).

## Installazione
Estrarre l'intero progetto in una nuova cartella; nella cartella contenente `package.json` eseguire `npm install` e `npm run dev`. Se si sta verificando una versione precedente nel browser, effettuare un refresh forzato con Ctrl+Shift+R.
