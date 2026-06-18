<script setup lang="ts">
import { FileText, X } from 'lucide-vue-next'
import { computed, reactive, watch } from 'vue'
import type { OrganizationMember } from '~/types/adminOrganization'

const props = defineProps<{
  modelValue: boolean
  mode?: 'create' | 'edit'
  chairs: OrganizationMember[]
  item?: OrganizationMember | null
  saving?: boolean
}>()

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void
  (event: 'submit', payload: { chairId: number; sambutan: string }): void
}>()

const isEditMode = computed(() => props.mode === 'edit')
const chairOptions = computed(() =>
  props.chairs.map(member => ({
    label: `${member.jabatan} - ${member.nama}`,
    value: member.id
  }))
)
const selectedChair = computed(() =>
  props.chairs.find(member => member.id === Number(form.chairId)) ?? null
)

const form = reactive({
  chairId: '' as number | '',
  sambutan: ''
})

const errors = reactive({
  chairId: '',
  sambutan: ''
})

const closeDrawer = () => {
  if (props.saving) return
  emit('update:modelValue', false)
}

const resetForm = () => {
  const defaultChair = props.item ?? props.chairs.find(member => member.sambutan) ?? props.chairs[0] ?? null

  form.chairId = defaultChair?.id ?? ''
  form.sambutan = defaultChair?.sambutan ?? ''
  errors.chairId = ''
  errors.sambutan = ''
}

const validate = () => {
  errors.chairId = form.chairId ? '' : 'Pemberi sambutan wajib dipilih.'
  errors.sambutan = form.sambutan.trim() ? '' : 'Kata sambutan wajib diisi.'

  return !errors.chairId && !errors.sambutan
}

const submitForm = () => {
  if (!validate() || !form.chairId) return

  emit('submit', {
    chairId: Number(form.chairId),
    sambutan: form.sambutan.trim()
  })
}

watch(() => [props.modelValue, props.item, props.chairs.length], ([isOpen]) => {
  if (isOpen) resetForm()
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-[opacity,backdrop-filter] duration-300 ease-out [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-out"
      enter-from-class="opacity-0 [&>aside]:translate-x-full"
      enter-to-class="opacity-100 [&>aside]:translate-x-0"
      leave-active-class="transition-[opacity,backdrop-filter] duration-300 ease-in [&>aside]:transition-transform [&>aside]:duration-300 [&>aside]:ease-in"
      leave-from-class="opacity-100 [&>aside]:translate-x-0"
      leave-to-class="opacity-0 [&>aside]:translate-x-full"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
        @click.self="closeDrawer"
      >
        <aside class="admin-yayasan-drawer relative ml-auto flex h-full w-[min(620px,calc(100%-280px))] flex-col overflow-hidden border-l border-border-soft bg-bg-surface shadow-2xl 2xl:w-[620px]">
          <header class="admin-yayasan-drawer-header shrink-0 border-b border-border-soft bg-bg-surface px-8 py-6">
            <div class="flex items-center justify-between gap-6">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-brand">
                  <FileText class="h-6 w-6" />
                </div>
                <div>
                  <p class="font-heading text-sm font-medium text-text-muted">Kata Sambutan</p>
                  <h2 class="mt-1 font-heading text-xl font-bold text-text-primary">
                    {{ isEditMode ? 'Edit Sambutan' : 'Tambah Sambutan' }}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-bg-base hover:text-text-primary focus:outline-none"
                :disabled="saving"
                @click="closeDrawer"
              >
                <X class="h-5 w-5" />
              </button>
            </div>
          </header>

          <form class="flex min-h-0 grow flex-col" @submit.prevent="submitForm">
            <main class="admin-yayasan-drawer-body min-h-0 grow overflow-y-auto px-8 py-8">
              <div class="admin-yayasan-drawer-stack space-y-6">
                <section class="admin-yayasan-drawer-card rounded-[24px] border border-border-soft bg-bg-base p-6">
                  <AppSelect
                    v-model="form.chairId"
                    label="Pemberi Sambutan"
                    :options="chairOptions"
                    placeholder="Pilih ketua pemberi sambutan"
                    :error="errors.chairId"
                    :disabled="saving"
                    required
                  />
                </section>

                <section
                  v-if="selectedChair"
                  class="admin-yayasan-drawer-card admin-yayasan-chair-card rounded-[24px] border border-border-soft bg-bg-base p-6"
                >
                  <p class="font-heading text-sm font-semibold text-text-primary">{{ selectedChair.nama }}</p>
                  <p class="mt-1 font-body text-sm text-text-secondary">{{ selectedChair.jabatan }}</p>
                </section>

                <section class="admin-yayasan-drawer-card admin-yayasan-sambutan-card rounded-[24px] border border-border-soft bg-bg-base p-6">
                  <AppTextarea
                    v-model="form.sambutan"
                    label="Kata Sambutan"
                    placeholder="Tulis kata sambutan yang akan ditampilkan di halaman publik..."
                    :rows="8"
                    :error="errors.sambutan"
                    :disabled="saving"
                  />
                </section>
              </div>
            </main>

            <footer class="admin-yayasan-drawer-footer shrink-0 border-t border-border-soft bg-bg-surface px-8 py-5">
              <div class="flex justify-end gap-3">
                <AppButton variant="ghost" type="button" :disabled="saving" @click="closeDrawer">
                  Batal
                </AppButton>
                <AppButton type="submit" :loading="saving">
                  {{ isEditMode ? 'Simpan Perubahan' : 'Tambah Sambutan' }}
                </AppButton>
              </div>
            </footer>
          </form>
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
@media (max-height: 820px) {
  .admin-yayasan-drawer {
    width: min(600px, calc(100% - 280px));
  }

  .admin-yayasan-drawer-header,
  .admin-yayasan-drawer-body,
  .admin-yayasan-drawer-footer {
    padding-left: 24px;
    padding-right: 24px;
  }

  .admin-yayasan-drawer-header {
    padding-top: 18px;
    padding-bottom: 18px;
  }

  .admin-yayasan-drawer-body {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .admin-yayasan-drawer-footer {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .admin-yayasan-drawer-stack > :not([hidden]) ~ :not([hidden]) {
    --tw-space-y-reverse: 0;
    margin-top: calc(20px * calc(1 - var(--tw-space-y-reverse)));
    margin-bottom: calc(20px * var(--tw-space-y-reverse));
  }

  .admin-yayasan-drawer-card {
    padding: 20px;
  }

  .admin-yayasan-chair-card {
    padding-top: 16px;
    padding-bottom: 16px;
  }

  .admin-yayasan-sambutan-card :deep(textarea) {
    min-height: 180px;
  }
}

@media (max-width: 1279px) {
  .admin-yayasan-drawer {
    width: min(600px, calc(100% - 264px));
  }
}
</style>
