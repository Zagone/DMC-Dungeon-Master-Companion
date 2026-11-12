import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { estraiTalentiSRD, NOMI_TALENTI_SRD } from '../src/dati/estrazioneTalentiSRD.js'

const file = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'compendio',
  'talenti.json',
)
test('17 talenti individuali presenti nelle tre pagine SRD', () => {
  const archivio = JSON.parse(readFileSync(file, 'utf8'))
  const talenti = estraiTalentiSRD(archivio)
  assert.equal(talenti.length, 17)
  assert.deepEqual(
    talenti.map((v) => v.nome),
    [...NOMI_TALENTI_SRD],
  )
  assert.equal(new Set(talenti.map((v) => v.nome)).size, 17)
  for (const talento of talenti) {
    assert.ok(talento.descrizione.length > 70, talento.nome)
    assert.ok(talento.pagina >= 98 && talento.pagina <= 100)
    assert.equal(talento.verificato, false)
  }
})
test('archivi incompleti non vengono accettati', () => {
  assert.throws(() => estraiTalentiSRD({ categoria: 'talenti', pagine: [] }))
})
