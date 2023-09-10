<script setup lang="ts">
import { definePageMeta } from "#imports";
import { sendPasswordResetEmail } from "@firebase/auth";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "@firebase/firestore";
import { getFunctions, httpsCallableFromURL } from "firebase/functions";
import { storeToRefs } from "pinia";
import { useAuthStore } from "~/stores/AuthStore";
import { User } from "~/types/FirestoreTypes";
import { ListboxOptionsT } from "~/types/PropTypes";
import { vInfiniteScroll } from "@vueuse/components";

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { $toast } = useNuxtApp();
const firestore = useFirestore();
const auth = useFirebaseAuth();
const app = useFirebaseApp();

if (!auth)
  throw createError({
    statusCode: 500,
    message: "Firebase Auth is not initialized.",
  });

const functions = getFunctions(app, "europe-west-1");
const createAccount = httpsCallableFromURL(
  functions,
  "https://createaccount-kswdabpqrq-ew.a.run.app",
  { limitedUseAppCheckTokens: true },
);

definePageMeta({
  title: "Üyelik İşlemleri",
});

const newUser = ref({
  name: "",
  surname: "",
  studentNumber: "",
  role: 0,
  email: "",
});

const roleOptions = [
  { name: "Öğrenci", value: 0, disabled: false },
  {
    name: "Nöbetçi / Görevli",
    value: 1,
    disabled: !!user.value && user.value.role <= 1,
  },
  {
    name: "Öğretmen / Teknik Sorumlu",
    value: 2,
    disabled: !!user.value && user.value.role <= 2,
  },
] satisfies ListboxOptionsT[];

const userFilter = ref({
  studentNumber: "",
});

const users = collection(firestore, "users");
const pending = ref(false);
async function createUser() {
  createAccount(newUser.value)
    .then(() => {
      $toast.success("Kayıt tamamlandı.");
      sendPasswordResetEmail(auth!, newUser.value.email, {
        url: location.origin,
      })
        .then(() =>
          $toast.success("Kullanıcıya şifre sıfırlama e-postası gönderildi."),
        )
        .catch(() =>
          $toast.error("Kullanıcıya şifre sıfırlama e-postası gönderilemedi."),
        );
    })
    .catch((err: Error) => $toast.error(err.message));
}

const results = ref<User[]>();
async function searchUsers(push = true) {
  pending.value = true;

  const q = query(
    users,
    ...(userFilter.value.studentNumber
      ? [where("studentNumber", "==", userFilter.value.studentNumber)]
      : []),
    orderBy("name", "asc"),
    limit(10),
  );
  const { docs } = await getDocs(q);
  results.value = docs.map(x => x.data() as User);

  if (results.value.length)
    $toast.success(`${results.value.length} üye bulundu.`);
  else $toast.error("Hiçbir üye bulunamadı.");

  pending.value = false;
}

const tableTitle = ["Ad", "Soyad", "Öğrenci No", "Rol"];
const resultRows = computed(
  () =>
    results.value?.map((x: User) => [
      x.name,
      x.surname,
      x.studentNumber,
      roleOptions.find(y => y.value === x.role)?.name ?? "Bilinmiyor",
    ]),
);

const asd = ref<string[][]>([
  ["1"],
  ["2"],
  ["3"],
  ["4"],
  ["5"],
  ["6"],
  ["7"],
  ["8"],
  ["9"],
]);
const scroll = () => {
  // @ts-ignore
  asd.value.push([(Number(asd.value[asd.value.length - 1][0]) + 1).toString()]);
};
</script>

<template>
  <div class="grid grid-cols-2 gap-4">
    <DashGroup>
      <DashGroupTitle label="Yeni Üye Kaydı" icon="user-plus" />
      <DashGroupBody :cols="2">
        <DashGroupInputCol label="Ad" v-model="newUser.name" />
        <DashGroupInputCol label="Soyad" v-model="newUser.surname" />
        <DashGroupInputCol
          label="Okul Numarası"
          v-model="newUser.studentNumber"
        />
        <DashGroupListbox
          label="Rol"
          v-model="newUser.role"
          :options="roleOptions"
        />
        <DashGroupInputCol
          label="E-Posta"
          type="email"
          v-model="newUser.email"
          mainClass="col-span-2"
        />
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton
          label="Kaydet"
          icon="save"
          theme="SUCCESS"
          @click="createUser"
        />
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup>
      <DashGroupTitle label="Üyeleri Listele" icon="users-alt" />
      <DashGroupBody :cols="1">
        <DashGroupInputCol
          label="Okul Numarası"
          v-model="userFilter.studentNumber"
        />
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton
          label="Listele"
          icon="search"
          theme="SUCCESS"
          @click="searchUsers"
          :disabled="pending"
        />
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup v-if="results" class="col-span-2">
      <DashGroupTitle label="Sonuçlar" icon="file-search-alt" />
      <DashGroupTable v-if="resultRows?.length" v-infinite-scroll="scroll">
        <DashGroupTableRow :items="tableTitle" :isTitle="true" />
        <DashGroupTableRow
          v-for="row in resultRows"
          :items="row"
          :isTitle="false"
        />
      </DashGroupTable>
      <div v-else>
        <Alert label="Sonuç bulunamadı." theme="INFO" />
      </div>
    </DashGroup>
  </div>
</template>

<style scoped></style>
