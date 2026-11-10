// Contratto di scambio per la generazione assistita di campagne.
// Il formato AI è deliberatamente distinto dal backup nativo DMC:
// la conversione avviene solo dopo la validazione, mai implicitamente.
export const FORMATO_CAMPAGNA_AI = 'dmc-campagna-ai'
export const VERSIONE_CAMPAGNA_AI = 1
const oggetto = x => x !== null && typeof x === 'object' && !Array.isArray(x)
const stringa = (x, max = 10000) => typeof x === 'string' && x.trim().length > 0 && x.length <= max
const testo = (x, max = 10000) => typeof x === 'string' && x.length <= max
function verificaArray(valori, nome, max, verifica) {
  if (!Array.isArray(valori) || valori.length > max) throw new Error(nome + ': elenco non valido.')
  valori.forEach((v, i) => verifica(v, nome + '[' + i + ']'))
}
function verificaIncontro(v, percorso) {
  if (!oggetto(v)) throw new Error(percorso + ': incontro non valido.')
  verificaArray(v.nemici, percorso + '.nemici', 30, (n, p) => {
    if (!oggetto(n) || !stringa(n.nome, 120) ||
        !Number.isInteger(n.quantita) || n.quantita < 1 || n.quantita > 30) {
      throw new Error(p + ': nemico non valido.')
    }
  })
}
export function verificaCampagnaAI(c) {
  if (!oggetto(c) || c.formato !== FORMATO_CAMPAGNA_AI || c.versione !== VERSIONE_CAMPAGNA_AI) {
    throw new Error('Formato della campagna generata non riconosciuto.')
  }
  if (!stringa(c.nome, 160) || !testo(c.descrizione, 5000) || !testo(c.note, 20000)) {
    throw new Error('Titolo, descrizione o note della campagna non validi.')
  }
  verificaArray(c.sessioni, 'sessioni', 100, (s, p) => {
    if (!oggetto(s) || !stringa(s.nome, 160) || !testo(s.descrizione, 10000)) throw new Error(p + ': sessione non valida.')
    verificaArray(s.scene, p + '.scene', 100, (sc, ps) => {
      if (!oggetto(sc) || !stringa(sc.nome, 160) || !testo(sc.descrizione, 15000)) throw new Error(ps + ': scena non valida.')
      if (sc.incontro !== null && sc.incontro !== undefined) verificaIncontro(sc.incontro, ps + '.incontro')
    })
  })
  verificaArray(c.png, 'png', 200, (p, percorso) => {
    if (!oggetto(p) || !stringa(p.nome, 160) || !testo(p.descrizione, 10000)) throw new Error(percorso + ': PNG non valido.')
  })
  return true
}
export function creaModelloCampagnaAI() {
  return {
    formato: FORMATO_CAMPAGNA_AI, versione: VERSIONE_CAMPAGNA_AI,
    nome: 'Titolo della campagna', descrizione: '', note: '',
    sessioni: [{ nome: 'Sessione 1', descrizione: '', scene: [{
      nome: 'Scena introduttiva', descrizione: '', incontro: null
    }] }], png: []
  }
}
