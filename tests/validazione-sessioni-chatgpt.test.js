import test from 'node:test'
import assert from 'node:assert/strict'
import { verificaArchivioSessioniChatGPT } from '../src/dati/validazioneSessioniChatGPT.js'
const valido = () => ({ formato:'dmc-sessioni', versione:1, sessioni:[{
 titolo:'Il primo rintocco', obiettivi:'Scoprire la fonte', pgPrevisti:4, livelloPrevisto:2,
 scene:[{titolo:'La piazza',descrizione:'La campana suona.',incontro:{nemici:[]}}]
}] })
test('ChatGPT: sessioni e scene valide accettate',()=>{
 assert.equal(verificaArchivioSessioniChatGPT(valido()),true)
})
test('ChatGPT: non accetta riferimenti a creature non risolti',()=>{
 const d=valido()
 d.sessioni[0].scene[0].incontro.nemici=[{creaturaId:'inventato',quantita:1}]
 assert.throws(()=>verificaArchivioSessioniChatGPT(d),/Formato non valido/)
})
test('ChatGPT: rifiuta input non conforme e valori fuori limite',()=>{
 const modifiche=[
 d=>{d.formato='altro'},d=>{d.versione=2},
 d=>{d.sessioni=[]},d=>{d.sessioni[0].titolo=' '},
 d=>{d.sessioni[0].pgPrevisti=21},d=>{d.sessioni[0].livelloPrevisto=0},
 d=>{d.sessioni[0].scene[0].descrizione=null},
 d=>{d.sessioni[0].scene[0].titolo='x'.repeat(151)},
 d=>{d.sessioni[0].scene[0].note={testo:'non valido'}},
 d=>{d.sessioni[0].scene=[null]},
 d=>{d.sessioni=Array.from({length:31},()=>d.sessioni[0])}
 ]
 for(const modifica of modifiche){
  const d=valido()
  modifica(d)
  assert.throws(()=>verificaArchivioSessioniChatGPT(d),/Formato non valido/)
 }
})
