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
  solution?: QuestionSolution
}

export type QuestionSolution = {
  explanationMarkdown?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  cppCode?: string;
  javaCode?: string;
}

export interface AppTopic {
  id: string // Firestore document ID
  title: string
  description?: string
  order: number
  questions: AppQuestion[]
}

export interface UserProfile {
  uid: string
  createdAt?: any
  updatedAt?: any
}
