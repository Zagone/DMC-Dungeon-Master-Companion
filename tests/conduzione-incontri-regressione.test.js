import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const conduzione = readFileSync(
  new URL('../src/components/ConduzioneSessione.vue', import.meta.url),
  'utf8',
)
const gestione = readFileSync(
  new URL('../src/components/GestioneSessioni.vue', import.meta.url),
  'utf8',
)

const contestoIncontro = [
  ['creatureDaCollegare', 'creature-da-collegare'],
  ['difficolta', 'difficolta'],
]

test('Le funzioni del riquadro Incontro sono dichiarate tra i props richiesti', () => {
  for (const [nome] of contestoIncontro) {
    assert.match(
      conduzione,
      new RegExp('\\b' + nome + ': \\{ type: Function, required: true \\}'),
      'Prop mancante per ' + nome,
    )
    assert.match(
      conduzione,
      new RegExp('const ' + nome + ' = props\\.' + nome + '\\b'),
      'Alias disponibile nel template mancante per ' + nome,
    )
  }
})

test('Il genitore trasmette entrambe le funzioni senza alterare dati o routing', () => {
  const apertura = gestione.indexOf('<ConduzioneSessione')
  const chiusura = gestione.indexOf('/>', apertura)
  assert.ok(apertura >= 0 && chiusura > apertura)
  const collegamento = gestione.slice(apertura, chiusura + 2)

  for (const [nome, attributo] of contestoIncontro) {
    assert.ok(
      collegamento.includes(':' + attributo + '="' + nome + '"'),
      'Funzione non passata alla Conduzione: ' + nome,
    )
  }
  assert.match(gestione, /function creatureDaCollegare\(scena\)/)
  assert.match(gestione, /function difficolta\(scena, sessione\)/)
})

test('Le scene con un incontro usano entrambe le funzioni nel template', () => {
  const i = conduzione.indexOf('<!-- INCONTRO -->')
  assert.ok(i > 0)
  const blocco = conduzione.slice(i, conduzione.indexOf('<!-- REGISTRO DELLA SESSIONE -->', i))

  assert.match(blocco, /difficolta\(scenaConsultata\(sessioneInConduzione\), sessioneInConduzione\)/)
  assert.match(blocco, /creatureDaCollegare\(scenaConsultata\(sessioneInConduzione\)\)/)
  assert.match(blocco, /Carica in Battaglia/)
  assert.match(blocco, /richiediCaricamento\(scenaConsultata\(sessioneInConduzione\)\)/)
  assert.match(blocco, /caricaIncontro\(scenaConsultata\(sessioneInConduzione\)\)/)
})
