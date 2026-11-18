/**
 * Definiciones de tipos para el dominio de Historia Clínica (Perfil Médico).
 * Preparadas para la futura integración con los contratos de API del backend.
 * Criterio 7: Preparación de contratos sin simular llamadas HTTP prematuras.
 */

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
