<script setup lang="ts">
const route = useRoute()
</script>

<template>
  <div>
    <PublicNavbar />
    <slot />
    <PublicFooter v-if="!route.meta.hideFooter" />
  </div>
</template>
