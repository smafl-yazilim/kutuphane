<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

defineProps<{
  autocompleteItems?: string[];
}>();

const showAutocomplete = ref(false);
</script>

<template>
  <div class="relative w-full">
    <input
      v-bind="$attrs"
      class="bg-gray-100 border-gray-200 rounded-lg px-2 h-10 disabled:text-gray-700 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-black w-full"
      @focus="showAutocomplete = true"
      @blur="showAutocomplete = false"
      ref="input"
    />
    <transition
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        class="absolute z-10 mt-1 inset-x-0 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm"
        v-show="showAutocomplete && autocompleteItems?.length"
      >
        <ul>
          <li
            v-for="option in autocompleteItems"
            class="hover:bg-green-100 hover:text-green-900 text-gray-900 relative cursor-pointer select-none py-2 pl-10 pr-4"
            @click="$refs.input.value = option"
          >
            <span class="font-normal block truncate">
              {{ option }}
            </span>
          </li>
        </ul>
      </div>
    </transition>
  </div>
</template>
