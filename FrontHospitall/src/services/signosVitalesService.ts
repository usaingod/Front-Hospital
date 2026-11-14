/**
 * Servicio de Signos Vitales
 * Preparado para la futura integración con la API REST del backend (NestJS).
 * En esta etapa NO realiza peticiones HTTP.
 * Verificar los endpoints y DTO reales antes de conectar.
 */
import type { SignosVitales, CreateSignosVitalesDTO } from '@/types/signosVitales'

// Futuro endpoint base (a verificar en el backend)
// const BASE_URL = '/api/signos-vitales'

export const signosVitalesService = {
  /**
   * Obtener historial de signos vitales de un paciente.
   * Futuro: GET /api/signos-vitales?pacienteId=...
   */
  async getByPacienteId(_pacienteId: string): Promise<SignosVitales[]> {
    // TODO: return (await axios.get<SignosVitales[]>(`${BASE_URL}?pacienteId=${_pacienteId}`)).data
    return []
  },

  /**
   * Registrar nuevos signos vitales.
   * Futuro: POST /api/signos-vitales
   * Verificar el DTO real del backend (campos, validaciones y permisos) antes de implementar.
   */
  async create(_dto: CreateSignosVitalesDTO): Promise<SignosVitales | null> {
    // TODO: return (await axios.post<SignosVitales>(BASE_URL, _dto)).data
    return null
  },
}
