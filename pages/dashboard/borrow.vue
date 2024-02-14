<script setup lang="ts">
import { DialogDescription } from "@headlessui/vue";
import { useAuthStore } from "~/stores/AuthStore";
import { storeToRefs } from "pinia";
import { collection, getDocs, query, Timestamp, where } from "@firebase/firestore";
import { Book, Settings, User } from "~/types/FirestoreTypes";
import { doc, getDoc } from "firebase/firestore";
import { getFunctions, httpsCallableFromURL } from "firebase/functions";

definePageMeta({
  title: "Ödünç İşlemleri",
});


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

const booksRef = collection(firestore, "books");
const usersRef = collection(firestore, "users");
const settings = await getDoc(doc(firestore, "settings", "library")).then(x => x.data() as Settings);
const borrowDuration = settings.borrowingLimits.days as number;

const tableTitle = [
  "Kitap Adı",
  "Sınıflandırma",
  "Ödünç Alan",
  "Ödünç Alanın Numarası",
  "Ödünç Başlangıç-Bitiş",
  "", // Butonlar
];

const search = ref({
  isbn: "",
  classification: "",
  studentNumber: "",
});
const pending = ref(false);

const searchResults = ref<Array<{
  bookName: string;
  bookClassification: string;
  studentName: string;
  studentNumber: string;
  brrwD: string;
  expired: boolean;
  bookId: string;
  userId: string;
}>>([]);

function dateCal(date: Timestamp) {
  // const startDate = new Date(date.seconds * 1000 + date.nanoseconds / 1000000);
  const startDate = date.toDate();
  const endDate = new Date(startDate.getTime() + borrowDuration * 24 * 60 * 60 * 1000);
  return {
    brrwD: `${ startDate.toLocaleDateString() } - ${ endDate.toLocaleDateString() }`,
    expired: endDate.getTime() < Date.now(),
  };
}
async function searchByBook() {
  pending.value = true;

  const bookDoc = await getDocs(query(booksRef, where("classification", "==", search.value.classification))).then(x => x.docs[0]);
  if (!bookDoc) {
    $toast.error("Kitap bulunamadı.");
    return pending.value = false;
  }

  const book = bookDoc.data() as Book;

  console.log(book);

  const borrowedBooks: typeof searchResults.value = [];

  for (const user of book.copies.borrowedBy) {
    const userDoc = await getDoc(doc(usersRef, user));

    if (!userDoc) continue;

    const userData = userDoc.data() as User;

    const { brrwD, expired } = dateCal(book.copies.borrowedAt[user] as Timestamp);

    borrowedBooks.push({
      bookName: book.name,
      bookClassification: book.classification,
      studentName: `${ userData.name } ${ userData.surname }`,
      studentNumber: userData.studentNumber,
      brrwD,
      expired,
      bookId: bookDoc.id,
      userId: userDoc.id,
    });
  }

  pending.value = false;
  if (!borrowedBooks.length) $toast.error("Bu kitap ödünç verilmemiş.");

  searchResults.value = borrowedBooks;
}

async function searchByStudent() {
  pending.value = true;

  const userDoc = await getDocs(query(usersRef, where("studentNumber", "==", search.value.studentNumber)))
      .then(x => x.docs[0]);

  if (!userDoc) {
    $toast.error("Öğrenci bulunamadı.");
    return pending.value = false;
  }

  const books = await getDocs(query(booksRef, where("copies.borrowedBy", "array-contains", userDoc.id)))
      .then(x => x.docs.map(a => {
        const data = a.data() as Book;
        const expiry = dateCal(data.copies.borrowedAt[userDoc.id] as Timestamp);
        return { ...data, id: a.id,...expiry };
      }));
  const user = userDoc.data() as User;

  console.log(books, user, userDoc.id);

  searchResults.value = books.map(x => ({
    bookName: x.name,
    bookClassification: x.classification,
    studentName: `${ user.name } ${ user.surname }`,
    studentNumber: user.studentNumber,
    brrwD: x.brrwD,
    expired: x.expired,
    bookId: x.id,
    userId: userDoc.id,
  }));

  pending.value = false;
  if (!searchResults.value.length) $toast.error("Bu öğrenciye ödünç verilmemiş.");
}

const dialog = ref<{
  isOpen: boolean;
  book?: typeof searchResults.value[number];
}>({
  isOpen: false,
});

const functions = getFunctions(app, "europe-west-1");
const returnFunction = httpsCallableFromURL(
    functions,
    "https://returnbook-kswdabpqrq-ew.a.run.app",
    { limitedUseAppCheckTokens: true },
);

async function returnBook(book?: typeof searchResults.value[number], confirmed = false) {
  if (!confirmed || !book) {
    return dialog.value = {
      isOpen: true,
      book: book,
    };
  }

  pending.value = true;

  await returnFunction({
    userId: book.userId,
    bookId: book.bookId,
  }).then(() => {
    $toast.success("Kitap geri alındı.");
    searchResults.value = searchResults.value.filter(x => x.bookId !== book.bookId);
  }).catch((err: Error) => $toast.error(err.message));

  dialog.value = {
    isOpen: false,
  };
  return pending.value = false;
}
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <DashGroup>
      <DashGroupTitle label="Ödünç Verme" icon="book-reader"/>
      <Alert theme="INFO">
        Ödünç verme işlemleri "Kitaplar" sayfasından yapılmaktadır.
        Ödünç verilecek kitabın bilgilerini girip kitapları listeledikten sonra ödünç verme butonuna (mavi buton)
        tıklayarak ödünç verme işlemini gerçekleştirebilirsiniz.
      </Alert>
    </DashGroup>
    <DashGroup>
      <DashGroupTitle label="Kitaba Göre Listele" icon="search"/>
      <DashGroupBody :cols="1">
        <DashGroupInputCol label="Sınıflandırma" v-model="search.classification"/>
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton theme="SUCCESS" label="Listele" icon="search" :disabled="pending" @click="searchByBook"/>
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup>
      <DashGroupTitle label="Öğrenci Numarasına Göre Listele" icon="search"/>
      <DashGroupBody :cols="1">
        <DashGroupInputCol label="Öğrenci Numarası" v-model="search.studentNumber"/>
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton theme="SUCCESS" label="Listele" icon="search" :disabled="pending" @click="searchByStudent"/>
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup class="md:col-span-3" v-if="searchResults.length">
      <DashGroupTitle label="Sonuçlar" icon="file-search-alt"/>
      <DashGroupTable :cols="6">
        <DashGroupTableRow :items="tableTitle" :isTitle="true"/>
        <DashGroupTableRow v-for="res in searchResults" :isTitle="false" :items="[
            res.bookName,
            res.bookClassification,
            res.studentName,
            res.studentNumber,
            [res.brrwD, res.expired ? 'text-red-500' : ''],
        ]" :actions="[{
            icon: 'download-alt',
            altText: 'Ödünç Geri Al',
            theme: 'WARNING',
            onClick: () => returnBook(res),
            disabled: pending,
        }]" />
      </DashGroupTable>
    </DashGroup>
  </div>
  <DialogRoot v-model="dialog.isOpen" title="Ödünç Geri Alma">
    <DialogBody>
      <span>
        <strong>{{ dialog.book?.bookName }}</strong> adlı kitap, <strong>{{ dialog.book?.studentName }}</strong> adlı öğrenciden geri alınacaktır.
      </span>
    </DialogBody>
    <DialogButtonRow>
      <ThemedButton theme="SUCCESS" label="Onayla" icon="download-alt" @click="() => returnBook(dialog.book, true)" :disabled="pending" />
    </DialogButtonRow>
  </DialogRoot>
</template>
