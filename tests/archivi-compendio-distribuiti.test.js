import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validaArchivioIncantesimi } from '../src/dati/archivioIncantesimiCompleti.js'

const base = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'compendio')
const sezioni = [
  'classi',
  'specie',
  'origini',
  'talenti',
  'equipaggiamento',
  'oggetti-magici',
  'regole',
  'condizioni',
]

test('compendio distribuito: 339 incantesimi completi e nomi univoci', () => {
  const archivio = JSON.parse(readFileSync(join(base, 'incantesimi.json'), 'utf8'))
  const voci = validaArchivioIncantesimi(archivio)
  assert.equal(voci.length, 339)
  assert.equal(new Set(voci.map((v) => v.nome)).size, 339)
  for (const voce of voci) {
    assert.ok(voce.descrizione.trim(), `Descrizione mancante: ${voce.nome}`)
  }
})

for (const categoria of sezioni) {
  test(`compendio distribuito: ${categoria} contiene pagine SRD valide`, () => {
    const archivio = JSON.parse(readFileSync(join(base, `${categoria}.json`), 'utf8'))
    assert.equal(archivio.formato, 'dmc-compendio-sezione')
    assert.equal(archivio.versione, 1)
    assert.equal(archivio.categoria, categoria)
    assert.ok(archivio.pagine.length > 0)
    assert.equal(new Set(archivio.pagine.map((p) => p.pagina)).size, archivio.pagine.length)
    for (const pagina of archivio.pagine) {
      assert.ok(Number.isInteger(pagina.pagina) && pagina.pagina > 0)
      assert.ok(typeof pagina.testo === 'string' && pagina.testo.trim().length > 20)
    }
  })
}
