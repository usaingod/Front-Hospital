import type {
  Medico,
  MedicoFilter,
  HorarioAtencion,
  CreateHorarioDTO,
  CreateMedicoDTO,
} from '@/types/medico'

/**
 * Capa de servicios para la gestión de Médicos y Horarios de Atención.
 * 
 * Separación de responsabilidades (Criterio 1 y Criterio 7):
 * Este módulo centraliza las futuras operaciones de comunicación con el backend.
 * Actualmente se encuentra preparado a nivel de firmas y tipado TypeScript,
 * a la espera de la definición final de los endpoints y del cliente HTTP (fetch/axios).
 */
export const medicosService = {
  /**
   * Obtener listado de médicos con filtros opcionales.
   * Punto de integración futuro: GET /api/medicos
   */
  async getMedicos(_filters?: MedicoFilter): Promise<Medico[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return []
  },

  /**
   * Obtener un médico por su identificador.
   * Punto de integración futuro: GET /api/medicos/:id
   */
  async getMedicoById(_id: number | string): Promise<Medico | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Registrar un nuevo profesional médico en el sistema (Administrador).
   * Punto de integración futuro: POST /api/medicos
   */
  async createMedico(_data: CreateMedicoDTO): Promise<Medico | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Actualizar los datos generales de un médico (Administrador).
   * Punto de integración futuro: PUT /api/medicos/:id
   */
  async updateMedico(
    _id: number | string,
    _data: Partial<CreateMedicoDTO>
  ): Promise<Medico | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Dar de baja o eliminar un médico del sistema (Administrador).
   * Punto de integración futuro: DELETE /api/medicos/:id
   */
  async deleteMedico(_id: number | string): Promise<boolean> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return false
  },

  /**
   * Obtener especialidades médicas disponibles.
   * Punto de integración futuro: GET /api/especialidades
   */
  async getEspecialidades(): Promise<string[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return []
  },

  /**
   * Obtener horarios de atención configurados para un médico (Secretaría).
   * Punto de integración futuro: GET /api/medicos/:id/horarios
   */
  async getHorariosByMedicoId(_medicoId: number | string): Promise<HorarioAtencion[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return []
  },

  /**
   * Registrar una nueva franja horaria de atención para un médico (Secretaría).
   * Punto de integración futuro: POST /api/medicos/:id/horarios
   */
  async addHorario(_medicoId: number | string, _data: CreateHorarioDTO): Promise<HorarioAtencion | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },
}
