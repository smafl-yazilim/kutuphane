<script setup lang="ts">
import { useAuthStore } from "~/stores/AuthStore";

const route = useRoute();
const userStore = useAuthStore();

onMounted(() => {
  watch(
      () => userStore.user,
      (user, prevUser) => {
        if (prevUser && !user && route.path.startsWith("/dashboard")) {
          navigateTo("/login");
        } else if (user && typeof route.query.redirect === "string") {
          navigateTo(route.query.redirect);
        } else if (user && route.path === "/login") {
          navigateTo("/dashboard");
        }
      }
  );
});
</script>

<template>
  <NuxtPage/>
</template>

<style>
html body {
  @apply min-h-screen;
  font-family: Inter, serif;
}
</style>
