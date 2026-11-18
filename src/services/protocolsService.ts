import { api } from '@/services/api'

export type Protocol = {
  id?: string
  reason: string
  tasks: string[]
}

export const protocolsService = {
  async list(): Promise<Protocol[]> {
    return api.get<Protocol[]>('/protocols')
  },

  async create(reason: string, tasks: string[]): Promise<Protocol> {
    return api.post<Protocol>('/protocols', { reason, tasks })
  },
}
