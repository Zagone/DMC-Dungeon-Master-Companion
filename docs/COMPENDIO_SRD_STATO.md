# Compendio SRD 5.2.1 — stato di integrazione R4.2

> **Nota di lettura (R4.2):** questo documento è un registro cronologico dell'integrazione. La tabella di copertura seguente descrive la fase iniziale e non lo stato finale. Gli aggiornamenti più recenti, inclusi gli 82 oggetti di equipaggiamento d'avventura e le categorie strutturate, sono documentati nelle sezioni successive. La verifica editoriale dell'intero SRD non è conclusa.

## Obiettivo e decisioni UX

Il compendio è una pagina autonoma `/#/compendio`, non un pannello della Dashboard. La struttura approvata prevede categorie, ricerca globale, filtri contestuali, ordinamento, elenco e schede espandibili. Il riferimento visivo fornito dall'utente è RollCamp, senza copiarne il design o gli asset. I collegamenti automatici nelle scene **sono sospesi**.

## Fonte

Il file di riferimento è `IT_SRD_CC_v5.2.1_copia.pdf`, versione italiana dell'SRD 5.2.1 fornita per il progetto. L'indice degli incantesimi è stato ricavato dalle intestazioni delle descrizioni, pp. 121–201. Le 15 condizioni sono quelle elencate a p. 206; le sintesi delle regole provengono dal Glossario delle regole, pp. 202–219. Le altre categorie contengono indici delle sezioni del documento, non schede normative complete.

## Copertura iniziale (storico prima delle integrazioni successive)

| Categoria | Voci | Profondità attuale |
|---|---:|---|
| Incantesimi | 339 | Nome, livello, scuola e pagina SRD per tutti; **20 schede** con metadati sintetici integrati nel codice. Un archivio JSON esterno permette di caricare **339 descrizioni integrali** estratte dal PDF, con tempo di lancio, gittata, componenti e durata. L’archivio è strutturalmente verificato ma non revisionato manualmente voce per voce |
| Condizioni | 15 | Tutte le condizioni del glossario; sintesi e pagina |
| Regole | 29 | Selezione di regole operative; sintesi e pagina |
| Classi | 12 | Indice, nome e pagina |
| Specie | 9 | Indice, nome e pagina |
| Origini | 4 | Indice dei background, nome e pagina |
| Talenti | 4 | Indice delle tipologie, non dei singoli talenti |
| Equipaggiamento | 9 | Indice delle sezioni, non dei singoli oggetti |
| Oggetti magici | 6 | Indice delle sezioni, non dei singoli oggetti |

Il totale iniziale era **427 voci** di diversa granularità; non rappresentava 427 schede complete e non deve essere usato come totale attuale, poiché le integrazioni successive hanno aggiunto numerose schede individuali. I mostri restano nel bestiario separato con 330 schede verificate, non duplicate nel compendio.

## Filtri e prestazioni

- Ricerca su nomi e sintesi, insensibile a maiuscole e segni diacritici.
- Filtro per categoria.
- Per gli incantesimi: livello da 0 a 9, scuola, tempo di lancio, componenti e selezione delle schede con dettagli disponibili. I filtri tempo/componenti sono utili soprattutto dopo l'importazione dell'archivio completo.
- Ordinamento alfabetico A–Z / Z–A.
- Paginazione di 35 risultati per pagina per evitare elenchi lunghi.
- Dati statici importati dalla vista lazy-loaded: non vengono scritti in localStorage e non modificano campagne o bestiario.

## Verifiche

Il file `tests/compendio-srd.test.js` controlla: 339 incantesimi e ID univoci, 15 condizioni, ID globali univoci, categorie, ricerca e filtri per livello/scuola. Il workflow `.github/workflows/verifiche-r4-2.yml` esegue test, ESLint, Oxlint e build.

## Passi ancora necessari prima di chiamarlo «compendio completo»

1. Revisionare editorialmente le 339 schede integrali estratte dal PDF; verificare impaginazione, paragrafi, tabelle e rimandi. L'archivio JSON è già disponibile per l'importazione.
2. Integrare le descrizioni integrali e le tabelle di classi, specie, background, talenti, equipaggiamento e oggetti magici.
3. Attivare filtri avanzati solo quando i rispettivi metadati sono completi.
4. Eseguire un collaudo manuale desktop/mobile, navigazione da tastiera e lettori di schermo.
5. Non sviluppare collegamenti contestuali senza una nuova autorizzazione dell'utente.

## Attribuzione obbligatoria

Quest'opera include materiale tratto dal System Reference Document 5.2.1 ("SRD 5.2.1") di Wizards of the Coast LLC, disponibile all'indirizzo https://www.dndbeyond.com/srd. Il SRD 5.2.1 è concesso in licenza ai sensi della licenza di attribuzione 4.0 Internazionale di Creative Commons, disponibile all'indirizzo https://creativecommons.org/licenses/by/4.0/legalcode.

## Archivi statici delle nove categorie (novembre 2026)

È stato prodotto `DMC_compendio_tutte_categorie.zip` con `public/compendio/manifest.json` e nove file JSON:
`incantesimi.json`, `classi.json`, `specie.json`, `origini.json`, `talenti.json`, `equipaggiamento.json`, `oggetti-magici.json`, `regole.json`, `condizioni.json`.

Gli **incantesimi** contengono 339 schede strutturate con descrizioni estratte dal PDF; le altre otto categorie contengono **testi integrali per pagina PDF**, con lettura per colonne, e **non** schede individuali già normalizzate. Le categorie regole e condizioni condividono intenzionalmente alcune pagine del glossario.

L'app ora carica gli incantesimi automaticamente da `public/compendio/incantesimi.json` e permette di aprire il testo della pagina SRD per le altre categorie, tramite `src/dati/caricamentoSezioniSRD.js`. Il loader usa fetch on demand e cache delle richieste. In mancanza dell'asset, le voci sintetiche già presenti continuano a essere visualizzate.

**Stato aggiornato:** la cartella `public/compendio/` con i nove archivi JSON e il manifest è già presente nel repository. La precedente istruzione di estrazione dello ZIP è superata e conservata solo come nota storica.

**Lavoro residuo:** normalizzare e verificare le singole voci delle otto categorie, estrarre le tabelle in dati strutturati, correggere eventuali errori di estrazione e aggiungere test di corrispondenza testuale al PDF. Non dichiarare il compendio completo sulla sola base della presenza dei file.

## Verifiche e miglioramenti successivi all'integrazione

- Verificata sul repository la presenza dei nove JSON e del manifest sotto `public/compendio/`.
- Corretto il merge dei 339 incantesimi: vengono preservati `id`, `categoria` e `sintesi` dell'indice, necessari a ricerca e apertura delle schede.
- La consultazione delle classi include ora tutte le pagine pertinenti alla classe selezionata, fino all'inizio della classe successiva; il testo è identificato con il numero di pagina originale.
- Isolata la visualizzazione del testo fonte per la singola voce selezionata.
- Aggiunti test automatici per intervalli delle classi.

**Non ancora concluso:** il testo delle classi è un estratto pluripagina, non una scheda normalizzata per singola capacità; specie, origini, talenti, equipaggiamento, oggetti magici, condizioni e regole sono ancora consultabili prevalentemente per pagina. Il PDF contiene tabelle e impaginazione a colonne che richiedono verifiche prima di trasformarle in dati puntuali. Non usare la presenza degli archivi come indicatore di completezza editoriale.

## Segmentazione specie giocabili (novembre 2026)

Aggiunto `src/dati/estrazioneSpecieSRD.js`: suddivide il testo estratto da `specie.json` in nove sezioni, individuando i titoli delle specie. La vista mostra ora il testo per specie, preservando la trascrizione estratta senza reinterpretare i tratti. Sono stati aggiunti test su tutti e nove i nomi e sui riferimenti di pagina.

**Limite metodologico:** le pagine del PDF sono impaginate a colonne e il testo può proseguire tra pagine; la suddivisione per titolo è automatica e non certifica che ogni frase appartenga alla specie corretta. Le schede restano marcate `verificato: false`. Per il rilascio definitivo occorre una verifica puntuale con il PDF e la normalizzazione dei campi (tipo, taglia, velocità, tratti).

## Correzione verifica specie su PDF originale

La precedente suddivisione automatica del testo per titoli è stata **ritirata dalla UI**: l'estrazione della pagina mescolava le colonne e poteva attribuire parti di una specie a un'altra. Il PDF italiano SRD 5.2.1, pp. 94–97, è stato ricontrollato con estrazione a layout di colonne. Ora `estrazioneSpecieSRD.js` fornisce per tutte e nove le specie: tipo di creatura, taglia, velocità, indice dei tratti e pagine. La vista espone questi campi invece del testo contaminato. I nomi dei tratti sono un indice; **non** equivalgono a una verifica del contenuto normativo di ciascun tratto, delle sottoscelte e delle tabelle.

## Equipaggiamento strutturato — novembre 2026

Sono state introdotte le tabelle normalizzate `src/dati/armiSempliciSRD.js` (14 armi semplici, p. 103) e `src/dati/armiArmatureSRD.js` (24 armi da guerra, pp. 103–104; 12 armature e 1 scudo, p. 104). La vista `CompendioView.vue` espone ora **51 schede individuali** (38 armi, 13 armature/scudi), oltre alla tabella monetaria. Le righe sono state confrontate con il testo del PDF originale e coperte da test di integrità; la verifica automatica non sostituisce il controllo visivo di ogni tabella.

### Attività non ancora concluse

- Equipaggiamento: strumenti, equipaggiamento d'avventura, cavalcature, veicoli e spese.
- Oggetti magici: identificazione e trascrizione delle singole voci (l'archivio corrente è per pagina).
- Classi: progressioni, privilegi, sottoclassi e tabelle non ancora normalizzati.
- Regole e condizioni: trascrizione integrale e verifica dei testi.
- Specie e talenti: controllo editoriale delle descrizioni normative e delle tabelle.
- Revisione dell'interfaccia e test end-to-end sul browser.

**Nota:** il superamento della CI attesta il funzionamento tecnico dei test e della build, non la completezza né la correttezza editoriale dell'intero compendio.

## Strumenti SRD — novembre 2026

Aggiunte 25 schede individuali in `src/dati/strumentiSRD.js`: 17 strumenti da artigiano e 8 altri strumenti (SRD italiano pp. 105–107). Ogni scheda include nome, categoria, caratteristica, prezzo, peso e pagina. La vista compendio include un filtro «Strumenti» e conserva l'ordinamento per gruppi nell'equipaggiamento. I dettagli normativi su utilizzi, creazioni e varianti **non sono ancora trascritti**: le schede sono esplicitamente marcate `dettagliCompleti:false`. Test automatici in `tests/strumenti-srd.test.js`.

## Equipaggiamento d'avventura — novembre 2026

Prima tranche iniziale: 14 oggetti (da Abiti da viaggiatore a Borsa per componenti), dati di peso e costo confrontati con la tabella p. 108 e sintesi derivate dalla p. 107. Le schede individuali sono in `src/dati/equipaggiamentoAvventuraSRD.js`, integrate nel filtro Equipaggiamento d’avventura; test in `tests/equipaggiamento-avventura-srd.test.js`. Le sintesi non sostituiscono le descrizioni normative e l'elenco complessivo della tabella non è ancora esaurito.

## Indicizzazione oggetti magici — novembre 2026

Introdotto `src/dati/indiceOggettiMagiciSRD.js`: riconoscimento automatico di titoli seguiti da una riga tipologica con rarità nel corpus di pagine 237–288. Le voci risultanti sono ricercabili nel compendio, con categoria, rarità, indicazione di sintonia e pagina. L'indice è **esplorativo e incompleto**: non garantisce copertura di tutti gli oggetti, può contenere errori di segmentazione e non include descrizioni normative verificate. I dettagli restano consultabili nell'archivio per pagina. Test: `tests/indice-oggetti-magici-srd.test.js`. La categoria non deve essere considerata editorialmente completa.

## Caricamento differito — novembre 2026

La vista `CompendioView.vue` ora carica gli archivi estesi di Incantesimi, Specie, Talenti e Oggetti magici solo alla selezione della rispettiva categoria oppure alla prima ricerca globale. Richieste concorrenti deduplicate, cache già presente nel servizio, indicatore di caricamento accessibile con `role=status`. Il pulsante Azzera ripristina anche filtri rarità, sintonia, tempo e componenti. L'ottimizzazione riduce il traffico iniziale, non cambia il formato dei dati né il grado di verifica delle schede.

## Completamento dell'indice dell'equipaggiamento d'avventura — novembre 2026

Integrate **82 voci individuali** della tabella «Equipaggiamento d'avventura» a p. 108 del PDF SRD italiano 5.2.1. Il file `src/dati/equipaggiamentoAvventuraSRD.js` conserva per ogni voce denominazione, peso e costo. Le prime 14 voci includono le sintesi già presenti; per le restanti 68 voci sono disponibili **solo dati tabellari verificati**, mentre descrizioni e regole d'uso devono ancora essere normalizzate dalle pp. 107–112. Le voci con peso/costo «Variabile» conservano tale indicazione della tabella, senza inventare un valore.

Aggiornato `tests/equipaggiamento-avventura-srd.test.js` per copertura numerica, unicità dei nomi e campioni tabellari. **Non** considerare l'intero equipaggiamento completato: mancano ancora la revisione delle descrizioni, le varianti degli oggetti, cavalcature e veicoli, le spese e altre tabelle. Il compendio non trasforma automaticamente questi dati parziali in schede normative complete.

## Cavalcature, finimenti e veicoli — novembre 2026

Aggiunte 25 schede tabellari in `src/dati/cavalcatureVeicoliSRD.js`, confrontate con le tabelle originali del PDF italiano SRD 5.2.1, pp. 113–114: **8 cavalcature e animali** (nome, capacità di trasporto, costo), **10 finimenti e veicoli da tiro** (peso e costo) e **7 veicoli aerei e imbarcazioni** (velocità, equipaggio, passeggeri, carico in tonnellate, CA, PF, soglia di danno e costo). Le tre categorie sono ricercabili e filtrabili separatamente all'interno di Equipaggiamento nel Compendio. Gli identificativi sono indipendenti dalle altre voci. I dati tabellari sono distinti dalle regole descrittive che rimangono consultabili nella fonte; `dettagliCompleti:false` evita di segnalarle come schede normative esaustive. Test di consistenza in `tests/cavalcature-veicoli-srd.test.js`. Pipeline test/lint/build superata (run 43276219156).

## [2026-11-13] R4.4 — Consultazione delle singole voci senza pagina grezza

**Obiettivo dell'intervento.** Ridurre la dipendenza dal pulsante «Consulta testo della pagina SRD»: il testo pertinente è ora mostrato direttamente all'apertura della scheda nel Compendio, senza un blocco HTML `<pre>` contenente pagine PDF intere.

**Base codice.** Ramo `feature/r4-2-gestione-dati-integrazione`, commit `ab4c50c`. Modifiche sviluppate nel ramo `feature/r4-4-compendio-strutturato` (PR #2). I dati delle campagne, l'import/export e il bestiario delle 330 creature già verificate non sono stati modificati.

### Componenti
- `src/dati/letturaStrutturataSRD.js`: normalizzazione dei testi sorgente, segmentazione delle singole voci e preparazione dei blocchi tipografici; nessun HTML ricavato direttamente dal contenuto.
- `src/components/TestoCompendioSRD.vue`: visualizzazione leggibile e responsiva di intestazioni, paragrafi, elenchi e rubriche delle regole, con token di Crooked Realms.
- `src/views/CompendioView.vue`: voci arricchite, caricamento differito, contenuto integrato al dettaglio, rimozione del vecchio pulsante e del visualizzatore della pagina.
- `src/dati/indiceOggettiMagiciSRD.js`: riconoscimento di categorie di armi con specificazione tra parentesi e rarità al femminile.
- `tests/compendio-strutturato.test.js`: test di delimitazione del testo, categoria, assenza di contaminazione di esempi noti e rimozione del visualizzatore.

### Copertura estratta (non equivale alla revisione editoriale)
- **Glossario:** 146 voci segmentate dalle pp. 202–218, di cui 15 condizioni; intestazioni e relative pagine confrontate con l'impaginazione originale.
- **Specie:** tutte e 9 le sezioni individuate, con eventuale continuazione tra pagine.
- **Origini:** individuate le 4 sezioni di background.
- **Equipaggiamento d'avventura:** descrizioni individuate per 80 delle 82 voci tabellari; le due pergamene magiche rimangono da trattare con le voci degli oggetti magici.
- **Strumenti:** estratte descrizioni, utilizzi, creazioni e varianti per tutte le 25 schede tabellari (pp. 105–107), ancora soggette a controllo editoriale.
- **Oggetti magici:** indicizzazione ampliata; le descrizioni sono estrazioni automatiche non ancora verificate. L'algoritmo interrompe il testo anche in corrispondenza di intestazioni non indicizzate.
- **Classi:** consultazione inline dell'intervallo di pagine pertinenti alla classe (non ancora ogni privilegio normalizzato in una scheda).
- **Incantesimi:** rimane la disponibilità dei 339 testi già estratti, ora leggibili attraverso il componente tipografico.

### Verifiche effettuate
GitHub Actions, run [43333381996](https://github.com/Zagone/DMC-Dungeon-Master-Companion/actions/runs/43333381996): **104 test superati**, ESLint e Oxlint superati, **build di produzione riuscita**. Si tratta di verifiche automatiche; non certificano la qualità editoriale dei testi estratti né sostituiscono il test UX con Dungeon Master esterni.

### Limiti residui — da non nascondere
1. L'estrazione di parole spezzate su righe del PDF può contenere imperfezioni; la corrispondenza di ogni frase con l'SRD richiede revisione editoriale.
2. Le tabelle di progressione delle classi e alcune tabelle estese non sono ancora rappresentate da dati tabellari strutturati e verificati.
3. Due voci dell'equipaggiamento non hanno una descrizione individuale associata dall'estrattore.
4. Non tutti gli oggetti magici individuati sono stati verificati individualmente, né è certificata la copertura esaustiva del catalogo.
5. Alcune voci del vecchio indice possono restare sintetiche quando non esiste un'associazione testuale affidabile.
6. Il collaudo visivo e con lettori di schermo su dispositivi reali e i test con utenti esterni restano da svolgere.

**Criterio per dichiarare il Compendio completo:** tutte le voci verificate individualmente contro il PDF SRD 5.2.1, prive di contaminazione, con effetti e tabelle pertinenti leggibili senza riferimenti esterni. Questo criterio non è ancora soddisfatto.

## R4.5 — Correzioni della qualità di consultazione (13 novembre 2026)

### Problemi risolti

1. **Separazione dei contenuti di specie.** La pagina SRD 97 intrecciava il testo dell'Umano con la tabella dei retaggi immondi del Tiefling. L'estrattore rimuove entrambi i frammenti tabellari dal corpo dell'Umano, conserva le descrizioni pertinenti a ciascuna specie e mantiene la tabella dei retaggi tramite i dati strutturati delle opzioni specie.
2. **Classi e origini.** Le sezioni complete vengono caricate per categoria e mostrate direttamente all'interno della scheda, senza la necessità di aprire una trascrizione per pagina. La formattazione delle tabelle di progressione di tutte le classi rimane tuttavia da verificare.
3. **Ricerca.** Oltre ai nomi e alle sintesi, l'indice testuale considera le descrizioni già disponibili, i testi delle specie, delle origini, delle classi e dei talenti. L'indice è computato a partire dal catalogo caricato, così da evitare la normalizzazione ripetuta di ogni voce durante la digitazione.
4. **Richieste concorrenti.** Cambiare scheda, filtro o categoria invalida la richiesta di contenuto SRD precedente per impedire che una risposta tardiva venga associata alla nuova selezione.
5. **Oggetti magici.** L'indice e il testo di ciascuna voce derivano ora da un unico riconoscitore delle intestazioni, capace di gestire titoli su due righe e descrittori tipologici su più righe. Il controllo sull'archivio attuale individua **250 voci con descrizioni associate**, rispetto alle 228 proposte dal precedente indicizzatore. Sono stati recuperati, tra gli altri, *Amuleto anti-individuazione e localizzazione*, *Anello della caduta morbida*, *Lama della fortuna*, *Lama del sole* e *Lanterna della rivelazione*. Il parser evita alcuni falsi titoli prodotti dalle tabelle e dal testo su colonne.

### Verifiche

- Test regressione aggiuntivi: contaminazione tra Tiefling e Umano, inclusione dei contenuti di classi e origini, ricerca, intestazioni degli oggetti magici su più righe e separazione delle relative descrizioni.
- GitHub Actions sul ramo di sviluppo, [esecuzione 43413842626](https://github.com/Zagone/DMC-Dungeon-Master-Companion/actions/runs/43413842626): **107 test superati, ESLint e Oxlint superati, build Vite di produzione riuscita**.
- Non sono state modificate le strutture persistenti di campagne, sessioni e bestiario o le procedure di import/export.

### Limiti e prossime verifiche editoriali

- La segmentazione automatica delle descrizioni degli oggetti magici **non è una revisione editoriale** e non certifica l'esaustività delle voci rispetto a tutte le intestazioni presenti nel PDF.
- Le trascrizioni PDF possono contenere sillabe spezzate, parole con separazioni improprie e tabelle non strutturate. I controlli automatici non escludono tutti questi difetti.
- Le progressioni delle dodici classi richiedono ancora la ricostruzione e la validazione delle tabelle in formato dati.
- La revisione voce per voce della corrispondenza fra contenuto mostrato e SRD ufficiale italiana 5.2.1 resta indispensabile prima di qualificare il Compendio come completo.
- Il benchmark UX comparativo con RollCamp e Make a Master è un'attività distinta, già registrata nel progetto, e non viene considerato eseguito da questa integrazione.
