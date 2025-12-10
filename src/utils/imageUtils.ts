/**
 * Clean and normalize image URLs
 * Handles common URL issues like spaces, encoding, etc.
 */
export const cleanImageUrl = (url: string | null | undefined): string => {
  if (!url || typeof url !== 'string') {
    return ''
  }
  
  // Trim whitespace
  let cleaned = url.trim()
  
  // If URL doesn't start with http/https, return as is (might be a relative path)
  if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
    return cleaned
  }
  
  // Encode spaces and other special characters if needed
  // But don't double-encode already encoded URLs
  try {
    // Check if URL is already properly encoded
    const decoded = decodeURIComponent(cleaned)
    // If decoding works and is different, it means it was encoded
    // Re-encode it properly
    if (decoded !== cleaned) {
      // Split URL into parts to avoid encoding the protocol and domain
      const urlObj = new URL(cleaned)
      urlObj.pathname = encodeURI(decodeURIComponent(urlObj.pathname))
      cleaned = urlObj.toString()
    }
  } catch (e) {
    // If URL parsing fails, try to encode spaces manually
    cleaned = cleaned.replace(/\s+/g, '%20')
  }
  
  return cleaned
}

