import test from 'node:test'
import assert from 'node:assert/strict'
import {
  creaIstanza,
  modelloCreatura,
  normalizzaCreatura,
  utilizzabile,
} from '../src/dati/modelloCreatura.js'

test('istanze dello stesso mostro hanno ID distinti e PF indipendenti', () => {
  const base = { ...modelloCreatura(), id: 'lupo', nome: 'Lupo', ca: 13, pfMax: 11, iniziativa: 2 }
  const a = creaIstanza(base)
  const b = creaIstanza(base)
  assert.notEqual(a.id, b.id)
  assert.equal(a.creaturaId, 'lupo')
  assert.equal(a.pf, 11)
  a.pf = 3
  assert.equal(b.pf, 11)
  assert.equal(a.iniziativa, null)
  assert.deepEqual(a.condizioni, [])
})

test('scheda personale normalizzata non viene certificata come SRD', () => {
  const c = normalizzaCreatura({ id: 'a', nome: 'Mostro', verificata: true, ca: 12, pfMax: 9 })
  assert.equal(c.verificata, false)
  assert.equal(c.statoVerifica, 'personale_non_certificata_srd')
})

test('scheda non utilizzabile con CA o PF mancanti', () => {
  const c = normalizzaCreatura({ nome: 'Mostro', statoScheda: 'pronta' })
  assert.equal(utilizzabile(c), false)
  c.ca = 12
  c.pfMax = 9
  assert.equal(utilizzabile(c), true)
})

test('normalizzazione conserva campi personalizzati e separa le azioni', () => {
  const c = normalizzaCreatura({
    nome: 'Creatura',
    campoHomebrew: 'persistente',
    attacchi: [{ nome: 'Morso' }],
  })
  assert.equal(c.campoHomebrew, 'persistente')
  assert.equal(c.azioni[0].nome, 'Morso')
  c.azioni[0].nome = 'Artiglio'
  assert.equal(c.attacchi[0].nome, 'Morso')
})
