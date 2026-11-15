import { api } from '@/services/api'
import type { ApiUser } from '@/types/api'
import type { CreateUsuarioDTO, Usuario, UsuarioFilter } from '@/types/usuario'

const roleToUi: Record<ApiUser['role'], Usuario['rol']> = {
  admin: 'Administrador',
  secretaria: 'Secretaria',
  profesional: 'Profesional',
  enfermero: 'Enfermero',
}

const roleFromUi: Record<Usuario['rol'], ApiUser['role']> = {
  Administrador: 'admin',
  Secretaria: 'secretaria',
  Profesional: 'profesional',
  Enfermero: 'enfermero',
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/)
  return {
    nombre: parts[0] || name,
    apellido: parts.slice(1).join(' '),
  }
}

function mapUser(u: ApiUser): Usuario {
  const { nombre, apellido } = splitName(u.name)
  return {
    id: u.id,
    nombre,
    apellido,
    email: u.email,
    rol: roleToUi[u.role],
    estado: u.active ? 'activo' : 'inactivo',
    fechaRegistro: u.createdAt,
  }
}

export const usuariosService = {
  async getUsuarios(filters?: UsuarioFilter): Promise<Usuario[]> {
    const rows = (await api.get<ApiUser[]>('/users')).map(mapUser)
    return rows.filter((item) => {
      const q = filters?.query?.trim().toLowerCase() || ''
      const matchesQuery =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        item.apellido.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q)
      const matchesRol = !filters?.rol || item.rol === filters.rol
      const matchesEstado = !filters?.estado || item.estado === filters.estado
      return matchesQuery && matchesRol && matchesEstado
    })
  },

  async getUsuarioById(id: number | string): Promise<Usuario | null> {
    const rows = await this.getUsuarios()
    return rows.find((u) => String(u.id) === String(id)) || null
  },

  async createUsuario(data: CreateUsuarioDTO): Promise<Usuario | null> {
    return mapUser(
      await api.post<ApiUser>('/users', {
        email: data.email,
        password: data.password,
        name: `${data.nombre} ${data.apellido}`.trim(),
        role: roleFromUi[data.rol],
        active: data.estado !== 'inactivo',
      }),
    )
  },

  async updateUsuario(
    id: number | string,
    data: Partial<CreateUsuarioDTO>,
  ): Promise<Usuario | null> {
    return mapUser(
      await api.patch<ApiUser>(`/users/${id}`, {
        email: data.email,
        password: data.password || undefined,
        name:
          data.nombre || data.apellido
            ? `${data.nombre || ''} ${data.apellido || ''}`.trim()
            : undefined,
        role: data.rol ? roleFromUi[data.rol] : undefined,
        active:
          data.estado === undefined ? undefined : data.estado !== 'inactivo',
      }),
    )
  },

  async deleteUsuario(id: number | string): Promise<boolean> {
    await api.patch(`/users/${id}`, { active: false })
    return true
  },
}
