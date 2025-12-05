import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator, Modal, TextInput, Alert } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useBlog } from '../hooks/useBlog'
import { BlogPost } from '../types/blog.types'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { forumAPI } from '../services/api'

const categories = ['all', 'cats', 'dogs', 'birds', 'fish', 'rodents', 'other']
const categoryLabels: Record<string, string> = {
  all: 'Tümü',
  cats: 'Kediler',
  dogs: 'Köpekler',
  birds: 'Kuşlar',
  fish: 'Balıklar',
  rodents: 'Kemirgenler',
  other: 'Diğer',
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return date.toLocaleDateString('tr-TR')
}

const maskName = (name: string | undefined | null): string => {
  if (!name || name.trim().length === 0) return '***'
  const trimmed = name.trim()
  return trimmed[0].toUpperCase() + '***'
}

export default function BlogScreen() {
  const [activeTab, setActiveTab] = useState<'blog' | 'forum'>('blog')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { user, backendUser } = useAuth()
  const { posts, loading, error } = useBlog(selectedCategory === 'all' ? undefined : { category: selectedCategory })
  
  const [forumTopics, setForumTopics] = useState<any[]>([])
  const [forumLoading, setForumLoading] = useState(false)
  const [forumError, setForumError] = useState<string | null>(null)
  const [showNewTopicModal, setShowNewTopicModal] = useState(false)
  const [newTopicTitle, setNewTopicTitle] = useState('')
  const [newTopicContent, setNewTopicContent] = useState('')
  const [submittingTopic, setSubmittingTopic] = useState(false)
  const forumLoadedRef = useRef<string | null>(null)

  const featuredPost = posts.length > 0 ? posts[0] : null
  const regularPosts = posts.slice(1)
  const isLoggedIn = !!user

  // Load forum topics
  useEffect(() => {
    if (activeTab !== 'forum' || forumLoadedRef.current === activeTab) return
    forumLoadedRef.current = activeTab

    const loadForumTopics = async () => {
      setForumLoading(true)
      setForumError(null)
      try {
        const topics = await forumAPI.getAllTopics()
        setForumTopics(topics)
      } catch (err: any) {
        console.error('Forum topics yükleme hatası:', err)
        setForumError(err.message || 'Forum konuları yüklenirken bir hata oluştu')
      } finally {
        setForumLoading(false)
      }
    }

    loadForumTopics()
  }, [activeTab])

  const handleCreateTopic = async () => {
    if (!user || !newTopicTitle.trim() || !newTopicContent.trim()) {
      Alert.alert('Hata', 'Lütfen başlık ve içerik girin')
      return
    }

    setSubmittingTopic(true)
    setForumError(null)

    try {
      const token = await user.getIdToken()
      const newTopic = await forumAPI.createTopic({
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
      }, token)
      
      setForumTopics(prev => [newTopic, ...prev])
      setShowNewTopicModal(false)
      setNewTopicTitle('')
      setNewTopicContent('')
    } catch (err: any) {
      console.error('Konu oluşturma hatası:', err)
      Alert.alert('Hata', err.message || 'Konu oluşturulurken bir hata oluştu')
    } finally {
      setSubmittingTopic(false)
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <Text style={styles.title}>CatPet Bilgi Bankası & Forum</Text>
        <Text style={styles.subtitle}>
          Tüm hayvan dostlarımız hakkında bilgi edinin, topluluk forumumuzda sorular sorun ve deneyimlerinizi paylaşın.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'blog' && styles.tabActive]}
          onPress={() => setActiveTab('blog')}
        >
          <Ionicons name="document-text-outline" size={20} color={activeTab === 'blog' ? '#FF7A00' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'blog' && styles.tabTextActive]}>Blog Yazıları</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'forum' && styles.tabActive]}
          onPress={() => setActiveTab('forum')}
        >
          <Ionicons name="chatbubbles-outline" size={20} color={activeTab === 'forum' ? '#FF7A00' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'forum' && styles.tabTextActive]}>Forum Tartışmaları</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'blog' && (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Filters */}
          <ScrollView
            horizontal
            style={styles.categoryContainer}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryButton,
                  selectedCategory === cat && styles.categoryButtonActive,
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === cat && styles.categoryButtonTextActive,
                  ]}
                >
                  {categoryLabels[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <TouchableOpacity
                  style={styles.featuredCard}
                  onPress={() => navigation.navigate('BlogDetail' as never, { id: featuredPost.id } as never)}
                >
                  {featuredPost.coverImage && (
                    <Image source={{ uri: featuredPost.coverImage }} style={styles.featuredImage} />
                  )}
                  <View style={styles.featuredContent}>
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredBadgeText}>Öne Çıkan Yazı</Text>
                    </View>
                    <Text style={styles.featuredTitle}>{featuredPost.title}</Text>
                    <Text style={styles.featuredExcerpt} numberOfLines={3}>
                      {featuredPost.excerpt || featuredPost.content?.substring(0, 200) || ''}
                    </Text>
                    <View style={styles.featuredFooter}>
                      <View style={styles.authorInfo}>
                        {featuredPost.authorPhoto ? (
                          <Image
                            source={{ uri: featuredPost.authorPhoto }}
                            style={styles.authorPhoto}
                          />
                        ) : (
                          <View style={styles.authorPlaceholder}>
                            <Ionicons name="person-outline" size={16} color="#999" />
                          </View>
                        )}
                        <Text style={styles.authorName}>{featuredPost.author || 'CatPet'}</Text>
                      </View>
                      <Text style={styles.featuredDate}>4 dk okuma</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}

              {/* Regular Posts */}
              <View style={styles.postsGrid}>
                {regularPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}

      {activeTab === 'forum' && (
        <ScrollView style={styles.content}>
          <View style={styles.forumContainer}>
            <View style={styles.forumHeader}>
              <Text style={styles.forumTitle}>Forum Başlıkları</Text>
              {isLoggedIn && (
                <TouchableOpacity 
                  style={styles.newTopicButton}
                  onPress={() => setShowNewTopicModal(true)}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#fff" />
                  <Text style={styles.newTopicButtonText}>Yeni Konu Aç</Text>
                </TouchableOpacity>
              )}
            </View>

            {forumError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{forumError}</Text>
              </View>
            )}

            {forumLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF7A00" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
              </View>
            ) : forumTopics.length === 0 ? (
              <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>Henüz forum konusu yok.</Text>
                {isLoggedIn && (
                  <TouchableOpacity
                    style={styles.createTopicButton}
                    onPress={() => setShowNewTopicModal(true)}
                  >
                    <Text style={styles.createTopicButtonText}>İlk Konuyu Aç</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={styles.forumList}>
                {forumTopics.map((topic) => {
                  const displayName = isLoggedIn
                    ? `${topic.createdUser?.firstName || ''} ${topic.createdUser?.lastName || ''}`.trim() || 'Kullanıcı'
                    : maskName(`${topic.createdUser?.firstName || ''} ${topic.createdUser?.lastName || ''}`.trim())
                  
                  return (
                    <TouchableOpacity
                      key={topic.id}
                      style={styles.forumItem}
                      onPress={() => navigation.navigate('ForumDetail' as never, { id: topic.id } as never)}
                    >
                      <View style={styles.forumAvatar}>
                        {topic.createdUser?.profilePhoto ? (
                          <Image
                            source={{ uri: topic.createdUser.profilePhoto }}
                            style={styles.forumAvatarImage}
                          />
                        ) : (
                          <Text style={styles.forumAvatarText}>
                            {isLoggedIn ? (topic.createdUser?.firstName || 'K')[0].toUpperCase() : '?'}
                          </Text>
                        )}
                      </View>
                      <View style={styles.forumContent}>
                        <Text style={styles.forumItemTitle}>{topic.title}</Text>
                        <Text style={styles.forumItemMeta}>
                          Başlatan: <Text style={styles.forumItemMetaBold}>{displayName}</Text> · {formatRelativeTime(topic.createdAt)}
                        </Text>
                        {topic.blog && (
                          <Text style={styles.forumBlogLink}>
                            İlgili Blog: {topic.blog.title}
                          </Text>
                        )}
                        <View style={styles.forumItemStats}>
                          <View style={styles.forumStat}>
                            <Ionicons name="chatbubbles-outline" size={14} color="#666" />
                            <Text style={styles.forumStatText}>{topic.comments?.length || 0} Yorum</Text>
                          </View>
                          <View style={styles.forumStat}>
                            <Ionicons name="eye-outline" size={14} color="#666" />
                            <Text style={styles.forumStatText}>{topic.views || 0} Görüntülenme</Text>
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            )}
          </View>
        </ScrollView>
      )}

      {/* New Topic Modal */}
      <Modal
        visible={showNewTopicModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowNewTopicModal(false)
          setNewTopicTitle('')
          setNewTopicContent('')
          setForumError(null)
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Forum Konusu</Text>
            <TouchableOpacity
              onPress={() => {
                setShowNewTopicModal(false)
                setNewTopicTitle('')
                setNewTopicContent('')
                setForumError(null)
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {forumError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{forumError}</Text>
              </View>
            )}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Başlık *</Text>
              <TextInput
                style={styles.formInput}
                value={newTopicTitle}
                onChangeText={setNewTopicTitle}
                placeholder="Konu başlığını girin"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>İçerik *</Text>
              <TextInput
                style={[styles.formInput, styles.formTextArea]}
                value={newTopicContent}
                onChangeText={setNewTopicContent}
                placeholder="Konu içeriğini girin"
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              style={[styles.submitTopicButton, (!newTopicTitle.trim() || !newTopicContent.trim() || submittingTopic) && styles.submitTopicButtonDisabled]}
              onPress={handleCreateTopic}
              disabled={!newTopicTitle.trim() || !newTopicContent.trim() || submittingTopic}
            >
              {submittingTopic ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitTopicButtonText}>Konu Oluştur</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

function BlogCard({ post }: { post: BlogPost }) {
  const navigation = useNavigation()

  return (
    <TouchableOpacity
      style={styles.blogCard}
      onPress={() => navigation.navigate('BlogDetail' as never, { id: post.id } as never)}
    >
      {post.coverImage && (
        <Image source={{ uri: post.coverImage }} style={styles.blogCardImage} />
      )}
      <View style={styles.blogCardContent}>
        <Text style={styles.blogCardCategory}>{post.category || 'Genel'}</Text>
        <Text style={styles.blogCardTitle} numberOfLines={2}>
          {post.title}
        </Text>
        <Text style={styles.blogCardExcerpt} numberOfLines={3}>
          {post.excerpt || post.content?.substring(0, 150) || ''}
        </Text>
        <View style={styles.blogCardFooter}>
          <Text style={styles.blogCardAuthor}>{post.author || 'CatPet'}</Text>
          <Text style={styles.blogCardSeparator}>·</Text>
          <Text style={styles.blogCardReadTime}>4 dk okuma</Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF7A00',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  categoryContent: {
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
  },
  categoryButtonActive: {
    backgroundColor: '#FFF7F0',
  },
  categoryButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  featuredCard: {
    margin: 20,
    marginBottom: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  featuredImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#e5e5e5',
  },
  featuredContent: {
    padding: 20,
  },
  featuredBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 12,
  },
  featuredBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  featuredDate: {
    fontSize: 12,
    color: '#999',
  },
  postsGrid: {
    padding: 20,
    gap: 20,
  },
  blogCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  blogCardImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#e5e5e5',
  },
  blogCardContent: {
    padding: 16,
  },
  blogCardCategory: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FF7A00',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  blogCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  blogCardExcerpt: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  blogCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  blogCardAuthor: {
    fontSize: 12,
    color: '#666',
  },
  blogCardSeparator: {
    fontSize: 12,
    color: '#ccc',
  },
  blogCardReadTime: {
    fontSize: 12,
    color: '#999',
  },
  forumContainer: {
    padding: 20,
  },
  forumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  forumTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  newTopicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF7A00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  newTopicButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  forumList: {
    gap: 12,
  },
  forumItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 12,
  },
  forumAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
  },
  forumContent: {
    flex: 1,
  },
  forumItemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  forumItemMeta: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  forumItemMetaBold: {
    fontWeight: '600',
    color: '#1a1a1a',
  },
  forumItemStats: {
    flexDirection: 'row',
    gap: 16,
  },
  forumStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forumStatText: {
    fontSize: 12,
    color: '#666',
  },
  forumAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  forumAvatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forumBlogLink: {
    fontSize: 12,
    color: '#FF7A00',
    marginTop: 4,
    marginBottom: 8,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  createTopicButton: {
    marginTop: 16,
    backgroundColor: '#FF7A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  createTopicButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  formTextArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  submitTopicButton: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitTopicButtonDisabled: {
    opacity: 0.5,
  },
  submitTopicButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
