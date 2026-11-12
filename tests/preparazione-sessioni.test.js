import test from 'node:test'
import assert from 'node:assert/strict'
import { preparaScena, preparaSessione, sogliePerPG } from '../src/dati/preparazioneSessioni.js'

function generatore() {
  let numero = 0
  return () => 'nuovo-' + ++numero
}

test('normalizzazione sessione: converte dati legacy senza eliminare gli originali', () => {
  const scena = {
    id: 'scena-1',
    eventi: [{ testo: 'Il ponte crolla', completato: true }],
    indizi: ['Una lettera'],
    incontro: { nemici: [] },
    titolo: 'Ponte',
  }
  const sessione = {
    id: 'sessione-1',
    scenaAttivaId: 'scena-inesistente',
    sceneVisitateIds: ['scena-1','scena-inesistente'],
    scena: 'campo legacy',
    scene: [scena],
    risorseNarrative: [{ nome: 'Leva', stato: 'non valido', sceneIds: ['scena-1','scena-inesistente'] }],
    rituale: { partecipanti: [{ nome: 'PG' }] },
  }
  preparaSessione(sessione, generatore(), 3)
  assert.equal(sessione.pgPrevisti, 3)
  assert.equal(sessione.livelloPrevisto, 2)
  assert.equal(sessione.scene[0].guida[0].testo, 'Il ponte crolla')
  assert.equal(sessione.scene[0].guida[0].completato, true)
  assert.equal(sessione.scene[0].eventi[0].testo, 'Il ponte crolla')
  assert.equal(sessione.scene[0].indizi[0].testo, 'Una lettera')
  assert.equal(sessione.scenaAttivaId, null)
  assert.deepEqual(sessione.sceneVisitateIds, ['scena-1'])
  assert.deepEqual(sessione.risorseNarrative[0].sceneIds, ['scena-1'])
  assert.equal(sessione.risorseNarrative[0].stato, 'inattivo')
  assert.equal(sessione.rituale.partecipanti[0].attivo, true)
  assert.deepEqual(sessione.scene[0].pngIds, [])
})

test('normalizzazione scena: non modifica i campi validi o i riferimenti ai nemici', () => {
  const scena = {
    id: 'scena-2', titolo: 'Portale', descrizione: 'Si apre',
    guida: [{ id:'passo-1', testo:'Attiva il portale', condizione:'', narrazione:'', completato:false }],
    indizi: [{ id:'indizio-1', testo:'Sigillo', rivelato:true }],
    pngIds: ['png-1'],
    incontro: { nemici: [{creaturaId:'mostro-1',quantita:2}], opzionale:true, richiedeCreature:[], suggerimentiPF:[], noteBilanciamento:'Nota' }
  }
  const prima = JSON.parse(JSON.stringify(scena.incontro.nemici))
  preparaScena(scena, generatore())
  assert.deepEqual(scena.incontro.nemici, prima)
  assert.deepEqual(scena.pngIds, ['png-1'])
  assert.equal(scena.indizi[0].rivelato, true)
  assert.equal(scena.guida[0].id,'passo-1')
  assert.equal(scena.incontro.opzionale,true)
})

test('soglie: coprono tutti i livelli previsti per la valutazione degli incontri', () => {
  assert.equal(Object.keys(sogliePerPG).length,20)
  assert.deepEqual(sogliePerPG[1],[50,75,100])
  assert.deepEqual(sogliePerPG[20],[6400,13200,22000])
})
