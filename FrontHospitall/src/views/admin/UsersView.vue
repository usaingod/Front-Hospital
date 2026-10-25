<script setup lang="ts">
import { ref, computed } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import type { Usuario, CreateUsuarioDTO, RolUsuario } from '@/types/usuario'

/**
 * Vista: Gestión de Usuarios del Sistema (UsersView.vue)
 * Criterios 1, 2, 3, 5, 8, 9:
 * - Control de cuentas y asignación de roles (Administrador / Secretaría).
 * - Indicadores clave con guión neutral sin métricas inventadas.
 * - Tabla con encabezados completos y estado vacío estandarizado.
 * - Filtros por término de búsqueda, rol y estado.
 * - Modal visual para consultar, crear y editar usuarios.
 * - Campos de contraseña con tipo seguro (type="password") y alternador de visibilidad.
 * - Sin autenticación real ni almacenamiento de contraseñas.
 */

// Colección reactiva de usuarios (inicia vacía sin datos inventados)
const usuarios = ref<Usuario[]>([])

// Indicadores estadísticos sin datos ficticios
const statCards = [
  {
    label: 'Total Usuarios',
    icon: 'bi-people',
    colorClass: 'blue' as const,
    hint: 'Cuentas en el sistema',
    value: '—',
  },
  {
    label: 'Administradores',
    icon: 'bi-shield-check',
    colorClass: 'blue' as const,
    hint: 'Acceso a configuración global',
    value: '—',
  },
  {
    label: 'Secretaría',
    icon: 'bi-calendar3',
    colorClass: 'green' as const,
    hint: 'Gestión de turnos y pacientes',
    value: '—',
  },
  {
    label: 'Usuarios Activos',
    icon: 'bi-check-circle',
    colorClass: 'amber' as const,
    hint: 'Habilitados para ingresar',
    value: '—',
  },
]

// Filtros y búsqueda
const searchQuery = ref('')
const filterRol = ref('')
const filterEstado = ref('')

// Estado del Modal de Usuario
const isModalOpen = ref(false)
const modalMode = ref<'crear' | 'editar' | 'consultar'>('crear')
const selectedUser = ref<Usuario | null>(null)

// Visibilidad de contraseñas (UX)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Formulario de usuario (campos vacíos con placeholders descriptivos)
const form = ref<CreateUsuarioDTO>({
  nombre: '',
  apellido: '',
  email: '',
  rol: 'Secretaria',
  password: '',
  confirmPassword: '',
  estado: 'activo',
})

// Modal para Crear
const openCreateModal = () => {
  modalMode.value = 'crear'
  selectedUser.value = null
  showPassword.value = false
  showConfirmPassword.value = false
  form.value = {
    nombre: '',
    apellido: '',
    email: '',
    rol: 'Secretaria',
    password: '',
    confirmPassword: '',
    estado: 'activo',
  }
  isModalOpen.value = true
}

// Modal para Consultar
const openViewModal = (user: Usuario) => {
  modalMode.value = 'consultar'
  selectedUser.value = user
  form.value = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol: user.rol,
    password: '',
    confirmPassword: '',
    estado: user.estado,
  }
  isModalOpen.value = true
}

// Modal para Editar
const openEditModal = (user: Usuario) => {
  modalMode.value = 'editar'
  selectedUser.value = user
  showPassword.value = false
  showConfirmPassword.value = false
  form.value = {
    nombre: user.nombre,
    apellido: user.apellido,
    email: user.email,
    rol: user.rol,
    password: '',
    confirmPassword: '',
    estado: user.estado,
  }
  isModalOpen.value = true
}

// Acción visual para Eliminar
const handleDelete = (user: Usuario) => {
  if (confirm(`¿Desea deshabilitar la cuenta del usuario "${user.nombre} ${user.apellido}"?`)) {
    alert('Acción visual. La eliminación se efectuará con la API en el backend.')
  }
}

const closeModal = () => {
  isModalOpen.value = false
}

const handleSave = () => {
  if (modalMode.value === 'crear' && form.value.password !== form.value.confirmPassword) {
    alert('Las contraseñas ingresadas no coinciden. Verifique los campos.')
    return
  }

  alert('Acción visual de guardado. El backend procesará la operación en la etapa de integración.')
  closeModal()
}

// Filtrado reactivo de usuarios
const filteredUsers = computed(() => {
  return usuarios.value.filter((item) => {
    const q = searchQuery.value.toLowerCase().trim()
    const matchesQuery =
      !q ||
      item.nombre.toLowerCase().includes(q) ||
      item.apellido.toLowerCase().includes(q) ||
      item.email.toLowerCase().includes(q)

    const matchesRol = !filterRol.value || item.rol === filterRol.value
    const matchesEstado = !filterEstado.value || item.estado === filterEstado.value

    return matchesQuery && matchesRol && matchesEstado
  })
})
</script>

<template>
  <div class="users-view">
    <!-- Encabezado con acción principal -->
    <PageHeader
      title="Gestión de Usuarios"
      description="Administración de cuentas de acceso, roles del sistema hospitalario y estados de habilitación."
    >
      <template #actions>
        <button
          type="button"
          class="btn btn-hospital-primary"
          @click="openCreateModal"
        >
          <i class="bi bi-person-plus"></i>
          <span>Nuevo usuario</span>
        </button>
      </template>
    </PageHeader>

    <!-- Indicadores estadísticos sin datos ficticios -->
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

    <!-- Barra de filtros y búsqueda -->
    <div class="hospital-filter-bar">
      <div class="row g-3 align-items-center">
        <!-- Campo de búsqueda -->
        <div class="col-12 col-md-5 col-lg-4">
          <label class="form-label" for="user-search">Buscar usuario</label>
          <div class="position-relative">
            <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              id="user-search"
              v-model="searchQuery"
              type="text"
              class="form-control ps-5"
              placeholder="Buscar por nombre o email..."
            />
          </div>
        </div>

        <!-- Filtro por rol -->
        <div class="col-12 col-md-4 col-lg-3">
          <label class="form-label" for="user-role-filter">Rol asignado</label>
          <select
            id="user-role-filter"
            v-model="filterRol"
            class="form-select"
          >
            <option value="">Todos los roles</option>
            <option value="Administrador">Administrador</option>
            <option value="Secretaria">Secretaría</option>
          </select>
        </div>

        <!-- Filtro por estado -->
        <div class="col-12 col-md-3 col-lg-3">
          <label class="form-label" for="user-status-filter">Estado</label>
          <select
            id="user-status-filter"
            v-model="filterEstado"
            class="form-select"
          >
            <option value="">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>

        <!-- Botón para limpiar filtros -->
        <div class="col-12 col-md-12 col-lg-2 d-flex align-items-end">
          <button
            type="button"
            class="btn btn-hospital-outline w-100"
            :disabled="!searchQuery && !filterRol && !filterEstado"
            @click="searchQuery = ''; filterRol = ''; filterEstado = ''"
          >
            <i class="bi bi-x-circle"></i>
            <span>Limpiar</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Contenedor de la Tabla -->
    <div class="hospital-card">
      <div class="hospital-card-header">
        <h2 class="hospital-card-title">
          <i class="bi bi-people-gear text-primary"></i>
          <span>Padrón de Usuarios del Sistema</span>
        </h2>
        <div class="text-muted small">
          {{ filteredUsers.length }} cuentas registradas
        </div>
      </div>

      <div class="p-0">
        <div class="hospital-table-wrapper border-0">
          <table class="hospital-table">
            <thead>
              <tr>
                <th style="width: 28%;">Usuario</th>
                <th style="width: 25%;">Email</th>
                <th style="width: 15%;">Rol</th>
                <th style="width: 12%;">Estado</th>
                <th style="width: 20%; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <!-- Filas cuando existan usuarios -->
              <tr
                v-for="user in filteredUsers"
                :key="user.id"
              >
                <td>
                  <div class="d-flex align-items-center gap-2">
                    <div
                      class="hospital-avatar-sm"
                      :style="
                        user.rol === 'Administrador'
                          ? { backgroundColor: 'var(--hospital-blue-primary)' }
                          : { backgroundColor: 'var(--hospital-green-primary)' }
                      "
                    >
                      <i :class="['bi', user.rol === 'Administrador' ? 'bi-shield-check' : 'bi-person']"></i>
                    </div>
                    <div>
                      <div class="fw-semibold text-dark">
                        {{ user.nombre }} {{ user.apellido }}
                      </div>
                      <div v-if="user.fechaRegistro" class="text-muted small">
                        Alta: {{ user.fechaRegistro }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="small font-monospace">
                  {{ user.email }}
                </td>
                <td>
                  <span
                    class="badge-status"
                    :class="{
                      admin: user.rol === 'Administrador',
                      secretaria: user.rol === 'Secretaria',
                    }"
                  >
                    <i :class="['bi', user.rol === 'Administrador' ? 'bi-shield' : 'bi-calendar3']"></i>
                    {{ user.rol }}
                  </span>
                </td>
                <td>
                  <span
                    class="badge-status"
                    :class="{
                      active: user.estado === 'activo',
                      inactive: user.estado === 'inactivo',
                    }"
                  >
                    {{ user.estado === 'activo' ? 'Activo' : 'Inactivo' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="d-inline-flex gap-1">
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Consultar usuario"
                      @click="openViewModal(user)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon"
                      title="Editar usuario"
                      @click="openEditModal(user)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      type="button"
                      class="btn-action-icon danger"
                      title="Deshabilitar usuario"
                      @click="handleDelete(user)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Estado vacío discreto dentro de la tabla -->
              <tr v-if="filteredUsers.length === 0">
                <td colspan="5" class="p-0">
                  <EmptyState
                    icon="bi-people-gear"
                    title="No se encontraron usuarios"
                    description="Actualmente no hay cuentas de usuario registradas en el sistema o ninguna coincide con los filtros aplicados."
                  >
                    <template #actions>
                      <button
                        type="button"
                        class="btn btn-hospital-primary btn-sm"
                        @click="openCreateModal"
                      >
                        <i class="bi bi-person-plus"></i>
                        <span>Registrar primer usuario</span>
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

    <!-- Modal para Crear / Editar / Consultar Usuario -->
    <BaseModal
      :is-open="isModalOpen"
      :title="
        modalMode === 'crear'
          ? 'Registrar Nuevo Usuario'
          : modalMode === 'editar'
          ? 'Editar Usuario'
          : 'Consulta de Usuario'
      "
      icon="bi-people-gear"
      icon-color-class="text-primary"
      size="md"
      @close="closeModal"
    >
      <form @submit.prevent="handleSave">
        <div class="row g-3">
          <!-- Nombre -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="user-nombre">
              Nombre <span class="text-danger">*</span>
            </label>
            <input
              id="user-nombre"
              v-model="form.nombre"
              type="text"
              class="form-control"
              placeholder="Ingresá el nombre"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Apellido -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="user-apellido">
              Apellido <span class="text-danger">*</span>
            </label>
            <input
              id="user-apellido"
              v-model="form.apellido"
              type="text"
              class="form-control"
              placeholder="Ingresá el apellido"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Email -->
          <div class="col-12">
            <label class="form-label" for="user-email">
              Correo electrónico institucional <span class="text-danger">*</span>
            </label>
            <input
              id="user-email"
              v-model="form.email"
              type="email"
              class="form-control"
              placeholder="usuario@hospital.gob.ar"
              :disabled="modalMode === 'consultar'"
              required
            />
          </div>

          <!-- Rol -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="user-role">
              Rol del sistema <span class="text-danger">*</span>
            </label>
            <select
              id="user-role"
              v-model="form.rol"
              class="form-select"
              :disabled="modalMode === 'consultar'"
              required
            >
              <option value="Administrador">Administrador (Gestión general)</option>
              <option value="Secretaria">Secretaría (Turnos y pacientes)</option>
            </select>
          </div>

          <!-- Estado -->
          <div class="col-12 col-md-6">
            <label class="form-label" for="user-state">
              Estado de la cuenta <span class="text-danger">*</span>
            </label>
            <select
              id="user-state"
              v-model="form.estado"
              class="form-select"
              :disabled="modalMode === 'consultar'"
              required
            >
              <option value="activo">Activo (habilitado)</option>
              <option value="inactivo">Inactivo (bloqueado)</option>
            </select>
          </div>

          <!-- Contraseña (requerida al alta) -->
          <div v-if="modalMode !== 'consultar'" class="col-12 col-md-6">
            <label class="form-label" for="user-password">
              Contraseña <span v-if="modalMode === 'crear'" class="text-danger">*</span>
            </label>
            <div class="position-relative">
              <input
                id="user-password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-control pe-5"
                placeholder="Ingresá la contraseña"
                :required="modalMode === 'crear'"
              />
              <button
                type="button"
                class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted text-decoration-none pe-3"
                :aria-label="showPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                @click="showPassword = !showPassword"
              >
                <i :class="['bi', showPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
              </button>
            </div>
          </div>

          <!-- Confirmación de Contraseña -->
          <div v-if="modalMode !== 'consultar'" class="col-12 col-md-6">
            <label class="form-label" for="user-confirm-password">
              Confirmar contraseña <span v-if="modalMode === 'crear'" class="text-danger">*</span>
            </label>
            <div class="position-relative">
              <input
                id="user-confirm-password"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-control pe-5"
                placeholder="Confirmá la contraseña"
                :required="modalMode === 'crear'"
              />
              <button
                type="button"
                class="btn btn-sm btn-link position-absolute top-50 end-0 translate-middle-y text-muted text-decoration-none pe-3"
                :aria-label="showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="['bi', showConfirmPassword ? 'bi-eye-slash' : 'bi-eye']"></i>
              </button>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-hospital-outline"
          @click="closeModal"
        >
          {{ modalMode === 'consultar' ? 'Cerrar' : 'Cancelar' }}
        </button>
        <button
          v-if="modalMode !== 'consultar'"
          type="button"
          class="btn btn-hospital-primary"
          @click="handleSave"
        >
          <i class="bi bi-check2"></i>
          <span>{{ modalMode === 'crear' ? 'Registrar usuario' : 'Actualizar usuario' }}</span>
        </button>
      </template>
    </BaseModal>
  </div>
</template>
