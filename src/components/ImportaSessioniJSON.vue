<script setup>
import { computed, ref } from 'vue'
import { datiCampagna, idUnivoco, salvaDatiCampagna } from '../stato/statoDatiCampagna.js'
import { verificaArchivioSessioniChatGPT } from '../dati/validazioneSessioniChatGPT.js'
import { leggiJsonDaChatGPT } from '../dati/jsonDaChatGPT.js'

const fileInput = ref(null)
const anteprima = ref(null)
const errore = ref('')
const messaggio = ref('')
const confermato = ref(false)
const occupato = ref(false)
const selezionate = ref([])
const jsonIncollato = ref('')
const anteprimaDaTesto = ref(false)
const sessioni = computed(() => anteprima.value?.sessioni || [])
const MAX_FILE = 2 * 1024 * 1024

function testo(v) {
  return typeof v === 'string'
}
function azzera() {
  anteprimaDaTesto.value = false
  anteprima.value = null
  selezionate.value = []
  confermato.value = false
  errore.value = ''
  messaggio.value = ''
  if (fileInput.value) fileInput.value.value = ''
}
async function leggiFile(e) {
  azzera()
  const file = e.target.files?.[0]
  if (!file) return
  if (!file.size || file.size > MAX_FILE) {
    errore.value = 'Seleziona un JSON non vuoto e inferiore a 2 MB.'
    return
  }
  occupato.value = true
  try {
    const contenuto = JSON.parse(await file.text())
    verificaArchivioSessioniChatGPT(contenuto)
    anteprima.value = contenuto
    anteprimaDaTesto.value = false
    selezionate.value = contenuto.sessioni.map((_, i) => i)
  } catch (e) {
    errore.value =
      e instanceof SyntaxError
        ? 'Il file non contiene JSON valido.'
        : e.message || 'Impossibile leggere il file.'
  } finally {
    occupato.value = false
  }
}
function verificaTestoIncollato() {
  azzera()
  occupato.value = true
  try {
    const contenuto = leggiJsonDaChatGPT(jsonIncollato.value, MAX_FILE)
    verificaArchivioSessioniChatGPT(contenuto)
    anteprima.value = contenuto
    anteprimaDaTesto.value = true
    selezionate.value = contenuto.sessioni.map((_, i) => i)
  } catch (e) {
    errore.value = e.message || 'Il JSON incollato non è valido.'
  } finally {
    occupato.value = false
  }
}
function scaricaJsonSessioni() {
  if (!anteprima.value || !anteprimaDaTesto.value) return
  const blob = new Blob([JSON.stringify(anteprima.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'DMC_Sessioni_Generate.json'
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  messaggio.value = 'JSON delle sessioni salvato sul dispositivo.'
}
function annulla() {
  azzera()
  jsonIncollato.value = ''
}
function preparaSessione(s) {
  const scene = s.scene.map((sc) => {
    const nuovoId = idUnivoco()
    return {
      id: nuovoId,
      titolo: sc.titolo.trim(),
      orario: testo(sc.orario) ? sc.orario : '',
      descrizione: sc.descrizione,
      note: testo(sc.note) ? sc.note : '',
      alternativa: testo(sc.alternativa) ? sc.alternativa : '',
      personaggi: testo(sc.personaggi) ? sc.personaggi : '',
      guida: [],
      indizi: [],
      pngIds: [],
      mostraRituale: false,
      incontro: {
        nemici: [],
        opzionale: false,
        richiedeCreature: [],
        suggerimentiPF: [],
        noteBilanciamento: '',
      },
    }
  })
  return {
    id: idUnivoco(),
    titolo: s.titolo.trim(),
    data: testo(s.data) ? s.data : '',
    stato: 'preparazione',
    obiettivi: testo(s.obiettivi) ? s.obiettivi : '',
    resoconto: '',
    pgPrevisti:
      Number.isInteger(s.pgPrevisti) && s.pgPrevisti >= 1 && s.pgPrevisti <= 20 ? s.pgPrevisti : 4,
    livelloPrevisto:
      Number.isInteger(s.livelloPrevisto) && s.livelloPrevisto >= 1 && s.livelloPrevisto <= 20
        ? s.livelloPrevisto
        : 2,
    scenaAttivaId: null,
    sceneVisitateIds: [],
    risorseNarrative: [],
    rituale: { descrizione: '', partecipanti: [] },
    scene,
  }
}
function importa() {
  errore.value = ''
  messaggio.value = ''
  if (!confermato.value || !datiCampagna.value || !selezionate.value.length) return
  const dati = datiCampagna.value
  const nuove = selezionate.value.map((i) => preparaSessione(sessioni.value[i]))
  const precedenti = [...dati.sessioni]
  dati.sessioni.push(...nuove)
  if (!salvaDatiCampagna()) {
    dati.sessioni = precedenti
    errore.value =
      'Salvataggio non riuscito. Nessuna sessione è stata aggiunta; verifica lo spazio disponibile.'
    return
  }
  annulla()
  messaggio.value = `${nuove.length} sessioni aggiunte alla campagna corrente.`
}
</script>

<template>
  <details class="importa-sessioni dmc-pannello">
    <summary>Importa sessioni da ChatGPT <span aria-hidden="true">⌄</span></summary>
    <div class="importa-sessioni-contenuto">
      <p>
        Importa un file JSON <code>dmc-sessioni</code> (versione 1) oppure incolla il JSON copiato
        da ChatGPT. Le sessioni vengono aggiunte alla campagna aperta; creature e PNG si collegano in DMC.
      </p>
      <label class="importa-sessioni-file">
        Incolla JSON completo da ChatGPT
        <textarea
          v-model="jsonIncollato"
          class="dmc-campo"
          rows="5"
          spellcheck="false"
          placeholder="Incolla un oggetto JSON completo, con o senza delimitatori Markdown..."
        ></textarea>
      </label>
      <button
        type="button"
        class="dmc-btn dmc-btn--secondary"
        :disabled="!jsonIncollato.trim() || occupato"
        @click="verificaTestoIncollato"
      >
        Verifica JSON incollato
      </button>
      <label class="importa-sessioni-file">
        File JSON
        <input
          ref="fileInput"
          type="file"
          accept=".json,application/json"
          :disabled="occupato"
          @change="leggiFile"
        />
      </label>
      <div v-if="anteprima" class="importa-sessioni-anteprima">
        <strong>Anteprima verificata: {{ sessioni.length }} sessioni</strong>
        <button
          v-if="anteprimaDaTesto"
          type="button"
          class="dmc-btn dmc-btn--secondary"
          @click="scaricaJsonSessioni"
        >
          Scarica JSON sul dispositivo
        </button>
        <label v-for="(s, i) in sessioni" :key="i">
          <input v-model="selezionate" type="checkbox" :value="i" />
          {{ s.titolo }} · {{ s.scene.length }} scene
        </label>
        <p>
          Le sessioni esistenti non saranno sostituite. Le nuove scene riceveranno identificativi
          univoci.
        </p>
        <label
          ><input v-model="confermato" type="checkbox" /> Confermo l'aggiunta alla campagna
          corrente.</label
        >
        <div class="importa-sessioni-azioni">
          <button
            type="button"
            class="dmc-btn"
            :disabled="!confermato || !selezionate.length || occupato"
            @click="importa"
          >
            Importa {{ selezionate.length }} sessioni
          </button>
          <button type="button" class="dmc-btn dmc-btn--secondary" @click="annulla">Annulla</button>
        </div>
      </div>
      <p v-if="errore" role="alert" class="importa-sessioni-errore">{{ errore }}</p>
      <p v-if="messaggio" role="status">{{ messaggio }}</p>
    </div>
  </details>
</template>

<style scoped>
.importa-sessioni {
  margin: 16px 0;
  padding: 0;
}
.importa-sessioni summary {
  padding: 16px 20px;
  color: var(--dmc-amber);
  cursor: pointer;
  font-weight: 700;
}
.importa-sessioni summary span {
  float: right;
}
.importa-sessioni-contenuto {
  display: grid;
  gap: 14px;
  padding: 0 20px 20px;
  color: var(--dmc-cream);
}
.importa-sessioni-contenuto p {
  margin: 0;
  line-height: 1.6;
  font-size: 13px;
}
.importa-sessioni-file,
.importa-sessioni-anteprima {
  display: grid;
  gap: 10px;
}
.importa-sessioni-file textarea {
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--dmc-border);
  border-radius: var(--dmc-radius-sm);
  background: var(--dmc-ink);
  color: var(--dmc-cream);
  padding: 10px;
  font: inherit;
}
.importa-sessioni-anteprima label {
  display: flex;
  align-items: center;
  gap: 10px;
}
.importa-sessioni-azioni {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.importa-sessioni-errore {
  color: #f5b2a9;
}
.importa-sessioni input[type='checkbox'] {
  accent-color: var(--dmc-amber);
}
.importa-sessioni :is(input, button, summary):focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}
</style>
