import test from 'node:test'
import assert from 'node:assert/strict'
import { ARMI_SEMPLICI_SRD } from '../src/dati/armiSempliciSRD.js'
import { ARMI_DA_GUERRA_SRD, ARMATURE_SRD } from '../src/dati/armiArmatureSRD.js'

test('equipaggiamento: 38 armi individuali senza duplicati', () => {
  const tutte = [...ARMI_SEMPLICI_SRD, ...ARMI_DA_GUERRA_SRD]
  assert.equal(tutte.length, 38)
  assert.equal(ARMI_DA_GUERRA_SRD.length, 24)
  assert.equal(ARMI_DA_GUERRA_SRD.filter((a) => a.impiego === 'Mischia').length, 18)
  assert.equal(ARMI_DA_GUERRA_SRD.filter((a) => a.impiego === 'Distanza').length, 6)
  assert.equal(new Set(tutte.map((a) => a.nome)).size, 38)
  for (const arma of tutte) {
    for (const campo of ['nome', 'proprieta', 'padronanza', 'peso', 'costo'])
      assert.ok(arma[campo], arma.nome + ': ' + campo)
  }
})
test('armature: 12 armature e uno scudo con CA e requisiti', () => {
  assert.equal(ARMATURE_SRD.length, 13)
  assert.equal(new Set(ARMATURE_SRD.map((a) => a.nome)).size, 13)
  assert.equal(ARMATURE_SRD.find((a) => a.nome === 'Scudo').classeArmatura, '+2')
  assert.equal(ARMATURE_SRD.find((a) => a.nome === 'Armatura a piastre').forzaMinima, 15)
  assert.equal(ARMATURE_SRD.find((a) => a.nome === 'Cotta di maglia').classeArmatura, '16')
  for (const armatura of ARMATURE_SRD) {
    assert.ok(armatura.classeArmatura && armatura.peso && armatura.costo)
    assert.equal(armatura.pagina, 104)
  }
})
