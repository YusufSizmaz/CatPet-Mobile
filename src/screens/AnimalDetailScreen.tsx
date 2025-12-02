import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator, Share, Linking, Alert } from 'react-native'
import { useRoute, useNavigation } from '@react-navigation/native'
import { useAnimal } from '../hooks/useAnimals'
import { useAuth } from '../contexts/AuthContext'
import { ANIMAL_TYPE_LABELS, GENDER_LABELS } from '../utils/constants'
import { Ionicons } from '@expo/vector-icons'
import { favoritesAPI, animalsAPIExtended } from '../services/api'

export default function AnimalDetailScreen() {
  const route = useRoute()
  const navigation = useNavigation()
  const { id } = route.params as { id: number }
  const { animal, loading, error } = useAnimal(id)
  const { user, backendUser } = useAuth()
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)
  const [loadingPhone, setLoadingPhone] = useState(false)

  // Load favorite status
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      if (!user || !animal?.id) return
      
      try {
        const token = await user.getIdToken()
        const result = await favoritesAPI.checkFavorite(animal.id, token)
        setIsFavorite(result.isFavorite)
      } catch (error: any) {
        // 401 hatası kullanıcı henüz backend'de kayıtlı olmayabilir veya token geçersiz
        // Bu durumda sessizce false set ediyoruz
        if (error?.message?.includes('401')) {
          console.debug('Favorite status: User not authenticated in backend yet')
        } else {
          console.error('Error loading favorite status:', error)
        }
        setIsFavorite(false)
      }
    }

    loadFavoriteStatus()
  }, [user, animal?.id])

  const hashName = (name: string | undefined | null): string => {
    if (!name || name.trim().length === 0) return '***'
    const trimmed = name.trim()
    return trimmed[0].toUpperCase() + '***'
  }

  const isLoggedIn = !!user

  const getOwnerDisplayName = (): string => {
    if (isLoggedIn) {
      const firstName = animal?.owner?.firstName || ''
      const lastName = animal?.owner?.lastName || ''
      const fullName = `${firstName} ${lastName}`.trim()
      return fullName || 'İlan Sahibi'
    } else {
      const firstName = animal?.owner?.firstName
      const lastName = animal?.owner?.lastName
      const hashedFirstName = hashName(firstName)
      const hashedLastName = hashName(lastName)
      return `${hashedFirstName} ${hashedLastName}`.trim() || '*** ***'
    }
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${animal?.name} - Sahiplenme İlanı\n${animal?.description}`,
        title: `${animal?.name} - Sahiplenme İlanı`,
      })
    } catch (error) {
      console.error('Share error:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız')
      return
    }

    setLoadingFavorite(true)
    try {
      const token = await user.getIdToken()
      await favoritesAPI.toggleFavorite(animal!.id, token, !isFavorite)
      setIsFavorite(!isFavorite)
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu')
    } finally {
      setLoadingFavorite(false)
    }
  }

  const handleCall = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Telefon numarasını görmek için giriş yapmalısınız')
      return
    }

    if (!backendUser?.verify) {
      Alert.alert(
        'Hesap Doğrulanmamış',
        'Telefon numarasını görmek için hesabınızı doğrulamanız gerekmektedir.'
      )
      return
    }

    if (!backendUser.phone) {
      Alert.alert(
        'Telefon Numarası Yok',
        'Telefon numaranızı profil sayfanızdan eklemeniz gerekmektedir.'
      )
      return
    }

    setLoadingPhone(true)
    try {
      const token = await user.getIdToken()
      const result = await animalsAPIExtended.getOwnerPhone(animal!.id, token)
      
      if (result.error) {
        Alert.alert('Hata', result.message || 'Telefon numarası alınamadı')
        return
      }

      if (result.phone) {
        Alert.alert(
          'Telefon Numarası',
          `${result.ownerName || 'İlan Sahibi'}: ${result.phone}`,
          [
            { text: 'İptal', style: 'cancel' },
            {
              text: 'Ara',
              onPress: () => Linking.openURL(`tel:${result.phone}`),
            },
          ]
        )
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Telefon numarası alınırken bir hata oluştu')
    } finally {
      setLoadingPhone(false)
    }
  }

  const handleMessage = async () => {
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Mesaj göndermek için giriş yapmalısınız')
      return
    }

    if (!backendUser?.verify) {
      Alert.alert(
        'Hesap Doğrulanmamış',
        'Mesaj göndermek için hesabınızı doğrulamanız gerekmektedir.'
      )
      return
    }

    if (!backendUser.phone) {
      Alert.alert(
        'Telefon Numarası Yok',
        'Telefon numaranızı profil sayfanızdan eklemeniz gerekmektedir.'
      )
      return
    }

    setLoadingPhone(true)
    try {
      const token = await user.getIdToken()
      const result = await animalsAPIExtended.getOwnerPhone(animal!.id, token)
      
      if (result.error) {
        Alert.alert('Hata', result.message || 'Telefon numarası alınamadı')
        return
      }

      if (result.phone) {
        Linking.openURL(`sms:${result.phone}`)
      }
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Telefon numarası alınırken bir hata oluştu')
    } finally {
      setLoadingPhone(false)
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
        <Text style={styles.errorText}>{error || 'Hayvan bulunamadı'}</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
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
                style={[
                  styles.thumbnail,
                  selectedImageIndex === i && styles.thumbnailActive,
                ]}
                onPress={() => setSelectedImageIndex(i)}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImage} resizeMode="cover" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{animal.name}</Text>
            <View style={styles.location}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <Text style={styles.locationText}>
                {animal.city}{animal.district ? ` / ${animal.district}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
              <Ionicons name="share-outline" size={20} color="#FF7A00" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleToggleFavorite}
              disabled={loadingFavorite}
            >
              {loadingFavorite ? (
                <ActivityIndicator size="small" color="#FF7A00" />
              ) : (
                <Ionicons
                  name={isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={isFavorite ? '#FF7A00' : '#666'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{animal.name} Hakkında</Text>
          <Text style={styles.description}>{animal.description}</Text>
        </View>

        {/* Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Detaylı Bilgiler</Text>
          <View style={styles.detailsGrid}>
            {[
              { icon: 'cake-outline', label: 'Yaş', value: `${animal.age} Yaşında` },
              { icon: 'paw-outline', label: 'Cins', value: animal.breed || '-' },
              {
                icon: animal.gender === 'female' ? 'female-outline' : 'male-outline',
                label: 'Cinsiyet',
                value: GENDER_LABELS[animal.gender] || animal.gender,
              },
              {
                icon: 'medical-outline',
                label: 'Kısırlaştırma',
                value: animal.isSpayed ? 'Kısırlaştırılmış' : 'Kısırlaştırılmamış',
              },
              {
                icon: 'shield-checkmark-outline',
                label: 'Aşı Durumu',
                value: animal.isVaccinated ? 'Tüm aşıları tam' : 'Aşıları eksik',
              },
              {
                icon: 'heart-outline',
                label: 'Sağlık Durumu',
                value: animal.healthStatus || '-',
              },
            ].map((info) => (
              <View key={info.label} style={styles.detailItem}>
                <Ionicons name={info.icon as any} size={20} color="#FF7A00" />
                <View style={styles.detailText}>
                  <Text style={styles.detailLabel}>{info.label}</Text>
                  <Text style={styles.detailValue}>{info.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Characteristics */}
        {animal.characteristics && (
          <View style={styles.detailsCard}>
            <Text style={styles.detailsTitle}>
              Karakter Özellikleri ({ANIMAL_TYPE_LABELS[animal.type] || animal.type})
            </Text>
            <View style={styles.characteristicsGrid}>
              {[
                { key: 'getsAlongWithHumans', text: 'İnsanlarla İyi Anlaşır', positive: true },
                { key: 'getsAlongWithChildren', text: 'Çocuklarla Anlaşır', positive: true },
                { key: 'getsAlongWithCats', text: 'Diğer Kedilerle Anlaşır', positive: true },
                { key: 'getsAlongWithDogs', text: 'Köpeklerle Anlaşır', positive: true },
                { key: 'isHouseTrained', text: 'Tuvalet Eğitimi Var', positive: true },
                { key: 'isPlayful', text: 'Oyuncu', positive: true },
              ].map((trait) => {
                const value = animal.characteristics?.[trait.key as keyof typeof animal.characteristics]
                const displayValue = trait.positive ? value : !value
                return (
                  <View key={trait.key} style={styles.characteristicItem}>
                    <Ionicons
                      name={displayValue ? 'checkmark-circle' : 'close-circle'}
                      size={20}
                      color={displayValue ? '#10b981' : '#ef4444'}
                    />
                    <Text style={styles.characteristicText}>{trait.text}</Text>
                  </View>
                )
              })}
            </View>
          </View>
        )}

        {/* Owner Info */}
        <View style={styles.ownerCard}>
          <View style={styles.ownerHeader}>
            <Image
              source={{
                uri: animal.owner?.profilePhoto || 'https://via.placeholder.com/100',
              }}
              style={[
                styles.ownerPhoto,
                !isLoggedIn && styles.ownerPhotoBlurred,
              ]}
            />
            <View style={styles.ownerInfo}>
              <Text style={styles.ownerName}>{getOwnerDisplayName()}</Text>
              <Text style={styles.ownerLabel}>İlan Sahibi</Text>
            </View>
          </View>
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, loadingPhone && styles.contactButtonDisabled]} 
              onPress={handleCall}
              disabled={loadingPhone}
            >
              {loadingPhone ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="call-outline" size={20} color="#fff" />
                  <Text style={styles.contactButtonText}>Telefonu Göster</Text>
                </>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.contactButton, styles.contactButtonOutline, loadingPhone && styles.contactButtonDisabled]}
              onPress={handleMessage}
              disabled={loadingPhone}
            >
              {loadingPhone ? (
                <ActivityIndicator color="#FF7A00" />
              ) : (
                <>
                  <Ionicons name="mail-outline" size={20} color="#FF7A00" />
                  <Text style={[styles.contactButtonText, styles.contactButtonTextOutline]}>
                    Mesaj Gönder
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.note}>
            <Text style={styles.noteText}>
              <Text style={styles.noteBold}>Sahiplenme Notu:</Text> Sahiplendirme, takip koşulu ve
              sahiplendirme sözleşmesi ile yapılacaktır.
            </Text>
          </View>
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
  imageSection: {
    marginBottom: 20,
  },
  mainImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  thumbnailContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  thumbnailActive: {
    borderColor: '#FF7A00',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
  },
  detailsCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  characteristicsGrid: {
    gap: 12,
  },
  characteristicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  characteristicText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1a1a1a',
  },
  ownerCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  ownerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  ownerPhoto: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e5e5e5',
  },
  ownerPhotoBlurred: {
    opacity: 0.5,
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  ownerLabel: {
    fontSize: 12,
    color: '#666',
  },
  contactButtons: {
    gap: 12,
    marginBottom: 16,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contactButtonTextOutline: {
    color: '#FF7A00',
  },
  contactButtonDisabled: {
    opacity: 0.6,
  },
  note: {
    backgroundColor: '#FFF7F0',
    padding: 12,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 12,
    color: '#FF7A00',
    textAlign: 'center',
    lineHeight: 18,
  },
  noteBold: {
    fontWeight: 'bold',
  },
})
