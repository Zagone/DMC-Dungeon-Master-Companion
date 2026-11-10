import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { estraiSchedeSpecieSRD, NOMI_SPECIE_SRD } from '../src/dati/estrazioneSpecieSRD.js'

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'compendio', 'specie.json')

test('estrazione specie: nove schede, nomi e riferimenti originali', () => {
  const archivio = JSON.parse(readFileSync(file, 'utf8'))
  const schede = estraiSchedeSpecieSRD(archivio)
  assert.deepEqual(schede.map(v=>v.nome), [...NOMI_SPECIE_SRD])
  for (const scheda of schede) {
    assert.ok(scheda.descrizione.startsWith(scheda.nome))
    assert.ok(scheda.descrizione.length > 80)
    assert.ok(scheda.pagine.length > 0)
    assert.equal(scheda.verificato, false)
  }
})

test('estrazione specie: non accetta archivi privi di sezioni', () => {
  assert.throws(() => estraiSchedeSpecieSRD({categoria:'specie',pagine:[]}))
})
