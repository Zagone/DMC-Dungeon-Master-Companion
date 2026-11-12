import { sogliePerPG } from './preparazioneSessioni.js'

/**
 * Calcola una valutazione indicativa usando le soglie SRD 5.2.1.
 * Non sostituisce il giudizio del Dungeon Master o le regole complete
 * sulla costruzione degli incontri.
 */
export function valutaIncontro({ pg, livello, nemici, risolviCreatura, collegamentiMancanti = false }) {
  const numeroPG = Number(pg)
  const livelloPG = Number(livello)
  if (!Number.isInteger(numeroPG) || numeroPG < 1 || numeroPG > 20 || !sogliePerPG[livelloPG]) {
    return 'Imposta numero e livello dei PG.'
  }
  if (collegamentiMancanti) return 'Collega le creature mancanti prima di valutare lo scontro.'
  if (!Array.isArray(nemici) || !nemici.length || !nemici.some(v => Number(v?.quantita) > 0)) {
    return 'Nessun nemico preparato.'
  }
  let esperienza = 0
  for (const voce of nemici) {
    const creatura = risolviCreatura(voce)
    const pe = creatura?.puntiEsperienza
    if (pe == null || !Number.isFinite(Number(pe))) {
      return 'PE non disponibili: valutazione manuale.'
    }
    esperienza += Number(pe) * Number(voce.quantita)
  }
  const [bassa, moderata, alta] = sogliePerPG[livelloPG].map(valore => valore * numeroPG)
  const fascia = esperienza <= bassa ? 'Bassa'
    : esperienza <= moderata ? 'Moderata'
      : esperienza <= alta ? 'Alta' : 'Oltre la soglia alta'
  return `${esperienza} PE · ${fascia} (soglie: ${bassa} / ${moderata} / ${alta} PE)`
}
