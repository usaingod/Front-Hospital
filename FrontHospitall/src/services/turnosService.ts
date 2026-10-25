import type { Turno, TurnoFilter, CreateTurnoDTO } from '@/types/turno'

/**
 * Capa de servicios para la gestión de Turnos Médicos.
 * 
 * Separación de responsabilidades (Criterio 1 y Criterio 7):
 * Este módulo centraliza las futuras operaciones de comunicación con el backend.
 * Actualmente se encuentra preparado a nivel de firmas y tipado TypeScript,
 * a la espera de la definición final de los endpoints y del cliente HTTP (fetch/axios).
 */
export const turnosService = {
  /**
   * Obtener listado de turnos con filtros opcionales (fecha, médico, paciente, franja horaria).
   * Punto de integración futuro: GET /api/turnos
   */
  async getTurnos(_filters?: TurnoFilter): Promise<Turno[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    // Retorna array vacío en esta etapa para cumplir con la regla de no simular datos ficticios.
    return []
  },

  /**
   * Asignar / registrar un nuevo turno.
   * Punto de integración futuro: POST /api/turnos
   */
  async createTurno(_data: CreateTurnoDTO): Promise<Turno | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Cancelar un turno existente.
   * Punto de integración futuro: PATCH/DELETE /api/turnos/:id/cancelar
   */
  async cancelTurno(_id: number | string): Promise<boolean> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return false
  },
}
