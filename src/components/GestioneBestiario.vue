
<script setup>
import { computed, ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { creatureBestiario, creatureSRD, erroreBestiario, avvisoMigrazione, nuovaCreatura, nuovoPNG, salvaCreatura, eliminaCreatura, duplicaComeHomebrew } from '../stato/statoBestiario.js'
import { utilizzabile, copiaDati } from '../dati/modelloCreatura.js'
import { statoCatalogoSRD } from '../dati/catalogoSRD.js'
import { creaArchivioCreature, leggiArchivioCreature, importaArchivioCreature, DIMENSIONE_MAX_CREATURE } from '../stato/archivioCreature.js'
import SchedaCreatura from './SchedaCreatura.vue'
import EditorCreatura from './EditorCreatura.vue'
import SceltaCreazioneCreatura from './SceltaCreazioneCreatura.vue'

const ricerca = ref('')
const categoria = ref('tutte')
const tipo = ref('')
const gs = ref('')
const stato = ref('tutte')
const ordine = ref('nome')
const limite = ref(30)

const selezionata = ref(null)
const editor = ref(null)
const conferma = ref(null)
const messaggio = ref('')
const errore = ref('')
const titoloEditor = ref(null)

const nuovaCategoria = ref(null)

async function creazioneManuale() {
  const tipo = nuovaCategoria.value
  nuovaCategoria.value = null
  await apriEditor(tipo === 'png' ? nuovoPNG() : nuovaCreatura())
}

const selettoreImportazione = ref(null)
const anteprimaImportazione = ref(null)
const archivioImportato = ref(null)
const selezioneImportazione = ref([])
const nomeFileImportato = ref('')
const letturaImportazione = ref(false)

let richiestaImportazione = 0

onBeforeUnmount(() => {
  richiestaImportazione++
})

const categorie = [
  { id: 'tutte', nome: 'Tutte' },
  { id: 'srd', nome: 'SRD ufficiale' },
  { id: 'homebrew', nome: 'Homebrew' },
  { id: 'png', nome: 'PNG personalizzati' },
]

const normalizza = s =>
  String(s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('it')

const numerogs = s => {
  const v = String(s || '').split('/').map(Number)
  return v.length === 2
    ? v[0] / v[1]
    : Number(s || Infinity)
}

const base = computed(() =>
  creatureBestiario.value.filter(
    c => categoria.value === 'tutte' || c.categoria === categoria.value
  )
)

const tipi = computed(() =>
  [...new Set(base.value.map(c => c.tipo).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'it'))
)

const gradi = computed(() =>
  [...new Set(base.value.map(c => c.gs).filter(v => v !== '' && v != null))]
    .sort((a, b) => numerogs(a) - numerogs(b))
)

const filtrate = computed(() =>
  base.value
    .filter(c =>
      (!tipo.value || c.tipo === tipo.value) &&
      (!gs.value || String(c.gs) === gs.value) &&
      (
        stato.value === 'tutte' ||
        (
          stato.value === 'pronte'
            ? utilizzabile(c)
            : !utilizzabile(c)
        )
      ) &&
      normalizza([
        c.nome,
        c.nomeOriginale,
        c.tipo,
        ...(c.aliases || []),
        ...(c.riferimentiLegacy?.aliasesApplicativiNonAttestatiNelPDF || []),
      ].join(' ')).includes(normalizza(ricerca.value))
    )
    .sort((a, b) =>
      ordine.value === 'gs'
        ? numerogs(a.gs) - numerogs(b.gs) ||
          a.nome.localeCompare(b.nome, 'it')
        : a.nome.localeCompare(b.nome, 'it')
    )
)

const visibili = computed(() =>
  filtrate.value.slice(0, limite.value)
)

watch(
  [ricerca, categoria, tipo, gs, stato, ordine],
  () => {
    limite.value = 30
  }
)

watch(categoria, () => {
  tipo.value = ''
  gs.value = ''
})

function conta(id) {
  return id === 'tutte'
    ? creatureBestiario.value.length
    : creatureBestiario.value.filter(c => c.categoria === id).length
}

function pulisci() {
  messaggio.value = ''
  errore.value = ''
  conferma.value = null
}

async function apriEditor(c) {
  pulisci()
  editor.value = copiaDati(c)
  await nextTick()
  titoloEditor.value?.scrollIntoView({ block: 'start' })
}

async function salva(c) {
  errore.value = ''

  if (!salvaCreatura(c)) {
    errore.value =
      erroreBestiario.value ||
      'La scheda non può essere salvata.'
    return
  }

  editor.value = null
  messaggio.value = 'Scheda personale salvata.'
}

function duplica(c) {
  pulisci()

  const copia = duplicaComeHomebrew(c.id)

  if (!copia) {
    errore.value =
      erroreBestiario.value ||
      'Duplicazione non riuscita.'
    return
  }

  categoria.value = 'homebrew'
  ricerca.value = ''
  selezionata.value = copia.id

  apriEditor(copia)
}

function elimina(c) {
  pulisci()

  if (!eliminaCreatura(c.id)) {
    errore.value =
      erroreBestiario.value ||
      'Eliminazione non riuscita.'
    return
  }

  messaggio.value =
    'Scheda eliminata. Le copie negli incontri già preparati sono conservate.'
}

function esporta(c) {
  pulisci()

  try {
    const archivio = creaArchivioCreature([c.id])

    const url = URL.createObjectURL(
      new Blob(
        [JSON.stringify(archivio, null, 2)],
        { type: 'application/json' }
      )
    )

    const nome = c.nome
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || 'creatura'

    const link = document.createElement('a')
    link.href = url
    link.download = `DMC_Creatura_${nome}.json`

    document.body.appendChild(link)
    link.click()
    link.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    messaggio.value = `Scheda di ${c.nome} esportata.`
  } catch (e) {
    errore.value =
      e.message || 'Esportazione non riuscita.'
  }
}

function annullaImportazione() {
  richiestaImportazione++
  archivioImportato.value = null
  selezioneImportazione.value = []
  nomeFileImportato.value = ''
  letturaImportazione.value = false

  if (selettoreImportazione.value) {
    selettoreImportazione.value.value = ''
  }
}

async function leggiFileCreature(evento) {
  const file = evento.target.files?.[0]
  if (!file) return

  annullaImportazione()
  pulisci()

  const richiesta = ++richiestaImportazione

  if (!file.size || file.size > DIMENSIONE_MAX_CREATURE) {
    errore.value =
      'Seleziona un file JSON non vuoto e non superiore a 5 MB.'
    return
  }

  letturaImportazione.value = true

  try {
    const testo = await file.text()

    if (richiesta !== richiestaImportazione) return

    const archivio = leggiArchivioCreature(testo)

    archivioImportato.value = archivio
    selezioneImportazione.value =
      archivio.creature.map((_, i) => i)
    nomeFileImportato.value = file.name

    await nextTick()

    if (richiesta !== richiestaImportazione) return

    anteprimaImportazione.value?.focus({
      preventScroll: true,
    })
    anteprimaImportazione.value?.scrollIntoView({
      block: 'start',
    })
  } catch (e) {
    if (richiesta === richiestaImportazione) {
      errore.value =
        e.message || 'Impossibile leggere le schede.'
    }
  } finally {
    if (richiesta === richiestaImportazione) {
      letturaImportazione.value = false

      if (selettoreImportazione.value) {
        selettoreImportazione.value.value = ''
      }
    }
  }
}

function confermaImportazione() {
  errore.value = ''

  try {
    const n = importaArchivioCreature(
      archivioImportato.value,
      selezioneImportazione.value
    )

    annullaImportazione()

    categoria.value = 'tutte'
    ricerca.value = ''
    tipo.value = ''
    gs.value = ''
    stato.value = 'tutte'

    messaggio.value = n === 1
      ? '1 scheda importata come nuova copia personale.'
      : `${n} schede importate come nuove copie personali.`
  } catch (e) {
    errore.value =
      e.message || 'Importazione non riuscita.'
  }
}
</script>

<template>
  <section class="bestiario-dmc">
    <header class="intestazione">
      <div>
        <h2>Bestiario</h2>
        <p>
          {{ creatureSRD.length }} schede SRD ·
          catalogo condiviso tra le campagne
        </p>
      </div>

      <div class="azioni">
        <button class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="selettoreImportazione?.click()"
        >
          Importa creature
        </button>

        <button class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="nuovaCategoria = 'png'"
        >
          + Nuovo PNG
        </button>

        <button
          type="button"
          class="primario dmc-btn"
          @click="nuovaCategoria = 'homebrew'"
        >
          + Nuova creatura
        </button>
      </div>
    </header>

    <SceltaCreazioneCreatura
      v-if="nuovaCategoria"
      :categoria="nuovaCategoria"
      @chiudi="nuovaCategoria = null"
      @manuale="creazioneManuale"
    />

    <input
      ref="selettoreImportazione"
      type="file"
      accept=".json,application/json"
      class="file-importazione"
      aria-label="File di creature DMC"
      @change="leggiFileCreature"
    />

    <p
      v-if="erroreBestiario || errore"
      role="alert"
      class="feedback errore"
    >
      {{ erroreBestiario || errore }}
    </p>

    <p
      v-if="avvisoMigrazione"
      role="status"
      class="feedback"
    >
      {{ avvisoMigrazione }}
    </p>

    <p
      v-if="messaggio"
      role="status"
      class="feedback"
    >
      {{ messaggio }}
    </p>

    <p v-if="letturaImportazione" role="status">
      Lettura delle schede in corso…
    </p>

    <section
      v-if="archivioImportato"
      ref="anteprimaImportazione"
      class="importazione-creature dmc-pannello"
      aria-labelledby="titolo-importazione-creature"
      tabindex="-1"
    >
      <header class="intestazione">
        <div>
          <h3 id="titolo-importazione-creature">
            Importa creature
          </h3>
          <p>
            {{ nomeFileImportato }} ·
            {{ archivioImportato.creature.length }}
            {{
              archivioImportato.creature.length === 1
                ? 'scheda'
                : 'schede'
            }}
          </p>
        </div>

        <button class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="annullaImportazione"
        >
          Annulla importazione
        </button>
      </header>

      <p>
        Le schede selezionate saranno aggiunte come nuove
        copie personali. Le schede esistenti e gli incontri
        preparati rimarranno invariati.
      </p>

      <div class="azioni">
        <button class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="
            selezioneImportazione =
              archivioImportato.creature.map((_, i) => i)
          "
        >
          Seleziona tutte
        </button>

        <button class="dmc-btn dmc-btn--secondary"
          type="button"
          @click="selezioneImportazione = []"
        >
          Deseleziona tutte
        </button>
      </div>

      <div class="lista-importazione">
        <label
          v-for="(c, i) in archivioImportato.creature"
          :key="c.id"
          class="scelta-importazione"
        >
          <input
            v-model="selezioneImportazione"
            type="checkbox"
            :value="i"
            :aria-label="`Importa ${c.nome}`"
          />

          <span>
            <strong>{{ c.nome }}</strong>
            <small>
              {{
                c.categoria === 'png'
                  ? 'PNG personale'
                  : 'Homebrew'
              }}
              ·
              {{
                c.statoScheda === 'pronta'
                  ? 'Pronta'
                  : 'Bozza'
              }}
            </small>
          </span>
        </label>
      </div>

      <button
        type="button"
        class="primario dmc-btn"
        :disabled="!selezioneImportazione.length"
        @click="confermaImportazione"
      >
        Importa {{ selezioneImportazione.length }}
        {{
          selezioneImportazione.length === 1
            ? 'scheda'
            : 'schede'
        }}
      </button>
    </section>

    <div
      v-if="editor"
      ref="titoloEditor"
      class="contenitore-editor"
    >
      <EditorCreatura
        :key="editor.id || editor.categoria"
        :creatura="editor"
        @salva="salva"
        @annulla="editor = null"
      />
    </div>

    <nav
      class="categorie"
      aria-label="Categorie del Bestiario"
    >
      <button class="dmc-btn dmc-btn--secondary"
        v-for="c in categorie"
        :key="c.id"
        type="button"
        :aria-pressed="categoria === c.id"
        @click="categoria = c.id"
      >
        {{ c.nome }}
        <span>{{ conta(c.id) }}</span>
      </button>
    </nav>

    <div class="filtri dmc-pannello">
      <label class="ricerca">
        Cerca una creatura
        <input class="dmc-campo"
          v-model="ricerca"
          type="search"
          placeholder="Nome, alias o tipo…"
        />
      </label>

      <label>
        Tipo
        <select class="dmc-campo" v-model="tipo">
          <option value="">Tutti i tipi</option>
          <option
            v-for="t in tipi"
            :key="t"
          >
            {{ t }}
          </option>
        </select>
      </label>

      <label>
        GS
        <select class="dmc-campo" v-model="gs">
          <option value="">Tutti i GS</option>
          <option
            v-for="g in gradi"
            :key="g"
            :value="String(g)"
          >
            {{ g }}
          </option>
        </select>
      </label>

      <label>
        Stato
        <select class="dmc-campo" v-model="stato">
          <option value="tutte">
            Tutte le schede
          </option>
          <option value="pronte">
            Pronte per gli incontri
          </option>
          <option value="bozze">
            Bozze / incomplete
          </option>
        </select>
      </label>

      <label>
        Ordina
        <select class="dmc-campo" v-model="ordine">
          <option value="nome">Nome</option>
          <option value="gs">Grado di sfida</option>
        </select>
      </label>
    </div>

    <p role="status" class="risultati">
      {{ filtrate.length }} risultati ·
      {{ visibili.length }} visualizzati
    </p>

    <div class="catalogo">
      <article
        v-for="c in visibili"
        :key="c.id"
        class="creatura dmc-pannello"
        :class="{ aperta: selezionata === c.id }"
        :data-creatura="c.id"
      >
        <header>
          <div>
            <span class="categoria">
              {{
                c.categoria === 'srd'
                  ? 'SRD 5.2.1 · sola lettura'
                  : c.categoria === 'png'
                    ? 'PNG personale'
                    : 'Homebrew'
              }}
            </span>

            <h3>{{ c.nome }}</h3>

            <p>
              {{ c.tipo }}
              ·
              {{
                c.taglie?.length
                  ? c.taglie.join(' o ')
                  : c.taglia || 'Taglia non indicata'
              }}
              · GS
              {{
                c.gs === '' || c.gs == null
                  ? '—'
                  : c.gs
              }}
            </p>
          </div>

          <span
            class="stato"
            :class="{ bozza: !utilizzabile(c) }"
          >
            {{
              utilizzabile(c)
                ? 'Pronta'
                : 'Bozza'
            }}
          </span>
        </header>

        <p class="dati-rapidi">
          CA {{ c.ca ?? '—' }}
          · PF {{ c.pfMax ?? '—' }}
          <span v-if="c.noteFonte?.length">
            · Nota sulla fonte
          </span>
        </p>

        <div class="azioni">
          <button class="dmc-btn dmc-btn--secondary"
            type="button"
            :aria-expanded="selezionata === c.id"
            :aria-controls="`dettaglio-${c.id}`"
            @click="
              selezionata =
                selezionata === c.id ? null : c.id
            "
          >
            {{
              selezionata === c.id
                ? 'Chiudi scheda'
                : 'Apri scheda'
            }}
            <span class="sr-only">
              {{ c.nome }}
            </span>
          </button>

          <button class="dmc-btn dmc-btn--secondary"
            type="button"
            @click="duplica(c)"
          >
            {{
              c.categoria === 'srd'
                ? 'Duplica come homebrew'
                : 'Duplica'
            }}
            <span class="sr-only">
              {{ c.nome }}
            </span>
          </button>

          <button class="dmc-btn dmc-btn--secondary"
            v-if="c.categoria !== 'srd'"
            type="button"
            @click="apriEditor(c)"
          >
            Modifica
            <span class="sr-only">
              {{ c.nome }}
            </span>
          </button>

          <button class="dmc-btn dmc-btn--secondary"
            v-if="c.categoria !== 'srd'"
            type="button"
            @click="esporta(c)"
          >
            Esporta
            <span class="sr-only">
              {{ c.nome }}
            </span>
          </button>

          <button
            v-if="c.categoria !== 'srd'"
            type="button"
            class="pericolo dmc-btn dmc-btn--danger"
            @click="conferma = c.id"
          >
            Elimina
            <span class="sr-only">
              {{ c.nome }}
            </span>
          </button>
        </div>

        <div
          v-if="conferma === c.id"
          class="conferma"
          role="group"
          :aria-label="`Eliminazione ${c.nome}`"
        >
          <p>
            Eliminare {{ c.nome }} dal catalogo personale?
            Gli incontri conservano la copia preparata.
          </p>

          <div class="azioni">
            <button
              type="button"
              class="pericolo dmc-btn dmc-btn--danger"
              @click="elimina(c)"
            >
              Conferma eliminazione
            </button>

            <button class="dmc-btn dmc-btn--secondary"
              type="button"
              @click="conferma = null"
            >
              Annulla
            </button>
          </div>
        </div>

        <div
          v-if="selezionata === c.id"
          :id="`dettaglio-${c.id}`"
          class="dettaglio"
        >
          <SchedaCreatura :creatura="c" />
        </div>
      </article>
    </div>

    <p
      v-if="!filtrate.length"
      class="feedback"
    >
      Nessuna creatura corrisponde ai filtri.
    </p>

    <button class="dmc-btn dmc-btn--secondary"
      v-if="filtrate.length > limite"
      type="button"
      @click="limite += 30"
    >
      Mostra altre 30 schede
    </button>

    <details class="licenza">
      <summary>Fonte, verifica e licenza SRD</summary>

      <p>
        330 schede confrontate individualmente con il PDF
        italiano SRD 5.2.1. Le quattro anomalie della
        fonte sono conservate e segnalate nelle schede.
        Versione {{ statoCatalogoSRD.versioneCatalogo }}.
      </p>

      <p>{{ statoCatalogoSRD.attribuzione }}</p>
      <p>{{ statoCatalogoSRD.modificheAlMateriale }}</p>

      <a
        href="https://creativecommons.org/licenses/by/4.0/legalcode"
        target="_blank"
        rel="noreferrer"
      >
        Licenza CC BY 4.0
      </a>
    </details>
  </section>
</template>


<style scoped>
/*
 * DMC — Gestione Bestiario
 * UI.6 — Rifinitura visiva
 *
 * Colori e misure condivisi:
 * design-system.css
 */

.bestiario-dmc {
  display: grid;
  gap: 15px;
  min-width: 0;
  color: var(--dmc-cream);
}

.bestiario-dmc :is(h2, h3, p) {
  margin: 0;
}

.bestiario-dmc :is(h2, h3) {
  font-family: var(--dmc-font-display);
}

.bestiario-dmc h2 {
  color: var(--dmc-amber);
  font-size: 23px;
  line-height: 1.25;
}

.bestiario-dmc h3 {
  color: var(--dmc-cream);
  line-height: 1.3;
}

/* INTESTAZIONI */

.intestazione,
.creatura header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 12px;
}

.intestazione > div:first-child,
.creatura header > div:first-child {
  min-width: 0;
  flex: 1 1 220px;
}

.intestazione p,
.creatura header p,
.risultati {
  margin-top: 5px;
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.5;
}

.risultati {
  margin-top: -2px;
  font-variant-numeric: tabular-nums;
}

/* COMANDI */

.bestiario-dmc input,
.bestiario-dmc select {
  box-sizing: border-box;
  min-height: 36px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: inherit;
  font: inherit;
  font-size: 13px;
}

.bestiario-dmc button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 36px;
  padding: 8px 11px;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.25;
  cursor: pointer;
  transition:
    background-color var(--dmc-transition),
    border-color var(--dmc-transition),
    color var(--dmc-transition);
}

.bestiario-dmc button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.bestiario-dmc button.primario {
  font-weight: 800;
}

.azioni,
.categorie {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.azioni {
  justify-content: flex-start;
}

/* CATEGORIE */

.categorie {
  gap: 7px;
  padding-bottom: 2px;
}

.categorie button {
  min-height: 35px;
  padding: 7px 11px;
}

.categorie button[aria-pressed='true'] {
  font-weight: 800;
}

.categorie span {
  font-size: 11px;
  opacity: 0.8;
  font-variant-numeric: tabular-nums;
}

/* FILTRI */

.filtri {
  display: grid;
  grid-template-columns:
    minmax(170px, 2fr)
    repeat(4, minmax(100px, 1fr));
  align-items: end;
  gap: 11px;
  min-width: 0;
  padding: 13px;
}

.bestiario-dmc label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.3;
}

.bestiario-dmc input,
.bestiario-dmc select {
  width: 100%;
  min-width: 0;
  padding: 8px 9px;
  border-color: var(--dmc-border);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
}

.bestiario-dmc input::placeholder {
  color: var(--dmc-muted);
  opacity: 0.8;
}

/* CATALOGO */

.catalogo {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 13px;
  min-width: 0;
}

/* SCHEDA CREATURA */

.creatura {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 15px;
  overflow-wrap: anywhere;
}

.creatura.aperta {
  grid-column: 1 / -1;
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-raised);
  box-shadow:
    inset 3px 0 0 var(--dmc-amber),
    var(--dmc-shadow-small);
}

.creatura header {
  gap: 10px;
}

.creatura header > div:first-child {
  display: grid;
  align-content: start;
  gap: 5px;
}

.creatura header p {
  margin-top: 0;
  font-size: 12px;
  line-height: 1.5;
}

/* TIPO DI CREATURA */

.categoria {
  display: inline-flex;
  justify-self: start;
  align-items: center;
  width: fit-content;
  max-width: 100%;
  padding: 4px 7px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-amber-light);
  font-size: 10px;
  font-weight: 800;
  line-height: 1.3;
  letter-spacing: 0.45px;
  text-transform: uppercase;
}

.creatura h3 {
  margin: 2px 0 0;
  color: var(--dmc-cream);
  font-size: 18px;
  font-weight: 800;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

/* STATO DELLA SCHEDA */

.stato {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  min-height: 24px;
  padding: 4px 7px;
  border: 1px solid var(--dmc-moss);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-moss-text);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.2;
  white-space: nowrap;
}

.stato.bozza {
  color: var(--dmc-muted-light);
  border-color: var(--dmc-border);
}

/* STATISTICHE RAPIDE */

.dati-rapidi {
  display: block;
  padding: 10px 11px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}

.dati-rapidi span {
  color: var(--dmc-blue);
  font-size: 12px;
  font-weight: 500;
}

/* AZIONI NELLA SCHEDA */

.creatura > .azioni {
  gap: 7px;
}

.creatura > .azioni button {
  min-height: 34px;
  padding: 7px 10px;
  font-size: 12px;
}

/* DETTAGLIO ESPANSO */

.dettaglio {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding-top: 15px;
  border-top: 1px solid var(--dmc-border);
}

/* IMPORTAZIONE */

.file-importazione {
  display: none;
}

.importazione-creature {
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 15px;
  scroll-margin-top: 20px;
}

.importazione-creature .intestazione > div {
  min-width: 0;
  overflow-wrap: anywhere;
}

.lista-importazione {
  display: grid;
  gap: 7px;
  max-height: 320px;
  overflow-y: auto;
  padding-right: 3px;
}

.scelta-importazione {
  display: flex !important;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-soft);
  cursor: pointer;
}

.scelta-importazione:hover {
  border-color: var(--dmc-amber);
}

.bestiario-dmc .scelta-importazione input {
  flex: 0 0 auto;
  width: 18px;
  height: 18px;
  min-height: 18px;
  margin: 0;
  padding: 0;
  accent-color: var(--dmc-amber);
}

.scelta-importazione span {
  display: grid;
  gap: 4px;
  min-width: 0;
  color: var(--dmc-cream);
  overflow-wrap: anywhere;
}

.scelta-importazione small {
  color: var(--dmc-muted-light);
  font-size: 12px;
}

/* FEEDBACK E CONFERME */

.feedback,
.conferma {
  padding: 12px;
  border: 1px solid var(--dmc-blue);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font-size: 13px;
  line-height: 1.5;
}

.feedback.errore,
.conferma {
  border-color: var(--dmc-rust);
}

.conferma {
  display: grid;
  gap: 11px;
}

.conferma p {
  margin-bottom: 0;
}

.contenitore-editor {
  min-width: 0;
  scroll-margin-top: 20px;
}

/* LICENZA */

.licenza {
  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.55;
}

.licenza p {
  margin: 10px 0;
}

.licenza a {
  color: var(--dmc-blue);
}

.licenza summary {
  color: var(--dmc-amber-light);
  font-weight: 700;
  cursor: pointer;
}

/* ACCESSIBILITÀ */

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.bestiario-dmc :is(button, input, select, summary):focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .filtri {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .ricerca {
    grid-column: 1 / -1;
  }
}

@media (max-width: 900px) {
  .catalogo {
    grid-template-columns: 1fr;
  }

  .filtri {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .creatura.aperta {
    grid-column: auto;
  }
}

@media (max-width: 600px) {
  .bestiario-dmc {
    gap: 12px;
  }

  .intestazione {
    gap: 11px;
  }

  .filtri {
    gap: 9px;
    padding: 11px;
  }

  .creatura {
    padding: 12px;
  }

  .creatura h3 {
    font-size: 17px;
  }

  .creatura > .azioni {
    width: 100%;
  }

  .creatura > .azioni button {
    flex: 1 1 auto;
  }
}

@media (max-width: 440px) {
  .filtri {
    grid-template-columns: 1fr;
  }

  .ricerca {
    grid-column: auto;
  }

  .intestazione > .azioni {
    width: 100%;
  }

  .intestazione > .azioni button {
    flex: 1 1 auto;
  }

  .creatura header {
    gap: 8px;
  }

  .stato {
    font-size: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .bestiario-dmc button {
    transition: none;
  }
}
</style>
