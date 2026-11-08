// Modello comune. I campi sconosciuti dei dati personali vengono conservati.
export const chiaviCaratteristiche = ['for', 'des', 'cos', 'int', 'sag', 'car']
export const gruppiRegole = [
  { campo: 'capacita', titolo: 'Tratti' },
  { campo: 'azioni', titolo: 'Azioni' },
  { campo: 'azioniBonus', titolo: 'Azioni bonus' },
  { campo: 'reazioni', titolo: 'Reazioni' },
  { campo: 'azioniLeggendarie', titolo: 'Azioni leggendarie' },
  { campo: 'azioniMitiche', titolo: 'Azioni mitiche' },
]
export function copiaDati(dati) { return JSON.parse(JSON.stringify(dati)) }
export function congela(dati) {
  if (dati && typeof dati === 'object' && !Object.isFrozen(dati)) {
    Object.values(dati).forEach(congela)
    Object.freeze(dati)
  }
  return dati
}
export function creaId() {
  return globalThis.crypto?.randomUUID?.() || `dmc-${Date.now()}-${Math.random().toString(36).slice(2)}`
}
export function numeroOpzionale(valore) {
  if (valore === null || valore === undefined || valore === '') return null
  const n = Number(valore)
  return Number.isFinite(n) ? n : null
}
export function modelloCreatura(categoria = 'homebrew') {
  return {
    id: '', origine: 'custom', categoria, nome: '', nomeOriginale: '', aliases: [],
    tipo: 'Umanoide', taglia: 'Media', taglie: [], sottotipi: [], sciame: null,
    tassonomiaOriginale: '', allineamento: '', gs: '', ca: null, pfMax: null,
    pfFormula: '', iniziativa: null, iniziativaPassiva: null, bonusCompetenza: null,
    puntiEsperienza: null, puntiEsperienzaTana: null,
    caratteristiche: {}, modificatori: {}, tiriSalvezza: {}, abilita: [],
    velocita: '', sensi: '', lingue: '', equipaggiamento: '',
    resistenze: [], vulnerabilita: [], immunita: [], immunitaCondizioni: [],
    capacita: [], azioni: [], attacchi: [], azioniBonus: [], reazioni: [],
    azioniLeggendarie: [], regoleAzioniLeggendarie: '', azioniMitiche: [],
    tags: [], note: '', fonte: '', noteFonte: [],
    solaLettura: false, verificata: false, statoScheda: 'bozza',
  }
}
export function normalizzaCreatura(dati = {}, categoria) {
  const c = { ...modelloCreatura(), ...copiaDati(dati) }
  c.categoria = categoria || (c.categoria === 'png' ? 'png' : 'homebrew')
  c.origine = 'custom'
  c.solaLettura = false
  c.nome = String(c.nome || '').trim()
  c.id = String(c.id || '')
  for (const campo of ['ca', 'pfMax', 'iniziativa', 'iniziativaPassiva', 'bonusCompetenza', 'puntiEsperienza', 'puntiEsperienzaTana']) c[campo] = numeroOpzionale(c[campo])
  for (const campo of ['caratteristiche', 'modificatori', 'tiriSalvezza']) {
    const originale = c[campo] && typeof c[campo] === 'object' ? c[campo] : {}
    c[campo] = Object.fromEntries(chiaviCaratteristiche.map(k => [k, numeroOpzionale(originale[k])]))
  }
  // attacchi è un alias legacy, mai un secondo gruppo da sommare ad azioni.
  c.azioni = copiaDati(Array.isArray(dati.azioni) ? dati.azioni : (dati.attacchi || []))
  for (const campo of [...gruppiRegole.map(g => g.campo), 'abilita', 'resistenze', 'vulnerabilita', 'immunita', 'immunitaCondizioni', 'aliases', 'tags', 'taglie', 'sottotipi', 'noteFonte']) {
    if (!Array.isArray(c[campo])) c[campo] = []
  }
  c.attacchi = copiaDati(c.azioni)
  // La conferma dell'autore non equivale a una verifica SRD.
  c.statoScheda = dati.statoScheda || (dati.verificata === true ? 'pronta' : 'bozza')
  c.verificata = false
  c.statoVerifica = 'personale_non_certificata_srd'
  return c
}
export function utilizzabile(c) {
  return !!c && (c.categoria === 'srd' ? c.verificata === true : c.statoScheda === 'pronta') &&
    Number.isInteger(c.ca) && c.ca >= 0 && Number.isInteger(c.pfMax) && c.pfMax > 0
}
export function creaIstanza(creatura, nome = creatura.nome) {
  const istanza = copiaDati(creatura)
  return {
    ...istanza, id: creaId(), creaturaId: creatura.id, nome,
    bonusIniziativa: numeroOpzionale(creatura.iniziativa),
    iniziativa: null, pf: creatura.pfMax, condizioni: [],
  }
}
export function azioniDellaScheda(c) { return c.azioni ?? c.attacchi ?? [] }

export function testoRicercaCreatura(c) {
  return [c.nome, c.nomeOriginale, c.tipo, ...(c.aliases || []), ...(c.riferimentiLegacy?.aliasesApplicativiNonAttestatiNelPDF || [])]
    .join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('it')
}
