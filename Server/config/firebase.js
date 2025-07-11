import { initializeApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getStorage, connectStorageEmulator } from "firebase/storage"

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
}

// Validate Firebase configuration
const requiredConfig = ["REACT_APP_FIREBASE_API_KEY", "REACT_APP_FIREBASE_AUTH_DOMAIN", "REACT_APP_FIREBASE_PROJECT_ID"]

for (const key of requiredConfig) {
  if (!process.env[key]) {
    console.error(`Missing required Firebase configuration: ${key}`)
    throw new Error(`Missing required Firebase configuration: ${key}`)
  }
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Cloud Storage and get a reference to the service
export const storage = getStorage(app)

// Connect to emulators in development
if (process.env.NODE_ENV === "development" && process.env.REACT_APP_USE_FIREBASE_EMULATOR === "true") {
  try {
    // Only connect if not already connected
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true })
    }

    if (!db._delegate._databaseId.projectId.includes("demo-")) {
      connectFirestoreEmulator(db, "localhost", 8080)
    }

    if (!storage._delegate._host.includes("localhost")) {
      connectStorageEmulator(storage, "localhost", 9199)
    }

    console.log("🔥 Connected to Firebase emulators")
  } catch (error) {
    console.warn("⚠️ Failed to connect to Firebase emulators:", error.message)
  }
}

// Configure auth settings
auth.languageCode = "en"

// Auth state persistence
import { setPersistence, browserLocalPersistence } from "firebase/auth"

setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Failed to set auth persistence:", error)
})

// Function to clean up reCAPTCHA
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
