import { onCall } from "firebase-functions/v2/https";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { s } from "@sapphire/shapeshift";
import { HttpsError } from "firebase-functions/v2/https";

const CreateAccountSchema = s.object({
  email: s.string.email,
  name: s.string.lengthLessThanOrEqual(32),
  surname: s.string.lengthLessThanOrEqual(32),
  studentNumber: s.string.regex(/^\d+$/g).lengthLessThanOrEqual(16),
  role: s.number.int.greaterThanOrEqual(0).lessThanOrEqual(3),
}).strict;

export const createAccount = onCall(
  {
    enforceAppCheck: true,
    region: "europe-west1",
    memory: "128MiB",
  },
  async request => {
    const { email, name, surname, studentNumber, role } =
      CreateAccountSchema.parse(request.data);

    const auth = getAuth();
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

    const uid = await auth.createUser({ email }).then(user => user.uid);
    await db.collection("users").doc(uid).set({
      name,
      surname,
      studentNumber,
      role,
    });

    return { response: "OK" };
  },
);
