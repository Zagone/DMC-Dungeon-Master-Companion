import test from 'node:test'
import assert from 'node:assert/strict'
import { INCANTESIMI_SRD } from '../src/dati/incantesimiSRD.js'
import { validaArchivioIncantesimi, salvaArchivioIncantesimi, leggiArchivioIncantesimi, eliminaArchivioIncantesimi } from '../src/dati/archivioIncantesimiCompleti.js'

function archivio() {
  return {
    formato:'dmc-compendio-incantesimi',
    versione:1,
    incantesimi:INCANTESIMI_SRD.map(v=>({
      nome:v.nome,livello:v.livello,scuola:v.scuola,pagina:v.pagina,
      tempoLancio:'azione',gittata:'9 metri',componenti:'V, S',
      durata:'istantanea',descrizione:'Descrizione di prova.'
    }))
  }
}
test('archivio: accetta 339 schede complete',()=>{
  const dati=validaArchivioIncantesimi(archivio())
  assert.equal(dati.length,339)
  assert.ok(dati.every(v=>v.dettagliCompleti && v.estrattoPDF && !v.verificato))
})
test('archivio: rifiuta file parziali e nomi duplicati',()=>{
  const dati=archivio()
  dati.incantesimi.pop()
  assert.throws(()=>validaArchivioIncantesimi(dati))
  dati.incantesimi.push({...dati.incantesimi[0]})
  assert.throws(()=>validaArchivioIncantesimi(dati))
})
test('archivio: rifiuta metadati discordanti e descrizioni vuote',()=>{
  const dati=archivio()
  dati.incantesimi[0].pagina=999
  assert.throws(()=>validaArchivioIncantesimi(dati))
  dati.incantesimi[0].pagina=INCANTESIMI_SRD[0].pagina
  dati.incantesimi[0].descrizione=''
  assert.throws(()=>validaArchivioIncantesimi(dati))
})
test('archivio: salvataggio, lettura e rimozione',()=>{
  const vecchio=globalThis.localStorage
  const mappa=new Map()
  globalThis.localStorage={
    getItem:k=>mappa.get(k)??null,
    setItem:(k,v)=>mappa.set(k,v),
    removeItem:k=>mappa.delete(k)
  }
  try {
    assert.equal(salvaArchivioIncantesimi(archivio()).length,339)
    assert.equal(leggiArchivioIncantesimi().length,339)
    eliminaArchivioIncantesimi()
    assert.equal(leggiArchivioIncantesimi(),null)
  } finally {globalThis.localStorage=vecchio}
})
