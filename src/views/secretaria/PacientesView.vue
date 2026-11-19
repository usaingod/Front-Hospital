<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ApiError } from '@/services/api'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import {
  type Paciente,
  type CreatePacienteDTO,
  calcularSaldoTotal,
} from '@/types/paciente'
import { pacientesService } from '@/services/pacientesService'
import { usePacientesListado } from '@/composables/usePacientesListado'



const {
  pacientes,
  loading: isLoading,
  error: loadError,
  loadPacientes,
  searchQuery,
  filterEstado,
  pacientesFiltrados,
} = usePacientesListado()

onMounted(loadPacientes)


const statCards = [
  {
    label: 'Total de pacientes',
    icon: 'bi-people',
    hint: 'Pacientes en el padrón',
    colorClass: 'green' as const,
    value: '—',
  },
  {
    label: 'Atendidos este mes',
    icon: 'bi-person-check',
    hint: 'Consultas completadas',
    colorClass: 'blue' as const,
    value: '—',
  },
  {
    label: 'Nuevos registros',
    icon: 'bi-person-plus',
    hint: 'Incorporaciones del mes',
    colorClass: 'amber' as const,
    value: '—',
  },
  {
    label: 'Coberturas activas',
    icon: 'bi-shield-check',
    hint: 'Con obra social / prepaga',
    colorClass: 'rose' as const,
    value: '—',
  },
]

const filterObraSocial = ref('')


const obrasSocialesDisponibles = computed<string[]>(() => {
  const set = new Set(pacientes.value.map((p) => p.obraSocial).filter(Boolean))
  return Array.from(set).sort()
})


const filteredPacientes = computed(() => {
  if (!filterObraSocial.value) return pacientesFiltrados.value
  return pacientesFiltrados.value.filter(
    (p) => p.obraSocial === filterObraSocial.value,
  )
})

const resetFilters = () => {
  searchQuery.value = ''
  filterObraSocial.value = ''
  filterEstado.value = ''
}


const isPatientModalOpen = ref(false)
const modalMode = ref<'crear' | 'editar'>('crear')
const editingPatientId = ref<number | string | null>(null)


const patientForm = ref({
  nombre: '',
  apellido: '',
  dni: '',
  fechaNacimiento: '',
  telefono: '',
  email: '',
  direccion: '',
  obraSocial: '',
  numeroAfiliado: '',
  observaciones: '',
  saldoTotal: 0,
})

const openNewPatientModal = () => {
  modalMode.value = 'crear'
  editingPatientId.value = null
  patientForm.value = {
    nombre: '',
    apellido: '',
    dni: '',
    fechaNacimiento: '',
    telefono: '',
    email: '',
    direccion: '',
    obraSocial: '',
    numeroAfiliado: '',
    observaciones: '',
    saldoTotal: 0,
  }
  isPatientModalOpen.value = true
}

const openEditPatientModal = (paciente: Paciente) => {
  modalMode.value = 'editar'
  editingPatientId.value = paciente.id
  patientForm.value = {
    nombre: paciente.nombre || '',
    apellido: paciente.apellido || '',
    dni: paciente.dni || '',
    fechaNacimiento: paciente.fechaNacimiento || '',
    telefono: paciente.telefono || '',
    email: paciente.email || '',
    direccion: paciente.direccion || '',
    obraSocial: paciente.obraSocial || '',
    numeroAfiliado: paciente.numeroAfiliado || '',
    observaciones: paciente.observaciones || '',
    saldoTotal: calcularSaldoTotal(paciente),
  }
  isPatientModalOpen.value = true
}

const closePatientModal = () => {
  isPatientModalOpen.value = false
  editingPatientId.value = null
}

const handlePatientSubmit = async () => {
  if (!patientForm.value.nombre.trim() || !patientForm.value.apellido.trim()) {
    alert('Por favor, ingresá al menos el nombre y apellido del paciente.')
    return
  }
  if (!patientForm.value.dni.trim()) {
    alert('El DNI es obligatorio.')
    return
  }

  const payload: CreatePacienteDTO = {
    nombre: patientForm.value.nombre.trim(),
    apellido: patientForm.value.apellido.trim(),
    dni: patientForm.value.dni.trim(),
    fechaNacimiento: patientForm.value.fechaNacimiento,
    telefono: patientForm.value.telefono,
    email: patientForm.value.email,
    direccion: patientForm.value.direccion,
    obraSocial: patientForm.value.obraSocial,
    numeroAfiliado: patientForm.value.numeroAfiliado,
    observaciones: patientForm.value.observaciones,
  }

  try {
    if (modalMode.value === 'crear') {
      await pacientesService.createPaciente(payload)
    } else if (editingPatientId.value != null) {
      await pacientesService.updatePaciente(editingPatientId.value, payload)
    }
    await loadPacientes()
    closePatientModal()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo guardar el paciente')
  }
}


const isDetailModalOpen = ref(false)
const selectedPatient = ref<Paciente | null>(null)

const verDetallePaciente = (paciente: Paciente) => {
  selectedPatient.value = paciente
  isDetailModalOpen.value = true
}

const closeDetailModal = () => {
  isDetailModalOpen.value = false
  selectedPatient.value = null
}


const saldoTotalSeleccionado = computed<number>(() => {
  return calcularSaldoTotal(selectedPatient.value || undefined)
})


const tieneSaldoPendiente = computed<boolean>(() => {
  return saldoTotalSeleccionado.value > 0
})


const isConfirmPaymentModalOpen = ref(false)
const isProcessingPayment = ref(false)

const openConfirmPaymentModal = () => {
  if (!selectedPatient.value || !tieneSaldoPendiente.value) return
  isConfirmPaymentModalOpen.value = true
}

const closeConfirmPaymentModal = () => {
  isConfirmPaymentModalOpen.value = false
}

const handleConfirmPayment = async () => {
  if (!selectedPatient.value) return
  isProcessingPayment.value = true

  try {
    const updated = await pacientesService.cancelarSaldoTotal(
      selectedPatient.value.id,
    )
    if (updated) {
      selectedPatient.value = updated
      pacientes.value = pacientes.value.map((p) =>
        p.id === updated.id ? updated : p,
      )
    }
    closeConfirmPaymentModal()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo registrar el pago')
  } finally {
    isProcessingPayment.value = false
  }
}


const formatCurrency = (val: number = 0): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(val)
}
</script>

<template>
  <div>

    <PageHeader
      title="Pacientes"
      description="Padrón general de pacientes, consulta de fichas personales, coberturas médicas y estado de cuenta."
    >
      <button
        type="button"
        class="btn-hospital-primary"
        title="Registrar un nuevo paciente en el padrón"
        @click="openNewPatientModal"
      >
        <i class="bi bi-person-plus"></i>
        <span>Nuevo paciente</span>
      </button>
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


    <div class="hospital-filter-bar mb-4">
      <div class="row g-2 align-items-end">
        <div class="col-12 col-md-5">
          <label for="buscar-paciente" class="form-label small mb-1">Buscar paciente</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              id="buscar-paciente"
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Buscar por nombre, apellido, DNI o teléfono..."
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

        <div class="col-12 col-sm-6 col-md-3">
          <label for="filtro-obra-social" class="form-label small mb-1">Obra social / Cobertura</label>
          <select
            id="filtro-obra-social"
            v-model="filterObraSocial"
            class="form-select form-select-sm"
            aria-label="Filtrar por obra social"
          >
            <option value="">Todas las obras sociales</option>
            <option v-for="os in obrasSocialesDisponibles" :key="os" :value="os">
              {{ os }}
            </option>
          </select>
        </div>

        <div class="col-12 col-sm-6 col-md-2">
          <label for="filtro-estado-paciente" class="form-label small mb-1">Estado</label>
          <select
            id="filtro-estado-paciente"
            v-model="filterEstado"
            class="form-select form-select-sm"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <div class="col-12 col-md-2 d-flex">
          <button
            type="button"
            class="btn btn-sm btn-outline-secondary w-100"
            title="Restablecer filtros"
            @click="resetFilters"
          >
            <i class="bi bi-arrow-counterclockwise me-1"></i>
            Limpiar
          </button>
        </div>
      </div>
    </div>


    <div class="hospital-card mb-0">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-people text-success"></i>
          <span>Listado de Pacientes</span>
        </div>
        <span class="badge bg-light text-muted border">
          {{ filteredPacientes.length }} pacientes
        </span>
      </div>

      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper border-0 rounded-0">
          <table class="hospital-table mb-0">
            <thead>
              <tr>
                <th scope="col">Nombre y apellido</th>
                <th scope="col" style="width: 130px;">DNI</th>
                <th scope="col" style="width: 140px;">Teléfono</th>
                <th scope="col" style="width: 160px;">Obra social</th>
                <th scope="col" style="width: 150px;">Estado de cuenta</th>
                <th scope="col" class="text-center" style="width: 110px;">Acciones</th>
              </tr>
            </thead>
            <tbody>

              <template v-if="filteredPacientes.length > 0">
                <tr v-for="paciente in filteredPacientes" :key="paciente.id">
                  <td>
                    <div class="fw-semibold text-dark">
                      {{ paciente.apellido }}, {{ paciente.nombre }}
                    </div>
                  </td>
                  <td class="text-muted">{{ paciente.dni }}</td>
                  <td class="text-muted small">{{ paciente.telefono || '—' }}</td>
                  <td>
                    <span class="text-dark small">
                      {{ paciente.obraSocial || 'Particular' }}
                    </span>
                  </td>
                  <td>

                    <span
                      v-if="calcularSaldoTotal(paciente) > 0"
                      class="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1"
                      title="Saldo pendiente de pago"
                    >
                      <i class="bi bi-exclamation-circle-fill" style="font-size: 0.65rem;"></i>
                      {{ formatCurrency(calcularSaldoTotal(paciente)) }}
                    </span>
                    <span
                      v-else
                      class="badge-cama-disponible d-inline-flex align-items-center gap-1"
                      title="Sin saldo pendiente"
                    >
                      <i class="bi bi-check-circle-fill" style="font-size: 0.65rem;"></i>
                      Al día
                    </span>
                  </td>
                  <td class="text-center">
                    <div class="d-inline-flex gap-1">

                      <button
                        type="button"
                        class="btn-action-icon"
                        title="Consultar ficha y estado de cuenta"
                        aria-label="Ver ficha"
                        @click="verDetallePaciente(paciente)"
                      >
                        <i class="bi bi-eye"></i>
                      </button>


                      <button
                        type="button"
                        class="btn-action-icon"
                        title="Editar datos del paciente"
                        aria-label="Editar"
                        @click="openEditPatientModal(paciente)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>


              <tr v-else>
                <td colspan="6" class="p-0">
                  <EmptyState
                    icon="bi-person-slash"
                    title="No hay datos para mostrar"
                    description="No se encontraron pacientes registrados en el sistema. Utilizá el botón «Nuevo paciente» para comenzar a registrar fichas."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn-hospital-outline-primary btn-sm"
                        @click="openNewPatientModal"
                      >
                        <i class="bi bi-plus-lg"></i>
                        <span>Registrar primer paciente</span>
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


    <BaseModal
      :is-open="isPatientModalOpen"
      :title="modalMode === 'crear' ? 'Registrar Nuevo Paciente' : 'Editar Paciente'"
      icon="bi-person-vcard"
      size="lg"
      @close="closePatientModal"
    >
      <form id="form-paciente" novalidate @submit.prevent="handlePatientSubmit">

        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label for="form-nombre" class="form-label">
              Nombre <span class="text-danger">*</span>
            </label>
            <input
              id="form-nombre"
              v-model="patientForm.nombre"
              type="text"
              class="form-control"
              placeholder="Ingresá el nombre"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="form-apellido" class="form-label">
              Apellido <span class="text-danger">*</span>
            </label>
            <input
              id="form-apellido"
              v-model="patientForm.apellido"
              type="text"
              class="form-control"
              placeholder="Ingresá el apellido"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="form-dni" class="form-label">
              DNI / Documento <span class="text-danger">*</span>
            </label>
            <input
              id="form-dni"
              v-model="patientForm.dni"
              type="text"
              class="form-control"
              placeholder="Ingresá el número de documento"
              required
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="form-fecha-nac" class="form-label">Fecha de nacimiento</label>
            <input
              id="form-fecha-nac"
              v-model="patientForm.fechaNacimiento"
              type="date"
              class="form-control"
            />
          </div>
        </div>


        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label for="form-telefono" class="form-label">Teléfono</label>
            <input
              id="form-telefono"
              v-model="patientForm.telefono"
              type="tel"
              class="form-control"
              placeholder="Ingresá el teléfono de contacto"
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="form-email" class="form-label">Email</label>
            <input
              id="form-email"
              v-model="patientForm.email"
              type="email"
              class="form-control"
              placeholder="ejemplo@correo.com"
            />
          </div>
          <div class="col-12">
            <label for="form-direccion" class="form-label">Dirección</label>
            <input
              id="form-direccion"
              v-model="patientForm.direccion"
              type="text"
              class="form-control"
              placeholder="Calle, número, piso/depto, localidad"
            />
          </div>
        </div>


        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label for="form-obra-social" class="form-label">Obra social</label>
            <input
              id="form-obra-social"
              v-model="patientForm.obraSocial"
              type="text"
              class="form-control"
              placeholder="Seleccioná o ingresá obra social"
            />
          </div>
          <div class="col-12 col-md-6">
            <label for="form-afiliado" class="form-label">Número de afiliado</label>
            <input
              id="form-afiliado"
              v-model="patientForm.numeroAfiliado"
              type="text"
              class="form-control"
              placeholder="Ingresá el número de credencial o afiliado"
            />
          </div>
        </div>


        <div class="row g-3 mb-3">
          <div class="col-12 col-md-6">
            <label for="form-saldo" class="form-label fw-bold text-dark">
              Saldo pendiente ($)
            </label>
            <div class="input-group">
              <span class="input-group-text bg-white text-muted">$</span>
              <input
                id="form-saldo"
                v-model.number="patientForm.saldoTotal"
                type="number"
                min="0"
                step="0.01"
                class="form-control"
                placeholder="0"
              />
            </div>
            <div class="form-text text-muted">
              Representa el saldo total adeudado por el paciente (suma de turnos e insumos).
            </div>
          </div>
        </div>


        <div class="mb-2">
          <label for="form-observaciones" class="form-label">Observaciones</label>
          <textarea
            id="form-observaciones"
            v-model="patientForm.observaciones"
            class="form-control"
            rows="3"
            placeholder="Observaciones clínicas, notas administrativas, antecedentes..."
          ></textarea>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          @click="closePatientModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-paciente"
          class="btn-hospital-primary"
        >
          <i class="bi bi-save"></i>
          <span>Guardar paciente</span>
        </button>
      </template>
    </BaseModal>


    <BaseModal
      :is-open="isDetailModalOpen"
      title="Ficha del Paciente"
      icon="bi-person-badge"
      icon-color-class="text-success"
      size="lg"
      @close="closeDetailModal"
    >
      <div v-if="selectedPatient" class="p-1">

        <div class="d-flex align-items-center gap-3 p-3 border rounded bg-light mb-4">
          <div
            class="hospital-avatar"
            style="width: 48px; height: 48px; font-size: 1.25rem; background-color: var(--hospital-green-primary);"
          >
            {{ selectedPatient.nombre.charAt(0) }}{{ selectedPatient.apellido.charAt(0) }}
          </div>
          <div class="flex-grow-1">
            <h3 class="h5 fw-bold mb-0 text-dark">
              {{ selectedPatient.apellido }}, {{ selectedPatient.nombre }}
            </h3>
            <div class="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <span class="badge bg-white text-muted border">
                DNI: {{ selectedPatient.dni }}
              </span>
              <span
                class="badge"
                :class="selectedPatient.estado === 'inactivo' ? 'bg-secondary' : 'bg-success-subtle text-success border border-success-subtle'"
              >
                {{ selectedPatient.estado === 'inactivo' ? 'Inactivo' : 'Activo' }}
              </span>
              <span v-if="selectedPatient.obraSocial" class="badge bg-white text-muted border">
                {{ selectedPatient.obraSocial }}
                <span v-if="selectedPatient.numeroAfiliado">({{ selectedPatient.numeroAfiliado }})</span>
              </span>
            </div>
          </div>
        </div>


        <div class="card border mb-4">
          <div class="card-header bg-light py-2 px-3 d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center gap-2">
              <i class="bi bi-wallet2 text-success fs-5"></i>
              <span class="fw-bold text-dark small text-uppercase" style="letter-spacing: 0.05em;">
                Estado de cuenta
              </span>
            </div>

            <span
              v-if="tieneSaldoPendiente"
              class="badge bg-danger-subtle text-danger border border-danger-subtle d-inline-flex align-items-center gap-1 px-2 py-1"
            >
              <i class="bi bi-exclamation-triangle-fill" style="font-size: 0.7rem;"></i>
              Deuda pendiente
            </span>
            <span
              v-else
              class="badge-cama-disponible d-inline-flex align-items-center gap-1 px-2 py-1"
            >
              <i class="bi bi-check-circle-fill" style="font-size: 0.7rem;"></i>
              Al día
            </span>
          </div>

          <div class="card-body p-3">
            <div class="row g-3 align-items-center">

              <div class="col-12 col-sm-6">
                <div class="text-muted small mb-1">Saldo pendiente total</div>
                <div
                  class="fs-3 fw-bold"
                  :class="tieneSaldoPendiente ? 'text-danger' : 'text-success'"
                >
                  {{ formatCurrency(saldoTotalSeleccionado) }}
                </div>
                <div class="text-muted small mt-1">
                  <span v-if="tieneSaldoPendiente">
                    Importe adeudado correspondiente a turnos e insumos.
                  </span>
                  <span v-else>
                    El paciente no posee deudas registradas en el sistema.
                  </span>
                </div>
              </div>


              <div class="col-12 col-sm-6 text-sm-end">
                <div v-if="tieneSaldoPendiente">
                  <button
                    type="button"
                    class="btn-hospital-primary d-inline-flex align-items-center gap-2"
                    title="Registrar la cancelación total de la deuda"
                    @click="openConfirmPaymentModal"
                  >
                    <i class="bi bi-check2-circle"></i>
                    <span>Marcar como pagado</span>
                  </button>
                  <div class="text-muted small mt-1">
                    Cancela la totalidad del saldo adeudado.
                  </div>
                </div>
                <div v-else class="text-muted small d-inline-flex align-items-center gap-1">
                  <i class="bi bi-shield-check text-success fs-5"></i>
                  <span class="text-success fw-semibold">Sin acciones pendientes de pago</span>
                </div>
              </div>
            </div>
          </div>
        </div>


        <div class="row g-3">
          <div class="col-12 col-sm-6">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Teléfono</div>
              <div class="fw-semibold text-dark">{{ selectedPatient.telefono || '—' }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Correo electrónico</div>
              <div class="fw-semibold text-dark">{{ selectedPatient.email || '—' }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Fecha de nacimiento</div>
              <div class="fw-semibold text-dark">{{ selectedPatient.fechaNacimiento || '—' }}</div>
            </div>
          </div>
          <div class="col-12 col-sm-6">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Dirección</div>
              <div class="fw-semibold text-dark">{{ selectedPatient.direccion || '—' }}</div>
            </div>
          </div>
          <div v-if="selectedPatient.observaciones" class="col-12">
            <div class="p-2 border rounded bg-light">
              <div class="text-muted small">Observaciones</div>
              <div class="text-dark small mt-1">{{ selectedPatient.observaciones }}</div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          @click="closeDetailModal"
        >
          Cerrar
        </button>
      </template>
    </BaseModal>


    <BaseModal
      :is-open="isConfirmPaymentModalOpen"
      title="Confirmar Cancelación de Saldo"
      icon="bi-cash-coin"
      icon-color-class="text-success"
      size="md"
      @close="closeConfirmPaymentModal"
    >
      <div v-if="selectedPatient" class="p-1">
        <p class="text-dark mb-3">
          ¿Confirmás el registro de cancelación total de deuda para el paciente
          <strong>{{ selectedPatient.nombre }} {{ selectedPatient.apellido }}</strong>?
        </p>


        <div class="p-3 border rounded bg-light mb-3 text-center">
          <div class="text-muted small mb-1">Monto total a cancelar</div>
          <div class="fs-2 fw-bold text-success">
            {{ formatCurrency(saldoTotalSeleccionado) }}
          </div>
          <div class="small text-muted mt-1">
            Esta operación cancela la deuda acumulada de turnos e insumos.
          </div>
        </div>

        <div class="alert alert-light border py-2 px-3 d-flex align-items-start gap-2 mb-0">
          <i class="bi bi-info-circle text-success fs-5 mt-1"></i>
          <div class="small text-muted">
            <strong>Restricción del sistema:</strong>
            No se admiten pagos parciales ni ingreso manual de importes. La confirmación solicitará al backend establecer ambos saldos en cero (<code>appointmentBalance = 0</code> y <code>supplyBalance = 0</code>).
          </div>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isProcessingPayment"
          @click="closeConfirmPaymentModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn-hospital-primary"
          :disabled="isProcessingPayment"
          @click="handleConfirmPayment"
        >
          <i class="bi bi-check2"></i>
          <span>Confirmar pago total</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
