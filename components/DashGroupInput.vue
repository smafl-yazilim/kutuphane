<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  modelValue: never;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <DashGroupInputBase
    v-bind="$attrs"
    :value="modelValue"
    @input="$emit('update:modelValue', $event.target.value)"
  />
</template>
