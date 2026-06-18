<script setup lang="ts">
import { Edit2, MoreVertical, Trash2 } from 'lucide-vue-next'
import { ref } from 'vue'
import type { PaketSekolah } from '~/types/adminPaketSekolah'

defineProps<{
  item: PaketSekolah
}>()

defineEmits<{
  (event: 'detail' | 'manage-registration' | 'edit' | 'delete', item: PaketSekolah): void
}>()

const isMenuOpen = ref(false)

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  setTimeout(() => {
    isMenuOpen.value = false
  }, 150)
}
</script>

<template>
  <article class="admin-program-card group flex h-[260px] w-full flex-col rounded-[27px] border border-border-soft bg-bg-surface p-7 shadow-sm transition-all duration-300 hover:border-brand/20 hover:shadow-md">
    <div class="min-h-0">
      <div class="flex items-start justify-between gap-4">
        <div class="flex min-w-0 flex-1 items-center gap-2">
          <h2 class="admin-program-card-title truncate font-heading text-[22px] font-semibold leading-tight text-text-primary">
            {{ item.nama || 'Program Paket C' }}
          </h2>
          <div v-if="item.status === 'aktif'" class="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-success"></div>
        </div>
        
        <div class="relative shrink-0">
          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/20"
            @click.stop="toggleMenu"
            @blur="closeMenu"
          >
            <MoreVertical class="h-5 w-5" />
          </button>
          
          <Transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="transform scale-95 opacity-0"
            enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0"
          >
            <div
              v-if="isMenuOpen"
              class="absolute right-0 top-full z-10 mt-1 w-36 rounded-xl border border-border-soft bg-white p-1 shadow-lg"
            >
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary"
                @click.stop="isMenuOpen = false; $emit('edit', item)"
              >
                <Edit2 class="h-4 w-4 shrink-0" />
                Edit
              </button>
              <button
                type="button"
                class="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-error transition-colors hover:bg-status-rejected-bg hover:text-error focus:outline-none focus:ring-2 focus:ring-error/20"
                @click.stop="isMenuOpen = false; $emit('delete', item)"
              >
                <Trash2 class="h-4 w-4 shrink-0" />
                Hapus
              </button>
            </div>
          </Transition>
        </div>
      </div>
      <p class="admin-program-card-description mt-4 line-clamp-3 max-w-[452px] font-body text-sm font-normal leading-relaxed text-text-secondary">
        {{ item.deskripsi || 'Program pendidikan kesetaraan jenjang SMA/SLTA sederajat' }}
      </p>
    </div>

    <div class="mt-auto flex items-center justify-end">
      <button
        type="button"
        class="admin-program-card-button inline-flex h-[38px] items-center justify-center rounded-full border border-brand px-5 font-heading text-[13px] font-semibold leading-none text-brand transition-colors hover:bg-primary-50 focus:outline-none focus:ring-2 focus:ring-brand/20"
        @click="$emit('manage-registration', item)"
      >
        Kelola Pendaftaran
      </button>
    </div>
  </article>
</template>

<style scoped>
@media (max-width: 1439px) {
  .admin-program-card {
    height: 232px;
    border-radius: 22px;
    padding: 22px;
  }

  .admin-program-card-title {
    font-size: 19px;
  }

  .admin-program-card-description {
    margin-top: 12px;
    font-size: 13px;
    line-height: 1.6;
  }
}

@media (max-height: 820px) {
  .admin-program-card {
    height: 212px;
    border-radius: 20px;
    padding: 20px;
  }

  .admin-program-card-title {
    font-size: 18px;
  }

  .admin-program-card-description {
    -webkit-line-clamp: 3;
    margin-top: 10px;
    font-size: 13px;
    line-height: 1.5;
  }

  .admin-program-card-button {
    height: 34px;
    padding-inline: 16px;
    font-size: 12px;
  }
}
</style>
