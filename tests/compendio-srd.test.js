import test from 'node:test'
import assert from 'node:assert/strict'
import { INCANTESIMI_SRD } from '../src/dati/incantesimiSRD.js'
import { CONDIZIONI_SRD, REGOLE_SRD, CATEGORIE_SRD, cercaRegole } from '../src/dati/compendioSRD.js'

test('indice: 339 incantesimi univoci con livello, scuola e pagina', () => {
  assert.equal(INCANTESIMI_SRD.length, 339)
  assert.equal(new Set(INCANTESIMI_SRD.map(v => v.nome)).size, 339)
  assert.equal(new Set(INCANTESIMI_SRD.map(v => v.id)).size, 339)
  for (const v of INCANTESIMI_SRD) {
    assert.ok(v.nome.length > 0)
    assert.ok(Number.isInteger(v.livello) && v.livello >= 0 && v.livello <= 9)
    assert.ok(v.scuola.length > 0)
    assert.ok(Number.isInteger(v.pagina) && v.pagina >= 121 && v.pagina <= 201)
  }
})
test('glossario: tutte le 15 condizioni SRD con identificativi stabili', () => {
  assert.equal(CONDIZIONI_SRD.length, 15)
  assert.equal(new Set(CONDIZIONI_SRD.map(v => v.id)).size, 15)
  assert.ok(CONDIZIONI_SRD.some(v => v.nome === 'Indebolimento'))
})
test('catalogo: nessun ID duplicato e categorie coerenti', () => {
  assert.equal(new Set(REGOLE_SRD.map(v => v.id)).size, REGOLE_SRD.length)
  assert.ok(REGOLE_SRD.every(v => CATEGORIE_SRD.includes(v.categoria)))
})
test('filtri: ricerca italiana senza accenti e per scuola/livello', () => {
  const palla = cercaRegole('PALLA DI FUOCO','Incantesimi',{livello:3,scuola:'Invocazione'})
  assert.equal(palla.length,1)
  assert.equal(palla[0].nome,'Palla di fuoco')
  assert.equal(cercaRegole('palla di fuoco','Incantesimi',{livello:2}).length,0)
  assert.ok(cercaRegole('velocita','Incantesimi').some(v=>v.nome==='Velocità'))
  assert.equal(cercaRegole('Accecato','Condizioni').length,1)
  assert.equal(cercaRegole('Accecato','Incantesimi').length,0)
})
test('filtri: tutti i livelli e tutte le scuole', () => {
  assert.equal(cercaRegole('','Incantesimi').length,339)
  assert.ok(cercaRegole('','Incantesimi',{livello:0}).length>0)
  assert.ok(cercaRegole('','Incantesimi',{livello:9}).length>0)
  assert.ok(cercaRegole('','Incantesimi',{scuola:'Necromanzia'}).length>0)
})
