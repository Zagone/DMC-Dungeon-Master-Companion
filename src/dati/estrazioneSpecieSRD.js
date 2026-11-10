/**
 * Segmentazione conservativa delle nove specie SRD 5.2.1.
 * Non riscrive né interpreta i tratti: conserva il testo originale estratto.
 * La separazione tra specie è basata sui titoli presenti nel PDF;
 * il risultato è un estratto da verificare editorialmente.
 */
export const NOMI_SPECIE_SRD = Object.freeze([
  'Dragonide', 'Elfo', 'Gnomo', 'Goliath', 'Halfling',
  'Nano', 'Orco', 'Tiefling', 'Umano'
])

const titoli = new Set(NOMI_SPECIE_SRD)
const titoloRiga = riga => riga.trim()
const inizio = riga => titoli.has(titoloRiga(riga))

export function estraiSchedeSpecieSRD(archivio) {
  if (!archivio || archivio.categoria !== 'specie' || !Array.isArray(archivio.pagine)) {
    throw new Error('Archivio delle specie SRD non valido.')
  }
  const schede = new Map()
  let corrente = null
  for (const pagina of [...archivio.pagine].sort((a,b) => a.pagina-b.pagina)) {
    if (!Number.isInteger(pagina.pagina) || typeof pagina.testo !== 'string') {
      throw new Error('Pagina SRD non valida.')
    }
    for (const riga of pagina.testo.split(/\r?\n/)) {
      if (inizio(riga)) {
        corrente = titoloRiga(riga)
        if (schede.has(corrente)) throw new Error('Titolo specie ripetuto: ' + corrente)
        schede.set(corrente, { nome: corrente, pagine: [], righe: [] })
      }
      if (corrente) {
        const scheda = schede.get(corrente)
        if (!scheda.pagine.includes(pagina.pagina)) scheda.pagine.push(pagina.pagina)
        scheda.righe.push(riga)
      }
    }
  }
  if (schede.size !== NOMI_SPECIE_SRD.length) {
    throw new Error('Non sono state individuate tutte le nove specie SRD.')
  }
  return NOMI_SPECIE_SRD.map(nome => {
    const scheda = schede.get(nome)
    return {
      nome,
      pagine: scheda.pagine,
      descrizione: scheda.righe.join('\n').trim(),
      fonte: 'SRD 5.2.1 italiano',
      verificato: false,
      tipoContenuto: 'estratto-testuale'
    }
  })
}
