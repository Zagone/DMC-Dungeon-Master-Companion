/**
 * Schede anagrafiche delle nove specie dell'SRD 5.2.1 italiano.
 * Dati confrontati con le pagine 94–97 del PDF, consultando le due colonne
 * separatamente. I tratti sono indici, non parafrasi delle regole.
 * Il testo completo rimane nell'archivio SRD di origine.
 */
export const SPECIE_SRD_VERIFICATE = Object.freeze([
  {nome:'Dragonide',pagina:94,pagine:[94],tipoCreatura:'Umanoide',taglie:['Media'],velocitaMetri:9,tratti:['Discendenza draconica','Soffio','Resistenza ai danni','Scurovisione','Volo draconico']},
  {nome:'Elfo',pagina:94,pagine:[94,95],tipoCreatura:'Umanoide',taglie:['Media'],velocitaMetri:9,tratti:['Scurovisione','Lignaggio elfico','Retaggio fatato','Sensi acuti','Trance']},
  {nome:'Gnomo',pagina:95,pagine:[95],tipoCreatura:'Umanoide',taglie:['Piccola'],velocitaMetri:9,tratti:['Astuzia gnomesca','Lignaggio gnomesco','Scurovisione']},
  {nome:'Goliath',pagina:95,pagine:[95,96],tipoCreatura:'Umanoide',taglie:['Media'],velocitaMetri:10.5,tratti:['Costituzione robusta','Discendenza gigantica','Forma Grande']},
  {nome:'Halfling',pagina:96,pagine:[96],tipoCreatura:'Umanoide',taglie:['Piccola'],velocitaMetri:9,tratti:['Agilità halfling','Coraggioso','Fortuna','Furtività innata']},
  {nome:'Nano',pagina:96,pagine:[96],tipoCreatura:'Umanoide',taglie:['Media'],velocitaMetri:9,tratti:['Esperto minatore','Resilienza nanica','Robustezza nanica','Scurovisione']},
  {nome:'Orco',pagina:96,pagine:[96],tipoCreatura:'Umanoide',taglie:['Media'],velocitaMetri:9,tratti:['Resistenza implacabile','Scarica di adrenalina','Scurovisione']},
  {nome:'Tiefling',pagina:96,pagine:[96,97],tipoCreatura:'Umanoide',taglie:['Media','Piccola'],velocitaMetri:9,tratti:['Retaggio immondo','Presenza ultraterrena','Scurovisione']},
  {nome:'Umano',pagina:97,pagine:[97],tipoCreatura:'Umanoide',taglie:['Media','Piccola'],velocitaMetri:9,tratti:['Intraprendente','Pluriabilità','Versatile']}
].map(voce => Object.freeze({...voce,taglie:Object.freeze(voce.taglie),tratti:Object.freeze(voce.tratti),pagine:Object.freeze(voce.pagine),metadatiVerificati:true,testoTrattiVerificato:false})))

export const NOMI_SPECIE_SRD = Object.freeze(SPECIE_SRD_VERIFICATE.map(voce => voce.nome))

export function estraiSchedeSpecieSRD(archivio) {
  if (!archivio || archivio.categoria !== 'specie' || !Array.isArray(archivio.pagine)) {
    throw new Error('Archivio delle specie SRD non valido.')
  }
  const pagineDisponibili = new Set(archivio.pagine.map(p => p.pagina))
  return SPECIE_SRD_VERIFICATE.map(voce => {
    if (!voce.pagine.every(pagina => pagineDisponibili.has(pagina))) {
      throw new Error('Pagina mancante per la specie ' + voce.nome)
    }
    return voce
  })
}
