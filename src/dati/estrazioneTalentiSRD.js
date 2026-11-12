/**
 * Segmentazione dei talenti SRD 5.2.1, pp. 98–100.
 * I titoli sono un elenco chiuso, verificato sull'archivio italiano.
 * Il testo rimane una trascrizione estratta dal PDF, non una revisione editoriale.
 */
const GRUPPI = Object.freeze({
  Origini: ['Abile', 'Aggressore selvaggio', 'Allerta', 'Iniziato alla magia'],
  Generale: ['Aumento dei punteggi di caratteristica', 'Lottatore'],
  'Stile di combattimento': [
    'Combattere con armi possenti',
    'Combattere con due armi',
    'Difesa',
    'Tiro',
  ],
  'Dono epico': [
    'Dono del fato',
    'Dono della vista pura',
    'Dono delle abilità di combattimento',
    'Dono dell’offensiva irresistibile',
    'Dono dello spirito notturno',
    'Dono del richiamo degli incantesimi',
    'Dono del viaggio dimensionale',
  ],
})
export const NOMI_TALENTI_SRD = Object.freeze(Object.values(GRUPPI).flat())
const normalizza = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .replace(/\s+/g, ' ')
    .trim()
const catalogo = new Map(
  Object.entries(GRUPPI).flatMap(([categoria, nomi]) =>
    nomi.map((nome) => [normalizza(nome), { nome, categoria }]),
  ),
)
const titoliSezione = new Set(
  [
    'Talenti Origini',
    'Talenti Generali',
    'Talenti Stile di combattimento',
    'Talenti Dono epico',
  ].map(normalizza),
)

export function estraiTalentiSRD(archivio) {
  if (!archivio || archivio.categoria !== 'talenti' || !Array.isArray(archivio.pagine)) {
    throw new Error('Archivio talenti SRD non valido.')
  }
  const trovati = new Map()
  let corrente = null
  for (const pagina of [...archivio.pagine].sort((a, b) => a.pagina - b.pagina)) {
    if (!Number.isInteger(pagina.pagina) || typeof pagina.testo !== 'string')
      throw new Error('Pagina talenti non valida.')
    for (const riga of pagina.testo.split(/\r?\n/)) {
      const titolo = normalizza(riga)
      if (titoliSezione.has(titolo)) {
        corrente = null
        continue
      }
      const corrispondenza = catalogo.get(titolo)
      if (corrispondenza) {
        if (trovati.has(corrispondenza.nome))
          throw new Error('Talento duplicato: ' + corrispondenza.nome)
        corrente = {
          ...corrispondenza,
          pagina: pagina.pagina,
          pagine: [pagina.pagina],
          righe: [riga.trim()],
        }
        trovati.set(corrente.nome, corrente)
      } else if (corrente) {
        if (!corrente.pagine.includes(pagina.pagina)) corrente.pagine.push(pagina.pagina)
        corrente.righe.push(riga)
      }
    }
  }
  if (trovati.size !== catalogo.size)
    throw new Error('Talenti incompleti: ' + trovati.size + '/' + catalogo.size)
  return NOMI_TALENTI_SRD.map((nome) => {
    const voce = trovati.get(nome)
    return {
      nome,
      categoriaTalento: voce.categoria,
      pagina: voce.pagina,
      pagine: voce.pagine,
      descrizione: voce.righe.join('\n').trim(),
      fonte: 'SRD 5.2.1 italiano',
      verificato: false,
    }
  })
}
