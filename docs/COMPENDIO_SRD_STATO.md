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
