import { resolve } from "path"
import { readFileSync, existsSync } from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

const serviceAccountPath = resolve(process.cwd(), "service-account.json")
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

async function run() {
  const snapshot = await db.collection("questions").limit(5).get()
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", JSON.stringify(doc.data(), null, 2))
  })
}

run()
