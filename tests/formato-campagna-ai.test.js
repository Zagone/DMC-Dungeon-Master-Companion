import test from 'node:test'
import assert from 'node:assert/strict'
import { creaModelloCampagnaAI, verificaCampagnaAI } from '../src/dati/formatoCampagnaAI.js'
test('modello campagna AI valido', () => {
 assert.equal(verificaCampagnaAI(creaModelloCampagnaAI()),true)
})
test('rifiuta JSON non conforme e campi essenziali mancanti', () => {
 for (const dato of [null, [], {}, { ...creaModelloCampagnaAI(), formato:'altro' },
   { ...creaModelloCampagnaAI(), sessioni:[null] },
   { ...creaModelloCampagnaAI(), sessioni:[{nome:'S',descrizione:'',scene:[{nome:'X',descrizione:'',incontro:{nemici:[{nome:'Orco',quantita:31}]}}]}] },
   { ...creaModelloCampagnaAI(), png:[{nome:'',descrizione:''}] }]) {
   assert.throws(()=>verificaCampagnaAI(dato))
 }
})
test('supporta più nemici in una scena', () => {
 const c=creaModelloCampagnaAI()
 c.sessioni[0].scene[0].incontro={nemici:[{nome:'Capo',quantita:1},{nome:'Gregario',quantita:3}]}
 assert.equal(verificaCampagnaAI(c),true)
})
