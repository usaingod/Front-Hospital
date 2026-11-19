import { ref, computed } from 'vue'
import type { Paciente } from '@/types/paciente'
import { pacientesService } from '@/services/pacientesService'
import { ApiError } from '@/services/api'

export function usePacientesListado() {
  const pacientes = ref<Paciente[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const searchQuery = ref('')
  const filterEstado = ref('')

  const loadPacientes = async (): Promise<Paciente[]> => {
    loading.value = true
    error.value = null
    try {
      const data = await pacientesService.getPacientes()
      pacientes.value = data
      return data
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No se pudieron cargar los pacientes'
      error.value = message
      return []
    } finally {
      loading.value = false
    }
  }

  const pacientesFiltrados = computed<Paciente[]>(() => {
    const q = searchQuery.value.trim().toLowerCase()
    const estado = filterEstado.value

    return pacientes.value.filter((p) => {
      const fullName = `${p.nombre} ${p.apellido}`.toLowerCase()
      const matchesQuery =
        !q ||
        fullName.includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        (p.telefono && p.telefono.toLowerCase().includes(q))

      const matchesEstado = !estado || p.estado === estado

      return matchesQuery && matchesEstado
    })
  })

  const resetFiltros = () => {
    searchQuery.value = ''
    filterEstado.value = ''
  }

  return {
    pacientes,
    loading,
    error,
    loadPacientes,
    searchQuery,
    filterEstado,
    pacientesFiltrados,
    resetFiltros,
  }
}
