<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  tabella: {
    type: Object,
    required: true,
  },
})

// Default compatto: la tabella è chiusa e, quando aperta, mostra un livello.
// L'opzione "Tutti i livelli" permette di confrontare le progressioni.
const livelloSelezionato = ref('1')
const righeVisibili = computed(() => livelloSelezionato.value === 'tutti'
  ? props.tabella.righe
  : props.tabella.righe.filter((riga) => riga[0] === livelloSelezionato.value))
const selettoreId = computed(() => 'progressione-livello-' + props.tabella.nome.toLowerCase())
</script>

<template>
  <section class="progressione-classe" :aria-label="'Progressione della classe ' + tabella.nome">
    <details>
      <summary>
        <span>Progressione per livello · apri tabella</span>
        <small>{{ tabella.righe.length }} livelli · Pagina SRD {{ tabella.paginaSRD }}</small>
      </summary>

      <div class="progressione-classe__filtro">
        <label :for="selettoreId">Visualizza il livello</label>
        <select :id="selettoreId" v-model="livelloSelezionato">
          <option value="tutti">Tutti i livelli (1–20)</option>
          <option v-for="livello in 20" :key="livello" :value="String(livello)">
            Livello {{ livello }}
          </option>
        </select>
      </div>

      <div
        class="progressione-classe__scroll"
        role="region"
        tabindex="0"
        :aria-label="'Tabella di progressione del ' + tabella.nome + ', scorrimento orizzontale'"
      >
        <table>
          <caption>Progressione del {{ tabella.nome }} — SRD 5.2.1 italiano</caption>
          <thead>
            <tr>
              <th v-for="(titolo, indice) in tabella.colonne" :key="titolo" scope="col"
                :class="{ 'progressione-classe__livello': indice === 0 }">
                {{ titolo }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(riga, indiceRiga) in righeVisibili" :key="indiceRiga">
              <th scope="row" class="progressione-classe__livello">{{ riga[0] }}</th>
              <td v-for="(cella, indiceColonna) in riga.slice(1)"
                :key="indiceColonna"
                :class="{ 'progressione-classe__privilegi': indiceColonna === 1 }">
                {{ cella }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="progressione-classe__fonte">
        Dati ricostruiti dalle tabelle dell'SRD italiana 5.2.1 (CC BY 4.0).
        Le descrizioni dei privilegi sono riportate nella sezione seguente.
      </p>
    </details>
  </section>
</template>

<style scoped>
.progressione-classe {
  margin-block: 1rem 1.5rem;
  min-width: 0;
  border: 1px solid rgba(229, 166, 92, 0.46);
  border-radius: 11px;
  background: #242d38;
  box-shadow: 2px 3px 0 rgba(6, 11, 19, 0.4);
}
.progressione-classe summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.9rem 1rem;
  cursor: pointer;
  color: #e5a65c;
  font-weight: 700;
  line-height: 1.35;
}
.progressione-classe summary small {
  font-size: 0.79rem;
  font-weight: 400;
  color: #c1cad2;
}
.progressione-classe summary:focus-visible,
.progressione-classe__scroll:focus-visible {
  outline: 2px solid #e5a65c;
  outline-offset: 2px;
}
.progressione-classe__filtro {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  padding: 0.7rem 1rem;
  color: #f2eadc;
  font-size: 0.9rem;
}
.progressione-classe__filtro select {
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(229, 166, 92, 0.55);
  border-radius: 7px;
  background: #151d27;
  color: #f2eadc;
  font: inherit;
}
.progressione-classe__filtro select:focus-visible {
  outline: 2px solid #e5a65c;
  outline-offset: 2px;
}
.progressione-classe__scroll {
  max-width: 100%;
  overflow-x: auto;
  overscroll-behavior-inline: contain;
  border-block: 1px solid rgba(229, 166, 92, 0.25);
}
.progressione-classe table {
  width: max-content;
  min-width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 0.85rem;
  line-height: 1.4;
  color: #f2eadc;
}
.progressione-classe caption {
  padding: 0.6rem 0.75rem;
  text-align: left;
  color: #c1cad2;
  font-size: 0.75rem;
  caption-side: bottom;
}
.progressione-classe th,
.progressione-classe td {
  padding: 0.55rem 0.65rem;
  border-bottom: 1px solid rgba(229, 166, 92, 0.14);
  white-space: nowrap;
  text-align: center;
  font-variant-numeric: tabular-nums;
}
.progressione-classe thead th {
  position: sticky;
  top: 0;
  background: #303b48;
  color: #f2c48d;
  font-weight: 700;
  white-space: normal;
  min-width: 4rem;
  max-width: 8rem;
  vertical-align: bottom;
}
.progressione-classe thead th:nth-child(3) {
  min-width: 18rem;
  max-width: 24rem;
  text-align: left;
}
.progressione-classe__privilegi {
  min-width: 18rem;
  max-width: 24rem;
  white-space: normal !important;
  text-align: left !important;
}
.progressione-classe tbody tr:nth-child(even) { background: rgba(255, 255, 255, 0.045); }
.progressione-classe tbody tr:hover { background: rgba(229, 166, 92, 0.12); }
.progressione-classe__livello {
  position: sticky;
  left: 0;
  z-index: 1;
  min-width: 3.5rem !important;
  background: #242d38;
  color: #f2c48d;
  font-weight: 700;
}
.progressione-classe thead .progressione-classe__livello {
  z-index: 3;
  background: #303b48;
}
.progressione-classe tbody tr:nth-child(even) .progressione-classe__livello {
  background: #303b48;
}
.progressione-classe__fonte {
  margin: 0;
  padding: 0.65rem 1rem;
  color: #c1cad2;
  font-size: 0.78rem;
  line-height: 1.5;
}
@media (max-width: 720px) {
  .progressione-classe summary { padding: 0.8rem; }
  .progressione-classe th,
  .progressione-classe td { padding: 0.48rem 0.5rem; }
  .progressione-classe table { font-size: 0.79rem; }
}
</style>
