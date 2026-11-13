import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  haContenutoTattico,
  haDettagliExtraTattici,
  CAMPI_EXTRA_TATTICI,
} from '../src/dati/visibilitaTattica.js'

const tattica = readFileSync(
  new URL('../src/components/SchedaTatticaCreatura.vue', import.meta.url),
  'utf8',
)
const battaglia = readFileSync(
  new URL('../src/components/GestioneBattaglia.vue', import.meta.url),
  'utf8',
)
const mediaTouch = '@media (max-width: 1024px), (max-width: 1440px) and (any-pointer: coarse)'

test('Uccello Stigeo: una scheda con difese assenti non mostra dettagli extra su touch', () => {
  const uccelloStigeo = {
    nome: 'Uccello Stigeo',
    resistenze: [],
    vulnerabilita: [],
    immunita: [],
    immunitaCondizioni: [],
    abilita: [],
    lingue: 'Nessuna',
    equipaggiamento: '',
  }

  assert.equal(haDettagliExtraTattici(uccelloStigeo), false)
  assert.equal(haDettagliExtraTattici({ nome: 'Senza dati' }), false)
})

test('Voci vuote o segnaposto non contano come informazioni utili', () => {
  for (const assente of [null, undefined, '', ' ', 'Nessuna', 'nessuno', '—', '-', 'Non indicato', 'Non presente nella scheda SRD', [], ['Nessuna'], false]) {
    assert.equal(haContenutoTattico(assente), false, String(assente))
  }
})

test('Difese reali e informazioni aggiuntive non vengono nascoste', () => {
  const casi = [
    { resistenze: ['Fuoco'] },
    { vulnerabilita: ['Radiante'] },
    { immunita: ['Freddo'] },
    { immunitaCondizioni: ['Avvelenato'] },
    { abilita: [{ nome: 'Percezione', bonus: 4 }] },
    { lingue: 'Comune' },
    { equipaggiamento: 'Arco corto' },
    { lingue: 'Nessuna', immunita: ['Veleno'] },
  ]
  for (const caso of casi) {
    assert.equal(haDettagliExtraTattici(caso), true, JSON.stringify(caso))
  }
  assert.deepEqual(CAMPI_EXTRA_TATTICI, [
    'resistenze', 'vulnerabilita', 'immunita', 'immunitaCondizioni',
    'abilita', 'lingue', 'equipaggiamento',
  ])
})

test('Il pannello tattico usa la verifica dei dati con CSS specifico per touch', () => {
  assert.match(tattica, /haDatiExtra = computed\(\(\) => haDettagliExtraTattici\(props\.creatura\)\)/)
  assert.match(tattica, /class="sezione-espandibile difese-extra-tattiche"/)
  assert.match(tattica, /:class="\{ 'dettagli-vuoti': !haDatiExtra \}"/)
  assert.match(tattica, /:class="\{ 'dettaglio-assente': !haContenutoTattico\(creatura\[riga\[0\]\]\) \}"/)
  assert.ok(tattica.includes(mediaTouch))
  assert.match(tattica, /\.tattica-creatura \.difese-extra-tattiche\.dettagli-vuoti,[\s\S]*?display: none;/)
  // Desktop: il details originale rimane nel DOM e il CSS opera solo entro @media.
  assert.match(tattica, /<summary>Difese, immunità e informazioni aggiuntive<\/summary>/)
})

test('In tutte le schede nemiche il menu originale completo è nascosto solo su touch', () => {
  assert.match(battaglia, /<details class="scheda-originale-nemico">\s*<summary>Consulta la scheda originale completa<\/summary>/)
  assert.match(battaglia, /<SchedaCreatura :creatura="nemico" combattimento \/>/)
  assert.ok(battaglia.includes(mediaTouch))
  assert.match(battaglia, /\.battaglia-dmc \.scheda-originale-nemico \{\s*display: none;/)
  assert.match(battaglia, /<SchedaTatticaCreatura :creatura="nemico" \/>/)
})
