<script setup lang="ts">
import type { Registration } from '~/types/adminPendaftaran'

type TabKey = 'diri' | 'ortu' | 'berkas'

defineProps<{
  modelValue: boolean
  item: Registration | null
  activeTab: TabKey
  detailTabs: Array<{ key: TabKey, label: string }>
  getOutlineStatusClass: (status: string) => string
}>()

const emit = defineEmits<{
  close: []
  'update:activeTab': [tab: TabKey]
}>()
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
      enter-to-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 backdrop-blur-[14px] [&>aside]:translate-x-0"
      leave-to-class="opacity-0 backdrop-blur-none [&>aside]:translate-x-full"
    >
      <div
        v-if="item && modelValue"
        class="fixed inset-0 z-50 bg-text-primary/20 backdrop-blur-[14px]"
        style="--detail-drawer-width: min(1080px, calc(100% - 320px));"
        @click.self="emit('close')"
      >
        <aside class="relative z-[40] ml-auto flex h-full w-[var(--detail-drawer-width)] flex-col overflow-hidden border-l-2 border-border bg-bg-base shadow-[rgba(0,0,0,0.08)_-12px_0_32px_0]">
          <PendaftaranIdentityHeader
            :item="item"
            :active-tab="activeTab"
            :detail-tabs="detailTabs"
            :get-outline-status-class="getOutlineStatusClass"
            @close="emit('close')"
            @update:active-tab="emit('update:activeTab', $event)"
          />

          <main class="min-h-0 grow overflow-y-auto">
            <div class="mx-auto w-full max-w-5xl px-8 py-6">
              <slot />
            </div>
          </main>

          <slot name="footer" />
        </aside>

        <slot name="overlay" />
      </div>
    </Transition>
  </Teleport>
</template>
