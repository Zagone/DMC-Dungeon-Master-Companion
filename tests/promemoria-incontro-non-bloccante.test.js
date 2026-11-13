import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  suggerimentiCreatureNonCollegate,
  suggerimentoRiconosciuto,
} from '../src/dati/promemoriaIncontro.js'
import { valutaIncontro } from '../src/dati/valutazioneIncontro.js'

const gestione = readFileSync(
  new URL('../src/components/GestioneSessioni.vue', import.meta.url),
  'utf8',
)
const conduzione = readFileSync(
  new URL('../src/components/ConduzioneSessione.vue', import.meta.url),
  'utf8',
)
const editor = readFileSync(
  new URL('../src/components/EditorDettagliScena.vue', import.meta.url),
  'utf8',
)

const risolvi = (voce) => voce.istantanea

test('Il suggerimento riconosce una call to action, senza trattarla come requisito', () => {
  assert.equal(suggerimentoRiconosciuto("Carica Aldren nell'incontro", 'Aldren'), true)
  assert.equal(suggerimentoRiconosciuto('Carica Aldren', 'Alden'), true)
  assert.equal(suggerimentoRiconosciuto('Aldren', 'Aldren, il Custode'), true)
})

test('Il controllo delle note opera con nomi e campagne qualsiasi', () => {
  const casi = [
    {
      nome: 'Campagna fantasy',
      richiedeCreature: ['Carica Aldren nell’incontro'],
      nemici: [{ creaturaId: 'boss', nome: 'Aldren', quantita: 1, istantanea: { nome: 'Aldren' } }],
      attesi: [],
    },
    {
      nome: 'Campagna draconica',
      richiedeCreature: ['Drago rosso', 'Orchi'],
      nemici: [{ creaturaId: 'drago', quantita: 1, istantanea: { nome: 'Drago rosso adulto' } }],
      attesi: ['Orchi'],
    },
    {
      nome: 'Campagna cyberfantasy',
      richiedeCreature: ['Guardiano del portale'],
      nemici: [{ creaturaId: 'robot', nome: 'Automa', quantita: 3, istantanea: { nome: 'Automa' } }],
      attesi: ['Guardiano del portale'],
    },
    {
      nome: 'Campagna senza suggerimenti',
      richiedeCreature: [],
      nemici: [{ creaturaId: 'ragno', quantita: 2, istantanea: { nome: 'Ragno gigante' } }],
      attesi: [],
    },
  ]

  for (const campagna of casi) {
    const scena = { titolo: campagna.nome, incontro: { nemici: campagna.nemici, richiedeCreature: campagna.richiedeCreature } }
    assert.deepEqual(suggerimentiCreatureNonCollegate(scena, risolvi), campagna.attesi, campagna.nome)
    // La presenza di suggerimenti non cambia la valutazione dell'incontro.
    const valutazione = valutaIncontro({
      pg: 4,
      livello: 2,
      nemici: [{ quantita: 1 }],
      risolviCreatura: () => ({ puntiEsperienza: 50 }),
      collegamentiMancanti: campagna.attesi.length > 0,
    })
    assert.match(valutazione, /50 PE · Bassa/, campagna.nome)
  }
})

test('I tre punti del caricamento non usano mai richiedeCreature come blocco', () => {
  const richiesta = gestione.slice(gestione.indexOf('function richiediCaricamento(scena) {'), gestione.indexOf('function caricaIncontro(scena) {'))
  const caricamento = gestione.slice(gestione.indexOf('function caricaIncontro(scena) {'), gestione.indexOf('</script>', gestione.indexOf('function caricaIncontro(scena) {')))
  assert.match(richiesta, /if \(!totaleNemici\(scena\)\)/)
  assert.doesNotMatch(richiesta, /creatureDaCollegare\(scena\)/)
  assert.doesNotMatch(caricamento, /if\s*\(creatureDaCollegare/)
  assert.doesNotMatch(gestione, /collegamentiMancanti:/)
})

test('Il pulsante è abilitato quando esiste almeno un nemico, anche con suggerimenti mancanti', () => {
  const incontr = conduzione.slice(conduzione.indexOf('<!-- INCONTRO -->'), conduzione.indexOf('<!-- REGISTRO DELLA SESSIONE -->'))
  const bottone = incontr.slice(incontr.indexOf('<button'), incontr.indexOf('</button>'))
  assert.match(bottone, /:disabled="!totaleNemici\(scenaConsultata\(sessioneInConduzione\)\)"/)
  assert.doesNotMatch(bottone, /creatureDaCollegare/)
  assert.match(incontr, /Suggerimento del copione \(facoltativo\):/)
  assert.match(editor, /Suggerimento del copione \(facoltativo\):/)
})
