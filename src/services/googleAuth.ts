import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth'
import Constants from 'expo-constants'
import { auth } from './firebase'

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession()

// Google OAuth configuration
const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

// Get Google OAuth Client ID from environment
// For React Native, we need to use the iOS/Android client ID from Firebase Console
// This should be configured in Firebase Console > Authentication > Sign-in method > Google
const getGoogleClientId = () => {
  // Try to get from environment variables
  const clientId = Constants.expoConfig?.extra?.googleClientId || 
                   process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    // Fallback: Use the web client ID (will work for development)
    // In production, you should configure separate iOS/Android client IDs
    return '256950851198-bdcb5ed2f6a74ae7602a2f.apps.googleusercontent.com'
  }
  
  return clientId
}

export async function signInWithGoogle(): Promise<UserCredential | null> {
  try {
    const clientId = getGoogleClientId()
    
    // Request for Google OAuth
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: AuthSession.makeRedirectUri({
        scheme: 'catpet',
        path: 'auth',
      }),
    })

    const result = await request.promptAsync(discovery, {
      useProxy: true,
    })

    if (result.type === 'success') {
      const { id_token } = result.params

      if (!id_token) {
        throw new Error('Google ID token alınamadı')
      }

      // Create Firebase credential from Google ID token
      const credential = GoogleAuthProvider.credential(id_token)

      // Sign in to Firebase with the credential
      const userCredential = await signInWithCredential(auth, credential)

      return userCredential
    } else if (result.type === 'cancel') {
      // User cancelled - return null instead of throwing error
      return null
    } else {
      throw new Error('Google Sign-In başarısız oldu')
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error)
    throw new Error(error.message || 'Google ile giriş başarısız oldu')
  }
}

