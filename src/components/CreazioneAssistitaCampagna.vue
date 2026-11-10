<script setup>
import { computed, ref, watch } from 'vue'
import ImportaSessioniJSON from './ImportaSessioniJSON.vue'

const props = defineProps({
  modalita: { type: String, default: 'campagna', validator: v => ['campagna', 'sessioni'].includes(v) }
})
const emit = defineEmits(['importata'])
const chiave = computed(() => 'dmc_creazione_chatgpt_v1_' + props.modalita)
const campi = {
  titolo: '', premessa: '', ambientazione: '', genere: 'Fantasy', atmosfera: 'Avventura e mistero',
  pg: 4, livello: 3, sessioni: 4, durata: '3–4 ore', esperienza: 'Intermedia',
  conflitto: '', antagonista: '', fazioni: '', luoghi: '', png: '', obiettivi: '',
  svolte: '', indizi: '', esplorazione: '', combattimenti: 'Equilibrati',
  difficolta: 'Moderata', ricompense: '', temi: '', limiti: '', finale: '',
  collegamenti: '', istruzioni: ''
}
function recupera() {
  try {
    const dato = JSON.parse(localStorage.getItem(chiave.value) || 'null')
    if (!dato || typeof dato !== 'object' || Array.isArray(dato)) return { ...campi }
    return Object.fromEntries(Object.entries(campi).map(([k, v]) => [k, typeof v === 'number'
      ? (Number.isFinite(Number(dato[k])) ? Number(dato[k]) : v)
      : (typeof dato[k] === 'string' ? dato[k] : v)]))
  } catch { return { ...campi } }
}
const dati = ref(recupera())
const fase = ref('progettazione')
const stato = ref('')
const errore = ref('')
const file = ref(null)
const anteprima = ref(null)
const conferma = ref(false)
const caricando = ref(false)
watch(dati, v => {
  try { localStorage.setItem(chiave.value, JSON.stringify(v)) } catch { /* spazio esaurito: il testo resta modificabile */ }
}, { deep: true })
watch(() => props.modalita, () => { dati.value = recupera(); fase.value = 'progettazione'; annullaImport() })
const passi = [
  { id: 'progettazione', nome: 'Idea e ambientazione' },
  { id: 'struttura', nome: 'Struttura narrativa' },
  { id: 'contenuti', nome: 'PNG e incontri' },
  { id: 'generazione', nome: 'ChatGPT e importazione' }
]
const indicePasso = computed(() => passi.findIndex(p => p.id === fase.value))
const titolo = computed(() => props.modalita === 'campagna' ? 'Crea una campagna con ChatGPT' : 'Crea sessioni con ChatGPT')
const introduzione = computed(() => props.modalita === 'campagna'
  ? 'Definisci un’avventura articolata in sessioni, scene e contenuti giocabili.'
  : 'Prepara le prossime sessioni tenendo conto della continuità della campagna aperta.')
const prompt = computed(() => {
  const d = dati.value
  const campagna = props.modalita === 'campagna'
  return `Sei un esperto Dungeon Master e progettista narrativo di Dungeons & Dragons 5e (regole 2024). Collaboriamo alla progettazione di ${campagna ? 'una CAMPAGNA completa' : 'una sequenza di SESSIONI per una campagna esistente'} da usare in Dungeon Master Companion (DMC).

REQUISITI DEL DUNGEON MASTER
Titolo: ${d.titolo || 'Da proporre'}
Premessa: ${d.premessa || 'Da sviluppare insieme'}
Ambientazione: ${d.ambientazione || 'Da concordare'}
Genere: ${d.genere}; atmosfera: ${d.atmosfera}
Giocatori: ${d.pg}; livello indicativo: ${d.livello}
Numero di sessioni: ${d.sessioni}; durata indicativa per sessione: ${d.durata}
Esperienza del gruppo: ${d.esperienza}
Conflitto centrale: ${d.conflitto || 'Da proporre'}
Antagonista: ${d.antagonista || 'Da proporre'}
Fazioni e relazioni: ${d.fazioni || 'Da sviluppare'}
Luoghi: ${d.luoghi || 'Da sviluppare'}
PNG e loro motivazioni: ${d.png || 'Da sviluppare'}
Obiettivi e possibili scelte: ${d.obiettivi || 'Da sviluppare'}
Svolte e conseguenze: ${d.svolte || 'Da sviluppare'}
Indizi, misteri, rivelazioni: ${d.indizi || 'Da sviluppare'}
Esplorazione e sfide non belliche: ${d.esplorazione || 'Da sviluppare'}
Combattimenti: ${d.combattimenti}; difficoltà: ${d.difficolta}
Ricompense: ${d.ricompense || 'Adeguate al livello'}
Temi narrativi: ${d.temi || 'Da proporre'}
Contenuti da evitare e limiti: ${d.limiti || 'Chiedere prima di sviluppare temi sensibili'}
Finale ed epiloghi alternativi: ${d.finale || 'Dipendenti dalle scelte dei giocatori'}
Continuità con sessioni precedenti: ${d.collegamenti || 'Non indicata'}
Ulteriori vincoli: ${d.istruzioni || 'Nessuno'}

FASE 1 — PROGETTAZIONE COLLABORATIVA
Prima di generare alcun file, proponi una struttura narrativa chiara: premessa, posta in gioco, agganci, archi, svolte e possibili finali. Esplicita ipotesi e chiedimi di correggerle. Le scelte dei giocatori devono avere conseguenze reali, con alternative ragionevoli se ignorano un indizio o evitano un incontro. Non imporre una sequenza rigida. Per ogni sessione prevedi scene distinte con descrizioni giocabili, obiettivi, informazioni scopribili, PNG e possibili esiti. Mantieni continuità, ritmo e coerenza. Progetta incontri bilanciati senza inventare ID SRD; non spacciare homebrew per materiale ufficiale.

FASE 2 — REVISIONE
Ricevi le mie modifiche e aggiorna la struttura. Non passare all'esportazione finché non scrivo esattamente: ESPORTA DMC.

FASE 3 — ESPORTAZIONE DMC
${campagna
    ? 'Alla conferma, restituisci SOLO un JSON valido nel formato del backup nativo: {"formato":"dmc-archivio-campagne","versione":2,"applicazione":"Dungeon Master Companion","creaturePersonali":[],"campagne":[{"nome":"...","descrizione":"...","stato":"preparazione","dati":{...}}]}. Nei dati usa versione:1, personaggi:[], nemici:[], iniziativa:{round:1,turnoAttivo:null}, sessioni, pngNarrativi:[], conduzione:null, note:"", bottino:[]. Ogni sessione richiede id univoco, titolo, data:"", stato:"preparazione", obiettivi, resoconto:"", pgPrevisti, livelloPrevisto, scenaAttivaId:null, sceneVisitateIds:[], risorseNarrative:[], rituale:{descrizione:"",partecipanti:[]}, scene. Ogni scena richiede id univoco, titolo, orario:"", descrizione, note:"", alternativa:"", personaggi:"", guida:[], indizi:[], pngIds:[], mostraRituale:false, incontro:{nemici:[],opzionale:false,richiedeCreature:[],suggerimentiPF:[],noteBilanciamento:""}. Non inserire ID di creature inventati.'
    : 'Alla conferma, restituisci SOLO un JSON valido: {"formato":"dmc-sessioni","versione":1,"sessioni":[...]}. Ogni sessione deve avere titolo (max 150 caratteri), obiettivi (stringa), pgPrevisti e livelloPrevisto (interi 1–20) e scene (array). Ogni scena deve avere titolo (max 150 caratteri) e descrizione (stringa); facoltativi orario, note, alternativa e personaggi. Per ora NON includere incontri con creature, ID SRD o PNG strutturati: saranno associati nell’editor DMC.'}
Il JSON deve contenere solo i dati approvati e nessun Markdown, commento o testo aggiuntivo. `
})
async function copiaPrompt() {
  errore.value = ''; stato.value = ''
  try {
    await navigator.clipboard.writeText(prompt.value)
    stato.value = 'Prompt copiato. Incollalo in ChatGPT e sviluppa la storia prima di richiedere il JSON.'
  } catch {
    errore.value = 'Copia automatica non riuscita: seleziona e copia il testo nell’anteprima.'
  }
}
function azzeraBozza() {
  dati.value = { ...campi }
  try { localStorage.removeItem(chiave.value) } catch { /* nessuna azione */ }
  stato.value = 'Bozza cancellata.'
}
function annullaImport() {
  anteprima.value = null
  conferma.value = false
  if (file.value) file.value.value = ''
}
async function leggiCampagna(evento) {
  annullaImport(); errore.value = ''; stato.value = ''
  const f = evento.target.files?.[0]
  if (!f) return
  if (!f.size || f.size > 50 * 1024 * 1024) {
    errore.value = 'Il file JSON deve essere non vuoto e inferiore a 50 MB.'
    return
  }
  caricando.value = true
  try {
    const archivio = JSON.parse(await f.text())
    const { verificaArchivio } = await import('../stato/archivioDMC.js')
    verificaArchivio(archivio)
    anteprima.value = archivio
  } catch (e) { errore.value = e instanceof SyntaxError ? 'Il file non contiene un JSON valido.' : e.message }
  finally { caricando.value = false }
}
async function importaCampagna() {
  if (!anteprima.value || !conferma.value || caricando.value) return
  caricando.value = true; errore.value = ''; stato.value = ''
  try {
    const { importaBackup } = await import('../stato/archivioDMC.js')
    const numero = importaBackup(anteprima.value, anteprima.value.campagne.map((_, i) => i))
    annullaImport()
    stato.value = numero + (numero === 1 ? ' campagna importata nella libreria.' : ' campagne importate nella libreria.')
    emit('importata')
  } catch (e) { errore.value = e.message || 'Importazione fallita.' }
  finally { caricando.value = false }
}
</script>

<template>
  <section class="creazione-chatgpt dmc-pannello" :aria-label="titolo">
    <header class="intestazione">
      <div><span class="sopratitolo">CREAZIONE ASSISTITA</span><h2>{{ titolo }}</h2><p>{{ introduzione }}</p></div>
      <span class="fase-contatore">Fase {{ indicePasso + 1 }} / 4</span>
    </header>
    <nav class="passi" aria-label="Fasi della creazione">
      <button v-for="p in passi" :key="p.id" type="button" :class="{ attivo: fase === p.id }" @click="fase = p.id">{{ p.nome }}</button>
    </nav>
    <div v-if="fase === 'progettazione'" class="campi">
      <label>Titolo o titolo provvisorio<input v-model="dati.titolo" class="dmc-campo" maxlength="160" placeholder="Es. Il Sesto Rintocco" /></label>
      <label>Premessa narrativa<textarea v-model="dati.premessa" class="dmc-campo" rows="3" placeholder="Qual è la situazione iniziale?"></textarea></label>
      <label>Ambientazione e contesto<textarea v-model="dati.ambientazione" class="dmc-campo" rows="3" placeholder="Regioni, epoca, magia, politica, storia..."></textarea></label>
      <label>Genere<select v-model="dati.genere" class="dmc-campo"><option>Fantasy</option><option>Dark fantasy</option><option>Mistero</option><option>Horror</option><option>Politico</option><option>Esplorazione</option><option>Epico</option><option>Altro</option></select></label>
      <label>Atmosfera<input v-model="dati.atmosfera" class="dmc-campo" maxlength="160" /></label>
      <label>Numero di giocatori<input v-model.number="dati.pg" class="dmc-campo" type="number" min="1" max="20" /></label>
      <label>Livello indicativo<input v-model.number="dati.livello" class="dmc-campo" type="number" min="1" max="20" /></label>
      <label>Esperienza del gruppo<select v-model="dati.esperienza" class="dmc-campo"><option>Principiante</option><option>Intermedia</option><option>Esperta</option><option>Mista</option></select></label>
    </div>
    <div v-else-if="fase === 'struttura'" class="campi">
      <label>Numero di sessioni<input v-model.number="dati.sessioni" class="dmc-campo" type="number" min="1" max="30" /></label>
      <label>Durata prevista di una sessione<input v-model="dati.durata" class="dmc-campo" maxlength="100" /></label>
      <label>Conflitto centrale<textarea v-model="dati.conflitto" class="dmc-campo" rows="3"></textarea></label>
      <label>Obiettivi e scelte dei giocatori<textarea v-model="dati.obiettivi" class="dmc-campo" rows="3"></textarea></label>
      <label>Svolte e conseguenze<textarea v-model="dati.svolte" class="dmc-campo" rows="3"></textarea></label>
      <label>Indizi e rivelazioni<textarea v-model="dati.indizi" class="dmc-campo" rows="3"></textarea></label>
      <label>Finali possibili<textarea v-model="dati.finale" class="dmc-campo" rows="3"></textarea></label>
      <label>Collegamenti con sessioni precedenti<textarea v-model="dati.collegamenti" class="dmc-campo" rows="3"></textarea></label>
    </div>
    <div v-else-if="fase === 'contenuti'" class="campi">
      <label>Antagonista e motivazioni<textarea v-model="dati.antagonista" class="dmc-campo" rows="3"></textarea></label>
      <label>Fazioni e relazioni<textarea v-model="dati.fazioni" class="dmc-campo" rows="3"></textarea></label>
      <label>Luoghi importanti<textarea v-model="dati.luoghi" class="dmc-campo" rows="3"></textarea></label>
      <label>PNG e relazioni<textarea v-model="dati.png" class="dmc-campo" rows="3"></textarea></label>
      <label>Esplorazione e sfide<textarea v-model="dati.esplorazione" class="dmc-campo" rows="3"></textarea></label>
      <label>Frequenza dei combattimenti<select v-model="dati.combattimenti" class="dmc-campo"><option>Rari</option><option>Equilibrati</option><option>Frequenti</option></select></label>
      <label>Difficoltà indicativa<select v-model="dati.difficolta" class="dmc-campo"><option>Bassa</option><option>Moderata</option><option>Alta</option><option>Variabile</option></select></label>
      <label>Ricompense<textarea v-model="dati.ricompense" class="dmc-campo" rows="2"></textarea></label>
      <label>Temi da esplorare<textarea v-model="dati.temi" class="dmc-campo" rows="2"></textarea></label>
      <label>Limiti e contenuti da evitare<textarea v-model="dati.limiti" class="dmc-campo" rows="2"></textarea></label>
      <label>Ulteriori indicazioni<textarea v-model="dati.istruzioni" class="dmc-campo" rows="3"></textarea></label>
    </div>
    <div v-else class="generazione">
      <p>Il prompt prevede una progettazione collaborativa, revisioni e solo alla fine la produzione di un JSON compatibile con DMC.</p>
      <label>Anteprima del prompt<textarea class="dmc-campo anteprima" :value="prompt" rows="12" readonly></textarea></label>
      <div class="azioni">
        <button type="button" class="dmc-btn" @click="copiaPrompt">Copia prompt</button>
        <a class="dmc-btn dmc-btn--secondary" href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">Apri ChatGPT</a>
      </div>
      <div v-if="modalita === 'campagna'" class="importazione">
        <h3>Importa la campagna generata</h3>
        <p>Carica il JSON conclusivo dopo averlo revisionato con ChatGPT. L'importazione crea una nuova campagna e non sovrascrive quelle presenti.</p>
        <input ref="file" type="file" accept=".json,application/json" :disabled="caricando" @change="leggiCampagna" />
        <div v-if="anteprima" class="elenco">
          <strong>Anteprima: {{ anteprima.campagne.length }} campagne</strong>
          <p v-for="(c,i) in anteprima.campagne" :key="i">{{ c.nome }} · {{ c.dati.sessioni.length }} sessioni</p>
          <label class="conferma"><input v-model="conferma" type="checkbox" /> Confermo l'importazione nella libreria.</label>
          <button class="dmc-btn" type="button" :disabled="!conferma || caricando" @click="importaCampagna">Importa campagna</button>
          <button class="dmc-btn dmc-btn--secondary" type="button" @click="annullaImport">Annulla</button>
        </div>
      </div>
      <ImportaSessioniJSON v-else />
    </div>
    <div class="navigazione">
      <button type="button" class="dmc-btn dmc-btn--secondary" :disabled="indicePasso === 0" @click="fase = passi[indicePasso - 1].id">Indietro</button>
      <button v-if="indicePasso < 3" type="button" class="dmc-btn" @click="fase = passi[indicePasso + 1].id">Continua</button>
      <button type="button" class="dmc-btn dmc-btn--secondary" @click="azzeraBozza">Cancella bozza</button>
    </div>
    <p v-if="stato" role="status">{{ stato }}</p>
    <p v-if="errore" role="alert" class="errore">{{ errore }}</p>
    <small>La bozza viene conservata nel browser. ChatGPT si apre in una nuova scheda: non è richiesta alcuna chiave API.</small>
  </section>
</template>

<style scoped>
.creazione-chatgpt{padding:24px;display:grid;gap:20px;color:var(--dmc-cream,#f4e7d2)}
.intestazione{display:flex;justify-content:space-between;align-items:flex-start;gap:20px}
.intestazione h2{margin:4px 0 10px;color:var(--dmc-amber,#e5a65c)}
.intestazione p,.generazione p{line-height:1.65;margin:0}
.sopratitolo,.fase-contatore{font-size:.75rem;letter-spacing:.1em;color:var(--dmc-amber,#e5a65c)}
.passi{display:flex;gap:8px;flex-wrap:wrap}
.passi button{background:transparent;border:1px solid #776b5d;border-radius:10px;padding:10px;color:inherit;cursor:pointer}
.passi button.attivo{border-color:var(--dmc-amber,#e5a65c);background:#e5a65c20}
.campi{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
.campi label,.generazione label{display:grid;gap:7px;min-width:0}
.campi textarea,.campi label:has(textarea){grid-column:1/-1}
.dmc-campo{width:100%;min-width:0;color:inherit;background:#18212c;border:1px solid #75624b;border-radius:8px;padding:10px;font:inherit}
.anteprima{resize:vertical}
.generazione,.importazione,.elenco{display:grid;gap:15px}
.importazione{border-top:1px solid #75624b;padding-top:18px}
.azioni,.navigazione{display:flex;flex-wrap:wrap;gap:10px}
.conferma{display:flex!important;align-items:center;gap:10px}
.errore{color:#f5b2a9}
.creazione-chatgpt :is(button,input,textarea,select,a):focus-visible{outline:3px solid var(--dmc-amber,#e5a65c);outline-offset:3px}
@media(max-width:700px){.campi{grid-template-columns:1fr}.intestazione{display:block}.creazione-chatgpt{padding:14px}}
</style>
