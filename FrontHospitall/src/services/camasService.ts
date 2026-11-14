/**
 * Servicio de Camas, Alas e Internación
 * Preparado para la futura integración con la API REST del backend (NestJS).
 * En esta etapa NO realiza peticiones HTTP.
 * Verificar los endpoints reales antes de conectar.
 */
import type {
  Cama,
  Ala,
  CreateAlaDTO,
  CreateCamaDTO,
  UpdateCamaDTO,
  Internacion,
  CreateInternacionDTO,
} from '@/types/internacion'

// Futuros endpoints base (a verificar en el backend)
// const BASE_URL = '/api/camas'
// const ALAS_URL = '/api/alas'
// const INTERNACION_URL = '/api/internacion'

export const camasService = {
  /**
   * Obtener todas las camas del hospital.
   * Futuro: GET /api/camas
   */
  async getAll(): Promise<Cama[]> {
    // TODO: return (await axios.get<Cama[]>(BASE_URL)).data
    return []
  },

  /**
   * Obtener camas filtradas por estado, sala o ala.
   * Futuro: GET /api/camas?estado=...&sala=...&ala=...
   */
  async getFiltered(_estado?: string, _sala?: string, _ala?: string): Promise<Cama[]> {
    // TODO: implementar cuando se conecte el backend
    return []
  },

  /**
   * Crear una nueva cama en el backend.
   * La lógica de numeración (primer dígito para el ala y dos siguientes secuenciales)
   * es ejecutada por el backend considerando concurrencia.
   * Futuro: POST /api/camas
   */
  async create(_dto: CreateCamaDTO): Promise<Cama | null> {
    // TODO: return (await axios.post<Cama>(BASE_URL, _dto)).data
    return null
  },

  /**
   * Modificar datos de una cama existente.
   * Futuro: PATCH /api/camas/:id
   */
  async update(_id: string, _dto: UpdateCamaDTO): Promise<Cama | null> {
    // TODO: return (await axios.patch<Cama>(`${BASE_URL}/${_id}`, _dto)).data
    return null
  },

  /**
   * Eliminar una cama respetando restricciones de integridad referencial del backend.
   * Futuro: DELETE /api/camas/:id
   */
  async delete(_id: string): Promise<boolean> {
    // TODO: return (await axios.delete(`${BASE_URL}/${_id}`)).status === 200
    return false
  },
}

export const alasService = {
  /**
   * Obtener todas las alas registradas en el hospital.
   * Futuro: GET /api/alas
   */
  async getAll(): Promise<Ala[]> {
    // TODO: return (await axios.get<Ala[]>(ALAS_URL)).data
    return []
  },

  /**
   * Registrar una nueva ala hospitalaria cuando se amplíen las instalaciones.
   * Futuro: POST /api/alas
   */
  async create(_dto: CreateAlaDTO): Promise<Ala | null> {
    // TODO: return (await axios.post<Ala>(ALAS_URL, _dto)).data
    return null
  },
}

export const internacionService = {
  /**
   * Obtener todos los pacientes internados.
   * Futuro: GET /api/internacion
   */
  async getAll(): Promise<Internacion[]> {
    // TODO: return (await axios.get<Internacion[]>(INTERNACION_URL)).data
    return []
  },

  /**
   * Obtener internación por ID de paciente.
   * Futuro: GET /api/internacion?pacienteId=...
   */
  async getByPacienteId(_pacienteId: string): Promise<Internacion | null> {
    // TODO: implementar cuando se conecte el backend
    return null
  },

  /**
   * Registrar nuevo ingreso de internación / asignar cama.
   * Futuro: POST /api/internacion
   */
  async create(_dto: CreateInternacionDTO): Promise<Internacion | null> {
    // TODO: return (await axios.post<Internacion>(INTERNACION_URL, _dto)).data
    return null
  },

  /**
   * Asignar cama a un paciente.
   * Futuro: PATCH /api/camas/:id/asignar o POST /api/internacion
   */
  async asignarCama(_camaId: string, _pacienteId: string): Promise<boolean> {
    // TODO: implementar cuando se conecte el backend
    return false
  },
}
