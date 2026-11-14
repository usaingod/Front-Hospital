<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Cama, CamaFilter, EstadoCama } from '@/types/internacion'
import type { CreateSignosVitalesDTO } from '@/types/signosVitales'

/**
 * Vista de Camas — Perfil Enfermería
 * Criterios 1, 2, 3, 5, 7, 8, 9:
 * - Tarjetas de resumen con cinco indicadores (sin datos ficticios).
 * - Tabla de camas con buscador, filtro por sala y filtro por estado.
 * - Tres estados de cama: disponible (verde), ocupada (rojo), en limpieza (ámbar).
 * - Formulario de registro de signos vitales con los cuatro signos requeridos.
 * - Pestaña de controles recientes.
 * - Estados vacíos profesionales.
 * - Preparado para integración futura con la API; sin peticiones HTTP en esta etapa.
 */

// Pestaña activa: 'listado' | 'controles'
const activeTab = ref<'listado' | 'controles'>('listado')

// Tarjetas de resumen sin cantidades ficticias
const statCards = [
  { label: 'Total de camas', icon: 'bi-hospital', colorClass: 'rose' as const, value: '—' },
  { label: 'Ocupadas', icon: 'bi-person-fill', colorClass: 'rose' as const, value: '—' },
  { label: 'Disponibles', icon: 'bi-check-circle', colorClass: 'green' as const, value: '—' },
  { label: 'En limpieza', icon: 'bi-stars', colorClass: 'amber' as const, value: '—' },
  { label: 'Controles pendientes', icon: 'bi-clipboard2-pulse', colorClass: 'blue' as const, value: '—' },
]

// Colección reactiva de camas (vacía hasta conectar el backend)
const camas = ref<Cama[]>([])

// Filtros
const filtros = ref<CamaFilter>({
  query: '',
  sala: '',
  estado: '',
})

// Opciones de sala (se poblarán desde el backend)
const salasDisponibles = computed<string[]>(() => {
  const salasSet = new Set(camas.value.map((c) => c.sala))
  return Array.from(salasSet).sort()
})

// Camas filtradas
const camasFiltradas = computed(() => {
  return camas.value.filter((cama) => {
    const matchesQuery =
      !filtros.value.query ||
      cama.numero.toLowerCase().includes(filtros.value.query.toLowerCase()) ||
      cama.sala.toLowerCase().includes(filtros.value.query.toLowerCase())

    const matchesSala = !filtros.value.sala || cama.sala === filtros.value.sala

    const matchesEstado =
      !filtros.value.estado || cama.estado === filtros.value.estado

    return matchesQuery && matchesSala && matchesEstado
  })
})

const limpiarFiltros = () => {
  filtros.value = { query: '', sala: '', estado: '' }
}

const hayFiltrosActivos = computed(
  () => !!filtros.value.query || !!filtros.value.sala || !!filtros.value.estado,
)

// Badge y etiqueta por estado de cama
const getEstadoClass = (estado: EstadoCama): string => {
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

// -------------------------
// Formulario de Signos Vitales
// -------------------------

// Pacientes internados disponibles (vacío hasta conectar el backend)
const pacientesInternados = ref<{ id: string; nombre: string; apellido: string }[]>([])

// Formulario reactivo
const form = ref<CreateSignosVitalesDTO>({
  pacienteId: '',
  fechaHora: '',
  temperatura: 0,
  frecuenciaCardiaca: 0,
  presionSistolica: 0,
  presionDiastolica: 0,
  observaciones: '',
})

// Control de envío
const isSubmitting = ref(false)
const formErrors = ref<Partial<Record<keyof CreateSignosVitalesDTO, string>>>({})

// Validación del formulario
const validarFormulario = (): boolean => {
  const errores: Partial<Record<keyof CreateSignosVitalesDTO, string>> = {}

  if (!form.value.pacienteId) {
    errores.pacienteId = 'Debe seleccionar un paciente.'
  }
  if (!form.value.fechaHora) {
    errores.fechaHora = 'La fecha y hora son obligatorias.'
  }
  if (!form.value.temperatura || form.value.temperatura <= 0) {
    errores.temperatura = 'Ingrese un valor de temperatura válido.'
  }
  if (!form.value.frecuenciaCardiaca || form.value.frecuenciaCardiaca <= 0) {
    errores.frecuenciaCardiaca = 'Ingrese un valor de frecuencia cardíaca válido.'
  }
  if (!form.value.presionSistolica || form.value.presionSistolica <= 0) {
    errores.presionSistolica = 'Ingrese un valor de presión sistólica válido.'
  }
  if (!form.value.presionDiastolica || form.value.presionDiastolica <= 0) {
    errores.presionDiastolica = 'Ingrese un valor de presión diastólica válido.'
  }

  formErrors.value = errores
  return Object.keys(errores).length === 0
}

const cancelarFormulario = () => {
  form.value = {
    pacienteId: '',
    fechaHora: '',
    temperatura: 0,
    frecuenciaCardiaca: 0,
    presionSistolica: 0,
    presionDiastolica: 0,
    observaciones: '',
  }
  formErrors.value = {}
}

const registrarControl = () => {
  if (!validarFormulario()) return
  if (isSubmitting.value) return

  // En esta etapa NO se realiza la petición HTTP.
  // Cuando se conecte el backend, aquí se llamará a signosVitalesService.create(form.value).
  // isSubmitting.value = true
  // await signosVitalesService.create(form.value)
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Gestión de Camas"
      description="Visualización y seguimiento de camas, pacientes internados y registro de signos vitales."
    />

    <!-- Tarjetas de resumen -->
    <div class="row g-3 mb-4">
      <div
        v-for="card in statCards"
        :key="card.label"
        class="col-12 col-sm-6 col-xl"
      >
        <StatCard
          :label="card.label"
          :value="card.value"
          :icon="card.icon"
          :color-class="card.colorClass"
        />
      </div>
    </div>

    <!-- Contenedor de dos columnas: tabla + formulario -->
    <div class="row g-4">
      <!-- Columna izquierda: Pestañas y listado -->
      <div class="col-12 col-xl-7">
        <div class="hospital-card mb-0">
          <!-- Pestañas de navegación interna -->
          <div class="hospital-card-header pb-0 border-bottom-0">
            <ul class="enfermeria-nav-tabs mb-0 w-100" role="tablist">
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'listado' }"
                  role="tab"
                  :aria-selected="activeTab === 'listado'"
                  @click="activeTab = 'listado'"
                >
                  <i class="bi bi-hospital"></i>
                  <span>Listado de camas</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'controles' }"
                  role="tab"
                  :aria-selected="activeTab === 'controles'"
                  @click="activeTab = 'controles'"
                >
                  <i class="bi bi-clipboard2-pulse"></i>
                  <span>Controles recientes</span>
                </button>
              </li>
            </ul>
          </div>

          <!-- Pestaña: Listado de camas -->
          <div v-if="activeTab === 'listado'" class="hospital-card-body">
            <!-- Filtros -->
            <div class="row g-2 mb-3">
              <!-- Buscador -->
              <div class="col-12 col-md-5">
                <div class="input-group input-group-sm">
                  <span class="input-group-text bg-white border-end-0">
                    <i class="bi bi-search text-muted"></i>
                  </span>
                  <input
                    v-model="filtros.query"
                    type="text"
                    class="form-control border-start-0 ps-0"
                    placeholder="Buscar por cama o paciente..."
                    aria-label="Buscar cama o paciente"
                  />
                </div>
              </div>
              <!-- Filtro por sala -->
              <div class="col-6 col-md-3">
                <select
                  v-model="filtros.sala"
                  class="form-select form-select-sm"
                  aria-label="Filtrar por sala"
                >
                  <option value="">Todas las salas</option>
                  <option
                    v-for="sala in salasDisponibles"
                    :key="sala"
                    :value="sala"
                  >
                    {{ sala }}
                  </option>
                </select>
              </div>
              <!-- Filtro por estado -->
              <div class="col-6 col-md-3">
                <select
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
              <!-- Limpiar filtros -->
              <div class="col-12 col-md-1 d-flex align-items-center">
                <button
                  v-if="hayFiltrosActivos"
                  type="button"
                  class="btn btn-sm btn-outline-secondary text-nowrap w-100"
                  title="Limpiar filtros"
                  @click="limpiarFiltros"
                >
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
            </div>

            <!-- Tabla de camas -->
            <div class="hospital-table-wrapper">
              <table class="hospital-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Cama</th>
                    <th scope="col">Sala</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Paciente</th>
                    <th scope="col">Últimos signos vitales</th>
                    <th scope="col" class="text-center" style="width: 70px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="camasFiltradas.length > 0">
                    <tr v-for="cama in camasFiltradas" :key="cama.id">
                      <td class="fw-semibold">{{ cama.numero }}</td>
                      <td class="text-muted">{{ cama.sala }}</td>
                      <td>
                        <span :class="getEstadoClass(cama.estado)">
                          <i :class="['bi', getEstadoIcon(cama.estado)]" style="font-size: 0.65rem;"></i>
                          {{ getEstadoLabel(cama.estado) }}
                        </span>
                      </td>
                      <td class="text-muted">
                        <span v-if="cama.estado === 'ocupada'">—</span>
                        <span v-else class="text-muted fst-italic small">Sin paciente</span>
                      </td>
                      <td class="small text-muted">
                        <span v-if="cama.estado === 'ocupada'">
                          <!-- Temp: —°C · FC: —lpm · Sis: —mmHg · Dia: —mmHg -->
                          <span class="text-muted fst-italic">Sin registros</span>
                        </span>
                        <span v-else>—</span>
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn-action-icon"
                          title="Ver detalle de la cama"
                          aria-label="Ver cama"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </template>

                  <!-- Estado vacío -->
                  <tr v-else>
                    <td colspan="6" class="p-0">
                      <EmptyState
                        icon="bi-hospital"
                        title="No hay camas para mostrar"
                        description="Las camas del servicio se mostrarán aquí una vez conectado con el servidor."
                        compact
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Pestaña: Controles recientes -->
          <div v-else-if="activeTab === 'controles'" class="hospital-card-body">
            <div class="hospital-table-wrapper">
              <table class="hospital-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Paciente</th>
                    <th scope="col">Fecha y hora</th>
                    <th scope="col">Temp. (°C)</th>
                    <th scope="col">FC (lpm)</th>
                    <th scope="col">Sis. (mmHg)</th>
                    <th scope="col">Dia. (mmHg)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colspan="6" class="p-0">
                      <EmptyState
                        icon="bi-clipboard-check"
                        title="No hay controles registrados"
                        description="Los registros de signos vitales se mostrarán aquí al conectar con el servidor."
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

      <!-- Columna derecha: Formulario de signos vitales -->
      <div class="col-12 col-xl-5">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-clipboard2-pulse" style="color: var(--hospital-red-primary);"></i>
              <span>Registrar signos vitales</span>
            </div>
          </div>
          <div class="hospital-card-body">
            <form novalidate @submit.prevent="registrarControl">
              <!-- Selector de paciente internado -->
              <div class="mb-3">
                <label for="sv-paciente" class="form-label">
                  Paciente <span class="text-danger">*</span>
                </label>
                <select
                  id="sv-paciente"
                  v-model="form.pacienteId"
                  class="form-select"
                  :class="{ 'is-invalid': formErrors.pacienteId }"
                  aria-describedby="sv-paciente-error"
                >
                  <option value="">Seleccionar paciente internado...</option>
                  <option
                    v-for="paciente in pacientesInternados"
                    :key="paciente.id"
                    :value="paciente.id"
                  >
                    {{ paciente.apellido }}, {{ paciente.nombre }}
                  </option>
                </select>
                <div
                  v-if="pacientesInternados.length === 0"
                  class="form-text text-muted"
                >
                  No hay pacientes internados disponibles.
                </div>
                <div
                  v-if="formErrors.pacienteId"
                  id="sv-paciente-error"
                  class="invalid-feedback"
                >
                  {{ formErrors.pacienteId }}
                </div>
              </div>

              <!-- Fecha y hora -->
              <div class="mb-3">
                <label for="sv-fechahora" class="form-label">
                  Fecha y hora <span class="text-danger">*</span>
                </label>
                <input
                  id="sv-fechahora"
                  v-model="form.fechaHora"
                  type="datetime-local"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.fechaHora }"
                  aria-describedby="sv-fechahora-error"
                />
                <div
                  v-if="formErrors.fechaHora"
                  id="sv-fechahora-error"
                  class="invalid-feedback"
                >
                  {{ formErrors.fechaHora }}
                </div>
              </div>

              <!-- Cuatro signos vitales -->
              <div class="row g-3 mb-3">
                <!-- Temperatura -->
                <div class="col-6">
                  <label for="sv-temperatura" class="form-label">
                    Temperatura (°C) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sv-temperatura"
                    v-model.number="form.temperatura"
                    type="number"
                    step="0.1"
                    min="30"
                    max="45"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.temperatura }"
                    placeholder="Ej: 36.5"
                    aria-describedby="sv-temperatura-error"
                  />
                  <div
                    v-if="formErrors.temperatura"
                    id="sv-temperatura-error"
                    class="invalid-feedback"
                  >
                    {{ formErrors.temperatura }}
                  </div>
                </div>

                <!-- Frecuencia cardíaca -->
                <div class="col-6">
                  <label for="sv-fc" class="form-label">
                    Frec. cardíaca (lpm) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sv-fc"
                    v-model.number="form.frecuenciaCardiaca"
                    type="number"
                    min="20"
                    max="300"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.frecuenciaCardiaca }"
                    placeholder="Ej: 72"
                    aria-describedby="sv-fc-error"
                  />
                  <div
                    v-if="formErrors.frecuenciaCardiaca"
                    id="sv-fc-error"
                    class="invalid-feedback"
                  >
                    {{ formErrors.frecuenciaCardiaca }}
                  </div>
                </div>

                <!-- Presión sistólica -->
                <div class="col-6">
                  <label for="sv-sistolica" class="form-label">
                    P. sistólica (mmHg) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sv-sistolica"
                    v-model.number="form.presionSistolica"
                    type="number"
                    min="50"
                    max="300"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.presionSistolica }"
                    placeholder="Ej: 120"
                    aria-describedby="sv-sistolica-error"
                  />
                  <div
                    v-if="formErrors.presionSistolica"
                    id="sv-sistolica-error"
                    class="invalid-feedback"
                  >
                    {{ formErrors.presionSistolica }}
                  </div>
                </div>

                <!-- Presión diastólica -->
                <div class="col-6">
                  <label for="sv-diastolica" class="form-label">
                    P. diastólica (mmHg) <span class="text-danger">*</span>
                  </label>
                  <input
                    id="sv-diastolica"
                    v-model.number="form.presionDiastolica"
                    type="number"
                    min="30"
                    max="200"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.presionDiastolica }"
                    placeholder="Ej: 80"
                    aria-describedby="sv-diastolica-error"
                  />
                  <div
                    v-if="formErrors.presionDiastolica"
                    id="sv-diastolica-error"
                    class="invalid-feedback"
                  >
                    {{ formErrors.presionDiastolica }}
                  </div>
                </div>
              </div>

              <!-- Observaciones (campo opcional) -->
              <div class="mb-4">
                <label for="sv-observaciones" class="form-label">
                  Observaciones
                </label>
                <textarea
                  id="sv-observaciones"
                  v-model="form.observaciones"
                  class="form-control"
                  rows="2"
                  placeholder="Observaciones clínicas adicionales (opcional)..."
                ></textarea>
              </div>

              <!-- Botones de acción -->
              <div class="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  class="btn-hospital-outline"
                  :disabled="isSubmitting"
                  @click="cancelarFormulario"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  class="btn-hospital-primary"
                  :disabled="isSubmitting"
                >
                  <i class="bi bi-clipboard2-check"></i>
                  Registrar control
                </button>
              </div>

              <!-- Aviso de integración futura -->
              <div class="alert alert-light border mt-3 py-2 px-3 d-flex align-items-center gap-2">
                <i class="bi bi-info-circle" style="color: var(--hospital-red-primary);"></i>
                <span class="small text-muted">
                  El registro se habilitará al conectar con el servidor. Los campos y validaciones
                  están listos para la integración.
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
