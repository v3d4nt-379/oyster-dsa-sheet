import { resolve } from "path"
import { readFileSync } from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

const serviceAccountPath = resolve(process.cwd(), "service-account.json")
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'))

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()
const auth = getAuth()

async function syncUsers() {
  console.log("Syncing missing user details from Firebase Auth to Firestore...")
  
  // Get all users from Firestore
  const usersSnap = await db.collection("users").get()
  
  let updatedCount = 0

  for (const doc of usersSnap.docs) {
    const data = doc.data()
    // If they are missing name or email, try to fetch from Auth
    if (!data.name || !data.email) {
      try {
        const authUser = await auth.getUser(doc.id)
        
        await doc.ref.update({
          name: authUser.displayName || "",
          email: authUser.email || "",
          photoURL: authUser.photoURL || "",
          username: authUser.email?.split("@")[0] || ""
        })
        
        console.log(`✅ Synced details for ${authUser.email || doc.id}`)
        updatedCount++
      } catch (err) {
        console.log(`⚠️ Could not find Auth user for ${doc.id}`)
      }
    }
  }

  console.log(`Finished syncing. Total updated: ${updatedCount}`)
  process.exit(0)
}

syncUsers().catch(err => {
  console.error("❌ Failed to sync users:", err)
  process.exit(1)
})
