<script setup lang="ts">
const props = defineProps<{
    label: string;
    icon?: string;
    theme?: "PRIMARY" | "SECONDARY" | "SUCCESS" | "DANGER" | "WARNING" | "INFO" | "LIGHT" | "DARK";
}>();

const colorTheme = computed(() => {
    switch (props.theme) {
        case "PRIMARY":
            return "bg-blue-500 focus-visible:ring-blue-600";
        case "SECONDARY":
            return "bg-gray-500 focus-visible:ring-gray-600";
        case "SUCCESS":
            return "bg-green-500 focus-visible:ring-green-600";
        case "DANGER":
            return "bg-red-500 focus-visible:ring-red-600";
        case "WARNING":
            return "bg-yellow-500 focus-visible:ring-yellow-600";
        case "INFO":
            return "bg-blue-400 focus-visible:ring-blue-600";
        case "LIGHT":
            return "bg-gray-300 !text-gray-800 focus-visible:ring-gray-600";
        case "DARK":
            return "bg-gray-800 focus-visible:ring-gray-900";
        default:
            return "bg-gray-500 focus-visible:ring-gray-700";
    }
});
const uilIcon = computed(() => `uil:${props.icon}`);
</script>

<template>
    <button
        type="submit"
        class="flex flex-row items-center justify-center gap-2 px-4 py-2 w-full rounded-md border border-transparent font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition duration-150 disabled:cursor-not-allowed disabled:bg-opacity-60 hover:bg-opacity-80 text-white"
        :class="colorTheme"
    >
        <Icon :name="uilIcon" v-if="icon" class="h-5 w-auto"/>
        <span>{{ label }}</span>
    </button>
</template>

<style scoped>

</style>
