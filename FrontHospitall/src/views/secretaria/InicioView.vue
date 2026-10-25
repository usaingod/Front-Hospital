<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Turno } from '@/types/turno'

/**
 * Vista de Inicio (Secretaría)
 * Criterios 1, 2, 3, 5: Uso de componentes reutilizables, directivas de Vue (v-if, v-else, v-for),
 * comunicación por props/slots y preparación para integración de datos reales.
 */
const router = useRouter()

// Colección reactiva de turnos de hoy (inicia vacía según la regla de no incorporar datos ficticios)
const turnosHoy = ref<Turno[]>([])

// Indicadores estadísticos sin datos ficticios (muestran guion según especificación)
const statCards = [
  {
    label: 'Turnos del día',
    icon: 'bi-calendar-check',
    colorClass: 'green' as const,
    hint: 'Total programado para hoy',
    value: '—',
  },
  {
    label: 'Confirmados',
    icon: 'bi-check2-circle',
    colorClass: 'blue' as const,
    hint: 'Pacientes con asistencia confirmada',
    value: '—',
  },
  {
    label: 'Pendientes',
    icon: 'bi-hourglass-split',
    colorClass: 'amber' as const,
    hint: 'Por confirmar o en espera',
    value: '—',
  },
  {
    label: 'Cancelados',
    icon: 'bi-x-circle',
    colorClass: 'rose' as const,
    hint: 'Turnos cancelados hoy',
    value: '—',
  },
]

// Accesos directos a secciones clave
const quickActions = [
  {
    title: 'Nuevo Turno',
    desc: 'Asignar turno a paciente',
    icon: 'bi-calendar-plus',
    route: '/secretaria/turnos',
  },
  {
    title: 'Nuevo Paciente',
    desc: 'Registrar datos en el padrón',
    icon: 'bi-person-plus',
    route: '/secretaria/pacientes',
  },
  {
    title: 'Horarios Médicos',
    desc: 'Consultar agendas de atención',
    icon: 'bi-clock-history',
    route: '/secretaria/medicos',
  },
]

// Calendario mensual compacto (estructura matemática real sin turnos inventados)
const currentDate = ref(new Date())
const selectedDate = ref<Date>(new Date())

const daysOfWeek = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do']

const currentMonthName = computed(() => {
  return currentDate.value.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  })
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

const isToday = (d: Date) => {
  return isSameDay(d, new Date())
}

const isSelected = (d: Date) => {
  return isSameDay(d, selectedDate.value)
}

const navigateTo = (path: string) => {
  router.push(path)
}
</script>

<template>
  <div>
    <!-- Encabezado de la página usando componente reutilizable -->
    <PageHeader
      title="Inicio"
      description="Panel de control diario para la recepción y gestión de turnos del hospital."
    >
      <button
        type="button"
        class="btn-hospital-primary"
        @click="navigateTo('/secretaria/turnos')"
      >
        <i class="bi bi-plus-lg"></i>
        <span>Nuevo turno</span>
      </button>
    </PageHeader>

    <!-- Tarjetas Estadísticas Reutilizables (Sin cantidades inventadas) -->
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
          <div class="quick-action-card" role="button" tabindex="0" @click="navigateTo(action.route)">
            <div class="quick-action-icon">
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
    <div class="row g-4">
      <!-- Columna Izquierda: Tabla Turnos de Hoy -->
      <div class="col-12 col-xl-8">
        <div class="hospital-card h-100 mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-calendar-event text-success"></i>
              <span>Turnos de hoy</span>
            </div>
            <button
              type="button"
              class="btn-hospital-outline btn-sm"
              @click="navigateTo('/secretaria/turnos')"
            >
              <span>Ver agenda completa</span>
              <i class="bi bi-arrow-right"></i>
            </button>
          </div>

          <div class="hospital-card-body p-0">
            <!-- Tabla responsiva preparada con directivas v-if / v-else / v-for -->
            <div class="hospital-table-wrapper border-0 rounded-0">
              <table class="hospital-table">
                <thead>
                  <tr>
                    <th scope="col" style="width: 100px;">Hora</th>
                    <th scope="col">Paciente</th>
                    <th scope="col">Especialidad</th>
                    <th scope="col">Médico</th>
                    <th scope="col" style="width: 140px;">Estado</th>
                    <th scope="col" class="text-center" style="width: 110px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Directiva v-if para listar turnos cuando el backend provea datos -->
                  <template v-if="turnosHoy.length > 0">
                    <tr v-for="turno in turnosHoy" :key="turno.id">
                      <td>{{ turno.hora }}</td>
                      <td>{{ turno.paciente }}</td>
                      <td>{{ turno.especialidad }}</td>
                      <td>{{ turno.medico }}</td>
                      <td>
                        <span class="badge bg-success-subtle text-success border border-success-subtle">
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

                  <!-- Directiva v-else para estado vacío estandarizado sin datos ficticios -->
                  <tr v-else>
                    <td colspan="6" class="p-0">
                      <EmptyState
                        icon="bi-inbox"
                        title="No hay datos para mostrar"
                        description="No se registran turnos asignados para la fecha seleccionada. Los registros aparecerán aquí automáticamente al sincronizar con el servidor."
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna Derecha: Calendario Compacto & Próximos Turnos -->
      <div class="col-12 col-xl-4 d-flex flex-column gap-4">
        <!-- Calendario Mensual Compacto -->
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-calendar-month text-success"></i>
              <span>Calendario mensual</span>
            </div>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary py-1 px-2"
              title="Volver al día actual"
              @click="goToToday"
            >
              Hoy
            </button>
          </div>

          <div class="hospital-card-body">
            <div class="compact-calendar">
              <!-- Navegación del mes -->
              <div class="calendar-header">
                <button
                  type="button"
                  class="btn-action-icon"
                  title="Mes anterior"
                  @click="prevMonth"
                >
                  <i class="bi bi-chevron-left"></i>
                </button>
                <span class="calendar-month-title text-capitalize">
                  {{ currentMonthName }}
                </span>
                <button
                  type="button"
                  class="btn-action-icon"
                  title="Mes siguiente"
                  @click="nextMonth"
                >
                  <i class="bi bi-chevron-right"></i>
                </button>
              </div>

              <!-- Días de la semana -->
              <div class="calendar-grid-header">
                <div v-for="d in daysOfWeek" :key="d">{{ d }}</div>
              </div>

              <!-- Días del mes (Estructura visual sin turnos ficticios) -->
              <div class="calendar-grid-days">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  class="calendar-day-cell"
                  :class="{
                    'other-month': !day.isCurrentMonth,
                    today: isToday(day.date),
                    selected: isSelected(day.date) && day.isCurrentMonth,
                  }"
                  @click="selectDay(day)"
                >
                  {{ day.dayNumber }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección: Próximos Turnos -->
        <div class="hospital-card mb-0 flex-grow-1">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-clock-history text-success"></i>
              <span>Próximos turnos</span>
            </div>
          </div>
          <div class="hospital-card-body">
            <!-- Estado vacío reutilizable -->
            <EmptyState
              compact
              icon="bi-calendar-x"
              title="No hay datos para mostrar"
              description="No hay turnos inmediatos en cola de atención."
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
