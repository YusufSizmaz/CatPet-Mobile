import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../services/firebase'
import { authAPI, usersAPI } from '../services/api'
import { signInWithGoogle } from '../services/googleAuth'
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
  const syncUserWithBackend = async (firebaseUser: FirebaseUser, userData?: { firstName?: string; lastName?: string }) => {
    try {
      const idToken = await firebaseUser.getIdToken()
      const backendUserData = await authAPI.verifyToken(idToken)
      setBackendUser(backendUserData)
      await AsyncStorage.setItem('authToken', idToken)
      
      // If firstName/lastName provided and backend user doesn't have them, update
      if (userData && backendUserData && backendUserData.id) {
        const needsUpdate = 
          (userData.firstName && !backendUserData.firstName) || 
          (userData.lastName && !backendUserData.lastName) ||
          (userData.firstName && backendUserData.firstName !== userData.firstName) ||
          (userData.lastName && backendUserData.lastName !== userData.lastName)
        
        if (needsUpdate) {
          try {
            console.log('📝 Updating user firstName/lastName in backend:', { 
              firstName: userData.firstName, 
              lastName: userData.lastName 
            })
            await usersAPI.update(backendUserData.id, {
              firstName: userData.firstName || backendUserData.firstName || null,
              lastName: userData.lastName || backendUserData.lastName || null,
            }, idToken)
            // Refresh backend user data
            const updatedUserData = await authAPI.verifyToken(idToken)
            setBackendUser(updatedUserData)
            console.log('✅ User firstName/lastName updated successfully')
          } catch (updateError) {
            console.error('❌ Failed to update user firstName/lastName:', updateError)
          }
        }
      }
    } catch (error: any) {
      // Backend'e bağlanamazsa sadece debug modda log'la, uygulama çalışmaya devam etsin
      // Production'da bu hata sessizce handle edilir
      // console.debug kullanarak daha az görünür hale getiriyoruz
      console.debug('Backend sync error (non-critical, offline mode):', error?.message || error)
      // Token'ı yine de kaydet, offline çalışma için
      try {
        const idToken = await firebaseUser.getIdToken()
        await AsyncStorage.setItem('authToken', idToken)
      } catch (tokenError) {
        console.debug('Failed to save token:', tokenError)
      }
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
    try {
      await updateProfile(userCredential.user, {
        displayName: `${firstName} ${lastName}`,
      })
    } catch (error) {
      console.error('Failed to update profile:', error)
    }
    // Sync with backend and pass firstName/lastName to ensure they're saved
    await syncUserWithBackend(userCredential.user, { firstName, lastName })
  }

  const loginWithGoogle = async () => {
    const userCredential = await signInWithGoogle()
    if (!userCredential) {
      // User cancelled - silently return
      return
    }
    await syncUserWithBackend(userCredential.user)
  }

  const logout = async () => {
    await firebaseSignOut(auth)
    setBackendUser(null)
    await AsyncStorage.removeItem('authToken')
  }

  const refreshBackendUser = async () => {
    if (user && backendUser?.id) {
      console.log('🔄 Backend kullanıcı bilgileri yenileniyor...')
      try {
        const idToken = await user.getIdToken()
        // Doğrudan usersAPI.getById ile güncel veriyi çek (token ile)
        const updatedUserData = await usersAPI.getById(backendUser.id, idToken)
        console.log('✅ Güncel kullanıcı verisi alındı:', {
          id: updatedUserData?.id,
          firstName: updatedUserData?.firstName,
          lastName: updatedUserData?.lastName,
          city: updatedUserData?.city,
          updatedAt: updatedUserData?.updatedAt,
        })
        setBackendUser(updatedUserData)
        console.log('✅ Backend kullanıcı bilgileri başarıyla yenilendi ve state güncellendi')
      } catch (error: any) {
        console.error('❌ Backend kullanıcı bilgileri yenilenirken hata:', error.message)
        console.error('❌ Hata detayları:', {
          response: error.response?.data,
          status: error.response?.status,
        })
        // Hata durumunda fallback olarak syncUserWithBackend kullan
        try {
          console.log('🔄 Fallback: syncUserWithBackend kullanılıyor...')
          await syncUserWithBackend(user)
          console.log('✅ Fallback sync başarılı')
        } catch (fallbackError: any) {
          console.error('❌ Fallback sync de başarısız:', fallbackError.message)
        }
      }
    } else if (user) {
      // Eğer backendUser yoksa, syncUserWithBackend kullan
      console.log('🔄 Backend kullanıcı bilgileri senkronize ediliyor (ilk kez)...')
      try {
        await syncUserWithBackend(user)
        console.log('✅ Backend kullanıcı bilgileri başarıyla senkronize edildi')
      } catch (error: any) {
        console.error('❌ Backend kullanıcı bilgileri senkronize edilirken hata:', error.message)
      }
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

