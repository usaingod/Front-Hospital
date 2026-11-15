import { api } from '@/services/api'
import type { ApiPrescription, ApiSupply } from '@/types/api'
import type {
  CreatePrescripcionDTO,
  Prescripcion,
  Supply,
} from '@/types/prescripcion'

function mapSupply(s: ApiSupply): Supply {
  return {
    id: s.id,
    name: s.name,
    stock: s.stock,
    price: s.price,
  }
}

function mapPrescription(
  p: ApiPrescription,
  supplies: Map<string, ApiSupply>,
): Prescripcion {
  return {
    id: p.id,
    pacienteId: p.patientId,
    supplyId: p.supplyId,
    supplyName: supplies.get(p.supplyId)?.name,
    dosis: p.dosis,
    cadaHoras: p.cadaHoras,
    estado: 'activa',
    creadoEn: p.createdAt,
  }
}

export const supplyService = {
  async getAll(): Promise<Supply[]> {
    return (await api.get<ApiSupply[]>('/supplies')).map(mapSupply)
  },
}

export const prescripcionService = {
  async getByPacienteId(pacienteId: string): Promise<Prescripcion[]> {
    const [rows, supplies] = await Promise.all([
      api.get<ApiPrescription[]>(`/patients/${pacienteId}/prescriptions`),
      api.get<ApiSupply[]>('/supplies'),
    ])
    const supplyMap = new Map(supplies.map((s) => [s.id, s]))
    return rows.map((row) => mapPrescription(row, supplyMap))
  },

  async create(
    pacienteId: string,
    dto: CreatePrescripcionDTO,
  ): Promise<Prescripcion | null> {
    const created = await api.post<ApiPrescription>(
      `/patients/${pacienteId}/prescriptions`,
      dto,
    )
    const supplies = new Map(
      (await api.get<ApiSupply[]>('/supplies')).map((s) => [s.id, s]),
    )
    return mapPrescription(created, supplies)
  },

  async administrarDosis(input: {
    admissionId: string
    indicacionId: string
    horaIndicada: string
    administradaEn: string
  }) {
    return api.post(`/admissions/${input.admissionId}/doses`, {
      indicacionId: input.indicacionId,
      horaIndicada: input.horaIndicada,
      administradaEn: input.administradaEn,
    })
  },
}
