import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { s } from "@sapphire/shapeshift";
import { firestore } from "firebase-admin";
import FieldValue = firestore.FieldValue;

const BorrowBookSchema = s.object({
  studentNumber: s.string,
  bookId: s.string,
});

export const borrowBook = onCall(
  {
    enforceAppCheck: true,
    region: "europe-west1",
    memory: "128MiB",
  },
  async request => {
    const { studentNumber, bookId } = BorrowBookSchema.parse(request.data);
    const db = getFirestore();

    const user = request.auth?.uid
      ? await db
          .collection("users")
          .doc(request.auth.uid)
          .get()
          .then(snapshot => snapshot.data())
      : null;
    if (!user || user.role < 1)
      throw new HttpsError("unauthenticated", "Bu işlem için yetkiniz yok.");

    const uid = await db
      .collection("users")
      .where("studentNumber", "==", studentNumber)
      .get()
      .then(snapshot => snapshot?.docs?.[0]?.id);
    if (!uid) throw new HttpsError("not-found", "Kullanıcı bulunamadı.");

    const settings = await db
      .collection("settings")
      .doc("library")
      .get()
      .then(snapshot => snapshot.data());
    if (!settings)
      throw new HttpsError("internal", "Kütüphane ayarları hatalı.");

    const borrowedBooks = await db
      .collection("books")
      .where("copies.borrowedBy", "array-contains", uid)
      .get()
      .then(snapshot => snapshot.docs.map(doc => doc.id));

    if (borrowedBooks.length >= settings.borrowingLimits.amount)
      throw new HttpsError(
        "failed-precondition",
        "Kullanıcı ödünç alma limitine ulaşmış.",
      );

    if (borrowedBooks.includes(bookId))
      throw new HttpsError(
        "failed-precondition",
        "Kullanıcı bu kitabı zaten ödünç almış.",
      );

    await db
      .collection("books")
      .doc(bookId)
      .update({
        "copies.borrowed": FieldValue.increment(1),
        "copies.borrowedBy": FieldValue.arrayUnion(uid),
        [`copies.borrowedAt.${uid}`]: FieldValue.serverTimestamp(),
      })
      .catch(() => {
        throw new HttpsError("internal", "Kitap ödünç verilemedi.");
      });

    return { response: "OK" };
  },
);
