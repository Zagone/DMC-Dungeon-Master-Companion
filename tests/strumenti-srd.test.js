import test from 'node:test'
import assert from 'node:assert/strict'
import { STRUMENTI_SRD } from '../src/dati/strumentiSRD.js'

test('25 strumenti SRD individuali e senza duplicati', () => {
  assert.equal(STRUMENTI_SRD.length, 25)
  assert.equal(STRUMENTI_SRD.filter((s) => s.tipologia === 'Artigiano').length, 17)
  assert.equal(STRUMENTI_SRD.filter((s) => s.tipologia === 'Altro').length, 8)
  assert.equal(new Set(STRUMENTI_SRD.map((s) => s.nome)).size, 25)
  for (const s of STRUMENTI_SRD) {
    for (const key of ['nome', 'caratteristica', 'costo', 'peso', 'pagina'])
      assert.ok(s[key], s.nome + ': ' + key)
    assert.ok(s.pagina >= 105 && s.pagina <= 107)
    assert.equal(s.dettagliCompleti, false)
  }
})
