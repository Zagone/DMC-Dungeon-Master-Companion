import test from 'node:test'
import assert from 'node:assert/strict'
import { CAVALCATURE_SRD, FINIMENTI_SRD, NAVI_SRD } from '../src/dati/cavalcatureVeicoliSRD.js'

test('tabelle SRD: 8 cavalcature, 10 finimenti, 7 veicoli grandi', () => {
  assert.equal(CAVALCATURE_SRD.length, 8)
  assert.equal(FINIMENTI_SRD.length, 10)
  assert.equal(NAVI_SRD.length, 7)
  const tutte = [...CAVALCATURE_SRD, ...FINIMENTI_SRD, ...NAVI_SRD]
  assert.equal(new Set(tutte.map(x => x.nome)).size, tutte.length)
  for (const voce of tutte) {
    assert.ok(voce.nome)
    assert.ok(voce.costo)
    assert.ok([113,114].includes(voce.pagina))
    assert.equal(voce.dettagliCompleti, false)
  }
})
test('cavalcature e finimenti: dati SRD tabellari', () => {
  const cavallo = CAVALCATURE_SRD.find(x => x.nome === 'Cavallo da guerra')
  assert.equal(cavallo.capacitaTrasporto,'270 kg')
  assert.equal(cavallo.costo,'400 mo')
  assert.equal(FINIMENTI_SRD.find(x => x.nome === 'Sella militare').costo,'20 mo')
  assert.equal(FINIMENTI_SRD.find(x => x.nome === 'Carrozza').peso,'300 kg')
})
test('veicoli aerei e imbarcazioni: valori tabellari completi', () => {
  const dirigibile = NAVI_SRD.find(x => x.nome === 'Dirigibile')
  assert.equal(dirigibile.velocita,'12 km/h')
  assert.equal(dirigibile.equipaggio,10)
  assert.equal(dirigibile.ca,13)
  assert.equal(dirigibile.pf,300)
  assert.equal(dirigibile.costo,'40.000 mo')
  assert.equal(NAVI_SRD.find(x=>x.nome==='Barcone').sogliaDanno,10)
  assert.equal(NAVI_SRD.find(x=>x.nome==='Nave lunga').passeggeri,150)
})
