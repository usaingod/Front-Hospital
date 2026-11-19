

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

  appointmentBalance?: number
  supplyBalance?: number
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

  saldoTotal?: number
  appointmentBalance?: number
  supplyBalance?: number
}


export const calcularSaldoTotal = (paciente?: {
  appointmentBalance?: number
  supplyBalance?: number
}): number => {
  if (!paciente) return 0
  return (paciente.appointmentBalance || 0) + (paciente.supplyBalance || 0)
}
