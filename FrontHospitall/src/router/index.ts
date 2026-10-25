import { createRouter, createWebHistory } from 'vue-router'
import SecretariaLayout from '@/layouts/SecretariaLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import InicioView from '@/views/secretaria/InicioView.vue'
import TurnosView from '@/views/secretaria/TurnosView.vue'
import PacientesView from '@/views/secretaria/PacientesView.vue'
import MedicosView from '@/views/secretaria/MedicosView.vue'
import AdminHomeView from '@/views/admin/AdminHomeView.vue'
import SpecialtiesView from '@/views/admin/SpecialtiesView.vue'
import AdminDoctorsView from '@/views/admin/AdminDoctorsView.vue'
import UsersView from '@/views/admin/UsersView.vue'
import { useUiStore } from '@/stores/ui'

/**
 * Configuración de Vue Router (Criterio 4: Router)
 * Integra las cuatro vistas existentes de Secretaría y las cuatro nuevas vistas de Administrador.
 * Gestiona navegación limpia mediante layouts compartidos e sincronización del rol activo.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/secretaria/inicio',
    },
    // Rutas del perfil Secretaría (identidad verde)
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
    // Rutas del perfil Administrador (identidad azul)
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
    // Captura de rutas no reconocidas
    {
      path: '/:pathMatch(.*)*',
      redirect: '/secretaria/inicio',
    },
  ],
})

// Sincronizar automáticamente el rol visual de Pinia tras cada navegación
router.afterEach((to) => {
  const uiStore = useUiStore()
  uiStore.syncRoleWithRoute(to.path)
})

export default router
