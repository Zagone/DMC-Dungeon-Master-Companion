// Le schede tattiche di Battaglia nascondono sul touch i pannelli
// che contengono esclusivamente valori assenti, senza alterare i dati.
export const CAMPI_EXTRA_TATTICI = Object.freeze([
  'resistenze',
  'vulnerabilita',
  'immunita',
  'immunitaCondizioni',
  'abilita',
  'lingue',
  'equipaggiamento',
])

const ASSENZE_TESTUALI = new Set([
  '',
  '-',
  '—',
  '–',
  'nessuna',
  'nessuno',
  'nessun dato',
  'non indicato',
  'non indicata',
  'non presenti',
  'non presente',
  'non presente nella scheda srd',
  'n/d',
])

export function haContenutoTattico(valore) {
  if (valore === null || valore === undefined || typeof valore === 'boolean') return false

  if (typeof valore === 'string') {
    return !ASSENZE_TESTUALI.has(valore.trim().toLocaleLowerCase('it'))
  }

  if (Array.isArray(valore)) {
    return valore.some(haContenutoTattico)
  }

  if (typeof valore === 'object') {
    return Object.values(valore).some(haContenutoTattico)
  }

  return typeof valore === 'number' && Number.isFinite(valore)
}

export function haDettagliExtraTattici(creatura) {
  return CAMPI_EXTRA_TATTICI.some((campo) => haContenutoTattico(creatura?.[campo]))
}
