/**
 * Tipos para el dominio de Prescripciones Médicas e Insumos/Medicamentos.
 *
 * Basados en el modelo Supply del schema.prisma:
 *   model Supply {
 *     id        String   @id @default(uuid())
 *     name      String   @unique
 *     stock     Int
 *     price     Int
 *     createdAt DateTime @default(now())
 *     updatedAt DateTime @updatedAt
 *   }
 *
 * El contrato de creación de prescripciones contempla:
 *   - supplyId
 *   - dosis
 *   - cadaHoras
 *
 * Verificar el DTO real del backend antes de conectar.
 * No se agregan propiedades inventadas.
 */

// Modelo de insumo/medicamento según schema.prisma
export interface Supply {
  id: string
  name: string
  stock: number
  price: number
  createdAt?: string
  updatedAt?: string
}

// Estado posible de una prescripción (verificar valores reales del backend)
export type EstadoPrescripcion = 'activa' | 'suspendida' | 'finalizada'

// Prescripción médica creada por el médico para un paciente internado
export interface Prescripcion {
  id: string
  pacienteId: string
  supplyId: string
  supplyName?: string     // Nombre del medicamento (join con Supply)
  dosis: string
  cadaHoras: number       // Intervalo en horas
  estado?: EstadoPrescripcion
  creadoPor?: string      // ID del médico creador
  creadoEn?: string       // ISO 8601
}

/**
 * DTO de creación de prescripción médica.
 * Respetar exactamente el contrato del backend:
 *   - supplyId: UUID del medicamento en el catálogo Supply
 *   - dosis: texto libre
 *   - cadaHoras: número entero (intervalo en horas)
 *
 * No agregar campos adicionales sin verificarlos en el backend.
 */
export interface CreatePrescripcionDTO {
  supplyId: string
  dosis: string
  cadaHoras: number
}

// Registro de administración de dosis por enfermería
// Verificar si el backend habilita esta operación y cuál es su DTO real
export interface AdministracionMedicamento {
  id: string
  prescripcionId: string
  adminPorId?: string   // ID del profesional de enfermería que registra
  fechaHora: string     // ISO 8601
  observaciones?: string
}
