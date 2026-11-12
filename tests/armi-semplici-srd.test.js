import test from 'node:test'
import assert from 'node:assert/strict'
import { ARMI_SEMPLICI_SRD } from '../src/dati/armiSempliciSRD.js'
test('quattordici armi semplici SRD con campi completi', () => {
  assert.equal(ARMI_SEMPLICI_SRD.length, 14)
  assert.equal(ARMI_SEMPLICI_SRD.filter((v) => v.impiego === 'Mischia').length, 10)
  assert.equal(ARMI_SEMPLICI_SRD.filter((v) => v.impiego === 'Distanza').length, 4)
  assert.equal(new Set(ARMI_SEMPLICI_SRD.map((v) => v.nome)).size, 14)
  for (const arma of ARMI_SEMPLICI_SRD) {
    for (const campo of [
      'nome',
      'dadiDanno',
      'tipoDanno',
      'proprieta',
      'padronanza',
      'peso',
      'costo',
    ]) {
      assert.ok(arma[campo], arma.nome + ' campo ' + campo)
    }
    assert.equal(arma.pagina, 103)
  }
  assert.equal(ARMI_SEMPLICI_SRD.find((v) => v.nome === 'Pugnale').costo, '2 mo')
  assert.equal(ARMI_SEMPLICI_SRD.find((v) => v.nome === 'Arco corto').dadiDanno, '1d6')
})
