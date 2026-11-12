/**
 * I quattro background del SRD 5.2.1 italiano, p. 93.
 * Campi trascritti dalla sezione "Descrizioni dei background".
 * Il testo dell'equipaggiamento è conservato come testo, non come
 * identificativi d'inventario, per evitare collegamenti ambigui.
 */
export const BACKGROUND_SRD = Object.freeze(
  [
    {
      nome: 'Accolito',
      caratteristiche: ['Intelligenza', 'Saggezza', 'Carisma'],
      talento: 'Iniziato alla magia (chierico)',
      abilita: ['Intuizione', 'Religione'],
      strumenti: 'Scorte da calligrafo',
      equipaggiamentoA:
        'Scorte da calligrafo, libro (preghiere), simbolo sacro, pergamena (10 fogli), tunica, 8 mo',
      equipaggiamentoB: '50 mo',
    },
    {
      nome: 'Criminale',
      caratteristiche: ['Destrezza', 'Costituzione', 'Intelligenza'],
      talento: 'Allerta',
      abilita: ['Rapidità di mano', 'Furtività'],
      strumenti: 'Arnesi da scasso',
      equipaggiamentoA:
        '2 pugnali, arnesi da scasso, piede di porco, 2 borse, abiti da viaggiatore, 16 mo',
      equipaggiamentoB: '50 mo',
    },
    {
      nome: 'Sapiente',
      caratteristiche: ['Costituzione', 'Intelligenza', 'Saggezza'],
      talento: 'Iniziato alla magia (mago)',
      abilita: ['Arcano', 'Storia'],
      strumenti: 'Scorte da calligrafo',
      equipaggiamentoA:
        'Bastone ferrato, scorte da calligrafo, libro (storia), pergamena (8 fogli), tunica, 8 mo',
      equipaggiamentoB: '50 mo',
    },
    {
      nome: 'Soldato',
      caratteristiche: ['Forza', 'Destrezza', 'Costituzione'],
      talento: 'Aggressore selvaggio',
      abilita: ['Atletica', 'Intimidire'],
      strumenti: 'Un tipo di gioco a scelta',
      equipaggiamentoA:
        'Lancia, arco corto, 20 frecce, gioco (lo stesso scelto sopra), borsa del guaritore, faretra, abiti da viaggiatore, 14 mo',
      equipaggiamentoB: '50 mo',
    },
  ].map((voce) =>
    Object.freeze({
      ...voce,
      caratteristiche: Object.freeze(voce.caratteristiche),
      abilita: Object.freeze(voce.abilita),
      pagina: 93,
      fonte: 'SRD 5.2.1 italiano',
      verificato: true,
    }),
  ),
)
