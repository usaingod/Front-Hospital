<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Especialidad } from '@/types/especialidad'
import type { Medico } from '@/types/medico'

/**
 * Vista: Inicio del Administrador (AdminHomeView.vue)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Tarjetas estadísticas para especialidades y médicos con guión (sin datos ficticios).
 * - Sección 'Especialidades y Médicos' con buscador visual y grilla adaptativa.
 * - Grilla preparada para expandir y contraer tarjetas con tablas internas de médicos.
 * - Estado vacío discreto mientras no existan registros provenientes del backend.
 */
const router = useRouter()

// Tarjetas estadísticas sin cantidades ficticias (valores en guión según especificación)
const statCards = [
  {
    label: 'Especialidades',
    icon: 'bi-award',
    colorClass: 'blue' as const,
    hint: 'Áreas de atención médica',
    value: '—',
  },
  {
    label: 'Médicos Registrados',
    icon: 'bi-person-badge',
    colorClass: 'blue' as const,
    hint: 'Padrón profesional total',
    value: '—',
  },
  {
    label: 'Médicos Activos',
    icon: 'bi-person-check',
    colorClass: 'green' as const,
    hint: 'Disponibles en el sistema',
    value: '—',
  },
  {
    label: 'Médicos Inactivos',
    icon: 'bi-person-x',
    colorClass: 'rose' as const,
    hint: 'En licencia o inactivos',
    value: '—',
  },
]

// Accesos directos a la gestión de administración
const quickAdminActions = [
  {
    title: 'Especialidades',
    desc: 'Registrar y configurar áreas médicas',
    icon: 'bi-award',
    route: '/admin/especialidades',
  },
  {
    title: 'Médicos',
    desc: 'Padrón y datos de profesionales',
    icon: 'bi-person-badge',
    route: '/admin/medicos',
  },
  {
    title: 'Usuarios',
    desc: 'Cuentas de acceso y roles del hospital',
    icon: 'bi-people-gear',
    route: '/admin/usuarios',
  },
]

// Colección reactiva de especialidades (inicia vacía sin datos ficticios)
const especialidades = ref<(Especialidad & { medicosAsociados?: Medico[] })[]>([])

// Búsqueda de especialidades
const searchSpecialtyQuery = ref('')

// Control de tarjetas expandidas (conjunto reactivo de IDs)
const expandedSpecialtyIds = ref<Set<string | number>>(new Set())

const toggleExpandSpecialty = (id: string | number) => {
  if (expandedSpecialtyIds.value.has(id)) {
    expandedSpecialtyIds.value.delete(id)
  } else {
    expandedSpecialtyIds.value.add(id)
  }
}

const isSpecialtyExpanded = (id: string | number) => {
  return expandedSpecialtyIds.value.has(id)
}

// Especialidades filtradas reactivamente
const filteredSpecialties = computed(() => {
  if (!searchSpecialtyQuery.value.trim()) {
    return especialidades.value
  }
  const q = searchSpecialtyQuery.value.toLowerCase()
  return especialidades.value.filter(
    (e) =>
      e.nombre.toLowerCase().includes(q) ||
      (e.descripcion && e.descripcion.toLowerCase().includes(q))
  )
})
</script>

<template>
  <div class="admin-home-view">
    <!-- Encabezado de la página -->
    <PageHeader
      title="Inicio"
      description="Panel general de administración, monitoreo de especialidades y cuerpo médico hospitalario."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-hospital-primary"
          @click="router.push('/admin/especialidades')"
        >
          <i class="bi bi-award"></i>
          <span>Gestionar Especialidades</span>
        </button>
      </template>
    </PageHeader>

    <!-- Indicadores estadísticos (4 tarjetas sin datos ficticios) -->
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

    <!-- Accesos rápidos a operaciones del administrador -->
    <div class="row g-3 mb-4">
      <div
        v-for="action in quickAdminActions"
        :key="action.title"
        class="col-12 col-md-4"
      >
        <router-link :to="action.route" class="quick-action-card">
          <div
            class="quick-action-icon"
            style="background-color: var(--hospital-blue-light); color: var(--hospital-blue-primary);"
          >
            <i :class="['bi', action.icon]"></i>
          </div>
          <div class="flex-grow-1">
            <div class="quick-action-text">{{ action.title }}</div>
            <div class="quick-action-sub">{{ action.desc }}</div>
          </div>
          <i class="bi bi-chevron-right text-muted small"></i>
        </router-link>
      </div>
    </div>

    <!-- Sección principal: Especialidades y Médicos -->
    <div class="hospital-card">
      <div class="hospital-card-header">
        <h2 class="hospital-card-title">
          <i class="bi bi-diagram-3 text-primary"></i>
          <span>Especialidades y Médicos</span>
        </h2>

        <!-- Campo de búsqueda de especialidades -->
        <div class="hospital-search-wrapper" style="width: 320px;">
          <i class="bi bi-search hospital-search-icon"></i>
          <input
            v-model="searchSpecialtyQuery"
            type="text"
            class="hospital-search-input"
            placeholder="Buscar especialidad..."
            aria-label="Buscar especialidad médica"
          />
        </div>
      </div>

      <div class="hospital-card-body">
        <!-- Grilla de tarjetas de especialidades (cuando existan datos del backend) -->
        <div
          v-if="filteredSpecialties.length > 0"
          class="row g-3"
        >
          <div
            v-for="specialty in filteredSpecialties"
            :key="specialty.id"
            class="col-12 col-lg-6"
          >
            <div class="specialty-expand-card">
              <!-- Cabecera de la tarjeta con botón de expansión -->
              <div
                class="specialty-expand-header"
                role="button"
                tabindex="0"
                :aria-expanded="isSpecialtyExpanded(specialty.id)"
                @click="toggleExpandSpecialty(specialty.id)"
                @keydown.enter="toggleExpandSpecialty(specialty.id)"
              >
                <div class="d-flex align-items-center gap-3 min-w-0">
                  <div class="specialty-icon-badge">
                    <i :class="['bi', specialty.icono || 'bi-award']"></i>
                  </div>
                  <div>
                    <h3 class="fs-6 fw-bold text-dark mb-0">
                      {{ specialty.nombre }}
                    </h3>
                    <p class="text-muted small mb-0 text-truncate" style="max-width: 280px;">
                      {{ specialty.descripcion || 'Sin descripción' }}
                    </p>
                  </div>
                </div>

                <div class="d-flex align-items-center gap-2">
                  <span class="badge rounded-pill text-bg-light border">
                    {{ specialty.cantidadMedicos || 0 }} médicos
                  </span>
                  <button
                    type="button"
                    class="btn btn-sm btn-link text-muted p-0"
                    :aria-label="isSpecialtyExpanded(specialty.id) ? 'Contraer' : 'Expandir'"
                  >
                    <i
                      :class="[
                        'bi fs-5',
                        isSpecialtyExpanded(specialty.id) ? 'bi-chevron-up' : 'bi-chevron-down',
                      ]"
                    ></i>
                  </button>
                </div>
              </div>

              <!-- Cuerpo expandido: Tabla preparada para mostrar los médicos asociados -->
              <div
                v-if="isSpecialtyExpanded(specialty.id)"
                class="specialty-expand-body"
              >
                <div class="d-flex align-items-center justify-content-between mb-2">
                  <div class="small fw-bold text-secondary text-uppercase">
                    Médicos Asociados
                  </div>
                  <router-link
                    to="/admin/medicos"
                    class="small text-decoration-none text-primary"
                  >
                    Gestionar médicos
                  </router-link>
                </div>

                <div class="hospital-table-wrapper bg-white">
                  <table class="hospital-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Matrícula</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-if="!specialty.medicosAsociados || specialty.medicosAsociados.length === 0"
                      >
                        <td colspan="3" class="text-center py-3 text-muted small">
                          No hay médicos asociados registrados en esta especialidad.
                        </td>
                      </tr>
                      <tr
                        v-for="doctor in specialty.medicosAsociados"
                        v-else
                        :key="doctor.id"
                      >
                        <td class="fw-semibold">
                          {{ doctor.nombre }} {{ doctor.apellido || '' }}
                        </td>
                        <td>{{ doctor.matricula }}</td>
                        <td>
                          <span
                            class="badge-status"
                            :class="{
                              active: doctor.estado === 'activo',
                              license: doctor.estado === 'licencia',
                              inactive: doctor.estado === 'inactivo',
                            }"
                          >
                            {{ doctor.estado }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío sin datos ficticios -->
        <EmptyState
          v-else
          icon="bi-diagram-3"
          title="No hay especialidades cargadas"
          description="Las especialidades y los médicos asociados se mostrarán organizados en esta grilla adaptativa en cuanto se conecten con el backend."
        >
          <template #actions>
            <button
              type="button"
              class="btn btn-hospital-primary"
              @click="router.push('/admin/especialidades')"
            >
              <i class="bi bi-plus-lg"></i>
              <span>Registrar Especialidad</span>
            </button>
          </template>
        </EmptyState>
      </div>
    </div>
  </div>
</template>
