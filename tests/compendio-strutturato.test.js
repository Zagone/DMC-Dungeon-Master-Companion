import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  blocchiTestoSRD,
  estraiGlossarioSRD,
  estraiTestiSpecieSRD,
  estraiTestiOriginiSRD,
  estraiTestiOggettiMagiciSRD,
  estraiTestiEquipaggiamentoSRD,
} from '../src/dati/letturaStrutturataSRD.js'
import { estraiIndiceOggettiMagici } from '../src/dati/indiceOggettiMagiciSRD.js'
import { EQUIPAGGIAMENTO_AVVENTURA_SRD } from '../src/dati/equipaggiamentoAvventuraSRD.js'

function archivio(nome) {
  return JSON.parse(readFileSync(new URL('../public/compendio/' + nome + '.json', import.meta.url), 'utf8'))
}

test('Il glossario SRD produce le quindici condizioni senza testo della voce successiva', () => {
  const voci = estraiGlossarioSRD(archivio('condizioni'))
  assert.ok(voci.length >= 140, 'Indice del glossario eccessivamente ridotto')
  assert.equal(voci.filter((v) => v.categoria === 'Condizioni').length, 15)
  assert.equal(new Set(voci.map((v) => v.id)).size, voci.length)
  for (const voce of voci) {
    assert.ok(voce.descrizione.length > 10)
    assert.ok(voce.pagina >= 202 && voce.pagina <= 218)
  }
  const trattenuto = voci.find((v) => v.nome === 'Trattenuto')
  assert.match(trattenuto.descrizione, /svantaggio ai tiri salvezza su Destrezza/i)
  assert.doesNotMatch(trattenuto.descrizione, /Un trucchetto è un incantesimo/i)
  assert.ok(voci.some((v) => v.nome === 'Azione bonus'))
})

test('Le nove specie sono segmentate per intestazione senza incorporare la successiva', () => {
  const voci = estraiTestiSpecieSRD(archivio('specie'))
  assert.equal(voci.size, 9)
  assert.match(voci.get('Dragonide').testo, /Soffio/i)
  assert.doesNotMatch(voci.get('Dragonide').testo, /^Elfo$/m)
  assert.doesNotMatch(voci.get('Elfo').testo, /^Gnomo$/m)
  assert.ok(voci.get('Tiefling').pagine.includes(97))
})

test('I background SRD non vengono sostituiti dall’intera pagina', () => {
  const voci = estraiTestiOriginiSRD(archivio('origini'))
  for (const nome of ['Accolito', 'Criminale', 'Sapiente', 'Soldato']) {
    assert.ok(voci.get(nome)?.testo.length > 20, 'Descrizione assente: ' + nome)
  }
  assert.doesNotMatch(voci.get('Accolito').testo, /^Criminale$/m)
})

test('Gli oggetti magici delimitano le descrizioni anche con tipi specificati', () => {
  const dati = archivio('oggetti-magici')
  const indice = estraiIndiceOggettiMagici(dati)
  const voci = estraiTestiOggettiMagiciSRD(dati, indice)
  assert.ok(indice.length >= 170)
  assert.ok(voci.filter((v) => v.descrizioneEstratta).length >= 160)
  const ali = voci.find((v) => v.nome === 'Ali del volo')
  assert.match(ali.descrizione, /velocità di volo di 18 metri/i)
  assert.doesNotMatch(ali.descrizione, /Ammazzadraghi|Ammazzagiganti/i)
  assert.equal(ali.dettagliCompleti, false, 'La trascrizione automatica non è revisione editoriale')
})

test('Le descrizioni dell’equipaggiamento sono delimitate per singolo oggetto', () => {
  const dati = estraiTestiEquipaggiamentoSRD(archivio('equipaggiamento'), EQUIPAGGIAMENTO_AVVENTURA_SRD)
  assert.ok(dati.size >= 80)
  const acido = dati.get('Acido')
  assert.match(acido.testo, /2d6 danni da acido/i)
  assert.equal(acido.testo.includes('Acqua santa'), false)
  assert.match(dati.get('Corda').testo, /corda/i)
})

test('La lettura restituisce blocchi tipografici, non HTML o pagine grezze', () => {
  assert.deepEqual(blocchiTestoSRD('[Pagina SRD 203]\nLivello 1: Prova\nUn testo.\n• Un esempio'), [
    { tipo: 'pagina', testo: '[Pagina SRD 203]' },
    { tipo: 'titolo', testo: 'Livello 1: Prova' },
    { tipo: 'paragrafo', testo: 'Un testo.' },
    { tipo: 'elenco', testo: 'Un esempio' },
  ])
  const vista = readFileSync(new URL('../src/views/CompendioView.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(vista, /Consulta testo della pagina SRD/)
  assert.doesNotMatch(vista, /<pre\s+v-if="testoFonte/)
  assert.match(vista, /TestoCompendioSRD/)
})
