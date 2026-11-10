const PERCORSI = Object.freeze({
  'Incantesimi': 'incantesimi',
  'Classi': 'classi',
  'Specie': 'specie',
  'Origini': 'origini',
  'Talenti': 'talenti',
  'Equipaggiamento': 'equipaggiamento',
  'Oggetti magici': 'oggetti-magici',
  'Regole': 'regole',
  'Condizioni': 'condizioni'
})

const cache = new Map()

export async function caricaSezioneSRD(categoria) {
  const percorso = PERCORSI[categoria]
  if (!percorso) throw new Error('Categoria SRD non riconosciuta.')
  if (!cache.has(percorso)) {
    const richiesta = fetch(`${import.meta.env?.BASE_URL || '/'}compendio/${percorso}.json`)
      .then(async risposta => {
        if (!risposta.ok) throw new Error('Archivio della categoria non disponibile.')
        const dati = await risposta.json()
        if (!dati || dati.versione !== 1) throw new Error('Versione archivio non supportata.')
        if (percorso === 'incantesimi') {
          if (dati.formato !== 'dmc-compendio-incantesimi' || !Array.isArray(dati.incantesimi)) {
            throw new Error('Formato incantesimi non valido.')
          }
        } else if (dati.formato !== 'dmc-compendio-sezione' || dati.categoria !== percorso ||
                   !Array.isArray(dati.pagine) || !dati.pagine.every(p => Number.isInteger(p.pagina) && typeof p.testo === 'string')) {
          throw new Error('Formato della sezione non valido.')
        }
        return dati
      }).catch(errore => {
        cache.delete(percorso)
        throw errore
      })
    cache.set(percorso, richiesta)
  }
  return cache.get(percorso)
}

export function paginaSRD(sezione, numeroPagina) {
  if (!sezione || !Array.isArray(sezione.pagine)) return ''
  return sezione.pagine.find(p => p.pagina === numeroPagina)?.testo || ''
}

/**
 * Restituisce il testo delle pagine SRD pertinenti alla voce.
 * Le classi occupano intervalli consecutivi di pagine: si includono
 * tutte fino all'inizio della classe successiva, senza troncare i privilegi.
 * Per le altre categorie si restituisce la pagina di riferimento,
 * senza attribuire automaticamente l'intera pagina alla singola voce.
 */
const INIZI_CLASSI = Object.freeze([32, 35, 41, 46, 53, 55, 59, 66, 70, 75, 79, 85, 93])

export function estrattoVoceSRD(sezione, voce) {
  if (!voce || !Number.isInteger(voce.pagina)) return { testo: '', pagine: [] }
  const inizio = voce.pagina
  const fine = voce.categoria === 'Classi'
    ? (INIZI_CLASSI.find(p => p > inizio) || inizio + 1)
    : inizio + 1
  const pagine = (sezione?.pagine || [])
    .filter(p => p.pagina >= inizio && p.pagina < fine)
    .sort((a, b) => a.pagina - b.pagina)
  return {
    testo: pagine.map(p => `[Pagina SRD ${p.pagina}]\n${p.testo}`).join('\n\n'),
    pagine: pagine.map(p => p.pagina)
  }
}
