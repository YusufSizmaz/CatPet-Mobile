import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share, Linking, Alert, Modal } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAnimal } from '../hooks/useAnimals'
import { useAuth } from '../contexts/AuthContext'
import { animalsAPI } from '../services/api'
import { ANIMAL_TYPE_LABELS, GENDER_LABELS } from '../utils/constants'
import { Ionicons } from '@expo/vector-icons'

export default function LostAnimalDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { id } = route.params as { id: number }
  const { animal, loading, error } = useAnimal(id)
  const { user, backendUser } = useAuth()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showPhoneModal, setShowPhoneModal] = useState(false)
  const [phoneModalContent, setPhoneModalContent] = useState<{
    type: 'login_required' | 'not_verified' | 'no_phone' | 'show_phone'
    phone?: string
    ownerName?: string
  } | null>(null)
  const [loadingPhone, setLoadingPhone] = useState(false)

  const hashName = (name: string | undefined | null): string => {
    if (!name || name.trim().length === 0) return '***'
    const trimmed = name.trim()
    return trimmed[0].toUpperCase() + '***'
  }

  const isLoggedIn = !!user

  const handleShowPhone = async () => {
    if (!isLoggedIn) {
      setPhoneModalContent({ type: 'login_required' })
      setShowPhoneModal(true)
      return
    }

    if (!backendUser?.verify) {
      setPhoneModalContent({ type: 'not_verified' })
      setShowPhoneModal(true)
      return
    }

    setLoadingPhone(true)
    try {
      const token = await user.getIdToken()
      const response = await animalsAPI.getOwnerPhone(id, token)
      
      if (response.phone) {
        setPhoneModalContent({
          type: 'show_phone',
          phone: response.phone,
          ownerName: response.ownerName || 'İlan Sahibi',
        })
        setShowPhoneModal(true)
      } else {
        setPhoneModalContent({ type: 'no_phone' })
        setShowPhoneModal(true)
      }
    } catch (err: any) {
      Alert.alert('Hata', err.message || 'Telefon numarası alınırken bir hata oluştu')
      setPhoneModalContent({ type: 'no_phone' })
      setShowPhoneModal(true)
    } finally {
      setLoadingPhone(false)
    }
  }

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`)
    setShowPhoneModal(false)
  }

  const handleMessage = (phone: string) => {
    Linking.openURL(`sms:${phone}`)
    setShowPhoneModal(false)
  }

  const handleShare = async () => {
    if (!animal) return
    try {
      await Share.share({
        message: `${animal.name} - Kayıp İlanı\n${animal.description}`,
        title: `${animal.name} - Kayıp İlanı`,
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

  if (error || !animal) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Kayıp ilan bulunamadı'}</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>Geri Dön</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const mainImage = animal.images && animal.images[selectedImageIndex]
    ? animal.images[selectedImageIndex]
    : animal.images && animal.images[0]
    ? animal.images[0]
    : 'https://via.placeholder.com/800x450'

  const ownerDisplayName = isLoggedIn
    ? `${animal.owner?.firstName || ''} ${animal.owner?.lastName || ''}`.trim() || 'İlan Sahibi'
    : `${hashName(animal.owner?.firstName)} ${hashName(animal.owner?.lastName)}`.trim() || '*** ***'

  return (
    <ScrollView style={styles.container}>
      {/* Images */}
      <View style={styles.imageSection}>
        <Image source={{ uri: mainImage }} style={styles.mainImage} resizeMode="cover" />
        {animal.images && animal.images.length > 1 && (
          <ScrollView horizontal style={styles.thumbnailContainer} showsHorizontalScrollIndicator={false}>
            {animal.images.slice(0, 4).map((img, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.thumbnail, selectedImageIndex === i && styles.thumbnailSelected]}
                onPress={() => setSelectedImageIndex(i)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={20} color="#FF7A00" />
          <Text style={styles.actionButtonText}>Paylaş</Text>
        </TouchableOpacity>
      </View>

      {/* Basic Info */}
      <View style={styles.section}>
        <Text style={styles.animalName}>{animal.name}</Text>
        <View style={styles.badges}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{ANIMAL_TYPE_LABELS[animal.type] || animal.type}</Text>
          </View>
          {animal.gender && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{GENDER_LABELS[animal.gender] || animal.gender}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Description */}
      {animal.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Açıklama</Text>
          <Text style={styles.description}>{animal.description}</Text>
        </View>
      )}

      {/* Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Detaylar</Text>
        <View style={styles.detailsGrid}>
          {animal.breed && (
            <View style={styles.detailItem}>
              <Ionicons name="paw-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Cins:</Text>
              <Text style={styles.detailValue}>{animal.breed}</Text>
            </View>
          )}
          {animal.age && (
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Yaş:</Text>
              <Text style={styles.detailValue}>{animal.age}</Text>
            </View>
          )}
          {animal.city && (
            <View style={styles.detailItem}>
              <Ionicons name="location-outline" size={20} color="#666" />
              <Text style={styles.detailLabel}>Şehir:</Text>
              <Text style={styles.detailValue}>{animal.city}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Owner Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İlan Sahibi</Text>
        <View style={styles.ownerInfo}>
          <View style={styles.ownerDetails}>
            <Text style={styles.ownerName}>{ownerDisplayName}</Text>
            {animal.owner?.city && (
              <Text style={styles.ownerCity}>{animal.owner.city}</Text>
            )}
          </View>
        </View>
      </View>

      {/* Contact Actions */}
      <View style={styles.contactSection}>
        <TouchableOpacity
          style={[styles.contactButton, styles.phoneButton]}
          onPress={handleShowPhone}
          disabled={loadingPhone}
        >
          {loadingPhone ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="call-outline" size={20} color="#fff" />
              <Text style={styles.contactButtonText}>Telefonu Göster</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Phone Modal */}
      <Modal
        visible={showPhoneModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPhoneModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {phoneModalContent?.type === 'login_required' && (
              <>
                <Text style={styles.modalTitle}>Giriş Gerekli</Text>
                <Text style={styles.modalText}>
                  Telefon numarasını görmek için lütfen giriş yapın.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowPhoneModal(false)
                    navigation.navigate('Login' as never)
                  }}
                >
                  <Text style={styles.modalButtonText}>Giriş Yap</Text>
                </TouchableOpacity>
              </>
            )}

            {phoneModalContent?.type === 'not_verified' && (
              <>
                <Text style={styles.modalTitle}>Doğrulama Gerekli</Text>
                <Text style={styles.modalText}>
                  Telefon numarasını görmek için hesabınızı doğrulamanız gerekmektedir.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowPhoneModal(false)}
                >
                  <Text style={styles.modalButtonText}>Tamam</Text>
                </TouchableOpacity>
              </>
            )}

            {phoneModalContent?.type === 'no_phone' && (
              <>
                <Text style={styles.modalTitle}>Telefon Numarası Yok</Text>
                <Text style={styles.modalText}>
                  Bu ilan sahibinin telefon numarası kayıtlı değil.
                </Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setShowPhoneModal(false)}
                >
                  <Text style={styles.modalButtonText}>Tamam</Text>
                </TouchableOpacity>
              </>
            )}

            {phoneModalContent?.type === 'show_phone' && phoneModalContent.phone && (
              <>
                <Text style={styles.modalTitle}>İletişim Bilgisi</Text>
                <Text style={styles.phoneNumber}>{phoneModalContent.phone}</Text>
                <Text style={styles.ownerNameText}>{phoneModalContent.ownerName}</Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.callButton]}
                    onPress={() => handleCall(phoneModalContent.phone!)}
                  >
                    <Ionicons name="call" size={20} color="#fff" />
                    <Text style={styles.modalActionButtonText}>Ara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.messageButton]}
                    onPress={() => handleMessage(phoneModalContent.phone!)}
                  >
                    <Ionicons name="chatbubble-outline" size={20} color="#fff" />
                    <Text style={styles.modalActionButtonText}>Mesaj</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowPhoneModal(false)}
                >
                  <Text style={styles.modalCloseButtonText}>Kapat</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  imageSection: {
    position: 'relative',
  },
  mainImage: {
    width: '100%',
    height: 300,
  },
  thumbnailContainer: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailSelected: {
    borderColor: '#FF7A00',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FFF7F0',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  animalName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  detailsGrid: {
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 60,
  },
  detailValue: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerDetails: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  ownerCity: {
    fontSize: 14,
    color: '#666',
  },
  contactSection: {
    padding: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  phoneButton: {
    backgroundColor: '#FF7A00',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  phoneNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF7A00',
    textAlign: 'center',
    marginBottom: 8,
  },
  ownerNameText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  modalActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  messageButton: {
    backgroundColor: '#3b82f6',
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: '#666',
    fontSize: 14,
  },
})

