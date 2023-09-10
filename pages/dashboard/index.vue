<script setup lang="ts">
import { definePageMeta } from "#imports";
import { collection, getDocs, query, where } from "@firebase/firestore";
import { useAuthStore } from "~/stores/AuthStore";

definePageMeta({
  title: "Ödünç Bilgileri",
});

const authStore = useAuthStore();
const firestore = useFirestore();

const bookRef = query(
  collection(firestore, "books"),
  where("copies.borrowedBy", "array-contains", authStore?.auth?.uid),
);
const books = await getDocs(bookRef).then(snap =>
  snap.docs.map(doc => doc.data()),
);

// TODO
const bookRemaining = (timestamp: number) => {};

console.log(books);
</script>

<template>
  <div
    v-for="book in books"
    class="flex flex-col w-1/2 bg-white rounded-lg p-6"
  >
    <span class="font-bold text-lg"
      >Ödünç Bitiş Tarihi:
      {{
        new Intl.DateTimeFormat("tr-TR", {
          dateStyle: "full",
          timeStyle: "medium",
        }).format(
          new Date(
            book.copies.borrowedUntil[authStore.auth.uid].seconds * 1000,
          ),
        )
      }}</span
    >
    <span class="flex flex-row gap-2"
      ><span class="font-semibold">{{ book.name }}</span
      ><span>{{ book.author }}</span></span
    >
  </div>

  <pre v-for="book in books">
    {{ book }}
</pre
  >
</template>

<style scoped></style>
