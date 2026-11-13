<script setup>
import { computed } from 'vue'
import { chiaviCaratteristiche, gruppiRegole, azioniDellaScheda } from '../dati/modelloCreatura.js'

const props = defineProps({
  creatura: {
    type: Object,
    required: true,
  },
  combattimento: {
    type: Boolean,
    default: false,
  },
})

const nomiCaratteristiche = {
  for: 'FOR',
  des: 'DES',
  cos: 'COS',
  int: 'INT',
  sag: 'SAG',
  car: 'CAR',
}

const campiMovimento = [
  ['velocita', 'Velocità'],
  ['sensi', 'Sensi'],
  ['lingue', 'Linguaggi'],
]

const campiDifese = [
  ['resistenze', 'Resistenze ai danni'],
  ['vulnerabilita', 'Vulnerabilità ai danni'],
  ['immunita', 'Immunità ai danni'],
  ['immunitaCondizioni', 'Immunità alle condizioni'],
]

function valore(dato) {
  if (dato === null || dato === undefined || dato === '') {
    return '—'
  }

  return dato
}

function segno(dato) {
  if (dato === null || dato === undefined || dato === '') {
    return '—'
  }

  const numero = Number(dato)

  if (!Number.isFinite(numero)) {
    return '—'
  }

  return numero >= 0 ? `+${numero}` : String(numero)
}

function testo(dato) {
  if (Array.isArray(dato)) {
    return dato.join('; ')
  }

  return dato ?? ''
}

function assenza(campo) {
  return props.creatura.presenzaCampi?.[campo] === 'assente_nella_scheda'
    ? 'Non presente nella scheda SRD'
    : 'Non indicato'
}

function gruppo(campo) {
  return campo === 'azioni' ? azioniDellaScheda(props.creatura) : props.creatura[campo] || []
}

const tassonomia = computed(() => {
  const c = props.creatura

  if (c.categoria === 'srd' && c.tassonomiaOriginale) {
    return c.tassonomiaOriginale
  }

  const taglia = c.taglie?.length ? c.taglie.join(' o ') : c.taglia

  return [c.tipo, taglia, c.allineamento].filter(Boolean).join(' · ')
})

const iniziativa = computed(() =>
  props.combattimento ? props.creatura.bonusIniziativa : props.creatura.iniziativa,
)

const statistiche = computed(() => [
  {
    id: 'ca',
    nome: 'Classe Armatura',
    sigla: 'CA',
    valore: valore(props.creatura.ca),
    dettaglio: '',
  },
  {
    id: 'pf',
    nome: 'Punti Ferita massimi',
    sigla: 'PF',
    valore: valore(props.creatura.pfMax),
    dettaglio: props.creatura.pfFormula || '',
  },
  {
    id: 'iniziativa',
    nome: 'Bonus Iniziativa',
    sigla: 'INI',
    valore: segno(iniziativa.value),
    dettaglio:
      props.creatura.iniziativaPassiva != null ? `Passiva ${props.creatura.iniziativaPassiva}` : '',
  },
  {
    id: 'gs',
    nome: 'Grado di Sfida',
    sigla: 'GS',
    valore: valore(props.creatura.gs),
    dettaglio: '',
  },
  {
    id: 'competenza',
    nome: 'Bonus di Competenza',
    sigla: 'COMP',
    valore: segno(props.creatura.bonusCompetenza),
    dettaglio: '',
  },
  {
    id: 'pe',
    nome: 'Punti Esperienza',
    sigla: 'PE',
    valore: valore(props.creatura.puntiEsperienza),
    dettaglio:
      props.creatura.puntiEsperienzaTana != null
        ? `Nella tana: ${props.creatura.puntiEsperienzaTana}`
        : '',
  },
])

const abilita = computed(() =>
  (props.creatura.abilita || []).map((a) => `${a.nome} ${segno(a.bonus)}`).join('; '),
)

const sezioniRegole = computed(() =>
  gruppiRegole
    .map((configurazione) => ({
      ...configurazione,
      voci: gruppo(configurazione.campo),
    }))
    .filter(
      (sezione) =>
        sezione.voci.length > 0 ||
        (sezione.campo === 'azioniLeggendarie' && props.creatura.regoleAzioniLeggendarie),
    ),
)

function etichetteRegola(regola) {
  const descrizione = String(regola.descrizione || '')

  const risultato = []

  const ricarica = String(regola.nome || '').match(/Ricarica\s*\d(?:\s*[–-]\s*\d)?/i)

  if (ricarica) {
    risultato.push(ricarica[0])
  }

  const cd = descrizione.match(/\bCD\s*\d+\b/i)

  if (cd) {
    risultato.push(cd[0].toUpperCase())
  }

  const colpire = descrizione.match(/[+-]\d+\s*a colpire/i)

  if (colpire) {
    risultato.push(colpire[0])
  }

  return risultato
}

function esistonoDati(campi) {
  return campi.some(([campo]) => {
    const dato = props.creatura[campo]

    return Array.isArray(dato)
      ? dato.length > 0
      : dato !== null && dato !== undefined && dato !== ''
  })
}
</script>

<template>
  <div class="scheda-creatura">
    <!-- IDENTITÀ -->

    <header class="identita">
      <p class="tassonomia">
        {{ tassonomia }}
      </p>

      <p v-if="creatura.sciame" class="dettaglio-sciame">
        Sciame ·
        {{ creatura.sciame.tipoCreature }} · componenti: {{ creatura.sciame.tagliaCreature }}

        <span v-if="creatura.sciame.testoFonte"> · {{ creatura.sciame.testoFonte }} </span>
      </p>
    </header>

    <!-- STATISTICHE PRINCIPALI -->

    <section class="sezione-statistiche" aria-label="Statistiche principali">
      <dl class="riepilogo">
        <div
          v-for="statistica in statistiche"
          :key="statistica.id"
          class="statistica"
          :class="`statistica-${statistica.id}`"
        >
          <dt :title="statistica.nome">
            {{ statistica.sigla }}
          </dt>

          <dd>
            {{ statistica.valore }}
          </dd>

          <dd v-if="statistica.dettaglio" class="dettaglio-statistica">
            {{ statistica.dettaglio }}
          </dd>
        </div>
      </dl>
    </section>

    <!-- CARATTERISTICHE -->

    <section class="sezione-caratteristiche">
      <h4>Caratteristiche</h4>

      <div
        class="tabella-scorribile"
        tabindex="0"
        aria-label="Tabella delle caratteristiche, modificatori e tiri salvezza"
      >
        <table>
          <caption class="sr-only">
            Punteggi, modificatori e tiri salvezza
          </caption>

          <thead>
            <tr>
              <th scope="col">Valore</th>

              <th v-for="chiave in chiaviCaratteristiche" :key="chiave" scope="col">
                {{ nomiCaratteristiche[chiave] }}
              </th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <th scope="row">Punteggio</th>

              <td v-for="chiave in chiaviCaratteristiche" :key="chiave" class="punteggio">
                {{ valore(creatura.caratteristiche?.[chiave]) }}
              </td>
            </tr>

            <tr>
              <th scope="row">MOD</th>

              <td v-for="chiave in chiaviCaratteristiche" :key="chiave">
                {{ segno(creatura.modificatori?.[chiave]) }}
              </td>
            </tr>

            <tr>
              <th scope="row">SALV</th>

              <td v-for="chiave in chiaviCaratteristiche" :key="chiave">
                {{ segno(creatura.tiriSalvezza?.[chiave]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- MOVIMENTO E PERCEZIONE -->

    <section class="sezione-proprieta">
      <h4>Movimento e percezione</h4>

      <dl class="proprieta">
        <template v-for="[campo, titolo] in campiMovimento" :key="campo">
          <dt>{{ titolo }}</dt>

          <dd>
            {{ testo(creatura[campo]) || assenza(campo) }}
          </dd>
        </template>

        <dt>Abilità</dt>

        <dd>
          {{ abilita || assenza('abilita') }}
        </dd>
      </dl>
    </section>

    <!-- DIFESE -->

    <section v-if="esistonoDati(campiDifese)" class="sezione-proprieta">
      <h4>Difese e immunità</h4>

      <dl class="proprieta">
        <template v-for="[campo, titolo] in campiDifese" :key="campo">
          <dt>{{ titolo }}</dt>

          <dd>
            {{ testo(creatura[campo]) || assenza(campo) }}
          </dd>
        </template>
      </dl>
    </section>

    <!-- ALTRI DATI DIFENSIVI -->

    <section v-else class="sezione-proprieta">
      <h4>Difese e immunità</h4>

      <dl class="proprieta">
        <template v-for="[campo, titolo] in campiDifese" :key="campo">
          <dt>{{ titolo }}</dt>

          <dd>
            {{ assenza(campo) }}
          </dd>
        </template>
      </dl>
    </section>

    <!-- EQUIPAGGIAMENTO -->

    <section v-if="creatura.equipaggiamento" class="sezione-proprieta">
      <h4>Equipaggiamento</h4>

      <p class="testo-regola">
        {{ creatura.equipaggiamento }}
      </p>
    </section>

    <div
      v-else-if="creatura.presenzaCampi?.equipaggiamento === 'assente_nella_scheda'"
      class="informazione-assente"
    >
      <strong>Equipaggiamento:</strong>
      {{ assenza('equipaggiamento') }}
    </div>

    <!-- NOTE SULLA FONTE -->

    <aside v-if="creatura.noteFonte?.length" class="note-fonte" aria-label="Note sulla fonte">
      <h4>Note sulla fonte</h4>

      <p v-for="nota in creatura.noteFonte" :key="nota.codice">
        {{ nota.descrizione }}
      </p>
    </aside>

    <!-- CAPACITÀ E AZIONI -->

    <section v-for="sezione in sezioniRegole" :key="sezione.campo" class="gruppo-regole">
      <header class="intestazione-regole">
        <h4>{{ sezione.titolo }}</h4>

        <span class="contatore-regole">
          {{ sezione.voci.length }}
        </span>
      </header>

      <p
        v-if="sezione.campo === 'azioniLeggendarie' && creatura.regoleAzioniLeggendarie"
        class="introduzione-regole"
      >
        {{ creatura.regoleAzioniLeggendarie }}
      </p>

      <article v-for="(regola, indice) in sezione.voci" :key="indice" class="regola">
        <header class="intestazione-regola">
          <h5>
            {{ regola.nome }}
          </h5>

          <div v-if="etichetteRegola(regola).length" class="etichette-regola">
            <span
              v-for="etichetta in etichetteRegola(regola)"
              :key="etichetta"
              class="etichetta-regola"
            >
              {{ etichetta }}
            </span>
          </div>
        </header>

        <p class="testo-regola">
          {{ regola.descrizione }}
        </p>
        <p v-if="regola.notaCapitello" class="nota-capitello">
          {{ regola.notaCapitello }}
        </p>
      </article>
    </section>

    <!-- NOTE PERSONALI -->

    <section v-if="creatura.note" class="sezione-note">
      <h4>Note personali</h4>

      <p class="testo-regola">
        {{ creatura.note }}
      </p>
    </section>

    <!-- FONTE -->

    <footer v-if="creatura.fonte || creatura.derivataDa" class="fonte">
      <span v-if="creatura.fonte">
        <strong>Fonte:</strong>
        {{ creatura.fonte }}
      </span>

      <span v-if="creatura.derivataDa">
        · Derivata da
        {{ creatura.derivataDa.nome }}
      </span>
    </footer>
  </div>
</template>

<style scoped>
.scheda-creatura {
  display: grid;
  gap: 18px;
  min-width: 0;
  color: var(--dmc-cream);
  font-size: 0.9rem;
  overflow-wrap: anywhere;
}

.scheda-creatura :is(p, h4, h5, dl, dd) {
  margin: 0;
}

.scheda-creatura h4 {
  font-family: var(--dmc-font-illustrated);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--dmc-amber);
}

.identita {
  display: grid;
  gap: 5px;
}

.tassonomia {
  color: var(--dmc-muted-light);
  font-size: 0.84rem;
  line-height: 1.5;
}

.dettaglio-sciame {
  color: var(--dmc-muted-light);
  font-size: 0.8rem;
  line-height: 1.5;
}

/* STATISTICHE */

.riepilogo {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;
}

.statistica {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 5px;
  min-width: 0;
  min-height: 78px;
  padding: 12px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 9px;
  background: var(--dmc-ink);
}

.statistica dt {
  color: var(--dmc-muted-light);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.06em;
}

.statistica dd:not(.dettaglio-statistica) {
  color: var(--dmc-cream);
  font-size: 1.45rem;
  font-weight: 750;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.statistica-ca,
.statistica-pf,
.statistica-gs {
  border-color: var(--dmc-outline);
}

.statistica-ca dd:not(.dettaglio-statistica),
.statistica-pf dd:not(.dettaglio-statistica),
.statistica-gs dd:not(.dettaglio-statistica) {
  color: var(--dmc-amber);
}

.dettaglio-statistica {
  color: var(--dmc-muted-light);
  font-size: 0.68rem;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

/* CARATTERISTICHE */

.sezione-caratteristiche,
.sezione-proprieta,
.sezione-note {
  display: grid;
  gap: 10px;
}

.tabella-scorribile {
  min-width: 0;
  overflow-x: auto;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 9px;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: center;
  font-size: 0.82rem;
  font-variant-numeric: tabular-nums;
}

th,
td {
  padding: 9px 7px;
  border-bottom: 1px solid var(--dmc-border-soft);
}

thead {
  background: var(--dmc-ink);
}

thead th {
  color: var(--dmc-amber);
}

tbody th {
  text-align: left;
  color: var(--dmc-muted-light);
  font-size: 0.75rem;
  font-weight: 600;
}

tbody td {
  font-weight: 500;
}

tbody td.punteggio {
  font-weight: 750;
  font-size: 0.95rem;
}

tbody tr:last-child th,
tbody tr:last-child td {
  border-bottom: 0;
}

/* PROPRIETÀ */

.proprieta {
  display: grid;
  grid-template-columns:
    minmax(130px, 0.9fr)
    minmax(0, 3fr);
  gap: 0 14px;
  padding: 4px 12px;
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border-soft);
  border-radius: 9px;
}

.proprieta dt,
.proprieta dd {
  padding: 9px 0;
  border-bottom: 1px solid var(--dmc-border-soft);
  line-height: 1.55;
}

.proprieta dt {
  font-size: 0.78rem;
  font-weight: 650;
  color: var(--dmc-muted-light);
}

.proprieta dd {
  font-size: 0.85rem;
}

.proprieta dt:nth-last-of-type(1),
.proprieta dd:nth-last-of-type(1) {
  border-bottom: 0;
}

.informazione-assente {
  color: var(--dmc-muted-light);
  font-size: 0.8rem;
}

/* REGOLE E AZIONI */

.gruppo-regole {
  display: grid;
  gap: 9px;
  min-width: 0;
}

.intestazione-regole {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding-bottom: 7px;
  border-bottom: 1px solid var(--dmc-border);
}

.contatore-regole {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  min-height: 24px;
  padding: 3px 7px;
  border-radius: 6px;
  background: var(--dmc-ink);
  border: 1px solid var(--dmc-border-soft);
  color: var(--dmc-muted-light);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
}

.introduzione-regole {
  padding: 10px 12px;
  border-left: 3px solid var(--dmc-amber);
  border-radius: 5px;
  background: var(--dmc-ink);
  font-size: 0.84rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.regola {
  display: grid;
  gap: 8px;
  min-width: 0;
  padding: 12px 14px;
  border: 1px solid var(--dmc-border-soft);
  border-left: 3px solid var(--dmc-amber);
  border-radius: 7px;
  background: var(--dmc-surface-soft);
}

.intestazione-regola {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.regola h5 {
  color: var(--dmc-cream);
  font-size: 0.9rem;
  font-weight: 750;
  line-height: 1.4;
}

.etichette-regola {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.etichetta-regola {
  display: inline-block;
  padding: 3px 6px;
  border: 1px solid var(--dmc-border);
  border-radius: 5px;
  color: var(--dmc-amber);
  background: var(--dmc-ink);
  font-size: 0.68rem;
  font-weight: 650;
  white-space: nowrap;
}

.testo-regola {
  color: var(--dmc-cream);
  font-size: 0.85rem;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

/* NOTE */

.note-fonte {
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid var(--dmc-blue);
  border-radius: 9px;
  background: var(--dmc-ink);
}

.note-fonte h4 {
  color: var(--dmc-blue);
}

.note-fonte p {
  font-size: 0.84rem;
  line-height: 1.55;
}

.sezione-note {
  padding: 12px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 9px;
  background: var(--dmc-ink);
}

.fonte {
  padding-top: 10px;
  border-top: 1px solid var(--dmc-border-soft);
  color: var(--dmc-muted-light);
  font-size: 0.78rem;
  line-height: 1.5;
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

:focus-visible {
  outline: 3px solid var(--dmc-blue);
  outline-offset: 3px;
}

/* RESPONSIVE */

@media (max-width: 1100px) {
  .riepilogo {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 650px) {
  .riepilogo {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .statistica {
    padding: 10px;
    min-height: 70px;
  }

  .statistica dd {
    font-size: 1.25rem;
  }

  .proprieta {
    grid-template-columns: 1fr;
    gap: 0;
  }

  .proprieta dt {
    padding-bottom: 2px;
    border-bottom: 0;
  }

  .proprieta dd {
    padding-top: 0;
  }

  th,
  td {
    padding: 8px 5px;
  }

  .regola {
    padding: 10px;
  }
}
/* Indicazioni contestuali del DM: sempre sotto la regola a cui si riferiscono. */
.regola .nota-capitello {
  font-size: 0.74rem;
  font-style: italic;
  font-weight: 400;
  line-height: 1.45;
  color: var(--dmc-muted-light);
  white-space: pre-line;
}
</style>
