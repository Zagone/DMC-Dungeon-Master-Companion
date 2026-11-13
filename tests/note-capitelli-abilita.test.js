import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { normalizzaCreatura, creaIstanza } from '../src/dati/modelloCreatura.js'

const tattica = readFileSync(
  new URL('../src/components/SchedaTatticaCreatura.vue', import.meta.url), 'utf8',
)
const completa = readFileSync(
  new URL('../src/components/SchedaCreatura.vue', import.meta.url), 'utf8',
)
const editor = readFileSync(
  new URL('../src/components/EditorCreatura.vue', import.meta.url), 'utf8',
)

test('Le note dei capitelli compaiono sotto le azioni tattiche, non nel testo della regola', () => {
  assert.match(tattica, /<p>\{\{ voce\.descrizione \}\}<\/p>\s*<p v-if="voce\.notaCapitello" class="nota-capitello">/)
  assert.match(tattica, /<p>\{\{ tratto\.descrizione \}\}<\/p>\s*<p v-if="tratto\.notaCapitello" class="nota-capitello">/)
  assert.match(tattica, /\.azione \.nota-capitello \{[\s\S]*?font-size: 0\.74rem;/)
  assert.match(tattica, /\.azione \.nota-capitello \{[\s\S]*?font-style: italic;/)
  assert.match(tattica, /white-space: pre-line;/)
})

test('Le note sono leggibili anche nella scheda completa, sempre in corsivo', () => {
  assert.match(completa, /\{\{ regola\.descrizione \}\}[\s\S]*?<p v-if="regola\.notaCapitello" class="nota-capitello">/)
  assert.match(completa, /\.regola \.nota-capitello \{[\s\S]*?font-size: 0\.74rem;/)
  assert.match(completa, /\.regola \.nota-capitello \{[\s\S]*?font-style: italic;/)
})

test('Il campo facoltativo è modificabile dall’editor per tratti e azioni', () => {
  assert.equal(editor.split('v-model="regola.notaCapitello"').length - 1, 2)
  assert.match(editor, /Nota contestuale del DM \(facoltativa, in corsivo\)/)
})

test('Importazione e istanza preservano i cinque capitelli e i 55 PF di Aldren', () => {
  const notaCoraggio = 'Coraggio — annulla il primo colpo.\nCompassione — lascia il PG a 1 PF.'
  const notaMemoria = 'Memoria — annulla la prima Campana.'
  const notaVerita = 'Verità — annulla Spaventato.'
  const notaSacrificio = 'Sacrificio — consente un tentativo di redenzione.'
  const base = normalizzaCreatura({
    id: 'custom-aldren-completo',
    nome: 'Aldren',
    ca: 13,
    pfMax: 55,
    statoScheda: 'pronta',
    azioni: [
      { nome: 'Attacco normale', descrizione: '+4 a colpire, 1d8+2', notaCapitello: notaCoraggio },
      { nome: "Campana dell'Oblio", descrizione: '1d6 tuono', notaCapitello: notaMemoria },
      { nome: 'Catene del Rimorso', descrizione: 'TS Forza CD 12' },
      { nome: 'Voce del Giudizio', descrizione: 'TS Saggezza CD 12', notaCapitello: notaVerita },
    ],
    capacita: [
      { nome: 'Redenzione possibile', descrizione: 'Fase narrativa', notaCapitello: notaSacrificio },
    ],
  })
  assert.equal(base.pfMax, 55)
  assert.equal(base.azioni[0].notaCapitello, notaCoraggio)
  assert.equal(base.azioni[1].notaCapitello, notaMemoria)
  assert.equal(base.azioni[2].notaCapitello, undefined)
  assert.equal(base.azioni[3].notaCapitello, notaVerita)
  assert.equal(base.capacita[0].notaCapitello, notaSacrificio)
  const istanza = creaIstanza(base)
  assert.equal(istanza.pf, 55)
  assert.equal(istanza.pfMax, 55)
  assert.equal(istanza.azioni[0].notaCapitello, notaCoraggio)
})
