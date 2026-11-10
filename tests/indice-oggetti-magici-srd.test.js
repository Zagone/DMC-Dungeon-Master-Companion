import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { estraiIndiceOggettiMagici } from '../src/dati/indiceOggettiMagiciSRD.js'

const archivio = JSON.parse(readFileSync(new URL('../public/compendio/oggetti-magici.json',import.meta.url),'utf8'))
test('indice oggetti magici ricavato da tipologia e rarità riconoscibili', () => {
 const voci = estraiIndiceOggettiMagici(archivio)
 assert.ok(voci.length >= 10,'Estratte meno di 10 voci; controllare il formato dell’archivio')
 assert.equal(new Set(voci.map(v=>v.nome.toLowerCase())).size,voci.length)
 for(const v of voci){
   assert.ok(v.nome && v.tipo && v.rarita)
   assert.ok(v.pagina>=237 && v.pagina<=288)
   assert.equal(v.dettagliCompleti,false)
   assert.equal(v.indicizzazioneAutomatica,true)
 }
})
test('archivio non valido rifiutato',()=>{
 assert.throws(()=>estraiIndiceOggettiMagici(null),TypeError)
})
