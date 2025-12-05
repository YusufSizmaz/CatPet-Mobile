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
    
    // Expo'nun makeRedirectUri fonksiyonunu kullan - otomatik olarak doğru URL'i oluşturur
    // Development'ta Expo proxy kullanır, production'da custom scheme kullanır
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'catpet',
      path: 'auth',
    })
    
    if (__DEV__) {
      console.log('🔗 Google OAuth Redirect URI:', redirectUri)
      console.log('🔑 Google Client ID:', clientId?.substring(0, 20) + '...')
      console.log('⚠️  NOT: Bu redirect URI\'yi Google Cloud Console\'da eklemeniz gerekiyor!')
      console.log('   1. Google Cloud Console > APIs & Services > Credentials')
      console.log('   2. OAuth 2.0 Client ID\'nizi seçin')
      console.log('   3. "Authorized redirect URIs" bölümüne şu URL\'i ekleyin:')
      console.log('      ', redirectUri)
    }
    
    // Request for Google OAuth
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: redirectUri,
    })

    const result = await request.promptAsync(discovery)

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
    } else if (result.type === 'error') {
      // Handle error response
      const error = result.error || result.params?.error
      const errorDescription = result.params?.error_description || ''
      
      console.error('Google OAuth error:', error, errorDescription)
      
      if (error === 'access_denied') {
        return null // User cancelled
      }
      
      throw new Error(errorDescription || 'Google girişi başarısız oldu')
    } else {
      throw new Error('Google Sign-In başarısız oldu')
    }
  } catch (error: any) {
    console.error('Google Sign-In error:', error)
    
    // Daha açıklayıcı hata mesajları
    if (error.message?.includes('404') || error.message?.includes('not found')) {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'catpet', path: 'auth' })
      throw new Error(
        `Google OAuth yapılandırması hatalı.\n\n` +
        `Lütfen Google Cloud Console'da şu adımları izleyin:\n` +
        `1. https://console.cloud.google.com/apis/credentials adresine gidin\n` +
        `2. OAuth 2.0 Client ID'nizi seçin\n` +
        `3. "Authorized redirect URIs" bölümüne şu URL'i ekleyin:\n` +
        `   ${redirectUri}\n\n` +
        `Terminal'deki log'dan tam redirect URI'yi görebilirsiniz.`
      )
    }
    
    if (error.message?.includes('redirect_uri_mismatch')) {
      const redirectUri = AuthSession.makeRedirectUri({ scheme: 'catpet', path: 'auth' })
      throw new Error(
        `Redirect URI uyumsuzluğu.\n\n` +
        `Lütfen Google Cloud Console'da şu redirect URI'yi ekleyin:\n` +
        `${redirectUri}\n\n` +
        `Terminal'deki log'dan tam redirect URI'yi görebilirsiniz.`
      )
    }
    
    throw new Error(error.message || 'Google ile giriş başarısız oldu')
  }
}

