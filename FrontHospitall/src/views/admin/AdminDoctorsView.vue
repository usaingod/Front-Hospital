<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Medico, CreateMedicoDTO } from '@/types/medico'

/**
 * Vista: Gestión de Médicos del Administrador (AdminDoctorsView.vue)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Padrón general del cuerpo médico y datos de contacto/consultorio.
 * - Sin duplicar la configuración de horarios semanales (exclusiva de Secretaría).
 * - Indicadores con guión neutral sin datos ficticios inventados.
 * - Filtros por búsqueda, especialidad y estado profesional.
 * - Modal visual para consultar, dar de alta y editar datos del médico.
 */

// Colección reactiva de médicos (inicia vacía sin datos inventados)
const medicos = ref<Medico[]>([])

// Indicadores estadísticos sin datos ficticios
const statCards = [
  {
    label: 'Total Médicos',
    icon: 'bi-person-badge',
    colorClass: 'blue' as const,
    hint: 'Padrón médico registrado',
    value: '—',
  },
  {
    label: 'Médicos Activos',
    icon: 'bi-person-check',
    colorClass: 'green' as const,
    hint: 'Disponibles para asignación',
    value: '—',
  },
  {
    label: 'En Licencia / Inactivos',
    icon: 'bi-person-x',
    colorClass: 'rose' as const,
    hint: 'Temporalmente no operativos',
    value: '—',
  },
]

// Filtros y búsqueda
const searchQuery = ref('')
const filterEspecialidad = ref('')
const filterEstado = ref('')

// Estado del Modal de Médico
const isModalOpen = ref(false)
const modalMode = ref<'crear' | 'editar' | 'consultar'>('crear')
const selectedDoctor = ref<Medico | null>(null)

// Formulario de médico (campos vacíos con placeholders descriptivos)
const form = ref<CreateMedicoDTO>({
  nombre: '',
  apellido: '',
  especialidad: '',
  matricula: '',
  telefono: '',
  email: '',
  direccionConsultorio: '',
  observaciones: '',
  estado: 'activo',
})

// Especialidades médicas para el selector
const availableSpecialties = [
  'Cardiología',
  'Pediatría',
  'Traumatología',
  'Dermatología',
  'Ginecología',
  'Oftalmología',
  'Neurología',
  'Clínica Médica',
]

// Modal para Crear
const openCreateModal = () => {
  modalMode.value = 'crear'
  selectedDoctor.value = null
  form.value = {
    nombre: '',
    apellido: '',
    especialidad: '',
    matricula: '',
    telefono: '',
    email: '',
    direccionConsultorio: '',
    observaciones: '',
    estado: 'activo',
  }
  isModalOpen.value = true
}

// Modal para Consultar
const openViewModal = (doctor: Medico) => {
  modalMode.value = 'consultar'
  selectedDoctor.value = doctor
  form.value = {
    nombre: doctor.nombre,
    apellido: doctor.apellido || '',
    especialidad: doctor.especialidad,
    matricula: doctor.matricula,
    telefono: doctor.telefono || '',
    email: doctor.email || '',
    direccionConsultorio: doctor.direccionConsultorio || doctor.consultorio || '',
    observaciones: doctor.observaciones || '',
    estado: doctor.estado,
  }
  isModalOpen.value = true
}

// Modal para Editar
const openEditModal = (doctor: Medico) => {
  modalMode.value = 'editar'
  selectedDoctor.value = doctor
  form.value = {
    nombre: doctor.nombre,
    apellido: doctor.apellido || '',
    especialidad: doctor.especialidad,
    matricula: doctor.matricula,
    telefono: doctor.telefono || '',
    email: doctor.email || '',
    direccionConsultorio: doctor.direccionConsultorio || doctor.consultorio || '',
    observaciones: doctor.observaciones || '',
    estado: doctor.estado,
  }
  isModalOpen.value = true
}

// Acción visual para Eliminar
const handleDelete = (doctor: Medico) => {
  if (confirm(`¿Desea dar de baja al Dr/a. ${doctor.nombre} ${doctor.apellido || ''}?`)) {
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

// Filtrado reactivo de la lista de médicos
const filteredDoctors = computed(() => {
  return medicos.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesQuery =
      !q ||
      item.nombre.toLowerCase().includes(q) ||
      (item.apellido && item.apellido.toLowerCase().includes(q)) ||
      item.matricula.toLowerCase().includes(q)

    const matchesEspecialidad =
      !filterEspecialidad.value || item.especialidad === filterEspecialidad.value

    const matchesEstado =
      !filterEstado.value || item.estado === filterEstado.value

    return matchesQuery && matchesEspecialidad && matchesEstado
  })
})
</script>

<template>
  <div class="admin-doctors-view">
    <!-- Encabezado con acción principal -->
    <PageHeader
      title="Gestión de Médicos"
      description="Padrón general del cuerpo médico, datos de colegiatura, consultorios y contacto."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-hospital-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-person-plus"></i>
          <span>Nuevo médico</span>
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
        <div class="col-12 col-md-5 col-lg-4">
          <label class="form-label" for="doctor-search">Buscar médico</label>
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              id="doctor-search"
              v-model="searchQuery"
              type="text"
              class="form-control ps-5"
              placeholder="Buscar por nombre o matrícula..."
            />
          </div>
        </div>

        <!-- Filtro por especialidad -->
        <div class="col-12 col-md-4 col-lg-3">
          <label class="form-label" for="doctor-spec-filter">Especialidad</label>
          <select
            id="doctor-spec-filter"
            v-model="filterEspecialidad"
            class="form-select"
          >
            <option value="">Todas las especialidades</option>
            <option
              v-for="spec in availableSpecialties"
              :key="spec"
              :value="spec"
            >
              {{ spec }}
            </option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div class="col-12 col-md-3 col-lg-3">
          <label class="form-label" for="doctor-status-filter">Estado</label>
          <select
            id="doctor-status-filter"
            v-model="filterEstado"
            class="form-select"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="licencia">En Licencia</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="col-12 col-md-12 col-lg-2 d-flex align-items-end">
          <button
            type="button"
            class="btn btn-hospital-outline w-100"
            :disabled="!searchQuery && !filterEspecialidad && !filterEstado"
            @click="searchQuery = ''; filterEspecialidad = ''; filterEstado = ''"
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
          <i class="bi bi-person-badge text-primary"></i>
          <span>Padrón de Profesionales Médicos</span>
        </h2>
        <div class="text-muted small">
          {{ filteredDoctors.length }} médicos registrados
        </div>
      </div>

      <div class="p-0">
        <div class="hospital-table-wrapper border-0">
          <table class="hospital-table">
            <thead>
              <tr>
                <th style="width: 25%;">Médico</th>
                <th style="width: 15%;">Especialidad</th>
                <th style="width: 12%;">Matrícula</th>
                <th style="width: 20%;">Contacto</th>
                <th style="width: 13%;">Consultorio</th>
                <th style="width: 15%; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Filas cuando existan médicos -->
              <tr
                v-for="doctor in filteredDoctors"
                :key="doctor.id"
              >
                <td>
                  <div class="fw-semibold text-dark">
                    {{ doctor.nombre }} {{ doctor.apellido || '' }}
                  </div>
                  <div class="small">
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
                  </div>
                </td>
                <td>
                  <span class="badge rounded-pill text-bg-light border">
                    {{ doctor.especialidad }}
                  </span>
                </td>
                <td class="font-monospace small">
                  {{ doctor.matricula }}
                </td>
                <td class="small">
                  <div v-if="doctor.email" class="text-truncate" style="max-width: 180px;">
                    <i class="bi bi-envelope text-muted me-1"></i>{{ doctor.email }}
                  </div>
                  <div v-if="doctor.telefono" class="text-muted">
                    <i class="bi bi-telephone text-muted me-1"></i>{{ doctor.telefono }}
                  </div>
                </td>
                <td class="small text-secondary">
                  {{ doctor.direccionConsultorio || doctor.consultorio || '—' }}
                </td>
                <td style="text-align: right;">
                  <div class="d-inline-flex gap-1">
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Consultar ficha médica"
                      @click="openViewModal(doctor)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Editar datos del médico"
                      @click="openEditModal(doctor)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon danger"
                      title="Dar de baja médico"
                      @click="handleDelete(doctor)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Estado vacío discreto dentro de la tabla -->
              <tr v-if="filteredDoctors.length === 0">
                <td colspan="6" class="p-0">
                  <EmptyState
                    icon="bi-person-badge"
                    title="No se encontraron médicos"
                    description="Actualmente no hay médicos registrados en el sistema o ninguno coincide con los criterios de búsqueda aplicados."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn btn-hospital-primary btn-sm"
                        @click="openCreateModal"
                      >
                        <i class="bi bi-person-plus"></i>
                        <span>Registrar primer médico</span>
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

    <!-- Modal para Registrar / Editar / Consultar Médico -->
    <BaseModal
      :is-open="isModalOpen"
      :title="
        modalMode === 'crear'
          ? 'Registrar Nuevo Médico'
          : modalMode === 'editar'
          ? 'Editar Datos del Médico'
          : 'Ficha Técnica del Profesional'
      "
      icon="bi-person-badge"
      icon-color-class="text-primary"
      size="lg"
      @close="closeModal"
    >
      <form @submit.prevent="handleSave">
        <div class="row g-3">
          <!-- Nombre -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-nombre">
              Nombre <span class="text-danger">*</span>
            </label>
            <input
              id="doc-nombre"
              v-model="form.nombre"
              type="text"
              class="form-control"
              placeholder="Ingresá el nombre"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Apellido -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-apellido">
              Apellido <span class="text-danger">*</span>
            </label>
            <input
              id="doc-apellido"
              v-model="form.apellido"
              type="text"
              class="form-control"
              placeholder="Ingresá el apellido"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Especialidad -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-especialidad">
              Especialidad médica <span class="text-danger">*</span>
            </label>
            <select
              id="doc-especialidad"
              v-model="form.especialidad"
              class="form-select"
              :disabled="modalMode === 'consultar'"
              required
            >
              <option value="" disabled>Seleccioná una especialidad</option>
              <option
                v-for="spec in availableSpecialties"
                :key="spec"
                :value="spec"
              >
                {{ spec }}
              </option>
            </select>
          </div>

          <!-- Matrícula Profesional -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-matricula">
              Matrícula profesional <span class="text-danger">*</span>
            </label>
            <input
              id="doc-matricula"
              v-model="form.matricula"
              type="text"
              class="form-control"
              placeholder="Ej: MP-45892"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Teléfono de contacto -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-telefono">Teléfono</label>
            <input
              id="doc-telefono"
              v-model="form.telefono"
              type="tel"
              class="form-control"
              placeholder="Ej: +54 9 11 4455-6677"
              :disabled="modalMode === 'consultar'"
            />
          </div>

          <!-- Email institucional -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-email">Email institucional</label>
            <input
              id="doc-email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="Ej: medico@hospital.gob.ar"
              :disabled="modalMode === 'consultar'"
            />
          </div>

          <!-- Dirección del Consultorio -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-consultorio">Dirección del consultorio</label>
            <input
              id="doc-consultorio"
              v-model="form.direccionConsultorio"
              type="text"
              class="form-control"
              placeholder="Ej: Consultorio 102 - Ala Norte"
              :disabled="modalMode === 'consultar'"
            />
          </div>

          <!-- Estado profesional -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="doc-estado">
              Estado profesional <span class="text-danger">*</span>
            </label>
            <select
              id="doc-estado"
              v-model="form.estado"
              class="form-select"
              :disabled="modalMode === 'consultar'"
              required
            >
              <option value="activo">Activo (habilitado para asignación)</option>
              <option value="licencia">En Licencia (temporalmente inactivo)</option>
              <option value="inactivo">Inactivo (dado de baja)</option>
            </select>
          </div>

          <!-- Observaciones y antecedentes -->
          <div class="col-12">
            <label class="form-label" for="doc-observaciones">Observaciones adicionales</label>
            <textarea
              id="doc-observaciones"
              v-model="form.observaciones"
              class="form-control"
              rows="3"
              placeholder="Antecedentes, notas de acreditación, días habituales o restricciones clínicas..."
              :disabled="modalMode === 'consultar'"
            ></textarea>
          </div>
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
          <span>{{ modalMode === 'crear' ? 'Guardar médico' : 'Actualizar médico' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
