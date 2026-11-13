import test from 'node:test'
import assert from 'node:assert/strict'
import { valutaIncontro } from '../src/dati/valutazioneIncontro.js'

const risolviCreatura = (voce) => ({ puntiEsperienza: voce.pe })
function calcola(nemici, extra = {}) {
  return valutaIncontro({ pg: 4, livello: 2, nemici, risolviCreatura, ...extra })
}

test('nessun nemico o dati party incompleti', () => {
  assert.equal(calcola([]), 'Nessun nemico preparato.')
  assert.equal(calcola([{ pe: 50, quantita: 1 }], { pg: 0 }), 'Imposta numero e livello dei PG.')
  assert.equal(
    calcola([{ pe: 50, quantita: 1 }], { livello: 21 }),
    'Imposta numero e livello dei PG.',
  )
})

test('soglie a quattro PG livello 2: bassa, moderata e oltre alta', () => {
  assert.match(calcola([{ pe: 50, quantita: 2 }]), /100 PE · Bassa/)
  assert.match(calcola([{ pe: 150, quantita: 3 }]), /450 PE · Moderata/)
  assert.match(calcola([{ pe: 200, quantita: 5 }]), /1000 PE · Oltre la soglia alta/)
  assert.match(calcola([{ pe: 200, quantita: 5 }]), /soglie: 400 \/ 600 \/ 800 PE/)
})

test('i suggerimenti narrativi non impediscono la valutazione della difficoltà', () => {
  assert.match(
    calcola([{ pe: 50, quantita: 1 }], { collegamentiMancanti: true }),
    /50 PE · Bassa/,
  )
  assert.equal(calcola([{ pe: null, quantita: 2 }]), 'PE non disponibili: valutazione manuale.')
})
