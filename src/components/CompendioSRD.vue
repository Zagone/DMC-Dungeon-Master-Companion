<script setup>
import { computed, ref } from 'vue'
import { REGOLE_SRD, cercaRegole } from '../dati/compendioSRD.js'
const ricerca=ref('')
const categoria=ref('')
const aperta=ref(null)
const categorie=[...new Set(REGOLE_SRD.map(r=>r.categoria))]
const risultati=computed(()=>cercaRegole(ricerca.value,categoria.value))
</script>

<template>
  <section class="compendio-srd dmc-pannello" aria-labelledby="compendio-titolo">
    <header class="compendio-header">
      <div>
        <small>RIFERIMENTO RAPIDO · SRD 5.2.1</small>
        <h2 id="compendio-titolo">Compendio delle regole</h2>
        <p>Prime voci del glossario in italiano. Le schede sono sintesi: per il testo completo fa fede il documento SRD.</p>
      </div>
    </header>
    <div class="compendio-filtri">
      <label>Ricerca
        <input v-model="ricerca" type="search" placeholder="Cerca una regola..." />
      </label>
      <label>Categoria
        <select v-model="categoria">
          <option value="">Tutte le categorie</option>
          <option v-for="c in categorie" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
    </div>
    <p class="compendio-contatore">{{ risultati.length }} voci disponibili</p>
    <div class="compendio-elenco">
      <details v-for="regola in risultati" :key="regola.id" :open="aperta===regola.id" @toggle="($event) => { if ($event.target.open) aperta=regola.id; else if (aperta===regola.id) aperta=null }">
        <summary>{{ regola.nome }} <small>{{ regola.categoria }}</small></summary>
        <div class="compendio-voce">
          <p>{{ regola.sintesi }}</p>
          <small>Fonte: System Reference Document 5.2.1, Glossario delle regole · pagina PDF {{ regola.pagina }}.</small>
        </div>
      </details>
    </div>
    <p v-if="!risultati.length">Nessuna regola corrispondente.</p>
    <footer>Contenuti derivati dall'SRD 5.2.1 italiano, distribuito con licenza Creative Commons Attribution 4.0 International (CC BY 4.0). Le sintesi non sostituiscono il testo originale.</footer>
  </section>
</template>

<style scoped>
.compendio-srd { display: grid; gap: 20px; padding: 24px; color: var(--dmc-cream); }
.compendio-header small { color: var(--dmc-amber); font-size: 11px; letter-spacing: .1em; }
.compendio-header h2 { margin: 8px 0; color: var(--dmc-amber); }
.compendio-header p, .compendio-srd footer { margin: 0; color: var(--dmc-muted-light); line-height: 1.6; font-size: 13px; }
.compendio-filtri { display: grid; grid-template-columns: 2fr 1fr; gap: 14px; }
.compendio-filtri label { display: grid; gap: 7px; font-size: 13px; }
.compendio-filtri :is(input,select) { width: 100%; min-width: 0; padding: 11px; border: 1px solid var(--dmc-border); border-radius: var(--dmc-radius-xs); background: var(--dmc-ink); color: var(--dmc-cream); }
.compendio-contatore { margin: 0; font-size: 12px; color: var(--dmc-muted-light); }
.compendio-elenco { display: grid; gap: 9px; }
.compendio-elenco details { border: 1px solid var(--dmc-border-soft); border-radius: var(--dmc-radius-sm); background: var(--dmc-surface-soft); }
.compendio-elenco summary { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 14px 16px; cursor: pointer; color: var(--dmc-amber); font-weight: 700; }
.compendio-elenco summary small { color: var(--dmc-muted-light); font-weight: 400; }
.compendio-voce { padding: 0 16px 16px; font-size: 14px; line-height: 1.65; }
.compendio-voce p { margin: 0 0 8px; }
.compendio-voce small { color: var(--dmc-muted-light); }
.compendio-srd :is(input,select,summary):focus-visible { outline: 3px solid var(--dmc-blue); outline-offset: 3px; }
@media (max-width: 600px) { .compendio-filtri { grid-template-columns: 1fr; } .compendio-srd { padding: 16px; } }
</style>
