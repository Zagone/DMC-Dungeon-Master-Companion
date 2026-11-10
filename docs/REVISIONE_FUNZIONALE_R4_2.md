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
