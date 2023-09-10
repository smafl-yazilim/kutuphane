import "@nuxtjs/algolia";

declare module "@nuxtjs/algolia" {
  interface AlgoliaIndices {
    books: {
      "name": string;
      "author": string;
      "publisher": string;
      "isbn": string;
      "classification": string;
      "category": string;
      "publicationDate": string;
      "publicationPlace": string;
      "copies.total": number;
      "copies.borrowed": number;
      "edition": number;
      "objectID": string;
      "path": string;
      "lastModified": number;
    };
  }
}
