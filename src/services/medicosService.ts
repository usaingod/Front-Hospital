import { api } from '@/services/api'
import type {
  ApiAvailability,
  ApiBranch,
  ApiProfessional,
  ApiSpecialty,
} from '@/types/api'
import type {
  CreateHorarioDTO,
  CreateMedicoDTO,
  HorarioAtencion,
  Medico,
  MedicoFilter,
} from '@/types/medico'

const WEEKDAYS = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
]

const weekdayFromLabel = (label: string) => {
  const idx = WEEKDAYS.findIndex(
    (d) => d.toLowerCase() === label.trim().toLowerCase(),
  )
  return idx >= 0 ? idx : 1
}

const modalityToUi = (
  m: ApiAvailability['modality'],
): HorarioAtencion['modalidad'] => {
  if (m === 'telemedicina') return 'Telemedicina'
  if (m === 'mixta') return 'Mixta'
  return 'Presencial'
}

const modalityFromUi = (
  m: HorarioAtencion['modalidad'] | CreateHorarioDTO['modalidad'],
): ApiAvailability['modality'] => {
  if (m === 'Telemedicina') return 'telemedicina'
  if (m === 'Mixta') return 'mixta'
  return 'presencial'
}

const statusToUi = (
  s: ApiAvailability['status'],
): HorarioAtencion['estado'] => {
  if (s === 'suspendido') return 'Suspendido'
  if (s === 'licencia') return 'Licencia'
  return 'Activo'
}

function mapProfessional(
  p: ApiProfessional,
  specialties: Map<string, ApiSpecialty>,
): Medico {
  const specialtyName =
    (p.specialtyIds || [])
      .map((id) => specialties.get(id)?.name)
      .filter(Boolean)
      .join(', ') || 'Sin especialidad'
  return {
    id: p.id,
    nombre: p.firstName,
    apellido: p.lastName,
    especialidad: specialtyName,
    matricula: p.licenseNumber || '—',
    telefono: p.phone || undefined,
    email: p.email || undefined,
    consultorio: p.office || undefined,
    direccionConsultorio: p.office || undefined,
    observaciones: p.notes || undefined,
    estado: p.status,
  }
}

function mapAvailability(a: ApiAvailability): HorarioAtencion {
  return {
    id: a.id,
    diaSemana: WEEKDAYS[a.weekday] || String(a.weekday),
    horaInicio: a.startTime,
    horaFin: a.endTime,
    consultorio: a.room || '',
    modalidad: modalityToUi(a.modality),
    estado: statusToUi(a.status),
  }
}

async function specialtyMap() {
  const specialties = await api.get<ApiSpecialty[]>('/specialties')
  return new Map(specialties.map((s) => [s.id, s]))
}

async function defaultBranchId() {
  const branches = await api.get<ApiBranch[]>('/branches')
  const central = branches.find((b) =>
    b.name.toLowerCase().includes('central'),
  )
  const branchId = central?.id || branches[0]?.id
  if (!branchId) throw new Error('No hay sedes configuradas')
  return branchId
}

export const medicosService = {
  async getMedicos(filters?: MedicoFilter): Promise<Medico[]> {
    const [professionals, specialties] = await Promise.all([
      api.get<ApiProfessional[]>('/professionals'),
      specialtyMap(),
    ])
    return professionals
      .map((p) => mapProfessional(p, specialties))
      .filter((m) => {
        const q = filters?.query?.trim().toLowerCase() || ''
        const matchesQuery =
          !q ||
          m.nombre.toLowerCase().includes(q) ||
          (m.apellido || '').toLowerCase().includes(q) ||
          m.matricula.toLowerCase().includes(q)
        const matchesEsp =
          !filters?.especialidad || m.especialidad === filters.especialidad
        const matchesEstado = !filters?.estado || m.estado === filters.estado
        return matchesQuery && matchesEsp && matchesEstado
      })
  },

  async getMedicoById(id: number | string): Promise<Medico | null> {
    const specialties = await specialtyMap()
    return mapProfessional(
      await api.get<ApiProfessional>(`/professionals/${id}`),
      specialties,
    )
  },

  async createMedico(data: CreateMedicoDTO): Promise<Medico | null> {
    const specialties = await specialtyMap()
    const specialty = [...specialties.values()].find(
      (s) => s.name === data.especialidad,
    )
    const branchId = await defaultBranchId()
    const created = await api.post<ApiProfessional>('/professionals', {
      firstName: data.nombre,
      lastName: data.apellido || data.nombre,
      specialtyIds: specialty ? [specialty.id] : [],
      branchIds: [branchId],
      licenseNumber: data.matricula || undefined,
      phone: data.telefono || undefined,
      email: data.email || undefined,
      office: data.direccionConsultorio || undefined,
      notes: data.observaciones || undefined,
      status: data.estado,
    })
    return mapProfessional(created, specialties)
  },

  async updateMedico(
    id: number | string,
    data: Partial<CreateMedicoDTO>,
  ): Promise<Medico | null> {
    const specialties = await specialtyMap()
    const specialty = data.especialidad
      ? [...specialties.values()].find((s) => s.name === data.especialidad)
      : undefined
    const updated = await api.patch<ApiProfessional>(`/professionals/${id}`, {
      firstName: data.nombre,
      lastName: data.apellido,
      specialtyIds: specialty ? [specialty.id] : undefined,
      licenseNumber: data.matricula,
      phone: data.telefono,
      email: data.email,
      office: data.direccionConsultorio,
      notes: data.observaciones,
      status: data.estado,
    })
    return mapProfessional(updated, specialties)
  },

  async deleteMedico(id: number | string): Promise<boolean> {
    await api.patch(`/professionals/${id}`, { status: 'inactivo' })
    return true
  },

  async getEspecialidades(): Promise<string[]> {
    return (await api.get<ApiSpecialty[]>('/specialties')).map((s) => s.name)
  },

  async getHorariosByMedicoId(medicoId: number | string): Promise<HorarioAtencion[]> {
    const rows = await api.get<ApiAvailability[]>(
      `/availability?professionalId=${medicoId}`,
    )
    return rows
      .filter((r) => r.professionalId === String(medicoId))
      .map(mapAvailability)
  },

  async addHorario(
    medicoId: number | string,
    data: CreateHorarioDTO,
  ): Promise<HorarioAtencion | null> {
    const branchId = await defaultBranchId()
    const created = await api.post<ApiAvailability>('/availability', {
      professionalId: String(medicoId),
      branchId,
      weekday: weekdayFromLabel(data.diaSemana),
      startTime: data.horaInicio,
      endTime: data.horaFin,
      slotMinutes: 30,
      room: data.consultorio || undefined,
      modality: modalityFromUi(data.modalidad),
      status: data.estado === 'Suspendido' ? 'suspendido' : 'activo',
    })
    return mapAvailability(created)
  },
}
