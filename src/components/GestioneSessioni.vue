
<script setup>
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import CreazioneAssistitaCampagna from './CreazioneAssistitaCampagna.vue'

import {
  datiCampagna,
  idUnivoco,
  conduzioneAttiva,
  avviaConduzione,
  interrompiConduzione,
} from '../stato/statoDatiCampagna.js'

import {
  creatureBestiario,
  pngPersonalizzati,
  risolviVoceIncontro,
} from '../stato/statoBestiario.js'
import { collegaPNGDaBestiario } from '../dati/collegamentoPNG.js'

import {
  copiaDati,
  creaIstanza,
  testoRicercaCreatura,
  utilizzabile,
} from '../dati/modelloCreatura.js'

const emit = defineEmits(['vai-battaglia'])

const dati = computed(() => datiCampagna.value)

const sessioneInConduzione = computed(
  () => conduzioneAttiva.value?.sessione || null
)

const sessioneApertaId = ref(null)
const scenaApertaId = ref(null)
const scenaConsultataId = ref(null)
const passoApertoId = ref(null)
const schedaSupporto = ref(null)
const titoloConduzione = ref(null)
const conferma = ref(null)
const messaggio = ref('')
const nuovaSessione = ref('')
const nuovoPNG = ref('')
const pngBestiarioSelezionato = ref('')
const messaggioPNG = ref('')
const pngApertoId = ref(null)
const ricercaCreatura = ref('')
const creaturaSelezionataId = ref('')
const quantitaCreatura = ref(1)

// Soglie SRD 5.2.1: bassa, moderata, alta.
const sogliePerPG = {
  1: [50, 75, 100],
  2: [100, 150, 200],
  3: [150, 225, 400],
  4: [250, 375, 500],
  5: [500, 750, 1100],
  6: [600, 1000, 1400],
  7: [750, 1300, 1700],
  8: [1000, 1700, 2100],
  9: [1300, 2000, 2600],
  10: [1600, 2300, 3100],
  11: [1900, 2900, 4100],
  12: [2200, 3700, 4700],
  13: [2600, 4200, 5400],
  14: [2900, 4900, 6200],
  15: [3300, 5400, 7800],
  16: [3800, 6100, 9800],
  17: [4500, 7200, 11700],
  18: [5000, 8700, 14200],
  19: [5500, 10700, 17200],
  20: [6400, 13200, 22000],
}

// =====================================================
// UTILITÀ
// =====================================================

const normalizza = valore =>
  String(valore || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('it')

const titoloScena = (scena, indice) =>
  scena?.titolo?.trim() || `Scena ${indice + 1}`

const testoIndizio = voce =>
  typeof voce === 'string'
    ? voce
    : String(voce?.testo || '')

const nomeCreatura = voce =>
  risolviVoceIncontro(voce)?.nome ||
  voce.nome ||
  'Creatura non disponibile'

function dataBreve(data) {
  if (!data) return 'Nessuna data'

  const valore = new Date(`${data}T12:00:00`)

  return Number.isNaN(valore.getTime())
    ? 'Data non valida'
    : valore.toLocaleDateString('it-IT')
}

function aggiungi(lista, valori) {
  lista.push({
    id: idUnivoco(),
    ...valori,
  })
}

function rimuovi(lista, id) {
  const indice = lista.findIndex(voce => voce.id === id)

  if (indice >= 0) {
    lista.splice(indice, 1)
  }
}

function sposta(lista, indice, direzione) {
  const destinazione = indice + direzione

  if (
    destinazione < 0 ||
    destinazione >= lista.length
  ) {
    return
  }

  const [voce] = lista.splice(indice, 1)
  lista.splice(destinazione, 0, voce)
}

// =====================================================
// NORMALIZZAZIONE DEI DATI
// =====================================================

function preparaScena(scena) {
  for (const campo of [
    'titolo',
    'descrizione',
    'note',
    'alternativa',
    'orario',
    'personaggi',
  ]) {
    if (typeof scena[campo] !== 'string') {
      scena[campo] = ''
    }
  }

  // Conversione dei dati precedenti.
  // Eventi e fasi confluiscono nella guida unica.
  // I campi originali non vengono cancellati.

  if (!Array.isArray(scena.guida)) {
    const eventi = Array.isArray(scena.eventi)
      ? scena.eventi
      : []

    const compiti =
      !eventi.length && Array.isArray(scena.compiti)
        ? scena.compiti
        : []

    const fasi = Array.isArray(scena.fasi)
      ? scena.fasi
      : []

    scena.guida = [
      ...eventi.map(evento => ({
        id: evento?.id || idUnivoco(),

        testo:
          typeof evento === 'string'
            ? evento
            : String(evento?.testo || ''),

        condizione: '',
        narrazione: '',
        completato: evento?.completato === true,
      })),

      ...compiti.map(compito => ({
        id: idUnivoco(),
        testo: String(compito),
        condizione: '',
        narrazione: '',
        completato: false,
      })),

      ...fasi.map(fase => ({
        id: fase?.id || idUnivoco(),

        testo: String(
          fase?.titolo || 'Intervento narrativo'
        ),

        condizione: String(fase?.condizione || ''),
        narrazione: String(fase?.narrazione || ''),
        completato: fase?.attivata === true,
      })),
    ]
  }

  scena.guida = scena.guida.filter(
    passo =>
      passo &&
      typeof passo === 'object' &&
      !Array.isArray(passo)
  )

  for (const passo of scena.guida) {
    if (!passo.id) {
      passo.id = idUnivoco()
    }

    if (typeof passo.testo !== 'string') {
      passo.testo = ''
    }

    if (typeof passo.condizione !== 'string') {
      passo.condizione = ''
    }

    if (typeof passo.narrazione !== 'string') {
      passo.narrazione = ''
    }

    if (typeof passo.completato !== 'boolean') {
      passo.completato = false
    }
  }

  if (!Array.isArray(scena.indizi)) {
    scena.indizi = []
  }

  scena.indizi = scena.indizi.map(voce =>
    typeof voce === 'string'
      ? {
          id: idUnivoco(),
          testo: voce,
          rivelato: false,
        }
      : {
          ...voce,
          id: voce.id || idUnivoco(),
          testo: String(voce.testo || ''),
        }
  )

  if (!Array.isArray(scena.pngIds)) {
    scena.pngIds = []
  }

  if (typeof scena.mostraRituale !== 'boolean') {
    scena.mostraRituale = false
  }

  if (
    !scena.incontro ||
    typeof scena.incontro !== 'object'
  ) {
    scena.incontro = {
      nemici: [],
    }
  }

  if (!Array.isArray(scena.incontro.nemici)) {
    scena.incontro.nemici = []
  }

  if (!Array.isArray(scena.incontro.richiedeCreature)) {
    scena.incontro.richiedeCreature = []
  }

  if (!Array.isArray(scena.incontro.suggerimentiPF)) {
    scena.incontro.suggerimentiPF = []
  }

  if (
    typeof scena.incontro.noteBilanciamento !== 'string'
  ) {
    scena.incontro.noteBilanciamento = ''
  }

  if (typeof scena.incontro.opzionale !== 'boolean') {
    scena.incontro.opzionale = false
  }
}

function preparaSessione(sessione) {
  if (!Array.isArray(sessione.scene)) {
    sessione.scene = []
  }

  if (!Array.isArray(sessione.sceneVisitateIds)) {
    sessione.sceneVisitateIds = []
  }

  if (!Array.isArray(sessione.risorseNarrative)) {
    sessione.risorseNarrative = []
  }

  if (
    !sessione.rituale ||
    typeof sessione.rituale !== 'object'
  ) {
    sessione.rituale = {
      descrizione: '',
      partecipanti: [],
    }
  }

  if (!Array.isArray(sessione.rituale.partecipanti)) {
    sessione.rituale.partecipanti = []
  }

  if (typeof sessione.rituale.descrizione !== 'string') {
    sessione.rituale.descrizione = ''
  }

  if (typeof sessione.obiettivi !== 'string') {
    sessione.obiettivi = ''
  }

  if (typeof sessione.resoconto !== 'string') {
    sessione.resoconto = ''
  }

  if (!sessione.stato) {
    sessione.stato = 'preparazione'
  }

  if (
    !Number.isInteger(Number(sessione.pgPrevisti)) ||
    Number(sessione.pgPrevisti) < 1
  ) {
    sessione.pgPrevisti =
      dati.value?.personaggi?.length || 4
  }

  if (!sogliePerPG[Number(sessione.livelloPrevisto)]) {
    sessione.livelloPrevisto = 2
  }

  if (
    !sessione.scene.some(
      scena => scena.id === sessione.scenaAttivaId
    )
  ) {
    sessione.scenaAttivaId = null
  }

  sessione.sceneVisitateIds =
    sessione.sceneVisitateIds.filter(
      id =>
        sessione.scene.some(
          scena => scena.id === id
        )
    )

  for (const scena of sessione.scene) {
    preparaScena(scena)
  }

  // Gli elementi interattivi sono generici
  // e visibili soltanto nelle scene assegnate.

  for (const elemento of sessione.risorseNarrative) {
    if (!elemento.id) {
      elemento.id = idUnivoco()
    }

    if (!Array.isArray(elemento.sceneIds)) {
      elemento.sceneIds = []
    }

    elemento.sceneIds = elemento.sceneIds.filter(
      id =>
        sessione.scene.some(
          scena => scena.id === id
        )
    )

    if (
      !['inattivo', 'pronto', 'utilizzato'].includes(
        elemento.stato
      )
    ) {
      elemento.stato = 'inattivo'
    }
  }

  for (const partecipante of sessione.rituale.partecipanti) {
    if (!partecipante.id) {
      partecipante.id = idUnivoco()
    }

    if (typeof partecipante.attivo !== 'boolean') {
      partecipante.attivo = true
    }
  }
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

function creaPNG() {
  preparaCampagna()

  const nome = nuovoPNG.value.trim()

  if (!nome || !dati.value) return

  const png = {
    id: idUnivoco(),
    nome,
    ruolo: '',
    personalita: '',
    obiettivo: '',
    segreto: '',
    informazioni: '',
    creaturaId: '',
  }

  dati.value.pngNarrativi.push(png)

  pngApertoId.value = png.id
  nuovoPNG.value = ''
}

const pngBestiarioCollegabili = computed(() =>
  (pngPersonalizzati.value || [])
    .filter(p => !(dati.value?.pngNarrativi || []).some(n => n.creaturaId === p.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
)

const pngBestiarioConsultabili = computed(() =>
  (creatureBestiario.value || []).filter(c => c.categoria === 'png')
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it'))
)

function aggiungiPNGDaBestiario() {
  preparaCampagna()
  messaggioPNG.value = ''
  const creatura = pngPersonalizzati.value.find(c => c.id === pngBestiarioSelezionato.value)
  const risultato = collegaPNGDaBestiario(dati.value?.pngNarrativi, creatura, idUnivoco)
  if (!risultato.successo) {
    messaggioPNG.value = risultato.motivo
    return
  }
  pngApertoId.value = risultato.png.id
  pngBestiarioSelezionato.value = ''
  messaggioPNG.value = 'PNG collegato alla campagna. Puoi aggiungere ruolo, personalità e informazioni narrative.'
}

function eliminaPNG(png) {
  dati.value.pngNarrativi =
    dati.value.pngNarrativi.filter(
      elemento => elemento.id !== png.id
    )

  for (const sessione of dati.value.sessioni || []) {
    for (const scena of sessione.scene || []) {
      scena.pngIds =
        (scena.pngIds || []).filter(
          id => id !== png.id
        )
    }
  }

  conferma.value = null
  pngApertoId.value = null
}

const pngScena = scena =>
  (dati.value?.pngNarrativi || []).filter(
    png => (scena?.pngIds || []).includes(png.id)
  )

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
  sessione.scene = sessione.scene.filter(
    elemento => elemento.id !== scena.id
  )

  sessione.sceneVisitateIds =
    (sessione.sceneVisitateIds || []).filter(
      id => id !== scena.id
    )

  for (const elemento of sessione.risorseNarrative || []) {
    elemento.sceneIds =
      (elemento.sceneIds || []).filter(
        id => id !== scena.id
      )
  }

  if (sessione.scenaAttivaId === scena.id) {
    sessione.scenaAttivaId =
      sessione.scene[0]?.id || null

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

  dati.value.sessioni =
    dati.value.sessioni.filter(
      elemento => elemento.id !== sessione.id
    )

  if (sessioneApertaId.value === sessione.id) {
    sessioneApertaId.value = null
  }

  conferma.value = null
}

// =====================================================
// CONDUZIONE
// =====================================================

const scenaConsultata = sessione =>
  sessione.scene.find(
    scena => scena.id === scenaConsultataId.value
  ) ||
  sessione.scene.find(
    scena => scena.id === sessione.scenaAttivaId
  ) ||
  sessione.scene[0] ||
  null

const indiceConsultato = sessione =>
  sessione.scene.findIndex(
    scena =>
      scena.id === scenaConsultata(sessione)?.id
  )

const scenaVisitata = (sessione, id) =>
  (sessione.sceneVisitateIds || []).includes(id)

const numeroSceneVisitate = sessione =>
  sessione.scene.filter(
    scena => scenaVisitata(sessione, scena.id)
  ).length

function titoloScenaId(sessione, id) {
  const indice = sessione.scene.findIndex(
    scena => scena.id === id
  )

  return indice < 0
    ? 'Nessuna scena'
    : titoloScena(sessione.scene[indice], indice)
}

function focalizzaGuida(scena) {
  passoApertoId.value =
    scena?.guida?.find(
      passo =>
        !passo.completato &&
        (passo.narrazione || passo.condizione)
    )?.id || null

  schedaSupporto.value = null
}

function consultaScena(sessione, id) {
  const scena = sessione.scene.find(
    elemento => elemento.id === id
  )

  if (!scena) return

  // Consultare una scena non modifica quella dei PG.
  scenaConsultataId.value = id

  focalizzaGuida(scena)

  conferma.value = null
  messaggio.value = ''
}

function cambiaScena(sessione, direzione) {
  const indice = indiceConsultato(sessione) + direzione

  if (
    indice >= 0 &&
    indice < sessione.scene.length
  ) {
    consultaScena(
      sessione,
      sessione.scene[indice].id
    )
  }
}

function impostaScenaCorrente(sessione, id) {
  if (
    !sessione.scene.some(
      scena => scena.id === id
    )
  ) {
    return
  }

  sessione.scenaAttivaId = id
  consultaScena(sessione, id)
}

function impostaVisitata(sessione, id, visitata) {
  if (
    !sessione.scene.some(
      scena => scena.id === id
    )
  ) {
    return
  }

  const lista = sessione.sceneVisitateIds || []

  sessione.sceneVisitateIds = visitata
    ? [...new Set([...lista, id])]
    : lista.filter(valore => valore !== id)
}

async function mostraConduzione() {
  await nextTick()

  titoloConduzione.value?.focus({
    preventScroll: true,
  })
}

function entraInConduzione(sessione) {
  preparaSessione(sessione)

  if (!sessione.scene.length) {
    messaggio.value =
      'Aggiungi almeno una scena alla sessione.'

    return
  }

  if (!sessione.scenaAttivaId) {
    sessione.scenaAttivaId = sessione.scene[0].id
  }

  if (!avviaConduzione(sessione.id)) {
    return
  }

  sessioneApertaId.value = sessione.id

  consultaScena(
    sessione,
    sessione.scenaAttivaId
  )

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
  schedaSupporto.value =
    schedaSupporto.value === nome
      ? null
      : nome
}

const elementiScena = (sessione, scena) =>
  (sessione.risorseNarrative || []).filter(
    elemento =>
      (elemento.sceneIds || []).includes(scena?.id)
  )

const mostraStati = (sessione, scena) =>
  elementiScena(sessione, scena).length > 0 ||
  (
    scena?.mostraRituale &&
    (sessione.rituale?.partecipanti || []).length > 0
  )

const attivitaInCorso = sessione =>
  (sessione.rituale?.partecipanti || []).some(
    partecipante => partecipante.attivo
  )

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
  }
)

onMounted(() => {
  const sessione = sessioneInConduzione.value

  if (sessione) {
    scenaConsultataId.value =
      sessione.scenaAttivaId ||
      sessione.scene[0]?.id ||
      null

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
    .filter(creatura =>
      testoRicercaCreatura(creatura).includes(
        normalizza(ricercaCreatura.value)
      )
    )
    .sort(
      (a, b) => a.nome.localeCompare(b.nome, 'it')
    )
)

const totaleNemici = scena =>
  (scena?.incontro?.nemici || []).reduce(
    (totale, voce) =>
      totale + (
        Number.isInteger(+voce.quantita) &&
        +voce.quantita > 0
          ? +voce.quantita
          : 0
      ),
    0
  )

function creatureDaCollegare(scena) {
  return (
    scena?.incontro?.richiedeCreature || []
  ).filter(nome =>
    !(scena.incontro.nemici || []).some(voce => {
      const scheda = risolviVoceIncontro(voce)

      return [
        nomeCreatura(voce),
        ...(scheda?.aliases || []),
      ].some(alias =>
        normalizza(alias).includes(normalizza(nome))
      )
    })
  )
}

function difficolta(scena, sessione) {
  const pg = Number(sessione.pgPrevisti)
  const livello = Number(sessione.livelloPrevisto)

  if (
    !Number.isInteger(pg) ||
    pg < 1 ||
    pg > 20 ||
    !sogliePerPG[livello]
  ) {
    return 'Imposta numero e livello dei PG.'
  }

  if (creatureDaCollegare(scena).length) {
    return 'Collega le creature mancanti prima di valutare lo scontro.'
  }

  if (!totaleNemici(scena)) {
    return 'Nessun nemico preparato.'
  }

  let esperienza = 0

  for (const voce of scena.incontro.nemici) {
    const creatura = risolviVoceIncontro(voce)
    const pe = creatura?.puntiEsperienza

    if (
      pe == null ||
      !Number.isFinite(Number(pe))
    ) {
      return 'PE non disponibili: valutazione manuale.'
    }

    esperienza +=
      Number(pe) * Number(voce.quantita)
  }

  const [bassa, moderata, alta] =
    sogliePerPG[livello].map(
      valore => valore * pg
    )

  const fascia =
    esperienza <= bassa
      ? 'Bassa'
      : esperienza <= moderata
        ? 'Moderata'
        : esperienza <= alta
          ? 'Alta'
          : 'Oltre la soglia alta'

  return (
    `${esperienza} PE · ${fascia} ` +
    `(soglie: ${bassa} / ${moderata} / ${alta} PE)`
  )
}

function aggiungiCreatura(scena) {
  const quantita = Number(quantitaCreatura.value)

  const creatura = creatureDisponibili.value.find(
    elemento =>
      elemento.id === creaturaSelezionataId.value
  )

  if (
    !creatura ||
    !Number.isInteger(quantita) ||
    quantita < 1 ||
    quantita > 30
  ) {
    messaggio.value =
      'Seleziona una creatura e una quantità da 1 a 30.'

    return
  }

  const presente = scena.incontro.nemici.find(
    voce => voce.creaturaId === creatura.id
  )

  if (presente) {
    presente.quantita = Math.min(
      30,
      Number(presente.quantita) + quantita
    )
  } else {
    const suggerimento =
      scena.incontro.suggerimentiPF.find(
        voce =>
          normalizza(creatura.nome).includes(
            normalizza(voce.nome)
          )
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
  if (
    creatureDaCollegare(scena).length ||
    !totaleNemici(scena)
  ) {
    messaggio.value =
      'Prima completa l’incontro e collega le creature richieste.'

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

    if (
      !utilizzabile(creatura) ||
      !Number.isInteger(quantita) ||
      quantita < 1 ||
      quantita > 30
    ) {
      messaggio.value =
        'Una o più creature non sono utilizzabili.'

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

  messaggio.value =
    `${istanze.length} nemici caricati.`

  emit('vai-battaglia')
}
</script>

<template>
  <section class="sessioni-dmc">

    <!-- ==========================================
         CONDUZIONE
    =========================================== -->

    <template v-if="sessioneInConduzione">

      <header class="testata-conduzione dmc-pannello">
        <div>
          <small class="sopratitolo">
            CONDUZIONE ATTIVA
          </small>

          <h2
            ref="titoloConduzione"
            tabindex="-1"
          >
            {{ sessioneInConduzione.titolo }}
          </h2>
        </div>

        <button
          type="button"
          class="dmc-btn dmc-btn--secondary"
          @click="esciDaConduzione"
        >
          Torna alla preparazione
        </button>
      </header>

      <div class="stato-sessione">
        <span>
          Scena corrente dei giocatori:

          <strong>
            {{
              titoloScenaId(
                sessioneInConduzione,
                sessioneInConduzione.scenaAttivaId
              )
            }}
          </strong>
        </span>

        <small>
          {{
            numeroSceneVisitate(sessioneInConduzione)
          }}
          /
          {{ sessioneInConduzione.scene.length }}
          visitate
        </small>
      </div>

      <div class="layout-conduzione">

        <!-- NAVIGAZIONE LATERALE -->

        <aside class="colonna-scene dmc-pannello">

          <div class="intestazione">
            <strong>Scene</strong>

            <small>
              {{ sessioneInConduzione.scene.length }}
            </small>
          </div>

          <nav
            class="elenco-scene"
            aria-label="Scene della sessione"
          >
            <button
              v-for="(scena, indice) in sessioneInConduzione.scene"
              :key="scena.id"
              type="button"
              class="voce-scena"
              :class="{
                selezionata:
                  scenaConsultata(sessioneInConduzione)?.id === scena.id,
                corrente:
                  sessioneInConduzione.scenaAttivaId === scena.id
              }"
              :aria-current="
                scenaConsultata(sessioneInConduzione)?.id === scena.id
                  ? 'page'
                  : undefined
              "
              @click="
                consultaScena(
                  sessioneInConduzione,
                  scena.id
                )
              "
            >
              <span>
                {{ indice + 1 }}.
                {{ titoloScena(scena, indice) }}
              </span>

              <small
                v-if="
                  sessioneInConduzione.scenaAttivaId === scena.id
                "
                class="etichetta in-corso"
              >
                In corso
              </small>

              <small
                v-if="
                  scenaVisitata(
                    sessioneInConduzione,
                    scena.id
                  )
                "
                class="etichetta visitata"
              >
                Visitata
              </small>
            </button>
          </nav>

          <label class="selettore-mobile">
            Consulta scena

            <select
              class="dmc-campo"
              :value="
                scenaConsultata(sessioneInConduzione)?.id
              "
              @change="
                consultaScena(
                  sessioneInConduzione,
                  $event.target.value
                )
              "
            >
              <option
                v-for="(scena, indice) in sessioneInConduzione.scene"
                :key="scena.id"
                :value="scena.id"
              >
                {{ titoloScena(scena, indice) }}
              </option>
            </select>
          </label>
        </aside>

        <!-- SCENA CONSULTATA -->

        <main
          v-if="scenaConsultata(sessioneInConduzione)"
          class="scena-in-conduzione"
        >

          <div class="testata-scena">
            <div>
              <small>
                SCENA
                {{
                  indiceConsultato(sessioneInConduzione) + 1
                }}
                DI
                {{
                  sessioneInConduzione.scene.length
                }}

                <template
                  v-if="
                    scenaConsultata(sessioneInConduzione).orario
                  "
                >
                  ·
                  {{
                    scenaConsultata(sessioneInConduzione).orario
                  }}
                </template>
              </small>

              <h3>
                {{
                  titoloScena(
                    scenaConsultata(sessioneInConduzione),
                    indiceConsultato(sessioneInConduzione)
                  )
                }}
              </h3>
            </div>

            <div class="azioni-scena">

              <label class="check-inline">
                <input
                  type="checkbox"
                  :checked="
                    scenaVisitata(
                      sessioneInConduzione,
                      scenaConsultata(sessioneInConduzione).id
                    )
                  "
                  @change="
                    impostaVisitata(
                      sessioneInConduzione,
                      scenaConsultata(sessioneInConduzione).id,
                      $event.target.checked
                    )
                  "
                />

                Visitata
              </label>

              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                :disabled="
                  sessioneInConduzione.scenaAttivaId ===
                  scenaConsultata(sessioneInConduzione).id
                "
                @click="
                  impostaScenaCorrente(
                    sessioneInConduzione,
                    scenaConsultata(sessioneInConduzione).id
                  )
                "
              >
                Imposta come corrente
              </button>
            </div>
          </div>

          <!-- NARRAZIONE -->

          <section
            class="narrazione dmc-pannello"
            aria-label="Descrizione narrativa"
          >
            <h4>Da narrare</h4>

            <p class="testo-narrativo">
              {{
                scenaConsultata(sessioneInConduzione).descrizione ||
                'Nessuna descrizione narrativa inserita.'
              }}
            </p>
          </section>

          <!-- GUIDA ALLA CONDUZIONE -->

          <section
            class="guida dmc-pannello"
            aria-label="Guida alla conduzione"
          >
            <header class="intestazione">
              <h4>Guida alla conduzione</h4>

              <small>
                {{
                  scenaConsultata(sessioneInConduzione).guida.filter(
                    passo => passo.completato
                  ).length
                }}
                /
                {{
                  scenaConsultata(sessioneInConduzione).guida.length
                }}
                svolti
              </small>
            </header>

            <p
              v-if="
                !scenaConsultata(sessioneInConduzione).guida.length
              "
              class="testo-secondario"
            >
              Nessun passaggio preparato per questa scena.
            </p>

            <div class="lista-guida">

              <article
                v-for="(passo, indice) in scenaConsultata(sessioneInConduzione).guida"
                :key="passo.id"
                class="passaggio"
                :class="{
                  svolto: passo.completato,
                  aperto: passoApertoId === passo.id
                }"
              >
                <div class="riga-passaggio">

                  <label class="check-passo">
                    <input
                      type="checkbox"
                      v-model="passo.completato"
                      :aria-label="
                        `Completa passaggio ${indice + 1}`
                      "
                    />

                    <span class="numero">
                      {{ indice + 1 }}
                    </span>

                    <span class="testo-passo">
                      {{
                        passo.testo ||
                        `Passaggio ${indice + 1}`
                      }}
                    </span>
                  </label>

                  <button
                    v-if="
                      passo.narrazione ||
                      passo.condizione
                    "
                    type="button"
                    class="dettagli-passo"
                    :aria-expanded="
                      passoApertoId === passo.id
                    "
                    @click="
                      passoApertoId =
                        passoApertoId === passo.id
                          ? null
                          : passo.id
                    "
                  >
                    {{
                      passoApertoId === passo.id
                        ? 'Chiudi'
                        : 'Leggi'
                    }}
                  </button>
                </div>

                <div
                  v-if="
                    passoApertoId === passo.id &&
                    (passo.narrazione || passo.condizione)
                  "
                  class="approfondimento-passo"
                >
                  <p
                    v-if="passo.condizione"
                    class="condizione"
                  >
                    <strong>Quando:</strong>
                    {{ passo.condizione }}
                  </p>

                  <p
                    v-if="passo.narrazione"
                    class="testo-narrativo"
                  >
                    {{ passo.narrazione }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <!-- SUPPORTO CONTESTUALE -->

          <section
            v-if="
              scenaConsultata(sessioneInConduzione).indizi.length ||
              pngScena(
                scenaConsultata(sessioneInConduzione)
              ).length ||
              scenaConsultata(sessioneInConduzione).personaggi ||
              scenaConsultata(sessioneInConduzione).alternativa ||
              scenaConsultata(sessioneInConduzione).note ||
              mostraStati(
                sessioneInConduzione,
                scenaConsultata(sessioneInConduzione)
              )
            "
            class="supporto"
            aria-label="Informazioni di supporto"
          >

            <div class="schede-supporto">

              <button
                v-if="
                  scenaConsultata(sessioneInConduzione).indizi.length
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="
                  schedaSupporto === 'indizi'
                "
                @click="toggleSupporto('indizi')"
              >
                Indizi ·
                {{
                  scenaConsultata(sessioneInConduzione).indizi.length
                }}
              </button>

              <button
                v-if="
                  pngScena(
                    scenaConsultata(sessioneInConduzione)
                  ).length ||
                  scenaConsultata(sessioneInConduzione).personaggi
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="
                  schedaSupporto === 'png'
                "
                @click="toggleSupporto('png')"
              >
                Personaggi
              </button>

              <button
                v-if="
                  scenaConsultata(sessioneInConduzione).alternativa
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="
                  schedaSupporto === 'alternative'
                "
                @click="toggleSupporto('alternative')"
              >
                Alternative
              </button>

              <button
                v-if="
                  mostraStati(
                    sessioneInConduzione,
                    scenaConsultata(sessioneInConduzione)
                  )
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="
                  schedaSupporto === 'stati'
                "
                @click="toggleSupporto('stati')"
              >
                Elementi di scena
              </button>

              <button
                v-if="
                  scenaConsultata(sessioneInConduzione).note
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="
                  schedaSupporto === 'note'
                "
                @click="toggleSupporto('note')"
              >
                Note DM
              </button>
            </div>

            <div
              v-if="schedaSupporto"
              class="contenuto-supporto dmc-pannello"
            >

              <!-- INDIZI -->

              <ul
                v-if="schedaSupporto === 'indizi'"
                class="lista-indizi"
              >
                <li
                  v-for="(indizio, indice) in scenaConsultata(sessioneInConduzione).indizi"
                  :key="indizio?.id || indice"
                >
                  {{ testoIndizio(indizio) }}
                </li>
              </ul>

              <!-- PERSONAGGI -->

              <div
                v-else-if="schedaSupporto === 'png'"
                class="elementi-supporto"
              >
                <p
                  v-if="
                    scenaConsultata(sessioneInConduzione).personaggi
                  "
                  class="testo-pre"
                >
                  {{
                    scenaConsultata(sessioneInConduzione).personaggi
                  }}
                </p>

                <details
                  v-for="png in pngScena(
                    scenaConsultata(sessioneInConduzione)
                  )"
                  :key="png.id"
                  class="dettaglio-png"
                >
                  <summary>
                    <strong>{{ png.nome }}</strong>

                    <small v-if="png.ruolo">
                      · {{ png.ruolo }}
                    </small>
                  </summary>

                  <p v-if="png.personalita">
                    <strong>Personalità:</strong>
                    {{ png.personalita }}
                  </p>

                  <p v-if="png.obiettivo">
                    <strong>Obiettivo:</strong>
                    {{ png.obiettivo }}
                  </p>

                  <p v-if="png.segreto">
                    <strong>Segreto:</strong>
                    {{ png.segreto }}
                  </p>

                  <p v-if="png.informazioni">
                    <strong>Informazioni:</strong>
                    {{ png.informazioni }}
                  </p>
                </details>
              </div>

              <!-- ALTERNATIVE -->

              <p
                v-else-if="
                  schedaSupporto === 'alternative'
                "
                class="testo-pre"
              >
                {{
                  scenaConsultata(sessioneInConduzione).alternativa
                }}
              </p>

              <!-- NOTE DEL DM -->

              <p
                v-else-if="
                  schedaSupporto === 'note'
                "
                class="testo-pre"
              >
                {{
                  scenaConsultata(sessioneInConduzione).note
                }}
              </p>

              <!-- ELEMENTI INTERATTIVI -->

              <div
                v-else-if="
                  schedaSupporto === 'stati'
                "
                class="elementi-supporto"
              >
                <div
                  v-for="elemento in elementiScena(
                    sessioneInConduzione,
                    scenaConsultata(sessioneInConduzione)
                  )"
                  :key="elemento.id"
                  class="riga-stato"
                >
                  <div>
                    <strong>{{ elemento.nome }}</strong>

                    <p v-if="elemento.effetto">
                      {{ elemento.effetto }}
                    </p>
                  </div>

                  <select
                    v-model="elemento.stato"
                    class="dmc-campo"
                    :aria-label="
                      `Stato di ${elemento.nome}`
                    "
                  >
                    <option value="inattivo">
                      Non attivo
                    </option>

                    <option value="pronto">
                      Disponibile
                    </option>

                    <option value="utilizzato">
                      Utilizzato
                    </option>
                  </select>
                </div>

                <!-- ATTIVITÀ MONITORATA -->

                <div
                  v-if="
                    scenaConsultata(sessioneInConduzione).mostraRituale &&
                    sessioneInConduzione.rituale?.partecipanti?.length
                  "
                  class="monitoraggio"
                >
                  <strong>
                    Attività monitorata
                  </strong>

                  <p
                    v-if="
                      sessioneInConduzione.rituale.descrizione
                    "
                    class="testo-pre"
                  >
                    {{
                      sessioneInConduzione.rituale.descrizione
                    }}
                  </p>

                  <label
                    v-for="partecipante in sessioneInConduzione.rituale.partecipanti"
                    :key="partecipante.id"
                    class="check-inline"
                  >
                    <input
                      type="checkbox"
                      :checked="
                        !partecipante.attivo
                      "
                      @change="
                        partecipante.attivo =
                          !$event.target.checked
                      "
                    />

                    {{ partecipante.nome }}
                    ·
                    {{
                      partecipante.attivo
                        ? 'Attivo'
                        : 'Interrotto'
                    }}
                  </label>

                  <small>
                    {{
                      attivitaInCorso(sessioneInConduzione)
                        ? 'Attività in corso'
                        : 'Attività conclusa'
                    }}
                  </small>
                </div>
              </div>
            </div>
          </section>

          <!-- INCONTRO -->

          <section
            v-if="
              totaleNemici(
                scenaConsultata(sessioneInConduzione)
              ) ||
              scenaConsultata(sessioneInConduzione).incontro?.noteBilanciamento
            "
            class="incontro-rapido dmc-pannello"
          >
            <div class="intestazione">
              <div>
                <h4>
                  Incontro
                  {{
                    scenaConsultata(sessioneInConduzione).incontro?.opzionale
                      ? '· facoltativo'
                      : ''
                  }}
                </h4>

                <small>
                  {{
                    totaleNemici(
                      scenaConsultata(sessioneInConduzione)
                    )
                  }}
                  nemici ·

                  {{
                    difficolta(
                      scenaConsultata(sessioneInConduzione),
                      sessioneInConduzione
                    )
                  }}
                </small>
              </div>

              <button
                type="button"
                class="dmc-btn"
                :disabled="
                  !totaleNemici(
                    scenaConsultata(sessioneInConduzione)
                  ) ||
                  creatureDaCollegare(
                    scenaConsultata(sessioneInConduzione)
                  ).length > 0
                "
                @click="
                  richiediCaricamento(
                    scenaConsultata(sessioneInConduzione)
                  )
                "
              >
                Carica in Battaglia
              </button>
            </div>

            <p
              v-if="
                creatureDaCollegare(
                  scenaConsultata(sessioneInConduzione)
                ).length
              "
              class="attenzione"
            >
              Da collegare:
              {{
                creatureDaCollegare(
                  scenaConsultata(sessioneInConduzione)
                ).join(', ')
              }}
            </p>

            <details class="dettaglio-incontro">
              <summary>Dettagli incontro</summary>

              <p
                v-for="voce in scenaConsultata(sessioneInConduzione).incontro?.nemici || []"
                :key="voce.creaturaId"
              >
                {{ nomeCreatura(voce) }}
                ×
                {{ voce.quantita }}
              </p>

              <p
                v-if="
                  scenaConsultata(sessioneInConduzione).incontro?.noteBilanciamento
                "
                class="testo-pre"
              >
                {{
                  scenaConsultata(sessioneInConduzione).incontro.noteBilanciamento
                }}
              </p>
            </details>

            <div
              v-if="
                conferma ===
                `carica-${scenaConsultata(sessioneInConduzione).id}`
              "
              class="conferma"
            >
              <p>
                Avviare un nuovo combattimento sostituendo i nemici presenti?
                Il round e le iniziative saranno azzerati.
                I PF e le condizioni dei PG resteranno invariati.
              </p>

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn"
                  @click="
                    caricaIncontro(
                      scenaConsultata(sessioneInConduzione)
                    )
                  "
                >
                  Conferma
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="conferma = null"
                >
                  Annulla
                </button>
              </div>
            </div>
          </section>

          <!-- REGISTRO DELLA SESSIONE -->

          <details class="registro-sessione dmc-pannello">
            <summary>Registro della sessione</summary>

            <label>
              Decisioni, conseguenze e improvvisazioni

              <textarea
                v-model="sessioneInConduzione.resoconto"
                class="dmc-campo"
                rows="4"
              ></textarea>
            </label>
          </details>

          <!-- NAVIGAZIONE IN FONDO ALLA SCENA -->

          <div class="comandi-navigazione">
            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :disabled="
                indiceConsultato(sessioneInConduzione) <= 0
              "
              @click="
                cambiaScena(
                  sessioneInConduzione,
                  -1
                )
              "
            >
              ← Precedente
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :disabled="
                indiceConsultato(sessioneInConduzione) >=
                sessioneInConduzione.scene.length - 1
              "
              @click="
                cambiaScena(
                  sessioneInConduzione,
                  1
                )
              "
            >
              Successiva →
            </button>
          </div>
        </main>
      </div>

      <p
        v-if="messaggio"
        class="messaggio"
        role="status"
      >
        {{ messaggio }}
      </p>
    </template>

    <!-- ==========================================
         PREPARAZIONE
    =========================================== -->

    <template v-else>

      <header class="intestazione testata-preparazione">
        <div>
          <h2>Sessioni</h2>

          <p>
            Prepara le scene e le informazioni
            per la conduzione.
          </p>
        </div>

        <small>
          {{ dati?.sessioni?.length || 0 }}
          sessioni
        </small>
      </header>

      <!-- NUOVA SESSIONE -->

      <form
        class="nuova-sessione"
        @submit.prevent="creaSessione"
      >
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

        <button
          type="submit"
          class="dmc-btn"
        >
          + Crea sessione
        </button>
      </form>

      <!-- ELENCO DELLE SESSIONI -->

      <p
        v-if="!dati?.sessioni?.length"
        class="testo-secondario"
      >
        Non ci sono ancora sessioni.
      </p>

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
              {{
                sessione.titolo ||
                'Sessione senza titolo'
              }}
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
              @click="
                sessioneApertaId =
                  sessioneApertaId === sessione.id
                    ? null
                    : sessione.id
              "
            >
              {{
                sessioneApertaId === sessione.id
                  ? 'Chiudi'
                  : 'Prepara'
              }}
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--danger"
              @click="
                conferma = `s-${sessione.id}`
              "
            >
              Elimina
            </button>
          </div>
        </header>

        <div
          v-if="
            conferma === `s-${sessione.id}`
          "
          class="conferma"
        >
          Eliminare la sessione e tutte le sue scene?

          <div class="azioni">
            <button
              type="button"
              class="dmc-btn dmc-btn--danger"
              @click="eliminaSessione(sessione)"
            >
              Conferma
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              @click="conferma = null"
            >
              Annulla
            </button>
          </div>
        </div>

        <!-- EDITOR SESSIONE -->

        <div
          v-if="
            sessioneApertaId === sessione.id
          "
          class="editor-sessione"
        >

          <details class="editor-espandibile">
            <summary>
              Impostazioni della sessione
            </summary>

            <div class="interno-details griglia-campi">

              <label>
                Titolo

                <input
                  v-model="sessione.titolo"
                  class="dmc-campo"
                />
              </label>

              <label>
                Data

                <input
                  v-model="sessione.data"
                  class="dmc-campo"
                  type="date"
                />
              </label>

              <label>
                Numero PG

                <input
                  v-model.number="sessione.pgPrevisti"
                  class="dmc-campo"
                  type="number"
                  min="1"
                  max="20"
                />
              </label>

              <label>
                Livello PG

                <input
                  v-model.number="sessione.livelloPrevisto"
                  class="dmc-campo"
                  type="number"
                  min="1"
                  max="20"
                />
              </label>

              <label>
                Stato

                <select
                  v-model="sessione.stato"
                  class="dmc-campo"
                >
                  <option value="preparazione">
                    In preparazione
                  </option>

                  <option value="svolta">
                    Svolta
                  </option>
                </select>
              </label>

              <label>
                Obiettivi

                <textarea
                  v-model="sessione.obiettivi"
                  class="dmc-campo"
                  rows="3"
                ></textarea>
              </label>

              <label>
                Resoconto

                <textarea
                  v-model="sessione.resoconto"
                  class="dmc-campo"
                  rows="3"
                ></textarea>
              </label>
            </div>
          </details>

          <!-- ELEMENTI INTERATTIVI -->

          <details class="editor-espandibile">
            <summary>
              Elementi interattivi

              <small>
                facoltativi · per scena
              </small>
            </summary>

            <div class="interno-details">
              <p class="testo-secondario">
                Oggetti, effetti o meccanismi
                con uno stato condiviso.
                Compaiono solo nelle scene selezionate.
              </p>

              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                @click="
                  aggiungi(
                    sessione.risorseNarrative,
                    {
                      nome: '',
                      effetto: '',
                      stato: 'inattivo',
                      sceneIds: []
                    }
                  )
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

                  <input
                    v-model="elemento.nome"
                    class="dmc-campo"
                  />
                </label>

                <label>
                  Descrizione/effetto

                  <textarea
                    v-model="elemento.effetto"
                    class="dmc-campo"
                    rows="2"
                  ></textarea>
                </label>

                <label>
                  Stato

                  <select
                    v-model="elemento.stato"
                    class="dmc-campo"
                  >
                    <option value="inattivo">
                      Non attivo
                    </option>

                    <option value="pronto">
                      Disponibile
                    </option>

                    <option value="utilizzato">
                      Utilizzato
                    </option>
                  </select>
                </label>

                <fieldset class="collegamenti">
                  <legend>
                    Mostra nelle scene
                  </legend>

                  <label
                    v-for="(scena, indice) in sessione.scene"
                    :key="scena.id"
                    class="check-inline"
                  >
                    <input
                      type="checkbox"
                      v-model="elemento.sceneIds"
                      :value="scena.id"
                    />

                    {{ titoloScena(scena, indice) }}
                  </label>
                </fieldset>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="
                    rimuovi(
                      sessione.risorseNarrative,
                      elemento.id
                    )
                  "
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
                Per attività con più partecipanti
                o condizioni, indipendenti dal combattimento.
              </p>

              <label>
                Descrizione

                <textarea
                  v-model="sessione.rituale.descrizione"
                  class="dmc-campo"
                  rows="2"
                ></textarea>
              </label>

              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                @click="
                  aggiungi(
                    sessione.rituale.partecipanti,
                    {
                      nome: 'Partecipante',
                      attivo: true
                    }
                  )
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

                  <input
                    v-model="partecipante.nome"
                    class="dmc-campo"
                  />
                </label>

                <label class="check-inline">
                  <input
                    type="checkbox"
                    :checked="
                      !partecipante.attivo
                    "
                    @change="
                      partecipante.attivo =
                        !$event.target.checked
                    "
                  />

                  Interrotto
                </label>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="
                    rimuovi(
                      sessione.rituale.partecipanti,
                      partecipante.id
                    )
                  "
                >
                  ×
                </button>
              </div>
            </div>
          </details>

          <!-- SCENE -->

          <div class="intestazione">
            <h4>
              Scene · {{ sessione.scene.length }}
            </h4>

            <button
              type="button"
              class="dmc-btn"
              @click="creaScena(sessione)"
            >
              + Nuova scena
            </button>
          </div>

          <article
            v-for="(scena, indice) in sessione.scene"
            :key="scena.id"
            class="scena-editor"
          >
            <header class="intestazione">
              <div>
                <small>
                  SCENA {{ indice + 1 }}
                </small>

                <h4>
                  {{ titoloScena(scena, indice) }}
                </h4>
              </div>

              <div class="azioni">

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  :disabled="indice === 0"
                  :aria-label="
                    `Sposta ${titoloScena(scena, indice)} su`
                  "
                  @click="
                    sposta(
                      sessione.scene,
                      indice,
                      -1
                    )
                  "
                >
                  ↑
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  :disabled="
                    indice === sessione.scene.length - 1
                  "
                  :aria-label="
                    `Sposta ${titoloScena(scena, indice)} giù`
                  "
                  @click="
                    sposta(
                      sessione.scene,
                      indice,
                      1
                    )
                  "
                >
                  ↓
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="
                    scenaApertaId =
                      scenaApertaId === scena.id
                        ? null
                        : scena.id
                  "
                >
                  {{
                    scenaApertaId === scena.id
                      ? 'Chiudi'
                      : 'Modifica'
                  }}
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="
                    conferma = `sc-${scena.id}`
                  "
                >
                  Elimina
                </button>
              </div>
            </header>

            <div
              v-if="
                conferma === `sc-${scena.id}`
              "
              class="conferma"
            >
              Eliminare questa scena?

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="
                    eliminaScena(
                      sessione,
                      scena
                    )
                  "
                >
                  Conferma
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="conferma = null"
                >
                  Annulla
                </button>
              </div>
            </div>

            <!-- EDITOR SCENA -->

            <div
              v-if="scenaApertaId === scena.id"
              class="editor-scena"
            >

              <div class="griglia-campi">

                <label>
                  Titolo

                  <input
                    v-model="scena.titolo"
                    class="dmc-campo"
                  />
                </label>

                <label>
                  Orario indicativo (facoltativo)

                  <input
                    v-model="scena.orario"
                    class="dmc-campo"
                    placeholder="Es. 0:25–0:50"
                  />
                </label>
              </div>

              <label>
                Descrizione narrativa

                <textarea
                  v-model="scena.descrizione"
                  class="dmc-campo"
                  rows="5"
                  placeholder="Ciò che il DM può leggere o parafrasare ai giocatori."
                ></textarea>
              </label>

              <!-- GUIDA UNIFICATA -->

              <section class="editor-guida">
                <header class="intestazione">
                  <h4>
                    Guida alla conduzione
                  </h4>

                  <button
                    type="button"
                    class="dmc-btn"
                    @click="
                      aggiungi(
                        scena.guida,
                        {
                          testo: '',
                          condizione: '',
                          narrazione: '',
                          completato: false
                        }
                      )
                    "
                  >
                    + Passaggio
                  </button>
                </header>

                <p class="testo-secondario">
                  Ordina le attività come vuoi affrontarle.
                  Un passaggio può avere un testo da narrare
                  e una condizione, senza creare
                  una sezione separata.
                </p>

                <div
                  v-for="(passo, indicePasso) in scena.guida"
                  :key="passo.id"
                  class="riga-guida-editor"
                >
                  <div class="riga-editor">

                    <label class="campo-flessibile">
                      Passaggio {{ indicePasso + 1 }}

                      <input
                        v-model="passo.testo"
                        class="dmc-campo"
                      />
                    </label>

                    <button
                      type="button"
                      class="dmc-btn dmc-btn--secondary"
                      :disabled="
                        indicePasso === 0
                      "
                      @click="
                        sposta(
                          scena.guida,
                          indicePasso,
                          -1
                        )
                      "
                    >
                      ↑
                    </button>

                    <button
                      type="button"
                      class="dmc-btn dmc-btn--secondary"
                      :disabled="
                        indicePasso ===
                        scena.guida.length - 1
                      "
                      @click="
                        sposta(
                          scena.guida,
                          indicePasso,
                          1
                        )
                      "
                    >
                      ↓
                    </button>

                    <button
                      type="button"
                      class="dmc-btn dmc-btn--danger"
                      @click="
                        rimuovi(
                          scena.guida,
                          passo.id
                        )
                      "
                    >
                      ×
                    </button>
                  </div>

                  <details class="dettagli-editor">
                    <summary>
                      Condizione e narrazione (facoltative)
                    </summary>

                    <div class="interno-details">

                      <label>
                        Quando attivarlo

                        <input
                          v-model="passo.condizione"
                          class="dmc-campo"
                        />
                      </label>

                      <label>
                        Testo da leggere

                        <textarea
                          v-model="passo.narrazione"
                          class="dmc-campo"
                          rows="3"
                        ></textarea>
                      </label>

                      <label class="check-inline">
                        <input
                          type="checkbox"
                          v-model="passo.completato"
                        />

                        Già svolto
                      </label>
                    </div>
                  </details>
                </div>
              </section>

              <!-- INDIZI E INFORMAZIONI -->

              <details class="editor-espandibile">
                <summary>
                  Indizi e informazioni
                </summary>

                <div class="interno-details">

                  <button
                    type="button"
                    class="dmc-btn dmc-btn--secondary"
                    @click="
                      aggiungi(
                        scena.indizi,
                        {
                          testo: '',
                          rivelato: false
                        }
                      )
                    "
                  >
                    + Indizio
                  </button>

                  <div
                    v-for="indizio in scena.indizi"
                    :key="indizio.id"
                    class="riga-editor"
                  >

                    <label class="campo-flessibile">
                      Indizio

                      <input
                        v-model="indizio.testo"
                        class="dmc-campo"
                      />
                    </label>

                    <button
                      type="button"
                      class="dmc-btn dmc-btn--danger"
                      @click="
                        rimuovi(
                          scena.indizi,
                          indizio.id
                        )
                      "
                    >
                      ×
                    </button>
                  </div>

                  <label>
                    Alternativa narrativa

                    <textarea
                      v-model="scena.alternativa"
                      class="dmc-campo"
                      rows="3"
                    ></textarea>
                  </label>

                  <label>
                    Informazioni su personaggi e incontri

                    <textarea
                      v-model="scena.personaggi"
                      class="dmc-campo"
                      rows="2"
                    ></textarea>
                  </label>

                  <label>
                    Altri appunti del DM

                    <textarea
                      v-model="scena.note"
                      class="dmc-campo"
                      rows="3"
                    ></textarea>
                  </label>
                </div>
              </details>

              <!-- PNG PRESENTI -->

              <details class="editor-espandibile">
                <summary>
                  PNG presenti
                </summary>

                <div class="interno-details">

                  <p
                    v-if="
                      !dati?.pngNarrativi?.length
                    "
                    class="testo-secondario"
                  >
                    Crea prima i PNG nel registro
                    della campagna.
                  </p>

                  <label
                    v-for="png in dati?.pngNarrativi || []"
                    :key="png.id"
                    class="check-inline"
                  >
                    <input
                      type="checkbox"
                      v-model="scena.pngIds"
                      :value="png.id"
                    />

                    {{ png.nome }}
                  </label>
                </div>
              </details>

              <!-- ATTIVITÀ MONITORATA -->

              <details
                v-if="
                  sessione.rituale?.partecipanti?.length
                "
                class="editor-espandibile"
              >
                <summary>
                  Attività monitorata in questa scena
                </summary>

                <div class="interno-details">
                  <label class="check-inline">
                    <input
                      type="checkbox"
                      v-model="scena.mostraRituale"
                    />

                    Rendi visibile l'attività
                    nella Conduzione
                  </label>
                </div>
              </details>

              <!-- INCONTRO -->

              <details class="editor-espandibile">
                <summary>
                  Incontro ·
                  {{ totaleNemici(scena) }}
                  nemici
                </summary>

                <div class="interno-details">

                  <label class="check-inline">
                    <input
                      type="checkbox"
                      v-model="scena.incontro.opzionale"
                    />

                    Incontro facoltativo
                  </label>

                  <p class="testo-secondario">
                    {{
                      difficolta(
                        scena,
                        sessione
                      )
                    }}
                  </p>

                  <label>
                    Indicazioni per il DM

                    <textarea
                      v-model="scena.incontro.noteBilanciamento"
                      class="dmc-campo"
                      rows="2"
                    ></textarea>
                  </label>

                  <p
                    v-if="
                      creatureDaCollegare(scena).length
                    "
                    class="attenzione"
                  >
                    Da collegare:
                    {{
                      creatureDaCollegare(scena).join(', ')
                    }}
                  </p>

                  <label>
                    Ricerca nel Bestiario

                    <input
                      v-model="ricercaCreatura"
                      class="dmc-campo"
                      placeholder="Cerca creatura"
                    />
                  </label>

                  <div class="composizione-incontro">

                    <label>
                      Creatura

                      <select
                        v-model="creaturaSelezionataId"
                        class="dmc-campo"
                      >
                        <option value="">
                          Seleziona
                        </option>

                        <option
                          v-for="creatura in creatureDisponibili"
                          :key="creatura.id"
                          :value="creatura.id"
                        >
                          {{ creatura.nome }}
                          · CA {{ creatura.ca }}
                          · {{ creatura.pfMax }} PF
                        </option>
                      </select>
                    </label>

                    <label>
                      Quantità

                      <input
                        v-model.number="quantitaCreatura"
                        class="dmc-campo"
                        type="number"
                        min="1"
                        max="30"
                      />
                    </label>

                    <button
                      type="button"
                      class="dmc-btn"
                      :disabled="
                        !creaturaSelezionataId
                      "
                      @click="
                        aggiungiCreatura(scena)
                      "
                    >
                      Aggiungi
                    </button>
                  </div>

                  <div
                    v-for="voce in scena.incontro.nemici"
                    :key="voce.creaturaId"
                    class="riga-editor"
                  >
                    <strong class="campo-flessibile">
                      {{ nomeCreatura(voce) }}
                    </strong>

                    <label>
                      Quantità

                      <input
                        v-model.number="voce.quantita"
                        class="dmc-campo"
                        type="number"
                        min="1"
                        max="30"
                      />
                    </label>

                    <label>
                      PF (facoltativi)

                      <input
                        v-model.number="voce.pfIncontro"
                        class="dmc-campo"
                        type="number"
                        min="1"
                        max="999"
                        placeholder="PF base"
                      />
                    </label>

                    <button
                      type="button"
                      class="dmc-btn dmc-btn--danger"
                      @click="
                        scena.incontro.nemici =
                          scena.incontro.nemici.filter(
                            elemento =>
                              elemento.creaturaId !==
                              voce.creaturaId
                          )
                      "
                    >
                      ×
                    </button>
                  </div>
                </div>
              </details>
            </div>
          </article>
        </div>
      </article>

      <!-- STRUMENTI SECONDARI: dopo la preparazione delle sessioni. -->
      <details class="dmc-pannello" style="margin:16px 0">
        <summary style="padding:16px;cursor:pointer;color:var(--dmc-amber)">Crea sessioni con ChatGPT</summary>
        <CreazioneAssistitaCampagna modalita="sessioni" />
      </details>

      <!-- REGISTRO PNG COMPRIMIBILE -->

      <details class="registro-png dmc-pannello">
        <summary>
          PNG della campagna

          <small>
            {{ dati?.pngNarrativi?.length || 0 }}
            schede
          </small>
        </summary>

        <div class="interno-details">

          <form
            class="nuova-sessione"
            @submit.prevent="creaPNG"
          >
            <label class="campo-flessibile">
              Nome del PNG

              <input
                v-model="nuovoPNG"
                class="dmc-campo"
                required
                maxlength="120"
                placeholder="Nome del personaggio"
              />
            </label>

            <button
              type="submit"
              class="dmc-btn"
            >
              + Aggiungi PNG
            </button>
          </form>

          <div class="nuova-sessione" style="margin:12px 0;padding:14px;border:1px solid var(--dmc-border-soft);border-radius:8px">
            <label class="campo-flessibile">
              Aggiungi dal Bestiario (PNG personalizzati)
              <select v-model="pngBestiarioSelezionato" class="dmc-campo">
                <option value="">Seleziona un PNG già creato…</option>
                <option v-for="creatura in pngBestiarioCollegabili" :key="creatura.id" :value="creatura.id">
                  {{ creatura.nome }}
                </option>
              </select>
            </label>
            <button type="button" class="dmc-btn dmc-btn--secondary" :disabled="!pngBestiarioSelezionato" @click="aggiungiPNGDaBestiario">
              + Collega PNG
            </button>
            <p v-if="!pngPersonalizzati.length" class="testo-secondario">
              Nessun PNG personale nel Bestiario. Puoi crearne uno nella sezione Bestiario e collegarlo qui.
            </p>
            <p v-else-if="!pngBestiarioCollegabili.length" class="testo-secondario">
              Tutti i PNG personali del Bestiario sono già collegati a questa campagna.
            </p>
            <p v-if="messaggioPNG" role="status">{{ messaggioPNG }}</p>
          </div>

          <article
            v-for="png in dati?.pngNarrativi || []"
            :key="png.id"
            class="scheda-secondaria"
          >
            <div class="intestazione">
              <strong>
                {{ png.nome }}
              </strong>

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="
                    pngApertoId =
                      pngApertoId === png.id
                        ? null
                        : png.id
                  "
                >
                  {{
                    pngApertoId === png.id
                      ? 'Chiudi'
                      : 'Scheda'
                  }}
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="
                    conferma = `png-${png.id}`
                  "
                >
                  Elimina
                </button>
              </div>
            </div>

            <div
              v-if="
                conferma === `png-${png.id}`
              "
              class="conferma"
            >
              Eliminare questo PNG e i suoi
              collegamenti alle scene?

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="eliminaPNG(png)"
                >
                  Conferma
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="conferma = null"
                >
                  Annulla
                </button>
              </div>
            </div>

            <div
              v-if="pngApertoId === png.id"
              class="griglia-campi"
            >
              <label>
                Nome

                <input
                  v-model="png.nome"
                  class="dmc-campo"
                />
              </label>

              <label>
                Ruolo

                <input
                  v-model="png.ruolo"
                  class="dmc-campo"
                />
              </label>

              <label>
                Personalità

                <textarea
                  v-model="png.personalita"
                  class="dmc-campo"
                  rows="2"
                ></textarea>
              </label>

              <label>
                Obiettivo

                <textarea
                  v-model="png.obiettivo"
                  class="dmc-campo"
                  rows="2"
                ></textarea>
              </label>

              <label>
                Segreto

                <textarea
                  v-model="png.segreto"
                  class="dmc-campo"
                  rows="2"
                ></textarea>
              </label>

              <label>
                Informazioni e dialoghi

                <textarea
                  v-model="png.informazioni"
                  class="dmc-campo"
                  rows="3"
                ></textarea>
              </label>

              <label>
                Collegamento al Bestiario (facoltativo)

                <select
                  v-model="png.creaturaId"
                  class="dmc-campo"
                >
                  <option v-if="png.creaturaId && !pngBestiarioConsultabili.some(c => c.id === png.creaturaId)" :value="png.creaturaId">
                    Riferimento non più disponibile ({{ png.creaturaId }})
                  </option>
                  <option value="">
                    Nessuno
                  </option>

                  <option
                    v-for="creatura in pngBestiarioConsultabili"
                    :key="creatura.id"
                    :value="creatura.id"
                  >
                    {{ creatura.nome }}
                  </option>
                </select>
              </label>
            </div>
          </article>
        </div>
      </details>

      <p
        v-if="messaggio"
        class="messaggio"
        role="status"
      >
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
   CONDUZIONE
========================================== */

.testata-conduzione {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
  padding: 15px 18px;
}

.testata-conduzione h2 {
  font-size: clamp(22px, 2.8vw, 29px);
}

.sopratitolo {
  font-size: 11px;
  letter-spacing: .08em;
}

.stato-sessione {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 11px;
  border-bottom: 1px solid var(--dmc-border-soft);
  font-size: 13px;
}

.stato-sessione strong {
  color: var(--dmc-amber);
}

.layout-conduzione {
  display: grid;
  grid-template-columns:
    minmax(190px, 246px)
    minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

/* BARRA LATERALE */

.colonna-scene {
  position: sticky;
  top: 12px;
  padding: 13px;
  max-height: 74vh;
  overflow-y: auto;
  display: grid;
  gap: 12px;
}

.elenco-scene {
  display: grid;
  gap: 6px;
}

.voce-scena {
  display: grid;
  justify-items: start;
  gap: 5px;
  width: 100%;
  padding: 11px;
  text-align: left;
  color: var(--dmc-cream);
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
}

.voce-scena.selezionata {
  background: var(--dmc-surface-raised);
  border-color: var(--dmc-amber);
}

.voce-scena.corrente {
  box-shadow: inset 3px 0 var(--dmc-amber);
}

.etichetta {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.etichetta.in-corso {
  background: var(--dmc-amber);
  color: var(--dmc-ink);
}

.etichetta.visitata {
  background: #315746;
  color: #d4ebd8;
}

.selettore-mobile {
  display: none !important;
}

/* STRUTTURA DELLA SCENA */

.scena-in-conduzione {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.testata-scena {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 2px 0 6px;
}

.testata-scena h3 {
  margin-top: 3px;
  font-size: clamp(20px, 2.5vw, 27px);
}

.azioni-scena {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* NARRAZIONE */

.narrazione {
  padding: 17px 20px;
  --dmc-panel-bg: #282724;
}

.narrazione h4,
.guida h4 {
  margin-bottom: 8px;
}

/* GUIDA ALLA CONDUZIONE */

.guida {
  padding: 15px 18px;
}

.lista-guida {
  display: grid;
  gap: 6px;
}

.passaggio {
  background: var(--dmc-surface-soft);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 7px;
  overflow: hidden;
}

.passaggio.aperto {
  border-color: var(--dmc-amber);
}

.passaggio.svolto .testo-passo {
  opacity: .65;
  text-decoration: line-through;
}

.riga-passaggio {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 11px;
}

.check-passo {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}

.numero {
  width: 23px;
  flex: 0 0 23px;
  font-size: 12px;
  color: var(--dmc-muted);
}

.testo-passo {
  min-width: 0;
  color: var(--dmc-cream);
  overflow-wrap: anywhere;
}

.dettagli-passo {
  padding: 6px 10px;
  font: inherit;
  font-size: 12px;
  color: var(--dmc-amber);
  background: transparent;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 6px;
  cursor: pointer;
}

.approfondimento-passo {
  display: grid;
  gap: 9px;
  padding: 11px 14px 15px 53px;
  border-top: 1px solid var(--dmc-border-soft);
}

.condizione {
  color: var(--dmc-muted);
  font-size: 13px;
}

/* SUPPORTO CONTESTUALE */

.supporto {
  display: grid;
  gap: 8px;
}

.schede-supporto {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.scheda-tab {
  font: inherit;
  font-size: 13px;
  padding: 8px 11px;
  border: 1px solid var(--dmc-border-soft);
  background: var(--dmc-surface);
  color: var(--dmc-cream);
  border-radius: 7px;
  cursor: pointer;
}

.scheda-tab[aria-pressed='true'] {
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber);
}

.contenuto-supporto {
  padding: 13px 16px;
}

.lista-indizi {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  line-height: 1.55;
}

.elementi-supporto {
  display: grid;
  gap: 10px;
}

.dettaglio-png,
.dettaglio-incontro {
  border-top: 1px solid var(--dmc-border-soft);
  padding: 8px 0 2px;
}

.dettaglio-png summary,
.dettaglio-incontro summary {
  color: var(--dmc-amber);
  cursor: pointer;
}

.dettaglio-png p {
  margin-top: 7px;
}

.riga-stato {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.riga-stato > div {
  flex: 1;
  min-width: 160px;
}

.riga-stato .dmc-campo {
  max-width: 180px;
}

.monitoraggio {
  display: grid;
  gap: 9px;
  border-top: 1px solid var(--dmc-border-soft);
  padding-top: 11px;
}

/* INCONTRO E REGISTRO */

.incontro-rapido {
  padding: 13px 16px;
  display: grid;
  gap: 8px;
}

.incontro-rapido .intestazione > div {
  display: grid;
  gap: 5px;
}

.registro-sessione {
  padding: 12px 15px;
}

.registro-sessione summary {
  cursor: pointer;
  color: var(--dmc-amber);
  font-weight: 600;
}

.registro-sessione label {
  margin-top: 12px;
}

.comandi-navigazione {
  display: flex;
  justify-content: space-between;
  gap: 9px;
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
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 11px;
}

.griglia-campi label:nth-child(n+5) {
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
  grid-template-columns:
    minmax(0, 1fr) 90px auto;
  align-items: end;
  gap: 9px;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .layout-conduzione {
    grid-template-columns: 1fr;
  }

  .colonna-scene {
    position: static;
    max-height: none;
  }

  .elenco-scene {
    display: none;
  }

  .selettore-mobile {
    display: grid !important;
  }
}

@media (max-width: 650px) {
  .griglia-campi {
    grid-template-columns: 1fr;
  }

  .griglia-campi label {
    grid-column: 1 / -1;
  }

  .composizione-incontro {
    grid-template-columns:
      minmax(0, 1fr) 75px;
  }

  .composizione-incontro > button {
    grid-column: 1 / -1;
  }

  .approfondimento-passo {
    padding-left: 15px;
  }

  .riga-stato .dmc-campo {
    max-width: unset;
  }
}
</style>
