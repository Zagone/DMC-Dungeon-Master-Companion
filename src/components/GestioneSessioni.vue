<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import CreazioneAssistitaCampagna from './CreazioneAssistitaCampagna.vue'
import RegistroPNCampagna from './RegistroPNCampagna.vue'
import StrumentiOpzionaliSessione from './StrumentiOpzionaliSessione.vue'
import ImpostazioniSessione from './ImpostazioniSessione.vue'
import EditorDettagliScena from './EditorDettagliScena.vue'
import ConduzioneSessione from './ConduzioneSessione.vue'
import { preparaSessione as normalizzaSessione } from '../dati/preparazioneSessioni.js'
import { valutaIncontro } from '../dati/valutazioneIncontro.js'

import {
  datiCampagna,
  idUnivoco,
  conduzioneAttiva,
  avviaConduzione,
  interrompiConduzione,
} from '../stato/statoDatiCampagna.js'

import { creatureBestiario, risolviVoceIncontro } from '../stato/statoBestiario.js'

import {
  copiaDati,
  creaIstanza,
  testoRicercaCreatura,
  utilizzabile,
} from '../dati/modelloCreatura.js'

const emit = defineEmits(['vai-battaglia'])

const dati = computed(() => datiCampagna.value)

const sessioneInConduzione = computed(() => conduzioneAttiva.value?.sessione || null)

const sessioneApertaId = ref(null)
// Navigazione locale: non modifica i dati persistenti della sessione.
const sezionePreparazione = ref({})
const scenaApertaId = ref(null)
const scenaConsultataId = ref(null)
const passoApertoId = ref(null)
const schedaSupporto = ref(null)
const conferma = ref(null)
const messaggio = ref('')
const nuovaSessione = ref('')
const ricercaCreatura = ref('')
const creaturaSelezionataId = ref('')
const quantitaCreatura = ref(1)

// =====================================================
// UTILITÀ
// =====================================================

const normalizza = (valore) =>
  String(valore || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('it')

const titoloScena = (scena, indice) => scena?.titolo?.trim() || `Scena ${indice + 1}`

const testoIndizio = (voce) => (typeof voce === 'string' ? voce : String(voce?.testo || ''))

const nomeCreatura = (voce) =>
  risolviVoceIncontro(voce)?.nome || voce.nome || 'Creatura non disponibile'

function dataBreve(data) {
  if (!data) return 'Nessuna data'

  const valore = new Date(`${data}T12:00:00`)

  return Number.isNaN(valore.getTime()) ? 'Data non valida' : valore.toLocaleDateString('it-IT')
}

function sposta(lista, indice, direzione) {
  const destinazione = indice + direzione

  if (destinazione < 0 || destinazione >= lista.length) {
    return
  }

  const [voce] = lista.splice(indice, 1)
  lista.splice(destinazione, 0, voce)
}

// =====================================================
// NORMALIZZAZIONE DEI DATI
// =====================================================

function preparaSessione(sessione) {
  normalizzaSessione(sessione, idUnivoco, dati.value?.personaggi?.length || 4)
}

function preparaCampagna() {
  if (!dati.value) return

  if (!Array.isArray(dati.value.pngNarrativi)) {
    dati.value.pngNarrativi = []
  }

  for (const sessione of dati.value.sessioni || []) {
    preparaSessione(sessione)
  }
}

// =====================================================
// PNG DELLA CAMPAGNA
// =====================================================

const pngScena = (scena) =>
  (dati.value?.pngNarrativi || []).filter((png) => (scena?.pngIds || []).includes(png.id))

// =====================================================
// PREPARAZIONE DELLE SESSIONI
// =====================================================

function creaSessione() {
  const titolo = nuovaSessione.value.trim()

  if (!titolo || !dati.value) return

  const sessione = {
    id: idUnivoco(),
    titolo,
    data: '',
    stato: 'preparazione',
    obiettivi: '',
    resoconto: '',
    pgPrevisti: dati.value.personaggi?.length || 4,
    livelloPrevisto: 2,
    scenaAttivaId: null,
    sceneVisitateIds: [],
    risorseNarrative: [],
    rituale: {
      descrizione: '',
      partecipanti: [],
    },
    scene: [],
  }

  dati.value.sessioni.push(sessione)

  sessioneApertaId.value = sessione.id
  sezionePreparazione.value[sessione.id] = 'base'
  nuovaSessione.value = ''

  // L'editor appena creato è ora subito sotto al modulo di creazione.
  // Portiamo il focus sulla scheda, senza richiedere una ricerca manuale.
  nextTick(() => {
    const elemento = document.getElementById('dmc-sessione-' + sessione.id)
    elemento?.focus({ preventScroll: true })
    elemento?.scrollIntoView({ block: 'start', behavior: 'smooth' })
  })
}

function creaScena(sessione) {
  preparaSessione(sessione)

  const scena = {
    id: idUnivoco(),
    titolo: '',
    orario: '',
    descrizione: '',
    note: '',
    alternativa: '',
    personaggi: '',
    guida: [],
    indizi: [],
    pngIds: [],
    mostraRituale: false,

    incontro: {
      nemici: [],
      opzionale: false,
      richiedeCreature: [],
      suggerimentiPF: [],
      noteBilanciamento: '',
    },
  }

  sessione.scene.push(scena)
  scenaApertaId.value = scena.id
}

function eliminaScena(sessione, scena) {
  sessione.scene = sessione.scene.filter((elemento) => elemento.id !== scena.id)

  sessione.sceneVisitateIds = (sessione.sceneVisitateIds || []).filter((id) => id !== scena.id)

  for (const elemento of sessione.risorseNarrative || []) {
    elemento.sceneIds = (elemento.sceneIds || []).filter((id) => id !== scena.id)
  }

  if (sessione.scenaAttivaId === scena.id) {
    sessione.scenaAttivaId = sessione.scene[0]?.id || null

    if (!sessione.scenaAttivaId) {
      interrompiConduzione(sessione.id)
    }
  }

  if (scenaConsultataId.value === scena.id) {
    scenaConsultataId.value = null
  }

  if (scenaApertaId.value === scena.id) {
    scenaApertaId.value = null
  }

  conferma.value = null
}

function eliminaSessione(sessione) {
  interrompiConduzione(sessione.id)

  dati.value.sessioni = dati.value.sessioni.filter((elemento) => elemento.id !== sessione.id)

  if (sessioneApertaId.value === sessione.id) {
    sessioneApertaId.value = null
  }

  conferma.value = null
}

// =====================================================
// CONDUZIONE
// =====================================================

const scenaConsultata = (sessione) =>
  sessione.scene.find((scena) => scena.id === scenaConsultataId.value) ||
  sessione.scene.find((scena) => scena.id === sessione.scenaAttivaId) ||
  sessione.scene[0] ||
  null

const indiceConsultato = (sessione) =>
  sessione.scene.findIndex((scena) => scena.id === scenaConsultata(sessione)?.id)

const scenaVisitata = (sessione, id) => (sessione.sceneVisitateIds || []).includes(id)

const numeroSceneVisitate = (sessione) =>
  sessione.scene.filter((scena) => scenaVisitata(sessione, scena.id)).length

function titoloScenaId(sessione, id) {
  const indice = sessione.scene.findIndex((scena) => scena.id === id)

  return indice < 0 ? 'Nessuna scena' : titoloScena(sessione.scene[indice], indice)
}

function focalizzaGuida(scena) {
  passoApertoId.value =
    scena?.guida?.find((passo) => !passo.completato && (passo.narrazione || passo.condizione))
      ?.id || null

  schedaSupporto.value = null
}

function consultaScena(sessione, id) {
  const scena = sessione.scene.find((elemento) => elemento.id === id)

  if (!scena) return

  // Consultare una scena non modifica quella dei PG.
  scenaConsultataId.value = id

  focalizzaGuida(scena)

  conferma.value = null
  messaggio.value = ''
}

function cambiaScena(sessione, direzione) {
  const indice = indiceConsultato(sessione) + direzione

  if (indice >= 0 && indice < sessione.scene.length) {
    consultaScena(sessione, sessione.scene[indice].id)
  }
}

function impostaScenaCorrente(sessione, id) {
  if (!sessione.scene.some((scena) => scena.id === id)) {
    return
  }

  sessione.scenaAttivaId = id
  consultaScena(sessione, id)
}

function impostaVisitata(sessione, id, visitata) {
  if (!sessione.scene.some((scena) => scena.id === id)) {
    return
  }

  const lista = sessione.sceneVisitateIds || []

  sessione.sceneVisitateIds = visitata
    ? [...new Set([...lista, id])]
    : lista.filter((valore) => valore !== id)
}

async function mostraConduzione() {
  await nextTick()

  document.querySelector('[data-conduzione-titolo]')?.focus({
    preventScroll: true,
  })
}

function entraInConduzione(sessione) {
  preparaSessione(sessione)

  if (!sessione.scene.length) {
    messaggio.value = 'Aggiungi almeno una scena alla sessione.'

    return
  }

  if (!sessione.scenaAttivaId) {
    sessione.scenaAttivaId = sessione.scene[0].id
  }

  if (!avviaConduzione(sessione.id)) {
    return
  }

  sessioneApertaId.value = sessione.id

  consultaScena(sessione, sessione.scenaAttivaId)

  mostraConduzione()
}

function esciDaConduzione() {
  const id = sessioneInConduzione.value?.id

  interrompiConduzione(id)

  sessioneApertaId.value = id
  scenaConsultataId.value = null
  conferma.value = null
}

function toggleSupporto(nome) {
  schedaSupporto.value = schedaSupporto.value === nome ? null : nome
}

const elementiScena = (sessione, scena) =>
  (sessione.risorseNarrative || []).filter((elemento) =>
    (elemento.sceneIds || []).includes(scena?.id),
  )

const mostraStati = (sessione, scena) =>
  elementiScena(sessione, scena).length > 0 ||
  (scena?.mostraRituale && (sessione.rituale?.partecipanti || []).length > 0)

const attivitaInCorso = (sessione) =>
  (sessione.rituale?.partecipanti || []).some((partecipante) => partecipante.attivo)

// CORREZIONE DELLA SCHERMATA VUOTA:
// inizializziamo i dati PRIMA del primo rendering.
// onMounted sarebbe troppo tardi se una Conduzione
// fosse già attiva al caricamento della pagina.

watch(
  dati,
  () => {
    preparaCampagna()
  },
  {
    immediate: true,
  },
)

onMounted(() => {
  const sessione = sessioneInConduzione.value

  if (sessione) {
    scenaConsultataId.value = sessione.scenaAttivaId || sessione.scene[0]?.id || null

    focalizzaGuida(scenaConsultata(sessione))
    mostraConduzione()
  }
})

// =====================================================
// BESTIARIO E INCONTRI
// =====================================================

const creatureDisponibili = computed(() =>
  (creatureBestiario.value || [])
    .filter(utilizzabile)
    .filter((creatura) =>
      testoRicercaCreatura(creatura).includes(normalizza(ricercaCreatura.value)),
    )
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
)

const totaleNemici = (scena) =>
  (scena?.incontro?.nemici || []).reduce(
    (totale, voce) =>
      totale + (Number.isInteger(+voce.quantita) && +voce.quantita > 0 ? +voce.quantita : 0),
    0,
  )

function creatureDaCollegare(scena) {
  return (scena?.incontro?.richiedeCreature || []).filter(
    (nome) =>
      !(scena.incontro.nemici || []).some((voce) => {
        const scheda = risolviVoceIncontro(voce)

        return [nomeCreatura(voce), ...(scheda?.aliases || [])].some((alias) =>
          normalizza(alias).includes(normalizza(nome)),
        )
      }),
  )
}

function difficolta(scena, sessione) {
  return valutaIncontro({
    pg: sessione.pgPrevisti,
    livello: sessione.livelloPrevisto,
    nemici: scena?.incontro?.nemici,
    risolviCreatura: risolviVoceIncontro,
    collegamentiMancanti: creatureDaCollegare(scena).length > 0,
  })
}

function aggiungiCreatura(scena) {
  const quantita = Number(quantitaCreatura.value)

  const creatura = creatureDisponibili.value.find(
    (elemento) => elemento.id === creaturaSelezionataId.value,
  )

  if (!creatura || !Number.isInteger(quantita) || quantita < 1 || quantita > 30) {
    messaggio.value = 'Seleziona una creatura e una quantità da 1 a 30.'

    return
  }

  const presente = scena.incontro.nemici.find((voce) => voce.creaturaId === creatura.id)

  if (presente) {
    presente.quantita = Math.min(30, Number(presente.quantita) + quantita)
  } else {
    const suggerimento = scena.incontro.suggerimentiPF.find((voce) =>
      normalizza(creatura.nome).includes(normalizza(voce.nome)),
    )

    scena.incontro.nemici.push({
      creaturaId: creatura.id,
      nome: creatura.nome,
      quantita,
      pfIncontro: suggerimento?.pf || null,
      istantanea: copiaDati(creatura),
    })
  }

  ricercaCreatura.value = ''
  creaturaSelezionataId.value = ''
  quantitaCreatura.value = 1
  messaggio.value = ''
}

function richiediCaricamento(scena) {
  if (creatureDaCollegare(scena).length || !totaleNemici(scena)) {
    messaggio.value = 'Prima completa l’incontro e collega le creature richieste.'

    return
  }

  conferma.value = `carica-${scena.id}`
}

function caricaIncontro(scena) {
  if (creatureDaCollegare(scena).length) return

  const istanze = []
  const nomi = new Set()

  for (const voce of scena.incontro.nemici) {
    const creatura = risolviVoceIncontro(voce)
    const quantita = Number(voce.quantita)

    if (!utilizzabile(creatura) || !Number.isInteger(quantita) || quantita < 1 || quantita > 30) {
      messaggio.value = 'Una o più creature non sono utilizzabili.'

      return
    }

    for (let i = 0; i < quantita; i++) {
      let numero = 1
      let nome = `${creatura.nome} ${numero}`

      while (nomi.has(nome)) {
        nome = `${creatura.nome} ${++numero}`
      }

      const istanza = creaIstanza(creatura, nome)
      const pf = Number(voce.pfIncontro)

      if (
        voce.pfIncontro != null &&
        voce.pfIncontro !== '' &&
        Number.isInteger(pf) &&
        pf > 0 &&
        pf <= 999
      ) {
        istanza.pf = pf
        istanza.pfMax = pf
      }

      istanze.push(istanza)
      nomi.add(nome)
    }
  }

  if (!istanze.length) return

  // Sostituiamo solo i nemici.
  // PG e partecipanti alle attività monitorate
  // non vengono modificati.

  dati.value.nemici = istanze

  // Il caricamento da una scena avvia un nuovo combattimento:
  // azzera il round e le iniziative, ma conserva PF e condizioni dei PG.
  dati.value.iniziativa = {
    round: 1,
    turnoAttivo: null,
  }

  for (const personaggio of dati.value.personaggi) {
    personaggio.iniziativa = null
  }

  conferma.value = null

  messaggio.value = `${istanze.length} nemici caricati.`

  emit('vai-battaglia')
}
</script>

<template>
  <section class="sessioni-dmc">
    <!-- ==========================================
         CONDUZIONE
    =========================================== -->

    <ConduzioneSessione
      v-if="sessioneInConduzione"
      :sessione-in-conduzione="sessioneInConduzione"
      v-model:passo-aperto-id="passoApertoId"
      :scheda-supporto="schedaSupporto"
      v-model:conferma-corrente="conferma"
      :messaggio="messaggio"
      @aggiorna-resoconto="sessioneInConduzione.resoconto = $event"
      :titolo-scena="titoloScena"
      :titolo-scena-id="titoloScenaId"
      :scena-visitata="scenaVisitata"
      :numero-scene-visitate="numeroSceneVisitate"
      :scena-consultata="scenaConsultata"
      :indice-consultato="indiceConsultato"
      :consulta-scena="consultaScena"
      :cambia-scena="cambiaScena"
      :imposta-scena-corrente="impostaScenaCorrente"
      :imposta-visitata="impostaVisitata"
      :toggle-supporto="toggleSupporto"
      :elementi-scena="elementiScena"
      :mostra-stati="mostraStati"
      :attivita-in-corso="attivitaInCorso"
      :png-scena="pngScena"
      :testo-indizio="testoIndizio"
      :totale-nemici="totaleNemici"
      :creature-da-collegare="creatureDaCollegare"
      :difficolta="difficolta"
      :richiedi-caricamento="richiediCaricamento"
      :carica-incontro="caricaIncontro"
      :nome-creatura="nomeCreatura"
      :esci-da-conduzione="esciDaConduzione"
    />

    <!-- ==========================================
         PREPARAZIONE
    =========================================== -->

    <template v-else>
      <header class="intestazione testata-preparazione">
        <div>
          <h2>Sessioni</h2>

          <p>Prepara le scene e le informazioni per la conduzione.</p>
        </div>

        <small>
          {{ dati?.sessioni?.length || 0 }}
          sessioni
        </small>
      </header>

      <!-- NUOVA SESSIONE -->

      <form class="nuova-sessione" @submit.prevent="creaSessione">
        <label class="campo-flessibile">
          Nuova sessione

          <input
            v-model="nuovaSessione"
            class="dmc-campo"
            required
            maxlength="150"
            placeholder="Titolo della sessione"
          />
        </label>

        <button type="submit" class="dmc-btn">+ Crea sessione</button>
      </form>

      <!-- ELENCO DELLE SESSIONI -->

      <p v-if="!dati?.sessioni?.length" class="testo-secondario">Non ci sono ancora sessioni.</p>

      <article
        v-for="(sessione, indiceSessione) in dati?.sessioni || []"
        :key="sessione.id"
        :id="'dmc-sessione-' + sessione.id"
        tabindex="-1"
        class="scheda-sessione dmc-pannello"
      >
        <header class="intestazione">
          <div>
            <small>
              SESSIONE {{ indiceSessione + 1 }}
              ·
              {{ dataBreve(sessione.data) }}
            </small>

            <h3>
              {{ sessione.titolo || 'Sessione senza titolo' }}
            </h3>
          </div>

          <div class="azioni">
            <button
              v-if="sessione.scene.length"
              type="button"
              class="dmc-btn"
              @click="entraInConduzione(sessione)"
            >
              Conduci
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              @click="sessioneApertaId = sessioneApertaId === sessione.id ? null : sessione.id"
            >
              {{ sessioneApertaId === sessione.id ? 'Chiudi' : 'Prepara' }}
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--danger"
              @click="conferma = `s-${sessione.id}`"
            >
              Elimina
            </button>
          </div>
        </header>

        <div v-if="conferma === `s-${sessione.id}`" class="conferma">
          Eliminare la sessione e tutte le sue scene?

          <div class="azioni">
            <button
              type="button"
              class="dmc-btn dmc-btn--danger"
              @click="eliminaSessione(sessione)"
            >
              Conferma
            </button>

            <button type="button" class="dmc-btn dmc-btn--secondary" @click="conferma = null">
              Annulla
            </button>
          </div>
        </div>

        <!-- EDITOR SESSIONE -->

        <div v-if="sessioneApertaId === sessione.id" class="editor-sessione">
          <nav class="passi-preparazione" aria-label="Preparazione della sessione">
            <button
              v-for="passo in [
                { id: 'base', nome: '1. Impostazioni' },
                { id: 'scene', nome: '2. Scene' },
                { id: 'extra', nome: '3. Strumenti opzionali' },
              ]"
              :key="passo.id"
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :class="{ 'passo-attivo': (sezionePreparazione[sessione.id] || 'base') === passo.id }"
              :aria-current="
                (sezionePreparazione[sessione.id] || 'base') === passo.id ? 'step' : undefined
              "
              @click="sezionePreparazione[sessione.id] = passo.id"
            >
              {{ passo.nome }}
            </button>
          </nav>
          <section
            v-show="(sezionePreparazione[sessione.id] || 'base') === 'base'"
            class="passo-editor"
          >
            <p class="guida-preparazione">
              <strong>Per iniziare:</strong> definisci data, numero e livello dei personaggi, poi
              scrivi che cosa vorresti accadesse nella sessione. Il resoconto si può completare dopo
              aver giocato.
            </p>
            <ImpostazioniSessione
              :sessione="sessione"
              @aggiorna-campo="sessione[$event.campo] = $event.valore"
            />
            <div class="navigazione-preparazione">
              <button
                type="button"
                class="dmc-btn"
                @click="sezionePreparazione[sessione.id] = 'scene'"
              >
                Continua: prepara le scene →
              </button>
            </div>
          </section>
          <section v-show="sezionePreparazione[sessione.id] === 'scene'" class="passo-editor">
            <p class="guida-preparazione">
              <strong>Costruisci la sessione:</strong> aggiungi una scena per ogni momento
              significativo. Per ciascuna indica cosa accade, eventuali indizi e incontri. Puoi
              tornare a modificarle in qualsiasi momento.
            </p>
            <!-- SCENE -->

            <div class="intestazione">
              <h4>Scene · {{ sessione.scene.length }}</h4>

              <button type="button" class="dmc-btn" @click="creaScena(sessione)">
                + Nuova scena
              </button>
            </div>

            <article v-for="(scena, indice) in sessione.scene" :key="scena.id" class="scena-editor">
              <header class="intestazione">
                <div>
                  <small> SCENA {{ indice + 1 }} </small>

                  <h4>
                    {{ titoloScena(scena, indice) }}
                  </h4>
                </div>

                <div class="azioni">
                  <button
                    type="button"
                    class="dmc-btn dmc-btn--secondary"
                    :disabled="indice === 0"
                    :aria-label="`Sposta ${titoloScena(scena, indice)} su`"
                    @click="sposta(sessione.scene, indice, -1)"
                  >
                    ↑
                  </button>

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--secondary"
                    :disabled="indice === sessione.scene.length - 1"
                    :aria-label="`Sposta ${titoloScena(scena, indice)} giù`"
                    @click="sposta(sessione.scene, indice, 1)"
                  >
                    ↓
                  </button>

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--secondary"
                    @click="scenaApertaId = scenaApertaId === scena.id ? null : scena.id"
                  >
                    {{ scenaApertaId === scena.id ? 'Chiudi' : 'Modifica' }}
                  </button>

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--danger"
                    @click="conferma = `sc-${scena.id}`"
                  >
                    Elimina
                  </button>
                </div>
              </header>

              <div v-if="conferma === `sc-${scena.id}`" class="conferma">
                Eliminare questa scena?

                <div class="azioni">
                  <button
                    type="button"
                    class="dmc-btn dmc-btn--danger"
                    @click="eliminaScena(sessione, scena)"
                  >
                    Conferma
                  </button>

                  <button type="button" class="dmc-btn dmc-btn--secondary" @click="conferma = null">
                    Annulla
                  </button>
                </div>
              </div>

              <!-- EDITOR SCENA -->

              <EditorDettagliScena
                v-if="scenaApertaId === scena.id"
                :modello-scena="scena"
                :sessione="sessione"
                :dati="dati"
                :creature-disponibili="creatureDisponibili"
                :difficolta="difficolta"
                :totale-nemici="totaleNemici"
                :creature-da-collegare="creatureDaCollegare"
                :nome-creatura="nomeCreatura"
                :aggiungi-creatura="aggiungiCreatura"
                v-model:ricerca="ricercaCreatura"
                v-model:selezione-creatura="creaturaSelezionataId"
                v-model:quantita="quantitaCreatura"
                @aggiorna-scena="scena[$event.campo] = $event.valore"
              />
            </article>
            <div class="navigazione-preparazione">
              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                @click="sezionePreparazione[sessione.id] = 'base'"
              >
                ← Impostazioni
              </button>
              <button
                type="button"
                class="dmc-btn"
                @click="sezionePreparazione[sessione.id] = 'extra'"
              >
                Strumenti opzionali →
              </button>
            </div>
          </section>
          <section v-show="sezionePreparazione[sessione.id] === 'extra'" class="passo-editor">
            <StrumentiOpzionaliSessione
              :sessione="sessione"
              @aggiorna-descrizione="sessione.rituale.descrizione = $event"
            />
            <div class="navigazione-preparazione">
              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                @click="sezionePreparazione[sessione.id] = 'scene'"
              >
                ← Torna alle scene
              </button>
            </div>
          </section>
        </div>
      </article>

      <!-- STRUMENTI SECONDARI: dopo la preparazione delle sessioni. -->
      <details class="dmc-pannello" style="margin: 16px 0">
        <summary style="padding: 16px; cursor: pointer; color: var(--dmc-amber)">
          Crea sessioni con ChatGPT
        </summary>
        <CreazioneAssistitaCampagna modalita="sessioni" />
      </details>

      <!-- Il registro PNG mantiene il collegamento al Bestiario e alle scene. -->
      <RegistroPNCampagna v-if="dati" :dati="dati" />

      <p v-if="messaggio" class="messaggio" role="status">
        {{ messaggio }}
      </p>
    </template>
  </section>
</template>

<style scoped>
.sessioni-dmc {
  display: grid;
  gap: 15px;
  min-width: 0;
  color: var(--dmc-cream);
}

.sessioni-dmc :is(h2, h3, h4, p) {
  margin: 0;
}

.sessioni-dmc :is(h2, h3, h4) {
  color: var(--dmc-amber);
}

.sessioni-dmc small,
.testo-secondario {
  color: var(--dmc-muted);
}

.intestazione,
.azioni {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.azioni {
  justify-content: flex-start;
}

.sessioni-dmc label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--dmc-muted);
  font-size: 13px;
}

.sessioni-dmc .dmc-campo {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sessioni-dmc textarea {
  resize: vertical;
  line-height: 1.55;
}

.sessioni-dmc .check-inline,
.sessioni-dmc .check-passo {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.sessioni-dmc input[type='checkbox'] {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  margin: 0;
  accent-color: var(--dmc-amber);
}

.sessioni-dmc .dmc-btn {
  padding: 8px 12px;
}

.campo-flessibile {
  flex: 1;
  min-width: 180px;
}

.testo-pre,
.testo-narrativo {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.7;
}

.testo-narrativo {
  color: var(--dmc-cream);
  font-size: 16px;
}

.attenzione {
  color: var(--dmc-rust-text);
}

.conferma {
  border: 1px solid var(--dmc-rust);
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.conferma p {
  margin: 0;
}

.messaggio {
  padding: 10px 12px;
  color: var(--dmc-amber);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
}

/* ==========================================
   PREPARAZIONE
========================================== */

.testata-preparazione {
  padding-bottom: 5px;
}

.nuova-sessione,
.riga-editor {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 10px;
}

.registro-png,
.scheda-sessione {
  padding: 15px 17px;
}

.registro-png summary,
.editor-espandibile summary {
  cursor: pointer;
  color: var(--dmc-amber);
  font-weight: 600;
}

.registro-png summary small,
.editor-espandibile summary small {
  margin-left: 8px;
  font-weight: 400;
}

.interno-details,
.editor-sessione,
.editor-scena,
.editor-guida,
.scheda-secondaria {
  display: grid;
  gap: 12px;
}

.interno-details {
  padding-top: 13px;
}

.scheda-sessione {
  display: grid;
  gap: 13px;
}

.scheda-sessione h3 {
  font-size: 21px;
}

.editor-sessione {
  border-top: 1px solid var(--dmc-border-soft);
  padding-top: 14px;
}

.editor-espandibile,
.scena-editor,
.scheda-secondaria,
.editor-guida {
  padding: 13px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-surface-soft);
}

.scena-editor {
  display: grid;
  gap: 12px;
}

.editor-scena {
  border-top: 1px solid var(--dmc-border-soft);
  padding-top: 12px;
}

.griglia-campi {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.griglia-campi label:nth-child(n + 5) {
  grid-column: 1 / -1;
}

.riga-guida-editor {
  display: grid;
  gap: 6px;
  padding: 9px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 7px;
}

.riga-guida-editor .riga-editor {
  align-items: end;
}

.dettagli-editor summary {
  cursor: pointer;
  font-size: 13px;
  color: var(--dmc-muted);
}

.collegamenti {
  display: grid;
  gap: 8px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 6px;
}

.collegamenti legend {
  color: var(--dmc-amber);
}

.composizione-incontro {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 90px auto;
  align-items: end;
  gap: 9px;
}

/* RESPONSIVE */

@media (max-width: 650px) {
  .griglia-campi {
    grid-template-columns: 1fr;
  }

  .griglia-campi label {
    grid-column: 1 / -1;
  }

  .composizione-incontro {
    grid-template-columns: minmax(0, 1fr) 75px;
  }

  .composizione-incontro > button {
    grid-column: 1 / -1;
  }

}

/* Percorso guidato della preparazione, senza alterare il modello dati. */
.passi-preparazione {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.passi-preparazione .dmc-btn {
  white-space: normal;
  text-align: center;
  min-height: 44px;
}
.passi-preparazione .passo-attivo {
  border-color: var(--dmc-amber);
  color: var(--dmc-amber-light);
  background: var(--dmc-surface-soft);
}
.passo-editor {
  display: grid;
  gap: 12px;
  min-width: 0;
}
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
.navigazione-preparazione {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 8px;
  padding-top: 8px;
}
@media (max-width: 650px) {
  .passi-preparazione {
    grid-template-columns: 1fr;
  }
  .navigazione-preparazione .dmc-btn {
    flex: 1 1 auto;
  }
}
</style>
