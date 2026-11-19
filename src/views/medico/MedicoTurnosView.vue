<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Turno } from '@/types/turno'
import { ApiError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { turnosService } from '@/services/turnosService'
import {
  addDaysIso,
  addMonthsIso,
  formatDisplayDate,
  parseIsoDateLocal,
  startOfWeekMonday,
  todayIsoLocal,
  toIsoDateLocal,
} from '@/utils/dateLocal'

const actionBusy = ref(false)
const router = useRouter()




const viewMode = ref<'dia' | 'semana' | 'mes'>('dia')


const selectedDate = ref(todayIsoLocal())


const filterEstado = ref('')
const filterFranja = ref<'todos' | 'manana' | 'tarde' | 'vespertino'>('todos')


const selectedTurno = ref<Turno | null>(null)

const auth = useAuthStore()
const turnos = ref<Turno[]>([])

onMounted(() => {
  turnosService
    .getTurnos()
    .then((rows) => {
      turnos.value = auth.user?.professionalId
        ? rows.filter((t) => String(t.medicoId) === String(auth.user?.professionalId))
        : rows
    })
    .catch((err) => {
      alert(err instanceof ApiError ? err.message : 'No se pudieron cargar los turnos')
    })
})

const matchesTurnoFilters = (t: Turno) => {
  const matchesEstado = !filterEstado.value || t.estado === filterEstado.value
  const matchesFranja =
    filterFranja.value === 'todos' ||
    (filterFranja.value === 'manana' && t.hora <= '12:30') ||
    (filterFranja.value === 'tarde' && t.hora >= '13:00' && t.hora <= '17:30') ||
    (filterFranja.value === 'vespertino' && t.hora >= '18:00')
  return matchesEstado && matchesFranja
}

const turnosFiltrados = computed(() => turnos.value.filter(matchesTurnoFilters))

const turnosDelDia = computed(() =>
  turnosFiltrados.value.filter((t) => t.fecha === selectedDate.value),
)

const turnoEnHora = (hora: string) => turnosDelDia.value.find((t) => t.hora === hora)


const baseTimeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
]


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

const weekDays = computed(() => {
  const monday = startOfWeekMonday(selectedDate.value)
  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return dayNames.map((name, i) => {
    const isoDate = addDaysIso(monday, i)
    const dayTurnos = turnosFiltrados.value.filter((t) => t.fecha === isoDate)
    return {
      name,
      dateNumber: parseIsoDateLocal(isoDate).getDate(),
      isoDate,
      isToday: isoDate === todayIsoLocal(),
      isSelected: isoDate === selectedDate.value,
      turnos: dayTurnos,
      count: dayTurnos.length,
    }
  })
})

const monthCells = computed(() => {
  const anchor = parseIsoDateLocal(selectedDate.value)
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const first = new Date(year, month, 1)
  const startOffset = (first.getDay() + 6) % 7
  const start = new Date(year, month, 1 - startOffset)
  const cells = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const isoDate = toIsoDateLocal(d)
    const count = turnosFiltrados.value.filter((t) => t.fecha === isoDate).length
    cells.push({
      isoDate,
      dateNumber: d.getDate(),
      inMonth: d.getMonth() === month,
      isSelected: isoDate === selectedDate.value,
      isToday: isoDate === todayIsoLocal(),
      count,
    })
  }
  return cells
})

const monthTitle = computed(() => {
  const d = parseIsoDateLocal(selectedDate.value)
  const str = d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const selectCalendarDay = (isoDate: string) => {
  selectedDate.value = isoDate
  viewMode.value = 'dia'
}

const prevDate = () => {
  if (viewMode.value === 'semana') {
    selectedDate.value = addDaysIso(selectedDate.value, -7)
  } else if (viewMode.value === 'mes') {
    selectedDate.value = addMonthsIso(selectedDate.value, -1)
  } else {
    selectedDate.value = addDaysIso(selectedDate.value, -1)
  }
}

const nextDate = () => {
  if (viewMode.value === 'semana') {
    selectedDate.value = addDaysIso(selectedDate.value, 7)
  } else if (viewMode.value === 'mes') {
    selectedDate.value = addMonthsIso(selectedDate.value, 1)
  } else {
    selectedDate.value = addDaysIso(selectedDate.value, 1)
  }
}

const setToday = () => {
  selectedDate.value = todayIsoLocal()
}

const formattedDisplayDate = computed(() => formatDisplayDate(selectedDate.value))


const handleSelectTurno = (turno: Turno) => {
  selectedTurno.value = turno
}

const closeDetailPanel = () => {
  selectedTurno.value = null
}

const reloadTurnos = async () => {
  const rows = await turnosService.getTurnos()
  turnos.value = auth.user?.professionalId
    ? rows.filter((t) => String(t.medicoId) === String(auth.user?.professionalId))
    : rows
  if (selectedTurno.value) {
    selectedTurno.value =
      turnos.value.find((t) => String(t.id) === String(selectedTurno.value?.id)) || null
  }
}

const marcarAtendido = async () => {
  if (!selectedTurno.value || actionBusy.value) return
  if (selectedTurno.value.statusApi !== 'en_sala_de_espera') {
    alert('Solo se puede marcar atendido si el paciente está en sala de espera')
    return
  }
  actionBusy.value = true
  try {
    await turnosService.updateStatus(selectedTurno.value.id, 'atendido')
    await reloadTurnos()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo marcar como atendido')
  } finally {
    actionBusy.value = false
  }
}

const irAlPaciente = () => {
  const turno = selectedTurno.value
  if (!turno) return
  void router.push({
    name: 'medico-pacientes',
    query: {
      pacienteId: turno.pacienteId ? String(turno.pacienteId) : undefined,
      dni: turno.pacienteDni || undefined,
      tab: 'datos',
    },
  })
}

const estadoLabel = (turno: Turno) => {
  if (turno.statusApi === 'en_sala_de_espera') return 'En sala de espera'
  if (turno.statusApi === 'programado') return 'Programado'
  if (turno.statusApi === 'atendido') return 'Atendido'
  if (turno.statusApi === 'cancelado') return 'Cancelado'
  return turno.estado
}

const resetFilters = () => {
  filterEstado.value = ''
  filterFranja.value = 'todos'
}
</script>

<template>
  <div>

    <PageHeader
      title="Turnos"
      description="Consulta visual de agenda médica, grilla horaria e información detallada de citas."
    >
      <div class="d-flex align-items-center gap-2">

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


    <div class="hospital-card mb-4">
      <div class="hospital-card-body p-3">
        <div class="row g-3 align-items-center justify-content-between">

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


            <input
              v-model="selectedDate"
              type="date"
              class="form-control form-control-sm"
              style="width: 150px;"
              aria-label="Seleccionar fecha"
            />


            <span class="fw-semibold text-dark ms-2 d-none d-lg-inline">
              {{ formattedDisplayDate }}
            </span>
          </div>


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


    <div class="row g-4">

      <div :class="selectedTurno ? 'col-12 col-xl-8' : 'col-12'">

        <template v-if="viewMode === 'dia'">

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

              <div class="medico-agenda-grid">
                <div
                  v-for="timeSlot in filteredTimeSlots"
                  :key="timeSlot"
                  class="medico-agenda-slot"
                  role="button"
                  @click="turnoEnHora(timeSlot) && (selectedTurno = turnoEnHora(timeSlot) || null)"
                >
                  <div class="medico-slot-time">{{ timeSlot }}</div>
                  <div class="medico-slot-content">
                    <span
                      v-if="turnoEnHora(timeSlot)"
                      class="fw-semibold small"
                    >
                      {{ turnoEnHora(timeSlot)?.paciente }}
                    </span>
                    <span v-else class="text-muted small fst-italic">
                      Sin consultas asignadas en esta franja
                    </span>
                  </div>
                  <span
                    class="badge border"
                    :class="turnoEnHora(timeSlot) ? 'bg-warning-subtle text-warning-emphasis border-warning-subtle' : 'bg-light text-muted'"
                  >
                    {{ turnoEnHora(timeSlot)?.estado || 'Disponible' }}
                  </span>
                </div>
              </div>
            </div>
          </div>


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
                    <template v-if="turnosDelDia.length > 0">
                      <tr
                        v-for="turno in turnosDelDia"
                        :key="turno.id"
                        role="button"
                        @click="selectedTurno = turno"
                      >
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

        <template v-else-if="viewMode === 'semana'">
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-calendar-week text-warning"></i>
                <span>Agenda semanal</span>
              </div>
              <span class="text-muted small">
                {{ weekDays[0]?.isoDate }} → {{ weekDays[5]?.isoDate }}
              </span>
            </div>

            <div class="hospital-card-body p-3">
              <div class="row g-2">
                <div v-for="day in weekDays" :key="day.isoDate" class="col-12 col-md-6 col-xl-4">
                  <button
                    type="button"
                    class="w-100 text-start border rounded p-3 bg-white"
                    :class="{
                      'bg-warning-subtle border-warning': day.isSelected,
                      'border-primary': day.isToday && !day.isSelected,
                    }"
                    @click="selectCalendarDay(day.isoDate)"
                  >
                    <div class="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div class="fw-semibold">{{ day.name }} {{ day.dateNumber }}</div>
                        <div class="small text-muted">{{ day.isoDate }}</div>
                      </div>
                      <span class="badge" :class="day.count ? 'bg-warning text-dark' : 'bg-light text-muted border'">
                        {{ day.count }}
                      </span>
                    </div>
                    <ul v-if="day.turnos.length" class="list-unstyled mb-0 small">
                      <li v-for="t in day.turnos.slice(0, 5)" :key="t.id" class="mb-1">
                        <span class="fw-semibold">{{ t.hora }}</span> · {{ t.paciente }}
                      </li>
                      <li v-if="day.turnos.length > 5" class="text-muted">
                        +{{ day.turnos.length - 5 }} más…
                      </li>
                    </ul>
                    <div v-else class="small text-muted">Sin turnos</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </template>

        <template v-else>
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-calendar-month text-warning"></i>
                <span>{{ monthTitle }}</span>
              </div>
              <span class="text-muted small">Clic en un día para ver la agenda</span>
            </div>

            <div class="hospital-card-body p-3">
              <div
                class="small fw-semibold text-muted mb-2 text-center"
                style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem;"
              >
                <div>Lun</div><div>Mar</div><div>Mié</div><div>Jue</div><div>Vie</div><div>Sáb</div><div>Dom</div>
              </div>
              <div style="display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.35rem;">
                <button
                  v-for="cell in monthCells"
                  :key="cell.isoDate"
                  type="button"
                  class="border rounded py-2 px-1"
                  :class="{
                    'bg-warning-subtle border-warning': cell.isSelected,
                    'bg-white': cell.inMonth && !cell.isSelected,
                    'bg-light text-muted': !cell.inMonth,
                    'border-primary': cell.isToday && !cell.isSelected,
                  }"
                  @click="selectCalendarDay(cell.isoDate)"
                >
                  <div class="fw-semibold">{{ cell.dateNumber }}</div>
                  <div
                    class="small"
                    :class="cell.count ? 'text-warning-emphasis fw-semibold' : 'text-muted'"
                  >
                    {{ cell.count || '—' }}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>


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
                {{ estadoLabel(selectedTurno) }}
              </span>
            </div>

            <div v-if="selectedTurno.observaciones" class="mb-3">
              <div class="text-muted small">Observaciones</div>
              <p class="small text-secondary mb-0 bg-light p-2 rounded">
                {{ selectedTurno.observaciones }}
              </p>
            </div>

            <div class="pt-3 border-top d-grid gap-2">
              <button
                type="button"
                class="btn btn-sm btn-hospital-primary"
                :disabled="!selectedTurno.pacienteId && !selectedTurno.pacienteDni"
                @click="irAlPaciente"
              >
                <i class="bi bi-person-vcard me-1"></i>
                Ver ficha del paciente
              </button>
              <button
                v-if="selectedTurno.statusApi === 'en_sala_de_espera'"
                type="button"
                class="btn btn-sm btn-outline-warning text-dark"
                :disabled="actionBusy"
                @click="marcarAtendido"
              >
                <i class="bi bi-check2-circle me-1"></i>
                Marcar como atendido
              </button>
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
