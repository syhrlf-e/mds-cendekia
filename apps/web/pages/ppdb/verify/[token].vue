<script setup lang="ts">
const route = useRoute()

const token = computed(() => {
  const value = Array.isArray(route.params.token) ? route.params.token[0] : route.params.token
  return String(value || '').trim()
})

await navigateTo(`/ppdb/verify-email/${encodeURIComponent(token.value)}`, {
  redirectCode: 302,
  replace: true
})
</script>

<template>
  <div />
</template>
