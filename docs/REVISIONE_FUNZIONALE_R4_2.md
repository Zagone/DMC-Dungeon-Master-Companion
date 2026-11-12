# Revisione funzionale R4.2 — campagne e backup

## Ambito
Verifica statica e test automatici della persistenza delle campagne, con priorità a importazione/esportazione JSON e integrità dei dati. Branch: `feature/r4-2-gestione-dati-integrazione`.

## Intervento completato
- `src/stato/archivioDMC.js`: validazione preventiva di sessioni nulle, strutture scena/incontro malformate e indici di selezione non validi.
- `tests/backupDMC.test.js`: test di rifiuto di sessioni e scene corrotte.
- `tests/importazioneBackup.test.js`: test di assenza di mutazioni per selezioni invalide.
- Compatibilità dei backup v1/v2 preservata.
- Pipeline automatica: test, ESLint, Oxlint e build superati.

## Da verificare manualmente
1. Creazione, apertura, modifica, chiusura e riapertura di una campagna con refresh del browser.
2. Creazione di sessioni e scene, passaggio da preparazione a conduzione.
3. Caricamento di incontri con più tipologie di nemici e verifica dell'iniziativa.
4. Esportazione JSON, eliminazione locale, reimportazione e confronto di scene, PNG, bottino, note e mostri homebrew.
5. Simulazione di spazio locale esaurito e comportamento dei messaggi di errore.
6. Navigazione fra campagne e refresh su rotte interne.

I test automatizzati non sostituiscono le verifiche manuali dell'interfaccia, della persistenza nel browser e della conduzione di una battaglia.

## Funzionalità pianificata: generazione campagne tramite ChatGPT

Requisito prioritario del progetto: il DM deve poter descrivere una campagna in linguaggio naturale, generare e revisionare sessioni, scene, PNG, incontri, luoghi e ricompense con ChatGPT, quindi importare un JSON conforme al formato DMC. Prima fase senza API integrate: definizione di uno schema JSON interoperabile, prompt guidato, validazione rigorosa, anteprima ed importazione con gestione errori. La compatibilità va verificata sul modello reale di `statoDatiCampagna.js` e sul formato di backup `archivioDMC.js`; non assumere che un JSON narrativo generico sia direttamente importabile. Seconda fase opzionale: generazione dentro l'interfaccia via API OpenAI, previa valutazione di costi, gestione delle chiavi e privacy. Non dichiarare la funzionalità implementata finché non sono disponibili conversione, import e test end-to-end.

## Revisione UX della battaglia — accesso alle azioni

Problema individuato: la scheda completa del mostro richiedeva di attraversare numerose statistiche prima di arrivare alle azioni, poco funzionale durante un turno. La revisione introduce `src/components/SchedaTatticaCreatura.vue`, visibile direttamente nelle schede dei nemici di `GestioneBattaglia.vue` sotto ai controlli PF/CA. Mostra in primo piano azioni, azioni bonus, reazioni e azioni leggendarie/mitiche, con bonus iniziativa, velocità e sensi in sintesi. Tratti, caratteristiche/tiri salvezza e difese sono disponibili in sezioni `<details>`; resta accessibile la scheda integrale preesistente. Non sono modificati i dati delle creature o il motore del combattimento. CI: test, lint e build superati (run 42840609494). Restano da verificare nel browser leggibilità, densità delle schede con molti nemici, accessibilità da tastiera e comportamento responsive.

## Revisione UX — editor del Bestiario

`src/components/EditorCreatura.vue` è stato riorganizzato in sei sezioni navigabili: Identità, Statistiche (inclusi tiri salvezza e difese), Capacità, Azioni (incluse bonus, reazioni e leggendarie), Descrizione e Revisione. La navigazione è libera sia in creazione sia in modifica e preserva la stessa bozza reattiva durante gli spostamenti. Resta invariato il formato dati e la normalizzazione/salvataggio di tutte le voci. La validazione avviene nel componente anche con pannelli non visibili e conduce alla sezione pertinente in caso di errore. Il riepilogo finale è consultivo, non sostituisce la scheda completa. Verifiche CI: test, lint e build superati (run 43256466332). Da effettuare una verifica manuale dell'editor con una creatura homebrew ricca di tratti/azioni, del layout mobile e del focus dopo messaggi di errore.

## PNG del Bestiario collegati alle campagne

La sezione Sessioni → PNG della campagna permette ora di selezionare un PNG personale già creato nel Bestiario, anche se la relativa scheda non è pronta per il combattimento. L'operazione crea nel registro narrativo della campagna una voce distinta (con ruolo, personalità, obiettivi, segreti e dialoghi), collegata alla creatura tramite `creaturaId`. Il collegamento impedisce duplicati dello stesso PNG nella stessa campagna ma consente di riutilizzarlo in campagne differenti. I PNG creati direttamente nel registro restano supportati. Le opzioni di collegamento del registro non dipendono più dal filtro per l'aggiunta dei nemici e mostrano eventuali riferimenti divenuti indisponibili. Nell'importazione dei backup, `archivioDMC.js` rimappa anche i riferimenti `pngNarrativi[].creaturaId` in caso di conflitto d'ID. Test di collegamento, collisione e importazione superati nella CI (run 43263707894). Verifica manuale ancora richiesta: creare PNG nel Bestiario → collegarlo alla campagna → assegnarlo a una scena → esportare/importare campagna → verificare collegamento.

## Gerarchia UX nella preparazione delle sessioni

Il form «Nuova sessione» è ora seguito immediatamente dall'elenco delle sessioni e dai relativi editor: le sezioni accessorie «Crea sessioni con ChatGPT» e «PNG della campagna» sono collocate dopo l'elenco. La sessione appena creata si apre automaticamente e riceve focus e scorrimento verso la relativa scheda. Il registro PNG resta utilizzabile per associare personaggi alle scene, ma non interrompe il flusso di compilazione iniziale. Nessuna modifica ai modelli dati o alla logica di salvataggio. Pipeline CI superata (run 43263845436); resta da verificare il comportamento visuale su mobile.

## Preparazione guidata delle sessioni

L'editor di una sessione è stato suddiviso in tre sezioni navigabili: Impostazioni, Scene e Strumenti opzionali. La creazione si apre sulle impostazioni e l'utente può procedere verso le scene o navigare liberamente. Elementi interattivi e attività monitorate sono stati spostati dopo le scene e accompagnati da esempi concreti e spiegazioni sul loro funzionamento nella conduzione. L'intervento modifica soltanto la gerarchia e la visibilità dei pannelli, senza alterare il modello dati o il sistema di salvataggio. CI superata (run 43268821006). Da verificare in browser la navigazione da tastiera, il flusso di creazione scena e la leggibilità su mobile.

## Refactoring e progressione del Compendio — novembre 2026

- Estratte da `GestioneSessioni.vue` le operazioni di normalizzazione dei dati in `src/dati/preparazioneSessioni.js`, preservando la migrazione delle scene legacy, gli incontri, gli indizi e i collegamenti narrativi. Sono stati aggiunti test di regressione in `tests/preparazione-sessioni.test.js`.
- Estratta la valutazione indicativa degli incontri in `src/dati/valutazioneIncontro.js`, con test delle soglie per livello e segnalazioni dei casi incompleti in `tests/valutazione-incontro.test.js`. L'interfaccia e il modello dati non cambiano.
- Esteso l'indice dell'equipaggiamento d'avventura da 14 a 82 voci con peso e costo della tabella SRD (p. 108), senza attribuire alle schede nuove descrizioni non verificate. Rimane lavoro editoriale sulle regole d'uso e sulle altre sezioni del Compendio.
- Aggiornato il README per riflettere le funzionalità R4.2 e distinguere test automatici da verifiche end-to-end.

**Debito tecnico residuo:** `GestioneSessioni.vue` conserva ancora l'ampio template di preparazione e conduzione; ulteriori estrazioni di componenti visivi richiedono test manuali su focus, navigazione e persistenza. **Debito editoriale residuo:** classi, oggetti magici, varianti e descrizioni di equipaggiamento, trascrizioni normative e verifiche puntuali delle tabelle SRD. Non considerare la R4.2 né il Compendio editorialmente conclusi.
