import { signOut as firebaseSignOut } from "firebase/auth";
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
      // typescript is not smart enough to know that auth.value?.uid is not undefined
      ? await getDoc(doc(firestore, "users", auth.value?.uid!)).then(d => d.exists() ? d.data() as User : undefined)
      : undefined;
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

  return { auth, user, signOut };
});
