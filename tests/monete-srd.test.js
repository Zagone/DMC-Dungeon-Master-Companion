import test from 'node:test'
import assert from 'node:assert/strict'
import { MONETE_SRD, convertiMoneteSRD } from '../src/dati/moneteSRD.js'
test('tabella monete: cinque denominazioni e rapporti SRD',()=>{
  assert.deepEqual(MONETE_SRD.map(m=>m.sigla),['mr','ma','me','mo','mp'])
  assert.equal(convertiMoneteSRD(100,'mr','mo'),1)
  assert.equal(convertiMoneteSRD(10,'ma','mo'),1)
  assert.equal(convertiMoneteSRD(2,'me','mo'),1)
  assert.equal(convertiMoneteSRD(1,'mp','mo'),10)
  assert.equal(convertiMoneteSRD(1,'mo','mr'),100)
})
test('conversione rifiuta valori o valute non validi',()=>{
  assert.throws(()=>convertiMoneteSRD(-1,'mo','mr'))
  assert.throws(()=>convertiMoneteSRD(1,'nonvalida','mr'))
})
