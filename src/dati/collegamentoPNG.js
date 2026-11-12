/**
 * Collega una scheda PNG del Bestiario al registro narrativo di una campagna.
 * I dettagli narrativi restano specifici della campagna; la creatura originale
 * non viene modificata. Restituisce un risultato esplicito per l'interfaccia.
 */
export function collegaPNGDaBestiario(registro, creatura, creaId) {
  if (!Array.isArray(registro) || !creatura || creatura.categoria !== 'png' ||
      typeof creatura.id !== 'string' || !creatura.id ||
      typeof creatura.nome !== 'string' || !creatura.nome.trim() ||
      typeof creaId !== 'function') {
    return { successo: false, motivo: 'Seleziona un PNG personale valido del Bestiario.' }
  }
  if (registro.some(p => p?.creaturaId === creatura.id)) {
    return { successo: false, motivo: 'Questo PNG del Bestiario è già collegato alla campagna.' }
  }
  const png = {
    id: creaId(),
    nome: creatura.nome,
    ruolo: '',
    personalita: '',
    obiettivo: '',
    segreto: '',
    informazioni: '',
    creaturaId: creatura.id,
  }
  registro.push(png)
  return { successo: true, png }
}
