import React, { useState, useEffect } from 'react'
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
  Modal,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { usersAPI, userSettingsAPI } from '../services/api'
import { Ionicons } from '@expo/vector-icons'

export default function ProfileScreen() {
  const { user, backendUser, logout, refreshBackendUser } = useAuth()
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState<'profile' | 'lost' | 'contributions' | 'applications' | 'blog' | 'settings'>('profile')
  const [loading, setLoading] = useState(false)
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

  useEffect(() => {
    if (backendUser) {
      setFormData({
        firstName: backendUser.firstName || '',
        lastName: backendUser.lastName || '',
        description: backendUser.description || '',
        city: backendUser.city || '',
        phone: backendUser.phone || '',
        nickname: backendUser.nickname || '',
      })
      loadUserSettings()
    }
  }, [backendUser])

  const loadUserSettings = async () => {
    if (!backendUser) return
    try {
      const settings = await userSettingsAPI.getByUserId(backendUser.id)
      setUserSettings({
        showGooglePhoto: settings.showGooglePhoto ?? true,
        useNickname: settings.useNickname ?? false,
      })
    } catch (error) {
      setUserSettings({
        showGooglePhoto: true,
        useNickname: false,
      })
    }
  }

  const handleSave = async () => {
    if (!backendUser || !user) return

    setLoading(true)
    try {
      const idToken = await user.getIdToken()
      await usersAPI.update(backendUser.id, {
        firstName: formData.firstName || null,
        lastName: formData.lastName || null,
        description: formData.description || null,
        city: formData.city || null,
        phone: formData.phone || null,
        nickname: formData.nickname || null,
      }, idToken)
      await refreshBackendUser()
      Alert.alert('Başarılı', 'Profil başarıyla güncellendi')
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Profil güncellenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = async (setting: 'showGooglePhoto' | 'useNickname', value: boolean) => {
    if (!backendUser || !userSettings) return

    const newSettings = { ...userSettings, [setting]: value }
    setUserSettings(newSettings)

    try {
      await userSettingsAPI.updateByUserId(backendUser.id, {
        [setting]: value,
      })
    } catch (error: any) {
      Alert.alert('Hata', 'Ayar güncellenirken bir hata oluştu')
      setUserSettings(userSettings) // Revert
    }
  }

  const getFullName = () => {
    if (!backendUser) return 'Yükleniyor...'
    if (userSettings?.useNickname && formData.nickname) {
      return formData.nickname
    }
    const firstName = formData.firstName || ''
    const lastName = formData.lastName || ''
    return `${firstName} ${lastName}`.trim() || backendUser.email || 'Kullanıcı'
  }

  const getProfilePhotoUrl = () => {
    if (userSettings?.showGooglePhoto === false) {
      return 'https://res.cloudinary.com/dknfc65z0/image/upload/v1764186141/meerkat_svydkb.png'
    }
    return user?.photoURL || 'https://res.cloudinary.com/dknfc65z0/image/upload/v1764186141/meerkat_svydkb.png'
  }

  if (!user || !backendUser) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: getProfilePhotoUrl() }} style={styles.profilePhoto} />
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{getFullName()}</Text>
          <Text style={styles.headerEmail}>{backendUser.email}</Text>
          <Text style={styles.headerDate}>
            Katılım: {new Date(backendUser.createdAt).toLocaleDateString('tr-TR')}
          </Text>
        </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsContainer}>
        <View style={styles.tabs}>
          {[
            { key: 'profile', label: 'Profil', icon: 'person-outline' },
            { key: 'lost', label: 'Kayıp İlanı', icon: 'search-outline' },
            { key: 'contributions', label: 'Katkılarım', icon: 'heart-outline' },
            { key: 'applications', label: 'Başvurularım', icon: 'document-text-outline' },
            { key: 'blog', label: 'Yazılarım', icon: 'create-outline' },
            { key: 'settings', label: 'Ayarlar', icon: 'settings-outline' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={activeTab === tab.key ? '#FF7A00' : '#666'}
              />
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'profile' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Kişisel Bilgiler</Text>
            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Ad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    placeholder="Adınız"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Soyad</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    placeholder="Soyadınız"
                  />
                </View>
              </View>

              <View style={styles.fullWidth}>
                <Text style={styles.label}>E-posta Adresi</Text>
                <TextInput
                  style={[styles.input, styles.inputDisabled]}
                  value={backendUser.email}
                  editable={false}
                />
              </View>

              <View style={styles.fullWidth}>
                <Text style={styles.label}>Takma Ad (İsteğe Bağlı)</Text>
                <Text style={styles.hint}>Forum ve yorumlarda görünecek takma adınız</Text>
                <TextInput
                  style={styles.input}
                  value={formData.nickname}
                  onChangeText={(text) => setFormData({ ...formData, nickname: text })}
                  placeholder="Örn: Bal Arısı"
                />
              </View>

              <View style={styles.fullWidth}>
                <Text style={styles.label}>Hakkımda</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  placeholder="Kendinizden bahsedin..."
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şehir</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.city}
                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                    placeholder="İstanbul"
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Telefon Numarası</Text>
                  <TextInput
                    style={styles.input}
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    placeholder="+90 555 123 4567"
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Değişiklikleri Kaydet</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {activeTab === 'lost' && (
          <View style={styles.tabContent}>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate('LostAnimal' as never)}
            >
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Kayıp Hayvan İlanı Oluştur</Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'contributions' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Henüz katkınız yok.</Text>
            </View>
          </View>
        )}

        {activeTab === 'applications' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Henüz başvurunuz yok.</Text>
            </View>
          </View>
        )}

        {activeTab === 'blog' && (
          <View style={styles.tabContent}>
            <View style={styles.emptyState}>
              <Ionicons name="create-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>Henüz blog yazınız yok.</Text>
            </View>
          </View>
        )}

        {activeTab === 'settings' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Gizlilik Ayarları</Text>
            <View style={styles.settingsList}>
              <View style={styles.settingItem}>
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
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      userSettings?.showGooglePhoto && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.settingItem}>
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
                >
                  <View
                    style={[
                      styles.toggleThumb,
                      userSettings?.useNickname && styles.toggleThumbActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#ef4444" />
              <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  profilePhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e5e5e5',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  headerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  headerDate: {
    fontSize: 12,
    color: '#999',
  },
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#FF7A00',
  },
  tabText: {
    fontSize: 12,
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
  tabContent: {
    padding: 20,
    maxWidth: '100%',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  halfWidth: {
    flex: 1,
    minWidth: '45%',
    maxWidth: '48%',
  },
  fullWidth: {
    width: '100%',
    maxWidth: '100%',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    color: '#999',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#fff',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 16,
  },
  settingsList: {
    gap: 20,
    marginBottom: 32,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
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
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
    gap: 8,
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
  },
})
