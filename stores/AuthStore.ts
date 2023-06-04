import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  signOut as firebaseSignOut,
  updateEmail as firebaseUpdateEmail,
  updatePassword as firebaseUpdatePassword,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { defineStore } from "pinia";
import { User } from "~/types/FirestoreTypes";

export const useAuthStore = defineStore("AuthStore", () => {
  const auth = useCurrentUser();
  const user = ref<User>();
  const firebaseAuth = useFirebaseAuth();
  const firestore = useFirestore();

  async function setUserData() {
    return user.value = auth.value?.uid
      ? await getDoc(doc(firestore, "users", auth.value.uid)).then(d => d.exists() ? d.data() as User : undefined)
      : undefined;
  }

  async function updateEmail(email: string, password: string) {
    if (!auth.value?.email) return;

    await reauthenticateWithCredential(auth.value, EmailAuthProvider.credential(
      auth.value.email,
      password,
    ));

    return firebaseUpdateEmail(auth.value, email).then(setUserData);
  }

  async function updatePassword(oldPassword: string, newPassword: string) {
    if (!auth.value?.email) return;

    await reauthenticateWithCredential(auth.value, EmailAuthProvider.credential(
      auth.value.email,
      oldPassword,
    ));

    return firebaseUpdatePassword(auth.value, newPassword);
  }

  setUserData();

  async function signOut() {
    if (firebaseAuth) return firebaseSignOut(firebaseAuth);
  }

  watch(
    auth,
    async () => {
      await setUserData();
    }
  );

  return { auth, user, updateEmail, updatePassword, signOut };
});
