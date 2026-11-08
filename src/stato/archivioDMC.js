import { campagne, preparaCampagneImportate, applicaImportazioneCampagne } from './statoCampagne.js'
import { creaturePersonali, fissaIncontri, preparaImportazionePersonali, applicaImportazionePersonali, trovaCreatura } from './statoBestiario.js'
import { copiaDati, normalizzaCreatura } from '../dati/modelloCreatura.js'
import { scriviTransazione } from './archiviazioneLocale.js'
const PREFISSO = 'dmc_dati_campagna_v1_'
export const FORMATO_ARCHIVIO = 'dmc-archivio-campagne'
export const VERSIONE_ARCHIVIO = 2
function verificaDati(d) {
  return d && typeof d === 'object' && !Array.isArray(d) && ['personaggi','nemici','sessioni'].every(k => Array.isArray(d[k]) && d[k].every(v => v && typeof v === 'object' && !Array.isArray(v))) && typeof d.note === 'string' && d.iniziativa && typeof d.iniziativa === 'object'
}
export function verificaArchivio(a) {
  if (!a || a.formato !== FORMATO_ARCHIVIO || ![1,2].includes(a.versione) || !Array.isArray(a.campagne) || a.campagne.length > 200) throw new Error('Il file non è un backup DMC compatibile.')
  for (const v of a.campagne) {
    if (!v || typeof v.nome !== 'string' || !v.nome.trim() || !verificaDati(v.dati)) throw new Error('Una o più campagne contengono dati non validi.')
    for (const s of v.dati.sessioni) {
      if (s.scene != null && !Array.isArray(s.scene)) throw new Error('Scene non valide nel backup.')
      for (const scena of s.scene || []) {
        if (!scena || (scena.incontro?.nemici != null && !Array.isArray(scena.incontro.nemici))) throw new Error('Incontro non valido nel backup.')
        for (const n of scena.incontro?.nemici || []) {
          if (!n || typeof n.creaturaId !== 'string' || !Number.isInteger(Number(n.quantita)) || Number(n.quantita) < 1 || Number(n.quantita) > 30 || (n.istantanea != null && (typeof n.istantanea !== 'object' || Array.isArray(n.istantanea) || !n.istantanea.nome))) throw new Error('Creatura di un incontro non valida nel backup.')
        }
      }
    }
  }
  if (a.versione === 2 && (!Array.isArray(a.creaturePersonali) || a.creaturePersonali.some(c => !c || typeof c !== 'object' || !c.id || !c.nome) || new Set(a.creaturePersonali.map(c=>c.id)).size !== a.creaturePersonali.length)) throw new Error('Bestiario personale del backup non valido.')
  return true
}
export function creaBackup(ids) {
  const selezionate = campagne.value.filter(c => ids.includes(c.id))
  if (!selezionate.length) throw new Error('Seleziona almeno una campagna.')
  const contenuti = selezionate.map(c => {
    let d
    try { d = JSON.parse(localStorage.getItem(PREFISSO + c.id)) } catch { throw new Error(`Impossibile leggere i dati di “${c.nome}”.`) }
    if (!verificaDati(d)) throw new Error(`Dati mancanti o incompleti per “${c.nome}”.`)
    fissaIncontri(d)
    return { nome: c.nome, descrizione: c.descrizione, stato: c.stato, dati: d }
  })
  const a = { formato: FORMATO_ARCHIVIO, versione: VERSIONE_ARCHIVIO, applicazione: 'Dungeon Master Companion', esportatoIl: new Date().toISOString(), creaturePersonali: copiaDati(creaturePersonali.value), campagne: contenuti }
  verificaArchivio(a)
  return a
}
export function importaBackup(archivio, indici) {
  verificaArchivio(archivio)
  const scelte = archivio.campagne.filter((_, i) => indici.includes(i)).map(copiaDati)
  if (!scelte.length) throw new Error('Seleziona almeno una campagna.')
  const p = preparaImportazionePersonali(archivio.creaturePersonali || [])
  const personaliDelBackup = new Map((archivio.creaturePersonali || []).map(c => [c.id, c]))
  for (const v of scelte) for (const s of v.dati.sessioni) for (const scena of s.scene || []) for (const n of scena.incontro?.nemici || []) {
    // Un backup non può attestare una scheda SRD. Le istantanee importate restano
    // copie personali; i riferimenti alla fonte stampata sono conservati.
    const modello = n.istantanea || personaliDelBackup.get(n.creaturaId) || trovaCreatura(n.creaturaId)
    if (modello) n.istantanea = normalizzaCreatura(modello)
    if (p.rimappa[n.creaturaId]) n.creaturaId = p.rimappa[n.creaturaId]
    if (n.istantanea && p.rimappa[n.istantanea.id]) n.istantanea.id = p.rimappa[n.istantanea.id]
  }
  const c = preparaCampagneImportate(scelte)
  const modifiche = [p.scrittura, ...c.nuove.map((meta,i) => [PREFISSO+meta.id, JSON.stringify(scelte[i].dati)]), c.scrittura]
  const r = scriviTransazione(modifiche)
  if (!r.successo) throw new Error(r.ripristinato ? 'Importazione non riuscita. I dati precedenti sono stati ripristinati.' : 'Importazione non riuscita e ripristino incompleto. Conserva una copia dei dati locali prima di riprovare.')
  applicaImportazionePersonali(p)
  applicaImportazioneCampagne(c)
  return c.nuove.length
}
