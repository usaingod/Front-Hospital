import { api } from '@/services/api'
import type { ApiPatient } from '@/types/api'
import type { CreatePacienteDTO, Paciente, PacienteFilter } from '@/types/paciente'

const coverageLabel: Record<ApiPatient['coverage'], string> = {
  publica: 'Pública',
  prepaga: 'Prepaga',
  particular: 'Particular',
}

const coverageFromLabel = (value?: string): ApiPatient['coverage'] | undefined => {
  const normalized = (value || '').trim().toLowerCase()
  if (!normalized) return undefined
  if (normalized.includes('prepaga')) return 'prepaga'
  if (normalized.includes('public')) return 'publica'
  if (normalized.includes('particular')) return 'particular'
  if (normalized === 'publica' || normalized === 'prepaga' || normalized === 'particular') {
    return normalized
  }
  return undefined
}

export function mapPatient(p: ApiPatient): Paciente {
  return {
    id: p.id,
    nombre: p.firstName,
    apellido: p.lastName,
    dni: p.documentId,
    fechaNacimiento: p.birthDate ? String(p.birthDate).slice(0, 10) : '',
    telefono: p.phone || '',
    email: p.email || '',
    direccion: p.address || '',
    obraSocial: coverageLabel[p.coverage] || p.insurer || '',
    numeroAfiliado: p.affiliateNumber || '',
    observaciones: p.notes || '',
    estado: p.active ? 'activo' : 'inactivo',
    contactoEmergencia: p.emergencyContact || '',
    appointmentBalance: p.appointmentBalance,
    supplyBalance: p.supplyBalance,
  }
}

function toApiPayload(data: Partial<CreatePacienteDTO>) {
  const coverage = coverageFromLabel(data.obraSocial)
  return {
    firstName: data.nombre,
    lastName: data.apellido,
    documentId: data.dni,
    email: data.email || undefined,
    phone: data.telefono || undefined,
    birthDate: data.fechaNacimiento || undefined,
    address: data.direccion || undefined,
    insurer: data.obraSocial || undefined,
    affiliateNumber: data.numeroAfiliado || undefined,
    emergencyContact: undefined,
    notes: data.observaciones || undefined,
    coverage,
    copay: coverage === 'prepaga' ? 3000 : 0,
  }
}

export const pacientesService = {
  async getPacientes(filters?: PacienteFilter): Promise<Paciente[]> {
    const rows = (await api.get<ApiPatient[]>('/patients')).map(mapPatient)
    return rows.filter((p) => {
      const q = filters?.query?.trim().toLowerCase() || ''
      const matchesQuery =
        !q ||
        `${p.nombre} ${p.apellido}`.toLowerCase().includes(q) ||
        p.dni.includes(q) ||
        p.telefono.toLowerCase().includes(q)
      const matchesObra =
        !filters?.obraSocial || p.obraSocial === filters.obraSocial
      const matchesEstado = !filters?.estado || p.estado === filters.estado
      return matchesQuery && matchesObra && matchesEstado
    })
  },

  async getPacienteById(id: number | string): Promise<Paciente | null> {
    return mapPatient(await api.get<ApiPatient>(`/patients/${id}`))
  },

  async createPaciente(data: CreatePacienteDTO): Promise<Paciente | null> {
    return mapPatient(await api.post<ApiPatient>('/patients', toApiPayload(data)))
  },

  async updatePaciente(
    id: number | string,
    data: Partial<CreatePacienteDTO>,
  ): Promise<Paciente | null> {
    return mapPatient(
      await api.patch<ApiPatient>(`/patients/${id}`, toApiPayload(data)),
    )
  },

  async cancelarSaldoTotal(id: number | string): Promise<Paciente | null> {
    return mapPatient(await api.post<ApiPatient>(`/patients/${id}/pay`))
  },
}
