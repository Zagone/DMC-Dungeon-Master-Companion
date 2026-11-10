// Metadati e sintesi controllati sul testo dell'SRD italiano 5.2.1.
// Le descrizioni sono sintesi editoriali; il testo completo resta nel PDF.
const VOCI = [
  ['Aculeo mentale','azione','36 metri','S','concentrazione, fino a 1 ora','Una creatura visibile effettua un TS Saggezza: 3d8 danni psichici se fallisce, metà se riesce. In caso di fallimento, il lanciatore può localizzarla per la durata.'],
  ['Aiuto','azione','9 metri','V, S, M (una striscia di tessuto bianco)','8 ore','Fino a tre creature aumentano di 5 i PF massimi e attuali. Con slot superiori l’aumento cresce di 5 per livello.'],
  ['Allarme','1 minuto o rituale','9 metri',"V, S, M (una campanella e un filo d'argento)",'8 ore','Protegge una porta, una finestra o un’area limitata, avvertendo il lanciatore dell’ingresso di creature non escluse.'],
  ['Blocca persone','azione','18 metri','V, S, M (una sbarra di ferro)','concentrazione, fino a 1 minuto','Un umanoide visibile effettua un TS Saggezza: se fallisce è paralizzato; ripete il TS alla fine di ogni turno.'],
  ['Cura ferite','azione','contatto','V, S','istantanea','Una creatura toccata recupera 2d8 PF più il modificatore della caratteristica da incantatore; +2d8 per ogni livello di slot superiore.'],
  ['Dardo di fuoco','azione','36 metri','V, S','istantanea','Attacco a distanza con incantesimo che infligge danni da fuoco; i danni aumentano con il livello del personaggio.'],
  ['Deflagrazione occulta','azione','36 metri','V, S','istantanea','Attacco a distanza con incantesimo: 1d10 danni da forza per raggio. Il numero di raggi cresce ai livelli 5, 11 e 17.'],
  ['Individuazione del magico','azione o rituale','incantatore','V, S','concentrazione, fino a 10 minuti','Percepisce la presenza di magia nelle vicinanze e permette di individuarne l’aura secondo le condizioni descritte.'],
  ['Palla di fuoco','azione','45 metri','V, S, M (una pallina di guano di pipistrello e zolfo)','istantanea','Esplosione in una sfera di raggio 6 metri: TS Destrezza, 8d6 danni da fuoco se fallito o metà se riuscito; +1d6 per livello di slot superiore al 3°.'],
  ['Passo velato','azione bonus','incantatore','V','istantanea','Il lanciatore si teletrasporta fino a 9 metri in uno spazio libero che può vedere.'],
  ['Scudo','reazione (quando colpito da un attacco o bersagliato da Dardo incantato)','incantatore','V, S','1 round','Una barriera magica conferisce +5 alla CA fino all’inizio del turno successivo e impedisce i danni di Dardo incantato.'],
  ['Velocità','azione','9 metri','V, S, M (una scaglia di radice di liquirizia)','concentrazione, fino a 1 minuto','Raddoppia la velocità, conferisce +2 alla CA, vantaggio ai TS Destrezza e un’azione aggiuntiva limitata. Al termine il bersaglio è temporaneamente incapace di muoversi o agire.'],
]
export const DETTAGLI_INCANTESIMI_SRD = Object.freeze(Object.fromEntries(VOCI.map(
  ([nome,tempoLancio,gittata,componenti,durata,descrizione]) => [nome,Object.freeze({
    tempoLancio,gittata,componenti,durata,descrizione,verificato:true
  })]
)))
