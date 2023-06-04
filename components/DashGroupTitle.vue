<script setup lang="ts">
const props = defineProps<{
    label: string;
    icon: string;
}>();

const uilIcon = computed(() => `uil:${props.icon}`);
</script>

<template>
    <div class="flex flex-row items-center gap-2">
        <Icon :name="uilIcon" class="h-5/6 w-auto"/>
        <span class="font-bold text-2xl">{{ label }}</span>
    </div>
</template>
