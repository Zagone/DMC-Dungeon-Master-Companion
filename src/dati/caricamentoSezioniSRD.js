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
    const richiesta = fetch(`${import.meta.env.BASE_URL}compendio/${percorso}.json`)
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
