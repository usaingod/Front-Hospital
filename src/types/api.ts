export type ApiCoverage = 'publica' | 'prepaga' | 'particular'
export type ApiBedStatus = 'disponible' | 'ocupada' | 'en_limpieza' | 'bloqueada'
export type ApiAppointmentStatus =
  | 'programado'
  | 'en_sala_de_espera'
  | 'atendido'
  | 'cancelado'

export type ApiPatient = {
  id: string
  firstName: string
  lastName: string
  documentId: string
  email?: string | null
  phone?: string | null
  birthDate?: string | null
  address?: string | null
  insurer?: string | null
  affiliateNumber?: string | null
  emergencyContact?: string | null
  notes?: string | null
  active: boolean
  coverage: ApiCoverage
  copay: number
  appointmentBalance: number
  supplyBalance: number
}

export type ApiWing = {
  id: string
  name: string
  code: number
  description?: string | null
}

export type ApiBed = {
  id: string
  number: string
  wingId: string
  sala?: string | null
  habitacion?: string | null
  status: ApiBedStatus
}

export type ApiAdmission = {
  id: string
  patientId: string
  bedId: string
  reason?: string | null
  protocolTasks: string[]
  diagnosis?: string | null
  treatingProfessionalId?: string | null
  notes?: string | null
  admittedAt: string
  dischargedAt?: string | null
}

export type ApiProfessional = {
  id: string
  firstName: string
  lastName: string
  specialtyIds: string[]
  branchIds: string[]
  licenseNumber?: string | null
  phone?: string | null
  email?: string | null
  office?: string | null
  notes?: string | null
  status: 'activo' | 'licencia' | 'inactivo'
}

export type ApiSpecialty = {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  active: boolean
}

export type ApiUser = {
  id: string
  email: string
  name: string
  role: 'admin' | 'secretaria' | 'profesional' | 'enfermero'
  professionalId?: string | null
  active: boolean
  createdAt?: string
}

export type ApiAppointment = {
  id: string
  patientId: string
  professionalId: string
  branchId: string
  startAt: string
  endAt: string
  status: ApiAppointmentStatus
  notes?: string | null
}

export type ApiAvailability = {
  id: string
  professionalId: string
  branchId: string
  weekday: number
  startTime: string
  endTime: string
  slotMinutes: number
  room?: string | null
  modality: 'presencial' | 'telemedicina' | 'mixta'
  status: 'activo' | 'suspendido' | 'licencia'
}

export type ApiBranch = {
  id: string
  name: string
}

export type ApiVitalSign = {
  id: string
  admissionId: string
  patientId: string
  sistolica: number
  diastolica: number
  frecuenciaCardiaca: number
  temperatura: number
  fueraDeRango: boolean
  notes?: string | null
  authorName: string
  createdAt: string
}

export type ApiSupply = {
  id: string
  name: string
  stock: number
  price: number
}

export type ApiPrescription = {
  id: string
  patientId: string
  supplyId: string
  dosis: string
  cadaHoras: number
  createdAt: string
}

export type ApiProtocol = {
  id: string
  reason: string
  tasks: string[]
}
