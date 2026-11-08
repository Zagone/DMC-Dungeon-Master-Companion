
import {
  createRouter,
  createWebHashHistory,
} from 'vue-router'

import {
  sezioniCampagna,
} from '../dati/sezioniCampagna.js'

import {
  trovaCampagna,
} from '../stato/statoCampagne.js'

/*
 * R3 — Caricamento differito delle viste.
 *
 * Le pagine vengono importate soltanto quando
 * la navigazione richiede il relativo componente.
 *
 * Le due rotte della campagna condividono
 * lo stesso modulo e lo stesso chunk.
 */

const DashboardView = () =>
  import('../views/DashboardView.vue')

const LibreriaView = () =>
  import('../views/LibreriaView.vue')

const CampagnaView = () =>
  import('../views/CampagnaView.vue')

const BestiarioView = () =>
  import('../views/BestiarioView.vue')

const router = createRouter({
  history: createWebHashHistory(),

  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
    },
    {
      path: '/campagne',
      name: 'libreria',
      component: LibreriaView,
    },
    {
      path: '/bestiario',
      name: 'bestiario-globale',
      component: BestiarioView,
    },
    {
      path: '/campagne/:id',
      name: 'campagna',
      component: CampagnaView,
    },
    {
      path: '/campagne/:id/:sezione',
      name: 'sezione-campagna',
      component: CampagnaView,
    },
    {
      path: '/:percorso(.*)*',
      redirect: { name: 'dashboard' },
    },
  ],

  scrollBehavior(to, from, posizioneSalvata) {
    return posizioneSalvata || { top: 0 }
  },
})

router.beforeEach(to => {
  if (
    !['campagna', 'sezione-campagna'].includes(to.name)
  ) {
    return true
  }

  const id = to.params.id

  if (
    typeof id !== 'string' ||
    !trovaCampagna(id)
  ) {
    return { name: 'libreria' }
  }

  if (to.name === 'sezione-campagna') {
    const sezioneValida = sezioniCampagna.some(
      sezione =>
        sezione.id !== 'panoramica' &&
        sezione.id === to.params.sezione
    )

    if (!sezioneValida) {
      return {
        name: 'campagna',
        params: { id },
      }
    }
  }

  return true
})

export default router
