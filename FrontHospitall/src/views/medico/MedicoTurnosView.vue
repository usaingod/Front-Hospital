<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Turno } from '@/types/turno'

/**
 * Vista de Turnos (Perfil Médico)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Consulta exclusiva de turnos asignados al profesional médico (sin operaciones CRUD).
 * - Selector de fecha con navegación por día, semana y mes.
 * - Filtros visuales por estado y franja horaria.
 * - Grilla horaria con intervalos de 30 minutos (08:00 a 20:00) en estructura visual vacía.
 * - Tabla detallada con columnas: Hora, Paciente, Especialidad, Estado y Acciones.
 * - Panel lateral para consultar el detalle del turno seleccionado sin datos ficticios.
 * - Leyenda visual de estados.
 */

// Modalidad de visualización: Día, Semana o Mes
const viewMode = ref<'dia' | 'semana' | 'mes'>('dia')

// Fecha actual seleccionada (formato YYYY-MM-DD)
const selectedDate = ref(new Date().toISOString().substring(0, 10))

// Filtros visuales
const filterEstado = ref('')
const filterFranja = ref<'todos' | 'manana' | 'tarde' | 'vespertino'>('todos')

// Turno seleccionado para visualización en el panel lateral de detalle
const selectedTurno = ref<Turno | null>(null)

// Colección reactiva de turnos del médico (inicia vacía sin datos ficticios)
const turnos = ref<Turno[]>([])

// Intervalos de 30 minutos desde las 08:00 hasta las 20:00
const baseTimeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
]

// Intervalos filtrados según la franja horaria visual seleccionada
const filteredTimeSlots = computed(() => {
  if (filterFranja.value === 'manana') {
    return baseTimeSlots.filter((t) => t <= '12:30')
  } else if (filterFranja.value === 'tarde') {
    return baseTimeSlots.filter((t) => t >= '13:00' && t <= '17:30')
  } else if (filterFranja.value === 'vespertino') {
    return baseTimeSlots.filter((t) => t >= '18:00')
  }
  return baseTimeSlots
})

// Días de la semana para vista semanal
const weekDays = computed(() => {
  const current = new Date(selectedDate.value)
  const dayOfWeek = current.getDay() // 0 = Domingo
  const startOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Lunes
  const monday = new Date(current)
  monday.setDate(current.getDate() + startOffset)

  const days = []
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

  for (let i = 0; i < 6; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      name: dayNames[i],
      dateNumber: d.getDate(),
      isoDate: d.toISOString().substring(0, 10),
      isToday: d.toDateString() === new Date().toDateString(),
      isSelected: d.toISOString().substring(0, 10) === selectedDate.value,
    })
  }

  return days
})

// Navegación temporal
const prevDate = () => {
  const current = new Date(selectedDate.value)
  if (viewMode.value === 'dia') {
    current.setDate(current.getDate() - 1)
  } else if (viewMode.value === 'semana') {
    current.setDate(current.getDate() - 7)
  } else {
    current.setMonth(current.getMonth() - 1)
  }
  selectedDate.value = current.toISOString().substring(0, 10)
}

const nextDate = () => {
  const current = new Date(selectedDate.value)
  if (viewMode.value === 'dia') {
    current.setDate(current.getDate() + 1)
  } else if (viewMode.value === 'semana') {
    current.setDate(current.getDate() + 7)
  } else {
    current.setMonth(current.getMonth() + 1)
  }
  selectedDate.value = current.toISOString().substring(0, 10)
}

const setToday = () => {
  selectedDate.value = new Date().toISOString().substring(0, 10)
}

// Fecha formateada para visualización humana
const formattedDisplayDate = computed(() => {
  if (!selectedDate.value) return ''
  const parts = selectedDate.value.split('-').map(Number)
  const year = parts[0] ?? 2026
  const month = parts[1] ?? 1
  const day = parts[2] ?? 1
  const d = new Date(year, month - 1, day)
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
})

// Selección e inspección de detalle de turno
const handleSelectTurno = (turno: Turno) => {
  selectedTurno.value = turno
}

const closeDetailPanel = () => {
  selectedTurno.value = null
}

const resetFilters = () => {
  filterEstado.value = ''
  filterFranja.value = 'todos'
}
</script>

<template>
  <div>
    <!-- Encabezado de la página usando componente reutilizable -->
    <PageHeader
      title="Turnos"
      description="Consulta visual de agenda médica, grilla horaria e información detallada de citas."
    >
      <div class="d-flex align-items-center gap-2">
        <!-- Selector de modo de vista -->
        <div class="btn-group" role="group" aria-label="Modo de visualización de turnos">
          <button
            type="button"
            class="btn btn-sm"
            :class="viewMode === 'dia' ? 'btn-hospital-primary' : 'btn-outline-secondary'"
            @click="viewMode = 'dia'"
          >
            <i class="bi bi-calendar-day me-1"></i>
            <span>Día</span>
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="viewMode === 'semana' ? 'btn-hospital-primary' : 'btn-outline-secondary'"
            @click="viewMode = 'semana'"
          >
            <i class="bi bi-calendar-week me-1"></i>
            <span>Semana</span>
          </button>
          <button
            type="button"
            class="btn btn-sm"
            :class="viewMode === 'mes' ? 'btn-hospital-primary' : 'btn-outline-secondary'"
            @click="viewMode = 'mes'"
          >
            <i class="bi bi-calendar-month me-1"></i>
            <span>Mes</span>
          </button>
        </div>
      </div>
    </PageHeader>

    <!-- Barra de Navegación de Fecha & Leyenda de Estados -->
    <div class="hospital-card mb-4">
      <div class="hospital-card-body p-3">
        <div class="row g-3 align-items-center justify-content-between">
          <!-- Controles de navegación temporal -->
          <div class="col-12 col-md-auto d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Fecha anterior"
              title="Fecha anterior"
              @click="prevDate"
            >
              <i class="bi bi-chevron-left"></i>
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary px-3"
              title="Ir a hoy"
              @click="setToday"
            >
              Hoy
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              aria-label="Fecha siguiente"
              title="Fecha siguiente"
              @click="nextDate"
            >
              <i class="bi bi-chevron-right"></i>
            </button>

            <!-- Selector de fecha nativo -->
            <input
              v-model="selectedDate"
              type="date"
              class="form-control form-control-sm"
              style="width: 150px;"
              aria-label="Seleccionar fecha"
            />

            <!-- Fecha formateada en texto -->
            <span class="fw-semibold text-dark ms-2 d-none d-lg-inline">
              {{ formattedDisplayDate }}
            </span>
          </div>

          <!-- Leyenda visual de estados -->
          <div class="col-12 col-md-auto d-flex flex-wrap align-items-center gap-2">
            <span class="text-muted small me-1">Estados:</span>
            <span class="badge bg-success-subtle text-success border border-success-subtle">
              <i class="bi bi-check-circle me-1"></i>Confirmado
            </span>
            <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
              <i class="bi bi-hourglass-split me-1"></i>Pendiente
            </span>
            <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
              <i class="bi bi-activity me-1"></i>En atención
            </span>
            <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle">
              <i class="bi bi-check2-all me-1"></i>Atendido
            </span>
            <span class="badge bg-danger-subtle text-danger border border-danger-subtle">
              <i class="bi bi-x-circle me-1"></i>Cancelado
            </span>
          </div>
        </div>

        <!-- Fila de Filtros Visuales -->
        <div class="row g-2 mt-2 pt-2 border-top align-items-center">
          <div class="col-12 col-sm-4 col-md-3">
            <select
              v-model="filterEstado"
              class="form-select form-select-sm"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              <option value="confirmado">Confirmado</option>
              <option value="pendiente">Pendiente</option>
              <option value="en_atencion">En atención</option>
              <option value="atendido">Atendido</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="col-12 col-sm-4 col-md-3">
            <select
              v-model="filterFranja"
              class="form-select form-select-sm"
              aria-label="Filtrar por franja horaria"
            >
              <option value="todos">Todas las franjas horarias</option>
              <option value="manana">Mañana (08:00 - 12:30)</option>
              <option value="tarde">Tarde (13:00 - 17:30)</option>
              <option value="vespertino">Vespertino (18:00 - 20:00)</option>
            </select>
          </div>

          <div class="col-12 col-sm-4 col-md-auto ms-auto d-flex gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="resetFilters"
            >
              <i class="bi bi-arrow-counterclockwise me-1"></i>
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Contenido Principal: Grilla/Listado & Panel Lateral de Detalle -->
    <div class="row g-4">
      <!-- Columna Principal: Grilla Horaria y Tabla de Turnos -->
      <div :class="selectedTurno ? 'col-12 col-xl-8' : 'col-12'">
        <!-- Modo Día: Grilla horaria de intervalos de 30 minutos y listado -->
        <template v-if="viewMode === 'dia'">
          <!-- Tarjeta de Grilla Horaria (Intervalos de 30 minutos) -->
          <div class="hospital-card mb-4">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-clock text-warning"></i>
                <span>Agenda horaria del día (Intervalos de 30 min)</span>
              </div>
              <span class="badge bg-light text-muted border">
                08:00 — 20:00
              </span>
            </div>

            <div class="hospital-card-body p-3">
              <!-- Grilla de slots horarios en estructura visual vacía -->
              <div class="medico-agenda-grid">
                <div
                  v-for="timeSlot in filteredTimeSlots"
                  :key="timeSlot"
                  class="medico-agenda-slot"
                >
                  <div class="medico-slot-time">{{ timeSlot }}</div>
                  <div class="medico-slot-content">
                    <span class="text-muted small fst-italic">
                      Sin consultas asignadas en esta franja
                    </span>
                  </div>
                  <span class="badge bg-light text-muted border">
                    Disponible
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tabla detallada de turnos del día -->
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-table text-warning"></i>
                <span>Listado detallado de turnos</span>
              </div>
              <span class="text-muted small">Citas asignadas para {{ formattedDisplayDate }}</span>
            </div>

            <div class="hospital-card-body p-0">
              <div class="hospital-table-wrapper border-0 rounded-0">
                <table class="hospital-table">
                  <thead>
                    <tr>
                      <th scope="col" style="width: 100px;">Hora</th>
                      <th scope="col">Paciente</th>
                      <th scope="col">Especialidad</th>
                      <th scope="col" style="width: 140px;">Estado</th>
                      <th scope="col" class="text-center" style="width: 120px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="turnos.length > 0">
                      <tr v-for="turno in turnos" :key="turno.id">
                        <td>{{ turno.hora }}</td>
                        <td>{{ turno.paciente }}</td>
                        <td>{{ turno.especialidad }}</td>
                        <td>
                          <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                            {{ turno.estado }}
                          </span>
                        </td>
                        <td class="text-center">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-warning text-dark py-0 px-2"
                            @click="handleSelectTurno(turno)"
                          >
                            <i class="bi bi-eye me-1"></i>Detalle
                          </button>
                        </td>
                      </tr>
                    </template>

                    <!-- Estado vacío cuando no existen turnos precargados -->
                    <tr v-else>
                      <td colspan="5" class="p-0">
                        <EmptyState
                          icon="bi-calendar-check"
                          title="No hay turnos registrados para esta fecha"
                          description="La lista de turnos programados aparecerá en esta tabla una vez sincronizada con los servicios del hospital."
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </template>

        <!-- Modo Semana: Grilla semanal compacta -->
        <template v-else-if="viewMode === 'semana'">
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-calendar-week text-warning"></i>
                <span>Agenda semanal</span>
              </div>
              <span class="text-muted small">Semana del {{ weekDays[0]?.dateNumber }} al {{ weekDays[5]?.dateNumber }}</span>
            </div>

            <div class="hospital-card-body p-3">
              <div class="row g-2 text-center mb-3">
                <div
                  v-for="day in weekDays"
                  :key="day.isoDate"
                  class="col"
                >
                  <div
                    class="p-2 border rounded"
                    :class="{
                      'bg-warning-subtle border-warning': day.isSelected,
                      'bg-light': !day.isSelected,
                    }"
                  >
                    <div class="fw-bold small text-muted">{{ day.name }}</div>
                    <div class="fs-5 fw-bold text-dark">{{ day.dateNumber }}</div>
                  </div>
                </div>
              </div>

              <!-- Estado vacío semanal -->
              <EmptyState
                icon="bi-calendar-week"
                title="Agenda semanal sin turnos programados"
                description="Las citas de cada jornada de la semana se distribuirán en esta sección al integrarse con el backend."
                compact
              />
            </div>
          </div>
        </template>

        <!-- Modo Mes: Calendario mensual amplio -->
        <template v-else>
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-calendar-month text-warning"></i>
                <span>Vista mensual de turnos</span>
              </div>
              <span class="text-muted small">{{ formattedDisplayDate }}</span>
            </div>

            <div class="hospital-card-body p-4">
              <EmptyState
                icon="bi-calendar-month"
                title="Vista mensual preparada para sincronización"
                description="El desglose de turnos acumulados por día del mes se visualizará de forma interactiva una vez provistos por el servidor."
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Columna Lateral: Panel de Detalle del Turno Seleccionado -->
      <div v-if="selectedTurno" class="col-12 col-xl-4">
        <div class="hospital-card sticky-top" style="top: 85px;">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-info-circle text-warning"></i>
              <span>Detalle del turno</span>
            </div>
            <button
              type="button"
              class="btn-close"
              aria-label="Cerrar detalle"
              @click="closeDetailPanel"
            ></button>
          </div>

          <div class="hospital-card-body">
            <div class="mb-3">
              <div class="text-muted small">Paciente</div>
              <div class="fs-5 fw-bold text-dark">{{ selectedTurno.paciente }}</div>
              <div v-if="selectedTurno.pacienteDni" class="text-muted small">
                DNI: {{ selectedTurno.pacienteDni }}
              </div>
            </div>

            <div class="row g-2 mb-3">
              <div class="col-6">
                <div class="text-muted small">Fecha</div>
                <div class="fw-semibold text-dark">{{ selectedTurno.fecha }}</div>
              </div>
              <div class="col-6">
                <div class="text-muted small">Hora</div>
                <div class="fw-semibold text-dark">{{ selectedTurno.hora }}</div>
              </div>
            </div>

            <div class="mb-3">
              <div class="text-muted small">Especialidad</div>
              <div class="fw-semibold text-dark">{{ selectedTurno.especialidad }}</div>
            </div>

            <div class="mb-3">
              <div class="text-muted small">Estado</div>
              <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle mt-1">
                {{ selectedTurno.estado }}
              </span>
            </div>

            <div v-if="selectedTurno.observaciones" class="mb-3">
              <div class="text-muted small">Observaciones</div>
              <p class="small text-secondary mb-0 bg-light p-2 rounded">
                {{ selectedTurno.observaciones }}
              </p>
            </div>

            <div class="pt-3 border-top d-flex gap-2">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary w-100"
                @click="closeDetailPanel"
              >
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
