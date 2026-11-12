import test from 'node:test'
import assert from 'node:assert/strict'
import { EQUIPAGGIAMENTO_AVVENTURA_SRD } from '../src/dati/equipaggiamentoAvventuraSRD.js'
test('82 oggetti d’avventura con dati tabellari e fonte', () => {
  assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.length, 82)
  assert.equal(new Set(EQUIPAGGIAMENTO_AVVENTURA_SRD.map((x) => x.nome)).size, 82)
  for (const x of EQUIPAGGIAMENTO_AVVENTURA_SRD) {
    for (const k of ['nome', 'peso', 'costo', 'sintesi', 'pagina', 'paginaTabella'])
      assert.ok(x[k], x.nome + ' ' + k)
    assert.equal(x.dettagliCompleti, false)
  }
  assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Acido').costo, '25 mo')
  assert.equal(
    EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Borsa del guaritore').peso,
    '1,5 kg',
  )
  assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Zaino').costo, '2 mo')
  assert.equal(
    EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Pozione di guarigione').peso,
    '0,25 kg',
  )
  assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Otre').peso, '2,5 kg (pieno)')
  assert.equal(
    EQUIPAGGIAMENTO_AVVENTURA_SRD.find((x) => x.nome === 'Focus arcano').costo,
    'Variabile',
  )
})
