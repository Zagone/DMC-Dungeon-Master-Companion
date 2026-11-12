<script setup>
import IconaStrumento from './components/ui/IconaStrumento.vue'
import { computed, onBeforeUnmount, ref } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'
import logoDMC from './assets/logo/dmc-logo-header.png'
import { trovaCampagna } from './stato/statoCampagne.js'
import './stili/layout-globale.css'

const route = useRoute()
const campagna = computed(() => {
  const id = route.params.id
  return typeof id === 'string' ? trovaCampagna(id) : null
})

const pannello = ref(null)
function cambiaPannello(nome) {
  pannello.value = pannello.value === nome ? null : nome
}

const secondi = ref(0)
const inEsecuzione = ref(false)
let intervallo = null
let istanteAvvio = 0
let secondiIniziali = 0

const tempoFormattato = computed(() => {
  const valore = secondi.value
  return [Math.floor(valore / 3600), Math.floor((valore % 3600) / 60), valore % 60]
    .map((numero) => String(numero).padStart(2, '0'))
    .join(':')
})

function avviaPausa() {
  if (inEsecuzione.value) {
    clearInterval(intervallo)
    intervallo = null
    inEsecuzione.value = false
    return
  }
  inEsecuzione.value = true
  istanteAvvio = Date.now()
  secondiIniziali = secondi.value
  intervallo = setInterval(() => {
    secondi.value = secondiIniziali + Math.floor((Date.now() - istanteAvvio) / 1000)
  }, 250)
}

function azzeraTempo() {
  clearInterval(intervallo)
  intervallo = null
  inEsecuzione.value = false
  secondi.value = 0
}
onBeforeUnmount(() => clearInterval(intervallo))

const facce = [4, 6, 8, 10, 12, 20, 100]
const dado = ref(20)
const quantita = ref(1)
const modificatore = ref(0)
const risultato = ref(null)

function casualeUniforme(massimo) {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const valori = new Uint32Array(1)
    const limite = Math.floor(0x100000000 / massimo) * massimo
    do {
      crypto.getRandomValues(valori)
    } while (valori[0] >= limite)
    return (valori[0] % massimo) + 1
  }
  return Math.floor(Math.random() * massimo) + 1
}

function tiraDadi() {
  const numero = Number(quantita.value)
  const bonus = Number(modificatore.value)
  if (
    !Number.isInteger(numero) ||
    numero < 1 ||
    numero > 30 ||
    !Number.isInteger(bonus) ||
    bonus < -100 ||
    bonus > 100 ||
    !facce.includes(Number(dado.value))
  )
    return
  const tiri = Array.from({ length: numero }, () => casualeUniforme(Number(dado.value)))
  risultato.value = { tiri, bonus, totale: tiri.reduce((somma, n) => somma + n, bonus) }
}
</script>

<template>
  <div class="dmc-app">
    <header class="barra-globale">
      <RouterLink
        class="marchio-globale"
        :to="{ name: 'dashboard' }"
        aria-label="Dungeon Master Companion — Home"
      >
        <img :src="logoDMC" alt="" />
        <strong>Dungeon Master Companion</strong>
      </RouterLink>

      <nav class="navigazione-globale" aria-label="Navigazione principale">
        <RouterLink :to="{ name: 'dashboard' }" :class="{ attivo: route.name === 'dashboard' }"
          >Home</RouterLink
        >
        <RouterLink :to="{ name: 'libreria' }" :class="{ attivo: route.name === 'libreria' }"
          >Campagne</RouterLink
        >
        <RouterLink :to="{ name: 'compendio' }" :class="{ attivo: route.name === 'compendio' }"
          >Compendio</RouterLink
        >
        <RouterLink
          :to="{ name: 'bestiario-globale' }"
          :class="{ attivo: route.name === 'bestiario-globale' }"
          >Bestiario</RouterLink
        >
      </nav>

      <span v-if="campagna" class="campagna-corrente" :title="campagna.nome">{{
        campagna.nome
      }}</span>
    </header>

    <!-- Le sezioni Panoramica, Sessioni, Battaglia e Note restano in CampagnaView. -->
    <RouterView />

    <div class="strumenti-flottanti" role="group" aria-label="Strumenti rapidi del Dungeon Master">
      <button
        type="button"
        :aria-expanded="pannello === 'tempo'"
        aria-label="Cronometro"
        title="Cronometro"
        @click="cambiaPannello('tempo')"
      >
        <IconaStrumento tipo="tempo" />
      </button>
      <button
        type="button"
        :aria-expanded="pannello === 'dadi'"
        aria-label="Dadi"
        title="Dadi"
        @click="cambiaPannello('dadi')"
      >
        <IconaStrumento tipo="dadi" />
      </button>
    </div>

    <section
      v-if="pannello === 'tempo'"
      class="pannello-strumento dmc-pannello"
      aria-label="Cronometro"
    >
      <header class="testata-strumento">
        <h2>Cronometro</h2>
        <button type="button" aria-label="Chiudi cronometro" @click="pannello = null">×</button>
      </header>
      <output class="tempo-display" aria-live="off">{{ tempoFormattato }}</output>
      <div class="azioni-strumento">
        <button type="button" @click="avviaPausa">{{ inEsecuzione ? 'Pausa' : 'Avvia' }}</button>
        <button type="button" @click="azzeraTempo">Azzera</button>
      </div>
      <p>Il cronometro continua anche con il pannello chiuso.</p>
    </section>

    <section
      v-if="pannello === 'dadi'"
      class="pannello-strumento dmc-pannello"
      aria-label="Lancia dadi"
    >
      <header class="testata-strumento">
        <h2>Dadi</h2>
        <button type="button" aria-label="Chiudi dadi" @click="pannello = null">×</button>
      </header>
      <div class="scelta-dado" role="group" aria-label="Tipo di dado">
        <button
          v-for="n in facce"
          :key="n"
          type="button"
          :class="{ selezionato: dado === n }"
          :aria-pressed="dado === n"
          @click="dado = n"
        >
          d{{ n }}
        </button>
      </div>
      <div class="parametri-dado">
        <label>Quantità<input v-model.number="quantita" type="number" min="1" max="30" /></label>
        <label
          >Modificatore<input v-model.number="modificatore" type="number" min="-100" max="100"
        /></label>
      </div>
      <button type="button" class="lancia" @click="tiraDadi">
        Lancia {{ quantita }}d{{ dado }}
      </button>
      <div v-if="risultato" class="esito-dadi" role="status">
        <strong>Totale: {{ risultato.totale }}</strong>
        <span
          >Tiri: {{ risultato.tiri.join(' + ')
          }}<template v-if="risultato.bonus">
            {{ risultato.bonus > 0 ? '+' : '−' }} {{ Math.abs(risultato.bonus) }}</template
          ></span
        >
      </div>
    </section>
  </div>
</template>
