# Piano di regressione — DMC R4.2

Branch: `audit/r4-2-affidabilita-dati`. Questo documento descrive test da eseguire; **non** certifica che siano stati superati.

## Preparazione
- Eseguire `npm ci`, `npm run build` e `npm run dev` in locale.
- Usare una copia di backup JSON delle campagne reali prima di effettuare prove distruttive.
- Eseguire i test su campagne fittizie, preferibilmente in un profilo browser separato.

## Casi di test

| ID | Area | Procedura | Risultato atteso |
| --- | --- | --- | --- |
| DMC-01 | Creazione | Creare una campagna e ricaricare la pagina | Campagna e metadati presenti |
| DMC-02 | Salvataggio | Aggiungere sessione, scena, PNG, note; ricaricare | Tutti i dati conservati |
| DMC-03 | Incontro | Caricare un incontro con più specie e quantità | Numero e tipi corretti; PG invariati; nemici precedenti sostituiti |
| DMC-04 | Iniziativa | Portare la battaglia al round 3 e caricare un altro incontro | Verificare esplicitamente la politica desiderata: nuovo combattimento dal round 1 oppure mantenimento motivato |
| DMC-05 | Backup | Esportare una campagna e importarla come copia | Campagne indipendenti, sessioni e incontri equivalenti |
| DMC-06 | Backup corrotto | Importare JSON con `sessioni` non array o nemico con quantità non valida | Rifiuto senza modificare dati esistenti |
| DMC-07 | Quota storage | Simulare `localStorage.setItem` fallito durante salvataggio | Messaggio di errore; dati esistenti preservati |
| DMC-08 | Eliminazione parziale | Simulare fallimento scrittura metadati dopo eliminazione dati | Nessuna campagna orfana; nessuna perdita silenziosa |
| DMC-09 | Navigazione | Modificare campagna e navigare tra sezioni e campagne | Stato coerente e nessuna modifica persa |
| DMC-10 | Compatibilità | Importare un backup versione 1 e uno versione 2 | Comportamento coerente con le regole di migrazione |

## Rischi individuati nel codice
1. `CampagnaView.vue`: `eliminaCampagnaAttiva()` non controlla il risultato di `eliminaCampagna(id)` dopo `eliminaDatiCampagna(id)`. Occorre una procedura di eliminazione coordinata, con gestione degli errori.
2. `GestioneSessioni.vue`: `caricaIncontro()` sostituisce `dati.value.nemici` ma non reimposta `iniziativa.round`. Definire e testare la semantica di un nuovo incontro.
3. `statoDatiCampagna.js`: watcher `deep: true, flush: 'sync'` scrive l'intero oggetto a ogni mutazione reattiva; misurare il costo prima di introdurre debounce o batching.

## Criteri di accettazione
- Nessuna perdita di campagne, sessioni o bestiario personale nei casi di errore.
- Nessuna regressione nel caricamento di incontri multipli.
- Backup importati ed esportati compatibili con le versioni supportate.
- Build riuscita e verifiche manuali registrate prima del merge su `main`.
