// SRD 5.2.1 italiano, pagine 105-107. Dati tabellari sintetici;
// per utilizzi, creazioni e varianti consultare il testo ufficiale.
const voci = [
  ['Scorte da alchimista', 'Artigiano', 'Intelligenza', '50 mo', '4 kg', 105],
  ['Scorte da birraio', 'Artigiano', 'Intelligenza', '20 mo', '4,5 kg', 105],
  ['Scorte da calligrafo', 'Artigiano', 'Destrezza', '10 mo', '2,5 kg', 105],
  ['Strumenti da calzolaio', 'Artigiano', 'Destrezza', '5 mo', '2,5 kg', 105],
  ['Strumenti da cartografo', 'Artigiano', 'Saggezza', '15 mo', '3 kg', 105],
  ['Strumenti da conciatore', 'Artigiano', 'Destrezza', '5 mo', '2,5 kg', 105],
  ['Strumenti da fabbro', 'Artigiano', 'Forza', '20 mo', '4 kg', 106],
  ['Strumenti da falegname', 'Artigiano', 'Forza', '8 mo', '3 kg', 106],
  ['Strumenti da gioielliere', 'Artigiano', 'Intelligenza', '25 mo', '1 kg', 106],
  ['Strumenti da intagliatore', 'Artigiano', 'Destrezza', '1 mo', '2,5 kg', 106],
  ['Strumenti da inventore', 'Artigiano', 'Destrezza', '50 mo', '5 kg', 106],
  ['Strumenti da muratore', 'Artigiano', 'Forza', '10 mo', '4 kg', 106],
  ['Strumenti da pittore', 'Artigiano', 'Saggezza', '10 mo', '2,5 kg', 106],
  ['Strumenti da soffiatore', 'Artigiano', 'Intelligenza', '30 mo', '2,5 kg', 106],
  ['Strumenti da tessitore', 'Artigiano', 'Destrezza', '1 mo', '2,5 kg', 106],
  ['Strumenti da vasaio', 'Artigiano', 'Intelligenza', '10 mo', '1,5 kg', 106],
  ['Utensili da cuoco', 'Artigiano', 'Saggezza', '1 mo', '4 kg', 106],
  ['Arnesi da falsario', 'Altro', 'Destrezza', '15 mo', '2,5 kg', 106],
  ['Arnesi da scasso', 'Altro', 'Destrezza', '25 mo', '0,5 kg', 106],
  ['Borsa da erborista', 'Altro', 'Intelligenza', '5 mo', '1,5 kg', 106],
  ['Gioco', 'Altro', 'Saggezza', 'variabile', '—', 106],
  ['Sostanze da avvelenatore', 'Altro', 'Intelligenza', '50 mo', '1 kg', 106],
  ['Strumenti da navigatore', 'Altro', 'Saggezza', '25 mo', '1 kg', 106],
  ['Strumento musicale', 'Altro', 'Carisma', 'variabile', 'variabile', 107],
  ['Trucchi per il camuffamento', 'Altro', 'Carisma', '25 mo', '1,5 kg', 107],
]
export const STRUMENTI_SRD = Object.freeze(
  voci.map(([nome, tipologia, caratteristica, costo, peso, pagina]) =>
    Object.freeze({
      nome,
      tipologia,
      caratteristica,
      costo,
      peso,
      pagina,
      fonte: 'SRD 5.2.1 italiano',
      dettagliCompleti: false,
    }),
  ),
)
