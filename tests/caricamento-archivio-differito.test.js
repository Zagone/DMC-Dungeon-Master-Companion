import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const dashboard = readFileSync(new URL('../src/views/DashboardView.vue', import.meta.url), 'utf8')
const libreria = readFileSync(new URL('../src/views/LibreriaView.vue', import.meta.url), 'utf8')

test('La dashboard non importa staticamente la gestione backup', () => {
  assert.match(dashboard, /defineAsyncComponent\(\(\) => import\('\.\.\/components\/GestioneArchivioDMC\.vue'\)\)/)
  assert.doesNotMatch(dashboard, /import GestioneArchivioDMC from/)
  assert.match(dashboard, /<GestioneArchivioDMC v-if="gestioneDatiAperta"/)
  assert.match(dashboard, /@toggle="gestioneDatiAperta = \$event\.target\.open"/)
})

test('La libreria mantiene accessibile il backup tramite caricamento differito', () => {
  assert.match(libreria, /defineAsyncComponent\(\(\) => import\('\.\.\/components\/GestioneArchivioDMC\.vue'\)\)/)
  assert.doesNotMatch(libreria, /import GestioneArchivioDMC from/)
  assert.match(libreria, /<GestioneArchivioDMC\s*\/>/)
})
