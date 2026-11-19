// Copia cross-device. Non segnaliamo mai un successo se il browser
// non ha confermato la scrittura negli appunti.
export async function copiaNegliAppunti(testo, { navigatore = globalThis.navigator, documento = globalThis.document } = {}) {
  if (typeof testo !== 'string' || !testo) return false

  try {
    if (typeof navigatore?.clipboard?.writeText === 'function') {
      await navigatore.clipboard.writeText(testo)
      return true
    }
  } catch {
    // Permessi, contesto non sicuro o restrizioni Safari: tentiamo il fallback.
  }

  if (!documento?.body || typeof documento.execCommand !== 'function') return false
  const precedente = documento.activeElement
  const campo = documento.createElement('textarea')
  campo.value = testo
  campo.setAttribute('readonly', '')
  campo.setAttribute('aria-hidden', 'true')
  campo.style.position = 'fixed'
  campo.style.top = '0'
  campo.style.left = '-9999px'
  campo.style.opacity = '0'
  documento.body.appendChild(campo)
  try {
    campo.focus()
    campo.select()
    campo.setSelectionRange(0, campo.value.length)
    return documento.execCommand('copy') === true
  } catch {
    return false
  } finally {
    campo.remove()
    if (precedente?.isConnected && typeof precedente.focus === 'function') {
      precedente.focus({ preventScroll: true })
    }
  }
}
