import type { Usuario, UsuarioFilter, CreateUsuarioDTO } from '@/types/usuario'

/**
 * Capa de servicios para la gestión de Usuarios del Sistema.
 * 
 * Separación de responsabilidades (Criterio 1 y Criterio 7):
 * Centraliza las futuras operaciones de comunicación con el backend (GET, POST, PUT, DELETE).
 * Actualmente preparado a nivel de firmas y contratos TypeScript.
 * En esta etapa retorna colecciones vacías para cumplir estrictamente con la regla
 * de no incorporar datos ficticios en la aplicación.
 */
export const usuariosService = {
  /**
   * Obtener listado de usuarios del sistema con filtros opcionales.
   * Punto de integración futuro: GET /api/usuarios
   */
  async getUsuarios(_filters?: UsuarioFilter): Promise<Usuario[]> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return []
  },

  /**
   * Obtener un usuario por su identificador.
   * Punto de integración futuro: GET /api/usuarios/:id
   */
  async getUsuarioById(_id: number | string): Promise<Usuario | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Registrar un nuevo usuario en el sistema.
   * Punto de integración futuro: POST /api/usuarios
   */
  async createUsuario(_data: CreateUsuarioDTO): Promise<Usuario | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Actualizar los datos de un usuario existente.
   * Punto de integración futuro: PUT /api/usuarios/:id
   */
  async updateUsuario(
    _id: number | string,
    _data: Partial<CreateUsuarioDTO>
  ): Promise<Usuario | null> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return null
  },

  /**
   * Eliminar o dar de baja a un usuario.
   * Punto de integración futuro: DELETE /api/usuarios/:id
   */
  async deleteUsuario(_id: number | string): Promise<boolean> {
    // TODO: Conectar con backend cuando los endpoints estén disponibles.
    return false
  },
}
