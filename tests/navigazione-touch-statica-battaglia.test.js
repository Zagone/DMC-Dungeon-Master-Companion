import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const pagina = readFileSync(new URL('../src/views/CampagnaView.vue', import.meta.url), 'utf8')
const nav = readFileSync(new URL('../src/stili/navigazione-campagna.css', import.meta.url), 'utf8')
const battaglia = readFileSync(new URL('../src/stili/sticky-battaglia.css', import.meta.url), 'utf8')
const controllo = readFileSync(new URL('../src/stato/stickyBattaglia.js', import.meta.url), 'utf8')
const componente = readFileSync(new URL('../src/components/GestioneBattaglia.vue', import.meta.url), 'utf8')

const queryTouch = '(max-width: 1024px), (max-width: 1440px) and (any-pointer: coarse)'

test('Su tablet e smartphone la navigazione della campagna è statica in tutte le sezioni', () => {
  assert.ok(nav.includes('@media ' + queryTouch + ' {'))
  const regoleTouch = nav.slice(nav.indexOf('/* Nei dispositivi piccoli o touch'))
  assert.match(regoleTouch, /\.campagna-view \.navigazione-persistente,\s*\.campagna-view \.navigazione-persistente\.compatta\s*\{\s*position: static;/)
  assert.match(regoleTouch, /top: auto;/)
  assert.match(regoleTouch, /\.campagna-view \.navigazione-persistente \.tabs\s*\{\s*display: flex;/)
  assert.match(pagina, /window\.matchMedia\([\s\S]*?'\(max-width: 1024px\), \(max-width: 1440px\) and \(any-pointer: coarse\)'/)
  assert.match(pagina, /if \(!elemento \|\| navigazioneTouch\) \{\s*navigazioneCompatta\.value = false/)
  assert.match(pagina, /<nav class="tabs" aria-label="Sezioni della campagna">/)
  assert.doesNotMatch(pagina, /navigazioneConduzioneMini|navigazione-conduzione-mobile|selezionaSezioneMobile/)
})

test('Desktop mantiene la navigazione sticky e la gestione compatta precedente', () => {
  assert.match(nav, /\.campagna-view \.navigazione-persistente \{\s*position: sticky;/)
  assert.match(nav, /top: var\(--dmc-topbar-height\)/)
  assert.match(pagina, /elemento\.getBoundingClientRect\(\)\.bottom <= altezzaBarra/)
  assert.match(controllo, /const soglia = giaCompatta \? fondoNavigazione \+ SOGLIA_ESPANSIONE : fondoNavigazione \+ MARGINE/)
})

test('Su touch la barra Battaglia resta una sola riga compatta sotto la topbar', () => {
  assert.ok(battaglia.includes('@media ' + queryTouch + ' {'))
  assert.match(battaglia, /--dmc-margine-sticky-battaglia-touch: 16px;/)
  assert.match(battaglia, /top: calc\\(var\\(--dmc-topbar-height\\) \\+ var\\(--dmc-margine-sticky-battaglia-touch\\)\\)/)
  assert.match(battaglia, /scroll-margin-top: calc\\(var\\(--dmc-topbar-height\\) \\+ var\\(--dmc-margine-sticky-battaglia-touch\\)\\)/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.barra-navigazione \{\s*display: flex;\s*flex-wrap: nowrap;/)
  assert.match(battaglia, /min-height: 42px;/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.controlli-turno \{\s*display: flex;\s*flex: 0 0 auto;\s*flex-wrap: nowrap;/)
  assert.match(battaglia, /width: 42px;\s*min-height: 42px;\s*height: 42px;/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.testo-turno-esteso\s*\{\s*display: none;/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.icona-turno-breve\s*\{\s*display: inline;/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.gruppo-attivo strong[\s\S]*?text-overflow: ellipsis;/)
})

test('La soglia di riduzione della Battaglia su touch non usa la barra campagna statica', () => {
  assert.match(controllo, /const modalitaTouch = window\.matchMedia\(/)
  assert.match(controllo, /if \(modalitaTouch\.matches\) \{/)
  assert.match(controllo, /getComputedStyle\\(barra\\)\\.getPropertyValue\\('--dmc-margine-sticky-battaglia-touch'\\)/)
  assert.match(controllo, /const compatta = posizioneBattaglia <= altezzaTopbar \\+ distanzaSticky \\+ MARGINE/)
  assert.match(controllo, /pagina\.classList\.toggle\('dmc-battaglia-compatta', compatta\)/)
})

test('Controlli turno e iniziativa rimangono accessibili quando i testi sono nascosti', () => {
  assert.match(componente, /aria-label="Turno precedente"/)
  assert.match(componente, /aria-label="Turno successivo"/)
  assert.match(componente, /:aria-label="iniziativaAperta \? 'Chiudi gestione iniziative' : 'Apri gestione iniziative'"/)
  assert.match(componente, /class="round-mini"/)
  assert.match(componente, /class="testo-turno-esteso"/)
  assert.match(componente, /class="icona-turno-breve" aria-hidden="true"/)
  assert.match(componente, /aria-controls="dmc-elenco-iniziativa"/)
  assert.match(battaglia, /\.campagna-view\.dmc-battaglia-compatta \.battaglia-dmc \.menu-aperto\s*\{\s*position: absolute;/)
  assert.match(battaglia, /max-height: min\(58dvh, 460px\)/)
})
