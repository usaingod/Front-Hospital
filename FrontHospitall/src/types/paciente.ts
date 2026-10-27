/**
 * Definiciones de tipos para el dominio de Pacientes.
 * Preparadas para la futura integración con los contratos de API del backend.
 */

export interface Paciente {
  id: number | string
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
  obraSocial: string
  numeroAfiliado: string
  observaciones?: string
  estado?: 'activo' | 'inactivo'
  ultimoTurno?: string
  ultimaAtencion?: string
  contactoEmergencia?: string
}

export interface PacienteFilter {
  query?: string
  obraSocial?: string
  estado?: string
}

export interface CreatePacienteDTO {
  nombre: string
  apellido: string
  dni: string
  fechaNacimiento: string
  telefono: string
  email: string
  direccion: string
  obraSocial: string
  numeroAfiliado: string
  observaciones?: string
}
