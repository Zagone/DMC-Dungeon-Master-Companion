# Generazione di campagne con ChatGPT — contratto DMC R4.2

## Modalità supportata

La prima versione usa la **generazione esterna** di un file JSON, senza API o account ChatGPT nell'app. Il file è importato dalla Dashboard → Gestione dati, utilizzando la stessa anteprima, selezione e conferma dei backup. L'importazione crea copie indipendenti e non sovrascrive campagne esistenti.

Il parser attuale accetta `formato: "dmc-archivio-campagne"`, `versione: 2`, `creaturePersonali: []` e `campagne: [...]`. Questo è un **contratto di interoperabilità della versione corrente**, non un formato AI separato. La funzione `verificaArchivio` controlla i campi strutturali e alcuni vincoli degli incontri; non garantisce la coerenza narrativa o semantica di ogni campo.

## Prompt standard da utilizzare in ChatGPT

> Crea una campagna per Dungeon Master Companion (DMC), in italiano, esportabile come **un solo oggetto JSON valido**, senza Markdown né testo esterno. Usa il formato `dmc-archivio-campagne`, versione numerica `2`, con `creaturePersonali: []` e un array `campagne` contenente una sola campagna. Ogni campagna deve contenere `nome`, `descrizione`, `stato: "preparazione"` e `dati`. I dati devono avere `versione: 1`, `personaggi: []`, `nemici: []`, `iniziativa: {"round":1,"turnoAttivo":null}`, `sessioni`, `pngNarrativi: []`, `conduzione: null`, `note: ""`, `bottino: []`. Per ogni sessione inserisci `id` univoco, `titolo`, `data: ""`, `stato: "preparazione"`, `obiettivi`, `resoconto: ""`, `pgPrevisti: 4`, `livelloPrevisto: 2`, `scenaAttivaId: null`, `sceneVisitateIds: []`, `risorseNarrative: []`, `rituale: {"descrizione":"","partecipanti":[]}` e `scene`. Per ogni scena inserisci `id` univoco, `titolo`, `orario: ""`, `descrizione`, `note`, `alternativa`, `personaggi: ""`, `guida: []`, `indizi: []`, `pngIds: []`, `mostraRituale: false` e `incontro: {"nemici":[],"opzionale":false,"richiedeCreature":[],"suggerimentiPF":[],"noteBilanciamento":""}`. Non inventare identificativi SRD delle creature: lascia `incontro.nemici` vuoto se non conosci l'ID esatto. Non includere statistiche o testi di creature inventati come se fossero SRD. Mantieni coerenza tra gli eventi delle scene. Tema della campagna: [DESCRIZIONE]. Numero di sessioni: [NUMERO]. Genera solo JSON.

## Esempio minimo importabile

```json
{
  "formato": "dmc-archivio-campagne",
  "versione": 2,
  "applicazione": "Dungeon Master Companion",
  "creaturePersonali": [],
  "campagne": [
    {
      "nome": "La Torre Silente",
      "descrizione": "Una torre abbandonata riappare al tramonto.",
      "stato": "preparazione",
      "dati": {
        "versione": 1,
        "personaggi": [],
        "nemici": [],
        "iniziativa": {"round": 1, "turnoAttivo": null},
        "sessioni": [
          {
            "id": "sessione-torre-01",
            "titolo": "Il primo segnale",
            "data": "",
            "stato": "preparazione",
            "obiettivi": "Scoprire l'origine del rintocco.",
            "resoconto": "",
            "pgPrevisti": 4,
            "livelloPrevisto": 2,
            "scenaAttivaId": null,
            "sceneVisitateIds": [],
            "risorseNarrative": [],
            "rituale": {"descrizione": "", "partecipanti": []},
            "scene": [
              {
                "id": "scena-torre-01",
                "titolo": "La piazza",
                "orario": "Tramonto",
                "descrizione": "Un rintocco interrompe il mercato.",
                "note": "Un testimone ha visto la torre.",
                "alternativa": "Un mercante offre un indizio.",
                "personaggi": "",
                "guida": [],
                "indizi": [],
                "pngIds": [],
                "mostraRituale": false,
                "incontro": {
                  "nemici": [],
                  "opzionale": false,
                  "richiedeCreature": [],
                  "suggerimentiPF": [],
                  "noteBilanciamento": ""
                }
              }
            ]
          }
        ],
        "pngNarrativi": [],
        "conduzione": null,
        "note": "",
        "bottino": []
      }
    }
  ]
}
```

## Sessioni per una campagna già esistente

**Limite attuale:** l'importazione standard crea una nuova campagna e non aggiunge sessioni a una campagna esistente. Non chiedere a ChatGPT di produrre un backup che sembri aggiornare una campagna: l'app lo importerà come copia. L'inserimento di sessioni in una campagna esistente richiede un'azione dedicata con controllo degli ID e anteprima, da implementare separatamente.

## Verifiche prima del salvataggio

1. Il file deve essere JSON valido, non vuoto e di dimensione inferiore a 50 MB.
2. Importare tramite Gestione dati; verificare numero, nomi e dettagli delle campagne nell'anteprima.
3. Confermare la creazione delle copie e aprire le sessioni per verificare la resa dei campi narrativi.
4. Conservare un backup delle campagne esistenti prima di operazioni massive.

**Origine del contratto:** `src/stato/archivioDMC.js`, `src/stato/statoDatiCampagna.js`, `src/components/GestioneSessioni.vue`.
