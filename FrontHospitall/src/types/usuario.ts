/**
 * Definiciones de tipos para el dominio de Usuarios del Sistema.
 * Preparadas para la futura integración con los contratos de API del backend.
 */

export type RolUsuario = 'Administrador' | 'Secretaria'

export interface Usuario {
  id: number | string
  nombre: string
  apellido: string
  email: string
  rol: RolUsuario
  estado: 'activo' | 'inactivo'
  fechaRegistro?: string
  ultimoAcceso?: string
}

export interface UsuarioFilter {
  query?: string
  rol?: string
  estado?: string
}

export interface CreateUsuarioDTO {
  nombre: string
  apellido: string
  email: string
  rol: RolUsuario
  password?: string
  confirmPassword?: string
  estado: 'activo' | 'inactivo'
}
