<script setup lang="ts">
/**
 * Componente reutilizable: Modal Base
 * Encapsula la estructura del diálogo, backdrop translúcido, cabecera con botón de cierre
 * y áreas configurables de cuerpo y pie mediante slots.
 */
withDefaults(
  defineProps<{
    isOpen: boolean
    title: string
    icon?: string
    iconColorClass?: string
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    icon: '',
    iconColorClass: 'text-success',
    size: 'md',
  }
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const handleBackdropClick = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="modal-overlay"
    role="dialog"
    aria-modal="true"
    @click.self="handleBackdropClick"
  >
    <div
      class="hospital-modal"
      :class="{
        'modal-sm': size === 'sm',
        'modal-lg': size === 'lg',
        'modal-xl': size === 'xl',
      }"
    >
      <!-- Cabecera del modal -->
      <div class="hospital-modal-header">
        <h2 class="hospital-modal-title">
          <i v-if="icon" :class="['bi', icon, iconColorClass]"></i>
          <span>{{ title }}</span>
        </h2>
        <button
          type="button"
          class="btn-close"
          aria-label="Cerrar modal"
          @click="emit('close')"
        ></button>
      </div>

      <!-- Contenido del modal -->
      <div class="hospital-modal-body">
        <slot />
      </div>

      <!-- Pie del modal (Acciones) -->
      <div v-if="$slots.footer" class="hospital-modal-footer">
        <slot name="footer" />
      </div>
    </div>
  </div>
</template>
