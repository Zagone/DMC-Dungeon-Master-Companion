// Tabelle SRD 5.2.1 italiano, pp. 113–114.
// Dati tabellari trascritti dal documento originale; nessuna regola aggiuntiva inventata.
// Ogni voce contiene un sottogruppo per ricerca e navigazione nel Compendio.
const cavalcature = [
  ['Cammello','225 kg','50 mo'],
  ['Cavallo da galoppo','240 kg','75 mo'],
  ['Cavallo da guerra','270 kg','400 mo'],
  ['Cavallo da tiro','270 kg','50 mo'],
  ['Elefante','660 kg','200 mo'],
  ['Mastino','97,5 kg','25 mo'],
  ['Mulo','210 kg','8 mo'],
  ['Pony','112,5 kg','30 mo'],
]
const finimenti = [
  ['Biga','50 kg','250 mo'],
  ['Carretto','100 kg','15 mo'],
  ['Carro','200 kg','35 mo'],
  ['Carrozza','300 kg','100 mo'],
  ['Nutrimento (al giorno)','5 kg','5 mr'],
  ['Sella da galoppo','12,5 kg','10 mo'],
  ['Sella esotica','20 kg','60 mo'],
  ['Sella militare','15 kg','20 mo'],
  ['Slitta','150 kg','20 mo'],
  ['Stallaggio (al giorno)','—','5 ma'],
]
const navi = [
  ['Barca a remi','2,25 km/h',1,3,'—',11,50,'—','50 mo'],
  ['Barcone','1,5 km/h',1,6,'1/2',15,100,10,'3.000 mo'],
  ['Dirigibile','12 km/h',10,20,'1',13,300,'—','40.000 mo'],
  ['Galea','6 km/h',80,'—','150',15,500,20,'30.000 mo'],
  ['Nave a vela','3 km/h',20,20,'100',15,300,15,'10.000 mo'],
  ['Nave da guerra','3,75 km/h',60,60,'200',15,500,20,'25.000 mo'],
  ['Nave lunga','4,5 km/h',40,150,'10',15,300,15,'10.000 mo'],
]
export const CAVALCATURE_SRD = Object.freeze(cavalcature.map(([nome,capacitaTrasporto,costo]) => Object.freeze({
  nome, capacitaTrasporto, costo, gruppo:'cavalcature', pagina:113,
  dettagliCompleti:false
})))
export const FINIMENTI_SRD = Object.freeze(finimenti.map(([nome,peso,costo]) => Object.freeze({
  nome,peso,costo,gruppo:'finimenti',pagina:114,dettagliCompleti:false
})))
export const NAVI_SRD = Object.freeze(navi.map(([nome,velocita,equipaggio,passeggeri,caricoTonnellate,ca,pf,sogliaDanno,costo]) => Object.freeze({
  nome,velocita,equipaggio,passeggeri,caricoTonnellate,ca,pf,sogliaDanno,costo,
  gruppo:'navi',pagina:114,dettagliCompleti:false
})))
