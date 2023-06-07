<script setup lang="ts">
import { definePageMeta } from "#imports";
import { sendEmailVerification } from "firebase/auth";
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/AuthStore";

const authStore = useAuthStore();
const { auth, user } = storeToRefs(authStore);
const { $toast } = useNuxtApp();

definePageMeta({
    title: "Kullanıcı Ayarları",
});

const mailData = ref({
    currentEmail: auth.value?.email,
    newEmail: "",
    password: "",
    verified: auth.value?.emailVerified ?? false,
});

const passwordData = ref({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
});

const updating = ref(false);

async function updateMailAddress() {
    if (mailData.value.currentEmail === mailData.value.newEmail) return $toast.error("Yeni e-posta adresi mevcut e-posta adresiyle aynı.");

    updating.value = true;

    await authStore.updateEmail(mailData.value.newEmail, mailData.value.password)
        .then(() => {
            mailData.value = {
                currentEmail: mailData.value.newEmail,
                newEmail: "",
                password: "",
                verified: false,
            };

            if (auth.value) sendEmailVerification(auth.value, { url: location.href });

            $toast.success("E-Posta adresi güncellendi.");
        })
        .catch(err => {
        console.error(err);

        const errMsg = ({
            "auth/wrong-password": "Şifre hatalı.",
            "auth/email-already-in-use": "Bu e-posta adresi zaten kullanılıyor.",
        } as Record<string, string>)[err.code] ?? `Bir hata oluştu. (${err.code})`;

        $toast.error(errMsg);
    });

    updating.value = false;
}

async function updatePassword() {
    if (passwordData.value.newPassword !== passwordData.value.confirmPassword) return $toast.error("Yeni şifreler birbiriyle uyuşmuyor.");

    updating.value = true;

    await authStore.updatePassword(passwordData.value.oldPassword, passwordData.value.newPassword)
        .then(() => $toast.success("Şifre güncellendi."))
        .catch(err => {
        console.error(err);

        const errMsg = ({
            "auth/wrong-password": "Eski şifre hatalı.",
        } as Record<string, string>)[err.code] ?? `Bir hata oluştu. (${err.code})`;

        $toast.error(errMsg);
    });

    updating.value = false;
}
function resendVerification() {
    if (!auth.value) return;
    return sendEmailVerification(auth.value, { url: location.href })
        .then(() => $toast.success("Doğrulama e-postası gönderildi."))
        .catch(() => $toast.error("Doğrulama e-postası gönderilemedi."));
}
</script>

<template>
    <div class="grid grid-cols-3 gap-4">
        <DashGroup>
            <DashGroupTitle label="E-Posta Adresi" icon="envelope"/>
            <DashGroupBody>
                <DashGroupInputCol label="Güncel E-Posta Adresi" name="current-mail" v-model="mailData.currentEmail" disabled="true"/>
                <DashGroupInputCol label="Yeni E-Posta Adresi" name="new-mail" v-model="mailData.newEmail"/>
                <DashGroupInputCol label="Şifre" type="password" name="password" v-model="mailData.password"/>
                <Alert v-if="!mailData.verified" label="Doğrulanmamış E-Posta" theme="DANGER" class="my-2">
                    <span class="inline">
                        E-Posta adresinizi doğrulamak size gönderilen <span class="whitespace-nowrap">e-postadaki</span> bağlantıya tıklayın.
                        Spam/gereksiz kutunuzu kontrol etmeyi unutmayın.
                    </span>
                    <button class="bg-none hover:underline text-left" @click="resendVerification">
                        <strong>Doğrulama bağlantısını tekrar gönder.</strong>
                    </button>
                </Alert>
            </DashGroupBody>
            <DashGroupButtonRow>
                <ThemedButton
                    label="Güncelle"
                    icon="save"
                    theme="SUCCESS"
                    @click="updateMailAddress"
                    :disabled="!mailData.newEmail || !mailData.password || updating"
                />
            </DashGroupButtonRow>
        </DashGroup>
        <DashGroup>
            <DashGroupTitle label="Şifre" icon="key-skeleton-alt"/>
            <DashGroupBody>
                <DashGroupInputCol label="Eski Şifre" type="password" name="currentpassword" v-model="passwordData.oldPassword" autocomplete="old-password" />
                <DashGroupInputCol label="Yeni Şifre" type="password" name="new-password" v-model="passwordData.newPassword" autocomplete="new-password" />
                <DashGroupInputCol label="Yeni Şifre (Tekrar)" type="password" name="confirm-password" v-model="passwordData.confirmPassword" autocomplete="new-password" />
            </DashGroupBody>
            <DashGroupButtonRow>
                <ThemedButton
                    label="Güncelle"
                    icon="save"
                    theme="SUCCESS"
                    @click="updatePassword"
                    :disabled="!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword || updating"
                />
            </DashGroupButtonRow>
        </DashGroup>
    </div>
</template>

<style scoped>

</style>
