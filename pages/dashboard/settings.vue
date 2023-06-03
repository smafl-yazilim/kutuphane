<script setup lang="ts">
import { definePageMeta } from "#imports";
import { doc, getDoc } from "firebase/firestore";
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/AuthStore";

definePageMeta({
    title: "Ayarlar",
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const firestore = useFirestore();

const settingsRef = doc(firestore, "settings", "library");
const settings = await getDoc(settingsRef).then(snap => snap.data());

</script>

<template>
<div class="grid grid-cols-3 gap-4">
    <div class="flex flex-col p-6 rounded-xl bg-white gap-3">
        <div class="flex flex-row items-center gap-2">
            <Icon name="uil:book-reader" class="h-5/6 w-auto"/>
            <span class="font-bold text-2xl">Ödünç Limitleri</span>
        </div>
        <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center gap-2">
                <span class="font-semibold mr-auto">Ödünç Kitap Sayısı:</span>
                <input type="number" min="0" :value="settings.borrowingLimits.amount" :disabled="user.role < 2" class="ml-auto bg-gray-200 border-gray-200 rounded-lg p-2 w-1/3 disabled:text-gray-700 disabled:cursor-not-allowed"/>
            </div>
            <div class="flex flex-row items-center gap-2">
                <span class="font-semibold mr-auto">Ödünç Süresi (Gün):</span>
                <input type="number" min="0" :value="settings.borrowingLimits.days" :disabled="user.role < 2" class="ml-auto bg-gray-200 border-gray-200 rounded-lg p-2 w-1/3 disabled:text-gray-700 disabled:cursor-not-allowed"/>
            </div>
        </div>
        <div class="flex flex-row-reverse items-center">
            <button
                type="submit"
                class="inline-flex gap-2 w-full justify-center rounded-md border border-transparent bg-green-300 px-4 py-2 font-medium text-green-900 hover:bg-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 items-center transition duration-150 disabled:cursor-not-allowed disabled:hover:bg-green-300"
                :disabled="user.role < 2"
            >
                <Icon name="uil:save" class="h-full w-auto"/> Kaydet
            </button>
        </div>
    </div>
</div>
</template>

<style scoped>

</style>
