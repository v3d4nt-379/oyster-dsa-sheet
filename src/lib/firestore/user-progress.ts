import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../firebase/firestore"

export interface SolvedRecord {
  questionId: string;
  solvedAt: any;
}

export async function getUserSolvedIds(uid: string): Promise<Set<string>> {
  if (!db) throw new Error("Firestore not initialized")
  
  const solvedRef = collection(db, "users", uid, "solved")
  const snapshot = await getDocs(solvedRef)
  
  const ids = new Set<string>()
  snapshot.forEach(doc => {
    ids.add(doc.id)
  })
  
  return ids
}

export async function getUserSolvedRecords(uid: string): Promise<SolvedRecord[]> {
  if (!db) throw new Error("Firestore not initialized")
  
  const solvedRef = collection(db, "users", uid, "solved")
  const snapshot = await getDocs(solvedRef)
  
  const records: SolvedRecord[] = []
  snapshot.forEach(doc => {
    records.push(doc.data() as SolvedRecord)
  })
  
  return records
}

export async function getUserBookmarkIds(uid: string): Promise<Set<string>> {
  if (!db) throw new Error("Firestore not initialized")
  
  const bookmarksRef = collection(db, "users", uid, "bookmarks")
  const snapshot = await getDocs(bookmarksRef)
  
  const ids = new Set<string>()
  snapshot.forEach(doc => {
    ids.add(doc.id)
  })
  
  return ids
}

export async function markQuestionSolved(uid: string, questionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  
  const docRef = doc(db, "users", uid, "solved", questionId)
  await setDoc(docRef, {
    questionId,
    solvedAt: serverTimestamp()
  })
}

export async function markQuestionUnsolved(uid: string, questionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  
  const docRef = doc(db, "users", uid, "solved", questionId)
  await deleteDoc(docRef)
}

export async function addBookmark(uid: string, questionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  
  const docRef = doc(db, "users", uid, "bookmarks", questionId)
  await setDoc(docRef, {
    questionId,
    createdAt: serverTimestamp()
  })
}

export async function removeBookmark(uid: string, questionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  
  const docRef = doc(db, "users", uid, "bookmarks", questionId)
  await deleteDoc(docRef)
}
