import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { creaPromptCreazioneDMC } from '../src/dati/protocolloCreazioneDMC.js'
import { copiaNegliAppunti } from '../src/dati/copiaNegliAppunti.js'
import { leggiJsonDaChatGPT } from '../src/dati/jsonDaChatGPT.js'

const campagna = readFileSync(
  new URL('../src/components/CreazioneAssistitaCampagna.vue', import.meta.url), 'utf8',
)
const creatura = readFileSync(
  new URL('../src/components/SceltaCreazioneCreatura.vue', import.meta.url), 'utf8',
)
const importazioneSessioni = readFileSync(
  new URL('../src/components/ImportaSessioniJSON.vue', import.meta.url), 'utf8',
)

test('Prompt campagna: protocollo breve, incrementale e indipendente dall’account', () => {
  const testo = creaPromptCreazioneDMC({
    titolo: 'Il Giardino Infranto',
    premessa: 'I fiumi hanno cambiato corso.',
    pg: 4,
    livello: 3,
    sessioni: 4,
  })
  assert.match(testo, /Il Giardino Infranto/)
  assert.match(testo, /I fiumi hanno cambiato corso/)
  assert.match(testo, /massimo 180 parole/)
  assert.match(testo, /NON una trattazione di tutte le scene/)
  assert.match(testo, /aggiorna SOLO le parti modificate/)
  assert.match(testo, /In esame:/)
  assert.match(testo, /Proposta:/)
  assert.match(testo, /Da decidere:/)
  assert.match(testo, /Prossimo passo:/)
  assert.match(testo, /COMANDO DI ESPORTAZIONE \(NON CASE-SENSITIVE\)/)
  assert.match(testo, /«esporta dmc», «ESPORTA DMC», «Esporta», «genera il JSON»/)
  assert.match(testo, /NON pretendere una formula esatta/)
  assert.doesNotMatch(testo, /non passare all.esportazione finché non scrivo esattamente/i)
  assert.match(testo, /dmc-archivio-campagne/)
  assert.match(testo, /"versione":2/)
  assert.match(testo, /creaturePersonali/)
  assert.match(testo, /richiedeCreature.*SUGGERIMENTI facoltativi/)
  assert.match(testo, /Non dichiarare di aver creato un allegato se non esiste/)
  assert.match(testo, /Incolla JSON/)
})

test('Protocollo sessioni: usa il formato compatibile e mantiene le fasi', () => {
  const testo = creaPromptCreazioneDMC(
    { titolo: 'Secondo atto', sessioni: 2, livello: 5 }, 'sessioni',
  )
  assert.match(testo, /dmc-sessioni/)
  assert.match(testo, /"versione":1/)
  assert.doesNotMatch(testo, /"formato":"dmc-archivio-campagne"/)
  assert.match(testo, /una sessione\/scena alla volta/)
  assert.match(testo, /COMANDO DI ESPORTAZIONE \(NON CASE-SENSITIVE\)/)
})

test('Importazione senza file: JSON completo o unico blocco fenced json', () => {
  const esempio = '{"formato":"dmc-archivio-campagne","versione":2,"campagne":[]}'
  assert.deepEqual(leggiJsonDaChatGPT(esempio), JSON.parse(esempio))
  assert.deepEqual(leggiJsonDaChatGPT('```json\n'+esempio+'\n```'), JSON.parse(esempio))
  assert.deepEqual(leggiJsonDaChatGPT('```JSON\r\n'+esempio+'\r\n```'), JSON.parse(esempio))
  assert.throws(() => leggiJsonDaChatGPT(''), /Incolla prima il JSON/)
  assert.throws(() => leggiJsonDaChatGPT('Ecco il file: '+esempio), /un singolo JSON valido/)
  assert.throws(() => leggiJsonDaChatGPT('{"incompleto":'), /un singolo JSON valido/)
  assert.throws(() => leggiJsonDaChatGPT(esempio, 10), /supera il limite/)
})

test('Copia: risultato confermato tramite Clipboard API', async () => {
  let copiato = ''
  const ok = await copiaNegliAppunti('DMC', {
    navigatore: { clipboard: { writeText: async (s) => { copiato = s } } },
    documento: null,
  })
  assert.equal(ok, true)
  assert.equal(copiato, 'DMC')
})

function documentoFittizio(successo = true) {
  let selezionato = false
  let eliminato = false
  let ripristinato = false
  const precedente = { isConnected: true, focus() { ripristinato = true } }
  const nodo = {
    value: '',
    style: {},
    setAttribute() {},
    focus() {},
    select() { selezionato = true },
    setSelectionRange() {},
    remove() { eliminato = true },
  }
  const documento = {
    activeElement: precedente,
    body: { appendChild() {} },
    createElement: () => nodo,
    execCommand: (nome) => nome === 'copy' && successo,
  }
  return { documento, stato: () => ({ selezionato, eliminato, ripristinato }) }
}

test('Copia: fallback se API non disponibile o rifiutata', async () => {
  for (const navigatore of [ {}, { clipboard: { writeText: async () => { throw new Error('denied') } } } ]) {
    const mock = documentoFittizio(true)
    assert.equal(await copiaNegliAppunti('DMC', { navigatore, documento: mock.documento }), true)
    assert.deepEqual(mock.stato(), { selezionato: true, eliminato: true, ripristinato: true })
  }
})

test('Copia: nessun falso successo se anche il fallback fallisce', async () => {
  const mock = documentoFittizio(false)
  assert.equal(await copiaNegliAppunti('DMC', { navigatore: {}, documento: mock.documento }), false)
  assert.equal(await copiaNegliAppunti('DMC', { navigatore: {}, documento: null }), false)
  assert.equal(await copiaNegliAppunti('', { navigatore: {}, documento: mock.documento }), false)
})

test('Feedback nello stesso viewport: campagna e creatura', () => {
  for (const sorgente of [campagna, creatura]) {
    const indiceCopia = sorgente.indexOf('@click="copiaPrompt"')
    const indiceFeedback = sorgente.indexOf('role="status" aria-live="polite"', indiceCopia)
    assert.ok(indiceCopia >= 0 && indiceFeedback > indiceCopia)
    assert.ok(indiceFeedback - indiceCopia < 800)
    assert.match(sorgente, /copiaConfermata \? '✓ Prompt copiato'/)
    assert.match(sorgente, /const riuscita = await copiaNegliAppunti\(prompt.value\)/)
    assert.match(sorgente, /anteprimaPrompt.value\?\.select\(\)/)
  }
})

test('Campagna: stessa validazione per file e testo e download JSON locale', () => {
  assert.match(campagna, /async function leggiCampagnaDaTesto\(/)
  assert.match(campagna, /const archivio = leggiJsonDaChatGPT\(jsonIncollato.value\)/)
  assert.equal((campagna.match(/verificaArchivio\(archivio\)/g) || []).length, 2)
  assert.match(campagna, /v-model="jsonIncollato"/)
  assert.match(campagna, /Scarica JSON sul dispositivo/)
  assert.match(campagna, /URL.createObjectURL\(blob\)/)
  assert.match(campagna, /type="file"/)
  assert.match(campagna, /Confermo l.importazione nella/)
})

test('Anche le sessioni possono essere importate incollando il JSON', () => {
  assert.match(importazioneSessioni, /const contenuto = leggiJsonDaChatGPT\(jsonIncollato.value, MAX_FILE\)/)
  assert.equal((importazioneSessioni.match(/verificaArchivioSessioniChatGPT\(contenuto\)/g) || []).length, 2)
  assert.match(importazioneSessioni, /v-model="jsonIncollato"/)
  assert.match(importazioneSessioni, /Scarica JSON sul dispositivo/)
  assert.match(importazioneSessioni, /URL.createObjectURL\(blob\)/)
  assert.match(importazioneSessioni, /type="file"/)
})
