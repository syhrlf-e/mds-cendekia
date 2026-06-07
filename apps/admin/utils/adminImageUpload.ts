export const ADMIN_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp'
export const ADMIN_IMAGE_MAX_SIZE_BYTES = 4 * 1024 * 1024

type SupportedImageType = 'image/png' | 'image/jpeg' | 'image/webp'

type ImageValidationResult =
  | { valid: true; type: SupportedImageType }
  | { valid: false; message: string }

const supportedExtensions: Record<SupportedImageType, string[]> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/webp': ['webp']
}

const readFileExtension = (fileName: string) => {
  return fileName.split('.').pop()?.trim().toLowerCase() || ''
}

const detectImageType = (bytes: Uint8Array): SupportedImageType | null => {
  const isPng = (
    bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4E
    && bytes[3] === 0x47
    && bytes[4] === 0x0D
    && bytes[5] === 0x0A
    && bytes[6] === 0x1A
    && bytes[7] === 0x0A
  )
  if (isPng) return 'image/png'

  const isJpeg = bytes.length >= 3 && bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF
  if (isJpeg) return 'image/jpeg'

  const isWebp = (
    bytes.length >= 12
    && bytes[0] === 0x52
    && bytes[1] === 0x49
    && bytes[2] === 0x46
    && bytes[3] === 0x46
    && bytes[8] === 0x57
    && bytes[9] === 0x45
    && bytes[10] === 0x42
    && bytes[11] === 0x50
  )
  if (isWebp) return 'image/webp'

  return null
}

export const validateAdminImageUpload = async (file: File): Promise<ImageValidationResult> => {
  if (file.size <= 0) {
    return { valid: false, message: 'File gambar kosong atau tidak dapat dibaca.' }
  }

  if (file.size > ADMIN_IMAGE_MAX_SIZE_BYTES) {
    return { valid: false, message: 'Ukuran file maksimal 4MB.' }
  }

  const declaredType = file.type.toLowerCase() as SupportedImageType
  if (!(declaredType in supportedExtensions)) {
    return { valid: false, message: 'Format gambar harus PNG, JPG, JPEG, atau WEBP.' }
  }

  const extension = readFileExtension(file.name)
  if (!supportedExtensions[declaredType].includes(extension)) {
    return { valid: false, message: 'Ekstensi file tidak sesuai dengan format gambarnya.' }
  }

  try {
    const signatureBytes = new Uint8Array(await file.slice(0, 16).arrayBuffer())
    const detectedType = detectImageType(signatureBytes)

    if (!detectedType || detectedType !== declaredType) {
      return { valid: false, message: 'Isi file tidak cocok dengan format gambar yang dipilih.' }
    }

    return { valid: true, type: detectedType }
  } catch {
    return { valid: false, message: 'File gambar tidak dapat dibaca. Silakan pilih file lain.' }
  }
}
