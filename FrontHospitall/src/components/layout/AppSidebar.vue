<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUiStore, type UserRole } from '@/stores/ui'

/**
 * Componente Reutilizable: Barra Lateral (Sidebar)
 * Criterios 1, 3, 4, 5, 6, 8:
 * - Adapta su paleta y opciones según el rol activo
 *   (Secretaría en verde, Administrador en azul, Médico en dorado, Enfermería en rojo/bordó).
 * - Incorpora el Selector de Perfil con los cuatro perfiles disponibles.
 * - Navega mediante Vue Router sin recarga innecesaria de página.
 * - Respeta las opciones de cada perfil sin elementos sobrantes.
 */
const props = withDefaults(
  defineProps<{
    variant?: UserRole
  }>(),
  {}
)

const route = useRoute()
const router = useRouter()
const uiStore = useUiStore()
const authStore = useAuthStore()

// Determinar el rol activo: prop explícita o sincronizado con uiStore/ruta
const activeRole = computed<UserRole>(() => {
  if (props.variant) return props.variant
  return uiStore.currentRole
})

const isAdmin = computed(() => activeRole.value === 'admin')
const isMedico = computed(() => activeRole.value === 'medico')
const isEnfermeria = computed(() => activeRole.value === 'enfermeria')

// Opciones de navegación de Secretaría (5 opciones)
const secretariaNavItems = [
  { name: 'Inicio', path: '/secretaria/inicio', icon: 'bi-grid-1x2' },
  { name: 'Turnos', path: '/secretaria/turnos', icon: 'bi-calendar3' },
  { name: 'Triaje', path: '/secretaria/triaje', icon: 'bi-thermometer-half' },
  { name: 'Pacientes', path: '/secretaria/pacientes', icon: 'bi-people' },
  { name: 'Médicos', path: '/secretaria/medicos', icon: 'bi-person-badge' },
  { name: 'Internación', path: '/secretaria/internacion', icon: 'bi-hospital' },
]

// Opciones de navegación de Administrador (5 opciones)
const adminNavItems = [
  { name: 'Inicio', path: '/admin/inicio', icon: 'bi-grid-1x2' },
  { name: 'Especialidades', path: '/admin/especialidades', icon: 'bi-award' },
  { name: 'Médicos', path: '/admin/medicos', icon: 'bi-person-badge' },
  { name: 'Camas', path: '/admin/camas', icon: 'bi-hospital' },
  { name: 'Usuarios', path: '/admin/usuarios', icon: 'bi-person' },
]

// Opciones de navegación de Médico (estrictamente 3 opciones)
const medicoNavItems = [
  { name: 'Inicio', path: '/medico/inicio', icon: 'bi-grid-1x2' },
  { name: 'Turnos', path: '/medico/turnos', icon: 'bi-calendar3' },
  { name: 'Pacientes', path: '/medico/pacientes', icon: 'bi-people' },
]

// Opciones de navegación de Enfermería (3 secciones)
const enfermeriaNavItems = [
  { name: 'Inicio', path: '/enfermeria/inicio', icon: 'bi-grid-1x2' },
  { name: 'Camas', path: '/enfermeria/camas', icon: 'bi-hospital' },
  { name: 'Paciente', path: '/enfermeria/paciente', icon: 'bi-person-heart' },
]

// Lista reactiva de navegación según el perfil activo
const currentNavItems = computed(() => {
  if (isAdmin.value) return adminNavItems
  if (isMedico.value) return medicoNavItems
  if (isEnfermeria.value) return enfermeriaNavItems
  return secretariaNavItems
})

const brandSubtitle = computed(() => {
  if (isAdmin.value) return 'Panel Administrador'
  if (isMedico.value) return 'Panel Médico'
  if (isEnfermeria.value) return 'Panel Enfermería'
  return 'Panel Secretaría'
})

const navCategory = computed(() => {
  if (isAdmin.value) return 'Administración'
  if (isMedico.value) return 'Atención Médica'
  if (isEnfermeria.value) return 'Enfermería e Internación'
  return 'Menú Principal'
})

// Control del menú desplegable del selector de perfil
const isProfileDropdownOpen = ref(false)
const selectorRef = ref<HTMLElement | null>(null)

const toggleProfileDropdown = () => {
  isProfileDropdownOpen.value = !isProfileDropdownOpen.value
}

const closeProfileDropdown = () => {
  isProfileDropdownOpen.value = false
}

const canVisitRole = (role: UserRole) => {
  const authRole = authStore.uiRole
  if (!authRole) return false
  return authRole === 'admin' || authRole === role
}

const selectProfile = (newRole: UserRole) => {
  if (!canVisitRole(newRole)) {
    closeProfileDropdown()
    return
  }
  if (newRole === activeRole.value) {
    closeProfileDropdown()
    return
  }

  uiStore.setRole(newRole)
  closeProfileDropdown()
  uiStore.closeSidebar()

  if (newRole === 'admin') {
    void router.push('/admin/inicio')
  } else if (newRole === 'medico') {
    void router.push('/medico/inicio')
  } else if (newRole === 'enfermeria') {
    void router.push('/enfermeria/inicio')
  } else {
    void router.push('/secretaria/inicio')
  }
}

// Cerrar dropdown al hacer clic fuera del componente
const handleClickOutside = (event: MouseEvent) => {
  if (
    selectorRef.value &&
    !selectorRef.value.contains(event.target as Node)
  ) {
    closeProfileDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
})

const handleLogout = async () => {
  authStore.logout()
  uiStore.closeSidebar()
  await router.push('/login')
}
</script>

<template>
  <aside
    class="hospital-sidebar"
    :class="{
      'show-mobile': uiStore.isMobileSidebarOpen,
      'theme-admin': isAdmin,
      'theme-medico': isMedico,
      'theme-enfermeria': isEnfermeria,
    }"
    aria-label="Navegación lateral del hospital"
  >
    <div>
      <!-- Marca institucional del hospital -->
      <div class="hospital-sidebar-brand">
        <div class="hospital-brand-icon">
          <i class="bi bi-hospital"></i>
        </div>
        <div>
          <div class="hospital-brand-title">Gestión Hospitalaria</div>
          <div class="hospital-brand-subtitle">
            {{ brandSubtitle }}
          </div>
        </div>
      </div>

      <!-- Enlaces de navegación -->
      <nav class="hospital-sidebar-nav" aria-label="Menú principal de navegación">
        <div class="hospital-nav-category">
          {{ navCategory }}
        </div>
        <router-link
          v-for="item in currentNavItems"
          :key="item.path"
          :to="item.path"
          class="hospital-nav-link"
          :class="{ active: route.path.startsWith(item.path) }"
          @click="uiStore.closeSidebar"
        >
          <i :class="['bi', item.icon]"></i>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </div>

    <!-- Pie del sidebar: Selector visual de perfil y cierre de sesión -->
    <div class="hospital-sidebar-footer">
      <!-- Selector de Perfil Desplegable -->
      <div ref="selectorRef" class="hospital-profile-selector">
        <button
          type="button"
          class="hospital-profile-trigger"
          :aria-expanded="isProfileDropdownOpen"
          aria-haspopup="true"
          title="Cambiar perfil de visualización"
          @click="toggleProfileDropdown"
        >
          <div
            class="hospital-avatar"
            :style="
              isAdmin
                ? { backgroundColor: 'var(--hospital-blue-primary)' }
                : isMedico
                  ? { backgroundColor: 'var(--hospital-amber-primary)' }
                  : isEnfermeria
                    ? { backgroundColor: 'var(--hospital-red-primary)' }
                    : undefined
            "
          >
            <i
              :class="[
                'bi',
                isAdmin
                  ? 'bi-shield-check'
                  : isMedico
                    ? 'bi-stethoscope'
                    : isEnfermeria
                      ? 'bi-heart-pulse'
                      : 'bi-person',
              ]"
            ></i>
          </div>
          <div class="hospital-profile-info">
            <div class="hospital-profile-name" :title="uiStore.activeProfile.name">
              {{ uiStore.activeProfile.name }}
            </div>
            <div class="hospital-profile-role">
              {{ uiStore.activeProfile.role }}
            </div>
          </div>
          <i class="bi bi-chevron-down dropdown-chevron"></i>
        </button>

        <!-- Menú flotante del selector con los cuatro perfiles -->
        <div
          v-if="isProfileDropdownOpen"
          class="profile-dropdown-menu"
          role="menu"
          aria-label="Seleccionar perfil de usuario"
        >
          <div class="profile-dropdown-header">Cambiar Perfil Visual</div>

          <!-- Opción: Secretaría -->
          <button
            type="button"
            class="profile-dropdown-item"
            :class="{ active: activeRole === 'secretaria' }"
            :disabled="!canVisitRole('secretaria')"
            role="menuitem"
            @click="selectProfile('secretaria')"
          >
            <div class="profile-item-icon green">
              <i class="bi bi-calendar3"></i>
            </div>
            <div class="profile-item-details">
              <div class="profile-item-title">Secretaría</div>
              <div class="profile-item-desc">Turnos, pacientes y horarios</div>
            </div>
            <i v-if="activeRole === 'secretaria'" class="bi bi-check2 profile-item-check"></i>
          </button>

          <!-- Opción: Administrador -->
          <button
            type="button"
            class="profile-dropdown-item"
            :class="{ active: activeRole === 'admin' }"
            :disabled="!canVisitRole('admin')"
            role="menuitem"
            @click="selectProfile('admin')"
          >
            <div class="profile-item-icon blue">
              <i class="bi bi-shield-check"></i>
            </div>
            <div class="profile-item-details">
              <div class="profile-item-title">Administrador</div>
              <div class="profile-item-desc">Especialidades, médicos y usuarios</div>
            </div>
            <i v-if="activeRole === 'admin'" class="bi bi-check2 profile-item-check"></i>
          </button>

          <!-- Opción: Médico -->
          <button
            type="button"
            class="profile-dropdown-item"
            :class="{ active: activeRole === 'medico' }"
            :disabled="!canVisitRole('medico')"
            role="menuitem"
            @click="selectProfile('medico')"
          >
            <div class="profile-item-icon amber">
              <i class="bi bi-stethoscope"></i>
            </div>
            <div class="profile-item-details">
              <div class="profile-item-title">Médico</div>
              <div class="profile-item-desc">Mis turnos y pacientes</div>
            </div>
            <i v-if="activeRole === 'medico'" class="bi bi-check2 profile-item-check"></i>
          </button>

          <!-- Opción: Enfermería -->
          <button
            type="button"
            class="profile-dropdown-item"
            :class="{ active: activeRole === 'enfermeria' }"
            :disabled="!canVisitRole('enfermeria')"
            role="menuitem"
            @click="selectProfile('enfermeria')"
          >
            <div class="profile-item-icon red">
              <i class="bi bi-heart-pulse"></i>
            </div>
            <div class="profile-item-details">
              <div class="profile-item-title">Enfermería</div>
              <div class="profile-item-desc">Camas, pacientes y signos vitales</div>
            </div>
            <i v-if="activeRole === 'enfermeria'" class="bi bi-check2 profile-item-check"></i>
          </button>
        </div>
      </div>

      <!-- Botón Cerrar Sesión (Mantenido debajo del selector) -->
      <button
        type="button"
        class="btn-sidebar-logout"
        title="Cerrar sesión en el sistema"
        @click="handleLogout"
      >
        <i class="bi bi-box-arrow-right"></i>
        <span>Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>
