import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const vista = readFileSync(
  new URL('../src/views/CampagnaView.vue', import.meta.url), 'utf8',
)
const conduzione = readFileSync(
  new URL('../src/components/ConduzioneSessione.vue', import.meta.url), 'utf8',
)
const gestione = readFileSync(
  new URL('../src/components/GestioneSessioni.vue', import.meta.url), 'utf8',
)
const navigazione = readFileSync(
  new URL('../src/stili/navigazione-campagna.css', import.meta.url), 'utf8',
)

test('Titolo campagna — sessione solo durante la conduzione attiva', () => {
  assert.match(vista, /intestazioneInConduzione = computed\(/)
  assert.match(
    vista,
    /sezione\.value === 'sessioni' && Boolean\(conduzioneAttiva\.value\)/,
  )
  assert.match(vista, /'testata-campagna--conduzione': intestazioneInConduzione/)
  assert.match(vista, /<span class="titolo-campagna-conduzione">\{\{ campagna\.nome \}\}<\/span>/)
  assert.match(vista, /<span class="separatore-titoli-conduzione">—<\/span>/)
  assert.match(vista, /conduzioneAttiva\.sessione\.titolo\?\.trim\(\)/)
  assert.match(vista, /<template v-else>\{\{ campagna\.nome \}\}<\/template>/)
  assert.match(vista, /<p v-if="!intestazioneInConduzione">\{\{ statoTesto\(campagna\.stato\) \}\}<\/p>/)
  assert.match(vista, /v-if="!intestazioneInConduzione"[\s\S]*?@click="apriImpostazioni"/)
})

test('Nessun secondo titolo: il ritorno alla preparazione resta disponibile', () => {
  assert.doesNotMatch(conduzione, /<header class="testata-conduzione/)
  assert.doesNotMatch(conduzione, /<h2 data-conduzione-titolo/)
  assert.match(conduzione, /class="stato-sessione" aria-label="Stato della conduzione"/)
  assert.match(conduzione, /Scena corrente:/)
  assert.match(conduzione, /Torna alla preparazione/)
  assert.match(conduzione, /@click="esciDaConduzione"/)
  assert.match(conduzione, /numeroSceneVisitate\(sessioneInConduzione\)/)
})

test('Il focus all’ingresso nella conduzione raggiunge il titolo principale', () => {
  assert.match(vista, /:data-conduzione-titolo="intestazioneInConduzione \? '' : undefined"/)
  assert.match(vista, /:tabindex="intestazioneInConduzione \? -1 : undefined"/)
  assert.match(gestione, /document\.querySelector\('\[data-conduzione-titolo\]'\)\?\.focus/)
  assert.match(vista, /watch\(intestazioneInConduzione, async \(\) => \{/)
  assert.match(vista, /await nextTick\(\)\s+aggiornaMisure\(\)/)
})

test('La gerarchia visiva conserva identità e leggibilità sui diversi dispositivi', () => {
  assert.match(navigazione, /\.campagna-view \.testata-campagna--conduzione h1 \{/)
  assert.match(navigazione, /flex-wrap: wrap;/)
  assert.match(navigazione, /\.campagna-view \.titolo-campagna-conduzione \{/)
  assert.match(navigazione, /\.campagna-view \.titolo-sessione-conduzione \{/)
  assert.match(navigazione, /color: var\(--dmc-amber-light\);/)
  assert.match(navigazione, /\.campagna-view \.testata-campagna--conduzione h1:focus-visible \{/)
})
