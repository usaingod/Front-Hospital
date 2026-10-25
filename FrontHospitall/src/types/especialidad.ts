/**
 * Definiciones de tipos para el dominio de Especialidades Médicas.
 * Preparadas para la futura integración con los contratos de API del backend.
 */

export interface Especialidad {
  id: number | string
  nombre: string
  descripcion: string
  icono?: string
  cantidadMedicos?: number
  estado: 'activa' | 'inactiva'
}

export interface EspecialidadFilter {
  query?: string
  estado?: string
}

export interface CreateEspecialidadDTO {
  nombre: string
  descripcion: string
  icono?: string
  estado: 'activa' | 'inactiva'
}
