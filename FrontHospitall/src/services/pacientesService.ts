import type { Paciente, PacienteFilter, CreatePacienteDTO } from '@/types/paciente'

/**
 * Capa de servicios para la gestión del Padrón de Pacientes.
 * 
 * Separación de responsabilidades (Criterio 1 y Criterio 7):
 * Este módulo centraliza las futuras operaciones de comunicación con el backend.
 * Actualmente se encuentra preparado a nivel de firmas y tipado TypeScript,
 * a la espera de la definición final de los endpoints y del cliente HTTP (fetch/axios).
 */
export const pacientesService = {
  /**
   * Obtener listado de pacientes con filtros de búsqueda opcionales.
   * Punto de integración futuro: GET /api/pacientes
   */
  async getPacientes(_filters?: PacienteFilter): Promise<Paciente[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    // Retorna array vacío en esta etapa para cumplir con la regla de no simular datos ficticios.
    return []
  },

  /**
   * Obtener detalle de un paciente por ID.
   * Punto de integración futuro: GET /api/pacientes/:id
   */
  async getPacienteById(_id: number | string): Promise<Paciente | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Registrar un nuevo paciente en el padrón hospitalario.
   * Punto de integración futuro: POST /api/pacientes
   */
  async createPaciente(_data: CreatePacienteDTO): Promise<Paciente | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Actualizar los datos de un paciente.
   * Punto de integración futuro: PUT /api/pacientes/:id
   */
  async updatePaciente(_id: number | string, _data: Partial<CreatePacienteDTO>): Promise<Paciente | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },
}
