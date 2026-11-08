<script setup>
defineProps({ tipo: { type: String, required: true } })
</script>

<template>
  <svg class="icona-strumento" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false">
    <g v-if="tipo === 'tempo'" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 2h6M14 2v4m7 1 2-2M14 10v7l4 2" />
      <path d="M24 17c0 6-4 10-10 10S4 23 4 17 8 6 14 6s10 5 10 11Z" />
    </g>
    <g v-else stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">
      <path d="m5 3 19 1 1 20-21 1z" />
      <path d="M9 8h1v1H9zm10 0h1v1h-1zm-5 6h1v1h-1zm-5 6h1v1H9zm10 0h1v1h-1z" fill="currentColor" />
    </g>
  </svg>
</template>

<style scoped>
.icona-strumento { display: block; width: 24px; height: 24px; }
</style>
