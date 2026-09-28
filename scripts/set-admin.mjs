import { resolve } from "path"
import { readFileSync, existsSync } from "fs"
import { initializeApp, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"

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

const auth = getAuth()

async function setAdmin() {
  const uid = process.argv[2]
  
  if (!uid) {
    console.error("❌ ERROR: Please provide a UID as an argument.")
    console.error("Usage: node scripts/set-admin.mjs <UID>")
    process.exit(1)
  }

  try {
    // Set custom user claims
    await auth.setCustomUserClaims(uid, { admin: true })
    console.log(`✅ Successfully granted admin access to UID: ${uid}`)
    console.log("⚠️ If the user is currently logged in, they must sign out and sign back in to refresh their ID token.")
    process.exit(0)
  } catch (err) {
    console.error("❌ Failed to set admin claim:", err)
    process.exit(1)
  }
}

setAdmin()
