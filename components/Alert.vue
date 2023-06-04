<script setup lang="ts">
const props = defineProps<{
    theme: "SUCCESS" | "DANGER" | "WARNING" | "INFO";
    label?: string;
}>();

const [colorTheme, icon , themeLabel] = computed(() => {
    switch (props.theme) {
        case "SUCCESS":
            return ["bg-green-200 text-green-700", "uil:check-circle", "NOT"];
        case "DANGER":
            return ["bg-red-200 text-red-700", "uil:exclamation-triangle", "UYARI"];
        case "WARNING":
            return ["bg-yellow-200 text-yellow-700", "uil:exclamation-triangle", "UYARI"];
        case "INFO":
            return ["bg-blue-200 text-blue-700", "uil:info-circle", "NOT"];
    }
}).value;

</script>

<template>
    <div class="flex flex-col rounded-md p-2" :class="colorTheme">
        <div class="flex flex-row items-center gap-2">
            <Icon :name="icon" class="h-3/4 w-auto" />
            <span class="font-semibold">{{ label?.toUpperCase() ?? themeLabel }}</span>
        </div>
        <div class="flex flex-col">
            <slot />
        </div>
    </div>
</template>

<style scoped>

</style>
