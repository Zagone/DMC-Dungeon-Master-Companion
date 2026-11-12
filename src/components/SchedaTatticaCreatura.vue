<script setup>
import { computed } from 'vue'
import { azioniDellaScheda, chiaviCaratteristiche } from '../dati/modelloCreatura.js'

const props = defineProps({
  creatura: { type: Object, required: true },
})
const sezioniOperative = computed(() =>
  [
    { campo: 'azioni', titolo: 'Azioni', voci: azioniDellaScheda(props.creatura) },
    { campo: 'azioniBonus', titolo: 'Azioni bonus', voci: props.creatura.azioniBonus || [] },
    { campo: 'reazioni', titolo: 'Reazioni', voci: props.creatura.reazioni || [] },
    {
      campo: 'azioniLeggendarie',
      titolo: 'Azioni leggendarie',
      voci: props.creatura.azioniLeggendarie || [],
    },
    { campo: 'azioniMitiche', titolo: 'Azioni mitiche', voci: props.creatura.azioniMitiche || [] },
  ].filter(
    (gruppo) =>
      gruppo.voci.length ||
      (gruppo.campo === 'azioniLeggendarie' && props.creatura.regoleAzioniLeggendarie),
  ),
)
const tratti = computed(() => props.creatura.capacita || [])
const bonusIniziativa = computed(() => {
  const n = Number(props.creatura.bonusIniziativa)
  return props.creatura.bonusIniziativa === null ||
    props.creatura.bonusIniziativa === undefined ||
    props.creatura.bonusIniziativa === '' ||
    !Number.isFinite(n)
    ? '—'
    : n >= 0
      ? '+' + n
      : String(n)
})
const nomi = { for: 'FOR', des: 'DES', cos: 'COS', int: 'INT', sag: 'SAG', car: 'CAR' }
function modificatore(dato) {
  if (dato === undefined || dato === null || dato === '') return '—'
  const n = Number(dato)
  return !Number.isFinite(n) ? '—' : n >= 0 ? '+' + n : String(n)
}
function etichette(regola) {
  const nome = String(regola?.nome || '')
  const descrizione = String(regola?.descrizione || '')
  return [
    nome.match(/Ricarica\s*\d(?:\s*[–-]\s*\d)?/i)?.[0],
    descrizione.match(/\bCD\s*\d+\b/i)?.[0],
    descrizione.match(/[+-]\d+\s*a colpire/i)?.[0],
  ].filter(Boolean)
}
</script>

<template>
  <section class="tattica-creatura" :aria-label="`Azioni in combattimento di ${creatura.nome}`">
    <div class="dati-rapidi" aria-label="Dati rapidi">
      <span><strong>Iniziativa</strong> {{ bonusIniziativa }}</span>
      <span v-if="creatura.velocita"><strong>Velocità</strong> {{ creatura.velocita }}</span>
      <span v-if="creatura.sensi"><strong>Sensi</strong> {{ creatura.sensi }}</span>
    </div>

    <div v-if="sezioniOperative.length" class="sezioni-operative">
      <details
        v-for="gruppo in sezioniOperative"
        :key="gruppo.campo"
        class="sezione-espandibile gruppo-operativo"
      >
        <summary>
          {{ gruppo.titolo }} <span>{{ gruppo.voci.length }}</span>
        </summary>
        <p
          v-if="gruppo.campo === 'azioniLeggendarie' && creatura.regoleAzioniLeggendarie"
          class="nota"
        >
          {{ creatura.regoleAzioniLeggendarie }}
        </p>
        <article v-for="(voce, indice) in gruppo.voci" :key="indice" class="azione">
          <div class="intestazione-azione">
            <strong>{{ voce.nome }}</strong>
            <div v-if="etichette(voce).length" class="etichette">
              <span v-for="etichetta in etichette(voce)" :key="etichetta">{{ etichetta }}</span>
            </div>
          </div>
          <p>{{ voce.descrizione }}</p>
        </article>
      </details>
    </div>
    <p v-else class="nota">Nessuna azione presente nella scheda.</p>

    <details v-if="tratti.length" class="sezione-espandibile">
      <summary>
        Tratti e capacità <span>{{ tratti.length }}</span>
      </summary>
      <article v-for="(tratto, indice) in tratti" :key="indice" class="azione">
        <strong>{{ tratto.nome }}</strong>
        <p>{{ tratto.descrizione }}</p>
      </article>
    </details>

    <details class="sezione-espandibile">
      <summary>Caratteristiche e tiri salvezza</summary>
      <div class="tabella-scorribile" tabindex="0" aria-label="Caratteristiche del mostro">
        <table>
          <thead>
            <tr>
              <th scope="col">Valore</th>
              <th v-for="chiave in chiaviCaratteristiche" :key="chiave" scope="col">
                {{ nomi[chiave] }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Punteggio</th>
              <td v-for="chiave in chiaviCaratteristiche" :key="chiave">
                {{ creatura.caratteristiche?.[chiave] ?? '—' }}
              </td>
            </tr>
            <tr>
              <th scope="row">MOD</th>
              <td v-for="chiave in chiaviCaratteristiche" :key="chiave">
                {{ modificatore(creatura.modificatori?.[chiave]) }}
              </td>
            </tr>
            <tr>
              <th scope="row">SALV</th>
              <td v-for="chiave in chiaviCaratteristiche" :key="chiave">
                {{ modificatore(creatura.tiriSalvezza?.[chiave]) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>

    <details class="sezione-espandibile">
      <summary>Difese, immunità e informazioni aggiuntive</summary>
      <dl class="extra">
        <template
          v-for="riga in [
            ['resistenze', 'Resistenze'],
            ['vulnerabilita', 'Vulnerabilità'],
            ['immunita', 'Immunità ai danni'],
            ['immunitaCondizioni', 'Immunità alle condizioni'],
            ['abilita', 'Abilità'],
            ['lingue', 'Linguaggi'],
            ['equipaggiamento', 'Equipaggiamento'],
          ]"
          :key="riga[0]"
        >
          <template
            v-if="
              creatura[riga[0]] && (!Array.isArray(creatura[riga[0]]) || creatura[riga[0]].length)
            "
          >
            <dt>{{ riga[1] }}</dt>
            <dd v-if="riga[0] === 'abilita'">
              {{ creatura.abilita.map((a) => a.nome + ' ' + modificatore(a.bonus)).join('; ') }}
            </dd>
            <dd v-else>
              {{
                Array.isArray(creatura[riga[0]]) ? creatura[riga[0]].join('; ') : creatura[riga[0]]
              }}
            </dd>
          </template>
        </template>
      </dl>
    </details>
  </section>
</template>

<style scoped>
.tattica-creatura {
  display: grid;
  gap: 14px;
  min-width: 0;
  color: var(--dmc-cream);
  font-size: 0.86rem;
  overflow-wrap: anywhere;
}
.dati-rapidi {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.dati-rapidi span {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 7px;
  padding: 7px 10px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 7px;
  background: var(--dmc-ink);
}
.dati-rapidi strong {
  color: var(--dmc-amber);
}
.sezioni-operative,
.gruppo {
  display: grid;
  gap: 10px;
  min-width: 0;
}
.gruppo h5 {
  margin: 0;
  color: var(--dmc-amber);
  font-size: 0.95rem;
  border-bottom: 1px solid var(--dmc-border-soft);
  padding-bottom: 7px;
}
.gruppo h5 small {
  font-size: 0.75rem;
  color: var(--dmc-muted-light);
  margin-left: 7px;
}
.azione {
  display: grid;
  gap: 7px;
  min-width: 0;
  padding: 11px 12px;
  border: 1px solid var(--dmc-border-soft);
  border-left: 3px solid var(--dmc-amber);
  border-radius: 8px;
  background: var(--dmc-surface-soft);
}
.azione strong {
  font-size: 0.88rem;
  color: var(--dmc-cream);
}
.azione p,
.nota {
  margin: 0;
  line-height: 1.6;
  white-space: pre-wrap;
}
.nota {
  color: var(--dmc-muted-light);
}
.intestazione-azione {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  flex-wrap: wrap;
}
.etichette {
  display: flex;
  gap: 5px;
  flex-wrap: wrap;
}
.etichette span {
  padding: 3px 6px;
  border-radius: 5px;
  border: 1px solid var(--dmc-border-soft);
  font-size: 0.7rem;
  color: var(--dmc-amber);
}
.sezione-espandibile {
  min-width: 0;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  overflow: hidden;
}
.sezione-espandibile summary {
  cursor: pointer;
  padding: 11px 12px;
  color: var(--dmc-cream);
  font-weight: 700;
}
.sezione-espandibile summary span {
  color: var(--dmc-muted-light);
}
.sezione-espandibile[open] {
  display: grid;
  gap: 9px;
  padding-bottom: 10px;
}
.sezione-espandibile > .azione,
.sezione-espandibile > .tabella-scorribile,
.sezione-espandibile > .extra,
.sezione-espandibile > .nota {
  margin-inline: 10px;
}
.gruppo-operativo > summary {
  color: var(--dmc-amber);
}
.gruppo-operativo > summary span {
  float: right;
}
.gruppo-operativo[open] > summary {
  border-bottom: 1px solid var(--dmc-border-soft);
}
.tabella-scorribile {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 330px;
  font-size: 0.79rem;
  text-align: center;
}
th,
td {
  padding: 7px 5px;
  border-bottom: 1px solid var(--dmc-border-soft);
}
thead {
  color: var(--dmc-amber);
}
tbody th {
  text-align: left;
  color: var(--dmc-muted-light);
}
.extra {
  display: grid;
  grid-template-columns: minmax(100px, 1fr) minmax(0, 2fr);
  gap: 8px 12px;
}
.extra dt {
  font-weight: 700;
  color: var(--dmc-amber);
}
.extra dd {
  margin: 0;
}
.tattica-creatura :is(summary):focus-visible {
  outline: 2px solid var(--dmc-amber);
  outline-offset: -2px;
}
</style>
