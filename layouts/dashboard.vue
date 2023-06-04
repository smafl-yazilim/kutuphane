<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useFirestore } from "vuefire";
import { useAuthStore } from "~/stores/AuthStore";

const db = useFirestore();
const route = useRoute();

const auth = useAuthStore();
const { user } = storeToRefs(auth);

</script>

<template>
  <!--suppress VueMissingComponentImportInspection -->
  <Toaster position="bottom-right" />

  <div class="absolute top-0 left-0 h-screen w-full bg-gray-200 -z-50"></div>
  <div class="flex flex-row h-screen w-full">
      <div class="flex flex-col w-1/4 h-screen bg-white py-8 gap-5 px-4">
          <div class="flex flex-col items-center gap-2 mb-2">
              <img src="~/assets/smafl.webp" alt="ŞMAFL" class="rounded-full w-2/5">
              <span class="font-semibold text-xl text-center">Şehit Münir Alkan Fen Lisesi</span>
          </div>
          <SidebarRouteGroup label="KULLANICI">
            <SidebarRoute to="/dashboard" label="Ödünç Bilgileri" icon="book-reader" />
          </SidebarRouteGroup>
          <SidebarRouteGroup label="YÖNETİM">
              <SidebarRoute to="/dashboard/borrow" label="Ödünç İşlemleri" icon="book-reader" />
              <SidebarRoute to="/dashboard/members" label="Üyelik İşlemleri" icon="user" />
              <SidebarRoute to="/dashboard/books" label="Kitaplar" icon="books" />
              <SidebarRoute to="/dashboard/settings" label="Ayarlar" icon="cog" />
          </SidebarRouteGroup>
          <div class="flex flex-col gap-4 grow justify-end">
              <div class="flex flex-col gap-2 items-center justify-end grow ">
                  <icon name="uil:user" class="bg-gray-200 rounded-full text-gray-500 p-2 h-1/2 w-auto"/>
                  <span v-if="user" class="text-xl font-semibold text-center">{{ `${user.name} ${user.surname}` }}</span>
              </div>
              <SidebarRoute to="/?logout" label="Çıkış Yap" icon="signout" />
          </div>
      </div>
      <div class="flex flex-col w-full">
          <!--suppress TypeScriptUnresolvedReference -->
          <div class="flex flex-row py-6 px-8 font-bold text-3xl">
              {{ route.meta.title }}
          </div>
          <div class="w-full h-full px-8 py-4">
              <slot />
          </div>
      </div>
  </div>
</template>

<style scoped>

</style>
