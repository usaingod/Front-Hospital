import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type UserRole = 'secretaria' | 'admin' | 'medico' | 'enfermeria'

export interface ProfileInfo {
  name: string
  role: string
  facility: string
  initials?: string
}


export const useUiStore = defineStore('ui', () => {

  const isMobileSidebarOpen = ref(false)


  const currentRole = ref<UserRole>('secretaria')


  const secretaryProfile = ref<ProfileInfo>({
    name: 'Secretaría General',
    role: 'Atención y Turnos',
    facility: 'Hospital Central',
    initials: 'SG',
  })


  const adminProfile = ref<ProfileInfo>({
    name: 'Administración Central',
    role: 'Gestión y Configuración',
    facility: 'Hospital Central',
    initials: 'AC',
  })


  const doctorProfile = ref<ProfileInfo>({
    name: 'Cuerpo Médico',
    role: 'Atención Médica',
    facility: 'Hospital Central',
    initials: 'CM',
  })


  const nursingProfile = ref<ProfileInfo>({
    name: 'Servicio de Enfermería',
    role: 'Cuidados e Internación',
    facility: 'Hospital Central',
    initials: 'EN',
  })


  const activeProfile = computed<ProfileInfo>(() => {
    if (currentRole.value === 'admin') return adminProfile.value
    if (currentRole.value === 'medico') return doctorProfile.value
    if (currentRole.value === 'enfermeria') return nursingProfile.value
    return secretaryProfile.value
  })


  const unreadNotificationsCount = ref(0)


  const toggleSidebar = () => {
    isMobileSidebarOpen.value = !isMobileSidebarOpen.value
  }

  const closeSidebar = () => {
    isMobileSidebarOpen.value = false
  }

  const openSidebar = () => {
    isMobileSidebarOpen.value = true
  }


  const setRole = (role: UserRole) => {
    currentRole.value = role
  }


  const syncRoleWithRoute = (path: string) => {
    if (path.startsWith('/admin')) {
      currentRole.value = 'admin'
    } else if (path.startsWith('/medico')) {
      currentRole.value = 'medico'
    } else if (path.startsWith('/enfermeria')) {
      currentRole.value = 'enfermeria'
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
    nursingProfile,
    activeProfile,
    unreadNotificationsCount,
    toggleSidebar,
    closeSidebar,
    openSidebar,
    setRole,
    syncRoleWithRoute,
  }
})
