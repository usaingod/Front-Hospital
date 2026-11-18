/**
 * Definiciones de tipos para el dominio de Pacientes.
 * Preparadas para la futura integración con los contratos de API del backend.
 * 
 * Contrato de saldos (modelo Patient en Prisma):
 * - appointmentBalance: saldo correspondiente a turnos.
 * - supplyBalance: saldo correspondiente a insumos.
 * En el frontend se unifican como saldoTotal = appointmentBalance + supplyBalance.
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
  // Saldos según modelo Patient de Prisma
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
  // Saldo unificado para la interfaz
  saldoTotal?: number
  appointmentBalance?: number
  supplyBalance?: number
}

/**
 * Función utilitaria para calcular el saldo total adeudado por un paciente.
 * saldoTotal = appointmentBalance + supplyBalance
 */
export const calcularSaldoTotal = (paciente?: {
  appointmentBalance?: number
  supplyBalance?: number
}): number => {
  if (!paciente) return 0
  return (paciente.appointmentBalance || 0) + (paciente.supplyBalance || 0)
}
