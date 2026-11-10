// SRD italiano 5.2.1, pp. 107–108: prima serie di oggetti
// verificata contro descrizioni p. 107 e tabella peso/prezzo p. 108.
const voci = [
 ['Abiti da viaggiatore','2 kg','2 mo','Indumenti resistenti adatti a diversi ambienti.'],
 ['Abiti eleganti','3 kg','15 mo','Abiti pregiati richiesti per accedere ad alcuni eventi o luoghi.'],
 ['Acciarino e pietra focaia','0,5 kg','5 ma','Accende rapidamente oggetti infiammabili; per altri fuochi è richiesto un minuto.'],
 ['Acido','0,5 kg','25 mo','Fiala lanciabile durante un attacco; può infliggere 2d6 danni da acido.'],
 ['Acqua santa','0,5 kg','25 mo','Ampolla lanciabile che può infliggere 2d8 danni radiosi a immondi e non morti.'],
 ['Ampolla','0,5 kg','2 mr','Contenitore con capacità di mezzo litro.'],
 ['Antitossina','—','50 mo','Consumabile che concede vantaggio ai tiri salvezza pertinenti contro la condizione Avvelenato.'],
 ['Ariete portatile','17,5 kg','4 mo','Conferisce +4 alla prova di Forza per sfondare porte.'],
 ['Asta','3,5 kg','5 mr','Asta lunga 3 metri, utile anche per raggiungere oggetti e agevolare alcuni salti.'],
 ['Attrezzi da scalatore','6 kg','25 mo','Kit per ancorarsi durante le scalate.'],
 ['Barile','35 kg','2 mo','Contenitore per liquidi o merci essiccate.'],
 ['Borsa','0,5 kg','5 ma','Contenitore fino a 3 kg e 5 litri.'],
 ['Borsa del guaritore','1,5 kg','5 mo','Dieci utilizzi per stabilizzare una creatura a 0 PF.'],
 ['Borsa per componenti','1 kg','25 mo','Contenitore impermeabile per componenti materiali degli incantesimi.']
]
export const EQUIPAGGIAMENTO_AVVENTURA_SRD = Object.freeze(voci.map(([nome,peso,costo,sintesi])=>Object.freeze({
 nome,peso,costo,sintesi,pagina:107,paginaTabella:108,
 categoria:'Equipaggiamento d’avventura',fonte:'SRD 5.2.1 italiano',dettagliCompleti:false
})))
