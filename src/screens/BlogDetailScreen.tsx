import React from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useBlogPost } from '../hooks/useBlog'
import { cleanImageUrl } from '../utils/imageUtils'
import { Ionicons } from '@expo/vector-icons'
import { getProfilePhotoUrl } from '../utils/profilePhoto'

export default function BlogDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { id } = route.params as { id: number }
  const { post, loading, error } = useBlogPost(id)

  const handleShare = async () => {
    if (!post) return
    try {
      await Share.share({
        message: `${post.title}\n${post.excerpt || post.content?.substring(0, 200)}`,
        title: post.title,
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  if (error || !post) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Blog yazısı bulunamadı'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    )
  }

  // Get author photo URL
  // Always use getProfilePhotoUrl to respect user's showGooglePhoto setting
  const getAuthorPhotoUrl = () => {
    // If author is an object, use getProfilePhotoUrl to check showGooglePhoto setting
    if (post.author && typeof post.author === 'object') {
      return getProfilePhotoUrl(post.author)
    }
    
    // If authorPhoto is provided but author object is not available, use it
    // (This might happen if backend doesn't send full author object)
    if (post.authorPhoto) {
      return post.authorPhoto
    }
    
    // Default avatar if nothing is available
    return getProfilePhotoUrl(null)
  }
  
  const authorPhotoUrl = getAuthorPhotoUrl()
  const authorName = typeof post.author === 'string' ? post.author : 
    (post.author && typeof post.author === 'object' ? 
      `${post.author.firstName || ''} ${post.author.lastName || ''}`.trim() || 'CatPet' : 
      'CatPet')

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingTop: Math.max(insets.top, 0) }}
    >
      {post.coverImage && (
        <Image
          source={{ uri: cleanImageUrl(post.coverImage) }}
          style={styles.coverImage}
          resizeMode="cover"
          onError={() => {}}
        />
      )}
      <View style={styles.content}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{post.category || 'Genel'}</Text>
        </View>
        <Text style={styles.title}>{post.title}</Text>
        {post.excerpt && <Text style={styles.excerpt}>{post.excerpt}</Text>}
        <View style={styles.meta}>
          <View style={styles.authorInfo}>
<<<<<<< HEAD
            {post.authorPhoto ? (
              <Image
                source={{ uri: cleanImageUrl(post.authorPhoto) }}
                style={styles.authorPhoto}
                onError={() => {}}
              />
=======
            {authorPhotoUrl ? (
              <Image source={{ uri: authorPhotoUrl }} style={styles.authorPhoto} />
>>>>>>> 54916bd44756bae6c6983f36deaeabe677830d61
            ) : (
              <View style={styles.authorPlaceholder}>
                <Ionicons name="person-outline" size={16} color="#999" />
              </View>
            )}
            <Text style={styles.authorName}>{authorName}</Text>
          </View>
          <Text style={styles.metaSeparator}>·</Text>
          <Text style={styles.metaDate}>{new Date(post.createdAt).toLocaleDateString('tr-TR')}</Text>
          <Text style={styles.metaSeparator}>·</Text>
          <Text style={styles.metaReadTime}>5 dk okuma</Text>
        </View>
        <View style={styles.articleContent}>
          <Text style={styles.articleText}>{post.content}</Text>
        </View>
        <View style={styles.footer}>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#666" />
            <Text style={styles.shareButtonText}>Paylaş</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back-outline" size={20} color="#FF7A00" />
            <Text style={styles.backButtonText}>Blog Yazılarına Dön</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  coverImage: {
    width: '100%',
    height: 250,
    backgroundColor: '#e5e5e5',
  },
  content: {
    padding: 20,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  categoryBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    lineHeight: 36,
  },
  excerpt: {
    fontSize: 18,
    color: '#666',
    lineHeight: 26,
    marginBottom: 20,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    flexWrap: 'wrap',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  authorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
  },
  authorPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  metaSeparator: {
    fontSize: 14,
    color: '#ccc',
    marginHorizontal: 8,
  },
  metaDate: {
    fontSize: 14,
    color: '#666',
  },
  metaReadTime: {
    fontSize: 14,
    color: '#666',
  },
  articleContent: {
    marginBottom: 32,
  },
  articleText: {
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
})

