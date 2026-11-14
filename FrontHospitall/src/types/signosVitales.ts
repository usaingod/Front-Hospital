/**
 * Tipos para el dominio de Signos Vitales.
 * Los cuatro signos vitales contemplados por el sistema son:
 *   1. Temperatura (°C)
 *   2. Frecuencia cardíaca (lpm)
 *   3. Presión sistólica (mmHg)
 *   4. Presión diastólica (mmHg)
 *
 * Preparados para la futura integración con los endpoints del backend.
 * Verificar el DTO real antes de conectar.
 */

export interface SignosVitales {
  id: string
  pacienteId: string
  internacionId?: string
  fechaHora: string         // ISO 8601
  temperatura: number       // °C
  frecuenciaCardiaca: number // lpm
  presionSistolica: number  // mmHg
  presionDiastolica: number // mmHg
  observaciones?: string    // Solo si el backend lo contempla
}

/**
 * DTO de creación de registro de signos vitales.
 * Verificar contra el DTO real del backend antes de conectar.
 */
export interface CreateSignosVitalesDTO {
  pacienteId: string
  fechaHora: string
  temperatura: number
  frecuenciaCardiaca: number
  presionSistolica: number
  presionDiastolica: number
  observaciones?: string
}
