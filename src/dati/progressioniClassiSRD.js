/**
 * D&D SRD 5.2.1 IT — Progressioni delle dodici classi.
 * Fonte primaria: IT_SRD_CC_v5.2.1_copia.pdf, pp. 32–86 (CC BY 4.0).
 * Celle ricostruite dal layout tipografico delle tabelle originali, non
 * dal testo linearizzato del PDF. Non includere dati proprietari non SRD.
 *
 * Ogni riga conserva esattamente le celle dei privilegi, delle risorse e
 * degli slot. La progressione degli slot è condivisa soltanto dopo il
 * confronto tra tutte le righe delle rispettive tabelle originali.
 */
const SLOT_COMPLETO = Object.freeze(`
2--------
3--------
42-------
43-------
432------
433------
4331-----
4332-----
43331----
43332----
433321---
433321---
4333211--
4333211--
43332111-
43332111-
433321111
433331111
433332111
433332211`.trim().split('\n').map((r) => [...r].map((c) => c === '-' ? '—' : c)))

const SLOT_RIDOTTO = Object.freeze(`
2----
2----
3----
3----
42---
42---
43---
43---
432--
432--
433--
433--
4331-
4331-
4332-
4332-
43331
43331
43332
43332`.trim().split('\n').map((r) => [...r].map((c) => c === '-' ? '—' : c)))

const DATI = {
  "Barbaro": {
    "pagina": 32,
    "aggiunte": [
      "Ire",
      "Danni dell’ira",
      "Padronanza d’armi"
    ],
    "righe": "Difesa senza armatura, Ira, Padronanza d'armi|2,+2,2\nAttacco irruento, Percezione del pericolo|2,+2,2\nConoscenza primordiale, sottoclasse del barbaro|3,+2,2\nAumento dei punteggi di caratteristica|3,+2,3\nAttacco extra, Movimento veloce|3,+2,3\nPrivilegio della sottoclasse|4,+2,3\nBalzo istintivo, Istinto ferino|4,+2,3\nAumento dei punteggi di caratteristica|4,+2,3\nColpo brutale|4,+3,3\nPrivilegio della sottoclasse|4,+3,4\nIra implacabile|4,+3,4\nAumento dei punteggi di caratteristica|5,+3,4\nColpo brutale migliorato|5,+3,4\nPrivilegio della sottoclasse|5,+3,4\nIra persistente|5,+3,4\nAumento dei punteggi di caratteristica|5,+4,4\nColpo brutale migliorato|6,+4,4\nPotenza indomabile|6,+4,4\nDono epico|6,+4,4\nCampione primordiale|6,+4,4"
  },
  "Bardo": {
    "pagina": 36,
    "aggiunte": [
      "Dado bardico",
      "Trucchetti",
      "Incantesimi preparati"
    ],
    "slot": "completo",
    "righe": "Incantesimi, Ispirazione bardica|D6,2,4\nMaestria, Factotum|D6,2,5\nSottoclasse del bardo|D6,2,6\nAumento dei punteggi di caratteristica|D6,3,7\nFonte di ispirazione|D8,3,9\nPrivilegio della sottoclasse|D8,3,10\nControfascino|D8,3,11\nAumento dei punteggi di caratteristica|D8,3,12\nMaestria|D8,3,14\nSegreti magici|D10,4,15\n—|D10,4,16\nAumento dei punteggi di caratteristica|D10,4,16\n—|D10,4,17\nPrivilegio della sottoclasse|D10,4,17\n—|D12,4,18\nAumento dei punteggi di caratteristica|D12,4,18\n—|D12,4,19\nIspirazione superiore|D12,4,20\nDono epico|D12,4,21\nParole della creazione|D12,4,22"
  },
  "Chierico": {
    "pagina": 42,
    "aggiunte": [
      "Incanalare divinità",
      "Trucchetti",
      "Incantesimi preparati"
    ],
    "slot": "completo",
    "righe": "Incantesimi, Ordine divino|—,3,4\nIncanalare divinità|2,3,5\nSottoclasse del chierico|2,3,6\nAumento dei punteggi di caratteristica|2,4,7\nBruciare i non morti|2,4,9\nPrivilegio della sottoclasse|3,4,10\nColpi benedetti|3,4,11\nAumento dei punteggi di caratteristica|3,4,12\n—|3,4,14\nIntervento divino|3,5,15\n—|3,5,16\nAumento dei punteggi di caratteristica|3,5,16\n—|3,5,17\nColpi benedetti migliorati|3,5,17\n—|3,5,18\nAumento dei punteggi di caratteristica|3,5,18\nPrivilegio della sottoclasse|3,5,19\n—|4,5,20\nDono epico|4,5,21\nIntervento divino superiore|4,5,22"
  },
  "Druido": {
    "pagina": 47,
    "aggiunte": [
      "Forma selvatica",
      "Trucchetti",
      "Incantesimi preparati"
    ],
    "slot": "completo",
    "righe": "Druidico, Incantesimi e Ordine primordiale|—,2,4\nCompagno selvatico, Forma selvatica|2,2,5\nSottoclasse del druido|2,2,6\nAumento dei punteggi di caratteristica|2,3,7\nRinascita selvatica|2,3,9\nPrivilegio della sottoclasse|3,3,10\nFuria elementale|3,3,11\nAumento dei punteggi di caratteristica|3,3,12\n—|3,3,14\nPrivilegio della sottoclasse|3,4,15\n—|3,4,16\nAumento dei punteggi di caratteristica|3,4,16\n—|3,4,17\nPrivilegio della sottoclasse|3,4,17\nFuria elementale migliorata|3,4,18\nAumento dei punteggi di caratteristica|3,4,18\n—|4,4,19\nIncantesimi bestiali|4,4,20\nDono epico|4,4,21\nArcidruido|4,4,22"
  },
  "Guerriero": {
    "pagina": 53,
    "aggiunte": [
      "Recuperare energie",
      "Padronanza d’armi"
    ],
    "righe": "Padronanza d'armi, Recuperare energie e Stile di combattimento|2,3\nAzione impetuosa (un utilizzo), Mente tattica|2,3\nSottoclasse del guerriero|2,3\nAumento dei punteggi di caratteristica|3,4\nAttacco extra, Spostamento tattico|3,4\nAumento dei punteggi di caratteristica|3,4\nPrivilegio della sottoclasse|3,4\nAumento dei punteggi di caratteristica|3,4\nIndomabile (un utilizzo), Signore delle tattiche|3,4\nPrivilegio della sottoclasse|4,5\nDue attacchi extra|4,5\nAumento dei punteggi di caratteristica|4,5\nAttacchi studiati, Indomabile (due utilizzi)|4,5\nAumento dei punteggi di caratteristica|4,5\nPrivilegio della sottoclasse|4,5\nAumento dei punteggi di caratteristica|4,6\nAzione impetuosa (due utilizzi), Indomabile (tre utilizzi)|4,6\nPrivilegio della sottoclasse|4,6\nDono epico|4,6\nTre attacchi extra|4,6"
  },
  "Ladro": {
    "pagina": 56,
    "aggiunte": [
      "Attacco furtivo"
    ],
    "righe": "Maestria, Attacco furtivo, Gergo ladresco, Padronanza d'armi|1d6\nAzione scaltra|1d6\nSottoclasse del ladro, Mira ferma|2d6\nAumento dei punteggi di caratteristica|2d6\nColpo astuto, Schivata prodigiosa|3d6\nMaestria|3d6\nElusione, Dote affidabile|4d6\nAumento dei punteggi di caratteristica|4d6\nPrivilegio della sottoclasse|5d6\nAumento dei punteggi di caratteristica|5d6\nColpo astuto migliorato|6d6\nAumento dei punteggi di caratteristica|6d6\nPrivilegio della sottoclasse|7d6\nColpi infidi|7d6\nMente sfuggente|8d6\nAumento dei punteggi di caratteristica|8d6\nPrivilegio della sottoclasse|9d6\nInafferrabile|9d6\nDono epico|10d6\nPietra della buona fortuna|10d6"
  },
  "Mago": {
    "pagina": 59,
    "aggiunte": [
      "Trucchetti",
      "Incantesimi preparati"
    ],
    "slot": "completo",
    "righe": "Incantesimi, Adepto dei rituali, Recupero arcano|3,4\nStudioso|3,5\nSottoclasse del mago|3,6\nAumento dei punteggi di caratteristica|4,7\nMemorizzare incantesimi|4,9\nPrivilegio della sottoclasse|4,10\n—|4,11\nAumento dei punteggi di caratteristica|4,12\n—|4,14\nPrivilegio della sottoclasse|5,15\n—|5,16\nAumento dei punteggi di caratteristica|5,16\n—|5,17\nPrivilegio della sottoclasse|5,18\n—|5,19\nAumento dei punteggi di caratteristica|5,21\n—|5,22\nMaestria negli incantesimi|5,23\nDono epico|5,24\nIncantesimi personali|5,25"
  },
  "Monaco": {
    "pagina": 66,
    "aggiunte": [
      "Arti marziali",
      "Punti concentrazione",
      "Movimento senza armatura"
    ],
    "righe": "Arti marziali, Difesa senza armatura|1d6,—,—\nConcentrazione da monaco, Metabolismo straordinario, Movimento senza armatura|1d6,2,+3 m\nDevia attacchi, sottoclasse del monaco|1d6,3,+3 m\nAumento dei punteggi di caratteristica, Caduta lenta|1d6,4,+3 m\nAttacco extra, Colpo stordente|1d8,5,+3 m\nColpi potenziati, privilegio della sottoclasse|1d8,6,+4,5 m\nElusione|1d8,7,+4,5 m\nAumento dei punteggi di caratteristica|1d8,8,+4,5 m\nMovimento acrobatico|1d8,9,+4,5 m\nAutorigenerazione, Concentrazione superiore|1d8,10,+6 m\nPrivilegio della sottoclasse|1d10,11,+6 m\nAumento dei punteggi di caratteristica|1d10,12,+6 m\nDeviare energia|1d10,13,+6 m\nEsperto di sopravvivenza disciplinato|1d10,14,+7,5 m\nConcentrazione perfetta|1d10,15,+7,5 m\nAumento dei punteggi di caratteristica|1d10,16,+7,5 m\nPrivilegio della sottoclasse|1d12,17,+7,5 m\nDifesa superiore|1d12,18,+9 m\nDono epico|1d12,19,+9 m\nCorpo e mente|1d12,20,+9 m"
  },
  "Paladino": {
    "pagina": 70,
    "aggiunte": [
      "Incanalare divinità",
      "Incantesimi preparati"
    ],
    "slot": "ridotto",
    "righe": "Imposizione delle mani, Incantesimi, Padronanza d'armi|—,2\nStile di combattimento, Punizione del paladino|—,3\nIncanalare divinità, sottoclasse del paladino|2,4\nAumento dei punteggi di caratteristica|2,5\nAttacco extra, Fido destriero|2,6\nAura di protezione|2,6\nPrivilegio della sottoclasse|2,7\nAumento dei punteggi di caratteristica|2,7\nAbiurare nemici|2,9\nAura di coraggio|2,9\nColpi radiosi|3,10\nAumento dei punteggi di caratteristica|3,10\n—|3,11\nTocco rigenerante|3,11\nPrivilegio della sottoclasse|3,12\nAumento dei punteggi di caratteristica|3,12\n—|3,14\nAmpliamento dell'aura|3,14\nDono epico|3,15\nPrivilegio della sottoclasse|3,15"
  },
  "Ranger": {
    "pagina": 75,
    "aggiunte": [
      "Nemico prescelto",
      "Incantesimi preparati"
    ],
    "slot": "ridotto",
    "righe": "Incantesimi, Nemico prescelto, Padronanza d'armi|2,2\nEsploratore esperto, Stile di combattimento|2,3\nSottoclasse del ranger|2,4\nAumento dei punteggi di caratteristica|2,5\nAttacco extra|3,6\nGirovago|3,6\nPrivilegio della sottoclasse|3,7\nAumento dei punteggi di caratteristica|3,7\nMaestria|4,9\nInstancabile|4,9\nPrivilegio della sottoclasse|4,10\nAumento dei punteggi di caratteristica|4,10\nCacciatore implacabile|5,11\nVelo della natura|5,11\nPrivilegio della sottoclasse|5,12\nAumento dei punteggi di caratteristica|5,12\nPrecisione del cacciatore|6,14\nSensi ferini|6,14\nDono epico|6,15\nSterminatore di nemici|6,15"
  },
  "Stregone": {
    "pagina": 80,
    "aggiunte": [
      "Punti stregoneria",
      "Trucchetti",
      "Incantesimi preparati"
    ],
    "slot": "completo",
    "righe": "Incantesimi, Stregoneria innata|—,4,2\nFonte di magia, Metamagia|2,4,4\nSottoclasse dello stregone|3,4,6\nAumento dei punteggi di caratteristica|4,5,7\nRipristino stregonesco|5,5,9\nPrivilegio della sottoclasse|6,5,10\nStregoneria incarnata|7,5,11\nAumento dei punteggi di caratteristica|8,5,12\n—|9,5,14\nMetamagia|10,6,15\n—|11,6,16\nAumento dei punteggi di caratteristica|12,6,16\n—|13,6,17\nPrivilegio della sottoclasse|14,6,17\n—|15,6,18\nAumento dei punteggi di caratteristica|16,6,18\nMetamagia|17,6,19\nPrivilegio della sottoclasse|18,6,20\nDono epico|19,6,21\nApoteosi arcana|20,6,22"
  },
  "Warlock": {
    "pagina": 86,
    "aggiunte": [
      "Suppliche occulte",
      "Trucchetti",
      "Incantesimi preparati",
      "Slot incantesimo",
      "Livello di slot"
    ],
    "righe": "Suppliche occulte, Magia del patto|1,2,2,1,1\nScaltrezza magica|3,2,3,2,1\nSottoclasse del warlock|3,2,4,2,2\nAumento dei punteggi di caratteristica|3,3,5,2,2\n—|5,3,6,2,3\nPrivilegio della sottoclasse|5,3,7,2,3\n—|6,3,8,2,4\nAumento dei punteggi di caratteristica|6,3,9,2,4\nContatta patrono|7,3,10,2,5\nPrivilegio della sottoclasse|7,4,10,2,5\nArcanum mistico (incantesimo di 6º livello)|7,4,11,3,5\nAumento dei punteggi di caratteristica|8,4,11,3,5\nArcanum mistico (incantesimo di 7º livello)|8,4,12,3,5\nPrivilegio della sottoclasse|8,4,12,3,5\nArcanum mistico (incantesimo di 8º livello)|9,4,13,3,5\nAumento dei punteggi di caratteristica|9,4,13,3,5\nArcanum mistico (incantesimo di 9º livello)|9,4,14,4,5\n—|10,4,14,4,5\nDono epico|10,4,15,4,5\nMaestro dell'occulto|10,4,15,4,5"
  }
}

function creaTabella(nome, voce) {
  const slot = voce.slot === 'completo'
    ? SLOT_COMPLETO
    : voce.slot === 'ridotto' ? SLOT_RIDOTTO : null
  const intestazioni = Object.freeze([
    'Livello',
    'Bonus di competenza',
    'Privilegi di classe',
    ...voce.aggiunte,
    ...(slot ? Array.from({ length: slot[0].length },
      (_, indice) => 'Slot di ' + (indice + 1) + 'º livello') : []),
  ])
  const righe = voce.righe.trim().split('\n').map((testo, indice) => {
    const divisore = testo.indexOf('|')
    if (divisore < 0) throw new Error('Riga progressione malformata: ' + nome)
    const privilegi = testo.slice(0, divisore)
    const altreCelle = testo.slice(divisore + 1).split(',')
    const livello = indice + 1
    const bonus = '+' + (2 + Math.floor(indice / 4))
    const riga = Object.freeze([
      String(livello), bonus, privilegi,
      ...altreCelle,
      ...(slot ? slot[indice] : []),
    ])
    if (riga.length !== intestazioni.length)
      throw new Error('Colonne non valide nella progressione ' + nome + ', livello ' + livello)
    return riga
  })
  if (righe.length !== 20) throw new Error('La progressione deve contenere 20 livelli: ' + nome)
  return Object.freeze({
    nome,
    paginaSRD: voce.pagina,
    colonne: intestazioni,
    righe: Object.freeze(righe),
    fonte: 'SRD 5.2.1 italiano — CC BY 4.0',
  })
}

export const PROGRESSIONI_CLASSI_SRD = Object.freeze(
  Object.fromEntries(Object.entries(DATI)
    .map(([nome, voce]) => [nome, creaTabella(nome, voce)])),
)
