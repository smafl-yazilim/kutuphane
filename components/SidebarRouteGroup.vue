<script setup lang="ts">
defineProps<{
  label?: string;
}>();
</script>

<template>
  <div class="flex flex-col gap-2">
    <span
      v-if="label"
      class="uppercase tracking-widest text-gray-400 text-sm"
      >{{ label }}</span
    >
    <div class="flex flex-col gap-2">
      <slot />
    </div>
  </div>
</template>

<style scoped></style>
