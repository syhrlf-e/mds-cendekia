export const WHATSAPP_CONSULTATION_MESSAGE =
  'Halo Admin MDS Cendekia, saya ingin berkonsultasi mengenai informasi pendaftaran dan program pendidikan MDS Cendekia.'

export const normalizeWhatsAppNumber = (value: unknown) => String(value || '').replace(/\D/g, '')

export const buildWhatsAppConsultationUrl = (phoneNumber: unknown) => {
  const normalizedPhoneNumber = normalizeWhatsAppNumber(phoneNumber)

  if (!normalizedPhoneNumber) return ''

  return `https://wa.me/${normalizedPhoneNumber}?text=${encodeURIComponent(WHATSAPP_CONSULTATION_MESSAGE)}`
}
