import { createRouter, createWebHistory } from 'vue-router'

import SecretariaLayout from '@/layouts/SecretariaLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MedicoLayout from '@/layouts/MedicoLayout.vue'
import EnfermeriaLayout from '@/layouts/EnfermeriaLayout.vue'

import InicioView from '@/views/secretaria/InicioView.vue'
import TurnosView from '@/views/secretaria/TurnosView.vue'
import PacientesView from '@/views/secretaria/PacientesView.vue'
import MedicosView from '@/views/secretaria/MedicosView.vue'
import InternacionView from '@/views/secretaria/InternacionView.vue'
import TriajeView from '@/views/secretaria/TriajeView.vue'

import AdminHomeView from '@/views/admin/AdminHomeView.vue'
import SpecialtiesView from '@/views/admin/SpecialtiesView.vue'
import AdminDoctorsView from '@/views/admin/AdminDoctorsView.vue'
import AdminCamasView from '@/views/admin/AdminCamasView.vue'
import UsersView from '@/views/admin/UsersView.vue'

import MedicoInicioView from '@/views/medico/MedicoInicioView.vue'
import MedicoTurnosView from '@/views/medico/MedicoTurnosView.vue'
import MedicoPacientesView from '@/views/medico/MedicoPacientesView.vue'

import EnfermeriaInicioView from '@/views/enfermeria/EnfermeriaInicioView.vue'
import EnfermeriaCamasView from '@/views/enfermeria/EnfermeriaCamasView.vue'
import EnfermeriaPacienteView from '@/views/enfermeria/EnfermeriaPacienteView.vue'
import LoginView from '@/views/LoginView.vue'

import { homeForRole, toUiRole, useAuthStore } from '@/stores/auth'
import { useUiStore, type UserRole } from '@/stores/ui'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      redirect: '/login',
    },
    {
      path: '/secretaria',
      component: SecretariaLayout,
      meta: { roles: ['secretaria', 'admin'] satisfies UserRole[] },
      redirect: '/secretaria/inicio',
      children: [
        { path: 'inicio', name: 'secretaria-inicio', component: InicioView },
        { path: 'turnos', name: 'secretaria-turnos', component: TurnosView },
        { path: 'triaje', name: 'secretaria-triaje', component: TriajeView },
        { path: 'pacientes', name: 'secretaria-pacientes', component: PacientesView },
        { path: 'medicos', name: 'secretaria-medicos', component: MedicosView },
        { path: 'internacion', name: 'secretaria-internacion', component: InternacionView },
      ],
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { roles: ['admin'] satisfies UserRole[] },
      redirect: '/admin/inicio',
      children: [
        { path: 'inicio', name: 'admin-inicio', component: AdminHomeView },
        { path: 'especialidades', name: 'admin-especialidades', component: SpecialtiesView },
        { path: 'medicos', name: 'admin-medicos', component: AdminDoctorsView },
        { path: 'camas', name: 'admin-camas', component: AdminCamasView },
        { path: 'usuarios', name: 'admin-usuarios', component: UsersView },
      ],
    },
    {
      path: '/medico',
      component: MedicoLayout,
      meta: { roles: ['medico', 'admin'] satisfies UserRole[] },
      redirect: '/medico/inicio',
      children: [
        { path: 'inicio', name: 'medico-inicio', component: MedicoInicioView },
        { path: 'turnos', name: 'medico-turnos', component: MedicoTurnosView },
        { path: 'pacientes', name: 'medico-pacientes', component: MedicoPacientesView },
      ],
    },
    {
      path: '/enfermeria',
      component: EnfermeriaLayout,
      meta: { roles: ['enfermeria', 'admin'] satisfies UserRole[] },
      redirect: '/enfermeria/inicio',
      children: [
        { path: 'inicio', name: 'enfermeria-inicio', component: EnfermeriaInicioView },
        { path: 'camas', name: 'enfermeria-camas', component: EnfermeriaCamasView },
        { path: 'paciente', name: 'enfermeria-paciente', component: EnfermeriaPacienteView },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/login',
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.user && auth.token) {
    await auth.bootstrap()
  }

  if (to.meta.public) {
    if (auth.isAuthenticated && auth.user) {
      return homeForRole(auth.user.role)
    }
    return true
  }

  if (!auth.isAuthenticated || !auth.user) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  const authRole = toUiRole(auth.user.role)
  const allowed = (to.meta.roles as UserRole[] | undefined) || []
  // Admin puede recorrer todos los paneles; el resto solo el suyo.
  if (
    allowed.length &&
    authRole !== 'admin' &&
    !allowed.includes(authRole)
  ) {
    return homeForRole(auth.user.role)
  }

  return true
})

router.afterEach((to) => {
  const uiStore = useUiStore()
  uiStore.syncRoleWithRoute(to.path)
})

export default router
