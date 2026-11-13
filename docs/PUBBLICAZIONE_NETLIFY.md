# DMC — Distribuzione su Netlify (13 novembre 2026)

**Stato:** primo deployment di produzione **riuscito** (stato `Published` osservato nella dashboard Netlify); sito ancora indicato come **Private** nella schermata fornita. L'accessibilità anonima e i test su iPad rimangono da verificare.

## Configurazione di produzione

| Impostazione | Valore |
| --- | --- |
| Repository GitHub | `Zagone/DMC-Dungeon-Master-Companion` |
| Ramo pubblicato | `feature/r4-2-gestione-dati-integrazione` |
| Commit del primo deploy riuscito | `eb1d77e` |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Base directory | Vuota (radice del repository) |
| Functions directory | Non utilizzata |
| URL di produzione | https://dmc-dungeon-master-companion.netlify.app |

L'applicazione è una SPA Vue 3 + Vite. Il router usa `createWebHashHistory()`, quindi le rotte `#/...` non richiedono regole server-side aggiuntive. Il servizio pubblica i file statici e gli archivi JSON del Compendio.

## Sbloccare l'accesso anonimo

La dashboard «Project overview» mostra **Private** e il pulsante **Make public**. Ai sensi della documentazione Netlify, un progetto privato limita l'accesso ai membri autorizzati. Per consentire l'uso dall'iPad senza autenticazione Netlify:

1. Aprire la pagina del progetto sulla dashboard Netlify.
2. Selezionare **Make public** e confermare la visibilità della versione di produzione.
3. Aprire l'URL di produzione in una finestra privata o su un dispositivo non autenticato, documentando l'esito.
4. Verificare poi il funzionamento su Safari iPadOS.

Questo rende pubblico il front-end e il materiale di riferimento distribuito in esso, **non i dati personali** memorizzati nel `localStorage` del proprio browser. Il progetto non implementa attualmente un accesso personalizzato né un database condiviso.

Documentazione: https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/

## Persistenza e trasferimento dei dati

Campagne, sessioni e homebrew sono salvati localmente nel browser per origine. Passare da `localhost` all'indirizzo Netlify non trasferisce i dati; lo stesso vale per il passaggio tra PC e iPad. Effettuare l'esportazione JSON sul dispositivo sorgente e l'importazione sulla versione Netlify, conservando una copia di sicurezza.

**Non è stata sviluppata una PWA offline**: l'hosting HTTPS non equivale a un service worker o a una cache offline gestita.

## Piano di collaudo (in attesa di risultati)

1. Aprire l'URL anonimamente da un browser non autenticato.
2. Verificare la navigazione Dashboard, Campagne, Bestiario e Compendio.
3. Verificare i 330 mostri SRD, gli archivi SRD caricati su richiesta e le 12 classi.
4. Controllare tabelle, tratti, privilegi e sottoclassi espandibili su schermo iPad.
5. Creare una campagna; verificare salvataggio, refresh, chiusura e riapertura di Safari.
6. Provare import/export JSON tra PC e iPad; verificare riferimenti di campagne/PNG.
7. Verificare preparazione e conduzione delle scene e gestione di un incontro in Battaglia.
8. Annotare dispositivo, versione browser, orientamento, risultato, eventuali anomalie.
9. Verificare un successivo deploy automatico tramite GitHub, confrontando la versione pubblicata con il relativo commit.

Il superamento della pipeline di test, lint e build GitHub non sostituisce questo collaudo.

## Motivazione della scelta Netlify

La predisposizione Cloudflare Pages ha prodotto due tentativi con build riuscita ma errore finale del provider (`Failed to publish your Function — Unknown internal error occurred`) e un successivo deployment interrotto dopo un'attesa prolungata. Senza una diagnosi certa del problema, per non bloccare i test multipiattaforma è stata preferita una soluzione alternativa compatibile con lo stesso artefatto di build.

Il risultato è documentato nel [diario di progettazione](DIARIO_TESI.md). La guida [Cloudflare Pages](PUBBLICAZIONE_CLOUDFLARE_PAGES.md) è mantenuta come documentazione storica dell'alternativa valutata.

**Riferimenti:** https://docs.netlify.com/start/quickstarts/deploy-from-repository/ e https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/
