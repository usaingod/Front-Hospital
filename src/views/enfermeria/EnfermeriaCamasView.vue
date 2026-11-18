<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import type { Cama, CamaFilter, EstadoCama } from '@/types/internacion'
import type { CreateSignosVitalesDTO, SignosVitales } from '@/types/signosVitales'
import { ApiError, api } from '@/services/api'
import { camasService, internacionService } from '@/services/camasService'

import { signosVitalesService } from '@/services/signosVitalesService'

const activeTab = ref<'listado' | 'controles'>('listado')
const camas = ref<Cama[]>([])
const controlesRecientes = ref<SignosVitales[]>([])
const pacientesInternados = ref<{ id: string; nombre: string; apellido: string }[]>([])
const patientNames = ref<Map<string, string>>(new Map())
const isLoading = ref(false)

const filtros = ref<CamaFilter>({
  query: '',
  sala: '',
  estado: '',
})

const form = ref<CreateSignosVitalesDTO>({
  pacienteId: '',
  fechaHora: '',
  temperatura: 0,
  frecuenciaCardiaca: 0,
  presionSistolica: 0,
  presionDiastolica: 0,
  observaciones: '',
})
const isSubmitting = ref(false)
const formErrors = ref<Partial<Record<keyof CreateSignosVitalesDTO, string>>>({})
const statusBusyId = ref<string | null>(null)

const formatVitalSummary = (cama: Cama) => {
  const v = cama.ultimoSignos
  if (!v) return null
  return `Temp: ${v.temperatura}°C · FC: ${v.frecuenciaCardiaca} · ${v.presionSistolica}/${v.presionDiastolica}`
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [beds, internados] = await Promise.all([
      camasService.getAll(),
      internacionService.pacientesInternados(),
    ])

    pacientesInternados.value = internados.patients.map((p) => ({
      id: String(p.id),
      nombre: p.nombre,
      apellido: p.apellido,
    }))
    patientNames.value = new Map(
      internados.patients.map((p) => [
        String(p.id),
        `${p.apellido}, ${p.nombre}`,
      ]),
    )

    const vitalsByAdmission = new Map<string, SignosVitales[]>()
    await Promise.all(
      internados.stays.map(async (stay) => {
        const rows = await signosVitalesService.getByInternacionId(stay.id)
        vitalsByAdmission.set(stay.id, rows)
      }),
    )

    camas.value = beds.map((bed) => {
      const vitals = bed.internacionId
        ? vitalsByAdmission.get(bed.internacionId) || []
        : []
      const latest = vitals[0]
      return {
        ...bed,
        ultimoSignos: latest
          ? {
              fechaHora: latest.fechaHora,
              temperatura: latest.temperatura,
              frecuenciaCardiaca: latest.frecuenciaCardiaca,
              presionSistolica: latest.presionSistolica,
              presionDiastolica: latest.presionDiastolica,
            }
          : undefined,
      }
    })

    controlesRecientes.value = Array.from(vitalsByAdmission.values())
      .flat()
      .sort(
        (a, b) =>
          new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime(),
      )
      .slice(0, 30)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudieron cargar las camas')
  })
})

const statCards = computed(() => {
  const total = camas.value.length
  const ocupadas = camas.value.filter((c) => c.estado === 'ocupada').length
  const disponibles = camas.value.filter((c) => c.estado === 'disponible').length
  const limpieza = camas.value.filter((c) => c.estado === 'en_limpieza').length
  const sinControl = camas.value.filter(
    (c) => c.estado === 'ocupada' && !c.ultimoSignos,
  ).length
  return [
    { label: 'Total de camas', icon: 'bi-hospital', colorClass: 'rose' as const, value: String(total || '—') },
    { label: 'Ocupadas', icon: 'bi-person-fill', colorClass: 'rose' as const, value: String(ocupadas || '—') },
    { label: 'Disponibles', icon: 'bi-check-circle', colorClass: 'green' as const, value: String(disponibles || '—') },
    { label: 'En limpieza', icon: 'bi-stars', colorClass: 'amber' as const, value: String(limpieza || '—') },
    { label: 'Sin control reciente', icon: 'bi-clipboard2-pulse', colorClass: 'blue' as const, value: String(sinControl || '—') },
  ]
})

const salasDisponibles = computed<string[]>(() => {
  const salasSet = new Set(
    camas.value.map((c) => c.sala).filter((s): s is string => !!s),
  )
  return Array.from(salasSet).sort()
})

const camasFiltradas = computed(() => {
  return camas.value.filter((cama) => {
    const q = filtros.value.query?.toLowerCase() || ''
    const matchesQuery =
      !q ||
      cama.numero.toLowerCase().includes(q) ||
      (cama.sala || '').toLowerCase().includes(q) ||
      (cama.pacienteNombre || '').toLowerCase().includes(q)

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

const getEstadoClass = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'badge-cama-disponible'
  if (estado === 'ocupada') return 'badge-cama-ocupada'
  if (estado === 'bloqueada') return 'badge bg-secondary'
  return 'badge-cama-limpieza'
}

const getEstadoLabel = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'Disponible'
  if (estado === 'ocupada') return 'Ocupada'
  if (estado === 'bloqueada') return 'Bloqueada'
  return 'En limpieza'
}

const getEstadoIcon = (estado: EstadoCama): string => {
  if (estado === 'disponible') return 'bi-check-circle-fill'
  if (estado === 'ocupada') return 'bi-person-fill'
  if (estado === 'bloqueada') return 'bi-lock-fill'
  return 'bi-stars'
}

const validarFormulario = (): boolean => {
  const errores: Partial<Record<keyof CreateSignosVitalesDTO, string>> = {}
  if (!form.value.pacienteId) errores.pacienteId = 'Debe seleccionar un paciente.'
  if (!form.value.fechaHora) errores.fechaHora = 'La fecha y hora son obligatorias.'
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

const registrarControl = async () => {
  if (!validarFormulario()) return
  if (isSubmitting.value) return
  isSubmitting.value = true
  try {
    await signosVitalesService.create({ ...form.value })
    cancelarFormulario()
    await loadData()
    activeTab.value = 'controles'
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudieron registrar los signos')
  } finally {
    isSubmitting.value = false
  }
}

const marcarDisponible = async (cama: Cama) => {
  if (cama.estado !== 'en_limpieza') return
  statusBusyId.value = cama.id
  try {
    await api.patch(`/beds/${cama.id}/status`, { status: 'disponible' })
    await loadData()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo actualizar la cama')
  } finally {
    statusBusyId.value = null
  }
}

const darDeAltaDesdeCama = async (cama: Cama) => {
  if (!cama.internacionId || cama.estado !== 'ocupada') return
  if (
    !confirm(
      `¿Confirmás el alta de ${cama.pacienteNombre || 'este paciente'} (cama ${cama.numero})? La cama pasará a limpieza.`,
    )
  ) {
    return
  }
  statusBusyId.value = cama.id
  try {
    await internacionService.discharge(cama.internacionId)
    await loadData()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo dar el alta')
  } finally {
    statusBusyId.value = null
  }
}

const prefillPatient = (cama: Cama) => {
  if (!cama.pacienteId) return
  form.value.pacienteId = cama.pacienteId
  if (!form.value.fechaHora) {
    const now = new Date()
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    form.value.fechaHora = local.toISOString().slice(0, 16)
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Gestión de Camas"
      description="Visualización y seguimiento de camas, pacientes internados y registro de signos vitales."
    />

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

    <div class="row g-4">
      <div class="col-12 col-xl-7">
        <div class="hospital-card mb-0">
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

          <div v-if="activeTab === 'listado'" class="hospital-card-body">
            <div class="row g-2 mb-3">
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
                  <option value="bloqueada">Bloqueada</option>
                </select>
              </div>
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

            <div class="hospital-table-wrapper">
              <table class="hospital-table mb-0">
                <thead>
                  <tr>
                    <th scope="col">Cama</th>
                    <th scope="col">Sala</th>
                    <th scope="col">Estado</th>
                    <th scope="col">Paciente</th>
                    <th scope="col">Últimos signos vitales</th>
                    <th scope="col" class="text-center" style="width: 90px;">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-if="camasFiltradas.length > 0">
                    <tr v-for="cama in camasFiltradas" :key="cama.id">
                      <td class="fw-semibold">{{ cama.numero }}</td>
                      <td class="text-muted">{{ cama.sala || '—' }}</td>
                      <td>
                        <span :class="getEstadoClass(cama.estado)">
                          <i :class="['bi', getEstadoIcon(cama.estado)]" style="font-size: 0.65rem;"></i>
                          {{ getEstadoLabel(cama.estado) }}
                        </span>
                      </td>
                      <td class="text-muted">
                        <span v-if="cama.estado === 'ocupada' && cama.pacienteNombre">
                          {{ cama.pacienteNombre }}
                        </span>
                        <span v-else class="text-muted fst-italic small">Sin paciente</span>
                      </td>
                      <td class="small text-muted">
                        <span v-if="formatVitalSummary(cama)">{{ formatVitalSummary(cama) }}</span>
                        <span v-else-if="cama.estado === 'ocupada'" class="fst-italic">Sin registros</span>
                        <span v-else>—</span>
                      </td>
                      <td class="text-center">
                        <div
                          v-if="cama.estado === 'ocupada'"
                          class="d-inline-flex gap-1"
                        >
                          <button
                            type="button"
                            class="btn-action-icon"
                            title="Registrar signos de este paciente"
                            aria-label="Registrar signos"
                            @click="prefillPatient(cama)"
                          >
                            <i class="bi bi-clipboard2-pulse"></i>
                          </button>
                          <button
                            type="button"
                            class="btn-action-icon"
                            title="Dar de alta"
                            aria-label="Dar de alta"
                            :disabled="statusBusyId === cama.id"
                            @click="darDeAltaDesdeCama(cama)"
                          >
                            <i class="bi bi-box-arrow-right"></i>
                          </button>
                        </div>
                        <button
                          v-else-if="cama.estado === 'en_limpieza'"
                          type="button"
                          class="btn-action-icon"
                          title="Marcar cama como disponible"
                          aria-label="Marcar disponible"
                          :disabled="statusBusyId === cama.id"
                          @click="marcarDisponible(cama)"
                        >
                          <i class="bi bi-check2-circle"></i>
                        </button>
                        <span v-else class="text-muted">—</span>
                      </td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6" class="p-0">
                      <EmptyState
                        icon="bi-hospital"
                        :title="isLoading ? 'Cargando camas…' : 'No hay camas para mostrar'"
                        description="Probá limpiar los filtros o verificá la conexión con el servidor."
                        compact
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

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
                  <template v-if="controlesRecientes.length > 0">
                    <tr v-for="control in controlesRecientes" :key="control.id">
                      <td class="fw-semibold">
                        {{ patientNames.get(String(control.pacienteId)) || control.pacienteId }}
                      </td>
                      <td class="text-muted small">
                        {{ new Date(control.fechaHora).toLocaleString() }}
                      </td>
                      <td>{{ control.temperatura }}</td>
                      <td>{{ control.frecuenciaCardiaca }}</td>
                      <td>{{ control.presionSistolica }}</td>
                      <td>{{ control.presionDiastolica }}</td>
                    </tr>
                  </template>
                  <tr v-else>
                    <td colspan="6" class="p-0">
                      <EmptyState
                        icon="bi-clipboard-check"
                        title="No hay controles registrados"
                        description="Registrá signos vitales desde el formulario para verlos aquí."
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
              <div class="mb-3">
                <label for="sv-paciente" class="form-label">
                  Paciente <span class="text-danger">*</span>
                </label>
                <select
                  id="sv-paciente"
                  v-model="form.pacienteId"
                  class="form-select"
                  :class="{ 'is-invalid': formErrors.pacienteId }"
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
                <div v-if="formErrors.pacienteId" class="invalid-feedback">
                  {{ formErrors.pacienteId }}
                </div>
              </div>

              <div class="mb-3">
                <label for="sv-fecha" class="form-label">
                  Fecha y hora <span class="text-danger">*</span>
                </label>
                <input
                  id="sv-fecha"
                  v-model="form.fechaHora"
                  type="datetime-local"
                  class="form-control"
                  :class="{ 'is-invalid': formErrors.fechaHora }"
                />
                <div v-if="formErrors.fechaHora" class="invalid-feedback">
                  {{ formErrors.fechaHora }}
                </div>
              </div>

              <div class="row g-2 mb-3">
                <div class="col-6">
                  <label for="sv-temp" class="form-label">Temperatura (°C) *</label>
                  <input
                    id="sv-temp"
                    v-model.number="form.temperatura"
                    type="number"
                    step="0.1"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.temperatura }"
                  />
                  <div v-if="formErrors.temperatura" class="invalid-feedback">
                    {{ formErrors.temperatura }}
                  </div>
                </div>
                <div class="col-6">
                  <label for="sv-fc" class="form-label">FC (lpm) *</label>
                  <input
                    id="sv-fc"
                    v-model.number="form.frecuenciaCardiaca"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.frecuenciaCardiaca }"
                  />
                  <div v-if="formErrors.frecuenciaCardiaca" class="invalid-feedback">
                    {{ formErrors.frecuenciaCardiaca }}
                  </div>
                </div>
                <div class="col-6">
                  <label for="sv-sis" class="form-label">Sistólica *</label>
                  <input
                    id="sv-sis"
                    v-model.number="form.presionSistolica"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.presionSistolica }"
                  />
                  <div v-if="formErrors.presionSistolica" class="invalid-feedback">
                    {{ formErrors.presionSistolica }}
                  </div>
                </div>
                <div class="col-6">
                  <label for="sv-dia" class="form-label">Diastólica *</label>
                  <input
                    id="sv-dia"
                    v-model.number="form.presionDiastolica"
                    type="number"
                    class="form-control"
                    :class="{ 'is-invalid': formErrors.presionDiastolica }"
                  />
                  <div v-if="formErrors.presionDiastolica" class="invalid-feedback">
                    {{ formErrors.presionDiastolica }}
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="sv-obs" class="form-label">Observaciones</label>
                <textarea
                  id="sv-obs"
                  v-model="form.observaciones"
                  class="form-control"
                  rows="2"
                ></textarea>
              </div>

              <div class="d-flex gap-2 justify-content-end">
                <button type="button" class="btn btn-outline-secondary" @click="cancelarFormulario">
                  Limpiar
                </button>
                <button
                  type="submit"
                  class="btn btn-danger"
                  :disabled="isSubmitting || pacientesInternados.length === 0"
                >
                  {{ isSubmitting ? 'Guardando…' : 'Registrar control' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
