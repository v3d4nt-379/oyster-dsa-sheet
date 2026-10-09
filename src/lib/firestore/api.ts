import { collection, getDocs, query, orderBy, doc, getDoc, onSnapshot, where, Timestamp } from "firebase/firestore"
import { db } from "../firebase/firestore"
import { AppTopic, AppQuestion, PracticeLinkData, DailySet } from "@/types"

function mapQuestionData(docId: string, data: any): AppQuestion {
  const links: PracticeLinkData[] = []
  
  if (data.leetcodeUrl) links.push({ platform: "LeetCode", url: data.leetcodeUrl })
  if (data.gfgUrl) links.push({ platform: "GeeksforGeeks", url: data.gfgUrl })
  if (data.codechefUrl) links.push({ platform: "CodeChef", url: data.codechefUrl })

  let parsedSolution = data.solution
  
  // Backward compatibility: If an old `solutionMarkdown` field exists and no new `solution` object is set, adapt it.
  if (!parsedSolution && data.solutionMarkdown) {
    parsedSolution = { explanationMarkdown: data.solutionMarkdown }
  }

  return {
    id: docId,
    questionId: data.questionId,
    title: data.title,
    topicId: data.topicId,
    difficulty: data.difficulty,
    links,
    order: data.order,
    solution: parsedSolution || undefined,
    enabled: data.enabled,
    solutionEnabled: data.solutionEnabled
  }
}

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
      questions: [],
      enabled: data.enabled
    }
  })

  questionsSnapshot.docs.forEach(doc => {
    const question = mapQuestionData(doc.id, doc.data())
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
  
  return mapQuestionData(docSnap.id, docSnap.data())
}

export function subscribeToSheetData(
  onData: (topics: AppTopic[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onError(new Error("Firestore is not initialized (Missing config)"))
    return () => {}
  }

  let topicsData: any[] = []
  let questionsData: any[] = []
  let topicsLoaded = false
  let questionsLoaded = false

  const emit = () => {
    if (!topicsLoaded || !questionsLoaded) return

    const topicsMap: Record<string, AppTopic> = {}
    
    topicsData.forEach(t => {
      topicsMap[t.id] = {
        id: t.id,
        title: t.data.name,
        description: t.data.description,
        order: t.data.order,
        questions: [],
        enabled: t.data.enabled
      }
    })

    questionsData.forEach(q => {
      const question = mapQuestionData(q.id, q.data)
      if (topicsMap[question.topicId]) {
        topicsMap[question.topicId].questions.push(question)
      } else {
        console.warn(`Question ${question.id} references missing topic ${question.topicId}`)
      }
    })

    onData(Object.values(topicsMap).sort((a, b) => a.order - b.order))
  }

  const unsubTopics = onSnapshot(
    query(collection(db, "topics"), orderBy("order", "asc")),
    (snapshot) => {
      topicsData = snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
      topicsLoaded = true
      emit()
    },
    (err) => onError(err)
  )

  const unsubQuestions = onSnapshot(
    query(collection(db, "questions"), orderBy("order", "asc")),
    (snapshot) => {
      questionsData = snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
      questionsLoaded = true
      emit()
    },
    (err) => onError(err)
  )

  return () => {
    unsubTopics()
    unsubQuestions()
  }
}

export function subscribeToQuestion(
  questionId: string,
  onData: (question: AppQuestion | null) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onError(new Error("Firestore is not initialized"))
    return () => {}
  }

  const docRef = doc(db, "questions", questionId)
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null)
      } else {
        onData(mapQuestionData(docSnap.id, docSnap.data()))
      }
    },
    (err) => onError(err)
  )
}

export function subscribeToOkcSheetData(
  onData: (topics: AppTopic[]) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onError(new Error("Firestore is not initialized (Missing config)"))
    return () => {}
  }

  let topicsData: any[] = []
  let questionsData: any[] = []
  let topicsLoaded = false
  let questionsLoaded = false

  const emit = () => {
    if (!topicsLoaded || !questionsLoaded) return

    const topicsMap: Record<string, AppTopic> = {}
    
    topicsData.forEach(t => {
      topicsMap[t.id] = {
        id: t.id,
        title: t.data.name,
        description: t.data.description,
        order: t.data.order,
        questions: [],
        enabled: t.data.enabled
      }
    })

    questionsData.forEach(q => {
      const question = mapQuestionData(q.id, q.data)
      if (topicsMap[question.topicId]) {
        topicsMap[question.topicId].questions.push(question)
      } else {
        console.warn(`OKC Question ${question.id} references missing topic ${question.topicId}`)
      }
    })

    onData(Object.values(topicsMap).sort((a, b) => a.order - b.order))
  }

  const unsubTopics = onSnapshot(
    query(collection(db, "okcTopics"), orderBy("order", "asc")),
    (snapshot) => {
      topicsData = snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
      topicsLoaded = true
      emit()
    },
    (err) => onError(err)
  )

  const unsubQuestions = onSnapshot(
    query(collection(db, "okcQuestions"), orderBy("order", "asc")),
    (snapshot) => {
      questionsData = snapshot.docs.map(d => ({ id: d.id, data: d.data() }))
      questionsLoaded = true
      emit()
    },
    (err) => onError(err)
  )

  return () => {
    unsubTopics()
    unsubQuestions()
  }
}

export function subscribeToOkcQuestion(
  questionId: string,
  onData: (question: AppQuestion | null) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onError(new Error("Firestore is not initialized"))
    return () => {}
  }

  const docRef = doc(db, "okcQuestions", questionId)
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (!docSnap.exists()) {
        onData(null)
      } else {
        onData(mapQuestionData(docSnap.id, docSnap.data()))
      }
    },
    (err) => onError(err)
  )
}

export function subscribeToCurrentDailySet(
  onData: (dailySet: DailySet | null) => void,
  onError: (error: Error) => void
): () => void {
  if (!db) {
    onError(new Error("Firestore is not initialized"))
    return () => {}
  }

  const q = query(
    collection(db, "dailySets"),
    where("visible", "==", true)
  )

  return onSnapshot(
    q,
    (snapshot) => {
      const now = Timestamp.now().toMillis()
      
      const sets: DailySet[] = snapshot.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          name: data.name || "Daily Set",
          publishAt: data.publishAt,
          expiresAt: data.expiresAt,
          questionIds: data.questionIds || [],
          visible: data.visible,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        }
      })

      // Filter sets that are currently active
      const activeSets = sets.filter(s => {
        if (!s.publishAt || !s.expiresAt) return false
        const pubMs = typeof s.publishAt.toMillis === 'function' ? s.publishAt.toMillis() : new Date(s.publishAt).getTime()
        const expMs = typeof s.expiresAt.toMillis === 'function' ? s.expiresAt.toMillis() : new Date(s.expiresAt).getTime()
        return pubMs <= now && now < expMs
      })

      // Sort by publishAt descending
      activeSets.sort((a, b) => {
        const timeA = typeof a.publishAt.toMillis === 'function' ? a.publishAt.toMillis() : new Date(a.publishAt).getTime()
        const timeB = typeof b.publishAt.toMillis === 'function' ? b.publishAt.toMillis() : new Date(b.publishAt).getTime()
        return timeB - timeA
      })

      if (activeSets.length > 0) {
        onData(activeSets[0])
      } else {
        onData(null)
      }
    },
    (err) => onError(err)
  )
}
