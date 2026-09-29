import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/firestore"
import { UserProfile } from "@/types"

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "users", uid)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function createUserProfileIfMissing(
  uid: string
): Promise<UserProfile> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "users", uid)
  const snap = await getDoc(docRef)
  
  if (snap.exists()) {
    return snap.data() as UserProfile
  }

  const newProfile: UserProfile = {
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }

  await setDoc(docRef, newProfile)
  return newProfile
}
