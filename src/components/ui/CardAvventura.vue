<script setup>
import PlaccaAzione from './PlaccaAzione.vue'

defineProps({
  immagine: { type: String, required: true },
  titolo: { type: String, required: true },
  azione: { type: String, required: true },
  primaria: Boolean,
  futura: Boolean,
})
</script>

<template>
  <component
    :is="futura ? 'article' : 'button'"
    :type="futura ? undefined : 'button'"
    class="card-avventura"
    :class="{ 'card-avventura--futura': futura }"
  >
    <span class="card-avventura__immagine">
      <img :src="immagine" alt="" decoding="async" width="900" height="500" />
      <span v-if="futura" class="card-avventura__stato">IN SVILUPPO</span>
    </span>
    <span class="card-avventura__corpo">
      <strong class="card-avventura__titolo">{{ titolo }}</strong>
      <span class="card-avventura__descrizione"><slot /></span>
      <PlaccaAzione elemento="span" :tono="primaria ? 'ambra' : 'ardesia'" :bloccata="futura">
        {{ azione }}
      </PlaccaAzione>
    </span>
  </component>
</template>

<style scoped>
.card-avventura {
  position: relative;
  isolation: isolate;
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
  padding: 17px;
  border: 0;
  background: transparent;
  color: var(--dmc-cream);
  text-align: left;
  /* Nessun clip-path sul controllo: il focus rimane esterno e leggibile. */
}
.card-avventura::before {
  content: '';
  position: absolute;
  z-index: -1;
  inset: 7px;
  border-radius: 26px 32px 27px 24px;
  background: var(--dmc-surface);
}
.card-avventura::after {
  content: '';
  position: absolute;
  z-index: 1;
  inset: 0;
  pointer-events: none;
  border: 45px solid transparent;
  border-image: url('../../assets/ui/crooked-realms-r4/cornice-ardesia.webp') 190 / 45px / 0 stretch;
  filter: drop-shadow(0 4px 2px rgb(0 0 0 / 55%));
  transition: filter 140ms ease;
}
.card-avventura__immagine,
.card-avventura__corpo {
  position: relative;
  z-index: 2;
}
.card-avventura__immagine {
  display: block;
  width: 100%;
  aspect-ratio: 1.95;
  overflow: hidden;
  border-radius: 18px 14px 8px 9px;
  background: var(--dmc-ink);
  /* Il media passa sotto i bordi interni della cornice, non sopra gli angoli. */
  z-index: 0;
}
.card-avventura__immagine img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.card-avventura__stato {
  position: absolute;
  right: 10px;
  top: 12px;
  padding: 6px 10px;
  border: 2px solid #141923;
  border-radius: 3px 7px 4px 2px;
  background: var(--dmc-amber);
  color: var(--dmc-ink);
  font: 800 10px/1.2 var(--dmc-font-body);
  letter-spacing: 0.08em;
  box-shadow: 1px 2px 0 #141923;
}
.card-avventura__corpo {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 8px;
  min-width: 0;
  padding: 23px 15px 10px;
}
.card-avventura__corpo::before {
  content: '';
  position: absolute;
  top: -7px;
  left: -10px;
  right: -10px;
  height: 16px;
  background: url('../../assets/ui/crooked-realms-r4/traversa-ardesia.svg') center / 100% 100%
    no-repeat;
  pointer-events: none;
}
.card-avventura__titolo {
  font: 700 clamp(24px, 2.15vw, 31px)/1.12 var(--dmc-font-illustrated);
  letter-spacing: -0.025em;
  text-shadow: 1px 2px 0 #0d1118;
  overflow-wrap: anywhere;
}
.card-avventura__descrizione {
  display: block;
  margin-bottom: 11px;
  color: #ded7c9;
  font: 400 14px/1.5 var(--dmc-font-body);
  overflow-wrap: anywhere;
}
.card-avventura__corpo :deep(.placca-azione) {
  margin-top: auto;
}
button.card-avventura:hover::after {
  filter: brightness(1.14) drop-shadow(0 4px 2px rgb(0 0 0 / 55%));
}
button.card-avventura:hover :deep(.placca-azione::before) {
  filter: brightness(1.08) drop-shadow(0 2px 1px #080c12);
}
.card-avventura:focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 4px;
  border-radius: 14px;
}
@media (max-width: 1050px) and (min-width: 801px) {
  .card-avventura {
    padding: 14px;
  }
  .card-avventura__corpo {
    padding: 21px 9px 9px;
  }
  .card-avventura__corpo :deep(.placca-azione) {
    padding-inline: 17px;
    font-size: 13px;
    gap: 5px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .card-avventura::after {
    transition: none;
  }
}
</style>
