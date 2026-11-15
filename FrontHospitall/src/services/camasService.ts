import { api } from '@/services/api'
import type { ApiAdmission, ApiBed, ApiPatient, ApiWing } from '@/types/api'
import type {
  Ala,
  Cama,
  CreateAlaDTO,
  CreateCamaDTO,
  CreateInternacionDTO,
  Internacion,
  UpdateCamaDTO,
} from '@/types/internacion'
import { mapPatient } from '@/services/pacientesService'

function mapWing(w: ApiWing): Ala {
  return {
    id: w.id,
    nombre: w.name,
    descripcion: w.description || undefined,
  }
}

function mapBed(
  bed: ApiBed,
  wings: Map<string, ApiWing>,
  stayByBed: Map<string, ApiAdmission>,
  patients: Map<string, ApiPatient>,
): Cama {
  const wing = wings.get(bed.wingId)
  const stay = stayByBed.get(bed.id)
  const patient = stay ? patients.get(stay.patientId) : undefined
  return {
    id: bed.id,
    numero: bed.number,
    sala: bed.sala || wing?.name || '',
    ala: wing?.name,
    alaId: bed.wingId,
    habitacion: bed.habitacion || undefined,
    estado: bed.status,
    pacienteId: stay?.patientId,
    pacienteNombre: patient
      ? `${patient.lastName}, ${patient.firstName}`
      : undefined,
    pacienteDni: patient?.documentId,
    internacionId: stay?.id,
  }
}

function mapAdmission(
  stay: ApiAdmission,
  beds: Map<string, ApiBed>,
  patients: Map<string, ApiPatient>,
  professionals: Map<string, string>,
): Internacion {
  const bed = beds.get(stay.bedId)
  const patient = patients.get(stay.patientId)
  return {
    id: stay.id,
    pacienteId: stay.patientId,
    pacienteNombre: patient
      ? `${patient.lastName}, ${patient.firstName}`
      : undefined,
    pacienteDni: patient?.documentId,
    camaId: stay.bedId,
    sala: bed?.sala || '',
    habitacion: bed?.habitacion || undefined,
    numeroCama: bed?.number || '',
    fechaIngreso: stay.admittedAt,
    diagnostico: stay.diagnosis || stay.reason || undefined,
    motivo: stay.reason || undefined,
    protocolTasks: stay.protocolTasks || [],
    medicoTratanteId: stay.treatingProfessionalId || undefined,
    medicoTratanteNombre: stay.treatingProfessionalId
      ? professionals.get(stay.treatingProfessionalId)
      : undefined,
    estado: stay.dischargedAt ? 'alta' : 'activo',
    observaciones: stay.notes || undefined,
  }
}

async function loadMaps() {
  const [beds, wings, stays, patients, professionals] = await Promise.all([
    api.get<ApiBed[]>('/beds'),
    api.get<ApiWing[]>('/wings'),
    api.get<ApiAdmission[]>('/admissions'),
    api.get<ApiPatient[]>('/patients'),
    api.get<{ id: string; firstName: string; lastName: string }[]>(
      '/professionals',
    ),
  ])
  return {
    beds,
    wings: new Map(wings.map((w) => [w.id, w])),
    stays,
    stayByBed: new Map(stays.map((s) => [s.bedId, s])),
    patients: new Map(patients.map((p) => [p.id, p])),
    professionals: new Map(
      professionals.map((p) => [p.id, `${p.lastName}, ${p.firstName}`]),
    ),
    bedsById: new Map(beds.map((b) => [b.id, b])),
  }
}

export const camasService = {
  async getAll(): Promise<Cama[]> {
    const maps = await loadMaps()
    return maps.beds.map((bed) =>
      mapBed(bed, maps.wings, maps.stayByBed, maps.patients),
    )
  },

  async getFiltered(estado?: string, sala?: string, ala?: string): Promise<Cama[]> {
    const rows = await this.getAll()
    return rows.filter((c) => {
      const matchesEstado = !estado || c.estado === estado
      const matchesSala = !sala || c.sala === sala
      const matchesAla = !ala || c.ala === ala || c.sala === ala
      return matchesEstado && matchesSala && matchesAla
    })
  },

  async create(dto: CreateCamaDTO): Promise<Cama | null> {
    const wingId =
      dto.alaId ||
      (await api.get<ApiWing[]>('/wings')).find((w) => w.name === dto.ala)?.id
    if (!wingId) throw new Error('Seleccioná un ala válida')
    const created = await api.post<ApiBed>('/beds', {
      wingId,
      sala: dto.sala,
    })
    const wings = new Map(
      (await api.get<ApiWing[]>('/wings')).map((w) => [w.id, w]),
    )
    return mapBed(created, wings, new Map(), new Map())
  },

  async update(id: string, dto: UpdateCamaDTO): Promise<Cama | null> {
    const updated = await api.patch<ApiBed>(`/beds/${id}`, {
      wingId: dto.alaId,
      sala: dto.sala || dto.ala,
    })
    if (dto.estado && dto.estado !== 'ocupada') {
      await api.patch(`/beds/${id}/status`, { status: dto.estado })
    }
    const wings = new Map(
      (await api.get<ApiWing[]>('/wings')).map((w) => [w.id, w]),
    )
    return mapBed(updated, wings, new Map(), new Map())
  },

  async delete(id: string): Promise<boolean> {
    await api.delete(`/beds/${id}`)
    return true
  },
}

export const alasService = {
  async getAll(): Promise<Ala[]> {
    return (await api.get<ApiWing[]>('/wings')).map(mapWing)
  },

  async create(dto: CreateAlaDTO): Promise<Ala | null> {
    const wings = await api.get<ApiWing[]>('/wings')
    const nextCode =
      wings.reduce((max, wing) => Math.max(max, wing.code), 0) + 1
    if (nextCode > 9) throw new Error('Solo se admiten códigos de ala del 1 al 9')
    return mapWing(
      await api.post<ApiWing>('/wings', {
        name: dto.nombre,
        code: nextCode,
        description: dto.descripcion,
      }),
    )
  },
}

export const internacionService = {
  async getAll(): Promise<Internacion[]> {
    const maps = await loadMaps()
    return maps.stays.map((stay) =>
      mapAdmission(stay, maps.bedsById, maps.patients, maps.professionals),
    )
  },

  async getByPacienteId(pacienteId: string): Promise<Internacion | null> {
    const stay = await api.get<ApiAdmission | null>(
      `/admissions/by-patient/${pacienteId}`,
    )
    if (!stay) return null
    const maps = await loadMaps()
    return mapAdmission(stay, maps.bedsById, maps.patients, maps.professionals)
  },

  async create(dto: CreateInternacionDTO): Promise<Internacion | null> {
    const created = await api.post<ApiAdmission>('/admissions', {
      patientId: dto.pacienteId,
      bedId: dto.camaId,
      diagnosis: dto.diagnostico || undefined,
      treatingProfessionalId: dto.medicoTratanteId || undefined,
      notes: dto.observaciones,
      reason: dto.motivo || undefined,
    })
    const maps = await loadMaps()
    return mapAdmission(created, maps.bedsById, maps.patients, maps.professionals)
  },

  async discharge(id: string): Promise<Internacion | null> {
    const stay = await api.post<ApiAdmission>(`/admissions/${id}/discharge`)
    const maps = await loadMaps()
    return mapAdmission(stay, maps.bedsById, maps.patients, maps.professionals)
  },

  async asignarCama(camaId: string, pacienteId: string): Promise<boolean> {
    await this.create({
      pacienteId,
      camaId,
      fechaIngreso: new Date().toISOString(),
    })
    return true
  },

  async pacientesInternados() {
    const stays = await this.getAll()
    const patients = await Promise.all(
      stays.map(async (stay) => {
        const patient = await api.get<ApiPatient>(`/patients/${stay.pacienteId}`)
        return mapPatient(patient)
      }),
    )
    return { stays, patients }
  },
}
