import test from 'node:test'
import assert from 'node:assert/strict'

const valori = new Map()
let erroreSu = null
globalThis.localStorage = {
  getItem(k) { return valori.get(k) ?? null },
  setItem(k, v) {
    if (erroreSu === k) { erroreSu = null; throw new Error('Quota simulata') }
    valori.set(k, String(v))
  },
  removeItem(k) { valori.delete(k) },
}
const { campagne } = await import('../src/stato/statoCampagne.js')
const { creaturePersonali } = await import('../src/stato/statoBestiario.js')
const { creaBackup, importaBackup, FORMATO_ARCHIVIO } = await import('../src/stato/archivioDMC.js')

function archivioValido(versione = 2) {
  return {
    formato: FORMATO_ARCHIVIO, versione,
    campagne: [{
      nome: 'Importata',
      descrizione: 'Descrizione',
      stato: 'preparazione',
      dati: {
        personaggi: [], nemici: [], note: 'Nota preservata',
        iniziativa: { round: 1, turnoAttivo: null },
        sessioni: [{ id: 's1', nome: 'Prima sessione', scene: [{
          id: 'sc1', nome: 'Scena',
          incontro: { nemici: [{ creaturaId: 'mostro-personale', quantita: 2 }] },
        }] }],
      },
    }],
    ...(versione === 2 ? { creaturePersonali: [{
      id: 'mostro-personale', nome: 'Mostro personale', categoria: 'homebrew',
      statoScheda: 'pronta', ca: 12, pfMax: 10,
    }] } : {}),
  }
}

test('importazione completa v2: campagne, sessioni, incontri e bestiario', () => {
  assert.equal(importaBackup(archivioValido(), [0]), 1)
  assert.equal(campagne.value.length, 1)
  assert.equal(creaturePersonali.value.length, 1)
  const c = campagne.value[0]
  const dati = JSON.parse(valori.get('dmc_dati_campagna_v1_' + c.id))
  assert.equal(dati.note, 'Nota preservata')
  assert.equal(dati.sessioni[0].scene[0].incontro.nemici[0].quantita, 2)
  assert.equal(dati.sessioni[0].scene[0].incontro.nemici[0].istantanea.nome, 'Mostro personale')
  assert.equal(dati.sessioni[0].scene[0].incontro.nemici[0].creaturaId, creaturePersonali.value[0].id)
  assert.equal(creaBackup([c.id]).campagne[0].dati.note, 'Nota preservata')
})

test('importazione duplicata: nuovi ID campagna senza sovrascrittura', () => {
  assert.equal(importaBackup(archivioValido(), [0]), 1)
  assert.equal(campagne.value.length, 2)
  assert.notEqual(campagne.value[0].id, campagne.value[1].id)
  assert.equal(JSON.parse(valori.get('dmc_dati_campagna_v1_' + campagne.value[0].id)).note, 'Nota preservata')
})

test('importazione fallita: rollback di bestiario, metadati e dati', () => {
  const prima = new Map(valori)
  const numeroCampagne = campagne.value.length
  const numeroCreature = creaturePersonali.value.length
  erroreSu = 'dmc_campagne_v1'
  assert.throws(() => importaBackup(archivioValido(), [0]), /Importazione non riuscita/)
  assert.deepEqual(valori, prima)
  assert.equal(campagne.value.length, numeroCampagne)
  assert.equal(creaturePersonali.value.length, numeroCreature)
})

test('importazione v1: nessun bestiario personale obbligatorio', () => {
  const prima = creaturePersonali.value.length
  assert.equal(importaBackup(archivioValido(1), [0]), 1)
  assert.equal(creaturePersonali.value.length, prima)
})

test('backup: selezione vuota non modifica dati', () => {
  const prima = new Map(valori)
  assert.throws(() => importaBackup(archivioValido(), []))
  assert.deepEqual(valori, prima)
})

test('importazione: indici di selezione non validi non modificano i dati', () => {
  for (const indici of [null, '0', [-1], [1], [0.5], [NaN]]) {
    const prima = new Map(valori)
    const numeroCampagne = campagne.value.length
    const numeroCreature = creaturePersonali.value.length
    assert.throws(() => importaBackup(archivioValido(), indici), Error)
    assert.deepEqual(valori, prima)
    assert.equal(campagne.value.length, numeroCampagne)
    assert.equal(creaturePersonali.value.length, numeroCreature)
  }
})
