import { computed, shallowRef } from 'vue'
import { creaId, copiaDati, congela } from '../dati/modelloCreatura.js'
import { scriviTransazione } from './archiviazioneLocale.js'
export const CHIAVE_CAMPAGNE = 'dmc_campagne_v1'
let letturaFallita = false
function validaCampagna(dati) {
  if (
    !dati ||
    typeof dati !== 'object' ||
    Array.isArray(dati) ||
    typeof dati.id !== 'string' ||
    !dati.id ||
    typeof dati.nome !== 'string' ||
    !dati.nome.trim()
  )
    return null
  return {
    ...dati,
    id: dati.id,
    nome: dati.nome.trim(),
    descrizione: String(dati.descrizione || ''),
    creataIl: String(dati.creataIl || ''),
    modificataIl: String(dati.modificataIl || ''),
    stato: ['preparazione', 'in-corso', 'conclusa'].includes(dati.stato)
      ? dati.stato
      : 'preparazione',
  }
}
function caricaCampagne() {
  try {
    const d = JSON.parse(localStorage.getItem(CHIAVE_CAMPAGNE) || '[]')
    if (
      !Array.isArray(d) ||
      d.some((c) => !validaCampagna(c)) ||
      new Set(d.map((c) => c.id)).size !== d.length
    )
      throw new Error('Archivio non valido')
    return d.map(validaCampagna)
  } catch {
    letturaFallita = true
    return []
  }
}
const elenco = shallowRef(congela(caricaCampagne()))
export const campagne = computed(() => elenco.value)
export const campagneOrdinate = computed(() =>
  [...elenco.value].sort((a, b) => String(b.modificataIl).localeCompare(String(a.modificataIl))),
)
export function trovaCampagna(id) {
  return elenco.value.find((c) => c.id === id) || null
}
function salva(lista) {
  if (letturaFallita) return false
  const r = scriviTransazione([[CHIAVE_CAMPAGNE, JSON.stringify(lista)]])
  if (!r.successo) return false
  elenco.value = congela(lista)
  return true
}
export function creaCampagna(dati) {
  const adesso = new Date().toISOString()
  const nuova = validaCampagna({ ...dati, id: creaId(), creataIl: adesso, modificataIl: adesso })
  if (!nuova) return { successo: false, messaggio: 'Il nome della campagna è obbligatorio.' }
  if (!salva([...elenco.value, nuova]))
    return {
      successo: false,
      messaggio:
        'Impossibile salvare la campagna. Controlla l’archivio locale e lo spazio disponibile.',
    }
  return { successo: true, campagna: nuova }
}
export function aggiornaCampagna(id, modifiche) {
  const c = trovaCampagna(id)
  if (!c) return false
  const aggiornata = validaCampagna({
    ...c,
    ...modifiche,
    id: c.id,
    creataIl: c.creataIl,
    modificataIl: new Date().toISOString(),
  })
  return !!aggiornata && salva(elenco.value.map((v) => (v.id === id ? aggiornata : v)))
}
export function eliminaCampagna(id) {
  return !!trovaCampagna(id) && salva(elenco.value.filter((c) => c.id !== id))
}

// Elimina metadati e contenuti nella stessa operazione con rollback.
// Chiamare soltanto dopo aver chiuso e salvato la campagna attiva.
export function eliminaCampagnaConDati(id) {
  if (letturaFallita || !trovaCampagna(id)) return false

  const lista = elenco.value.filter((c) => c.id !== id)
  const risultato = scriviTransazione([
    [CHIAVE_CAMPAGNE, JSON.stringify(lista)],
    [`dmc_dati_campagna_v1_${id}`, null],
  ])

  if (!risultato.successo) return false
  elenco.value = congela(lista)
  return true
}
export function preparaCampagneImportate(voci) {
  if (letturaFallita)
    throw new Error('L’archivio campagne locale non è leggibile: importazione sospesa.')
  const adesso = new Date().toISOString()
  const nuove = voci.map((v) =>
    validaCampagna({ ...v, id: creaId(), creataIl: adesso, modificataIl: adesso }),
  )
  if (nuove.some((c) => !c)) throw new Error('Campagna del backup non valida.')
  const lista = [...elenco.value.map(copiaDati), ...nuove]
  return { nuove, lista, scrittura: [CHIAVE_CAMPAGNE, JSON.stringify(lista)] }
}
export function applicaImportazioneCampagne(p) {
  elenco.value = congela(p.lista)
}
