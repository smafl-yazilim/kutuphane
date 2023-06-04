<script setup lang="ts">
defineOptions({
    inheritAttrs: false,
});

defineProps<{
    label?: string;
    modelValue: never;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
    <div class="flex flex-col gap-1">
        <span class="font-semibold">{{ label }}</span>
        <DashGroupInput v-bind="$attrs" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"/>
    </div>
</template>
