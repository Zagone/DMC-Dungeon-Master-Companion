import test from 'node:test'
import assert from 'node:assert/strict'
import { caricaSezioneSRD, paginaSRD, estrattoVoceSRD } from '../src/dati/caricamentoSezioniSRD.js'

test('caricamento sezioni: valida la struttura e recupera la pagina', async () => {
  const precedente = globalThis.fetch
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      formato: 'dmc-compendio-sezione',
      versione: 1,
      categoria: 'classi',
      pagine: [{ pagina: 32, testo: 'Barbaro' }],
    }),
  })
  try {
    const dati = await caricaSezioneSRD('Classi')
    assert.equal(paginaSRD(dati, 32), 'Barbaro')
    assert.equal(paginaSRD(dati, 33), '')
  } finally {
    globalThis.fetch = precedente
  }
})
test('caricamento sezioni: rifiuta categoria sconosciuta', async () => {
  await assert.rejects(caricaSezioneSRD('Inesistente'))
})

test('classe: comprende tutte le pagine fino alla classe successiva', () => {
  const dati = {
    pagine: [
      { pagina: 32, testo: 'Barbaro' },
      { pagina: 33, testo: 'Privilegi del barbaro' },
      { pagina: 34, testo: 'Sottoclasse del barbaro' },
      { pagina: 35, testo: 'Bardo' },
    ],
  }
  const estratto = estrattoVoceSRD(dati, { categoria: 'Classi', pagina: 32 })
  assert.deepEqual(estratto.pagine, [32, 33, 34])
  assert.match(estratto.testo, /Privilegi del barbaro/)
  assert.doesNotMatch(estratto.testo, /Bardo/)
})
test('altre categorie: non attribuisce pagine successive alla voce', () => {
  const dati = {
    pagine: [
      { pagina: 94, testo: 'Specie' },
      { pagina: 95, testo: 'Altre specie' },
    ],
  }
  assert.deepEqual(estrattoVoceSRD(dati, { categoria: 'Specie', pagina: 94 }).pagine, [94])
})
