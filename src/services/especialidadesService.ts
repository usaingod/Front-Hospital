import { api } from '@/services/api'
import type { ApiProfessional, ApiSpecialty } from '@/types/api'
import type {
  CreateEspecialidadDTO,
  Especialidad,
  EspecialidadFilter,
} from '@/types/especialidad'

function mapSpecialty(
  s: ApiSpecialty,
  doctorsCount = 0,
): Especialidad {
  return {
    id: s.id,
    nombre: s.name,
    descripcion: s.description || '',
    icono: s.icon || 'bi-award',
    cantidadMedicos: doctorsCount,
    estado: s.active ? 'activa' : 'inactiva',
  }
}

export const especialidadesService = {
  async getEspecialidades(filters?: EspecialidadFilter): Promise<Especialidad[]> {
    const [specialties, professionals] = await Promise.all([
      api.get<ApiSpecialty[]>('/specialties'),
      api.get<ApiProfessional[]>('/professionals'),
    ])
    const counts = new Map<string, number>()
    for (const p of professionals) {
      for (const sid of p.specialtyIds || []) {
        counts.set(sid, (counts.get(sid) || 0) + 1)
      }
    }
    return specialties
      .map((s) => mapSpecialty(s, counts.get(s.id) || 0))
      .filter((item) => {
        const q = filters?.query?.trim().toLowerCase() || ''
        const matchesQuery =
          !q ||
          item.nombre.toLowerCase().includes(q) ||
          item.descripcion.toLowerCase().includes(q)
        const matchesEstado = !filters?.estado || item.estado === filters.estado
        return matchesQuery && matchesEstado
      })
  },

  async getEspecialidadById(id: number | string): Promise<Especialidad | null> {
    return mapSpecialty(await api.get<ApiSpecialty>(`/specialties/${id}`))
  },

  async createEspecialidad(data: CreateEspecialidadDTO): Promise<Especialidad | null> {
    return mapSpecialty(
      await api.post<ApiSpecialty>('/specialties', {
        name: data.nombre,
        description: data.descripcion,
        icon: data.icono,
        active: data.estado !== 'inactiva',
      }),
    )
  },

  async updateEspecialidad(
    id: number | string,
    data: Partial<CreateEspecialidadDTO>,
  ): Promise<Especialidad | null> {
    return mapSpecialty(
      await api.patch<ApiSpecialty>(`/specialties/${id}`, {
        name: data.nombre,
        description: data.descripcion,
        icon: data.icono,
        active:
          data.estado === undefined ? undefined : data.estado !== 'inactiva',
      }),
    )
  },

  async deleteEspecialidad(id: number | string): Promise<boolean> {
    await api.delete(`/specialties/${id}`)
    return true
  },
}
