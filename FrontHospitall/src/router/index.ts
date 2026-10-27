
import { createRouter, createWebHistory } from 'vue-router'

import SecretariaLayout from '@/layouts/SecretariaLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import MedicoLayout from '@/layouts/MedicoLayout.vue'

import InicioView from '@/views/secretaria/InicioView.vue'
import TurnosView from '@/views/secretaria/TurnosView.vue'
import PacientesView from '@/views/secretaria/PacientesView.vue'
import MedicosView from '@/views/secretaria/MedicosView.vue'

import AdminHomeView from '@/views/admin/AdminHomeView.vue'
import SpecialtiesView from '@/views/admin/SpecialtiesView.vue'
import AdminDoctorsView from '@/views/admin/AdminDoctorsView.vue'
import UsersView from '@/views/admin/UsersView.vue'

import MedicoInicioView from '@/views/medico/MedicoInicioView.vue'
import MedicoTurnosView from '@/views/medico/MedicoTurnosView.vue'
import MedicoPacientesView from '@/views/medico/MedicoPacientesView.vue'

import { useUiStore } from '@/stores/ui'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      redirect: '/secretaria/inicio',
    },

    // Perfil Secretaria
    {
      path: '/secretaria',
      component: SecretariaLayout,
      redirect: '/secretaria/inicio',
      children: [
        {
          path: 'inicio',
          name: 'secretaria-inicio',
          component: InicioView,
        },
        {
          path: 'turnos',
          name: 'secretaria-turnos',
          component: TurnosView,
        },
        {
          path: 'pacientes',
          name: 'secretaria-pacientes',
          component: PacientesView,
        },
        {
          path: 'medicos',
          name: 'secretaria-medicos',
          component: MedicosView,
        },
      ],
    },

    // Perfil Administrador
    {
      path: '/admin',
      component: AdminLayout,
      redirect: '/admin/inicio',
      children: [
        {
          path: 'inicio',
          name: 'admin-inicio',
          component: AdminHomeView,
        },
        {
          path: 'especialidades',
          name: 'admin-especialidades',
          component: SpecialtiesView,
        },
        {
          path: 'medicos',
          name: 'admin-medicos',
          component: AdminDoctorsView,
        },
        {
          path: 'usuarios',
          name: 'admin-usuarios',
          component: UsersView,
        },
      ],
    },

    // Perfil Médico
    {
      path: '/medico',
      component: MedicoLayout,
      redirect: '/medico/inicio',
      children: [
        {
          path: 'inicio',
          name: 'medico-inicio',
          component: MedicoInicioView,
        },
        {
          path: 'turnos',
          name: 'medico-turnos',
          component: MedicoTurnosView,
        },
        {
          path: 'pacientes',
          name: 'medico-pacientes',
          component: MedicoPacientesView,
        },
      ],
    },

    // Rutas desconocidas
    {
      path: '/:pathMatch(.*)*',
      redirect: '/secretaria/inicio',
    },
  ],
})

// Sincronizar el perfil visual con la ruta actual
router.afterEach((to) => {
  const uiStore = useUiStore()
  uiStore.syncRoleWithRoute(to.path)
})

export default router
