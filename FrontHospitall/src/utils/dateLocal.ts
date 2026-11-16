/** Zona clínica del hospital (misma que `CLINIC_TZ` de la API). */
export const CLINIC_TZ = 'America/Argentina/Buenos_Aires'
/** Argentina sin DST. */
export const CLINIC_OFFSET = '-03:00'

/** Fechas de calendario en zona clínica (evita el desfase de `toISOString()` / UTC del Docker). */

function partsInClinicTz(date: Date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: CLINIC_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'
  return {
    year: value('year'),
    month: value('month'),
    day: value('day'),
    hour: value('hour').padStart(2, '0'),
    minute: value('minute').padStart(2, '0'),
  }
}

export function toIsoDateLocal(d: Date): string {
  const { year, month, day } = partsInClinicTz(d)
  return `${year}-${month}-${day}`
}

export function todayIsoLocal(): string {
  return toIsoDateLocal(new Date())
}

/** Fecha y hora de un ISO UTC interpretadas en la zona de la clínica. */
export function clinicPartsFromIso(iso: string): { fecha: string; hora: string } {
  const { year, month, day, hour, minute } = partsInClinicTz(new Date(iso))
  return { fecha: `${year}-${month}-${day}`, hora: `${hour}:${minute}` }
}

/** Arma un Instant UTC desde fecha+hora de agenda clínica. */
export function clinicDateTimeToIso(fecha: string, hora: string): string {
  return new Date(`${fecha}T${hora}:00${CLINIC_OFFSET}`).toISOString()
}

export function parseIsoDateLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1)
}

export function addDaysIso(iso: string, days: number): string {
  const d = parseIsoDateLocal(iso)
  d.setDate(d.getDate() + days)
  return toIsoDateLocal(d)
}

export function addMonthsIso(iso: string, months: number): string {
  const d = parseIsoDateLocal(iso)
  d.setMonth(d.getMonth() + months)
  return toIsoDateLocal(d)
}

/** Lunes de la semana que contiene `iso` (lun–dom). */
export function startOfWeekMonday(iso: string): string {
  const d = parseIsoDateLocal(iso)
  const day = d.getDay()
  const offset = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + offset)
  return toIsoDateLocal(d)
}

export function formatDisplayDate(iso: string): string {
  const d = parseIsoDateLocal(iso)
  const str = d.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return str.charAt(0).toUpperCase() + str.slice(1)
}
