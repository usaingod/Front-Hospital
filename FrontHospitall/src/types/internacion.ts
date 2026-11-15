/**
 * Tipos para el dominio de Internación y Camas.
 * Preparados para la futura integración con los endpoints del backend (NestJS / Prisma).
 * Basados en el schema.prisma y los contratos de API reales.
 * No se inventan propiedades: solo se definen las que surgen del análisis del repositorio.
 */

// Estados posibles de una cama (deben verificarse contra el backend real)
export type EstadoCama = 'disponible' | 'ocupada' | 'en_limpieza' | 'bloqueada'

// Modelo de Ala hospitalaria para la gestión de infraestructura (Perfil Administrador)
export interface Ala {
  id: string
  nombre: string        // Nombre del ala (ej: "Ala 1", "Ala 2")
  descripcion?: string  // Ubicación o notas del ala
}

export interface CreateAlaDTO {
  nombre: string
  descripcion?: string
}

export interface Cama {
  id: string
  numero: string        // Identificador/número de cama generado por backend (ej: "101", "102", "201")
  sala: string          // Sala o sector al que pertenece
  ala?: string          // Ala hospitalaria correspondiente
  alaId?: string        // ID de la relación con el Ala en el backend
  habitacion?: string   // Habitación
  estado: EstadoCama
  pacienteId?: string   // ID del paciente internado (si está ocupada)
  pacienteNombre?: string
  pacienteDni?: string
  internacionId?: string
  ultimoSignos?: {
    fechaHora: string
    temperatura: number
    frecuenciaCardiaca: number
    presionSistolica: number
    presionDiastolica: number
  }
}

export interface CamaFilter {
  query?: string
  sala?: string
  ala?: string
  estado?: EstadoCama | ''
}

export interface CreateCamaDTO {
  alaId?: string
  ala: string           // Ala seleccionada para la asignación automática del número en el backend
  sala?: string
}

export interface UpdateCamaDTO {
  ala?: string
  alaId?: string
  sala?: string
  estado?: EstadoCama
}

// Datos de internación de un paciente
export interface Internacion {
  id: string
  pacienteId: string
  pacienteNombre?: string
  pacienteDni?: string
  camaId: string
  sala: string
  habitacion?: string
  numeroCama: string
  fechaIngreso: string   // ISO 8601
  diagnostico?: string
  motivo?: string
  protocolTasks?: string[]
  medicoTratanteId?: string
  medicoTratanteNombre?: string
  estado?: string        // Estado de internación (activo, alta, traslado, etc.)
  observaciones?: string
}

export interface InternacionFilter {
  query?: string
  sala?: string
  estado?: string
}

export interface CreateInternacionDTO {
  pacienteId: string
  camaId: string
  fechaIngreso: string
  diagnostico?: string
  motivo?: string
  medicoTratanteId?: string
  observaciones?: string
}
