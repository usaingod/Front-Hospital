import { api } from '@/services/api'
import type { ApiBranch, ApiPatient } from '@/types/api'
import { turnosService } from '@/services/turnosService'

export type TriageLevel = 'rojo' | 'amarillo' | 'verde'

export type TriageEntry = {
  id: string
  patientId: string
  branchId: string
  level: TriageLevel
  createdAt: string
  pacienteNombre?: string
  pacienteDni?: string
}

const LEVEL_ORDER: Record<TriageLevel, number> = {
  rojo: 0,
  amarillo: 1,
  verde: 2,
}

export const triageService = {
  async list(branchId?: string): Promise<TriageEntry[]> {
    const resolved =
      branchId || (await turnosService.getBranchId())
    const [entries, patients] = await Promise.all([
      api.get<TriageEntry[]>(`/triage?branchId=${resolved}`),
      api.get<ApiPatient[]>('/patients'),
    ])
    const byId = new Map(patients.map((p) => [p.id, p]))
    return entries
      .map((e) => {
        const p = byId.get(e.patientId)
        return {
          ...e,
          pacienteNombre: p
            ? `${p.lastName}, ${p.firstName}`
            : e.patientId,
          pacienteDni: p?.documentId,
        }
      })
      .sort((a, b) => {
        const byLevel =
          (LEVEL_ORDER[a.level] ?? 9) - (LEVEL_ORDER[b.level] ?? 9)
        if (byLevel !== 0) return byLevel
        return String(a.createdAt).localeCompare(String(b.createdAt))
      })
  },

  async classify(input: {
    patientId: string
    level: TriageLevel
    branchId?: string
  }): Promise<TriageEntry> {
    const branchId = input.branchId || (await turnosService.getBranchId())
    return api.post<TriageEntry>('/triage', {
      patientId: input.patientId,
      branchId,
      level: input.level,
    })
  },

  async defaultBranch(): Promise<ApiBranch | undefined> {
    const branches = await api.get<ApiBranch[]>('/branches')
    const central = branches.find((b) =>
      b.name.toLowerCase().includes('central'),
    )
    return central || branches[0]
  },
}
