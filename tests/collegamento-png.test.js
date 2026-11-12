import test from 'node:test'
import assert from 'node:assert/strict'
import { collegaPNGDaBestiario } from '../src/dati/collegamentoPNG.js'
const creatura = { id: 'png-homebrew-01', nome: 'Mira', categoria: 'png' }
test('collegamento PNG: usa riferimento reale e conserva campi narrativi indipendenti', () => {
  const registro = []
  const r = collegaPNGDaBestiario(registro, creatura, () => 'registro-01')
  assert.equal(r.successo, true)
  assert.equal(registro[0].creaturaId, creatura.id)
  assert.equal(registro[0].nome, 'Mira')
  assert.equal(registro[0].id, 'registro-01')
  registro[0].obiettivo = 'Nascondere la verità'
  assert.equal(creatura.obiettivo, undefined)
})
test('collegamento PNG: rifiuta duplicati nella stessa campagna e creature non PNG', () => {
  const registro = []
  assert.equal(collegaPNGDaBestiario(registro, creatura, () => 'uno').successo, true)
  assert.equal(collegaPNGDaBestiario(registro, creatura, () => 'due').successo, false)
  assert.equal(
    collegaPNGDaBestiario(registro, { ...creatura, categoria: 'homebrew' }, () => 'tre').successo,
    false,
  )
  assert.equal(registro.length, 1)
})
