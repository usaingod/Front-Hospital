<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'

/**
 * Vista de Inicio — Perfil Enfermería
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Panel general de internación y disponibilidad de camas.
 * - Tarjetas de resumen sin datos ficticios (valores neutros en espera del backend).
 * - Distribución visual de camas por sala con estados (disponible, ocupada, en limpieza).
 * - Accesos rápidos a las secciones principales de Enfermería.
 * - Estados vacíos profesionales cuando no hay datos disponibles.
 */
const router = useRouter()

// Indicadores estadísticos — valores neutros hasta conectar la API
const statCards = [
  {
    label: 'Total de camas',
    icon: 'bi-hospital',
    colorClass: 'rose' as const,
    hint: 'Capacidad total del servicio',
    value: '—',
  },
  {
    label: 'Camas ocupadas',
    icon: 'bi-person-fill',
    colorClass: 'rose' as const,
    hint: 'Con paciente internado',
    value: '—',
  },
  {
    label: 'Camas disponibles',
    icon: 'bi-check-circle',
    colorClass: 'green' as const,
    hint: 'Listas para asignar',
    value: '—',
  },
  {
    label: 'En limpieza',
    icon: 'bi-stars',
    colorClass: 'amber' as const,
    hint: 'Temporalmente fuera de servicio',
    value: '—',
  },
  {
    label: 'Controles pendientes',
    icon: 'bi-clipboard2-pulse',
    colorClass: 'blue' as const,
    hint: 'Signos vitales por registrar',
    value: '—',
  },
]

// Accesos rápidos a las secciones del perfil
const quickActions = [
  {
    title: 'Gestión de camas',
    desc: 'Ver disponibilidad y estado de camas',
    icon: 'bi-hospital',
    route: '/enfermeria/camas',
  },
  {
    title: 'Signos vitales',
    desc: 'Registrar controles de pacientes',
    icon: 'bi-clipboard2-pulse',
    route: '/enfermeria/camas',
  },
  {
    title: 'Pacientes internados',
    desc: 'Consultar información clínica',
    icon: 'bi-person-heart',
    route: '/enfermeria/paciente',
  },
]

// Estado de salas (estructura vacía, sin camas inventadas)
// Se llenará con los datos reales del backend
const salas = ref<{ nombre: string; camas: { id: string; numero: string; estado: 'disponible' | 'ocupada' | 'en_limpieza'; pacienteNombre?: string }[] }[]>([])

const navigate = (route: string) => {
  router.push(route)
}

const getIconPorEstado = (estado: string): string => {
  if (estado === 'disponible') return 'bi-check-circle-fill'
  if (estado === 'ocupada') return 'bi-person-fill'
  return 'bi-stars'
}

const getLabelEstado = (estado: string): string => {
  if (estado === 'disponible') return 'Disponible'
  if (estado === 'ocupada') return 'Ocupada'
  return 'En limpieza'
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Inicio — Enfermería"
      description="Panel general de internación, disponibilidad de camas y controles del servicio."
    />

    <!-- Tarjetas de resumen -->
    <div class="row g-3 mb-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="col-12 col-sm-6 col-xl"
      >
        <StatCard
          :label="card.label"
          :value="card.value"
          :icon="card.icon"
          :color-class="card.colorClass"
          :hint="card.hint"
        />
      </div>
    </div>

    <div class="row g-4">
      <!-- Columna izquierda: Distribución de camas por sala -->
      <div class="col-12 col-lg-8">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-hospital" style="color: var(--hospital-red-primary);"></i>
              <span>Distribución de camas por sala</span>
            </div>
            <!-- Leyenda de estados -->
            <div class="d-flex align-items-center gap-2 flex-wrap">
              <span class="badge-cama-disponible">
                <i class="bi bi-circle-fill" style="font-size: 0.55rem;"></i>
                Disponible
              </span>
              <span class="badge-cama-ocupada">
                <i class="bi bi-circle-fill" style="font-size: 0.55rem;"></i>
                Ocupada
              </span>
              <span class="badge-cama-limpieza">
                <i class="bi bi-circle-fill" style="font-size: 0.55rem;"></i>
                En limpieza
              </span>
            </div>
          </div>
          <div class="hospital-card-body">
            <!-- Estado vacío: sin salas registradas -->
            <div v-if="salas.length === 0">
              <EmptyState
                icon="bi-hospital"
                title="No hay camas registradas"
                description="La distribución de camas por sala estará disponible una vez conectado con el servidor."
              />
            </div>

            <!-- Distribución de salas con sus camas -->
            <div v-else>
              <div
                v-for="sala in salas"
                :key="sala.nombre"
                class="mb-4"
              >
                <div class="d-flex align-items-center gap-2 mb-2">
                  <i class="bi bi-door-open" style="color: var(--hospital-red-primary);"></i>
                  <span class="fw-semibold text-dark">{{ sala.nombre }}</span>
                  <span class="badge bg-light text-muted border ms-1">
                    {{ sala.camas.length }} camas
                  </span>
                </div>
                <div class="d-flex flex-wrap gap-2">
                  <div
                    v-for="cama in sala.camas"
                    :key="cama.id"
                    class="cama-visual-card"
                    :class="cama.estado"
                    :title="cama.estado === 'ocupada' ? cama.pacienteNombre : getLabelEstado(cama.estado)"
                    role="button"
                    tabindex="0"
                    :aria-label="`Cama ${cama.numero} — ${getLabelEstado(cama.estado)}`"
                    @click="router.push('/enfermeria/camas')"
                    @keydown.enter="router.push('/enfermeria/camas')"
                  >
                    <i :class="['bi', getIconPorEstado(cama.estado), 'cama-visual-icon']"></i>
                    <div class="cama-visual-num">{{ cama.numero }}</div>
                    <div class="cama-visual-label">{{ getLabelEstado(cama.estado) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna derecha: Accesos rápidos -->
      <div class="col-12 col-lg-4">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-lightning-charge" style="color: var(--hospital-red-primary);"></i>
              <span>Accesos rápidos</span>
            </div>
          </div>
          <div class="hospital-card-body">
            <div class="d-flex flex-column gap-2">
              <button
                v-for="action in quickActions"
                :key="action.title"
                type="button"
                class="quick-action-card text-start border-0 w-100"
                @click="navigate(action.route)"
              >
                <div
                  class="quick-action-icon"
                  style="background-color: var(--hospital-red-light); color: var(--hospital-red-primary);"
                >
                  <i :class="['bi', action.icon]"></i>
                </div>
                <div>
                  <div class="quick-action-text">{{ action.title }}</div>
                  <div class="quick-action-sub">{{ action.desc }}</div>
                </div>
              </button>
            </div>

            <!-- Estado vacío: sin pacientes internados -->
            <div class="mt-4 pt-3 border-top">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-person-heart" style="color: var(--hospital-red-primary);"></i>
                <span class="fw-semibold text-dark small">Pacientes internados</span>
              </div>
              <EmptyState
                icon="bi-people"
                title="No hay pacientes internados"
                description="Los pacientes internados se mostrarán aquí una vez provistos por el servidor."
                compact
              />
            </div>

            <!-- Estado vacío: sin controles pendientes -->
            <div class="mt-3 pt-3 border-top">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-clipboard2-pulse" style="color: var(--hospital-red-primary);"></i>
                <span class="fw-semibold text-dark small">Controles pendientes</span>
              </div>
              <EmptyState
                icon="bi-clipboard-check"
                title="No hay controles pendientes"
                description="Los controles de signos vitales pendientes se listarán aquí al conectar con el servidor."
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
