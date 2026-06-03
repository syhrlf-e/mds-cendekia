<script setup lang="ts">
definePageMeta({
  middleware: ['admin-auth']
})

await navigateTo('/dashboard')
</script>

<template>
  <div />
</template>
