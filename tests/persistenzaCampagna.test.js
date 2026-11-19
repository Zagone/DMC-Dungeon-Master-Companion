import test from 'node:test'
import assert from 'node:assert/strict'
import { nextTick } from 'vue'

const chiave = (id) => 'dmc_dati_campagna_v1_' + id
const valori = new Map()
let fallimento = false
let scritture = 0
const eventi = new Map()

globalThis.window = {
  addEventListener(nome, gestore) {
    eventi.set(nome, gestore)
  },
}
globalThis.localStorage = {
  getItem(k) {
    return valori.get(k) ?? null
  },
  setItem(k, v) {
    if (fallimento && k === chiave('prima')) throw new Error('Quota simulata')
    scritture++
    valori.set(k, String(v))
  },
  removeItem(k) {
    valori.delete(k)
  },
}

const { apriDatiCampagna, chiudiDatiCampagna, datiCampagna, campagnaDatiId, erroreDatiCampagna } =
  await import('../src/stato/statoDatiCampagna.js')

test('apertura, modifiche raggruppate e salvataggio su chiusura', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  await nextTick()
  const scritturePrimaDelleModifiche = scritture
  datiCampagna.value.note = 'Prima nota'
  datiCampagna.value.sessioni.push({ id: 's1', nome: 'Sessione 1', scene: [] })
  await nextTick()
  assert.equal(scritture - scritturePrimaDelleModifiche, 1)
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Prima nota')
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(campagnaDatiId.value, null)
})

test('riapertura ripristina note e sessioni salvate', () => {
  assert.equal(apriDatiCampagna('prima'), true)
  assert.equal(datiCampagna.value.note, 'Prima nota')
  assert.equal(datiCampagna.value.sessioni[0].nome, 'Sessione 1')
  assert.equal(chiudiDatiCampagna(), true)
})

test('pagehide salva le modifiche non ancora elaborate dal watcher', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  datiCampagna.value.note = 'Ultima nota'
  eventi.get('pagehide')()
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Ultima nota')
  await nextTick()
  assert.equal(chiudiDatiCampagna(), true)
})

test('errore di scrittura impedisce la chiusura e conserva le modifiche in memoria', async () => {
  assert.equal(apriDatiCampagna('prima'), true)
  fallimento = true
  datiCampagna.value.note = 'Non ancora salvata'
  await nextTick()
  assert.match(erroreDatiCampagna.value, /non è stata salvata/)
  assert.equal(chiudiDatiCampagna(), false)
  assert.equal(campagnaDatiId.value, 'prima')
  assert.equal(datiCampagna.value.note, 'Non ancora salvata')
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Ultima nota')
  fallimento = false
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(JSON.parse(valori.get(chiave('prima'))).note, 'Non ancora salvata')
})

test('dati corrotti: apertura rifiutata senza sovrascrivere il contenuto originale', async () => {
  const originale = '{"sessioni": "formato-non-valido"}'
  valori.set(chiave('corrotta'), originale)
  assert.equal(apriDatiCampagna('corrotta'), false)
  await nextTick()
  assert.equal(valori.get(chiave('corrotta')), originale)
  assert.equal(chiudiDatiCampagna(), true)
  assert.equal(valori.get(chiave('corrotta')), originale)
})

test('incontro con istantanea: apertura e salvataggio conservano la versione della creatura', () => {
  const istantanea = {
    id: 'homebrew-versione-originale',
    nome: 'Custode della campagna',
    ca: 16,
    pfMax: 55,
    azioni: [{ nome: 'Rintocco', descrizione: 'Azione personalizzata della sessione.' }],
  }
  const originale = {
    versione: 1,
    sessioni: [{
      id: 's-istantanea',
      scene: [{
        id: 'scena-istantanea',
        incontro: {
          nemici: [{ creaturaId: 'creatura-non-piu-presente', quantita: 1, istantanea }],
        },
      }],
    }],
  }
  valori.set(chiave('regressione-istantanea'), JSON.stringify(originale))
  assert.equal(apriDatiCampagna('regressione-istantanea'), true)
  const voce = datiCampagna.value.sessioni[0].scene[0].incontro.nemici[0]
  assert.deepEqual(voce.istantanea, istantanea)
  assert.equal(chiudiDatiCampagna(), true)
  const riletta = JSON.parse(valori.get(chiave('regressione-istantanea')))
  assert.deepEqual(riletta.sessioni[0].scene[0].incontro.nemici[0].istantanea, istantanea)
})

test('riferimento storico senza istantanea: il catalogo SRD viene risolto senza perdere il vecchio ID', async () => {
  const { trovaCreatura } = await import('../src/stato/statoBestiario.js')
  const attesa = trovaCreatura('dnd-goblin-warrior')
  assert.ok(attesa, 'Alias SRD storico presente nel catalogo')
  const originale = {
    versione: 1,
    sessioni: [{
      id: 's-legacy',
      scene: [{
        id: 'scena-legacy',
        incontro: {
          nemici: [{ creaturaId: 'dnd-goblin-warrior', quantita: 2 }],
        },
      }],
    }],
  }
  valori.set(chiave('regressione-legacy'), JSON.stringify(originale))
  assert.equal(apriDatiCampagna('regressione-legacy'), true)
  const voce = datiCampagna.value.sessioni[0].scene[0].incontro.nemici[0]
  assert.equal(voce.creaturaId, 'dnd-goblin-warrior')
  assert.equal(voce.istantanea.id, attesa.id)
  assert.equal(voce.istantanea.nome, attesa.nome)
  assert.notStrictEqual(voce.istantanea, attesa)
  assert.equal(chiudiDatiCampagna(), true)
  const riletta = JSON.parse(valori.get(chiave('regressione-legacy')))
  assert.equal(riletta.sessioni[0].scene[0].incontro.nemici[0].istantanea.id, attesa.id)
})

test('riferimento assente senza istantanea: l’apertura non elimina i dati narrativi della scena', () => {
  const voceOriginale = { creaturaId: 'creatura-non-trovata', nome: 'Mostro del copione', quantita: 3 }
  const originale = {
    versione: 1,
    sessioni: [{
      id: 's-non-trovata',
      scene: [{
        id: 'scena-non-trovata',
        titolo: 'La soglia',
        incontro: { nemici: [voceOriginale], richiedeCreature: ['Mostro del copione'] },
      }],
    }],
  }
  valori.set(chiave('regressione-non-trovata'), JSON.stringify(originale))
  assert.equal(apriDatiCampagna('regressione-non-trovata'), true)
  const scena = datiCampagna.value.sessioni[0].scene[0]
  assert.equal(scena.titolo, 'La soglia')
  assert.deepEqual(scena.incontro.nemici[0], voceOriginale)
  assert.deepEqual(scena.incontro.richiedeCreature, ['Mostro del copione'])
  assert.equal(chiudiDatiCampagna(), true)
})

test('creatura homebrew: una scena senza istantanea conserva il collegamento alla scheda personale', async () => {
  const { salvaCreatura, eliminaCreatura } = await import('../src/stato/statoBestiario.js')
  const id = 'regressione-homebrew-istantanee'
  assert.equal(salvaCreatura({
    id,
    nome: 'Guardiano homebrew',
    categoria: 'homebrew',
    origine: 'custom',
    ca: 14,
    pfMax: 25,
  }), true)
  try {
    const originale = {
      versione: 1,
      sessioni: [{
        id: 's-homebrew',
        scene: [{
          id: 'scena-homebrew',
          incontro: { nemici: [{ creaturaId: id, quantita: 1 }] },
        }],
      }],
    }
    valori.set(chiave('regressione-homebrew'), JSON.stringify(originale))
    assert.equal(apriDatiCampagna('regressione-homebrew'), true)
    const voce = datiCampagna.value.sessioni[0].scene[0].incontro.nemici[0]
    assert.equal(voce.creaturaId, id)
    assert.equal(voce.istantanea.nome, 'Guardiano homebrew')
    assert.equal(voce.istantanea.pfMax, 25)
    assert.equal(chiudiDatiCampagna(), true)
  } finally {
    assert.equal(eliminaCreatura(id), true)
  }
})
