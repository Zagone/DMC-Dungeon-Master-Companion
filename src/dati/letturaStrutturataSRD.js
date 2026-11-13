/**
 * Trasforma gli archivi SRD per pagina in testi associati alle singole voci.
 * Fonte: SRD 5.2.1 italiano (CC BY 4.0).
 * I titoli del glossario sono stati ricontrollati sull'impaginazione originale,
 * pp. 202–218. La segmentazione del testo resta automatica: non attribuisce
 * una verifica editoriale al contenuto estratto.
 */
const INTESTAZIONI_GLOSSARIO = String.raw`Abilità|Accecato [condizione]|Affascinato [condizione]|Afferrare|Afferrato [condizione]|Aiuto [azione]|Al giorno|Alleato|Allineamento|Amichevole [atteggiamento]|Area di effetto|Arma|Armi improvvisate|Arrotondare per difetto|Assordato [condizione]|Attacchi di opportunità|Attacco [azione]|Attacco con arma|Attacco con incantesimo|Atteggiamento|Avvelenato [condizione]|Avventura|Azione|Azione bonus|Bersaglio|Caduta [pericolo]|Campagna|Capacità di trasporto|Cilindro [area di effetto]|Classe Armatura|Classe Difficoltà|Colpo critico|Colpo senz'armi|Competenza|Competenza nelle armature|Concentrazione|Condizione|Cono [area di effetto]|Copertura|Creatura|Cubo [area di effetto]|Dadi Vita|Danni|Disidratazione [pericolo]|Disimpegno [azione]|Effetti simultanei|Effetto magico|Emanazione [area di effetto]|Fluttuare|Focus da incantatore|Grado di sfida|Guarigione|Illusioni|Immunità|Incantesimo|Incapacitato [condizione]|Incontro|Indebolimento [condizione]|Indifferente [atteggiamento]|In fiamme [pericolo]|Influenza [azione]|Iniziativa|Invisibile [condizione]|Ispirazione eroica|Leggermente oscurata|Linea [area di effetto]|Luce fioca|Luce intensa|Maestria|Magia [azione]|Maledizioni|Malnutrizione [pericolo]|Morte|Mostro|Mutaforma|Nascondersi [azione]|Nemico|Nuotare|Oggetto|Oscurità|Ostile [atteggiamento]|Paralizzato [condizione]|Percezione passiva|Percezione tellurica|Pericolo|Personaggio giocante|Personaggio non giocante|Pesantemente oscurata|Pietrificato [condizione]|Portata|Possessione|Prepararsi [azione]|Privo di sensi [condizione]|Prono [condizione]|Prova con D20|Prova di caratteristica|Punteggio di caratteristica e modificatore|Punti esperienza|Punti ferita|Punti ferita temporanei|Reazione|Resistenza|Ricerca [azione]|Riposo breve|Riposo lungo|Rituale|Rompere gli oggetti|Saltare|Salto in alto|Salto in lungo|Sanguinante|Scalare|Scatto [azione]|Scheda delle statistiche|Scheda del personaggio|Schivata [azione]|Scurovisione|Sfera [area di effetto]|Sintonia|Soffocamento [pericolo]|Soglia di danno|Sorpresa|Spaventato [condizione]|Spazio libero|Spazio occupato|Stabile|Stordito [condizione]|Strisciare|Studio [azione]|Svantaggio|Taglia|Telepatia|Teletrasporto|Terreno difficile|Tipi di danno|Tipo di creatura|Tiro per colpire|Tiro per i danni|Tiro salvezza|Tiro salvezza contro morte|Tramortire una creatura|Trattenuto [condizione]|Trucchetto|Utilizzo [azione]|Vantaggio|Velocità`.split('|')


// Pagine delle intestazioni verificate sul PDF originale tramite font dei titoli.
const PAGINE_GLOSSARIO = new Map(
  Object.entries({
  "202": "Abilità|Accecato [condizione]|Affascinato [condizione]|Afferrare",
  "203": "Afferrato [condizione]|Aiuto [azione]|Al giorno|Alleato|Allineamento|Amichevole [atteggiamento]|Area di effetto|Arma|Armi improvvisate",
  "204": "Arrotondare per difetto|Assordato [condizione]|Attacchi di opportunità|Attacco [azione]|Attacco con arma|Attacco con incantesimo|Atteggiamento|Avvelenato [condizione]|Avventura|Azione",
  "205": "Azione bonus|Bersaglio|Caduta [pericolo]|Campagna|Capacità di trasporto|Cilindro [area di effetto]|Classe Armatura|Classe Difficoltà|Colpo critico|Colpo senz'armi",
  "206": "Competenza|Competenza nelle armature|Concentrazione|Condizione|Cono [area di effetto]|Copertura|Creatura|Cubo [area di effetto]",
  "207": "Dadi Vita|Danni|Disidratazione [pericolo]|Disimpegno [azione]|Effetti simultanei|Effetto magico|Emanazione [area di effetto]|Fluttuare|Focus da incantatore|Grado di sfida|Guarigione|Illusioni",
  "208": "Immunità|Incantesimo|Incapacitato [condizione]|Incontro|Indebolimento [condizione]|Indifferente [atteggiamento]|In fiamme [pericolo]|Influenza [azione]|Iniziativa",
  "209": "Invisibile [condizione]|Ispirazione eroica|Leggermente oscurata|Linea [area di effetto]|Luce fioca|Luce intensa|Maestria|Magia [azione]|Maledizioni|Malnutrizione [pericolo]",
  "210": "Morte|Mostro|Mutaforma|Nascondersi [azione]|Nemico|Nuotare|Oggetto|Oscurità|Ostile [atteggiamento]|Paralizzato [condizione]",
  "211": "Percezione passiva|Percezione tellurica|Pericolo|Personaggio giocante|Personaggio non giocante|Pesantemente oscurata|Pietrificato [condizione]|Portata|Possessione|Prepararsi [azione]",
  "212": "Privo di sensi [condizione]|Prono [condizione]|Prova con D20|Prova di caratteristica|Punteggio di caratteristica e modificatore|Punti esperienza|Punti ferita|Punti ferita temporanei|Reazione|Resistenza|Ricerca [azione]",
  "213": "Riposo breve|Riposo lungo|Rituale|Rompere gli oggetti",
  "214": "Saltare|Salto in alto|Salto in lungo|Sanguinante|Scalare|Scatto [azione]",
  "215": "Scheda delle statistiche|Scheda del personaggio|Schivata [azione]|Scurovisione",
  "216": "Sfera [area di effetto]|Sintonia|Soffocamento [pericolo]|Soglia di danno|Sorpresa|Spaventato [condizione]|Spazio libero|Spazio occupato|Stabile|Stordito [condizione]|Strisciare|Studio [azione]",
  "217": "Svantaggio|Taglia|Telepatia|Teletrasporto|Terreno difficile|Tipi di danno",
  "218": "Tipo di creatura|Tiro per colpire|Tiro per i danni|Tiro salvezza|Tiro salvezza contro morte|Tramortire una creatura|Trattenuto [condizione]|Trucchetto|Utilizzo [azione]|Vantaggio|Velocità"
}).flatMap(([pagina, voci]) =>
    voci.split('|').map((titolo) => [titolo.toLocaleLowerCase('it-IT'), Number(pagina)]),
  ),
)

const NOMI_SPECIE = ['Dragonide','Elfo','Gnomo','Goliath','Halfling','Nano','Orco','Tiefling','Umano']
const NOMI_ORIGINI = ['Accolito','Criminale','Sapiente','Soldato']
const INTERRUZIONI_PAGINA = /^(?:System Reference Document 5\.2\.1|\d+\s+S\s+t\s+R\s+f\s+D.*)$/i

export function chiaveSRD(testo) {
  return String(testo || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it-IT').replace(/\s*\[[^\]]+\]\s*$/, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function righePulite(testo) {
  return String(testo || '').replace(/\u00ad/g, '').split(/\r?\n/)
    .map((riga) => riga.trim().replace(/\s+/g, ' '))
    .filter((riga) => riga && !INTERRUZIONI_PAGINA.test(riga))
}

function raccoltaSezioni(archivio, titoli, paginaMinima = 0, paginaMassima = Infinity) {
  // Il descrittore tra parentesi è parte dell'intestazione: senza di esso
  // riferimenti interni come «Incapacitato» sarebbero falsi nuovi titoli.
  const intestazione = (riga) => riga.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it-IT').replace(/\s+/g, ' ').trim()
  const titoliPerChiave = new Map(titoli.map((titolo) => [intestazione(titolo), titolo]))
  const sezioni = []
  const viste = new Set()
  let corrente = null
  for (const pagina of archivio?.pagine || []) {
    if (pagina.pagina < paginaMinima || pagina.pagina > paginaMassima) continue
    for (const riga of righePulite(pagina.testo)) {
      const titolo = titoliPerChiave.get(intestazione(riga))
      if (titolo && !viste.has(intestazione(titolo)) &&
        (paginaMinima !== 202 ||
          PAGINE_GLOSSARIO.get(titolo.toLocaleLowerCase('it-IT')) === pagina.pagina)) {
        viste.add(intestazione(titolo))
        corrente = { titolo, pagina: pagina.pagina, righe: [], pagine: [pagina.pagina] }
        sezioni.push(corrente)
        continue
      }
      if (!corrente) continue
      if (!corrente.pagine.includes(pagina.pagina)) corrente.pagine.push(pagina.pagina)
      corrente.righe.push(riga)
    }
  }
  return sezioni.map((sezione) => ({
    nome: sezione.titolo.replace(/\s*\[[^\]]+\]$/, ''),
    titoloFonte: sezione.titolo,
    pagina: sezione.pagina,
    pagine: sezione.pagine,
    testo: sezione.righe.join('\n').trim(),
  })).filter((v) => v.testo.length > 10)
}

/** Include tutte le voci del Glossario, non solo l'indice ridotto precedente. */
export function estraiGlossarioSRD(archivio) {
  if (!Array.isArray(archivio?.pagine)) throw new TypeError('Archivio del glossario non valido')
  return raccoltaSezioni(archivio, INTESTAZIONI_GLOSSARIO, 202, 218)
    .map((v) => {
      const categoria = /\[condizione\]$/i.test(v.titoloFonte) ? 'Condizioni' : 'Regole'
      return {
        id: 'glossario-' + chiaveSRD(v.titoloFonte),
        nome: v.nome,
        categoria,
        pagina: v.pagina,
        pagineFonte: v.pagine,
        sintesi: v.testo.replace(/\s+/g, ' ').slice(0, 170) + '…',
        descrizione: v.testo,
        dettagliCompleti: true,
        estrazioneAutomatica: true,
      }
    })
}

export function estraiTestiSpecieSRD(archivio) {
  if (!Array.isArray(archivio?.pagine)) throw new TypeError('Archivio specie non valido')
  // Nella pagina 97 la tabella "Retaggi immondi" occupa entrambe le colonne
  // ed è estratta dopo la scheda Umano. Il suo contenuto è già rappresentato
  // nei dati strutturati delle opzioni tiefling: non appartiene all'Umano.
  const pagine = archivio.pagine.map((pagina) => {
    if (pagina.pagina !== 97) return pagina
    const originale = pagina.testo
    const primaTabella = originale.split(/\n\s*Retaggi immondi\s*\n/i)[0]
    const inizioUmano = originale.search(/\n\s*Umano\s*\n/)
    // Le due metà della tabella sono estratte separatamente, prima e dopo
    // la scheda Umano. Conserviamo quindi il suo testo esplicitamente.
    const testoUmano = inizioUmano < 0
      ? ''
      : originale.slice(inizioUmano).split(/\n\s*Livello 3\s+Livello 5\s*\n/i)[0]
    return { ...pagina, testo: primaTabella + '\n' + testoUmano }
  })
  return new Map(raccoltaSezioni({ ...archivio, pagine }, NOMI_SPECIE, 94, 97)
    .map((v) => [v.nome, { testo: v.testo, pagina: v.pagina, pagine: v.pagine }]))
}

export function estraiTestiOriginiSRD(archivio) {
  if (!Array.isArray(archivio?.pagine)) throw new TypeError('Archivio origini non valido')
  return new Map(raccoltaSezioni(archivio, NOMI_ORIGINI, 93, 94)
    .map((v) => [v.nome, { testo: v.testo, pagina: v.pagina, pagine: v.pagine }]))
}

/** Associa la descrizione all'oggetto individuando il titolo e la riga tipologica
 * con rarità. Gli indici automatici non sono marcati come verificati. */
export function estraiTestiOggettiMagiciSRD(archivio, schede) {
  const schedePerChiave = new Map(schede.map((s) => [chiaveSRD(s.nome), s]))
  const risultati = new Map()
  const titoli = []
  let corrente = null
  const rigaTipo = (riga) =>
    /^(oggetto meraviglioso|anello|armatura|arma|bacchetta|bastone|pergamena|pozione|verga)(?:\s*\([^)]*\))?\s*,/i.test(riga)
  const possibileTitolo = (riga) =>
    /^[A-ZÀ-Ú]/.test(riga) &&
    riga.length >= 4 &&
    riga.length <= 100 &&
    !/[.:;!?]$/.test(riga) &&
    !/^(?:Il|La|Le|Lo|Un|Una|Uno|Se|Quando|Finché|Ogni|Ciascun|Per|Con|Inoltre|Questo|Questa|Questi|Queste|Tabella)\b/i.test(riga)

  for (const pagina of archivio?.pagine || []) {
    if (pagina.pagina < 237) continue
    const righe = righePulite(pagina.testo)
    for (let i = 0; i < righe.length; i++) {
      const singola = schedePerChiave.get(chiaveSRD(righe[i]))
      const doppia = schedePerChiave.get(chiaveSRD(righe[i] + ' ' + (righe[i + 1] || '')))
      const titoloDueRighe = Boolean(doppia && rigaTipo(righe[i + 2] || ''))
      const titoloUnaRiga = Boolean(rigaTipo(righe[i + 1] || ''))
      const intestazione =
        (titoloDueRighe && possibileTitolo(righe[i])) ||
        (titoloUnaRiga && possibileTitolo(righe[i]))
      // Non trattare come titolo la prima frase di un effetto che termina
      // con una parola come "anello": la riga successiva potrebbe iniziare
      // casualmente con "Anello," e simulare una riga tipologica.
      if (intestazione) {
        const scheda = titoloDueRighe ? doppia : singola
        corrente = scheda ? { scheda, pagina: pagina.pagina, righe: [], pagine: [pagina.pagina] } : null
        if (corrente) titoli.push(corrente)
        i += titoloDueRighe ? 2 : 1
        continue
      }
      if (corrente) {
        if (!corrente.pagine.includes(pagina.pagina)) corrente.pagine.push(pagina.pagina)
        corrente.righe.push(righe[i])
      }
    }
  }
  for (const voce of titoli) {
    const descrizione = voce.righe.join('\n').trim()
    if (descrizione.length < 15) continue
    risultati.set(chiaveSRD(voce.scheda.nome), {
      ...voce.scheda,
      descrizione,
      descrizioneEstratta: true,
      dettagliCompleti: false,
      pagineFonte: voce.pagine,
    })
  }
  return schede.map((voce) => risultati.get(chiaveSRD(voce.nome)) || voce)
}

/**
 * Estrae le descrizioni degli oggetti di equipaggiamento d'avventura.
 * Il testo dell'appendice tabellare p. 108 non è una descrizione e viene
 * intenzionalmente saltato. Pp. 107, 109–113 dell'SRD italiana.
 */
export function estraiTestiEquipaggiamentoSRD(archivio, schede) {
  if (!Array.isArray(archivio?.pagine)) throw new TypeError('Archivio equipaggiamento non valido')
  const alias = { 'acciarino-con-pietra-focaia': 'acciarino-e-pietra-focaia',
    campana: 'campanella' }
  const nomi = new Map(schede.map((s) => [chiaveSRD(s.nome), s]))
  const sezioni = new Map()
  let corrente = null
  for (const pagina of archivio.pagine) {
    if (pagina.pagina < 107 || pagina.pagina > 113) continue
    if (pagina.pagina === 108) { corrente = null; continue }
    for (const riga of righePulite(pagina.testo)) {
      if (/^(?:Cavalcature e veicoli|Cavalcature e altri animali)$/i.test(riga)) {
        corrente = null
        continue
      }
      const titolo = riga.match(/^(.{3,80})\s+\((?:variabil[ei]|[\d.,]+\s*(?:mo|ma|mr|me|mp))\)$/i)
      if (titolo) {
        const chiave = chiaveSRD(titolo[1])
        const scheda = nomi.get(alias[chiave] || chiave)
        corrente = scheda ? { nome: scheda.nome, righe: [], pagine: [pagina.pagina] } : null
        if (corrente) sezioni.set(corrente.nome, corrente)
        continue
      }
      if (!corrente) continue
      if (!corrente.pagine.includes(pagina.pagina)) corrente.pagine.push(pagina.pagina)
      corrente.righe.push(riga)
    }
  }
  return new Map([...sezioni].map(([nome, voce]) => [nome, {
    testo: voce.righe.join('\n').trim(), pagine: voce.pagine,
  }]).filter(([, voce]) => voce.testo.length > 15))
}

/**
 * Estrae utilizzi, creazioni e varianti dei 25 strumenti dalle pp. 105–107.
 * Interrompe la lettura prima della sezione dell'equipaggiamento d'avventura.
 */
export function estraiTestiStrumentiSRD(archivio, schede) {
  if (!Array.isArray(archivio?.pagine)) throw new TypeError('Archivio strumenti non valido')
  const nomi = new Map(schede.map((s) => [chiaveSRD(s.nome), s]))
  const sezioni = new Map()
  let corrente = null
  let finito = false
  for (const pagina of archivio.pagine) {
    if (pagina.pagina < 105 || pagina.pagina > 107 || finito) continue
    for (const riga of righePulite(pagina.testo)) {
      if (/^Equipaggiamento$/i.test(riga) && pagina.pagina === 107) {
        corrente = null
        finito = true
        break
      }
      const titolo = riga.match(/^(.{3,80})\s+\((?:variabil[ei]|[\d.,]+\s*(?:mo|ma|mr|me|mp))\)$/i)
      if (titolo) {
        const scheda = nomi.get(chiaveSRD(titolo[1]))
        corrente = scheda ? { nome: scheda.nome, righe: [], pagine: [pagina.pagina] } : null
        if (corrente) sezioni.set(corrente.nome, corrente)
        continue
      }
      if (!corrente) continue
      if (!corrente.pagine.includes(pagina.pagina)) corrente.pagine.push(pagina.pagina)
      corrente.righe.push(riga)
    }
  }
  return new Map([...sezioni].map(([nome, voce]) => [nome, {
    testo: voce.righe.join('\n').trim(), pagine: voce.pagine,
  }]).filter(([, voce]) => voce.testo.length > 15))
}

/** Delimita una voce per titolo riconoscibile; non restituisce mai
 * l'intera pagina quando l'ancora non è stata trovata. */
export function estraiTestoSingolaVoceSRD(archivio, voce) {
  if (!voce || !archivio?.pagine) return ''
  if (voce.categoria === 'Specie') return estraiTestiSpecieSRD(archivio).get(voce.nome)?.testo || ''
  if (voce.categoria === 'Origini') return estraiTestiOriginiSRD(archivio).get(voce.nome)?.testo || ''
  if (voce.categoria === 'Regole' || voce.categoria === 'Condizioni')
    return estraiGlossarioSRD(archivio).find((v) => chiaveSRD(v.nome) === chiaveSRD(voce.nome))?.descrizione || ''
  return ''
}

/** Frammentazione tipografica conservativa: nessun HTML non attendibile.
 * Le rubriche delle regole (es. «Velocità 0.» o «Influenza sugli attacchi.»)
 * vengono separate dal corpo, senza manipolare gli effetti meccanici.
 */
export function blocchiTestoSRD(testo) {
  const righe = String(testo || '').replace(/\u00ad/g, '').split(/\r?\n/)
  const blocchi = []
  let blocco = null
  const emetti = () => {
    if (blocco?.testo?.trim()) blocchi.push({ ...blocco, testo: blocco.testo.trim() })
    blocco = null
  }
  const aggiungi = (riga) => {
    if (!blocco) blocco = { tipo: 'paragrafo', testo: '' }
    if (blocco.testo.endsWith('-')) blocco.testo = blocco.testo.slice(0, -1) + riga
    else blocco.testo += (blocco.testo ? ' ' : '') + riga
    if (blocco.testo.length > 900 && /[.!?]$/.test(riga)) emetti()
  }
  for (const grezza of righe) {
    const riga = grezza.trim().replace(/\s+/g, ' ')
    if (!riga || INTERRUZIONI_PAGINA.test(riga)) { emetti(); continue }
    if (/^\[Pagina SRD \d+\]$/.test(riga)) {
      emetti()
      blocchi.push({ tipo: 'pagina', testo: riga })
      continue
    }
    if (/^Livello \d+(?:º|°)?:\s*\S/i.test(riga) ||
        /^Tratti del (?:barbaro|bardo|chierico|druido|guerriero|ladro|mago|monaco|paladino|ranger|stregone|warlock)$/i.test(riga)) {
      emetti()
      blocchi.push({ tipo: 'titolo', testo: riga })
      continue
    }
    if (/^[•●]\s*/.test(riga) || /^[-–]\s+(?=\S)/.test(riga) ||
        /^\d+[.):]\s+\S/.test(riga)) {
      emetti()
      blocchi.push({ tipo: 'elenco', testo: riga.replace(/^[•●–-]\s*/, '') })
      continue
    }
    const rubrica = riga.match(/^([A-ZÀ-Ú][a-zA-ZÀ-ú0-9'’\-/ ]{2,55})\.\s+(.+)$/u)
    if (rubrica && rubrica[1].split(/\s+/).length <= 6 &&
        !/^(?:Il|La|Lo|Un|Una|Uno|Quando|Questo|Questa|Ogni|Se|Dopo|Per|Come|Nel|Nella|L'|L’)\b/i.test(rubrica[1])) {
      emetti()
      blocco = { tipo: 'rubrica', titolo: rubrica[1], testo: rubrica[2] }
      continue
    }
    aggiungi(riga)
  }
  emetti()
  return blocchi
}
