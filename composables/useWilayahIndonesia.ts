type WilayahApiItem = {
  id: string
  name: string
}

export type RegionOption = {
  label: string
  value: string
}

const EMSIFA_BASE_URL = 'https://www.emsifa.com/api-wilayah-indonesia/api'

export const useWilayahIndonesia = () => {
  const provinsiOptions = ref<RegionOption[]>([])
  const kotaOptions = ref<RegionOption[]>([])
  const kecamatanOptions = ref<RegionOption[]>([])
  const kelurahanOptions = ref<RegionOption[]>([])
  const isLoadingRegion = ref(false)

  const fetchRegion = async (path: string) => {
    try {
      isLoadingRegion.value = true
      const data = await $fetch<WilayahApiItem[]>(`${EMSIFA_BASE_URL}/${path}`)
      return data.map((item) => ({ label: item.name, value: item.id }))
    } catch {
      return []
    } finally {
      isLoadingRegion.value = false
    }
  }

  const loadProvinsi = async () => {
    provinsiOptions.value = await fetchRegion('provinces.json')
  }

  const loadKota = async (provinceId: string) => {
    kotaOptions.value = provinceId ? await fetchRegion(`regencies/${provinceId}.json`) : []
  }

  const loadKecamatan = async (regencyId: string) => {
    kecamatanOptions.value = regencyId ? await fetchRegion(`districts/${regencyId}.json`) : []
  }

  const loadKelurahan = async (districtId: string) => {
    kelurahanOptions.value = districtId ? await fetchRegion(`villages/${districtId}.json`) : []
  }

  const findLabel = (options: RegionOption[], value: string) => {
    return options.find((option) => option.value === value)?.label || ''
  }

  return {
    provinsiOptions,
    kotaOptions,
    kecamatanOptions,
    kelurahanOptions,
    isLoadingRegion,
    loadProvinsi,
    loadKota,
    loadKecamatan,
    loadKelurahan,
    findLabel
  }
}
