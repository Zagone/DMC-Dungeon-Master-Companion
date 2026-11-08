# DMC — Crooked Realms R4

Revisione della Dashboard sul progetto completo R3 allegato. Implementazione e verifiche: 1 novembre 2026.

## Risultato e specifica visiva

Le tre card principali e le CTA impiegano asset illustrati originali, con contorni inchiostrati, pietra d'ardesia, angoli diversi fra loro e pochi accenti ambra. Il materiale dell'interfaccia è ardesia; gli oggetti di legno nelle immagini restano parte delle illustrazioni R3 già esistenti.

La palette usa i token esistenti: ardesia `#242D38`, ambra `#E5A65C`, ombra `#141923`, crema `#F2E5CE`. Il nuovo token `--dmc-font-illustrated` definisce un carattere serif di sistema per titoli e placche. Il testo operativo conserva il font leggibile del design system. Non sono richiesti font esterni.

La cornice è suddivisa in nove parti tramite `border-image`: gli angoli mantengono una dimensione fissa di 45 px, mentre lati e corpo si adattano al contenuto. La cornice sopra il media non usa `fill`, così lascia visibile l'immagine Vue reale. Un separatore SVG collega immagine e corpo. Le placche hanno estremità fisse e un centro estensibile; etichette e frecce rimangono elementi reali. Non viene scalata un'immagine dell'intera card, né usato il mockup come sfondo dell'interfaccia.

La quantità dei dettagli è contenuta: nessuna borchia ripetuta, spirale romboidale o decorazione aggiunta senza funzione. Le frecce sono integrate nelle placche. Le righe recenti utilizzano la placca d'ardesia con una cornice più sottile, conservando nomi, ordine, stati e date provenienti dai dati.

Il panorama originale è invariato e applicato alla radice della Dashboard a tutta larghezza, con oscuramento e dissolvenza. La composizione passa da tre colonne a una sotto 801 px. Il titolo principale è proporzionato alle card. La navbar mantiene struttura, rotte, logo e altezze R3 (58 px desktop, 54 px mobile); sui telefoni resta il logo con il nome accessibile del collegamento, lasciando visibili i tre tab.

## Organizzazione e file

| File modificato | Motivo |
| --- | --- |
| `src/views/DashboardView.vue` | Usa i componenti illustrati al posto del markup duplicato; importa un solo foglio di layout con scope; conserva gestori, computed, modale e archivio |
| `src/App.vue` | Sostituisce soltanto i glifi di cronometro/dado con SVG riutilizzabili e importa il relativo componente |
| `src/stili/layout-globale.css` | Rifinitura leggera della navbar e tab attivo; marchio compatto sui telefoni |
| `src/stili/design-system.css` | Aggiunge il token tipografico R4 senza cambiare i font delle altre viste |
| `index.html` | Lingua italiana, titolo del prodotto e riferimento alla favicon realmente presente; elimina riferimenti mancanti |
| `README.md` | Istruzioni effettive per apertura, installazione e avvio del progetto completo |

| File/cartella aggiunto | Responsabilità |
| --- | --- |
| `src/components/ui/CardAvventura.vue` | Card presentazionale riutilizzabile: immagine, titolo, descrizione, stato e CTA; nessun import dello stato applicativo |
| `src/components/ui/PlaccaAzione.vue` | Placca ambra/ardesia con etichetta HTML e icona integrata |
| `src/components/ui/IconaDirezione.vue` | Freccia e lucchetto SVG |
| `src/components/ui/IconaStrumento.vue` | Cronometro e dado SVG, indipendenti dai font |
| `src/stili/dashboard.css` | Composizione, hero, recenti, responsive e modale della sola Dashboard |
| `src/assets/ui/crooked-realms-r4/cornice-ardesia.webp` | Cornice illustrata originale, 82.092 byte |
| `src/assets/ui/crooked-realms-r4/placca-ambra.webp` | CTA primaria originale, 19.294 byte |
| `src/assets/ui/crooked-realms-r4/placca-ardesia.webp` | CTA secondaria e recenti, 17.760 byte |
| `src/assets/ui/crooked-realms-r4/traversa-ardesia.svg` | Separatore strutturale originale |
| `src/assets/ui/crooked-realms-r4/README.md` | Misure, suddivisione e prompt degli asset Imagegen integrati |
| `docs/RESOCONTO_R4.md`, `docs/verifiche/` | Questo resoconto e gli esiti delle verifiche realmente eseguite |

Gli asset sono importati da sorgenti e CSS attraverso Vite. Le tre nuove immagini pesano complessivamente 119.146 byte, oltre al piccolo SVG. Il panorama, le tre immagini delle card e il logo originali restano byte per byte identici alla R3. Non è introdotta alcuna dipendenza applicativa; `package.json` e `package-lock.json` sono invariati.

## Interazione e compatibilità

Le prime due card restano pulsanti nativi interamente attivabili, come nella R3. La placca interna è uno `span` presentazionale: non ci sono pulsanti o link annidati. La card Esplora rimane un articolo non interattivo con stato «In sviluppo» e indicazione «Prossimamente». La navigazione usa i RouterLink originali.

Il focus da tastiera è esterno alla cornice e non viene ritagliato. Le texture decorative non intercettano click. Hover discreti e transizioni rispettano `prefers-reduced-motion`. La modale conserva il composable R3 per focus iniziale, contenimento del focus, Escape, ripristino del focus e disattivazione dello sfondo; la sua priorità visiva è ora superiore a navbar e strumenti.

Tutti i 14 file di `src/stato/`, `src/dati/` e `src/router/` sono identici ai file R3. Il confronto degli AST degli script di `DashboardView.vue` e `App.vue`, esclusi gli import dei componenti grafici, è identico. Non sono stati modificati modelli, chiavi, migrazioni, persistenza, import/export, routing o contenuti SRD/homebrew. L'archivio e backup usa il componente originale senza modifiche.

## Build e verifiche eseguite

Ambiente: Node.js 24.22.1, dipendenze installate con `npm ci` dal lock R3; Vite 8.3.4. Browser reale automatizzato: Chromium headless 133.0.6943.0, locale it-IT, viewport desktop/tablet/telefono. Le prove usano contesti e dati sintetici isolati, non campagne dell'utente.

- `npm run build`: completato correttamente sulla R3 e sulla R4 finale.
- ESLint senza `--fix` su `App.vue`, `DashboardView.vue` e tutti i nuovi componenti Vue: completato senza errori.
- 39 controlli browser nella suite principale: nessun errore JavaScript o HTTP; immagini caricate; due card interattive e una futura; assenza di controlli annidati; nomi, stati, date, ordine e conteggio campagne coerenti.
- Viewport 320, 390, 620, 768, 801, 1024, 1440 e 1920 px: nessuno scorrimento orizzontale della pagina; sfondo esteso ai due bordi; angoli fissi. I tre tab della navbar sono visibili anche a 320 px.
- Tastiera: Enter e Spazio sulle card; focus visibile; modale con focus iniziale sul nome; Tab e Shift+Tab contenuti; Escape e Annulla; click esterno; ripristino del focus alla card.
- Creazione campagna con Enter: metadati salvati, apertura della nuova campagna e conservazione di nomi/stati delle campagne preesistenti.
- CTA libreria, apertura campagna recente, pannello cronometro e lancio dadi: verificati.
- Dashboard vuota e popolata: verificate. La sola apertura e visualizzazione responsive della Dashboard lascia invariato il localStorage della fixture.
- Export reale di tre campagne, download JSON, caricamento e importazione in un contesto vuoto: verificati nuovi ID, nomi e presenza dei contenuti salvati.
- Il chunk SRD non è richiesto dalla sola Dashboard; viene richiesto dopo la navigazione al Bestiario, dove risultano disponibili le 330 schede. Le operazioni di backup possono richiederlo come già nella R3.
- Cinque controlli aggiuntivi a 320 px con titolo, descrizione e CTA molto lunghi: crescita verticale, angoli a 45 px, testo senza troncamento/sovrapposizione, modale nel viewport e chiusura con Escape.
- Esame visivo delle schermate reali desktop e mobile e delle card su fondo uniforme senza panorama: effettuato. Gli asset illustrati rimangono parte dei componenti anche senza sfondo.
- Axe-core, regole WCAG 2 A/AA e 2.1 AA, Dashboard desktop: zero violazioni rilevate, 23 controlli superati, controllo `color-contrast` incompleto per superfici illustrate. Non equivale a certificazione di conformità.

Gli esiti JSON e il log di build sono inclusi in `docs/verifiche/`. Non è stata eseguita una regressione completa delle schermate operative, che non sono oggetto della revisione.

## Dimensioni misurate

Byte decimali dei file minificati prodotti dalle due build con lo stesso lock e ambiente. Le dimensioni gzip riportate nei JSON sono calcolate localmente con lo stesso metodo per entrambe le revisioni; non sono una misura del trasferimento effettivo su un server.

| Risorsa | R3 | R4 | Nota |
| --- | ---: | ---: | --- |
| CSS Dashboard | 17.561 B | 10.391 B | −40,8%, rimozione degli override sovrapposti |
| JS Dashboard | 5.450 B | 6.627 B | Componenti UI e icone riutilizzabili |
| CSS iniziale | 17.043 B | 17.462 B | Navbar compatta e nuovo token |
| JS iniziale | 106.596 B | 108.396 B | Include le icone SVG degli strumenti |
| Chunk SRD/Bestiario | 986.729 B | 986.729 B | Dimensione invariata, caricamento differito conservato |

La revisione introduce circa 119 kB di immagini UI differite con la Dashboard. Il piccolo incremento JavaScript è esplicito; questa consegna riguarda la resa illustrata e non un nuovo intervento sul catalogo.

## Limiti e criticità residue

- Vite segnala il chunk del Bestiario superiore a 500 kB: avviso già presente nella R3, non bloccante e non rimosso artificialmente. Il codice del catalogo resta invariato.
- Il contrasto su tutte le variazioni delle texture non è certificato da Axe. È stata controllata visivamente la leggibilità, ma occorrono ulteriori misure e una valutazione con utenti per la tesi.
- Le verifiche browser coprono Chromium e viewport simulati. Safari, Firefox, dispositivi fisici, lettori di schermo e una valutazione d'usabilità con Dungeon Master non sono stati testati.
- Le schermate operative mantengono la presentazione R3. Il loro restyling non è stato esteso implicitamente.
- Il font serif di sistema può presentare differenze fra sistemi operativi. Non sono caricate dipendenze tipografiche esterne.
- Gli asset raster hanno una risoluzione finita; alle dimensioni verificate risultano leggibili. Gli angoli conservano la proporzione attraverso la suddivisione a nove parti.

Lo ZIP contiene progetto completo, sorgenti, configurazione, lock, asset finali, documentazione e build `dist/`. Esclude dipendenze installate, riferimenti compositi, file temporanei e dati sintetici nelle sorgenti applicative. Le fixture restano descritte soltanto negli esiti di verifica.
