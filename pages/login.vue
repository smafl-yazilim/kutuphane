<script setup lang="ts">
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "@firebase/auth";
import { ref } from "vue";
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
} from "@headlessui/vue";
import { useAuthStore } from "~/stores/AuthStore";

const { $toast } = useNuxtApp();
const auth = useAuthStore();
const firebaseAuth = useFirebaseAuth();
const route = useRoute();

const pwdResetModalIsOpen = ref(false);

function closePwdResetModal() {
  pwdResetModalIsOpen.value = false;
}
function openPwdResetModal() {
  pwdResetModalIsOpen.value = true;
}

const passwordResetEmail = ref("");

async function resetPassword(e: Event) {
  e.preventDefault();

  if (firebaseAuth)
    await sendPasswordResetEmail(firebaseAuth, passwordResetEmail.value)
      .then(() => {
        $toast.success(
          "Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.",
        );
      })
      .catch(err => {
        console.error(err);

        const errMsg =
          (
            {
              "auth/invalid-email": "Geçersiz e-posta adresi",
              "auth/user-not-found": "Kullanıcı bulunamadı",
            } as Record<string, string>
          )[err.code] ?? `Bir hata oluştu. (${err.code})`;

        return $toast.error(errMsg);
      });

  pwdResetModalIsOpen.value = false;
  passwordResetEmail.value = "";
}

const user = ref({
  email: "",
  password: "",
});
async function login(e: Event) {
  e.preventDefault();

  if (firebaseAuth)
    await signInWithEmailAndPassword(
      firebaseAuth,
      user.value.email,
      user.value.password,
    )
      .then(() => {
        $toast.success("Giriş başarılı.");
      })
      .catch(err => {
        console.error(err);

        const errMsg =
          (
            {
              "auth/invalid-email": "Geçersiz e-posta adresi",
              "auth/user-disabled": "Kullanıcı devre dışı bırakıldı",
              "auth/user-not-found": "Kullanıcı bulunamadı",
              "auth/wrong-password": "Hatalı şifre",
            } as Record<string, string>
          )[err.code] ?? `Bir hata oluştu. (${err.code})`;
        return $toast.error(errMsg);
      });
}
</script>

<template>
  <!--suppress VueMissingComponentImportInspection -->
  <Toaster position="top-center" />

  <TransitionRoot appear :show="pwdResetModalIsOpen" as="template">
    <Dialog
      as="div"
      @close="closePwdResetModal as boolean"
      class="relative z-10"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black bg-opacity-25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div
          class="flex min-h-full items-center justify-center p-4 text-center"
        >
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all"
            >
              <DialogTitle
                as="h3"
                class="text-lg font-medium leading-6 text-gray-900"
              >
                Şifreni Sıfırla
              </DialogTitle>
              <form action="#" @submit="resetPassword">
                <div class="mt-2">
                  <div>
                    <label for="email-address" class="sr-only"
                      >E-Posta Adresi</label
                    >
                    <input
                      id="email-address"
                      v-model="passwordResetEmail"
                      name="email"
                      type="email"
                      autocomplete="email"
                      required
                      class="relative block w-full rounded-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="E-Posta Adresi"
                    />
                  </div>
                </div>
                <div
                  class="flex flex-row items-end justify-end w-full gap-2 mt-4"
                >
                  <button
                    type="button"
                    class="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                    @click="closePwdResetModal"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    ref="resetPasswordEmail"
                  >
                    Şifreyi Sıfırla
                  </button>
                </div>
              </form>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>

  <div class="absolute top-0 left-0 h-screen w-full bg-white -z-50"></div>
  <div class="absolute top-0 left-0 z-10">
    <NuxtLink
      to="/"
      class="text-slate-950 relative group text-lg px-3 duration-150 flex flex-row items-center mt-4 ml-3"
    >
      <icon
        class="h-12 px-1 text-3xl absolute left-0 top-[50%] -translate-y-[50%] group-hover:-left-1.5 transition-all"
        name="uil:arrow-left"
      />
      <span class="ml-4 inline-block">Anasayfaya Dön</span>
    </NuxtLink>
  </div>
  <div class="relative flex flex-row flex-start w-full h-screen">
    <div
      class="flex flex-col md:w-1/2 w-full bg-white items-center justify-center"
    >
      <div
        class="flex flex-col gap-4 md:w-1/2 w-3/4 items-center justify-center mb-8"
      >
        <img
          src="~/assets/smafl.webp"
          alt="ŞMAFL"
          class="rounded-full w-2/5 h-auto"
        />
        <h1 class="text-2xl text-center font-semibold">
          Şehit Münir Alkan Fen Lisesi Kütüphanesi
        </h1>
      </div>
      <form
        class="space-y-6 md:w-1/2 w-3/4"
        action="#"
        method="POST"
        @submit="login"
      >
        <div class="-space-y-px rounded-md shadow-sm">
          <div>
            <label for="email-address" class="sr-only">E-Posta Adresi</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              v-model="user.email"
              required
              class="relative block w-full rounded-t-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="E-Posta Adresi"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Şifre</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              v-model="user.password"
              required
              class="relative block w-full rounded-b-md border-0 py-2 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Şifre"
            />
          </div>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <button
              @click="openPwdResetModal()"
              type="button"
              class="font-medium text-blue-600 hover:text-blue-500"
            >
              Şifreni mi Unuttun?
            </button>
          </div>
        </div>
        <div>
          <button
            type="submit"
            class="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <span class="absolute inset-y-0 left-0 flex items-center pl-3">
              <svg
                class="h-5 w-5 text-blue-500 group-hover:text-blue-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
            Giriş Yap
          </button>
        </div>
      </form>
    </div>
    <div
      class="hidden md:flex flex-col md:w-1/2 bg-gray-100 items-center justify-center m-8 rounded-2xl"
    >
      <div class="flex flex-col w-3/5 items-center justify-center gap-8">
        <img src="~/assets/bookshelves.svg" alt="" class="h-auto" />
        <img
          src="~/assets/aosi.svg"
          alt="Hayatta en hakiki mürşit ilimdir."
          class="w-full h-auto"
        />
      </div>
    </div>
  </div>
</template>

<style>
body {
  @apply max-h-screen bg-white;
  font-family: Inter, serif;
}
</style>
