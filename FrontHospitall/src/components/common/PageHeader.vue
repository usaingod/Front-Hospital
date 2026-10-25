<script setup lang="ts">
/**
 * Componente reutilizable: Encabezado de página
 * Estandariza el título, descripción y botones de acción en las cuatro vistas de secretaría.
 */
defineProps<{
  title: string
  description?: string
}>()
</script>

<template>
  <div class="hospital-page-header">
    <div>
      <h1 class="hospital-page-title">{{ title }}</h1>
      <p v-if="description" class="hospital-page-desc">
        {{ description }}
      </p>
    </div>
    <div v-if="$slots.actions || $slots.default" class="d-flex align-items-center gap-2">
      <slot name="actions">
        <slot />
      </slot>
    </div>
  </div>
</template>
