/**
 * Schede anagrafiche delle nove specie dell'SRD 5.2.1 italiano.
 * Dati confrontati con le pagine 94–97 del PDF, consultando le due colonne
 * separatamente. I tratti sono indici, non parafrasi delle regole.
 * Il testo completo rimane nell'archivio SRD di origine.
 */
export const SPECIE_SRD_VERIFICATE = Object.freeze(
  [
    {
      nome: 'Dragonide',
      pagina: 94,
      pagine: [94],
      tipoCreatura: 'Umanoide',
      taglie: ['Media'],
      velocitaMetri: 9,
      tratti: [
        'Discendenza draconica',
        'Soffio',
        'Resistenza ai danni',
        'Scurovisione',
        'Volo draconico',
      ],
    },
    {
      nome: 'Elfo',
      pagina: 94,
      pagine: [94, 95],
      tipoCreatura: 'Umanoide',
      taglie: ['Media'],
      velocitaMetri: 9,
      tratti: ['Scurovisione', 'Lignaggio elfico', 'Retaggio fatato', 'Sensi acuti', 'Trance'],
    },
    {
      nome: 'Gnomo',
      pagina: 95,
      pagine: [95],
      tipoCreatura: 'Umanoide',
      taglie: ['Piccola'],
      velocitaMetri: 9,
      tratti: ['Astuzia gnomesca', 'Lignaggio gnomesco', 'Scurovisione'],
    },
    {
      nome: 'Goliath',
      pagina: 95,
      pagine: [95, 96],
      tipoCreatura: 'Umanoide',
      taglie: ['Media'],
      velocitaMetri: 10.5,
      tratti: ['Costituzione robusta', 'Discendenza gigantica', 'Forma Grande'],
    },
    {
      nome: 'Halfling',
      pagina: 96,
      pagine: [96],
      tipoCreatura: 'Umanoide',
      taglie: ['Piccola'],
      velocitaMetri: 9,
      tratti: ['Agilità halfling', 'Coraggioso', 'Fortuna', 'Furtività innata'],
    },
    {
      nome: 'Nano',
      pagina: 96,
      pagine: [96],
      tipoCreatura: 'Umanoide',
      taglie: ['Media'],
      velocitaMetri: 9,
      tratti: ['Esperto minatore', 'Resilienza nanica', 'Robustezza nanica', 'Scurovisione'],
    },
    {
      nome: 'Orco',
      pagina: 96,
      pagine: [96],
      tipoCreatura: 'Umanoide',
      taglie: ['Media'],
      velocitaMetri: 9,
      tratti: ['Resistenza implacabile', 'Scarica di adrenalina', 'Scurovisione'],
    },
    {
      nome: 'Tiefling',
      pagina: 96,
      pagine: [96, 97],
      tipoCreatura: 'Umanoide',
      taglie: ['Media', 'Piccola'],
      velocitaMetri: 9,
      tratti: ['Retaggio immondo', 'Presenza ultraterrena', 'Scurovisione'],
    },
    {
      nome: 'Umano',
      pagina: 97,
      pagine: [97],
      tipoCreatura: 'Umanoide',
      taglie: ['Media', 'Piccola'],
      velocitaMetri: 9,
      tratti: ['Intraprendente', 'Pluriabilità', 'Versatile'],
    },
  ].map((voce) =>
    Object.freeze({
      ...voce,
      taglie: Object.freeze(voce.taglie),
      tratti: Object.freeze(voce.tratti),
      pagine: Object.freeze(voce.pagine),
      metadatiVerificati: true,
      testoTrattiVerificato: false,
    }),
  ),
)

/**
 * Opzioni e progressioni delle sottospecie ricontrollate nelle tabelle
 * «Lignaggi elfici» (p. 95) e «Retaggi immondi» (p. 97) dell'SRD italiano.
 * Le descrizioni sono sintetiche: per le regole complete consultare il PDF.
 */
export const OPZIONI_SPECIE_SRD = Object.freeze({
  Elfo: Object.freeze([
    {
      nome: 'Drow',
      livello1: 'Scurovisione fino a 36 m; trucchetto luci danzanti',
      livello3: 'Luminescenza',
      livello5: 'Oscurità',
    },
    {
      nome: 'Elfo alto',
      livello1:
        'Trucchetto prestidigitazione, sostituibile dopo un riposo lungo con un trucchetto del mago',
      livello3: 'Individuazione del magico',
      livello5: 'Passo velato',
    },
    {
      nome: 'Elfo dei boschi',
      livello1: 'Velocità 10,5 m; trucchetto artificio druidico',
      livello3: 'Passo veloce',
      livello5: 'Passare senza tracce',
    },
  ]),
  Gnomo: Object.freeze([
    {
      nome: 'Gnomo delle foreste',
      livello1:
        'Trucchetto illusione minore; parlare con gli animali preparato e lanciabile senza slot per un numero di volte pari al bonus di competenza',
    },
    {
      nome: 'Gnomo delle rocce',
      livello1:
        'Trucchetti riparare e prestidigitazione; creazione di piccoli dispositivi meccanici tramite prestidigitazione',
    },
  ]),
  Tiefling: Object.freeze([
    {
      nome: 'Abissale',
      livello1: 'Resistenza al veleno; trucchetto spruzzo velenoso',
      livello3: 'Raggio di infermità',
      livello5: 'Blocca persone',
    },
    {
      nome: 'Ctonio',
      livello1: 'Resistenza ai danni necrotici; trucchetto tocco gelido',
      livello3: 'Vita falsata',
      livello5: 'Raggio di affaticamento',
    },
    {
      nome: 'Infernale',
      livello1: 'Resistenza al fuoco; trucchetto dardo di fuoco',
      livello3: 'Intimorire infernale',
      livello5: 'Oscurità',
    },
  ]),
  Dragonide: Object.freeze([
    { nome: 'Bianco', danno: 'Freddo' },
    { nome: 'Blu', danno: 'Fulmine' },
    { nome: 'Nero', danno: 'Acido' },
    { nome: 'Rosso', danno: 'Fuoco' },
    { nome: 'Verde', danno: 'Veleno' },
    { nome: 'Argento', danno: 'Freddo' },
    { nome: 'Bronzo', danno: 'Fulmine' },
    { nome: 'Oro', danno: 'Fuoco' },
    { nome: 'Ottone', danno: 'Fuoco' },
    { nome: 'Rame', danno: 'Acido' },
  ]),
  Goliath: Object.freeze([
    { nome: 'Brivido gelante', origine: 'Gigante del gelo' },
    { nome: 'Forza della collina', origine: 'Gigante delle colline' },
    { nome: 'Fuoco bruciante', origine: 'Gigante del fuoco' },
    { nome: 'Resistenza della pietra', origine: 'Gigante delle pietre' },
    { nome: 'Salta-nuvole', origine: 'Gigante delle nuvole' },
    { nome: 'Tuono tempestoso', origine: 'Gigante delle tempeste' },
  ]),
})

export const NOMI_SPECIE_SRD = Object.freeze(SPECIE_SRD_VERIFICATE.map((voce) => voce.nome))

export function estraiSchedeSpecieSRD(archivio) {
  if (!archivio || archivio.categoria !== 'specie' || !Array.isArray(archivio.pagine)) {
    throw new Error('Archivio delle specie SRD non valido.')
  }
  const pagineDisponibili = new Set(archivio.pagine.map((p) => p.pagina))
  return SPECIE_SRD_VERIFICATE.map((voce) => {
    if (!voce.pagine.every((pagina) => pagineDisponibili.has(pagina))) {
      throw new Error('Pagina mancante per la specie ' + voce.nome)
    }
    return { ...voce, opzioni: OPZIONI_SPECIE_SRD[voce.nome] || [] }
  })
}
