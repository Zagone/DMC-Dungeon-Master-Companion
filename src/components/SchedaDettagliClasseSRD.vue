<script setup>
import { computed } from 'vue'
import TestoCompendioSRD from './TestoCompendioSRD.vue'
import TabellaProgressioneClasse from './TabellaProgressioneClasse.vue'

const props = defineProps({
  scheda: { type: Object, required: true },
  progressione: { type: Object, required: true },
})

const tratti = computed(() => [
  ['Caratteristiche primarie', props.scheda.tratti.caratteristiche],
  ['Dado Vita', props.scheda.tratti.dadoVita],
  ['Tiri salvezza', props.scheda.tratti.tiriSalvezza],
  ['Competenze nelle abilità', props.scheda.tratti.abilita],
  ['Armi', props.scheda.tratti.armi],
  ['Armature e scudi', props.scheda.tratti.armature],
  ['Strumenti', props.scheda.tratti.strumenti],
  ['Equipaggiamento iniziale', props.scheda.tratti.equipaggiamento],
])
</script>

<template>
  <article class="scheda-classe-srd" :aria-label="'Scheda completa del ' + scheda.nome">
    <section class="scheda-classe-srd__sezione" aria-labelledby="tratti-classe">
      <h4 id="tratti-classe">Tratti iniziali</h4>
      <dl class="scheda-classe-srd__tratti">
        <div v-for="[nome, valore] in tratti" :key="nome" class="scheda-classe-srd__tratto">
          <dt>{{ nome }}</dt>
          <dd>{{ valore }}</dd>
        </div>
      </dl>
    </section>

    <section class="scheda-classe-srd__sezione">
      <h4>Tabella di avanzamento</h4>
      <TabellaProgressioneClasse :tabella="progressione" />
    </section>

    <section class="scheda-classe-srd__sezione">
      <h4>Privilegi di classe</h4>
      <p class="scheda-classe-srd__nota">
        Apri soltanto il livello che ti interessa per leggere gli effetti e le
        condizioni di utilizzo dei relativi privilegi.
      </p>
      <div class="scheda-classe-srd__livelli">
        <details
          v-for="gruppo in scheda.privilegi"
          :key="'privilegi-' + gruppo.livello"
          class="scheda-classe-srd__livello"
        >
          <summary>
            <span>Livello {{ gruppo.livello }}</span>
            <small>{{ gruppo.privilegi.map((privilegio) => privilegio.nome).join(' · ') }}</small>
          </summary>
          <div class="scheda-classe-srd__voci">
            <section
              v-for="(privilegio, indice) in gruppo.privilegi"
              :key="indice"
              class="scheda-classe-srd__voce"
            >
              <h5>{{ privilegio.nome }}</h5>
              <small class="scheda-classe-srd__pagina">SRD · pagina {{ privilegio.pagina }}</small>
              <TestoCompendioSRD
                :testo="privilegio.testo"
                :etichetta="'Privilegio ' + privilegio.nome + ', livello ' + gruppo.livello"
              />
            </section>
          </div>
        </details>
      </div>
    </section>

    <section class="scheda-classe-srd__sezione">
      <h4>Sottoclasse SRD: {{ scheda.sottoclasse.nome }}</h4>
      <p class="scheda-classe-srd__nota">
        La SRD italiana presenta questa sottoclasse per il {{ scheda.nome }}.
        Le altre sottoclassi non sono incluse in questo archivio SRD.
      </p>
      <div class="scheda-classe-srd__introduzione">
        <TestoCompendioSRD
          :testo="scheda.sottoclasse.introduzione"
          :etichetta="'Introduzione della sottoclasse ' + scheda.sottoclasse.nome"
        />
      </div>
      <h5 class="scheda-classe-srd__sottotitolo">Privilegi della sottoclasse</h5>
      <div class="scheda-classe-srd__livelli">
        <details
          v-for="gruppo in scheda.sottoclasse.privilegi"
          :key="'sottoclasse-' + gruppo.livello"
          class="scheda-classe-srd__livello"
        >
          <summary>
            <span>Livello {{ gruppo.livello }}</span>
            <small>{{ gruppo.privilegi.map((privilegio) => privilegio.nome).join(' · ') }}</small>
          </summary>
          <div class="scheda-classe-srd__voci">
            <section
              v-for="(privilegio, indice) in gruppo.privilegi"
              :key="indice"
              class="scheda-classe-srd__voce"
            >
              <h5>{{ privilegio.nome }}</h5>
              <small class="scheda-classe-srd__pagina">SRD · pagina {{ privilegio.pagina }}</small>
              <TestoCompendioSRD
                :testo="privilegio.testo"
                :etichetta="'Privilegio della sottoclasse ' + privilegio.nome"
              />
            </section>
          </div>
        </details>
      </div>
    </section>

    <section v-if="scheda.opzioni" class="scheda-classe-srd__sezione">
      <h4>{{ scheda.opzioni.titolo }}</h4>
      <p class="scheda-classe-srd__nota">
        Le opzioni specifiche della classe sono consultabili individualmente.
      </p>
      <div class="scheda-classe-srd__livelli">
        <details
          v-for="opzione in scheda.opzioni.voci"
          :key="opzione.nome"
          class="scheda-classe-srd__livello"
        >
          <summary>
            <span>{{ opzione.nome }}</span>
            <small>Pagina SRD {{ opzione.pagina }}</small>
          </summary>
          <div class="scheda-classe-srd__voci">
            <TestoCompendioSRD :testo="opzione.testo" :etichetta="opzione.nome" />
          </div>
        </details>
      </div>
    </section>

    <details class="scheda-classe-srd__riferimento">
      <summary>Testo integrale di riferimento della classe</summary>
      <p class="scheda-classe-srd__nota">
        Trascrizione automatica dall'SRD 5.2.1: può includere tabelle e parole
        spezzate dall'impaginazione originale. Per l'uso quotidiano, preferisci
        i tratti e i privilegi organizzati nelle sezioni precedenti.
      </p>
      <TestoCompendioSRD
        :testo="scheda.testoOriginale"
        :etichetta="'Trascrizione integrale del ' + scheda.nome"
      />
    </details>
  </article>
</template>

<style scoped>
.scheda-classe-srd {
  display: grid;
  gap: 1.5rem;
  min-width: 0;
  color: #f1e9dc;
}
.scheda-classe-srd__sezione {
  min-width: 0;
  border-top: 1px solid rgba(229, 166, 92, 0.32);
  padding-top: 1rem;
}
.scheda-classe-srd__sezione > h4 {
  color: #e5a65c;
  margin: 0 0 0.8rem;
  font-size: 1.15rem;
}
.scheda-classe-srd__tratti {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
  margin: 0;
}
.scheda-classe-srd__tratto {
  background: #242d38;
  border: 1px solid rgba(229, 166, 92, 0.24);
  box-shadow: 2px 2px 0 rgba(4, 9, 14, 0.35);
  border-radius: 7px;
  padding: 0.8rem;
  min-width: 0;
}
.scheda-classe-srd__tratto dt {
  color: #efb66f;
  font-size: 0.78rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
}
.scheda-classe-srd__tratto dd {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.5;
  overflow-wrap: anywhere;
}
.scheda-classe-srd__nota {
  margin: 0.4rem 0 0.9rem;
  color: #c4ccd5;
  font-size: 0.87rem;
  line-height: 1.55;
}
.scheda-classe-srd__livelli {
  display: grid;
  gap: 0.55rem;
}
.scheda-classe-srd__livello,
.scheda-classe-srd__riferimento {
  border: 1px solid rgba(229, 166, 92, 0.35);
  border-radius: 8px;
  background: #242d38;
  min-width: 0;
  box-shadow: 2px 2px 0 rgba(5, 8, 15, 0.32);
}
.scheda-classe-srd__livello > summary,
.scheda-classe-srd__riferimento > summary {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem 0.9rem;
  flex-wrap: wrap;
  cursor: pointer;
  padding: 0.75rem 0.85rem;
  color: #f4c589;
  font-size: 0.94rem;
  font-weight: 700;
}
.scheda-classe-srd__livello > summary small {
  font-size: 0.78rem;
  font-weight: 400;
  color: #c4ccd5;
  line-height: 1.5;
  min-width: 0;
  flex: 1;
}
.scheda-classe-srd__livello > summary:focus-visible,
.scheda-classe-srd__riferimento > summary:focus-visible {
  outline: 2px solid #e5a65c;
  outline-offset: 2px;
}
.scheda-classe-srd__voci {
  display: grid;
  gap: 1rem;
  padding: 0.9rem 1rem 1.1rem;
  border-top: 1px solid rgba(229, 166, 92, 0.2);
}
.scheda-classe-srd__voce:not(:last-child) {
  border-bottom: 1px solid rgba(229, 166, 92, 0.2);
  padding-bottom: 1rem;
}
.scheda-classe-srd__voce h5 {
  margin: 0 0 0.3rem;
  color: #e5a65c;
  font-size: 1rem;
}
.scheda-classe-srd__pagina {
  display: block;
  margin-bottom: 0.8rem;
  color: #bec8d1;
}
.scheda-classe-srd__introduzione {
  margin: 0.65rem 0 1.2rem;
  max-width: 80ch;
}
.scheda-classe-srd__sottotitolo {
  margin: 0 0 0.7rem;
  font-size: 0.98rem;
  color: #f4c589;
}
.scheda-classe-srd__riferimento {
  padding: 0 0.85rem 0.85rem;
}
.scheda-classe-srd__riferimento > :not(summary) { margin-top: 0.7rem; }
@media (max-width: 760px) {
  .scheda-classe-srd__tratti { grid-template-columns: minmax(0, 1fr); }
}
</style>
