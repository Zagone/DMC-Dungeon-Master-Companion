# Compendio SRD 5.2.1 — stato di integrazione R4.2

## Obiettivo e decisioni UX

Il compendio è una pagina autonoma `/#/compendio`, non un pannello della Dashboard. La struttura approvata prevede categorie, ricerca globale, filtri contestuali, ordinamento, elenco e schede espandibili. Il riferimento visivo fornito dall'utente è RollCamp, senza copiarne il design o gli asset. I collegamenti automatici nelle scene **sono sospesi**.

## Fonte

Il file di riferimento è `IT_SRD_CC_v5.2.1_copia.pdf`, versione italiana dell'SRD 5.2.1 fornita per il progetto. L'indice degli incantesimi è stato ricavato dalle intestazioni delle descrizioni, pp. 121–201. Le 15 condizioni sono quelle elencate a p. 206; le sintesi delle regole provengono dal Glossario delle regole, pp. 202–219. Le altre categorie contengono indici delle sezioni del documento, non schede normative complete.

## Copertura effettiva

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

Totale: **427 voci** di diversa granularità. Non rappresentano 427 schede complete. I mostri restano nel bestiario separato con 330 schede verificate, non duplicate nel compendio.

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

**Azione indispensabile:** estrarre lo ZIP nella radice del progetto e committare la cartella `public/compendio` sul branch `feature/r4-2-gestione-dati-integrazione`. Gli asset JSON **non sono ancora nel repository remoto**. Non usare il vecchio ZIP che conteneva soltanto il file degli incantesimi nella radice di `public`.

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

Prima tranche: 14 oggetti (da Abiti da viaggiatore a Borsa per componenti), dati di peso e costo confrontati con la tabella p. 108 e sintesi derivate dalla p. 107. Le schede individuali sono in `src/dati/equipaggiamentoAvventuraSRD.js`, integrate nel filtro Equipaggiamento d’avventura; test in `tests/equipaggiamento-avventura-srd.test.js`. Le sintesi non sostituiscono le descrizioni normative e l'elenco complessivo della tabella non è ancora esaurito.

## Indicizzazione oggetti magici — novembre 2026

Introdotto `src/dati/indiceOggettiMagiciSRD.js`: riconoscimento automatico di titoli seguiti da una riga tipologica con rarità nel corpus di pagine 237–288. Le voci risultanti sono ricercabili nel compendio, con categoria, rarità, indicazione di sintonia e pagina. L'indice è **esplorativo e incompleto**: non garantisce copertura di tutti gli oggetti, può contenere errori di segmentazione e non include descrizioni normative verificate. I dettagli restano consultabili nell'archivio per pagina. Test: `tests/indice-oggetti-magici-srd.test.js`. La categoria non deve essere considerata editorialmente completa.
