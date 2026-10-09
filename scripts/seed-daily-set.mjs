import { resolve } from "path"
import { readFileSync } from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore, FieldValue, Timestamp } from "firebase-admin/firestore"

const serviceAccountPath = resolve(process.cwd(), "service-account.json")
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

async function seedDailySet() {
  console.log("Creating temporary Daily Set...")
  
  const setId = "test-daily-set-001"
  const ref = db.collection("dailySets").doc(setId)
  
  // Set publishAt to a time in the past so it's immediately visible
  // e.g. 1 hour ago
  const publishAtDate = new Date()
  publishAtDate.setHours(publishAtDate.getHours() - 1)
  
  // Temporarily copy hashing-q001 to okcQuestions for testing
  const qSnap = await db.collection("questions").doc("hashing-q001").get()
  if (qSnap.exists) {
    const data = qSnap.data()
    data.enabled = true
    data.solutionEnabled = true
    await db.collection("okcQuestions").doc("hashing-q001").set(data, { merge: true })
  }

  const expiresAtDate = new Date(publishAtDate)
  expiresAtDate.setHours(expiresAtDate.getHours() + 24)

  const data = {
    name: "Test Daily Set",
    publishAt: Timestamp.fromDate(publishAtDate),
    expiresAt: Timestamp.fromDate(expiresAtDate),
    questionIds: [
      "arrays-q002",
      "hashing-q001",
      "arrays-q005"
    ],
    visible: true,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  }

  await ref.set(data, { merge: true })
  
  console.log(`✅ Temporary Daily Set '${setId}' created with 2 questions.`)
  process.exit(0)
}

seedDailySet().catch(err => {
  console.error("❌ Failed to create Daily Set:", err)
  process.exit(1)
})
