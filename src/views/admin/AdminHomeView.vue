<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import { ApiError } from '@/services/api'
import { especialidadesService } from '@/services/especialidadesService'
import { medicosService } from '@/services/medicosService'
import { usuariosService } from '@/services/usuariosService'
import { camasService, alasService } from '@/services/camasService'


const router = useRouter()

const counts = ref({
  especialidades: 0,
  medicos: 0,
  medicosActivos: 0,
  usuarios: 0,
  camas: 0,
  alas: 0,
})

const loadData = async () => {
  const [esp, docs, users, beds, wings] = await Promise.all([
    especialidadesService.getEspecialidades(),
    medicosService.getMedicos(),
    usuariosService.getUsuarios(),
    camasService.getAll(),
    alasService.getAll(),
  ])
  counts.value = {
    especialidades: esp.length,
    medicos: docs.length,
    medicosActivos: docs.filter((m) => m.estado === 'activo').length,
    usuarios: users.length,
    camas: beds.length,
    alas: wings.length,
  }
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudo cargar el panel')
  })
})

const statCards = computed(() => [
  {
    label: 'Especialidades',
    icon: 'bi-award',
    colorClass: 'blue' as const,
    hint: 'Áreas de atención',
    value: String(counts.value.especialidades || '—'),
  },
  {
    label: 'Médicos',
    icon: 'bi-person-badge',
    colorClass: 'blue' as const,
    hint: `${counts.value.medicosActivos} activos`,
    value: String(counts.value.medicos || '—'),
  },
  {
    label: 'Camas',
    icon: 'bi-hospital',
    colorClass: 'green' as const,
    hint: `${counts.value.alas} alas`,
    value: String(counts.value.camas || '—'),
  },
  {
    label: 'Usuarios',
    icon: 'bi-people',
    colorClass: 'rose' as const,
    hint: 'Cuentas del sistema',
    value: String(counts.value.usuarios || '—'),
  },
])

const sections = [
  {
    title: 'Especialidades',
    desc: 'Alta, edición y estado de áreas médicas',
    icon: 'bi-award',
    route: '/admin/especialidades',
  },
  {
    title: 'Médicos',
    desc: 'Padrón profesional y horarios',
    icon: 'bi-person-badge',
    route: '/admin/medicos',
  },
  {
    title: 'Camas',
    desc: 'Infraestructura de alas y camas',
    icon: 'bi-hospital',
    route: '/admin/camas',
  },
  {
    title: 'Usuarios',
    desc: 'Cuentas, roles y acceso',
    icon: 'bi-person-gear',
    route: '/admin/usuarios',
  },
]
</script>

<template>
  <div class="admin-home-view">
    <PageHeader
      title="Inicio"
      description="Resumen del hospital y accesos a la administración."
    />

    <div class="row g-3 mb-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="col-12 col-sm-6 col-xl-3"
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

    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-grid-1x2 text-primary"></i>
          <span>Módulos de administración</span>
        </div>
      </div>
      <div class="hospital-card-body">
        <div class="row g-3">
          <div
            v-for="section in sections"
            :key="section.route"
            class="col-12 col-md-6"
          >
            <button
              type="button"
              class="quick-action-card w-100 text-start border-0"
              @click="router.push(section.route)"
            >
              <div
                class="quick-action-icon"
                style="background-color: var(--hospital-blue-light); color: var(--hospital-blue-primary);"
              >
                <i :class="['bi', section.icon]"></i>
              </div>
              <div class="flex-grow-1">
                <div class="quick-action-text">{{ section.title }}</div>
                <div class="quick-action-sub">{{ section.desc }}</div>
              </div>
              <i class="bi bi-chevron-right text-muted small"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
