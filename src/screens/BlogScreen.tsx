import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useBlog } from '../hooks/useBlog'
import { BlogPost } from '../types/blog.types'
import { Ionicons } from '@expo/vector-icons'

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

export default function BlogScreen() {
  const [activeTab, setActiveTab] = useState<'blog' | 'forum'>('blog')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const navigation = useNavigation()
  const { posts, loading, error } = useBlog(selectedCategory === 'all' ? undefined : { category: selectedCategory })

  const featuredPost = posts.length > 0 ? posts[0] : null
  const regularPosts = posts.slice(1)

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
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
              <TouchableOpacity style={styles.newTopicButton}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.newTopicButtonText}>Yeni Konu Aç</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.forumList}>
              {[1, 2, 3].map((i) => (
                <TouchableOpacity key={i} style={styles.forumItem}>
                  <View style={styles.forumAvatar} />
                  <View style={styles.forumContent}>
                    <Text style={styles.forumItemTitle}>Örnek Forum Konusu {i}</Text>
                    <Text style={styles.forumItemMeta}>
                      Başlatan: <Text style={styles.forumItemMetaBold}>Kullanıcı Adı</Text> · {i} saat önce
                    </Text>
                    <View style={styles.forumItemStats}>
                      <View style={styles.forumStat}>
                        <Ionicons name="chatbubbles-outline" size={14} color="#666" />
                        <Text style={styles.forumStatText}>{i * 5} Yorum</Text>
                      </View>
                      <View style={styles.forumStat}>
                        <Ionicons name="eye-outline" size={14} color="#666" />
                        <Text style={styles.forumStatText}>{i * 50} Görüntülenme</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
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
})
