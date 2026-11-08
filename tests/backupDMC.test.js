import test from 'node:test'
import assert from 'node:assert/strict'
import { verificaArchivio, FORMATO_ARCHIVIO } from '../src/stato/archivioDMC.js'

const datiValidi = () => ({
  personaggi: [], nemici: [], sessioni: [], note: '',
  iniziativa: { round: 1, turnoAttivo: null },
})
const backup = (versione = 2) => ({
  formato: FORMATO_ARCHIVIO,
  versione,
  campagne: [{ nome: 'Campagna di prova', dati: datiValidi() }],
  ...(versione === 2 ? { creaturePersonali: [] } : {}),
})

test('backup: formato v1 compatibile', () => {
  assert.equal(verificaArchivio(backup(1)), true)
})

test('backup: formato v2 compatibile', () => {
  assert.equal(verificaArchivio(backup(2)), true)
})

test('backup: formato sconosciuto rifiutato', () => {
  const archivio = backup()
  archivio.formato = 'non-dmc'
  assert.throws(() => verificaArchivio(archivio))
})

test('backup: dati campagna non validi rifiutati', () => {
  const archivio = backup()
  archivio.campagne[0].dati.sessioni = 'non-un-array'
  assert.throws(() => verificaArchivio(archivio))
})

test('backup: incontri con quantità non valida rifiutati', () => {
  const archivio = backup()
  archivio.campagne[0].dati.sessioni.push({
    scene: [{ incontro: { nemici: [{ creaturaId: 'creatura-1', quantita: 31 }] } }],
  })
  assert.throws(() => verificaArchivio(archivio))
})

test('backup: duplicati nel bestiario personale rifiutati', () => {
  const archivio = backup()
  archivio.creaturePersonali = [
    { id: 'uno', nome: 'Creatura A' },
    { id: 'uno', nome: 'Creatura B' },
  ]
  assert.throws(() => verificaArchivio(archivio))
})
