import { resolve } from "path"
import { readFileSync, existsSync } from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore, FieldValue } from "firebase-admin/firestore"

// ---------------------------------------------------------
// IMPORTANT SECURITY NOTICE:
// ---------------------------------------------------------
// This script utilizes the Firebase Admin SDK to seed the database safely 
// WITHOUT modifying production security rules to `allow write: if true;`.
//
// PREREQUISITES:
// 1. Generate a Service Account Private Key from your Firebase Console
//    (Project Settings > Service Accounts > Generate new private key).
// 2. Save the downloaded JSON file to the root of this project as:
//    service-account.json
// 3. This file is added to .gitignore to prevent accidental commits.
// 4. DO NOT EXPOSE this file inside the `public/` directory or frontend code.
// ---------------------------------------------------------

const serviceAccountPath = resolve(process.cwd(), "service-account.json")

if (!existsSync(serviceAccountPath)) {
  console.error("❌ ERROR: service-account.json not found in the project root.")
  console.error("Please download your Firebase Admin SDK service account key and save it as 'service-account.json'.")
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

// Phase 3 mock data
const MOCK_TOPICS = [
  {
    id: "arrays",
    title: "ARRAYS",
    description: "Array-based data structure and problem-solving questions",
    questions: [
      { id: "Q1", title: "Largest Element in an Array", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q2", title: "Second Largest Element", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q3", title: "Check if Array Is Sorted", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q4", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q5", title: "Left Rotate an Array by One", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q6", title: "Two Sum", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q7", title: "Sort an array of 0's 1's and 2's", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }, { platform: "CodeChef", url: "#" }] }
    ]
  },
  {
    id: "hashing",
    title: "HASHING",
    description: "Hashing and frequency-based problem solving",
    questions: [
      { id: "Q1", title: "Hashing Theory", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q2", title: "Count Frequencies of Array Elements", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q3", title: "Find Highest/Lowest Frequency Element", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q4", title: "Longest Consecutive Sequence", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }, { platform: "GeeksforGeeks", url: "#" }] }
    ]
  },
  {
    id: "binary-search",
    title: "BINARY SEARCH",
    description: "Finding elements efficiently with O(log n) time",
    questions: [
      { id: "Q1", title: "Binary Search", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q2", title: "Lower Bound", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q3", title: "Upper Bound", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q4", title: "Search Insert Position", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q5", title: "Find First and Last Position of Element", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q6", title: "Median of Two Sorted Arrays", difficulty: "Hard", links: [{ platform: "LeetCode", url: "#" }] }
    ]
  },
  {
    id: "linked-list",
    title: "LINKED LIST",
    description: "Node-based sequential data structures",
    questions: [
      { id: "Q1", title: "Introduction to Linked List", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q2", title: "Insert Node at Beginning", difficulty: "Easy", links: [{ platform: "GeeksforGeeks", url: "#" }] },
      { id: "Q3", title: "Delete Node in a Linked List", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q4", title: "Reverse Linked List", difficulty: "Medium", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q5", title: "Middle of the Linked List", difficulty: "Easy", links: [{ platform: "LeetCode", url: "#" }] },
      { id: "Q6", title: "Reverse Nodes in k-Group", difficulty: "Hard", links: [{ platform: "LeetCode", url: "#" }] }
    ]
  }
]

async function seed() {
  console.log("Starting Firebase Admin seed process...")
  
  let topicsUpdated = 0
  let questionsUpdated = 0

  try {
    const batch = db.batch()
    let topicOrder = 1

    for (const topic of MOCK_TOPICS) {
      const topicRef = db.collection("topics").doc(topic.id)
      batch.set(topicRef, {
        name: topic.title,
        description: topic.description,
        order: topicOrder++,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      }, { merge: true }) // Uses merge to cleanly update existing documents idempotently
      
      topicsUpdated++

      let questionOrder = 1
      for (const q of topic.questions) {
        const questionDocId = `${topic.id}-${q.id.toLowerCase()}`
        const qRef = db.collection("questions").doc(questionDocId)
        
        const leetcodeUrl = q.links.find(l => l.platform === "LeetCode")?.url || null
        const gfgUrl = q.links.find(l => l.platform === "GeeksforGeeks")?.url || null
        const codechefUrl = q.links.find(l => l.platform === "CodeChef")?.url || null

        batch.set(qRef, {
          questionId: q.id,
          title: q.title,
          topicId: topic.id,
          difficulty: q.difficulty,
          leetcodeUrl,
          gfgUrl,
          codechefUrl,
          order: questionOrder++,
          createdAt: FieldValue.serverTimestamp(),
          updatedAt: FieldValue.serverTimestamp()
        }, { merge: true })

        questionsUpdated++
      }
    }

    await batch.commit()
    console.log("✅ Seed completed successfully!")
    console.log(`- Topics created/updated: ${topicsUpdated}`)
    console.log(`- Questions created/updated: ${questionsUpdated}`)
    
    await seedOkcTestQuestions()
    
    process.exit(0)
  } catch (err) {
    console.error("❌ Seeding failed: ", err)
    process.exit(1)
  }
}

async function seedOkcTestQuestions() {
  console.log("Starting temporary OKC test data population...")
  const testIds = ["arrays-q002", "arrays-q003", "arrays-q005"]
  const batch = db.batch()
  let copied = 0

  try {
    for (const id of testIds) {
      const qSnap = await db.collection("questions").doc(id).get()
      if (qSnap.exists) {
        const data = qSnap.data()
        // Ensure they are enabled for testing
        data.enabled = true
        // Allow solution viewing for testing
        data.solutionEnabled = true
        // Keep everything else identical (topicId, difficulty, links, solution)
        
        const okcRef = db.collection("okcQuestions").doc(id)
        batch.set(okcRef, data, { merge: true })
        copied++
      }
    }

    await batch.commit()
    console.log(`✅ OKC test data populated! Copied ${copied} questions to 'okcQuestions'.`)
  } catch (err) {
    console.error("❌ OKC test data population failed: ", err)
  }
}

seed()
