import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { REGOLE_SRD } from '../src/dati/compendioSRD.js'

const cartella = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'compendio')
const manifest = JSON.parse(readFileSync(join(cartella, 'manifest.json'), 'utf8'))
const categorie = {
  'Classi': 'classi', 'Specie': 'specie', 'Origini': 'origini',
  'Talenti': 'talenti', 'Equipaggiamento': 'equipaggiamento',
  'Oggetti magici': 'oggetti-magici', 'Regole': 'regole', 'Condizioni': 'condizioni'
}

test('manifest SRD: nove categorie registrate', () => {
  assert.equal(manifest.formato, 'dmc-compendio-manifest')
  assert.equal(manifest.versione, 1)
  assert.deepEqual(Object.keys(manifest.categorie).sort(), [...Object.values(categorie), 'incantesimi'].sort())
  assert.equal(manifest.categorie.incantesimi.schede, 339)
})

for (const [nome, percorso] of Object.entries(categorie)) {
  test(`integrità indice: ${nome} punta a pagine presenti nel JSON`, () => {
    const archivio = JSON.parse(readFileSync(join(cartella, `${percorso}.json`), 'utf8'))
    const pagine = new Set(archivio.pagine.map(p => p.pagina))
    assert.equal(archivio.pagine.length, manifest.categorie[percorso].pagine)
    const voci = REGOLE_SRD.filter(v => v.categoria === nome)
    assert.ok(voci.length > 0, `Nessuna voce indicizzata per ${nome}`)
    for (const voce of voci) {
      assert.ok(pagine.has(voce.pagina), `Pagina ${voce.pagina} mancante per ${nome}: ${voce.nome}`)
    }
  })
}
