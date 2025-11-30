import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithCredential,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { authAPI } from '../services/api'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { User } from '../types/user.types'

interface AuthContextType {
  user: FirebaseUser | null
  backendUser: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshBackendUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [backendUser, setBackendUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Sync Firebase user with backend
  const syncUserWithBackend = async (firebaseUser: FirebaseUser) => {
    try {
      const idToken = await firebaseUser.getIdToken()
      const userData = await authAPI.verifyToken(idToken)
      setBackendUser(userData)
      await AsyncStorage.setItem('authToken', idToken)
    } catch (error) {
      console.error('Backend sync error:', error)
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        await syncUserWithBackend(firebaseUser)
      } else {
        setBackendUser(null)
        await AsyncStorage.removeItem('authToken')
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    await syncUserWithBackend(userCredential.user)
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Update profile with display name
    // Note: updateProfile is not available in React Native Firebase Auth
    // We'll handle this in the backend sync
    await syncUserWithBackend(userCredential.user)
  }

  const loginWithGoogle = async () => {
    // Google Sign-In implementation for React Native
    // This requires @react-native-google-signin/google-signin package
    // For now, we'll leave it as a placeholder
    throw new Error('Google Sign-In not yet implemented')
  }

  const logout = async () => {
    await firebaseSignOut(auth)
    setBackendUser(null)
    await AsyncStorage.removeItem('authToken')
  }

  const refreshBackendUser = async () => {
    if (user) {
      await syncUserWithBackend(user)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        backendUser,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshBackendUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

