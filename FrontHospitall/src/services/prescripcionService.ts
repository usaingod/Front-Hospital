/**
 * Servicio de Prescripciones Médicas e Insumos (Supply)
 * Preparado para la futura integración con la API REST del backend (NestJS).
 * En esta etapa NO realiza peticiones HTTP.
 *
 * Permisos (a verificar en el backend):
 *   - Admin y Profesional (Médico) pueden crear prescripciones.
 *   - Enfermería puede consultar prescripciones y registrar administraciones
 *     según las operaciones habilitadas por los guards de la API.
 */
import type { Supply, Prescripcion, CreatePrescripcionDTO } from '@/types/prescripcion'

// Futuros endpoints (a verificar en el backend)
// const SUPPLY_URL = '/api/supplies'
// const PRESCRIPCION_URL = '/api/prescripciones'

export const supplyService = {
  /**
   * Obtener el catálogo de insumos/medicamentos.
   * Futuro: GET /api/supplies
   * Basado en el modelo Supply del schema.prisma.
   */
  async getAll(): Promise<Supply[]> {
    // TODO: return (await axios.get<Supply[]>(SUPPLY_URL)).data
    return []
  },
}

export const prescripcionService = {
  /**
   * Obtener prescripciones de un paciente internado.
   * Futuro: GET /api/prescripciones?pacienteId=...
   */
  async getByPacienteId(_pacienteId: string): Promise<Prescripcion[]> {
    // TODO: return (await axios.get<Prescripcion[]>(`${PRESCRIPCION_URL}?pacienteId=${_pacienteId}`)).data
    return []
  },

  /**
   * Crear una nueva prescripción médica.
   * Solo permitido para Admin y Profesional (Médico) según los guards del backend.
   * Futuro: POST /api/prescripciones
   *
   * DTO verificado:
   *   - supplyId: string (UUID del medicamento)
   *   - dosis: string
   *   - cadaHoras: number
   */
  async create(_pacienteId: string, _dto: CreatePrescripcionDTO): Promise<Prescripcion | null> {
    // TODO: return (await axios.post<Prescripcion>(PRESCRIPCION_URL, { pacienteId: _pacienteId, ..._dto })).data
    return null
  },
}
