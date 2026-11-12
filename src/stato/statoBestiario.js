import { computed, shallowRef, ref } from 'vue'
import { catalogoSRD } from '../dati/catalogoSRD.js'
import { aliasSRD } from '../dati/compatibilitaSRD.js'
import {
  modelloCreatura,
  normalizzaCreatura,
  copiaDati,
  congela,
  creaId,
} from '../dati/modelloCreatura.js'
import { scriviTransazione } from './archiviazioneLocale.js'

export const CHIAVE_BESTIARIO = 'sestoRintocco_vue_bestiario01'
export const CHIAVE_VERSIONE_BESTIARIO = 'dmc_versione_bestiario'
export const CHIAVE_RECUPERO_BESTIARIO = 'dmc_recupero_bestiario_v3'
export const VERSIONE_BESTIARIO = 5
export const tipiCreatura = [
  'Aberrazione',
  'Bestia',
  'Celestiale',
  'Costrutto',
  'Drago',
  'Elementale',
  'Folletto',
  'Gigante',
  'Immondo',
  'Melma',
  'Mostruosità',
  'Non morto',
  'Pianta',
  'Umanoide',
]
export const originiCreatura = [
  { id: 'dnd', nome: 'SRD ufficiale' },
  { id: 'custom', nome: 'Personalizzato' },
]
export const categorieCreatura = [
  { id: 'srd', nome: 'SRD ufficiale' },
  { id: 'png', nome: 'PNG personalizzati' },
  { id: 'homebrew', nome: 'Creature homebrew' },
]
export const erroreBestiario = ref('')
export const avvisoMigrazione = ref('')
const ufficiali = new Map(catalogoSRD.map((c) => [c.id, c]))
const idPNG = new Set(['dnd-ivlis', 'dnd-jacko', 'dnd-narthus', 'dnd-pral', 'dnd-vinx'])
const personali = shallowRef([])
let riferimentiLegacy = Object.create(null)
let scritturaConsentita = true

export const nuovaCreatura = () => modelloCreatura()
export const nuovoPNG = () => modelloCreatura('png')
export function eCreaturaSRD(c) {
  return !!c && ufficiali.get(c.id) === c
}
export function trovaCreatura(id) {
  return personali.value.find((c) => c.id === id) || ufficiali.get(aliasSRD[id] || id) || null
}
// Oggetti e array esposti sono congelati. Tutte le modifiche passano dalle API.
export const creatureBestiario = computed(() => Object.freeze([...catalogoSRD, ...personali.value]))
export const creatureSRD = computed(() => catalogoSRD)
export const pngPersonalizzati = computed(() =>
  personali.value.filter((c) => c.categoria === 'png'),
)
export const creatureHomebrew = computed(() =>
  personali.value.filter((c) => c.categoria === 'homebrew'),
)
export const creaturePersonali = computed(() => personali.value)

function documento(lista = personali.value) {
  return { versione: VERSIONE_BESTIARIO, personali: lista, riferimentiLegacy }
}
function pubblica(lista) {
  personali.value = congela(lista)
}
function erroreScrittura(r) {
  erroreBestiario.value =
    r.ripristinato === false
      ? 'Salvataggio non riuscito e ripristino incompleto. Conserva un backup dei dati locali prima di riprovare.'
      : 'Impossibile salvare il Bestiario. Controlla lo spazio disponibile e riprova: la modifica non è stata applicata.'
}
function persisti(lista) {
  if (!scritturaConsentita) return false
  const r = scriviTransazione([
    [CHIAVE_BESTIARIO, JSON.stringify(documento(lista))],
    [CHIAVE_VERSIONE_BESTIARIO, String(VERSIONE_BESTIARIO)],
  ])
  if (!r.successo) {
    erroreScrittura(r)
    return false
  }
  pubblica(lista)
  erroreBestiario.value = ''
  return true
}
function categoriaPersonale(c) {
  return idPNG.has(c.id) || c.categoria === 'png' ? 'png' : 'homebrew'
}
function eVoceCatalogoPrecedente(c) {
  if (idPNG.has(c.id)) return false
  if (c.origine === 'dnd' || c.categoria === 'srd') return true
  const p = c.provenienzaLegacy
  // La v4 ha riclassificato automaticamente il vecchio catalogo come homebrew.
  // Una duplicazione esplicita ha invece un ID nuovo e rimane personale.
  return (
    !!p &&
    (p.origine === 'dnd' || p.categoria === 'srd') &&
    (c.id === p.id || c.id === `legacy-${p.id}`)
  )
}
function migra() {
  try {
    const testo = localStorage.getItem(CHIAVE_BESTIARIO)
    const salvato = testo === null ? null : JSON.parse(testo)
    const formatoDocumento = salvato !== null && !Array.isArray(salvato)
    if (
      formatoDocumento &&
      (![4, VERSIONE_BESTIARIO].includes(salvato.versione) ||
        !Array.isArray(salvato.personali) ||
        !salvato.riferimentiLegacy ||
        typeof salvato.riferimentiLegacy !== 'object' ||
        Array.isArray(salvato.riferimentiLegacy))
    )
      throw new Error('Struttura non valida')
    let eliminate = []
    if (!formatoDocumento) {
      eliminate = JSON.parse(localStorage.getItem(`${CHIAVE_BESTIARIO}_eliminati`) || '[]')
      if (!Array.isArray(eliminate)) throw new Error('Elenco eliminazioni illeggibile')
    }
    const voci = formatoDocumento ? salvato.personali : salvato || []
    const lista = [],
      ids = new Set()
    let rimosse = 0
    for (const c of voci) {
      if (
        !c ||
        typeof c !== 'object' ||
        Array.isArray(c) ||
        typeof c.id !== 'string' ||
        !c.id ||
        !c.nome
      )
        throw new Error('Scheda precedente non valida')
      if (eliminate.includes(c.id)) continue
      if (eVoceCatalogoPrecedente(c)) {
        rimosse++
        continue
      }
      const personale = normalizzaCreatura(c, categoriaPersonale(c))
      if (ufficiali.has(personale.id)) personale.id = `legacy-${personale.id}`
      if (ids.has(personale.id)) throw new Error('ID personale duplicato')
      ids.add(personale.id)
      lista.push(personale)
    }
    // Nessun modello predefinito o archivio di recupero ripopola il Bestiario.
    // I vecchi riferimenti del catalogo errato non vengono ricreati.
    riferimentiLegacy = Object.create(null)
    if (
      salvato?.versione === VERSIONE_BESTIARIO &&
      rimosse === 0 &&
      JSON.stringify(salvato.personali) === JSON.stringify(lista) &&
      Object.keys(salvato.riferimentiLegacy).length === 0
    ) {
      pubblica(lista)
      return
    }
    const modifiche = [
      [CHIAVE_BESTIARIO, JSON.stringify(documento(lista))],
      [CHIAVE_VERSIONE_BESTIARIO, String(VERSIONE_BESTIARIO)],
    ]
    const risultato = scriviTransazione(modifiche)
    pubblica(lista)
    if (!risultato.successo) {
      scritturaConsentita = false
      erroreScrittura(risultato)
    } else if (rimosse)
      avvisoMigrazione.value = `Catalogo aggiornato: rimosse ${rimosse} voci del vecchio catalogo. Disponibili ${catalogoSRD.length} schede SRD verificate e le tue schede personali.`
  } catch {
    scritturaConsentita = false
    erroreBestiario.value =
      'Il Bestiario salvato non è leggibile. Il contenuto originale è stato conservato; le modifiche sono sospese per evitarne la perdita.'
  }
}
migra()

export function salvaCreatura(dati) {
  if (!scritturaConsentita || !dati || ufficiali.has(dati.id)) return false
  const c = normalizzaCreatura(dati)
  if (!c.nome) return false
  c.id ||= creaId()
  const lista = personali.value.filter((v) => v.id !== c.id).map(copiaDati)
  lista.push(c)
  return persisti(lista)
}
export function duplicaComeHomebrew(id) {
  const originale = trovaCreatura(id)
  if (!originale) return null
  const c = normalizzaCreatura(originale, 'homebrew')
  c.id = creaId()
  c.nome = `${originale.nome} (variante)`
  c.derivataDa = {
    id: originale.id,
    nome: originale.nome,
    fonte: originale.fonte,
    versioneCatalogo: originale.versioneCatalogo || null,
  }
  c.statoScheda = originale.categoria === 'srd' ? 'pronta' : originale.statoScheda
  delete c.revisione
  delete c.provenienza
  return salvaCreatura(c) ? copiaDati(c) : null
}
export function eliminaCreatura(id) {
  if (ufficiali.has(id) || !personali.value.some((c) => c.id === id)) return false
  return persisti(personali.value.filter((c) => c.id !== id).map(copiaDati))
}
// Priorità alle istantanee: un vecchio incontro non cambia con il catalogo.
export function risolviVoceIncontro(voce) {
  if (voce?.istantanea) return voce.istantanea
  if (Object.hasOwn(riferimentiLegacy, voce?.creaturaId)) return riferimentiLegacy[voce.creaturaId]
  return trovaCreatura(voce?.creaturaId)
}
export function fissaIncontri(dati, resolver = risolviVoceIncontro) {
  for (const s of dati?.sessioni || [])
    for (const scena of s.scene || []) {
      for (const voce of scena.incontro?.nemici || []) {
        if (!voce.istantanea) {
          const c = resolver(voce)
          if (c) voce.istantanea = copiaDati(c)
        }
      }
    }
  return dati
}
// Preparazione/commit separati per importare backup con un'unica transazione.
export function preparaImportazionePersonali(voci = []) {
  if (!scritturaConsentita || !Array.isArray(voci))
    throw new Error('Bestiario personale non disponibile per l’importazione.')
  const lista = personali.value.map(copiaDati)
  const rimappa = Object.create(null)
  for (const voce of voci) {
    if (!voce || typeof voce !== 'object' || !voce.id || !voce.nome)
      throw new Error('Scheda personale del backup non valida.')
    // Anche un backup della v4 può contenere il catalogo riclassificato.
    if (eVoceCatalogoPrecedente(voce)) continue
    const c = normalizzaCreatura(voce, categoriaPersonale(voce))
    const stessa = lista.find((v) => v.id === c.id)
    if (stessa && JSON.stringify(stessa) === JSON.stringify(c)) continue
    if (stessa || ufficiali.has(c.id)) c.id = creaId()
    rimappa[voce.id] = c.id
    lista.push(c)
  }
  return { lista, rimappa, scrittura: [CHIAVE_BESTIARIO, JSON.stringify(documento(lista))] }
}
export function applicaImportazionePersonali(preparazione) {
  pubblica(preparazione.lista)
}

export function importaCreaturePersonali(voci) {
  if (!Array.isArray(voci) || !voci.length) return false
  const preparazione = preparaImportazionePersonali(voci)
  return persisti(preparazione.lista)
}
