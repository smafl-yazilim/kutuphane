<script setup lang="ts">
import { definePageMeta } from "#imports";
import { collection, getDocs, query, Timestamp, where } from "@firebase/firestore";
import { useAuthStore } from "~/stores/AuthStore";
import { Book, Settings, User } from "~/types/FirestoreTypes";
import { doc, getDoc } from "firebase/firestore";
import { storeToRefs } from "pinia";

definePageMeta({
  title: "Ödünç Bilgileri",
});

const authStore = useAuthStore();
const { auth } = storeToRefs(authStore);
const firestore = useFirestore();

const booksRef = collection(firestore, "books");
const settings = await getDoc(doc(firestore, "settings", "library")).then(x => x.data() as Settings);
const borrowDuration = settings.borrowingLimits.days as number;

const results = ref<Array<Book & { id: string, expiryDate: string; expired: boolean }>>([]);
function dateCal(date: Timestamp) {
  // const startDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  const startDate = date.toDate();
  const endDate = new Date(startDate.getTime() + borrowDuration * 24 * 60 * 60 * 1000);
  return {
    expiryDate: endDate.toLocaleDateString(),
    expired: endDate.getTime() < Date.now(),
  };
}
async function searchByStudent() {
  const uid = auth.value?.uid as string;
  const books = await getDocs(query(booksRef, where("copies.borrowedBy", "array-contains", uid)))
      .then(x => x.docs.map(a => {
        const data = a.data() as Book;
        const expiry = dateCal(data.copies.borrowedAt[uid] as Timestamp);
        return { ...data, id: a.id,...expiry };
      }));

  results.value = books;
}

await searchByStudent();
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <DashGroup v-for="res in results">
      <DashGroupTitle :label="res.name" icon="book-alt"/>
      <DashGroupTitle :label="`Son Teslim Tarihi: ${res.expiryDate}`" :class="res.expired ? ['text-red-500'] : []" />
    </DashGroup>
  </div>
</template>

<style scoped></style>
