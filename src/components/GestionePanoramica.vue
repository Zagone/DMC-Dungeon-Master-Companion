<script setup>
import { computed } from 'vue'
import { datiCampagna, conduzioneAttiva } from '../stato/statoDatiCampagna.js'

defineProps({
  campagna: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['vai-sezione', 'modifica-campagna', 'riprendi-sessione'])

const numeroSessioni = computed(() => datiCampagna.value?.sessioni?.length ?? 0)

const numeroPG = computed(() => datiCampagna.value?.personaggi?.length ?? 0)

const numeroNemici = computed(() => datiCampagna.value?.nemici?.length ?? 0)
</script>

<template>
  <section class="panoramica">
    <h2>Panoramica</h2>

    <div class="descrizione dmc-pannello">
      <div class="intestazione">
        <h3>La tua avventura comincia qui</h3>

        <button
          type="button"
          class="pulsante secondario dmc-btn dmc-btn--secondary"
          @click="emit('modifica-campagna')"
        >
          Modifica campagna
        </button>
      </div>

      <p v-if="campagna.descrizione" class="testo">
        {{ campagna.descrizione }}
      </p>

      <p v-else class="testo secondario">
        Non hai ancora inserito una descrizione. Puoi aggiungere l'ambientazione, il conflitto
        principale e le informazioni fondamentali della campagna.
      </p>
    </div>

    <div v-if="conduzioneAttiva" class="ripresa-sessione dmc-pannello">
      <div>
        <small>SESSIONE IN CONDUZIONE</small>

        <h3>
          {{ conduzioneAttiva.sessione.titolo || 'Sessione senza titolo' }}
        </h3>

        <p>
          Scena {{ conduzioneAttiva.indice + 1 }} ·
          {{ conduzioneAttiva.scena.titolo?.trim() || `Scena ${conduzioneAttiva.indice + 1}` }}
        </p>
      </div>

      <button type="button" class="pulsante principale dmc-btn" @click="emit('riprendi-sessione')">
        Riprendi sessione →
      </button>
    </div>

    <div class="collegamenti">
      <button
        type="button"
        class="collegamento dmc-pannello dmc-pannello--rilievo dmc-carta"
        @click="emit('vai-sezione', 'sessioni')"
      >
        <span class="nome"> Sessioni <span>→</span> </span>

        <strong>{{ numeroSessioni }}</strong>
        <small>Sessioni preparate</small>
      </button>

      <button
        type="button"
        class="collegamento dmc-pannello dmc-pannello--rilievo dmc-carta"
        @click="emit('vai-sezione', 'battaglia')"
      >
        <span class="nome"> Battaglia <span>→</span> </span>

        <strong>{{ numeroPG }}</strong>
        <small>PG · {{ numeroNemici }} nemici presenti</small>
      </button>

      <button
        type="button"
        class="collegamento dmc-pannello dmc-pannello--rilievo dmc-carta"
        @click="emit('vai-sezione', 'note')"
      >
        <span class="nome"> Note <span>→</span> </span>

        <strong>✎</strong>
        <small>Appunti del Dungeon Master</small>
      </button>
    </div>
  </section>
</template>

<style scoped>
/*
 * DMC — Panoramica della campagna
 * UI.3 — Rifinitura visiva
 *
 * Design system condiviso; nessuna modifica
 * alla navigazione o alla logica della campagna.
 */

.panoramica {
  display: grid;
  gap: var(--dmc-space-4);
  min-width: 0;
}

.panoramica :is(h2, h3, p) {
  margin: 0;
}

.panoramica > h2 {
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: clamp(23px, 2.5vw, 28px);
  font-weight: 850;
  line-height: 1.2;
}

.panoramica h3 {
  color: var(--dmc-amber);
  font-family: var(--dmc-font-display);
  font-size: 19px;
  line-height: 1.3;
}

/* DESCRIZIONE DELLA CAMPAGNA */

.descrizione {
  display: grid;
  gap: var(--dmc-space-4);
  min-width: 0;
  padding: var(--dmc-space-5);
}

.intestazione {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dmc-space-3);
}

.testo {
  max-width: 90ch;
  color: var(--dmc-cream);
  font-size: 14px;
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.testo.secondario {
  color: var(--dmc-muted-light);
}

/* PULSANTI */

.pulsante {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  gap: var(--dmc-space-2);
  min-height: 39px;
  padding: 9px 13px;
  font-family: var(--dmc-font-body);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.25;
  cursor: pointer;
  transition:
    background-color var(--dmc-transition),
    color var(--dmc-transition),
    transform var(--dmc-transition);
}

.pulsante:hover {
  transform: translateY(-1px);
}

.pulsante:active {
  transform: translateY(1px);
}

/* SESSIONE IN CONDUZIONE */

.ripresa-sessione {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--dmc-space-4);
  min-width: 0;
  padding: var(--dmc-space-5);
}

.ripresa-sessione > div {
  display: grid;
  gap: var(--dmc-space-2);
  flex: 1 1 250px;
  min-width: 0;
  overflow-wrap: anywhere;
}

.ripresa-sessione small {
  color: var(--dmc-amber-light);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  line-height: 1.4;
}

.ripresa-sessione h3 {
  color: var(--dmc-cream);
  font-size: 21px;
}

.ripresa-sessione p {
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.5;
}

/* ACCESSI ALLE SEZIONI */

.collegamenti {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: var(--dmc-space-3);
}

.collegamento {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--dmc-space-3);
  min-width: 0;
  min-height: 145px;
  padding: var(--dmc-space-4);
  color: var(--dmc-cream);
  font-family: var(--dmc-font-body);
  text-align: left;
  cursor: pointer;
  transition:
    border-color var(--dmc-transition),
    background-color var(--dmc-transition),
    transform var(--dmc-transition),
    box-shadow var(--dmc-transition);
}

.collegamento:hover {
  transform: translateY(-2px);
}

.collegamento:active {
  transform: translateY(1px);
}

.nome {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--dmc-space-2);
  color: var(--dmc-amber-light);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.3;
}

.nome span {
  font-size: 19px;
  transition: transform var(--dmc-transition);
}

.collegamento:hover .nome span {
  transform: translateX(3px);
}

.collegamento > strong {
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: 30px;
  font-weight: 850;
  line-height: 1.15;
}

.collegamento small {
  margin-top: auto;
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.5;
}

/* ACCESSIBILITÀ */

.collegamento:focus-visible,
.pulsante:focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .collegamenti {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .descrizione,
  .ripresa-sessione {
    padding: var(--dmc-space-4);
  }

  .collegamenti {
    grid-template-columns: 1fr;
  }

  .collegamento {
    min-height: 120px;
  }

  .ripresa-sessione .pulsante {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pulsante,
  .collegamento,
  .nome span {
    transition: none;
  }
}
</style>
