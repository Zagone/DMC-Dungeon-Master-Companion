import test from 'node:test'
import assert from 'node:assert/strict'
import { BACKGROUND_SRD } from '../src/dati/backgroundSRD.js'
import { REGOLE_SRD } from '../src/dati/compendioSRD.js'

test('quattro background SRD indicizzati e normalizzati', () => {
  const indici = REGOLE_SRD.filter((v) => v.categoria === 'Origini').map((v) => v.nome)
  assert.deepEqual(
    BACKGROUND_SRD.map((v) => v.nome),
    indici,
  )
  assert.equal(new Set(BACKGROUND_SRD.map((v) => v.nome)).size, 4)
  for (const voce of BACKGROUND_SRD) {
    assert.equal(voce.pagina, 93)
    assert.equal(voce.caratteristiche.length, 3)
    assert.equal(voce.abilita.length, 2)
    assert.ok(voce.talento && voce.strumenti)
    assert.ok(voce.equipaggiamentoA.length > 20)
    assert.equal(voce.equipaggiamentoB, '50 mo')
  }
})
test('background: associazione talenti SRD', () => {
  assert.equal(
    BACKGROUND_SRD.find((v) => v.nome === 'Accolito').talento,
    'Iniziato alla magia (chierico)',
  )
  assert.equal(BACKGROUND_SRD.find((v) => v.nome === 'Criminale').talento, 'Allerta')
  assert.equal(
    BACKGROUND_SRD.find((v) => v.nome === 'Sapiente').talento,
    'Iniziato alla magia (mago)',
  )
  assert.equal(BACKGROUND_SRD.find((v) => v.nome === 'Soldato').talento, 'Aggressore selvaggio')
})
