import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

// ✅ Firebase config using import.meta.env for Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

// ✅ Validate Firebase configuration
const requiredConfig = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
]

for (const key of requiredConfig) {
  if (!import.meta.env[key]) {
    console.error(`Missing required Firebase configuration: ${key}`)
    throw new Error(`Missing required Firebase configuration: ${key}`)
  }
}

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig)

// ✅ Initialize services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// ✅ Connect to emulators if using emulator
if (import.meta.env.MODE === "development" && import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    connectFirestoreEmulator(db, "localhost", 8080)
    connectStorageEmulator(storage, "localhost", 9199)
    console.log("🔥 Connected to Firebase emulators")
  } catch (error) {
    console.warn("⚠️ Failed to connect to Firebase emulators:", error.message)
  }
}

// ✅ Configure auth persistence
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence:", error)
})

// ✅ Function to clean up reCAPTCHA (if using Phone Auth)
export const cleanupRecaptcha = () => {
  if (window.recaptchaVerifier) {
    try {
      window.recaptchaVerifier.clear()
    } catch (error) {
      console.log("Error clearing reCAPTCHA:", error)
    }
    window.recaptchaVerifier = null
  }
}

export default app
