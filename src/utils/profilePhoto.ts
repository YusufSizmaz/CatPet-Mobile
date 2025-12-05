/**
 * Helper function to get user profile photo URL
 * If user has not hidden their photo in settings (showGooglePhoto !== false), returns DB profilePhoto
 * Otherwise returns default avatar
 * 
 * Note: Checks userSettings.showGooglePhoto from backend.
 * If showGooglePhoto is false, shows default avatar.
 * If showGooglePhoto is true or undefined, shows DB profilePhoto if available.
 */
export const getProfilePhotoUrl = (user: {
  profilePhoto?: string | null
  showGooglePhoto?: boolean
  userSettings?: {
    showGooglePhoto?: boolean
  }
} | null | undefined): string => {
  const defaultAvatar = 'https://res.cloudinary.com/dknfc65z0/image/upload/v1764186141/meerkat_svydkb.png'
  
  if (!user) {
    return defaultAvatar
  }
  
  // userSettings.showGooglePhoto veya direkt showGooglePhoto kontrolü
  // Eğer showGooglePhoto false ise (ayarlardan gizlenmişse), default avatar göster
  const showGooglePhoto = user.userSettings?.showGooglePhoto ?? user.showGooglePhoto ?? true
  
  if (showGooglePhoto === false) {
    return defaultAvatar
  }
  
  // Eğer DB'de profilePhoto varsa ve gizlenmemişse, onu göster
  if (user.profilePhoto) {
    return user.profilePhoto
  }
  
  // Eğer profilePhoto yoksa, default avatar göster
  return defaultAvatar
}

/**
 * Check if user has a profile photo (not default avatar)
 */
export const hasProfilePhoto = (user: {
  profilePhoto?: string | null
  showGooglePhoto?: boolean
  userSettings?: {
    showGooglePhoto?: boolean
  }
} | null | undefined): boolean => {
  const defaultAvatar = 'https://res.cloudinary.com/dknfc65z0/image/upload/v1764186141/meerkat_svydkb.png'
  return getProfilePhotoUrl(user) !== defaultAvatar
}

