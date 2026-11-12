import {
  creaturePersonali,
  creatureBestiario,
  importaCreaturePersonali,
  erroreBestiario,
} from './statoBestiario.js'
import {
  copiaDati,
  creaId,
  normalizzaCreatura,
  utilizzabile,
  chiaviCaratteristiche,
  gruppiRegole,
} from '../dati/modelloCreatura.js'

export const FORMATO_CREATURE = 'dmc-creature'
export const VERSIONE_CREATURE = 1
export const DIMENSIONE_MAX_CREATURE = 5 * 1024 * 1024
export const NUMERO_MAX_CREATURE = 100

const numeri = [
  'ca',
  'pfMax',
  'iniziativa',
  'iniziativaPassiva',
  'bonusCompetenza',
  'puntiEsperienza',
  'puntiEsperienzaTana',
]
const testi = [
  'nomeOriginale',
  'tipo',
  'taglia',
  'tassonomiaOriginale',
  'allineamento',
  'pfFormula',
  'velocita',
  'sensi',
  'lingue',
  'equipaggiamento',
  'regoleAzioniLeggendarie',
  'note',
  'fonte',
]
const elenchiTesto = [
  'aliases',
  'taglie',
  'sottotipi',
  'resistenze',
  'vulnerabilita',
  'immunita',
  'immunitaCondizioni',
  'tags',
]
const oggetto = (v) => !!v && typeof v === 'object' && !Array.isArray(v)
const numeroValido = (v) => v === null || (typeof v === 'number' && Number.isFinite(v))

function verificaProfondita(valore) {
  const pila = [[valore, 0]]
  while (pila.length) {
    const [nodo, profondita] = pila.pop()
    if (profondita > 40) throw new Error('Il file contiene una struttura troppo annidata.')
    if (nodo && typeof nodo === 'object') {
      for (const v of Object.values(nodo)) pila.push([v, profondita + 1])
    }
  }
}

function verificaScheda(c, indice) {
  const errore = (dettaglio) => {
    throw new Error(`Scheda ${indice + 1}: ${dettaglio}`)
  }
  if (
    !oggetto(c) ||
    typeof c.id !== 'string' ||
    !c.id.trim() ||
    typeof c.nome !== 'string' ||
    !c.nome.trim()
  )
    errore('nome o identificativo non valido.')
  if (!['homebrew', 'png'].includes(c.categoria) || c.origine !== 'custom') {
    errore('il file può contenere soltanto creature homebrew e PNG personali.')
  }
  const p = c.provenienzaLegacy
  if (
    p &&
    (p.origine === 'dnd' || p.categoria === 'srd') &&
    (c.id === p.id || c.id === `legacy-${p.id}`)
  ) {
    errore('questa voce appartiene al vecchio catalogo rimosso.')
  }
  if (!['bozza', 'pronta'].includes(c.statoScheda)) {
    errore('stato della scheda non riconosciuto.')
  }
  for (const k of numeri) {
    if (c[k] !== undefined && !numeroValido(c[k])) errore(`valore non valido nel campo ${k}.`)
  }
  for (const k of testi) {
    if (c[k] !== undefined && typeof c[k] !== 'string') errore(`testo non valido nel campo ${k}.`)
  }
  if (c.gs !== undefined && typeof c.gs !== 'string' && !numeroValido(c.gs))
    errore('grado di sfida non valido.')
  for (const k of elenchiTesto) {
    if (c[k] !== undefined && (!Array.isArray(c[k]) || c[k].some((v) => typeof v !== 'string'))) {
      errore(`elenco non valido nel campo ${k}.`)
    }
  }
  for (const k of ['caratteristiche', 'modificatori', 'tiriSalvezza']) {
    if (c[k] === undefined) continue
    if (!oggetto(c[k])) errore(`struttura non valida nel campo ${k}.`)
    if (Object.keys(c[k]).some((v) => !chiaviCaratteristiche.includes(v))) {
      errore(`caratteristica non riconosciuta nel campo ${k}.`)
    }
    for (const caratteristica of chiaviCaratteristiche) {
      if (c[k][caratteristica] !== undefined && !numeroValido(c[k][caratteristica])) {
        errore(`valore non valido in ${k}.${caratteristica}.`)
      }
    }
  }
  if (
    Array.isArray(c.azioni) &&
    Array.isArray(c.attacchi) &&
    JSON.stringify(c.azioni) !== JSON.stringify(c.attacchi)
  ) {
    errore('azioni e attacchi devono rappresentare lo stesso elenco di regole.')
  }
  for (const k of [...gruppiRegole.map((g) => g.campo), 'attacchi']) {
    if (
      c[k] !== undefined &&
      (!Array.isArray(c[k]) ||
        c[k].some(
          (v) => !oggetto(v) || typeof v.nome !== 'string' || typeof v.descrizione !== 'string',
        ))
    )
      errore(`regole non valide nel campo ${k}.`)
  }
  if (
    c.abilita !== undefined &&
    (!Array.isArray(c.abilita) ||
      c.abilita.some((v) => !oggetto(v) || typeof v.nome !== 'string' || !numeroValido(v.bonus)))
  )
    errore('elenco delle abilità non valido.')
  if (
    c.noteFonte !== undefined &&
    (!Array.isArray(c.noteFonte) ||
      c.noteFonte.some(
        (v) => !oggetto(v) || typeof v.codice !== 'string' || typeof v.descrizione !== 'string',
      ))
  )
    errore('note della fonte non valide.')
  if (
    c.riferimentiLegacy?.aliasesApplicativiNonAttestatiNelPDF !== undefined &&
    (!Array.isArray(c.riferimentiLegacy.aliasesApplicativiNonAttestatiNelPDF) ||
      c.riferimentiLegacy.aliasesApplicativiNonAttestatiNelPDF.some((v) => typeof v !== 'string'))
  ) {
    errore('alias storici non validi.')
  }
  if (c.sciame != null && !oggetto(c.sciame)) errore('dati dello sciame non validi.')
  if (c.statoScheda === 'pronta' && !utilizzabile(normalizzaCreatura(c))) {
    errore(
      'una scheda pronta deve avere CA intera non negativa e PF massimi interi maggiori di zero.',
    )
  }
}

export function verificaArchivioCreature(archivio) {
  if (
    !oggetto(archivio) ||
    archivio.formato !== FORMATO_CREATURE ||
    archivio.versione !== VERSIONE_CREATURE
  ) {
    throw new Error(
      'Seleziona un file di creature DMC compatibile. I backup delle campagne si importano da Archivio e backup.',
    )
  }
  if (
    !Array.isArray(archivio.creature) ||
    !archivio.creature.length ||
    archivio.creature.length > NUMERO_MAX_CREATURE
  ) {
    throw new Error(`Il file deve contenere da 1 a ${NUMERO_MAX_CREATURE} schede.`)
  }
  verificaProfondita(archivio)
  const ids = new Set()
  archivio.creature.forEach((c, indice) => {
    verificaScheda(c, indice)
    if (ids.has(c.id)) throw new Error('Il file contiene identificativi duplicati.')
    ids.add(c.id)
  })
  return true
}

export function leggiArchivioCreature(testo) {
  if (
    typeof testo !== 'string' ||
    !testo.trim() ||
    new Blob([testo]).size > DIMENSIONE_MAX_CREATURE
  ) {
    throw new Error('Seleziona un file JSON non vuoto e non superiore a 5 MB.')
  }
  let archivio
  try {
    archivio = JSON.parse(testo)
  } catch {
    throw new Error('Il file non contiene un JSON valido.')
  }
  verificaArchivioCreature(archivio)
  return archivio
}

export function creaArchivioCreature(ids) {
  if (!Array.isArray(ids) || !ids.length || new Set(ids).size !== ids.length) {
    throw new Error('Seleziona almeno una scheda personale da esportare.')
  }
  const creature = ids.map((id) => {
    const c = creaturePersonali.value.find((v) => v.id === id)
    if (!c) throw new Error('Puoi esportare soltanto homebrew e PNG personali.')
    return copiaDati(c)
  })
  const archivio = {
    formato: FORMATO_CREATURE,
    versione: VERSIONE_CREATURE,
    applicazione: 'Dungeon Master Companion',
    esportatoIl: new Date().toISOString(),
    creature,
  }
  verificaArchivioCreature(archivio)
  if (new Blob([JSON.stringify(archivio, null, 2)]).size > DIMENSIONE_MAX_CREATURE) {
    throw new Error('Il file supera 5 MB: esporta meno schede alla volta.')
  }
  return archivio
}

export function importaArchivioCreature(archivio, indici) {
  verificaArchivioCreature(archivio)
  if (
    !Array.isArray(indici) ||
    !indici.length ||
    new Set(indici).size !== indici.length ||
    indici.some((i) => !Number.isInteger(i) || i < 0 || i >= archivio.creature.length)
  ) {
    throw new Error('Seleziona almeno una scheda valida da importare.')
  }
  const usati = new Set(creatureBestiario.value.map((c) => c.id))
  const nuove = indici.map((indice) => {
    const originale = archivio.creature[indice]
    const c = normalizzaCreatura(originale, originale.categoria)
    do {
      c.id = creaId()
    } while (usati.has(c.id))
    usati.add(c.id)
    c.origineImportazione = { id: originale.id, esportatoIl: archivio.esportatoIl || null }
    return c
  })
  if (!importaCreaturePersonali(nuove)) {
    throw new Error(
      erroreBestiario.value || 'Importazione non riuscita: nessuna scheda è stata aggiunta.',
    )
  }
  return nuove.length
}
