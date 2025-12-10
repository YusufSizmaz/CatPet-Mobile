import * as AuthSession from 'expo-auth-session'
import * as WebBrowser from 'expo-web-browser'
import * as Crypto from 'expo-crypto'
import { GoogleAuthProvider, signInWithCredential, UserCredential } from 'firebase/auth'
import Constants from 'expo-constants'
import { auth } from './firebase'

// Complete the auth session in the browser
WebBrowser.maybeCompleteAuthSession()

// Get Google OAuth Client ID from environment
// Expo'da web browser kullanıldığı için Web Client ID kullanmalıyız
const getGoogleClientId = () => {
  // Web Client ID kullan (Expo web browser için gerekli)
  const clientId = Constants.expoConfig?.extra?.googleClientId || 
                   process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID
  
  if (!clientId) {
    // Fallback: Use the web client ID
    return '256950851198-bdcb5ed2f6a74ae7602a2f.apps.googleusercontent.com'
  }
  
  return clientId
}

export async function signInWithGoogle(): Promise<UserCredential | null> {
  try {
    const clientId = getGoogleClientId()
    
    // Firebase'in auth handler URL'ini kullan - zaten Google Cloud Console'da kayıtlı
    // Bu URL web browser tabanlı OAuth için çalışır
    const redirectUri = 'https://catpetapp.firebaseapp.com/__/auth/handler'
    
    if (__DEV__) {
      console.log('🔗 Google OAuth Redirect URI:', redirectUri)
      console.log('🔑 Google Client ID:', clientId?.substring(0, 20) + '...')
      console.log('✅ Firebase auth handler kullanılıyor (Google Cloud Console\'da kayıtlı)')
    }
    
    // Google OAuth discovery endpoints
    const discovery = {
      authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenEndpoint: 'https://oauth2.googleapis.com/token',
      revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    }
    
    // IdToken için nonce gereklidir - güvenlik için random nonce oluştur
    const nonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      Math.random().toString(36) + Date.now().toString()
    )
    
    // Request for Google OAuth
    // IdToken için nonce gereklidir
    const request = new AuthSession.AuthRequest({
      clientId: clientId,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.IdToken,
      redirectUri: redirectUri,
      usePKCE: false, // IdToken için PKCE gerekli değil
      extraParams: {
        nonce: nonce, // IdToken için nonce ekle
      },
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

