import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { estraiDettagliClassiSRD, TRATTI_CLASSI_SRD } from '../src/dati/dettagliClassiSRD.js'
import { CLASSI_SRD_PAGINE, estraiClassiSRD } from '../src/dati/estrazioneClassiSRD.js'

const archivio = JSON.parse(
  readFileSync(new URL('../public/compendio/classi.json', import.meta.url), 'utf8'),
)
const dati = estraiDettagliClassiSRD(archivio)
const sottoclassi = {
  Barbaro: 'Cammino del berserker',
  Bardo: 'Collegio della Sapienza',
  Chierico: 'Dominio della Vita',
  Druido: 'Circolo della Terra',
  Guerriero: 'Campione',
  Ladro: 'Furfante',
  Mago: 'Invocatore',
  Monaco: 'Guerriero della Mano Aperta',
  Paladino: 'Giuramento di devozione',
  Ranger: 'Cacciatore',
  Stregone: 'Stregoneria draconica',
  Warlock: 'Patrono immondo',
}

test('Tutte le 12 classi espongono tratti, capacità dettagliate e sottoclasse SRD', () => {
  assert.equal(dati.size, 12)
  assert.deepEqual([...dati.keys()], CLASSI_SRD_PAGINE.map(([nome]) => nome))
  for (const [nome, pagina] of CLASSI_SRD_PAGINE) {
    const classe = dati.get(nome)
    assert.equal(classe.nome, nome)
    assert.equal(classe.tratti, TRATTI_CLASSI_SRD[nome])
    for (const campo of [
      'caratteristiche', 'dadoVita', 'tiriSalvezza', 'abilita', 'armi',
      'armature', 'strumenti', 'equipaggiamento',
    ]) assert.ok(classe.tratti[campo]?.length, nome + ' senza ' + campo)
    assert.ok(classe.privilegi.length > 0, nome + ': nessun privilegio')
    assert.equal(classe.sottoclasse.nome, sottoclassi[nome])
    assert.ok(classe.sottoclasse.introduzione.length > 60)
    assert.ok(classe.sottoclasse.privilegi.length >= 2)
    assert.ok(classe.testoOriginale.length > 500)
    assert.ok(classe.pagine.includes(pagina))
    assert.equal(classe.estrazioneAutomatica, true)
  }
})

test('Le capacità conservano descrizione, livello e riferimento SRD', () => {
  for (const classe of dati.values()) {
    for (const gruppi of [classe.privilegi, classe.sottoclasse.privilegi]) {
      const livelli = gruppi.map((gruppo) => gruppo.livello)
      assert.deepEqual(livelli, [...livelli].sort((a, b) => a - b))
      for (const gruppo of gruppi) {
        assert.ok(gruppo.livello >= 1 && gruppo.livello <= 20)
        for (const privilegio of gruppo.privilegi) {
          assert.equal(privilegio.livello, gruppo.livello)
          assert.ok(privilegio.nome.length >= 3)
          assert.ok(privilegio.testo.length >= 12,
            classe.nome + ': capacità senza descrizione ' + privilegio.nome)
          assert.ok(privilegio.pagina >= 32 && privilegio.pagina <= 92)
        }
      }
    }
  }
  const barbaro = dati.get('Barbaro')
  assert.match(barbaro.privilegi.flatMap((g) => g.privilegi)
    .find((v) => v.nome === 'Ira').testo, /Resistenza ai danni/i)
  assert.ok(barbaro.sottoclasse.privilegi.some((g) =>
    g.privilegi.some((v) => v.nome === 'Frenesia')))
  assert.equal(dati.get('Mago').tratti.dadoVita, 'd6')
})

test('Metamagia e Suppliche occulte rimangono separate dal livello 20', () => {
  const stregone = dati.get('Stregone')
  const warlock = dati.get('Warlock')
  assert.equal(stregone.opzioni.titolo, 'Opzioni di metamagia')
  assert.equal(stregone.opzioni.voci.length, 10)
  assert.ok(stregone.opzioni.voci.some((voce) => voce.nome === 'Incantesimo rapido'))
  assert.equal(warlock.opzioni.titolo, 'Opzioni di suppliche occulte')
  assert.equal(warlock.opzioni.voci.length, 28)
  assert.ok(warlock.opzioni.voci.some((voce) => voce.nome === 'Patto della lama'))
  assert.ok(warlock.opzioni.voci.every((voce) => voce.testo.length >= 12))
  assert.ok(stregone.privilegi.flatMap((g) => g.privilegi)
    .find((p) => p.nome === 'Apoteosi arcana').testo.length < 600)
  assert.ok(warlock.privilegi.flatMap((g) => g.privilegi)
    .find((p) => p.nome === "Maestro dell'occulto").testo.length < 600)
})

test('I tratti consultabili non richiedono la descrizione grezza del PDF', () => {
  const scheda = readFileSync(new URL(
    '../src/components/SchedaDettagliClasseSRD.vue', import.meta.url), 'utf8')
  const vista = readFileSync(new URL('../src/views/CompendioView.vue', import.meta.url), 'utf8')
  assert.match(scheda, /Tratti iniziali/)
  assert.match(scheda, /Privilegi di classe/)
  assert.match(scheda, /Sottoclasse SRD/)
  assert.match(scheda, /Opzioni/)
  assert.match(scheda, /gruppo\.privilegi/)
  assert.match(scheda, /TestoCompendioSRD/)
  assert.match(vista, /estraiDettagliClassiSRD/)
  assert.match(vista, /SchedaDettagliClasseSRD/)
  assert.doesNotMatch(scheda, /<details\s+open\b/)
})

test('La progressione è chiusa per impostazione predefinita e filtrabile per livello', () => {
  const componente = readFileSync(new URL(
    '../src/components/TabellaProgressioneClasse.vue', import.meta.url), 'utf8')
  assert.match(componente, /<details>/)
  assert.doesNotMatch(componente, /<details\s+open\b/)
  assert.match(componente, /v-model="livelloSelezionato"/)
  assert.match(componente, /<option value="tutti">/)
  assert.match(componente, /righeVisibili/)
  assert.match(componente, /overflow-x: auto/)
})

test('L’estrattore riutilizza le sezioni senza modificare il risultato', () => {
  const preestratti = estraiClassiSRD(archivio)
  const riutilizzati = estraiDettagliClassiSRD(archivio, preestratti)
  assert.deepEqual(riutilizzati, dati)
  assert.throws(() => estraiDettagliClassiSRD(null), TypeError)
})
