import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const gestione = readFileSync(new URL('../src/components/GestioneSessioni.vue', import.meta.url), 'utf8')
const conduzione = readFileSync(new URL('../src/components/ConduzioneSessione.vue', import.meta.url), 'utf8')

test('Clic sulla scena aggiorna il riferimento corrente persistente', () => {
  assert.match(gestione, /function consultaScena\(sessione, id\)[\s\S]*?sessione\.scenaAttivaId = id[\s\S]*?scenaConsultataId\.value = id/)
  assert.match(conduzione, /@click="consultaScena\(sessioneInConduzione, scena\.id\)"/)
  assert.match(conduzione, /@change="consultaScena\(sessioneInConduzione, \$event\.target\.value\)"/)
})

test('La scena non necessita più del pulsante Imposta come corrente', () => {
  assert.doesNotMatch(conduzione, /Imposta come corrente|impostaScenaCorrente/)
  assert.doesNotMatch(gestione, /function impostaScenaCorrente|:imposta-scena-corrente/)
})

test('Visitata resta un indicatore esplicito, distinto dalla scena corrente', () => {
  assert.match(conduzione, /class="stato-visita-scena"/)
  assert.match(conduzione, /type="checkbox"/)
  assert.match(conduzione, /impostaVisitata\(/)
  assert.match(gestione, /sessione\.sceneVisitateIds = visitata/)
  assert.doesNotMatch(gestione.match(/function consultaScena\(sessione, id\) \{[\s\S]*?\n\}/)?.[0] || '', /impostaVisitata|sceneVisitateIds/)
})
