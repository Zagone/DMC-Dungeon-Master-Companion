/**
 * Schede di classe consultabili — SRD 5.2.1 italiano (CC BY 4.0).
 *
 * I tratti iniziali sono dati strutturati controllati sulla tabella
 * "Tratti del ..." del PDF (pp. 32–85). I privilegi e le sottoclassi
 * derivano dall'archivio SRD con intestazioni e pagine originali.
 *
 * ATTENZIONE: le descrizioni sono ancora trascrizioni automatiche.
 * Non attribuire alle singole voci lo stato "editorialmente verificata".
 */
import { estraiClassiSRD } from './estrazioneClassiSRD.js'

export const TRATTI_CLASSI_SRD = Object.freeze({
  Barbaro: {
    caratteristiche: 'Forza',
    dadoVita: 'd12',
    tiriSalvezza: 'Forza e Costituzione',
    abilita: 'Due tra Addestrare Animali, Atletica, Intimidire, Natura, Percezione e Sopravvivenza',
    armi: 'Armi semplici e da guerra',
    armature: 'Armature leggere e medie; scudi',
    strumenti: '—',
    equipaggiamento: '(A) Ascia bipenne, 4 asce, dotazione da esploratore e 15 mo; oppure (B) 75 mo',
  },
  Bardo: {
    caratteristiche: 'Carisma',
    dadoVita: 'd8',
    tiriSalvezza: 'Destrezza e Carisma',
    abilita: 'Tre abilità a scelta',
    armi: 'Armi semplici',
    armature: 'Armature leggere',
    strumenti: 'Tre strumenti musicali a scelta',
    equipaggiamento: '(A) Armatura di cuoio, 2 pugnali, strumento musicale, dotazione da intrattenitore e 19 mo; oppure (B) 90 mo',
  },
  Chierico: {
    caratteristiche: 'Saggezza',
    dadoVita: 'd8',
    tiriSalvezza: 'Saggezza e Carisma',
    abilita: 'Due tra Intuizione, Medicina, Persuasione, Religione e Storia',
    armi: 'Armi semplici',
    armature: 'Armature leggere e medie; scudi',
    strumenti: '—',
    equipaggiamento: '(A) Giaco di maglia, scudo, mazza, simbolo sacro, dotazione da sacerdote e 7 mo; oppure (B) 110 mo',
  },
  Druido: {
    caratteristiche: 'Saggezza',
    dadoVita: 'd8',
    tiriSalvezza: 'Intelligenza e Saggezza',
    abilita: 'Due tra Addestrare Animali, Arcano, Intuizione, Medicina, Natura, Percezione, Religione e Sopravvivenza',
    armi: 'Armi semplici',
    armature: 'Armature leggere e scudi',
    strumenti: 'Borsa da erborista',
    equipaggiamento: '(A) Armatura di cuoio, scudo, falcetto, focus druidico (bastone ferrato), dotazione da esploratore, borsa da erborista e 9 mo; oppure (B) 50 mo',
  },
  Guerriero: {
    caratteristiche: 'Forza o Destrezza',
    dadoVita: 'd10',
    tiriSalvezza: 'Forza e Costituzione',
    abilita: 'Due tra Acrobazia, Addestrare Animali, Atletica, Intimidire, Intuizione, Percezione, Persuasione, Sopravvivenza e Storia',
    armi: 'Armi semplici e da guerra',
    armature: 'Armature leggere, medie e pesanti; scudi',
    strumenti: '—',
    equipaggiamento: '(A) Cotta di maglia, spadone, mazzafrusto, 8 giavellotti, dotazione da avventuriero e 4 mo; (B) cuoio borchiato, scimitarra, spada corta, arco lungo, 20 frecce, faretra, dotazione da avventuriero e 11 mo; oppure (C) 155 mo',
  },
  Ladro: {
    caratteristiche: 'Destrezza',
    dadoVita: 'd8',
    tiriSalvezza: 'Destrezza e Intelligenza',
    abilita: 'Quattro tra Acrobazia, Atletica, Furtività, Indagare, Inganno, Intimidire, Intuizione, Percezione, Persuasione e Rapidità di Mano',
    armi: 'Armi semplici e armi da guerra con proprietà Accurata o Leggera',
    armature: 'Armature leggere',
    strumenti: 'Arnesi da scasso',
    equipaggiamento: '(A) Armatura di cuoio, 2 pugnali, spada corta, arco corto, 20 frecce, faretra, arnesi da scasso, dotazione da scassinatore e 8 mo; oppure (B) 100 mo',
  },
  Mago: {
    caratteristiche: 'Intelligenza',
    dadoVita: 'd6',
    tiriSalvezza: 'Intelligenza e Saggezza',
    abilita: 'Due tra Arcano, Indagare, Intuizione, Medicina, Natura, Religione e Storia',
    armi: 'Armi semplici',
    armature: 'Nessuna',
    strumenti: '—',
    equipaggiamento: '(A) 2 pugnali, focus arcano (bastone ferrato), veste, libro degli incantesimi, dotazione da studioso e 5 mo; oppure (B) 55 mo',
  },
  Monaco: {
    caratteristiche: 'Destrezza e Saggezza',
    dadoVita: 'd8',
    tiriSalvezza: 'Forza e Destrezza',
    abilita: 'Due tra Acrobazia, Atletica, Furtività, Intuizione, Religione e Storia',
    armi: 'Armi semplici e armi da guerra con proprietà Leggera',
    armature: 'Nessuna',
    strumenti: 'Uno strumento da artigiano o musicale a scelta',
    equipaggiamento: '(A) Lancia, 5 pugnali, strumento da artigiano o musicale, dotazione da esploratore e 11 mo; oppure (B) 50 mo',
  },
  Paladino: {
    caratteristiche: 'Forza e Carisma',
    dadoVita: 'd10',
    tiriSalvezza: 'Saggezza e Carisma',
    abilita: 'Due tra Atletica, Intimidire, Intuizione, Medicina, Persuasione e Religione',
    armi: 'Armi semplici e da guerra',
    armature: 'Armature leggere, medie e pesanti; scudi',
    strumenti: '—',
    equipaggiamento: '(A) Cotta di maglia, scudo, spada lunga, 6 giavellotti, simbolo sacro, dotazione da sacerdote e 9 mo; oppure (B) 150 mo',
  },
  Ranger: {
    caratteristiche: 'Destrezza e Saggezza',
    dadoVita: 'd10',
    tiriSalvezza: 'Forza e Destrezza',
    abilita: 'Tre tra Addestrare Animali, Atletica, Furtività, Indagare, Intuizione, Natura, Percezione e Sopravvivenza',
    armi: 'Armi semplici e da guerra',
    armature: 'Armature leggere e medie; scudi',
    strumenti: '—',
    equipaggiamento: '(A) Cuoio borchiato, scimitarra, spada corta, arco lungo, 20 frecce, faretra, focus druidico (rametto di vischio), dotazione da esploratore e 7 mo; oppure (B) 150 mo',
  },
  Stregone: {
    caratteristiche: 'Carisma',
    dadoVita: 'd6',
    tiriSalvezza: 'Costituzione e Carisma',
    abilita: 'Due tra Arcano, Inganno, Intimidire, Intuizione, Persuasione e Religione',
    armi: 'Armi semplici',
    armature: 'Nessuna',
    strumenti: '—',
    equipaggiamento: '(A) Lancia, 2 pugnali, focus arcano (cristallo), dotazione da avventuriero e 28 mo; oppure (B) 50 mo',
  },
  Warlock: {
    caratteristiche: 'Carisma',
    dadoVita: 'd8',
    tiriSalvezza: 'Saggezza e Carisma',
    abilita: 'Due tra Arcano, Indagare, Inganno, Intimidire, Natura, Religione e Storia',
    armi: 'Armi semplici',
    armature: 'Armature leggere',
    strumenti: '—',
    equipaggiamento: '(A) Armatura di cuoio, falcetto, 2 pugnali, focus arcano (globo), libro di scienze occulte, dotazione da studioso e 15 mo; oppure (B) 100 mo',
  },
})

const SOTTOCLASSI_SRD = Object.freeze({
  Barbaro: 'Cammino del berserker',
  Bardo: 'Collegio della Sapienza',
  Chierico: 'Dominio della Vita',
  Druido: 'Circolo della Terra',
  Guerriero: 'Campione',
  Ladro: 'Furfante',
  Mago: 'Invocatore',
  Monaco: 'Guerriero della Mano Aperta',
  Paladino: 'Giuramento di devozione',
  Ranger: 'Cacciatore',
  Stregone: 'Stregoneria draconica',
  Warlock: 'Patrono immondo',
})

const INTESTAZIONE_LIVELLO = /^Livello\s+([1-9]|1[0-9]|20)\s*:\s*(.+)$/i
const INTESTAZIONE_SOTTOCLASSE = /^Sottoclasse\s+(?:del|dello|della)\s+[^:]+:\s*(.*)$/i
const INTESTAZIONE_PRIVILEGI = /^Privilegi di classe\s+(?:del|dello|della)\s+\S+/i
const INTESTAZIONE_LISTA = /^(?:Lista degli incantesimi|Elenco degli incantesimi)\b/i
const RIGA_RUMORE = /^(?:System Reference Document 5\.2\.1|\d+\s+S\s+t\s+R\s+f\s+D|\d+)$/i

function pulisci(riga) {
  return String(riga || '').replace(/\u00ad/g, '').trim().replace(/\s+/g, ' ')
}

function paragrafi(righe) {
  return righe.map(({ testo }) => pulisci(testo))
    .filter((testo) => testo && !RIGA_RUMORE.test(testo))
    .join('\n')
    .trim()
}

/** La segmentazione delle capacità avviene per intestazione e conserva
 * l'intero testo fino alla capacità successiva, non solo la sintesi. */
function separaPrivilegi(righe) {
  const voci = []
  let corrente = null
  let interrotto = false
  for (let i = 0; i < righe.length && !interrotto; i++) {
    const riga = pulisci(righe[i].testo)
    if (INTESTAZIONE_LISTA.test(riga)) {
      interrotto = true
      continue
    }
    const trovato = INTESTAZIONE_LIVELLO.exec(riga)
    if (trovato) {
      const nomeBase = trovato[2]
      let nome = nomeBase
      if (/\b(?:di|del|della|dello|dei|degli|delle|per|con|e)$/i.test(nomeBase)) {
        const prossima = pulisci(righe[i + 1]?.testo)
        if (prossima.length && prossima.length < 45 && !INTESTAZIONE_LIVELLO.test(prossima)) {
          nome = nomeBase + ' ' + prossima
          i++
        }
      }
      corrente = { livello: Number(trovato[1]), nome, pagina: righe[i].pagina, testo: '' }
      voci.push(corrente)
      continue
    }
    if (corrente && riga && !RIGA_RUMORE.test(riga)) {
      corrente.testo += (corrente.testo ? '\n' : '') + riga
    }
  }
  return voci.filter((voce) => voce.testo.length >= 12)
}

function raggruppaLivelli(privilegi) {
  const gruppi = new Map()
  for (const privilegio of privilegi) {
    if (!gruppi.has(privilegio.livello))
      gruppi.set(privilegio.livello, { livello: privilegio.livello, privilegi: [] })
    gruppi.get(privilegio.livello).privilegi.push(privilegio)
  }
  return [...gruppi.values()].sort((a, b) => a.livello - b.livello)
}

function estraiScheda(classe) {
  const righe = classe.righe
  const indiceInizioPrivilegi = righe.findIndex(({ testo }) =>
    INTESTAZIONE_PRIVILEGI.test(pulisci(testo)))
  const indiceSottoclasse = righe.findIndex(({ testo }) =>
    INTESTAZIONE_SOTTOCLASSE.test(pulisci(testo)))

  if (indiceInizioPrivilegi < 0 || indiceSottoclasse <= indiceInizioPrivilegi)
    throw new Error('Sezioni dei privilegi e della sottoclasse non riconosciute: ' + classe.nome)

  const bloccoBase = righe.slice(indiceInizioPrivilegi + 1, indiceSottoclasse)
  const bloccoSottoclasse = righe.slice(indiceSottoclasse)
  const privilegi = separaPrivilegi(bloccoBase)
  const primoLivello = bloccoSottoclasse.findIndex(({ testo }) =>
    INTESTAZIONE_LIVELLO.test(pulisci(testo)))
  if (primoLivello < 0)
    throw new Error('Privilegi della sottoclasse assenti: ' + classe.nome)

  const nomeSottoclasse = SOTTOCLASSI_SRD[classe.nome]
  const intro = paragrafi(bloccoSottoclasse.slice(1, primoLivello))
  const privilegiSottoclasse = separaPrivilegi(bloccoSottoclasse.slice(primoLivello))
  const tratti = TRATTI_CLASSI_SRD[classe.nome]
  if (!tratti || !nomeSottoclasse || !privilegi.length || !privilegiSottoclasse.length)
    throw new Error('Scheda della classe incompleta: ' + classe.nome)

  return {
    nome: classe.nome,
    pagine: classe.pagine,
    tratti,
    privilegi: raggruppaLivelli(privilegi),
    sottoclasse: {
      nome: nomeSottoclasse,
      pagina: bloccoSottoclasse[0].pagina,
      introduzione: intro,
      privilegi: raggruppaLivelli(privilegiSottoclasse),
    },
    // Un riferimento integrale conserva le tabelle e le sezioni particolari
    // non ancora rappresentate come singole capacità.
    testoOriginale: classe.testo,
    estrazioneAutomatica: true,
  }
}

export function estraiDettagliClassiSRD(archivio) {
  return new Map([...estraiClassiSRD(archivio)]
    .map(([nome, classe]) => [nome, estraiScheda(classe)]))
}
