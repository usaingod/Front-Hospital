<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUiStore, type UserRole } from '@/stores/ui'

/**
 * Componente Reutilizable: Barra Lateral (Sidebar)
 * Criterios 1, 3, 4, 5, 6, 8:
 * - Adapta su paleta y opciones según el rol activo (Secretaría en verde, Administrador en azul).
 * - Incorpora el Selector de Perfil en la esquina inferior izquierda.
 * - Navega mediante Vue Router sin recarga innecesaria de página.
 * - Respeta estrictamente las 4 opciones de cada perfil sin elementos sobrantes.
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

// Determinar el rol activo: prop explícita o sincronizado con uiStore/ruta
const activeRole = computed<UserRole>(() => {
  if (props.variant) return props.variant
  return uiStore.currentRole
})

const isAdmin = computed(() => activeRole.value === 'admin')

// Opciones de navegación de Secretaría (4 opciones)
const secretariaNavItems = [
  { name: 'Inicio', path: '/secretaria/inicio', icon: 'bi-grid-1x2' },
  { name: 'Turnos', path: '/secretaria/turnos', icon: 'bi-calendar3' },
  { name: 'Pacientes', path: '/secretaria/pacientes', icon: 'bi-people' },
  { name: 'Médicos', path: '/secretaria/medicos', icon: 'bi-person-badge' },
]

// Opciones de navegación de Administrador (estrictamente 4 opciones)
const adminNavItems = [
  { name: 'Inicio', path: '/admin/inicio', icon: 'bi-grid-1x2' },
  { name: 'Especialidades', path: '/admin/especialidades', icon: 'bi-award' },
  { name: 'Médicos', path: '/admin/medicos', icon: 'bi-person-badge' },
  { name: 'Usuarios', path: '/admin/usuarios', icon: 'bi-people-gear' },
]

// Lista reactiva de navegación según el perfil activo
const currentNavItems = computed(() => {
  return isAdmin.value ? adminNavItems : secretariaNavItems
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

// Acción de cambio de perfil: actualiza Pinia y navega al inicio correspondiente
const selectProfile = (newRole: UserRole) => {
  if (newRole === activeRole.value) {
    closeProfileDropdown()
    return
  }

  uiStore.setRole(newRole)
  closeProfileDropdown()
  uiStore.closeSidebar()

  if (newRole === 'admin') {
    router.push('/admin/inicio')
  } else {
    router.push('/secretaria/inicio')
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

const handleLogout = () => {
  // Acción visual de cierre de sesión sin backend real
  alert('Acción visual de cierre de sesión. El backend gestionará la autenticación en etapas posteriores.')
}
</script>

<template>
  <aside
    class="hospital-sidebar"
    :class="{
      'show-mobile': uiStore.isMobileSidebarOpen,
      'theme-admin': isAdmin,
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
            {{ isAdmin ? 'Panel Administrador' : 'Panel Secretaría' }}
          </div>
        </div>
      </div>

      <!-- Enlaces de navegación -->
      <nav class="hospital-sidebar-nav" aria-label="Menú principal de navegación">
        <div class="hospital-nav-category">
          {{ isAdmin ? 'Administración' : 'Menú Principal' }}
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
            :style="isAdmin ? { backgroundColor: 'var(--hospital-blue-primary)' } : undefined"
          >
            <i :class="['bi', isAdmin ? 'bi-shield-check' : 'bi-person']"></i>
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

        <!-- Menú flotante del selector -->
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
            :class="{ active: !isAdmin }"
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
            <i v-if="!isAdmin" class="bi bi-check2 profile-item-check"></i>
          </button>

          <!-- Opción: Administrador -->
          <button
            type="button"
            class="profile-dropdown-item"
            :class="{ active: isAdmin }"
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
            <i v-if="isAdmin" class="bi bi-check2 profile-item-check"></i>
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
