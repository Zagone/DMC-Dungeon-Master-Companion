// Validazione condivisa dei JSON generati da ChatGPT per importare sessioni.
// Non modifica mai dati della campagna.
const oggetto = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
const testo = (v, limite) => typeof v === 'string' && v.length <= limite
const titolo = (v) => testo(v, 150) && v.trim().length > 0
const facoltativo = (v, limite) => v === undefined || testo(v, limite)
export function validaSessioneChatGPT(s) {
  if (
    !oggetto(s) ||
    !titolo(s.titolo) ||
    !facoltativo(s.data, 100) ||
    !facoltativo(s.obiettivi, 15000) ||
    (s.pgPrevisti !== undefined &&
      (!Number.isInteger(s.pgPrevisti) || s.pgPrevisti < 1 || s.pgPrevisti > 20)) ||
    (s.livelloPrevisto !== undefined &&
      (!Number.isInteger(s.livelloPrevisto) || s.livelloPrevisto < 1 || s.livelloPrevisto > 20)) ||
    !Array.isArray(s.scene) ||
    s.scene.length > 100
  )
    return false
  return s.scene.every(
    (sc) =>
      oggetto(sc) &&
      titolo(sc.titolo) &&
      testo(sc.descrizione, 30000) &&
      ['orario', 'note', 'alternativa', 'personaggi'].every((k) => facoltativo(sc[k], 15000)) &&
      (sc.incontro === undefined ||
        sc.incontro === null ||
        (oggetto(sc.incontro) &&
          Array.isArray(sc.incontro.nemici) &&
          sc.incontro.nemici.length === 0)),
  )
}
export function verificaArchivioSessioniChatGPT(dati) {
  if (
    !oggetto(dati) ||
    dati.formato !== 'dmc-sessioni' ||
    dati.versione !== 1 ||
    !Array.isArray(dati.sessioni) ||
    dati.sessioni.length === 0 ||
    dati.sessioni.length > 30 ||
    !dati.sessioni.every(validaSessioneChatGPT)
  ) {
    throw new Error(
      'Formato non valido. Sono richiesti formato dmc-sessioni, versione 1 e sessioni con scene valide. Gli incontri con creature non sono ancora supportati.',
    )
  }
  return true
}
