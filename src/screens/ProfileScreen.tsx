import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { usersAPI, userSettingsAPI, animalsAPIExtended, animalsAPI } from '../services/api'
import { Ionicons } from '@expo/vector-icons'
import SuccessDialog from '../components/SuccessDialog'
import { getProfilePhotoUrl } from '../utils/profilePhoto'
import AnimalCard from '../components/AnimalCard'
import { Animal } from '../types/animal.types'

const { width: SCREEN_WIDTH } = Dimensions.get('window')

// Responsive helper functions
const getResponsiveSize = (size: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.round(size * scale)
}

const getResponsivePadding = (padding: number) => {
  const scale = SCREEN_WIDTH / 375
  return Math.max(8, Math.round(padding * scale))
}

export default function ProfileScreen() {
  const { user, backendUser, logout, refreshBackendUser } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()
  const [activeTab, setActiveTab] = useState<'profile' | 'lost' | 'contributions' | 'applications' | 'blog' | 'settings'>('profile')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    city: '',
    phone: '',
    nickname: '',
  })
  const [userSettings, setUserSettings] = useState<{
    showGooglePhoto: boolean
    useNickname: boolean
  } | null>(null)
  const [successDialog, setSuccessDialog] = useState<{
    visible: boolean
    title: string
    message: string
    type: 'success' | 'error' | 'info'
  }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  })
  const [initialFormData, setInitialFormData] = useState({
    firstName: '',
    lastName: '',
    description: '',
    city: '',
    phone: '',
    nickname: '',
  })
  const [myLostAnimals, setMyLostAnimals] = useState<Animal[]>([])
  const [loadingLostAnimals, setLoadingLostAnimals] = useState(false)

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const headerScale = useRef(new Animated.Value(0.95)).current
  const pulseAnim = useRef(new Animated.Value(1)).current
  const tabSlideAnim = useRef(new Animated.Value(0)).current
  const inputAnimations = useRef(
    ['firstName', 'lastName', 'email', 'nickname', 'description', 'city', 'phone'].map(() => ({
      scale: new Animated.Value(1),
      opacity: new Animated.Value(0),
    }))
  ).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.spring(headerScale, {
        toValue: 1,
        tension: 40,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(tabSlideAnim, {
        toValue: 1,
        duration: 400,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start()

    // Pulse animation for profile photo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start()

    // Staggered input animations
    inputAnimations.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, {
          toValue: 1,
          duration: 400,
          delay: 300 + index * 50,
          useNativeDriver: true,
        }),
        Animated.spring(anim.scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          delay: 300 + index * 50,
          useNativeDriver: true,
        }),
      ]).start()
    })
  }, [])

  useEffect(() => {
    if (backendUser) {
      const newFormData = {
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        description: backendUser.description || '',
        city: backendUser.city || '',
        phone: backendUser.phone || '',
        nickname: backendUser.nickname || '',
      }
      setFormData(newFormData)
      setInitialFormData(newFormData)
      loadUserSettings()
    } else if (user) {
      const displayName = user.displayName || ''
      const nameParts = displayName.split(' ')
      const newFormData = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        description: '',
        city: '',
        phone: '',
        nickname: '',
      }
      setFormData(newFormData)
      setInitialFormData(newFormData)
      setUserSettings({
        showGooglePhoto: true,
        useNickname: false,
      })
    }
  }, [backendUser, user])

  const loadUserSettings = async () => {
    if (!backendUser) {
      setUserSettings({
        showGooglePhoto: true,
        useNickname: false,
      })
      return
    }
    try {
      const settings = await userSettingsAPI.getByUserId(backendUser.id)
      setUserSettings({
        showGooglePhoto: settings.showGooglePhoto ?? true,
        useNickname: settings.useNickname ?? false,
      })
    } catch (error) {
      console.debug('User settings load error:', error)
      setUserSettings({
        showGooglePhoto: true,
        useNickname: false,
      })
    }
  }

  const loadMyLostAnimals = async () => {
    if (!user || !backendUser) {
      setMyLostAnimals([])
      return
    }
    try {
      setLoadingLostAnimals(true)
      const idToken = await user.getIdToken()
      const animals = await animalsAPIExtended.findByOwnerId(backendUser.id, idToken)
      setMyLostAnimals(animals || [])
    } catch (error) {
      console.error('Error loading my lost animals:', error)
      setMyLostAnimals([])
    } finally {
      setLoadingLostAnimals(false)
    }
  }

  const handleMarkAsFound = async (animalId: number) => {
    if (!user) return
    try {
      const idToken = await user.getIdToken()
      await animalsAPIExtended.updateStatus(animalId, false, idToken)
      setSuccessDialog({
        visible: true,
        title: 'Başarılı',
        message: 'Hayvanınız bulundu olarak işaretlendi. İlan pasif hale getirildi.',
        type: 'success',
      })
      loadMyLostAnimals()
    } catch (error: any) {
      setSuccessDialog({
        visible: true,
        title: 'Hata',
        message: error.message || 'İşlem sırasında bir hata oluştu.',
        type: 'error',
      })
    }
  }

  const handleDeleteAnimal = async (animalId: number) => {
    if (!user) return
    Alert.alert(
      'İlanı Sil',
      'Bu ilanı silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            try {
              const idToken = await user.getIdToken()
              await animalsAPI.delete(animalId)
              setSuccessDialog({
                visible: true,
                title: 'Başarılı',
                message: 'İlan başarıyla silindi.',
                type: 'success',
              })
              loadMyLostAnimals()
            } catch (error: any) {
              setSuccessDialog({
                visible: true,
                title: 'Hata',
                message: error.message || 'İlan silinirken bir hata oluştu.',
                type: 'error',
              })
            }
          },
        },
      ]
    )
  }

  const hasChanges = () => {
    return (
      formData.firstName !== initialFormData.firstName ||
      formData.lastName !== initialFormData.lastName ||
      formData.description !== initialFormData.description ||
      formData.city !== initialFormData.city ||
      formData.phone !== initialFormData.phone ||
      formData.nickname !== initialFormData.nickname
    )
  }

  const handleSave = async () => {
    if (!user) return

    // Değişiklik kontrolü
    if (!hasChanges()) {
      setSuccessDialog({
        visible: true,
        title: 'Bilgi',
        message: 'Değiştirilecek bir bilgi bulunmuyor.',
        type: 'info',
      })
      return
    }

    if (!backendUser) {
      setSuccessDialog({
        visible: true,
        title: 'Bağlantı Hatası',
        message: 'Backend sunucusuna bağlanılamıyor. Profil bilgileri kaydedilemez. Lütfen internet bağlantınızı kontrol edin.',
        type: 'error',
      })
      return
    }

    setLoading(true)
    try {
      const idToken = await user.getIdToken()
      
      // API isteğini yap ve response'u kontrol et
      console.log('📤 Profil güncelleme isteği gönderiliyor:', {
        userId: backendUser.id,
        data: {
          firstName: formData.firstName || null,
          lastName: formData.lastName || null,
          description: formData.description || null,
          city: formData.city || null,
          phone: formData.phone || null,
          nickname: formData.nickname || null,
        }
      })
      
      const updateResult = await usersAPI.update(backendUser.id, {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        description: formData.description || null,
        city: formData.city || null,
        phone: formData.phone || null,
        nickname: formData.nickname || null,
      }, idToken)
      
      console.log('✅ Profil güncelleme API yanıtı:', updateResult)
      
      // Backend'den güncel veriyi çek
      await refreshBackendUser()
      
      // Başarılı kayıt sonrası initialFormData'yı güncelle
      setInitialFormData({ ...formData })
      
      setSuccessDialog({
        visible: true,
        title: 'Başarılı! 🎉',
        message: 'Profil bilgileriniz başarıyla güncellendi.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('❌ Profil kaydetme hatası:', error)
      console.error('❌ Hata detayları:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setSuccessDialog({
        visible: true,
        title: 'Hata',
        message: error.message || 'Profil güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (setting: 'showGooglePhoto' | 'useNickname', value: boolean) => {
    if (!userSettings) return

    if (!backendUser) {
      setSuccessDialog({
        visible: true,
        title: 'Bağlantı Hatası',
        message: 'Backend sunucusuna bağlanılamıyor. Ayarlar kaydedilemez.',
        type: 'error',
      })
      return
    }

    const newSettings = { ...userSettings, [setting]: value }
    setUserSettings(newSettings)

    try {
      await userSettingsAPI.updateByUserId(backendUser.id, {
        [setting]: value,
      })
      setSuccessDialog({
        visible: true,
        title: 'Başarılı! ✅',
        message: 'Ayar başarıyla güncellendi.',
        type: 'success',
      })
    } catch (error: any) {
      console.error('Settings update error:', error)
      setSuccessDialog({
        visible: true,
        title: 'Hata',
        message: 'Ayar güncellenirken bir hata oluştu. Lütfen tekrar deneyin.',
        type: 'error',
      })
      setUserSettings(userSettings)
    }
  }

  const getFullName = () => {
    if (userSettings?.useNickname && formData.nickname) {
      return formData.nickname
    }
    const firstName = formData.firstName || ''
    const lastName = formData.lastName || ''
    const fullName = `${firstName} ${lastName}`.trim()
    if (fullName) return fullName
    if (backendUser?.email) return backendUser.email
    if (user?.email) return user.email
    if (user?.displayName) return user.displayName
    return 'Kullanıcı'
  }

  const getProfilePhotoUrlForDisplay = () => {
    // API'den snake_case gelebilir, kontrol et
    const profilePhoto = backendUser?.profilePhoto || (backendUser as any)?.profile_photo
    
    // Eğer Google fotoğrafı açıksa (showGooglePhoto === true), önce Google'dan geleni göster
    // Yoksa DB'deki fotoğrafı göster
    if (userSettings?.showGooglePhoto === true) {
      // Önce Google'dan gelen fotoğrafı kontrol et
      if (user?.photoURL) {
        return user.photoURL
      }
      // Google fotoğrafı yoksa DB'deki fotoğrafı göster
      if (profilePhoto) {
        return profilePhoto
      }
    }
    
    // Eğer Google fotoğrafı kapalıysa (showGooglePhoto === false), profil fotoğrafı gizlenmiş demektir
    // Bu durumda default avatar gösterilmeli (getProfilePhotoUrl bunu yapacak)
    // Eğer userSettings henüz yüklenmediyse veya belirsizse, helper fonksiyonu kullan
    return getProfilePhotoUrl({
      profilePhoto: profilePhoto,
      showGooglePhoto: userSettings?.showGooglePhoto,
      userSettings: {
        showGooglePhoto: userSettings?.showGooglePhoto,
      },
    })
  }

  const getInputIcon = (field: string) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return 'person-outline'
      case 'email':
        return 'mail-outline'
      case 'nickname':
        return 'at-outline'
      case 'description':
        return 'document-text-outline'
      case 'city':
        return 'location-outline'
      case 'phone':
        return 'call-outline'
      default:
        return 'ellipse-outline'
    }
  }

  if (!user) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  const displayEmail = backendUser?.email || user?.email || 'E-posta yok'
  const displayDate = backendUser?.createdAt 
    ? new Date(backendUser.createdAt).toLocaleDateString('tr-TR')
    : 'Bilinmiyor'

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            paddingTop: Math.max(insets.top, 20),
            opacity: fadeAnim,
            transform: [{ scale: headerScale }],
          }
        ]}
      >
        <View style={styles.headerBackground}>
          <View style={styles.headerGradientCircle1} />
          <View style={styles.headerGradientCircle2} />
        </View>
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Image source={{ uri: getProfilePhotoUrlForDisplay() }} style={styles.profilePhoto} />
        </Animated.View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{getFullName()}</Text>
          <View style={styles.headerEmailContainer}>
            <Ionicons name="mail" size={14} color="#666" />
            <Text style={styles.headerEmail}>{displayEmail}</Text>
          </View>
          <View style={styles.headerDateContainer}>
            <Ionicons name="calendar" size={12} color="#999" />
            <Text style={styles.headerDate}>Katılım: {displayDate}</Text>
          </View>
          {!backendUser && (
            <View style={styles.backendWarning}>
              <Ionicons name="information-circle-outline" size={14} color="#FF7A00" />
              <Text style={styles.backendWarningText}>
                Backend bağlantısı yok. Profil bilgileri kaydedilemez.
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Tabs */}
      <Animated.View 
        style={[
          styles.tabsContainer,
          {
            opacity: tabSlideAnim,
            transform: [{ translateY: tabSlideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })}],
          }
        ]}
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.tabsContent}
        >
          {[
            { key: 'profile', label: 'Profil', icon: 'person-outline', color: '#FF7A00' },
            { key: 'lost', label: 'Kayıp İlanı', icon: 'search-outline', color: '#3b82f6' },
            { key: 'contributions', label: 'Katkılarım', icon: 'heart-outline', color: '#ef4444' },
            { key: 'applications', label: 'Başvurularım', icon: 'document-text-outline', color: '#10b981' },
            { key: 'blog', label: 'Yazılarım', icon: 'create-outline', color: '#8b5cf6' },
            { key: 'settings', label: 'Ayarlar', icon: 'settings-outline', color: '#f59e0b' },
          ].map((tab, index) => (
            <Animated.View
              key={tab.key}
              style={{
                opacity: tabSlideAnim,
                transform: [{
                  translateX: tabSlideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-30, 0],
                  })
                }],
              }}
            >
              <TouchableOpacity
                style={[
                  styles.tab, 
                  activeTab === tab.key && [styles.tabActive, { borderBottomColor: tab.color }]
                ]}
                onPress={() => setActiveTab(tab.key as any)}
                activeOpacity={0.7}
              >
              <Ionicons
                name={tab.icon as any}
                size={getResponsiveSize(18)}
                color={activeTab === tab.key ? tab.color : '#666'}
              />
                <Text
                  style={[
                    styles.tabText,
                    activeTab === tab.key && [styles.tabTextActive, { color: tab.color }],
                  ]}
                  numberOfLines={1}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.tabContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {activeTab === 'profile' && (
            <>
              <View style={styles.form}>
                <Animated.View 
                  style={[
                    styles.row,
                    {
                      opacity: inputAnimations[0].opacity,
                      transform: [{ scale: inputAnimations[0].scale }],
                    }
                  ]}
                >
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Ad *</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'firstName' && styles.inputWrapperFocused,
                    ]}>
                      <Ionicons
                        name={getInputIcon('firstName') as any}
                        size={getResponsiveSize(18)}
                        color={focusedField === 'firstName' ? '#FF7A00' : '#999'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.firstName}
                        onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                        placeholder="Adınız"
                        placeholderTextColor="#999"
                        onFocus={() => setFocusedField('firstName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Soyad *</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'lastName' && styles.inputWrapperFocused,
                    ]}>
                      <Ionicons
                        name={getInputIcon('lastName') as any}
                        size={getResponsiveSize(18)}
                        color={focusedField === 'lastName' ? '#FF7A00' : '#999'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.lastName}
                        onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                        placeholder="Soyadınız"
                        placeholderTextColor="#999"
                        onFocus={() => setFocusedField('lastName')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.fullWidth,
                    {
                      opacity: inputAnimations[2].opacity,
                      transform: [{ scale: inputAnimations[2].scale }],
                    }
                  ]}
                >
                  <Text style={styles.label}>E-posta Adresi</Text>
                  <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                    <Ionicons
                      name={getInputIcon('email') as any}
                      size={getResponsiveSize(18)}
                      color="#999"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={[styles.input, styles.inputDisabled]}
                      value={displayEmail}
                      editable={false}
                      placeholderTextColor="#999"
                    />
                  </View>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.fullWidth,
                    {
                      opacity: inputAnimations[3].opacity,
                      transform: [{ scale: inputAnimations[3].scale }],
                    }
                  ]}
                >
                  <Text style={styles.label}>Takma Ad (İsteğe Bağlı)</Text>
                  <Text style={styles.hint}>Forum ve yorumlarda görünecek takma adınız</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'nickname' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('nickname') as any}
                      size={getResponsiveSize(18)}
                      color={focusedField === 'nickname' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      value={formData.nickname}
                      onChangeText={(text) => setFormData({ ...formData, nickname: text })}
                      placeholder="Örn: Bal Arısı"
                      placeholderTextColor="#999"
                      onFocus={() => setFocusedField('nickname')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.fullWidth,
                    {
                      opacity: inputAnimations[4].opacity,
                      transform: [{ scale: inputAnimations[4].scale }],
                    }
                  ]}
                >
                  <Text style={styles.label}>Hakkımda</Text>
                  <View style={[
                    styles.inputWrapper,
                    styles.textAreaWrapper,
                    focusedField === 'description' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('description') as any}
                      size={getResponsiveSize(18)}
                      color={focusedField === 'description' ? '#FF7A00' : '#999'}
                      style={[styles.inputIcon, styles.textAreaIcon]}
                    />
                    <TextInput
                      style={[styles.input, styles.textArea]}
                      value={formData.description}
                      onChangeText={(text) => setFormData({ ...formData, description: text })}
                      placeholder="Kendinizden bahsedin..."
                      placeholderTextColor="#999"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      onFocus={() => setFocusedField('description')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </Animated.View>

                <Animated.View 
                  style={[
                    styles.row,
                    {
                      opacity: inputAnimations[5].opacity,
                      transform: [{ scale: inputAnimations[5].scale }],
                    }
                  ]}
                >
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Şehir</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'city' && styles.inputWrapperFocused,
                    ]}>
                      <Ionicons
                        name={getInputIcon('city') as any}
                        size={getResponsiveSize(18)}
                        color={focusedField === 'city' ? '#FF7A00' : '#999'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.city}
                        onChangeText={(text) => setFormData({ ...formData, city: text })}
                        placeholder="İstanbul"
                        placeholderTextColor="#999"
                        onFocus={() => setFocusedField('city')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.label}>Telefon Numarası</Text>
                    <View style={[
                      styles.inputWrapper,
                      focusedField === 'phone' && styles.inputWrapperFocused,
                    ]}>
                      <Ionicons
                        name={getInputIcon('phone') as any}
                        size={getResponsiveSize(18)}
                        color={focusedField === 'phone' ? '#FF7A00' : '#999'}
                        style={styles.inputIcon}
                      />
                      <TextInput
                        style={styles.input}
                        value={formData.phone}
                        onChangeText={(text) => setFormData({ ...formData, phone: text })}
                        placeholder="+90 555 123 4567"
                        placeholderTextColor="#999"
                        keyboardType="phone-pad"
                        onFocus={() => setFocusedField('phone')}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                </Animated.View>

                <TouchableOpacity
                  style={[
                    styles.saveButton, 
                    (loading || !hasChanges()) && styles.saveButtonDisabled
                  ]}
                  onPress={handleSave}
                  disabled={loading || !hasChanges()}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={getResponsiveSize(20)} 
                        color={hasChanges() ? "#fff" : "#999"} 
                      />
                      <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                    </>
                  )}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.logoutButton} 
                  onPress={logout}
                  activeOpacity={0.8}
                >
                  <Ionicons name="log-out-outline" size={getResponsiveSize(18)} color="#ef4444" />
                  <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {activeTab === 'lost' && (
            <View style={styles.lostTabContent}>
              {loadingLostAnimals ? (
                <View style={styles.centerContainer}>
                  <ActivityIndicator size="large" color="#FF7A00" />
                  <Text style={styles.loadingText}>Yükleniyor...</Text>
                </View>
              ) : myLostAnimals.length === 0 ? (
                <View style={styles.emptyTabContent}>
                  <View style={styles.emptyIconContainer}>
                    <Ionicons name="search" size={getResponsiveSize(64)} color="#FF7A00" />
                  </View>
                  <Text style={styles.emptyTitle}>Kayıp Hayvan İlanı</Text>
                  <Text style={styles.emptyDescription}>
                    Kayıp hayvanınız için ilan oluşturun ve topluluğumuzdan yardım alın
                  </Text>
                  <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigation.navigate('LostAnimals' as never)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={getResponsiveSize(24)} color="#fff" />
                    <Text style={styles.createButtonText}>Kayıp Hayvan İlanı Oluştur</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <>
                  <View style={styles.lostAnimalsHeader}>
                    <Text style={styles.lostAnimalsTitle}>Kayıp Hayvan İlanlarım</Text>
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => navigation.navigate('LostAnimals' as never)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="add-circle" size={getResponsiveSize(20)} color="#FF7A00" />
                      <Text style={styles.addButtonText}>Yeni İlan</Text>
                    </TouchableOpacity>
                  </View>
                  <View style={styles.lostAnimalsList}>
                    {myLostAnimals.map((animal) => (
                      <View key={animal.id} style={styles.lostAnimalCard}>
                        <TouchableOpacity
                          style={styles.lostAnimalCardContent}
                          onPress={() => navigation.navigate('AnimalDetail' as never, { id: animal.id } as never)}
                          activeOpacity={0.8}
                        >
                          <AnimalCard animal={animal} />
                        </TouchableOpacity>
                        <View style={styles.lostAnimalActions}>
                          {animal.isActive !== false && (
                            <TouchableOpacity
                              style={styles.actionButton}
                              onPress={() => handleMarkAsFound(animal.id)}
                              activeOpacity={0.8}
                            >
                              <Ionicons name="checkmark-circle" size={getResponsiveSize(18)} color="#10b981" />
                              <Text style={styles.actionButtonText}>Hayvanımı Buldum</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={[styles.actionButton, styles.deleteButton]}
                            onPress={() => handleDeleteAnimal(animal.id)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="trash-outline" size={getResponsiveSize(18)} color="#ef4444" />
                            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Sil</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </View>
          )}

          {activeTab === 'contributions' && (
            <View style={styles.emptyTabContent}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="heart" size={getResponsiveSize(64)} color="#FF7A00" />
              </View>
              <Text style={styles.emptyTitle}>Katkılarınız</Text>
              <Text style={styles.emptyDescription}>
                Henüz katkınız bulunmuyor. Topluluğa katkıda bulunmaya başlayın!
              </Text>
            </View>
          )}

          {activeTab === 'applications' && (
            <View style={styles.emptyTabContent}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text" size={getResponsiveSize(64)} color="#FF7A00" />
              </View>
              <Text style={styles.emptyTitle}>Başvurularınız</Text>
              <Text style={styles.emptyDescription}>
                Henüz başvurunuz bulunmuyor. Sahiplenme başvurularınız burada görünecek.
              </Text>
            </View>
          )}

          {activeTab === 'blog' && (
            <View style={styles.emptyTabContent}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="create" size={getResponsiveSize(64)} color="#FF7A00" />
              </View>
              <Text style={styles.emptyTitle}>Yazılarınız</Text>
              <Text style={styles.emptyDescription}>
                Henüz blog yazınız bulunmuyor. Bilgi paylaşmaya başlayın!
              </Text>
            </View>
          )}

          {activeTab === 'settings' && (
            <>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Gizlilik Ayarları</Text>
                <Text style={styles.sectionSubtitle}>
                  Profil görünürlüğünüzü ve gizlilik tercihlerinizi yönetin
                </Text>
              </View>

              <View style={styles.settingsList}>
                <View style={styles.settingItem}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="image" size={getResponsiveSize(24)} color="#FF7A00" />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Google Profil Fotoğrafını Göster</Text>
                    <Text style={styles.settingDescription}>
                      Google hesabınızdan gelen profil fotoğrafının gösterilip gösterilmeyeceğini belirleyin.
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      userSettings?.showGooglePhoto && styles.toggleActive,
                    ]}
                    onPress={() =>
                      handleSettingChange('showGooglePhoto', !userSettings?.showGooglePhoto)
                    }
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.toggleThumb,
                        userSettings?.showGooglePhoto && styles.toggleThumbActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.settingItem}>
                  <View style={styles.settingIconContainer}>
                    <Ionicons name="at" size={getResponsiveSize(24)} color="#FF7A00" />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>Takma Ad Kullan</Text>
                    <Text style={styles.settingDescription}>
                      Ad ve soyadınız yerine takma adınızın gösterilmesini sağlar.
                      {!formData.nickname && ' (Önce takma ad eklemeniz gerekmektedir)'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.toggle,
                      userSettings?.useNickname && styles.toggleActive,
                      !formData.nickname && styles.toggleDisabled,
                    ]}
                    onPress={() => {
                      if (formData.nickname) {
                        handleSettingChange('useNickname', !userSettings?.useNickname)
                      }
                    }}
                    disabled={!formData.nickname}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.toggleThumb,
                        userSettings?.useNickname && styles.toggleThumbActive,
                      ]}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={styles.logoutButton} 
                onPress={logout}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={getResponsiveSize(20)} color="#ef4444" />
                <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>

      {/* Success Dialog */}
      <SuccessDialog
        visible={successDialog.visible}
        title={successDialog.title}
        message={successDialog.message}
        type={successDialog.type}
        onClose={() => setSuccessDialog({ ...successDialog, visible: false })}
      />
    </View>
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
    fontSize: getResponsiveSize(14),
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    padding: getResponsivePadding(20),
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerGradientCircle1: {
    position: 'absolute',
    top: -30,
    right: -20,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 122, 0, 0.12)',
  },
  headerGradientCircle2: {
    position: 'absolute',
    bottom: -20,
    left: -30,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  profilePhoto: {
    width: getResponsiveSize(80),
    height: getResponsiveSize(80),
    borderRadius: getResponsiveSize(40),
    backgroundColor: '#e5e5e5',
    marginRight: getResponsivePadding(16),
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: getResponsiveSize(22),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(6),
    letterSpacing: -0.3,
  },
  headerEmailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: getResponsivePadding(4),
  },
  headerEmail: {
    fontSize: getResponsiveSize(14),
    color: '#666',
    flex: 1,
  },
  headerDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerDate: {
    fontSize: getResponsiveSize(12),
    color: '#999',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    minHeight: getResponsiveSize(56),
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tabsContent: {
    paddingHorizontal: getResponsivePadding(12),
    paddingVertical: getResponsivePadding(8),
  },
  tabs: {
    flexDirection: 'row',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getResponsivePadding(10),
    paddingHorizontal: getResponsivePadding(12),
    gap: getResponsivePadding(6),
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
    marginRight: getResponsivePadding(6),
    minHeight: getResponsiveSize(40),
  },
  tabActive: {
    borderBottomColor: '#FF7A00',
  },
  tabText: {
    fontSize: getResponsiveSize(12),
    fontWeight: '500',
    color: '#666',
  },
  tabTextActive: {
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: getResponsivePadding(20),
    maxWidth: '100%',
  },
  sectionHeader: {
    marginBottom: getResponsivePadding(24),
    padding: getResponsivePadding(16),
    backgroundColor: '#FFF7F0',
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
  },
  sectionTitle: {
    fontSize: getResponsiveSize(24),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(8),
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: getResponsiveSize(14),
    color: '#6b7280',
    lineHeight: getResponsiveSize(20),
  },
  form: {
    gap: getResponsivePadding(16),
  },
  row: {
    flexDirection: 'row',
    gap: getResponsivePadding(12),
    flexWrap: 'wrap',
  },
  halfWidth: {
    flex: 1,
    minWidth: SCREEN_WIDTH < 375 ? '100%' : '45%',
    maxWidth: SCREEN_WIDTH < 375 ? '100%' : '48%',
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
  },
  label: {
    fontSize: getResponsiveSize(14),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(10),
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: getResponsiveSize(11),
    color: '#999',
    marginBottom: getResponsivePadding(6),
    lineHeight: getResponsiveSize(16),
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    paddingHorizontal: getResponsivePadding(16),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  inputWrapperFocused: {
    borderColor: '#FF7A00',
    backgroundColor: '#fff',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
  },
  inputWrapperDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#e5e7eb',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    paddingTop: getResponsivePadding(14),
  },
  inputIcon: {
    marginRight: getResponsivePadding(12),
  },
  textAreaIcon: {
    marginTop: getResponsivePadding(2),
  },
  input: {
    flex: 1,
    paddingVertical: getResponsivePadding(16),
    fontSize: getResponsiveSize(16),
    color: '#1a1a1a',
    minHeight: getResponsiveSize(24),
  },
  inputDisabled: {
    backgroundColor: 'transparent',
    color: '#999',
  },
  textArea: {
    height: getResponsiveSize(100),
    textAlignVertical: 'top',
    paddingTop: 0,
  },
  saveButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: getResponsivePadding(18),
    paddingHorizontal: getResponsivePadding(24),
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: getResponsivePadding(12),
    flexDirection: 'row',
    gap: getResponsivePadding(10),
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  saveButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(17),
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsivePadding(16),
    paddingHorizontal: getResponsivePadding(24),
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#ef4444',
    gap: getResponsivePadding(10),
    marginTop: getResponsivePadding(16),
    backgroundColor: '#fff',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: getResponsiveSize(16),
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: getResponsivePadding(18),
    borderRadius: 16,
    gap: getResponsivePadding(8),
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#ff9500',
  },
  createButtonText: {
    color: '#fff',
    fontSize: getResponsiveSize(16),
    fontWeight: '700',
  },
  emptyTabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsivePadding(60),
    paddingHorizontal: getResponsivePadding(20),
  },
  emptyIconContainer: {
    width: getResponsiveSize(120),
    height: getResponsiveSize(120),
    borderRadius: getResponsiveSize(60),
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsivePadding(24),
    borderWidth: 3,
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  emptyTitle: {
    fontSize: getResponsiveSize(22),
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(12),
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: getResponsiveSize(15),
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: getResponsiveSize(22),
    marginBottom: getResponsivePadding(32),
  },
  lostTabContent: {
    flex: 1,
  },
  lostAnimalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsivePadding(20),
    paddingHorizontal: getResponsivePadding(4),
  },
  lostAnimalsTitle: {
    fontSize: getResponsiveSize(20),
    fontWeight: '700',
    color: '#1a1a1a',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsivePadding(6),
    paddingVertical: getResponsivePadding(8),
    paddingHorizontal: getResponsivePadding(12),
    borderRadius: 12,
    backgroundColor: '#FFF7F0',
    borderWidth: 1,
    borderColor: '#FF7A00',
  },
  addButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#FF7A00',
  },
  lostAnimalsList: {
    gap: getResponsivePadding(16),
  },
  lostAnimalCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  lostAnimalCardContent: {
    padding: getResponsivePadding(12),
  },
  lostAnimalActions: {
    flexDirection: 'row',
    gap: getResponsivePadding(12),
    padding: getResponsivePadding(12),
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#f9f9f9',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsivePadding(6),
    paddingVertical: getResponsivePadding(10),
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  deleteButton: {
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: getResponsiveSize(14),
    fontWeight: '600',
    color: '#10b981',
  },
  deleteButtonText: {
    color: '#ef4444',
  },
  settingsList: {
    gap: getResponsivePadding(20),
    marginBottom: getResponsivePadding(32),
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: getResponsivePadding(18),
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderLeftWidth: 4,
    borderLeftColor: '#FF7A00',
  },
  settingIconContainer: {
    width: getResponsiveSize(40),
    height: getResponsiveSize(40),
    borderRadius: getResponsiveSize(20),
    backgroundColor: '#FFF7F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getResponsivePadding(12),
  },
  settingInfo: {
    flex: 1,
    marginRight: getResponsivePadding(16),
  },
  settingTitle: {
    fontSize: getResponsiveSize(16),
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: getResponsivePadding(4),
  },
  settingDescription: {
    fontSize: getResponsiveSize(12),
    color: '#666',
    lineHeight: getResponsiveSize(18),
  },
  toggle: {
    width: getResponsiveSize(44),
    height: getResponsiveSize(24),
    borderRadius: getResponsiveSize(12),
    backgroundColor: '#ddd',
    justifyContent: 'center',
    padding: 2,
  },
  toggleActive: {
    backgroundColor: '#FF7A00',
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  toggleThumb: {
    width: getResponsiveSize(20),
    height: getResponsiveSize(20),
    borderRadius: getResponsiveSize(10),
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  backendWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getResponsivePadding(8),
    padding: getResponsivePadding(8),
    backgroundColor: '#FFF7F0',
    borderRadius: 8,
    gap: 6,
  },
  backendWarningText: {
    fontSize: getResponsiveSize(11),
    color: '#FF7A00',
    flex: 1,
    lineHeight: getResponsiveSize(16),
  },
})
