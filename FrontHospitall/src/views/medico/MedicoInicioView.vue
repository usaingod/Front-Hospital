<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Turno } from '@/types/turno'

/**
 * Vista de Inicio (Perfil Médico)
 * Criterios 1, 2, 3, 5, 8:
 * - Panel de control diario con fecha actual del sistema.
 * - Tarjetas estadísticas de turnos (hoy, confirmados, pendientes, cancelados) con guion neutral ('—').
 * - Calendario mensual compacto con navegación temporal e indicador de fecha seleccionada sin turnos ficticios.
 * - Tablas de "Turnos de hoy" y "Próximos turnos" con encabezados completos y estado vacío estandarizado.
 * - Accesos rápidos para navegación directa a Turnos, Pacientes e Historia Clínica.
 */
const router = useRouter()

// Fecha actual del sistema formateada en español
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

// Colecciones reactivas vacías preparadas para el backend (Regla estricta: sin datos ficticios)
const turnosHoy = ref<Turno[]>([])
const proximosTurnos = ref<Turno[]>([])

// Indicadores estadísticos sin datos inventados (muestran guion según especificación)
const statCards = [
  {
    label: 'Turnos de hoy',
    icon: 'bi-calendar-event',
    colorClass: 'amber' as const,
    hint: 'Citas programadas para la jornada',
    value: '—',
  },
  {
    label: 'Turnos confirmados',
    icon: 'bi-check2-circle',
    colorClass: 'green' as const,
    hint: 'Pacientes con asistencia confirmada',
    value: '—',
  },
  {
    label: 'Turnos pendientes',
    icon: 'bi-hourglass-split',
    colorClass: 'blue' as const,
    hint: 'Por confirmar o en sala de espera',
    value: '—',
  },
  {
    label: 'Turnos cancelados',
    icon: 'bi-x-circle',
    colorClass: 'rose' as const,
    hint: 'Cancelados por paciente o servicio',
    value: '—',
  },
]

// Accesos rápidos a secciones operativas del médico
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

// Calendario mensual compacto con navegación real sin turnos ficticios
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

  // Ajustar día de inicio considerando lunes como primer día (0 = Domingo en JS)
  let startDay = firstDayOfMonth.getDay() - 1
  if (startDay === -1) startDay = 6

  const days = []

  // Días del mes anterior para rellenar
  const prevMonthLastDay = new Date(year, month, 0).getDate()
  for (let i = startDay - 1; i >= 0; i--) {
    days.push({
      dayNumber: prevMonthLastDay - i,
      isCurrentMonth: false,
      date: new Date(year, month - 1, prevMonthLastDay - i),
    })
  }

  // Días del mes actual
  for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
    days.push({
      dayNumber: i,
      isCurrentMonth: true,
      date: new Date(year, month, i),
    })
  }

  // Días del siguiente mes para completar la cuadrícula de 42 celdas
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
    <!-- Encabezado de la página usando componente reutilizable -->
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

    <!-- Tarjetas de Resumen Reutilizables (Sin cantidades ficticias, con guion neutral) -->
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

    <!-- Accesos Rápidos -->
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

    <!-- Contenido Principal: Turnos de Hoy & Calendario Compacto -->
    <div class="row g-4 mb-4">
      <!-- Columna Izquierda: Tabla Turnos de Hoy -->
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
            <!-- Tabla responsiva preparada con directivas v-if / v-else -->
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

                  <!-- Estado vacío estandarizado cuando no hay datos precargados -->
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

      <!-- Columna Derecha: Calendario Mensual Compacto -->
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
            <!-- Selector de Mes -->
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

            <!-- Cabecera de días de la semana -->
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

            <!-- Grilla de días del calendario -->
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

            <!-- Leyenda explicativa -->
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

    <!-- Tabla: Próximos Turnos Programados -->
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

              <!-- Estado vacío para próximos turnos -->
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
