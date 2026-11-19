

export interface ConsultaClinica {
  id: number | string
  fecha: string
  profesional: string
  especialidad: string
  motivoConsulta: string
  diagnostico: string
  tratamiento?: string
  receta?: string
  observaciones?: string
}

export interface AntecedenteClinico {
  id: number | string
  tipo: 'patologico' | 'quirurgico' | 'alergico' | 'familiar' | 'farmacologico'
  descripcion: string
  fechaRegistro?: string
}

export interface HistoriaClinica {
  pacienteId: number | string
  grupoSanguineo?: string
  factorRh?: string
  antecedentes: AntecedenteClinico[]
  consultas: ConsultaClinica[]
  alergiasConocidas?: string[]
}
