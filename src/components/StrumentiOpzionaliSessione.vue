<script setup>
import { idUnivoco } from '../stato/statoDatiCampagna.js'

defineProps({
  sessione: { type: Object, required: true },
})
const emit = defineEmits(['aggiorna-descrizione'])

const titoloScena = (scena, indice) => scena?.titolo?.trim() || `Scena ${indice + 1}`

function aggiungi(lista, valori) {
  lista.push({ id: idUnivoco(), ...valori })
}

function rimuovi(lista, id) {
  const indice = lista.findIndex((voce) => voce.id === id)
  if (indice >= 0) lista.splice(indice, 1)
}
</script>

<template>
  <div class="strumenti-sessione">
            <!-- ELEMENTI INTERATTIVI -->
            <p class="guida-preparazione">
              <strong>Non sono obbligatori.</strong> Usa questi strumenti solo se hai meccanismi da
              attivare, oggetti da usare o un'attività collettiva da seguire durante la conduzione.
              Per una sessione tradizionale sono sufficienti le scene.
            </p>

            <details class="editor-espandibile">
              <summary>
                Elementi interattivi

                <small> facoltativi · per scena </small>
              </summary>

              <div class="interno-details">
                <p class="testo-secondario">
                  Esempio: una leva che apre una porta, un altare da attivare o una trappola da
                  disinnescare. Imposta il nome, descrivi cosa cambia e scegli in quali scene
                  compare. Durante la conduzione potrai aggiornarne lo stato.
                </p>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="
                    aggiungi(sessione.risorseNarrative, {
                      nome: '',
                      effetto: '',
                      stato: 'inattivo',
                      sceneIds: [],
                    })
                  "
                >
                  + Elemento
                </button>

                <div
                  v-for="elemento in sessione.risorseNarrative"
                  :key="elemento.id"
                  class="scheda-secondaria"
                >
                  <label>
                    Nome

                    <input v-model="elemento.nome" class="dmc-campo" />
                  </label>

                  <label>
                    Descrizione/effetto

                    <textarea v-model="elemento.effetto" class="dmc-campo" rows="2"></textarea>
                  </label>

                  <label>
                    Stato

                    <select v-model="elemento.stato" class="dmc-campo">
                      <option value="inattivo">Non attivo</option>

                      <option value="pronto">Disponibile</option>

                      <option value="utilizzato">Utilizzato</option>
                    </select>
                  </label>

                  <fieldset class="collegamenti">
                    <legend>Mostra nelle scene</legend>

                    <label
                      v-for="(scena, indice) in sessione.scene"
                      :key="scena.id"
                      class="check-inline"
                    >
                      <input type="checkbox" v-model="elemento.sceneIds" :value="scena.id" />

                      {{ titoloScena(scena, indice) }}
                    </label>
                  </fieldset>

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--danger"
                    @click="rimuovi(sessione.risorseNarrative, elemento.id)"
                  >
                    Elimina elemento
                  </button>
                </div>
              </div>
            </details>

            <!-- ATTIVITÀ MONITORATA -->

            <details class="editor-espandibile">
              <summary>
                Attività monitorata

                <small>facoltativa</small>
              </summary>

              <div class="interno-details">
                <p class="testo-secondario">
                  Esempio: un rituale in cui tre personaggi devono mantenere la concentrazione,
                  oppure una fuga in cui diversi partecipanti possono essere interrotti. Descrivi
                  l'attività, aggiungi i partecipanti e, nelle singole scene, abilita «Attività
                  monitorata in questa scena». Non serve per i normali incontri di combattimento.
                </p>

                <label>
                  Descrizione

                  <textarea
                     :value="sessione.rituale.descrizione"
                    @input="emit('aggiorna-descrizione', $event.target.value)"
                    class="dmc-campo"
                    rows="2"
                  ></textarea>
                </label>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="
                    aggiungi(sessione.rituale.partecipanti, {
                      nome: 'Partecipante',
                      attivo: true,
                    })
                  "
                >
                  + Partecipante
                </button>

                <div
                  v-for="partecipante in sessione.rituale.partecipanti"
                  :key="partecipante.id"
                  class="riga-editor"
                >
                  <label class="campo-flessibile">
                    Nome

                    <input v-model="partecipante.nome" class="dmc-campo" />
                  </label>

                  <label class="check-inline">
                    <input
                      type="checkbox"
                      :checked="!partecipante.attivo"
                      @change="partecipante.attivo = !$event.target.checked"
                    />

                    Interrotto
                  </label>

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--danger"
                    @click="rimuovi(sessione.rituale.partecipanti, partecipante.id)"
                  >
                    ×
                  </button>
                </div>
              </div>
            </details>

  </div>
</template>

<style scoped>
.strumenti-sessione { display: grid; gap: 12px; min-width: 0; color: var(--dmc-cream); }
.guida-preparazione {
  margin: 0;
  padding: 12px 14px;
  border-left: 3px solid var(--dmc-amber);
  border-radius: 6px;
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font-size: 13px;
  line-height: 1.6;
}
.editor-espandibile,
.scheda-secondaria {
  padding: 13px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-surface-soft);
}
.editor-espandibile summary { cursor: pointer; color: var(--dmc-amber); font-weight: 600; }
.editor-espandibile summary small { margin-left: 8px; font-weight: 400; }
.interno-details, .scheda-secondaria { display: grid; gap: 12px; }
.interno-details { padding-top: 13px; }
.strumenti-sessione label { display: grid; gap: 6px; min-width: 0; color: var(--dmc-muted); font-size: 13px; }
.strumenti-sessione .dmc-campo { width: 100%; min-width: 0; box-sizing: border-box; }
.strumenti-sessione textarea { resize: vertical; line-height: 1.55; }
.strumenti-sessione .dmc-btn { padding: 8px 12px; }
.testo-secondario { color: var(--dmc-muted); }
.collegamenti { display: grid; gap: 8px; border: 1px solid var(--dmc-border-soft); border-radius: 6px; }
.collegamenti legend { color: var(--dmc-amber); }
.riga-editor { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }
.campo-flessibile { flex: 1; min-width: 180px; }
.strumenti-sessione .check-inline { display: flex; align-items: center; gap: 9px; cursor: pointer; }
.strumenti-sessione input[type='checkbox'] { width: 17px; height: 17px; flex: 0 0 17px; margin: 0; accent-color: var(--dmc-amber); }
</style>
