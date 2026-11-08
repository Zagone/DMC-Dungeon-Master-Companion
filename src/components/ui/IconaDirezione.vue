<script setup>
defineProps({ bloccata: Boolean })
</script>

<template>
  <svg class="icona-direzione" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false">
    <path v-if="bloccata" d="M9 12V8a5 5 0 0 1 10 0v4M7 12h14v12H7zM14 17v3" />
    <path v-else d="m16 5 9 9-9 9M3 14h21" />
  </svg>
</template>

<style scoped>
.icona-direzione {
  display: block;
  flex: 0 0 auto;
  width: 25px;
  height: 25px;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
