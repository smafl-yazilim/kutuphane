<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  modelValue: number;
  min: number;
  max: number;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="flex flex-row">
    <ThemedButton
      icon="angle-left"
      class="!rounded-none !rounded-l-md"
      :disabled="min === modelValue"
      @click="$emit('update:modelValue', modelValue - 1)"
    />
    <ThemedButton
      :label="modelValue.toString()"
      class="!rounded-none !bg-opacity-100 disabled:cursor-default"
      disabled="true"
    />
    <ThemedButton
      icon="angle-right"
      class="!rounded-none !rounded-r-md"
      :disabled="max === modelValue"
      @click="$emit('update:modelValue', modelValue + 1)"
    />
  </div>
</template>

<style scoped></style>
