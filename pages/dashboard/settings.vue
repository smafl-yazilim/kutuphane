<script setup lang="ts">
import { definePageMeta } from "#imports";
import { doc, DocumentReference, getDoc, setDoc } from "firebase/firestore";
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/AuthStore";
import { Settings } from "~/types/FirestoreTypes";

definePageMeta({
    title: "Ayarlar",
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { $toast } = useNuxtApp();
const firestore = useFirestore();

const settingsRef = doc(firestore, "settings", "library") as DocumentReference<Settings>;
const _settings = await getDoc<Settings>(settingsRef).then(snap => snap.data());

if (!_settings) throw createError({
    statusCode: 500,
    message: "Ayarlar yüklenemedi.",
    fatal: true,
});

const settings = ref<Settings>(_settings);
const saveSettings = async () => {
    console.log("t")

    await setDoc(settingsRef, settings.value)
        .then(() => $toast.success("Ayarlar kaydedildi."))
        .catch(() => $toast.error("Ayarlar kaydedilemedi."));
};
</script>

<template>
    <div class="grid grid-cols-3 gap-4">
        <DashGroup>
            <DashGroupTitle label="Ödünç Limitleri" icon="book-reader" />
            <DashGroupBody class="flex flex-col gap-2">
                <DashGroupInputRow label="Ödünç Kitap Sayısı:" type="number" min="0" v-model="settings.borrowingLimits.amount" :disabled="user!.role < 2"/>
                <DashGroupInputRow label="Ödünç Süresi (Gün):" type="number" min="0" v-model="settings.borrowingLimits.days" :disabled="user!.role < 2"/>
            </DashGroupBody>
            <DashGroupButtonRow>
                <DashGroupButton label="Kaydet" icon="save" theme="SUCCESS" :disabled="user!.role < 2" @click="saveSettings" />
            </DashGroupButtonRow>
        </DashGroup>
    </div>
</template>
