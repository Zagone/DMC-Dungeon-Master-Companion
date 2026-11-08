
import { nextTick } from 'vue'

/**
 * DMC — Coordinamento della barra Battaglia
 *
 * Responsabilità:
 * - rilevare la posizione della Battaglia;
 * - attivare e disattivare la modalità compatta;
 * - sincronizzare lo stato dopo la navigazione.
 *
 * Non gestisce le altezze delle barre sticky.
 *
 * L'altezza della navigazione è misurata da
 * CampagnaView.vue e utilizzata direttamente
 * da sticky-battaglia.css.
 */

export function installaStickyBattaglia(router) {
  let frameRichiesto = false

  const MARGINE = 8
  const SOGLIA_ESPANSIONE = 45

  function aggiorna() {
    frameRichiesto = false

    const pagina = document.querySelector(
      '.campagna-view'
    )

    if (!pagina) return

    const navigazione = pagina.querySelector(
      '.navigazione-persistente'
    )

    const battaglia = pagina.querySelector(
      '.battaglia-dmc'
    )

    // La modalità compatta è valida soltanto
    // quando entrambe le barre sono presenti.
    if (!navigazione || !battaglia) {
      pagina.classList.remove(
        'dmc-battaglia-compatta'
      )

      return
    }

    const posizioneBattaglia =
      battaglia.getBoundingClientRect().top

    const fondoNavigazione =
      navigazione.getBoundingClientRect().bottom

    const giaCompatta = pagina.classList.contains(
      'dmc-battaglia-compatta'
    )

    /*
     * Isteresi:
     *
     * Manteniamo due soglie differenti per evitare
     * oscillazioni quando l'utente scorre vicino
     * al punto in cui la barra si compatta.
     */

    const soglia = giaCompatta
      ? fondoNavigazione + SOGLIA_ESPANSIONE
      : fondoNavigazione + MARGINE

    const deveCompattarsi =
      posizioneBattaglia <= soglia

    pagina.classList.toggle(
      'dmc-battaglia-compatta',
      deveCompattarsi
    )
  }

  function richiediAggiornamento() {
    if (frameRichiesto) return

    frameRichiesto = true

    window.requestAnimationFrame(aggiorna)
  }

  async function aggiornaDopoNavigazione() {
    await nextTick()

    // Attendiamo il completamento del layout.
    window.requestAnimationFrame(
      richiediAggiornamento
    )
  }

  window.addEventListener(
    'scroll',
    richiediAggiornamento,
    { passive: true }
  )

  window.addEventListener(
    'resize',
    richiediAggiornamento,
    { passive: true }
  )

  router.afterEach(() => {
    aggiornaDopoNavigazione()
  })

  // Prima inizializzazione.
  aggiornaDopoNavigazione()
}
