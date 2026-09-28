import { getFirestore } from "firebase/firestore"
import { app } from "./config"

// Export the Firestore instance
export const db = app ? getFirestore(app) : null
