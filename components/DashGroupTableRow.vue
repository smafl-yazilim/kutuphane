<script setup lang="ts">
const props = defineProps<{
  items: Array<string | [string, string]>;
  isTitle: boolean;
  actions?: Array<{
    icon: string;
    altText: string;
    theme?:
      | "PRIMARY"
      | "SECONDARY"
      | "SUCCESS"
      | "DANGER"
      | "WARNING"
      | "INFO"
      | "LIGHT"
      | "DARK";
    onClick: () => void;
    disabled?: boolean;
  }>;
}>();

const grid = computed(() => [
  "grid",
  `grid-cols-${props.items.length + (props.actions?.length ? 1 : 0)} gap-2`,
]);
const bg = computed(() => (props.isTitle ? "bg-gray-200" : "bg-gray-100"));
const rowStyle = computed(() => (props.isTitle ? "font-semibold" : ""));
</script>

<template>
  <div :class="[grid, bg]" class="first:rounded-t-lg last:rounded-b-lg">
    <div v-for="item in items" class="flex py-2 px-4" :class="rowStyle">
      <span :class="item[1] ?? ''">{{ Array.isArray(item) ? item[0] : item }}</span>
    </div>
    <div class="flex flex-row py-2 px-4 gap-2 w-32">
      <div class="flex flex-row gap-2 w-32">
        <ThemedButton
          v-for="action in actions"
          :icon="action.icon"
          :altText="action.altText"
          :theme="action.theme"
          @click="action.onClick"
          :disabled="action.disabled"
        />
      </div>
    </div>
  </div>
</template>

<style scoped></style>
