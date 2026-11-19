

export interface SignosVitales {
  id: string
  pacienteId: string
  internacionId?: string
  fechaHora: string
  temperatura: number
  frecuenciaCardiaca: number
  presionSistolica: number
  presionDiastolica: number
  fueraDeRango?: boolean
  observaciones?: string
}


export interface CreateSignosVitalesDTO {
  pacienteId: string
  internacionId?: string
  fechaHora: string
  temperatura: number
  frecuenciaCardiaca: number
  presionSistolica: number
  presionDiastolica: number
  observaciones?: string
}
