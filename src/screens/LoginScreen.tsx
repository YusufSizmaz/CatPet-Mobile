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

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailFocused, setEmailFocused] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [errorVisible, setErrorVisible] = useState(false)
  const [errorTitle, setErrorTitle] = useState('Hata')
  const [errorMessage, setErrorMessage] = useState('')
  const { login, loginWithGoogle } = useAuth()
  const navigation = useNavigation()
  const insets = useSafeAreaInsets()

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(50)).current
  const pawAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Fade in animation
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

    // Paw animation loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(pawAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pawAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start()
  }, [])

  const pawRotation = pawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  })

  const pawScale = pawAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  })

  const showError = (title: string, message: string) => {
    setErrorTitle(title)
    setErrorMessage(message)
    setErrorVisible(true)
  }

  const handleSubmit = async () => {
    if (!email || !password) {
      showError('Eksik Bilgi', 'Lütfen tüm alanları doldurun')
      return
    }

    setIsLoading(true)
    try {
      await login(email, password)
      // Set flag to show welcome screen
      await AsyncStorage.setItem('showWelcomeScreen', JSON.stringify({ isNewUser: false }))
    } catch (error: any) {
      const title = getErrorTitle(error)
      const message = getFirebaseErrorMessage(error)
      showError(title, message)
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await loginWithGoogle()
      // Set flag to show welcome screen
      await AsyncStorage.setItem('showWelcomeScreen', JSON.stringify({ isNewUser: false }))
    } catch (error: any) {
      if (!error.message?.includes('iptal')) {
        showError('Google Giriş Hatası', error.message || 'Google ile giriş başarısız oldu')
      }
      setIsLoading(false)
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
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 40) }]}
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
          {/* Header with Animated Paw */}
          <View style={styles.header}>
            <Animated.View
              style={[
                styles.pawContainer,
                {
                  transform: [
                    { rotate: pawRotation },
                    { scale: pawScale },
                  ],
                },
              ]}
            >
              <Ionicons name="paw" size={60} color="#FF7A00" />
            </Animated.View>
            <Text style={styles.title}>Giriş Yap</Text>
            <Text style={styles.subtitle}>
              CatPet'e hoş geldiniz! 🐾
            </Text>
          </View>

          {/* Input Fields */}
          <View style={styles.inputContainer}>
            <View style={[
              styles.inputWrapper,
              emailFocused && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={emailFocused ? '#FF7A00' : '#999'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="E-posta adresiniz"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!isLoading}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
            </View>

            <View style={[
              styles.inputWrapper,
              passwordFocused && styles.inputWrapperFocused,
            ]}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={passwordFocused ? '#FF7A00' : '#999'}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Şifreniz"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
                editable={!isLoading}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
            </View>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.primaryButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}>Giriş Yap</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>veya</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google Button */}
          <TouchableOpacity
            style={[
              styles.button,
              styles.googleButton,
              isLoading && styles.buttonDisabled,
            ]}
            onPress={handleGoogleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <View style={styles.googleIconContainer}>
              <Text style={styles.googleIcon}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Google ile Giriş Yap</Text>
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.switchButtonContainer}>
            <Text style={styles.switchButtonText}>Hesabınız yok mu?</Text>
            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => {
                navigation.navigate('Register' as never)
              }}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <Ionicons name="person-add-outline" size={18} color="#FF7A00" />
              <Text style={styles.switchButtonBold}>Kayıt olun</Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            <Ionicons name="heart" size={24} color="#FF7A00" style={styles.decorativeIcon} />
            <Ionicons name="paw" size={20} color="#10b981" style={styles.decorativeIcon} />
            <Ionicons name="star" size={22} color="#8b5cf6" style={styles.decorativeIcon} />
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
    top: 100,
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
    justifyContent: 'center',
    paddingBottom: 40,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  pawContainer: {
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputContainer: {
    marginBottom: 24,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputWrapperFocused: {
    borderColor: '#FF7A00',
    shadowColor: '#FF7A00',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  button: {
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#FF7A00',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 28,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#4285F4',
  },
  googleIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  googleIcon: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  switchButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 20,
  },
  switchButtonText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '400',
  },
  switchButton: {
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
  switchButtonBold: {
    color: '#FF7A00',
    fontSize: 15,
    fontWeight: '700',
  },
  decorativeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 20,
    opacity: 0.6,
  },
  decorativeIcon: {
    opacity: 0.7,
  },
})
