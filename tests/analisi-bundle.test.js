import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { dipendenzeStatiche, dimensioniBundle } from '../scripts/analizza-bundle.mjs'

const manifest = {
  'index.html': {
    isEntry: true,
    file: 'assets/index.js',
    imports: ['_condiviso.js'],
    dynamicImports: ['src/views/DashboardView.vue'],
  },
  '_condiviso.js': { file: 'assets/shared.js' },
  'src/views/DashboardView.vue': {
    file: 'assets/home.js',
    imports: ['_condiviso.js'],
    dynamicImports: ['src/components/GestioneArchivioDMC.vue'],
  },
  'src/components/GestioneArchivioDMC.vue': { file: 'assets/backup.js' },
}

test('Il grafo iniziale esclude i moduli caricati con import dinamico', () => {
  assert.deepEqual(dipendenzeStatiche(manifest, ['index.html']), [
    'assets/index.js',
    'assets/shared.js',
  ])
})

test('La Home include le dipendenze statiche condivise una sola volta', () => {
  assert.deepEqual(dipendenzeStatiche(manifest, ['index.html', 'src/views/DashboardView.vue']), [
    'assets/home.js',
    'assets/index.js',
    'assets/shared.js',
  ])
})

test('Le dimensioni sono ottenute dai file reali della build e non da stime nominali', () => {
  const dir = mkdtempSync(join(tmpdir(), 'dmc-bundle-'))
  try {
    mkdirSync(join(dir, 'assets'))
    const dati = {
      'index.js': 'console.log("avvio")',
      'shared.js': 'console.log("condiviso")',
      'home.js': 'console.log("home")',
    }
    for (const [nome, testo] of Object.entries(dati)) {
      writeFileSync(join(dir, 'assets', nome), testo)
    }
    const esito = dimensioniBundle(manifest, dir, ['index.html', 'src/views/DashboardView.vue'])
    const byte = Object.values(dati).reduce((n, testo) => n + Buffer.byteLength(testo), 0)
    const gzip = Object.values(dati).reduce((n, testo) => n + gzipSync(testo).length, 0)
    assert.equal(esito.moduli, 3)
    assert.equal(esito.byte, byte)
    assert.equal(esito.gzip, gzip)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('Un modulo mancante nel manifest interrompe un report inattendibile', () => {
  assert.throws(
    () => dipendenzeStatiche(manifest, ['modulo-sconosciuto']),
    /Modulo non presente nel manifest/,
  )
})
