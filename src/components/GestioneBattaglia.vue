<script setup>
import { computed, ref } from 'vue'
import { datiCampagna, idUnivoco } from '../stato/statoDatiCampagna.js'
import { creatureBestiario } from '../stato/statoBestiario.js'
import {
  creaIstanza,
  utilizzabile,
  testoRicercaCreatura,
} from '../dati/modelloCreatura.js'
import SchedaCreatura from './SchedaCreatura.vue'
import SchedaTatticaCreatura from './SchedaTatticaCreatura.vue'

const dati = computed(() => datiCampagna.value)
const personaggi = computed(() => dati.value?.personaggi || [])
const nemici = computed(() => dati.value?.nemici || [])

const nuovoPG = ref({ nome: '', ca: 13, pfMax: 20 })
const moduloPGAperto = ref(false)

const ricercaMostro = ref('')
const mostroScelto = ref('')
const quantitaMostri = ref(1)
const selettoreNemiciAperto = ref(false)
const iniziativaAperta = ref(false)

const valoriPF = ref({})
const condizioniSelezionate = ref({})
const roundCondizione = ref({})
const conferma = ref(null)
const errore = ref('')
const messaggio = ref('')

const condizioni = [
  'Accecato',
  'Affascinato',
  'Afferrato',
  'Assordato',
  'Avvelenato',
  'Incapacitato',
  'Intralciato',
  'Invisibile',
  'Paralizzato',
  'Pietrificato',
  'Prono',
  'Spaventato',
  'Stordito',
]

const combattenti = computed(() => [
  ...personaggi.value.map(p => ({ ...p, categoria: 'PG' })),
  ...nemici.value.map(n => ({ ...n, categoria: 'Nemico' })),
])

const ordineCompleto = computed(() =>
  [...combattenti.value].sort((a, b) => {
    const aValido = iniziativaValida(a)
    const bValido = iniziativaValida(b)

    if (aValido !== bValido) return aValido ? -1 : 1

    if (aValido && bValido) {
      const differenza =
        Number(b.iniziativa) - Number(a.iniziativa)

      if (differenza) return differenza
    }

    if (a.categoria !== b.categoria) {
      return a.categoria === 'PG' ? -1 : 1
    }

    return String(a.nome).localeCompare(String(b.nome), 'it')
  })
)

const ordine = computed(() =>
  ordineCompleto.value.filter(c =>
    iniziativaValida(c) &&
    (c.categoria === 'PG' || Number(c.pf) > 0)
  )
)

const attivo = computed(() =>
  ordine.value.find(
    c => c.id === dati.value?.iniziativa.turnoAttivo
  ) || ordine.value[0] || null
)

const iniziativeMancanti = computed(() =>
  combattenti.value.filter(c =>
    !iniziativaValida(c) &&
    (c.categoria === 'PG' || Number(c.pf) > 0)
  ).length
)

const mostriDisponibili = computed(() => {
  const ricerca = normalizza(ricercaMostro.value)

  return creatureBestiario.value
    .filter(utilizzabile)
    .filter(c =>
      testoRicercaCreatura(c).includes(ricerca)
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
})

function normalizza(testo) {
  return String(testo || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

function iniziativaValida(c) {
  return (
    c.iniziativa !== null &&
    c.iniziativa !== undefined &&
    c.iniziativa !== '' &&
    Number.isFinite(Number(c.iniziativa))
  )
}

function originale(c) {
  return c.categoria === 'PG'
    ? personaggi.value.find(p => p.id === c.id)
    : nemici.value.find(n => n.id === c.id)
}

function pulisciMessaggi() {
  errore.value = ''
  messaggio.value = ''
}

function lanciaD20() {
  const valori = new Uint32Array(1)

  if (globalThis.crypto?.getRandomValues) {
    const limite = Math.floor(4294967296 / 20) * 20

    do {
      globalThis.crypto.getRandomValues(valori)
    } while (valori[0] >= limite)

    return (valori[0] % 20) + 1
  }

  return Math.floor(Math.random() * 20) + 1
}

function impostaIniziativa(c, valore) {
  const elemento = originale(c)
  if (!elemento) return

  const ordinePrecedente = ordine.value.map(x => x.id)
  const attivoPrecedente = attivo.value?.id

  if (
    valore === '' ||
    valore === null ||
    valore === undefined
  ) {
    elemento.iniziativa = null
  } else {
    const numero = Number(valore)

    if (!Number.isInteger(numero)) {
      errore.value = 'Inserisci un numero intero per l’iniziativa.'
      return
    }

    elemento.iniziativa = numero
  }

  passaTurnoSeEscluso(ordinePrecedente, attivoPrecedente)

  errore.value = ''
}

function tiraIniziativaNemico(c) {
  if (
    c.categoria !== 'Nemico' ||
    Number(c.pf) <= 0
  ) return

  const elemento = originale(c)
  if (!elemento) return

  elemento.iniziativa =
    lanciaD20() + (Number(elemento.bonusIniziativa) || 0)

  pulisciMessaggi()
}

function tiraIniziativeNemici() {
  let totale = 0

  for (const nemico of nemici.value) {
    if (
      Number(nemico.pf) <= 0 ||
      iniziativaValida(nemico)
    ) continue

    nemico.iniziativa =
      lanciaD20() + (Number(nemico.bonusIniziativa) || 0)

    totale++
  }

  messaggio.value = totale
    ? `${totale} iniziative dei nemici tirate.`
    : 'Tutti i nemici attivi hanno già un’iniziativa.'

  errore.value = ''
}

function azzeraIniziative() {
  if (conferma.value !== 'azzera-iniziative') return

  for (const c of [...personaggi.value, ...nemici.value]) {
    c.iniziativa = null
  }

  dati.value.iniziativa.round = 1
  dati.value.iniziativa.turnoAttivo = null
  conferma.value = null
  pulisciMessaggi()
}

function decrementaCondizioni(c) {
  const elemento = originale(c)
  if (!elemento || !Array.isArray(elemento.condizioni)) return
  if (!elemento.durateCondizioni || typeof elemento.durateCondizioni !== 'object') return

  for (const nome of elemento.condizioni) {
    const rimanenti = Number(elemento.durateCondizioni[nome])
    if (!Number.isInteger(rimanenti) || rimanenti <= 0) continue

    if (rimanenti === 1) {
      elemento.condizioni = elemento.condizioni.filter(x => x !== nome)
      delete elemento.durateCondizioni[nome]
    } else {
      elemento.durateCondizioni[nome] = rimanenti - 1
    }
  }
}

function durataCondizione(c, nome) {
  const valore = c.durateCondizioni?.[nome]
  return Number.isInteger(Number(valore)) && Number(valore) > 0
    ? Number(valore)
    : null
}

function prossimoTurno(direzione) {
  if (!ordine.value.length) return

  const indice = ordine.value.findIndex(
    c => c.id === attivo.value?.id
  )

  let prossimo = Math.max(0, indice) + direzione

  if (prossimo >= ordine.value.length) {
    prossimo = 0
    dati.value.iniziativa.round++
  } else if (prossimo < 0) {
    prossimo = ordine.value.length - 1
    dati.value.iniziativa.round = Math.max(
      1,
      dati.value.iniziativa.round - 1
    )
  }

  // Le condizioni scadono al termine del turno del combattente.
  // La navigazione all'indietro non modifica le durate.
  if (direzione > 0 && attivo.value) {
    decrementaCondizioni(attivo.value)
  }

  dati.value.iniziativa.turnoAttivo =
    ordine.value[prossimo].id
}

function passaTurnoSeEscluso(ordinePrecedente, attivoPrecedente) {
  if (!attivoPrecedente) return

  const disponibili = new Set(ordine.value.map(c => c.id))
  if (disponibili.has(attivoPrecedente)) return

  dati.value.iniziativa.turnoAttivo = null

  const indice = ordinePrecedente.indexOf(attivoPrecedente)
  if (indice < 0) return

  // Cerca dopo il turno appena escluso, usando l'ordine prima della modifica.
  // Il round aumenta solo se si torna a un combattente già passato nel giro.
  for (let passo = 1; passo < ordinePrecedente.length; passo++) {
    const successivo = (indice + passo) % ordinePrecedente.length
    const id = ordinePrecedente[successivo]

    if (!disponibili.has(id)) continue

    dati.value.iniziativa.turnoAttivo = id

    if (successivo < indice) {
      dati.value.iniziativa.round++
    }

    return
  }
}

function selezionaTurno(id) {
  if (ordine.value.some(c => c.id === id)) {
    dati.value.iniziativa.turnoAttivo = id
  }
}

function aggiungiPG() {
  const nome = nuovoPG.value.nome.trim()
  const ca = Number(nuovoPG.value.ca)
  const pf = Number(nuovoPG.value.pfMax)

  if (
    !nome ||
    !Number.isInteger(ca) ||
    ca < 0 ||
    !Number.isInteger(pf) ||
    pf < 1
  ) {
    errore.value = 'Inserisci nome, CA e PF validi.'
    return
  }

  dati.value.personaggi.push({
    id: idUnivoco(),
    nome,
    ca,
    pfMax: pf,
    pf,
    iniziativa: null,
    condizioni: [],
  })

  nuovoPG.value = {
    nome: '',
    ca: 13,
    pfMax: 20,
  }

  moduloPGAperto.value = false
  pulisciMessaggi()
}

function aggiungiMostri() {
  const creatura = mostriDisponibili.value.find(
    c => c.id === mostroScelto.value
  )

  const quantita = Number(quantitaMostri.value)

  if (
    !creatura ||
    !Number.isInteger(quantita) ||
    quantita < 1 ||
    quantita > 30
  ) {
    errore.value =
      'Seleziona una creatura e una quantità da 1 a 30.'
    return
  }

  const nomi = new Set(nemici.value.map(n => n.nome))

  for (let i = 0; i < quantita; i++) {
    let numero = 1
    let nome = `${creatura.nome} ${numero}`

    while (nomi.has(nome)) {
      numero++
      nome = `${creatura.nome} ${numero}`
    }

    dati.value.nemici.push(creaIstanza(creatura, nome))
    nomi.add(nome)
  }

  mostroScelto.value = ''
  quantitaMostri.value = 1
  selettoreNemiciAperto.value = false
  pulisciMessaggi()
}

function cambiaPF(c, segno) {
  const elemento = originale(c)
  if (!elemento) return

  const testo = valoriPF.value[c.id]
  const quantita =
    testo === '' || testo == null ? 3 : Number(testo)

  if (
    !Number.isInteger(quantita) ||
    quantita < 1
  ) {
    errore.value = 'Inserisci una quantità di PF valida.'
    return
  }

  const ordinePrecedente = ordine.value.map(x => x.id)
  const attivoPrecedente = attivo.value?.id

  elemento.pf = Math.max(
    0,
    Math.min(
      Number(elemento.pfMax),
      Number(elemento.pf) + segno * quantita
    )
  )

  passaTurnoSeEscluso(ordinePrecedente, attivoPrecedente)

  pulisciMessaggi()
}

function percentuale(c) {
  return Number(c.pfMax) > 0
    ? Math.max(
        0,
        Math.min(
          100,
          Number(c.pf) / Number(c.pfMax) * 100
        )
      )
    : 0
}

function aggiungiCondizione(c) {
  const elemento = originale(c)
  const nome = condizioniSelezionate.value[c.id]
  if (!elemento || !nome) return

  const testoDurata = String(roundCondizione.value[c.id] ?? '').trim()
  const durata = testoDurata === '' ? null : Number(testoDurata)

  if (durata !== null && (!Number.isInteger(durata) || durata < 1 || durata > 999)) {
    errore.value = 'La durata deve essere un numero intero tra 1 e 999, oppure vuota.'
    return
  }

  if (!Array.isArray(elemento.condizioni)) elemento.condizioni = []
  if (!elemento.condizioni.includes(nome)) elemento.condizioni.push(nome)
  if (!elemento.durateCondizioni || typeof elemento.durateCondizioni !== 'object') {
    elemento.durateCondizioni = {}
  }

  if (durata === null) {
    delete elemento.durateCondizioni[nome]
  } else {
    elemento.durateCondizioni[nome] = durata
  }

  condizioniSelezionate.value[c.id] = ''
  roundCondizione.value[c.id] = ''
  errore.value = ''
}

function togliCondizione(c, nome) {
  const elemento = originale(c)
  if (!elemento) return

  elemento.condizioni = (elemento.condizioni || []).filter(x => x !== nome)
  if (elemento.durateCondizioni) delete elemento.durateCondizioni[nome]
}

function rimuoviCombattente(c) {
  const ordinePrecedente = ordine.value.map(x => x.id)
  const attivoPrecedente = attivo.value?.id

  if (c.categoria === 'PG') {
    dati.value.personaggi = personaggi.value.filter(
      p => p.id !== c.id
    )
  } else {
    dati.value.nemici = nemici.value.filter(
      n => n.id !== c.id
    )
  }

  passaTurnoSeEscluso(ordinePrecedente, attivoPrecedente)

  conferma.value = null
}

function nuovoIncontro() {
  if (conferma.value !== 'nuovo-incontro') return

  dati.value.nemici = []
  dati.value.iniziativa = {
    round: 1,
    turnoAttivo: null,
  }

  for (const pg of personaggi.value) {
    pg.iniziativa = null
  }

  conferma.value = null
  iniziativaAperta.value = false
  pulisciMessaggi()
}
</script>

<template>
  <section class="battaglia-dmc">
    <!-- BARRA DI COMBATTIMENTO -->

    <div class="barra-comando dmc-pannello">
      <div class="barra-superiore">
        <h2>Battaglia</h2>

        <div class="azioni">
          <span class="round">
            Round {{ dati?.iniziativa.round || 1 }}
          </span>

          <button
            type="button"
            class="pulsante secondario dmc-btn dmc-btn--secondary"
            @click="conferma = 'nuovo-incontro'"
          >
            Nuovo incontro
          </button>
        </div>
      </div>

      <div class="barra-navigazione">
        <div class="gruppo-attivo">
          <span class="etichetta">TURNO ATTIVO</span>
          <strong>{{ attivo?.nome || 'Nessuna iniziativa' }}</strong>
        </div>

        <div class="controlli-turno">
          <button
            type="button"
            class="pulsante secondario dmc-btn dmc-btn--secondary"
            :disabled="!ordine.length"
            @click="prossimoTurno(-1)"
          >
            ← Precedente
          </button>

          <button
            type="button"
            class="pulsante principale dmc-btn"
            :disabled="!ordine.length"
            @click="prossimoTurno(1)"
          >
            Successivo →
          </button>

          <button
            type="button"
            class="pulsante menu-iniziativa dmc-btn dmc-btn--secondary"
            :class="{ aperto: iniziativaAperta }"
            :aria-expanded="iniziativaAperta"
            aria-controls="dmc-elenco-iniziativa"
            @click="iniziativaAperta = !iniziativaAperta"
          >
            Iniziativa
            <span v-if="iniziativeMancanti" class="contatore">
              {{ iniziativeMancanti }}
            </span>
            {{ iniziativaAperta ? '▴' : '▾' }}
          </button>
        </div>
      </div>

      <!-- ORDINE DEI TURNI -->

      <div
        v-if="ordine.length"
        class="ordine-compatto"
        aria-label="Ordine dei turni"
      >
        <button
          v-for="c in ordine"
          :key="c.id"
          type="button"
          class="chip-iniziativa"
          :class="{
            attivo: attivo?.id === c.id,
            pg: c.categoria === 'PG',
          }"
          :title="`${c.nome} — iniziativa ${c.iniziativa}`"
          @click="selezionaTurno(c.id)"
        >
          <span class="chip-nome">{{ c.nome }}</span>
          <strong class="chip-valore">{{ c.iniziativa }}</strong>
        </button>
      </div>

      <!-- MENU INIZIATIVA -->

      <div
        v-if="iniziativaAperta"
        id="dmc-elenco-iniziativa"
        class="menu-aperto"
      >
        <div class="intestazione-menu">
          <div>
            <strong>Gestione iniziative</strong>
            <p>PG: valore manuale · Nemici: manuale o d20 + bonus</p>
          </div>

          <div class="azioni">
            <button
              type="button"
              class="pulsante secondario dmc-btn dmc-btn--secondary"
              :disabled="!nemici.length"
              @click="tiraIniziativeNemici"
            >
              Tira nemici mancanti
            </button>

            <button
              type="button"
              class="pulsante secondario dmc-btn dmc-btn--secondary"
              :disabled="!combattenti.length"
              @click="conferma = 'azzera-iniziative'"
            >
              Azzera
            </button>
          </div>
        </div>

        <div
          v-if="conferma === 'azzera-iniziative'"
          class="conferma"
        >
          <strong>
            Azzerare tutte le iniziative e tornare al round 1?
          </strong>

          <div class="azioni">
            <button
              type="button"
              class="pulsante pericolo dmc-btn dmc-btn--danger"
              @click="azzeraIniziative"
            >
              Conferma
            </button>

            <button
              type="button"
              class="pulsante secondario dmc-btn dmc-btn--secondary"
              @click="conferma = null"
            >
              Annulla
            </button>
          </div>
        </div>

        <div
          v-if="ordineCompleto.length"
          class="elenco-iniziativa"
        >
          <div
            v-for="c in ordineCompleto"
            :key="c.id"
            class="riga-iniziativa"
            :class="{
              selezionata:
                attivo?.id === c.id &&
                iniziativaValida(c) &&
                (c.categoria === 'PG' || Number(c.pf) > 0),
              esclusa:
                c.categoria === 'Nemico' &&
                Number(c.pf) <= 0,
            }"
          >
            <button
              type="button"
              class="nome-iniziativa"
              :disabled="
                !iniziativaValida(c) ||
                (c.categoria === 'Nemico' && Number(c.pf) <= 0)
              "
              @click="selezionaTurno(c.id)"
            >
              <span class="tipo">{{ c.categoria }}</span>
              <strong>{{ c.nome }}</strong>

              <small
                v-if="c.categoria === 'Nemico' && Number(c.pf) <= 0"
              >
                0 PF
              </small>
            </button>

            <div class="valore-iniziativa">
              <input class="dmc-campo"
                :key="`${c.id}-${c.iniziativa ?? 'vuota'}`"
                type="number"
                step="1"
                :value="c.iniziativa ?? ''"
                :aria-label="`Iniziativa di ${c.nome}`"
                placeholder="—"
                @change="impostaIniziativa(c, $event.target.value)"
              />

              <button
                v-if="c.categoria === 'Nemico'"
                type="button"
                class="pulsante secondario dado dmc-btn dmc-btn--secondary dmc-btn--icona"
                :disabled="Number(c.pf) <= 0"
                :title="`Tira 1d20 + bonus per ${c.nome}`"
                @click="tiraIniziativaNemico(c)"
              >
                d20
              </button>
            </div>
          </div>
        </div>

        <p v-else class="vuoto">
          Aggiungi almeno un combattente.
        </p>

        <p class="nota">
          Il tiro automatico usa d20 + bonus d'iniziativa
          della scheda, quando disponibile.
          Puoi modificare manualmente qualsiasi risultato.
        </p>
      </div>
    </div>

    <!-- MESSAGGI -->

    <p v-if="errore" class="messaggio errore" role="alert">
      {{ errore }}
    </p>

    <p v-if="messaggio" class="messaggio" role="status">
      {{ messaggio }}
    </p>

    <!-- NUOVO INCONTRO -->

    <div
      v-if="conferma === 'nuovo-incontro'"
      class="conferma"
    >
      <strong>
        Rimuovere i nemici e azzerare le iniziative?
      </strong>

      <p>I PF dei PG resteranno invariati.</p>

      <div class="azioni">
        <button
          type="button"
          class="pulsante pericolo dmc-btn dmc-btn--danger"
          @click="nuovoIncontro"
        >
          Conferma
        </button>

        <button
          type="button"
          class="pulsante secondario dmc-btn dmc-btn--secondary"
          @click="conferma = null"
        >
          Annulla
        </button>
      </div>
    </div>

    <!-- PERSONAGGI -->

    <header class="titolo-gruppo">
      <div class="titolo-conteggio">
        <h3>Personaggi</h3>
        <span>{{ personaggi.length }} PG</span>
      </div>

      <button
        type="button"
        class="pulsante principale dmc-btn"
        @click="moduloPGAperto = !moduloPGAperto"
      >
        {{ moduloPGAperto ? '− Chiudi' : '+ Aggiungi PG' }}
      </button>
    </header>

    <!-- AGGIUNTA PG -->

    <form
      v-if="moduloPGAperto"
      class="nuovo-pg pannello dmc-pannello"
      @submit.prevent="aggiungiPG"
    >
      <label class="espandi">
        Nome
        <input class="dmc-campo"
          v-model="nuovoPG.nome"
          required
          placeholder="Nome PG"
        />
      </label>

      <label class="numero">
        CA
        <input class="dmc-campo"
          v-model.number="nuovoPG.ca"
          type="number"
          min="0"
        />
      </label>

      <label class="numero">
        PF max
        <input class="dmc-campo"
          v-model.number="nuovoPG.pfMax"
          type="number"
          min="1"
        />
      </label>

      <button type="submit" class="pulsante principale dmc-btn">
        Salva PG
      </button>
    </form>

    <p v-if="!personaggi.length" class="vuoto">
      Nessun personaggio presente.
    </p>

    <!-- SCHEDE PG -->

    <div class="griglia-combattenti">
      <article
        v-for="pg in personaggi"
        :key="pg.id"
        class="combattente pannello dmc-pannello"
        :class="{
          'a-zero': Number(pg.pf) <= 0,
          'turno-attivo': attivo?.id === pg.id,
        }"
      >
        <header class="riga">
          <div class="nome">
            <h4>{{ pg.nome }}</h4>
            <small
              v-if="attivo?.id === pg.id"
              class="evidenza"
            >
              TURNO ATTIVO
            </small>
          </div>

          <button
            type="button"
            class="rimuovi dmc-btn dmc-btn--danger dmc-btn--icona"
            :title="`Rimuovi ${pg.nome}`"
            :aria-label="`Rimuovi ${pg.nome}`"
            @click="conferma = pg.id"
          >
            ×
          </button>
        </header>

        <!-- CONFERMA RIMOZIONE PG -->

        <div v-if="conferma === pg.id" class="conferma">
          <strong>Rimuovere {{ pg.nome }}?</strong>

          <div class="azioni">
            <button
              type="button"
              class="pulsante pericolo dmc-btn dmc-btn--danger"
              @click="rimuoviCombattente({
                ...pg,
                categoria: 'PG'
              })"
            >
              Conferma
            </button>

            <button
              type="button"
              class="pulsante secondario dmc-btn dmc-btn--secondary"
              @click="conferma = null"
            >
              Annulla
            </button>
          </div>
        </div>

        <!-- PUNTI FERITA -->

        <div class="riga">
          <strong>{{ pg.pf }}/{{ pg.pfMax }} PF</strong>
          <span>CA {{ pg.ca }}</span>
        </div>

        <div class="barra-pf">
          <div :style="{ width: `${percentuale(pg)}%` }"></div>
        </div>

        <small
          v-if="Number(pg.pf) <= 0"
          class="avviso-pf"
        >
          A 0 PF · Tiri salvezza contro morte
        </small>

        <div class="controlli-pf">
          <input class="dmc-campo"
            v-model.number="valoriPF[pg.id]"
            type="number"
            min="1"
            placeholder="3"
            :aria-label="`PF da modificare per ${pg.nome}`"
          />

          <button
            type="button"
            class="pulsante danno dmc-btn dmc-btn--danger"
            title="Infliggi danni"
            @click="cambiaPF({ ...pg, categoria: 'PG' }, -1)"
          >
            −
          </button>

          <button
            type="button"
            class="pulsante cura dmc-btn dmc-btn--positive"
            title="Cura"
            @click="cambiaPF({ ...pg, categoria: 'PG' }, 1)"
          >
            +
          </button>
        </div>

        <!-- CONDIZIONI PG: PANNELLO ESPANDIBILE -->

        <details class="condizioni-dropdown">
          <summary class="condizioni-riepilogo">
            <span class="condizioni-titolo">
              Condizioni
              <span class="condizioni-contatore">
                {{ (pg.condizioni || []).length }}
              </span>
            </span>

            <span
              v-if="(pg.condizioni || []).length"
              class="condizioni-anteprima"
            >
              <span
                v-for="condizione in pg.condizioni || []"
                :key="condizione"
                class="condizione-mini"
              >
                {{ condizione }}
                <small v-if="durataCondizione(pg, condizione)">
                  {{ durataCondizione(pg, condizione) }}r
                </small>
              </span>
            </span>

            <span v-else class="condizioni-nessuna">
              Nessuna
            </span>

            <span class="condizioni-chevron" aria-hidden="true">
              ▾
            </span>
          </summary>

          <div class="condizioni-contenuto">
            <div class="aggiungi-condizione">
              <label class="scelta-condizione">
                <span>Condizione</span>

                <select class="dmc-campo" v-model="condizioniSelezionate[pg.id]">
                  <option value="">Seleziona…</option>

                  <option
                    v-for="c in condizioni"
                    :key="c"
                    :value="c"
                    :disabled="(pg.condizioni || []).includes(c)"
                  >
                    {{ c }}
                  </option>
                </select>
              </label>

              <label class="durata-condizione">
                <span>Round</span>

                <input class="dmc-campo"
                  v-model="roundCondizione[pg.id]"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  placeholder="∞"
                  title="Vuoto: durata indefinita"
                />
              </label>

              <button
                type="button"
                class="pulsante secondario bottone-condizione dmc-btn dmc-btn--secondary"
                :disabled="!condizioniSelezionate[pg.id]"
                :aria-label="`Aggiungi condizione a ${pg.nome}`"
                @click="aggiungiCondizione({
                  ...pg,
                  categoria: 'PG'
                })"
              >
                +
              </button>
            </div>

            <div
              v-if="(pg.condizioni || []).length"
              class="condizioni-attive"
            >
              <div
                v-for="condizione in pg.condizioni || []"
                :key="condizione"
                class="condizione-riga"
              >
                <span>
                  {{ condizione }}

                  <small>
                    {{
                      durataCondizione(pg, condizione)
                        ? `${durataCondizione(pg, condizione)} round`
                        : 'Senza scadenza'
                    }}
                  </small>
                </span>

                <button
                  type="button"
                  class="rimuovi-condizione dmc-btn dmc-btn--danger dmc-btn--icona"
                  :aria-label="`Rimuovi ${condizione} da ${pg.nome}`"
                  @click="togliCondizione({
                    ...pg,
                    categoria: 'PG'
                  }, condizione)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </details>

        <!-- MODIFICA DATI PG -->

        <details>
          <summary>Modifica scheda</summary>

          <label>
            Nome
            <input class="dmc-campo" v-model="pg.nome" />
          </label>

          <label>
            CA
            <input class="dmc-campo"
              v-model.number="pg.ca"
              type="number"
              min="0"
            />
          </label>

          <label>
            PF massimi
            <input class="dmc-campo"
              v-model.number="pg.pfMax"
              type="number"
              min="1"
            />
          </label>
        </details>
      </article>
    </div>

    <!-- NEMICI -->

    <header class="titolo-gruppo">
      <div class="titolo-conteggio">
        <h3>Nemici</h3>
        <span>{{ nemici.length }} nemici</span>
      </div>

      <button
        type="button"
        class="pulsante principale dmc-btn"
        @click="selettoreNemiciAperto = !selettoreNemiciAperto"
      >
        {{
          selettoreNemiciAperto
            ? '− Chiudi'
            : '+ Aggiungi nemico'
        }}
      </button>
    </header>

    <!-- AGGIUNTA NEMICI -->

    <form
      v-if="selettoreNemiciAperto"
      class="pannello selettore-mostri dmc-pannello"
      @submit.prevent="aggiungiMostri"
    >
      <label>
        Cerca nel Bestiario

        <input class="dmc-campo"
          v-model="ricercaMostro"
          placeholder="Goblin, Scheletro, Drago..."
        />
      </label>

      <div class="nuovo-pg">
        <label class="espandi">
          Creatura

          <select class="dmc-campo" v-model="mostroScelto">
            <option value="">Seleziona creatura</option>

            <option
              v-for="m in mostriDisponibili"
              :key="m.id"
              :value="m.id"
            >
              {{ m.nome }} · CA {{ m.ca }} ·
              {{ m.pfMax }} PF
            </option>
          </select>
        </label>

        <label class="numero">
          Quantità

          <input class="dmc-campo"
            v-model.number="quantitaMostri"
            type="number"
            min="1"
            max="30"
          />
        </label>

        <button
          type="submit"
          class="pulsante principale dmc-btn"
        >
          Aggiungi
        </button>
      </div>
    </form>

    <p v-if="!nemici.length" class="vuoto">
      Nessun nemico presente.
    </p>

    <!-- SCHEDE NEMICI -->

    <div class="griglia-combattenti">
      <article
        v-for="nemico in nemici"
        :key="nemico.id"
        class="combattente pannello dmc-pannello"
        :class="{
          'a-zero': Number(nemico.pf) <= 0,
          'turno-attivo': attivo?.id === nemico.id,
        }"
      >
        <header class="riga">
          <div class="nome">
            <h4>{{ nemico.nome }}</h4>
            <small>{{ nemico.tipo }}</small>

            <small
              v-if="attivo?.id === nemico.id"
              class="evidenza"
            >
              TURNO ATTIVO
            </small>
          </div>

          <button
            type="button"
            class="rimuovi dmc-btn dmc-btn--danger dmc-btn--icona"
            :title="`Rimuovi ${nemico.nome}`"
            :aria-label="`Rimuovi ${nemico.nome}`"
            @click="conferma = nemico.id"
          >
            ×
          </button>
        </header>

        <!-- CONFERMA RIMOZIONE NEMICO -->

        <div v-if="conferma === nemico.id" class="conferma">
          <strong>Rimuovere {{ nemico.nome }}?</strong>

          <div class="azioni">
            <button
              type="button"
              class="pulsante pericolo dmc-btn dmc-btn--danger"
              @click="rimuoviCombattente({
                ...nemico,
                categoria: 'Nemico'
              })"
            >
              Conferma
            </button>

            <button
              type="button"
              class="pulsante secondario dmc-btn dmc-btn--secondary"
              @click="conferma = null"
            >
              Annulla
            </button>
          </div>
        </div>

        <!-- PUNTI FERITA -->

        <div class="riga">
          <strong>
            {{ nemico.pf }}/{{ nemico.pfMax }} PF
          </strong>

          <span>CA {{ nemico.ca }}</span>
        </div>

        <div class="barra-pf">
          <div
            :style="{ width: `${percentuale(nemico)}%` }"
          ></div>
        </div>

        <small
          v-if="Number(nemico.pf) <= 0"
          class="avviso-pf"
        >
          A 0 PF · Fuori dall'ordine dei turni
        </small>

        <div class="controlli-pf">
          <input class="dmc-campo"
            v-model.number="valoriPF[nemico.id]"
            type="number"
            min="1"
            placeholder="3"
            :aria-label="`PF da modificare per ${nemico.nome}`"
          />

          <button
            type="button"
            class="pulsante danno dmc-btn dmc-btn--danger"
            title="Infliggi danni"
            @click="cambiaPF({
              ...nemico,
              categoria: 'Nemico'
            }, -1)"
          >
            −
          </button>

          <button
            type="button"
            class="pulsante cura dmc-btn dmc-btn--positive"
            title="Cura"
            @click="cambiaPF({
              ...nemico,
              categoria: 'Nemico'
            }, 1)"
          >
            +
          </button>
        </div>

        <!-- CONDIZIONI NEMICO: PANNELLO ESPANDIBILE -->

        <details class="condizioni-dropdown">
          <summary class="condizioni-riepilogo">
            <span class="condizioni-titolo">
              Condizioni
              <span class="condizioni-contatore">
                {{ (nemico.condizioni || []).length }}
              </span>
            </span>

            <span
              v-if="(nemico.condizioni || []).length"
              class="condizioni-anteprima"
            >
              <span
                v-for="condizione in nemico.condizioni || []"
                :key="condizione"
                class="condizione-mini"
              >
                {{ condizione }}
                <small v-if="durataCondizione(nemico, condizione)">
                  {{ durataCondizione(nemico, condizione) }}r
                </small>
              </span>
            </span>

            <span v-else class="condizioni-nessuna">
              Nessuna
            </span>

            <span class="condizioni-chevron" aria-hidden="true">
              ▾
            </span>
          </summary>

          <div class="condizioni-contenuto">
            <div class="aggiungi-condizione">
              <label class="scelta-condizione">
                <span>Condizione</span>

                <select class="dmc-campo"
                  v-model="condizioniSelezionate[nemico.id]"
                >
                  <option value="">Seleziona…</option>

                  <option
                    v-for="c in condizioni"
                    :key="c"
                    :value="c"
                    :disabled="
                      (nemico.condizioni || []).includes(c)
                    "
                  >
                    {{ c }}
                  </option>
                </select>
              </label>

              <label class="durata-condizione">
                <span>Round</span>

                <input class="dmc-campo"
                  v-model="roundCondizione[nemico.id]"
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  placeholder="∞"
                  title="Vuoto: durata indefinita"
                />
              </label>

              <button
                type="button"
                class="pulsante secondario bottone-condizione dmc-btn dmc-btn--secondary"
                :disabled="!condizioniSelezionate[nemico.id]"
                :aria-label="`Aggiungi condizione a ${nemico.nome}`"
                @click="aggiungiCondizione({
                  ...nemico,
                  categoria: 'Nemico'
                })"
              >
                +
              </button>
            </div>

            <div
              v-if="(nemico.condizioni || []).length"
              class="condizioni-attive"
            >
              <div
                v-for="condizione in nemico.condizioni || []"
                :key="condizione"
                class="condizione-riga"
              >
                <span>
                  {{ condizione }}

                  <small>
                    {{
                      durataCondizione(nemico, condizione)
                        ? `${durataCondizione(nemico, condizione)} round`
                        : 'Senza scadenza'
                    }}
                  </small>
                </span>

                <button
                  type="button"
                  class="rimuovi-condizione dmc-btn dmc-btn--danger dmc-btn--icona"
                  :aria-label="`Rimuovi ${condizione} da ${nemico.nome}`"
                  @click="togliCondizione({
                    ...nemico,
                    categoria: 'Nemico'
                  }, condizione)"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        </details>

        <!-- AZIONI E DETTAGLI TATTICI: sotto le condizioni, tutti espandibili. -->
        <SchedaTatticaCreatura :creatura="nemico" />

        <!-- SCHEDA COMPLETA DEL NEMICO -->

        <details>
          <summary>Consulta la scheda originale completa</summary>

          <SchedaCreatura
            :creatura="nemico"
            combattimento
          />
        </details>
      </article>
    </div>
  </section>
</template>


<style scoped>
/*
 * DMC — Gestione Battaglia
 * UI.5.2 — Condizioni espandibili
 *
 * Design system: design-system.css
 * Posizionamento e compattazione:
 * sticky-battaglia.css
 */

.battaglia-dmc {
  display: grid;
  gap: 14px;
  min-width: 0;
  color: var(--dmc-cream);
}

.battaglia-dmc :is(h2, h3, h4, p) {
  margin: 0;
}

.battaglia-dmc :is(h2, h3, h4) {
  color: var(--dmc-amber);
}

/* LAYOUT CONDIVISO */

.riga,
.azioni,
.titolo-gruppo,
.barra-superiore,
.barra-navigazione {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.azioni {
  justify-content: flex-start;
}

.conferma,
.vuoto {
  display: grid;
  gap: 11px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-surface);
}

.pannello {
  display: grid;
  gap: 11px;
  min-width: 0;
  padding: 14px;
}

.conferma {
  border-color: var(--dmc-rust);
}

.conferma p,
.nota {
  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.5;
}

/* PULSANTI */

.pulsante {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  min-height: 36px;
  padding: 8px 12px;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.25;
  cursor: pointer;

  transition:
    background-color var(--dmc-transition),
    border-color var(--dmc-transition),
    color var(--dmc-transition);
}

.pulsante:disabled,
.nome-iniziativa:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* CAMPI */

.battaglia-dmc label {
  display: grid;
  gap: 5px;
  min-width: 0;
  color: var(--dmc-muted-light);
  font-size: 13px;
}

.battaglia-dmc :is(input, select) {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 37px;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font: inherit;
  font-size: 13px;
}

/* BARRA DI COMBATTIMENTO */

.barra-comando {
  display: grid;
  gap: 10px;
  padding: 12px;
}

.barra-superiore h2 {
  font-family: var(--dmc-font-display);
  font-size: 21px;
}

.round {
  padding: 7px 11px;
  border: 1px solid var(--dmc-amber);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-amber-light);
  font-size: 13px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.barra-navigazione {
  gap: 12px;
  padding-top: 9px;
  border-top: 1px solid var(--dmc-border-soft);
}

.gruppo-attivo {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 9px;
  min-width: 0;
}

.etichetta {
  color: var(--dmc-amber-light);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.7px;
}

.gruppo-attivo strong {
  color: var(--dmc-cream);
  font-size: 17px;
  overflow-wrap: anywhere;
}

.controlli-turno {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
}

.menu-iniziativa {
  color: var(--dmc-cream);
  background: var(--dmc-surface-raised);
  border-color: var(--dmc-amber-dark);
}

.menu-iniziativa.aperto {
  color: var(--dmc-ink);
  background: var(--dmc-amber);
}

.contatore {
  display: inline-grid;
  place-items: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  border-radius: 20px;
  background: var(--dmc-amber-dark);
  color: var(--dmc-cream);
  font-size: 11px;
}

/* ORDINE DEI TURNI */

.ordine-compatto {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding-top: 9px;
  border-top: 1px solid var(--dmc-border-soft);
}

.chip-iniziativa {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  max-width: 210px;
  padding: 6px 8px 6px 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-soft);
  color: var(--dmc-cream);
  font: inherit;
  font-size: 12px;
  cursor: pointer;

  transition:
    background-color var(--dmc-transition),
    border-color var(--dmc-transition);
}

.chip-iniziativa:hover {
  border-color: var(--dmc-amber);
}

.chip-iniziativa.pg {
  border-left: 3px solid var(--dmc-blue);
}

.chip-iniziativa.attivo {
  border-color: var(--dmc-amber);
  background: var(--dmc-amber);
  color: var(--dmc-ink);
  font-weight: 800;
}

.chip-iniziativa.attivo.pg {
  border-left-color: var(--dmc-ink);
}

.chip-nome {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-valore {
  display: inline-grid;
  place-items: center;
  min-width: 24px;
  padding: 3px 5px;
  border-radius: var(--dmc-radius-xs);
  background: rgb(255 255 255 / 10%);
  color: inherit;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}

.chip-iniziativa.attivo .chip-valore {
  background: rgb(0 0 0 / 13%);
}

/* MENU INIZIATIVA */

.menu-aperto {
  display: grid;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--dmc-border-soft);
}

.intestazione-menu {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.intestazione-menu > div:first-child {
  display: grid;
  gap: 4px;
}

.intestazione-menu p {
  color: var(--dmc-muted-light);
  font-size: 12px;
}

.elenco-iniziativa {
  display: grid;
  gap: 5px;
  max-height: 310px;
  overflow-y: auto;
  padding-right: 3px;
}

.riga-iniziativa {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  padding: 6px 9px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-soft);
}

.riga-iniziativa.selezionata {
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-raised);
}

.riga-iniziativa.esclusa {
  opacity: 0.55;
}

.nome-iniziativa {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--dmc-cream);
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.nome-iniziativa strong {
  font-size: 13px;
  overflow-wrap: anywhere;
}

.nome-iniziativa small {
  color: var(--dmc-rust-text);
}

.tipo {
  min-width: 50px;
  padding: 4px 5px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-muted-light);
  font-size: 10px;
  text-align: center;
}

.valore-iniziativa {
  display: flex;
  align-items: center;
  gap: 7px;
}

.battaglia-dmc .valore-iniziativa input {
  width: 64px;
  min-height: 35px;
  padding: 6px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.dado {
  min-width: 46px;
  min-height: 35px;
  padding: 6px 8px;
  font-size: 12px;
}

/* PERSONAGGI E NEMICI */

.titolo-gruppo {
  margin-top: 5px;
}

.titolo-gruppo h3 {
  font-family: var(--dmc-font-display);
  font-size: 19px;
}

.titolo-conteggio {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.titolo-conteggio span {
  color: var(--dmc-muted-light);
  font-size: 13px;
}

.nuovo-pg {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 10px;
}

.espandi {
  flex: 1;
  min-width: 150px;
}

.numero {
  width: 100px;
}

/* SCHEDE DEI COMBATTENTI */

.griglia-combattenti {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: start;
  gap: 12px;
}

.combattente {
  gap: 10px;
  padding: 14px;
  border-radius: var(--dmc-radius-md);
}

.combattente.turno-attivo {
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-raised);
  box-shadow:
    inset 3px 0 0 var(--dmc-amber),
    inset 0 0 0 1px rgb(229 166 92 / 20%);
}

.combattente.a-zero {
  --dmc-panel-bg: var(--dmc-surface-soft);
  box-shadow: inset 3px 0 0 var(--dmc-rust);
  border-color: var(--dmc-rust);
  background: var(--dmc-surface-soft);
}

.nome {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.nome h4 {
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: 16px;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.nome small {
  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.4;
}

.evidenza {
  color: var(--dmc-amber-light) !important;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.rimuovi {
  display: inline-grid;
  place-items: center;
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--dmc-rust);
  border-radius: var(--dmc-radius-xs);
  background: transparent;
  color: var(--dmc-rust-text);
  font-size: 19px;
  cursor: pointer;
}

.rimuovi:hover {
  background: var(--dmc-rust);
  color: var(--dmc-ink-deep);
}

/* PUNTI FERITA */

.barra-pf {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--dmc-ink);
}

.barra-pf > div {
  height: 100%;
  background: var(--dmc-moss);
}

.a-zero .barra-pf > div {
  background: var(--dmc-rust);
}

.avviso-pf {
  color: var(--dmc-rust-text);
  font-size: 12px;
  line-height: 1.45;
}

.controlli-pf {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 40px 40px;
  gap: 6px;
}

.controlli-pf input {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.controlli-pf .pulsante {
  min-width: 40px;
  padding: 4px;
  font-size: 19px;
}

/* CONDIZIONI ESPANDIBILI */

/*
 * Il pannello si comporta indipendentemente
 * per ogni combattente.
 *
 * La riga di riepilogo rimane sempre visibile.
 * I controlli sono visibili soltanto a pannello aperto.
 */

.combattente .condizioni-dropdown {
  display: block;
  min-width: 0;
  padding: 0;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink);
  overflow: hidden;
}

/* RIEPILOGO SEMPRE VISIBILE */

.combattente .condizioni-riepilogo {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 37px;
  padding: 7px 9px;
  border: 0;
  color: var(--dmc-cream);
  cursor: pointer;
  list-style: none;
}

.condizioni-riepilogo::-webkit-details-marker {
  display: none;
}

.condizioni-riepilogo::marker {
  content: '';
}

.condizioni-riepilogo:hover {
  background: var(--dmc-surface-soft);
}

.condizioni-titolo {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 6px;
  color: var(--dmc-amber-light);
  font-size: 12px;
  font-weight: 750;
}

.condizioni-contatore {
  display: inline-grid;
  place-items: center;
  min-width: 19px;
  height: 19px;
  padding: 0 5px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-raised);
  color: var(--dmc-cream);
  font-size: 10px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.condizioni-anteprima {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.condizione-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  padding: 3px 5px;
  border: 1px solid var(--dmc-amber-dark);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber-light);
  font-size: 10px;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.condizione-mini small {
  flex-shrink: 0;
  color: var(--dmc-cream);
  font-size: 10px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.condizioni-nessuna {
  flex: 1;
  min-width: 0;
  color: var(--dmc-muted-light);
  font-size: 11px;
}

.condizioni-chevron {
  display: inline-block;
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--dmc-amber-light);
  font-size: 14px;
  line-height: 1;

  transition: transform var(--dmc-transition);
}

.condizioni-dropdown[open] .condizioni-chevron {
  transform: rotate(180deg);
}

.condizioni-dropdown[open] > .condizioni-riepilogo {
  border-bottom: 1px solid var(--dmc-border-soft);
  background: var(--dmc-surface-soft);
}

/* CONTENUTO ESPANSO */

.condizioni-contenuto {
  display: grid;
  gap: 10px;
  padding: 10px;
}

.aggiungi-condizione {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px 34px;
  align-items: end;
  gap: 6px;
  min-width: 0;
}

.aggiungi-condizione label {
  display: grid;
  gap: 4px;
  min-width: 0;
  font-size: 11px;
}

.battaglia-dmc .aggiungi-condizione select,
.battaglia-dmc .aggiungi-condizione input {
  min-height: 34px;
  padding: 6px 7px;
  font-size: 12px;
}

.battaglia-dmc .aggiungi-condizione input {
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.aggiungi-condizione .bottone-condizione {
  min-height: 34px;
  padding: 6px;
  font-size: 18px;
}

.condizioni-attive {
  display: grid;
  gap: 5px;
  padding-top: 8px;
  border-top: 1px solid var(--dmc-border-soft);
}

.condizione-riga {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 0;
  padding: 6px 8px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-soft);
}

.condizione-riga > span {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  color: var(--dmc-cream);
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.condizione-riga small {
  color: var(--dmc-muted-light);
  font-size: 10px;
  font-weight: 400;
}

.rimuovi-condizione {
  display: inline-grid;
  place-items: center;
  flex: 0 0 auto;
  width: 27px;
  height: 27px;
  padding: 0;
  border: 1px solid var(--dmc-rust);
  border-radius: var(--dmc-radius-xs);
  background: transparent;
  color: var(--dmc-rust-text);
  font-size: 18px;
  cursor: pointer;
}

.rimuovi-condizione:hover {
  background: var(--dmc-rust);
  color: var(--dmc-ink-deep);
}

/* DETTAGLI DEL COMBATTENTE */

.combattente details:not(.condizioni-dropdown) {
  padding-top: 9px;
  border-top: 1px solid var(--dmc-border-soft);
}

.combattente details:not(.condizioni-dropdown) > summary {
  color: var(--dmc-amber-light);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
}

.combattente details:not(.condizioni-dropdown)[open] > :not(summary) {
  margin-top: 10px;
}

.regola {
  padding: 10px;
  border-left: 2px solid var(--dmc-amber);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
}

.regola p,
.testo-pre {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* FEEDBACK */

.messaggio {
  padding: 10px;
  border: 1px solid var(--dmc-moss);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-moss-text);
  font-size: 13px;
  line-height: 1.5;
}

.messaggio.errore {
  border-color: var(--dmc-rust);
  color: var(--dmc-rust-text);
}

.vuoto {
  color: var(--dmc-muted-light);
  border-style: dashed;
}

/* ACCESSIBILITÀ */

.battaglia-dmc :is(button, input, select, summary):focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 1050px) {
  .griglia-combattenti {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .griglia-combattenti {
    grid-template-columns: 1fr;
  }

  .barra-comando {
    padding: 10px;
  }

  .barra-navigazione {
    align-items: stretch;
  }

  .controlli-turno {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .menu-iniziativa {
    grid-column: 1 / -1;
  }

  .chip-iniziativa {
    max-width: 155px;
  }

  .riga-iniziativa {
    gap: 6px;
    padding: 6px;
  }

  .nome-iniziativa {
    gap: 5px;
  }

  .tipo {
    min-width: 42px;
  }

  .battaglia-dmc .valore-iniziativa input {
    width: 51px;
  }

  .dado {
    min-width: 41px;
    padding: 6px;
  }
}

@media (max-width: 380px) {
  .aggiungi-condizione {
    grid-template-columns: minmax(0, 1fr) 60px 32px;
    gap: 4px;
  }

  .condizioni-riepilogo {
    gap: 5px;
  }

  .condizioni-titolo {
    font-size: 11px;
  }
}

/* MOVIMENTO RIDOTTO */

@media (prefers-reduced-motion: reduce) {
  .pulsante,
  .chip-iniziativa,
  .condizioni-chevron {
    transition: none;
  }
}
</style>
