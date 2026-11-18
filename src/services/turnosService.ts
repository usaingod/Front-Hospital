import { api } from '@/services/api'
import type {
  ApiAppointment,
  ApiAppointmentStatus,
  ApiBranch,
  ApiPatient,
  ApiProfessional,
  ApiSpecialty,
} from '@/types/api'
import type {
  CreateTurnoDTO,
  Turno,
  TurnoEstado,
  TurnoFilter,
  WaitlistItem,
} from '@/types/turno'
import { clinicDateTimeToIso, clinicPartsFromIso } from '@/utils/dateLocal'

type ApiBookingResult =
  | { result: 'programado'; appointment: ApiAppointment }
  | { result: 'lista_de_espera'; waitlist: { id: string } }

const statusToUi = (status: ApiAppointmentStatus): TurnoEstado => {
  if (status === 'atendido') return 'atendido'
  if (status === 'cancelado') return 'cancelado'
  if (status === 'en_sala_de_espera') return 'confirmado'
  return 'pendiente'
}

/** Prefiere la sede del profesional; si no, "Sede Central"; si no, la primera. */
function resolveBranchId(
  branches: ApiBranch[],
  preferredIds?: string[] | null,
): string | undefined {
  if (!branches.length) return undefined
  if (preferredIds?.length) {
    const match = preferredIds.find((id) => branches.some((b) => b.id === id))
    if (match) return match
  }
  const central = branches.find((b) =>
    b.name.toLowerCase().includes('central'),
  )
  return central?.id || branches[0]?.id
}

function mapTurno(
  a: ApiAppointment,
  patients: Map<string, ApiPatient>,
  professionals: Map<string, ApiProfessional>,
  specialties: Map<string, ApiSpecialty>,
): Turno {
  const patient = patients.get(a.patientId)
  const professional = professionals.get(a.professionalId)
  const specialtyName =
    (professional?.specialtyIds || [])
      .map((id) => specialties.get(id)?.name)
      .filter(Boolean)
      .join(', ') || '—'
  const { fecha, hora } = clinicPartsFromIso(a.startAt)
  return {
    id: a.id,
    fecha,
    hora,
    paciente: patient
      ? `${patient.lastName}, ${patient.firstName}`
      : a.patientId,
    pacienteDni: patient?.documentId,
    pacienteId: a.patientId,
    especialidad: specialtyName,
    medico: professional
      ? `${professional.lastName}, ${professional.firstName}`
      : a.professionalId,
    medicoId: a.professionalId,
    estado: statusToUi(a.status),
    observaciones: a.notes || undefined,
    startAt: a.startAt,
    endAt: a.endAt,
    branchId: a.branchId,
    statusApi: a.status,
  }
}

async function loadMaps() {
  const [appointments, patients, professionals, specialties, branches] =
    await Promise.all([
      api.get<ApiAppointment[]>('/appointments'),
      api.get<ApiPatient[]>('/patients'),
      api.get<ApiProfessional[]>('/professionals'),
      api.get<ApiSpecialty[]>('/specialties'),
      api.get<ApiBranch[]>('/branches'),
    ])
  return {
    appointments,
    patients: new Map(patients.map((p) => [p.id, p])),
    professionals: new Map(professionals.map((p) => [p.id, p])),
    specialties: new Map(specialties.map((s) => [s.id, s])),
    branches,
  }
}

function matchesFranja(hora: string, franja?: TurnoFilter['franjaHoraria']) {
  if (!franja || franja === 'todos') return true
  if (franja === 'manana') return hora <= '12:30'
  if (franja === 'tarde') return hora >= '13:00' && hora <= '17:30'
  return hora >= '18:00'
}

export const turnosService = {
  async getTurnos(filters?: TurnoFilter): Promise<Turno[]> {
    const maps = await loadMaps()
    return maps.appointments
      .map((a) =>
        mapTurno(a, maps.patients, maps.professionals, maps.specialties),
      )
      .filter((t) => {
        const matchesFecha = !filters?.fecha || t.fecha === filters.fecha
        const matchesEsp =
          !filters?.especialidad || t.especialidad.includes(filters.especialidad)
        const matchesMedico =
          !filters?.medico ||
          t.medico.toLowerCase().includes(filters.medico.toLowerCase()) ||
          String(t.medicoId) === filters.medico
        const matchesPaciente =
          !filters?.paciente ||
          t.paciente.toLowerCase().includes(filters.paciente.toLowerCase()) ||
          (t.pacienteDni || '').includes(filters.paciente)
        const matchesFranjaOk = matchesFranja(t.hora, filters?.franjaHoraria)
        return (
          matchesFecha &&
          matchesEsp &&
          matchesMedico &&
          matchesPaciente &&
          matchesFranjaOk
        )
      })
      .sort((a, b) => String(a.startAt).localeCompare(String(b.startAt)))
  },

  async createTurno(data: CreateTurnoDTO): Promise<Turno | null> {
    const maps = await loadMaps()

    let patientId = data.pacienteId
    if (!patientId && data.tipoPaciente === 'nuevo' && data.nuevoPaciente) {
      const created = await api.post<ApiPatient>('/patients', {
        firstName: data.nuevoPaciente.nombre,
        lastName: data.nuevoPaciente.apellido,
        documentId: data.nuevoPaciente.dni,
        phone: data.nuevoPaciente.telefono || undefined,
        email: data.nuevoPaciente.email || undefined,
        insurer: data.nuevoPaciente.obraSocial || undefined,
      })
      patientId = created.id
    }
    if (!patientId && data.pacienteBusqueda) {
      const q = data.pacienteBusqueda.trim().toLowerCase()
      const found = [...maps.patients.values()].find(
        (p) =>
          p.documentId.includes(q) ||
          `${p.lastName} ${p.firstName}`.toLowerCase().includes(q),
      )
      patientId = found?.id
    }
    if (!patientId) throw new Error('Seleccioná o creá un paciente')

    const professionalId = data.medicoId || data.medico
    if (!professionalId) throw new Error('Seleccioná un médico')

    const professional = maps.professionals.get(String(professionalId))
    const branchId = resolveBranchId(maps.branches, professional?.branchIds)
    if (!branchId) throw new Error('No hay sedes configuradas')

    const startAt = clinicDateTimeToIso(data.fecha, data.hora)
    const durationMin = data.entreturno ? 15 : 30
    const endAt = new Date(
      new Date(startAt).getTime() + durationMin * 60 * 1000,
    ).toISOString()
    const booking = await api.post<ApiBookingResult>('/appointments', {
      patientId,
      professionalId,
      branchId,
      startAt,
      endAt,
      notes: data.observaciones,
      entreturno: data.entreturno || undefined,
    })

    if (booking.result === 'lista_de_espera') {
      throw new Error(
        'Ese horario ya está ocupado. El paciente quedó en lista de espera.',
      )
    }

    const refreshed = await loadMaps()
    return mapTurno(
      booking.appointment,
      refreshed.patients,
      refreshed.professionals,
      refreshed.specialties,
    )
  },

  async updateStatus(
    id: number | string,
    status: ApiAppointmentStatus,
  ): Promise<Turno | null> {
    const updated = await api.patch<ApiAppointment>(`/appointments/${id}`, {
      status,
    })
    const maps = await loadMaps()
    return mapTurno(
      updated,
      maps.patients,
      maps.professionals,
      maps.specialties,
    )
  },

  async cancelTurno(id: number | string): Promise<boolean> {
    await api.post(`/appointments/${id}/cancel`)
    return true
  },

  async getWaitlist(day?: string): Promise<WaitlistItem[]> {
    const qs = day ? `?day=${encodeURIComponent(day)}` : ''
    const [rows, patients, professionals] = await Promise.all([
      api.get<
        Array<{
          id: string
          patientId: string
          professionalId: string
          branchId: string
          day: string
          createdAt: string
        }>
      >(`/appointments/waitlist${qs}`),
      api.get<ApiPatient[]>('/patients'),
      api.get<ApiProfessional[]>('/professionals'),
    ])
    const byPatient = new Map(patients.map((p) => [p.id, p]))
    const byDoc = new Map(professionals.map((p) => [p.id, p]))
    return rows.map((r) => {
      const patient = byPatient.get(r.patientId)
      const professional = byDoc.get(r.professionalId)
      return {
        ...r,
        pacienteNombre: patient
          ? `${patient.lastName}, ${patient.firstName}`
          : r.patientId,
        pacienteDni: patient?.documentId,
        medicoNombre: professional
          ? `${professional.lastName}, ${professional.firstName}`
          : r.professionalId,
      }
    })
  },

  async getBranchId(): Promise<string> {
    const branches = await api.get<ApiBranch[]>('/branches')
    const branchId = resolveBranchId(branches)
    if (!branchId) throw new Error('No hay sedes configuradas')
    return branchId
  },
}
