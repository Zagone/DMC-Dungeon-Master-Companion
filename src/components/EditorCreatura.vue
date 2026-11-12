<script setup>
import { computed, ref, nextTick, watch } from 'vue'

import { tipiCreatura } from '../stato/statoBestiario.js'

import {
  copiaDati,
  chiaviCaratteristiche,
  gruppiRegole,
  normalizzaCreatura,
  utilizzabile,
} from '../dati/modelloCreatura.js'

const props = defineProps({
  creatura: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['salva', 'annulla'])

const scheda = ref(normalizzaCreatura(copiaDati(props.creatura)))

watch(
  () => scheda.value.taglia,
  (taglia, precedente) => {
    scheda.value.taglie = [
      ...new Set(
        [taglia, ...scheda.value.taglie.filter((valore) => valore !== precedente)].filter(Boolean),
      ),
    ]
  },
)

const errore = ref('')
const sezioneAttiva = ref('identita')
const sezioniEditor = [
  { id: 'identita', titolo: 'Identità' },
  { id: 'statistiche', titolo: 'Statistiche' },
  { id: 'capacita', titolo: 'Capacità' },
  { id: 'azioni', titolo: 'Azioni' },
  { id: 'descrizione', titolo: 'Descrizione' },
  { id: 'revisione', titolo: 'Revisione' },
]
const indiceSezione = computed(() => sezioniEditor.findIndex((v) => v.id === sezioneAttiva.value))
const gruppiCapacita = gruppiRegole.filter((g) => g.campo === 'capacita')
const gruppiAzioni = gruppiRegole.filter((g) => g.campo !== 'capacita')
function vaiASezione(id) {
  sezioneAttiva.value = id
  errore.value = ''
}
function precedente() {
  if (indiceSezione.value > 0) vaiASezione(sezioniEditor[indiceSezione.value - 1].id)
}
function successiva() {
  if (indiceSezione.value < sezioniEditor.length - 1)
    vaiASezione(sezioniEditor[indiceSezione.value + 1].id)
}
const nomeInput = ref(null)

nextTick(() => nomeInput.value?.focus())

const numeri = [
  ['ca', 'CA'],
  ['pfMax', 'PF massimi'],
  ['iniziativa', 'Bonus iniziativa'],
  ['iniziativaPassiva', 'Iniziativa tra parentesi'],
  ['bonusCompetenza', 'Bonus competenza'],
  ['puntiEsperienza', 'Punti esperienza'],
  ['puntiEsperienzaTana', 'PE nella tana'],
]

const testi = [
  ['nomeOriginale', 'Altro nome'],
  ['allineamento', 'Allineamento'],
  ['gs', 'Grado di sfida'],
  ['pfFormula', 'Formula PF'],
  ['velocita', 'Velocità'],
  ['sensi', 'Sensi'],
  ['lingue', 'Linguaggi'],
  ['equipaggiamento', 'Attrezzatura'],
  ['tassonomiaOriginale', 'Tassonomia completa'],
]

const testiIdentita = testi.filter(([campo]) =>
  ['nomeOriginale', 'allineamento', 'tassonomiaOriginale'].includes(campo),
)
const testiStatistiche = testi.filter(([campo]) =>
  ['gs', 'pfFormula', 'velocita', 'sensi'].includes(campo),
)
const testiDescrizione = testi.filter(([campo]) => ['lingue', 'equipaggiamento'].includes(campo))

const elenchi = [
  ['aliases', 'Alias per la ricerca'],
  ['taglie', 'Taglie alternative'],
  ['sottotipi', 'Sottotipi'],
  ['resistenze', 'Resistenze'],
  ['vulnerabilita', 'Vulnerabilità'],
  ['immunita', 'Immunità ai danni'],
  ['immunitaCondizioni', 'Immunità alle condizioni'],
  ['tags', 'Tag personali'],
]

const elenchiIdentita = elenchi.filter(([campo]) =>
  ['aliases', 'taglie', 'sottotipi'].includes(campo),
)
const elenchiDifese = elenchi.filter(([campo]) =>
  ['resistenze', 'vulnerabilita', 'immunita', 'immunitaCondizioni'].includes(campo),
)
const elenchiDescrizione = elenchi.filter(([campo]) => campo === 'tags')

function elenco(campo, testo) {
  scheda.value[campo] = testo
    .split('\n')
    .map((valore) => valore.trim())
    .filter(Boolean)
}

function salva() {
  errore.value = ''

  const creatura = normalizzaCreatura(scheda.value)

  if (!creatura.nome) {
    errore.value = 'Inserisci il nome.'
    sezioneAttiva.value = 'identita'
    return
  }

  if (creatura.statoScheda === 'pronta' && !utilizzabile(creatura)) {
    errore.value =
      'Per usare la scheda negli incontri servono CA intera non negativa e PF massimi interi maggiori di zero.'
    sezioneAttiva.value = 'statistiche'
    return
  }

  for (const gruppo of gruppiRegole) {
    for (const regola of creatura[gruppo.campo]) {
      if (!regola.nome?.trim() || !regola.descrizione?.trim()) {
        errore.value = `Completa nome e descrizione in ${gruppo.titolo}, oppure rimuovi la voce.`
        sezioneAttiva.value = gruppo.campo === 'capacita' ? 'capacita' : 'azioni'
        return
      }
    }
  }

  emit('salva', creatura)
}
</script>

<template>
  <form
    class="editor-creatura dmc-pannello"
    aria-label="Editor creatura"
    novalidate
    @submit.prevent="salva"
  >
    <header class="intestazione-editor">
      <h3>
        {{ props.creatura.id ? 'Modifica scheda personale' : 'Nuova scheda personale' }}
      </h3>

      <button class="dmc-btn dmc-btn--secondary" type="button" @click="emit('annulla')">
        Annulla
      </button>
    </header>

    <p>
      Homebrew e PNG condividono la stessa scheda. I campi vuoti restano non indicati. Conferma la
      scheda quando è pronta per gli incontri.
    </p>

    <nav class="navigazione-sezioni" aria-label="Sezioni della scheda">
      <button
        v-for="(sezione, indice) in sezioniEditor"
        :key="sezione.id"
        type="button"
        :class="{ selezionata: sezioneAttiva === sezione.id }"
        :aria-current="sezioneAttiva === sezione.id ? 'step' : undefined"
        @click="vaiASezione(sezione.id)"
      >
        <span class="numero-sezione">{{ indice + 1 }}</span
        >{{ sezione.titolo }}
      </button>
    </nav>
    <p class="indicazione-sezione">
      Sezione {{ indiceSezione + 1 }} di {{ sezioniEditor.length }}. Puoi passare liberamente da una
      sezione all'altra senza perdere i campi compilati.
    </p>
    <section
      v-show="sezioneAttiva === 'identita'"
      class="pannello-sezione"
      aria-labelledby="editor-identita"
    >
      <h4 id="editor-identita">Identità della creatura</h4>
      <div class="griglia">
        <label class="largo">
          Nome
          <input class="dmc-campo" ref="nomeInput" v-model="scheda.nome" required />
        </label>

        <label>
          Categoria
          <select class="dmc-campo" v-model="scheda.categoria">
            <option value="homebrew">Homebrew</option>
            <option value="png">PNG personalizzato</option>
          </select>
        </label>

        <label>
          Stato
          <select class="dmc-campo" v-model="scheda.statoScheda">
            <option value="bozza">Bozza</option>
            <option value="pronta">Pronta per gli incontri</option>
          </select>
        </label>

        <label>
          Tipo
          <select class="dmc-campo" v-model="scheda.tipo">
            <option v-if="!tipiCreatura.includes(scheda.tipo)" :value="scheda.tipo">
              {{ scheda.tipo || 'Non indicato' }}
            </option>

            <option v-for="tipo in tipiCreatura" :key="tipo">
              {{ tipo }}
            </option>
          </select>
        </label>

        <label>
          Taglia
          <select class="dmc-campo" v-model="scheda.taglia">
            <option value="">Non indicata</option>

            <option
              v-for="taglia in [
                'Minuscola',
                'Piccola',
                'Media',
                'Grande',
                'Enorme',
                'Mastodontica',
              ]"
              :key="taglia"
            >
              {{ taglia }}
            </option>
          </select>
        </label>

        <label v-for="[campo, titolo] in testiIdentita" :key="campo">
          {{ titolo }} <input class="dmc-campo" v-model="scheda[campo]" />
        </label>
        <label v-for="[campo, titolo] in elenchiIdentita" :key="campo">
          {{ titolo }} <small>Una voce per riga.</small>
          <textarea
            class="dmc-campo"
            :value="scheda[campo].join('\n')"
            rows="3"
            @input="elenco(campo, $event.target.value)"
          ></textarea>
        </label>
      </div>
    </section>
    <section
      v-show="sezioneAttiva === 'statistiche'"
      class="pannello-sezione"
      aria-labelledby="editor-statistiche"
    >
      <h4 id="editor-statistiche">Statistiche e combattimento</h4>
      <div class="griglia">
        <label v-for="[campo, titolo] in numeri" :key="campo">
          {{ titolo }}
          <input class="dmc-campo" v-model="scheda[campo]" type="number" step="1" />
        </label>

        <label v-for="[campo, titolo] in testiStatistiche" :key="campo">
          {{ titolo }}
          <input class="dmc-campo" v-model="scheda[campo]" />
        </label>
      </div>
      <fieldset>
        <legend>Caratteristiche, modificatori e salvezze</legend>

        <div
          v-for="[campo, titolo] in [
            ['caratteristiche', 'Punteggio'],
            ['modificatori', 'MOD'],
            ['tiriSalvezza', 'SALV'],
          ]"
          :key="campo"
          class="sei-colonne"
        >
          <label v-for="chiave in chiaviCaratteristiche" :key="chiave">
            {{ titolo }} {{ chiave.toUpperCase() }}

            <input class="dmc-campo" v-model="scheda[campo][chiave]" type="number" step="1" />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>Abilità</legend>

        <div v-for="(abilita, indice) in scheda.abilita" :key="indice" class="riga-abilita">
          <label>
            Abilità
            <input class="dmc-campo" v-model="abilita.nome" />
          </label>

          <label>
            Bonus
            <input class="dmc-campo" v-model.number="abilita.bonus" type="number" step="1" />
          </label>

          <button
            class="dmc-btn dmc-btn--secondary"
            type="button"
            :aria-label="`Rimuovi abilità ${indice + 1}`"
            @click="scheda.abilita.splice(indice, 1)"
          >
            Rimuovi
          </button>
        </div>

        <button
          class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="
            scheda.abilita.push({
              nome: '',
              bonus: null,
            })
          "
        >
          + Aggiungi abilità
        </button>
      </fieldset>
      <fieldset>
        <legend>Difese e immunità</legend>
        <div class="griglia">
          <label v-for="[campo, titolo] in elenchiDifese" :key="campo">
            {{ titolo }} <small>Una voce per riga; specifica eventuali condizioni d’uso.</small>
            <textarea
              class="dmc-campo"
              :value="scheda[campo].join('\n')"
              rows="3"
              @input="elenco(campo, $event.target.value)"
            ></textarea>
          </label>
        </div>
      </fieldset>
    </section>
    <section
      v-show="sezioneAttiva === 'capacita'"
      class="pannello-sezione"
      aria-labelledby="editor-capacita"
    >
      <h4 id="editor-capacita">Capacità e tratti speciali</h4>
      <fieldset v-for="gruppo in gruppiCapacita" :key="gruppo.campo">
        <legend>{{ gruppo.titolo }}</legend>

        <label v-if="gruppo.campo === 'azioniLeggendarie'">
          Utilizzi, recupero e regole generali

          <textarea class="dmc-campo" v-model="scheda.regoleAzioniLeggendarie" rows="4"></textarea>
        </label>

        <div v-for="(regola, indice) in scheda[gruppo.campo]" :key="indice" class="regola-editor">
          <label>
            Nome della voce
            <input class="dmc-campo" v-model="regola.nome" required />
          </label>

          <label>
            Regola completa
            <textarea class="dmc-campo" v-model="regola.descrizione" required rows="5"></textarea>
          </label>

          <button
            class="dmc-btn dmc-btn--secondary"
            type="button"
            :aria-label="`Rimuovi ${gruppo.titolo} ${indice + 1}`"
            @click="scheda[gruppo.campo].splice(indice, 1)"
          >
            Rimuovi voce
          </button>
        </div>

        <button
          class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="
            scheda[gruppo.campo].push({
              nome: '',
              descrizione: '',
            })
          "
        >
          + Aggiungi: {{ gruppo.titolo }}
        </button>
      </fieldset>
    </section>
    <section
      v-show="sezioneAttiva === 'azioni'"
      class="pannello-sezione"
      aria-labelledby="editor-azioni"
    >
      <h4 id="editor-azioni">Azioni, reazioni e capacità speciali</h4>
      <fieldset v-for="gruppo in gruppiAzioni" :key="gruppo.campo">
        <legend>{{ gruppo.titolo }}</legend>

        <label v-if="gruppo.campo === 'azioniLeggendarie'">
          Utilizzi, recupero e regole generali

          <textarea class="dmc-campo" v-model="scheda.regoleAzioniLeggendarie" rows="4"></textarea>
        </label>

        <div v-for="(regola, indice) in scheda[gruppo.campo]" :key="indice" class="regola-editor">
          <label>
            Nome della voce
            <input class="dmc-campo" v-model="regola.nome" required />
          </label>

          <label>
            Regola completa
            <textarea class="dmc-campo" v-model="regola.descrizione" required rows="5"></textarea>
          </label>

          <button
            class="dmc-btn dmc-btn--secondary"
            type="button"
            :aria-label="`Rimuovi ${gruppo.titolo} ${indice + 1}`"
            @click="scheda[gruppo.campo].splice(indice, 1)"
          >
            Rimuovi voce
          </button>
        </div>

        <button
          class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="
            scheda[gruppo.campo].push({
              nome: '',
              descrizione: '',
            })
          "
        >
          + Aggiungi: {{ gruppo.titolo }}
        </button>
      </fieldset>
    </section>
    <section
      v-show="sezioneAttiva === 'descrizione'"
      class="pannello-sezione"
      aria-labelledby="editor-descrizione"
    >
      <h4 id="editor-descrizione">Dettagli, difese e descrizione</h4>
      <div class="griglia">
        <label v-for="[campo, titolo] in testiDescrizione" :key="campo">
          {{ titolo }} <input class="dmc-campo" v-model="scheda[campo]" />
        </label>
      </div>
      <div class="griglia">
        <label v-for="[campo, titolo] in elenchiDescrizione" :key="campo">
          {{ titolo }}

          <small> Una voce per riga; conserva le condizioni d’uso. </small>

          <textarea
            class="dmc-campo"
            :value="scheda[campo].join('\n')"
            rows="3"
            @input="elenco(campo, $event.target.value)"
          ></textarea>
        </label>
      </div>

      <fieldset>
        <legend>Sciame (facoltativo)</legend>

        <label class="scelta">
          <input
            type="checkbox"
            :checked="!!scheda.sciame"
            @change="
              scheda.sciame = $event.target.checked
                ? {
                    tipoCreature: '',
                    tagliaCreature: '',
                    testoFonte: '',
                  }
                : null
            "
          />

          Questa creatura è uno sciame
        </label>

        <div v-if="scheda.sciame" class="griglia">
          <label
            v-for="[campo, titolo] in [
              ['tipoCreature', 'Tipo dei componenti'],
              ['tagliaCreature', 'Taglia dei componenti'],
              ['testoFonte', 'Descrizione dello sciame'],
            ]"
            :key="campo"
          >
            {{ titolo }}
            <input class="dmc-campo" v-model="scheda.sciame[campo]" />
          </label>
        </div>
      </fieldset>

      <label>
        Fonte o riferimento personale
        <input class="dmc-campo" v-model="scheda.fonte" />
      </label>

      <label>
        Note personali
        <textarea class="dmc-campo" v-model="scheda.note" rows="4"></textarea>
      </label>
    </section>
    <section
      v-show="sezioneAttiva === 'revisione'"
      class="pannello-sezione"
      aria-labelledby="editor-revisione"
    >
      <h4 id="editor-revisione">Revisione prima del salvataggio</h4>
      <div class="riepilogo-editor">
        <p><strong>Nome:</strong> {{ scheda.nome || 'Da definire' }}</p>
        <p>
          <strong>Categoria:</strong>
          {{ scheda.categoria === 'png' ? 'PNG personalizzato' : 'Homebrew' }}
        </p>
        <p>
          <strong>Stato:</strong>
          {{ scheda.statoScheda === 'pronta' ? 'Pronta per gli incontri' : 'Bozza' }}
        </p>
        <p><strong>Tipo e taglia:</strong> {{ scheda.tipo || '—' }} · {{ scheda.taglia || '—' }}</p>
        <p><strong>CA e PF massimi:</strong> {{ scheda.ca ?? '—' }} · {{ scheda.pfMax ?? '—' }}</p>
        <p><strong>GS:</strong> {{ scheda.gs || '—' }}</p>
        <p><strong>Tratti:</strong> {{ scheda.capacita.length }}</p>
        <p>
          <strong>Azioni:</strong> {{ scheda.azioni.length }} · <strong>Azioni bonus:</strong>
          {{ scheda.azioniBonus.length }} · <strong>Reazioni:</strong> {{ scheda.reazioni.length }}
        </p>
      </div>
      <p>Controlla le sezioni precedenti. Puoi sempre tornare a modificarle prima di salvare.</p>
    </section>
    <p v-if="errore" class="errore" role="alert">
      {{ errore }}
    </p>

    <div class="azioni">
      <button
        type="button"
        class="dmc-btn dmc-btn--secondary"
        :disabled="indiceSezione === 0"
        @click="precedente"
      >
        Indietro
      </button>
      <button
        v-if="indiceSezione < sezioniEditor.length - 1"
        type="button"
        class="dmc-btn"
        @click="successiva"
      >
        Continua
      </button>
      <button type="submit" class="primario dmc-btn">Salva scheda</button>

      <button class="dmc-btn dmc-btn--secondary" type="button" @click="emit('annulla')">
        Annulla
      </button>
    </div>
  </form>
</template>

<style scoped>
/*
 * DMC — Editor Creatura
 * UI.7 — Rifinitura visiva
 *
 * Utilizza i token di design-system.css.
 * Nessuna modifica alla logica o ai dati.
 */

.editor-creatura {
  display: grid;
  gap: 17px;
  min-width: 0;
  padding: clamp(12px, 2.5vw, 22px);
  color: var(--dmc-cream);
}

.editor-creatura,
.editor-creatura * {
  box-sizing: border-box;
}

.editor-creatura h3,
.editor-creatura p {
  margin: 0;
}

.editor-creatura > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dmc-border-soft);
}

.editor-creatura h3 {
  color: var(--dmc-amber-light);
  font-family: var(--dmc-font-display);
  font-size: 21px;
  font-weight: 800;
  line-height: 1.3;
}

.editor-creatura > p {
  max-width: 85ch;
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.6;
}

/* GRIGLIA DEI CAMPI */

.griglia {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 195px), 1fr));
  gap: 12px;
  min-width: 0;
}

.largo {
  grid-column: 1 / -1;
}

.editor-creatura label {
  display: grid;
  align-content: start;
  gap: 6px;
  min-width: 0;
  color: var(--dmc-cream);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.4;
}

.editor-creatura label small {
  color: var(--dmc-muted-light);
  font-size: 11px;
  font-weight: 400;
  line-height: 1.45;
}

.editor-creatura :is(input, select, textarea) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 37px;
  padding: 8px 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font: inherit;
  font-size: 13px;
  font-weight: 400;
  line-height: 1.45;

  transition:
    border-color var(--dmc-transition),
    background-color var(--dmc-transition);
}

.editor-creatura :is(input, select, textarea):hover {
  border-color: var(--dmc-muted-light);
}

.editor-creatura :is(input, select, textarea):focus {
  border-color: var(--dmc-amber);
}

.editor-creatura textarea {
  min-height: 75px;
  resize: vertical;
  line-height: 1.55;
}

.editor-creatura input[type='number'] {
  font-variant-numeric: tabular-nums;
}

.editor-creatura input::placeholder,
.editor-creatura textarea::placeholder {
  color: var(--dmc-muted);
}

/* SEZIONI DELLA SCHEDA */

.editor-creatura fieldset {
  display: grid;
  gap: 13px;
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-surface-soft);
}

.editor-creatura legend {
  max-width: 100%;
  padding: 0 8px;
  color: var(--dmc-amber-light);
  font-family: var(--dmc-font-display);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.4;
}

/* CARATTERISTICHE, MODIFICATORI, SALVEZZE */

.sei-colonne {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}

.sei-colonne + .sei-colonne {
  padding-top: 10px;
  border-top: 1px solid var(--dmc-border-soft);
}

.sei-colonne label {
  gap: 5px;
  color: var(--dmc-muted-light);
  font-size: 11px;
  font-weight: 750;
  text-align: center;
}

.sei-colonne input {
  text-align: center;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ABILITÀ */

.riga-abilita {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(75px, 1fr) auto;
  align-items: end;
  gap: 9px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
}

.riga-abilita label {
  min-width: 0;
}

/* EDITOR DELLE REGOLE */

.regola-editor {
  display: grid;
  gap: 10px;
  min-width: 0;
  padding: 13px;
  border: 1px solid var(--dmc-border);
  border-left: 3px solid var(--dmc-amber-dark);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink-deep);
}

.regola-editor label:first-child input {
  font-weight: 700;
}

.regola-editor textarea {
  min-height: 110px;
}

.regola-editor > button {
  justify-self: end;
}

/* SCIAME */

.scelta {
  display: flex !important;
  flex-direction: row;
  align-items: center !important;
  justify-content: flex-start;
  gap: 9px;
  cursor: pointer;
}

.editor-creatura .scelta input[type='checkbox'] {
  flex: 0 0 auto;
  width: 17px;
  height: 17px;
  min-height: 17px;
  margin: 0;
  padding: 0;
  accent-color: var(--dmc-amber);
}

/* PULSANTI */

.editor-creatura button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: start;
  gap: 7px;
  min-height: 36px;
  padding: 8px 12px;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.3;
  cursor: pointer;

  transition:
    background-color var(--dmc-transition),
    border-color var(--dmc-transition),
    color var(--dmc-transition);
}

.editor-creatura button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.editor-creatura button.primario {
  font-weight: 800;
}

.riga-abilita > button,
.regola-editor > button {
  border-color: var(--dmc-rust);
  color: var(--dmc-rust-text);
}

.riga-abilita > button:hover,
.regola-editor > button:hover {
  border-color: var(--dmc-rust);
  background: var(--dmc-rust);
  color: var(--dmc-ink-deep);
}

/* SALVATAGGIO */

.azioni {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 9px;
  padding-top: 15px;
  border-top: 1px solid var(--dmc-border-soft);
}

.azioni button {
  min-height: 39px;
  padding: 9px 15px;
  font-size: 13px;
}

.errore {
  padding: 10px 12px;
  border: 1px solid var(--dmc-rust);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-rust-text) !important;
  font-size: 13px;
  line-height: 1.5;
}

/* ACCESSIBILITÀ */

.editor-creatura :is(button, input, select, textarea):focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 800px) {
  .sei-colonne {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .editor-creatura {
    gap: 14px;
    padding: 12px;
  }

  .editor-creatura h3 {
    font-size: 19px;
  }

  .editor-creatura fieldset {
    padding: 12px;
  }

  .riga-abilita {
    grid-template-columns: minmax(0, 1fr) 80px;
  }

  .riga-abilita > button {
    grid-column: 1 / -1;
    justify-self: end;
  }
}

@media (max-width: 400px) {
  .sei-colonne {
    gap: 5px;
  }

  .sei-colonne label {
    font-size: 10px;
  }

  .sei-colonne input {
    padding: 7px 4px;
  }

  .azioni button {
    flex: 1 1 auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .editor-creatura :is(input, select, textarea, button) {
    transition: none;
  }
}

/* Navigazione editor a sezioni: un solo pannello visibile, campi reattivi preservati. */
.navigazione-sezioni {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}
.navigazione-sezioni button {
  justify-content: center;
  justify-self: stretch;
  width: 100%;
  min-width: 0;
  gap: 8px;
  text-align: left;
  padding: 11px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-ink);
  color: var(--dmc-cream);
}
.navigazione-sezioni button.selezionata {
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-soft);
  color: var(--dmc-amber-light);
}
.numero-sezione {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  width: 23px;
  height: 23px;
  border-radius: 50%;
  border: 1px solid currentColor;
}
.indicazione-sezione {
  font-size: 12px;
  color: var(--dmc-muted-light);
}
.pannello-sezione {
  display: grid;
  gap: 15px;
  min-width: 0;
}
.pannello-sezione h4 {
  margin: 0;
  color: var(--dmc-amber-light);
  font-size: 17px;
}
.riepilogo-editor {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 15px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-ink);
}
.riepilogo-editor p {
  line-height: 1.55;
}
@media (max-width: 1100px) {
  .navigazione-sezioni {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 700px) {
  .navigazione-sezioni {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .riepilogo-editor {
    grid-template-columns: 1fr;
  }
}
</style>
