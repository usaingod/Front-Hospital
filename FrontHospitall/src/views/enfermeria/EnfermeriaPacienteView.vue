<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Paciente } from '@/types/paciente'
import type { SignosVitales } from '@/types/signosVitales'
import type { Prescripcion } from '@/types/prescripcion'
import type { Internacion } from '@/types/internacion'

/**
 * Vista de Paciente — Perfil Enfermería
 * Criterios 1, 2, 3, 5, 7, 8, 9:
 * - Buscador de pacientes internados.
 * - Panel de información personal, internación y datos clínicos.
 * - Pestañas: Medicación, Historia clínica, Evolución, Signos vitales.
 * - Consulta de prescripciones (solo lectura para Enfermería).
 * - Preparado para integración futura con la API; sin peticiones HTTP en esta etapa.
 */

// Búsqueda
const searchQuery = ref('')

// Paciente seleccionado
const selectedPatient = ref<Paciente | null>(null)
const selectedInternacion = ref<Internacion | null>(null)

// Pestaña activa: 'medicacion' | 'historia' | 'evolucion' | 'signos'
const activeTab = ref<'medicacion' | 'historia' | 'evolucion' | 'signos'>('medicacion')

// Colecciones reactivas vacías (sin datos ficticios)
const pacientesInternados = ref<Paciente[]>([])
const historialSignosVitales = ref<SignosVitales[]>([])
const prescripciones = ref<Prescripcion[]>([])

// Filtrado de pacientes por búsqueda
const pacientesFiltrados = computed(() => {
  if (!searchQuery.value.trim()) return pacientesInternados.value
  const q = searchQuery.value.toLowerCase()
  return pacientesInternados.value.filter(
    (p) =>
      `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
      p.dni.includes(q),
  )
})

// Seleccionar paciente
const selectPatient = (paciente: Paciente) => {
  selectedPatient.value = paciente
  activeTab.value = 'medicacion'
  // En la integración real: cargar historial de signos vitales y prescripciones del backend
  historialSignosVitales.value = []
  prescripciones.value = []
}

const clearPatient = () => {
  selectedPatient.value = null
  selectedInternacion.value = null
  historialSignosVitales.value = []
  prescripciones.value = []
}

// Estado de prescripción: etiqueta visual
const getEstadoPrescripcionLabel = (estado?: string): string => {
  if (estado === 'activa') return 'Activa'
  if (estado === 'suspendida') return 'Suspendida'
  if (estado === 'finalizada') return 'Finalizada'
  return '—'
}

const getEstadoPrescripcionClass = (estado?: string): string => {
  if (estado === 'activa') return 'badge-cama-disponible'
  if (estado === 'suspendida') return 'badge-cama-limpieza'
  if (estado === 'finalizada') return 'badge-cama-ocupada'
  return 'badge bg-light text-muted border'
}
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Pacientes Internados"
      description="Consulta de información clínica, evolución, signos vitales y medicación de los pacientes internados."
    />

    <div class="row g-4">
      <!-- Columna izquierda: Buscador y listado de pacientes -->
      <div class="col-12 col-xl-4">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-person-heart" style="color: var(--hospital-red-primary);"></i>
              <span>Pacientes internados</span>
            </div>
            <span class="badge bg-light text-muted border">
              {{ pacientesFiltrados.length }} pacientes
            </span>
          </div>

          <div class="hospital-card-body p-3">
            <!-- Buscador -->
            <div class="mb-3">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre o DNI..."
                  aria-label="Buscar paciente internado"
                />
                <button
                  v-if="searchQuery"
                  type="button"
                  class="btn btn-outline-secondary"
                  title="Borrar búsqueda"
                  @click="searchQuery = ''"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>

            <!-- Listado de pacientes -->
            <div class="hospital-table-wrapper border rounded">
              <table class="hospital-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Paciente</th>
                    <th scope="col" class="text-center" style="width: 60px;">Ver</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="pacientesFiltrados.length > 0">
                    <tr
                      v-for="paciente in pacientesFiltrados"
                      :key="paciente.id"
                      style="cursor: pointer;"
                      :class="{ 'table-danger': selectedPatient?.id === paciente.id }"
                      @click="selectPatient(paciente)"
                    >
                      <td>
                        <div class="fw-semibold text-dark">
                          {{ paciente.apellido }}, {{ paciente.nombre }}
                        </div>
                        <div class="small text-muted">DNI: {{ paciente.dni }}</div>
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="btn btn-sm py-0 px-2"
                          style="background-color: var(--hospital-red-light); color: var(--hospital-red-primary); border: 1px solid var(--hospital-red-border);"
                          title="Ver paciente"
                          @click.stop="selectPatient(paciente)"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </template>

                  <tr v-else>
                    <td colspan="2" class="p-0">
                      <EmptyState
                        icon="bi-person-x"
                        title="No hay pacientes internados"
                        description="Los pacientes internados se mostrarán aquí una vez conectado con el servidor."
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

      <!-- Columna derecha: Panel de información del paciente -->
      <div class="col-12 col-xl-8">
        <!-- Estado vacío: sin paciente seleccionado -->
        <div v-if="!selectedPatient" class="hospital-card h-100 mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-person-badge" style="color: var(--hospital-red-primary);"></i>
              <span>Información del paciente</span>
            </div>
          </div>
          <div class="hospital-card-body d-flex align-items-center justify-content-center p-5">
            <EmptyState
              icon="bi-person-bounding-box"
              title="Ningún paciente seleccionado"
              description="Seleccioná un paciente para consultar su información clínica."
            />
          </div>
        </div>

        <!-- Panel activo: información del paciente seleccionado -->
        <div v-else class="hospital-card mb-0">
          <!-- Cabecera del paciente -->
          <div class="hospital-card-header pb-3">
            <div class="d-flex align-items-center gap-3">
              <div
                class="hospital-avatar"
                style="background-color: var(--hospital-red-primary); width: 44px; height: 44px; font-size: 1.1rem;"
              >
                {{ selectedPatient.nombre.charAt(0) }}{{ selectedPatient.apellido.charAt(0) }}
              </div>
              <div>
                <h2 class="h5 fw-bold mb-0 text-dark">
                  {{ selectedPatient.apellido }}, {{ selectedPatient.nombre }}
                </h2>
                <div class="d-flex flex-wrap align-items-center gap-2 mt-1">
                  <span class="badge bg-light text-muted border">
                    DNI: {{ selectedPatient.dni }}
                  </span>
                  <!-- Estado de internación (disponible cuando se conecte el backend) -->
                  <span v-if="selectedInternacion" class="badge-cama-disponible">
                    <i class="bi bi-hospital" style="font-size: 0.65rem;"></i>
                    Internado
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="Cerrar panel"
              @click="clearPatient"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Datos de internación (solo lectura) -->
          <div v-if="selectedInternacion" class="px-4 py-2 bg-light border-bottom">
            <div class="row g-2 small text-muted">
              <div class="col-auto">
                <i class="bi bi-door-open me-1"></i>
                <strong>Sala:</strong> {{ selectedInternacion.sala || '—' }}
              </div>
              <div class="col-auto">
                <i class="bi bi-hospital me-1"></i>
                <strong>Cama:</strong> {{ selectedInternacion.numeroCama || '—' }}
              </div>
              <div class="col-auto">
                <i class="bi bi-calendar-event me-1"></i>
                <strong>Ingreso:</strong> {{ selectedInternacion.fechaIngreso || '—' }}
              </div>
              <div class="col-auto">
                <i class="bi bi-clipboard2-heart me-1"></i>
                <strong>Diagnóstico:</strong> {{ selectedInternacion.diagnostico || '—' }}
              </div>
              <div class="col-auto">
                <i class="bi bi-person-badge me-1"></i>
                <strong>Médico:</strong> {{ selectedInternacion.medicoTratanteNombre || '—' }}
              </div>
            </div>
          </div>

          <div class="hospital-card-body pt-3">
            <!-- Pestañas de información clínica -->
            <ul class="enfermeria-nav-tabs" role="tablist">
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'medicacion' }"
                  role="tab"
                  :aria-selected="activeTab === 'medicacion'"
                  @click="activeTab = 'medicacion'"
                >
                  <i class="bi bi-capsule"></i>
                  <span>Medicación</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'historia' }"
                  role="tab"
                  :aria-selected="activeTab === 'historia'"
                  @click="activeTab = 'historia'"
                >
                  <i class="bi bi-journal-medical"></i>
                  <span>Historia clínica</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'evolucion' }"
                  role="tab"
                  :aria-selected="activeTab === 'evolucion'"
                  @click="activeTab = 'evolucion'"
                >
                  <i class="bi bi-graph-up"></i>
                  <span>Evolución</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="enfermeria-tab-btn"
                  :class="{ active: activeTab === 'signos' }"
                  role="tab"
                  :aria-selected="activeTab === 'signos'"
                  @click="activeTab = 'signos'"
                >
                  <i class="bi bi-activity"></i>
                  <span>Signos vitales</span>
                </button>
              </li>
            </ul>

            <!-- PESTAÑA: MEDICACIÓN (solo consulta para Enfermería) -->
            <div v-if="activeTab === 'medicacion'" class="tab-pane-content">
              <div class="alert alert-light border d-flex align-items-center gap-2 mb-3 py-2 px-3">
                <i class="bi bi-info-circle" style="color: var(--hospital-red-primary); font-size: 1.1rem;"></i>
                <span class="small text-muted">
                  Prescripciones médicas asignadas al paciente. Enfermería puede consultar las prescripciones.
                  El registro de administración de dosis estará disponible según los permisos habilitados por el backend.
                </span>
              </div>

              <div class="hospital-table-wrapper border rounded">
                <table class="hospital-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Medicamento</th>
                      <th scope="col">Dosis</th>
                      <th scope="col">Frecuencia</th>
                      <th scope="col">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="prescripciones.length > 0">
                      <tr v-for="prescripcion in prescripciones" :key="prescripcion.id">
                        <td class="fw-semibold">{{ prescripcion.supplyName || '—' }}</td>
                        <td class="text-muted">{{ prescripcion.dosis }}</td>
                        <td class="text-muted">
                          Cada {{ prescripcion.cadaHoras }} h
                        </td>
                        <td>
                          <span :class="getEstadoPrescripcionClass(prescripcion.estado)">
                            {{ getEstadoPrescripcionLabel(prescripcion.estado) }}
                          </span>
                        </td>
                      </tr>
                    </template>
                    <tr v-else>
                      <td colspan="4" class="p-0">
                        <EmptyState
                          icon="bi-capsule"
                          title="Sin prescripciones registradas"
                          description="Las prescripciones médicas de este paciente se mostrarán aquí al conectar con el servidor."
                          compact
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- PESTAÑA: HISTORIA CLÍNICA -->
            <div v-else-if="activeTab === 'historia'" class="tab-pane-content">
              <div class="alert alert-light border d-flex align-items-center gap-2 mb-3 py-2 px-3">
                <i class="bi bi-info-circle" style="color: var(--hospital-red-primary); font-size: 1.1rem;"></i>
                <span class="small text-muted">
                  Historia clínica preparada para sincronización con el backend.
                </span>
              </div>

              <div class="card border mb-3">
                <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                    <i class="bi bi-clipboard2-pulse me-1" style="color: var(--hospital-red-primary);"></i>
                    Antecedentes
                  </span>
                  <span class="badge bg-white text-muted border">0 registrados</span>
                </div>
                <div class="card-body p-3">
                  <EmptyState
                    icon="bi-clipboard2-pulse"
                    title="Sin antecedentes clínicos registrados"
                    description="Los antecedentes del paciente se cargarán desde el servidor."
                    compact
                  />
                </div>
              </div>

              <div class="card border mb-0">
                <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
                  <span class="fw-semibold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                    <i class="bi bi-journal-medical me-1" style="color: var(--hospital-red-primary);"></i>
                    Consultas y Diagnósticos
                  </span>
                  <span class="badge bg-white text-muted border">0 consultas</span>
                </div>
                <div class="card-body p-3">
                  <EmptyState
                    icon="bi-journal-medical"
                    title="Sin consultas previas registradas"
                    description="Las consultas y diagnósticos previos se mostrarán aquí al conectar con el servidor."
                    compact
                  />
                </div>
              </div>
            </div>

            <!-- PESTAÑA: EVOLUCIÓN -->
            <div v-else-if="activeTab === 'evolucion'" class="tab-pane-content">
              <EmptyState
                icon="bi-graph-up"
                title="Sin evoluciones registradas"
                description="Las notas de evolución clínica del paciente internado se mostrarán aquí al conectar con el servidor."
              />
            </div>

            <!-- PESTAÑA: SIGNOS VITALES -->
            <div v-else-if="activeTab === 'signos'" class="tab-pane-content">
              <div class="hospital-table-wrapper border rounded">
                <table class="hospital-table mb-0">
                  <thead>
                    <tr>
                      <th scope="col">Fecha y hora</th>
                      <th scope="col">Temp. (°C)</th>
                      <th scope="col">FC (lpm)</th>
                      <th scope="col">Sistólica (mmHg)</th>
                      <th scope="col">Diastólica (mmHg)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <template v-if="historialSignosVitales.length > 0">
                      <tr
                        v-for="registro in historialSignosVitales"
                        :key="registro.id"
                      >
                        <td class="text-muted small">{{ registro.fechaHora }}</td>
                        <td>{{ registro.temperatura }}°C</td>
                        <td>{{ registro.frecuenciaCardiaca }}</td>
                        <td>{{ registro.presionSistolica }}</td>
                        <td>{{ registro.presionDiastolica }}</td>
                      </tr>
                    </template>
                    <tr v-else>
                      <td colspan="5" class="p-0">
                        <EmptyState
                          icon="bi-activity"
                          title="Sin registros de signos vitales"
                          description="El historial de signos vitales de este paciente se mostrará aquí al conectar con el servidor."
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
      </div>
    </div>
  </div>
</template>
