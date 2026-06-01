import { computed, ref, watch, type ComputedRef } from 'vue'

type AccordionStep = 1 | 2 | 3

type UsePpdbAccordionFlowParams = {
  isAcc1Valid: ComputedRef<boolean>
  isAcc2Valid: ComputedRef<boolean>
}

export const usePpdbAccordionFlow = ({
  isAcc1Valid,
  isAcc2Valid
}: UsePpdbAccordionFlowParams) => {
  const isAcc1Open = ref(true)
  const isAcc2Open = ref(false)
  const isAcc3Open = ref(false)
  const acc2UnlockedEver = ref(false)
  const acc3UnlockedEver = ref(false)

  const acc2FinalLock = computed(() => !acc2UnlockedEver.value)
  const acc3FinalLock = computed(() => !acc3UnlockedEver.value)

  const toggleAccordion = (target: AccordionStep) => {
    if (target === 2 && acc2FinalLock.value) return
    if (target === 3 && acc3FinalLock.value) return

    const willOpen = target === 1
      ? !isAcc1Open.value
      : target === 2
        ? !isAcc2Open.value
        : !isAcc3Open.value

    isAcc1Open.value = target === 1 ? willOpen : false
    isAcc2Open.value = target === 2 ? willOpen : false
    isAcc3Open.value = target === 3 ? willOpen : false
  }

  watch(isAcc1Valid, (valid) => {
    if (valid && !acc2UnlockedEver.value) {
      acc2UnlockedEver.value = true
    }
  }, { immediate: true })

  watch(isAcc2Valid, (valid) => {
    if (valid && !acc3UnlockedEver.value) {
      acc3UnlockedEver.value = true
    }
  }, { immediate: true })

  return {
    isAcc1Open,
    isAcc2Open,
    isAcc3Open,
    acc2FinalLock,
    acc3FinalLock,
    toggleAccordion
  }
}
