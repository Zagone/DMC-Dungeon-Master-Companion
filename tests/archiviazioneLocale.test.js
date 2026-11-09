import test from 'node:test'
import assert from 'node:assert/strict'
import { scriviTransazione } from '../src/stato/archiviazioneLocale.js'

function archivioSimulato(iniziali = {}, erroreSu = null) {
  const valori = new Map(Object.entries(iniziali))
  let erroreUsato = false
  return {
    valori,
    getItem(chiave) { return valori.has(chiave) ? valori.get(chiave) : null },
    setItem(chiave, valore) {
      if (erroreSu === chiave && !erroreUsato) {
        erroreUsato = true
        throw new Error('Quota simulata')
      }
      valori.set(chiave, String(valore))
    },
    removeItem(chiave) {
      if (erroreSu === chiave && !erroreUsato) {
        erroreUsato = true
        throw new Error('Quota simulata')
      }
      valori.delete(chiave)
    },
  }
}

test('transazione: elimina metadati e contenuti', () => {
  const archivio = archivioSimulato({ campagne: '[1]', dati: '{"note":"prova"}' })
  assert.deepEqual(scriviTransazione([['campagne', '[]'], ['dati', null]], archivio), { successo: true })
  assert.equal(archivio.getItem('campagne'), '[]')
  assert.equal(archivio.getItem('dati'), null)
})

test('transazione: ripristina i metadati se la rimozione dei dati fallisce', () => {
  const archivio = archivioSimulato({ campagne: '[1]', dati: '{"note":"prova"}' }, 'dati')
  const risultato = scriviTransazione([['campagne', '[]'], ['dati', null]], archivio)
  assert.equal(risultato.successo, false)
  assert.equal(risultato.ripristinato, true)
  assert.equal(archivio.getItem('campagne'), '[1]')
  assert.equal(archivio.getItem('dati'), '{"note":"prova"}')
})

test('transazione: se fallisce la prima scrittura i dati restano invariati', () => {
  const archivio = archivioSimulato({ campagne: '[1]', dati: 'originale' }, 'campagne')
  const risultato = scriviTransazione([['campagne', '[]'], ['dati', null]], archivio)
  assert.equal(risultato.successo, false)
  assert.equal(archivio.getItem('campagne'), '[1]')
  assert.equal(archivio.getItem('dati'), 'originale')
})

test('transazione: conserva le chiavi non interessate', () => {
  const archivio = archivioSimulato({ campagne: '[1]', dati: 'contenuto', bestiario: 'personale' })
  scriviTransazione([['campagne', '[]'], ['dati', null]], archivio)
  assert.equal(archivio.getItem('bestiario'), 'personale')
})


test('transazione: segnala il rollback incompleto se anche il ripristino fallisce', () => {
  const valori = new Map([['campagne', '[1]'], ['dati', 'originale']])
  let scrittureCampagne = 0
  const archivio = {
    getItem(chiave) { return valori.get(chiave) ?? null },
    setItem(chiave, valore) {
      if (chiave === 'campagne' && ++scrittureCampagne === 2) {
        throw new Error('Ripristino simulato fallito')
      }
      valori.set(chiave, String(valore))
    },
    removeItem(chiave) {
      if (chiave === 'dati') throw new Error('Rimozione simulata fallita')
      valori.delete(chiave)
    },
  }
  const risultato = scriviTransazione([['campagne', '[]'], ['dati', null]], archivio)
  assert.equal(risultato.successo, false)
  assert.equal(risultato.ripristinato, false)
  assert.equal(archivio.getItem('campagne'), '[]')
  assert.equal(archivio.getItem('dati'), 'originale')
})

test('transazione: un errore nella lettura dello snapshot non modifica i dati', () => {
  const valori = new Map([['campagne', '[1]']])
  const archivio = {
    getItem() { throw new Error('Lettura simulata fallita') },
    setItem() { assert.fail('Non deve scrivere senza snapshot') },
    removeItem() { assert.fail('Non deve eliminare senza snapshot') },
  }
  const risultato = scriviTransazione([['campagne', '[]']], archivio)
  assert.equal(risultato.successo, false)
  assert.equal(risultato.ripristinato, true)
  assert.equal(valori.get('campagne'), '[1]')
})

test('transazione: ripristina il valore originale se una chiave compare due volte', () => {
  const archivio = archivioSimulato({ campagne: '[1]', dati: 'originale' }, 'dati')
  const risultato = scriviTransazione([
    ['campagne', '[2]'],
    ['campagne', '[3]'],
    ['dati', 'nuovo'],
  ], archivio)
  assert.equal(risultato.successo, false)
  assert.equal(risultato.ripristinato, true)
  assert.equal(archivio.getItem('campagne'), '[1]')
  assert.equal(archivio.getItem('dati'), 'originale')
})
