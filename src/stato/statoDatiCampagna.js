
import { computed, ref, watch } from 'vue'
import { fissaIncontri } from './statoBestiario.js'

const PREFISSO = 'dmc_dati_campagna_v1_'

export const campagnaDatiId = ref(null)
export const datiCampagna = ref(null)
export const erroreDatiCampagna = ref('')
export const letturaCampagnaFallita = ref(false)

let caricamento = false

export const conduzioneAttiva = computed(() => {
  const dati = datiCampagna.value
  const sessioneId = dati?.conduzione?.sessioneId

  if (typeof sessioneId !== 'string' || !sessioneId) return null

  const sessione = dati?.sessioni?.find(
    s => s?.id === sessioneId
  )

  if (!sessione || !Array.isArray(sessione.scene)) return null

  const indice = sessione.scene.findIndex(
    s => s?.id && s.id === sessione.scenaAttivaId
  )

  if (indice < 0) return null

  return {
    sessione,
    scena: sessione.scene[indice],
    indice
  }
})

export function avviaConduzione(sessioneId) {
  if (typeof sessioneId !== 'string' || !sessioneId) return false

  const dati = datiCampagna.value
  const sessione = dati?.sessioni?.find(s => s?.id === sessioneId)

  if (!sessione || !Array.isArray(sessione.scene)) return false

  const scena =
    sessione.scene.find(s => s?.id && s.id === sessione.scenaAttivaId) ||
    sessione.scene.find(s => s?.id)

  if (!scena) return false

  sessione.scenaAttivaId = scena.id
  dati.conduzione = { sessioneId: sessione.id }

  return true
}

export function interrompiConduzione(sessioneId) {
  const dati = datiCampagna.value

  if (dati?.conduzione?.sessioneId === sessioneId) {
    dati.conduzione = null
  }
}

export function idUnivoco() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `dmc-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function datiVuoti() {
  return {
    versione: 1,
    personaggi: [],
    nemici: [],
    iniziativa: {
      round: 1,
      turnoAttivo: null
    },
    sessioni: [],
    pngNarrativi: [],
    conduzione: null,
    note: '',
    bottino: []
  }
}

function normalizzaBottino(elementi) {
  if (!Array.isArray(elementi)) return []

  const ids = new Set()

  return elementi
    .filter(
      elemento =>
        elemento &&
        typeof elemento === 'object' &&
        !Array.isArray(elemento)
    )
    .map((elemento, indice) => {
      const numero = Number(elemento.quantita)
      const valuta = String(elemento.valuta ?? '')

      return {
        id: String(elemento.id || `bottino-${indice}`),
        descrizione:
          typeof elemento.descrizione === 'string'
            ? elemento.descrizione
            : '',
        quantita:
          Number.isFinite(numero) && numero >= 0
            ? Math.floor(numero)
            : 0,
        valuta: ['mo', 'ma', 'mr', ''].includes(valuta)
          ? valuta
          : '',
        raccolta: elemento.raccolta === true
      }
    })
    .filter(elemento => {
      if (ids.has(elemento.id)) return false

      ids.add(elemento.id)
      return true
    })
}

function normalizzaDati(dati) {
  const base = datiVuoti()

  if (!dati || typeof dati !== 'object' || Array.isArray(dati)) {
    return base
  }

  return {
    ...base,
    ...dati,
    versione: 1,

    personaggi: Array.isArray(dati.personaggi)
      ? dati.personaggi
      : [],

    nemici: Array.isArray(dati.nemici)
      ? dati.nemici
      : [],

    iniziativa: {
      round:
        Number.isInteger(dati.iniziativa?.round) &&
        dati.iniziativa.round > 0
          ? dati.iniziativa.round
          : 1,
      turnoAttivo:
        typeof dati.iniziativa?.turnoAttivo === 'string'
          ? dati.iniziativa.turnoAttivo
          : null
    },

    sessioni: Array.isArray(dati.sessioni)
      ? dati.sessioni
      : [],

    pngNarrativi: Array.isArray(dati.pngNarrativi)
      ? dati.pngNarrativi
      : [],

    conduzione:
      dati.conduzione &&
      typeof dati.conduzione.sessioneId === 'string'
        ? { sessioneId: dati.conduzione.sessioneId }
        : null,

    note: String(dati.note || ''),
    bottino: normalizzaBottino(dati.bottino)
  }
}

export function salvaDatiCampagna() {
  const id = campagnaDatiId.value

  if (
    !id ||
    !datiCampagna.value ||
    letturaCampagnaFallita.value
  ) {
    return false
  }

  try {
    localStorage.setItem(
      PREFISSO + id,
      JSON.stringify(datiCampagna.value)
    )

    erroreDatiCampagna.value = ''
    return true
  } catch (errore) {
    erroreDatiCampagna.value =
      'La campagna non è stata salvata. Controlla lo spazio disponibile e riprova prima di uscire.'

    console.warn('Salvataggio campagna fallito:', errore)
    return false
  }
}

export function apriDatiCampagna(id) {
  if (!id || typeof id !== 'string') return false

  if (
    campagnaDatiId.value &&
    !letturaCampagnaFallita.value &&
    !salvaDatiCampagna()
  ) {
    return false
  }

  caricamento = true
  letturaCampagnaFallita.value = false
  erroreDatiCampagna.value = ''

  let dati = datiVuoti()

  try {
    const contenuto = localStorage.getItem(PREFISSO + id)

    if (contenuto !== null) {
      const originale = JSON.parse(contenuto)

      if (
        !originale ||
        typeof originale !== 'object' ||
        Array.isArray(originale)
      ) {
        throw new Error('Formato non valido')
      }

      for (const campo of [
        'personaggi',
        'nemici',
        'sessioni',
        'bottino'
      ]) {
        if (
          originale[campo] !== undefined &&
          !Array.isArray(originale[campo])
        ) {
          throw new Error(`Formato ${campo} non valido`)
        }
      }

      if (
        originale.pngNarrativi !== undefined &&
        !Array.isArray(originale.pngNarrativi)
      ) {
        throw new Error('Formato PNG non valido')
      }

      if (
        originale.note !== undefined &&
        typeof originale.note !== 'string'
      ) {
        throw new Error('Note non valide')
      }

      dati = normalizzaDati(originale)
    }

    fissaIncontri(dati)
  } catch {
    letturaCampagnaFallita.value = true

    erroreDatiCampagna.value =
      'I dati della campagna non sono leggibili. Il contenuto originale è stato conservato; la modifica è sospesa.'
  }

  campagnaDatiId.value = id
  datiCampagna.value = dati
  caricamento = false

  return !letturaCampagnaFallita.value
}

export function chiudiDatiCampagna() {
  if (
    campagnaDatiId.value &&
    !letturaCampagnaFallita.value &&
    !salvaDatiCampagna()
  ) {
    return false
  }

  caricamento = true
  campagnaDatiId.value = null
  datiCampagna.value = null
  caricamento = false

  return true
}

export function eliminaDatiCampagna(id) {
  if (campagnaDatiId.value === id) {
    if (!chiudiDatiCampagna()) return false
  }

  try {
    localStorage.removeItem(PREFISSO + id)
    return true
  } catch {
    return false
  }
}

// Raggruppa le mutazioni reattive dello stesso ciclo di aggiornamento
// in un'unica scrittura, senza introdurre ritardi temporizzati.
watch(
  datiCampagna,
  () => {
    if (!caricamento) salvaDatiCampagna()
  },
  {
    deep: true,
    flush: 'post'
  }
)

// I salvataggi espliciti in uscita dalle rotte restano attivi.
// In caso di chiusura/ricaricamento della scheda, tenta un ultimo
// salvataggio sincrono mentre la pagina è ancora disponibile.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', () => {
    if (!letturaCampagnaFallita.value && campagnaDatiId.value) {
      salvaDatiCampagna()
    }
  })
}
