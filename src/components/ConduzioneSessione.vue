<script setup>
import { computed } from 'vue'

const props = defineProps({
  sessioneInConduzione: { type: Object, required: true },
  passoApertoId: { type: [String, Number], default: null },
  schedaSupporto: { type: String, default: null },
  confermaCorrente: { type: String, default: null },
  messaggio: { type: String, default: '' },
  titoloScena: { type: Function, required: true },
  titoloScenaId: { type: Function, required: true },
  scenaVisitata: { type: Function, required: true },
  numeroSceneVisitate: { type: Function, required: true },
  scenaConsultata: { type: Function, required: true },
  indiceConsultato: { type: Function, required: true },
  consultaScena: { type: Function, required: true },
  cambiaScena: { type: Function, required: true },
  impostaScenaCorrente: { type: Function, required: true },
  impostaVisitata: { type: Function, required: true },
  toggleSupporto: { type: Function, required: true },
  elementiScena: { type: Function, required: true },
  mostraStati: { type: Function, required: true },
  attivitaInCorso: { type: Function, required: true },
  pngScena: { type: Function, required: true },
  testoIndizio: { type: Function, required: true },
  totaleNemici: { type: Function, required: true },
  creatureDaCollegare: { type: Function, required: true },
  difficolta: { type: Function, required: true },
  richiediCaricamento: { type: Function, required: true },
  caricaIncontro: { type: Function, required: true },
  nomeCreatura: { type: Function, required: true },
  esciDaConduzione: { type: Function, required: true },
})
const emit = defineEmits(['update:passoApertoId','update:confermaCorrente','aggiorna-resoconto'])
const passoApertoId = computed({
  get: () => props.passoApertoId,
  set: (valore) => emit('update:passoApertoId', valore),
})
const conferma = computed({
  get: () => props.confermaCorrente,
  set: (valore) => emit('update:confermaCorrente', valore),
})
const titoloScena = props.titoloScena
const titoloScenaId = props.titoloScenaId
const scenaVisitata = props.scenaVisitata
const numeroSceneVisitate = props.numeroSceneVisitate
const scenaConsultata = props.scenaConsultata
const indiceConsultato = props.indiceConsultato
const consultaScena = props.consultaScena
const cambiaScena = props.cambiaScena
const impostaScenaCorrente = props.impostaScenaCorrente
const impostaVisitata = props.impostaVisitata
const toggleSupporto = props.toggleSupporto
const elementiScena = props.elementiScena
const mostraStati = props.mostraStati
const attivitaInCorso = props.attivitaInCorso
const pngScena = props.pngScena
const testoIndizio = props.testoIndizio
const totaleNemici = props.totaleNemici
const creatureDaCollegare = props.creatureDaCollegare
const difficolta = props.difficolta
const richiediCaricamento = props.richiediCaricamento
const caricaIncontro = props.caricaIncontro
const nomeCreatura = props.nomeCreatura
const esciDaConduzione = props.esciDaConduzione
const sessioneInConduzione = computed(() => props.sessioneInConduzione)
const schedaSupporto = computed(() => props.schedaSupporto)
const messaggio = computed(() => props.messaggio)
</script>

<template>
  <div class="sessioni-dmc conduzione-dmc">
    <!-- Il nome della sessione è già nell'unica testata della campagna.
         Qui rimangono solo i controlli operativi, senza un secondo titolo. -->
    <div class="stato-sessione" aria-label="Stato della conduzione">
      <div class="stato-sessione__dati">
        <span>
          Scena corrente:
          <strong>
            {{ titoloScenaId(sessioneInConduzione, sessioneInConduzione.scenaAttivaId) }}
          </strong>
        </span>

        <small>
          {{ numeroSceneVisitate(sessioneInConduzione) }}
          / {{ sessioneInConduzione.scene.length }} visitate
        </small>
      </div>

      <button
        type="button"
        class="dmc-btn dmc-btn--secondary stato-sessione__uscita"
        @click="esciDaConduzione"
      >
        Torna alla preparazione
      </button>
    </div>

      <div class="layout-conduzione">
        <!-- NAVIGAZIONE LATERALE -->

        <aside class="colonna-scene dmc-pannello">
          <div class="intestazione">
            <strong>Scene</strong>

            <small>
              {{ sessioneInConduzione.scene.length }}
            </small>
          </div>

          <nav class="elenco-scene" aria-label="Scene della sessione">
            <button
              v-for="(scena, indice) in sessioneInConduzione.scene"
              :key="scena.id"
              type="button"
              class="voce-scena"
              :class="{
                selezionata: scenaConsultata(sessioneInConduzione)?.id === scena.id,
                corrente: sessioneInConduzione.scenaAttivaId === scena.id,
              }"
              :aria-current="
                scenaConsultata(sessioneInConduzione)?.id === scena.id ? 'page' : undefined
              "
              @click="consultaScena(sessioneInConduzione, scena.id)"
            >
              <span>
                {{ indice + 1 }}.
                {{ titoloScena(scena, indice) }}
              </span>

              <small
                v-if="sessioneInConduzione.scenaAttivaId === scena.id"
                class="etichetta in-corso"
              >
                In corso
              </small>

              <small
                v-if="scenaVisitata(sessioneInConduzione, scena.id)"
                class="etichetta visitata"
              >
                Visitata
              </small>
            </button>
          </nav>

          <label class="selettore-mobile">
            Consulta scena

            <select
              class="dmc-campo"
              :value="scenaConsultata(sessioneInConduzione)?.id"
              @change="consultaScena(sessioneInConduzione, $event.target.value)"
            >
              <option
                v-for="(scena, indice) in sessioneInConduzione.scene"
                :key="scena.id"
                :value="scena.id"
              >
                {{ titoloScena(scena, indice) }}
              </option>
            </select>
          </label>
        </aside>

        <!-- SCENA CONSULTATA -->

        <main v-if="scenaConsultata(sessioneInConduzione)" class="scena-in-conduzione">
          <div class="testata-scena">
            <div>
              <small>
                SCENA
                {{ indiceConsultato(sessioneInConduzione) + 1 }}
                DI
                {{ sessioneInConduzione.scene.length }}

                <template v-if="scenaConsultata(sessioneInConduzione).orario">
                  ·
                  {{ scenaConsultata(sessioneInConduzione).orario }}
                </template>
              </small>

              <h3>
                {{
                  titoloScena(
                    scenaConsultata(sessioneInConduzione),
                    indiceConsultato(sessioneInConduzione),
                  )
                }}
              </h3>
            </div>

            <div class="azioni-scena">
              <label class="check-inline">
                <input
                  type="checkbox"
                  :checked="
                    scenaVisitata(sessioneInConduzione, scenaConsultata(sessioneInConduzione).id)
                  "
                  @change="
                    impostaVisitata(
                      sessioneInConduzione,
                      scenaConsultata(sessioneInConduzione).id,
                      $event.target.checked,
                    )
                  "
                />

                Visitata
              </label>

              <button
                type="button"
                class="dmc-btn dmc-btn--secondary"
                :disabled="
                  sessioneInConduzione.scenaAttivaId === scenaConsultata(sessioneInConduzione).id
                "
                @click="
                  impostaScenaCorrente(
                    sessioneInConduzione,
                    scenaConsultata(sessioneInConduzione).id,
                  )
                "
              >
                Imposta come corrente
              </button>
            </div>
          </div>

          <!-- NARRAZIONE -->

          <section class="narrazione dmc-pannello" aria-label="Descrizione narrativa">
            <h4>Da narrare</h4>

            <p class="testo-narrativo">
              {{
                scenaConsultata(sessioneInConduzione).descrizione ||
                'Nessuna descrizione narrativa inserita.'
              }}
            </p>
          </section>

          <!-- GUIDA ALLA CONDUZIONE -->

          <section class="guida dmc-pannello" aria-label="Guida alla conduzione">
            <header class="intestazione">
              <h4>Guida alla conduzione</h4>

              <small>
                {{
                  scenaConsultata(sessioneInConduzione).guida.filter((passo) => passo.completato)
                    .length
                }}
                /
                {{ scenaConsultata(sessioneInConduzione).guida.length }}
                svolti
              </small>
            </header>

            <p v-if="!scenaConsultata(sessioneInConduzione).guida.length" class="testo-secondario">
              Nessun passaggio preparato per questa scena.
            </p>

            <div class="lista-guida">
              <article
                v-for="(passo, indice) in scenaConsultata(sessioneInConduzione).guida"
                :key="passo.id"
                class="passaggio"
                :class="{
                  svolto: passo.completato,
                  aperto: passoApertoId === passo.id,
                }"
              >
                <div class="riga-passaggio">
                  <label class="check-passo">
                    <input
                      type="checkbox"
                      v-model="passo.completato"
                      :aria-label="`Completa passaggio ${indice + 1}`"
                    />

                    <span class="numero">
                      {{ indice + 1 }}
                    </span>

                    <span class="testo-passo">
                      {{ passo.testo || `Passaggio ${indice + 1}` }}
                    </span>
                  </label>

                  <button
                    v-if="passo.narrazione || passo.condizione"
                    type="button"
                    class="dettagli-passo"
                    :aria-expanded="passoApertoId === passo.id"
                    @click="passoApertoId = passoApertoId === passo.id ? null : passo.id"
                  >
                    {{ passoApertoId === passo.id ? 'Chiudi' : 'Leggi' }}
                  </button>
                </div>

                <div
                  v-if="passoApertoId === passo.id && (passo.narrazione || passo.condizione)"
                  class="approfondimento-passo"
                >
                  <p v-if="passo.condizione" class="condizione">
                    <strong>Quando:</strong>
                    {{ passo.condizione }}
                  </p>

                  <p v-if="passo.narrazione" class="testo-narrativo">
                    {{ passo.narrazione }}
                  </p>
                </div>
              </article>
            </div>
          </section>

          <!-- SUPPORTO CONTESTUALE -->

          <section
            v-if="
              scenaConsultata(sessioneInConduzione).indizi.length ||
              pngScena(scenaConsultata(sessioneInConduzione)).length ||
              scenaConsultata(sessioneInConduzione).personaggi ||
              scenaConsultata(sessioneInConduzione).alternativa ||
              scenaConsultata(sessioneInConduzione).note ||
              mostraStati(sessioneInConduzione, scenaConsultata(sessioneInConduzione))
            "
            class="supporto"
            aria-label="Informazioni di supporto"
          >
            <div class="schede-supporto">
              <button
                v-if="scenaConsultata(sessioneInConduzione).indizi.length"
                type="button"
                class="scheda-tab"
                :aria-pressed="schedaSupporto === 'indizi'"
                @click="toggleSupporto('indizi')"
              >
                Indizi ·
                {{ scenaConsultata(sessioneInConduzione).indizi.length }}
              </button>

              <button
                v-if="
                  pngScena(scenaConsultata(sessioneInConduzione)).length ||
                  scenaConsultata(sessioneInConduzione).personaggi
                "
                type="button"
                class="scheda-tab"
                :aria-pressed="schedaSupporto === 'png'"
                @click="toggleSupporto('png')"
              >
                Personaggi
              </button>

              <button
                v-if="scenaConsultata(sessioneInConduzione).alternativa"
                type="button"
                class="scheda-tab"
                :aria-pressed="schedaSupporto === 'alternative'"
                @click="toggleSupporto('alternative')"
              >
                Alternative
              </button>

              <button
                v-if="mostraStati(sessioneInConduzione, scenaConsultata(sessioneInConduzione))"
                type="button"
                class="scheda-tab"
                :aria-pressed="schedaSupporto === 'stati'"
                @click="toggleSupporto('stati')"
              >
                Elementi di scena
              </button>

              <button
                v-if="scenaConsultata(sessioneInConduzione).note"
                type="button"
                class="scheda-tab"
                :aria-pressed="schedaSupporto === 'note'"
                @click="toggleSupporto('note')"
              >
                Note DM
              </button>
            </div>

            <div v-if="schedaSupporto" class="contenuto-supporto dmc-pannello">
              <!-- INDIZI -->

              <ul v-if="schedaSupporto === 'indizi'" class="lista-indizi">
                <li
                  v-for="(indizio, indice) in scenaConsultata(sessioneInConduzione).indizi"
                  :key="indizio?.id || indice"
                >
                  {{ testoIndizio(indizio) }}
                </li>
              </ul>

              <!-- PERSONAGGI -->

              <div v-else-if="schedaSupporto === 'png'" class="elementi-supporto">
                <p v-if="scenaConsultata(sessioneInConduzione).personaggi" class="testo-pre">
                  {{ scenaConsultata(sessioneInConduzione).personaggi }}
                </p>

                <details
                  v-for="png in pngScena(scenaConsultata(sessioneInConduzione))"
                  :key="png.id"
                  class="dettaglio-png"
                >
                  <summary>
                    <strong>{{ png.nome }}</strong>

                    <small v-if="png.ruolo"> · {{ png.ruolo }} </small>
                  </summary>

                  <p v-if="png.personalita">
                    <strong>Personalità:</strong>
                    {{ png.personalita }}
                  </p>

                  <p v-if="png.obiettivo">
                    <strong>Obiettivo:</strong>
                    {{ png.obiettivo }}
                  </p>

                  <p v-if="png.segreto">
                    <strong>Segreto:</strong>
                    {{ png.segreto }}
                  </p>

                  <p v-if="png.informazioni">
                    <strong>Informazioni:</strong>
                    {{ png.informazioni }}
                  </p>
                </details>
              </div>

              <!-- ALTERNATIVE -->

              <p v-else-if="schedaSupporto === 'alternative'" class="testo-pre">
                {{ scenaConsultata(sessioneInConduzione).alternativa }}
              </p>

              <!-- NOTE DEL DM -->

              <p v-else-if="schedaSupporto === 'note'" class="testo-pre">
                {{ scenaConsultata(sessioneInConduzione).note }}
              </p>

              <!-- ELEMENTI INTERATTIVI -->

              <div v-else-if="schedaSupporto === 'stati'" class="elementi-supporto">
                <div
                  v-for="elemento in elementiScena(
                    sessioneInConduzione,
                    scenaConsultata(sessioneInConduzione),
                  )"
                  :key="elemento.id"
                  class="riga-stato"
                >
                  <div>
                    <strong>{{ elemento.nome }}</strong>

                    <p v-if="elemento.effetto">
                      {{ elemento.effetto }}
                    </p>
                  </div>

                  <select
                    v-model="elemento.stato"
                    class="dmc-campo"
                    :aria-label="`Stato di ${elemento.nome}`"
                  >
                    <option value="inattivo">Non attivo</option>

                    <option value="pronto">Disponibile</option>

                    <option value="utilizzato">Utilizzato</option>
                  </select>
                </div>

                <!-- ATTIVITÀ MONITORATA -->

                <div
                  v-if="
                    scenaConsultata(sessioneInConduzione).mostraRituale &&
                    sessioneInConduzione.rituale?.partecipanti?.length
                  "
                  class="monitoraggio"
                >
                  <strong> Attività monitorata </strong>

                  <p v-if="sessioneInConduzione.rituale.descrizione" class="testo-pre">
                    {{ sessioneInConduzione.rituale.descrizione }}
                  </p>

                  <label
                    v-for="partecipante in sessioneInConduzione.rituale.partecipanti"
                    :key="partecipante.id"
                    class="check-inline"
                  >
                    <input
                      type="checkbox"
                      :checked="!partecipante.attivo"
                      @change="partecipante.attivo = !$event.target.checked"
                    />

                    {{ partecipante.nome }}
                    ·
                    {{ partecipante.attivo ? 'Attivo' : 'Interrotto' }}
                  </label>

                  <small>
                    {{
                      attivitaInCorso(sessioneInConduzione)
                        ? 'Attività in corso'
                        : 'Attività conclusa'
                    }}
                  </small>
                </div>
              </div>
            </div>
          </section>

          <!-- INCONTRO -->

          <section
            v-if="
              totaleNemici(scenaConsultata(sessioneInConduzione)) ||
              scenaConsultata(sessioneInConduzione).incontro?.noteBilanciamento
            "
            class="incontro-rapido dmc-pannello"
          >
            <div class="intestazione">
              <div>
                <h4>
                  Incontro
                  {{
                    scenaConsultata(sessioneInConduzione).incontro?.opzionale ? '· facoltativo' : ''
                  }}
                </h4>

                <small>
                  {{ totaleNemici(scenaConsultata(sessioneInConduzione)) }}
                  nemici ·

                  {{ difficolta(scenaConsultata(sessioneInConduzione), sessioneInConduzione) }}
                </small>
              </div>

              <button
                type="button"
                class="dmc-btn"
                :disabled="
                  !totaleNemici(scenaConsultata(sessioneInConduzione)) ||
                  creatureDaCollegare(scenaConsultata(sessioneInConduzione)).length > 0
                "
                @click="richiediCaricamento(scenaConsultata(sessioneInConduzione))"
              >
                Carica in Battaglia
              </button>
            </div>

            <p
              v-if="creatureDaCollegare(scenaConsultata(sessioneInConduzione)).length"
              class="attenzione"
            >
              Da collegare:
              {{ creatureDaCollegare(scenaConsultata(sessioneInConduzione)).join(', ') }}
            </p>

            <details class="dettaglio-incontro">
              <summary>Dettagli incontro</summary>

              <p
                v-for="voce in scenaConsultata(sessioneInConduzione).incontro?.nemici || []"
                :key="voce.creaturaId"
              >
                {{ nomeCreatura(voce) }}
                ×
                {{ voce.quantita }}
              </p>

              <p
                v-if="scenaConsultata(sessioneInConduzione).incontro?.noteBilanciamento"
                class="testo-pre"
              >
                {{ scenaConsultata(sessioneInConduzione).incontro.noteBilanciamento }}
              </p>
            </details>

            <div
              v-if="conferma === `carica-${scenaConsultata(sessioneInConduzione).id}`"
              class="conferma"
            >
              <p>
                Avviare un nuovo combattimento sostituendo i nemici presenti? Il round e le
                iniziative saranno azzerati. I PF e le condizioni dei PG resteranno invariati.
              </p>

              <div class="azioni">
                <button
                  type="button"
                  class="dmc-btn"
                  @click="caricaIncontro(scenaConsultata(sessioneInConduzione))"
                >
                  Conferma
                </button>

                <button type="button" class="dmc-btn dmc-btn--secondary" @click="conferma = null">
                  Annulla
                </button>
              </div>
            </div>
          </section>

          <!-- REGISTRO DELLA SESSIONE -->

          <details class="registro-sessione dmc-pannello">
            <summary>Registro della sessione</summary>

            <label>
              Decisioni, conseguenze e improvvisazioni

              <textarea
                :value="sessioneInConduzione.resoconto" @input="emit('aggiorna-resoconto', $event.target.value)"
                class="dmc-campo"
                rows="4"
              ></textarea>
            </label>
          </details>

          <!-- NAVIGAZIONE IN FONDO ALLA SCENA -->

          <div class="comandi-navigazione">
            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :disabled="indiceConsultato(sessioneInConduzione) <= 0"
              @click="cambiaScena(sessioneInConduzione, -1)"
            >
              ← Precedente
            </button>

            <button
              type="button"
              class="dmc-btn dmc-btn--secondary"
              :disabled="
                indiceConsultato(sessioneInConduzione) >= sessioneInConduzione.scene.length - 1
              "
              @click="cambiaScena(sessioneInConduzione, 1)"
            >
              Successiva →
            </button>
          </div>
        </main>
      </div>

      <p v-if="messaggio" class="messaggio" role="status">
        {{ messaggio }}
      </p>
  </div>
</template>

<style scoped>

.sessioni-dmc {
  display: grid;
  gap: 15px;
  min-width: 0;
  color: var(--dmc-cream);
}

.sessioni-dmc :is(h2, h3, h4, p) {
  margin: 0;
}

.sessioni-dmc :is(h2, h3, h4) {
  color: var(--dmc-amber);
}

.sessioni-dmc small,
.testo-secondario {
  color: var(--dmc-muted);
}

.intestazione,
.azioni {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.azioni {
  justify-content: flex-start;
}

.sessioni-dmc label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--dmc-muted);
  font-size: 13px;
}

.sessioni-dmc .dmc-campo {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.sessioni-dmc textarea {
  resize: vertical;
  line-height: 1.55;
}

.sessioni-dmc .check-inline,
.sessioni-dmc .check-passo {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: pointer;
}

.sessioni-dmc input[type='checkbox'] {
  width: 17px;
  height: 17px;
  flex: 0 0 17px;
  margin: 0;
  accent-color: var(--dmc-amber);
}

.sessioni-dmc .dmc-btn {
  padding: 8px 12px;
}

.campo-flessibile {
  flex: 1;
  min-width: 180px;
}

.testo-pre,
.testo-narrativo {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  line-height: 1.7;
}

.testo-narrativo {
  color: var(--dmc-cream);
  font-size: 16px;
}

.attenzione {
  color: var(--dmc-rust-text);
}

.conferma {
  border: 1px solid var(--dmc-rust);
  border-radius: 8px;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.conferma p {
  margin: 0;
}

.messaggio {
  padding: 10px 12px;
  color: var(--dmc-amber);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
}

/* ==========================================
   CONDUZIONE
========================================== */

/* Contesto della sessione nell'intestazione CampagnaView.
   Qui mostriamo solo scena corrente, avanzamento e azione di ritorno. */
.stato-sessione {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px 14px;
  padding: 5px 8px 9px;
  border-bottom: 1px solid var(--dmc-border-soft);
  font-size: 13px;
}

.stato-sessione__dati {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 14px;
  min-width: 0;
}

.stato-sessione__dati span {
  overflow-wrap: anywhere;
}

.stato-sessione strong {
  color: var(--dmc-amber);
}

.stato-sessione__uscita {
  min-height: 38px;
  padding: 7px 11px;
  font-size: 12px;
}

@media (max-width: 650px) {
  .stato-sessione {
    align-items: flex-start;
  }
  .stato-sessione__uscita {
    min-height: 40px;
  }
}

.layout-conduzione {
  display: grid;
  grid-template-columns:
    minmax(190px, 246px)
    minmax(0, 1fr);
  align-items: start;
  gap: 14px;
}

/* BARRA LATERALE */

.colonna-scene {
  position: sticky;
  top: 12px;
  padding: 13px;
  max-height: 74vh;
  overflow-y: auto;
  display: grid;
  gap: 12px;
}

.elenco-scene {
  display: grid;
  gap: 6px;
}

.voce-scena {
  display: grid;
  justify-items: start;
  gap: 5px;
  width: 100%;
  padding: 11px;
  text-align: left;
  color: var(--dmc-cream);
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  cursor: pointer;
  font: inherit;
}

.voce-scena.selezionata {
  background: var(--dmc-surface-raised);
  border-color: var(--dmc-amber);
}

.voce-scena.corrente {
  box-shadow: inset 3px 0 var(--dmc-amber);
}

.etichetta {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
}

.etichetta.in-corso {
  background: var(--dmc-amber);
  color: var(--dmc-ink);
}

.etichetta.visitata {
  background: #315746;
  color: #d4ebd8;
}

.selettore-mobile {
  display: none !important;
}

/* STRUTTURA DELLA SCENA */

.scena-in-conduzione {
  display: grid;
  gap: 12px;
  min-width: 0;
}

.testata-scena {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 2px 0 6px;
}

.testata-scena h3 {
  margin-top: 3px;
  font-size: clamp(20px, 2.5vw, 27px);
}

.azioni-scena {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* NARRAZIONE */

.narrazione {
  padding: 17px 20px;
  --dmc-panel-bg: #282724;
}

.narrazione h4,
.guida h4 {
  margin-bottom: 8px;
}

/* GUIDA ALLA CONDUZIONE */

.guida {
  padding: 15px 18px;
}

.lista-guida {
  display: grid;
  gap: 6px;
}

.passaggio {
  background: var(--dmc-surface-soft);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 7px;
  overflow: hidden;
}

.passaggio.aperto {
  border-color: var(--dmc-amber);
}

.passaggio.svolto .testo-passo {
  opacity: 0.65;
  text-decoration: line-through;
}

.riga-passaggio {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 10px 11px;
}

.check-passo {
  flex: 1;
  min-width: 0;
  line-height: 1.4;
}

.numero {
  width: 23px;
  flex: 0 0 23px;
  font-size: 12px;
  color: var(--dmc-muted);
}

.testo-passo {
  min-width: 0;
  color: var(--dmc-cream);
  overflow-wrap: anywhere;
}

.dettagli-passo {
  padding: 6px 10px;
  font: inherit;
  font-size: 12px;
  color: var(--dmc-amber);
  background: transparent;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 6px;
  cursor: pointer;
}

.approfondimento-passo {
  display: grid;
  gap: 9px;
  padding: 11px 14px 15px 53px;
  border-top: 1px solid var(--dmc-border-soft);
}

.condizione {
  color: var(--dmc-muted);
  font-size: 13px;
}

/* SUPPORTO CONTESTUALE */

.supporto {
  display: grid;
  gap: 8px;
}

.schede-supporto {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.scheda-tab {
  font: inherit;
  font-size: 13px;
  padding: 8px 11px;
  border: 1px solid var(--dmc-border-soft);
  background: var(--dmc-surface);
  color: var(--dmc-cream);
  border-radius: 7px;
  cursor: pointer;
}

.scheda-tab[aria-pressed='true'] {
  border-color: var(--dmc-amber);
  background: var(--dmc-surface-raised);
  color: var(--dmc-amber);
}

.contenuto-supporto {
  padding: 13px 16px;
}

.lista-indizi {
  margin: 0;
  padding-left: 20px;
  display: grid;
  gap: 8px;
  line-height: 1.55;
}

.elementi-supporto {
  display: grid;
  gap: 10px;
}

.dettaglio-png,
.dettaglio-incontro {
  border-top: 1px solid var(--dmc-border-soft);
  padding: 8px 0 2px;
}

.dettaglio-png summary,
.dettaglio-incontro summary {
  color: var(--dmc-amber);
  cursor: pointer;
}

.dettaglio-png p {
  margin-top: 7px;
}

.riga-stato {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}

.riga-stato > div {
  flex: 1;
  min-width: 160px;
}

.riga-stato .dmc-campo {
  max-width: 180px;
}

.monitoraggio {
  display: grid;
  gap: 9px;
  border-top: 1px solid var(--dmc-border-soft);
  padding-top: 11px;
}

/* INCONTRO E REGISTRO */

.incontro-rapido {
  padding: 13px 16px;
  display: grid;
  gap: 8px;
}

.incontro-rapido .intestazione > div {
  display: grid;
  gap: 5px;
}

.registro-sessione {
  padding: 12px 15px;
}

.registro-sessione summary {
  cursor: pointer;
  color: var(--dmc-amber);
  font-weight: 600;
}

.registro-sessione label {
  margin-top: 12px;
}

.comandi-navigazione {
  display: flex;
  justify-content: space-between;
  gap: 9px;
}



/* La navigazione delle scene passa a selettore su schermi stretti. */
@media (max-width: 900px) {
  .layout-conduzione {
    grid-template-columns: 1fr;
  }
  .colonna-scene {
    position: static;
    max-height: none;
  }
  .elenco-scene {
    display: none;
  }
  .selettore-mobile {
    display: grid !important;
  }
}
@media (max-width: 650px) {
  .approfondimento-passo {
    padding-left: 15px;
  }
  .riga-stato .dmc-campo {
    max-width: unset;
  }
}
</style>
