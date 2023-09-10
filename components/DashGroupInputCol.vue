<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  label?: string;
  modelValue: never;
  mainClass?: string;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="flex flex-col gap-1" :class="mainClass">
    <span class="font-semibold">{{ label }}</span>
    <DashGroupInputBase
      v-bind="$attrs"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>
