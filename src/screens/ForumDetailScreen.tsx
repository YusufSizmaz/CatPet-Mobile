import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAuth } from '../contexts/AuthContext'
import { forumAPI } from '../services/api'
import { getProfilePhotoUrl, hasProfilePhoto } from '../utils/profilePhoto'

export default function ForumDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const { user, backendUser } = useAuth()
  const forumId = (route.params as any)?.id

  const [topic, setTopic] = useState<any>(null)
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null)
  const [editingCommentContent, setEditingCommentContent] = useState('')
  const [originalCommentContent, setOriginalCommentContent] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [commentToDeleteId, setCommentToDeleteId] = useState<number | null>(null)
  const hasLoadedRef = useRef<number | null>(null)

  useEffect(() => {
    if (hasLoadedRef.current === forumId) return
    hasLoadedRef.current = forumId

    const loadTopic = async () => {
      setLoading(true)
      setError(null)
      try {
        const topicData = await forumAPI.getTopicById(Number(forumId))
        setTopic(topicData)
        setComments(topicData.comments || [])
      } catch (err: any) {
        console.error('Forum konusu yükleme hatası:', err)
        setError(err.message || 'Forum konusu yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (forumId) {
      loadTopic()
    }
  }, [forumId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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
    return formatDate(dateString)
  }

  const maskName = (name: string | undefined | null): string => {
    if (!name || name.trim().length === 0) return '***'
    const trimmed = name.trim()
    return trimmed[0].toUpperCase() + '***'
  }

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) {
      Alert.alert('Hata', 'Lütfen yorumunuzu girin')
      return
    }

    setSubmittingComment(true)
    try {
      const token = await user.getIdToken()
      const createdComment = await forumAPI.createComment(
        {
          forumId: Number(forumId),
          content: newComment.trim(),
        },
        token
      )
      setComments((prev) => [...prev, createdComment])
      setNewComment('')
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum oluşturulurken bir hata oluştu')
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleStartEdit = (comment: any) => {
    setEditingCommentId(comment.id)
    setEditingCommentContent(comment.content)
    setOriginalCommentContent(comment.content)
  }

  const hasCommentChanges = () => {
    return editingCommentContent.trim() !== originalCommentContent.trim()
  }

  const handleCancelEdit = () => {
    setEditingCommentId(null)
    setEditingCommentContent('')
    setOriginalCommentContent('')
  }

  const handleSaveEdit = async (commentId: number) => {
    if (!user || !editingCommentContent.trim()) {
      Alert.alert('Hata', 'Lütfen yorum içeriğini girin')
      return
    }

    if (!hasCommentChanges()) {
      Alert.alert('Bilgi', 'Yorum içeriğinde değişiklik yapılmadı')
      return
    }

    try {
      const token = await user.getIdToken()
      const updatedComment = await forumAPI.updateComment(commentId, { content: editingCommentContent.trim() }, token)
      setComments((prev) => prev.map((c) => (c.id === commentId ? updatedComment : c)))
      setEditingCommentId(null)
      setEditingCommentContent('')
      setOriginalCommentContent('')
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum güncellenirken bir hata oluştu')
    }
  }

  const handleDeleteComment = (commentId: number) => {
    setCommentToDeleteId(commentId)
    setShowDeleteConfirm(true)
  }

  const confirmDeleteComment = async () => {
    if (!user || !commentToDeleteId) {
      return
    }

    try {
      const token = await user.getIdToken()
      await forumAPI.deleteComment(commentToDeleteId, token)
      setComments((prev) => prev.filter((c) => c.id !== commentToDeleteId))
      setShowDeleteConfirm(false)
      setCommentToDeleteId(null)
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Yorum silinirken bir hata oluştu')
      setShowDeleteConfirm(false)
      setCommentToDeleteId(null)
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
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Math.max(insets.top, 0) }}
      >
        {/* Topic Header */}
        <View style={styles.topicContainer}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <View style={styles.topicMeta}>
            <View style={styles.authorInfo}>
              {hasProfilePhoto(topic.createdUser) ? (
                <Image
                  source={{ uri: getProfilePhotoUrl(topic.createdUser) }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {isLoggedIn
                      ? (topic.createdUser?.firstName || 'K')[0].toUpperCase()
                      : '?'}
                  </Text>
                </View>
              )}
              <Text style={styles.authorName}>
                {isLoggedIn
                  ? `${topic.createdUser?.firstName || ''} ${topic.createdUser?.lastName || ''}`.trim() || 'Kullanıcı'
                  : maskName(`${topic.createdUser?.firstName || ''} ${topic.createdUser?.lastName || ''}`.trim())}
              </Text>
            </View>
            <Text style={styles.metaText}>·</Text>
            <Text style={styles.metaText}>{formatDate(topic.createdAt)}</Text>
            <Text style={styles.metaText}>·</Text>
            <Text style={styles.metaText}>{topic.views || 0} Görüntülenme</Text>
          </View>
          <Text style={styles.topicContent}>{topic.content}</Text>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Yorumlar ({comments.length})</Text>

          {/* Comment Form */}
          {isLoggedIn ? (
            <View style={styles.commentForm}>
              <TextInput
                style={styles.commentInput}
                value={newComment}
                onChangeText={setNewComment}
                placeholder="Düşüncelerinizi paylaşın..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <TouchableOpacity
                style={[styles.submitButton, (!newComment.trim() || submittingComment) && styles.submitButtonDisabled]}
                onPress={handleSubmitComment}
                disabled={!newComment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Yorum Yap</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Yorum yapmak için giriş yapmanız gerekiyor</Text>
              <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('Login' as never)}>
                <Text style={styles.loginButtonText}>Giriş Yap</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Comments List */}
          {comments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Henüz yorum yok</Text>
              <Text style={styles.emptyStateSubtext}>İlk yorumu siz yaparak tartışmayı başlatın!</Text>
            </View>
          ) : (
            <View style={styles.commentsList}>
              {comments.map((comment) => {
                const isOwnComment = currentUserId && comment.createdUserId === currentUserId
                const displayName = isLoggedIn
                  ? `${comment.createdUser?.firstName || ''} ${comment.createdUser?.lastName || ''}`.trim() || 'Kullanıcı'
                  : maskName(`${comment.createdUser?.firstName || ''} ${comment.createdUser?.lastName || ''}`.trim())

                return (
                  <View key={comment.id} style={styles.commentItem}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentAuthor}>
                        {hasProfilePhoto(comment.createdUser) ? (
                          <Image
                            source={{ uri: getProfilePhotoUrl(comment.createdUser) }}
                            style={styles.commentAvatarImage}
                          />
                        ) : (
                          <View style={styles.commentAvatar}>
                            <Text style={styles.commentAvatarText}>
                              {isLoggedIn ? (comment.createdUser?.firstName || 'K')[0].toUpperCase() : '?'}
                            </Text>
                          </View>
                        )}
                        <View>
                          <Text style={styles.commentAuthorName}>
                            {displayName}
                            {isOwnComment && <Text style={styles.ownBadge}> (Sen)</Text>}
                          </Text>
                          <Text style={styles.commentDate}>{formatRelativeTime(comment.createdAt)}</Text>
                        </View>
                      </View>
                      {isOwnComment && (
                        <View style={styles.commentActions}>
                          {editingCommentId === comment.id ? (
                            <>
                              <TouchableOpacity
                                style={[
                                  styles.actionButton,
                                  !hasCommentChanges() && styles.actionButtonDisabled
                                ]}
                                onPress={() => handleSaveEdit(comment.id)}
                                disabled={!hasCommentChanges()}
                              >
                                <Text style={[
                                  styles.actionButtonText,
                                  !hasCommentChanges() && styles.actionButtonTextDisabled
                                ]}>
                                  Kaydet
                                </Text>
                              </TouchableOpacity>
                              <TouchableOpacity style={styles.actionButton} onPress={handleCancelEdit}>
                                <Text style={styles.actionButtonText}>İptal</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <>
                              <TouchableOpacity
                                style={styles.actionButton}
                                onPress={() => handleStartEdit(comment)}
                              >
                                <Text style={styles.actionButtonText}>Düzenle</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => handleDeleteComment(comment.id)}
                              >
                                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Sil</Text>
                              </TouchableOpacity>
                            </>
                          )}
                        </View>
                      )}
                    </View>
                    {editingCommentId === comment.id ? (
                      <TextInput
                        style={styles.editInput}
                        value={editingCommentContent}
                        onChangeText={setEditingCommentContent}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />
                    ) : (
                      <Text style={styles.commentContent}>{comment.content}</Text>
                    )}
                  </View>
                )
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Yorumu Sil</Text>
            <Text style={styles.modalText}>Bu yorumu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowDeleteConfirm(false)
                  setCommentToDeleteId(null)
                }}
              >
                <Text style={styles.modalButtonCancelText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonDelete]}
                onPress={confirmDeleteComment}
              >
                <Text style={styles.modalButtonDeleteText}>Sil</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF7A00',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  topicContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  topicTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  topicMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
  },
  avatarText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    marginHorizontal: 4,
  },
  topicContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  commentsContainer: {
    padding: 20,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  commentForm: {
    marginBottom: 24,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loginPrompt: {
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginPromptText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  commentsList: {
    gap: 16,
  },
  commentItem: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e5e5e5',
  },
  commentAvatarText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  commentAuthorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  ownBadge: {
    fontSize: 12,
    color: '#FF7A00',
    fontWeight: '500',
  },
  commentDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  commentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#e5e7eb',
  },
  actionButtonTextDisabled: {
    color: '#999',
    borderRadius: 6,
    backgroundColor: '#e5e5e5',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  editInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  commentContent: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#e5e5e5',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonDelete: {
    backgroundColor: '#ef4444',
  },
  modalButtonDeleteText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

