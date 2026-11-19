


export type EstadoCama = 'disponible' | 'ocupada' | 'en_limpieza' | 'bloqueada'


export interface Ala {
  id: string
  nombre: string
  descripcion?: string
}

export interface CreateAlaDTO {
  nombre: string
  descripcion?: string
}

export interface Cama {
  id: string
  numero: string
  sala: string
  ala?: string
  alaId?: string
  habitacion?: string
  estado: EstadoCama
  pacienteId?: string
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
  ala: string
  sala?: string
}

export interface UpdateCamaDTO {
  ala?: string
  alaId?: string
  sala?: string
  estado?: EstadoCama
}


export interface Internacion {
  id: string
  pacienteId: string
  pacienteNombre?: string
  pacienteDni?: string
  camaId: string
  sala: string
  habitacion?: string
  numeroCama: string
  fechaIngreso: string
  diagnostico?: string
  motivo?: string
  protocolTasks?: string[]
  medicoTratanteId?: string
  medicoTratanteNombre?: string
  estado?: string
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
