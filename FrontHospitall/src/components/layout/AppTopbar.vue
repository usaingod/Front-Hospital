<script setup lang="ts">
import { computed } from 'vue'
import { useUiStore } from '@/stores/ui'

/**
 * Componente: Barra Superior (Topbar)
 * Sincronizado dinámicamente con el perfil activo (Secretaría / Administrador).
 * Incluye el botón de menú móvil, barra de búsqueda general y notificaciones visuales.
 */
const uiStore = useUiStore()

const isAdmin = computed(() => uiStore.currentRole === 'admin')
const isMedico = computed(() => uiStore.currentRole === 'medico')

const searchPlaceholder = computed(() => {
  if (isAdmin.value) {
    return 'Buscar especialidad, médico o usuario...'
  }
  if (isMedico.value) {
    return 'Buscar turno o paciente...'
  }
  return 'Buscar turno, médico o paciente...'
})

const handleSearch = () => {
  // Acción visual de búsqueda general (pendiente de backend)
}
</script>

<template>
  <header class="hospital-topbar">
    <div class="d-flex align-items-center gap-3">
      <!-- Botón para alternar la barra lateral en pantallas móviles -->
      <button
        class="btn btn-sm btn-outline-secondary d-lg-none"
        type="button"
        aria-label="Abrir menú de navegación"
        @click="uiStore.toggleSidebar"
      >
        <i class="bi bi-list fs-5"></i>
      </button>

      <!-- Buscador General Visual -->
      <div class="hospital-search-wrapper">
        <i class="bi bi-search hospital-search-icon"></i>
        <input
          type="text"
          class="hospital-search-input"
          :placeholder="searchPlaceholder"
          aria-label="Buscador general del sistema"
          @keydown.enter="handleSearch"
        />
      </div>
    </div>

    <!-- Acciones del extremo derecho de la barra superior -->
    <div class="hospital-topbar-actions">
      <!-- Notificaciones del sistema (Visual) -->
      <button
        class="hospital-action-btn"
        type="button"
        title="Notificaciones del sistema"
        aria-label="Notificaciones"
      >
        <i class="bi bi-bell"></i>
        <span
          v-if="uiStore.unreadNotificationsCount > 0"
          class="hospital-notif-badge"
        ></span>
      </button>

      <!-- Perfil de usuario activo -->
      <div class="hospital-topbar-profile">
        <div
          class="hospital-avatar-sm"
          :style="isAdmin ? { backgroundColor: 'var(--hospital-blue-primary)' } : (isMedico ? { backgroundColor: 'var(--hospital-amber-primary)' } : undefined)"
        >
          <i :class="['bi', isAdmin ? 'bi-shield-check' : (isMedico ? 'bi-stethoscope' : 'bi-person')]"></i>
        </div>
        <div class="d-none d-md-block">
          <div class="hospital-topbar-name">
            {{ uiStore.activeProfile.name }}
          </div>
          <div class="hospital-topbar-sub">
            {{ uiStore.activeProfile.role }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
