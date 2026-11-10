# Compendio SRD 5.2.1 — stato di integrazione R4.2

## Obiettivo e decisioni UX

Il compendio è una pagina autonoma `/#/compendio`, non un pannello della Dashboard. La struttura approvata prevede categorie, ricerca globale, filtri contestuali, ordinamento, elenco e schede espandibili. Il riferimento visivo fornito dall'utente è RollCamp, senza copiarne il design o gli asset. I collegamenti automatici nelle scene **sono sospesi**.

## Fonte

Il file di riferimento è `IT_SRD_CC_v5.2.1_copia.pdf`, versione italiana dell'SRD 5.2.1 fornita per il progetto. L'indice degli incantesimi è stato ricavato dalle intestazioni delle descrizioni, pp. 121–201. Le 15 condizioni sono quelle elencate a p. 206; le sintesi delle regole provengono dal Glossario delle regole, pp. 202–219. Le altre categorie contengono indici delle sezioni del documento, non schede normative complete.

## Copertura effettiva

| Categoria | Voci | Profondità attuale |
|---|---:|---|
| Incantesimi | 339 | Nome, livello, scuola, pagina SRD per tutti; **20 schede** arricchite con tempo di lancio, gittata, componenti, durata e sintesi verificata. Non testo integrale |
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
- Per gli incantesimi: livello da 0 a 9, scuola e selezione delle sole schede con metadati verificati.
- Ordinamento alfabetico A–Z / Z–A.
- Paginazione di 35 risultati per pagina per evitare elenchi lunghi.
- Dati statici importati dalla vista lazy-loaded: non vengono scritti in localStorage e non modificano campagne o bestiario.

## Verifiche

Il file `tests/compendio-srd.test.js` controlla: 339 incantesimi e ID univoci, 15 condizioni, ID globali univoci, categorie, ricerca e filtri per livello/scuola. Il workflow `.github/workflows/verifiche-r4-2.yml` esegue test, ESLint, Oxlint e build.

## Passi ancora necessari prima di chiamarlo «compendio completo»

1. Estendere a tutti i 339 incantesimi i metadati delle prime 20 schede e integrare il testo completo, inclusi gli effetti a livelli superiori.
2. Integrare le descrizioni integrali e le tabelle di classi, specie, background, talenti, equipaggiamento e oggetti magici.
3. Attivare filtri avanzati solo quando i rispettivi metadati sono completi.
4. Eseguire un collaudo manuale desktop/mobile, navigazione da tastiera e lettori di schermo.
5. Non sviluppare collegamenti contestuali senza una nuova autorizzazione dell'utente.

## Attribuzione obbligatoria

Quest'opera include materiale tratto dal System Reference Document 5.2.1 ("SRD 5.2.1") di Wizards of the Coast LLC, disponibile all'indirizzo https://www.dndbeyond.com/srd. Il SRD 5.2.1 è concesso in licenza ai sensi della licenza di attribuzione 4.0 Internazionale di Creative Commons, disponibile all'indirizzo https://creativecommons.org/licenses/by/4.0/legalcode.
