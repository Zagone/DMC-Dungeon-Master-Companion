import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sezioniCampagna } from '../src/dati/sezioniCampagna.js'

const vista = readFileSync(new URL('../src/views/CampagnaView.vue', import.meta.url), 'utf8')
const router = readFileSync(new URL('../src/router/index.js', import.meta.url), 'utf8')

test('La panoramica è una rotta distinta dagli strumenti di conduzione', () => {
  assert.match(router, /name: 'campagna'/)
  assert.match(router, /name: 'sezione-campagna'/)
  assert.match(vista, /route\.name === 'campagna'/)
  assert.match(vista, /<GestionePanoramica/)
})

test('La barra operativa è nascosta nella panoramica e non contiene la scheda Panoramica', () => {
  assert.match(vista, /v-show="sezione !== 'panoramica'"/)
  assert.match(vista, /sezioni\.filter\(\(voce\) => !\['panoramica', 'bestiario'\]\.includes\(voce\.id\)\)/)
  assert.deepEqual(
    sezioniCampagna.filter((s) => !['panoramica', 'bestiario'].includes(s.id)).map((s) => s.id),
    ['sessioni', 'battaglia', 'note'],
  )
})

test('Il ritorno alla panoramica è esplicito e indipendente dalle tab', () => {
  assert.match(vista, /@click="vaiSezione\('panoramica'\)"/)
  assert.match(vista, /← Panoramica campagna/)
  assert.match(vista, /@vai-battaglia="vaiSezione\('battaglia'\)"/)
  assert.match(vista, /@click="riprendiSessione"/)
})

test('L\'altezza della navigazione sticky viene ricalcolata dopo il cambio di sezione', () => {
  assert.match(vista, /watch\(sezione, async \(nuovaSezione\) => \{/)
  assert.match(vista, /await nextTick\(\)\s+aggiornaMisure\(\)/)
  assert.match(vista, /ref="navigazione"/)
})

test('La barra sticky compatta contiene solo navigazione e uscita su una riga', () => {
  assert.doesNotMatch(vista, /navigazione-contesto|nome-campagna-compatto/)
  assert.doesNotMatch(vista, /v-if="!navigazioneCompatta"/)
  assert.match(vista, /<nav class="tabs" aria-label="Strumenti della campagna">/)
  assert.match(vista, /class="bottone neutro uscita-campagna uscita-normale dmc-btn dmc-btn--secondary"/)
})
