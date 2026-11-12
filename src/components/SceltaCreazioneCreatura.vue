<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import {
  leggiArchivioCreature,
  importaArchivioCreature,
  DIMENSIONE_MAX_CREATURE,
} from '../stato/archivioCreature.js'

const props = defineProps({
  categoria: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['chiudi', 'manuale'])

const categoria = computed(() => (props.categoria === 'png' ? 'png' : 'homebrew'))

const CHIAVE_BOZZA = 'dmc-bozza-creazione-assistita-v2'

const fase = ref('scelta')
const nome = ref('')
const descrizione = ref('')
const ruolo = ref('nemico comune')
const gs = ref('')
const giocatori = ref(null)
const livello = ref(null)
const complessita = ref('intermedia')
const indicazioni = ref('')

const messaggio = ref('')
const errore = ref('')

const dialogo = ref(null)
const primoCampo = ref(null)
const inputImportazione = ref(null)

const archivio = ref(null)
const nomeFile = ref('')
const selezionate = ref([])
const caricamento = ref(false)

let elementoPrecedente = null
let overflowPrecedente = ''
let inizializzazione = true
let richiesta = 0

const ruoli = ['nemico comune', 'mini-boss', 'boss', 'alleato', 'PNG narrativo']

const bozza = computed(() => ({
  nome: nome.value,
  descrizione: descrizione.value,
  ruolo: ruolo.value,
  gs: gs.value,
  numeroGiocatori: giocatori.value,
  livelloGruppo: livello.value,
  complessita: complessita.value,
  indicazioni: indicazioni.value,
}))

const chiave = computed(() => `${CHIAVE_BOZZA}-${categoria.value}`)

function testo(valore, alternativa = 'Non specificato') {
  const risultato = String(valore ?? '').trim()
  return risultato || alternativa
}

function recuperaBozza() {
  inizializzazione = true

  try {
    const salvata = JSON.parse(localStorage.getItem(chiave.value) || 'null')

    if (salvata && typeof salvata === 'object') {
      nome.value = String(salvata.nome ?? '').slice(0, 100)
      descrizione.value = String(salvata.descrizione ?? '').slice(0, 3000)

      ruolo.value = ruoli.includes(salvata.ruolo)
        ? salvata.ruolo
        : categoria.value === 'png'
          ? 'PNG narrativo'
          : 'nemico comune'

      gs.value = String(salvata.gs ?? '').slice(0, 12)

      const n = Number(salvata.numeroGiocatori)
      const l = Number(salvata.livelloGruppo)

      giocatori.value =
        salvata.numeroGiocatori != null && Number.isInteger(n) && n >= 1 && n <= 20 ? n : null

      livello.value =
        salvata.livelloGruppo != null && Number.isInteger(l) && l >= 1 && l <= 20 ? l : null

      complessita.value = ['semplice', 'intermedia', 'avanzata'].includes(salvata.complessita)
        ? salvata.complessita
        : 'intermedia'

      indicazioni.value = String(salvata.indicazioni ?? '').slice(0, 2000)
    } else {
      azzeraBozza()
    }
  } catch {
    azzeraBozza()
  } finally {
    inizializzazione = false
  }
}

function salvaBozza() {
  if (inizializzazione) return

  try {
    localStorage.setItem(chiave.value, JSON.stringify(bozza.value))
  } catch {
    // La bozza non deve impedire la creazione.
  }
}

watch(bozza, salvaBozza, { deep: true })

function azzeraBozza() {
  nome.value = ''
  descrizione.value = ''
  ruolo.value = categoria.value === 'png' ? 'PNG narrativo' : 'nemico comune'
  gs.value = ''
  giocatori.value = null
  livello.value = null
  complessita.value = 'intermedia'
  indicazioni.value = ''
}

function cancellaBozza() {
  azzeraBozza()
  localStorage.removeItem(chiave.value)
  messaggio.value = 'Bozza cancellata.'
}

const prompt = computed(() => {
  const tipo = categoria.value

  return `Agisci come progettista esperto di creature e PNG per Dungeons & Dragons 5e, regole 2024.

Aiutami a creare una scheda personalizzata, completamente in italiano, compatibile con Dungeon Master Companion (DMC).

DATI FORNITI DAL DUNGEON MASTER

Categoria: ${tipo}
Nome: ${testo(nome.value, 'Da proporre')}
Descrizione e concept: ${testo(descrizione.value, 'Da proporre')}
Ruolo: ${ruolo.value}
GS desiderato: ${testo(gs.value, 'Da proporre')}
Numero di giocatori: ${testo(giocatori.value)}
Livello del gruppo: ${testo(livello.value)}
Complessità meccanica: ${complessita.value}
Altre indicazioni: ${testo(indicazioni.value, 'Nessuna')}

FASE 1 — PROPOSTA

Presenta una scheda completa e leggibile in italiano.

Definisci, dove pertinenti:
- Nome, taglia, tipo e allineamento.
- Grado di Sfida, punti esperienza e bonus competenza.
- Classe Armatura e Punti Ferita con relativa formula.
- Iniziativa, velocità, sensi e linguaggi.
- Sei caratteristiche e relativi modificatori.
- Tiri salvezza e abilità.
- Resistenze, vulnerabilità e immunità.
- Capacità e tratti speciali.
- Azioni, azioni bonus, reazioni.
- Azioni leggendarie o mitiche soltanto se appropriate.
- Equipaggiamento e note narrative.

Per ogni attacco specifica bonus per colpire, portata o gittata, bersagli, danni e tipo di danno.

Per ogni tiro salvezza indica caratteristica, CD, conseguenze in caso di successo e fallimento.

Mantieni la complessità meccanica richiesta.

FASE 2 — BILANCIAMENTO

Utilizza numero e livello dei giocatori per progettare la sfida.

Tali informazioni sono parametri di progettazione, non caratteristiche permanenti della creatura.

Mostra separatamente dalla scheda:
- GS proposto.
- Livello orientativo di un gruppo di quattro personaggi adatto ad affrontare la sfida.
- Eventuali considerazioni sul bilanciamento.

Il livello consigliato è una stima, non un requisito ufficiale.

Non aggiungere il livello consigliato nel JSON: DMC non dispone ancora di un campo dedicato.

FASE 3 — NOTE

Il campo "note" deve contenere esclusivamente:
- Aspetto e personalità.
- Background e comportamento.
- Indicazioni tattiche generali.
- Informazioni narrative riutilizzabili.

Non inserire nelle note:
- Numero dei giocatori.
- Livello del gruppo usato per creare la scheda.
- Riferimenti a campagne specifiche non richiesti.
- Frasi automatiche sul GS indicativo.
- Avvertenze sul bilanciamento non verificato.
- Commenti sul processo di generazione.

La creatura deve essere utilizzabile in campagne differenti.

FASE 4 — APPROVAZIONE

Mostrami prima la proposta completa.

Chiedimi se voglio approvarla o modificarla.

Non generare ancora il JSON.

Se richiedo modifiche, aggiorna la proposta.

FASE 5 — JSON

Soltanto dopo la mia approvazione genera un file .json scaricabile, compatibile con DMC.

Non limitarti a descrivere il JSON: produci il file completo.

Se non puoi produrre un allegato, restituisci un unico blocco JSON valido, senza commenti.

L'oggetto radice deve essere:

{
  "formato": "dmc-creature",
  "versione": 1,
  "applicazione": "Dungeon Master Companion",
  "creature": [SCHEDA]
}

SCHEDA è un oggetto JSON con:
- id: stringa univoca non vuota.
- nome: stringa non vuota.
- origine: "custom".
- categoria: "${tipo}".
- statoScheda: "pronta".
- verificata: false.
- solaLettura: false.

Campi numerici:
ca, pfMax, iniziativa, iniziativaPassiva, bonusCompetenza,
puntiEsperienza, puntiEsperienzaTana.

Devono contenere numeri JSON o null, non stringhe.
Per una scheda pronta:
- ca deve essere un intero maggiore o uguale a zero.
- pfMax deve essere un intero maggiore di zero.

Il campo gs deve essere una stringa, ad esempio "1/2", "3", "9".

I campi caratteristiche, modificatori e tiriSalvezza devono essere oggetti con esclusivamente le chiavi:
for, des, cos, int, sag, car.

I rispettivi valori devono essere numeri JSON o null.
Non inventare competenze nei tiri salvezza.

abilita deve essere un array di oggetti:
{"nome":"Percezione","bonus":5}

Gli array aliases, taglie, sottotipi, resistenze,
vulnerabilita, immunita, immunitaCondizioni e tags
devono contenere esclusivamente stringhe.

I gruppi:
capacita, azioni, azioniBonus, reazioni,
azioniLeggendarie, azioniMitiche

devono contenere oggetti nel formato:
{"nome":"Nome","descrizione":"Testo completo"}

Utilizza [] per i gruppi non applicabili.

Non includere "attacchi", perché DMC lo ricava dalle azioni.

I campi:
nomeOriginale, tipo, taglia, tassonomiaOriginale,
allineamento, pfFormula, velocita, sensi, lingue,
equipaggiamento, regoleAzioniLeggendarie, note, fonte

devono essere stringhe, eventualmente vuote.

Non inserire dati inventati presentati come SRD ufficiale.

Genera una sola scheda, modificabile dal Dungeon Master.
Non superare 5 MB.

FASE 6 — VERIFICA

Controlla struttura, nomi, tipi JSON, coerenza delle statistiche,
azioni, CD e categorie.

Non affermare di avere effettuato validazioni software se non le hai eseguite.

FASE 7 — CONSEGNA

Consegnami il file JSON.

In DMC potrò importarlo attraverso:
Bestiario → Crea con ChatGPT → Importa JSON.

INIZIA CON LA PROPOSTA LEGGIBILE DELLA CREATURA.`
})

async function copiaPrompt() {
  messaggio.value = ''
  errore.value = ''

  try {
    await navigator.clipboard.writeText(prompt.value)
    messaggio.value = 'Prompt copiato negli appunti.'
  } catch {
    errore.value = 'Copia automatica non riuscita. Seleziona e copia il prompt dall’anteprima.'
  }
}

function pulisciImportazione() {
  richiesta++
  archivio.value = null
  nomeFile.value = ''
  selezionate.value = []
  caricamento.value = false

  if (inputImportazione.value) {
    inputImportazione.value.value = ''
  }
}

async function leggiFile(evento) {
  const file = evento.target.files?.[0]
  if (!file) return

  pulisciImportazione()
  errore.value = ''
  messaggio.value = ''

  const corrente = ++richiesta

  if (file.size === 0 || file.size > DIMENSIONE_MAX_CREATURE) {
    errore.value = 'Seleziona un JSON non vuoto di dimensione massima 5 MB.'
    return
  }

  caricamento.value = true

  try {
    const contenuto = await file.text()

    if (corrente !== richiesta) return

    const risultato = leggiArchivioCreature(contenuto)

    if (!risultato || !Array.isArray(risultato.creature)) {
      throw new Error('Archivio di creature non valido.')
    }

    archivio.value = risultato
    nomeFile.value = file.name
    selezionate.value = risultato.creature.map((_, indice) => indice)

    await nextTick()
    dialogo.value?.focus({ preventScroll: true })
  } catch (e) {
    if (corrente === richiesta) {
      errore.value = e.message || 'Impossibile leggere il JSON.'
    }
  } finally {
    if (corrente === richiesta) {
      caricamento.value = false
      if (inputImportazione.value) {
        inputImportazione.value.value = ''
      }
    }
  }
}

function confermaImportazione() {
  if (!archivio.value || selezionate.value.length === 0) {
    errore.value = 'Seleziona almeno una creatura da importare.'
    return
  }

  errore.value = ''

  try {
    const quantita = importaArchivioCreature(archivio.value, selezionate.value)

    pulisciImportazione()
    messaggio.value =
      quantita === 1
        ? 'Creatura importata correttamente.'
        : `${quantita} creature importate correttamente.`

    // La reattività del Bestiario aggiorna l'elenco.
    // Chiudiamo soltanto dopo l'importazione riuscita.
    emit('chiudi')
  } catch (e) {
    errore.value = e.message || 'Importazione non riuscita.'
  }
}

function tornaAllaCreazione() {
  pulisciImportazione()
  errore.value = ''
  messaggio.value = ''
  fase.value = 'chatgpt'
}

function chiudi() {
  pulisciImportazione()
  emit('chiudi')
}

function gestioneTastiera(evento) {
  if (evento.key === 'Escape' && !evento.isComposing) {
    evento.preventDefault()
    chiudi()
    return
  }

  if (evento.key !== 'Tab' || !dialogo.value) return

  const elementi = [
    ...dialogo.value.querySelectorAll('button, input, select, textarea, a[href]'),
  ].filter((el) => !el.disabled && el.getClientRects().length > 0)

  if (!elementi.length) return

  const primo = elementi[0]
  const ultimo = elementi[elementi.length - 1]

  if (evento.shiftKey && document.activeElement === primo) {
    evento.preventDefault()
    ultimo.focus()
  } else if (!evento.shiftKey && document.activeElement === ultimo) {
    evento.preventDefault()
    primo.focus()
  }
}

watch(fase, async () => {
  errore.value = ''
  messaggio.value = ''

  await nextTick()

  if (fase.value === 'chatgpt') {
    primoCampo.value?.focus()
  } else {
    dialogo.value?.focus()
  }
})

onMounted(async () => {
  elementoPrecedente = document.activeElement
  overflowPrecedente = document.body.style.overflow

  recuperaBozza()
  document.body.style.overflow = 'hidden'

  await nextTick()
  dialogo.value?.focus()
})

onBeforeUnmount(() => {
  richiesta++
  document.body.style.overflow = overflowPrecedente

  nextTick(() => {
    if (elementoPrecedente?.isConnected) {
      elementoPrecedente.focus()
    }
  })
})
</script>

<template>
  <div class="overlay" @click.self="chiudi">
    <section
      ref="dialogo"
      class="dialogo dmc-pannello"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titolo-creazione"
      tabindex="-1"
      @keydown="gestioneTastiera"
    >
      <header class="intestazione">
        <div>
          <h3 id="titolo-creazione">
            {{ categoria === 'png' ? 'Nuovo PNG' : 'Nuova creatura' }}
          </h3>
          <p>Creazione personalizzata per DMC</p>
        </div>

        <button class="dmc-btn dmc-btn--secondary" type="button" @click="chiudi">Chiudi</button>
      </header>

      <!-- SCELTA INIZIALE -->

      <div v-if="fase === 'scelta'" class="opzioni">
        <button type="button" class="scelta dmc-pannello dmc-carta" @click="emit('manuale')">
          <strong>Crea da zero</strong>
          <span>Apri l'editor completo della scheda.</span>
        </button>

        <button type="button" class="scelta dmc-pannello dmc-carta" @click="fase = 'chatgpt'">
          <strong>Crea con ChatGPT</strong>
          <span> Descrivi la creatura e genera un JSON compatibile con DMC. </span>
        </button>
      </div>

      <!-- CREAZIONE ASSISTITA -->

      <div v-else-if="fase === 'chatgpt'" class="contenuto">
        <p class="spiegazione">
          Compila i dati disponibili. ChatGPT proporrà le altre caratteristiche.
        </p>

        <div class="campi">
          <label>
            Nome
            <input
              class="dmc-campo"
              ref="primoCampo"
              v-model="nome"
              maxlength="100"
              placeholder="Es. Signore degli Ogre"
            />
          </label>

          <label>
            Ruolo
            <select class="dmc-campo" v-model="ruolo">
              <option v-for="opzione in ruoli" :key="opzione" :value="opzione">
                {{ opzione }}
              </option>
            </select>
          </label>

          <label class="ampio">
            Descrizione e concept
            <textarea
              class="dmc-campo"
              v-model="descrizione"
              rows="4"
              maxlength="3000"
              placeholder="Aspetto, storia, carattere e capacità..."
            ></textarea>
          </label>

          <label>
            GS desiderato
            <input class="dmc-campo" v-model="gs" maxlength="12" placeholder="Es. 1/2, 3, 9" />
          </label>

          <label>
            Complessità
            <select class="dmc-campo" v-model="complessita">
              <option value="semplice">Semplice</option>
              <option value="intermedia">Intermedia</option>
              <option value="avanzata">Avanzata</option>
            </select>
          </label>

          <label>
            Numero di giocatori
            <input
              class="dmc-campo"
              v-model.number="giocatori"
              type="number"
              min="1"
              max="20"
              placeholder="Es. 4"
            />
          </label>

          <label>
            Livello del gruppo
            <input
              class="dmc-campo"
              v-model.number="livello"
              type="number"
              min="1"
              max="20"
              placeholder="Es. 3"
            />
          </label>

          <label class="ampio">
            Altre indicazioni
            <textarea
              class="dmc-campo"
              v-model="indicazioni"
              rows="3"
              maxlength="2000"
              placeholder="Vincoli narrativi e preferenze..."
            ></textarea>
          </label>
        </div>

        <label>
          Anteprima del prompt
          <textarea class="anteprima dmc-campo" :value="prompt" rows="5" readonly></textarea>
        </label>

        <div class="azioni">
          <button class="dmc-btn dmc-btn--secondary" type="button" @click="fase = 'scelta'">
            Indietro
          </button>

          <button type="button" class="primario dmc-btn" @click="copiaPrompt">Copia prompt</button>

          <a href="https://chatgpt.com/" target="_blank" rel="noopener noreferrer">
            Apri ChatGPT
          </a>
        </div>

        <div class="passaggio-importazione">
          <div>
            <strong>Hai ottenuto il JSON da ChatGPT?</strong>
            <p>Importalo direttamente qui senza chiudere la creazione assistita.</p>
          </div>

          <button type="button" class="primario dmc-btn" @click="fase = 'importazione'">
            Importa JSON
          </button>
        </div>

        <div class="barra-bozza">
          <span> La bozza viene salvata automaticamente. </span>

          <button class="dmc-btn dmc-btn--secondary" type="button" @click="cancellaBozza">
            Cancella bozza
          </button>
        </div>
      </div>

      <!-- IMPORTAZIONE DIRETTA -->

      <div v-else class="contenuto">
        <div class="testata-importazione">
          <h4>Importa il JSON generato</h4>
          <p>Il file viene controllato prima di aggiungere le creature al Bestiario.</p>
        </div>

        <label>
          Seleziona il file JSON
          <input
            ref="inputImportazione"
            type="file"
            accept=".json,application/json"
            @change="leggiFile"
          />
        </label>

        <p v-if="caricamento" role="status">Lettura e validazione del file...</p>

        <section v-if="archivio" class="anteprima-importazione" aria-label="Anteprima importazione">
          <h4>Anteprima</h4>

          <p>
            {{ nomeFile }} ·
            {{ archivio.creature.length }}
            schede disponibili
          </p>

          <div class="lista-creature">
            <label
              v-for="(creatura, indice) in archivio.creature"
              :key="indice"
              class="voce-importazione"
            >
              <input v-model="selezionate" type="checkbox" :value="indice" />

              <span>
                <strong>{{ creatura.nome }}</strong>
                <small> {{ creatura.categoria }} · GS {{ creatura.gs || '—' }} </small>
              </span>
            </label>
          </div>

          <p class="nota">
            Le schede selezionate saranno importate come copie personali modificabili.
          </p>

          <button
            type="button"
            class="primario dmc-btn"
            :disabled="!selezionate.length"
            @click="confermaImportazione"
          >
            Importa {{ selezionate.length }}
            {{ selezionate.length === 1 ? 'scheda' : 'schede' }}
          </button>
        </section>

        <button class="dmc-btn dmc-btn--secondary" type="button" @click="tornaAllaCreazione">
          Torna alla creazione
        </button>
      </div>

      <p v-if="errore" class="feedback errore" role="alert">
        {{ errore }}
      </p>

      <p v-if="messaggio" class="feedback" role="status">
        {{ messaggio }}
      </p>
    </section>
  </div>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: grid;
  place-items: center;
  padding: var(--dmc-space-3);
  background: rgb(0 0 0 / 80%);
}

.dialogo {
  display: grid;
  gap: 18px;
  width: min(740px, 100%);
  max-height: 92vh;
  overflow-y: auto;
  padding: 20px;
  color: var(--dmc-cream);
}

.intestazione {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--dmc-space-3);
}

h3,
h4,
p {
  margin: 0;
}

.intestazione h3,
.testata-importazione h4 {
  color: var(--dmc-amber);
}

.intestazione p,
.spiegazione,
.nota,
.barra-bozza,
.testata-importazione p,
.passaggio-importazione p {
  color: var(--dmc-muted-light);
  font-size: 0.85rem;
  line-height: 1.5;
}

.opzioni {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dmc-space-3);
}

.scelta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--dmc-space-3);
  min-height: 135px;
  padding: 18px;
  text-align: left;
}

.scelta strong {
  color: var(--dmc-amber);
  font-size: 1.1rem;
}

.contenuto,
.testata-importazione {
  display: grid;
  gap: 14px;
}

.campi {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--dmc-space-3);
}

.ampio {
  grid-column: 1 / -1;
}

label {
  display: grid;
  gap: 6px;
  min-width: 0;
  font-size: 0.85rem;
}

input,
select,
textarea {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-cream);
  background: var(--dmc-ink);
  font: inherit;
}

input[type='checkbox'] {
  width: 17px;
  height: 17px;
  accent-color: var(--dmc-amber);
}

textarea {
  resize: vertical;
}

.anteprima {
  max-height: 170px;
  font-size: 0.8rem;
  line-height: 1.5;
}

button,
.azioni a {
  min-height: 39px;
  padding: 9px 13px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-cream);
  background: var(--dmc-ink);
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.primario {
  border-color: var(--dmc-amber);
  color: var(--dmc-ink);
  background: var(--dmc-amber);
  font-weight: 750;
}

.azioni {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 9px;
}

.azioni a {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.passaggio-importazione {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--dmc-space-4);
  padding: 14px;
  border: 1px solid var(--dmc-amber);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink);
}

.passaggio-importazione > div {
  display: grid;
  gap: 5px;
}

.barra-bozza {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--dmc-border);
}

.anteprima-importazione {
  display: grid;
  gap: var(--dmc-space-3);
  padding: 14px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-sm);
}

.lista-creature {
  display: grid;
  gap: 7px;
  max-height: 220px;
  overflow-y: auto;
}

.voce-importazione {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
}

.voce-importazione span {
  display: grid;
  gap: 3px;
}

.voce-importazione small {
  color: var(--dmc-muted-light);
}

.feedback {
  padding: 10px 12px;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-xs);
}

.feedback.errore {
  color: var(--dmc-rust-text);
  border-color: var(--dmc-rust);
}

:focus-visible {
  outline: 3px solid var(--dmc-amber);
  outline-offset: 2px;
}

@media (max-width: 520px) {
  .dialogo {
    padding: 14px;
  }

  .opzioni,
  .campi {
    grid-template-columns: 1fr;
  }

  .passaggio-importazione {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
