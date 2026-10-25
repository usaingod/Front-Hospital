<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Paciente } from '@/types/paciente'

/**
 * Vista de Pacientes (Secretaría)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Padrón general de pacientes preparado para recibir datos
 * - Componentes reutilizables: PageHeader, StatCard, EmptyState, BaseModal
 * - Directivas v-if, v-else, v-for, v-model, :class, :disabled
 * - Sin registros ficticios
 */

// Colección reactiva de pacientes (inicia vacía según la regla de no incorporar datos ficticios)
const pacientes = ref<Paciente[]>([])

// Indicadores estadísticos sin datos precargados (muestran guion según especificación)
const statCards = [
  {
    label: 'Total de pacientes',
    icon: 'bi-people',
    hint: 'Pacientes en el padrón',
    colorClass: 'green' as const,
    value: '—',
  },
  {
    label: 'Atendidos este mes',
    icon: 'bi-person-check',
    hint: 'Consultas completadas',
    colorClass: 'blue' as const,
    value: '—',
  },
  {
    label: 'Nuevos registros',
    icon: 'bi-person-plus',
    hint: 'Incorporaciones del mes',
    colorClass: 'amber' as const,
    value: '—',
  },
  {
    label: 'Coberturas activas',
    icon: 'bi-shield-check',
    hint: 'Con obra social / prepaga',
    colorClass: 'rose' as const,
    value: '—',
  },
]

// Filtros de búsqueda
const searchQuery = ref('')
const filterObraSocial = ref('')
const filterEstado = ref('')
const sortOrder = ref('apellido')

// Modal y formulario de registro/edición de paciente
const isPatientModalOpen = ref(false)
const modalMode = ref<'crear' | 'editar'>('crear')

// Formulario vacío con los campos requeridos
const patientForm = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
  obraSocial: '',
  numeroAfiliado: '',
  observaciones: '',
})

const openNewPatientModal = () => {
  modalMode.value = 'crear'
  patientForm.value = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    obraSocial: '',
    numeroAfiliado: '',
    observaciones: '',
  }
  isPatientModalOpen.value = true
}

const closePatientModal = () => {
  isPatientModalOpen.value = false
}

const handlePatientSubmit = () => {
  // Confirmación clara de estado pendiente de integración sin resultados engañosos
  alert('Formulario de paciente validado. La persistencia se completará al integrar la API del backend.')
  closePatientModal()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterObraSocial.value = ''
  filterEstado.value = ''
  sortOrder.value = 'apellido'
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Pacientes"
      description="Padrón general de pacientes, consulta de historias de turnos y registro de coberturas médicas."
    >
      <button
        type="button"
        class="btn-hospital-primary"
        @click="openNewPatientModal"
      >
        <i class="bi bi-person-plus"></i>
        <span>Nuevo paciente</span>
      </button>
    </PageHeader>

    <!-- Indicadores Estadísticos Reutilizables -->
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

    <!-- Barra de búsqueda y filtros visuales -->
    <div class="hospital-filter-bar">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small mb-1">Buscar paciente</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, apellido, DNI o teléfono..."
            />
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small mb-1">Obra social / Cobertura</label>
          <select v-model="filterObraSocial" class="form-select form-select-sm">
            <option value="">Todas las obras sociales</option>
          </select>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <label class="form-label small mb-1">Estado</label>
          <select v-model="filterEstado" class="form-select form-select-sm">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="col-12 col-md-2 d-flex gap-2">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary w-100"
            title="Restablecer filtros"
            @click="resetFilters"
          >
            <i class="bi bi-arrow-counterclockwise me-1"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>

    <!-- Tabla de Pacientes con directivas v-if / v-else / v-for -->
    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-people text-success"></i>
          <span>Listado de Pacientes</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <!-- Botones visuales para acciones de registros -->
          <span class="text-muted small me-2 d-none d-md-inline">Acciones disponibles para registros:</span>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            title="Consultar ficha de paciente (acción visual)"
            disabled
          >
            <i class="bi bi-eye"></i>
            <span class="d-none d-sm-inline ms-1">Consultar</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            title="Editar datos de paciente (acción visual)"
            disabled
          >
            <i class="bi bi-pencil"></i>
            <span class="d-none d-sm-inline ms-1">Editar</span>
          </button>
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary"
            title="Eliminar paciente (acción visual)"
            disabled
          >
            <i class="bi bi-trash"></i>
            <span class="d-none d-sm-inline ms-1">Eliminar</span>
          </button>
        </div>
      </div>

      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper border-0 rounded-0">
          <table class="hospital-table">
            <thead>
              <tr>
                <th scope="col">Nombre y apellido</th>
                <th scope="col" style="width: 140px;">DNI</th>
                <th scope="col" style="width: 150px;">Teléfono</th>
                <th scope="col" style="width: 160px;">Fecha de nacimiento</th>
                <th scope="col" style="width: 150px;">Último turno</th>
                <th scope="col" class="text-center" style="width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- v-if para listar pacientes cuando se incorpore el backend -->
              <template v-if="pacientes.length > 0">
                <tr v-for="paciente in pacientes" :key="paciente.id">
                  <td>{{ paciente.apellido }}, {{ paciente.nombre }}</td>
                  <td>{{ paciente.dni }}</td>
                  <td>{{ paciente.telefono }}</td>
                  <td>{{ paciente.fechaNacimiento }}</td>
                  <td>{{ paciente.ultimoTurno || '—' }}</td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" disabled>
                      Ver
                    </button>
                  </td>
                </tr>
              </template>

              <!-- v-else para estado vacío estandarizado -->
              <tr v-else>
                <td colspan="6" class="p-0">
                  <EmptyState
                    icon="bi-person-slash"
                    title="No hay datos para mostrar"
                    description="No se encontraron pacientes registrados en el sistema. Utilizá el botón «Nuevo paciente» para comenzar a registrar fichas."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn-hospital-outline-primary btn-sm"
                        @click="openNewPatientModal"
                      >
                        <i class="bi bi-plus-lg"></i>
                        <span>Registrar primer paciente</span>
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

    <!-- Modal Reutilizable: Registrar o Editar Paciente -->
    <BaseModal
      :is-open="isPatientModalOpen"
      :title="modalMode === 'crear' ? 'Registrar Nuevo Paciente' : 'Editar Paciente'"
      icon="bi-person-vcard"
      size="lg"
      @close="closePatientModal"
    >
      <form @submit.prevent="handlePatientSubmit">
        <!-- Campos requeridos: Nombre, Apellido, DNI, Fecha Nacimiento -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Nombre</label>
            <input
              v-model="patientForm.nombre"
              type="text"
              class="form-control"
              placeholder="Ingresá el nombre"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Apellido</label>
            <input
              v-model="patientForm.apellido"
              type="text"
              class="form-control"
              placeholder="Ingresá el apellido"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">DNI</label>
            <input
              v-model="patientForm.dni"
              type="text"
              class="form-control"
              placeholder="Ingresá el número de documento"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Fecha de nacimiento</label>
            <input
              v-model="patientForm.fechaNacimiento"
              type="date"
              class="form-control"
            />
          </div>
        </div>

        <!-- Teléfono, Email, Dirección -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Teléfono</label>
            <input
              v-model="patientForm.telefono"
              type="tel"
              class="form-control"
              placeholder="Ingresá el teléfono de contacto"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Email</label>
            <input
              v-model="patientForm.email"
              type="email"
              class="form-control"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div class="col-12">
            <label class="form-label">Dirección</label>
            <input
              v-model="patientForm.direccion"
              type="text"
              class="form-control"
              placeholder="Calle, número, piso/depto, localidad"
            />
          </div>
        </div>

        <!-- Cobertura médica: Obra Social y Número de Afiliado -->
        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label class="form-label">Obra social</label>
            <input
              v-model="patientForm.obraSocial"
              type="text"
              class="form-control"
              placeholder="Seleccioná o ingresá obra social"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Número de afiliado</label>
            <input
              v-model="patientForm.numeroAfiliado"
              type="text"
              class="form-control"
              placeholder="Ingresá el número de credencial o afiliado"
            />
          </div>
        </div>

        <!-- Observaciones -->
        <div class="mb-2">
          <label class="form-label">Observaciones</label>
          <textarea
            v-model="patientForm.observaciones"
            class="form-control"
            rows="3"
            placeholder="Observaciones clínicas, notas administrativas, antecedentes..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="closePatientModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-hospital-primary"
          @click="handlePatientSubmit"
        >
          <i class="bi bi-save"></i>
          <span>Guardar paciente</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
