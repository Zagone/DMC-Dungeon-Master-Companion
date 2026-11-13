# Dungeon Master Companion — Pubblicazione su Cloudflare Pages

**Stato:** repository predisposto; **attivazione Cloudflare e pubblicazione effettiva ancora da eseguire** dall'account proprietario.

**Data della decisione:** 13 novembre 2026  
**Applicazione:** Dungeon Master Companion (DMC), Vue 3 + Vite, SPA  
**Sorgente della versione corrente:** `Zagone/DMC-Dungeon-Master-Companion`  
**Ramo di produzione previsto:** `feature/r4-2-gestione-dati-integrazione` (il ramo `main` non contiene ancora le revisioni più recenti)

## 1. Motivazione architetturale

L'obiettivo è rendere DMC accessibile da iPad, desktop e smartphone mediante un indirizzo HTTPS stabile, senza avviare il server di sviluppo sul computer personale. La distribuzione scelta è l'**hosting statico**: Vue e Vite compilano l'applicazione in HTML, JavaScript, CSS e archivi SRD JSON, che Cloudflare Pages distribuisce come file.

Non vengono introdotti servizi backend, credenziali di accesso, database o sincronizzazione. Il codice esistente resta invariato nelle sue funzionalità di campagne, sessioni, battaglia, bestiario, compendio, importazione ed esportazione. Il progetto usa **Vue Router con `createWebHashHistory()`**, quindi gli URL applicativi sono gestiti sul client dopo il carattere `#` e non richiedono regole di riscrittura per le rotte.

La build viene verificata anche dalla pipeline GitHub Actions, ma questo controllo non sostituisce un collaudo sul sito pubblicato.

## 2. Configurazione verificata e predisposta

| Campo Cloudflare Pages | Valore |
| --- | --- |
| Provider Git | GitHub |
| Repository | `Zagone/DMC-Dungeon-Master-Companion` |
| Ramo di produzione | `feature/r4-2-gestione-dati-integrazione` |
| Framework | Vue / Vite |
| Directory radice | `/` (root repository) |
| Comando di build | `npm run build` |
| Directory di output | `dist` |
| Node.js | `24.12.0` (file `.node-version` nella root) |
| Dominio | Sottodominio HTTPS `*.pages.dev` attribuito da Cloudflare |
| Variabili d'ambiente | Nessuna richiesta per la versione statica attuale |

**Non utilizzare `main` come ramo di produzione** finché non verrà allineato e verificato: al momento le modifiche più recenti sono sul ramo di integrazione.

Cloudflare Pages supporta direttamente `npm run build` e `dist` per Vue. Il relativo ambiente di build legge `.node-version`. In mancanza di un `404.html` principale, supporta inoltre il fallback SPA, anche se DMC usa già la navigazione hash.

Riferimenti ufficiali:
- https://developers.cloudflare.com/pages/framework-guides/deploy-a-vue-site/
- https://developers.cloudflare.com/pages/configuration/build-image/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/platform/limits/

## 3. Attivazione dall'account Cloudflare

La connessione dell'account Cloudflare non può essere creata mediante una modifica al solo repository GitHub. Procedere come segue:

1. Accedere a [Cloudflare Dashboard](https://dash.cloudflare.com/), creando un account gratuito se necessario.
2. Aprire **Workers & Pages** e scegliere **Create application → Pages → Import an existing Git repository** (i nomi delle voci possono variare).
3. Collegare GitHub, autorizzando Cloudflare a leggere il repository `Zagone/DMC-Dungeon-Master-Companion`.
4. Impostare **Production branch** su `feature/r4-2-gestione-dati-integrazione`, non su `main`.
5. Configurare build `npm run build`, output `dist`, directory radice del repository. Node è fissato in `.node-version`.
6. Avviare il deploy e verificare l'esito nel pannello *Deployments*.
7. Annotare l'**URL HTTPS reale fornito da Cloudflare**. Non attribuire un dominio presunto prima della prima pubblicazione.
8. Verificare sul sito reale i flussi descritti al punto 5; soltanto dopo classificare l'applicazione come pubblicata e collaudata.

Per gli aggiornamenti successivi, le modifiche integrate nel ramo di produzione vengono pubblicate automaticamente tramite la connessione Git.

**Nota:** collegare il repository a Cloudflare è un'operazione da effettuare con il proprio account; non sono richieste chiavi API da copiare nel codice o nella conversazione.

## 4. Dati dell'utente, costi e limiti

- L'hosting di questo front-end statico è compatibile con il piano gratuito di Cloudflare Pages. Alla data della valutazione il piano Free consente fino a **500 build/mese**; limiti e condizioni vanno ricontrollati prima della pubblicazione.
- **Campagne, mostri homebrew e impostazioni persistono nel `localStorage` del browser del singolo dispositivo e della singola origine web.** DMC non li carica automaticamente sul servizio Cloudflare.
- `localhost:5173` e il dominio `*.pages.dev` sono **origini distinte**; i dati precedentemente salvati sul PC non compariranno automaticamente nel sito online.
- Prima del primo accesso alla versione pubblicata, **esportare un backup JSON dal PC**; sul nuovo sito, importarlo con la funzione Archivio già presente.
- Per trasferire campagne dal PC all'iPad, ripetere export/import. Non sovrascrivere i salvataggi senza backup.
- L'installazione su schermata Home di iPad è distinta dalla **PWA offline**: il deploy statico, da solo, non fornisce automaticamente un service worker o un funzionamento senza rete.
- Il sito sarà pubblicamente raggiungibile tramite URL salvo introduzione di un controllo degli accessi. DMC non offre attualmente account personali o sincronizzazione fra dispositivi.

La disponibilità del sito e il comportamento dei salvataggi sul browser iPad devono essere verificati concretamente. Non assumere che `localStorage` equivalga a backup sicuro o persistenza permanente, specialmente quando l'utente elimina i dati del sito.

## 5. Protocollo di collaudo post-deploy (da eseguire)

Le prove seguenti devono essere svolte **dopo** l'attivazione, riportando esiti reali nel diario di tesi:

1. **HTTP/HTTPS:** apertura dell'URL Cloudflare e verifica che la dashboard venga caricata senza errori di console.
2. **Navigazione:** dashboard → Campagne → Bestiario → Compendio; refresh su una rotta hash e pulsanti avanti/indietro.
3. **Asset e SRD:** caricamento differito del catalogo creature, delle 12 classi, delle tabelle e delle descrizioni del Compendio; assenza di richieste JSON 404.
4. **Salvataggi iPad:** creazione di una campagna e di un mostro personalizzato, refresh di Safari, chiusura e riapertura del sito; verifica dei dati.
5. **Backup fra dispositivi:** export JSON da PC, import su iPad e verifica dei collegamenti tra campagne e mostri.
6. **Responsive e accessibilità:** layout a tablet verticale/orizzontale, menu, modali, focus, tasti, scroll dei prospetti di classe e contrasto dei testi.
7. **Sessione operativa:** creazione sessione, scene, incontro, passaggio a conduzione e gestione battaglia.
8. **Revisione del deploy:** successivo commit sul ramo di produzione, build automatica ed eventuale ripristino di una versione precedente dal pannello Cloudflare.

Per ogni prova annotare **dispositivo, versione iPadOS/browser, data, scenario, risultato, criticità e correzioni**. Non qualificare come superate prove non eseguite.

## 6. Esito di questa fase

**Predisposto:** codice versionato, configurazione Node, guida di pubblicazione, protocollo di verifica e diario di progettazione.

**Non ancora verificato:** collegamento GitHub–Cloudflare, ottenimento del dominio, deploy effettivo, test end-to-end su iPad, uso offline e sincronizzazione.

Questo confine tra **predisposizione tecnica** e **validazione empirica** è rilevante per la rendicontazione metodologica della tesi.
