<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Minus } from 'lucide-vue-next'

interface FaqItem {
  question: string
  answer: string
}

withDefaults(defineProps<{
  title: string
  highlight?: string
  subtitle?: string
  items: ReadonlyArray<FaqItem>
}>(), {
  highlight: '',
  subtitle: ''
})

const activeFaqIndex = ref<number | null>(null)

const toggleFaq = (index: number) => {
  activeFaqIndex.value = activeFaqIndex.value === index ? null : index
}
</script>

<template>
  <section class="relative flex flex-col items-center justify-center bg-bg-public-muted px-0 pb-16 pt-32 md:pt-44 lg:pt-48 xl:pt-56 2xl:pb-25 2xl:pt-60">
    <div class="public-container flex flex-col items-center">
      <!-- Headline -->
      <h2 
        class="text-center font-heading text-3xl font-normal leading-tight text-text-public-heading md:text-4xl lg:text-4xl 2xl:text-5xl" 
        :class="subtitle ? 'mb-4' : 'mb-12 md:mb-14 lg:mb-16 2xl:mb-20'"
      >
        {{ title }} <span v-if="highlight" class="text-brand font-medium">{{ highlight }}</span>
      </h2>
      
      <p v-if="subtitle" class="mb-12 max-w-3xl text-center font-sans text-base leading-relaxed text-neutral-600 md:mb-14 md:text-lg lg:mb-16 2xl:mb-20 2xl:text-xl">
        {{ subtitle }}
      </p>

      <!-- Accordion List -->
      <div class="flex w-full max-w-4xl flex-col gap-4 2xl:gap-6">
        <div 
          v-for="(faq, index) in items" 
          :key="index"
          class="flex flex-col overflow-hidden rounded-3xl border border-border-public-soft bg-white transition-shadow duration-300 hover:shadow-sm"
        >
          <button 
            type="button" 
            class="flex cursor-pointer items-center justify-between px-6 py-5 focus:outline-none md:px-8 md:py-6 2xl:px-10 2xl:py-8"
            @click="toggleFaq(index)"
            :aria-expanded="activeFaqIndex === index"
          >
            <h3 
              class="pr-4 text-left font-heading text-lg font-medium transition-colors md:text-xl 2xl:text-2xl"
              :class="activeFaqIndex === index ? 'text-brand' : 'text-text-public-heading'"
            >
              {{ faq.question }}
            </h3>
            <div 
              class="flex shrink-0 items-center justify-center text-text-public-heading transition-colors"
            >
              <Minus v-if="activeFaqIndex === index" class="h-6 w-6" />
              <Plus v-else class="h-6 w-6" />
            </div>
          </button>
          <div 
            class="grid transition-all duration-300 ease-in-out"
            :class="activeFaqIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <p class="px-6 pb-6 pt-0 font-sans text-base leading-relaxed text-text-public-body md:px-8 md:pb-8 md:text-lg 2xl:px-10 2xl:pb-10 2xl:text-xl">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
