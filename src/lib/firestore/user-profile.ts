import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { db } from "../firebase/firestore"
import { UserProfile } from "@/types"
import { User } from "firebase/auth"

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "users", uid)
  const snap = await getDoc(docRef)
  if (!snap.exists()) return null
  return snap.data() as UserProfile
}

export async function createUserProfileIfMissing(
  user: User
): Promise<UserProfile> {
  if (!db) throw new Error("Firestore not initialized")
  const uid = user.uid
  const docRef = doc(db, "users", uid)
  const snap = await getDoc(docRef)
  
  if (snap.exists()) {
    const existingData = snap.data() as UserProfile
    // Sync identity fields if they have changed (or if missing from older docs)
    const newName = user.displayName || ""
    const newEmail = user.email || ""
    const newPhotoURL = user.photoURL || ""
    
    if (
      existingData.name !== newName ||
      existingData.email !== newEmail ||
      existingData.photoURL !== newPhotoURL
    ) {
      await updateDoc(docRef, {
        name: newName,
        email: newEmail,
        photoURL: newPhotoURL,
        updatedAt: serverTimestamp()
      })
      
      return {
        ...existingData,
        name: newName,
        email: newEmail,
        photoURL: newPhotoURL
      }
    }
    return existingData
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
