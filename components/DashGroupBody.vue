<script setup lang="ts">
const props = defineProps<{
  cols?: number;
  gaps?: number;
}>();

const style = computed(
  () => `grid grid-cols-${props.cols ?? 1} gap-x-4 ${props.gaps ?? 4} gap-y-2`,
);
</script>

<template>
  <div :class="style">
    <slot />
  </div>
</template>
