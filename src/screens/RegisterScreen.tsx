import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { Ionicons } from '@expo/vector-icons'

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
  const { register } = useAuth()
  const navigation = useNavigation()

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun')
      return
    }

    if (formData.password !== formData.passwordConfirm) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor')
      return
    }

    if (formData.password.length < 6) {
      Alert.alert('Hata', 'Şifre en az 6 karakter olmalıdır')
      return
    }

    if (!termsAccepted) {
      Alert.alert('Hata', 'Lütfen kullanım koşullarını kabul edin')
      return
    }

    setIsLoading(true)
    try {
      await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      )
      navigation.goBack()
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Kayıt işlemi başarısız oldu')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>CatPet Ailesine Katılın</Text>
          <Text style={styles.subtitle}>
            Birkaç adımda hesabınızı oluşturun ve patili dostlarımıza yardım etmeye başlayın.
          </Text>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionNumber}>
                <Text style={styles.sectionNumberText}>1</Text>
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={styles.sectionTitle}>Hesap Bilgileri</Text>
                <Text style={styles.sectionDescription}>
                  Giriş yapmak için kullanacağınız bilgileri girin.
                </Text>
              </View>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Ad *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                    editable={!isLoading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Soyad *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>E-posta Adresi *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="catpet@example.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(text) => setFormData({ ...formData, email: text })}
                    editable={!isLoading}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Telefon (Opsiyonel)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+90 555 123 4567"
                    keyboardType="phone-pad"
                    value={formData.phone}
                    onChangeText={(text) => setFormData({ ...formData, phone: text })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.fullWidth}>
                <Text style={styles.label}>Şehir (Opsiyonel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="İstanbul"
                  value={formData.city}
                  onChangeText={(text) => setFormData({ ...formData, city: text })}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şifre *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry
                    value={formData.password}
                    onChangeText={(text) => setFormData({ ...formData, password: text })}
                    editable={!isLoading}
                  />
                  <Text style={styles.hint}>En az 6 karakter olmalıdır</Text>
                </View>
                <View style={styles.halfWidth}>
                  <Text style={styles.label}>Şifre Tekrar *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="••••••••"
                    secureTextEntry
                    value={formData.passwordConfirm}
                    onChangeText={(text) => setFormData({ ...formData, passwordConfirm: text })}
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setTermsAccepted(!termsAccepted)}
                  disabled={isLoading}
                >
                  <View
                    style={[
                      styles.checkbox,
                      termsAccepted && styles.checkboxChecked,
                    ]}
                  >
                    {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
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
                >
                  <View
                    style={[
                      styles.checkbox,
                      newsletter && styles.checkboxChecked,
                    ]}
                  >
                    {newsletter && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    CatPet'ten duyuru ve bilgilendirme e-postaları almak istiyorum.
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.submitButtonText}>Hesap Oluştur</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Zaten bir hesabınız var mı?</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.footerLink}>Giriş Yapın</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  section: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  sectionNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#666',
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
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
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
  hint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  checkboxContainer: {
    gap: 12,
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  checkboxLink: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#666',
  },
  footerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF7A00',
  },
})

