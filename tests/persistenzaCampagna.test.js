import test from 'node:test'
import assert from 'node:assert/strict'
import { nextTick } from 'vue'

const chiave = (id) => 'dmc_dati_campagna_v1_' + id
const valori = new Map()
let fallimento = false
let scritture = 0
const eventi = new Map()

globalThis.window = {
  addEventListener(nome, gestore) {
    eventi.set(nome, gestore)
  },
}
globalThis.localStorage = {
  getItem(k) {
    return valori.get(k) ?? null
  },
  setItem(k, v) {
    if (fallimento && k === chiave('prima')) throw new Error('Quota simulata')
    scritture++
    valori.set(k, String(v))
  },
  removeItem(k) {
    valori.delete(k)
  },
}

const { apriDatiCampagna, chiudiDatiCampagna, datiCampagna, campagnaDatiId, erroreDatiCampagna } =
  await import('../src/stato/statoDatiCampagna.js')

test('apertura, modifiche raggruppate e salvataggio su chiusura', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  await nextTick()
  const scritturePrimaDelleModifiche = scritture
  datiCampagna.value.note = 'Prima nota'
  datiCampagna.value.sessioni.push({ id: 's1', nome: 'Sessione 1', scene: [] })
  await nextTick()
  assert.equal(scritture - scritturePrimaDelleModifiche, 1)
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Prima nota')
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(campagnaDatiId.value, null)
})

test('riapertura ripristina note e sessioni salvate', () => {
  assert.equal(apriDatiCampagna('prima'), true)
  assert.equal(datiCampagna.value.note, 'Prima nota')
  assert.equal(datiCampagna.value.sessioni[0].nome, 'Sessione 1')
  assert.equal(chiudiDatiCampagna(), true)
})

test('pagehide salva le modifiche non ancora elaborate dal watcher', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  datiCampagna.value.note = 'Ultima nota'
  eventi.get('pagehide')()
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Ultima nota')
  await nextTick()
  assert.equal(chiudiDatiCampagna(), true)
})

test('errore di scrittura impedisce la chiusura e conserva le modifiche in memoria', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  fallimento = true
  datiCampagna.value.note = 'Non ancora salvata'
  await nextTick()
  assert.match(erroreDatiCampagna.value, /non è stata salvata/)
  assert.equal(chiudiDatiCampagna(), false)
  assert.equal(campagnaDatiId.value, 'prima')
  assert.equal(datiCampagna.value.note, 'Non ancora salvata')
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Ultima nota')
  fallimento = false
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Non ancora salvata')
})

test('dati corrotti: apertura rifiutata senza sovrascrivere il contenuto originale', async () => {
  const originale = '{"sessioni": "formato-non-valido"}'
  valori.set(chiave('corrotta'), originale)
  assert.equal(apriDatiCampagna('corrotta'), false)
  await nextTick()
  assert.equal(valori.get(chiave('corrotta')), originale)
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(valori.get(chiave('corrotta')), originale)
})
