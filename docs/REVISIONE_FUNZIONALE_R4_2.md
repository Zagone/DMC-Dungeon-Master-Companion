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
