import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { s } from "@sapphire/shapeshift";
import { firestore } from "firebase-admin";
import FieldValue = firestore.FieldValue;

const ReturnBookSchema = s.object({
  userId: s.string,
  bookId: s.string,
});

export const returnBook = onCall(
  {
    enforceAppCheck: true,
    region: "europe-west1",
    memory: "128MiB",
  },
  async request => {
    const { userId, bookId } = ReturnBookSchema.parse(request.data);
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

    await db.collection("books").doc(bookId).update({
      "copies.borrowedBy": FieldValue.arrayRemove(userId),
      [`copies.borrowedAt.${userId}`]: FieldValue.delete(),
      "copies.borrowed": FieldValue.increment(-1),
    });

    return { response: "OK" };
  },
);
