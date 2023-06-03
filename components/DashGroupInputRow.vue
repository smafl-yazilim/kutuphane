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
    <div class="flex flex-row items-center gap-2">
        <span class="font-semibold mr-auto">{{ label }}</span>
        <DashGroupInput v-bind="$attrs" class="ml-auto" :value="modelValue" @input="$emit('update:modelValue', $event.target.value)"/>
    </div>
</template>
