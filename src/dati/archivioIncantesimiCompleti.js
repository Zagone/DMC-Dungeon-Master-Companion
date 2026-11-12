import { INCANTESIMI_SRD } from './incantesimiSRD.js'

const CHIAVE = 'dmc-compendio-incantesimi-srd-5-2-1-v1'
const CAMPI = ['tempoLancio', 'gittata', 'componenti', 'durata', 'descrizione']
const nomiUfficiali = new Map(INCANTESIMI_SRD.map((v) => [v.nome, v]))

export function validaArchivioIncantesimi(archivio) {
  if (
    !archivio ||
    archivio.formato !== 'dmc-compendio-incantesimi' ||
    archivio.versione !== 1 ||
    !Array.isArray(archivio.incantesimi) ||
    archivio.incantesimi.length !== 339
  ) {
    throw new Error('Il file deve contenere esattamente 339 incantesimi SRD nel formato previsto.')
  }
  const visti = new Set()
  const dati = archivio.incantesimi.map((v) => {
    if (!v || typeof v.nome !== 'string' || visti.has(v.nome) || !nomiUfficiali.has(v.nome)) {
      throw new Error('Nome non riconosciuto o duplicato nell’archivio.')
    }
    visti.add(v.nome)
    const ufficiale = nomiUfficiali.get(v.nome)
    if (
      v.livello !== ufficiale.livello ||
      v.scuola !== ufficiale.scuola ||
      v.pagina !== ufficiale.pagina
    ) {
      throw new Error('Metadati discordanti per ' + v.nome + '.')
    }
    for (const campo of CAMPI) {
      if (typeof v[campo] !== 'string' || !v[campo].trim() || v[campo].length > 25000) {
        throw new Error('Campo ' + campo + ' non valido per ' + v.nome + '.')
      }
    }
    return {
      ...ufficiale,
      tempoLancio: v.tempoLancio,
      gittata: v.gittata,
      componenti: v.componenti,
      durata: v.durata,
      descrizione: v.descrizione,
      sintesi: v.descrizione,
      dettagliCompleti: true,
      verificato: false,
      estrattoPDF: true,
    }
  })
  return dati
}

export function leggiArchivioIncantesimi() {
  try {
    const testo = localStorage.getItem(CHIAVE)
    return testo ? validaArchivioIncantesimi(JSON.parse(testo)) : null
  } catch {
    return null
  }
}

export function salvaArchivioIncantesimi(archivio) {
  const voci = validaArchivioIncantesimi(archivio)
  localStorage.setItem(CHIAVE, JSON.stringify(archivio))
  return voci
}

export function eliminaArchivioIncantesimi() {
  localStorage.removeItem(CHIAVE)
}
