<script setup>
import { computed } from 'vue'
import { blocchiTestoSRD } from '../dati/letturaStrutturataSRD.js'

const props = defineProps({
  testo: { type: String, required: true },
  etichetta: { type: String, default: 'Testo SRD 5.2.1' },
})
const blocchi = computed(() => blocchiTestoSRD(props.testo))
</script>

<template>
  <article class="lettura-srd" :aria-label="etichetta">
    <template v-for="(blocco, indice) in blocchi" :key="indice">
      <h4 v-if="blocco.tipo === 'titolo'" class="lettura-srd__titolo">{{ blocco.testo }}</h4>
      <p v-else-if="blocco.tipo === 'pagina'" class="lettura-srd__pagina">{{ blocco.testo }}</p>
      <p v-else-if="blocco.tipo === 'elenco'" class="lettura-srd__elenco">{{ blocco.testo }}</p>
      <p v-else class="lettura-srd__paragrafo">{{ blocco.testo }}</p>
    </template>
  </article>
</template>

<style scoped>
.lettura-srd {
  display: grid;
  gap: 0.85rem;
  min-width: 0;
  max-width: 80ch;
  color: var(--dmc-cream, #f6eee2);
  font-family: var(--dmc-font-body, system-ui, sans-serif);
  font-size: 0.98rem;
  line-height: 1.72;
  overflow-wrap: anywhere;
}
.lettura-srd__paragrafo,
.lettura-srd__pagina,
.lettura-srd__elenco {
  margin: 0;
  white-space: normal;
}
.lettura-srd__titolo {
  margin: 0.75rem 0 0.1rem;
  padding-bottom: 0.45rem;
  border-bottom: 1px solid rgba(229, 166, 92, 0.3);
  color: var(--dmc-amber, #e5a65c);
  font-size: 1.04rem;
  font-weight: 700;
  line-height: 1.4;
}
.lettura-srd__pagina {
  margin-top: 0.65rem;
  color: #c4cbd2;
  font-size: 0.82rem;
  letter-spacing: 0.04em;
}
.lettura-srd__elenco {
  position: relative;
  padding-left: 1.45rem;
}
.lettura-srd__elenco::before {
  content: '•';
  position: absolute;
  left: 0.45rem;
  color: var(--dmc-amber, #e5a65c);
}
@media (max-width: 540px) {
  .lettura-srd { font-size: 0.93rem; line-height: 1.6; }
}
</style>
