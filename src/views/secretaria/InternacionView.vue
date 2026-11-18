<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Cama, CamaFilter, EstadoCama, Internacion, CreateInternacionDTO } from '@/types/internacion'
import type { Paciente } from '@/types/paciente'
import type { Medico } from '@/types/medico'
import { ApiError } from '@/services/api'
import { billingService, type StayAccount } from '@/services/billingService'
import { camasService, internacionService } from '@/services/camasService'
import { pacientesService } from '@/services/pacientesService'
import { protocolsService, type Protocol } from '@/services/protocolsService'
import { api } from '@/services/api'

/**
 * Vista de Internación (Secretaría)
 * Criterios 1, 2, 3, 5, 7, 8, 9:
 * - Consulta general de camas hospitalarias y su estado de ocupación.
 * - Tres estados claramente diferenciados: Disponible (verde), Ocupada (rojo), En limpieza (ámbar).
 * - Búsqueda por número de cama, sala, habitación o paciente ocupante.
 * - Filtros combinados por sala y estado.
 * - Consulta de información de internación del paciente (diagnóstico, médico tratante, ingreso).
 * - Asignación de camas disponibles y registro de ingreso a internación.
 * - Componentes reutilizables: PageHeader, StatCard, EmptyState, BaseModal.
 * - Cumplimiento estricto de no incorporar datos ficticios (estructuras preparadas con estados vacíos).
 */

const camas = ref<Cama[]>([])
const internaciones = ref<Internacion[]>([])
const pacientesDisponibles = ref<Paciente[]>([])
const medicosTratantes = ref<Medico[]>([])
const protocolos = ref<Protocol[]>([])
const cuentaEstadia = ref<StayAccount | null>(null)

const loadData = async () => {
  const [beds, stays, patients, professionals, protocols] = await Promise.all([
    camasService.getAll(),
    internacionService.getAll(),
    pacientesService.getPacientes(),
    api.get<{ id: string; firstName: string; lastName: string }[]>('/professionals'),
    protocolsService.list().catch(() => [] as Protocol[]),
  ])
  camas.value = beds
  internaciones.value = stays
  pacientesDisponibles.value = patients
  protocolos.value = protocols
  medicosTratantes.value = professionals.map((p) => ({
    id: p.id,
    nombre: p.firstName,
    apellido: p.lastName,
    especialidad: '',
    matricula: '',
    estado: 'activo',
  }))
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudieron cargar las camas')
  })
})

const statCards = computed(() => [
  {
    label: 'Total de camas',
    icon: 'bi-hospital',
    hint: 'Capacidad total registrada',
    colorClass: 'green' as const,
    value: String(camas.value.length || '—'),
  },
  {
    label: 'Camas disponibles',
    icon: 'bi-check-circle',
    hint: 'Listas para asignar',
    colorClass: 'green' as const,
    value: String(camas.value.filter((c) => c.estado === 'disponible').length || '—'),
  },
  {
    label: 'Camas ocupadas',
    icon: 'bi-person-fill',
    hint: 'Pacientes internados',
    colorClass: 'rose' as const,
    value: String(camas.value.filter((c) => c.estado === 'ocupada').length || '—'),
  },
  {
    label: 'En limpieza',
    icon: 'bi-stars',
    hint: 'En acondicionamiento',
    colorClass: 'amber' as const,
    value: String(camas.value.filter((c) => c.estado === 'en_limpieza').length || '—'),
  },
])

// Filtros y búsqueda
const filtros = ref<CamaFilter>({
  query: '',
  sala: '',
  estado: '',
})

// Opciones de salas derivadas de las camas registradas
const salasDisponibles = computed<string[]>(() => {
  const set = new Set(camas.value.map((c) => c.sala).filter(Boolean))
  return Array.from(set).sort()
})

// Camas filtradas según búsqueda y filtros reactivos
const camasFiltradas = computed(() => {
  return camas.value.filter((cama) => {
    const q = filtros.value.query?.trim().toLowerCase() || ''
    const matchesQuery =
      !q ||
      cama.numero.toLowerCase().includes(q) ||
      cama.sala.toLowerCase().includes(q) ||
      (cama.habitacion && cama.habitacion.toLowerCase().includes(q)) ||
      (cama.pacienteNombre && cama.pacienteNombre.toLowerCase().includes(q)) ||
      (cama.pacienteDni && cama.pacienteDni.includes(q))

    const matchesSala = !filtros.value.sala || cama.sala === filtros.value.sala

    const matchesEstado =
      !filtros.value.estado || cama.estado === filtros.value.estado

    return matchesQuery && matchesSala && matchesEstado
  })
})

const hayFiltrosActivos = computed(
  () => !!filtros.value.query || !!filtros.value.sala || !!filtros.value.estado
)

const limpiarFiltros = () => {
  filtros.value = { query: '', sala: '', estado: '' }
}

// Helpers visuales para los estados de camas
const getEstadoBadgeClass = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'badge-cama-disponible'
  if (estado === 'ocupada') return 'badge-cama-ocupada'
  return 'badge-cama-limpieza'
}

const getEstadoLabel = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'Disponible'
  if (estado === 'ocupada') return 'Ocupada'
  return 'En limpieza'
}

const getEstadoIcon = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'bi-check-circle-fill'
  if (estado === 'ocupada') return 'bi-person-fill'
  return 'bi-stars'
}

// ============================================================
// MODAL DE DETALLE DE CAMA E INTERNACIÓN
// ============================================================
const isDetailModalOpen = ref(false)
const selectedCama = ref<Cama | null>(null)
const selectedInternacion = ref<Internacion | null>(null)

const verDetalleCama = (cama: Cama) => {
  selectedCama.value = cama
  // Buscar internación asociada si la cama está ocupada
  selectedInternacion.value =
    internaciones.value.find((i) => i.camaId === cama.id || i.id === cama.internacionId) || null
  cuentaEstadia.value = null
  isDetailModalOpen.value = true
  if (selectedInternacion.value?.id) {
    billingService
      .stayAccount(selectedInternacion.value.id)
      .then((account) => {
        cuentaEstadia.value = account
      })
      .catch(() => {
        cuentaEstadia.value = null
      })
  }
}

const cerrarModalDetalle = () => {
  isDetailModalOpen.value = false
  selectedCama.value = null
  selectedInternacion.value = null
  cuentaEstadia.value = null
}

// ============================================================
// MODAL DE REGISTRO DE INGRESO / ASIGNACIÓN DE CAMA
// ============================================================
const isAssignModalOpen = ref(false)
const formIngreso = ref<CreateInternacionDTO>({
  pacienteId: '',
  camaId: '',
  fechaIngreso: '',
  diagnostico: '',
  motivo: '',
  medicoTratanteId: '',
  observaciones: '',
})

const formErrors = ref<Partial<Record<keyof CreateInternacionDTO, string>>>({})
const isSubmitting = ref(false)

// Camas actualmente disponibles para asignar
const camasDisponiblesParaAsignar = computed(() => {
  return camas.value.filter((c) => c.estado === 'disponible')
})

const abrirModalNuevoIngreso = (camaPreseleccionada?: Cama) => {
  // Inicializar fecha y hora actual en formato ISO local (YYYY-MM-DDTHH:mm)
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const fechaHoraActual = `${year}-${month}-${day}T${hours}:${minutes}`

  formIngreso.value = {
    pacienteId: '',
    camaId: camaPreseleccionada?.id || '',
    fechaIngreso: fechaHoraActual,
    diagnostico: '',
    motivo: '',
    medicoTratanteId: '',
    observaciones: '',
  }
  formErrors.value = {}
  isAssignModalOpen.value = true
}

const cerrarModalAsignar = () => {
  isAssignModalOpen.value = false
  formErrors.value = {}
}

const validarFormularioIngreso = (): boolean => {
  const errores: Partial<Record<keyof CreateInternacionDTO, string>> = {}

  if (!formIngreso.value.pacienteId) {
    errores.pacienteId = 'Debe seleccionar un paciente para la internación.'
  }
  if (!formIngreso.value.camaId) {
    errores.camaId = 'Debe seleccionar una cama disponible.'
  }
  if (!formIngreso.value.fechaIngreso) {
    errores.fechaIngreso = 'La fecha y hora de ingreso son obligatorias.'
  }

  formErrors.value = errores
  return Object.keys(errores).length === 0
}

const handleIngresoSubmit = async () => {
  if (!validarFormularioIngreso()) return
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await internacionService.create({ ...formIngreso.value })
    await loadData()
    cerrarModalAsignar()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo registrar el ingreso')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Internación"
      description="Gestión y disponibilidad de camas hospitalarias, asignación de pacientes e historial de internaciones."
    >
      <template #actions>
        <button
          type="button"
          class="btn-hospital-primary"
          title="Registrar el ingreso de un paciente a internación"
          @click="abrirModalNuevoIngreso()"
        >
          <i class="bi bi-plus-lg"></i>
          <span>Registrar ingreso</span>
        </button>
      </template>
    </PageHeader>

    <!-- Tarjetas de resumen de camas -->
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

    <!-- Barra de búsqueda y filtros -->
    <div class="hospital-filter-bar mb-4">
      <div class="row g-2 align-items-end">
        <!-- Buscador -->
        <div class="col-12 col-md-5">
          <label for="filtro-buscar" class="form-label small mb-1">Buscar cama o paciente</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              id="filtro-buscar"
              v-model="filtros.query"
              type="text"
              class="form-control"
              placeholder="Número de cama, sala, habitación o paciente..."
              aria-label="Buscar camas"
            />
            <button
              v-if="filtros.query"
              class="btn btn-outline-secondary"
              type="button"
              title="Borrar búsqueda"
              @click="filtros.query = ''"
            >
              <i class="bi bi-x"></i>
            </button>
          </div>
        </div>

        <!-- Filtro por sala -->
        <div class="col-6 col-md-3">
          <label for="filtro-sala" class="form-label small mb-1">Filtrar por sala</label>
          <select
            id="filtro-sala"
            v-model="filtros.sala"
            class="form-select form-select-sm"
            aria-label="Filtrar por sala"
          >
            <option value="">Todas las salas</option>
            <option v-for="sala in salasDisponibles" :key="sala" :value="sala">
              {{ sala }}
            </option>
          </select>
        </div>

        <!-- Filtro por estado de cama -->
        <div class="col-6 col-md-3">
          <label for="filtro-estado" class="form-label small mb-1">Estado de ocupación</label>
          <select
            id="filtro-estado"
            v-model="filtros.estado"
            class="form-select form-select-sm"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="ocupada">Ocupada</option>
            <option value="en_limpieza">En limpieza</option>
          </select>
        </div>

        <!-- Botón Limpiar filtros -->
        <div class="col-12 col-md-1 d-flex">
          <button
            v-if="hayFiltrosActivos"
            type="button"
            class="btn btn-sm btn-outline-secondary w-100"
            title="Limpiar todos los filtros"
            @click="limpiarFiltros"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenedor principal: Listado de Camas -->
    <div class="hospital-card mb-0">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-hospital text-success"></i>
          <span>Padrón de camas e internación</span>
        </div>
        <div class="d-flex align-items-center gap-3">
          <!-- Leyenda de colores -->
          <div class="d-none d-md-flex align-items-center gap-2">
            <span class="badge-cama-disponible">
              <i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>
              Disponible
            </span>
            <span class="badge-cama-ocupada">
              <i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>
              Ocupada
            </span>
            <span class="badge-cama-limpieza">
              <i class="bi bi-circle-fill" style="font-size: 0.5rem;"></i>
              En limpieza
            </span>
          </div>
          <span class="badge bg-light text-muted border">
            {{ camasFiltradas.length }} camas
          </span>
        </div>
      </div>

      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper border-0">
          <table class="hospital-table mb-0">
            <thead>
              <tr>
                <th scope="col">Cama</th>
                <th scope="col">Sala / Habitación</th>
                <th scope="col">Estado</th>
                <th scope="col">Paciente internado</th>
                <th scope="col">Fecha de ingreso</th>
                <th scope="col" class="text-center" style="width: 120px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Listado cuando existen registros -->
              <template v-if="camasFiltradas.length > 0">
                <tr v-for="cama in camasFiltradas" :key="cama.id">
                  <td>
                    <div class="fw-semibold text-dark">
                      Cama {{ cama.numero }}
                    </div>
                  </td>
                  <td>
                    <div class="text-dark">{{ cama.sala }}</div>
                    <div v-if="cama.habitacion" class="small text-muted">
                      Hab. {{ cama.habitacion }}
                    </div>
                  </td>
                  <td>
                    <span :class="getEstadoBadgeClass(cama.estado)">
                      <i :class="['bi', getEstadoIcon(cama.estado)]" style="font-size: 0.65rem;"></i>
                      {{ getEstadoLabel(cama.estado) }}
                    </span>
                  </td>
                  <td>
                    <div v-if="cama.estado === 'ocupada' && cama.pacienteNombre" class="fw-semibold text-dark">
                      {{ cama.pacienteNombre }}
                      <span v-if="cama.pacienteDni" class="small text-muted d-block">
                        DNI: {{ cama.pacienteDni }}
                      </span>
                    </div>
                    <div v-else-if="cama.estado === 'ocupada'" class="text-muted">
                      Paciente asignado
                    </div>
                    <div v-else class="text-muted fst-italic small">
                      —
                    </div>
                  </td>
                  <td class="text-muted small">
                    —
                  </td>
                  <td class="text-center">
                    <div class="d-inline-flex gap-1">
                      <!-- Acción Ver detalle -->
                      <button
                        type="button"
                        class="btn-action-icon"
                        title="Consultar detalles de la cama y de internación"
                        aria-label="Ver detalle"
                        @click="verDetalleCama(cama)"
                      >
                        <i class="bi bi-eye"></i>
                      </button>

                      <!-- Acción Asignar cama (habilitada solo si está disponible) -->
                      <button
                        v-if="cama.estado === 'disponible'"
                        type="button"
                        class="btn-action-icon"
                        title="Asignar cama a paciente"
                        aria-label="Asignar cama"
                        @click="abrirModalNuevoIngreso(cama)"
                      >
                        <i class="bi bi-box-arrow-in-right text-success"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>

              <!-- Estado vacío cuando no hay registros -->
              <tr v-else>
                <td colspan="6" class="p-0">
                  <EmptyState
                    icon="bi-hospital"
                    title="No hay camas para mostrar"
                    description="El padrón de camas e internaciones estará disponible una vez conectado con el servidor."
                  >
                    <template #actions>
                      <button
                        v-if="hayFiltrosActivos"
                        type="button"
                        class="btn btn-sm btn-hospital-outline"
                        @click="limpiarFiltros"
                      >
                        <i class="bi bi-arrow-counterclockwise"></i>
                        Restablecer filtros
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

    <!-- ======================================================
         MODAL 1: DETALLE DE CAMA E INTERNACIÓN
    ====================================================== -->
    <BaseModal
      :is-open="isDetailModalOpen"
      title="Información de la Cama"
      icon="bi-hospital"
      icon-color-class="text-success"
      size="lg"
      @close="cerrarModalDetalle"
    >
      <div v-if="selectedCama" class="p-1">
        <!-- Ficha de la cama -->
        <div class="row g-3 mb-4">
          <div class="col-12 col-sm-4">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Identificador / Cama</div>
              <div class="fw-bold fs-6 text-dark">Cama {{ selectedCama.numero }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Sala / Sector</div>
              <div class="fw-semibold text-dark">{{ selectedCama.sala }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-4">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Estado actual</div>
              <div class="mt-1">
                <span :class="getEstadoBadgeClass(selectedCama.estado)">
                  <i :class="['bi', getEstadoIcon(selectedCama.estado)]" style="font-size: 0.65rem;"></i>
                  {{ getEstadoLabel(selectedCama.estado) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de internación según estado -->
        <!-- CASO 1: Cama ocupada con datos de internación -->
        <div v-if="selectedCama.estado === 'ocupada'" class="border rounded p-3 bg-light">
          <div class="d-flex align-items-center gap-2 mb-3">
            <i class="bi bi-person-heart text-success fs-5"></i>
            <h3 class="h6 fw-bold mb-0 text-dark">Datos de Internación del Paciente</h3>
          </div>

          <div v-if="selectedInternacion" class="row g-3">
            <div class="col-12 col-sm-6">
              <div class="text-muted small">Paciente</div>
              <div class="fw-semibold text-dark">
                {{ selectedInternacion.pacienteNombre || selectedCama.pacienteNombre || '—' }}
              </div>
              <div v-if="selectedInternacion.pacienteDni || selectedCama.pacienteDni" class="small text-muted">
                DNI: {{ selectedInternacion.pacienteDni || selectedCama.pacienteDni }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-muted small">Fecha y hora de ingreso</div>
              <div class="fw-semibold text-dark">
                {{ selectedInternacion.fechaIngreso || '—' }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-muted small">Diagnóstico / motivo</div>
              <div class="fw-semibold text-dark">
                {{ selectedInternacion.diagnostico || '—' }}
              </div>
              <div v-if="selectedInternacion.motivo" class="small text-muted">
                Protocolo: {{ selectedInternacion.motivo }}
              </div>
            </div>

            <div class="col-12 col-sm-6">
              <div class="text-muted small">Médico tratante</div>
              <div class="fw-semibold text-dark">
                {{ selectedInternacion.medicoTratanteNombre || '—' }}
              </div>
            </div>

            <div
              v-if="selectedInternacion.protocolTasks && selectedInternacion.protocolTasks.length"
              class="col-12"
            >
              <div class="text-muted small">Tareas de protocolo</div>
              <ul class="mb-0 small ps-3">
                <li v-for="task in selectedInternacion.protocolTasks" :key="task">{{ task }}</li>
              </ul>
            </div>

            <div v-if="selectedInternacion.observaciones" class="col-12">
              <div class="text-muted small">Observaciones clínicas</div>
              <p class="mb-0 text-dark small mt-1">
                {{ selectedInternacion.observaciones }}
              </p>
            </div>

            <div class="col-12">
              <div class="border rounded p-3 bg-white">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <div class="fw-semibold text-dark">
                    <i class="bi bi-receipt me-1 text-success"></i>
                    Cuenta de la estadía
                  </div>
                  <div class="fw-bold text-success">
                    ${{ (cuentaEstadia?.total ?? 0).toLocaleString('es-AR') }}
                  </div>
                </div>
                <div v-if="cuentaEstadia && cuentaEstadia.lines.length" class="small">
                  <div
                    v-for="line in cuentaEstadia.lines"
                    :key="line.id"
                    class="d-flex justify-content-between border-bottom py-1"
                  >
                    <span>{{ line.concept }}</span>
                    <span>${{ line.amount.toLocaleString('es-AR') }}</span>
                  </div>
                </div>
                <div v-else class="text-muted small">Sin cargos de insumos todavía.</div>
              </div>
            </div>
          </div>

          <!-- Estado de internación pendiente de datos del backend -->
          <div v-else>
            <EmptyState
              icon="bi-person-bounding-box"
              title="Información clínica pendiente"
              description="Los detalles de internación de este paciente se cargarán automáticamente desde el servidor."
              compact
            />
          </div>
        </div>

        <!-- CASO 2: Cama disponible -->
        <div v-else-if="selectedCama.estado === 'disponible'" class="border rounded p-3 text-center bg-light">
          <i class="bi bi-check-circle text-success fs-3 mb-2 d-block"></i>
          <div class="fw-semibold text-dark mb-1">Cama disponible para asignación</div>
          <p class="text-muted small mb-3">
            Esta cama se encuentra libre y acondicionada para recibir un paciente que requiera internación.
          </p>
          <button
            type="button"
            class="btn btn-sm btn-hospital-primary"
            @click="cerrarModalDetalle(); abrirModalNuevoIngreso(selectedCama)"
          >
            <i class="bi bi-box-arrow-in-right"></i>
            Asignar a un paciente
          </button>
        </div>

        <!-- CASO 3: Cama en limpieza -->
        <div v-else class="border rounded p-3 text-center bg-light">
          <i class="bi bi-stars text-warning fs-3 mb-2 d-block"></i>
          <div class="fw-semibold text-dark mb-1">Cama en proceso de limpieza</div>
          <p class="text-muted small mb-0">
            La cama está temporalmente fuera de servicio mientras finaliza su acondicionamiento.
            Una vez finalizada la higienización, pasará a estado disponible.
          </p>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          @click="cerrarModalDetalle"
        >
          Cerrar
        </button>
      </template>
    </BaseModal>

    <!-- ======================================================
         MODAL 2: REGISTRAR INGRESO / ASIGNAR CAMA
    ====================================================== -->
    <BaseModal
      :is-open="isAssignModalOpen"
      title="Registrar Ingreso a Internación"
      icon="bi-box-arrow-in-right"
      icon-color-class="text-success"
      size="lg"
      @close="cerrarModalAsignar"
    >
      <form id="form-ingreso-internacion" novalidate @submit.prevent="handleIngresoSubmit">
        <!-- Aviso de preparación para integración -->
        <div class="alert alert-light border py-2 px-3 d-flex align-items-center gap-2 mb-3">
          <i class="bi bi-info-circle text-success fs-5"></i>
          <span class="small text-muted">
            Formulario preparado para el contrato de la API. Los campos y validaciones corresponden
            a la asignación de cama e ingreso hospitalario.
          </span>
        </div>

        <!-- Paciente -->
        <div class="mb-3">
          <label for="ingreso-paciente" class="form-label">
            Paciente que ingresa <span class="text-danger">*</span>
          </label>
          <select
            id="ingreso-paciente"
            v-model="formIngreso.pacienteId"
            class="form-select"
            :class="{ 'is-invalid': formErrors.pacienteId }"
            aria-describedby="ingreso-paciente-error"
          >
            <option value="">Seleccionar paciente del padrón...</option>
            <option
              v-for="paciente in pacientesDisponibles"
              :key="paciente.id"
              :value="String(paciente.id)"
            >
              {{ paciente.apellido }}, {{ paciente.nombre }} (DNI: {{ paciente.dni }})
            </option>
          </select>
          <div v-if="pacientesDisponibles.length === 0" class="form-text text-muted">
            El listado de pacientes se cargará desde el servidor al conectar la API.
          </div>
          <div
            v-if="formErrors.pacienteId"
            id="ingreso-paciente-error"
            class="invalid-feedback"
          >
            {{ formErrors.pacienteId }}
          </div>
        </div>

        <div class="row g-3 mb-3">
          <!-- Cama disponible -->
          <div class="col-12 col-md-6">
            <label for="ingreso-cama" class="form-label">
              Cama asignada <span class="text-danger">*</span>
            </label>
            <select
              id="ingreso-cama"
              v-model="formIngreso.camaId"
              class="form-select"
              :class="{ 'is-invalid': formErrors.camaId }"
              aria-describedby="ingreso-cama-error"
            >
              <option value="">Seleccionar cama disponible...</option>
              <option
                v-for="cama in camasDisponiblesParaAsignar"
                :key="cama.id"
                :value="cama.id"
              >
                Cama {{ cama.numero }} — {{ cama.sala }}
              </option>
            </select>
            <div v-if="camasDisponiblesParaAsignar.length === 0" class="form-text text-muted">
              Las camas disponibles se sincronizarán con el servidor.
            </div>
            <div
              v-if="formErrors.camaId"
              id="ingreso-cama-error"
              class="invalid-feedback"
            >
              {{ formErrors.camaId }}
            </div>
          </div>

          <!-- Fecha y hora de ingreso -->
          <div class="col-12 col-md-6">
            <label for="ingreso-fechahora" class="form-label">
              Fecha y hora de ingreso <span class="text-danger">*</span>
            </label>
            <input
              id="ingreso-fechahora"
              v-model="formIngreso.fechaIngreso"
              type="datetime-local"
              class="form-control"
              :class="{ 'is-invalid': formErrors.fechaIngreso }"
              aria-describedby="ingreso-fechahora-error"
            />
            <div
              v-if="formErrors.fechaIngreso"
              id="ingreso-fechahora-error"
              class="invalid-feedback"
            >
              {{ formErrors.fechaIngreso }}
            </div>
          </div>
        </div>

        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label for="ingreso-motivo" class="form-label">
              Motivo / protocolo
            </label>
            <select id="ingreso-motivo" v-model="formIngreso.motivo" class="form-select">
              <option value="">Sin protocolo específico</option>
              <option v-for="p in protocolos" :key="p.reason" :value="p.reason">
                {{ p.reason }} ({{ p.tasks.length }} tareas)
              </option>
              <option
                v-if="!protocolos.some((p) => p.reason === 'cirugia')"
                value="cirugia"
              >
                cirugia
              </option>
              <option
                v-if="!protocolos.some((p) => p.reason === 'respiratorio')"
                value="respiratorio"
              >
                respiratorio
              </option>
              <option
                v-if="!protocolos.some((p) => p.reason === 'pediatria')"
                value="pediatria"
              >
                pediatria
              </option>
            </select>
            <div class="form-text">Define las tareas automáticas al ingresar.</div>
          </div>
          <div class="col-12 col-md-6">
            <label for="ingreso-diagnostico" class="form-label">
              Diagnóstico de ingreso
            </label>
            <input
              id="ingreso-diagnostico"
              v-model="formIngreso.diagnostico"
              type="text"
              class="form-control"
              placeholder="Ej: Neumonía adquirida en la comunidad..."
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="ingreso-medico" class="form-label">
              Médico tratante
            </label>
            <select
              id="ingreso-medico"
              v-model="formIngreso.medicoTratanteId"
              class="form-select"
            >
              <option value="">Seleccionar profesional médico...</option>
              <option
                v-for="medico in medicosTratantes"
                :key="medico.id"
                :value="String(medico.id)"
              >
                Dr/a. {{ medico.apellido }}, {{ medico.nombre }}
              </option>
            </select>
          </div>
        </div>

        <!-- Observaciones de ingreso -->
        <div class="mb-2">
          <label for="ingreso-observaciones" class="form-label">
            Observaciones de internación
          </label>
          <textarea
            id="ingreso-observaciones"
            v-model="formIngreso.observaciones"
            class="form-control"
            rows="3"
            placeholder="Alergias, indicaciones de aislamiento, dieta o notas iniciales..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isSubmitting"
          @click="cerrarModalAsignar"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-ingreso-internacion"
          class="btn-hospital-primary"
          :disabled="isSubmitting"
        >
          <i class="bi bi-check2"></i>
          <span>Registrar ingreso</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
