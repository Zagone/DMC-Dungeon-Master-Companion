import test from 'node:test'
import assert from 'node:assert/strict'
import { EQUIPAGGIAMENTO_AVVENTURA_SRD } from '../src/dati/equipaggiamentoAvventuraSRD.js'
test('14 oggetti d’avventura con dati tabellari e fonte',()=>{
 assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.length,14)
 assert.equal(new Set(EQUIPAGGIAMENTO_AVVENTURA_SRD.map(x=>x.nome)).size,14)
 for(const x of EQUIPAGGIAMENTO_AVVENTURA_SRD){
  for(const k of ['nome','peso','costo','sintesi','pagina','paginaTabella']) assert.ok(x[k],x.nome+' '+k)
  assert.equal(x.dettagliCompleti,false)
 }
 assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.find(x=>x.nome==='Acido').costo,'25 mo')
 assert.equal(EQUIPAGGIAMENTO_AVVENTURA_SRD.find(x=>x.nome==='Borsa del guaritore').peso,'1,5 kg')
})
