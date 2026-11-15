<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Medico } from '@/types/medico'
import type { Paciente } from '@/types/paciente'
import type { Turno, WaitlistItem } from '@/types/turno'
import { ApiError } from '@/services/api'
import { billingService } from '@/services/billingService'
import { medicosService } from '@/services/medicosService'
import { pacientesService } from '@/services/pacientesService'
import { turnosService } from '@/services/turnosService'

const viewMode = ref<'dia' | 'semana' | 'mes'>('dia')
const selectedDate = ref(new Date().toISOString().substring(0, 10))
const filterEspecialidad = ref('')
const filterMedico = ref('')
const filterPaciente = ref('')
const filterTurnoHorario = ref<'todos' | 'manana' | 'tarde' | 'vespertino'>('todos')
const isNewTurnoModalOpen = ref(false)
const pacienteType = ref<'existente' | 'nuevo'>('existente')
const isSubmitting = ref(false)
const selectedTurno = ref<Turno | null>(null)
const waitlist = ref<WaitlistItem[]>([])
const actionBusy = ref(false)

const medicos = ref<Medico[]>([])
const especialidades = ref<string[]>([])
const pacientes = ref<Paciente[]>([])
const turnos = ref<Turno[]>([])

const turnoForm = ref({
  fecha: '',
  hora: '',
  especialidad: '',
  medico: '',
  pacienteId: '',
  pacienteBusqueda: '',
  nuevoNombre: '',
  nuevoApellido: '',
  nuevoDni: '',
  nuevoTelefono: '',
  nuevoEmail: '',
  nuevoObraSocial: '',
  entreturno: false,
})

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00',
]

const entreturnoSlots = [
  '09:15', '09:45', '10:15', '10:45', '11:15', '11:45',
  '12:15', '14:15', '14:45', '15:15', '15:45', '16:15', '16:45', '17:15', '17:45',
]

const filteredTimeSlots = computed(() => {
  if (turnoForm.value.entreturno && isNewTurnoModalOpen.value) {
    return entreturnoSlots
  }
  if (filterTurnoHorario.value === 'manana') return timeSlots.filter((t) => t <= '12:30')
  if (filterTurnoHorario.value === 'tarde') return timeSlots.filter((t) => t >= '13:00' && t <= '17:30')
  if (filterTurnoHorario.value === 'vespertino') return timeSlots.filter((t) => t >= '18:00')
  return timeSlots
})

const gridTimeSlots = computed(() => {
  if (filterTurnoHorario.value === 'manana') return timeSlots.filter((t) => t <= '12:30')
  if (filterTurnoHorario.value === 'tarde') return timeSlots.filter((t) => t >= '13:00' && t <= '17:30')
  if (filterTurnoHorario.value === 'vespertino') return timeSlots.filter((t) => t >= '18:00')
  return timeSlots
})

const preparedDoctorColumns = computed(() => {
  return medicos.value
    .filter((m) => !filterEspecialidad.value || m.especialidad.includes(filterEspecialidad.value))
    .filter((m) => !filterMedico.value || String(m.id) === filterMedico.value)
    .map((m) => ({
      id: String(m.id),
      name: `${m.apellido || ''}, ${m.nombre}`.replace(/^,\s*/, ''),
      specialty: m.especialidad,
    }))
})

const turnosDelDia = computed(() => {
  return turnos.value.filter((t) => {
    const matchesFecha = t.fecha === selectedDate.value
    const matchesPaciente =
      !filterPaciente.value ||
      t.paciente.toLowerCase().includes(filterPaciente.value.toLowerCase()) ||
      (t.pacienteDni || '').includes(filterPaciente.value)
    return matchesFecha && matchesPaciente
  })
})

const waitlistDelDia = computed(() =>
  waitlist.value.filter((w) => w.day === selectedDate.value),
)

const slotTurno = (medicoId: string, hora: string) =>
  turnosDelDia.value.find((t) => String(t.medicoId) === medicoId && t.hora === hora)

const estadoLabel = (turno: Turno) => {
  if (turno.statusApi === 'en_sala_de_espera') return 'En sala de espera'
  if (turno.statusApi === 'programado') return 'Programado'
  if (turno.statusApi === 'atendido') return 'Atendido'
  if (turno.statusApi === 'cancelado') return 'Cancelado'
  return turno.estado
}

const estadoBadgeClass = (turno: Turno) => {
  if (turno.statusApi === 'en_sala_de_espera') {
    return 'badge bg-info-subtle text-info-emphasis border border-info-subtle'
  }
  if (turno.statusApi === 'atendido') {
    return 'badge bg-success-subtle text-success-emphasis border border-success-subtle'
  }
  if (turno.statusApi === 'cancelado') {
    return 'badge bg-secondary-subtle text-secondary-emphasis border'
  }
  return 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle'
}

const loadData = async () => {
  const [docs, esp, pats, apps, waiting] = await Promise.all([
    medicosService.getMedicos(),
    medicosService.getEspecialidades(),
    pacientesService.getPacientes(),
    turnosService.getTurnos(),
    turnosService.getWaitlist(selectedDate.value),
  ])
  medicos.value = docs
  especialidades.value = esp
  pacientes.value = pats
  turnos.value = apps
  waitlist.value = waiting
  if (selectedTurno.value) {
    selectedTurno.value =
      apps.find((t) => String(t.id) === String(selectedTurno.value?.id)) || null
  }
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudieron cargar los turnos')
  })
})

watch(selectedDate, () => {
  turnosService
    .getWaitlist(selectedDate.value)
    .then((rows) => {
      waitlist.value = rows
    })
    .catch(() => {
      waitlist.value = []
    })
})

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
  const d = new Date(parts[0] ?? 2026, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  return d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
})

const openAssignModal = (slotTime?: string, medicoId?: string) => {
  turnoForm.value = {
    fecha: selectedDate.value,
    hora: slotTime || '',
    especialidad: '',
    medico: medicoId || '',
    pacienteId: '',
    pacienteBusqueda: '',
    nuevoNombre: '',
    nuevoApellido: '',
    nuevoDni: '',
    nuevoTelefono: '',
    nuevoEmail: '',
    nuevoObraSocial: '',
    entreturno: false,
  }
  const doc = medicos.value.find((m) => String(m.id) === medicoId)
  turnoForm.value.especialidad = doc?.especialidad || ''
  pacienteType.value = 'existente'
  isNewTurnoModalOpen.value = true
}

const closeAssignModal = () => {
  isNewTurnoModalOpen.value = false
}

const handleAssignSubmit = async () => {
  if (!turnoForm.value.fecha || !turnoForm.value.hora || !turnoForm.value.medico) {
    alert('Completá fecha, hora y médico')
    return
  }
  if (turnoForm.value.entreturno) {
    const minute = Number(turnoForm.value.hora.split(':')[1] || -1)
    if (minute !== 15 && minute !== 45) {
      alert('Un entreturno solo puede empezar a los :15 o a los :45')
      return
    }
  }
  isSubmitting.value = true
  try {
    await turnosService.createTurno({
      fecha: turnoForm.value.fecha,
      hora: turnoForm.value.hora,
      especialidad: turnoForm.value.especialidad,
      medico: turnoForm.value.medico,
      medicoId: turnoForm.value.medico,
      pacienteId: pacienteType.value === 'existente' ? turnoForm.value.pacienteId : undefined,
      tipoPaciente: pacienteType.value,
      pacienteBusqueda: turnoForm.value.pacienteBusqueda,
      entreturno: turnoForm.value.entreturno,
      nuevoPaciente:
        pacienteType.value === 'nuevo'
          ? {
              nombre: turnoForm.value.nuevoNombre,
              apellido: turnoForm.value.nuevoApellido,
              dni: turnoForm.value.nuevoDni,
              telefono: turnoForm.value.nuevoTelefono,
              email: turnoForm.value.nuevoEmail,
              obraSocial: turnoForm.value.nuevoObraSocial,
            }
          : undefined,
    })
    await loadData()
    closeAssignModal()
  } catch (err) {
    alert(
      err instanceof ApiError || err instanceof Error
        ? err.message
        : 'No se pudo asignar el turno',
    )
    if (err instanceof Error && err.message.includes('lista de espera')) {
      await loadData()
    }
  } finally {
    isSubmitting.value = false
  }
}

const openTurnoDetail = (turno: Turno) => {
  selectedTurno.value = turno
}

const closeTurnoDetail = () => {
  selectedTurno.value = null
}

const runAction = async (fn: () => Promise<unknown>, okMessage?: string) => {
  if (actionBusy.value) return
  actionBusy.value = true
  try {
    await fn()
    await loadData()
    if (okMessage) alert(okMessage)
  } catch (err) {
    alert(err instanceof ApiError || err instanceof Error ? err.message : 'No se pudo completar la acción')
  } finally {
    actionBusy.value = false
  }
}

const pasarASala = () => {
  if (!selectedTurno.value) return
  void runAction(() =>
    turnosService.updateStatus(selectedTurno.value!.id, 'en_sala_de_espera'),
  )
}

const cancelarTurno = () => {
  if (!selectedTurno.value) return
  if (!confirm('¿Cancelar este turno? Si hay lista de espera, se promoverá el primero.')) return
  void runAction(() => turnosService.cancelTurno(selectedTurno.value!.id))
}

const facturarConsulta = () => {
  if (!selectedTurno.value) return
  void runAction(
    () => billingService.chargeConsultation(selectedTurno.value!.id, 15000),
    'Consulta facturada. El saldo del paciente se actualizó.',
  )
}

const resetFilters = () => {
  filterEspecialidad.value = ''
  filterMedico.value = ''
  filterPaciente.value = ''
  filterTurnoHorario.value = 'todos'
}
</script>

<template>
  <div>
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

    <div class="hospital-card mb-4">
      <div class="hospital-card-body p-3">
        <div class="row g-3 align-items-center">
          <div class="col-12 col-lg-5 d-flex align-items-center gap-2">
            <div class="btn-group" role="group" aria-label="Navegación de fecha">
              <button type="button" class="btn btn-outline-secondary btn-sm" title="Día anterior" @click="prevDate">
                <i class="bi bi-chevron-left"></i>
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm px-3" @click="setToday">
                Hoy
              </button>
              <button type="button" class="btn btn-outline-secondary btn-sm" title="Día siguiente" @click="nextDate">
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>
            <input v-model="selectedDate" type="date" class="form-control form-control-sm" style="max-width: 160px;" />
            <span class="text-capitalize small fw-semibold text-secondary d-none d-sm-inline">
              {{ formattedDisplayDate }}
            </span>
          </div>

          <div class="col-12 col-sm-6 col-lg-3 text-lg-center">
            <div class="btn-group btn-group-sm" role="group">
              <button type="button" class="btn" :class="viewMode === 'dia' ? 'btn-success' : 'btn-outline-secondary'" @click="viewMode = 'dia'">Día</button>
              <button type="button" class="btn" :class="viewMode === 'semana' ? 'btn-success' : 'btn-outline-secondary'" @click="viewMode = 'semana'">Semana</button>
              <button type="button" class="btn" :class="viewMode === 'mes' ? 'btn-success' : 'btn-outline-secondary'" @click="viewMode = 'mes'">Mes</button>
            </div>
          </div>

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

        <div class="row g-2 align-items-end">
          <div class="col-12 col-md-3">
            <label class="form-label small mb-1">Especialidad</label>
            <select v-model="filterEspecialidad" class="form-select form-select-sm">
              <option value="">Todas</option>
              <option v-for="esp in especialidades" :key="esp" :value="esp">{{ esp }}</option>
            </select>
          </div>
          <div class="col-12 col-md-3">
            <label class="form-label small mb-1">Médico</label>
            <select v-model="filterMedico" class="form-select form-select-sm">
              <option value="">Todos</option>
              <option v-for="m in medicos" :key="m.id" :value="String(m.id)">
                {{ m.apellido }}, {{ m.nombre }}
              </option>
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

    <div class="row g-4">
      <div :class="selectedTurno ? 'col-12 col-xl-8' : 'col-12'">
        <div class="hospital-card">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-grid-3x3 text-success"></i>
              <span>Grilla de turnos y disponibilidad</span>
            </div>
            <span class="text-muted small">
              Clic en vacío para asignar · clic en ocupado para gestionar
            </span>
          </div>
          <div class="hospital-card-body p-0">
            <div class="schedule-grid-container border-0 rounded-0">
              <table class="schedule-grid-table">
                <thead>
                  <tr>
                    <th class="schedule-time-col">Hora</th>
                    <th
                      v-for="col in preparedDoctorColumns"
                      :key="col.id"
                      class="schedule-doctor-header"
                    >
                      <div class="schedule-doctor-name">
                        <span>{{ col.name }}</span>
                      </div>
                      <div class="schedule-doctor-spec">
                        <span>{{ col.specialty }}</span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="preparedDoctorColumns.length === 0">
                    <td colspan="2" class="text-center text-muted py-4">
                      No hay médicos para mostrar con los filtros actuales.
                    </td>
                  </tr>
                  <tr v-for="time in gridTimeSlots" :key="time">
                    <td class="schedule-time-col">{{ time }}</td>
                    <td
                      v-for="col in preparedDoctorColumns"
                      :key="col.id"
                      class="schedule-slot-cell"
                      :class="{ 'bg-success-subtle': slotTurno(col.id, time) && String(selectedTurno?.id) === String(slotTurno(col.id, time)?.id) }"
                      :title="slotTurno(col.id, time)?.paciente || 'Hacé clic para asignar turno'"
                      @click="
                        slotTurno(col.id, time)
                          ? openTurnoDetail(slotTurno(col.id, time)!)
                          : openAssignModal(time, col.id)
                      "
                    >
                      <span v-if="slotTurno(col.id, time)" class="fw-semibold small d-block">
                        {{ slotTurno(col.id, time)?.paciente }}
                      </span>
                      <span
                        v-if="slotTurno(col.id, time)"
                        class="small text-muted"
                      >
                        {{ estadoLabel(slotTurno(col.id, time)!) }}
                      </span>
                      <span v-else class="schedule-slot-empty-label">Disponible</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div class="hospital-card mt-4">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-hourglass-split text-success"></i>
              <span>Lista de espera · {{ selectedDate }}</span>
            </div>
            <span class="text-muted small">{{ waitlistDelDia.length }} en cola</span>
          </div>
          <div class="hospital-card-body p-0">
            <div class="hospital-table-wrapper">
              <table class="hospital-table mb-0">
                <thead>
                  <tr>
                    <th>Paciente</th>
                    <th>DNI</th>
                    <th>Médico</th>
                    <th>Ingreso a la cola</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in waitlistDelDia" :key="item.id">
                    <td class="fw-semibold">{{ item.pacienteNombre }}</td>
                    <td>{{ item.pacienteDni || '—' }}</td>
                    <td>{{ item.medicoNombre }}</td>
                    <td class="text-muted small">
                      {{ new Date(item.createdAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) }}
                    </td>
                  </tr>
                  <tr v-if="waitlistDelDia.length === 0">
                    <td colspan="4" class="p-0">
                      <EmptyState
                        icon="bi-hourglass"
                        title="Sin pacientes en espera"
                        description="Si un horario ya está tomado, el alta del turno deja al paciente en esta lista."
                        compact
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedTurno" class="col-12 col-xl-4">
        <div class="hospital-card sticky-top" style="top: 85px;">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-info-circle text-success"></i>
              <span>Detalle del turno</span>
            </div>
            <button type="button" class="btn-close" aria-label="Cerrar detalle" @click="closeTurnoDetail"></button>
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
                <div class="fw-semibold">{{ selectedTurno.fecha }}</div>
              </div>
              <div class="col-6">
                <div class="text-muted small">Hora</div>
                <div class="fw-semibold">{{ selectedTurno.hora }}</div>
              </div>
            </div>
            <div class="mb-3">
              <div class="text-muted small">Médico</div>
              <div class="fw-semibold">{{ selectedTurno.medico }}</div>
              <div class="text-muted small">{{ selectedTurno.especialidad }}</div>
            </div>
            <div class="mb-3">
              <div class="text-muted small">Estado</div>
              <div>
                <span :class="estadoBadgeClass(selectedTurno)">{{ estadoLabel(selectedTurno) }}</span>
              </div>
            </div>
            <div v-if="selectedTurno.observaciones" class="mb-3">
              <div class="text-muted small">Observaciones</div>
              <p class="small text-secondary mb-0 bg-light p-2 rounded">
                {{ selectedTurno.observaciones }}
              </p>
            </div>

            <div class="d-grid gap-2 pt-2 border-top">
              <button
                v-if="selectedTurno.statusApi === 'programado'"
                type="button"
                class="btn btn-sm btn-hospital-primary"
                :disabled="actionBusy"
                @click="pasarASala"
              >
                <i class="bi bi-door-open me-1"></i>
                Pasar a sala de espera
              </button>
              <button
                v-if="selectedTurno.statusApi === 'programado' || selectedTurno.statusApi === 'en_sala_de_espera' || selectedTurno.statusApi === 'atendido'"
                type="button"
                class="btn btn-sm btn-outline-success"
                :disabled="actionBusy"
                @click="facturarConsulta"
              >
                <i class="bi bi-receipt me-1"></i>
                Facturar consulta
              </button>
              <button
                v-if="selectedTurno.statusApi === 'programado' || selectedTurno.statusApi === 'en_sala_de_espera'"
                type="button"
                class="btn btn-sm btn-outline-danger"
                :disabled="actionBusy"
                @click="cancelarTurno"
              >
                <i class="bi bi-x-circle me-1"></i>
                Cancelar turno
              </button>
              <button type="button" class="btn btn-sm btn-outline-secondary" @click="closeTurnoDetail">
                Cerrar panel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      :is-open="isNewTurnoModalOpen"
      title="Asignación de Turno"
      icon="bi-calendar-plus"
      size="lg"
      @close="closeAssignModal"
    >
      <form @submit.prevent="handleAssignSubmit">
        <div class="row g-3 mb-4">
          <div class="col-12 col-md-6">
            <label class="form-label">Fecha del turno</label>
            <input v-model="turnoForm.fecha" type="date" class="form-control" />
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Hora del turno</label>
            <select v-model="turnoForm.hora" class="form-select">
              <option value="">Seleccioná hora</option>
              <option
                v-for="slot in (turnoForm.entreturno ? entreturnoSlots : timeSlots)"
                :key="slot"
                :value="slot"
              >
                {{ slot }}
              </option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Especialidad</label>
            <select v-model="turnoForm.especialidad" class="form-select">
              <option value="">Seleccioná una especialidad</option>
              <option v-for="esp in especialidades" :key="esp" :value="esp">{{ esp }}</option>
            </select>
          </div>
          <div class="col-12 col-md-6">
            <label class="form-label">Médico</label>
            <select v-model="turnoForm.medico" class="form-select">
              <option value="">Seleccioná un médico</option>
              <option v-for="medico in medicos" :key="medico.id" :value="String(medico.id)">
                {{ medico.apellido }}, {{ medico.nombre }} — {{ medico.especialidad }}
              </option>
            </select>
          </div>
          <div class="col-12">
            <div class="form-check">
              <input
                id="chk-entreturno"
                v-model="turnoForm.entreturno"
                class="form-check-input"
                type="checkbox"
              />
              <label class="form-check-label" for="chk-entreturno">
                Entreturno (:15 / :45 — acorta el turno en curso)
              </label>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <label class="form-label d-block">Tipo de paciente</label>
          <div class="btn-group w-100" role="group">
            <input id="btnRadioExistente" v-model="pacienteType" type="radio" class="btn-check" value="existente" />
            <label class="btn btn-outline-success" for="btnRadioExistente">
              <i class="bi bi-person-check me-1"></i>
              Paciente existente
            </label>
            <input id="btnRadioNuevo" v-model="pacienteType" type="radio" class="btn-check" value="nuevo" />
            <label class="btn btn-outline-success" for="btnRadioNuevo">
              <i class="bi bi-person-plus me-1"></i>
              Paciente nuevo
            </label>
          </div>
        </div>

        <div v-if="pacienteType === 'existente'" class="p-3 bg-light rounded-3 mb-3 border">
          <label class="form-label">Paciente existente</label>
          <select v-model="turnoForm.pacienteId" class="form-select mb-2">
            <option value="">Seleccioná un paciente</option>
            <option v-for="paciente in pacientes" :key="paciente.id" :value="String(paciente.id)">
              {{ paciente.apellido }}, {{ paciente.nombre }} — DNI {{ paciente.dni }}
            </option>
          </select>
          <label class="form-label">O buscá por nombre / DNI</label>
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
        </div>

        <div v-else class="p-3 bg-light rounded-3 mb-3 border">
          <div class="d-flex align-items-center gap-2 mb-3 text-success fw-semibold">
            <i class="bi bi-person-vcard"></i>
            <span>Datos del nuevo paciente</span>
          </div>
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label">Nombre</label>
              <input v-model="turnoForm.nuevoNombre" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label">Apellido</label>
              <input v-model="turnoForm.nuevoApellido" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">DNI</label>
              <input v-model="turnoForm.nuevoDni" type="text" class="form-control" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Teléfono</label>
              <input v-model="turnoForm.nuevoTelefono" type="tel" class="form-control" />
            </div>
            <div class="col-12 col-md-4">
              <label class="form-label">Obra social</label>
              <input v-model="turnoForm.nuevoObraSocial" type="text" class="form-control" />
            </div>
            <div class="col-12">
              <label class="form-label">Email</label>
              <input v-model="turnoForm.nuevoEmail" type="email" class="form-control" />
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="closeAssignModal">
          Cancelar
        </button>
        <button
          type="button"
          class="btn-hospital-primary"
          :disabled="isSubmitting"
          @click="handleAssignSubmit"
        >
          <i class="bi bi-check2"></i>
          <span>{{ isSubmitting ? 'Guardando…' : 'Asignar turno' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
