# Dungeon Master Companion — Crooked Realms R4.2

Web app Vue 3 + Vite per la preparazione e conduzione di campagne Dungeons & Dragons 5e, sviluppata come progetto di tesi in *Interfacce e Tecnologie della Comunicazione*. La versione di lavoro R4.2 è sviluppata sul branch `feature/r4-2-gestione-dati-integrazione`; la branch `main` non riceve automaticamente queste modifiche.

## Avvio del progetto

Prerequisito: Node.js `^22.18.0 || >=24.12.0`.

```sh
git switch feature/r4-2-gestione-dati-integrazione
git pull origin feature/r4-2-gestione-dati-integrazione
npm ci
npm run dev
```

Aprire l'indirizzo locale indicato da Vite. Per verificare la build:

```sh
npm run build
npm run preview
```

I dati personali vengono conservati nel browser tramite `localStorage`; il clone del repository **non contiene** le campagne o i mostri salvati sul computer dell'utente. Per trasferirli usare gli strumenti di esportazione/importazione dell'Archivio. Cambiare origine/porta dell'app può comportare uno spazio `localStorage` distinto.

## Distribuzione online — Netlify

**Primo deployment di produzione riuscito** il 13 novembre 2026; la dashboard Netlify indica `Published`, ma segnala ancora il progetto come **Private** fino all'eventuale azione del proprietario `Make public`. L'accesso anonimo e il collaudo iPad non sono ancora confermati.

**URL assegnato:** https://dmc-dungeon-master-companion.netlify.app

Configurazione attiva:

| Impostazione | Valore |
| --- | --- |
| Repository | `Zagone/DMC-Dungeon-Master-Companion` |
| Branch di produzione | `feature/r4-2-gestione-dati-integrazione` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Base directory | Vuota |

Il router usa `createWebHashHistory()`; non richiede redirect di navigazione per le rotte hash. Il sito non è una PWA offline e conserva campagne e homebrew nel `localStorage` di ciascun browser. Per trasferire i dati fra PC e iPad utilizzare export/import JSON.

Le istruzioni di visibilità, la checklist di collaudo e la decisione di migrare da Cloudflare Pages sono in [docs/PUBBLICAZIONE_NETLIFY.md](docs/PUBBLICAZIONE_NETLIFY.md) e nel [diario della tesi](docs/DIARIO_TESI.md). La vecchia guida [Cloudflare Pages](docs/PUBBLICAZIONE_CLOUDFLARE_PAGES.md) è conservata come documento storico del tentativo non riuscito.

## Funzionalità principali

- **Campagne e Sessioni:** preparazione in tre sezioni navigabili (impostazioni, scene, strumenti opzionali), conduzione delle scene, PNG narrativi e incontri con più tipologie di creature.
- **Bestiario:** 330 creature SRD integrate e schede personali homebrew/PNG, editor in sei sezioni, collegamento dei PNG personali ai registri delle campagne.
- **Battaglia:** gestione dei combattenti, iniziativa, PF e condizioni; sezioni tattiche compatte con azioni e capacità espandibili.
- **Compendio SRD 5.2.1:** ricerca e consultazione per categorie, incantesimi, condizioni, regole, equipaggiamento e schede di classi, tratti e sottoclassi, con progressioni per livello. **La copertura editoriale non è completa**: vedere `docs/COMPENDIO_SRD_STATO.md`.
- **Creazione assistita con ChatGPT:** percorso guidato per comporre un prompt, aprire ChatGPT in una scheda esterna e importare un JSON compatibile. Non usa API OpenAI integrate.
- **Archivio e backup:** esportazione e importazione dei dati del DM, gestione di riferimenti e collisioni tra identificativi.

## Architettura e file di riferimento

- `src/stato/`: stato persistente delle campagne, bestiario e archivio dati.
- `src/components/GestioneSessioni.vue`: interfaccia di preparazione e conduzione.
- `src/dati/preparazioneSessioni.js`: normalizzazione e migrazione non distruttiva delle strutture narrative.
- `src/dati/valutazioneIncontro.js`: valutazione PE e soglie per gli incontri.
- `src/components/EditorCreatura.vue`: editor homebrew/PNG organizzato in sezioni.
- `src/components/SchedaTatticaCreatura.vue`: consultazione rapida delle azioni in battaglia.
- `src/views/CompendioView.vue` e `public/compendio/`: visualizzazione, indici e archivi SRD caricati quando richiesti.
- `src/stili/design-system.css` e `src/assets/ui/crooked-realms-r4/`: design system e identità visiva.
- `docs/REVISIONE_FUNZIONALE_R4_2.md`: interventi R4.2 e aspetti da collaudare.
- `docs/GENERAZIONE_CAMPAGNE_CHATGPT.md`: flusso di generazione assistita.

## Verifiche e limiti

La pipeline `.github/workflows/verifiche-r4-2.yml` verifica test automatici, ESLint, Oxlint e build. Superare la pipeline **non equivale** a un collaudo end-to-end nel browser. Sono ancora da verificare manualmente flussi completi di creazione, conduzione e import/export, accessibilità e responsive.

## Licenza e attribuzione SRD

Il materiale SRD 5.2.1 di Wizards of the Coast LLC è distribuito con licenza Creative Commons Attribution 4.0 International (CC BY 4.0). Fonte: https://www.dndbeyond.com/srd — licenza: https://creativecommons.org/licenses/by/4.0/legalcode. Gli altri componenti del progetto possono avere condizioni di utilizzo differenti.
