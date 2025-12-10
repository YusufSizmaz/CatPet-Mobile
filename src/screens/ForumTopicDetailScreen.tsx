import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { forumAPI } from '../services/api'
import { Ionicons } from '@expo/vector-icons'
import { formatDate } from '../utils/formatters'

export default function ForumTopicDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { user, backendUser } = useAuth()
  const { id } = route.params as { id: number }
  
  const [topic, setTopic] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')

  useEffect(() => {
    loadTopic()
  }, [id])

  const loadTopic = async () => {
    setLoading(true)
    setError(null)
    try {
      const topicData = await forumAPI.getTopicById(id)
      setTopic(topicData)
      setComments(topicData.comments || [])
    } catch (err: any) {
      setError(err.message || 'Forum konusu yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) {
      Alert.alert('Hata', 'Lütfen yorumunuzu girin')
      return
    }

    setSubmittingComment(true)
    try {
      const token = await user.getIdToken()
      const createdComment = await forumAPI.createComment({
        forumId: id,
        content: newComment.trim(),
      }, token)
      
      setComments(prev => [...prev, createdComment])
      setNewComment('')
      Alert.alert('Başarılı', 'Yorumunuz başarıyla eklendi')
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum oluşturulurken bir hata oluştu')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent('')
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!editingCommentContent.trim()) {
      Alert.alert('Hata', 'Yorum boş olamaz')
      return
    }

    try {
      // Update comment logic here if API supports it
      Alert.alert('Bilgi', 'Yorum düzenleme özelliği yakında eklenecek')
      handleCancelEdit()
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum güncellenirken bir hata oluştu')
    }
  }

  const maskName = (name: string | undefined | null): string => {
    if (!name || name.trim().length === 0) return '***'
    const trimmed = name.trim()
    return trimmed[0].toUpperCase() + '***'
  }

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  if (error || !topic) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Forum konusu bulunamadı'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const isLoggedIn = !!user
  const currentUserId = backendUser?.id

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Topic Header */}
        <View style={styles.topicHeader}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <View style={styles.topicMeta}>
            <View style={styles.authorInfo}>
              {topic.authorPhoto && (
                <Image source={{ uri: topic.authorPhoto }} style={styles.authorPhoto} />
              )}
              <View>
                <Text style={styles.authorName}>{maskName(topic.authorName)}</Text>
                <Text style={styles.topicDate}>{formatDate(topic.createdAt)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Topic Content */}
        <View style={styles.topicContent}>
          <Text style={styles.contentText}>{topic.content}</Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Yorumlar ({comments.length})</Text>
          
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAuthorInfo}>
                  {comment.userPhoto && (
                    <Image source={{ uri: comment.userPhoto }} style={styles.commentAuthorPhoto} />
                  )}
                  <View>
                    <Text style={styles.commentAuthorName}>{maskName(comment.userName)}</Text>
                    <Text style={styles.commentDate}>{formatDate(comment.createdAt)}</Text>
                  </View>
                </View>
                {currentUserId === comment.userId && (
                  <View style={styles.commentActions}>
                    {editingCommentId === comment.id ? (
                      <>
                        <TouchableOpacity onPress={() => handleSaveEdit(comment.id)}>
                          <Ionicons name="checkmark" size={20} color="#10b981" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleCancelEdit}>
                          <Ionicons name="close" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity onPress={() => handleStartEdit(comment)}>
                        <Ionicons name="create-outline" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
              
              {editingCommentId === comment.id ? (
                <TextInput
                  style={styles.commentEditInput}
                  value={editingCommentContent}
                  onChangeText={setEditingCommentContent}
                  multiline
                />
              ) : (
                <Text style={styles.commentContent}>{comment.content}</Text>
              )}
            </View>
          ))}

          {comments.length === 0 && (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>Henüz yorum yok. İlk yorumu siz yapın!</Text>
            </View>
          )}
        </View>

        {/* Add Comment Section */}
        {isLoggedIn ? (
          <View style={styles.addCommentSection}>
            <Text style={styles.addCommentTitle}>Yorum Yap</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Yorumunuzu yazın..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity
              style={[styles.submitButton, submittingComment && styles.submitButtonDisabled]}
              onPress={handleSubmitComment}
              disabled={submittingComment || !newComment.trim()}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Yorum Gönder</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.loginPrompt}>
            <Text style={styles.loginPromptText}>Yorum yapmak için lütfen giriş yapın</Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
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
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  topicHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  topicMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  authorPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  topicDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  topicContent: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  contentText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentsSection: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  commentCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAuthorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  commentAuthorPhoto: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  commentDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  commentEditInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 80,
  },
  emptyComments: {
    padding: 40,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  addCommentSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  addCommentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  commentInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginPrompt: {
    padding: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  loginPromptText: {
    fontSize: 14,
    color: '#666',
  },
})

