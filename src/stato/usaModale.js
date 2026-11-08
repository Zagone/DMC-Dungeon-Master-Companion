import { onBeforeUnmount, watch } from 'vue'

const SELETTORE_FOCUS = [
  'a[href]',
  'button',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[tabindex]',
  '[contenteditable]',
].join(',')

export function usaModale(aperta, riferimento, chiudi) {
  let finestra = null
  let precedente = null
  let sfondo = []
  let overflowPrecedente = ''
  let prioritaOverflow = ''

  function puoRicevereFocus(elemento) {
    return (
      elemento instanceof HTMLElement &&
      elemento.tabIndex >= 0 &&
      !elemento.matches(':disabled') &&
      !elemento.closest('[inert]') &&
      elemento.getClientRects().length > 0 &&
      getComputedStyle(elemento).visibility !== 'hidden'
    )
  }

  function controlli() {
    return finestra
      ? [...finestra.querySelectorAll(SELETTORE_FOCUS)]
          .filter(puoRicevereFocus)
      : []
  }

  function portaFocusDentro() {
    if (!finestra) return

    const iniziale = finestra.querySelector(
      '[data-focus-iniziale]'
    )

    const destinazione = puoRicevereFocus(iniziale)
      ? iniziale
      : controlli()[0] || finestra

    destinazione.focus()
  }

  function gestisciTastiera(evento) {
    if (!finestra || evento.isComposing) return

    if (evento.key === 'Escape') {
      evento.preventDefault()
      evento.stopPropagation()
      chiudi()
      return
    }

    if (evento.key !== 'Tab') return

    const elementi = controlli()
    const primo = elementi[0]
    const ultimo = elementi[elementi.length - 1]
    const attivo = document.activeElement

    if (!elementi.length) {
      evento.preventDefault()
      finestra.focus()
    } else if (
      evento.shiftKey &&
      (
        attivo === primo ||
        attivo === finestra ||
        !finestra.contains(attivo)
      )
    ) {
      evento.preventDefault()
      ultimo.focus()
    } else if (
      !evento.shiftKey &&
      (
        attivo === ultimo ||
        !finestra.contains(attivo)
      )
    ) {
      evento.preventDefault()
      primo.focus()
    }
  }

  function controllaFocus(evento) {
    if (
      finestra &&
      !finestra.contains(evento.target)
    ) {
      portaFocusDentro()
    }
  }

  function disattiva(ripristinaFocus = true) {
    if (!finestra) return

    document.removeEventListener(
      'keydown',
      gestisciTastiera,
      true
    )

    document.removeEventListener(
      'focusin',
      controllaFocus,
      true
    )

    for (const [elemento, valore] of sfondo) {
      if (valore === null) {
        elemento.removeAttribute('inert')
      } else {
        elemento.setAttribute('inert', valore)
      }
    }

    if (overflowPrecedente) {
      document.body.style.setProperty(
        'overflow',
        overflowPrecedente,
        prioritaOverflow
      )
    } else {
      document.body.style.removeProperty('overflow')
    }

    finestra = null
    sfondo = []

    if (
      ripristinaFocus &&
      precedente?.isConnected &&
      !precedente.closest('[inert]') &&
      !precedente.matches(':disabled')
    ) {
      precedente.focus({ preventScroll: true })
    }

    precedente = null
  }

  function attiva(elemento) {
    if (finestra === elemento) return

    finestra = elemento

    overflowPrecedente =
      document.body.style.getPropertyValue('overflow')

    prioritaOverflow =
      document.body.style.getPropertyPriority('overflow')

    document.body.style.setProperty('overflow', 'hidden')

    // Disattiva i rami esterni alla finestra,
    // conservando gli attributi iniziali.
    let nodo = elemento

    while (nodo?.parentElement) {
      for (const fratello of nodo.parentElement.children) {
        if (
          fratello === nodo ||
          ['SCRIPT', 'STYLE', 'LINK'].includes(fratello.tagName)
        ) {
          continue
        }

        sfondo.push([
          fratello,
          fratello.getAttribute('inert'),
        ])

        fratello.setAttribute('inert', '')
      }

      nodo = nodo.parentElement

      if (nodo === document.body) break
    }

    document.addEventListener(
      'keydown',
      gestisciTastiera,
      true
    )

    document.addEventListener(
      'focusin',
      controllaFocus,
      true
    )

    portaFocusDentro()
  }

  // Salva il pulsante prima del montaggio della finestra.
  watch(
    aperta,
    (valore, prima) => {
      if (valore && !prima) {
        precedente = document.activeElement
      }
    },
    { flush: 'sync' }
  )

  watch(
    [aperta, riferimento],
    ([valore, elemento]) => {
      if (valore && elemento) {
        attiva(elemento)
      } else {
        disattiva()
      }
    },
    { flush: 'post' }
  )

  onBeforeUnmount(() => disattiva(false))
}