
<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { usaModale } from '../stato/usaModale.js'

import GestioneArchivioDMC from '../components/GestioneArchivioDMC.vue'
import CreazioneAssistitaCampagna from '../components/CreazioneAssistitaCampagna.vue'
import CardAvventura from '../components/ui/CardAvventura.vue'
import IconaDirezione from '../components/ui/IconaDirezione.vue'

import illustrazioneNuova from '../assets/illustrazioni/dmc-nuova-campagna.webp'
import illustrazioneLibreria from '../assets/illustrazioni/dmc-le-mie-campagne.webp'
import illustrazioneEsplora from '../assets/illustrazioni/dmc-esplora-campagne.webp'

import {
  campagne,
  campagneOrdinate,
  creaCampagna,
} from '../stato/statoCampagne.js'

const router = useRouter()

const CHIAVE_RECENTI = 'dmc_campagne_recenti_v1'

function leggiRecenti() {
  try {
    const dati = JSON.parse(
      localStorage.getItem(CHIAVE_RECENTI) || '[]'
    )

    return Array.isArray(dati)
      ? dati.filter(id => typeof id === 'string')
      : []
  } catch {
    return []
  }
}

const idsRecenti = ref(leggiRecenti())

const campagneRecenti = computed(() => {
  const mappa = new Map(
    campagne.value.map(c => [c.id, c])
  )

  const recenti = idsRecenti.value
    .map(id => mappa.get(id))
    .filter(Boolean)

  const altre = campagneOrdinate.value.filter(
    c => !recenti.some(r => r.id === c.id)
  )

  return [...recenti, ...altre].slice(0, 3)
})

function statoTesto(stato) {
  return {
    preparazione: 'In preparazione',
    'in-corso': 'In corso',
    conclusa: 'Conclusa',
  }[stato] || 'In preparazione'
}

function dataIt(valore) {
  if (!valore) return '—'

  const data = new Date(valore)

  return Number.isNaN(data.getTime())
    ? '—'
    : data.toLocaleDateString('it-IT')
}

function apriLibreria() {
  router.push({ name: 'libreria' })
}

function apriCampagna(id) {
  router.push({
    name: 'campagna',
    params: { id },
  })
}

const creazioneAperta = ref(false)
const assistitaAperta = ref(false)
const modaleCreazione = ref(null)
const nomeNuovaCampagna = ref('')
const errore = ref('')

usaModale(
  creazioneAperta,
  modaleCreazione,
  chiudiCreazione
)

function apriCreazione() {
  errore.value = ''
  nomeNuovaCampagna.value = ''
  creazioneAperta.value = true
}

function chiudiCreazione() {
  creazioneAperta.value = false
  errore.value = ''
  nomeNuovaCampagna.value = ''
}

function nuovaCampagna() {
  errore.value = ''

  const risultato = creaCampagna({
    nome: nomeNuovaCampagna.value,
    descrizione: '',
  })

  if (!risultato.successo) {
    errore.value =
      risultato.messaggio ||
      'Impossibile creare la campagna.'
    return
  }

  chiudiCreazione()
  apriCampagna(risultato.campagna.id)
}
</script>

<template>
  <div class="dmc dmc-pagina dashboard-view">
    <main class="dv-main dmc-contenitore">
      <section class="dv-hero">
        <span class="dv-sopratitolo">
          DUNGEON MASTER COMPANION
        </span>

        <h1>Le tue storie iniziano qui.</h1>

        <p>
          Prepara il mondo. Organizza l'avventura.
          Lascia che i giocatori scrivano il resto.
        </p>
      </section>

      <section
        class="dv-accessi"
        aria-label="Accessi principali"
      >
        <CardAvventura
          :immagine="illustrazioneNuova"
          titolo="Nuova campagna"
          azione="CREA UNA STORIA"
          primaria
          @click="apriCreazione"
        >
          Ogni grande avventura comincia con una storia da raccontare.
        </CardAvventura>

        <CardAvventura
          :immagine="illustrazioneLibreria"
          titolo="Le mie campagne"
          azione="APRI LA LIBRERIA"
          @click="apriLibreria"
        >
          {{ campagne.length }}
          {{ campagne.length === 1 ? 'avventura custodita' : 'avventure custodite' }}
          nella tua libreria.
        </CardAvventura>

        <CardAvventura
          :immagine="illustrazioneEsplora"
          titolo="Esplora campagne"
          azione="PROSSIMAMENTE"
          futura
        >
          Scopri nuovi mondi e avventure condivise dalla comunità.
        </CardAvventura>
      </section>

      <section class="dv-recenti">
        <header class="dv-recenti-header">
          <div>
            <span class="dv-sopratitolo">
              RIPRENDI IL VIAGGIO
            </span>

            <h2>Campagne recenti</h2>
          </div>

          <button
            type="button"
            class="dv-link"
            @click="apriLibreria"
          >
            Tutte le campagne <IconaDirezione />
          </button>
        </header>

        <p
          v-if="!campagneRecenti.length"
          class="dv-vuoto"
        >
          Nessuna campagna presente.
          Crea la tua prima avventura per iniziare.
        </p>

        <div v-else class="dv-elenco">
          <button
            v-for="c in campagneRecenti"
            :key="c.id"
            type="button"
            class="dv-riga"
            @click="apriCampagna(c.id)"
          >
            <span class="dv-simbolo" aria-hidden="true">
              ✧
            </span>

            <span class="dv-info">
              <strong>{{ c.nome }}</strong>

              <small>
                {{ statoTesto(c.stato) }}
                · {{ dataIt(c.modificataIl) }}
              </small>
            </span>

            <IconaDirezione class="dv-riga-freccia" />
          </button>
        </div>
      </section>

      <section class="dv-gestione-dati" aria-labelledby="dv-gestione-dati-titolo">
        <details class="dv-gestione-dati-dettagli">
          <summary class="dv-gestione-dati-attivatore">
            <span class="dv-gestione-dati-icona" aria-hidden="true">⇄</span>
            <span class="dv-gestione-dati-testo">
              <strong id="dv-gestione-dati-titolo">Gestione dati</strong>
              <small>Importa, esporta e conserva le tue campagne.</small>
            </span>
            <span class="dv-gestione-dati-freccia" aria-hidden="true">⌄</span>
          </summary>
          <div class="dv-gestione-dati-contenuto">
            <GestioneArchivioDMC />
          </div>
        </details>
      </section>


    </main>

    <footer class="dv-footer dmc-contenitore">
      DMC · Dungeon Master Companion · Versione di sviluppo
    </footer>

    <div
      v-if="creazioneAperta"
      class="dv-overlay dmc-overlay"
      @click.self="chiudiCreazione"
    >
      <form
        ref="modaleCreazione"
        class="dv-modale dmc-modale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dv-titolo-modale"
        aria-describedby="dv-descrizione-modale"
        tabindex="-1"
        @submit.prevent="nuovaCampagna"
      >
        <h2 id="dv-titolo-modale">
          Nuova campagna
        </h2>

        <p id="dv-descrizione-modale">
          È sufficiente un nome.
          Gli strumenti partiranno vuoti.
        </p>

        <p
          v-if="errore"
          class="dv-errore"
          role="alert"
        >
          {{ errore }}
        </p>

        <label>
          Nome campagna

          <input
            v-model="nomeNuovaCampagna"
            data-focus-iniziale
            required
            maxlength="100"
            placeholder="Es. Le Ombre di Valdora"
          />
        </label>

        <div class="dv-azioni dmc-azioni">
          <button type="button" class="dv-bottone dmc-btn dmc-btn--secondary" @click="creazioneAperta = false; assistitaAperta = true">
            Crea con ChatGPT
          </button>
          <button
            type="submit"
            class="dv-bottone dmc-btn"
          >
            Crea campagna
          </button>

          <button
            type="button"
            class="dv-bottone dmc-btn dmc-btn--secondary"
            @click="chiudiCreazione"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
    <div v-if="assistitaAperta" class="dv-overlay dmc-overlay" @click.self="assistitaAperta = false">
      <section class="dv-modale dmc-modale" style="width:min(96vw,1080px);max-width:1080px;max-height:90vh;overflow:auto" role="dialog" aria-modal="true" aria-label="Crea campagna con ChatGPT">
        <button type="button" class="dmc-btn dmc-btn--secondary" @click="assistitaAperta = false">Chiudi creazione assistita</button>
        <CreazioneAssistitaCampagna modalita="campagna" @importata="assistitaAperta = false" />
      </section>
    </div>
  </div>
</template>


<style scoped src="../stili/dashboard.css"></style>
