import type { Especialidad, EspecialidadFilter, CreateEspecialidadDTO } from '@/types/especialidad'

/**
 * Capa de servicios para la gestión de Especialidades Médicas.
 * 
 * Separación de responsabilidades (Criterio 1 y Criterio 7):
 * Centraliza las futuras operaciones de comunicación con el backend (GET, POST, PUT, DELETE).
 * Actualmente preparado a nivel de firmas y contratos TypeScript.
 * En esta etapa retorna colecciones vacías para cumplir estrictamente con la regla
 * de no incorporar datos ficticios en la aplicación.
 */
export const especialidadesService = {
  /**
   * Obtener listado de especialidades médicas con filtros opcionales.
   * Punto de integración futuro: GET /api/especialidades
   */
  async getEspecialidades(_filters?: EspecialidadFilter): Promise<Especialidad[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return []
  },

  /**
   * Obtener una especialidad por su identificador.
   * Punto de integración futuro: GET /api/especialidades/:id
   */
  async getEspecialidadById(_id: number | string): Promise<Especialidad | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Registrar una nueva especialidad médica en el sistema.
   * Punto de integración futuro: POST /api/especialidades
   */
  async createEspecialidad(_data: CreateEspecialidadDTO): Promise<Especialidad | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Actualizar los datos de una especialidad médica existente.
   * Punto de integración futuro: PUT /api/especialidades/:id
   */
  async updateEspecialidad(
    _id: number | string,
    _data: Partial<CreateEspecialidadDTO>
  ): Promise<Especialidad | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Eliminar una especialidad médica.
   * Punto de integración futuro: DELETE /api/especialidades/:id
   */
  async deleteEspecialidad(_id: number | string): Promise<boolean> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return false
  },
}
