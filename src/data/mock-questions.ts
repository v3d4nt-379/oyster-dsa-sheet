export type Difficulty = "Easy" | "Medium" | "Hard"

export interface PracticeLinkData {
  platform: "LeetCode" | "GeeksforGeeks" | "CodeChef"
  url: string
}

export interface Question {
  id: string
  title: string
  difficulty: Difficulty
  links: PracticeLinkData[]
}

export interface Topic {
  id: string
  title: string
  questions: Question[]
}

export const MOCK_TOPICS: Topic[] = [
  {
    id: "arrays",
    title: "ARRAYS",
    questions: [
      {
        id: "Q1",
        title: "Largest Element in an Array",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q2",
        title: "Second Largest Element",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q3",
        title: "Check if Array Is Sorted",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q4",
        title: "Remove Duplicates from Sorted Array",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q5",
        title: "Left Rotate an Array by One",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q6",
        title: "Two Sum",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q7",
        title: "Sort an array of 0's 1's and 2's",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }, { platform: "CodeChef", url: "#" }]
      }
    ]
  },
  {
    id: "hashing",
    title: "HASHING",
    questions: [
      {
        id: "Q1",
        title: "Hashing Theory",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q2",
        title: "Count Frequencies of Array Elements",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q3",
        title: "Find Highest/Lowest Frequency Element",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q4",
        title: "Longest Consecutive Sequence",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }]
      }
    ]
  },
  {
    id: "binary-search",
    title: "BINARY SEARCH",
    questions: [
      {
        id: "Q1",
        title: "Binary Search",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q2",
        title: "Lower Bound",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q3",
        title: "Upper Bound",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q4",
        title: "Search Insert Position",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q5",
        title: "Find First and Last Position of Element",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q6",
        title: "Median of Two Sorted Arrays",
        difficulty: "Hard",
        links: [{ platform: "LeetCode", url: "#" }]
      }
    ]
  },
  {
    id: "linked-list",
    title: "LINKED LIST",
    questions: [
      {
        id: "Q1",
        title: "Introduction to Linked List",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q2",
        title: "Insert Node at Beginning",
        difficulty: "Easy",
        links: [{ platform: "GeeksforGeeks", url: "#" }]
      },
      {
        id: "Q3",
        title: "Delete Node in a Linked List",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q4",
        title: "Reverse Linked List",
        difficulty: "Medium",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q5",
        title: "Middle of the Linked List",
        difficulty: "Easy",
        links: [{ platform: "LeetCode", url: "#" }]
      },
      {
        id: "Q6",
        title: "Reverse Nodes in k-Group",
        difficulty: "Hard",
        links: [{ platform: "LeetCode", url: "#" }]
      }
    ]
  }
]
