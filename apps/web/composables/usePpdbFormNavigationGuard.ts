import { computed, ref, type Ref } from 'vue'
import { onBeforeRouteLeave, useRouter } from 'vue-router'
import type { PpdbBiodataForm, PpdbOrangTuaForm, PpdbSekolahForm } from './usePpdbRegistrationForm'

type UsePpdbFormNavigationGuardParams = {
  form: PpdbBiodataForm
  formSekolah: PpdbSekolahForm
  orangTua: Ref<PpdbOrangTuaForm[]>
  isWaliBerbeda: Ref<boolean>
  resetForm: () => void
  nextPath: string
  fallbackPath: string
}

const hasFilledValue = (value: unknown) => String(value ?? '').trim() !== ''

export const usePpdbFormNavigationGuard = ({
  form,
  formSekolah,
  orangTua,
  isWaliBerbeda,
  resetForm,
  nextPath,
  fallbackPath
}: UsePpdbFormNavigationGuardParams) => {
  const router = useRouter()
  const isLeaveGuardOpen = ref(false)
  const pendingNavigationPath = ref('')
  const allowRouteLeave = ref(false)

  const hasFilledForm = computed(() => {
    const biodataFilled = Object.values(form).some(hasFilledValue)
    const sekolahFilled = Object.values(formSekolah).some(hasFilledValue)
    const orangTuaFilled = orangTua.value.some(item => Object.entries(item).some(([key, value]) => {
      if (key === 'peran' || key === 'hubungan') return false
      return hasFilledValue(value)
    }))

    return biodataFilled || sekolahFilled || orangTuaFilled || isWaliBerbeda.value
  })

  const requestLeave = (path: string) => {
    if (!hasFilledForm.value) {
      allowRouteLeave.value = true
      router.push(path)
      return
    }

    pendingNavigationPath.value = path
    isLeaveGuardOpen.value = true
  }

  const confirmLeave = () => {
    isLeaveGuardOpen.value = false
    const path = pendingNavigationPath.value || fallbackPath
    pendingNavigationPath.value = ''
    resetForm()
    allowRouteLeave.value = true
    router.push(path)
  }

  const proceedNext = () => {
    allowRouteLeave.value = true
    router.push(nextPath)
  }

  onBeforeRouteLeave((to) => {
    if (allowRouteLeave.value || !hasFilledForm.value) return true

    pendingNavigationPath.value = to.fullPath
    isLeaveGuardOpen.value = true
    return false
  })

  return {
    isLeaveGuardOpen,
    requestLeave,
    confirmLeave,
    proceedNext
  }
}
