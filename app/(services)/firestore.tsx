import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  runTransaction,
  setDoc,
  startAfter,
  updateDoc,
  where,
} from "firebase/firestore";
import { app } from "./firebase";
import { UserCredential } from "firebase/auth";
import { uploadProfilePic } from "./storage";

export const db = getFirestore(app);

export type visibilityType = "public" | "private";

export async function createNewUser(userCred: UserCredential) {
  const docRef = doc(db, `users/${userCred.user.uid}`);

  if (!(await getDoc(docRef)).exists()) {
    // create document
    await setDoc(docRef, {
      uid: userCred.user.uid,
      username: userCred.user.uid,
      about: "Hey, I am on Excursio!",
      provider: userCred.providerId,
    });
  }
}

export async function getUser(uid: string) {
  return (await getDoc(doc(db, `users/${uid}`))).data();
}

export async function updateUsername(
  uid: string | undefined,
  newUsername: string
) {
  newUsername = newUsername.trim();

  if (!uid) throw new Error(`No uid provided: ${uid}`);
  if (!newUsername) throw new Error("Invalid username");

  await runTransaction(db, async (transaction) => {
    if (
      (
        await getDocs(
          query(collection(db, `users`), where("username", "==", newUsername))
        )
      ).empty
    ) {
      transaction.update(doc(db, `users/${uid}`), { username: newUsername });
    } else {
      throw new Error("Username already exist");
    }
  });
}

export async function updateAbout(uid: string | undefined, newAbout: string) {
  console.log("updateAbout called");

  newAbout = newAbout.trim();

  if (!uid) throw new Error(`No uid provided: ${uid}`);

  await updateDoc(doc(db, `users/${uid}`), { about: newAbout });
}

export async function updateProfilePic(uid: string | undefined, file: File) {
  if (!uid) {
    throw new Error("No uid provided");
  }

  try {
    const ImageURL = await uploadProfilePic(uid, file);
    return await updateDoc(doc(db, `users/${uid}`), { imageURL: ImageURL });
  } catch (error) {
    console.log(error);
  }
}

export async function getEvents(
  uid: string,
  lastDoc: QueryDocumentSnapshot<DocumentData, DocumentData> | null,
  visibility: visibilityType
) {
  const PAGE_COUNT = 1;
  const eventCollection = collection(db, "events");

  try {
    return !lastDoc
      ? await getDocs(
          query(
            eventCollection,
            where("owner", "==", uid),
            where("visibility", "==", visibility),
            orderBy("created_at", "desc"),
            limit(PAGE_COUNT)
          )
        )
      : await getDocs(
          query(
            eventCollection,
            where("owner", "==", uid),
            where("visibility", "==", visibility),
            orderBy("created_at", "desc"),
            startAfter(lastDoc),
            limit(PAGE_COUNT)
          )
        );
  } catch (error) {
    console.log(error);
  }
}
