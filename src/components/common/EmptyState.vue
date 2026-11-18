<script setup lang="ts">
/**
 * Componente reutilizable: Estado Vacío
 * Estandariza la presentación visual cuando no existen registros disponibles en tablas o paneles.
 */
withDefaults(
  defineProps<{
    icon?: string
    title?: string
    description?: string
    compact?: boolean
  }>(),
  {
    icon: 'bi-inbox',
    title: 'No hay datos para mostrar',
    description: '',
    compact: false,
  }
)
</script>

<template>
  <div class="hospital-empty-state" :class="{ 'py-4': compact }">
    <div
      class="hospital-empty-icon"
      :class="{ 'mb-2': compact }"
      :style="compact ? { width: '44px', height: '44px', fontSize: '1.25rem' } : undefined"
    >
      <i :class="['bi', icon]"></i>
    </div>
    <div class="hospital-empty-title" :class="{ 'fs-6': compact }">
      {{ title }}
    </div>
    <p v-if="description" class="hospital-empty-text" :class="{ small: compact }">
      {{ description }}
    </p>
    <div v-if="$slots.actions" class="mt-3">
      <slot name="actions" />
    </div>
  </div>
</template>
