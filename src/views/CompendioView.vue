<script setup>
import { computed, ref } from 'vue'
import { REGOLE_SRD, cercaRegole } from '../dati/compendioSRD.js'

const ricerca = ref('')
const categoria = ref('')
const ordinamento = ref('az')
const aperta = ref(null)

const categorie = [
  { id: 'Condizioni', titolo: 'Condizioni', descrizione: 'Stati e conseguenze sul personaggio.' },
  { id: 'Incantesimi', titolo: 'Incantesimi', descrizione: 'Magia, scuole, livelli e componenti.' },
  { id: 'Regole', titolo: 'Regole', descrizione: 'Azioni, prove, combattimento e riposi.' },
  { id: 'Classi', titolo: 'Classi', descrizione: 'Progressione e capacità dei personaggi.' },
  { id: 'Specie', titolo: 'Specie', descrizione: 'Tratti e capacità delle specie giocabili.' },
  { id: 'Talenti', titolo: 'Talenti', descrizione: 'Opzioni di personalizzazione.' },
  { id: 'Equipaggiamento', titolo: 'Equipaggiamento', descrizione: 'Armi, armature e strumenti.' },
  { id: 'Oggetti magici', titolo: 'Oggetti magici', descrizione: 'Oggetti e artefatti.' }
]
const risultati = computed(() => {
  const voci = cercaRegole(ricerca.value, categoria.value)
  return [...voci].sort((a,b) => ordinamento.value === 'za'
    ? b.nome.localeCompare(a.nome,'it') : a.nome.localeCompare(b.nome,'it'))
})
function scegliCategoria(id) {
  categoria.value = id
  aperta.value = null
}
function pulisci() {
  ricerca.value = ''
  categoria.value = ''
  ordinamento.value = 'az'
  aperta.value = null
}
</script>

<template>
  <main class="compendio-pagina dmc-contenitore">
    <header class="compendio-eroe">
      <small class="compendio-sopratitolo">DUNGEON MASTER COMPANION · SRD 5.2.1</small>
      <h1>Compendio</h1>
      <p>Le regole di D&D in un unico spazio di consultazione. Cerca una voce oppure esplora le categorie.</p>
      <label class="compendio-ricerca">
        <span class="sr-only">Cerca nel compendio</span>
        <input v-model="ricerca" type="search" placeholder="Cerca nel compendio..." />
      </label>
    </header>

    <section v-if="!categoria && !ricerca.trim()" class="compendio-categorie" aria-label="Categorie del compendio">
      <button v-for="voce in categorie" :key="voce.id" type="button" class="compendio-categoria dmc-pannello" @click="scegliCategoria(voce.id)">
        <span class="compendio-categoria-titolo">{{ voce.titolo }} <small>{{ REGOLE_SRD.filter(r => r.categoria === voce.id).length }}</small></span>
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
        <p class="compendio-nota">Altri filtri, come livello e scuola degli incantesimi, saranno disponibili quando i relativi contenuti verranno integrati.</p>
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
          <details v-for="regola in risultati" :key="regola.id" class="compendio-voce dmc-pannello" :open="aperta === regola.id" @toggle="e => { if (e.target.open) aperta = regola.id; else if (aperta === regola.id) aperta = null }">
            <summary><span><strong>{{ regola.nome }}</strong><small>{{ regola.categoria }}</small></span><span aria-hidden="true">⌄</span></summary>
            <div class="compendio-testo">
              <p>{{ regola.sintesi }}</p>
              <small>SRD 5.2.1 italiano · riferimento PDF: pagina {{ regola.pagina }}</small>
            </div>
          </details>
          <p v-if="!risultati.length" class="compendio-vuoto">Nessuna voce corrispondente. Le categorie con zero voci non sono ancora state popolate.</p>
        </div>
      </section>
    </div>
    <footer class="compendio-attribuzione">Contenuti derivati dal System Reference Document 5.2.1 in italiano · CC BY 4.0. Le sintesi non sostituiscono il testo originale.</footer>
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
</style>
