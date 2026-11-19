<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Turno } from '@/types/turno'
import { ApiError } from '@/services/api'
import { useAuthStore } from '@/stores/auth'
import { turnosService } from '@/services/turnosService'
import { todayIsoLocal } from '@/utils/dateLocal'


const router = useRouter()


const todayFormatted = computed(() => {
  const now = new Date()
  const formatted = now.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
})

const auth = useAuthStore()
const turnosHoy = ref<Turno[]>([])
const proximosTurnos = ref<Turno[]>([])
const todayIso = todayIsoLocal()

onMounted(() => {
  turnosService
    .getTurnos()
    .then((rows) => {
      const mine = auth.user?.professionalId
        ? rows.filter((t) => String(t.medicoId) === String(auth.user?.professionalId))
        : rows
      turnosHoy.value = mine.filter((t) => t.fecha === todayIso)
      proximosTurnos.value = mine
        .filter((t) => t.fecha > todayIso && t.estado !== 'cancelado')
        .slice(0, 10)
    })
    .catch((err) => {
      alert(err instanceof ApiError ? err.message : 'No se pudieron cargar los turnos')
    })
})

const statCards = computed(() => [
  {
    label: 'Turnos de hoy',
    icon: 'bi-calendar-event',
    colorClass: 'amber' as const,
    hint: 'Citas programadas para la jornada',
    value: String(turnosHoy.value.length || '—'),
  },
  {
    label: 'Turnos confirmados',
    icon: 'bi-check2-circle',
    colorClass: 'green' as const,
    hint: 'Pacientes con asistencia confirmada',
    value: String(turnosHoy.value.filter((t) => t.estado === 'confirmado').length || '—'),
  },
  {
    label: 'Turnos pendientes',
    icon: 'bi-hourglass-split',
    colorClass: 'blue' as const,
    hint: 'Por confirmar o en sala de espera',
    value: String(turnosHoy.value.filter((t) => t.estado === 'pendiente').length || '—'),
  },
  {
    label: 'Turnos cancelados',
    icon: 'bi-x-circle',
    colorClass: 'rose' as const,
    hint: 'Cancelados por paciente o servicio',
    value: String(turnosHoy.value.filter((t) => t.estado === 'cancelado').length || '—'),
  },
])


const quickActions = [
  {
    title: 'Ver mis turnos',
    desc: 'Consultar agenda horaria y citas asignadas',
    icon: 'bi-calendar3',
    route: '/medico/turnos',
  },
  {
    title: 'Buscar pacientes',
    desc: 'Consultar datos de contacto y padrón',
    icon: 'bi-search',
    route: '/medico/pacientes',
  },
  {
    title: 'Ver historia clínica',
    desc: 'Consultar antecedentes y fichas clínicas',
    icon: 'bi-journal-medical',
    route: '/medico/pacientes?tab=historia',
  },
]


const currentDate = ref(new Date())
const selectedDate = ref<Date>(new Date())

const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

const currentMonthName = computed(() => {
  const str = currentDate.value.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)


  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6

  const days = []


  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - i),
    })
  }


  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    })
  }


  const remainingDays = 42 - days.length
  for (let i = 1; i <= remainingDays; i++) {
    days.push({
      dayNumber: i,
      isCurrentMonth: false,
      date: new Date(year, month + 1, i),
    })
  }

  return days
})

const prevMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  )
}

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  )
}

const goToToday = () => {
  currentDate.value = new Date()
  selectedDate.value = new Date()
}

const selectDay = (day: { date: Date; isCurrentMonth: boolean }) => {
  if (day.isCurrentMonth) {
    selectedDate.value = day.date
  }
}

const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  )
}

const isToday = (d: Date) => isSameDay(d, new Date())
const isSelected = (d: Date) => isSameDay(d, selectedDate.value)

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div>

    <PageHeader
      title="Inicio"
      description="Panel de consulta y control para el profesional médico. Visualización de turnos asignados y pacientes."
    >
      <div class="d-flex align-items-center gap-2">
        <span class="badge bg-light text-dark border px-3 py-2 d-flex align-items-center gap-2">
          <i class="bi bi-calendar-event text-warning"></i>
          <span>{{ todayFormatted }}</span>
        </span>
        <button
          type="button"
          class="btn-hospital-primary"
          @click="navigateTo('/medico/turnos')"
        >
          <i class="bi bi-calendar3"></i>
          <span>Consultar agenda</span>
        </button>
      </div>
    </PageHeader>


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


    <div class="mb-4">
      <h2 class="h6 text-uppercase fw-bold text-muted mb-3" style="letter-spacing: 0.05em;">
        Accesos directos
      </h2>
      <div class="row g-3">
        <div
          v-for="action in quickActions"
          :key="action.title"
          class="col-12 col-md-4"
        >
          <div
            class="quick-action-card"
            role="button"
            tabindex="0"
            @click="navigateTo(action.route)"
          >
            <div
              class="quick-action-icon"
              style="background-color: var(--hospital-amber-light); color: var(--hospital-amber-primary);"
            >
              <i :class="['bi', action.icon]"></i>
            </div>
            <div>
              <div class="quick-action-text">{{ action.title }}</div>
              <div class="quick-action-sub">{{ action.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="row g-4 mb-4">

      <div class="col-12 col-xl-8">
        <div class="hospital-card h-100 mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-calendar2-day text-warning"></i>
              <span>Turnos de hoy</span>
            </div>
            <button
              type="button"
              class="btn-hospital-outline btn-sm"
              @click="navigateTo('/medico/turnos')"
            >
              <span>Ver agenda completa</span>
              <i class="bi bi-arrow-right"></i>
            </button>
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
                    <th scope="col" class="text-center" style="width: 110px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="turnosHoy.length > 0">
                    <tr v-for="turno in turnosHoy" :key="turno.id">
                      <td>{{ turno.hora }}</td>
                      <td>{{ turno.paciente }}</td>
                      <td>{{ turno.especialidad }}</td>
                      <td>
                        <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                          {{ turno.estado }}
                        </span>
                      </td>
                      <td class="text-center">
                        <button class="btn btn-sm btn-outline-secondary py-0 px-2" disabled>
                          Ver
                        </button>
                      </td>
                    </tr>
                  </template>


                  <tr v-else>
                    <td colspan="5" class="p-0">
                      <EmptyState
                        icon="bi-calendar-x"
                        title="No hay turnos registrados para hoy"
                        description="Los turnos asignados a su agenda se mostrarán aquí automáticamente cuando se disponga de información del servidor."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>


      <div class="col-12 col-xl-4">
        <div class="hospital-card h-100 mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-calendar-month text-warning"></i>
              <span>Calendario mensual</span>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary py-1 px-2"
              title="Ir a la fecha de hoy"
              @click="goToToday"
            >
              Hoy
            </button>
          </div>

          <div class="hospital-card-body p-3">

            <div class="d-flex align-items-center justify-content-between mb-3">
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary py-0 px-2"
                aria-label="Mes anterior"
                @click="prevMonth"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <span class="fw-semibold text-dark">{{ currentMonthName }}</span>
              <button
                type="button"
                class="btn btn-sm btn-outline-secondary py-0 px-2"
                aria-label="Mes siguiente"
                @click="nextMonth"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </div>


            <div class="row g-1 text-center mb-1">
              <div
                v-for="dayName in daysOfWeek"
                :key="dayName"
                class="col text-muted small fw-bold"
                style="font-size: 0.75rem;"
              >
                {{ dayName }}
              </div>
            </div>


            <div class="row g-1 text-center">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="col-auto"
                style="width: 14.285%;"
              >
                <button
                  type="button"
                  class="btn btn-sm p-0 w-100 rounded-circle d-flex align-items-center justify-content-center"
                  style="height: 32px; font-size: 0.8rem; border: none;"
                  :class="{
                    'text-muted opacity-50': !day.isCurrentMonth,
                    'text-dark fw-medium': day.isCurrentMonth && !isSelected(day.date) && !isToday(day.date),
                    'border border-warning text-warning-emphasis fw-bold bg-warning-subtle': isToday(day.date) && !isSelected(day.date),
                    'bg-warning text-dark fw-bold shadow-sm': isSelected(day.date),
                  }"
                  :disabled="!day.isCurrentMonth"
                  @click="selectDay(day)"
                >
                  {{ day.dayNumber }}
                </button>
              </div>
            </div>


            <div class="mt-3 pt-2 border-top d-flex align-items-center justify-content-center gap-3 small text-muted">
              <span class="d-flex align-items-center gap-1">
                <span class="d-inline-block rounded-circle bg-warning" style="width: 8px; height: 8px;"></span>
                <span>Seleccionado</span>
              </span>
              <span class="d-flex align-items-center gap-1">
                <span class="d-inline-block rounded-circle border border-warning" style="width: 8px; height: 8px;"></span>
                <span>Hoy</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div class="hospital-card mb-0">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-clock-history text-warning"></i>
          <span>Próximos turnos</span>
        </div>
        <span class="text-muted small">Consultas asignadas a futuro</span>
      </div>

      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper border-0 rounded-0">
          <table class="hospital-table">
            <thead>
              <tr>
                <th scope="col" style="width: 120px;">Fecha</th>
                <th scope="col" style="width: 100px;">Hora</th>
                <th scope="col">Paciente</th>
                <th scope="col">Especialidad</th>
                <th scope="col" style="width: 140px;">Estado</th>
                <th scope="col" class="text-center" style="width: 110px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="proximosTurnos.length > 0">
                <tr v-for="turno in proximosTurnos" :key="turno.id">
                  <td>{{ turno.fecha }}</td>
                  <td>{{ turno.hora }}</td>
                  <td>{{ turno.paciente }}</td>
                  <td>{{ turno.especialidad }}</td>
                  <td>
                    <span class="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle">
                      {{ turno.estado }}
                    </span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" disabled>
                      Ver
                    </button>
                  </td>
                </tr>
              </template>


              <tr v-else>
                <td colspan="6" class="p-0">
                  <EmptyState
                    icon="bi-calendar-check"
                    title="No hay próximos turnos en agenda"
                    description="Los próximos turnos programados se listarán en esta tabla cuando se carguen registros en el sistema."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
