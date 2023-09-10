<script setup lang="ts">
import { definePageMeta } from "#imports";
import { useAuthStore } from "~/stores/AuthStore";
import { storeToRefs } from "pinia";
import { Book } from "~/types/FirestoreTypes";
import { addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { collection } from "@firebase/firestore";
import { AlgoliaIndices } from "@nuxtjs/algolia/dist/module";
import { Hit, SearchResponse } from "@algolia/client-search";
import DialogButtonRow from "~/components/DialogButtonRow.vue";
import { getFunctions, httpsCallableFromURL } from "firebase/functions";

definePageMeta({
  title: "Kitaplar",
});

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);
const { $toast } = useNuxtApp();
const firestore = useFirestore();
const auth = useFirebaseAuth();
const app = useFirebaseApp();

const { result, search } = useAlgoliaSearch("books");

if (!auth)
  throw createError({
    statusCode: 500,
    message: "Firebase Auth is not initialized.",
  });

const newBook = ref<Book>({
  name: "",
  author: "",
  isbn: undefined,
  publisher: "",
  publicationDate: "",
  publicationPlace: undefined,
  edition: undefined,
  category: "",
  classification: "",
  copies: {
    total: 1,
    borrowed: 0,
    borrowedBy: [],
    borrowedAt: {},
  },
});

const bookSearch = ref({
  searchTerm: "",
  author: undefined,
  isbn: undefined,
  publisher: undefined,
  classification: undefined,
});

const tableTitle = [
  "Kitap Adı",
  "Yazar",
  "ISBN",
  "Yayıncı",
  "Sınıflandırma",
  "Ödünç Alınan/Toplam",
  "", // Butonlar
];
const booksResult = ref<SearchResponse<AlgoliaIndices["books"]> | undefined>();

const hitToRow = (hit: Hit<AlgoliaIndices["books"]>) => {
  console.log(hit);

  return [
    hit.name,
    hit.author,
    hit.isbn,
    hit.publisher,
    hit.classification,
    `${hit["copies.borrowed"]}/${hit["copies.total"]}`,
  ];
};

const createBook = async () => {
  await addDoc(collection(firestore, "books"), newBook.value)
    .then(() => $toast.success("Kitap eklendi."))
    .catch(e => {
      console.error(e);
      $toast.error("Kitap eklenemedi.");
    });
};

const listBooks = async () => {
  console.log(bookSearch.value);

  const { searchTerm, isbn, classification, author, publisher } =
    bookSearch.value;
  const filters: string[] = [];
  if (author) filters.push(`author:"${author}"`);
  if (publisher) filters.push(`publisher:${publisher}`);

  let query;

  const requestOptions: Record<string, unknown> = {};
  if (isbn) {
    query = isbn;
    requestOptions.restrictSearchableAttributes = ["isbn"];
  } else if (classification) {
    query = classification;
    requestOptions.restrictSearchableAttributes = ["classification"];
  } else {
    query = searchTerm;
    requestOptions.restrictSearchableAttributes = [
      "name",
      "author",
      "publisher",
    ];
    requestOptions.filters = filters.join(" AND ");
  }

  const result = await search({
    query,
    requestOptions,
  });

  console.log(result);
  booksResult.value = result;
};

/*
const { search: facetSearch } = useAlgoliaFacetedSearch("books");
const autocomplete = ref<string[]>([]);

watch(
    () => newBook.value.author,
    async () => {
      autocomplete.value = await facetSearch({
        facet: {
          name: "author",
          query: newBook.value.author,
        }
      }).then(x => x.facetHits.map(a => a.value));
    }
)
*/

const dialog = ref<Record<string, any>>({
  isOpen: false,
  mode: "",
  title: "",
  buttonDisabled: false,
});

const functions = getFunctions(app, "europe-west-1");
const borrowFunction = httpsCallableFromURL(
  functions,
  "https://borrowbook-kswdabpqrq-ew.a.run.app",
  { limitedUseAppCheckTokens: true },
);

const borrowInfo = ref<{
  studentNumber: string;
  book?: AlgoliaIndices["books"];
}>({
  studentNumber: "",
  book: undefined,
});

const borrowBook = async (
  book?: AlgoliaIndices["books"],
  confirmed = false,
) => {
  if (!book) {
    console.error("borrowBook > book is undefined.");
    $toast.error("Bilinmeyen bir hata oluştu.");
  }

  if (!borrowInfo.value.studentNumber || !confirmed) {
    borrowInfo.value.book = book;
    borrowInfo.value.studentNumber = "";

    dialog.value.mode = "BORROW";
    dialog.value.title = "Ödünç Ver";
    dialog.value.isOpen = true;

    return;
  }

  dialog.value.buttonDisabled = true;

  await borrowFunction({
    studentNumber: borrowInfo.value.studentNumber,
    bookId: borrowInfo.value.book?.objectID,
  })
    .then(() => $toast.success("Kitap ödünç verildi."))
    .catch(e => {
      console.error(e);
      $toast.error(e.message);
    });

  dialog.value.buttonDisabled = false;
  dialog.value.isOpen = false;

  booksResult.value!.hits[booksResult.value!.hits.indexOf(book)][
    "copies.borrowed"
  ] += 1;
};

const editInfo = ref<{
  totalCopies?: number;
  book?: AlgoliaIndices["books"];
}>({
  totalCopies: undefined,
  book: undefined,
});

const editBook = (book?: AlgoliaIndices["books"], confirmed = false) => {
  if (!book) {
    console.error("editBook > book is undefined.");
    $toast.error("Bilinmeyen bir hata oluştu.");
  }

  if (
    !(editInfo.value.totalCopies === 0 || editInfo.value.totalCopies) ||
    !confirmed
  ) {
    editInfo.value.book = book;
    editInfo.value.totalCopies = book?.["copies.total"];

    dialog.value.mode = "EDIT";
    dialog.value.title = "Kitap Güncelle";
    dialog.value.isOpen = true;

    return;
  }

  if (editInfo.value.totalCopies < book?.["copies.borrowed"]) {
    $toast.error("Kütüphanedeki sayı ödünç alınan sayısından az olamaz.");
    return;
  } else if (editInfo.value.totalCopies <= 0) {
    $toast.error("Kütüphanedeki sayı 0 ya da 0'dan küçük olamaz.");
    return;
  }

  dialog.value.buttonDisabled = true;

  updateDoc(doc(firestore, "books", book?.objectID), {
    "copies.total": editInfo.value.totalCopies,
  })
    .then(() => {
      booksResult.value!.hits[booksResult.value!.hits.indexOf(book)][
        "copies.total"
      ] = editInfo.value.totalCopies;
    })
    .catch(e => {
      console.error(e);
      $toast.error("Kitap güncellenemedi.");
    });

  dialog.value.isOpen = false;
  dialog.value.buttonDisabled = false;
};

const deleteInfo = ref<{
  book?: AlgoliaIndices["books"];
}>({
  book: undefined,
});

const deleteBook = (book?: AlgoliaIndices["books"], confirmed = false) => {
  if (!book) {
    console.error("deleteBook > book is undefined.");
    $toast.error("Bilinmeyen bir hata oluştu.");
  }

  if (!confirmed) {
    deleteInfo.value.book = book;

    dialog.value.mode = "DELETE";
    dialog.value.title = "Kitap Sil";
    dialog.value.isOpen = true;

    return;
  }

  if (book?.["copies.borrowed"] > 0) {
    $toast.error("Ödünç alınan kitaplar silinemez.");
    dialog.value.isOpen = false;
    return;
  }

  dialog.value.buttonDisabled = true;

  deleteDoc(doc(firestore, "books", book?.objectID))
    .then(() => {
      booksResult.value!.hits.splice(booksResult.value!.hits.indexOf(book), 1);
      $toast.success("Kitap silindi.");
    })
    .catch(e => {
      console.error(e);
      $toast.error("Kitap silinemedi.");
    });

  dialog.value.isOpen = false;
  dialog.value.buttonDisabled = false;
};
</script>

<template>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <DashGroup>
      <DashGroupTitle label="Yeni Kitap Ekle" icon="plus" />
      <DashGroupBody :cols="2">
        <DashGroupInputCol label="Kitap Adı" v-model.trim="newBook.name" />
        <DashGroupInputCol
          label="Yazar (Soyadı, Adı)"
          v-model="newBook.author"
        />
        <DashGroupInputCol
          label="Kütüphanedeki Adedi"
          v-model.number="newBook.copies.total"
          type="number"
        />
        <DashGroupInputCol label="ISBN" v-model="newBook.isbn" />
        <DashGroupInputCol label="Yayıncı" v-model="newBook.publisher" />
        <DashGroupInputCol
          label="Yayın Yılı"
          v-model="newBook.publicationDate"
          type="number"
        />
        <DashGroupInputCol
          label="Yayın Yeri"
          v-model="newBook.publicationPlace"
        />
        <DashGroupInputCol
          label="Basım"
          v-model.number="newBook.edition"
          type="number"
        />
        <DashGroupInputCol label="Kategori" v-model="newBook.category" />
        <DashGroupInputCol
          label="Sınıflandırma"
          v-model="newBook.classification"
        />
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton
          label="Kaydet"
          icon="save"
          theme="SUCCESS"
          @click="createBook"
        />
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup>
      <DashGroupTitle label="Kitapları Listele" icon="book-alt" />
      <DashGroupBody :cols="2">
        <DashGroupInputCol
          label="Arama Terimi"
          v-model.trim="bookSearch.searchTerm"
          mainClass="col-span-2"
        />
        <DashGroupInputCol label="ISBN" v-model="bookSearch.isbn" />
        <DashGroupInputCol
          label="Sınıflandırma"
          v-model="bookSearch.classification"
        />
        <DashGroupInputCol
          label="Yazar (Soyadı, Adı)"
          v-model="bookSearch.author"
        />
        <DashGroupInputCol label="Yayıncı" v-model="bookSearch.publisher" />
        <Alert theme="INFO" class="col-span-2">
          ISBN girilmesi durumunda sadece ISBN ile, sınıflandırma girilmesi
          durumunda sadece sınıflandırma ile, ikisinin beraber girilmesi
          durumunda ise sadece ISBN ile arama yapılır. Yazar adı veya yayıncı
          girilmesi durumunda sadece birebir uyuşanlar listelenir. Eğer
          yazarın/yayıncının adından tam emin değilseniz "Arama Terimi" alanını
          kullanarak arama yapabilirsiniz.
        </Alert>
      </DashGroupBody>
      <DashGroupButtonRow>
        <ThemedButton
          label="Listele"
          icon="search"
          theme="SUCCESS"
          @click="listBooks"
        />
      </DashGroupButtonRow>
    </DashGroup>
    <DashGroup v-if="booksResult" class="md:col-span-2">
      <DashGroupTitle label="Sonuçlar" icon="file-search-alt" />
      <DashGroupTable
        v-if="booksResult.hits?.length"
        cols="7"
        class="overflow-x-auto"
      >
        <DashGroupTableRow :items="tableTitle" :isTitle="true" />
        <DashGroupTableRow
          v-for="row in booksResult.hits"
          :items="hitToRow(row)"
          :isTitle="false"
          :actions="[
            {
              icon: 'book-reader',
              altText: 'Ödünç Ver',
              theme: 'PRIMARY',
              onClick: () => borrowBook(row),
              disabled: row['copies.borrowed'] >= row['copies.total'],
            },
            {
              icon: 'edit',
              altText: 'Güncelle',
              theme: 'WARNING',
              onClick: () => editBook(row),
            },
            {
              icon: 'trash',
              altText: 'Sil',
              theme: 'DANGER',
              onClick: () => deleteBook(row),
            },
          ]"
        />
      </DashGroupTable>
    </DashGroup>
  </div>
  <DialogRoot v-model="dialog.isOpen" :title="dialog.title">
    <DialogBody>
      <div v-if="dialog.mode === 'BORROW'" class="flex flex-col gap-2">
        <span
          ><strong>{{ borrowInfo.book.name }}</strong> adlı kitap ödünç
          verilecek. Ödünç verilecek öğrencinin numarasını girin:</span
        >
        <DashGroupInput v-model="borrowInfo.studentNumber" />
      </div>
      <div v-else-if="dialog.mode === 'EDIT'" class="flex flex-col gap-2">
        <span>
          <strong>{{ editInfo.book.name }}</strong> adlı kitabı
          güncelliyorsunuz.
        </span>
        <DashGroupInputCol
          label="Kütüphanedeki Sayısı"
          v-model.number="editInfo.totalCopies"
        />
      </div>
      <div v-else-if="dialog.mode === 'DELETE'" class="flex flex-col gap-2">
        <span>
          <strong>{{ deleteInfo.book.name }}</strong> adlı kitap silinecek. Emin
          misiniz?
        </span>
      </div>
    </DialogBody>
    <DialogButtonRow>
      <ThemedButton
        v-if="dialog.mode === 'BORROW'"
        label="Ödünç Ver"
        theme="PRIMARY"
        icon="book-reader"
        @click="borrowBook(borrowInfo.book, true)"
        :disabled="dialog.buttonDisabled"
      />
      <ThemedButton
        v-else-if="dialog.mode === 'EDIT'"
        label="Güncelle"
        theme="WARNING"
        icon="edit"
        @click="editBook(editInfo.book, true)"
        :disabled="dialog.buttonDisabled"
      />
      <ThemedButton
        v-else-if="dialog.mode === 'DELETE'"
        label="Kitabı Sil"
        theme="DANGER"
        icon="trash"
        @click="deleteBook(deleteInfo.book, true)"
        :disabled="dialog.buttonDisabled"
      />
    </DialogButtonRow>
  </DialogRoot>
</template>

<style scoped></style>
