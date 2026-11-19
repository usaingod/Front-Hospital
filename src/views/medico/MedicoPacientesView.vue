<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Paciente } from '@/types/paciente'
import type { Internacion, InternacionFilter } from '@/types/internacion'
import type { Prescripcion, CreatePrescripcionDTO } from '@/types/prescripcion'
import type { Supply } from '@/types/prescripcion'
import { ApiError } from '@/services/api'
import { internacionService } from '@/services/camasService'
import { pacientesService } from '@/services/pacientesService'
import { prescripcionService, supplyService } from '@/services/prescripcionService'
import { usePacientesListado } from '@/composables/usePacientesListado'


const route = useRoute()


const activePadron = ref<'turnos' | 'internacion'>('turnos')


const {
  pacientes: pacientesTurnos,
  loading: loadingPacientesTurnos,
  error: errorPacientesTurnos,
  loadPacientes: loadPacientesTurnos,
  searchQuery: searchQueryTurnos,
  filterEstado: filterEstadoTurnos,
  pacientesFiltrados: filteredPacientesTurnos,
  resetFiltros: resetFiltersTurnos,
} = usePacientesListado()

const selectedPatientTurnos = ref<Paciente | null>(null)
const activeTabTurnos = ref<'historia' | 'turnos' | 'datos' | 'observaciones'>('historia')

const selectPatientTurnos = (paciente: Paciente) => {
  selectedPatientTurnos.value = paciente
}

const clearSelectedPatientTurnos = () => {
  selectedPatientTurnos.value = null
}


const filtrosInternacion = ref<InternacionFilter>({
  query: '',
  sala: '',
  estado: '',
})

const selectedInternacion = ref<Internacion | null>(null)
const selectedPatientInternacion = ref<Paciente | null>(null)
const activeTabInternacion = ref<'medicacion' | 'historia' | 'evolucion'>('medicacion')


const internaciones = ref<Internacion[]>([])
const prescripciones = ref<Prescripcion[]>([])


const salasDisponibles = computed<string[]>(() => {
  const salasSet = new Set(internaciones.value.map((i) => i.sala))
  return Array.from(salasSet).sort()
})


const internacionesFiltradas = computed(() => {
  return internaciones.value.filter((internacion) => {
    const q = filtrosInternacion.value.query?.toLowerCase() || ''
    const matchesQuery =
      !q ||
      internacion.sala.toLowerCase().includes(q) ||
      internacion.numeroCama.toLowerCase().includes(q)

    const matchesSala =
      !filtrosInternacion.value.sala || internacion.sala === filtrosInternacion.value.sala

    const matchesEstado =
      !filtrosInternacion.value.estado ||
      internacion.estado === filtrosInternacion.value.estado

    return matchesQuery && matchesSala && matchesEstado
  })
})

const limpiarFiltrosInternacion = () => {
  filtrosInternacion.value = { query: '', sala: '', estado: '' }
}

const hayFiltrosInternacion = computed(
  () =>
    !!filtrosInternacion.value.query ||
    !!filtrosInternacion.value.sala ||
    !!filtrosInternacion.value.estado,
)

const selectInternacion = async (internacion: Internacion) => {
  selectedInternacion.value = internacion
  activeTabInternacion.value = 'medicacion'
  try {
    const [patient, meds] = await Promise.all([
      pacientesService.getPacienteById(internacion.pacienteId),
      prescripcionService.getByPacienteId(internacion.pacienteId),
    ])
    selectedPatientInternacion.value = patient
    prescripciones.value = meds
  } catch (err) {
    prescripciones.value = []
    alert(err instanceof ApiError ? err.message : 'No se pudo cargar la internación')
  }
}

const clearSelectedInternacion = () => {
  selectedInternacion.value = null
  selectedPatientInternacion.value = null
  prescripciones.value = []
}


const showModalPrescripcion = ref(false)


const catalogoSupplies = ref<Supply[]>([])


const formPrescripcion = ref<CreatePrescripcionDTO>({
  supplyId: '',
  dosis: '',
  cadaHoras: 0,
})

const errorsPrescripcion = ref<Partial<Record<keyof CreatePrescripcionDTO, string>>>({})
const isSubmittingPrescripcion = ref(false)


const intervalosHoras = [1, 2, 4, 6, 8, 12, 24, 48, 72]

const abrirModalPrescripcion = () => {
  formPrescripcion.value = { supplyId: '', dosis: '', cadaHoras: 0 }
  errorsPrescripcion.value = {}
  showModalPrescripcion.value = true
}

const cerrarModalPrescripcion = () => {
  showModalPrescripcion.value = false
  errorsPrescripcion.value = {}
}

const validarFormPrescripcion = (): boolean => {
  const errores: Partial<Record<keyof CreatePrescripcionDTO, string>> = {}

  if (!formPrescripcion.value.supplyId) {
    errores.supplyId = 'Debe seleccionar un medicamento.'
  }
  if (!formPrescripcion.value.dosis || !formPrescripcion.value.dosis.trim()) {
    errores.dosis = 'La dosis es obligatoria.'
  }
  if (!formPrescripcion.value.cadaHoras || formPrescripcion.value.cadaHoras <= 0) {
    errores.cadaHoras = 'Seleccione la frecuencia de administración.'
  }

  errorsPrescripcion.value = errores
  return Object.keys(errores).length === 0
}

const crearPrescripcion = async () => {
  if (!validarFormPrescripcion()) return
  if (isSubmittingPrescripcion.value || !selectedInternacion.value) return
  isSubmittingPrescripcion.value = true
  try {
    await prescripcionService.create(
      selectedInternacion.value.pacienteId,
      formPrescripcion.value,
    )
    prescripciones.value = await prescripcionService.getByPacienteId(
      selectedInternacion.value.pacienteId,
    )
    cerrarModalPrescripcion()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo crear la indicación')
  } finally {
    isSubmittingPrescripcion.value = false
  }
}

const applyRoutePatientSelection = () => {
  const queryTab = route.query.tab as string
  if (queryTab && ['historia', 'turnos', 'datos', 'observaciones'].includes(queryTab)) {
    activeTabTurnos.value = queryTab as 'historia' | 'turnos' | 'datos' | 'observaciones'
  }

  const pacienteId = route.query.pacienteId
    ? String(route.query.pacienteId)
    : ''
  const dni = route.query.dni ? String(route.query.dni) : ''
  if (!pacienteId && !dni) return

  activePadron.value = 'turnos'
  const found =
    pacientesTurnos.value.find((p) => String(p.id) === pacienteId) ||
    pacientesTurnos.value.find((p) => p.dni === dni)
  if (found) {
    selectedPatientTurnos.value = found
    searchQueryTurnos.value = found.dni || `${found.apellido}`
  }
}

onMounted(async () => {
  try {
    const [, stays, supplies] = await Promise.all([
      loadPacientesTurnos(),
      internacionService.getAll(),
      supplyService.getAll(),
    ])
    internaciones.value = stays
    catalogoSupplies.value = supplies
    if (errorPacientesTurnos.value) {
      alert(errorPacientesTurnos.value)
    }
    applyRoutePatientSelection()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudieron cargar los pacientes')
  }
})

watch(
  () => [route.query.pacienteId, route.query.dni, route.query.tab],
  () => {
    applyRoutePatientSelection()
  },
)
</script>

<template>
  <div>

    <PageHeader
      title="Pacientes"
      description="Padrón de turnos e internación. Consulta de historias clínicas y gestión de prescripciones."
    />


    <div class="mb-4">
      <ul class="medico-nav-tabs" role="tablist" style="border-bottom: 2px solid var(--hospital-border-color);">
        <li>
          <button
            type="button"
            class="medico-tab-btn"
            :class="{ active: activePadron === 'turnos' }"
            role="tab"
            :aria-selected="activePadron === 'turnos'"
            @click="activePadron = 'turnos'"
          >
            <i class="bi bi-calendar3"></i>
            <span>Padrón de turnos</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            class="medico-tab-btn"
            :class="{ active: activePadron === 'internacion' }"
            role="tab"
            :aria-selected="activePadron === 'internacion'"
            @click="activePadron = 'internacion'"
          >
            <i class="bi bi-hospital"></i>
            <span>Padrón de internación</span>
          </button>
        </li>
      </ul>
    </div>


    <div v-if="activePadron === 'turnos'">
      <div class="row g-4">

        <div class="col-12 col-xl-5 col-lg-5">
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-people text-warning"></i>
                <span>Padrón de pacientes</span>
              </div>
              <span class="badge bg-light text-muted border">
                {{ filteredPacientesTurnos.length }} pacientes
              </span>
            </div>

            <div class="hospital-card-body p-3">

              <div class="mb-3">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input
                    v-model="searchQueryTurnos"
                    type="text"
                    class="form-control border-start-0 ps-0"
                    placeholder="Buscar por nombre, apellido o DNI..."
                    aria-label="Buscar paciente"
                  />
                  <button
                    v-if="searchQueryTurnos"
                    class="btn btn-outline-secondary"
                    type="button"
                    title="Borrar búsqueda"
                    @click="searchQueryTurnos = ''"
                  >
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>


              <div class="d-flex align-items-center gap-2 mb-3">
                <select
                  v-model="filterEstadoTurnos"
                  class="form-select form-select-sm"
                  aria-label="Filtrar por estado"
                >
                  <option value="">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                </select>
                <button
                  v-if="searchQueryTurnos || filterEstadoTurnos"
                  type="button"
                  class="btn btn-sm btn-outline-secondary text-nowrap"
                  @click="resetFiltersTurnos"
                >
                  Limpiar
                </button>
              </div>


              <div class="hospital-table-wrapper border rounded">
                <table class="hospital-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Paciente</th>
                      <th scope="col">DNI</th>
                      <th scope="col">Última atención</th>
                      <th scope="col" class="text-center" style="width: 80px;">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="filteredPacientesTurnos.length > 0">
                      <tr
                        v-for="paciente in filteredPacientesTurnos"
                        :key="paciente.id"
                        :class="{ 'table-warning': selectedPatientTurnos?.id === paciente.id }"
                        style="cursor: pointer;"
                        @click="selectPatientTurnos(paciente)"
                      >
                        <td>
                          <div class="fw-semibold text-dark">
                            {{ paciente.apellido }}, {{ paciente.nombre }}
                          </div>
                        </td>
                        <td class="text-muted">{{ paciente.dni }}</td>
                        <td class="text-muted small">
                          {{ paciente.ultimaAtencion || '—' }}
                        </td>
                        <td class="text-center">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-warning text-dark py-0 px-2"
                            title="Consultar ficha del paciente"
                            @click.stop="selectPatientTurnos(paciente)"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    </template>

                    <tr v-else>
                      <td colspan="4" class="p-0">
                        <EmptyState
                          icon="bi-person-x"
                          title="No hay pacientes para mostrar"
                          description="El padrón de pacientes estará disponible una vez conectado con el servidor."
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


        <div class="col-12 col-xl-7 col-lg-7">

          <div v-if="!selectedPatientTurnos" class="hospital-card h-100 mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-person-badge text-warning"></i>
                <span>Información del paciente</span>
              </div>
            </div>
            <div class="hospital-card-body d-flex align-items-center justify-content-center p-5">
              <EmptyState
                icon="bi-person-bounding-box"
                title="Ningún paciente seleccionado"
                description="Seleccioná un paciente para consultar su información."
              />
            </div>
          </div>


          <div v-else class="hospital-card mb-0">
            <div class="hospital-card-header pb-3">
              <div class="d-flex align-items-center gap-3">
                <div
                  class="hospital-avatar"
                  style="background-color: var(--hospital-amber-primary); width: 44px; height: 44px; font-size: 1.1rem;"
                >
                  {{ selectedPatientTurnos.nombre.charAt(0) }}{{ selectedPatientTurnos.apellido.charAt(0) }}
                </div>
                <div>
                  <h2 class="h5 fw-bold mb-0 text-dark">
                    {{ selectedPatientTurnos.apellido }}, {{ selectedPatientTurnos.nombre }}
                  </h2>
                  <div class="d-flex align-items-center gap-2 mt-1">
                    <span class="badge bg-light text-muted border">
                      DNI: {{ selectedPatientTurnos.dni }}
                    </span>
                    <span
                      class="badge"
                      :class="selectedPatientTurnos.estado === 'inactivo' ? 'bg-secondary' : 'bg-success-subtle text-success border border-success-subtle'"
                    >
                      {{ selectedPatientTurnos.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                title="Cerrar panel de detalle"
                @click="clearSelectedPatientTurnos"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>

            <div class="hospital-card-body pt-3">
              <ul class="medico-nav-tabs" role="tablist">
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabTurnos === 'historia' }"
                    role="tab"
                    @click="activeTabTurnos = 'historia'"
                  >
                    <i class="bi bi-journal-medical"></i>
                    <span>Historia clínica</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabTurnos === 'turnos' }"
                    role="tab"
                    @click="activeTabTurnos = 'turnos'"
                  >
                    <i class="bi bi-calendar3"></i>
                    <span>Turnos</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabTurnos === 'datos' }"
                    role="tab"
                    @click="activeTabTurnos = 'datos'"
                  >
                    <i class="bi bi-person-vcard"></i>
                    <span>Datos personales</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabTurnos === 'observaciones' }"
                    role="tab"
                    @click="activeTabTurnos = 'observaciones'"
                  >
                    <i class="bi bi-chat-left-text"></i>
                    <span>Observaciones</span>
                  </button>
                </li>
              </ul>


              <div v-if="activeTabTurnos === 'historia'" class="tab-pane-content">
                <div class="alert alert-light border d-flex align-items-center gap-2 mb-3 py-2 px-3">
                  <i class="bi bi-info-circle text-warning fs-5"></i>
                  <span class="small text-muted">
                    Estructura visual de Historia Clínica preparada para la futura sincronización con el backend.
                  </span>
                </div>
                <div class="card border mb-3">
                  <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
                    <span class="fw-semibold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                      <i class="bi bi-clipboard2-pulse me-1 text-warning"></i>Antecedentes
                    </span>
                    <span class="badge bg-white text-muted border">0 registrados</span>
                  </div>
                  <div class="card-body p-3">
                    <EmptyState
                      icon="bi-clipboard2-pulse"
                      title="Sin antecedentes clínicos registrados"
                      description="Los antecedentes se listarán al conectar con la historia clínica electrónica."
                      compact
                    />
                  </div>
                </div>
                <div class="card border mb-3">
                  <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
                    <span class="fw-semibold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                      <i class="bi bi-chat-square-heart me-1 text-warning"></i>Consultas y Diagnósticos
                    </span>
                    <span class="badge bg-white text-muted border">0 consultas</span>
                  </div>
                  <div class="card-body p-3">
                    <EmptyState
                      icon="bi-journal-medical"
                      title="Sin consultas previas registradas"
                      description="Las evoluciones, diagnósticos y tratamientos previos se cargarán desde el servidor."
                      compact
                    />
                  </div>
                </div>
                <div class="card border mb-0">
                  <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
                    <span class="fw-semibold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                      <i class="bi bi-prescription2 me-1 text-warning"></i>Tratamientos y Recetas
                    </span>
                    <span class="badge bg-white text-muted border">0 prescripciones</span>
                  </div>
                  <div class="card-body p-3">
                    <EmptyState
                      icon="bi-prescription2"
                      title="Sin recetas o tratamientos activos"
                      description="Las prescripciones electrónicas se integrarán en la etapa de servicios clínicos."
                      compact
                    />
                  </div>
                </div>
              </div>


              <div v-else-if="activeTabTurnos === 'turnos'" class="tab-pane-content">
                <div class="hospital-table-wrapper border rounded">
                  <table class="hospital-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Fecha</th>
                        <th scope="col">Hora</th>
                        <th scope="col">Especialidad</th>
                        <th scope="col">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colspan="4" class="p-0">
                          <EmptyState
                            icon="bi-calendar-check"
                            title="Sin historial de turnos para este paciente"
                            description="Los turnos pasados y futuros se mostrarán aquí una vez provistos por el backend."
                            compact
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>


              <div v-else-if="activeTabTurnos === 'datos'" class="tab-pane-content">
                <div class="row g-3">
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Nombre y Apellido</div>
                      <div class="fw-semibold text-dark">
                        {{ selectedPatientTurnos.nombre }} {{ selectedPatientTurnos.apellido }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">DNI / Documento</div>
                      <div class="fw-semibold text-dark">{{ selectedPatientTurnos.dni }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Fecha de nacimiento</div>
                      <div class="fw-semibold text-dark">
                        {{ selectedPatientTurnos.fechaNacimiento || '—' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Obra Social / Prepaga</div>
                      <div class="fw-semibold text-dark">
                        {{ selectedPatientTurnos.obraSocial || 'Particular / Sin cobertura' }}
                      </div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Teléfono</div>
                      <div class="fw-semibold text-dark">{{ selectedPatientTurnos.telefono || '—' }}</div>
                    </div>
                  </div>
                  <div class="col-12 col-sm-6">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Email</div>
                      <div class="fw-semibold text-dark">{{ selectedPatientTurnos.email || '—' }}</div>
                    </div>
                  </div>
                  <div class="col-12">
                    <div class="p-2 border rounded bg-light">
                      <div class="text-muted small">Contacto de emergencia</div>
                      <div class="fw-semibold text-dark">
                        {{ selectedPatientTurnos.contactoEmergencia || 'No informado' }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div v-else-if="activeTabTurnos === 'observaciones'" class="tab-pane-content">
                <div v-if="selectedPatientTurnos.observaciones" class="p-3 border rounded bg-light">
                  <p class="mb-0 text-dark">{{ selectedPatientTurnos.observaciones }}</p>
                </div>
                <EmptyState
                  v-else
                  icon="bi-chat-left-text"
                  title="Sin observaciones registradas"
                  description="Las anotaciones clínicas generales se visualizarán en este apartado."
                  compact
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <div v-else-if="activePadron === 'internacion'">
      <div class="row g-4">

        <div class="col-12 col-xl-5 col-lg-5">
          <div class="hospital-card mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-hospital text-warning"></i>
                <span>Padrón de internación</span>
              </div>
              <span class="badge bg-light text-muted border">
                {{ internacionesFiltradas.length }} internados
              </span>
            </div>

            <div class="hospital-card-body p-3">

              <div class="mb-2">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input
                    v-model="filtrosInternacion.query"
                    type="text"
                    class="form-control border-start-0 ps-0"
                    placeholder="Buscar por nombre, DNI, sala o cama..."
                    aria-label="Buscar paciente internado"
                  />
                </div>
              </div>


              <div class="row g-2 mb-3">
                <div class="col-6">
                  <select
                    v-model="filtrosInternacion.sala"
                    class="form-select form-select-sm"
                    aria-label="Filtrar por sala"
                  >
                    <option value="">Todas las salas</option>
                    <option v-for="sala in salasDisponibles" :key="sala" :value="sala">
                      {{ sala }}
                    </option>
                  </select>
                </div>
                <div class="col-5">
                  <select
                    v-model="filtrosInternacion.estado"
                    class="form-select form-select-sm"
                    aria-label="Filtrar por estado"
                  >
                    <option value="">Todos los estados</option>
                    <option value="activo">Activo</option>
                    <option value="alta">Alta</option>
                    <option value="traslado">Traslado</option>
                  </select>
                </div>
                <div class="col-1 d-flex align-items-center">
                  <button
                    v-if="hayFiltrosInternacion"
                    type="button"
                    class="btn btn-sm btn-outline-secondary"
                    title="Limpiar filtros"
                    @click="limpiarFiltrosInternacion"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>


              <div class="hospital-table-wrapper border rounded">
                <table class="hospital-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Paciente</th>
                      <th scope="col">Sala / Cama</th>
                      <th scope="col">Ingreso</th>
                      <th scope="col" class="text-center" style="width: 60px;">Ver</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="internacionesFiltradas.length > 0">
                      <tr
                        v-for="internacion in internacionesFiltradas"
                        :key="internacion.id"
                        style="cursor: pointer;"
                        :class="{ 'table-warning': selectedInternacion?.id === internacion.id }"
                        @click="selectInternacion(internacion)"
                      >
                        <td>
                          <div class="fw-semibold text-dark small">
                            ID: {{ internacion.pacienteId }}
                          </div>
                        </td>
                        <td class="text-muted small">
                          {{ internacion.sala }} / Cama {{ internacion.numeroCama }}
                        </td>
                        <td class="text-muted small">{{ internacion.fechaIngreso || '—' }}</td>
                        <td class="text-center">
                          <button
                            type="button"
                            class="btn btn-sm btn-outline-warning text-dark py-0 px-2"
                            title="Ver paciente internado"
                            @click.stop="selectInternacion(internacion)"
                          >
                            <i class="bi bi-eye"></i>
                          </button>
                        </td>
                      </tr>
                    </template>

                    <tr v-else>
                      <td colspan="4" class="p-0">
                        <EmptyState
                          icon="bi-hospital"
                          title="No hay pacientes internados"
                          description="El padrón de internación se mostrará aquí al conectar con el servidor."
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


        <div class="col-12 col-xl-7 col-lg-7">

          <div v-if="!selectedInternacion" class="hospital-card h-100 mb-0">
            <div class="hospital-card-header">
              <div class="hospital-card-title">
                <i class="bi bi-person-badge text-warning"></i>
                <span>Información del paciente internado</span>
              </div>
            </div>
            <div class="hospital-card-body d-flex align-items-center justify-content-center p-5">
              <EmptyState
                icon="bi-person-bounding-box"
                title="Ningún paciente seleccionado"
                description="Seleccioná un paciente internado para consultar su información y gestionar sus prescripciones."
              />
            </div>
          </div>


          <div v-else class="hospital-card mb-0">

            <div class="hospital-card-header pb-3">
              <div class="d-flex align-items-center gap-3">
                <div
                  class="hospital-avatar"
                  style="background-color: var(--hospital-amber-primary); width: 44px; height: 44px; font-size: 1.1rem;"
                >
                  <i class="bi bi-person-fill"></i>
                </div>
                <div>
                  <h2 class="h5 fw-bold mb-0 text-dark">
                    Paciente internado
                  </h2>
                  <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
                    <span class="badge bg-light text-muted border">
                      ID: {{ selectedInternacion.pacienteId }}
                    </span>
                    <span class="badge bg-warning-subtle text-warning border border-warning-subtle">
                      Internado
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary"
                title="Cerrar panel"
                @click="clearSelectedInternacion"
              >
                <i class="bi bi-x-lg"></i>
              </button>
            </div>


            <div class="px-4 py-2 border-bottom" style="background-color: var(--hospital-amber-subtle);">
              <div class="row g-2 small">
                <div class="col-auto text-muted">
                  <i class="bi bi-door-open me-1"></i>
                  <strong>Sala:</strong> {{ selectedInternacion.sala || '—' }}
                </div>
                <div class="col-auto text-muted">
                  <i class="bi bi-hospital me-1"></i>
                  <strong>Cama:</strong> {{ selectedInternacion.numeroCama || '—' }}
                </div>
                <div class="col-auto text-muted">
                  <i class="bi bi-calendar-event me-1"></i>
                  <strong>Ingreso:</strong> {{ selectedInternacion.fechaIngreso || '—' }}
                </div>
                <div class="col-auto text-muted">
                  <i class="bi bi-clipboard2-heart me-1"></i>
                  <strong>Diagnóstico:</strong> {{ selectedInternacion.diagnostico || '—' }}
                </div>
                <div class="col-auto text-muted">
                  <i class="bi bi-person-badge me-1"></i>
                  <strong>Médico:</strong> {{ selectedInternacion.medicoTratanteNombre || '—' }}
                </div>
              </div>
            </div>

            <div class="hospital-card-body pt-3">

              <ul class="medico-nav-tabs" role="tablist">
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabInternacion === 'medicacion' }"
                    role="tab"
                    @click="activeTabInternacion = 'medicacion'"
                  >
                    <i class="bi bi-capsule"></i>
                    <span>Medicación</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabInternacion === 'historia' }"
                    role="tab"
                    @click="activeTabInternacion = 'historia'"
                  >
                    <i class="bi bi-journal-medical"></i>
                    <span>Historia clínica</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    class="medico-tab-btn"
                    :class="{ active: activeTabInternacion === 'evolucion' }"
                    role="tab"
                    @click="activeTabInternacion = 'evolucion'"
                  >
                    <i class="bi bi-graph-up"></i>
                    <span>Evolución</span>
                  </button>
                </li>
              </ul>


              <div v-if="activeTabInternacion === 'medicacion'" class="tab-pane-content">

                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div class="fw-semibold text-dark d-flex align-items-center gap-2">
                    <i class="bi bi-capsule text-warning"></i>
                    <span>Prescripciones médicas</span>
                    <span class="badge bg-light text-muted border">{{ prescripciones.length }}</span>
                  </div>
                  <button
                    type="button"
                    class="btn-hospital-primary btn-sm d-flex align-items-center gap-1"
                    style="font-size: 0.85rem; padding: 0.4rem 0.9rem;"
                    @click="abrirModalPrescripcion"
                  >
                    <i class="bi bi-plus-lg"></i>
                    Nueva prescripción
                  </button>
                </div>


                <div class="hospital-table-wrapper border rounded">
                  <table class="hospital-table mb-0">
                    <thead>
                      <tr>
                        <th scope="col">Medicamento</th>
                        <th scope="col">Dosis</th>
                        <th scope="col">Frecuencia</th>
                        <th scope="col">Estado</th>
                        <th scope="col" class="text-center" style="width: 80px;">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      <template v-if="prescripciones.length > 0">
                        <tr v-for="prescripcion in prescripciones" :key="prescripcion.id">
                          <td class="fw-semibold">{{ prescripcion.supplyName || '—' }}</td>
                          <td class="text-muted">{{ prescripcion.dosis }}</td>
                          <td class="text-muted">Cada {{ prescripcion.cadaHoras }} h</td>
                          <td>
                            <span
                              class="badge"
                              :class="
                                prescripcion.estado === 'activa'
                                  ? 'bg-success-subtle text-success border border-success-subtle'
                                  : prescripcion.estado === 'suspendida'
                                    ? 'bg-warning-subtle text-warning border border-warning-subtle'
                                    : 'bg-secondary text-white'
                              "
                            >
                              {{ prescripcion.estado || '—' }}
                            </span>
                          </td>
                          <td class="text-center">
                            <button
                              type="button"
                              class="btn-action-icon"
                              title="Ver prescripción"
                              aria-label="Ver"
                            >
                              <i class="bi bi-eye"></i>
                            </button>
                          </td>
                        </tr>
                      </template>

                      <tr v-else>
                        <td colspan="5" class="p-0">
                          <EmptyState
                            icon="bi-capsule"
                            title="Sin prescripciones registradas"
                            description="Las prescripciones de este paciente se mostrarán aquí al conectar con el servidor."
                            compact
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>


              <div v-else-if="activeTabInternacion === 'historia'" class="tab-pane-content">
                <EmptyState
                  icon="bi-journal-medical"
                  title="Historia clínica no disponible"
                  description="La historia clínica del paciente internado se cargará desde el servidor."
                />
              </div>


              <div v-else-if="activeTabInternacion === 'evolucion'" class="tab-pane-content">
                <EmptyState
                  icon="bi-graph-up"
                  title="Sin evoluciones registradas"
                  description="Las notas de evolución clínica del paciente internado se mostrarán aquí al conectar con el servidor."
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <Teleport to="body">
      <div
        v-if="showModalPrescripcion"
        class="modal-overlay theme-medico"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-prescripcion-title"
        @click.self="cerrarModalPrescripcion"
      >
        <div class="hospital-modal">

          <div class="hospital-modal-header">
            <h3 id="modal-prescripcion-title" class="hospital-modal-title">
              <i class="bi bi-capsule text-warning"></i>
              Nueva prescripción médica
            </h3>
            <button
              type="button"
              class="btn-action-icon"
              title="Cerrar modal"
              aria-label="Cerrar"
              @click="cerrarModalPrescripcion"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>


          <div class="hospital-modal-body">

            <div
              v-if="selectedInternacion"
              class="p-3 border rounded mb-4"
              style="background-color: var(--hospital-amber-subtle);"
            >
              <div class="fw-semibold text-dark mb-2 small text-uppercase" style="letter-spacing: 0.05em;">
                <i class="bi bi-person-badge me-1 text-warning"></i>
                Paciente
              </div>
              <div class="row g-2 small">
                <div class="col-12 col-sm-6">
                  <div class="text-muted">ID del paciente</div>
                  <div class="fw-semibold">{{ selectedInternacion.pacienteId }}</div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-muted">Sala</div>
                  <div class="fw-semibold">{{ selectedInternacion.sala || '—' }}</div>
                </div>
                <div class="col-6 col-sm-3">
                  <div class="text-muted">Cama</div>
                  <div class="fw-semibold">{{ selectedInternacion.numeroCama || '—' }}</div>
                </div>
              </div>
            </div>


            <form id="form-prescripcion" novalidate @submit.prevent="crearPrescripcion">

              <div class="mb-3">
                <label for="presc-supply" class="form-label">
                  Medicamento <span class="text-danger">*</span>
                </label>
                <select
                  id="presc-supply"
                  v-model="formPrescripcion.supplyId"
                  class="form-select"
                  :class="{ 'is-invalid': errorsPrescripcion.supplyId }"
                  aria-describedby="presc-supply-error"
                >
                  <option value="">Seleccionar medicamento del catálogo...</option>
                  <option
                    v-for="supply in catalogoSupplies"
                    :key="supply.id"
                    :value="supply.id"
                  >
                    {{ supply.name }}
                  </option>
                </select>
                <div
                  v-if="catalogoSupplies.length === 0"
                  class="form-text text-muted"
                >
                  El catálogo de medicamentos estará disponible al conectar con el servidor.
                </div>
                <div
                  v-if="errorsPrescripcion.supplyId"
                  id="presc-supply-error"
                  class="invalid-feedback"
                >
                  {{ errorsPrescripcion.supplyId }}
                </div>
              </div>


              <div class="mb-3">
                <label for="presc-dosis" class="form-label">
                  Dosis <span class="text-danger">*</span>
                </label>
                <input
                  id="presc-dosis"
                  v-model="formPrescripcion.dosis"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errorsPrescripcion.dosis }"
                  placeholder="Ej: 500mg, 2 comprimidos..."
                  aria-describedby="presc-dosis-error"
                />
                <div
                  v-if="errorsPrescripcion.dosis"
                  id="presc-dosis-error"
                  class="invalid-feedback"
                >
                  {{ errorsPrescripcion.dosis }}
                </div>
              </div>


              <div class="mb-4">
                <label for="presc-frecuencia" class="form-label">
                  Frecuencia de administración <span class="text-danger">*</span>
                </label>
                <select
                  id="presc-frecuencia"
                  v-model.number="formPrescripcion.cadaHoras"
                  class="form-select"
                  :class="{ 'is-invalid': errorsPrescripcion.cadaHoras }"
                  aria-describedby="presc-frecuencia-error"
                >
                  <option :value="0">Seleccionar intervalo...</option>
                  <option
                    v-for="horas in intervalosHoras"
                    :key="horas"
                    :value="horas"
                  >
                    Cada {{ horas }} {{ horas === 1 ? 'hora' : 'horas' }}
                  </option>
                </select>
                <div
                  v-if="errorsPrescripcion.cadaHoras"
                  id="presc-frecuencia-error"
                  class="invalid-feedback"
                >
                  {{ errorsPrescripcion.cadaHoras }}
                </div>
              </div>
            </form>


            <div class="alert alert-light border py-2 px-3 d-flex align-items-center gap-2">
              <i class="bi bi-info-circle text-warning"></i>
              <span class="small text-muted">
                La creación de prescripciones se habilitará al conectar con el servidor.
                Los campos, validaciones y el DTO están preparados para la integración.
              </span>
            </div>
          </div>


          <div class="hospital-modal-footer">
            <button
              type="button"
              class="btn-hospital-outline"
              :disabled="isSubmittingPrescripcion"
              @click="cerrarModalPrescripcion"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="form-prescripcion"
              class="btn-hospital-primary"
              :disabled="isSubmittingPrescripcion"
            >
              <i class="bi bi-check-lg"></i>
              Crear prescripción
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
