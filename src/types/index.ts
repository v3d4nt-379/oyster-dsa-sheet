export type Difficulty = "Easy" | "Medium" | "Hard"

export interface PracticeLinkData {
  platform: "LeetCode" | "GeeksforGeeks" | "CodeChef"
  url: string
}

export interface AppQuestion {
  id: string // Firestore document ID
  questionId: string // Display ID, e.g., "Q1"
  title: string
  topicId: string
  difficulty: Difficulty
  links: PracticeLinkData[]
  order: number
}

export interface AppTopic {
  id: string // Firestore document ID
  title: string
  description?: string
  order: number
  questions: AppQuestion[]
}
