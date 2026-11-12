import test from 'node:test'
import assert from 'node:assert/strict'

const CHIAVE = 'dmc_campagne_v1'
const prefisso = 'dmc_dati_campagna_v1_'
const campagna = (id) => ({
  id,
  nome: 'Campagna ' + id,
  descrizione: '',
  creataIl: '2026-01-01',
  modificataIl: '2026-01-01',
  stato: 'preparazione',
})
const valori = new Map([
  [CHIAVE, JSON.stringify([campagna('prima'), campagna('seconda')])],
  [prefisso + 'prima', JSON.stringify({ note: 'da eliminare' })],
  [prefisso + 'seconda', JSON.stringify({ note: 'da conservare' })],
  ['dmc_bestiario_personale', 'creature personali'],
])
let fallimento = null
globalThis.localStorage = {
  getItem(chiave) {
    return valori.get(chiave) ?? null
  },
  setItem(chiave, valore) {
    if (fallimento === chiave) {
      fallimento = null
      throw new Error('Scrittura simulata non riuscita')
    }
    valori.set(chiave, String(valore))
  },
  removeItem(chiave) {
    if (fallimento === chiave) {
      fallimento = null
      throw new Error('Rimozione simulata non riuscita')
    }
    valori.delete(chiave)
  },
}

const { campagne, eliminaCampagnaConDati } = await import('../src/stato/statoCampagne.js')

test('eliminazione integrata: errore sui dati conserva entrambe le campagne', () => {
  fallimento = prefisso + 'prima'
  assert.equal(eliminaCampagnaConDati('prima'), false)
  assert.deepEqual(
    campagne.value.map((c) => c.id),
    ['prima', 'seconda'],
  )
  assert.deepEqual(
    JSON.parse(valori.get(CHIAVE)).map((c) => c.id),
    ['prima', 'seconda'],
  )
  assert.equal(JSON.parse(valori.get(prefisso + 'prima')).note, 'da eliminare')
})

test('eliminazione integrata: rimuove soltanto la campagna selezionata', () => {
  assert.equal(eliminaCampagnaConDati('prima'), true)
  assert.deepEqual(
    campagne.value.map((c) => c.id),
    ['seconda'],
  )
  assert.deepEqual(
    JSON.parse(valori.get(CHIAVE)).map((c) => c.id),
    ['seconda'],
  )
  assert.equal(valori.has(prefisso + 'prima'), false)
  assert.equal(JSON.parse(valori.get(prefisso + 'seconda')).note, 'da conservare')
  assert.equal(valori.get('dmc_bestiario_personale'), 'creature personali')
})

test('eliminazione integrata: campagna inesistente non modifica archivio', () => {
  const prima = new Map(valori)
  assert.equal(eliminaCampagnaConDati('inesistente'), false)
  assert.deepEqual(valori, prima)
})
