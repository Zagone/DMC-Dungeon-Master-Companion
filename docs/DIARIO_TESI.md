# Diario di progettazione della tesi — Dungeon Master Companion

**Corso di laurea:** Interfacce e Tecnologie della Comunicazione  
**Progetto:** Dungeon Master Companion (DMC), applicazione web per la progettazione e la gestione di campagne di Dungeons & Dragons  
**Versione di lavoro:** Crooked Realms R4.8 (interfaccia e Compendio); predisposizione distribuzione R4.9 sul ramo R4.2  
**Periodo documentato in questa voce:** novembre 2026  
**Branch di sviluppo:** `feature/r4-2-gestione-dati-integrazione`

Questo diario registra il percorso di progettazione, le criticità emerse durante l'uso dell'applicazione, le decisioni adottate e le verifiche disponibili. È distinto dal registro tecnico `REVISIONE_FUNZIONALE_R4_2.md`, che conserva dettagli di implementazione e riferimenti alle pipeline.

## 12 novembre 2026 — Revisione dell'esperienza d'uso e della struttura software

### Contesto

Con le principali funzionalità già operative, la fase di lavoro si è concentrata su un problema tipico dei gestionali: la quantità di informazioni da mostrare può crescere fino a rendere complessi anche i compiti più frequenti. In DMC il problema si è manifestato soprattutto nella creazione di mostri homebrew, nella preparazione delle sessioni e nell'accesso rapido alle azioni durante il combattimento.

La revisione è stata guidata da prove d'uso informali e osservazioni del progettista, **non** da uno studio sperimentale con campione di utenti. Le valutazioni qualitative riportate in questa voce non costituiscono misurazioni di efficacia o usabilità.

### 1. Editor dei mostri: dall'elenco continuo alla compilazione per sezioni

**Problema osservato.** La creazione e la modifica dei mostri richiedevano di attraversare un modulo lungo e denso, difficile da scansionare visivamente. La completezza del modello dati si traduceva in un'interfaccia percepita come impegnativa.

**Decisione progettuale.** Riorganizzare lo stesso editor in sei sezioni navigabili: **Identità, Statistiche, Capacità, Azioni, Descrizione e Revisione**. La navigazione non è rigidamente sequenziale: l'utente può raggiungere direttamente la sezione necessaria, sia durante la creazione sia durante la modifica. La scheda conserva i campi preesistenti e il formato di salvataggio. In una revisione successiva, i sei passaggi sono stati disposti su un'unica riga su desktop, con una griglia adattiva per schermi meno larghi.

**Motivazione per la tesi.** L'intervento applica una forma di *progressive disclosure*: le informazioni vengono raggruppate per compito, limitando la quantità di campi visibili contemporaneamente. Il beneficio atteso è una minore difficoltà di orientamento; non è ancora stato quantificato sperimentalmente.

### 2. Collegamento tra PNG del Bestiario e campagne

**Problema osservato.** Il Bestiario permetteva di creare PNG personalizzati, ma il registro dei PNG della campagna richiedeva di inserirli nuovamente. Mancava un collegamento immediato tra una risorsa già definita e il suo impiego narrativo.

**Decisione progettuale.** Introdurre l'azione «Aggiungi dal Bestiario», mantenendo distinto il PNG narrativo della campagna dalla relativa scheda homebrew. Il collegamento conserva il riferimento alla creatura, mentre ruolo, obiettivo, personalità, segreti e dialoghi rimangono specifici di ciascuna campagna. È stata prevista la prevenzione dei duplicati nello stesso registro e la rimappatura dei riferimenti durante le importazioni dei backup che richiedono nuovi identificativi.

**Motivazione per la tesi.** L'obiettivo è favorire il *riuso delle informazioni* e ridurre la duplicazione dell'input, senza sacrificare la contestualizzazione narrativa.

### 3. Preparazione delle sessioni: centralità del compito principale

**Problema osservato.** Dopo aver creato una sessione, i relativi campi di compilazione erano collocati sotto strumenti accessori, tra cui il registro PNG. Inoltre «Elementi interattivi» e «Attività monitorata» risultavano difficili da interpretare senza un contesto.

**Decisione progettuale.** Portare la sessione appena creata immediatamente in evidenza, predisponendo focus e scorrimento automatico verso la scheda. Riorganizzare la preparazione in tre aree liberamente navigabili: **Impostazioni, Scene, Strumenti opzionali**. Gli strumenti opzionali sono stati spostati dopo le scene e accompagnati da esempi, come una leva da attivare o un rituale collettivo da monitorare.

**Motivazione per la tesi.** Si è intervenuti sull'*architettura dell'informazione* e sulla *gerarchia dei compiti*: il flusso principale deve restare riconoscibile e immediato, mentre le funzioni meno frequenti non devono ostacolare l'avvio della preparazione.

### 4. Conduzione e battaglia: informazioni operative al momento opportuno

**Problema osservato.** Durante un combattimento, le azioni di una creatura non erano abbastanza immediate da raggiungere rispetto alle statistiche complete.

**Decisione progettuale.** Introdurre una scheda tattica compatta, collocando azioni, azioni bonus, reazioni e azioni speciali in pannelli espandibili vicini ai controlli di combattimento. La scheda completa rimane comunque disponibile.

**Motivazione per la tesi.** La disposizione dà priorità all'*informazione pertinente al contesto d'uso*, distinguendo la consultazione operativa dalla lettura approfondita.

### 5. Qualità del codice: formattazione e refactoring per responsabilità

**Problema osservato.** Alcuni sorgenti presentavano righe molto lunghe; inoltre `GestioneSessioni.vue` combinava normalizzazione dei dati, preparazione, gestione dei PNG, configurazione degli incontri e Conduzione in un unico componente.

**Decisioni tecniche.**

- Uniformare la formattazione dei file Vue, JavaScript, CSS e dei test mediante Prettier; escludere temporaneamente `DashboardView.vue`, la cui formattazione automatica produceva un errore di compilazione del template.
- Estrarre la normalizzazione in `src/dati/preparazioneSessioni.js` e la valutazione degli incontri in `src/dati/valutazioneIncontro.js`.
- Separare le interfacce in `RegistroPNCampagna.vue`, `StrumentiOpzionaliSessione.vue`, `ImpostazioniSessione.vue`, `EditorDettagliScena.vue` e `ConduzioneSessione.vue`.
- Conservare nel componente principale la logica di coordinamento, il controllo della sessione attiva e le operazioni condivise; utilizzare proprietà, eventi e callback Vue per comunicare tra componenti.
- Preservare, per quanto possibile, i formati di campagna e i collegamenti alle schede del Bestiario.

**Evoluzione dimensionale.** Nel corso degli interventi, `GestioneSessioni.vue` è passato da circa **80.935** caratteri prima dell'estrazione del registro PNG a circa **30.900** caratteri dopo l'estrazione della Conduzione. Si tratta di un indicatore grezzo di distribuzione del codice, **non** di una misura diretta della qualità del software.

**Motivazione per la tesi.** Il refactoring mira a una più chiara *separazione delle responsabilità* e a una maggiore manutenibilità. La formattazione e il refactoring sono interventi diversi: la prima migliora la presentazione del codice, il secondo ne modifica l'organizzazione interna.

### 6. Compendio SRD: avanzamento e criteri di affidabilità

Il Compendio è stato ampliato senza equiparare la presenza di una voce alla completezza editoriale della sua scheda. Tra gli interventi recenti figurano l'espansione dell'indice dell'equipaggiamento d'avventura a **82 voci** e l'inserimento di **25 nuove schede tabellari** relative a cavalcature, finimenti e veicoli.

La distinzione tra **dati strutturati verificati nelle tabelle** e **descrizioni normative ancora da revisionare** è stata mantenuta esplicita. Classi, oggetti magici e ulteriori parti dell'SRD necessitano di completamento e controllo editoriale. Il registro dettagliato delle integrazioni si trova in `docs/COMPENDIO_SRD_STATO.md`.

### 7. Verifiche effettivamente svolte

Gli interventi sono stati integrati sul branch R4.2 e sottoposti a pipeline automatiche comprendenti test, ESLint, Oxlint e build di produzione. L'ultima pipeline relativa alla separazione della Conduzione è risultata riuscita: [GitHub Actions — run 43282451087](https://github.com/Zagone/DMC-Dungeon-Master-Companion/actions/runs/43282451087).

**Limite metodologico:** il superamento della pipeline attesta la riuscita dei controlli previsti, ma non certifica l'assenza di regressioni nell'interfaccia. Non risulta ancora documentato un collaudo manuale end-to-end di tutti i flussi dopo l'estrazione dei componenti.

### 8. Verifiche e attività residue

Resta da effettuare una verifica pratica dei seguenti scenari:

1. Creare una campagna, una sessione e più scene; compilare le tre sezioni di preparazione e verificare la conservazione dei dati dopo il refresh.
2. Creare un PNG homebrew nel Bestiario, collegarlo alla campagna e associarlo a una scena.
3. Aggiungere indizi, passaggi, un'attività monitorata e un incontro con più creature differenti.
4. Avviare la Conduzione, passare tra le scene, aggiornare stati e completamento dei passaggi, compilare il resoconto.
5. Caricare l'incontro nella Battaglia e verificare la sostituzione dei nemici senza perdita delle informazioni dei personaggi giocanti.
6. Esportare e reimportare un backup, controllando integrità e riferimenti dei dati.
7. Verificare l'interfaccia su desktop e mobile, inclusa la navigazione da tastiera.

Rimangono inoltre aperte la revisione editoriale completa del Compendio SRD e la gestione dell'eccezione Prettier della Dashboard.

### Considerazione conclusiva

Questa fase ha mostrato come il lavoro di progettazione non si esaurisca nell'aggiunta di funzionalità. Una volta realizzati i flussi principali, l'uso dell'applicazione rende evidenti problemi di orientamento, priorità delle informazioni e organizzazione tecnica. Le revisioni della R4.2 hanno quindi perseguito due obiettivi complementari: **ridurre la complessità percepita dal Dungeon Master** e **rendere il codice più modulare**, preservando il funzionamento delle campagne già create. L'efficacia delle scelte UX rimane da verificare attraverso un collaudo strutturato, evitando di trasformare impressioni informali in risultati sperimentali.

## 13 novembre 2026 — Dal Compendio strutturato alla distribuzione multipiattaforma

### Contesto: necessità di utilizzo su iPad e disponibilità fuori dall'ambiente di sviluppo

DMC nasce come applicazione web per Dungeon Master, ma fino a questa fase veniva avviata principalmente tramite il server di sviluppo Vite su un computer Windows. Questa modalità era adeguata alla programmazione, non all'uso quotidiano su dispositivi diversi: per raggiungere l'app dall'iPad, infatti, sarebbe stato necessario mantenere acceso il PC e condividere la stessa rete locale.

**Esigenza emersa:** poter aprire DMC da Safari su iPad, dal computer e da altri dispositivi, con un unico URL e senza dipendere dall'ambiente locale di sviluppo. Questa esigenza evidenzia la distinzione fra un prototipo funzionante in un ambiente controllato e un servizio web effettivamente accessibile nel suo contesto d'uso.

### 1. Evoluzione del Compendio SRD e organizzazione dell'informazione

Nel corso delle revisioni R4.4–R4.8, il Compendio è passato dalla semplice indicizzazione di porzioni del PDF alla rappresentazione più strutturata delle informazioni dell'SRD italiana 5.2.1. Lavorare direttamente sui testi estratti ha evidenziato errori caratteristici dei documenti a colonne: tabelle inserite nel corpo di una descrizione, parti di voci adiacenti associate alla scheda sbagliata e privilegi di classe non facilmente individuabili.

Sono stati effettuati i seguenti interventi:

- Delimitazione delle dodici classi a partire dalle intestazioni effettive, per evitare contaminazioni tra sezioni che condividono una pagina.
- Ricostruzione delle **240 righe di progressione** (20 livelli per ciascuna delle 12 classi), con risorse specifiche e slot incantesimo.
- Distinzione esplicita tra **tratti iniziali**, **progressione numerica**, **privilegi di classe** e **sottoclasse prevista dall'SRD**, con descrizioni collegate ai rispettivi livelli.
- Estrazione separata delle opzioni di Metamagia dello Stregone e delle Suppliche occulte del Warlock.
- Chiusura iniziale della tabella di avanzamento e della sezione sottoclasse, con apertura su richiesta; nella tabella l'utente può selezionare un livello oppure confrontarli tutti.

**Motivazione progettuale.** La quantità delle informazioni è elevata, ma la maggior parte non è necessaria contemporaneamente. L'adozione di pannelli richiudibili applica la *divulgazione progressiva*, lasciando accessibili i contenuti approfonditi senza sovraccaricare la schermata. L'effetto atteso è una consultazione più mirata durante la preparazione e la conduzione di una sessione. Non sono ancora disponibili misure sperimentali di efficienza, tempo di ricerca o soddisfazione; pertanto tali effetti restano **ipotesi da validare**.

**Distinzione metodologica.** Una tabella presente e leggibile non implica che tutto il Compendio sia editorialmente completo. Le descrizioni normative ricavate dal PDF continuano a richiedere revisione puntuale, come descritto in `docs/COMPENDIO_SRD_STATO.md`.

### 2. Decisione di distribuzione: hosting statico su Cloudflare Pages

Sono state considerate due strade operative: l'accesso al server Vite tramite rete Wi-Fi locale, utilizzabile solo con PC acceso, e la pubblicazione permanente della build statica su un servizio HTTPS. Per rispondere all'esigenza di utilizzare DMC su iPad anche fuori dalla rete domestica, è stata scelta la seconda soluzione.

Il servizio individuato è **Cloudflare Pages**, nella configurazione gratuita per siti statici e con distribuzione da repository GitHub. La scelta deriva dalle caratteristiche tecniche dell'architettura esistente:

- DMC è sviluppata con **Vue 3 + Vite**, che produce un insieme di file statici nella directory `dist`.
- Il **router hash** già presente (`createWebHashHistory()`) gestisce la navigazione sul client, senza introdurre un server applicativo per le rotte.
- Gli archivi SRD JSON possono essere distribuiti come risorse statiche e caricati all'occorrenza.
- Collegare il ramo di sviluppo al servizio di hosting consente di associare le pubblicazioni a commit e pipeline di verifica, preservando la tracciabilità del processo.

**Configurazione predisposta:** versione di Node.js stabilizzata tramite `.node-version` (`24.12.0`), comando `npm run build`, directory `dist` e ramo `feature/r4-2-gestione-dati-integrazione`. Quest'ultimo è stato scelto perché `main` non contiene ancora gli ultimi interventi del progetto.

**Perimetro dei costi:** per la versione statica, il piano Free di Cloudflare Pages offre un livello di risorse adeguato alla sperimentazione iniziale, senza costo mensile previsto per l'hosting. La valutazione non comprende un eventuale dominio personalizzato o futuri servizi backend, che andrebbero preventivati a parte.

### 3. Persistenza e limiti della distribuzione su più dispositivi

La pubblicazione del front-end **non equivale alla sincronizzazione dei dati**. L'architettura attuale salva campagne, homebrew e preferenze nel `localStorage` del browser. Tale spazio è associato al dispositivo e all'origine del sito: i dati presenti nel browser del PC non saranno automaticamente disponibili sull'iPad né sulla versione `*.pages.dev`.

La continuità dei dati tra dispositivi è quindi garantita, allo stato attuale, soltanto dal trasferimento **manuale dei file JSON** tramite le funzioni di esportazione e importazione dell'Archivio. Questa scelta permette di pubblicare la web app senza introdurre immediatamente sistemi di autenticazione o un database, ma limita la continuità d'uso fra dispositivi.

Questa limitazione diventa un requisito di progettazione per un'eventuale fase successiva: valutare un modello di accesso autenticato e sincronizzazione cloud senza compromettere esportabilità, controllo dell'utente sui dati e interoperabilità.

### 4. Pubblicazione web, installabilità e disponibilità offline

Sono stati distinti tre concetti che possono essere facilmente confusi:

1. **Sito pubblicato:** accessibile da un browser tramite URL HTTPS, anche a computer di sviluppo spento.
2. **Collegamento nella schermata Home:** permette l'apertura rapida dall'iPad, ma non garantisce di per sé disponibilità offline.
3. **PWA offline:** richiede una strategia aggiuntiva di manifest, cache e service worker, non attivata dalla sola pubblicazione su Cloudflare Pages.

Per evitare di attribuire funzionalità non ancora realizzate, il requisito immediato è limitato alla pubblicazione e all'uso online multipiattaforma. L'eventuale modalità offline è registrata come evoluzione separata.

### 5. Verifiche, evidenze e attività ancora da effettuare

**Preparazione effettuata nel repository:** guida di configurazione e attivazione Cloudflare, blocco esplicito della versione Node, definizione delle impostazioni della build e protocollo di collaudo iPad/desktop. Il documento di riferimento è `docs/PUBBLICAZIONE_CLOUDFLARE_PAGES.md`.

**Stato della pubblicazione:** al momento di questa annotazione, **il collegamento dell'account Cloudflare al repository e il primo deploy non sono ancora stati eseguiti**. Non esiste quindi un URL di produzione verificato da riportare come risultato. L'attivazione deve essere completata nel pannello Cloudflare dal proprietario dell'account.

**Verifiche da eseguire dopo il deploy:** apertura HTTPS, caricamento archivi JSON, navigazione e refresh, persistenza in Safari su iPad, trasferimento di backup da PC, conduzione delle scene e battaglia, layout verticale/orizzontale e interazione con i pannelli del Compendio. Vanno registrati risultati osservabili e non semplici aspettative.

**Rilevanza per la tesi.** L'intervento conclude una prima fase di passaggio dall'implementazione locale alla predisposizione per il contesto reale d'uso. La distribuzione online crea le condizioni per svolgere prove di usabilità su dispositivi diversi; non costituisce di per sé una dimostrazione dell'efficacia dell'interfaccia o della robustezza della persistenza.

## 13 novembre 2026 — Primo tentativo di distribuzione su Cloudflare Pages

**Evidenza osservata nel pannello Cloudflare.** Il progetto `dmc-dungeon-master-companion` è stato creato e collegato al repository GitHub. Due tentativi iniziali di deploy hanno terminato la build Vite correttamente e caricato gli asset statici sul servizio, ma la fase conclusiva è fallita.

L'estratto del registro del primo tentativo riporta:
- `built` e fase di build completata;
- `Success! Uploaded 0 files (43 already uploaded)`, seguito da `Upload complete!`;
- `Success: Assets published!`;
- `Error: Failed to publish your Function. Got error: Unknown internal error occurred.`

Nel pannello il progetto compare con **No production deployment yet** e due tentativi falliti. Queste informazioni consentono di distinguere la **compilazione riuscita del front-end** dal **fallimento nella pubblicazione finale**. Il messaggio è generico e non prova un errore nel codice dell'applicazione né identifica con certezza la causa lato Cloudflare.

**Azione successiva.** Poiché la dashboard non mette a disposizione dell'utente le operazioni di ripetizione o eliminazione dei due tentativi, un aggiornamento documentale versionato sul ramo di produzione viene utilizzato per richiedere una **nuova esecuzione automatica del deployment** attraverso l'integrazione GitHub–Cloudflare. Non sono modificati i file applicativi, i salvataggi o la configurazione di build. L'effettivo avvio, l'esito della nuova esecuzione e l'accessibilità dell'URL vanno verificati nel pannello Cloudflare e, in caso di successo, da Safari su iPad.

**Stato alla redazione della presente annotazione:** hosting non ancora validato, nessuna produzione funzionante dichiarata. In caso di persistenza dello stesso errore è opportuno raccogliere il nuovo log e rivolgersi al supporto Cloudflare, evitando di trattare la compilazione riuscita come prova di distribuzione completata.

## 13 novembre 2026 — Distribuzione riuscita su Netlify: dalla build alla disponibilità del sito

### Evento e decisione

I primi due deploy Cloudflare Pages avevano compilato l'applicazione Vite, caricato gli asset ed erano poi falliti nella fase conclusiva con il messaggio `Failed to publish your Function — Unknown internal error occurred`. Un ulteriore deployment è rimasto fermo per oltre dodici minuti dopo la preparazione delle risorse ed è stato interrotto. Non è stata individuata una causa certa. La ripetizione delle difficoltà nell'ambiente di hosting, in presenza di test e build GitHub riusciti, ha motivato la valutazione di un fornitore alternativo.

**Decisione:** impiegare **Netlify**, mantenendo la stessa architettura di hosting statico, il repository GitHub, il ramo di integrazione e il processo di build Vite. Il cambiamento riguarda la modalità di distribuzione, **non** il codice funzionale o il modello dei dati.

### Configurazione e risultato osservato

Dalla schermata «Project overview» di Netlify, condivisa il 13 novembre 2026, si rilevano:
- repository collegato: `Zagone/DMC-Dungeon-Master-Companion`;
- ramo di produzione: `feature/r4-2-gestione-dati-integrazione`;
- ultimo commit pubblicato: `eb1d77e`, relativo alla documentazione del tentativo Cloudflare;
- comando di compilazione: `npm run build`;
- directory di pubblicazione: `dist`;
- URL assegnato: **https://dmc-dungeon-master-companion.netlify.app**;
- stato della produzione Netlify: **Published**.

Questi elementi dimostrano che il servizio ha accettato e pubblicato con successo il deploy di produzione del front-end. **Non costituiscono ancora una validazione end-to-end** dei flussi applicativi, dell'accessibilità o dell'esperienza d'uso su iPad.

### Visibilità e disponibilità effettiva

Nella stessa schermata, il progetto appare contrassegnato come **Private** e presenta il comando **Make public**. Secondo la documentazione Netlify sulla *Project visibility*, le nuove pubblicazioni possono richiedere esplicitamente la modifica della visibilità affinché l'URL sia raggiungibile senza autenticazione Netlify. Pertanto, alla data della schermata, si distingue tra:
- **deployment riuscito**: osservato e documentato;
- **visibilità pubblica**: **non ancora confermata**, fino all'azione «Make public» e alla prova con browser non autenticato;
- **utilizzo su iPad**: **non ancora collaudato**.

Il sito pubblico renderà accessibili il software e il materiale SRD distribuito nell'app, non l'archivio personale di campagne salvato nel `localStorage` di ogni browser. L'attuale modello di salvataggio resta individuale per origine e dispositivo, senza sincronizzazione.

### Implicazioni per la progettazione della tesi

L'episodio evidenzia tre aspetti di ingegneria del software e progettazione dell'interazione:

1. **Separazione fra artefatto e infrastruttura:** una build che supera test e compilazione non garantisce automaticamente la riuscita della distribuzione sul provider.
2. **Portabilità:** l'adozione di Vue 3, Vite, file SRD JSON e navigazione hash ha permesso di cambiare servizio mantenendo invariato l'artefatto applicativo.
3. **Verifica contestuale:** la presenza di un URL o dello stato «Published» non dimostra che l'interfaccia sia raggiungibile senza login né che le funzioni siano usabili su Safari iPadOS.

### Prove successive

Dopo «Make public» si dovranno registrare: accesso anonimo via HTTPS, caricamento del Compendio e del Bestiario, apertura delle classi e delle sezioni richiudibili, comportamento responsive in orientamento verticale/orizzontale, creazione e persistenza delle campagne, import/export JSON, conducibilità delle sessioni e battaglie. Si dovrà inoltre verificare un successivo deployment automatico a partire da un commit GitHub, evitando di assumere che il solo collegamento Git garantisca la pubblicazione senza errori.

Fonti di contesto:
- https://docs.netlify.com/manage/security/secure-access-to-sites/project-visibility/
- https://docs.netlify.com/start/quickstarts/deploy-from-repository/

**Stato metodologico:** deploy Netlify di produzione confermato dalla dashboard; accesso pubblico e prove di usabilità su iPad ancora da verificare.

## 13 novembre 2026 — R4.10: navigazione sticky minimale durante la Conduzione su iPad e smartphone

### Problema osservato

Durante le prime verifiche pratiche dell'applicazione pubblicata su Netlify è emerso un problema di **ingombro verticale** della navigazione sticky della campagna su iPad e mobile. La barra manteneva tutte le schede e, dopo lo scorrimento, mostrava anche il nome della campagna e il pulsante di uscita. La combinazione dei due livelli di navigazione occupava una porzione rilevante dello schermo durante la lettura e conduzione delle scene.

Il problema è stato segnalato dal progettista nell'uso dell'applicazione su dispositivi mobili/tablet; non costituisce un risultato di test comparativo con un campione di Dungeon Master.

### Decisione progettuale e realizzazione

La navigazione della campagna viene trasformata **soltanto durante una Conduzione attiva nella sezione Sessioni**, su viewport fino a 1024 px o, su dispositivi dotati di puntatore touch (ad esempio iPad in orizzontale), fino a 1440 px.

La nuova barra è una **piccola pillola centrata sotto l'intestazione globale**, alta circa 46–48 px, con bordo e ombreggiatura leggeri coerenti con Crooked Realms. Contiene:

- un comando compatto con etichetta accessibile per tornare alla dashboard;
- un selettore nativo delle cinque sezioni di campagna, che mostra «Conduzione» quando la sezione attiva è Sessioni e permette di raggiungere Battaglia, Bestiario, Note e Panoramica.

La barra continua a utilizzare la posizione CSS `sticky`; è centrata orizzontalmente e mantiene lo spazio sottostante libero. La navigazione completa resta presente e invariata su desktop e quando non è attiva una Conduzione. La proprietà `--dmc-altezza-navigazione-campagna` continua a misurare la barra realmente renderizzata per preservare la coerenza degli offset usati anche dalla Battaglia.

La scelta di un `<select>` nativo favorisce l'interazione touch e l'accessibilità, mantenendo la navigazione fra le sezioni senza dover disegnare o gestire una lista personalizzata. Le destinazioni rimangono definite in `sezioniCampagna` e percorse dal router esistente; la funzione di scelta ripristina il valore precedente finché il router non ha effettivamente accettato il cambio di sezione, per evitare stati visivi ingannevoli in caso di mancato salvataggio.

### Motivazione UX e limiti di verifica

L'intervento applica il principio di **priorità del contenuto operativo**: durante la Conduzione il testo della scena e i suoi strumenti contestuali devono prevalere visivamente sulla navigazione generale. La riduzione d'ingombro è misurabile nella nuova altezza CSS, ma il miglioramento dell'usabilità richiede validazione empirica.

Sono predisposti test di regressione statici per controllare la condizione di attivazione, il breakpoint per tablet in orientamento orizzontale, la presenza delle cinque sezioni e delle etichette accessibili. I test di codice e la build **non** costituiscono prova di corretta resa visiva su iPadOS: dopo il deploy occorre controllare iPad verticale/orizzontale, telefoni piccoli, focus tastiera, interazione touch e passaggio fra Conduzione e Battaglia.

**Ambito del cambiamento:** `CampagnaView.vue`, `navigazione-campagna.css`, test dedicati. Nessuna modifica a salvataggi, sessioni, scene, bestiario o export/import.
