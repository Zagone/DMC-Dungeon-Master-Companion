/**
 * Catalogo delle 12 classi dell'SRD italiano 5.2.1 (CC BY 4.0).
 *
 * Delimita il testo fra le intestazioni effettive delle classi: alcune classi
 * iniziano nella stessa pagina dove termina la sottoclasse precedente.
 * Ricostruisce un indice navigabile dei privilegi con livello esplicito.
 * Non dichiara complete le tabelle di progressione estratte dal PDF.
 */
export const CLASSI_SRD_PAGINE = Object.freeze([
  ['Barbaro', 32], ['Bardo', 35], ['Chierico', 41], ['Druido', 46],
  ['Guerriero', 53], ['Ladro', 55], ['Mago', 59], ['Monaco', 66],
  ['Paladino', 70], ['Ranger', 75], ['Stregone', 79], ['Warlock', 85],
])

const FOOTER_PAGINA = /^(?:\d+\s+S\s+t\s+R\s+f\s+D.*|System Reference Document 5\.2\.1|\d+)$/i
const LIVELLO = /^Livello\s+([1-9]|1[0-9]|20)\s*:\s*(\S.*)$/i

function normalizzaRiga(riga) {
  return String(riga || '').replace(/\u00ad/g, '').trim().replace(/\s+/g, ' ')
}

function individuaPrivilegi(righe) {
  const privilegi = []
  for (let i = 0; i < righe.length; i++) {
    const riga = normalizzaRiga(righe[i].testo)
    const trovato = LIVELLO.exec(riga)
    if (!trovato) continue
    let nome = trovato[2]
    const successiva = normalizzaRiga(righe[i + 1]?.testo)
    // L'estrazione a colonne può spezzare il titolo del privilegio.
    // Unisci soltanto continuazioni chiaramente brevi, non i paragrafi.
    if (
      /\b(?:di|del|della|dello|dei|degli|delle|per|con|punteggi|della)$/i.test(nome) &&
      successiva.length > 0 && successiva.length <= 40 &&
      /^[a-zà-ù]/.test(successiva)
    ) {
      nome += ' ' + successiva
    }
    privilegi.push({
      livello: Number(trovato[1]),
      nome,
      pagina: righe[i].pagina,
    })
  }
  return privilegi
}

export function estraiClassiSRD(archivio) {
  if (!archivio || archivio.categoria !== 'classi' || !Array.isArray(archivio.pagine))
    throw new TypeError('Archivio delle classi SRD non valido')

  const righe = archivio.pagine
    .filter((pagina) => pagina.pagina >= 32 && pagina.pagina <= 92)
    .sort((a, b) => a.pagina - b.pagina)
    .flatMap((pagina) => String(pagina.testo || '').split(/\r?\n/)
      .map((testo) => ({ pagina: pagina.pagina, testo })))

  const delimitatori = CLASSI_SRD_PAGINE.map(([nome, pagina]) => ({
    nome,
    indice: righe.findIndex((riga) => riga.pagina === pagina && normalizzaRiga(riga.testo) === nome),
    pagina,
  }))

  if (delimitatori.some(({ indice }) => indice < 0))
    throw new Error('Una o più intestazioni delle classi non sono state trovate nell’SRD.')

  const risultato = new Map()
  for (let i = 0; i < delimitatori.length; i++) {
    const inizio = delimitatori[i]
    const fine = delimitatori[i + 1]?.indice ?? righe.length
    if (fine <= inizio.indice) throw new Error('Ordine delle classi SRD non valido.')
    const sezione = righe.slice(inizio.indice, fine)
      .filter((riga) => !FOOTER_PAGINA.test(normalizzaRiga(riga.testo)))
    const pagine = [...new Set(sezione.map((riga) => riga.pagina))]
    const testo = sezione.map((riga) => riga.testo).join('\n').trim()
    const privilegi = individuaPrivilegi(sezione)
    risultato.set(inizio.nome, {
      nome: inizio.nome, pagina: inizio.pagina, pagine,
      testo, privilegi,
      // Conserva le pagine per associarle alle singole descrizioni dei privilegi.
      righe: sezione.map(({ pagina, testo: testoRiga }) => ({ pagina, testo: testoRiga })),
    })
  }
  return risultato
}
