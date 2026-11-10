import { INCANTESIMI_SRD } from './incantesimiSRD.js'
import { DETTAGLI_INCANTESIMI_SRD } from './dettagliIncantesimiSRD.js'

// Sintesi redazionali, non trascrizioni integrali. Pagine del PDF SRD 5.2.1 italiano.
// Le 15 condizioni corrispondono all'elenco ufficiale del Glossario, p. 206.
const CONDIZIONI = [
 ['Accecato',202,'Non può vedere; fallisce automaticamente le prove che richiedono la vista. Ha svantaggio ai tiri per colpire e gli attacchi contro di lui hanno vantaggio.'],
 ['Affascinato',202,'Non può attaccare o danneggiare chi lo ha affascinato. Quest’ultimo ha vantaggio alle prove di interazione sociale con il bersaglio.'],
 ['Afferrato',202,'La velocità è 0. Ha svantaggio agli attacchi contro bersagli diversi da chi lo afferra; l’afferrante può trascinarlo con limitazioni.'],
 ['Assordato',204,'Non può sentire e fallisce automaticamente le prove di caratteristica che richiedono l’udito.'],
 ['Avvelenato',204,'Ha svantaggio ai tiri per colpire e alle prove di caratteristica.'],
 ['Incapacitato',208,'Non può compiere azioni, azioni bonus o reazioni, perde la concentrazione e non può parlare. Ha svantaggio all’iniziativa se già incapacitato.'],
 ['Indebolimento',208,'Condizione cumulativa da 1 a 6 livelli: penalità alle prove con d20 e alla velocità; a 6 livelli la creatura muore.'],
 ['Invisibile',209,'Non può essere visto senza magia o sensi speciali. La condizione influenza i tiri per colpire secondo le regole di invisibilità.'],
 ['Paralizzato',210,'È incapacitato e non può muoversi. Fallisce automaticamente i tiri salvezza su Forza e Destrezza; gli attacchi contro di lui hanno vantaggio.'],
 ['Pietrificato',211,'È trasformato in una sostanza solida inanimata e incapacitato. Non può muoversi o parlare; ottiene resistenza ai danni ed è immune a veleno e malattie.'],
 ['Privo di sensi',212,'È incapacitato, non può muoversi né parlare e non è consapevole dell’ambiente. Cade prono e lascia ciò che impugna.'],
 ['Prono',212,'Può strisciare o rialzarsi spendendo metà della velocità. Ha svantaggio agli attacchi; gli attacchi contro di lui hanno vantaggio entro 1,5 m e svantaggio oltre.'],
 ['Spaventato',216,'Ha svantaggio alle prove di caratteristica e ai tiri per colpire finché vede la fonte della paura; non può avvicinarsi volontariamente a essa.'],
 ['Stordito',216,'È incapacitato, fallisce automaticamente i tiri salvezza su Forza e Destrezza e gli attacchi contro di lui hanno vantaggio.'],
 ['Trattenuto',218,'Velocità 0; i suoi attacchi hanno svantaggio, gli attacchi contro di lui vantaggio e i tiri salvezza su Destrezza svantaggio.']
]
const REGOLE = [
 ['Attacco',204,'Azione usata per effettuare uno o più attacchi, secondo le capacità disponibili.'],
 ['Aiuto',203,'Azione con cui si assiste un alleato, secondo le condizioni descritte nel glossario.'],
 ['Afferrare',202,'Opzione di colpo senz’armi che consente di afferrare un bersaglio rispettando i vincoli di taglia.'],
 ['Azioni bonus',11,'Si può effettuare un’azione bonus solo quando una capacità o una regola la consente.'],
 ['Concentrazione',206,'Un nuovo effetto che richiede concentrazione interrompe il precedente. I danni possono richiedere un tiro salvezza su Costituzione.'],
 ['Competenza',206,'Quando applicabile, il bonus di competenza si aggiunge alle prove con d20 pertinenti.'],
 ['Copertura',206,'Mezza copertura: +2 a CA e TS Destrezza. Tre quarti: +5. La copertura totale impedisce di bersagliare direttamente.'],
 ['Dadi Vita',207,'Determinano i punti ferita massimi e possono essere spesi durante un riposo breve per recuperare punti ferita.'],
 ['Disimpegno',207,'L’azione di Disimpegno evita gli attacchi di opportunità causati dal movimento fino alla fine del turno.'],
 ['Emanazione',207,'Area di effetto che si estende da una creatura o un oggetto e normalmente si sposta con esso.'],
 ['Focus da incantatore',207,'Può sostituire componenti materiali senza costo specificato e non consumate, se la classe lo consente.'],
 ['Grado di sfida',207,'Indicatore della minaccia di un mostro; le circostanze e la composizione del gruppo incidono sulla difficoltà effettiva.'],
 ['Incontro',208,'Scena di gioco riferita a interazione sociale, esplorazione o combattimento.'],
 ['Nascondersi',13,'Azione per tentare di sottrarsi alla percezione degli avversari, secondo i requisiti della regola.'],
 ['Prepararsi',211,'Consente di predisporre una risposta a un evento percepibile e usare la reazione quando si verifica.'],
 ['Ricerca',213,'Azione per individuare qualcosa con una prova di Saggezza appropriata.'],
 ['Riposo breve',213,'Periodo di riposo che permette, tra le altre cose, di spendere Dadi Vita per recuperare punti ferita.'],
 ['Riposo lungo',214,'Periodo prolungato di riposo che permette di recuperare risorse secondo le regole applicabili.'],
 ['Scatto',215,'Azione che concede movimento aggiuntivo pari alla velocità corrente del personaggio.'],
 ['Schivata',215,'Azione difensiva che rende più difficile colpire il personaggio fino all’inizio del turno successivo, salvo limitazioni.'],
 ['Studio',216,'Azione per richiamare conoscenze attraverso una prova di Intelligenza e un’abilità pertinente.'],
 ['Svantaggio',217,'Si tirano due d20 e si usa il risultato inferiore; più fonti di svantaggio non si sommano.'],
 ['Taglia',217,'Categorie di dimensione delle creature: Minuscola, Piccola, Media, Grande, Enorme e Mastodontica.'],
 ['Teletrasporto',217,'Trasporto istantaneo senza attraversare lo spazio intermedio e senza provocare attacchi di opportunità.'],
 ['Terreno difficile',217,'Ogni 30 cm percorsi costano altri 30 cm di movimento; più fonti non si sommano.'],
 ['Tiro salvezza',218,'Prova per evitare o resistere a una minaccia, richiesta da un effetto o una regola.'],
 ['Tramortire una creatura',218,'Con un attacco in mischia si può lasciare una creatura a 1 PF invece di ridurla a 0, rendendola priva di sensi.'],
 ['Utilizzo',218,'Azione necessaria quando un oggetto richiede esplicitamente un’azione per essere usato.'],
 ['Vantaggio',218,'Si tirano due d20 e si usa il risultato superiore; più fonti di vantaggio non si sommano.']
]
function slug(nome) {
 return nome.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it-IT').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
}
// Indici sintetici delle sezioni introduttive. Le schede complete sono in preparazione.
const CLASSI = [
 ['Barbaro',32],['Bardo',35],['Chierico',41],['Druido',46],['Guerriero',53],
 ['Ladro',55],['Mago',59],['Monaco',66],['Paladino',70],['Ranger',75],
 ['Stregone',79],['Warlock',85]
]
const SPECIE = [
 ['Dragonide',94],['Elfo',94],['Gnomo',95],['Goliath',95],['Halfling',96],
 ['Nano',96],['Orco',96],['Tiefling',96],['Umano',97]
]
const ORIGINI = [['Accolito',93],['Criminale',93],['Sapiente',93],['Soldato',93]]
const EQUIPAGGIAMENTO = [
 ['Armi',101],['Proprietà delle armi',101],['Proprietà di padronanza',102],
 ['Armature',104],['Strumenti',105],["Equipaggiamento d'avventura",107],
 ['Cavalcature e veicoli',113],['Spese dello stile di vita',114],['Vitto e alloggio',115]
]
const OGGETTI_MAGICI = [
 ['Categorie di oggetti magici',232],['Rarità degli oggetti magici',233],
 ['Attivare un oggetto magico',234],['Oggetti maledetti',234],
 ['Creare oggetti magici',235],['Oggetti magici senzienti',236]
]
const TALENTI = [
 ['Talenti Origini',98],['Talenti Generali',98],['Talenti Stile di combattimento',99],
 ['Talenti Dono epico',99]
]
function indiceCategoria(categoria, voci) {
 return voci.map(([nome,pagina]) => Object.freeze({
  id:slug(categoria)+'-'+slug(nome),nome,categoria,pagina,
  sintesi:'Voce dell’indice SRD. Consulta il documento ufficiale per le regole e le caratteristiche complete.',
  dettagliCompleti:false
 }))
}
export const INDICI_SRD = Object.freeze([
 ...indiceCategoria('Classi',CLASSI),...indiceCategoria('Specie',SPECIE),
 ...indiceCategoria('Origini',ORIGINI),...indiceCategoria('Equipaggiamento',EQUIPAGGIAMENTO),
 ...indiceCategoria('Oggetti magici',OGGETTI_MAGICI),...indiceCategoria('Talenti',TALENTI)
])
export const CONDIZIONI_SRD = Object.freeze(CONDIZIONI.map(([nome,pagina,sintesi]) =>
 Object.freeze({id:'condizione-'+slug(nome),nome,categoria:'Condizioni',pagina,sintesi,dettagliCompleti:false})))
export const REGOLE_BASE_SRD = Object.freeze(REGOLE.map(([nome,pagina,sintesi]) =>
 Object.freeze({id:'regola-'+slug(nome),nome,categoria:'Regole',pagina,sintesi,dettagliCompleti:false})))
export const INCANTESIMI_CON_DETTAGLI_SRD = Object.freeze(INCANTESIMI_SRD.map(v => {
 const dettagli = DETTAGLI_INCANTESIMI_SRD[v.nome]
 return dettagli ? Object.freeze({ ...v, ...dettagli, sintesi: dettagli.descrizione, dettagliCompleti: false }) : v
}))
export const REGOLE_SRD = Object.freeze([...CONDIZIONI_SRD,...REGOLE_BASE_SRD,...INCANTESIMI_CON_DETTAGLI_SRD,...INDICI_SRD])
export const CATEGORIE_SRD = Object.freeze(['Condizioni','Incantesimi','Regole','Origini','Classi','Specie','Talenti','Equipaggiamento','Oggetti magici'])
export const SCUOLE_SRD = Object.freeze([...new Set(INCANTESIMI_SRD.map(r=>r.scuola))].sort((a,b)=>a.localeCompare(b,'it')))
export function cercaRegole(testo='', categoria='', filtri={}) {
 const q=String(testo).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it-IT').trim()
 return REGOLE_SRD.filter(r=>
  (!categoria||r.categoria===categoria) &&
  (!q||[r.nome,r.sintesi,r.scuola||''].some(t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('it-IT').includes(q))) &&
  (filtri.livello==null||r.livello===Number(filtri.livello)) &&
  (!filtri.scuola||r.scuola===filtri.scuola))
}
