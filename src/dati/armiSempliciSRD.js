/**
 * Primo blocco di armi semplici, trascritto dalla tabella Armi
 * dell'SRD 5.2.1 italiano, p. 103. I campi sono indipendenti
 * dal testo a colonne incompleto dell'archivio PDF.
 */
const righe = [
  ['Ascia','1d6','taglienti','Lancio (gittata 6/18), leggera','Vessazione','1 kg','5 mo'],
  ['Bastone ferrato','1d6','contundenti','Versatile (1d8)','Rovesciamento','2 kg','2 ma'],
  ['Falcetto','1d4','taglienti','Leggera','Graffio','1 kg','1 mo'],
  ['Giavellotto','1d6','perforanti','Lancio (gittata 9/36)','Lentezza','1 kg','5 ma'],
  ['Lancia','1d6','perforanti','Lancio (gittata 6/18), versatile (1d8)','Fiaccare','1,5 kg','1 mo'],
  ['Martello leggero','1d4','contundenti','Lancio (gittata 6/18), leggera','Graffio','1 kg','2 mo'],
  ['Mazza','1d6','contundenti','—','Fiaccare','2 kg','5 mo'],
  ['Pugnale','1d4','perforanti','Accurata, lancio (gittata 6/18), leggera','Graffio','0,5 kg','2 mo'],
  ['Randello pesante','1d8','contundenti','Due mani','Spinta','5 kg','2 ma'],
  ['Randello','1d4','contundenti','Leggera','Lentezza','1 kg','1 ma'],
  ['Arco corto','1d6','perforanti','Due mani, munizioni (gittata 24/96; freccia)','Vessazione','1 kg','25 mo'],
  ['Balestra leggera','1d8','perforanti','Due mani, munizioni (gittata 24/96; quadrello), ricarica','Lentezza','2,5 kg','25 mo'],
  ['Dardo','1d4','perforanti','Accurata, lancio (gittata 6/18)','Vessazione','0,125 kg','5 mr'],
  ['Fionda','1d4','contundenti','Munizioni (gittata 9/36; proiettile)','Lentezza','—','1 ma']
]
export const ARMI_SEMPLICI_SRD = Object.freeze(righe.map(([nome,dadiDanno,tipoDanno,proprieta,padronanza,peso,costo],indice)=>Object.freeze({
  nome,dadiDanno,tipoDanno,proprieta,padronanza,peso,costo,
  categoria:'Semplice',impiego:indice<10?'Mischia':'Distanza',pagina:103,
  fonte:'SRD 5.2.1 italiano'
})))
