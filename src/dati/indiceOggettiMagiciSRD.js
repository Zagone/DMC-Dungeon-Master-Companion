/**
 * Indicizzazione degli oggetti magici dall'SRD italiano 5.2.1 (CC BY 4.0).
 * Titoli e descrittori possono occupare più righe. La segmentazione è
 * automatica e NON certifica la revisione editoriale dei testi.
 */
const TIPI = ['Oggetto meraviglioso', 'Anello', 'Armatura', 'Arma',
  'Bacchetta', 'Bastone', 'Pergamena', 'Pozione', 'Verga']
const RARITA = ['molto raro', 'non comune', 'leggendario', 'artefatto', 'comune', 'raro']
const TIPI_REGEX = new RegExp('^(' + TIPI.join('|') + ')(?:\\s*\\([^)]*\\))?\\s*,', 'i')
const INIZIO_TIPO_REGEX = new RegExp('^(?:' + TIPI.join('|') + ')(?=\\s|,)', 'i')

function pulisci(testo) {
  return String(testo || '').replace(/\u00ad/g, '').replace(/\s+/g, ' ').trim()
}
function chiave(testo) {
  return pulisci(testo).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it-IT').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}
function metadati(testo) {
  const contenuto = pulisci(testo)
  const tipo = TIPI_REGEX.exec(contenuto)
  if (!tipo) return null
  const resto = contenuto.slice(tipo[0].length)
    .replace(/\bmolto rara\b/gi, 'molto raro')
    .replace(/\brara\b/gi, 'raro')
    .replace(/\bleggendaria\b/gi, 'leggendario')
  const rarita = RARITA.find((r) => new RegExp('(?:^|\\W)' + r + '(?:\\W|$)', 'i').test(resto))
  if (!rarita) return null
  return { tipo: tipo[1], rarita, richiedeSintonia: /richiede\s+sintonia/i.test(resto) }
}
function titoloValido(titolo) {
  if (titolo.length < 4 || titolo.length > 100 || !/^[A-ZÀ-Ú]/.test(titolo)) return false
  if (/[.!?;:]/.test(titolo) || /\b\d+\s+[A-ZÀ-Ú]/.test(titolo)) return false
  if (/^(?:Il|La|Le|Lo|Un|Una|Uno|Se|Quando|Finché|Ogni|Ciascun|Per|Con|Inoltre|Questo|Questa|Questi|Queste|Tabella|Oggetti magici|System Reference)\b/i.test(titolo)) return false
  if (TIPI_REGEX.test(titolo)) return false
  return true
}
function trovaIntestazione(righe, indice) {
  const prima = righe[indice]
  if (!titoloValido(prima)) return null
  for (const titoli of [1, 2]) {
    if (titoli === 2) {
      const seconda = righe[indice + 1] || ''
      if (seconda.length > 45 || !/^(?:e\b|dell['’]|dei\b|delle\b|del\b|della\b|dello\b|degli\b|di\b|terra\b|[a-zà-ù][a-zà-ù'’ -]{2,})/i.test(seconda)) continue
    }
    const titolo = pulisci(righe.slice(indice, indice + titoli).join(' '))
    if (!titoloValido(titolo)) continue
    const primaTipo = righe[indice + titoli] || ''
    if (!INIZIO_TIPO_REGEX.test(primaTipo)) continue
    for (let n = 1; n <= 4; n++) {
      const typeText = righe.slice(indice + titoli, indice + titoli + n).join(' ')
      const meta = metadati(typeText)
      if (!meta) continue
      const opens = (typeText.match(/\(/g) || []).length
      const closes = (typeText.match(/\)/g) || []).length
      if (opens > closes && n < 4) continue
      return { titolo, meta, fine: indice + titoli + n }
    }
  }
  return null
}
export function estraiVociOggettiMagici(archivio) {
  if (!archivio || !Array.isArray(archivio.pagine))
    throw new TypeError('Archivio oggetti magici non valido')
  const sezioni = []
  let corrente = null
  for (const pagina of archivio.pagine) {
    if (pagina.pagina < 237 || pagina.pagina > 288) continue
    const righe = String(pagina.testo || '').split(/\r?\n/).map(pulisci)
      .filter((r) => r && !/^System Reference Document 5\.2\.1$/i.test(r)
        && !/^\d+\s+S\s+t\s+R\s+f\s+D/i.test(r) && !/^\d+$/.test(r))
    for (let i = 0; i < righe.length; i++) {
      const nuova = trovaIntestazione(righe, i)
      if (nuova) {
        corrente = {
          id: 'oggetto-magico-' + chiave(nuova.titolo),
          nome: nuova.titolo,
          categoria: 'Oggetti magici',
          pagina: pagina.pagina,
          pagineFonte: [pagina.pagina],
          ...nuova.meta,
          sintesi: nuova.meta.tipo + ' · ' + nuova.meta.rarita +
            (nuova.meta.richiedeSintonia ? ' · richiede sintonia' : ''),
          dettagliCompleti: false,
          indicizzazioneAutomatica: true,
          righe: [],
        }
        sezioni.push(corrente)
        i = nuova.fine - 1
        continue
      }
      if (corrente) {
        if (!corrente.pagineFonte.includes(pagina.pagina)) corrente.pagineFonte.push(pagina.pagina)
        corrente.righe.push(righe[i])
      }
    }
  }
  const risultati = new Map()
  for (const voce of sezioni) {
    const { righe, ...metadatiVoce } = voce
    const descrizione = righe.join('\n').trim()
    const scheda = {
      ...metadatiVoce,
      ...(descrizione.length >= 15 ? { descrizione, descrizioneEstratta: true } : {}),
    }
    const key = chiave(voce.nome)
    if (!risultati.has(key) ||
      (scheda.descrizione?.length || 0) > (risultati.get(key).descrizione?.length || 0))
      risultati.set(key, scheda)
  }
  return [...risultati.values()]
}
export function estraiIndiceOggettiMagici(archivio) {
  return estraiVociOggettiMagici(archivio)
    .map(({ descrizione: _descrizione, descrizioneEstratta: _descrizioneEstratta, ...metadatiVoce }) => metadatiVoce)
}
