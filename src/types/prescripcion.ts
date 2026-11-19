


export interface Supply {
  id: string
  name: string
  stock: number
  price: number
  createdAt?: string
  updatedAt?: string
}


export type EstadoPrescripcion = 'activa' | 'suspendida' | 'finalizada'


export interface Prescripcion {
  id: string
  pacienteId: string
  supplyId: string
  supplyName?: string
  dosis: string
  cadaHoras: number
  estado?: EstadoPrescripcion
  creadoPor?: string
  creadoEn?: string
}


export interface CreatePrescripcionDTO {
  supplyId: string
  dosis: string
  cadaHoras: number
}


export interface AdministracionMedicamento {
  id: string
  prescripcionId: string
  adminPorId?: string
  fechaHora: string
  observaciones?: string
}
