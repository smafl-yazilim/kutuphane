<script setup lang="ts">
const props = defineProps<{
  to: string,
  label: string,
  icon: string,
}>();

const iconName = computed(() => `uil:${props.icon}`);
</script>

<template>
  <NuxtLink :to="to" class="flex flex-row items-center gap-2 border border-gray-100 hover:bg-gray-100 duration-150 rounded-lg p-2" exactActiveClass="bg-gray-100">
    <icon :name="iconName" class="h-3/4 px-1 text-3xl w-auto text-gray-500"/>
    <span>{{ label }}</span>
  </NuxtLink>
</template>

<style scoped>

</style>
