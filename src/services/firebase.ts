import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, initializeAuth, getReactNativePersistence } from 'firebase/auth'
import Constants from 'expo-constants'
import AsyncStorage from '@react-native-async-storage/async-storage'

// Firebase configuration
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey || process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBWx-EFaZlZi7Wq6nslnSPrqrDZEif4NUo',
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain || process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'catpetapp.firebaseapp.com',
  projectId: Constants.expoConfig?.extra?.firebaseProjectId || process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'catpetapp',
  storageBucket: Constants.expoConfig?.extra?.firebaseStorageBucket || process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'catpetapp.firebasestorage.app',
  messagingSenderId: Constants.expoConfig?.extra?.firebaseMessagingSenderId || process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '256950851198',
  appId: Constants.expoConfig?.extra?.firebaseAppId || process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:256950851198:web:bdcb5ed2f6a74ae7602a2f',
}

// Initialize Firebase
let app: FirebaseApp
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig)
} else {
  app = getApps()[0]
}

// Initialize Auth with AsyncStorage persistence
let auth: Auth
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  })
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app)
}

export { app, auth }
export default app
