import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { estraiSchedeSpecieSRD, NOMI_SPECIE_SRD } from '../src/dati/estrazioneSpecieSRD.js'

const file = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'compendio',
  'specie.json',
)

test('estrazione specie: nove schede, nomi e riferimenti originali', () => {
  const archivio = JSON.parse(readFileSync(file, 'utf8'))
  const schede = estraiSchedeSpecieSRD(archivio)
  assert.deepEqual(
    schede.map((v) => v.nome),
    [...NOMI_SPECIE_SRD],
  )
  for (const scheda of schede) {
    assert.equal(scheda.tipoCreatura, 'Umanoide')
    assert.ok(scheda.taglie.length > 0)
    assert.ok(scheda.tratti.length > 0)
    assert.ok(scheda.velocitaMetri > 0)
    assert.ok(scheda.pagine.length > 0)
    assert.equal(scheda.metadatiVerificati, true)
    assert.equal(scheda.testoTrattiVerificato, false)
  }
})

test('estrazione specie: non accetta archivi privi di sezioni', () => {
  assert.throws(() => estraiSchedeSpecieSRD({ categoria: 'specie', pagine: [] }))
})

test('metadati: taglie e velocità non uniformi conservate', () => {
  const archivio = JSON.parse(readFileSync(file, 'utf8'))
  const schede = estraiSchedeSpecieSRD(archivio)
  assert.equal(schede.find((v) => v.nome === 'Goliath').velocitaMetri, 10.5)
  assert.deepEqual(schede.find((v) => v.nome === 'Tiefling').taglie, ['Media', 'Piccola'])
  assert.deepEqual(schede.find((v) => v.nome === 'Umano').taglie, ['Media', 'Piccola'])
  assert.deepEqual(schede.find((v) => v.nome === 'Elfo').pagine, [94, 95])
})

test('opzioni: tre lignaggi elfici e tre retaggi tiefling con progressione', () => {
  const archivio = JSON.parse(readFileSync(file, 'utf8'))
  const schede = estraiSchedeSpecieSRD(archivio)
  for (const nome of ['Elfo', 'Tiefling']) {
    const opzioni = schede.find((v) => v.nome === nome).opzioni
    assert.equal(opzioni.length, 3)
    for (const opzione of opzioni) {
      assert.ok(opzione.livello1)
      assert.ok(opzione.livello3)
      assert.ok(opzione.livello5)
    }
  }
  assert.equal(schede.find((v) => v.nome === 'Dragonide').opzioni.length, 10)
  assert.equal(schede.find((v) => v.nome === 'Goliath').opzioni.length, 6)
  assert.equal(schede.find((v) => v.nome === 'Gnomo').opzioni.length, 2)
})
