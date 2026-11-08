
<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import { campagne } from '../stato/statoCampagne.js'

// Il modulo backup dipende dal catalogo SRD. Manteniamo il pannello
// disponibile nella Dashboard senza caricare quei dati al suo montaggio.
async function caricaArchivio() {
  try {
    return await import('../stato/archivioDMC.js')
  } catch {
    throw new Error('Impossibile caricare gli strumenti di backup. Ricarica la pagina e riprova.')
  }
}

let componenteAttivo = true
onBeforeUnmount(() => { componenteAttivo = false })

const DIMENSIONE_MAX = 50 * 1024 * 1024

const selettoreFile = ref(null)
const nomeFile = ref('')
const esportazioneAperta = ref(false)
const selezioneExport = ref([])
const archivioImportato = ref(null)
const selezioneImport = ref([])
const confermaImport = ref(false)

const occupato = ref(false)
const messaggio = ref('')
const errore = ref('')

const numeroCampagne = computed(() => campagne.value.length)

const anteprima = computed(
  () => archivioImportato.value?.campagne ?? []
)

const tuttoExport = computed(() =>
  numeroCampagne.value > 0 &&
  selezioneExport.value.length === numeroCampagne.value
)

const tuttoImport = computed(() =>
  anteprima.value.length > 0 &&
  selezioneImport.value.length === anteprima.value.length
)

function pulisciFeedback() {
  messaggio.value = ''
  errore.value = ''
}

function cambiaEsportazione() {
  pulisciFeedback()
  esportazioneAperta.value = !esportazioneAperta.value

  if (esportazioneAperta.value) {
    selezioneExport.value = campagne.value.map(c => c.id)
  }
}

function selezionaExport(tutte) {
  selezioneExport.value = tutte
    ? campagne.value.map(c => c.id)
    : []
}

function selezionaImport(tutte) {
  selezioneImport.value = tutte
    ? anteprima.value.map((_, indice) => indice)
    : []
}

function apriFile() {
  if (!occupato.value) {
    pulisciFeedback()
    selettoreFile.value?.click()
  }
}

function annullaImport() {
  archivioImportato.value = null
  selezioneImport.value = []
  confermaImport.value = false
  nomeFile.value = ''

  if (selettoreFile.value) {
    selettoreFile.value.value = ''
  }

  pulisciFeedback()
}

function nomeBackup() {
  const oggi = new Date()
  const anno = oggi.getFullYear()
  const mese = String(oggi.getMonth() + 1).padStart(2, '0')
  const giorno = String(oggi.getDate()).padStart(2, '0')

  return `DMC_Backup_${anno}-${mese}-${giorno}.json`
}

async function esportaCampagne() {
  if (occupato.value) return

  pulisciFeedback()

  if (!selezioneExport.value.length) {
    errore.value = 'Seleziona almeno una campagna.'
    return
  }

  occupato.value = true

  try {
    const { creaBackup } = await caricaArchivio()
    if (!componenteAttivo) return
    const archivio = creaBackup(selezioneExport.value)

    const blob = new Blob(
      [JSON.stringify(archivio, null, 2)],
      { type: 'application/json' }
    )

    const url = URL.createObjectURL(blob)
    const collegamento = document.createElement('a')

    collegamento.href = url
    collegamento.download = nomeBackup()

    document.body.appendChild(collegamento)
    collegamento.click()
    collegamento.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)

    esportazioneAperta.value = false
    messaggio.value =
      `${archivio.campagne.length} campagne inserite nel backup.`
  } catch (e) {
    errore.value = e.message || 'Esportazione non riuscita.'
  } finally {
    occupato.value = false
  }
}

async function leggiBackup(evento) {
  const file = evento.target.files?.[0]

  annullaImport()
  pulisciFeedback()

  if (!file) return

  nomeFile.value = file.name

  if (!file.size || file.size > DIMENSIONE_MAX) {
    errore.value =
      'Seleziona un file JSON valido, non vuoto e inferiore a 50 MB.'
    return
  }

  occupato.value = true

  try {
    const testo = await file.text()
    if (!componenteAttivo) return
    let archivio

    try {
      archivio = JSON.parse(testo)
    } catch {
      throw new Error('Il file non contiene un JSON valido.')
    }

    const { verificaArchivio } = await caricaArchivio()
    if (!componenteAttivo) return
    verificaArchivio(archivio)

    archivioImportato.value = archivio
    selezioneImport.value =
      archivio.campagne.map((_, indice) => indice)

    messaggio.value =
      `Backup letto: ${archivio.campagne.length} campagne trovate.`
  } catch (e) {
    errore.value = e.message || 'Impossibile leggere il backup.'
    nomeFile.value = ''
  } finally {
    occupato.value = false
  }
}

async function importaCampagne() {
  if (
    occupato.value ||
    !archivioImportato.value ||
    !confermaImport.value
  ) return

  pulisciFeedback()

  if (!selezioneImport.value.length) {
    errore.value = 'Seleziona almeno una campagna.'
    return
  }

  occupato.value = true

  try {
    const { importaBackup } = await caricaArchivio()
    if (!componenteAttivo) return
    const totale = importaBackup(
      archivioImportato.value,
      selezioneImport.value
    )

    annullaImport()

    messaggio.value =
      `${totale} campagne importate come copie indipendenti, con le schede personali e gli incontri.`
  } catch (e) {
    errore.value = e.message || 'Importazione non riuscita.'
  } finally {
    occupato.value = false
    confermaImport.value = false
  }
}
</script>

<template>
  <section class="archivio-dmc dmc-pannello" :aria-busy="occupato">
    <header class="archivio-header">
      <div class="header-testo">
        <span class="sopratitolo-archivio">
          LA TUA LIBRERIA
        </span>

        <h2>Archivio e backup</h2>

        <p>
          Proteggi le tue campagne, esportale o trasferiscile.
        </p>
      </div>

      <span class="numero-campagne">
        {{ numeroCampagne }}
        {{ numeroCampagne === 1 ? 'campagna' : 'campagne' }}
      </span>
    </header>

    <div class="archivio-griglia">
      <!-- ESPORTAZIONE -->

      <article class="archivio-card">
        <div class="card-simbolo">
          <span aria-hidden="true">↗</span>
        </div>

        <div class="card-contenuto">
          <h3>Esporta campagne</h3>

          <p>
            Crea una copia delle campagne che scegli,
            delle schede personali e degli incontri preparati.
          </p>
        </div>

        <button
          type="button"
          class="archivio-btn principale dmc-btn"
          :disabled="!numeroCampagne || occupato"
          @click="cambiaEsportazione"
        >
          <span>
            {{
              esportazioneAperta
                ? 'Chiudi selezione'
                : 'Seleziona campagne'
            }}
          </span>

          <span aria-hidden="true">
            {{ esportazioneAperta ? '−' : '→' }}
          </span>
        </button>

        <div
          v-if="esportazioneAperta"
          class="selezione-campagne"
        >
          <label class="archivio-scelta scegli-tutte">
            <input
              type="checkbox"
              :checked="tuttoExport"
              :disabled="occupato"
              @change="selezionaExport($event.target.checked)"
            />
            <span>Seleziona tutte</span>
          </label>

          <div class="lista-selezione">
            <label
              v-for="c in campagne"
              :key="c.id"
              class="archivio-scelta"
            >
              <input
                v-model="selezioneExport"
                type="checkbox"
                :value="c.id"
                :disabled="occupato"
              />

              <span class="nome-campagna">
                {{ c.nome }}
              </span>
            </label>
          </div>

          <button
            type="button"
            class="archivio-btn principale dmc-btn"
            :disabled="!selezioneExport.length || occupato"
            @click="esportaCampagne"
          >
            <span>
              Esporta {{ selezioneExport.length }}
              {{
                selezioneExport.length === 1
                  ? 'campagna'
                  : 'campagne'
              }}
            </span>

            <span aria-hidden="true">↓</span>
          </button>
        </div>
      </article>

      <!-- IMPORTAZIONE -->

      <article class="archivio-card">
        <div class="card-simbolo">
          <span aria-hidden="true">↙</span>
        </div>

        <div class="card-contenuto">
          <h3>Importa un backup</h3>

          <p>
            Carica un file DMC e scegli quali campagne recuperare.
          </p>
        </div>

        <input
          ref="selettoreFile"
          class="file-nascosto"
          type="file"
          accept=".json,application/json"
          aria-label="Seleziona un file JSON di backup"
          :disabled="occupato"
          @change="leggiBackup"
        />

        <button
          type="button"
          class="archivio-btn secondario dmc-btn dmc-btn--secondary"
          :disabled="occupato"
          @click="apriFile"
        >
          <span>Seleziona backup</span>
          <span aria-hidden="true">→</span>
        </button>

        <p v-if="nomeFile" class="nome-file">
          {{ nomeFile }}
        </p>
      </article>
    </div>

    <!-- ANTEPRIMA -->

    <section
      v-if="archivioImportato"
      class="anteprima-backup dmc-pannello"
    >
      <header class="anteprima-header">
        <div>
          <h3>Anteprima del backup</h3>
          <p>Seleziona le campagne da importare.</p>
        </div>

        <span class="numero-campagne">
          {{ anteprima.length }}
          {{
            anteprima.length === 1
              ? 'campagna'
              : 'campagne'
          }}
        </span>
      </header>

      <div class="selezione-campagne">
        <label class="archivio-scelta scegli-tutte">
          <input
            type="checkbox"
            :checked="tuttoImport"
            :disabled="occupato"
            @change="selezionaImport($event.target.checked)"
          />
          <span>Seleziona tutte</span>
        </label>

        <div class="lista-selezione">
          <label
            v-for="(voce, indice) in anteprima"
            :key="indice"
            class="archivio-scelta"
          >
            <input
              v-model="selezioneImport"
              type="checkbox"
              :value="indice"
              :disabled="occupato"
            />

            <span class="campagna-dettagli">
              <strong>{{ voce.nome }}</strong>

              <small>
                {{ voce.dati.personaggi.length }} PG ·
                {{ voce.dati.sessioni.length }} sessioni ·
                {{ voce.dati.nemici.length }} nemici
              </small>
            </span>
          </label>
        </div>
      </div>

      <p class="avviso-import">
        Le campagne verranno aggiunte come nuove copie.
        Nessuna campagna esistente sarà sovrascritta.
      </p>

      <label class="archivio-conferma">
        <input
          v-model="confermaImport"
          type="checkbox"
          :disabled="occupato"
        />

        <span>
          Confermo di voler aggiungere le campagne selezionate
          alla libreria DMC.
        </span>
      </label>

      <div class="azioni-import">
        <button
          type="button"
          class="archivio-btn principale dmc-btn"
          :disabled="
            !confermaImport ||
            !selezioneImport.length ||
            occupato
          "
          @click="importaCampagne"
        >
          Importa {{ selezioneImport.length }}
          {{
            selezioneImport.length === 1
              ? 'campagna'
              : 'campagne'
          }}
        </button>

        <button
          type="button"
          class="archivio-btn secondario dmc-btn dmc-btn--secondary"
          :disabled="occupato"
          @click="annullaImport"
        >
          Annulla
        </button>
      </div>
    </section>

    <p
      v-if="errore"
      class="feedback errore"
      role="alert"
    >
      {{ errore }}
    </p>

    <p
      v-if="messaggio"
      class="feedback successo"
      role="status"
    >
      {{ messaggio }}
    </p>

    <footer class="archivio-footer">
      I backup vengono salvati sul tuo dispositivo.
      Il Bestiario globale non è ancora incluso.
    </footer>
  </section>
</template>

<style scoped>
.archivio-dmc {
  display: grid;
  gap: 18px;
  width: 100%;
  min-width: 0;
  margin: 22px 0;
  padding: var(--dmc-space-5);
  color: var(--dmc-cream);
}

.archivio-dmc *,
.archivio-dmc *::before,
.archivio-dmc *::after {
  box-sizing: border-box;
}

.archivio-dmc :is(h2, h3, p) {
  margin: 0;
}

.archivio-dmc :is(h2, h3) {
  color: var(--dmc-amber);
}

/* TESTATA */

.archivio-header,
.anteprima-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--dmc-space-3);
  min-width: 0;
}

.header-testo {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.sopratitolo-archivio {
  color: var(--dmc-amber-light);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.7px;
}

.archivio-header h2 {
  font-size: 23px;
}

.archivio-header p,
.anteprima-header p,
.card-contenuto p {
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.6;
}

.numero-campagne {
  flex: 0 0 auto;
  padding: 7px 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-amber);
  font-size: 12px;
}

/* CARD */

.archivio-griglia {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 14px;
  min-width: 0;
}

.archivio-card {
  display: flex;
  flex-direction: column;
  gap: 13px;
  min-width: 0;
  width: 100%;
  padding: 18px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-surface-soft);
}

.card-simbolo {
  display: grid;
  place-items: center;
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber);
  font-size: 23px;
}

.card-contenuto {
  display: grid;
  align-content: start;
  gap: 7px;
  min-width: 0;
  min-height: 76px;
}

.card-contenuto h3 {
  font-size: 18px;
  line-height: 1.3;
}

/* AZIONI */

.archivio-dmc .archivio-btn {
  display: inline-flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  margin: 0;
  padding: 9px 13px;
  font-family: var(--dmc-font-body);
  font-size: 13px;
  font-weight: 750;
  line-height: 1.3;
  text-align: left;
  cursor: pointer;
}

.archivio-btn:hover:not(:disabled) {
  filter: brightness(1.07);
}

.archivio-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.archivio-dmc input.file-nascosto {
  position: absolute;
  width: 1px;
  height: 1px;
  min-width: 1px;
  min-height: 1px;
  margin: 0;
  padding: 0;
  opacity: 0;
  overflow: hidden;
  pointer-events: none;
}

.nome-file {
  color: var(--dmc-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

/* SELEZIONE */

.selezione-campagne {
  display: grid;
  gap: 7px;
  width: 100%;
  min-width: 0;
}

.lista-selezione {
  display: grid;
  gap: 6px;
  max-height: 260px;
  min-width: 0;
  overflow-y: auto;
  scrollbar-width: thin;
}

.archivio-dmc label.archivio-scelta,
.archivio-dmc label.archivio-conferma {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  gap: 12px;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  margin: 0;
  padding: 11px 12px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  font-size: 13px;
  line-height: 1.5;
  text-align: left;
  cursor: pointer;
}

.archivio-dmc label.archivio-scelta:hover {
  border-color: var(--dmc-amber-dark);
}

.archivio-dmc label.scegli-tutte {
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber-light);
  font-weight: 700;
}

.archivio-dmc label.archivio-scelta > input[type='checkbox'],
.archivio-dmc label.archivio-conferma > input[type='checkbox'] {
  position: static;
  display: block;
  flex: 0 0 18px;
  width: 18px;
  height: 18px;
  min-width: 18px;
  max-width: 18px;
  min-height: 18px;
  max-height: 18px;
  margin: 0;
  padding: 0;
  appearance: auto;
  accent-color: var(--dmc-amber);
  cursor: pointer;
}

.archivio-dmc label.archivio-scelta > span,
.archivio-dmc label.archivio-conferma > span {
  display: block;
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.campagna-dettagli {
  display: flex !important;
  flex-direction: column;
  gap: 3px;
}

.campagna-dettagli strong {
  color: var(--dmc-cream);
  font-size: 14px;
}

.campagna-dettagli small {
  color: var(--dmc-muted);
  font-size: 12px;
}

/* ANTEPRIMA */

.anteprima-backup {
  display: grid;
  gap: 14px;
  width: 100%;
  min-width: 0;
  padding: 17px;
}

.anteprima-header {
  padding-bottom: 12px;
  border-bottom: 1px solid var(--dmc-border-soft);
}

.anteprima-header > div {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.anteprima-header h3 {
  font-size: 19px;
}

.avviso-import {
  padding: 10px 12px;
  border-left: 3px solid var(--dmc-amber);
  border-radius: var(--dmc-radius-xs);
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber-light);
  font-size: 12px;
  line-height: 1.5;
}

.archivio-dmc label.archivio-conferma {
  min-height: 48px;
  padding: 12px 14px;
  background: var(--dmc-ink);
}

.azioni-import {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 9px;
}

.azioni-import .archivio-btn {
  width: auto;
  justify-content: center;
}

/* FEEDBACK */

.feedback {
  padding: 11px 12px;
  border: 1px solid;
  border-radius: var(--dmc-radius-sm);
  font-size: 13px;
  line-height: 1.5;
}

.feedback.successo {
  color: var(--dmc-moss-text);
  border-color: var(--dmc-moss);
}

.feedback.errore {
  color: var(--dmc-rust-text);
  border-color: var(--dmc-rust);
}

.archivio-footer {
  padding-top: 14px;
  border-top: 1px solid var(--dmc-border-soft);
  color: var(--dmc-muted);
  font-size: 12px;
  line-height: 1.6;
}

/* ACCESSIBILITÀ */

.archivio-dmc :is(button, input):focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 760px) {
  .archivio-griglia {
    grid-template-columns: 1fr;
  }

  .archivio-dmc {
    padding: 15px;
  }
}

@media (max-width: 450px) {
  .archivio-card {
    padding: 13px;
  }

  .anteprima-backup {
    padding: 12px;
  }

  .azioni-import .archivio-btn {
    width: 100%;
  }
}
</style>
