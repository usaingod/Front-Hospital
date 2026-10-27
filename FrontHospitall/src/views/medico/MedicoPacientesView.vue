<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Paciente } from '@/types/paciente'

/**
 * Vista de Pacientes e Historia Clínica (Perfil Médico)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Diseño de dos columnas: Listado de pacientes (izquierda) y Detalle del paciente (derecha).
 * - Búsqueda por nombre, apellido o DNI y filtro visual por estado.
 * - Tabla con columnas: Paciente, DNI, Última atención y Acciones.
 * - Detalle con mensaje inicial: "Seleccioná un paciente para consultar su información".
 * - Pestañas visuales:
 *   1. Historia clínica (Antecedentes, Consultas previas, Diagnósticos, Tratamientos y Recetas)
 *   2. Turnos (Historial de turnos asignados)
 *   3. Datos personales (Ficha completa con DNI, contacto de emergencia, obra social, etc.)
 *   4. Observaciones (Anotaciones clínicas)
 * - Cumplimiento estricto de la regla de no incorporar datos ficticios (estructuras preparadas con estados vacíos).
 */
const route = useRoute()

// Búsqueda y filtros del listado
const searchQuery = ref('')
const filterEstado = ref('')

// Paciente seleccionado para el panel de detalle derecho
const selectedPatient = ref<Paciente | null>(null)

// Pestaña activa del panel de información: 'historia' | 'turnos' | 'datos' | 'observaciones'
const activeTab = ref<'historia' | 'turnos' | 'datos' | 'observaciones'>('historia')

// Colección reactiva de pacientes (inicia vacía sin registros inventados)
const pacientes = ref<Paciente[]>([])

// Filtrado computado reactivo para la búsqueda
const filteredPacientes = computed(() => {
  return pacientes.value.filter((p) => {
    const fullName = `${p.nombre} ${p.apellido}`.toLowerCase()
    const matchesQuery =
      !searchQuery.value ||
      fullName.includes(searchQuery.value.toLowerCase()) ||
      p.dni.includes(searchQuery.value)

    const matchesEstado = !filterEstado.value || p.estado === filterEstado.value

    return matchesQuery && matchesEstado
  })
})

// Acciones de selección
const selectPatient = (paciente: Paciente) => {
  selectedPatient.value = paciente
}

const clearSelectedPatient = () => {
  selectedPatient.value = null
}

const resetFilters = () => {
  searchQuery.value = ''
  filterEstado.value = ''
}

// Sincronizar pestaña inicial desde query params (ej. ?tab=historia desde accesos directos)
onMounted(() => {
  const queryTab = route.query.tab as string
  if (
  queryTab &&
  ['historia', 'turnos', 'datos', 'observaciones'].includes(queryTab)
  ) 

  activeTab.value = queryTab as 'historia' | 'turnos' | 'datos' | 'observaciones'
})
</script>

<template>
  <div>
    <!-- Encabezado de la página -->
    <PageHeader
      title="Pacientes"
      description="Consulta del padrón de pacientes, acceso a historias clínicas y registro de datos personales."
    />

    <!-- Contenedor de Dos Columnas: Listado Izquierdo & Detalle Derecho -->
    <div class="row g-4">
      <!-- Columna Izquierda: Listado de Pacientes (5 columnas en pantallas grandes) -->
      <div class="col-12 col-xl-5 col-lg-5">
        <div class="hospital-card mb-0">
          <div class="hospital-card-header">
            <div class="hospital-card-title">
              <i class="bi bi-people text-warning"></i>
              <span>Padrón de pacientes</span>
            </div>
            <span class="badge bg-light text-muted border">
              {{ filteredPacientes.length }} pacientes
            </span>
          </div>

          <div class="hospital-card-body p-3">
            <!-- Barra de búsqueda por nombre, apellido o DNI -->
            <div class="mb-3">
              <div class="input-group input-group-sm">
                <span class="input-group-text bg-white border-end-0">
                  <i class="bi bi-search text-muted"></i>
                </span>
                <input
                  v-model="searchQuery"
                  type="text"
                  class="form-control border-start-0 ps-0"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  aria-label="Buscar paciente"
                />
                <button
                  v-if="searchQuery"
                  class="btn btn-outline-secondary"
                  type="button"
                  title="Borrar búsqueda"
                  @click="searchQuery = ''"
                >
                  <i class="bi bi-x"></i>
                </button>
              </div>
            </div>

            <!-- Filtro visual por estado -->
            <div class="d-flex align-items-center gap-2 mb-3">
              <select
                v-model="filterEstado"
                class="form-select form-select-sm"
                aria-label="Filtrar pacientes por estado"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="inactivo">Inactivos</option>
              </select>
              <button
                v-if="searchQuery || filterEstado"
                type="button"
                class="btn btn-sm btn-outline-secondary text-nowrap"
                @click="resetFilters"
              >
                Limpiar
              </button>
            </div>

            <!-- Tabla de Pacientes -->
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
                  <template v-if="filteredPacientes.length > 0">
                    <tr
                      v-for="paciente in filteredPacientes"
                      :key="paciente.id"
                      :class="{ 'table-warning': selectedPatient?.id === paciente.id }"
                      style="cursor: pointer;"
                      @click="selectPatient(paciente)"
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
                          @click.stop="selectPatient(paciente)"
                        >
                          <i class="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  </template>

                  <!-- Estado vacío cuando no hay registros -->
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

      <!-- Columna Derecha: Panel de Información y Ficha Clínica (7 columnas en pantallas grandes) -->
      <div class="col-12 col-xl-7 col-lg-7">
        <!-- Estado Inicial: Ningún paciente seleccionado -->
        <div v-if="!selectedPatient" class="hospital-card h-100 mb-0">
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

        <!-- Panel Activo: Información del Paciente Seleccionado -->
        <div v-else class="hospital-card mb-0">
          <!-- Cabecera de la Ficha del Paciente -->
          <div class="hospital-card-header pb-3">
            <div class="d-flex align-items-center gap-3">
              <div
                class="hospital-avatar"
                style="background-color: var(--hospital-amber-primary); width: 44px; height: 44px; font-size: 1.1rem;"
              >
                {{ selectedPatient.nombre.charAt(0) }}{{ selectedPatient.apellido.charAt(0) }}
              </div>
              <div>
                <h2 class="h5 fw-bold mb-0 text-dark">
                  {{ selectedPatient.apellido }}, {{ selectedPatient.nombre }}
                </h2>
                <div class="d-flex align-items-center gap-2 mt-1">
                  <span class="badge bg-light text-muted border">
                    DNI: {{ selectedPatient.dni }}
                  </span>
                  <span
                    class="badge"
                    :class="selectedPatient.estado === 'inactivo' ? 'bg-secondary' : 'bg-success-subtle text-success border border-success-subtle'"
                  >
                    {{ selectedPatient.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
              title="Cerrar panel de detalle"
              @click="clearSelectedPatient"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <div class="hospital-card-body pt-3">
            <!-- Pestañas Visuales: Historia Clínica, Turnos, Datos Personales, Observaciones -->
            <ul class="medico-nav-tabs" role="tablist">
              <li>
                <button
                  type="button"
                  class="medico-tab-btn"
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
                  class="medico-tab-btn"
                  :class="{ active: activeTab === 'turnos' }"
                  role="tab"
                  :aria-selected="activeTab === 'turnos'"
                  @click="activeTab = 'turnos'"
                >
                  <i class="bi bi-calendar3"></i>
                  <span>Turnos</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="medico-tab-btn"
                  :class="{ active: activeTab === 'datos' }"
                  role="tab"
                  :aria-selected="activeTab === 'datos'"
                  @click="activeTab = 'datos'"
                >
                  <i class="bi bi-person-vcard"></i>
                  <span>Datos personales</span>
                </button>
              </li>
              <li>
                <button
                  type="button"
                  class="medico-tab-btn"
                  :class="{ active: activeTab === 'observaciones' }"
                  role="tab"
                  :aria-selected="activeTab === 'observaciones'"
                  @click="activeTab = 'observaciones'"
                >
                  <i class="bi bi-chat-left-text"></i>
                  <span>Observaciones</span>
                </button>
              </li>
            </ul>

            <!-- Contenido de la Pestaña: HISTORIA CLÍNICA (Estructura de consulta sin datos ficticios) -->
            <div v-if="activeTab === 'historia'" class="tab-pane-content">
              <div class="alert alert-light border d-flex align-items-center gap-2 mb-3 py-2 px-3">
                <i class="bi bi-info-circle text-warning fs-5"></i>
                <span class="small text-muted">
                  Estructura visual de Historia Clínica preparada para la futura sincronización con el backend. En esta etapa no se realizan cargas ni modificaciones.
                </span>
              </div>

              <!-- Sección 1: Antecedentes Clínicos -->
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
                    description="Los antecedentes patológicos, quirúrgicos y farmacológicos se listarán aquí al conectar con la historia clínica electrónica."
                    compact
                  />
                </div>
              </div>

              <!-- Sección 2: Consultas Previas y Diagnósticos -->
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
                    description="Las evoluciones médicas, diagnósticos y tratamientos previos se cargarán automáticamente desde el servidor."
                    compact
                  />
                </div>
              </div>

              <!-- Sección 3: Tratamientos y Recetas -->
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
                    description="El vademécum y prescripciones electrónicas se integrarán en la etapa de desarrollo de servicios clínicos."
                    compact
                  />
                </div>
              </div>
            </div>

            <!-- Contenido de la Pestaña: TURNOS DEL PACIENTE -->
            <div v-else-if="activeTab === 'turnos'" class="tab-pane-content">
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
                          description="Los turnos pasados y futuros asociados a este paciente se mostrarán aquí una vez provistos por el backend."
                          compact
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Contenido de la Pestaña: DATOS PERSONALES -->
            <div v-else-if="activeTab === 'datos'" class="tab-pane-content">
              <div class="row g-3">
                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Nombre y Apellido</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.nombre }} {{ selectedPatient.apellido }}
                    </div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">DNI / Documento</div>
                    <div class="fw-semibold text-dark">{{ selectedPatient.dni }}</div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Fecha de nacimiento</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.fechaNacimiento || '—' }}
                    </div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Obra Social / Prepaga</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.obraSocial || 'Particular / Sin cobertura' }}
                      <span v-if="selectedPatient.numeroAfiliado" class="small text-muted d-block">
                        Afiliado: {{ selectedPatient.numeroAfiliado }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Teléfono de contacto</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.telefono || '—' }}
                    </div>
                  </div>
                </div>

                <div class="col-12 col-sm-6">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Correo electrónico</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.email || '—' }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Dirección de residencia</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.direccion || '—' }}
                    </div>
                  </div>
                </div>

                <div class="col-12">
                  <div class="p-2 border rounded bg-light">
                    <div class="text-muted small">Contacto de emergencia</div>
                    <div class="fw-semibold text-dark">
                      {{ selectedPatient.contactoEmergencia || 'No informado' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contenido de la Pestaña: OBSERVACIONES -->
            <div v-else-if="activeTab === 'observaciones'" class="tab-pane-content">
              <div v-if="selectedPatient.observaciones" class="p-3 border rounded bg-light">
                <p class="mb-0 text-dark">{{ selectedPatient.observaciones }}</p>
              </div>
              <EmptyState
                v-else
                icon="bi-chat-left-text"
                title="Sin observaciones registradas"
                description="Las anotaciones clínicas generales o indicaciones particulares de este paciente se visualizarán en este apartado."
                compact
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
