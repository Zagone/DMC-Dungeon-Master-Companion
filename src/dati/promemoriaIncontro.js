/**
 * I nomi nel copione (richiedeCreature) sono suggerimenti editoriali.
 * Non sono prerequisiti dell'incontro e non vanno mai usati per disabilitare
 * il passaggio alla Battaglia.
 */
function normalizza(testo) {
  return String(testo ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Ricerca una differenza di al massimo un carattere. È usata SOLO
// per riconoscere possibili nomi suggeriti (es. Alden/Aldren), non
// per identificare o sostituire creature nel combattimento.
function quasiUguali(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false
  let i = 0
  let j = 0
  let differenze = 0
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++
      j++
      continue
    }
    if (++differenze > 1) return false
    if (a.length >= b.length) i++
    if (a.length <= b.length) j++
  }
  return differenze + (a.length - i) + (b.length - j) <= 1
}

export function suggerimentoRiconosciuto(richiamo, nome) {
  const descrizione = normalizza(richiamo)
  const creatura = normalizza(nome)
  if (!descrizione || !creatura) return false

  // Un richiamo può contenere anche il testo di una CTA:
  // "Carica Aldren nell'incontro" è un promemoria per Aldren.
  if (descrizione.includes(creatura) || creatura.includes(descrizione)) return true

  const paroleRichiamo = descrizione.split(' ')
  const paroleNome = creatura.split(' ')
  return paroleRichiamo.some((a) =>
    paroleNome.some((b) => a === b || (a.length >= 5 && b.length >= 5 && quasiUguali(a, b))),
  )
}

export function suggerimentiCreatureNonCollegate(scena, risolviCreatura) {
  const richiedi = scena?.incontro?.richiedeCreature
  const nemici = scena?.incontro?.nemici
  if (!Array.isArray(richiedi)) return []
  const voci = Array.isArray(nemici) ? nemici : []

  return richiedi.filter((richiamo) =>
    !voci.some((voce) => {
      const scheda = risolviCreatura(voce)
      const nomi = [
        voce?.nome,
        scheda?.nome,
        scheda?.nomeOriginale,
        ...(Array.isArray(scheda?.aliases) ? scheda.aliases : []),
      ]
      return nomi.some((nome) => suggerimentoRiconosciuto(richiamo, nome))
    }),
  )
}
