<script setup>
import { computed, ref } from 'vue'
import { idUnivoco } from '../stato/statoDatiCampagna.js'
import { creatureBestiario, pngPersonalizzati } from '../stato/statoBestiario.js'
import { collegaPNGDaBestiario } from '../dati/collegamentoPNG.js'

const props = defineProps({
  dati: { type: Object, required: true },
})

const nuovoPNG = ref('')
const pngBestiarioSelezionato = ref('')
const messaggioPNG = ref('')
const pngApertoId = ref(null)
const conferma = ref(null)

function registroPNG() {
  return Array.isArray(props.dati.pngNarrativi) ? props.dati.pngNarrativi : []
}

function creaPNG() {
  const nome = nuovoPNG.value.trim()
  if (!nome) return
  const png = {
    id: idUnivoco(),
    nome,
    ruolo: '',
    personalita: '',
    obiettivo: '',
    segreto: '',
    informazioni: '',
    creaturaId: '',
  }
  registroPNG().push(png)
  pngApertoId.value = png.id
  nuovoPNG.value = ''
}

const pngBestiarioCollegabili = computed(() =>
  pngPersonalizzati.value
    .filter((creatura) => !(props.dati.pngNarrativi || []).some((png) => png.creaturaId === creatura.id))
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
)

const pngBestiarioConsultabili = computed(() =>
  creatureBestiario.value.filter((creatura) => creatura.categoria === 'png')
    .sort((a, b) => a.nome.localeCompare(b.nome, 'it')),
)

function aggiungiPNGDaBestiario() {
  messaggioPNG.value = ''
  const creatura = pngPersonalizzati.value.find((c) => c.id === pngBestiarioSelezionato.value)
  const risultato = collegaPNGDaBestiario(registroPNG(), creatura, idUnivoco)
  if (!risultato.successo) {
    messaggioPNG.value = risultato.motivo
    return
  }
  pngApertoId.value = risultato.png.id
  pngBestiarioSelezionato.value = ''
  messaggioPNG.value =
    'PNG collegato alla campagna. Puoi aggiungere ruolo, personalità e informazioni narrative.'
}

function eliminaPNG(png) {
  const registro = registroPNG()
  const indice = registro.findIndex((elemento) => elemento.id === png.id)
  if (indice >= 0) registro.splice(indice, 1)
  for (const sessione of props.dati.sessioni || []) {
    for (const scena of sessione.scene || []) {
      scena.pngIds = (scena.pngIds || []).filter((id) => id !== png.id)
    }
  }
  conferma.value = null
  pngApertoId.value = null
}
</script>

<template>
<details class="registro-png dmc-pannello">
        <summary>
          PNG della campagna

          <small>
            {{ dati?.pngNarrativi?.length || 0 }}
            schede
          </small>
        </summary>

        <div class="interno-details">
          <form class="nuova-sessione" @submit.prevent="creaPNG">
            <label class="campo-flessibile">
              Nome del PNG

              <input
                v-model="nuovoPNG"
                class="dmc-campo"
                required
                maxlength="120"
                placeholder="Nome del personaggio"
              />
            </label>

            <button type="submit" class="dmc-btn">+ Aggiungi PNG</button>
          </form>

          <div
            class="nuova-sessione"
            style="
              margin: 12px 0;
              padding: 14px;
              border: 1px solid var(--dmc-border-soft);
              border-radius: 8px;
            "
          >
            <label class="campo-flessibile">
              Aggiungi dal Bestiario (PNG personalizzati)
              <select v-model="pngBestiarioSelezionato" class="dmc-campo">
                <option value="">Seleziona un PNG già creato…</option>
                <option
                  v-for="creatura in pngBestiarioCollegabili"
                  :key="creatura.id"
                  :value="creatura.id"
                >
                  {{ creatura.nome }}
                </option>
              </select>
            </label>
            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :disabled="!pngBestiarioSelezionato"
              @click="aggiungiPNGDaBestiario"
            >
              + Collega PNG
            </button>
            <p v-if="!pngPersonalizzati.length" class="testo-secondario">
              Nessun PNG personale nel Bestiario. Puoi crearne uno nella sezione Bestiario e
              collegarlo qui.
            </p>
            <p v-else-if="!pngBestiarioCollegabili.length" class="testo-secondario">
              Tutti i PNG personali del Bestiario sono già collegati a questa campagna.
            </p>
            <p v-if="messaggioPNG" role="status">{{ messaggioPNG }}</p>
          </div>

          <article v-for="png in dati?.pngNarrativi || []" :key="png.id" class="scheda-secondaria">
            <div class="intestazione">
              <strong>
                {{ png.nome }}
              </strong>

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn dmc-btn--secondary"
                  @click="pngApertoId = pngApertoId === png.id ? null : png.id"
                >
                  {{ pngApertoId === png.id ? 'Chiudi' : 'Scheda' }}
                </button>

                <button
                  type="button"
                  class="dmc-btn dmc-btn--danger"
                  @click="conferma = `png-${png.id}`"
                >
                  Elimina
                </button>
              </div>
            </div>

            <div v-if="conferma === `png-${png.id}`" class="conferma">
              Eliminare questo PNG e i suoi collegamenti alle scene?

              <div class="azioni">
                <button type="button" class="dmc-btn dmc-btn--danger" @click="eliminaPNG(png)">
                  Conferma
                </button>

                <button type="button" class="dmc-btn dmc-btn--secondary" @click="conferma = null">
                  Annulla
                </button>
              </div>
            </div>

            <div v-if="pngApertoId === png.id" class="griglia-campi">
              <label>
                Nome

                <input v-model="png.nome" class="dmc-campo" />
              </label>

              <label>
                Ruolo

                <input v-model="png.ruolo" class="dmc-campo" />
              </label>

              <label>
                Personalità

                <textarea v-model="png.personalita" class="dmc-campo" rows="2"></textarea>
              </label>

              <label>
                Obiettivo

                <textarea v-model="png.obiettivo" class="dmc-campo" rows="2"></textarea>
              </label>

              <label>
                Segreto

                <textarea v-model="png.segreto" class="dmc-campo" rows="2"></textarea>
              </label>

              <label>
                Informazioni e dialoghi

                <textarea v-model="png.informazioni" class="dmc-campo" rows="3"></textarea>
              </label>

              <label>
                Collegamento al Bestiario (facoltativo)

                <select v-model="png.creaturaId" class="dmc-campo">
                  <option
                    v-if="
                      png.creaturaId &&
                      !pngBestiarioConsultabili.some((c) => c.id === png.creaturaId)
                    "
                    :value="png.creaturaId"
                  >
                    Riferimento non più disponibile ({{ png.creaturaId }})
                  </option>
                  <option value="">Nessuno</option>

                  <option
                    v-for="creatura in pngBestiarioConsultabili"
                    :key="creatura.id"
                    :value="creatura.id"
                  >
                    {{ creatura.nome }}
                  </option>
                </select>
              </label>
            </div>
          </article>
        </div>
      </details>
</template>

<style scoped>
.registro-png {
  padding: 15px 17px;
  color: var(--dmc-cream);
}
.registro-png summary {
  cursor: pointer;
  color: var(--dmc-amber);
  font-weight: 600;
}
.registro-png summary small,
.testo-secondario {
  color: var(--dmc-muted);
}
.registro-png summary small { margin-left: 8px; font-weight: 400; }
.interno-details,
.scheda-secondaria { display: grid; gap: 12px; }
.interno-details { padding-top: 13px; }
.scheda-secondaria {
  padding: 13px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-surface-soft);
}
.nuova-sessione { display: flex; flex-wrap: wrap; align-items: end; gap: 10px; }
.campo-flessibile { flex: 1; min-width: 180px; }
.registro-png label { display: grid; gap: 6px; min-width: 0; color: var(--dmc-muted); font-size: 13px; }
.registro-png .dmc-campo { width: 100%; min-width: 0; box-sizing: border-box; }
.registro-png textarea { resize: vertical; line-height: 1.55; }
.registro-png .dmc-btn { padding: 8px 12px; }
.intestazione,
.azioni { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; }
.azioni { justify-content: flex-start; }
.conferma { border: 1px solid var(--dmc-rust); border-radius: 8px; padding: 12px; display: grid; gap: 8px; }
.conferma .azioni { gap: 10px; }
.griglia-campi { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 11px; }
.griglia-campi label:nth-child(n+5) { grid-column: 1 / -1; }
@media (max-width: 650px) {
  .griglia-campi { grid-template-columns: 1fr; }
  .griglia-campi label { grid-column: 1 / -1; }
}
</style>
