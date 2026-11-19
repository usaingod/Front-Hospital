<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Cama, Ala, CreateCamaDTO, UpdateCamaDTO, CreateAlaDTO } from '@/types/internacion'
import { ApiError } from '@/services/api'
import { alasService, camasService } from '@/services/camasService'



const camas = ref<Cama[]>([])
const alas = ref<Ala[]>([])

const loadData = async () => {
  const [beds, wings] = await Promise.all([
    camasService.getAll(),
    alasService.getAll(),
  ])
  camas.value = beds
  alas.value = wings
}

onMounted(() => {
  loadData().catch((err) => {
    alert(err instanceof ApiError ? err.message : 'No se pudieron cargar las camas')
  })
})

const statCards = computed(() => [
  {
    label: 'Total de Camas',
    icon: 'bi-hospital',
    colorClass: 'blue' as const,
    hint: 'Registradas en la infraestructura',
    value: String(camas.value.length || '—'),
  },
  {
    label: 'Alas Habilitadas',
    icon: 'bi-building',
    colorClass: 'blue' as const,
    hint: 'Sectores del hospital',
    value: String(alas.value.length || '—'),
  },
])


const searchQuery = ref('')
const filterAla = ref('')


const alasDisponibles = computed<string[]>(() => {

  const nombresAlas = new Set<string>()
  alas.value.forEach((a) => {
    if (a.nombre) nombresAlas.add(a.nombre)
  })
  camas.value.forEach((c) => {
    if (c.ala) nombresAlas.add(c.ala)
    else if (c.sala) nombresAlas.add(c.sala)
  })
  return Array.from(nombresAlas).sort()
})


const filteredCamas = computed(() => {
  return camas.value.filter((cama) => {
    const q = searchQuery.value.trim().toLowerCase()
    const matchesQuery = !q || cama.numero.toLowerCase().includes(q)

    const alaCama = cama.ala || cama.sala || ''
    const matchesAla = !filterAla.value || alaCama === filterAla.value

    return matchesQuery && matchesAla
  })
})

const hayFiltrosActivos = computed(() => !!searchQuery.value || !!filterAla.value)

const resetFilters = () => {
  searchQuery.value = ''
  filterAla.value = ''
}


const isCamaModalOpen = ref(false)
const formCama = ref<CreateCamaDTO>({
  ala: '',
  alaId: '',
})
const formCamaErrors = ref<{ ala?: string }>({})
const isSubmittingCama = ref(false)

const openNewCamaModal = () => {
  formCama.value = {
    ala: '',
    alaId: '',
  }
  formCamaErrors.value = {}
  isCamaModalOpen.value = true
}

const closeCamaModal = () => {
  isCamaModalOpen.value = false
  formCamaErrors.value = {}
}

const onSelectAlaChange = () => {
  if (formCama.value.ala) {
    const alaObj = alas.value.find((a) => a.nombre === formCama.value.ala)
    if (alaObj) {
      formCama.value.alaId = alaObj.id
    }
    delete formCamaErrors.value.ala
  }
}

const handleCamaSubmit = async () => {
  if (!formCama.value.ala) {
    formCamaErrors.value.ala = 'Debe seleccionar un ala para la cama.'
    return
  }
  isSubmittingCama.value = true
  try {
    const alaObj = alas.value.find((a) => a.nombre === formCama.value.ala)
    await camasService.create({
      ala: formCama.value.ala,
      alaId: alaObj?.id || formCama.value.alaId,
    })
    await loadData()
    closeCamaModal()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo crear la cama')
  } finally {
    isSubmittingCama.value = false
  }
}


const isAlaModalOpen = ref(false)
const formAla = ref<CreateAlaDTO>({
  nombre: '',
  descripcion: '',
})
const formAlaErrors = ref<{ nombre?: string }>({})
const isSubmittingAla = ref(false)

const openNewAlaModal = () => {
  formAla.value = {
    nombre: '',
    descripcion: '',
  }
  formAlaErrors.value = {}
  isAlaModalOpen.value = true
}

const closeAlaModal = () => {
  isAlaModalOpen.value = false
  formAlaErrors.value = {}
}

const handleAlaSubmit = async () => {
  if (!formAla.value.nombre.trim()) {
    formAlaErrors.value.nombre = 'El nombre o identificación del ala es obligatorio.'
    return
  }
  isSubmittingAla.value = true
  try {
    const created = await alasService.create({
      nombre: formAla.value.nombre.trim(),
      descripcion: formAla.value.descripcion?.trim() || undefined,
    })
    await loadData()
    if (created && isCamaModalOpen.value) {
      formCama.value.ala = created.nombre
      formCama.value.alaId = created.id
    }
    closeAlaModal()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo crear el ala')
  } finally {
    isSubmittingAla.value = false
  }
}


const isEditCamaModalOpen = ref(false)
const selectedCamaParaEditar = ref<Cama | null>(null)
const formEditCama = ref<UpdateCamaDTO>({
  ala: '',
  alaId: '',
  sala: '',
})
const isSubmittingEdit = ref(false)
const isSubmittingDelete = ref(false)

const openEditCamaModal = (cama: Cama) => {
  selectedCamaParaEditar.value = cama
  const alaNombre = cama.ala || cama.sala || ''
  const alaObj = alas.value.find((a) => a.nombre === alaNombre)
  formEditCama.value = {
    ala: alaNombre,
    alaId: cama.alaId || alaObj?.id || '',
    sala: cama.sala || alaNombre,
  }
  isEditCamaModalOpen.value = true
}

const closeEditCamaModal = () => {
  isEditCamaModalOpen.value = false
  selectedCamaParaEditar.value = null
}

const onEditAlaChange = () => {
  const alaObj = alas.value.find((a) => a.nombre === formEditCama.value.ala)
  formEditCama.value.alaId = alaObj?.id || ''
  formEditCama.value.sala = formEditCama.value.ala
}

const handleEditCamaSubmit = async () => {
  if (!selectedCamaParaEditar.value) return
  if (!formEditCama.value.ala) {
    alert('Seleccioná un ala')
    return
  }
  isSubmittingEdit.value = true
  try {
    const alaObj = alas.value.find((a) => a.nombre === formEditCama.value.ala)
    await camasService.update(String(selectedCamaParaEditar.value.id), {
      ala: formEditCama.value.ala,
      alaId: alaObj?.id || formEditCama.value.alaId,
      sala: formEditCama.value.ala,
    })
    await loadData()
    closeEditCamaModal()
  } catch (err) {
    alert(err instanceof ApiError ? err.message : 'No se pudo modificar la cama')
  } finally {
    isSubmittingEdit.value = false
  }
}


const isDeleteCamaModalOpen = ref(false)
const selectedCamaParaEliminar = ref<Cama | null>(null)

const openDeleteCamaModal = (cama: Cama) => {
  selectedCamaParaEliminar.value = cama
  isDeleteCamaModalOpen.value = true
}

const closeDeleteCamaModal = () => {
  isDeleteCamaModalOpen.value = false
  selectedCamaParaEliminar.value = null
}

const handleDeleteCamaConfirm = async () => {
  if (!selectedCamaParaEliminar.value) return
  isSubmittingDelete.value = true
  try {
    await camasService.delete(String(selectedCamaParaEliminar.value.id))
    await loadData()
    closeDeleteCamaModal()
  } catch (err) {
    alert(
      err instanceof ApiError
        ? err.message
        : 'No se pudo eliminar la cama (puede estar ocupada o con historial)',
    )
  } finally {
    isSubmittingDelete.value = false
  }
}
</script>

<template>
  <div>

    <PageHeader
      title="Camas"
      description="Gestión de infraestructura hospitalaria, inventario de camas y configuración de alas."
    >
      <template #actions>
        <div class="d-flex align-items-center gap-2 flex-wrap">

          <button
            type="button"
            class="btn-hospital-outline-primary"
            title="Registrar una nueva ala o sector del hospital"
            @click="openNewAlaModal()"
          >
            <i class="bi bi-building-add"></i>
            <span>+ Nueva ala</span>
          </button>


          <button
            type="button"
            class="btn-hospital-primary"
            title="Registrar una nueva cama en la infraestructura"
            @click="openNewCamaModal()"
          >
            <i class="bi bi-plus-lg"></i>
            <span>+ Nueva cama</span>
          </button>
        </div>
      </template>
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

        <div class="col-12 col-md-6">
          <label for="buscar-cama" class="form-label small mb-1">Buscar por número de cama</label>
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-white">
              <i class="bi bi-search text-muted"></i>
            </span>
            <input
              id="buscar-cama"
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="Ej: 101, 102, 201..."
              aria-label="Buscar por número de cama"
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


        <div class="col-12 col-md-5">
          <label for="filtro-ala" class="form-label small mb-1">Filtrar por ala</label>
          <select
            id="filtro-ala"
            v-model="filterAla"
            class="form-select form-select-sm"
            aria-label="Filtrar por ala"
          >
            <option value="">Todas las alas</option>
            <option v-for="ala in alasDisponibles" :key="ala" :value="ala">
              {{ ala }}
            </option>
          </select>
        </div>


        <div class="col-12 col-md-1 d-flex">
          <button
            v-if="hayFiltrosActivos"
            type="button"
            class="btn btn-sm btn-outline-secondary w-100"
            title="Limpiar filtros"
            @click="resetFilters"
          >
            <i class="bi bi-arrow-counterclockwise"></i>
          </button>
        </div>
      </div>
    </div>


    <div class="hospital-card mb-0">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-hospital text-primary"></i>
          <span>Inventario de camas</span>
        </div>
        <span class="badge bg-light text-muted border">
          {{ filteredCamas.length }} camas registradas
        </span>
      </div>

      <div class="hospital-card-body p-0">
        <div class="hospital-table-wrapper border-0">
          <table class="hospital-table mb-0">
            <thead>
              <tr>
                <th scope="col" style="width: 200px;">Número de cama</th>
                <th scope="col">Ala / Sector</th>
                <th scope="col" class="text-center" style="width: 140px;">Acciones</th>
              </tr>
            </thead>
            <tbody>

              <template v-if="filteredCamas.length > 0">
                <tr v-for="cama in filteredCamas" :key="cama.id">
                  <td>
                    <div class="d-flex align-items-center gap-2">
                      <div
                        class="hospital-avatar-sm"
                        style="width: 32px; height: 32px; font-size: 0.85rem; background-color: var(--hospital-blue-light); color: var(--hospital-blue-primary);"
                      >
                        <i class="bi bi-hospital"></i>
                      </div>
                      <span class="fw-bold text-dark fs-6">
                        Cama {{ cama.numero }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold text-dark">
                      {{ cama.ala || cama.sala || 'Sin ala asignada' }}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-inline-flex gap-1">

                      <button
                        type="button"
                        class="btn-action-icon"
                        title="Editar datos de la cama"
                        aria-label="Editar cama"
                        @click="openEditCamaModal(cama)"
                      >
                        <i class="bi bi-pencil"></i>
                      </button>


                      <button
                        type="button"
                        class="btn-action-icon danger"
                        title="Eliminar cama de la infraestructura"
                        aria-label="Eliminar cama"
                        @click="openDeleteCamaModal(cama)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>


              <tr v-else>
                <td colspan="3" class="p-0">
                  <EmptyState
                    icon="bi-hospital"
                    title="No hay camas para mostrar"
                    description="El inventario de camas de la infraestructura hospitalaria estará disponible una vez conectado con el servidor."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn btn-sm btn-hospital-primary"
                        @click="openNewCamaModal()"
                      >
                        <i class="bi bi-plus-lg"></i>
                        Registrar primera cama
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
      :is-open="isCamaModalOpen"
      title="Nueva Cama"
      icon="bi-hospital"
      icon-color-class="text-primary"
      size="md"
      @close="closeCamaModal"
    >
      <form id="form-nueva-cama" novalidate @submit.prevent="handleCamaSubmit">

        <div class="alert alert-light border py-2 px-3 d-flex align-items-start gap-2 mb-3">
          <i class="bi bi-info-circle text-primary fs-5 mt-1"></i>
          <div class="small text-muted">
            <strong>Generación automática de número:</strong>
            El número de cama no se ingresa manualmente. El backend lo genera automáticamente según la regla del ala (el primer dígito representa el ala y los dos siguientes el correlativo: 101, 102, 201...).
          </div>
        </div>


        <div class="mb-3">
          <div class="d-flex align-items-center justify-content-between mb-1">
            <label for="cama-ala" class="form-label mb-0">
              Ala hospitalaria <span class="text-danger">*</span>
            </label>
            <button
              type="button"
              class="btn btn-link btn-sm p-0 text-decoration-none"
              title="Registrar una nueva ala"
              @click="openNewAlaModal()"
            >
              <i class="bi bi-plus-circle"></i> + Nueva ala
            </button>
          </div>

          <select
            id="cama-ala"
            v-model="formCama.ala"
            class="form-select"
            :class="{ 'is-invalid': formCamaErrors.ala }"
            aria-describedby="cama-ala-error"
            @change="onSelectAlaChange"
          >
            <option value="">Seleccionar ala...</option>
            <option v-for="ala in alasDisponibles" :key="ala" :value="ala">
              {{ ala }}
            </option>
          </select>
          <div v-if="alasDisponibles.length === 0" class="form-text text-muted">
            Aún no hay alas registradas. Podés crear una presionando «+ Nueva ala».
          </div>
          <div
            v-if="formCamaErrors.ala"
            id="cama-ala-error"
            class="invalid-feedback"
          >
            {{ formCamaErrors.ala }}
          </div>
        </div>


        <div v-if="formCama.ala" class="p-3 border rounded bg-light mb-3">
          <div class="small text-muted mb-1">Asignación automática del servidor:</div>
          <div class="d-flex align-items-center gap-2 text-dark">
            <i class="bi bi-magic text-primary"></i>
            <span class="fw-semibold">
              Próximo número disponible para {{ formCama.ala }}
            </span>
          </div>
          <div class="small text-muted mt-1">
            El backend resolverá la correlatividad y la concurrencia de forma segura.
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isSubmittingCama"
          @click="closeCamaModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-nueva-cama"
          class="btn-hospital-primary"
          :disabled="isSubmittingCama"
        >
          <i class="bi bi-check2"></i>
          <span>Crear cama</span>
        </button>
      </template>
    </BaseModal>


    <BaseModal
      :is-open="isAlaModalOpen"
      title="Nueva Ala Hospitalaria"
      icon="bi-building-add"
      icon-color-class="text-primary"
      size="md"
      @close="closeAlaModal"
    >
      <form id="form-nueva-ala" novalidate @submit.prevent="handleAlaSubmit">
        <p class="small text-muted mb-3">
          Registrá un ala o sector hospitalario para ampliar las instalaciones del hospital y habilitar la creación de nuevas camas.
        </p>


        <div class="mb-3">
          <label for="ala-nombre" class="form-label">
            Nombre / Identificación del ala <span class="text-danger">*</span>
          </label>
          <input
            id="ala-nombre"
            v-model="formAla.nombre"
            type="text"
            class="form-control"
            :class="{ 'is-invalid': formAlaErrors.nombre }"
            placeholder="Ej: Ala 1, Ala 2, Ala Norte..."
            aria-describedby="ala-nombre-error"
          />
          <div
            v-if="formAlaErrors.nombre"
            id="ala-nombre-error"
            class="invalid-feedback"
          >
            {{ formAlaErrors.nombre }}
          </div>
        </div>


        <div class="mb-3">
          <label for="ala-descripcion" class="form-label">
            Descripción o ubicación (opcional)
          </label>
          <input
            id="ala-descripcion"
            v-model="formAla.descripcion"
            type="text"
            class="form-control"
            placeholder="Ej: Planta baja - Sector Este..."
          />
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isSubmittingAla"
          @click="closeAlaModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-nueva-ala"
          class="btn-hospital-primary"
          :disabled="isSubmittingAla"
        >
          <i class="bi bi-check2"></i>
          <span>Crear ala</span>
        </button>
      </template>
    </BaseModal>


    <BaseModal
      :is-open="isEditCamaModalOpen"
      title="Editar Cama"
      icon="bi-pencil"
      icon-color-class="text-primary"
      size="md"
      @close="closeEditCamaModal"
    >
      <form v-if="selectedCamaParaEditar" id="form-editar-cama" novalidate @submit.prevent="handleEditCamaSubmit">
        <div class="mb-3">
          <label class="form-label">Número de cama</label>
          <input
            type="text"
            class="form-control bg-light"
            :value="`Cama ${selectedCamaParaEditar.numero}`"
            disabled
          />
          <div class="form-text text-muted">
            El número de cama asignado por el servidor no puede modificarse manualmente.
          </div>
        </div>

        <div class="mb-3">
          <label for="edit-cama-ala" class="form-label">Ala asignada</label>
          <select
            id="edit-cama-ala"
            v-model="formEditCama.ala"
            class="form-select"
            @change="onEditAlaChange"
          >
            <option value="">Seleccionar ala...</option>
            <option
              v-for="ala in alas"
              :key="ala.id"
              :value="ala.nombre"
            >
              {{ ala.nombre }}
            </option>
          </select>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isSubmittingEdit"
          @click="closeEditCamaModal"
        >
          Cancelar
        </button>
        <button
          type="submit"
          form="form-editar-cama"
          class="btn-hospital-primary"
          :disabled="isSubmittingEdit"
        >
          <i class="bi bi-check2"></i>
          <span>{{ isSubmittingEdit ? 'Guardando…' : 'Guardar cambios' }}</span>
        </button>
      </template>
    </BaseModal>


    <BaseModal
      :is-open="isDeleteCamaModalOpen"
      title="Eliminar Cama"
      icon="bi-exclamation-triangle"
      icon-color-class="text-danger"
      size="md"
      @close="closeDeleteCamaModal"
    >
      <div v-if="selectedCamaParaEliminar" class="p-1">
        <p class="text-dark mb-2">
          ¿Estás seguro de que deseás eliminar la <strong>Cama {{ selectedCamaParaEliminar.numero }}</strong> ({{ selectedCamaParaEliminar.ala || selectedCamaParaEliminar.sala || 'Sin ala' }}) de la infraestructura?
        </p>
        <div class="alert alert-warning border d-flex align-items-start gap-2 mb-0 py-2 px-3">
          <i class="bi bi-shield-exclamation fs-5 text-warning mt-1"></i>
          <span class="small text-muted">
            El backend verificará que la cama no posea internaciones asociadas ni dependencias antes de autorizar la baja definitiva.
          </span>
        </div>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn-hospital-outline"
          :disabled="isSubmittingDelete"
          @click="closeDeleteCamaModal"
        >
          Cancelar
        </button>
        <button
          type="button"
          class="btn btn-danger d-inline-flex align-items-center gap-1"
          :disabled="isSubmittingDelete"
          @click="handleDeleteCamaConfirm"
        >
          <i class="bi bi-trash"></i>
          <span>{{ isSubmittingDelete ? 'Eliminando…' : 'Eliminar cama' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
