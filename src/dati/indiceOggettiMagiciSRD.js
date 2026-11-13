/**
 * Indicizzazione esplorativa delle voci degli oggetti magici dall'archivio
 * di pagine SRD 5.2.1. NON è una trascrizione verificata delle singole schede.
 * Una voce viene proposta solo quando una riga tipologica riconoscibile
 * segue immediatamente il titolo; le descrizioni rimangono consultabili
 * attraverso la pagina originale per evitare associazioni errate.
 */
const TIPI = [
  'Oggetto meraviglioso',
  'Anello',
  'Armatura',
  'Arma',
  'Bacchetta',
  'Bastone',
  'Pergamena',
  'Pozione',
  'Verga',
]
const RARITA = ['non comune', 'molto raro', 'leggendario', 'artefatto', 'comune', 'raro']
function pulisci(testo) {
  return String(testo || '')
    .replace(/\s+/g, ' ')
    .trim()
}
function metadati(linea) {
  const r = pulisci(linea)
  const tipo = TIPI.find((t) =>
    new RegExp('^' + t + '(?:\\s*\\([^)]*\\))?\\s*,', 'i').test(r),
  )
  if (!tipo) return null
  const resto = r.slice(r.indexOf(',') + 1).trim()
  const testoRarita = resto.replace(/\brara\b/gi, 'raro').replace(/\bmolto rara\b/gi, 'molto raro')
    .replace(/\bleggendaria\b/gi, 'leggendario')
  const rarita = RARITA.find((t) => new RegExp('(?:^|\\W)' + t + '(?:\\W|$)', 'i').test(testoRarita))
  if (!rarita) return null
  return { tipo, rarita, richiedeSintonia: /richiede sintonia/i.test(resto) }
}
function titoloValido(titolo) {
  if (titolo.length < 4 || titolo.length > 100 || !/[a-zàèéìòù]/i.test(titolo)) return false
  if (
    /[.!?;:]$/.test(titolo) ||
    /^(?:Il|La|Le|Lo|Un|Una|Uno|Se|Quando|Finché|Ogni|Ciascun|Per|Con|Inoltre|Questo|Questa|Questi|Queste|Tabella|Oggetti magici|System Reference)/i.test(
      titolo,
    )
  )
    return false
  return true
}
export function estraiIndiceOggettiMagici(archivio) {
  if (!archivio || !Array.isArray(archivio.pagine))
    throw new TypeError('Archivio oggetti magici non valido')
  const risultati = new Map()
  for (const pagina of archivio.pagine) {
    if (pagina.pagina < 237) continue
    const righe = String(pagina.testo || '')
      .split(/\r?\n/)
      .map(pulisci)
      .filter(Boolean)
    for (let i = 1; i < righe.length; i++) {
      const meta = metadati(righe[i])
      if (!meta) continue
      let titolo = righe[i - 1]
      // I titoli lunghi possono essere spezzati su due righe.
      if (/^(?:e|di|del|della|dei|delle)\b/i.test(titolo) && i >= 2)
        titolo = righe[i - 2] + ' ' + titolo
      if (!titoloValido(titolo)) continue
      const chiave = titolo.toLocaleLowerCase('it-IT')
      if (!risultati.has(chiave))
        risultati.set(
          chiave,
          Object.freeze({
            id:
              'oggetto-magico-' +
              titolo
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .toLocaleLowerCase('it-IT')
                .replace(/[^a-z0-9]+/g, '-'),
            nome: titolo,
            categoria: 'Oggetti magici',
            pagina: pagina.pagina,
            ...meta,
            sintesi:
              meta.tipo +
              ' · ' +
              meta.rarita +
              (meta.richiedeSintonia ? ' · richiede sintonia' : ''),
            dettagliCompleti: false,
            indicizzazioneAutomatica: true,
          }),
        )
    }
  }
  return [...risultati.values()]
}
