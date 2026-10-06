import { collection, doc, setDoc, deleteDoc, serverTimestamp, updateDoc, getDocs } from "firebase/firestore"
import { db } from "../firebase/firestore"
import { AppTopic, AppQuestion, QuestionSolution } from "@/types"

export async function createTopic(topicId: string, name: string, description: string, order: number, enabled: boolean = true): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "topics", topicId)
  await setDoc(docRef, {
    name,
    description,
    order,
    enabled,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateTopic(topicId: string, updates: Partial<{ name: string; description: string; order: number; enabled: boolean }>): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "topics", topicId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteTopic(topicId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "topics", topicId)
  await deleteDoc(docRef)
}

export async function createOkcTopic(topicId: string, name: string, description: string, order: number, enabled: boolean = true): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcTopics", topicId)
  await setDoc(docRef, {
    name,
    description,
    order,
    enabled,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateOkcTopic(topicId: string, updates: Partial<{ name: string; description: string; order: number; enabled: boolean }>): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcTopics", topicId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteOkcTopic(topicId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcTopics", topicId)
  await deleteDoc(docRef)
}

export async function createQuestion(
  globalQuestionId: string, 
  data: {
    questionId: string
    title: string
    topicId: string
    difficulty: string
    leetcodeUrl: string | null
    gfgUrl: string | null
    codechefUrl: string | null
    order: number
    solution?: QuestionSolution
    enabled?: boolean
    solutionEnabled?: boolean
  }
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "questions", globalQuestionId)
  await setDoc(docRef, {
    ...data,
    enabled: data.enabled ?? true,
    solutionEnabled: data.solutionEnabled ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateQuestion(
  globalQuestionId: string, 
  updates: Partial<{
    questionId: string
    title: string
    topicId: string
    difficulty: string
    leetcodeUrl: string | null
    gfgUrl: string | null
    codechefUrl: string | null
    order: number
    solution: QuestionSolution | null
    enabled: boolean
    solutionEnabled: boolean
  }>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "questions", globalQuestionId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteQuestion(globalQuestionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "questions", globalQuestionId)
  await deleteDoc(docRef)
}

export async function createOkcQuestion(
  globalQuestionId: string, 
  data: {
    questionId: string
    title: string
    topicId: string
    difficulty: string
    leetcodeUrl: string | null
    gfgUrl: string | null
    codechefUrl: string | null
    order: number
    solution?: QuestionSolution
    enabled?: boolean
    solutionEnabled?: boolean
  }
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcQuestions", globalQuestionId)
  await setDoc(docRef, {
    ...data,
    enabled: data.enabled ?? true,
    solutionEnabled: data.solutionEnabled ?? true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  })
}

export async function updateOkcQuestion(
  globalQuestionId: string, 
  updates: Partial<{
    questionId: string
    title: string
    topicId: string
    difficulty: string
    leetcodeUrl: string | null
    gfgUrl: string | null
    codechefUrl: string | null
    order: number
    solution: QuestionSolution | null
    enabled: boolean
    solutionEnabled: boolean
  }>
): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcQuestions", globalQuestionId)
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  })
}

export async function deleteOkcQuestion(globalQuestionId: string): Promise<void> {
  if (!db) throw new Error("Firestore not initialized")
  const docRef = doc(db, "okcQuestions", globalQuestionId)
  await deleteDoc(docRef)
}

export async function getAllDailySets(): Promise<any[]> {
  if (!db) throw new Error("Firestore not initialized")
  const snapshot = await getDocs(collection(db, "dailySets"))
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
}
