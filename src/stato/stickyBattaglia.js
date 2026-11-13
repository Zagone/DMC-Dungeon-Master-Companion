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
  // Stessa definizione responsive dei fogli CSS: tablet/smartphone,
  // inclusi iPad orizzontali dotati di superficie touch.
  const modalitaTouch = window.matchMedia(
    '(max-width: 1024px), (max-width: 1440px) and (any-pointer: coarse)',
  )

  function aggiorna() {
    frameRichiesto = false

    const pagina = document.querySelector('.campagna-view')

    if (!pagina) return

    const navigazione = pagina.querySelector('.navigazione-persistente')
    const battaglia = pagina.querySelector('.battaglia-dmc')
    const barra = battaglia?.querySelector('.barra-comando')

    if (!battaglia || !barra || (!modalitaTouch.matches && !navigazione)) {
      pagina.classList.remove('dmc-battaglia-compatta')
      return
    }

    // Su touch la navigazione della campagna è STATICA; usare il suo
    // fondo per decidere quando compattare la Battaglia sarebbe errato,
    // perché uscirebbe dalla viewport. La soglia è la topbar globale.
    if (modalitaTouch.matches) {
      const altezzaTopbar = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--dmc-topbar-height'),
      ) || 58

      // La soglia deve coincidere con il nuovo offset sticky definito
      // nel CSS: evita una barra che resta estesa mentre si fissa in alto.
      const distanzaSticky = Number.parseFloat(
        getComputedStyle(barra).getPropertyValue('--dmc-margine-sticky-battaglia-touch'),
      ) || 16
      const posizioneBattaglia = battaglia.getBoundingClientRect().top
      const compatta = posizioneBattaglia <= altezzaTopbar + distanzaSticky + MARGINE

      pagina.classList.toggle('dmc-battaglia-compatta', compatta)
      return
    }

    // Desktop: mantenere la modalità compatta e l'isteresi originale.
    const posizioneBattaglia = battaglia.getBoundingClientRect().top
    const fondoNavigazione = navigazione.getBoundingClientRect().bottom
    const giaCompatta = pagina.classList.contains('dmc-battaglia-compatta')

    const soglia = giaCompatta ? fondoNavigazione + SOGLIA_ESPANSIONE : fondoNavigazione + MARGINE
    const deveCompattarsi = posizioneBattaglia <= soglia

    pagina.classList.toggle('dmc-battaglia-compatta', deveCompattarsi)
  }

  function richiediAggiornamento() {
    if (frameRichiesto) return

    frameRichiesto = true

    window.requestAnimationFrame(aggiorna)
  }

  async function aggiornaDopoNavigazione() {
    await nextTick()

    // Attendiamo il completamento del layout.
    window.requestAnimationFrame(richiediAggiornamento)
  }

  window.addEventListener('scroll', richiediAggiornamento, { passive: true })

  window.addEventListener('resize', richiediAggiornamento, { passive: true })

  router.afterEach(() => {
    aggiornaDopoNavigazione()
  })

  // Prima inizializzazione.
  aggiornaDopoNavigazione()
}
