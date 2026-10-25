<script setup lang="ts">
/**
 * Componente reutilizable: Tarjeta de estadísticas e indicadores
 * Presenta métricas clave con icono distintivo, color semántico y descripción explicativa.
 */
withDefaults(
  defineProps<{
    label: string
    value?: string | number
    icon: string
    colorClass?: 'green' | 'blue' | 'amber' | 'rose' | string
    hint?: string
  }>(),
  {
    value: '—',
    colorClass: 'green',
    hint: '',
  }
)
</script>

<template>
  <div class="hospital-stat-card">
    <div :class="['hospital-stat-icon', colorClass]">
      <i :class="['bi', icon]"></i>
    </div>
    <div class="flex-grow-1">
      <div class="hospital-stat-label">{{ label }}</div>
      <div class="hospital-stat-value">{{ value }}</div>
      <div v-if="hint" class="hospital-stat-hint">{{ hint }}</div>
    </div>
  </div>
</template>
