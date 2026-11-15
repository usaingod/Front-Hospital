<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Cama } from '@/types/internacion'
import type { Paciente } from '@/types/paciente'
import { ApiError } from '@/services/api'
import { camasService, internacionService } from '@/services/camasService'

const router = useRouter()
const camas = ref<Cama[]>([])
const pacientesInternados = ref<Paciente[]>([])

const loadData = async () => {
  const [beds, internados] = await Promise.all([
    camasService.getAll(),
    internacionService.pacientesInternados(),
  ])
  camas.value = beds
  pacientesInternados.value = internados.patients
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudo cargar el panel')
  })
})

const statCards = computed(() => {
  const total = camas.value.length
  const ocupadas = camas.value.filter((c) => c.estado === 'ocupada').length
  const disponibles = camas.value.filter((c) => c.estado === 'disponible').length
  const limpieza = camas.value.filter((c) => c.estado === 'en_limpieza').length
  return [
    {
      label: 'Total de camas',
      icon: 'bi-hospital',
      colorClass: 'rose' as const,
      hint: 'Capacidad total del servicio',
      value: String(total || '—'),
    },
    {
      label: 'Camas ocupadas',
      icon: 'bi-person-fill',
      colorClass: 'rose' as const,
      hint: 'Con paciente internado',
      value: String(ocupadas || '—'),
    },
    {
      label: 'Camas disponibles',
      icon: 'bi-check-circle',
      colorClass: 'green' as const,
      hint: 'Listas para asignar',
      value: String(disponibles || '—'),
    },
    {
      label: 'En limpieza',
      icon: 'bi-stars',
      colorClass: 'amber' as const,
      hint: 'Temporalmente fuera de servicio',
      value: String(limpieza || '—'),
    },
    {
      label: 'Pacientes internados',
      icon: 'bi-clipboard2-pulse',
      colorClass: 'blue' as const,
      hint: 'Activos en el servicio',
      value: String(pacientesInternados.value.length || '—'),
    },
  ]
})

const salas = computed(() => {
  const bySala = new Map<string, Cama[]>()
  for (const cama of camas.value) {
    if (cama.estado === 'bloqueada') continue
    const key = cama.sala || 'Sin sala'
    const list = bySala.get(key) || []
    list.push(cama)
    bySala.set(key, list)
  }
  return Array.from(bySala.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([nombre, list]) => ({
      nombre,
      camas: list.map((c) => ({
        id: String(c.id),
        numero: c.numero,
        estado: (c.estado === 'disponible' || c.estado === 'ocupada' || c.estado === 'en_limpieza'
          ? c.estado
          : 'en_limpieza') as 'disponible' | 'ocupada' | 'en_limpieza',
        pacienteNombre: c.pacienteNombre,
      })),
    }))
})

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

const navigate = (route: string) => {
  void router.push(route)
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
    <PageHeader
      title="Inicio — Enfermería"
      description="Panel general de internación, disponibilidad de camas y controles del servicio."
    />

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
      <div class="col-12 col-lg-8">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-hospital" style="color: var(--hospital-red-primary);"></i>
              <span>Distribución de camas por sala</span>
            </div>
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
            <div v-if="salas.length === 0">
              <EmptyState
                icon="bi-hospital"
                title="No hay camas registradas"
                description="La distribución de camas por sala estará disponible una vez conectado con el servidor."
              />
            </div>
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

            <div class="mt-4 pt-3 border-top">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="bi bi-person-heart" style="color: var(--hospital-red-primary);"></i>
                <span class="fw-semibold text-dark small">Pacientes internados</span>
              </div>
              <div v-if="pacientesInternados.length === 0">
                <EmptyState
                  icon="bi-people"
                  title="No hay pacientes internados"
                  description="Los pacientes internados se mostrarán aquí una vez provistos por el servidor."
                  compact
                />
              </div>
              <ul v-else class="list-unstyled mb-0">
                <li
                  v-for="paciente in pacientesInternados.slice(0, 5)"
                  :key="paciente.id"
                  class="d-flex justify-content-between align-items-center py-1 border-bottom"
                >
                  <span class="small">{{ paciente.apellido }}, {{ paciente.nombre }}</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-link text-decoration-none"
                    @click="router.push('/enfermeria/paciente')"
                  >
                    Ver
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
