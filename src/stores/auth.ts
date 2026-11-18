import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api, apiRequest } from '@/services/api'
import type { UserRole } from '@/stores/ui'

export type ApiRole = 'admin' | 'secretaria' | 'profesional' | 'enfermero'

export type AuthSessionUser = {
  id: string
  email: string
  name: string
  role: ApiRole
  professionalId?: string | null
  active?: boolean
}

const ROLE_HOME: Record<UserRole, string> = {
  admin: '/admin/inicio',
  secretaria: '/secretaria/inicio',
  medico: '/medico/inicio',
  enfermeria: '/enfermeria/inicio',
}

export function toUiRole(role: ApiRole): UserRole {
  if (role === 'profesional') return 'medico'
  if (role === 'enfermero') return 'enfermeria'
  return role
}

export function homeForRole(role: ApiRole | UserRole): string {
  if (role === 'profesional') return ROLE_HOME.medico
  if (role === 'enfermero') return ROLE_HOME.enfermeria
  return ROLE_HOME[role as UserRole]
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken'))
  const user = ref<AuthSessionUser | null>(null)
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)
  const uiRole = computed<UserRole | null>(() =>
    user.value ? toUiRole(user.value.role) : null,
  )

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const result = await apiRequest<{ accessToken: string }>('/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })
      token.value = result.accessToken
      localStorage.setItem('accessToken', result.accessToken)
      await fetchMe()
      return user.value!
    } finally {
      loading.value = false
    }
  }

  async function fetchMe() {
    if (!token.value) {
      user.value = null
      return null
    }
    const me = await api.get<AuthSessionUser>('/users/me')
    user.value = me
    return me
  }

  function logout() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
  }

  async function bootstrap() {
    if (!token.value) return null
    try {
      return await fetchMe()
    } catch {
      logout()
      return null
    }
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    uiRole,
    login,
    fetchMe,
    logout,
    bootstrap,
  }
})
