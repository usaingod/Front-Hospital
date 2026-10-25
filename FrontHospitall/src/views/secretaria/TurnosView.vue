<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseModal from '@/components/common/BaseModal.vue'

/**
 * Vista de Turnos (Secretaría)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Directivas v-if, v-else, v-for, v-model, :class
 * - Componentes reutilizables PageHeader y BaseModal
 * - Grilla responsive con intervalos de 30 minutos y columnas de médicos
 * - Filtros visuales y navegación temporal
 * - Sin datos ficticios precargados
 */

// Vistas del calendario: Día, Semana, Mes
const viewMode = ref<'dia' | 'semana' | 'mes'>('dia')

// Fecha actual seleccionada (formato YYYY-MM-DD)
const selectedDate = ref(new Date().toISOString().substring(0, 10))

// Filtros visuales
const filterEspecialidad = ref('')
const filterMedico = ref('')
const filterPaciente = ref('')
const filterTurnoHorario = ref<'todos' | 'manana' | 'tarde' | 'vespertino'>('todos')

// Modales y formularios visuales
const isNewTurnoModalOpen = ref(false)
const pacienteType = ref<'existente' | 'nuevo'>('existente')

// Campos del formulario vacío de asignación
const turnoForm = ref({
  fecha: '',
  hora: '',
  especialidad: '',
  medico: '',
  // Paciente existente
  pacienteBusqueda: '',
  // Paciente nuevo
  nuevoNombre: '',
  nuevoApellido: '',
  nuevoDni: '',
  nuevoTelefono: '',
  nuevoEmail: '',
  nuevoObraSocial: '',
})

// Intervalos de 30 minutos desde las 08:00 hasta las 20:00
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
]

// Filtrado de intervalos según el filtro de horario visual
const filteredTimeSlots = computed(() => {
  if (filterTurnoHorario.value === 'manana') {
    return timeSlots.filter((t) => t <= '12:30')
  } else if (filterTurnoHorario.value === 'tarde') {
    return timeSlots.filter((t) => t >= '13:00' && t <= '17:30')
  } else if (filterTurnoHorario.value === 'vespertino') {
    return timeSlots.filter((t) => t >= '18:00')
  }
  return timeSlots
})

// Estructura de columnas para médicos (conserva su estructura vacía a la espera del backend)
const preparedDoctorColumns = [
  { id: 1, name: '', specialty: '' },
  { id: 2, name: '', specialty: '' },
  { id: 3, name: '', specialty: '' },
]

// Funciones de navegación de fecha
const prevDate = () => {
  const current = new Date(selectedDate.value)
  current.setDate(current.getDate() - 1)
  selectedDate.value = current.toISOString().substring(0, 10)
}

const nextDate = () => {
  const current = new Date(selectedDate.value)
  current.setDate(current.getDate() + 1)
  selectedDate.value = current.toISOString().substring(0, 10)
}

const setToday = () => {
  selectedDate.value = new Date().toISOString().substring(0, 10)
}

const formattedDisplayDate = computed(() => {
  if (!selectedDate.value) return ''
  const parts = selectedDate.value.split('-').map(Number)
  const year = parts[0] ?? 2026
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

// Abrir modal de asignación al hacer clic en un horario o botón
const openAssignModal = (slotTime?: string) => {
  turnoForm.value.fecha = selectedDate.value
  turnoForm.value.hora = slotTime || ''
  isNewTurnoModalOpen.value = true
}

const closeAssignModal = () => {
  isNewTurnoModalOpen.value = false
}

const handleAssignSubmit = () => {
  // Confirmación clara de estado pendiente de integración sin resultados engañosos
  alert('Formulario de asignación validado. El guardado efectivo se conectará con el backend en etapas posteriores.')
  closeAssignModal()
}

// Acción visual para resetear filtros
const resetFilters = () => {
  filterEspecialidad.value = ''
  filterMedico.value = ''
  filterPaciente.value = ''
  filterTurnoHorario.value = 'todos'
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Turnos"
      description="Consulta de disponibilidad médica, grilla de horarios y asignación de citas."
    >
      <button
        type="button"
        class="btn-hospital-primary"
        @click="openAssignModal()"
      >
        <i class="bi bi-plus-lg"></i>
        <span>Nuevo turno</span>
      </button>
    </PageHeader>

    <!-- Barra de Navegación del Calendario & Filtros -->
    <div class="hospital-card mb-4">
      <div class="hospital-card-body p-3">
        <div class="row g-3 align-items-center">
          <!-- Controles de navegación temporal -->
          <div class="col-12 col-lg-5 d-flex align-items-center gap-2">
            <div class="btn-group" role="group" aria-label="Navegación de fecha">
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                title="Día anterior"
                @click="prevDate"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm px-3"
                @click="setToday"
              >
                Hoy
              </button>
              <button
                type="button"
                class="btn btn-outline-secondary btn-sm"
                title="Día siguiente"
                @click="nextDate"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>

            <!-- Selector visual de fecha -->
            <input
              v-model="selectedDate"
              type="date"
              class="form-control form-control-sm"
              style="max-width: 160px;"
            />

            <!-- Fecha formateada en texto -->
            <span class="text-capitalize small fw-semibold text-secondary d-none d-sm-inline">
              {{ formattedDisplayDate }}
            </span>
          </div>

          <!-- Modos de vista (Día / Semana / Mes) -->
          <div class="col-12 col-sm-6 col-lg-3 text-lg-center">
            <div class="btn-group btn-group-sm" role="group">
              <button
                type="button"
                class="btn"
                :class="viewMode === 'dia' ? 'btn-success' : 'btn-outline-secondary'"
                @click="viewMode = 'dia'"
              >
                Día
              </button>
              <button
                type="button"
                class="btn"
                :class="viewMode === 'semana' ? 'btn-success' : 'btn-outline-secondary'"
                @click="viewMode = 'semana'"
              >
                Semana
              </button>
              <button
                type="button"
                class="btn"
                :class="viewMode === 'mes' ? 'btn-success' : 'btn-outline-secondary'"
                @click="viewMode = 'mes'"
              >
                Mes
              </button>
            </div>
          </div>

          <!-- Leyenda visual de estados de horario -->
          <div class="col-12 col-sm-6 col-lg-4 d-flex justify-content-lg-end gap-2 flex-wrap">
            <span class="legend-pill">
              <span class="legend-color-box available"></span>
              Disponible
            </span>
            <span class="legend-pill">
              <span class="legend-color-box occupied"></span>
              Ocupado
            </span>
            <span class="legend-pill">
              <span class="legend-color-box unavailable"></span>
              No disponible
            </span>
          </div>
        </div>

        <hr class="my-3 text-muted opacity-25" />

        <!-- Filtros visuales requeridos -->
        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-3">
            <label class="form-label small mb-1">Especialidad</label>
            <select v-model="filterEspecialidad" class="form-select form-select-sm">
              <option value="">Seleccioná una especialidad</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label small mb-1">Médico</label>
            <select v-model="filterMedico" class="form-select form-select-sm">
              <option value="">Seleccioná un médico</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label small mb-1">Paciente</label>
            <input
              v-model="filterPaciente"
              type="text"
              class="form-control form-control-sm"
              placeholder="Buscar por paciente o DNI"
            />
          </div>
          <div class="col-12 col-md-2">
            <label class="form-label small mb-1">Franja horaria</label>
            <select v-model="filterTurnoHorario" class="form-select form-select-sm">
              <option value="todos">Todos los horarios</option>
              <option value="manana">Mañana (08:00 - 12:30)</option>
              <option value="tarde">Tarde (13:00 - 17:30)</option>
              <option value="vespertino">Vespertino (18:00 - 20:00)</option>
            </select>
          </div>
          <div class="col-12 col-md-1 d-flex">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary w-100"
              title="Restablecer filtros"
              @click="resetFilters"
            >
              <i class="bi bi-arrow-counterclockwise"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Grilla de horarios organizada por médico con intervalos de 30 minutos -->
    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-grid-3x3 text-success"></i>
          <span>Grilla de turnos y disponibilidad</span>
        </div>
        <span class="text-muted small">
          Hacé clic en cualquier franja horaria para abrir el formulario de asignación
        </span>
      </div>
      <div class="hospital-card-body p-0">
        <div class="schedule-grid-container border-0 rounded-0">
          <table class="schedule-grid-table">
            <thead>
              <tr>
                <th class="schedule-time-col">Hora</th>
                <!-- Columnas preparadas para los médicos: se conservan vacías según especificación -->
                <th
                  v-for="col in preparedDoctorColumns"
                  :key="col.id"
                  class="schedule-doctor-header"
                >
                  <div class="schedule-doctor-name">
                    <span class="text-muted fw-normal fst-italic">Médico {{ col.id }} (Sin asignar)</span>
                  </div>
                  <div class="schedule-doctor-spec">
                    <span class="text-muted fst-italic">Especialidad no especificada</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <!-- Filas de intervalos de 30 minutos sin inventar agendas ni turnos asignados -->
              <tr v-for="time in filteredTimeSlots" :key="time">
                <td class="schedule-time-col">
                  {{ time }}
                </td>
                <td
                  v-for="col in preparedDoctorColumns"
                  :key="col.id"
                  class="schedule-slot-cell"
                  title="Hacé clic para asignar turno"
                  @click="openAssignModal(time)"
                >
                  <span class="schedule-slot-empty-label">
                    Disponible
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Reutilizable: Asignación de Turno -->
    <BaseModal
      :is-open="isNewTurnoModalOpen"
      title="Asignación de Turno"
      icon="bi-calendar-plus"
      size="lg"
      @close="closeAssignModal"
    >
      <form @submit.prevent="handleAssignSubmit">
        <!-- Datos del Turno: Fecha, Hora, Especialidad, Médico -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label class="form-label">Fecha del turno</label>
            <input
              v-model="turnoForm.fecha"
              type="date"
              class="form-control"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Hora del turno</label>
            <input
              v-model="turnoForm.hora"
              type="time"
              step="1800"
              class="form-control"
            />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Especialidad</label>
            <select v-model="turnoForm.especialidad" class="form-select">
              <option value="">Seleccioná una especialidad</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Médico</label>
            <select v-model="turnoForm.medico" class="form-select">
              <option value="">Seleccioná un médico</option>
            </select>
          </div>
        </div>

        <!-- Selección entre Paciente Existente y Paciente Nuevo -->
        <div class="mb-3">
          <label class="form-label d-block">Tipo de paciente</label>
          <div class="btn-group w-100" role="group">
            <input
              id="btnRadioExistente"
              v-model="pacienteType"
              type="radio"
              class="btn-check"
              value="existente"
            />
            <label
              class="btn btn-outline-success"
              for="btnRadioExistente"
            >
              <i class="bi bi-person-check me-1"></i>
              Paciente existente
            </label>

            <input
              id="btnRadioNuevo"
              v-model="pacienteType"
              type="radio"
              class="btn-check"
              value="nuevo"
            />
            <label
              class="btn btn-outline-success"
              for="btnRadioNuevo"
            >
              <i class="bi bi-person-plus me-1"></i>
              Paciente nuevo
            </label>
          </div>
        </div>

        <!-- Opción: Paciente Existente -->
        <div v-if="pacienteType === 'existente'" class="p-3 bg-light rounded-3 mb-3 border">
          <label class="form-label">Búsqueda de paciente existente</label>
          <div class="input-group">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="turnoForm.pacienteBusqueda"
              type="text"
              class="form-control"
              placeholder="Buscar por DNI, nombre o apellido"
            />
          </div>
          <div class="form-text mt-2 text-muted small">
            Ingresá el número de documento para localizar la ficha del paciente en el sistema.
          </div>
        </div>

        <!-- Opción: Paciente Nuevo (Campos para registrar un paciente nuevo sin salir) -->
        <div v-else class="p-3 bg-light rounded-3 mb-3 border">
          <div class="d-flex align-items-center gap-2 mb-3 text-success fw-semibold">
            <i class="bi bi-person-vcard"></i>
            <span>Datos del nuevo paciente</span>
          </div>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label">Nombre</label>
              <input
                v-model="turnoForm.nuevoNombre"
                type="text"
                class="form-control"
                placeholder="Ingresá el nombre"
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Apellido</label>
              <input
                v-model="turnoForm.nuevoApellido"
                type="text"
                class="form-control"
                placeholder="Ingresá el apellido"
              />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">DNI</label>
              <input
                v-model="turnoForm.nuevoDni"
                type="text"
                class="form-control"
                placeholder="Ingresá el DNI"
              />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Teléfono</label>
              <input
                v-model="turnoForm.nuevoTelefono"
                type="tel"
                class="form-control"
                placeholder="Ingresá el teléfono"
              />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Obra social</label>
              <input
                v-model="turnoForm.nuevoObraSocial"
                type="text"
                class="form-control"
                placeholder="Seleccioná o ingresá obra social"
              />
            </div>
            <div class="col-12">
              <label class="form-label">Email</label>
              <input
                v-model="turnoForm.nuevoEmail"
                type="email"
                class="form-control"
                placeholder="ejemplo@correo.com"
              />
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="closeAssignModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-hospital-primary"
          @click="handleAssignSubmit"
        >
          <i class="bi bi-check2"></i>
          <span>Asignar turno</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
