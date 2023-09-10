<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
} from "@headlessui/vue";
import { ListboxOptionsT } from "~/types/PropTypes";

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  label: string;
  options: ListboxOptionsT[];
  modelValue: never;
}>();

defineEmits(["update:modelValue"]);
</script>

<template>
  <div class="flex flex-col gap-1">
    <span class="font-semibold">{{ label }}</span>
    <Listbox
      :modelValue="modelValue"
      @update:modelValue="newValue => $emit('update:modelValue', newValue)"
    >
      <div class="relative">
        <ListboxButton
          class="relative cursor-pointer w-full cursor-default rounded-lg bg-gray-200 py-2.5 pl-3 pr-10 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-black sm:text-sm"
        >
          <span class="block truncate font-semibold">{{
            options.find(a => a.value === modelValue).name ?? ""
          }}</span>
          <span
            class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2"
          >
            <Icon
              name="uil:arrows-v-alt"
              class="h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
          </span>
        </ListboxButton>
        <transition
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
        >
          <ListboxOptions
            class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-10"
          >
            <ListboxOption
              v-slot="{ active, selected }"
              v-for="option in options"
              :key="option.name"
              :value="option.value"
              as="template"
            >
              <li
                :class="[
                  active ? 'bg-green-100 text-green-900' : 'text-gray-900',
                  'relative cursor-pointer select-none py-2 pl-10 pr-4',
                ]"
              >
                <span
                  :class="[
                    selected ? 'font-medium' : 'font-normal',
                    'block truncate',
                  ]"
                >
                  {{ option.name }}
                </span>
                <span
                  v-if="selected"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-green-600"
                >
                  <Icon name="uil:check" class="w-5 h-5" aria-hidden="true" />
                </span>
              </li>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>

<style scoped></style>
