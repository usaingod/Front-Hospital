import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'secretaria' | 'admin' | 'medico'

export interface ProfileInfo {
  name: string
  role: string
  facility: string
  initials?: string
}

/**
 * Store global de Pinia para la gestión del estado de la interfaz de usuario (UI)
 * y el contexto de alternancia visual de perfiles (Secretaría / Administrador / Médico).
 * 
 * Justificación de su uso (Criterio 6):
 * - Permite sincronizar la barra superior (Topbar) y la barra lateral (Sidebar)
 *   sin necesidad de prop-drilling en los layouts.
 * - Gestiona el perfil visual activo seleccionado (Secretaría, Administrador o Médico)
 *   para actualizar avatares, nombres y colores en tiempo real sin recargas.
 * - Sincroniza el menú responsive móvil y los indicadores del sistema.
 * - NO almacena datos ficticios ni actúa como base de datos simulada ni gestiona
 *   autenticación real, contraseñas o seguridad.
 */
export const useUiStore = defineStore('ui', () => {
  // Estado de visibilidad de la barra lateral en pantallas móviles
  const isMobileSidebarOpen = ref(false)

  // Rol visual actualmente seleccionado
  const currentRole = ref<UserRole>('secretaria')

  // Perfil representativo para Secretaría
  const secretaryProfile = ref<ProfileInfo>({
    name: 'Secretaría General',
    role: 'Atención y Turnos',
    facility: 'Hospital Central',
    initials: 'SG',
  })

  // Perfil representativo para Administrador
  const adminProfile = ref<ProfileInfo>({
    name: 'Administración Central',
    role: 'Gestión y Configuración',
    facility: 'Hospital Central',
    initials: 'AC',
  })

  // Perfil representativo para Médico
  const doctorProfile = ref<ProfileInfo>({
    name: 'Cuerpo Médico',
    role: 'Atención Médica',
    facility: 'Hospital Central',
    initials: 'CM',
  })

  // Perfil visual activo según el rol seleccionado
  const activeProfile = computed<ProfileInfo>(() => {
    if (currentRole.value === 'admin') return adminProfile.value
    if (currentRole.value === 'medico') return doctorProfile.value
    return secretaryProfile.value
  })

  // Contador de notificaciones pendientes
  const unreadNotificationsCount = ref(0)

  // Acciones para controlar la barra lateral
  const toggleSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  const closeSidebar = () => {
    isMobileSidebarOpen.value = false
  }

  const openSidebar = () => {
    isMobileSidebarOpen.value = true
  }

  // Cambiar rol visual (Secretaría / Administrador / Médico)
  const setRole = (role: UserRole) => {
    currentRole.value = role
  }

  // Sincronizar automáticamente el rol visual con la ruta activa
  const syncRoleWithRoute = (path: string) => {
    if (path.startsWith('/admin')) {
      currentRole.value = 'admin'
    } else if (path.startsWith('/medico')) {
      currentRole.value = 'medico'
    } else if (path.startsWith('/secretaria')) {
      currentRole.value = 'secretaria'
    }
  }

  return {
    isMobileSidebarOpen,
    currentRole,
    secretaryProfile,
    adminProfile,
    doctorProfile,
    activeProfile,
    unreadNotificationsCount,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setRole,
    syncRoleWithRoute,
  }
})
