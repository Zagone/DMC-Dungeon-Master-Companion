/**
 * Valori delle monete tratti dalla tabella "Valore della moneta",
 * SRD 5.2.1 italiano, p. 101. I valori sono frazioni di mo.
 */
export const MONETE_SRD = Object.freeze([
  {nome:'Moneta di rame',sigla:'mr',numeratore:1,denominatore:100},
  {nome:'Moneta d’argento',sigla:'ma',numeratore:1,denominatore:10},
  {nome:'Moneta di electrum',sigla:'me',numeratore:1,denominatore:2},
  {nome:'Moneta d’oro',sigla:'mo',numeratore:1,denominatore:1},
  {nome:'Moneta di platino',sigla:'mp',numeratore:10,denominatore:1}
].map(moneta=>Object.freeze({...moneta,pagina:101,fonte:'SRD 5.2.1 italiano'})))

export function convertiMoneteSRD(quantita,origine,destinazione) {
  if (!Number.isFinite(quantita) || quantita < 0) throw new Error('Quantità non valida.')
  const da=MONETE_SRD.find(m=>m.sigla===origine)
  const a=MONETE_SRD.find(m=>m.sigla===destinazione)
  if (!da || !a) throw new Error('Denominazione monetaria non valida.')
  return quantita * da.numeratore / da.denominatore * a.denominatore / a.numeratore
}
