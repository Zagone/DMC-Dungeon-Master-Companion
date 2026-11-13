import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pagina = readFileSync(
  new URL('../src/views/CampagnaView.vue', import.meta.url),
  'utf8',
)
const css = readFileSync(
  new URL('../src/stili/navigazione-campagna.css', import.meta.url),
  'utf8',
)

test('La pillola mobile è visibile esclusivamente durante la Conduzione', () => {
  assert.match(
    pagina,
    /intestazioneInConduzione = computed\([\s\S]*?sezione\.value === 'sessioni' && Boolean\(conduzioneAttiva\.value\)/,
  )
  assert.match(
    pagina,
    /navigazioneConduzioneMini = computed\([\s\S]*?intestazioneInConduzione\.value && navigazioneCompatta\.value/,
  )
  assert.match(
    pagina,
    /:class="\{ 'campagna-in-conduzione': navigazioneConduzioneMini \}"/,
  )
  assert.match(pagina, /v-if="navigazioneConduzioneMini"/)
  assert.match(css, /@media \(max-width: 1024px\), \(max-width: 1440px\) and \(any-pointer: coarse\)/)
  assert.match(css, /\.campagna-view\.campagna-in-conduzione \.navigazione-persistente/)
  assert.match(css, /\.campagna-view \.navigazione-conduzione-mobile \{\s*display: none;/)
  assert.doesNotMatch(css.split('@media (max-width: 1024px),')[0], /\.tabs \{\s*display: none;/)
})

test('La versione completa resta visibile in alto e la mini compare dopo lo scroll', () => {
  assert.match(pagina, /window\.addEventListener\('scroll', aggiornaNavigazione/)
  assert.match(pagina, /elemento\.getBoundingClientRect\(\)\.bottom <= altezzaBarra/)
  assert.match(pagina, /navigazioneCompatta\.value/)
  assert.match(pagina, /class="navigazione-persistente"/)
  assert.match(pagina, /<nav class="tabs" aria-label="Sezioni della campagna">/)
  assert.match(pagina, /v-if="navigazioneConduzioneMini"/)
  // Il cambio dimensione è vincolato alla classe attivata dal computed.
  assert.doesNotMatch(
    css.slice(0, css.indexOf('@media (max-width: 1024px),')),
    /\.campagna-view\.campagna-in-conduzione \.navigazione-persistente \{/,
  )
})

test('La pillola è centrata, compatta e conserva la posizione sticky sotto la topbar', () => {
  assert.match(css, /width: max-content;/)
  assert.match(css, /max-width: calc\(100% - 16px\)/)
  assert.match(css, /margin: 8px auto 12px;/)
  assert.match(css, /min-height: 46px;/)
  assert.match(css, /top: calc\(var\(--dmc-topbar-height\) \+ 6px\);/)
  assert.match(css, /\.campagna-view\.campagna-in-conduzione \.navigazione-persistente[\s\S]*?:is\(\.navigazione-contesto, \.tabs\) \{\s*display: none;/)
})

test('La pillola mantiene le placche materiche coerenti con la navigazione originale', () => {
  assert.match(css, /\.campagna-view \.mini-uscita-campagna \{[\s\S]*?border-image: var\(--dmc-art-ardesia\)/)
  assert.match(css, /\.campagna-view \.mini-sezione-conduzione \{[\s\S]*?border-image: var\(--dmc-art-ambra\)/)
  assert.match(css, /\.campagna-view \.mini-selettore-campagna \{[\s\S]*?color: var\(--dmc-ink\)/)
  assert.match(css, /border-radius: 8px 12px 7px 10px;/)
  assert.match(css, /box-shadow: 0 3px 0 var\(--dmc-outline\);/)
})

test('Il menu compatto mantiene tutte le sezioni e una uscita accessibile', () => {
  assert.match(pagina, /aria-label="Navigazione compatta della campagna"/)
  assert.match(pagina, /aria-label="Home: torna alla dashboard"/)
  assert.match(pagina, />\s*Home\s*<\/button>/)
  assert.match(pagina, /aria-label="Vai alla sezione"/)
  assert.doesNotMatch(pagina, />Sezione della campagna<\/span>/)
  assert.match(pagina, /v-for="s in sezioni"/)
  assert.match(pagina, /s\.id === 'sessioni' \? 'Conduzione' : s\.nome/)
  assert.match(pagina, /@change="selezionaSezioneMobile"/)
  assert.match(pagina, /evento\.target\.value = sezione\.value/)
  assert.match(css, /\.mini-selettore-campagna:focus-visible/)
  assert.match(css, /\.mini-uscita-campagna:focus-visible/)
  assert.match(pagina, /@click="tornaDashboard"/)
})
