import { collection, getDocs, query, orderBy } from "firebase/firestore"
import { db } from "../firebase/firestore"
import { AppTopic, AppQuestion, PracticeLinkData } from "@/types"

export async function fetchSheetData(): Promise<AppTopic[]> {
  if (!db) throw new Error("Firestore is not initialized (Missing config)")

  const topicsRef = collection(db, "topics")
  const questionsRef = collection(db, "questions")

  const topicsSnapshot = await getDocs(query(topicsRef, orderBy("order", "asc")))
  const questionsSnapshot = await getDocs(query(questionsRef, orderBy("order", "asc")))

  const topicsMap: Record<string, AppTopic> = {}

  topicsSnapshot.docs.forEach(doc => {
    const data = doc.data()
    topicsMap[doc.id] = {
      id: doc.id,
      title: data.name,
      description: data.description,
      order: data.order,
      questions: []
    }
  })

  questionsSnapshot.docs.forEach(doc => {
    const data = doc.data()
    const links: PracticeLinkData[] = []
    
    if (data.leetcodeUrl) links.push({ platform: "LeetCode", url: data.leetcodeUrl })
    if (data.gfgUrl) links.push({ platform: "GeeksforGeeks", url: data.gfgUrl })
    if (data.codechefUrl) links.push({ platform: "CodeChef", url: data.codechefUrl })

    const question: AppQuestion = {
      id: doc.id,
      questionId: data.questionId,
      title: data.title,
      topicId: data.topicId,
      difficulty: data.difficulty,
      links,
      order: data.order
    }

    if (topicsMap[question.topicId]) {
      topicsMap[question.topicId].questions.push(question)
    } else {
      console.warn(`Question ${question.id} references missing topic ${question.topicId}`)
    }
  })

  // Return topics sorted by their order
  return Object.values(topicsMap).sort((a, b) => a.order - b.order)
}
