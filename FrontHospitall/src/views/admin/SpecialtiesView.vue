<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Especialidad, CreateEspecialidadDTO } from '@/types/especialidad'

/**
 * Vista: Gestión de Especialidades (SpecialtiesView.vue)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Indicadores clave con guión neutral (sin cifras ficticias).
 * - Tabla con encabezados completos y estado vacío estandarizado.
 * - Filtros por término de búsqueda y por estado (Activa / Inactiva).
 * - Modal visual para consultar, crear y editar especialidades.
 * - Sin simular persistencia ni llamadas a backend en esta etapa.
 */

// Colección reactiva de especialidades (inicia vacía sin datos ficticios)
const especialidades = ref<Especialidad[]>([])

// Indicadores estadísticos sin datos ficticios
const statCards = [
  {
    label: 'Total Especialidades',
    icon: 'bi-award',
    colorClass: 'blue' as const,
    hint: 'Registradas en el hospital',
    value: '—',
  },
  {
    label: 'Especialidades Activas',
    icon: 'bi-check-circle',
    colorClass: 'green' as const,
    hint: 'Habilitadas para asignación',
    value: '—',
  },
  {
    label: 'Médicos Asignados',
    icon: 'bi-people',
    colorClass: 'amber' as const,
    hint: 'Distribuídos en las áreas',
    value: '—',
  },
]

// Filtros y búsqueda
const searchQuery = ref('')
const filterEstado = ref('')

// Estado del Modal de Alta / Edición / Consulta
const isModalOpen = ref(false)
const modalMode = ref<'crear' | 'editar' | 'consultar'>('crear')
const selectedSpecialty = ref<Especialidad | null>(null)

// Formulario de especialidad (campos vacíos con placeholders descriptivos)
const form = ref<CreateEspecialidadDTO>({
  nombre: '',
  descripcion: '',
  icono: 'bi-award',
  estado: 'activa',
})

// Opciones de iconos representativos para especialidades
const iconOptions = [
  { label: 'General / Premio (bi-award)', value: 'bi-award' },
  { label: 'Cardiología (bi-heart-pulse)', value: 'bi-heart-pulse' },
  { label: 'Neumonología / Respiratorio (bi-lungs)', value: 'bi-lungs' },
  { label: 'Oftalmología (bi-eye)', value: 'bi-eye' },
  { label: 'Farmacología / Medicación (bi-capsule)', value: 'bi-capsule' },
  { label: 'Traumatología (bi-bandaid)', value: 'bi-bandaid' },
  { label: 'Pediatría / Cuidados (bi-person-heart)', value: 'bi-person-heart' },
  { label: 'Cirugía / Instrumentación (bi-scissors)', value: 'bi-scissors' },
]

// Modal para Crear
const openCreateModal = () => {
  modalMode.value = 'crear'
  selectedSpecialty.value = null
  form.value = {
    nombre: '',
    descripcion: '',
    icono: 'bi-award',
    estado: 'activa',
  }
  isModalOpen.value = true
}

// Modal para Consultar
const openViewModal = (specialty: Especialidad) => {
  modalMode.value = 'consultar'
  selectedSpecialty.value = specialty
  form.value = {
    nombre: specialty.nombre,
    descripcion: specialty.descripcion,
    icono: specialty.icono || 'bi-award',
    estado: specialty.estado,
  }
  isModalOpen.value = true
}

// Modal para Editar
const openEditModal = (specialty: Especialidad) => {
  modalMode.value = 'editar'
  selectedSpecialty.value = specialty
  form.value = {
    nombre: specialty.nombre,
    descripcion: specialty.descripcion,
    icono: specialty.icono || 'bi-award',
    estado: specialty.estado,
  }
  isModalOpen.value = true
}

// Acción visual para Eliminar
const handleDelete = (specialty: Especialidad) => {
  if (confirm(`¿Desea eliminar la especialidad "${specialty.nombre}"?`)) {
    alert('Acción visual. La eliminación se efectuará con la API en el backend.')
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSave = () => {
  alert('Acción visual de guardado. El backend procesará la operación en la etapa de integración.')
  closeModal()
}

// Filtrado reactivo de la lista de especialidades
const filteredSpecialties = computed(() => {
  return especialidades.value.filter((item) => {
    const matchesQuery =
      !searchQuery.value.trim() ||
      item.nombre.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.descripcion.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesEstado =
      !filterEstado.value || item.estado === filterEstado.value

    return matchesQuery && matchesEstado
  })
})
</script>

<template>
  <div class="specialties-view">
    <!-- Encabezado con acción principal -->
    <PageHeader
      title="Gestión de Especialidades"
      description="Registro, edición y control de las áreas médicas y especialidades del hospital."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-hospital-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-plus-lg"></i>
          <span>Nueva especialidad</span>
        </button>
      </template>
    </PageHeader>

    <!-- Indicadores estadísticos sin datos ficticios -->
    <div class="row g-3 mb-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="col-12 col-md-4"
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

    <!-- Barra de filtros y búsqueda -->
    <div class="hospital-filter-bar">
      <div class="row g-3 align-items-center">
        <!-- Campo de búsqueda -->
        <div class="col-12 col-md-6 col-lg-5">
          <label class="form-label" for="specialty-search">Buscar especialidad</label>
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              id="specialty-search"
              v-model="searchQuery"
              type="text"
              class="form-control ps-5"
              placeholder="Buscar por nombre o descripción..."
            />
          </div>
        </div>

        <!-- Filtro por estado -->
        <div class="col-12 col-md-4 col-lg-3">
          <label class="form-label" for="specialty-status-filter">Filtrar por estado</label>
          <select
            id="specialty-status-filter"
            v-model="filterEstado"
            class="form-select"
          >
            <option value="">Todos los estados</option>
            <option value="activa">Activas</option>
            <option value="inactiva">Inactivas</option>
          </select>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="col-12 col-md-2 col-lg-2 d-flex align-items-end">
          <button
            type="button"
            class="btn btn-hospital-outline w-100"
            :disabled="!searchQuery && !filterEstado"
            @click="searchQuery = ''; filterEstado = ''"
          >
            <i class="bi bi-x-circle"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenedor de la Tabla -->
    <div class="hospital-card">
      <div class="hospital-card-header">
        <h2 class="hospital-card-title">
          <i class="bi bi-award text-primary"></i>
          <span>Padrón de Especialidades</span>
        </h2>
        <div class="text-muted small">
          {{ filteredSpecialties.length }} registros disponibles
        </div>
      </div>

      <div class="p-0">
        <div class="hospital-table-wrapper border-0">
          <table class="hospital-table">
            <thead>
              <tr>
                <th style="width: 28%;">Nombre</th>
                <th style="width: 32%;">Descripción</th>
                <th style="width: 15%;">Cantidad de médicos</th>
                <th style="width: 10%;">Estado</th>
                <th style="width: 15%; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Listado cuando existan registros -->
              <tr
                v-for="specialty in filteredSpecialties"
                :key="specialty.id"
              >
                <td class="fw-semibold">
                  <div class="d-flex align-items-center gap-2">
                    <i :class="['bi', specialty.icono || 'bi-award', 'text-primary']"></i>
                    <span>{{ specialty.nombre }}</span>
                  </div>
                </td>
                <td class="text-secondary small">
                  {{ specialty.descripcion || '—' }}
                </td>
                <td>
                  <span class="badge rounded-pill text-bg-light border">
                    {{ specialty.cantidadMedicos || 0 }} médicos
                  </span>
                </td>
                <td>
                  <span
                    class="badge-status"
                    :class="{
                      active: specialty.estado === 'activa',
                      inactive: specialty.estado === 'inactiva',
                    }"
                  >
                    {{ specialty.estado === 'activa' ? 'Activa' : 'Inactiva' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="d-inline-flex gap-1">
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Consultar especialidad"
                      @click="openViewModal(specialty)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Editar especialidad"
                      @click="openEditModal(specialty)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon danger"
                      title="Eliminar especialidad"
                      @click="handleDelete(specialty)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Estado vacío discreto dentro de la tabla -->
              <tr v-if="filteredSpecialties.length === 0">
                <td colspan="5" class="p-0">
                  <EmptyState
                    icon="bi-award"
                    title="No se encontraron especialidades"
                    description="Actualmente no hay especialidades registradas en el sistema o ninguna coincide con los filtros aplicados."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn btn-hospital-primary btn-sm"
                        @click="openCreateModal"
                      >
                        <i class="bi bi-plus-lg"></i>
                        <span>Registrar especialidad</span>
                      </button>
                    </template>
                  </EmptyState>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal para Crear / Editar / Consultar Especialidad -->
    <BaseModal
      :is-open="isModalOpen"
      :title="
        modalMode === 'crear'
          ? 'Nueva Especialidad'
          : modalMode === 'editar'
          ? 'Editar Especialidad'
          : 'Consulta de Especialidad'
      "
      icon="bi-award"
      icon-color-class="text-primary"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="handleSave">
        <!-- Nombre de la especialidad -->
        <div class="mb-3">
          <label class="form-label" for="specialty-name">
            Nombre de la especialidad <span class="text-danger">*</span>
          </label>
          <input
            id="specialty-name"
            v-model="form.nombre"
            type="text"
            class="form-control"
            placeholder="Ingresá el nombre (Ej: Cardiología)"
            :disabled="modalMode === 'consultar'"
            required
          />
        </div>

        <!-- Descripción -->
        <div class="mb-3">
          <label class="form-label" for="specialty-desc">
            Descripción y alcance asistencial
          </label>
          <textarea
            id="specialty-desc"
            v-model="form.descripcion"
            class="form-control"
            rows="3"
            placeholder="Ingresá una breve descripción de los servicios y tratamientos de esta especialidad..."
            :disabled="modalMode === 'consultar'"
          ></textarea>
        </div>

        <!-- Icono representativo -->
        <div class="mb-3">
          <label class="form-label" for="specialty-icon">
            Icono representativo
          </label>
          <select
            id="specialty-icon"
            v-model="form.icono"
            class="form-select"
            :disabled="modalMode === 'consultar'"
          >
            <option
              v-for="opt in iconOptions"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Estado -->
        <div class="mb-3">
          <label class="form-label" for="specialty-status">
            Estado de la especialidad <span class="text-danger">*</span>
          </label>
          <select
            id="specialty-status"
            v-model="form.estado"
            class="form-select"
            :disabled="modalMode === 'consultar'"
            required
          >
            <option value="activa">Activa (disponible para asignación)</option>
            <option value="inactiva">Inactiva (suspendida temporalmente)</option>
          </select>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-hospital-outline"
          @click="closeModal"
        >
          {{ modalMode === 'consultar' ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="modalMode !== 'consultar'"
          type="button"
          class="btn btn-hospital-primary"
          @click="handleSave"
        >
          <i class="bi bi-check2"></i>
          <span>{{ modalMode === 'crear' ? 'Guardar especialidad' : 'Actualizar especialidad' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
