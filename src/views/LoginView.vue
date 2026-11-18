<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ApiError } from '@/services/api'
import { homeForRole, toUiRole, useAuthStore } from '@/stores/auth'
import { useUiStore } from '@/stores/ui'

const router = useRouter()
const auth = useAuthStore()
const ui = useUiStore()

const email = ref('secretaria@turnos.local')
const password = ref('Secretaria123!')
const error = ref('')
const submitting = ref(false)

const demos = [
  { label: 'Secretaría', email: 'secretaria@turnos.local', password: 'Secretaria123!' },
  { label: 'Admin', email: 'admin@turnos.local', password: 'Admin123!' },
  { label: 'Médico', email: 'ana.perez@turnos.local', password: 'Medico123!' },
  { label: 'Enfermería', email: 'enfermero@turnos.local', password: 'Enfermero123!' },
]

const fillDemo = (demo: (typeof demos)[number]) => {
  email.value = demo.email
  password.value = demo.password
  error.value = ''
}

const submit = async () => {
  error.value = ''
  submitting.value = true
  try {
    const user = await auth.login(email.value.trim(), password.value)
    ui.setRole(toUiRole(user.role))
    await router.replace(homeForRole(user.role))
  } catch (err) {
    error.value =
      err instanceof ApiError ? err.message : 'No se pudo iniciar sesión'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card hospital-card">
      <div class="hospital-card-header">
        <div class="hospital-card-title">
          <i class="bi bi-hospital"></i>
          <span>Gestión Hospitalaria</span>
        </div>
      </div>
      <div class="hospital-card-body p-4">
        <p class="text-muted mb-4">
          Iniciá sesión con tu cuenta del hospital. Las rutas quedan protegidas por rol.
        </p>

        <form class="d-grid gap-3" @submit.prevent="submit">
          <div>
            <label class="form-label" for="login-email">Email</label>
            <input
              id="login-email"
              v-model="email"
              type="email"
              class="form-control"
              required
              autocomplete="username"
            />
          </div>
          <div>
            <label class="form-label" for="login-password">Contraseña</label>
            <input
              id="login-password"
              v-model="password"
              type="password"
              class="form-control"
              required
              autocomplete="current-password"
            />
          </div>

          <div v-if="error" class="alert alert-danger py-2 mb-0" role="alert">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn btn-success"
            :disabled="submitting || auth.loading"
          >
            {{ submitting ? 'Ingresando…' : 'Ingresar' }}
          </button>
        </form>

        <div class="mt-4">
          <div class="small text-muted mb-2">Cuentas demo del seed</div>
          <div class="d-flex flex-wrap gap-2">
            <button
              v-for="demo in demos"
              :key="demo.email"
              type="button"
              class="btn btn-sm btn-outline-secondary"
              @click="fillDemo(demo)"
            >
              {{ demo.label }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  background:
    radial-gradient(circle at top left, rgba(25, 135, 84, 0.12), transparent 40%),
    linear-gradient(180deg, #f7faf8 0%, #eef3f0 100%);
}

.login-card {
  width: min(440px, 100%);
  margin: 0;
}
</style>
