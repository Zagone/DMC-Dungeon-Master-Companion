/**
 * Tabelle Armi da guerra e Armature dell'SRD 5.2.1 italiano,
 * pp. 103-104. Le duplicazioni tipografiche di Stocco e Tridente
 * nella p. 104 sono rimosse. Unità e prezzi conservati come stampati.
 */
const armi = [
['Alabarda','1d10 taglienti','Due mani, pesante, portata','Doppio fendente','3 kg','20 mo'],
['Ascia bipenne','1d12 taglienti','Due mani, pesante','Doppio fendente','3,5 kg','30 mo'],
['Ascia da battaglia','1d8 taglienti','Versatile (1d10)','Rovesciamento','2 kg','10 mo'],
['Falcione','1d10 taglienti','Due mani, pesante, portata','Colpo di striscio','3 kg','20 mo'],
['Frusta','1d4 taglienti','Accurata, portata','Lentezza','1,5 kg','2 mo'],
['Lancia da cavaliere','1d10 perforanti','Due mani (eccetto in sella), pesante, portata','Rovesciamento','3 kg','10 mo'],
['Maglio','2d6 contundenti','Due mani, pesante','Rovesciamento','5 kg','10 mo'],
['Martello da guerra','1d8 contundenti','Versatile (1d10)','Spinta','2,5 kg','15 mo'],
['Mazza chiodata','1d8 perforanti','—','Fiaccare','2 kg','15 mo'],
['Mazzafrusto','1d8 contundenti','—','Fiaccare','1 kg','10 mo'],
['Picca','1d10 perforanti','Due mani, pesante, portata','Spinta','9 kg','5 mo'],
['Piccone da guerra','1d8 perforanti','Versatile (1d10)','Fiaccare','1 kg','5 mo'],
['Scimitarra','1d6 taglienti','Accurata, leggera','Graffio','1,5 kg','25 mo'],
['Spada corta','1d6 perforanti','Accurata, leggera','Vessazione','1 kg','10 mo'],
['Spada lunga','1d8 taglienti','Versatile (1d10)','Fiaccare','1,5 kg','15 mo'],
['Spadone','2d6 taglienti','Due mani, pesante','Colpo di striscio','3 kg','50 mo'],
['Stocco','1d8 perforanti','Accurata','Vessazione','1 kg','25 mo'],
['Tridente','1d8 perforanti','Lancio (gittata 6/18), versatile (1d10)','Rovesciamento','2 kg','5 mo'],
['Arco lungo','1d8 perforanti','Due mani, munizioni (gittata 45/180; freccia), pesante','Lentezza','1 kg','50 mo'],
['Balestra a mano','1d6 perforanti','Leggera, munizioni (gittata 9/36; quadrello), ricarica','Vessazione','1,5 kg','75 mo'],
['Balestra pesante','1d10 perforanti','Due mani, munizioni (gittata 30/120; quadrello), pesante, ricarica','Spinta','9 kg','50 mo'],
['Cerbottana','1 perforante','Munizioni (gittata 7/30; ago), ricarica','Vessazione','0,5 kg','10 mo'],
['Moschetto','1d12 perforanti','Due mani, munizioni (gittata 12/36; proiettile), ricarica','Lentezza','5 kg','500 mo'],
['Pistola','1d10 perforanti','Munizioni (gittata 9/27; proiettile), ricarica','Vessazione','1,5 kg','250 mo']
]
export const ARMI_DA_GUERRA_SRD = Object.freeze(armi.map(([nome,danno,proprieta,padronanza,peso,costo],i)=>Object.freeze({
  nome,danno,proprieta,padronanza,peso,costo,
  categoria:'Da guerra',impiego:i<18?'Mischia':'Distanza',
  pagina:i<15?103:104,fonte:'SRD 5.2.1 italiano'
})))

const armature = [
['Armatura imbottita','Leggera','11 + modificatore di Des',null,true,'4 kg','5 mo'],
['Armatura di cuoio','Leggera','11 + modificatore di Des',null,false,'5 kg','10 mo'],
['Armatura di cuoio borchiato','Leggera','12 + modificatore di Des',null,false,'6,5 kg','45 mo'],
['Armatura di pelle','Media','12 + modificatore di Des (max 2)',null,false,'6 kg','10 mo'],
['Giaco di maglia','Media','13 + modificatore di Des (max 2)',null,false,'10 kg','50 mo'],
['Corazza a scaglie','Media','14 + modificatore di Des (max 2)',null,true,'22,5 kg','50 mo'],
['Corazza di piastre','Media','14 + modificatore di Des (max 2)',null,false,'10 kg','400 mo'],
['Mezza armatura','Media','15 + modificatore di Des (max 2)',null,true,'20 kg','750 mo'],
['Corazza ad anelli','Pesante','14',null,true,'20 kg','30 mo'],
['Cotta di maglia','Pesante','16',13,true,'27,5 kg','75 mo'],
['Corazza a strisce','Pesante','17',15,true,'30 kg','200 mo'],
['Armatura a piastre','Pesante','18',15,true,'32,5 kg','1.500 mo'],
['Scudo','Scudo','+2',null,false,'3 kg','10 mo']
]
export const ARMATURE_SRD = Object.freeze(armature.map(([nome,categoria,classeArmatura,forzaMinima,svantaggioFurtivita,peso,costo])=>Object.freeze({
  nome,categoria,classeArmatura,forzaMinima,svantaggioFurtivita,peso,costo,pagina:104,fonte:'SRD 5.2.1 italiano'
})))
