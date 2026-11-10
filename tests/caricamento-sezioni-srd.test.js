import test from 'node:test'
import assert from 'node:assert/strict'
import { caricaSezioneSRD, paginaSRD } from '../src/dati/caricamentoSezioniSRD.js'

test('caricamento sezioni: valida la struttura e recupera la pagina', async () => {
  const precedente = globalThis.fetch
  globalThis.fetch = async () => ({ok:true,json:async()=>({
    formato:'dmc-compendio-sezione',versione:1,categoria:'classi',
    pagine:[{pagina:32,testo:'Barbaro'}]
  })})
  try {
    const dati = await caricaSezioneSRD('Classi')
    assert.equal(paginaSRD(dati,32),'Barbaro')
    assert.equal(paginaSRD(dati,33),'')
  } finally {globalThis.fetch = precedente}
})
test('caricamento sezioni: rifiuta categoria sconosciuta', async () => {
  await assert.rejects(caricaSezioneSRD('Inesistente'))
})
