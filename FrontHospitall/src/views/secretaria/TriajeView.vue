<script setup lang="ts">
import { ref, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Paciente } from '@/types/paciente'
import { ApiError } from '@/services/api'
import { pacientesService } from '@/services/pacientesService'
import {
  triageService,
  type TriageEntry,
  type TriageLevel,
} from '@/services/triageService'

const pacientes = ref<Paciente[]>([])
const cola = ref<TriageEntry[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const form = ref({
  patientId: '',
  level: 'verde' as TriageLevel,
})

const levelLabel = (level: TriageLevel) => {
  if (level === 'rojo') return 'Rojo · riesgo vital'
  if (level === 'amarillo') return 'Amarillo · urgente'
  return 'Verde · no urgente'
}

const levelBadge = (level: TriageLevel) => {
  if (level === 'rojo') return 'badge bg-danger'
  if (level === 'amarillo') return 'badge bg-warning text-dark'
  return 'badge bg-success'
}

const loadData = async () => {
  isLoading.value = true
  try {
    const [pats, entries] = await Promise.all([
      pacientesService.getPacientes(),
      triageService.list(),
    ])
    pacientes.value = pats
    cola.value = entries
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo cargar el triaje')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void loadData()
})

const openModal = () => {
  form.value = { patientId: '', level: 'verde' }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSubmit = async () => {
  if (!form.value.patientId) {
    alert('Seleccioná un paciente')
    return
  }
  isSubmitting.value = true
  try {
    await triageService.classify({
      patientId: form.value.patientId,
      level: form.value.level,
    })
    await loadData()
    closeModal()
    if (form.value.level === 'rojo') {
      alert('Código rojo registrado. Se avisó a guardia (log del servidor).')
    }
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo clasificar')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <PageHeader
      title="Triaje"
      description="Clasificación de pacientes sin turno por riesgo (rojo, amarillo, verde)."
    >
      <button type="button" class="btn-hospital-primary" @click="openModal">
        <i class="bi bi-plus-lg"></i>
        <span>Clasificar paciente</span>
      </button>
    </PageHeader>

    <div class="hospital-card mb-4">
      <div class="hospital-card-body p-3">
        <div class="d-flex flex-wrap gap-2">
          <span class="legend-pill"><span class="badge bg-danger me-1">●</span> Rojo · riesgo vital</span>
          <span class="legend-pill"><span class="badge bg-warning text-dark me-1">●</span> Amarillo · urgente</span>
          <span class="legend-pill"><span class="badge bg-success me-1">●</span> Verde · no urgente</span>
        </div>
      </div>
    </div>

    <div class="hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-thermometer-half text-success"></i>
          <span>Cola de triaje</span>
        </div>
        <span class="text-muted small">{{ cola.length }} registros</span>
      </div>
      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper">
          <table class="hospital-table mb-0">
            <thead>
              <tr>
                <th>Prioridad</th>
                <th>Paciente</th>
                <th>DNI</th>
                <th>Hora de clasificación</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="isLoading">
                <td colspan="4" class="text-center text-muted py-4">Cargando…</td>
              </tr>
              <template v-else-if="cola.length > 0">
                <tr v-for="item in cola" :key="item.id">
                  <td>
                    <span :class="levelBadge(item.level)">{{ levelLabel(item.level) }}</span>
                  </td>
                  <td class="fw-semibold">{{ item.pacienteNombre }}</td>
                  <td>{{ item.pacienteDni || '—' }}</td>
                  <td class="text-muted small">
                    {{ new Date(item.createdAt).toLocaleString('es-AR') }}
                  </td>
                </tr>
              </template>
              <tr v-else>
                <td colspan="4" class="p-0">
                  <EmptyState
                    icon="bi-thermometer"
                    title="Sin clasificaciones"
                    description="Registrá un paciente de guardia o demora para ordenarlo por riesgo."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <BaseModal
      :is-open="isModalOpen"
      title="Clasificar en triaje"
      icon="bi-thermometer-half"
      @close="closeModal"
    >
      <div class="mb-3">
        <label class="form-label">Paciente</label>
        <select v-model="form.patientId" class="form-select">
          <option value="">Seleccioná un paciente</option>
          <option v-for="p in pacientes" :key="p.id" :value="String(p.id)">
            {{ p.apellido }}, {{ p.nombre }} — DNI {{ p.dni }}
          </option>
        </select>
      </div>
      <div class="mb-3">
        <label class="form-label">Nivel</label>
        <select v-model="form.level" class="form-select">
          <option value="rojo">Rojo · riesgo vital</option>
          <option value="amarillo">Amarillo · urgente</option>
          <option value="verde">Verde · no urgente</option>
        </select>
      </div>

      <template #footer>
        <button type="button" class="btn btn-outline-secondary" @click="closeModal">Cancelar</button>
        <button
          type="button"
          class="btn-hospital-primary"
          :disabled="isSubmitting"
          @click="handleSubmit"
        >
          <i class="bi bi-check2"></i>
          <span>{{ isSubmitting ? 'Guardando…' : 'Registrar' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
