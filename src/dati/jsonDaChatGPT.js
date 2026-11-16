// Acquisizione di un JSON esportato dalla chat, con o senza un singolo
// recinto Markdown. Non estrae pezzi da risposte discorsive ambigue.
export const MAX_JSON_CAMPAGNA = 50 * 1024 * 1024

export function leggiJsonDaChatGPT(testo, massimoByte = MAX_JSON_CAMPAGNA) {
  if (typeof testo !== 'string' || !testo.trim()) {
    throw new Error('Incolla prima il JSON restituito da ChatGPT.')
  }

  const recintato = testo.trim().match(/^```(?:json)?\s*\r?\n([\s\S]*?)\r?\n```$/i)
  const contenuto = recintato ? recintato[1].trim() : testo.trim()

  if (!contenuto || new TextEncoder().encode(contenuto).byteLength > massimoByte) {
    throw new Error('Il JSON è vuoto o supera il limite di 50 MB.')
  }
  try {
    return JSON.parse(contenuto)
  } catch {
    throw new Error(
      'Il testo non contiene un singolo JSON valido. Copia soltanto il contenuto del blocco JSON completo.',
    )
  }
}
