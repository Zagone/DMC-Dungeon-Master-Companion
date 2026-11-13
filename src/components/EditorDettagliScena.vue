<script setup>
import { computed } from 'vue'
import { idUnivoco } from '../stato/statoDatiCampagna.js'

const props = defineProps({
  modelloScena: { type: Object, required: true },
  sessione: { type: Object, required: true },
  dati: { type: Object, required: true },
  creatureDisponibili: { type: Array, required: true },
  difficolta: { type: Function, required: true },
  totaleNemici: { type: Function, required: true },
  creatureDaCollegare: { type: Function, required: true },
  nomeCreatura: { type: Function, required: true },
  aggiungiCreatura: { type: Function, required: true },
  ricerca: { type: String, default: '' },
  selezioneCreatura: { type: String, default: '' },
  quantita: { type: Number, default: 1 },
})
const emit = defineEmits(['aggiorna-scena', 'update:ricerca', 'update:selezioneCreatura', 'update:quantita'])
const scena = computed(() => props.modelloScena)
const ricercaCreatura = computed({ get: () => props.ricerca, set: valore => emit('update:ricerca', valore) })
const creaturaSelezionataId = computed({ get: () => props.selezioneCreatura, set: valore => emit('update:selezioneCreatura', valore) })
const quantitaCreatura = computed({ get: () => props.quantita, set: valore => emit('update:quantita', valore) })

function aggiornaCampo(campo, valore) {
  emit('aggiorna-scena', { campo, valore })
}
function aggiornaPNG(id, presente) {
  const lista = [...(scena.value.pngIds || [])]
  const indice = lista.indexOf(id)
  if (presente && indice < 0) lista.push(id)
  if (!presente && indice >= 0) lista.splice(indice, 1)
  aggiornaCampo('pngIds', lista)
}
function aggiungi(lista, valori) {
  lista.push({ id: idUnivoco(), ...valori })
}
function rimuovi(lista, id) {
  const indice = lista.findIndex(voce => voce.id === id)
  if (indice >= 0) lista.splice(indice, 1)
}
function sposta(lista, indice, direzione) {
  const destinazione = indice + direzione
  if (destinazione < 0 || destinazione >= lista.length) return
  const [voce] = lista.splice(indice, 1)
  lista.splice(destinazione, 0, voce)
}
</script>

<template>
              <div class="editor-scena">
                <div class="griglia-campi">
                  <label>
                    Titolo

                    <input :value="scena.titolo" @input="aggiornaCampo('titolo', $event.target.value)" class="dmc-campo" />
                  </label>

                  <label>
                    Orario indicativo (facoltativo)

                    <input :value="scena.orario" @input="aggiornaCampo('orario', $event.target.value)" class="dmc-campo" placeholder="Es. 0:25–0:50" />
                  </label>
                </div>

                <label>
                  Descrizione narrativa

                  <textarea
                    :value="scena.descrizione" @input="aggiornaCampo('descrizione', $event.target.value)"
                    class="dmc-campo"
                    rows="5"
                    placeholder="Ciò che il DM può leggere o parafrasare ai giocatori."
                  ></textarea>
                </label>

                <!-- GUIDA UNIFICATA -->

                <section class="editor-guida">
                  <header class="intestazione">
                    <h4>Guida alla conduzione</h4>

                    <button
                      type="button"
                      class="dmc-btn"
                      @click="
                        aggiungi(scena.guida, {
                          testo: '',
                          condizione: '',
                          narrazione: '',
                          completato: false,
                        })
                      "
                    >
                      + Passaggio
                    </button>
                  </header>

                  <p class="testo-secondario">
                    Ordina le attività come vuoi affrontarle. Un passaggio può avere un testo da
                    narrare e una condizione, senza creare una sezione separata.
                  </p>

                  <div
                    v-for="(passo, indicePasso) in scena.guida"
                    :key="passo.id"
                    class="riga-guida-editor"
                  >
                    <div class="riga-editor">
                      <label class="campo-flessibile">
                        Passaggio {{ indicePasso + 1 }}

                        <input v-model="passo.testo" class="dmc-campo" />
                      </label>

                      <button
                        type="button"
                        class="dmc-btn dmc-btn--secondary"
                        :disabled="indicePasso === 0"
                        @click="sposta(scena.guida, indicePasso, -1)"
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        class="dmc-btn dmc-btn--secondary"
                        :disabled="indicePasso === scena.guida.length - 1"
                        @click="sposta(scena.guida, indicePasso, 1)"
                      >
                        ↓
                      </button>

                      <button
                        type="button"
                        class="dmc-btn dmc-btn--danger"
                        @click="rimuovi(scena.guida, passo.id)"
                      >
                        ×
                      </button>
                    </div>

                    <details class="dettagli-editor">
                      <summary>Condizione e narrazione (facoltative)</summary>

                      <div class="interno-details">
                        <label>
                          Quando attivarlo

                          <input v-model="passo.condizione" class="dmc-campo" />
                        </label>

                        <label>
                          Testo da leggere

                          <textarea
                            v-model="passo.narrazione"
                            class="dmc-campo"
                            rows="3"
                          ></textarea>
                        </label>

                        <label class="check-inline">
                          <input type="checkbox" v-model="passo.completato" />

                          Già svolto
                        </label>
                      </div>
                    </details>
                  </div>
                </section>

                <!-- INDIZI E INFORMAZIONI -->

                <details class="editor-espandibile">
                  <summary>Indizi e informazioni</summary>

                  <div class="interno-details">
                    <button
                      type="button"
                      class="dmc-btn dmc-btn--secondary"
                      @click="
                        aggiungi(scena.indizi, {
                          testo: '',
                          rivelato: false,
                        })
                      "
                    >
                      + Indizio
                    </button>

                    <div v-for="indizio in scena.indizi" :key="indizio.id" class="riga-editor">
                      <label class="campo-flessibile">
                        Indizio

                        <input v-model="indizio.testo" class="dmc-campo" />
                      </label>

                      <button
                        type="button"
                        class="dmc-btn dmc-btn--danger"
                        @click="rimuovi(scena.indizi, indizio.id)"
                      >
                        ×
                      </button>
                    </div>

                    <label>
                      Alternativa narrativa

                      <textarea :value="scena.alternativa" @input="aggiornaCampo('alternativa', $event.target.value)" class="dmc-campo" rows="3"></textarea>
                    </label>

                    <label>
                      Informazioni su personaggi e incontri

                      <textarea :value="scena.personaggi" @input="aggiornaCampo('personaggi', $event.target.value)" class="dmc-campo" rows="2"></textarea>
                    </label>

                    <label>
                      Altri appunti del DM

                      <textarea :value="scena.note" @input="aggiornaCampo('note', $event.target.value)" class="dmc-campo" rows="3"></textarea>
                    </label>
                  </div>
                </details>

                <!-- PNG PRESENTI -->

                <details class="editor-espandibile">
                  <summary>PNG presenti</summary>

                  <div class="interno-details">
                    <p v-if="!dati?.pngNarrativi?.length" class="testo-secondario">
                      Crea prima i PNG nel registro della campagna.
                    </p>

                    <label
                      v-for="png in dati?.pngNarrativi || []"
                      :key="png.id"
                      class="check-inline"
                    >
                      <input type="checkbox" :checked="scena.pngIds.includes(png.id)" @change="aggiornaPNG(png.id, $event.target.checked)" :value="png.id" />

                      {{ png.nome }}
                    </label>
                  </div>
                </details>

                <!-- ATTIVITÀ MONITORATA -->

                <details v-if="sessione.rituale?.partecipanti?.length" class="editor-espandibile">
                  <summary>Attività monitorata in questa scena</summary>

                  <div class="interno-details">
                    <label class="check-inline">
                      <input type="checkbox" :checked="scena.mostraRituale" @change="aggiornaCampo('mostraRituale', $event.target.checked)" />

                      Rendi visibile l'attività nella Conduzione
                    </label>
                  </div>
                </details>

                <!-- INCONTRO -->

                <details class="editor-espandibile">
                  <summary>
                    Incontro ·
                    {{ totaleNemici(scena) }}
                    nemici
                  </summary>

                  <div class="interno-details">
                    <label class="check-inline">
                      <input type="checkbox" v-model="scena.incontro.opzionale" />

                      Incontro facoltativo
                    </label>

                    <p class="testo-secondario">
                      {{ difficolta(scena, sessione) }}
                    </p>

                    <label>
                      Indicazioni per il DM

                      <textarea
                        v-model="scena.incontro.noteBilanciamento"
                        class="dmc-campo"
                        rows="2"
                      ></textarea>
                    </label>

                    <p v-if="creatureDaCollegare(scena).length" class="testo-secondario">
                      Suggerimento del copione (facoltativo):
                      {{ creatureDaCollegare(scena).join(', ') }}.
                      Puoi caricare in Battaglia i nemici collegati anche senza seguire questo suggerimento.
                    </p>

                    <label>
                      Ricerca nel Bestiario

                      <input
                        v-model="ricercaCreatura"
                        class="dmc-campo"
                        placeholder="Cerca creatura"
                      />
                    </label>

                    <div class="composizione-incontro">
                      <label>
                        Creatura

                        <select v-model="creaturaSelezionataId" class="dmc-campo">
                          <option value="">Seleziona</option>

                          <option
                            v-for="creatura in creatureDisponibili"
                            :key="creatura.id"
                            :value="creatura.id"
                          >
                            {{ creatura.nome }}
                            · CA {{ creatura.ca }} · {{ creatura.pfMax }} PF
                          </option>
                        </select>
                      </label>

                      <label>
                        Quantità

                        <input
                          v-model.number="quantitaCreatura"
                          class="dmc-campo"
                          type="number"
                          min="1"
                          max="30"
                        />
                      </label>

                      <button
                        type="button"
                        class="dmc-btn"
                        :disabled="!creaturaSelezionataId"
                        @click="aggiungiCreatura(scena)"
                      >
                        Aggiungi
                      </button>
                    </div>

                    <div
                      v-for="voce in scena.incontro.nemici"
                      :key="voce.creaturaId"
                      class="riga-editor"
                    >
                      <strong class="campo-flessibile">
                        {{ nomeCreatura(voce) }}
                      </strong>

                      <label>
                        Quantità

                        <input
                          v-model.number="voce.quantita"
                          class="dmc-campo"
                          type="number"
                          min="1"
                          max="30"
                        />
                      </label>

                      <label>
                        PF (facoltativi)

                        <input
                          v-model.number="voce.pfIncontro"
                          class="dmc-campo"
                          type="number"
                          min="1"
                          max="999"
                          placeholder="PF base"
                        />
                      </label>

                      <button
                        type="button"
                        class="dmc-btn dmc-btn--danger"
                        @click="
                          scena.incontro.nemici = scena.incontro.nemici.filter(
                            (elemento) => elemento.creaturaId !== voce.creaturaId,
                          )
                        "
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </details>
              </div>
</template>

<style scoped>
.editor-scena { display: grid; gap: 12px; min-width: 0; border-top: 1px solid var(--dmc-border-soft); padding-top: 12px; color: var(--dmc-cream); }
.editor-scena :is(h3,h4,p) { margin: 0; }
.editor-scena :is(h3,h4) { color: var(--dmc-amber); }
.editor-scena label { display: grid; gap: 6px; min-width: 0; color: var(--dmc-muted); font-size: 13px; }
.editor-scena .dmc-campo { width: 100%; min-width: 0; box-sizing: border-box; }
.editor-scena textarea { resize: vertical; line-height: 1.55; }
.editor-scena .dmc-btn { padding: 8px 12px; }
.editor-scena input[type='checkbox'] { width: 17px; height: 17px; flex: 0 0 17px; margin: 0; accent-color: var(--dmc-amber); }
.editor-scena .check-inline { display: flex; align-items: center; gap: 9px; cursor: pointer; }
.editor-espandibile, .editor-guida { padding: 13px; border: 1px solid var(--dmc-border-soft); border-radius: 8px; background: var(--dmc-surface-soft); }
.editor-guida { display: grid; gap: 12px; }
.editor-espandibile summary { cursor: pointer; color: var(--dmc-amber); font-weight: 600; }
.interno-details { display: grid; gap: 12px; padding-top: 13px; }
.griglia-campi { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 11px; }
.griglia-campi label:nth-child(n+5) { grid-column: 1 / -1; }
.intestazione, .azioni, .riga-editor { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; }
.intestazione, .azioni { justify-content: space-between; }
.azioni { justify-content: flex-start; }
.riga-editor { align-items: end; }
.campo-flessibile { flex: 1; min-width: 180px; }
.riga-guida-editor { display: grid; gap: 6px; padding: 9px; border: 1px solid var(--dmc-border-soft); border-radius: 7px; }
.riga-guida-editor .riga-editor { align-items: end; }
.dettagli-editor summary { cursor: pointer; font-size: 13px; color: var(--dmc-muted); }
.collegamenti { display: grid; gap: 8px; border: 1px solid var(--dmc-border-soft); border-radius: 6px; }
.collegamenti legend { color: var(--dmc-amber); }
.composizione-incontro { display: grid; grid-template-columns: minmax(0,1fr) 90px auto; align-items: end; gap: 9px; }
.testo-secondario { color: var(--dmc-muted); }
.attenzione { color: var(--dmc-rust-text); }
@media (max-width:650px) {
 .griglia-campi {grid-template-columns:1fr;}
 .griglia-campi label {grid-column:1 / -1;}
 .composizione-incontro {grid-template-columns:minmax(0,1fr) 75px;}
 .composizione-incontro > button {grid-column:1 / -1;}
}
</style>
