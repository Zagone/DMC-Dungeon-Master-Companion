# DMC — Crooked Realms R4.1

Lavoro avviato il 1 novembre 2026 sulla Dashboard R4 e completato il 6 novembre 2026. La revisione estende l’identità alle schermate operative con cornici sottili, tipografia condivisa e superfici uniformi per la lettura dei dati.

## Criteri visivi

- La Dashboard e gli accessi principali mantengono le cornici illustrate R4.
- La Libreria e i collegamenti della Panoramica riprendono la cornice illustrata in scala più contenuta.
- Sessioni, Conduzione, Battaglia, Note, Bestiario, editor e archivio utilizzano una cornice SVG d’ardesia sottile, suddivisa in nove parti, con superficie centrale uniforme.
- Il design system riutilizza le placche WebP R4 in ambra per le azioni principali e in ardesia per quelle secondarie. Danno/eliminazione e cura mantengono colori semantici e superfici piane, più semplici da distinguere durante il gioco.
- I titoli utilizzano caratteri serif di sistema. Per etichette, dati, statistiche, PF, campi e testi lunghi il carattere è sans serif. I numeri dei campi utilizzano cifre tabulari.
- Le forme irregolari si concentrano ai margini. Testi e numeri sono su fondi uniformi.

Ambra `#E5A65C`, ardesia `#242D38`, ombra `#141923` e crema `#F2E5CE` sono conservate. Gli stati verdi e rossi hanno token di testo più chiari, distinti dai colori dei bordi e degli indicatori. Il colore è sempre accompagnato dalle etichette già presenti.

## Implementazione e responsabilità

Il foglio `design-system.css` definisce le superfici riutilizzabili `.dmc-pannello`, la variante per gli accessi `.dmc-pannello--rilievo`, i pulsanti e le rispettive varianti semantiche, i campi e i token. I componenti mantengono composizione, spaziature, responsive, stato e interazioni locali. Il trasferimento delle dichiarazioni di materiale nel design system riduce le duplicazioni nei selettori locali.

L’SVG nuovo `src/assets/ui/crooked-realms-r4/pannello-operativo.svg` è scritto come asset vettoriale originale. Il suo centro è trasparente e lascia al CSS la superficie uniforme. Le illustrazioni raster provengono dai tre WebP R4. Le placche hanno colori di base leggibili anche durante il caricamento degli asset. La suddivisione mantiene le estremità proporzionate con etichette e contenuti lunghi.

I controlli utilizzano elementi HTML nativi. La navigazione interna riserva spazio al contorno del focus e i pannelli lasciano visibili menu e modali.

Cronometro e dadi si trovano nell’angolo inferiore destro su desktop. Su mobile occupano uno spazio riservato nella barra superiore, così i comandi della pagina restano accessibili durante lo scorrimento. I pannelli si aprono sopra gli strumenti su desktop e sotto la barra su mobile. Le modali condivise hanno priorità visiva superiore alla navbar.

## File modificati rispetto alla R4

| File | Intervento |
| --- | --- |
| `src/stili/design-system.css` | Materiali condivisi, placche, campi, tipografia, colori di testo semantici e modali |
| `src/stili/navigazione-campagna.css` | Placche dei tab, selezione ambra e spazio per il focus |
| `src/stili/layout-globale.css` | Posizione degli strumenti su desktop e mobile e dimensioni dei pannelli |
| `src/App.vue` | Solo classe di superficie sui pannelli dei due strumenti |
| `src/views/LibreriaView.vue` | Cornici delle campagne, campi e modale |
| `src/views/CampagnaView.vue` | Classi dei controlli, campi, collegamento alla scena e modale |
| `src/components/GestionePanoramica.vue` | Pannelli e accessi alle sezioni |
| `src/components/GestioneSessioni.vue` | Preparazione, Conduzione, pannelli narrativi e comandi con stati più leggibili |
| `src/components/GestioneBattaglia.vue` | Pannelli e comandi, con trattamento distinto per danno, cura e turno attivo |
| `src/components/GestioneNote.vue` | Superfici per note e bottino e placche per i comandi |
| `src/components/GestioneBestiario.vue` | Filtri, schede, importazione, categorie e controlli |
| `src/components/EditorCreatura.vue` | Superficie esterna, campi e comandi, senza nuove cornici annidate |
| `src/components/SceltaCreazioneCreatura.vue` | Dialogo, scelte di creazione, campi e comandi |
| `src/components/SchedaCreatura.vue` | Titoli delle sezioni e struttura semantica dei dettagli delle statistiche |
| `src/components/GestioneArchivioDMC.vue` | Archivio, anteprima e comandi di import/export |
| `README.md`, documentazione asset | Istruzioni e responsabilità aggiornate |

I nuovi file comprendono l’SVG operativo, questo resoconto e gli esiti in `docs/verifiche-r4.1/`. Gli aggiornamenti dei controlli condivisi si applicano anche alla Dashboard.

## Conservazione funzionale

Il confronto con R4 conferma l’equivalenza degli script, degli eventi, dei binding, dei testi e delle condizioni dei template. Le differenze nei template riguardano le classi CSS e il passaggio a `dd` per i dettagli delle statistiche nella scheda creatura.

Il confronto byte per byte con R4 copre i file JavaScript di dati, stato, routing e avvio, `package.json` e il lockfile. Le prove funzionali su campagne, catalogo, homebrew, salvataggi e import/export impiegano dati sintetici in contesti browser isolati.

## Verifiche effettivamente eseguite

- Build Vite 8.3.4 riuscita con Node.js 24.22.1. ESLint completato per le viste e i componenti Vue.
- 35 verifiche di integrità rispetto alla R4 e 92 controlli browser. I controlli browser comprendono 39 prove di regressione, cinque casi con contenuti lunghi e 48 prove operative.
- Il collaudo operativo copre PF, condizioni, turni, scelta della scena, note, bottino, persistenza, ricerca SRD e creazione homebrew. Le prove di regressione coprono anche import ed export.
- Verifiche responsive a partire da 320 px, incluse le barre fisse, l’accesso a cronometro e dadi e le modali. Esaminate 14 schermate su desktop e mobile.
- Axe non ha rilevato violazioni nei casi sottoposti alla scansione. I risultati segnalano controlli incompleti sul contrasto e su alcuni attributi ARIA.
- I dettagli sono in `docs/verifiche-r4.1/`.

Il collaudo ha portato a correggere il contrasto dei pulsanti del Bestiario e dell’etichetta «Visitata», la semantica dell’elenco delle statistiche e lo spazio riservato al focus nella navigazione. Le categorie e i comandi espansi conservano un’indicazione ambra riconoscibile.

## Dimensioni delle build

| Risorsa | R4 | R4.1 |
| --- | ---: | ---: |
| CSS iniziale | 17.462 B | 20.685 B |
| JavaScript iniziale | 108.396 B | 108.422 B |
| CSS Campagna | 38.995 B | 35.040 B |
| CSS Bestiario | 25.892 B | 24.167 B |
| JavaScript catalogo e stato Bestiario | 986.729 B | 986.729 B |

Le misure riportano la dimensione in byte dei file minificati, a parità di lockfile. Il bundler incorpora il nuovo SVG nel CSS. La revisione concentra le regole comuni nel CSS iniziale e riduce le duplicazioni nelle viste operative.

## Limiti residui

- Il collaudo browser è circoscritto a Chromium headless 133.0.6943.0 con viewport simulati.
- Il contrasto su alcune superfici illustrate e alcuni attributi ARIA richiedono una verifica manuale.
- La valutazione di usabilità con Dungeon Master esterni resta da svolgere.
- Rimane l’avviso Vite sul chunk Bestiario superiore a 500 kB, già presente. Il catalogo resta differito e invariato.
- Restano gli avvisi npm sugli strumenti di sviluppo già documentati per R4.
- I font di sistema possono differire leggermente tra Windows, macOS e Linux.

Il progetto completo contiene asset integrati, sorgenti, configurazione, lock, build `dist/` e documentazione. `node_modules/`, test con percorsi interni, helper e catture browser non sono inclusi. Per usare gli stessi salvataggi mantenere origine e porta del browser abituali, oppure trasferire le campagne tramite il backup DMC.
