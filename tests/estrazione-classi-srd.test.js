import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CLASSI_SRD_PAGINE, estraiClassiSRD } from '../src/dati/estrazioneClassiSRD.js'

const archivio = JSON.parse(
  readFileSync(new URL('../public/compendio/classi.json', import.meta.url), 'utf8'),
)

test('Le classi SRD sono dodici e ciascuna mantiene il testo pertinente', () => {
  const classi = estraiClassiSRD(archivio)
  assert.equal(classi.size, 12)
  for (const [nome, pagina] of CLASSI_SRD_PAGINE) {
    const classe = classi.get(nome)
    assert.ok(classe, nome)
    assert.equal(classe.pagina, pagina)
    assert.ok(classe.testo.startsWith(nome + '\n'), nome)
    assert.ok(classe.testo.length > 1000)
    assert.ok(classe.privilegi.length >= 10, 'Indice privilegi insufficiente: ' + nome)
    assert.ok(classe.privilegi.every((p) =>
      p.livello >= 1 && p.livello <= 20 && p.pagina >= 32 && p.pagina <= 92))
  }
})

test('Le classi che condividono una pagina non si contaminano a vicenda', () => {
  const classi = estraiClassiSRD(archivio)
  assert.match(classi.get('Barbaro').testo, /Cammino del berserker/i)
  assert.doesNotMatch(classi.get('Barbaro').testo, /\nBardo\nTratti del bardo/)
  assert.match(classi.get('Bardo').testo, /Ispirazione bardica/i)
  assert.doesNotMatch(classi.get('Bardo').testo, /Presenza intimidatoria/)
  assert.doesNotMatch(classi.get('Chierico').testo, /\nDruido\nTratti del druido/)
  assert.doesNotMatch(classi.get('Stregone').testo, /\nWarlock\nTratti del warlock/)
  assert.match(classi.get('Warlock').testo, /Magia del patto/i)
})

test('L’indice privilegi conserva titolo, livello e pagina originale', () => {
  const classi = estraiClassiSRD(archivio)
  assert.ok(classi.get('Barbaro').privilegi.some((v) =>
    v.livello === 1 && v.nome === 'Ira' && v.pagina === 32))
  assert.ok(classi.get('Guerriero').privilegi.some((v) =>
    v.livello === 2 && v.nome === 'Azione impetuosa'))
  assert.ok(classi.get('Monaco').privilegi.some((v) =>
    v.livello === 1 && v.nome === 'Arti marziali'))
  const vista = readFileSync(new URL('../src/views/CompendioView.vue', import.meta.url), 'utf8')
  assert.match(vista, /estraiClassiSRD/)
  assert.match(vista, /privilegiClasse/)
  assert.match(vista, /compendio-indice-privilegi/)
})

test('Un archivio incompleto non viene dichiarato valido', () => {
  assert.throws(() => estraiClassiSRD(null), TypeError)
  assert.throws(() => estraiClassiSRD({ categoria: 'classi', pagine: [] }),
    /intestazioni/i)
})
