/**
 * Definiciones de tipos para el dominio de Médicos y Horarios de Atención.
 * Preparadas para la futura integración con los contratos de API del backend.
 */

export interface HorarioAtencion {
  id?: number | string
  diaSemana: string
  horaInicio: string
  horaFin: string
  consultorio: string
  modalidad: 'Presencial' | 'Telemedicina' | 'Mixta'
  estado: 'Activo' | 'Suspendido' | 'Licencia'
}

export interface Medico {
  id: number | string
  nombre: string
  apellido?: string
  especialidad: string
  matricula: string
  telefono?: string
  email?: string
  consultorio?: string
  direccionConsultorio?: string
  observaciones?: string
  estado: 'activo' | 'licencia' | 'inactivo'
  horarios?: HorarioAtencion[]
}

export interface MedicoFilter {
  query?: string
  especialidad?: string
  estado?: string
}

export interface CreateHorarioDTO {
  diaSemana: string
  horaInicio: string
  horaFin: string
  consultorio: string
  modalidad: 'Presencial' | 'Telemedicina' | 'Mixta'
  estado: 'Activo' | 'Suspendido' | 'Licencia'
}

export interface CreateMedicoDTO {
  nombre: string
  apellido: string
  especialidad: string
  matricula: string
  telefono?: string
  email?: string
  direccionConsultorio?: string
  observaciones?: string
  estado: 'activo' | 'licencia' | 'inactivo'
}
