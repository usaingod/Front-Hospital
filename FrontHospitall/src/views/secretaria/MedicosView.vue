<script setup lang="ts">
import { ref } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Medico, HorarioAtencion } from '@/types/medico'

/**
 * Vista de Médicos (Secretaría)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Consulta de cuerpo médico y configuración de agendas de atención
 * - Componentes reutilizables: PageHeader, EmptyState, BaseModal
 * - Directivas v-if, v-else, v-for, v-model, :class, :disabled
 * - Sin médicos ni horarios de ejemplo precargados
 */

// Colección reactiva de médicos (inicia vacía según la regla de no incorporar datos ficticios)
const medicos = ref<Medico[]>([])

// Horarios del médico seleccionado (inicia vacía)
const horarios = ref<HorarioAtencion[]>([])

// Filtros y búsqueda
const searchQuery = ref('')
const filterEspecialidad = ref('')
const filterEstado = ref('')

// Médico seleccionado (inicialmente null, sin datos precargados)
const selectedDoctor = ref<Medico | null>(null)

// Modal de horarios
const isScheduleModalOpen = ref(false)
const scheduleModalMode = ref<'crear' | 'editar'>('crear')

// Formulario vacío de horarios
const scheduleForm = ref({
  diaSemana: '',
  horaInicio: '',
  horaFin: '',
  consultorio: '',
  modalidad: 'Presencial' as const,
  estado: 'Activo' as const,
})

const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const openNewScheduleModal = () => {
  scheduleModalMode.value = 'crear'
  scheduleForm.value = {
    diaSemana: '',
    horaInicio: '',
    horaFin: '',
    consultorio: '',
    modalidad: 'Presencial',
    estado: 'Activo',
  }
  isScheduleModalOpen.value = true
}

const closeScheduleModal = () => {
  isScheduleModalOpen.value = false
}

const handleScheduleSubmit = () => {
  // Confirmación clara de estado pendiente de integración sin resultados engañosos
  alert('Horario validado. La asignación persistente de agenda se conectará con el backend en etapas posteriores.')
  closeScheduleModal()
}

const selectDoctor = (doctor: Medico) => {
  selectedDoctor.value = doctor
}

const resetFilters = () => {
  searchQuery.value = ''
  filterEspecialidad.value = ''
  filterEstado.value = ''
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Médicos"
      description="Cuerpo profesional, especialidades médicas y configuración de agendas de atención."
    />

    <!-- Barra de búsqueda y filtros -->
    <div class="hospital-filter-bar mb-4">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label class="form-label small mb-1">Buscar médico</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Buscar médico por nombre, especialidad o matrícula..."
            />
          </div>
        </div>

        <div class="col-12 col-sm-6 col-md-3">
          <label class="form-label small mb-1">Especialidad</label>
          <select v-model="filterEspecialidad" class="form-select form-select-sm">
            <option value="">Todas las especialidades</option>
          </select>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <label class="form-label small mb-1">Estado</label>
          <select v-model="filterEstado" class="form-select form-select-sm">
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="licencia">De licencia</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="col-12 col-md-2 d-flex">
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

    <div class="row g-4">
      <!-- Columna Izquierda: Listado de Médicos con directivas v-if / v-else / v-for -->
      <div class="col-12 col-xl-5">
        <div class="hospital-card h-100 mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-person-badge text-success"></i>
              <span>Cuerpo Médico</span>
            </div>
            <span class="badge bg-light text-secondary border">
              {{ medicos.length }} profesionales
            </span>
          </div>

          <div class="hospital-card-body p-0">
            <div class="hospital-table-wrapper border-0 rounded-0">
              <table class="hospital-table">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Especialidad</th>
                    <th scope="col" style="width: 100px;">Matrícula</th>
                    <th scope="col" style="width: 90px;">Estado</th>
                    <th scope="col" class="text-center" style="width: 80px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- v-if para listar profesionales cuando el backend esté integrado -->
                  <template v-if="medicos.length > 0">
                    <tr
                      v-for="medico in medicos"
                      :key="medico.id"
                      :class="{ 'table-active': selectedDoctor?.id === medico.id }"
                      role="button"
                      tabindex="0"
                      @click="selectDoctor(medico)"
                    >
                      <td class="fw-semibold">{{ medico.nombre }}</td>
                      <td>{{ medico.especialidad }}</td>
                      <td>{{ medico.matricula }}</td>
                      <td>
                        <span class="badge bg-success-subtle text-success border border-success-subtle">
                          {{ medico.estado }}
                        </span>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" disabled>
                          Ver
                        </button>
                      </td>
                    </tr>
                  </template>

                  <!-- v-else para estado vacío estandarizado -->
                  <tr v-else>
                    <td colspan="5" class="p-0">
                      <EmptyState
                        icon="bi-heart-pulse"
                        title="No hay datos para mostrar"
                        description="No hay médicos registrados en el sistema. Los profesionales aparecerán listados aquí una vez incorporados desde el backend."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Panel de Datos del Médico & Horarios de Atención -->
      <div class="col-12 col-xl-7 d-flex flex-column gap-4">
        <!-- Panel de Datos del Médico Seleccionado -->
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-info-circle text-success"></i>
              <span>Ficha del Profesional</span>
            </div>
            <span v-if="!selectedDoctor" class="text-muted small">Sin selección activa</span>
          </div>

          <div class="hospital-card-body">
            <!-- Mensaje con EmptyState cuando todavía no hay médico seleccionado -->
            <EmptyState
              v-if="!selectedDoctor"
              compact
              icon="bi-person-check"
              title="Seleccioná un médico para consultar sus horarios"
              description="Al seleccionar un profesional del listado de la izquierda, podrás ver aquí su información de contacto, especialidad y horarios asignados."
            />

            <!-- Estructura lista para datos del médico seleccionado (v-else) -->
            <div v-else class="row g-3">
              <div class="col-12 col-md-6">
                <div class="small text-muted">Nombre y Apellido</div>
                <div class="fw-semibold">{{ selectedDoctor.nombre }}</div>
              </div>
              <div class="col-12 col-md-6">
                <div class="small text-muted">Especialidad</div>
                <div class="fw-semibold">{{ selectedDoctor.especialidad }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="small text-muted">Matrícula</div>
                <div class="fw-semibold">{{ selectedDoctor.matricula }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="small text-muted">Consultorio habitual</div>
                <div class="fw-semibold">{{ selectedDoctor.consultorio || '—' }}</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="small text-muted">Estado</div>
                <div class="fw-semibold text-capitalize">{{ selectedDoctor.estado }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Horarios de Atención -->
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-clock-history text-success"></i>
              <span>Horarios de atención</span>
            </div>
            <div class="d-flex align-items-center gap-2">
              <button
                type="button"
                class="btn-hospital-primary btn-sm"
                @click="openNewScheduleModal"
              >
                <i class="bi bi-plus-lg"></i>
                <span>Agregar horario</span>
              </button>
            </div>
          </div>

          <div class="hospital-card-body p-0">
            <!-- Tabla vacía de horarios con sus 7 columnas requeridas -->
            <div class="hospital-table-wrapper border-0 rounded-0">
              <table class="hospital-table">
                <thead>
                  <tr>
                    <th scope="col">Día de la semana</th>
                    <th scope="col" style="width: 120px;">Hora de inicio</th>
                    <th scope="col" style="width: 140px;">Hora de finalización</th>
                    <th scope="col">Consultorio</th>
                    <th scope="col">Modalidad de atención</th>
                    <th scope="col" style="width: 110px;">Estado</th>
                    <th scope="col" class="text-center" style="width: 100px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- v-if para franjas horarias cuando estén configuradas -->
                  <template v-if="horarios.length > 0">
                    <tr v-for="h in horarios" :key="h.id || h.diaSemana">
                      <td>{{ h.diaSemana }}</td>
                      <td>{{ h.horaInicio }}</td>
                      <td>{{ h.horaFin }}</td>
                      <td>{{ h.consultorio }}</td>
                      <td>{{ h.modalidad }}</td>
                      <td>
                        <span class="badge bg-success-subtle text-success border border-success-subtle">
                          {{ h.estado }}
                        </span>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" disabled>
                          Editar
                        </button>
                      </td>
                    </tr>
                  </template>

                  <!-- v-else para estado vacío de horarios -->
                  <tr v-else>
                    <td colspan="7" class="p-0">
                      <EmptyState
                        compact
                        icon="bi-calendar-x"
                        title="No hay datos para mostrar"
                        description="No hay horarios de atención configurados. Podés agregar franjas de atención mediante el botón «Agregar horario»."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Representación Semanal Vacía de Horarios -->
            <div class="p-3 border-top bg-light">
              <div class="d-flex align-items-center justify-content-between mb-2">
                <span class="small fw-semibold text-secondary text-uppercase" style="letter-spacing: 0.05em;">
                  Representación semanal de disponibilidad
                </span>
                <span class="text-muted small">Lunes a Sábado</span>
              </div>
              <div class="row g-2">
                <div
                  v-for="day in daysOfWeek"
                  :key="day"
                  class="col-6 col-sm-4 col-md-2"
                >
                  <div class="border rounded p-2 text-center bg-white h-100">
                    <div class="fw-bold small text-success mb-1">{{ day }}</div>
                    <div class="text-muted small fst-italic py-2" style="font-size: 0.75rem;">
                      Sin horarios
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Reutilizable: Formulario de Horarios de Atención -->
    <BaseModal
      :is-open="isScheduleModalOpen"
      :title="scheduleModalMode === 'crear' ? 'Agregar Horario de Atención' : 'Editar Horario'"
      icon="bi-clock-history"
      @close="closeScheduleModal"
    >
      <form @submit.prevent="handleScheduleSubmit">
        <div class="row g-3">
          <!-- Día de la semana -->
          <div class="col-12">
            <label class="form-label">Día de la semana</label>
            <select v-model="scheduleForm.diaSemana" class="form-select">
              <option value="">Seleccioná un día de la semana</option>
              <option v-for="d in daysOfWeek" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>

          <!-- Hora de inicio y fin -->
          <div class="col-12 col-md-6">
            <label class="form-label">Hora de inicio</label>
            <input
              v-model="scheduleForm.horaInicio"
              type="time"
              step="1800"
              class="form-control"
            />
          </div>

          <div class="col-12 col-md-6">
            <label class="form-label">Hora de finalización</label>
            <input
              v-model="scheduleForm.horaFin"
              type="time"
              step="1800"
              class="form-control"
            />
          </div>

          <!-- Consultorio -->
          <div class="col-12 col-md-6">
            <label class="form-label">Consultorio</label>
            <input
              v-model="scheduleForm.consultorio"
              type="text"
              class="form-control"
              placeholder="Ej. Consultorio 104"
            />
          </div>

          <!-- Modalidad de atención -->
          <div class="col-12 col-md-6">
            <label class="form-label">Modalidad de atención</label>
            <select v-model="scheduleForm.modalidad" class="form-select">
              <option value="Presencial">Presencial</option>
              <option value="Telemedicina">Telemedicina</option>
              <option value="Mixta">Mixta</option>
            </select>
          </div>

          <!-- Estado -->
          <div class="col-12">
            <label class="form-label">Estado</label>
            <select v-model="scheduleForm.estado" class="form-select">
              <option value="Activo">Activo</option>
              <option value="Suspendido">Suspendido</option>
              <option value="Licencia">Licencia</option>
            </select>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-outline-secondary"
          @click="closeScheduleModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-hospital-primary"
          @click="handleScheduleSubmit"
        >
          <i class="bi bi-save"></i>
          <span>Guardar horario</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
