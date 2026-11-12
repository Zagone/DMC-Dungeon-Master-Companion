# Diario di progettazione della tesi — Dungeon Master Companion

**Corso di laurea:** Interfacce e Tecnologie della Comunicazione  
**Progetto:** Dungeon Master Companion (DMC), applicazione web per la progettazione e la gestione di campagne di Dungeons & Dragons  
**Versione di lavoro:** Crooked Realms R4.2  
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
