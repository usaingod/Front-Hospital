import { api } from '@/services/api'
import type { ApiAdmission, ApiVitalSign } from '@/types/api'
import type {
  CreateSignosVitalesDTO,
  SignosVitales,
} from '@/types/signosVitales'

function mapVital(v: ApiVitalSign): SignosVitales {
  return {
    id: v.id,
    pacienteId: v.patientId,
    internacionId: v.admissionId,
    fechaHora: v.createdAt,
    temperatura: v.temperatura,
    frecuenciaCardiaca: v.frecuenciaCardiaca,
    presionSistolica: v.sistolica,
    presionDiastolica: v.diastolica,
    fueraDeRango: v.fueraDeRango,
    observaciones: v.notes || undefined,
  }
}

export const signosVitalesService = {
  async getByPacienteId(pacienteId: string): Promise<SignosVitales[]> {
    return (await api.get<ApiVitalSign[]>(`/patients/${pacienteId}/vitals`)).map(
      mapVital,
    )
  },

  async getByInternacionId(internacionId: string): Promise<SignosVitales[]> {
    return (
      await api.get<ApiVitalSign[]>(`/admissions/${internacionId}/vitals`)
    ).map(mapVital)
  },

  async create(dto: CreateSignosVitalesDTO): Promise<SignosVitales | null> {
    let admissionId = dto.internacionId
    if (!admissionId) {
      const stay = await api.get<ApiAdmission | null>(
        `/admissions/by-patient/${dto.pacienteId}`,
      )
      if (!stay?.id) {
        throw new Error('El paciente no tiene una internación activa')
      }
      admissionId = stay.id
    }
    const created = await api.post<ApiVitalSign>(
      `/admissions/${admissionId}/vitals`,
      {
        sistolica: dto.presionSistolica,
        diastolica: dto.presionDiastolica,
        frecuenciaCardiaca: dto.frecuenciaCardiaca,
        temperatura: dto.temperatura,
        notes: dto.observaciones,
      },
    )
    return mapVital(created)
  },
}
