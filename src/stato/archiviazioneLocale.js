// Scritture controllate: snapshot prima di ogni modifica, rollback su errore.
// localStorage non offre transazioni ACID; il ripristino fallito viene segnalato.
export function scriviTransazione(modifiche, archivio = localStorage) {
  const prima = new Map()
  const scritte = []
  try {
    for (const [chiave] of modifiche)
      if (!prima.has(chiave)) prima.set(chiave, archivio.getItem(chiave))
    for (const [chiave, valore] of modifiche) {
      if (valore === null) archivio.removeItem(chiave)
      else archivio.setItem(chiave, valore)
      scritte.push(chiave)
    }
    return { successo: true }
  } catch (errore) {
    let ripristinato = true
    for (const chiave of [...new Set(scritte)].reverse()) {
      try {
        const valore = prima.get(chiave)
        if (valore === null) archivio.removeItem(chiave)
        else archivio.setItem(chiave, valore)
      } catch {
        ripristinato = false
      }
    }
    return { successo: false, ripristinato, errore }
  }
}
