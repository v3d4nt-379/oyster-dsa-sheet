import { collection, getDocs, query, orderBy, doc, getDoc } from "firebase/firestore"
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

    let parsedSolution = data.solution
    
    // Backward compatibility: If an old `solutionMarkdown` field exists and no new `solution` object is set, adapt it.
    if (!parsedSolution && data.solutionMarkdown) {
      parsedSolution = {
        explanationMarkdown: data.solutionMarkdown
      }
    }

    const question: AppQuestion = {
      id: doc.id,
      questionId: data.questionId,
      title: data.title,
      topicId: data.topicId,
      difficulty: data.difficulty,
      links,
      order: data.order,
      solution: parsedSolution || undefined
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

export async function getQuestionById(questionId: string): Promise<AppQuestion | null> {
  if (!db) throw new Error("Firestore is not initialized")
  
  const docRef = doc(db, "questions", questionId)
  const docSnap = await getDoc(docRef)
  
  if (!docSnap.exists()) return null
  
  const data = docSnap.data()
  const links: PracticeLinkData[] = []
  
  if (data.leetcodeUrl) links.push({ platform: "LeetCode", url: data.leetcodeUrl })
  if (data.gfgUrl) links.push({ platform: "GeeksforGeeks", url: data.gfgUrl })
  if (data.codechefUrl) links.push({ platform: "CodeChef", url: data.codechefUrl })
  
  let parsedSolution = data.solution
  if (!parsedSolution && data.solutionMarkdown) {
    parsedSolution = { explanationMarkdown: data.solutionMarkdown }
  }
  
  return {
    id: docSnap.id,
    questionId: data.questionId,
    title: data.title,
    topicId: data.topicId,
    difficulty: data.difficulty,
    links,
    order: data.order,
    solution: parsedSolution || undefined
  }
}
