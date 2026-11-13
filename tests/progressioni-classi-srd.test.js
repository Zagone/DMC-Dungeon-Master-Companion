import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { PROGRESSIONI_CLASSI_SRD } from '../src/dati/progressioniClassiSRD.js'
import { CLASSI_SRD_PAGINE, estraiClassiSRD } from '../src/dati/estrazioneClassiSRD.js'

const nomeClassi = CLASSI_SRD_PAGINE.map(([nome]) => nome)
const archivio = JSON.parse(
  readFileSync(new URL('../public/compendio/classi.json', import.meta.url), 'utf8'),
)

test('Dodici progressioni SRD, esattamente 240 righe e livelli da 1 a 20', () => {
  assert.deepEqual(Object.keys(PROGRESSIONI_CLASSI_SRD), nomeClassi)
  const sezioni = estraiClassiSRD(archivio)
  let sommaRighe = 0
  for (const nome of nomeClassi) {
    const progressione = PROGRESSIONI_CLASSI_SRD[nome]
    assert.ok(sezioni.has(nome))
    assert.equal(progressione.nome, nome)
    assert.equal(progressione.righe.length, 20)
    assert.equal(new Set(progressione.colonne).size, progressione.colonne.length)
    assert.ok(progressione.colonne.includes('Privilegi di classe'))
    for (let i = 0; i < 20; i++) {
      const riga = progressione.righe[i]
      assert.equal(riga.length, progressione.colonne.length, nome + ' livello ' + (i + 1))
      assert.equal(riga[0], String(i + 1))
      assert.equal(riga[1], '+' + (2 + Math.floor(i / 4)))
      assert.ok(riga[2])
      assert.ok(riga.slice(3).every((valore) =>
        /^(?:—|\+?\d+(?:,\d+)?(?:\s*m)?|\d+d\d+|D\d+)$/i.test(valore)),
      'Cella numerica non riconosciuta: ' + nome + ' livello ' + (i + 1))
    }
    sommaRighe += progressione.righe.length
  }
  assert.equal(sommaRighe, 240)
})

test('I cinque incantatori completi hanno nove colonne di slot e profili equivalenti', () => {
  const nomi = ['Bardo', 'Chierico', 'Druido', 'Mago', 'Stregone']
  for (const nome of nomi) {
    const classe = PROGRESSIONI_CLASSI_SRD[nome]
    assert.equal(classe.colonne.filter((c) => c.startsWith('Slot di')).length, 9)
    assert.deepEqual(classe.righe.map((r) => r.slice(-9)),
      PROGRESSIONI_CLASSI_SRD.Bardo.righe.map((r) => r.slice(-9)))
  }
  assert.deepEqual(PROGRESSIONI_CLASSI_SRD.Mago.righe[0].slice(-9),
    ['2', '—', '—', '—', '—', '—', '—', '—', '—'])
  assert.deepEqual(PROGRESSIONI_CLASSI_SRD.Stregone.righe[19].slice(-9),
    ['4', '3', '3', '3', '3', '2', '2', '1', '1'])
})

test('Paladino e Ranger condividono le cinque colonne di slot ridotti', () => {
  const a = PROGRESSIONI_CLASSI_SRD.Paladino
  const b = PROGRESSIONI_CLASSI_SRD.Ranger
  assert.equal(a.colonne.filter((c) => c.startsWith('Slot di')).length, 5)
  assert.equal(b.colonne.filter((c) => c.startsWith('Slot di')).length, 5)
  assert.deepEqual(a.righe.map((r) => r.slice(-5)), b.righe.map((r) => r.slice(-5)))
  assert.deepEqual(a.righe[19].slice(-5), ['4', '3', '3', '3', '2'])
})

test('Le risorse per classe mantengono valori particolari dell’originale', () => {
  const c = PROGRESSIONI_CLASSI_SRD
  assert.deepEqual(c.Barbaro.righe[0].slice(-3), ['2', '+2', '2'])
  assert.deepEqual(c.Barbaro.righe[19].slice(-3), ['6', '+4', '4'])
  assert.equal(c.Ladro.righe[18][3], '10d6')
  assert.equal(c.Monaco.righe[5][5], '+4,5 m')
  assert.equal(c.Guerriero.righe[19][4], '6')
  assert.deepEqual(c.Warlock.righe[0].slice(-5), ['1', '2', '2', '1', '1'])
  assert.deepEqual(c.Warlock.righe[19].slice(-5), ['10', '4', '15', '4', '5'])
})

test('La vista utilizza la tabella strutturata e non solo l’indice di titoli', () => {
  const vista = readFileSync(new URL('../src/views/CompendioView.vue', import.meta.url), 'utf8')
  const componente = readFileSync(new URL('../src/components/TabellaProgressioneClasse.vue', import.meta.url), 'utf8')
  assert.match(vista, /PROGRESSIONI_CLASSI_SRD/)
  assert.match(vista, /TabellaProgressioneClasse/)
  assert.match(componente, /scope="col"/)
  assert.match(componente, /scope="row"/)
  assert.match(componente, /overflow-x: auto/)
  assert.match(componente, /:aria-label/)
})
