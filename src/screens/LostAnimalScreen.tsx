import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'

export default function LostAnimalScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    breed: '',
    age: '',
    features: '',
    city: '',
    address: '',
    date: '',
    time: '',
    phone: '',
  })

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.city) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun')
      return
    }
    // TODO: API call to create lost animal
    Alert.alert('Başarılı', 'Kayıp hayvan ilanı oluşturuldu')
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Giriş yapmanız gerekiyor</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Kayıp Hayvan İlanı Oluştur</Text>
        <Text style={styles.subtitle}>
          Kayıp dostunuzu bulmak için topluluğumuzdan yardım alın
        </Text>

        {/* Animal Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hayvan Bilgileri</Text>
          
          <Text style={styles.label}>Hayvanın Adı (varsa)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Paşa"
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
          />

          <Text style={styles.label}>Türü *</Text>
          <View style={styles.typeButtons}>
            {['Kedi', 'Köpek', 'Kuş', 'Diğer'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  formData.type === type && styles.typeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, type })}
              >
                <Text
                  style={[
                    styles.typeButtonText,
                    formData.type === type && styles.typeButtonTextActive,
                  ]}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Cinsi</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Tekir, Golden Retriever"
            value={formData.breed}
            onChangeText={(text) => setFormData({ ...formData, breed: text })}
          />

          <Text style={styles.label}>Yaşı (tahmini)</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: 2 yaşında"
            value={formData.age}
            onChangeText={(text) => setFormData({ ...formData, age: text })}
          />

          <Text style={styles.label}>Ayırt Edici Özellikler</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Örn: Sağ kulağında küçük bir çentik var, beyaz patileri..."
            multiline
            numberOfLines={4}
            value={formData.features}
            onChangeText={(text) => setFormData({ ...formData, features: text })}
          />
        </View>

        {/* Lost Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kaybolduğu Yer ve Zaman</Text>
          
          <Text style={styles.label}>Şehir *</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: İstanbul"
            value={formData.city}
            onChangeText={(text) => setFormData({ ...formData, city: text })}
          />

          <Text style={styles.label}>Adres veya Konum</Text>
          <TextInput
            style={styles.input}
            placeholder="Örn: Beşiktaş, İstanbul"
            value={formData.address}
            onChangeText={(text) => setFormData({ ...formData, address: text })}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Tarih</Text>
              <TextInput
                style={styles.input}
                placeholder="GG.AA.YYYY"
                value={formData.date}
                onChangeText={(text) => setFormData({ ...formData, date: text })}
              />
            </View>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Saat (tahmini)</Text>
              <TextInput
                style={styles.input}
                placeholder="SS:DD"
                value={formData.time}
                onChangeText={(text) => setFormData({ ...formData, time: text })}
              />
            </View>
          </View>
        </View>

        {/* Contact Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>İletişim Bilgileri</Text>
          
          <Text style={styles.label}>Telefon Numarası *</Text>
          <TextInput
            style={styles.input}
            placeholder="+90 555 123 4567"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(text) => setFormData({ ...formData, phone: text })}
          />
          <Text style={styles.hint}>
            Bu numara ilanınızda görünecektir.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>İlanı Yayınla</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    color: '#1a1a1a',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#666',
  },
  typeButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: -12,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 40,
  },
})

