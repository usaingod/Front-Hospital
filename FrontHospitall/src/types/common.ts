/**
 * Tipos comunes para respuestas y paginación en futuras llamadas de API
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  success?: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
//esto hago para ver si 
