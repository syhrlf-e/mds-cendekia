export type StringRecord = Record<string, string>

export const sanitizeDigits = (value: unknown, maxLength?: number) => {
  const sanitized = String(value ?? '').replace(/\D/g, '')
  return typeof maxLength === 'number' ? sanitized.slice(0, maxLength) : sanitized
}

export const sanitizeIndonesianMobile = (value: unknown) => {
  const digits = sanitizeDigits(value, 13)
  if (!digits) return ''
  if (digits.startsWith('08')) return digits.slice(0, 13)
  if (digits.startsWith('8')) return `0${digits}`.slice(0, 13)
  if (digits.startsWith('0')) return digits.slice(0, 13)
  return `08${digits}`.slice(0, 13)
}

export const sanitizeName = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, 80)

const stripControlChars = (value: string) => Array.from(value)
  .filter((char) => {
    const code = char.charCodeAt(0)
    return code >= 32 && code !== 127
  })
  .join('')

export const sanitizeSafeText = (value: unknown, maxLength = 160) => stripControlChars(String(value ?? ''))
  .replace(/[<>{}`\\]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, maxLength)

export const sanitizeSchoolName = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z0-9\s]/g, '')
  .replace(/\s{2,}/g, ' ')
  .slice(0, 120)

export const sanitizeIjazahNumber = (value: unknown) => String(value ?? '')
  .replace(/[^a-zA-Z0-9/-]/g, '')
  .slice(0, 25)

export const sanitizeEmail = (value: unknown) => String(value ?? '')
  .trim()
  .toLowerCase()
  .replace(/\s/g, '')
  .replace(/[<>{}`\\'"]/g, '')
  .slice(0, 120)

export const setSanitized = (target: StringRecord, key: string, sanitized: string) => {
  if (target[key] !== sanitized) {
    target[key] = sanitized
  }
}
