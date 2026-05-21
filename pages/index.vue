<script setup lang="ts">
definePageMeta({
  middleware: () => {
    return navigateTo('/ppdb', { redirectCode: 302 })
  }
})
</script>

<template>
  <div />
</template>
