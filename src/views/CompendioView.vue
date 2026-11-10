<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { REGOLE_SRD, SCUOLE_SRD } from '../dati/compendioSRD.js'
import { validaArchivioIncantesimi } from '../dati/archivioIncantesimiCompleti.js'
import { caricaSezioneSRD, estrattoVoceSRD } from '../dati/caricamentoSezioniSRD.js'
import { estraiSchedeSpecieSRD } from '../dati/estrazioneSpecieSRD.js'

const ricerca = ref('')
const archivioCompleto = ref(null)
const schedeSpecie = ref(new Map())
const testoFonte = ref('')
const voceFonte = ref(null)
const erroreFonte = ref('')
const caricamentoFonte = ref(false)
onMounted(async () => {
  const risultati = await Promise.allSettled([
    caricaSezioneSRD('Incantesimi'),
    caricaSezioneSRD('Specie')
  ])
  if (risultati[0].status === 'fulfilled') {
    try {
      archivioCompleto.value = validaArchivioIncantesimi(risultati[0].value)
    } catch (errore) {
      console.warn('Schede incantesimi non valide; viene mostrato l’indice SRD.', errore)
    }
  }
  if (risultati[1].status === 'fulfilled') {
    try {
      schedeSpecie.value = new Map(estraiSchedeSpecieSRD(risultati[1].value).map(v => [v.nome, v]))
    } catch (errore) {
      console.warn('Segmentazione specie non disponibile; rimane consultabile il testo per pagina.', errore)
    }
  }
})
const vociCompendio = computed(() => {
  const nuove = new Map((archivioCompleto.value || []).map(v => [v.nome, v]))
  return REGOLE_SRD.map(v => {
    if (v.categoria === 'Incantesimi') {
      const dettagli = nuove.get(v.nome)
      return dettagli ? { ...v, ...dettagli, id: v.id, categoria: v.categoria, sintesi: dettagli.descrizione || v.sintesi } : v
    }
    if (v.categoria === 'Specie') {
      const dettagli = schedeSpecie.value.get(v.nome)
      return dettagli ? { ...v, estrattoSpecie: dettagli.descrizione, pagineFonte: dettagli.pagine } : v
    }
    return v
  })
})
const categoria = ref('')
const ordinamento = ref('az')
const livello = ref('')
const scuola = ref('')
const tempo = ref('')
const componente = ref('')
const soloDettagli = ref(false)
const pagina = ref(1)
const perPagina = 35
const filtriMagia = computed(() => categoria.value === 'Incantesimi')
const aperta = ref(null)

const categorie = [
  { id: 'Condizioni', titolo: 'Condizioni', descrizione: 'Stati e conseguenze sul personaggio.' },
  { id: 'Incantesimi', titolo: 'Incantesimi', descrizione: 'Magia, scuole, livelli e componenti.' },
  { id: 'Regole', titolo: 'Regole', descrizione: 'Azioni, prove, combattimento e riposi.' },
  { id: 'Origini', titolo: 'Origini', descrizione: 'Background e dotazioni iniziali.' },
  { id: 'Classi', titolo: 'Classi', descrizione: 'Progressione e capacità dei personaggi.' },
  { id: 'Specie', titolo: 'Specie', descrizione: 'Tratti e capacità delle specie giocabili.' },
  { id: 'Talenti', titolo: 'Talenti', descrizione: 'Opzioni di personalizzazione.' },
  { id: 'Equipaggiamento', titolo: 'Equipaggiamento', descrizione: 'Armi, armature e strumenti.' },
  { id: 'Oggetti magici', titolo: 'Oggetti magici', descrizione: 'Oggetti e artefatti.' }
]
const risultati = computed(() => {
  const q = ricerca.value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it-IT').trim()
  const voci = vociCompendio.value.filter(v =>
    (!categoria.value || v.categoria === categoria.value) &&
    (livello.value === '' || v.livello === Number(livello.value)) &&
    (!scuola.value || v.scuola === scuola.value) &&
    (!tempo.value || (v.tempoLancio || '').toLocaleLowerCase('it-IT').includes(tempo.value)) &&
    (!componente.value || new RegExp('(^|[, ])' + componente.value + '(?=[, (]|$)').test(v.componenti || '')) &&
    (!q || [v.nome, v.sintesi || '', v.scuola || ''].some(t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it-IT').includes(q))))
  return voci.filter(v => !soloDettagli.value || v.categoria !== 'Incantesimi' || Boolean(v.verificato || v.dettagliCompleti)).sort((a,b) => ordinamento.value === 'za'
    ? b.nome.localeCompare(a.nome,'it') : a.nome.localeCompare(b.nome,'it'))
})
const pagineTotali = computed(() => Math.max(1, Math.ceil(risultati.value.length / perPagina)))
const risultatiPagina = computed(() => risultati.value.slice((pagina.value - 1) * perPagina, pagina.value * perPagina))
async function consultaFonte(regola) {
  if (caricamentoFonte.value) return
  if (testoFonte.value && voceFonte.value === regola.id) {
    testoFonte.value = ''
    return
  }
  testoFonte.value = ''
  erroreFonte.value = ''
  voceFonte.value = regola.id
  caricamentoFonte.value = true
  try {
    const dati = await caricaSezioneSRD(regola.categoria)
    if (voceFonte.value !== regola.id) return
    testoFonte.value = estrattoVoceSRD(dati, regola).testo
    if (!testoFonte.value) erroreFonte.value = 'La pagina non è presente in questo archivio.'
  } catch (errore) {
    if (voceFonte.value === regola.id) erroreFonte.value = errore.message
  } finally {
    caricamentoFonte.value = false
  }
}
function scegliCategoria(id) {
  categoria.value = id
  livello.value = ''
  scuola.value = ''
  tempo.value = ''
  componente.value = ''
  soloDettagli.value = false
  pagina.value = 1
  aperta.value = null
  testoFonte.value = ''
  erroreFonte.value = ''
  voceFonte.value = null
}
function pulisci() {
  ricerca.value = ''
  categoria.value = ''
  ordinamento.value = 'az'
  livello.value = ''
  scuola.value = ''
  soloDettagli.value = false
  pagina.value = 1
  aperta.value = null
  testoFonte.value = ''
  erroreFonte.value = ''
  voceFonte.value = null
}
watch([ricerca, categoria, livello, scuola, tempo, componente, soloDettagli, ordinamento], () => { pagina.value = 1; aperta.value = null; testoFonte.value = ''; erroreFonte.value = ''; voceFonte.value = null })
</script>

<template>
  <main class="compendio-pagina dmc-contenitore">
    <header class="compendio-eroe">
      <small class="compendio-sopratitolo">DUNGEON MASTER COMPANION · SRD 5.2.1</small>
      <h1>Compendio</h1>
      <p>Consulta le condizioni, le regole e gli incantesimi dell'SRD 5.2.1. Cerca una voce oppure esplora le categorie.</p>
      <label class="compendio-ricerca">
        <span class="sr-only">Cerca nel compendio</span>
        <input v-model="ricerca" type="search" placeholder="Cerca nel compendio..." />
      </label>
    </header>

    <section v-if="!categoria && !ricerca.trim()" class="compendio-categorie" aria-label="Categorie del compendio">
      <button v-for="voce in categorie" :key="voce.id" type="button" class="compendio-categoria dmc-pannello" @click="scegliCategoria(voce.id)">
        <span class="compendio-categoria-titolo">{{ voce.titolo }} <small>{{ vociCompendio.filter(r => r.categoria === voce.id).length }}</small></span>
        <span class="compendio-categoria-descrizione">{{ voce.descrizione }}</span>
      </button>
    </section>

    <div class="compendio-layout">
      <aside class="compendio-filtri dmc-pannello" aria-label="Filtri del compendio">
        <div class="compendio-filtri-testa"><h2>Filtri</h2><button type="button" @click="pulisci">Azzera</button></div>
        <fieldset>
          <legend>Categoria</legend>
          <label><input v-model="categoria" type="radio" value="" /> Tutte</label>
          <label v-for="voce in categorie" :key="voce.id">
            <input v-model="categoria" type="radio" :value="voce.id" />
            {{ voce.titolo }} <small>({{ REGOLE_SRD.filter(r => r.categoria === voce.id).length }})</small>
          </label>
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Livello</legend>
          <label><input v-model="livello" type="radio" value="" /> Tutti i livelli</label>
          <label v-for="n in 10" :key="n"><input v-model="livello" type="radio" :value="String(n - 1)" /> {{ n === 1 ? 'Trucchetto' : 'Livello ' + (n - 1) }}</label>
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Scuola</legend>
          <label><input v-model="scuola" type="radio" value="" /> Tutte le scuole</label>
          <label v-for="s in SCUOLE_SRD" :key="s"><input v-model="scuola" type="radio" :value="s" /> {{ s }}</label>
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Tempo di lancio</legend>
          <label><input v-model="tempo" type="radio" value="" /> Tutti</label>
          <label><input v-model="tempo" type="radio" value="azione bonus" /> Azione bonus</label>
          <label><input v-model="tempo" type="radio" value="reazione" /> Reazione</label>
          <label><input v-model="tempo" type="radio" value="rituale" /> Rituale</label>
          <label><input v-model="tempo" type="radio" value="minuto" /> Minuti</label>
        </fieldset>
        <fieldset v-if="filtriMagia">
          <legend>Componenti</legend>
          <label><input v-model="componente" type="radio" value="" /> Tutte</label>
          <label><input v-model="componente" type="radio" value="V" /> Verbali (V)</label>
          <label><input v-model="componente" type="radio" value="S" /> Somatiche (S)</label>
          <label><input v-model="componente" type="radio" value="M" /> Materiali (M)</label>
        </fieldset>
        <label v-if="filtriMagia" class="compendio-opzione-dettagli"><input v-model="soloDettagli" type="checkbox" /> Solo schede con dettagli disponibili</label>
        <p class="compendio-nota">Le schede integrali provengono dall’estrazione del PDF e non sono ancora tutte revisionate manualmente.</p>
      </aside>

      <section class="compendio-risultati" aria-label="Risultati del compendio">
        <div class="compendio-barra">
          <div><h2>{{ categoria || (ricerca ? 'Risultati della ricerca' : 'Tutte le voci') }}</h2><small>{{ risultati.length }} risultati</small></div>
          <label>Ordina
            <select v-model="ordinamento">
              <option value="az">Nome A–Z</option>
              <option value="za">Nome Z–A</option>
            </select>
          </label>
        </div>
        <div class="compendio-elenco">
          <details v-for="regola in risultatiPagina" :key="regola.id" class="compendio-voce dmc-pannello" :open="aperta === regola.id" @toggle="e => { if (e.target.open) { aperta = regola.id; testoFonte = ''; erroreFonte = ''; voceFonte = null } else if (aperta === regola.id) { aperta = null; testoFonte = ''; erroreFonte = '' } }">
            <summary><span><strong>{{ regola.nome }}</strong><small>{{ regola.categoria === "Incantesimi" ? (regola.livello === 0 ? "Trucchetto" : "Livello " + regola.livello) + " · " + regola.scuola : regola.categoria }}</small></span><span aria-hidden="true">⌄</span></summary>
            <div class="compendio-testo">
              <p v-if="regola.dettagliCompleti" class="compendio-descrizione">{{ regola.descrizione }}</p>
              <p v-else>{{ regola.sintesi }}</p>
              <div v-if="regola.estrattoSpecie" class="compendio-estratto-specie"><small>Estratto SRD suddiviso automaticamente per specie · non ancora revisionato</small><pre>{{ regola.estrattoSpecie }}</pre></div>
              <dl v-if="regola.verificato || regola.dettagliCompleti" class="compendio-scheda-incantesimo">
                <div><dt>Tempo di lancio</dt><dd>{{ regola.tempoLancio }}</dd></div>
                <div><dt>Gittata</dt><dd>{{ regola.gittata }}</dd></div>
                <div><dt>Componenti</dt><dd>{{ regola.componenti }}</dd></div>
                <div><dt>Durata</dt><dd>{{ regola.durata }}</dd></div>
              </dl>
              <p v-if="regola.categoria === 'Incantesimi'" class="compendio-metadata"><strong>Scuola:</strong> {{ regola.scuola }} · <strong>Livello:</strong> {{ regola.livello === 0 ? 'Trucchetto' : regola.livello }}</p>
              <small>SRD 5.2.1 italiano · riferimento PDF: pagina {{ regola.pagina }}</small>
              <div v-if="regola.categoria !== 'Incantesimi'" class="compendio-fonte">
                <button type="button" :disabled="caricamentoFonte" @click="consultaFonte(regola)">Consulta testo della pagina SRD</button>
                <p v-if="erroreFonte && voceFonte === regola.id && aperta === regola.id" role="status">{{ erroreFonte }}</p>
                <pre v-if="testoFonte && voceFonte === regola.id && aperta === regola.id">{{ testoFonte }}</pre>
              </div>
            </div>
          </details>
          <nav v-if="pagineTotali > 1" class="compendio-paginazione" aria-label="Pagine dei risultati"><button type="button" :disabled="pagina === 1" @click="pagina--">Precedente</button><span>Pagina {{ pagina }} di {{ pagineTotali }}</span><button type="button" :disabled="pagina === pagineTotali" @click="pagina++">Successiva</button></nav>
          <p v-if="!risultati.length" class="compendio-vuoto">Nessuna voce corrispondente. Le categorie con zero voci non sono ancora state popolate.</p>
        </div>
      </section>
    </div>
    <footer class="compendio-attribuzione">Quest'opera include materiale tratto dal System Reference Document 5.2.1 ("SRD 5.2.1") di Wizards of the Coast LLC, disponibile all'indirizzo https://www.dndbeyond.com/srd. Il SRD 5.2.1 è concesso in licenza ai sensi della licenza di attribuzione 4.0 Internazionale di Creative Commons, disponibile all'indirizzo https://creativecommons.org/licenses/by/4.0/legalcode. Le sintesi non sostituiscono il testo originale.</footer>
  </main>
</template>

<style scoped>
.compendio-pagina { padding-top: 38px; padding-bottom: 65px; }
.compendio-eroe { max-width: 900px; margin: 0 auto 34px; text-align: center; }
.compendio-sopratitolo { color: #e5a65c; letter-spacing: .14em; font-size: 11px; font-weight: 700; }
.compendio-eroe h1 { margin: 10px 0; color: #e5a65c; font-size: clamp(34px, 5vw, 56px); }
.compendio-eroe p { margin: 0 auto 23px; max-width: 620px; line-height: 1.6; color: #b8c2ca; }
.compendio-ricerca input { width: 100%; padding: 15px 18px; border: 1px solid #64727c; border-radius: 12px; background: #101e2a; color: #f6eee2; font: inherit; }
.compendio-categorie { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 12px; margin-bottom: 28px; }
.compendio-categoria { display: grid; gap: 7px; text-align: left; padding: 19px; border: 1px solid #53616c; border-radius: 13px; cursor: pointer; background: #242d38; color: #f6eee2; font: inherit; }
.compendio-categoria:hover { border-color: #e5a65c; }
.compendio-categoria-titolo { color: #e5a65c; font-weight: 700; }
.compendio-categoria-titolo small { margin-left: 5px; color: #c8d1d8; }
.compendio-categoria-descrizione { color: #b8c2ca; font-size: 12px; line-height: 1.5; }
.compendio-layout { display: grid; grid-template-columns: minmax(210px,260px) minmax(0,1fr); gap: 20px; align-items: start; }
.compendio-filtri { padding: 20px; border: 1px solid #53616c; border-radius: 14px; }
.compendio-filtri-testa { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.compendio-filtri h2,.compendio-barra h2 { margin: 0; font-size: 20px; color: #e5a65c; }
.compendio-filtri-testa button { border: 0; background: none; color: #c8d1d8; text-decoration: underline; cursor: pointer; }
.compendio-filtri fieldset { border: 0; border-top: 1px solid #53616c; padding: 18px 0 0; margin: 17px 0 0; display: grid; gap: 12px; }
.compendio-filtri legend { font-weight: 700; font-size: 12px; text-transform: uppercase; padding-top: 10px; }
.compendio-filtri label { display: flex; gap: 8px; align-items: center; font-size: 13px; cursor: pointer; }
.compendio-filtri input { accent-color: #e5a65c; }
.compendio-filtri label small { color: #aab8c4; }
.compendio-nota { margin: 20px 0 0; font-size: 12px; line-height: 1.6; color: #b8c2ca; }
.compendio-barra { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.compendio-barra small { color: #b8c2ca; }
.compendio-barra label { display: flex; align-items: center; gap: 8px; font-size: 12px; }
.compendio-barra select { padding: 9px; border: 1px solid #64727c; border-radius: 8px; background: #101e2a; color: #f6eee2; }
.compendio-elenco { display: grid; gap: 10px; }
.compendio-voce { border: 1px solid #53616c; border-radius: 12px; overflow: hidden; }
.compendio-voce summary { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; cursor: pointer; }
.compendio-voce summary span:first-child { display: grid; gap: 4px; }
.compendio-voce strong { color: #e5a65c; }
.compendio-voce summary small,.compendio-testo small { color: #b8c2ca; font-size: 12px; }
.compendio-testo { padding: 0 20px 20px; line-height: 1.7; }
.compendio-testo p { margin: 0 0 12px; }
.compendio-vuoto { padding: 24px; border: 1px dashed #64727c; border-radius: 12px; color: #b8c2ca; }
.compendio-attribuzione { margin-top: 30px; color: #b8c2ca; font-size: 12px; line-height: 1.6; }
.compendio-pagina :is(button,input,select,summary):focus-visible { outline: 3px solid #e5a65c; outline-offset: 3px; }
@media (max-width: 1000px) { .compendio-categorie { grid-template-columns: repeat(2,minmax(0,1fr)); } }
@media (max-width: 680px) { .compendio-layout { grid-template-columns: 1fr; } .compendio-categorie { grid-template-columns: 1fr 1fr; } .compendio-pagina { padding-top: 24px; } }
@media (max-width: 430px) { .compendio-categorie { grid-template-columns: 1fr; } }
.compendio-metadata { font-size: 13px; color: #c8d1d8; }
.compendio-paginazione { display: flex; align-items: center; justify-content: center; gap: 16px; flex-wrap: wrap; padding: 18px; }
.compendio-paginazione button { padding: 9px 14px; background: #242d38; border: 1px solid #64727c; border-radius: 8px; color: #f6eee2; cursor: pointer; }
.compendio-paginazione button:disabled { opacity: .45; cursor: not-allowed; }
.compendio-scheda-incantesimo { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; margin: 18px 0; }
.compendio-scheda-incantesimo div { padding: 12px; border: 1px solid #53616c; border-radius: 8px; }
.compendio-scheda-incantesimo dt { color: #e5a65c; font-size: 12px; font-weight: 700; }
.compendio-scheda-incantesimo dd { margin: 4px 0 0; overflow-wrap: anywhere; }
.compendio-opzione-dettagli { display: flex; align-items: flex-start; gap: 8px; margin-top: 18px; font-size: 12px; line-height: 1.5; }
@media (max-width: 430px) { .compendio-scheda-incantesimo { grid-template-columns: 1fr; } }
.compendio-descrizione { white-space: pre-line; }
.compendio-fonte { margin-top: 12px; }
.compendio-fonte button { background: none; border: 1px solid #64727c; color: #e5a65c; border-radius: 8px; padding: 8px 12px; cursor: pointer; }
.compendio-fonte pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 13px; line-height: 1.65; padding: 14px; background: #101e2a; border: 1px solid #53616c; border-radius: 9px; max-height: 500px; overflow: auto; }
.compendio-estratto-specie { margin: 12px 0 16px; }
.compendio-estratto-specie pre { white-space: pre-wrap; overflow-wrap: anywhere; font: inherit; font-size: 13px; line-height: 1.65; padding: 14px; background: #101e2a; border: 1px solid #53616c; border-radius: 9px; max-height: 560px; overflow: auto; }
</style>
