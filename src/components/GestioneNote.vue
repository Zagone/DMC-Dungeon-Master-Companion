
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import {
  datiCampagna,
  idUnivoco,
} from '../stato/statoDatiCampagna.js'

const areaNote = ref(null)
const modificaBottino = ref(false)

const note = computed({
  get: () => datiCampagna.value?.note ?? '',
  set(valore) {
    if (datiCampagna.value) {
      datiCampagna.value.note = valore
    }
  },
})

function regolaAltezza() {
  const campo = areaNote.value
  if (!campo) return

  campo.style.height = '65px'
  campo.style.height =
    `${Math.max(65, Math.min(190, campo.scrollHeight))}px`
}

onMounted(() => nextTick(regolaAltezza))

watch(
  note,
  () => nextTick(regolaAltezza),
  { flush: 'post' }
)

const bottino = computed(() => datiCampagna.value?.bottino ?? [])

function aggiungiRicompensa() {
  if (!datiCampagna.value) return

  if (!Array.isArray(datiCampagna.value.bottino)) {
    datiCampagna.value.bottino = []
  }

  datiCampagna.value.bottino.push({
    id: idUnivoco(),
    descrizione: '',
    quantita: 0,
    valuta: '',
    raccolta: false,
  })

  modificaBottino.value = true
}

function eliminaRicompensa(id) {
  if (!datiCampagna.value) return

  datiCampagna.value.bottino =
    bottino.value.filter(elemento => elemento.id !== id)
}

function normalizzaQuantita(elemento) {
  const numero = Number(elemento.quantita)

  elemento.quantita =
    Number.isFinite(numero) && numero >= 0
      ? Math.floor(numero)
      : 0
}

function quantitaVisibile(elemento) {
  const numero = Number(elemento.quantita)
  return Number.isFinite(numero)
    ? numero.toLocaleString('it-IT')
    : '0'
}

const raccolte = computed(() =>
  bottino.value.filter(elemento => elemento.raccolta).length
)

const totali = computed(() => {
  const risultato = { mo: 0, ma: 0, mr: 0 }

  for (const elemento of bottino.value) {
    if (!elemento.raccolta) continue
    if (!(elemento.valuta in risultato)) continue

    const quantita = Number(elemento.quantita)

    if (Number.isFinite(quantita) && quantita > 0) {
      risultato[elemento.valuta] += Math.floor(quantita)
    }
  }

  return risultato
})
</script>

<template>
  <section class="note-campagna">

    <!-- APPUNTI -->

    <div class="blocco-note dmc-pannello">
      <header class="testata-blocco">
        <h2>Note del Dungeon Master</h2>
        <span class="salvataggio">Salvataggio automatico</span>
      </header>

      <textarea
        ref="areaNote"
        v-model="note"
        class="campo-note dmc-campo"
        rows="2"
        aria-label="Appunti del Dungeon Master"
        placeholder="Annota eventi, decisioni dei giocatori, PNG, luoghi e promemoria..."
        @input="regolaAltezza"
      ></textarea>
    </div>

    <!-- BOTTINO -->

    <div class="blocco-bottino dmc-pannello">
      <header class="testata-blocco">
        <div class="titolo-bottino">
          <h2>Ricompense e bottino</h2>
          <span class="conteggio">
            {{ raccolte }}/{{ bottino.length }} raccolte
          </span>
        </div>

        <div class="azioni">
          <button
            type="button"
            class="pulsante secondario dmc-btn dmc-btn--secondary"
            :aria-pressed="modificaBottino"
            @click="modificaBottino = !modificaBottino"
          >
            {{ modificaBottino ? 'Fine modifica' : 'Modifica' }}
          </button>

          <button
            type="button"
            class="pulsante principale dmc-btn"
            @click="aggiungiRicompensa"
          >
            + Aggiungi ricompensa
          </button>
        </div>
      </header>

      <div class="riepilogo-monete">
        <span class="etichetta-monete">Monete raccolte</span>

        <div class="totali">
          <span>
            <strong>{{ totali.mo.toLocaleString('it-IT') }}</strong>
            mo
          </span>

          <span>
            <strong>{{ totali.ma.toLocaleString('it-IT') }}</strong>
            ma
          </span>

          <span>
            <strong>{{ totali.mr.toLocaleString('it-IT') }}</strong>
            mr
          </span>
        </div>
      </div>

      <p v-if="!bottino.length" class="stato-vuoto">
        Nessuna ricompensa inserita.
        Usa «+ Aggiungi ricompensa» per preparare il bottino
        della campagna.
      </p>

      <div v-else class="elenco-bottino">
        <div
          v-for="elemento in bottino"
          :key="elemento.id"
          class="ricompensa"
          :class="{ raccolta: elemento.raccolta }"
        >
          <input
            :id="`bottino-${elemento.id}`"
            v-model="elemento.raccolta"
            type="checkbox"
            class="spunta"
            :aria-label="`Ricompensa raccolta: ${elemento.descrizione || 'Senza nome'}`"
          />

          <template v-if="!modificaBottino">
            <label
              :for="`bottino-${elemento.id}`"
              class="nome-ricompensa"
            >
              {{ elemento.descrizione || 'Ricompensa senza descrizione' }}
            </label>

            <span v-if="elemento.valuta" class="valore">
              {{ quantitaVisibile(elemento) }}
              {{ elemento.valuta }}
            </span>
          </template>

          <template v-else>
            <div class="modifica-ricompensa">
              <input
                v-model="elemento.descrizione"
                type="text"
                class="input-descrizione dmc-campo"
                placeholder="Nome o descrizione della ricompensa"
                aria-label="Descrizione ricompensa"
              />

              <input
                v-model.number="elemento.quantita"
                type="number"
                min="0"
                step="1"
                class="input-quantita dmc-campo"
                :disabled="!elemento.valuta"
                aria-label="Quantità di monete"
                @change="normalizzaQuantita(elemento)"
              />

              <select
                v-model="elemento.valuta"
                class="input-valuta dmc-campo"
                aria-label="Tipo di ricompensa"
              >
                <option value="">Oggetto</option>
                <option value="mo">Monete d'oro</option>
                <option value="ma">Monete d'argento</option>
                <option value="mr">Monete di rame</option>
              </select>

              <button
                type="button"
                class="pulsante elimina dmc-btn dmc-btn--danger"
                :aria-label="`Elimina ${elemento.descrizione || 'ricompensa'}`"
                @click="eliminaRicompensa(elemento.id)"
              >
                Elimina
              </button>
            </div>
          </template>
        </div>
      </div>

      <p class="suggerimento">
        Spunta le ricompense ottenute dai giocatori.
        I totali comprendono solo le monete raccolte.
      </p>
    </div>
  </section>
</template>

<style scoped>
.note-campagna {
  display: grid;
  gap: 14px;
  min-width: 0;
  color: var(--dmc-cream);
}

.note-campagna :is(h2, p) {
  margin: 0;
}

.note-campagna h2 {
  color: var(--dmc-amber);
  font-size: 19px;
}

/* Contenitori specifici del modulo Note */

.blocco-note,
.blocco-bottino {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 15px;
}

.testata-blocco,
.titolo-bottino,
.azioni {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.titolo-bottino,
.azioni {
  justify-content: flex-start;
}

.salvataggio,
.conteggio,
.suggerimento {
  color: var(--dmc-muted);
  font-size: 12px;
}

/* Campo Note: altezza gestita dal componente */

.note-campagna .blocco-note .campo-note {
  display: block;
  width: 100%;
  height: 65px;
  min-height: 65px;
  max-height: 190px;
  box-sizing: border-box;
  padding: 11px 12px;
  overflow-x: hidden;
  overflow-y: auto;
  resize: none;
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  font: inherit;
  font-size: 14px;
  line-height: 1.6;
  scrollbar-width: thin;
}

.note-campagna .blocco-note .campo-note:focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 2px;
}

/* Pulsanti del modulo */

.note-campagna .pulsante {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 34px;
  padding: 7px 11px;
  font-family: var(--dmc-font-body);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

/* Riepilogo monete */

.riepilogo-monete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 12px;
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
}

.etichetta-monete {
  color: var(--dmc-muted);
  font-size: 12px;
}

.totali {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  color: var(--dmc-muted);
  font-size: 13px;
}

.totali strong {
  color: var(--dmc-cream);
  font-size: 16px;
  font-variant-numeric: tabular-nums;
}

.stato-vuoto {
  padding: 12px;
  border: 1px dashed var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-muted);
  font-size: 13px;
}

/* Ricompense */

.elenco-bottino {
  display: grid;
  gap: 6px;
}

.ricompensa {
  display: flex;
  align-items: center;
  gap: 11px;
  min-width: 0;
  padding: 9px 11px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-soft);
}

.ricompensa.raccolta {
  border-color: var(--dmc-moss);
}

.note-campagna .ricompensa input.spunta {
  display: block;
  flex: 0 0 17px;
  width: 17px;
  height: 17px;
  min-width: 17px;
  margin: 0;
  padding: 0;
  accent-color: var(--dmc-amber);
  cursor: pointer;
}

.nome-ricompensa {
  flex: 1;
  min-width: 0;
  color: var(--dmc-cream);
  font-size: 13px;
  overflow-wrap: anywhere;
  cursor: pointer;
}

.ricompensa.raccolta .nome-ricompensa {
  color: var(--dmc-muted);
  text-decoration: line-through;
}

.valore {
  flex-shrink: 0;
  color: var(--dmc-amber);
  font-size: 13px;
  font-weight: bold;
}

.modifica-ricompensa {
  display: grid;
  grid-template-columns:
    minmax(150px, 1fr)
    75px
    155px
    auto;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.note-campagna .modifica-ricompensa :is(input, select) {
  display: block;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  min-height: 35px;
  padding: 7px 9px;
  color: var(--dmc-cream);
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  font: inherit;
  font-size: 13px;
}

.note-campagna .modifica-ricompensa input:disabled {
  opacity: 0.4;
}

.suggerimento {
  line-height: 1.5;
}

/* Responsive */

@media (max-width: 850px) {
  .modifica-ricompensa {
    grid-template-columns: 75px minmax(0, 1fr) auto;
  }

  .modifica-ricompensa .input-descrizione {
    grid-column: 1 / -1;
  }
}

@media (max-width: 550px) {
  .blocco-note,
  .blocco-bottino {
    padding: 12px;
  }

  .testata-blocco {
    align-items: flex-start;
  }

  .azioni {
    width: 100%;
  }

  .modifica-ricompensa {
    grid-template-columns: 70px minmax(0, 1fr);
  }

  .modifica-ricompensa .elimina {
    grid-column: 1 / -1;
  }

  .totali {
    gap: 10px;
  }
}
</style>
