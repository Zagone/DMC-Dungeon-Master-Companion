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
  estraiTestiStrumentiSRD,
} from '../src/dati/letturaStrutturataSRD.js'
import { estraiIndiceOggettiMagici, estraiVociOggettiMagici } from '../src/dati/indiceOggettiMagiciSRD.js'
import { EQUIPAGGIAMENTO_AVVENTURA_SRD } from '../src/dati/equipaggiamentoAvventuraSRD.js'
import { STRUMENTI_SRD } from '../src/dati/strumentiSRD.js'

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
  const tiefling = voci.get('Tiefling').testo
  const umano = voci.get('Umano').testo
  assert.match(tiefling, /Retaggio immondo/i)
  assert.match(tiefling, /Scurovisione/i)
  assert.match(umano, /Intraprendente/i)
  assert.match(umano, /Versatile/i)
  assert.doesNotMatch(umano, /Retaggi immondi|Raggio di infermità|Blocca persone|Oscurità/i)
  assert.doesNotMatch(tiefling, /Intraprendente|Pluriabilità|Versatile/i)
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
  assert.ok(indice.length >= 245)
  assert.ok(voci.filter((v) => v.descrizioneEstratta).length >= 245)
  const ali = voci.find((v) => v.nome === 'Ali del volo')
  assert.match(ali.descrizione, /velocità di volo di 18 metri/i)
  assert.doesNotMatch(ali.descrizione, /Ammazzadraghi|Ammazzagiganti/i)
  assert.equal(ali.dettagliCompleti, false, 'La trascrizione automatica non è revisione editoriale')
})

test('Oggetti magici: titoli su più righe, rarità e sintonia sono corretti', () => {
  const voci = estraiVociOggettiMagici(archivio('oggetti-magici'))
  const lookup = (nome) => voci.find((voce) => voce.nome === nome)
  const nomi = voci.map((voce) => voce.nome)
  assert.equal(new Set(nomi).size, nomi.length)
  for (const voce of voci) {
    assert.ok(voce.descrizione?.length >= 15, 'Testo mancante: ' + voce.nome)
    assert.equal(voce.dettagliCompleti, false)
    assert.ok(voce.pagina >= 237 && voce.pagina <= 288)
  }
  assert.equal(lookup('Lama della fortuna').richiedeSintonia, true)
  assert.equal(lookup('Lama della fortuna').rarita, 'leggendario')
  assert.match(lookup('Amuleto anti-individuazione e localizzazione').descrizione, /divinazione/)
  assert.match(lookup('Anello della caduta morbida').descrizione, /danni dalla caduta/)
  assert.match(lookup("Incensiere del controllo degli elementali dell'aria").descrizione, /elementale/)
  assert.doesNotMatch(lookup("Incensiere del controllo degli elementali dell'aria").descrizione, /Lama della fortuna|Fortuna\./)
  assert.match(lookup('Lanterna della rivelazione').descrizione, /invisibili/)
  assert.equal(lookup('Sfera elastica 4 Diadema incandescente'), undefined)
})

test('Oggetti magici: titolo e tipologia spezzati non contaminano le schede successive', () => {
  const testo = [
    'Oggetto di prova',
    'Oggetto meraviglioso, raro',
    'Una prima descrizione.',
    'Braciere del comando',
    'degli elementali del fuoco',
    'Oggetto meraviglioso, raro',
    'Descrizione del braciere.',
    'Lama della fortuna',
    'Arma (spada corta, spada lunga,',
    'spadone o stocco), leggendaria (richiede',
    'sintonia)',
    'Lama con proprietà speciali.',
    'Oggetto successivo',
    'Oggetto meraviglioso, comune',
    'Ultima descrizione.',
  ].join('\\n')
  const voci = estraiVociOggettiMagici({ pagine: [{ pagina: 237, testo }] })
  assert.equal(voci.length, 4)
  assert.equal(voci[1].nome, 'Braciere del comando degli elementali del fuoco')
  assert.equal(voci[2].richiedeSintonia, true)
  assert.match(voci[2].descrizione, /proprietà speciali/)
  assert.doesNotMatch(voci[2].descrizione, /Ultima descrizione/)
})

test('La vista espone le descrizioni di specie, classi e origini senza dipendere da pagine grezze', () => {
  const vista = readFileSync(new URL('../src/views/CompendioView.vue', import.meta.url), 'utf8')
  assert.match(vista, /descrizioneSpecie/)
  assert.match(vista, /descrizioneClasse/)
  assert.match(vista, /descrizioneOrigine/)
  assert.match(vista, /indiceRicerca/)
  assert.match(vista, /annullaConsultazione/)
})

test('Le descrizioni dell’equipaggiamento sono delimitate per singolo oggetto', () => {
  const dati = estraiTestiEquipaggiamentoSRD(archivio('equipaggiamento'), EQUIPAGGIAMENTO_AVVENTURA_SRD)
  assert.ok(dati.size >= 80)
  const acido = dati.get('Acido')
  assert.match(acido.testo, /2d6 danni da acido/i)
  assert.equal(acido.testo.includes('Acqua santa'), false)
  assert.match(dati.get('Corda').testo, /corda/i)
})

test('Tutti i 25 strumenti riportano utilizzi, creazioni e varianti pertinenti', () => {
  const dati = estraiTestiStrumentiSRD(archivio('equipaggiamento'), STRUMENTI_SRD)
  assert.equal(dati.size, 25)
  assert.match(dati.get('Scorte da alchimista').testo, /Utilizzo:/)
  assert.match(dati.get('Strumento musicale').testo, /Varianti:/)
  assert.equal(dati.get('Strumento musicale').testo.includes('Abiti da viaggiatore'), false)
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
