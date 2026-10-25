/**
 * Definiciones de tipos para el dominio de Turnos Médicos.
 * Preparadas para la futura integración con los contratos de API del backend.
 */

export type TurnoEstado = 'pendiente' | 'confirmado' | 'cancelado' | 'atendido'

export interface Turno {
  id: number | string
  fecha: string
  hora: string
  paciente: string
  pacienteDni?: string
  especialidad: string
  medico: string
  estado: TurnoEstado
  observaciones?: string
}

export interface TurnoFilter {
  fecha?: string
  especialidad?: string
  medico?: string
  paciente?: string
  franjaHoraria?: 'todos' | 'manana' | 'tarde' | 'vespertino'
}

export interface CreateTurnoDTO {
  fecha: string
  hora: string
  especialidad: string
  medico: string
  tipoPaciente: 'existente' | 'nuevo'
  pacienteBusqueda?: string
  nuevoPaciente?: {
    nombre: string
    apellido: string
    dni: string
    telefono: string
    email: string
    obraSocial: string
  }
}
