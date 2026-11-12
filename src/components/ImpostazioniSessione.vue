<script setup>
defineProps({
  sessione: { type: Object, required: true },
})
const emit = defineEmits(['aggiorna-campo'])

function aggiorna(campo, valore, numerico = false) {
  emit('aggiorna-campo', {
    campo,
    valore: numerico ? (valore === '' ? '' : Number(valore)) : valore,
  })
}
</script>

<template>
  <div class="impostazioni-sessione">
            <details class="editor-espandibile">
              <summary>Impostazioni della sessione</summary>

              <div class="interno-details griglia-campi">
                <label>
                  Titolo

                  <input :value="sessione.titolo" @input="aggiorna('titolo', $event.target.value)" class="dmc-campo" />
                </label>

                <label>
                  Data

                  <input :value="sessione.data" @input="aggiorna('data', $event.target.value)" class="dmc-campo" type="date" />
                </label>

                <label>
                  Numero PG

                  <input
                    :value="sessione.pgPrevisti" @input="aggiorna('pgPrevisti', $event.target.value, true)"
                    class="dmc-campo"
                    type="number"
                    min="1"
                    max="20"
                  />
                </label>

                <label>
                  Livello PG

                  <input
                    :value="sessione.livelloPrevisto" @input="aggiorna('livelloPrevisto', $event.target.value, true)"
                    class="dmc-campo"
                    type="number"
                    min="1"
                    max="20"
                  />
                </label>

                <label>
                  Stato

                  <select :value="sessione.stato" @input="aggiorna('stato', $event.target.value)" class="dmc-campo">
                    <option value="preparazione">In preparazione</option>

                    <option value="svolta">Svolta</option>
                  </select>
                </label>

                <label>
                  Obiettivi

                  <textarea :value="sessione.obiettivi" @input="aggiorna('obiettivi', $event.target.value)" class="dmc-campo" rows="3"></textarea>
                </label>

                <label>
                  Resoconto

                  <textarea :value="sessione.resoconto" @input="aggiorna('resoconto', $event.target.value)" class="dmc-campo" rows="3"></textarea>
                </label>
              </div>
            </details>

  </div>
</template>

<style scoped>
.impostazioni-sessione { display: grid; gap: 12px; min-width: 0; }
.editor-espandibile {
  padding: 13px;
  border: 1px solid var(--dmc-border-soft);
  border-radius: 8px;
  background: var(--dmc-surface-soft);
}
.editor-espandibile summary {
  cursor: pointer;
  color: var(--dmc-amber);
  font-weight: 600;
}
.interno-details { display: grid; gap: 12px; padding-top: 13px; }
.griglia-campi {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 11px;
}
.griglia-campi label:nth-child(n+5) { grid-column: 1 / -1; }
.impostazioni-sessione label {
  display: grid;
  gap: 6px;
  min-width: 0;
  color: var(--dmc-muted);
  font-size: 13px;
}
.impostazioni-sessione .dmc-campo {
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.impostazioni-sessione textarea { resize: vertical; line-height: 1.55; }
@media (max-width: 650px) {
  .griglia-campi { grid-template-columns: 1fr; }
  .griglia-campi label { grid-column: 1 / -1; }
}
</style>
