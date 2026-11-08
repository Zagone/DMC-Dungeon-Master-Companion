<script setup>
import IconaDirezione from './IconaDirezione.vue'

// Nelle card il controllo nativo è il contenitore: la placca diventa uno span.
// Altrove può essere un button o un link, senza duplicare aspetto e icona.
defineProps({
  elemento: { type: String, default: 'button', validator: value => ['button', 'a', 'span'].includes(value) },
  tono: { type: String, default: 'ardesia', validator: value => ['ambra', 'ardesia'].includes(value) },
  bloccata: Boolean,
})
</script>

<template>
  <component
    :is="elemento"
    :type="elemento === 'button' ? 'button' : undefined"
    :disabled="elemento === 'button' && bloccata ? true : undefined"
    class="placca-azione"
    :class="[`placca-azione--${tono}`, { 'placca-azione--bloccata': bloccata }]"
  >
    <span class="placca-azione__testo"><slot /></span>
    <IconaDirezione :bloccata="bloccata" />
  </component>
</template>

<style scoped>
.placca-azione {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  min-width: 0;
  min-height: 54px;
  padding: 13px 23px;
  border: 0;
  background: transparent;
  color: var(--dmc-cream);
  font: 800 15px/1.25 var(--dmc-font-illustrated);
  text-align: left;
  text-decoration: none;
}
.placca-azione::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 0;
  pointer-events: none;
  border: 10px solid transparent;
  /* I quattro angoli mantengono dimensioni fisse; si estendono solo i lati. */
  border-image: url('../../assets/ui/crooked-realms-r4/placca-ardesia.webp') 32 130 36 130 fill / 10px 35px 12px 35px / 0 stretch;
  filter: drop-shadow(0 2px 1px #080c12);
  transition: filter 140ms ease;
}
.placca-azione--ambra { color: #141923; }
.placca-azione--ambra::before {
  border-image-source: url('../../assets/ui/crooked-realms-r4/placca-ambra.webp');
}
.placca-azione:not(.placca-azione--ambra) :deep(.icona-direzione) { color: var(--dmc-amber); }
.placca-azione__testo { overflow-wrap: anywhere; }
.placca-azione--bloccata { color: #c4c5c3; }
.placca-azione--bloccata :deep(.icona-direzione) { color: inherit !important; width: 22px; }
:is(button, a).placca-azione:not(:disabled):hover::before { filter: brightness(1.12) drop-shadow(0 2px 1px #080c12); }
:is(button, a).placca-azione:focus-visible { outline: 3px solid var(--dmc-blue); outline-offset: 3px; border-radius: 8px; }
@media (prefers-reduced-motion: reduce) { .placca-azione::before { transition: none; } }
</style>
