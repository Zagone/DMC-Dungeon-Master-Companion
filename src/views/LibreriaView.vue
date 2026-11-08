
<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { usaModale } from '../stato/usaModale.js'

import GestioneArchivioDMC from '../components/GestioneArchivioDMC.vue'

import {
  campagneOrdinate,
  creaCampagna,
} from '../stato/statoCampagne.js'

const router = useRouter()

const creazioneAperta = ref(false)
const modaleCreazione = ref(null)
const nomeNuovaCampagna = ref('')
const errore = ref('')

usaModale(
  creazioneAperta,
  modaleCreazione,
  chiudiCreazione
)

function statoTesto(stato) {
  const etichette = {
    preparazione: 'In preparazione',
    'in-corso': 'In corso',
    conclusa: 'Conclusa',
  }

  return etichette[stato] || 'In preparazione'
}

function dataIt(valore) {
  if (!valore) return '—'

  const data = new Date(valore)

  return Number.isNaN(data.getTime())
    ? '—'
    : data.toLocaleDateString('it-IT')
}

function tornaDashboard() {
  router.push({ name: 'dashboard' })
}

function apriCampagna(id) {
  router.push({
    name: 'campagna',
    params: { id },
  })
}

function apriCreazione() {
  nomeNuovaCampagna.value = ''
  errore.value = ''
  creazioneAperta.value = true
}

function chiudiCreazione() {
  creazioneAperta.value = false
  nomeNuovaCampagna.value = ''
  errore.value = ''
}

function nuovaCampagna() {
  errore.value = ''

  const risultato = creaCampagna({
    nome: nomeNuovaCampagna.value,
    descrizione: '',
  })

  if (!risultato.successo) {
    errore.value =
      risultato.messaggio ||
      'Impossibile creare la campagna.'
    return
  }

  chiudiCreazione()
  apriCampagna(risultato.campagna.id)
}
</script>

<template>
  <div class="dmc dmc-pagina libreria-view">
    <main class="lv-main dmc-contenitore">
      <section class="lv-intestazione">
        <div class="lv-intro">
          <button
            type="button"
            class="lv-indietro"
            @click="tornaDashboard"
          >
            ← Torna alla dashboard
          </button>

          <span class="lv-sopratitolo">
            LE TUE AVVENTURE
          </span>

          <h1>Le mie campagne</h1>

          <p>
            Tutti i mondi che hai creato e custodito.
          </p>
        </div>

        <button
          type="button"
          class="lv-bottone-principale dmc-btn"
          @click="apriCreazione"
        >
          + Nuova campagna
        </button>
      </section>

      <section
        class="lv-campagne"
        aria-label="Elenco campagne"
      >
        <div
          v-if="!campagneOrdinate.length"
          class="lv-vuoto dmc-pannello"
        >
          <strong>La tua libreria è vuota.</strong>

          <p>
            Crea la prima campagna per iniziare
            a costruire la tua avventura.
          </p>

          <button
            type="button"
            class="lv-bottone-principale dmc-btn"
            @click="apriCreazione"
          >
            Crea la prima campagna
          </button>
        </div>

        <div v-else class="lv-griglia">
          <button
            v-for="campagna in campagneOrdinate"
            :key="campagna.id"
            type="button"
            class="lv-card dmc-pannello dmc-pannello--rilievo dmc-carta"
            @click="apriCampagna(campagna.id)"
          >
            <span class="lv-stato">
              <span
                class="lv-pallino"
                aria-hidden="true"
              ></span>

              {{ statoTesto(campagna.stato) }}
            </span>

            <strong class="lv-nome">
              {{ campagna.nome }}
            </strong>

            <span class="lv-descrizione">
              {{
                campagna.descrizione ||
                'Nessuna descrizione inserita.'
              }}
            </span>

            <span class="lv-card-piede">
              <small>
                {{ dataIt(campagna.modificataIl) }}
              </small>

              <span>Apri →</span>
            </span>
          </button>
        </div>
      </section>

      <GestioneArchivioDMC />
    </main>

    <footer class="lv-footer dmc-contenitore">
      DMC · Dungeon Master Companion ·
      Versione di sviluppo
    </footer>

    <div
      v-if="creazioneAperta"
      class="lv-overlay dmc-overlay"
      @click.self="chiudiCreazione"
    >
      <form
        ref="modaleCreazione"
        class="lv-modale dmc-modale"
        role="dialog"
        aria-modal="true"
        aria-labelledby="lv-titolo-modale"
        aria-describedby="lv-descrizione-modale"
        tabindex="-1"
        @submit.prevent="nuovaCampagna"
      >
        <h2 id="lv-titolo-modale">
          Nuova campagna
        </h2>

        <p id="lv-descrizione-modale">
          È sufficiente un nome.
          Gli strumenti partiranno vuoti.
        </p>

        <p
          v-if="errore"
          class="lv-errore"
          role="alert"
        >
          {{ errore }}
        </p>

        <label class="lv-etichetta">
          Nome della campagna

          <input class="dmc-campo"
            v-model="nomeNuovaCampagna"
            type="text"
            maxlength="100"
            required
            data-focus-iniziale
            placeholder="Es. Le Ombre di Valdora"
          />
        </label>

        <div class="lv-azioni dmc-azioni">
          <button
            type="submit"
            class="lv-bottone-principale dmc-btn"
          >
            Crea campagna
          </button>

          <button
            type="button"
            class="lv-bottone-secondario dmc-btn dmc-btn--secondary"
            @click="chiudiCreazione"
          >
            Annulla
          </button>
        </div>
      </form>
    </div>
  </div>
</template>


<style scoped>
/*
 * DMC — Libreria delle campagne
 * UI.2 — Rifinitura visiva
 *
 * Top bar e logo: App.vue
 * Colori e componenti: design-system.css
 */

.libreria-view {
  padding-bottom: var(--dmc-space-5);
}

/* STRUTTURA */

.lv-main {
  display: grid;
  gap: var(--dmc-space-5);
  padding-top: var(--dmc-space-6);
}

/* INTESTAZIONE */

.lv-intestazione {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--dmc-space-5);
  padding-bottom: var(--dmc-space-4);
  border-bottom: 1px solid var(--dmc-border-soft);
}

.lv-intro {
  display: grid;
  justify-items: start;
  gap: 9px;
  min-width: 0;
}

.lv-indietro {
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: var(--dmc-amber-light);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.lv-indietro:hover {
  text-decoration: underline;
}

.lv-sopratitolo {
  margin-top: var(--dmc-space-2);
  color: var(--dmc-amber-light);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  line-height: 1.4;
}

.lv-intro h1 {
  margin: 0;
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: clamp(30px, 4vw, 43px);
  font-weight: 850;
  line-height: 1.12;
  letter-spacing: -0.035em;
  overflow-wrap: anywhere;
}

.lv-intro p {
  max-width: 650px;
  margin: 0;
  color: var(--dmc-muted-light);
  font-size: 14px;
  line-height: 1.6;
}

/* AZIONE PRINCIPALE */

.lv-bottone-principale,
.lv-bottone-secondario {
  cursor: pointer;
}

.lv-bottone-principale:hover:not(:disabled),
.lv-bottone-secondario:hover:not(:disabled) {
  filter: brightness(1.07);
}

/* ELENCO DELLE CAMPAGNE */

.lv-griglia {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 15px;
}

.lv-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: var(--dmc-space-3);

  width: 100%;
  min-width: 0;
  min-height: 174px;
  padding: 17px;

  appearance: none;
  color: var(--dmc-cream);
  text-align: left;
  cursor: pointer;

  transition:
    transform var(--dmc-transition),
    border-color var(--dmc-transition),
    background-color var(--dmc-transition),
    box-shadow var(--dmc-transition);
}

.lv-card:hover {
  transform: translateY(-3px);
}

.lv-card:active {
  transform: translateY(1px);
}

/* STATO DELLA CAMPAGNA */

.lv-stato {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 7px;

  max-width: 100%;
  padding: 5px 8px;

  border: 1px solid var(--dmc-border-soft);
  border-radius: var(--dmc-radius-xs);

  background: var(--dmc-ink);
  color: var(--dmc-amber-light);

  font-size: 11px;
  font-weight: 750;
  line-height: 1.25;
}

.lv-pallino {
  display: inline-block;
  flex: 0 0 7px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--dmc-moss);
}

/* CONTENUTO DELLA SCHEDA */

.lv-nome {
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: 21px;
  font-weight: 850;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.lv-descrizione {
  flex: 1;
  color: var(--dmc-muted-light);
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

/* PIEDE DELLA SCHEDA */

.lv-card-piede {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;

  padding-top: var(--dmc-space-3);
  border-top: 1px solid var(--dmc-border-soft);
}

.lv-card-piede small {
  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.4;
}

.lv-card-piede span {
  flex-shrink: 0;
  color: var(--dmc-amber-light);
  font-size: 12px;
  font-weight: 850;
  line-height: 1.4;
}

/* STATO VUOTO */

.lv-vuoto {
  display: grid;
  justify-items: start;
  gap: var(--dmc-space-3);

  padding: var(--dmc-space-6);
}

.lv-vuoto strong {
  color: var(--dmc-cream);
  font-family: var(--dmc-font-display);
  font-size: 20px;
}

.lv-vuoto p {
  max-width: 470px;
  margin: 0;
  color: var(--dmc-muted-light);
  font-size: 14px;
  line-height: 1.6;
}

/* MODALE DI CREAZIONE */

.lv-modale {
  width: min(560px, 100%);
  padding: var(--dmc-space-5);
}

.lv-modale h2 {
  font-family: var(--dmc-font-display);
  font-size: 24px;
  line-height: 1.25;
}

.lv-modale p {
  font-size: 13px;
  line-height: 1.6;
}

.lv-etichetta {
  gap: var(--dmc-space-2);
  font-weight: 700;
}

.lv-etichetta input {
  min-height: 44px;
  padding: 10px var(--dmc-space-3);
  border-radius: var(--dmc-radius-xs);
}

.lv-modale .lv-errore {
  padding: 10px 12px;
  border: 1px solid var(--dmc-rust);
  border-radius: var(--dmc-radius-xs);
  color: var(--dmc-rust);
}

/* ACCESSIBILITÀ */

.lv-card:focus-visible,
.lv-indietro:focus-visible,
.lv-bottone-principale:focus-visible,
.lv-bottone-secondario:focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* FOOTER */

.lv-footer {
  margin-top: 32px;
  padding-top: var(--dmc-space-5);
  border-top: 1px solid var(--dmc-border-soft);

  color: var(--dmc-muted-light);
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}

/* RESPONSIVE */

@media (max-width: 900px) {
  .lv-griglia {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 620px) {
  .lv-main {
    gap: var(--dmc-space-4);
    padding-top: var(--dmc-space-5);
  }

  .lv-intestazione {
    align-items: stretch;
    gap: var(--dmc-space-4);
  }

  .lv-intro h1 {
    font-size: clamp(28px, 8vw, 36px);
  }

  .lv-griglia {
    grid-template-columns: minmax(0, 1fr);
    gap: var(--dmc-space-3);
  }

  .lv-card {
    min-height: 155px;
    padding: 15px;
  }

  .lv-nome {
    font-size: 19px;
  }

  .lv-vuoto {
    padding: var(--dmc-space-5);
  }

  .lv-modale {
    padding: var(--dmc-space-4);
  }

  .lv-footer {
    margin-top: 25px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lv-card {
    transition: none;
  }
}
</style>

