
<script setup>
import {
  computed,
  nextTick,
  onMounted,
  onBeforeUnmount,
  ref,
  watch,
} from 'vue'

import {
  useRoute,
  useRouter,
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
} from 'vue-router'

import { usaModale } from '../stato/usaModale.js'

import GestionePanoramica from '../components/GestionePanoramica.vue'
import GestioneSessioni from '../components/GestioneSessioni.vue'
import GestioneBattaglia from '../components/GestioneBattaglia.vue'
import GestioneBestiario from '../components/GestioneBestiario.vue'
import GestioneNote from '../components/GestioneNote.vue'

import {
  sezioniCampagna as sezioni,
} from '../dati/sezioniCampagna.js'

import {
  trovaCampagna,
  aggiornaCampagna,
  eliminaCampagna,
  eliminaCampagnaConDati,
} from '../stato/statoCampagne.js'

import {
  campagnaDatiId,
  datiCampagna,
  apriDatiCampagna,
  chiudiDatiCampagna,
  salvaDatiCampagna,
  erroreDatiCampagna,
  letturaCampagnaFallita,
  conduzioneAttiva,
} from '../stato/statoDatiCampagna.js'

const route = useRoute()
const router = useRouter()

// Navigazione sticky: misura effettiva, senza offset fissi.

const intestazionePagina = ref(null)
const navigazione = ref(null)
const navigazioneCompatta = ref(false)
const altezzaNavigazione = ref(70)

let osservatoreNavigazione = null

function aggiornaAltezzaNavigazione() {
  if (!navigazione.value) return

  const altezza =
    navigazione.value.getBoundingClientRect().height

  if (
    Number.isFinite(altezza) &&
    altezza > 0 &&
    Math.abs(altezza - altezzaNavigazione.value) > 0.5
  ) {
    altezzaNavigazione.value = altezza
  }
}

function aggiornaNavigazione() {
  const elemento = intestazionePagina.value
  if (!elemento) {
    navigazioneCompatta.value = false
    return
  }

  const altezzaBarra = parseFloat(
    getComputedStyle(document.documentElement)
      .getPropertyValue('--dmc-topbar-height')
  ) || 58

  navigazioneCompatta.value =
    elemento.getBoundingClientRect().bottom <= altezzaBarra
}

function aggiornaMisure() {
  aggiornaNavigazione()
  aggiornaAltezzaNavigazione()
}

onMounted(async () => {
  window.addEventListener(
    'scroll',
    aggiornaNavigazione,
    { passive: true }
  )
  window.addEventListener(
    'resize',
    aggiornaMisure
  )

  await nextTick()

  if (
    typeof ResizeObserver !== 'undefined' &&
    navigazione.value
  ) {
    osservatoreNavigazione = new ResizeObserver(() => {
      aggiornaAltezzaNavigazione()
    })

    osservatoreNavigazione.observe(navigazione.value)
  }

  aggiornaMisure()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', aggiornaNavigazione)
  window.removeEventListener('resize', aggiornaMisure)

  osservatoreNavigazione?.disconnect()
  osservatoreNavigazione = null
})

watch(navigazioneCompatta, async () => {
  await nextTick()
  aggiornaAltezzaNavigazione()
})

// Campagna e sezioni.

const campagnaId = computed(() =>
  typeof route.params.id === 'string'
    ? route.params.id
    : null
)

const campagna = computed(() =>
  trovaCampagna(campagnaId.value)
)

const dati = computed(() => datiCampagna.value)

const sezione = computed(() => {
  if (route.name === 'campagna') {
    return 'panoramica'
  }

  const valore = route.params.sezione

  return sezioni.some(s => s.id === valore)
    ? valore
    : 'panoramica'
})

const CHIAVE_RECENTI = 'dmc_campagne_recenti_v1'

function registraApertura(id) {
  try {
    const salvati = JSON.parse(
      localStorage.getItem(CHIAVE_RECENTI) || '[]'
    )

    const precedenti = Array.isArray(salvati)
      ? salvati.filter(
          valore => typeof valore === 'string'
        )
      : []

    const recenti = [
      id,
      ...precedenti.filter(valore => valore !== id),
    ].slice(0, 30)

    localStorage.setItem(
      CHIAVE_RECENTI,
      JSON.stringify(recenti)
    )
  } catch {
    // La cronologia non deve bloccare la campagna.
  }
}

let idCampagnaAperta = null

function chiudiCampagnaAperta() {
  if (
    idCampagnaAperta &&
    campagnaDatiId.value === idCampagnaAperta
  ) {
    chiudiDatiCampagna()
  }

  idCampagnaAperta = null
}

watch(
  campagnaId,
  nuovoId => {
    if (!nuovoId || !trovaCampagna(nuovoId)) {
      chiudiCampagnaAperta()
      return
    }

    if (campagnaDatiId.value !== nuovoId) {
      apriDatiCampagna(nuovoId)
    }

    idCampagnaAperta = nuovoId
    registraApertura(nuovoId)
  },
  { immediate: true }
)

function consentiUscita() {
  return (
    !campagnaDatiId.value ||
    letturaCampagnaFallita.value ||
    salvaDatiCampagna()
  )
}

onBeforeRouteLeave(consentiUscita)

onBeforeRouteUpdate(
  (destinazione, partenza) =>
    destinazione.params.id === partenza.params.id ||
    consentiUscita()
)

onBeforeUnmount(chiudiCampagnaAperta)

// Impostazioni della campagna.

const modificaAperta = ref(false)
const modaleImpostazioni = ref(null)
const confermaEliminazione = ref(false)
const errore = ref('')

usaModale(
  modificaAperta,
  modaleImpostazioni,
  chiudiImpostazioni
)

const impostazioni = ref({
  nome: '',
  descrizione: '',
  stato: 'preparazione',
})

function statoTesto(stato) {
  return {
    preparazione: 'In preparazione',
    'in-corso': 'In corso',
    conclusa: 'Conclusa',
  }[stato] || 'In preparazione'
}

function tornaDashboard() {
  router.push({ name: 'dashboard' })
}

function vaiSezione(id) {
  if (
    !campagnaId.value ||
    !sezioni.some(s => s.id === id)
  ) {
    return
  }

  errore.value = ''

  if (id === 'panoramica') {
    router.push({
      name: 'campagna',
      params: { id: campagnaId.value },
    })
    return
  }

  router.push({
    name: 'sezione-campagna',
    params: {
      id: campagnaId.value,
      sezione: id,
    },
  })
}

function riprendiSessione() {
  if (conduzioneAttiva.value) {
    vaiSezione('sessioni')
  }
}

watch(
  () => route.fullPath,
  () => {
    modificaAperta.value = false
    confermaEliminazione.value = false
    errore.value = ''
  }
)

function apriImpostazioni() {
  if (!campagna.value) return

  impostazioni.value = {
    nome: campagna.value.nome,
    descrizione: campagna.value.descrizione || '',
    stato: campagna.value.stato || 'preparazione',
  }

  errore.value = ''
  confermaEliminazione.value = false
  modificaAperta.value = true
}

function chiudiImpostazioni() {
  modificaAperta.value = false
  confermaEliminazione.value = false
  errore.value = ''
}

function salvaImpostazioni() {
  if (!campagna.value) return

  if (!impostazioni.value.nome.trim()) {
    errore.value = 'Inserisci un nome valido.'
    return
  }

  const risultato = aggiornaCampagna(
    campagna.value.id,
    impostazioni.value
  )

  if (!risultato) {
    errore.value =
      'Impossibile aggiornare la campagna.'
    return
  }

  chiudiImpostazioni()
}

function eliminaCampagnaAttiva() {
  if (
    !campagna.value ||
    !confermaEliminazione.value
  ) {
    return
  }

  const id = campagna.value.id

  // Prima salva e chiude la campagna; poi elimina metadati e dati
  // in una transazione con rollback in caso di errore.
  if (!chiudiDatiCampagna()) {
    errore.value = 'Impossibile salvare la campagna prima dell’eliminazione.'
    return
  }

  if (!eliminaCampagnaConDati(id)) {
    apriDatiCampagna(id)
    errore.value = 'Eliminazione non riuscita. La campagna è stata conservata.'
    return
  }

  idCampagnaAperta = null
  chiudiImpostazioni()
  router.replace({ name: 'libreria' })
}
</script>

<template>
  <div
    class="dmc dmc-pagina campagna-view"
    :style="{
      '--dmc-altezza-navigazione-campagna':
        `${altezzaNavigazione}px`
    }"
  >
    <main
      :key="campagnaId"
      class="contenuto-campagna dmc-contenitore"
    >
      <template v-if="campagna && dati">
        <section
          ref="intestazionePagina"
          class="intestazione-riga testata-campagna"
        >
          <div>
            <small class="sopratitolo">
              CAMPAGNA
            </small>

            <h1>{{ campagna.nome }}</h1>

            <p>{{ statoTesto(campagna.stato) }}</p>
          </div>

          <button
            type="button"
            class="bottone neutro dmc-btn dmc-btn--secondary"
            @click="apriImpostazioni"
          >
            Impostazioni
          </button>
        </section>

        <div
          ref="navigazione"
          class="navigazione-persistente"
          :class="{ compatta: navigazioneCompatta }"
        >
          <div
            v-if="navigazioneCompatta"
            class="navigazione-contesto"
          >
            <span
              class="nome-campagna-compatto"
              :title="campagna.nome"
            >
              {{ campagna.nome }}
            </span>

            <button
              type="button"
              class="bottone neutro uscita-campagna dmc-btn dmc-btn--secondary"
              @click="tornaDashboard"
            >
              Esci dalla campagna
            </button>
          </div>

          <nav
            class="tabs"
            aria-label="Sezioni della campagna"
          >
            <button
              v-for="s in sezioni"
              :key="s.id"
              type="button"
              class="tab-dmc"
              :class="{ selezionata: sezione === s.id }"
              :aria-current="
                sezione === s.id ? 'page' : undefined
              "
              @click="vaiSezione(s.id)"
            >
              {{ s.nome }}
            </button>

            <button
              v-if="!navigazioneCompatta"
              type="button"
              class="bottone neutro uscita-campagna uscita-normale dmc-btn dmc-btn--secondary"
              @click="tornaDashboard"
            >
              Esci dalla campagna
            </button>
          </nav>
        </div>

        <p
          v-if="errore && !modificaAperta"
          class="avviso errore"
          role="alert"
        >
          {{ errore }}
        </p>

        <p
          v-if="erroreDatiCampagna"
          class="avviso errore"
          role="alert"
        >
          {{ erroreDatiCampagna }}

          <button
            v-if="!letturaCampagnaFallita"
            type="button"
            class="bottone neutro dmc-btn dmc-btn--secondary"
            @click="salvaDatiCampagna"
          >
            Riprova salvataggio
          </button>
        </p>

        <template v-if="!letturaCampagnaFallita">
          <section
            v-if="sezione === 'panoramica'"
            class="sezione"
          >
            <GestionePanoramica
              :campagna="campagna"
              @vai-sezione="vaiSezione"
              @modifica-campagna="apriImpostazioni"
              @riprendi-sessione="riprendiSessione"
            />
          </section>

          <section
            v-else-if="sezione === 'sessioni'"
            class="sezione"
          >
            <GestioneSessioni
              @vai-battaglia="vaiSezione('battaglia')"
            />
          </section>

          <section
            v-else-if="sezione === 'battaglia'"
            class="sezione"
          >
            <aside
              v-if="conduzioneAttiva"
              class="ritorno-scena dmc-pannello"
              aria-label="Sessione in conduzione"
            >
              <div>
                <strong>
                  {{
                    conduzioneAttiva.sessione.titolo ||
                    'Sessione senza titolo'
                  }}
                </strong>

                <span>
                  Scena {{ conduzioneAttiva.indice + 1 }} ·
                  {{
                    conduzioneAttiva.scena.titolo?.trim() ||
                    `Scena ${conduzioneAttiva.indice + 1}`
                  }}
                </span>
              </div>

              <button
                type="button"
                class="bottone neutro dmc-btn dmc-btn--secondary"
                @click="riprendiSessione"
              >
                ← Torna alla scena
              </button>
            </aside>

            <GestioneBattaglia />
          </section>

          <section
            v-else-if="sezione === 'bestiario'"
            class="sezione"
          >
            <GestioneBestiario />
          </section>

          <section
            v-else-if="sezione === 'note'"
            class="sezione"
          >
            <GestioneNote />
          </section>
        </template>
      </template>

      <section v-else class="campagna-mancante">
        <h1>Campagna non disponibile</h1>

        <p>
          Non è stato possibile caricare questa campagna.
        </p>

        <button
          type="button"
          class="bottone dmc-btn dmc-btn--secondary"
          @click="tornaDashboard"
        >
          Torna alla dashboard
        </button>
      </section>
    </main>

    <div
      v-if="modificaAperta && campagna"
      class="overlay dmc-overlay"
      @click.self="chiudiImpostazioni"
    >
      <form
        ref="modaleImpostazioni"
        class="modale dmc-modale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="campagna-titolo-impostazioni"
        tabindex="-1"
        @submit.prevent="salvaImpostazioni"
      >
        <h2 id="campagna-titolo-impostazioni">
          Impostazioni campagna
        </h2>

        <p
          v-if="errore"
          class="avviso errore"
          role="alert"
        >
          {{ errore }}
        </p>

        <label>
          Nome

          <input class="dmc-campo"
            v-model="impostazioni.nome"
            data-focus-iniziale
            type="text"
            maxlength="100"
            required
          />
        </label>

        <label>
          Descrizione

          <textarea class="dmc-campo"
            v-model="impostazioni.descrizione"
            rows="5"
            placeholder="Qual è l'ambientazione?"
          ></textarea>
        </label>

        <label>
          Stato

          <select class="dmc-campo" v-model="impostazioni.stato">
            <option value="preparazione">
              In preparazione
            </option>

            <option value="in-corso">
              In corso
            </option>

            <option value="conclusa">
              Conclusa
            </option>
          </select>
        </label>

        <div class="azioni dmc-azioni">
          <button
            type="submit"
            class="bottone dmc-btn dmc-btn--secondary"
          >
            Salva modifiche
          </button>

          <button
            type="button"
            class="bottone neutro dmc-btn dmc-btn--secondary"
            @click="chiudiImpostazioni"
          >
            Chiudi
          </button>
        </div>

        <div class="zona-pericolo">
          <button
            v-if="!confermaEliminazione"
            type="button"
            class="bottone pericolo dmc-btn dmc-btn--danger"
            @click="confermaEliminazione = true"
          >
            Elimina campagna
          </button>

          <div v-else class="conferma">
            <strong>
              Eliminare definitivamente questa campagna
              e tutti i suoi contenuti?
            </strong>

            <div class="azioni dmc-azioni">
              <button
                type="button"
                class="bottone pericolo dmc-btn dmc-btn--danger"
                @click="eliminaCampagnaAttiva"
              >
                Conferma eliminazione
              </button>

              <button
                type="button"
                class="bottone neutro dmc-btn dmc-btn--secondary"
                @click="confermaEliminazione = false"
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>

    <footer class="footer-app">
      DMC · Dungeon Master Companion · Versione di sviluppo
    </footer>
  </div>
</template>

<style scoped>
/*
 * Stili specifici dei contenuti della campagna.
 * Le due barre sticky sono gestite nei rispettivi
 * fogli CSS centralizzati.
 */

.ritorno-scena {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--dmc-space-3);
  min-width: 0;
  padding: var(--dmc-space-3);
}

.ritorno-scena > div {
  display: grid;
  gap: var(--dmc-space-1);
  min-width: 0;
  overflow-wrap: anywhere;
}

.ritorno-scena strong {
  color: var(--dmc-amber);
}

.ritorno-scena span {
  color: var(--dmc-muted);
  font-size: 12px;
}

.modale label {
  gap: 6px;
  color: var(--dmc-muted);
}

:where(.campagna-view) :is(h1, h2, h3, p) {
  margin: 0;
}

.dmc h1,
.dmc h2,
.dmc h3 {
  color: var(--dmc-amber);
}

.dmc p {
  line-height: 1.6;
}

.azioni {
  align-items: center;
  justify-content: flex-start;
  gap: var(--dmc-space-3);
}

.contenuto-campagna {
  min-height: 50vh;
}

.sezione {
  display: grid;
  gap: 17px;
  margin: 30px 0;
  min-width: 0;
}

.campagna-mancante {
  display: grid;
  justify-items: start;
  gap: 14px;
  padding: 35px 0;
}

.campagna-mancante p {
  color: var(--dmc-muted);
}

.bottone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 9px 13px;
  font-family: var(--dmc-font-body);
  font-weight: 800;
  cursor: pointer;
}

.dmc textarea {
  resize: vertical;
  line-height: 1.7;
}

.avviso {
  padding: var(--dmc-space-3);
  margin: 15px 0;
  border: 1px solid var(--dmc-moss);
  border-radius: var(--dmc-radius-xs);
}

.avviso.errore {
  border-color: var(--dmc-rust);
  color: var(--dmc-cream);
}

.zona-pericolo {
  padding-top: 15px;
  border-top: 1px solid var(--dmc-border);
}

.conferma {
  display: grid;
  gap: 13px;
  padding: 17px;
  border: 1px solid var(--dmc-rust);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-surface);
}

.footer-app {
  padding: 20px 0;
  color: var(--dmc-muted);
  text-align: center;
  font-size: 12px;
}
</style>
