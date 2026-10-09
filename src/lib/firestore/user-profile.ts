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

import { User } from "firebase/auth"

export async function createUserProfileIfMissing(
  user: User
): Promise<UserProfile> {
  if (!db) throw new Error("Firestore not initialized")
  const uid = user.uid
  const docRef = doc(db, "users", uid)
  const snap = await getDoc(docRef)
  
  if (snap.exists()) {
    return snap.data() as UserProfile
  }

  const newProfile: UserProfile = {
    uid,
    name: user.displayName || "",
    email: user.email || "",
    photoURL: user.photoURL || "",
    username: user.email?.split("@")[0] || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isClubMember: false
  }

  await setDoc(docRef, newProfile)
  return newProfile
}
