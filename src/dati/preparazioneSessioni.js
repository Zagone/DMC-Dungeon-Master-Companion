// Normalizzazione delle sessioni e migrazione non distruttiva dei dati legacy.
// Le funzioni operano sui dati ricevuti; il chiamante conserva la gestione della persistenza.
// Soglie SRD 5.2.1: bassa, moderata, alta.
export const sogliePerPG = {
  1: [50, 75, 100],
  2: [100, 150, 200],
  3: [150, 225, 400],
  4: [250, 375, 500],
  5: [500, 750, 1100],
  6: [600, 1000, 1400],
  7: [750, 1300, 1700],
  8: [1000, 1700, 2100],
  9: [1300, 2000, 2600],
  10: [1600, 2300, 3100],
  11: [1900, 2900, 4100],
  12: [2200, 3700, 4700],
  13: [2600, 4200, 5400],
  14: [2900, 4900, 6200],
  15: [3300, 5400, 7800],
  16: [3800, 6100, 9800],
  17: [4500, 7200, 11700],
  18: [5000, 8700, 14200],
  19: [5500, 10700, 17200],
  20: [6400, 13200, 22000],
}

export function preparaScena(scena, idUnivoco) {
  for (const campo of ['titolo', 'descrizione', 'note', 'alternativa', 'orario', 'personaggi']) {
    if (typeof scena[campo] !== 'string') {
      scena[campo] = ''
    }
  }

  // Conversione dei dati precedenti.
  // Eventi e fasi confluiscono nella guida unica.
  // I campi originali non vengono cancellati.

  if (!Array.isArray(scena.guida)) {
    const eventi = Array.isArray(scena.eventi) ? scena.eventi : []

    const compiti = !eventi.length && Array.isArray(scena.compiti) ? scena.compiti : []

    const fasi = Array.isArray(scena.fasi) ? scena.fasi : []

    scena.guida = [
      ...eventi.map((evento) => ({
        id: evento?.id || idUnivoco(),

        testo: typeof evento === 'string' ? evento : String(evento?.testo || ''),

        condizione: '',
        narrazione: '',
        completato: evento?.completato === true,
      })),

      ...compiti.map((compito) => ({
        id: idUnivoco(),
        testo: String(compito),
        condizione: '',
        narrazione: '',
        completato: false,
      })),

      ...fasi.map((fase) => ({
        id: fase?.id || idUnivoco(),

        testo: String(fase?.titolo || 'Intervento narrativo'),

        condizione: String(fase?.condizione || ''),
        narrazione: String(fase?.narrazione || ''),
        completato: fase?.attivata === true,
      })),
    ]
  }

  scena.guida = scena.guida.filter(
    (passo) => passo && typeof passo === 'object' && !Array.isArray(passo),
  )

  for (const passo of scena.guida) {
    if (!passo.id) {
      passo.id = idUnivoco()
    }

    if (typeof passo.testo !== 'string') {
      passo.testo = ''
    }

    if (typeof passo.condizione !== 'string') {
      passo.condizione = ''
    }

    if (typeof passo.narrazione !== 'string') {
      passo.narrazione = ''
    }

    if (typeof passo.completato !== 'boolean') {
      passo.completato = false
    }
  }

  if (!Array.isArray(scena.indizi)) {
    scena.indizi = []
  }

  scena.indizi = scena.indizi.map((voce) =>
    typeof voce === 'string'
      ? {
          id: idUnivoco(),
          testo: voce,
          rivelato: false,
        }
      : {
          ...voce,
          id: voce.id || idUnivoco(),
          testo: String(voce.testo || ''),
        },
  )

  if (!Array.isArray(scena.pngIds)) {
    scena.pngIds = []
  }

  if (typeof scena.mostraRituale !== 'boolean') {
    scena.mostraRituale = false
  }

  if (!scena.incontro || typeof scena.incontro !== 'object') {
    scena.incontro = {
      nemici: [],
    }
  }

  if (!Array.isArray(scena.incontro.nemici)) {
    scena.incontro.nemici = []
  }

  if (!Array.isArray(scena.incontro.richiedeCreature)) {
    scena.incontro.richiedeCreature = []
  }

  if (!Array.isArray(scena.incontro.suggerimentiPF)) {
    scena.incontro.suggerimentiPF = []
  }

  if (typeof scena.incontro.noteBilanciamento !== 'string') {
    scena.incontro.noteBilanciamento = ''
  }

  if (typeof scena.incontro.opzionale !== 'boolean') {
    scena.incontro.opzionale = false
  }
}

export function preparaSessione(sessione, idUnivoco, numeroPersonaggi = 4) {
  if (!Array.isArray(sessione.scene)) {
    sessione.scene = []
  }

  if (!Array.isArray(sessione.sceneVisitateIds)) {
    sessione.sceneVisitateIds = []
  }

  if (!Array.isArray(sessione.risorseNarrative)) {
    sessione.risorseNarrative = []
  }

  if (!sessione.rituale || typeof sessione.rituale !== 'object') {
    sessione.rituale = {
      descrizione: '',
      partecipanti: [],
    }
  }

  if (!Array.isArray(sessione.rituale.partecipanti)) {
    sessione.rituale.partecipanti = []
  }

  if (typeof sessione.rituale.descrizione !== 'string') {
    sessione.rituale.descrizione = ''
  }

  if (typeof sessione.obiettivi !== 'string') {
    sessione.obiettivi = ''
  }

  if (typeof sessione.resoconto !== 'string') {
    sessione.resoconto = ''
  }

  if (!sessione.stato) {
    sessione.stato = 'preparazione'
  }

  if (!Number.isInteger(Number(sessione.pgPrevisti)) || Number(sessione.pgPrevisti) < 1) {
    sessione.pgPrevisti = numeroPersonaggi
  }

  if (!sogliePerPG[Number(sessione.livelloPrevisto)]) {
    sessione.livelloPrevisto = 2
  }

  if (!sessione.scene.some((scena) => scena.id === sessione.scenaAttivaId)) {
    sessione.scenaAttivaId = null
  }

  sessione.sceneVisitateIds = sessione.sceneVisitateIds.filter((id) =>
    sessione.scene.some((scena) => scena.id === id),
  )

  for (const scena of sessione.scene) {
    preparaScena(scena, idUnivoco)
  }

  // Gli elementi interattivi sono generici
  // e visibili soltanto nelle scene assegnate.

  for (const elemento of sessione.risorseNarrative) {
    if (!elemento.id) {
      elemento.id = idUnivoco()
    }

    if (!Array.isArray(elemento.sceneIds)) {
      elemento.sceneIds = []
    }

    elemento.sceneIds = elemento.sceneIds.filter((id) =>
      sessione.scene.some((scena) => scena.id === id),
    )

    if (!['inattivo', 'pronto', 'utilizzato'].includes(elemento.stato)) {
      elemento.stato = 'inattivo'
    }
  }

  for (const partecipante of sessione.rituale.partecipanti) {
    if (!partecipante.id) {
      partecipante.id = idUnivoco()
    }

    if (typeof partecipante.attivo !== 'boolean') {
      partecipante.attivo = true
    }
  }
}
