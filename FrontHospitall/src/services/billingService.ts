import { api } from '@/services/api'

export type AccountLine = {
  id: string
  admissionId: string
  doseId?: string | null
  concept: string
  amount: number
  createdAt: string
}

export type StayAccount = {
  admissionId: string
  lines: AccountLine[]
  total: number
}

export type Charge = {
  id: string
  appointmentId: string
  payer: string
  amount: number
}

export const billingService = {
  async chargeConsultation(
    appointmentId: string | number,
    price = 15000,
  ): Promise<Charge[]> {
    return api.post<Charge[]>(`/appointments/${appointmentId}/charges`, {
      price,
    })
  },

  async stayAccount(admissionId: string): Promise<StayAccount> {
    return api.get<StayAccount>(`/admissions/${admissionId}/account`)
  },
}
