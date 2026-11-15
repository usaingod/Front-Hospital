<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

/**
 * Componente: Barra Superior (Topbar)
 * Sincronizado dinámicamente con el perfil activo
 * (Secretaría / Administrador / Médico / Enfermería).
 * Incluye el botón de menú móvil, barra de búsqueda general y notificaciones visuales.
 */
const uiStore = useUiStore()
const authStore = useAuthStore()

const displayName = computed(
  () => authStore.user?.name || uiStore.activeProfile.name,
)
const displayRole = computed(
  () => authStore.user?.email || uiStore.activeProfile.role,
)

const isAdmin = computed(() => uiStore.currentRole === 'admin')
const isMedico = computed(() => uiStore.currentRole === 'medico')
const isEnfermeria = computed(() => uiStore.currentRole === 'enfermeria')

const searchPlaceholder = computed(() => {
  if (isAdmin.value) {
    return 'Buscar especialidad, médico o usuario...'
  }
  if (isMedico.value) {
    return 'Buscar turno o paciente...'
  }
  if (isEnfermeria.value) {
    return 'Buscar paciente o cama...'
  }
  return 'Buscar turno, médico o paciente...'
})

const topbarAvatarStyle = computed(() => {
  if (isAdmin.value) return { backgroundColor: 'var(--hospital-blue-primary)' }
  if (isMedico.value) return { backgroundColor: 'var(--hospital-amber-primary)' }
  if (isEnfermeria.value) return { backgroundColor: 'var(--hospital-red-primary)' }
  return undefined
})

const topbarAvatarIcon = computed(() => {
  if (isAdmin.value) return 'bi-shield-check'
  if (isMedico.value) return 'bi-stethoscope'
  if (isEnfermeria.value) return 'bi-heart-pulse'
  return 'bi-person'
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
          :style="topbarAvatarStyle"
        >
          <i :class="['bi', topbarAvatarIcon]"></i>
        </div>
        <div class="d-none d-md-block">
          <div class="hospital-topbar-name">
            {{ displayName }}
          </div>
          <div class="hospital-topbar-sub">
            {{ displayRole }}
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
