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

## Importare sessioni in una campagna esistente

Dalla scheda **Sessioni** della campagna, in modalità preparazione, aprire **Importa sessioni da ChatGPT**. Questa operazione usa un file distinto dal backup: `formato: "dmc-sessioni"`, `versione: 1`, `sessioni: [...]`. Il pannello mostra un'anteprima, consente di scegliere le sessioni e richiede conferma. Le sessioni e le scene importate ricevono nuovi identificativi. Le sessioni preesistenti non sono sostituite.

**Prompt da copiare in ChatGPT:**

> Genera un JSON valido senza Markdown nel formato `{"formato":"dmc-sessioni","versione":1,"sessioni":[...]}`. Ogni sessione deve avere titolo (stringa non vuota, massimo 150 caratteri), obiettivi (stringa), pgPrevisti (intero 1–20), livelloPrevisto (intero 1–20), scene (array). Ogni scena deve avere titolo e descrizione come stringhe e, facoltativamente, orario, note, alternativa e personaggi come stringhe. Non includere incontri con creature, identificativi SRD, PNG o altre strutture complesse: verranno aggiunti nell'editor. Tema: [TEMA]. Numero sessioni: [NUMERO]. Rispondi solo con JSON.

Esempio minimo:

```json
{
  "formato": "dmc-sessioni",
  "versione": 1,
  "sessioni": [
    {
      "titolo": "Il primo rintocco",
      "obiettivi": "Indagare sull'origine del suono.",
      "pgPrevisti": 4,
      "livelloPrevisto": 2,
      "scene": [
        {
          "titolo": "La piazza",
          "descrizione": "Il rintocco interrompe il mercato.",
          "note": "Un testimone conosce la torre."
        }
      ]
    }
  ]
}
```

**Limitazioni:** vengono importati i contenuti narrativi di base. Non sono importati automaticamente incontri, risorse narrative, indizi strutturati o associazioni a PNG. Non usare questo formato per un backup completo della campagna.

## Verifiche prima del salvataggio

1. Il file deve essere JSON valido, non vuoto e di dimensione inferiore a 50 MB.
2. Importare tramite Gestione dati; verificare numero, nomi e dettagli delle campagne nell'anteprima.
3. Confermare la creazione delle copie e aprire le sessioni per verificare la resa dei campi narrativi.
4. Conservare un backup delle campagne esistenti prima di operazioni massive.

**Origine del contratto:** `src/stato/archivioDMC.js`, `src/stato/statoDatiCampagna.js`, `src/components/GestioneSessioni.vue`.
