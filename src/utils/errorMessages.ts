/**
 * Firebase hata kodlarını Türkçe mesajlara çevirir
 */
export function getFirebaseErrorMessage(error: any): string {
  const errorCode = error?.code || ''
  const errorMessage = error?.message || ''

  // Firebase Auth hata kodları
  switch (errorCode) {
    case 'auth/invalid-email':
      return 'Geçersiz e-posta adresi. Lütfen doğru formatta bir e-posta girin.'
    
    case 'auth/user-disabled':
      return 'Bu hesap devre dışı bırakılmış. Lütfen destek ekibi ile iletişime geçin.'
    
    case 'auth/user-not-found':
      return 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı. Lütfen kayıt olun.'
    
    case 'auth/wrong-password':
    case 'auth/invalid-password':
      return 'Şifre yanlış. Lütfen şifrenizi kontrol edip tekrar deneyin.'
    
    case 'auth/invalid-credential':
      // invalid-credential genellikle şifre yanlış veya kullanıcı bulunamadı anlamına gelir
      // E-posta geçerli formattaysa şifre yanlış demektir
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const errorMessageLower = errorMessage.toLowerCase()
      if (errorMessageLower.includes('password') || errorMessageLower.includes('şifre')) {
        return 'Şifre yanlış. Lütfen şifrenizi kontrol edip tekrar deneyin.'
      }
      // Eğer e-posta formatı geçerliyse şifre yanlış olabilir
      if (errorMessageLower.includes('email') && !errorMessageLower.includes('invalid-email')) {
        return 'Şifre yanlış. Lütfen şifrenizi kontrol edip tekrar deneyin.'
      }
      return 'E-posta veya şifre yanlış. Lütfen bilgilerinizi kontrol edip tekrar deneyin.'
    
    case 'auth/user-mismatch':
    case 'auth/credential-already-in-use':
      return 'Şifre yanlış. Lütfen şifrenizi kontrol edip tekrar deneyin.'
    
    case 'auth/email-already-in-use':
      return 'Bu e-posta adresi zaten kullanılıyor. Giriş yapmayı deneyin.'
    
    case 'auth/weak-password':
      return 'Şifre çok zayıf. Lütfen en az 6 karakterli, daha güçlü bir şifre seçin.'
    
    case 'auth/operation-not-allowed':
      return 'Bu işlem şu anda izin verilmiyor. Lütfen daha sonra tekrar deneyin.'
    
    case 'auth/too-many-requests':
      return 'Çok fazla başarısız deneme. Lütfen bir süre sonra tekrar deneyin.'
    
    case 'auth/network-request-failed':
      return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.'
    
    case 'auth/requires-recent-login':
      return 'Bu işlem için tekrar giriş yapmanız gerekiyor.'
    
    default:
      // Eğer hata mesajında "password", "şifre", "credential" veya "wrong" geçiyorsa
      const lowerMessage = errorMessage.toLowerCase()
      const lowerCode = errorCode.toLowerCase()
      
      // Şifre ile ilgili hatalar
      if (lowerCode.includes('password') || 
          lowerCode.includes('credential') ||
          lowerMessage.includes('password') || 
          lowerMessage.includes('şifre') ||
          lowerMessage.includes('wrong') ||
          lowerMessage.includes('invalid-credential')) {
        // Eğer kullanıcı bulunamadı mesajı varsa, önce onu kontrol et
        if (lowerMessage.includes('user-not-found') || lowerMessage.includes('no user')) {
          return 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı. Lütfen kayıt olun.'
        }
        return 'Şifre yanlış. Lütfen şifrenizi kontrol edip tekrar deneyin.'
      }
      
      // Eğer kullanıcı bulunamadı
      if (lowerCode.includes('user-not-found') || 
          lowerMessage.includes('user-not-found') || 
          lowerMessage.includes('no user')) {
        return 'Bu e-posta adresine kayıtlı bir kullanıcı bulunamadı. Lütfen kayıt olun.'
      }
      
      // Eğer hata mesajında "email" veya "e-posta" geçiyorsa
      if (errorMessage.toLowerCase().includes('email') || 
          errorMessage.toLowerCase().includes('e-posta') ||
          errorMessage.toLowerCase().includes('invalid-email')) {
        return 'Geçersiz e-posta adresi. Lütfen doğru formatta bir e-posta girin.'
      }
      
      // Genel hata mesajı
      return errorMessage || 'Bir hata oluştu. Lütfen tekrar deneyin.'
  }
}

/**
 * Hata başlığını belirler
 */
export function getErrorTitle(error: any): string {
  const errorCode = error?.code || ''
  const errorMessage = error?.message || ''
  const lowerCode = errorCode.toLowerCase()
  const lowerMessage = errorMessage.toLowerCase()

  // Şifre hataları
  if (lowerCode.includes('password') || 
      lowerCode === 'auth/invalid-credential' ||
      lowerCode === 'auth/wrong-password' ||
      lowerMessage.includes('password') ||
      lowerMessage.includes('şifre') ||
      lowerMessage.includes('wrong')) {
    return 'Şifre Hatalı'
  }

  // E-posta hataları
  if (lowerCode.includes('email') || 
      lowerCode.includes('invalid-email') ||
      lowerMessage.includes('email') ||
      lowerMessage.includes('e-posta') ||
      lowerMessage.includes('invalid-email')) {
    return 'E-posta Hatası'
  }

  // Kullanıcı bulunamadı
  if (lowerCode.includes('user-not-found') || 
      lowerMessage.includes('user-not-found') ||
      lowerMessage.includes('no user')) {
    return 'Kullanıcı Bulunamadı'
  }

  return 'Hata'
}

