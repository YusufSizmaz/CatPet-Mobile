import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'
import ErrorDialog from '../components/ErrorDialog'
import { getFirebaseErrorMessage, getErrorTitle } from '../utils/errorMessages'
import AsyncStorage from '@react-native-async-storage/async-storage'

const { width } = Dimensions.get('window')

export default function RegisterScreen() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    city: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [newsletter, setNewsletter] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [errorVisible, setErrorVisible] = useState(false)
  const [errorTitle, setErrorTitle] = useState('Hata')
  const [errorMessage, setErrorMessage] = useState('')
  const { register } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const heartAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Heart animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(heartAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(heartAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const heartScale = heartAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  })

  const showError = (title: string, message: string) => {
    setErrorTitle(title)
    setErrorMessage(message)
    setErrorVisible(true)
  }

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      showError('Eksik Bilgi', 'Lütfen zorunlu alanları doldurun')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      showError('Şifre Uyumsuzluğu', 'Şifreler eşleşmiyor. Lütfen aynı şifreyi iki kez girin.')
      return
    }

    if (formData.password.length < 6) {
      showError('Zayıf Şifre', 'Şifre en az 6 karakter olmalıdır. Daha güçlü bir şifre seçin.')
      return
    }

    if (!termsAccepted) {
      showError('Kullanım Koşulları', 'Lütfen kullanım koşullarını ve gizlilik politikasını kabul edin.')
      return
    }

    setIsLoading(true)
    try {
      // Set flag BEFORE register to ensure it's set before user state changes
      const welcomeData = { isNewUser: true, userName: formData.firstName }
      await AsyncStorage.setItem('showWelcomeScreen', JSON.stringify(welcomeData))
      console.log('✅ Welcome screen flag set:', welcomeData)
      
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      console.log('✅ Register successful, user state should change soon')
    } catch (error: any) {
      const title = getErrorTitle(error)
      const message = getFirebaseErrorMessage(error)
      showError(title, message)
    } finally {
      setIsLoading(false)
    }
  }

  const getInputIcon = (field: string) => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return 'person-outline'
      case 'email':
        return 'mail-outline'
      case 'phone':
        return 'call-outline'
      case 'city':
        return 'location-outline'
      case 'password':
      case 'passwordConfirm':
        return 'lock-closed-outline'
      default:
        return 'ellipse-outline'
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Background Decorations */}
      <View style={styles.backgroundContainer}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.circle3} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  transform: [{ scale: heartScale }],
                },
              ]}
            >
              <Ionicons name="heart" size={60} color="#FF7A00" />
            </Animated.View>
            <Text style={styles.title}>CatPet Ailesine Katılın</Text>
            <Text style={styles.subtitle}>
              Birkaç adımda hesabınızı oluşturun ve patili dostlarımıza yardım etmeye başlayın. 🐾
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Ionicons name="person-add" size={20} color="#fff" />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
                <Text style={styles.sectionDescription}>
                  Giriş yapmak için kullanacağınız bilgileri girin.
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              {/* Name Fields */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Ad *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'firstName' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('firstName') as any}
                      size={18}
                      color={focusedField === 'firstName' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Adınız"
                      placeholderTextColor="#999"
                      value={formData.firstName}
                      onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                      editable={!isLoading}
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
                      size={18}
                      color={focusedField === 'lastName' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Soyadınız"
                      placeholderTextColor="#999"
                      value={formData.lastName}
                      onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Email Field */}
              <View style={styles.fullWidth}>
                <Text style={styles.label}>E-posta Adresi *</Text>
                <View style={[
                  styles.inputWrapper,
                  focusedField === 'email' && styles.inputWrapperFocused,
                ]}>
                  <Ionicons
                    name={getInputIcon('email') as any}
                    size={18}
                    color={focusedField === 'email' ? '#FF7A00' : '#999'}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="catpet@example.com"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    editable={!isLoading}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                  />
                </View>
              </View>

              {/* Phone and City Row */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Telefon (Opsiyonel)</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'phone' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('phone') as any}
                      size={18}
                      color={focusedField === 'phone' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="+90 555 123 4567"
                      placeholderTextColor="#999"
                      keyboardType="phone-pad"
                      value={formData.phone}
                      onChangeText={(text) => setFormData({ ...formData, phone: text })}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('phone')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şehir (Opsiyonel)</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'city' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('city') as any}
                      size={18}
                      color={focusedField === 'city' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="İstanbul"
                      placeholderTextColor="#999"
                      value={formData.city}
                      onChangeText={(text) => setFormData({ ...formData, city: text })}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('city')}
                      onBlur={() => setFocusedField(null)}
                    />
                  </View>
                </View>
              </View>

              {/* Password Fields */}
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şifre *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'password' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('password') as any}
                      size={18}
                      color={focusedField === 'password' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                      pointerEvents="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#999"
                      secureTextEntry={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={formData.password}
                      onChangeText={(text) => setFormData({ ...formData, password: text })}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="default"
                    />
                  </View>
                  <Text style={styles.hint}>En az 6 karakter olmalıdır</Text>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şifre Tekrar *</Text>
                  <View style={[
                    styles.inputWrapper,
                    focusedField === 'passwordConfirm' && styles.inputWrapperFocused,
                  ]}>
                    <Ionicons
                      name={getInputIcon('passwordConfirm') as any}
                      size={18}
                      color={focusedField === 'passwordConfirm' ? '#FF7A00' : '#999'}
                      style={styles.inputIcon}
                      pointerEvents="none"
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#999"
                      secureTextEntry={true}
                      autoCapitalize="none"
                      autoCorrect={false}
                      value={formData.passwordConfirm}
                      onChangeText={(text) => setFormData({ ...formData, passwordConfirm: text })}
                      editable={!isLoading}
                      onFocus={() => setFocusedField('passwordConfirm')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="default"
                    />
                  </View>
                </View>
              </View>

              {/* Checkboxes */}
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      termsAccepted && styles.checkboxChecked,
                    ]}
                  >
                    {termsAccepted && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    <Text style={styles.checkboxLink}>Kullanım Koşulları</Text>'nı ve{' '}
                    <Text style={styles.checkboxLink}>Gizlilik Politikası</Text>'nı okudum ve kabul
                    ediyorum. *
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setNewsletter(!newsletter)}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      newsletter && styles.checkboxChecked,
                    ]}
                  >
                    {newsletter && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    CatPet'ten duyuru ve bilgilendirme e-postaları almak istiyorum.
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Hesap Oluştur</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten bir hesabınız var mı?</Text>
            <TouchableOpacity
              style={styles.footerButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Ionicons name="log-in-outline" size={18} color="#FF7A00" />
              <Text style={styles.footerLink}>Giriş Yapın</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Ionicons name="paw" size={20} color="#FF7A00" style={styles.decorativeIcon} />
            <Ionicons name="star" size={22} color="#10b981" style={styles.decorativeIcon} />
            <Ionicons name="heart" size={18} color="#8b5cf6" style={styles.decorativeIcon} />
          </View>
        </Animated.View>
      </ScrollView>

      {/* Error Dialog */}
      <ErrorDialog
        visible={errorVisible}
        title={errorTitle}
        message={errorMessage}
        onClose={() => setErrorVisible(false)}
        icon={
          errorTitle.includes('Şifre') || errorMessage.includes('şifre')
            ? 'lock-closed'
            : errorTitle.includes('E-posta') || errorMessage.includes('e-posta')
            ? 'mail'
            : 'alert-circle'
        }
      />
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7F0',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  circle1: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 122, 0, 0.08)',
  },
  circle2: {
    position: 'absolute',
    top: 200,
    left: -80,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 149, 0, 0.06)',
  },
  circle3: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 122, 0, 0.05)',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '400',
    lineHeight: 22,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  sectionNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  form: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  inputWrapperFocused: {
    borderColor: '#FF7A00',
    backgroundColor: '#fff',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1a1a1a',
    minHeight: 20,
  },
  hint: {
    fontSize: 11,
    color: '#999',
    marginTop: 6,
    marginLeft: 4,
  },
  checkboxContainer: {
    gap: 14,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxChecked: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  checkboxLink: {
    color: '#FF7A00',
    fontWeight: '700',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 15,
    color: '#666',
  },
  footerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FF7A00',
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 20,
    opacity: 0.6,
  },
  decorativeIcon: {
    opacity: 0.7,
  },
})
