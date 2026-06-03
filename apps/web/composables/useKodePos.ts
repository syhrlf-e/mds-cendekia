type KodePosItem = {
  code: number | string
  village: string
  district: string
  regency: string
}

type KodePosResponse = {
  data?: KodePosItem[]
}

const KODE_POS_BASE_URL = 'https://kodepos.vercel.app'

const normalizeAreaName = (value: string) => value
  .toLowerCase()
  .replace(/\b(kabupaten|kab\.|kota|city|regency)\b/g, '')
  .replace(/[^a-z0-9]/g, '')

export const useKodePos = () => {
  const isLookingUpKodePos = ref(false)

  const lookupKodePos = async (params: {
    kelurahan: string
    kecamatan: string
    kabupatenKota: string
  }) => {
    const { kelurahan, kecamatan, kabupatenKota } = params
    if (!kelurahan || !kecamatan || !kabupatenKota) return ''

    try {
      isLookingUpKodePos.value = true
      const response = await $fetch<KodePosResponse>('/search', {
        baseURL: KODE_POS_BASE_URL,
        query: { q: kelurahan }
      })

      const matches = response.data || []
      const normalizedKecamatan = normalizeAreaName(kecamatan)
      const normalizedKabupaten = normalizeAreaName(kabupatenKota)

      const match = matches.find((item) => (
        normalizeAreaName(item.village) === normalizeAreaName(kelurahan)
        && normalizeAreaName(item.district) === normalizedKecamatan
        && normalizeAreaName(item.regency) === normalizedKabupaten
      )) || matches.find((item) => (
        normalizeAreaName(item.village) === normalizeAreaName(kelurahan)
        && normalizeAreaName(item.district) === normalizedKecamatan
      ))

      return match?.code ? String(match.code).padStart(5, '0') : ''
    } catch {
      return ''
    } finally {
      isLookingUpKodePos.value = false
    }
  }

  return {
    isLookingUpKodePos,
    lookupKodePos
  }
}
