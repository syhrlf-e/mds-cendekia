import { watch, type Ref } from 'vue'
import type { PpdbBiodataForm } from './usePpdbRegistrationForm'

type UsePpdbRegionCascadeParams = {
  form: PpdbBiodataForm
  isRestoringDraft: Ref<boolean>
  validateField: (field: string) => void
}

export const usePpdbRegionCascade = ({
  form,
  isRestoringDraft,
  validateField
}: UsePpdbRegionCascadeParams) => {
  const {
    provinsiOptions,
    kotaOptions,
    kecamatanOptions,
    kelurahanOptions,
    loadProvinsi,
    loadKota,
    loadKecamatan,
    loadKelurahan,
    findLabel
  } = useWilayahIndonesia()

  const { isLookingUpKodePos, lookupKodePos } = useKodePos()

  const loadSelectedRegions = async () => {
    await loadProvinsi()
    if (form.provinsi) await loadKota(form.provinsi)
    if (form.kabupaten_kota) await loadKecamatan(form.kabupaten_kota)
    if (form.kecamatan) await loadKelurahan(form.kecamatan)
  }

  watch(isRestoringDraft, async (isRestoring) => {
    if (!isRestoring) {
      await loadSelectedRegions()
    }
  })

  watch(() => form.provinsi, async (newVal) => {
    if (isRestoringDraft.value) return

    form.kabupaten_kota = ''
    form.kecamatan = ''
    form.kelurahan = ''
    form.kode_pos = ''
    kotaOptions.value = []
    kecamatanOptions.value = []
    kelurahanOptions.value = []
    if (newVal) {
      await loadKota(newVal)
    }
    validateField('provinsi')
  })

  watch(() => form.kabupaten_kota, async (newVal) => {
    if (isRestoringDraft.value) return

    form.kecamatan = ''
    form.kelurahan = ''
    form.kode_pos = ''
    kecamatanOptions.value = []
    kelurahanOptions.value = []
    if (newVal) {
      await loadKecamatan(newVal)
    }
    validateField('kabupaten_kota')
  })

  watch(() => form.kecamatan, async (newVal) => {
    if (isRestoringDraft.value) return

    form.kelurahan = ''
    form.kode_pos = ''
    kelurahanOptions.value = []
    if (newVal) {
      await loadKelurahan(newVal)
    }
    validateField('kecamatan')
  })

  watch(() => form.kelurahan, async (newVal) => {
    if (isRestoringDraft.value) return

    form.kode_pos = ''
    validateField('kelurahan')

    if (!newVal) return

    const kodePos = await lookupKodePos({
      kelurahan: findLabel(kelurahanOptions.value, form.kelurahan),
      kecamatan: findLabel(kecamatanOptions.value, form.kecamatan),
      kabupatenKota: findLabel(kotaOptions.value, form.kabupaten_kota)
    })

    if (kodePos) {
      form.kode_pos = kodePos
      validateField('kode_pos')
    }
  })

  return {
    provinsiOptions,
    kotaOptions,
    kecamatanOptions,
    kelurahanOptions,
    isLookingUpKodePos,
    loadSelectedRegions
  }
}
