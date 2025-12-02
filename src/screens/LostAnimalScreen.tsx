import React, { useState, useMemo } from 'react'
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Modal } from 'react-native'
import { useAuth } from '../contexts/AuthContext'
import { useNavigation } from '@react-navigation/native'
import { useAnimals } from '../hooks/useAnimals'
import AnimalCard from '../components/AnimalCard'
import { ANIMAL_TYPE_LABELS } from '../utils/constants'
import { Ionicons } from '@expo/vector-icons'

export default function LostAnimalScreen() {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
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

  const { animals, loading, error, refetch } = useAnimals({
    type: selectedType || undefined,
    city: selectedCity || undefined,
  })

  // Filter lost animals (in a real app, this would come from backend with a flag)
  const lostAnimals = useMemo(() => {
    // For now, we'll show all animals. In production, filter by a 'isLost' flag
    return animals
  }, [animals])

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.city) {
      Alert.alert('Hata', 'Lütfen zorunlu alanları doldurun')
      return
    }
    // TODO: API call to create lost animal
    Alert.alert('Başarılı', 'Kayıp hayvan ilanı oluşturuldu')
    setShowCreateModal(false)
    setFormData({
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
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Kayıp Hayvan İlanları</Text>
          <Text style={styles.subtitle}>
            Kayıp dostlarımızı bulmak için topluluğumuzdan yardım alın. Gördüğünüz hayvanları bildirin.
          </Text>
        </View>
        {user && (
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#fff" />
            <Text style={styles.createButtonText}>Yeni İlan Oluştur</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
        <View style={styles.filters}>
          <TouchableOpacity
            style={[styles.filterButton, selectedType === '' && styles.filterButtonActive]}
            onPress={() => setSelectedType('')}
          >
            <Text style={[styles.filterButtonText, selectedType === '' && styles.filterButtonTextActive]}>
              Tümü
            </Text>
          </TouchableOpacity>
          {['cat', 'dog', 'bird', 'other'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.filterButton, selectedType === type && styles.filterButtonActive]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={[styles.filterButtonText, selectedType === type && styles.filterButtonTextActive]}>
                {ANIMAL_TYPE_LABELS[type] || type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#FF7A00" />
            <Text style={styles.loadingText}>Yükleniyor...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryButtonText}>Tekrar Dene</Text>
            </TouchableOpacity>
          </View>
        ) : lostAnimals.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Henüz kayıp ilan bulunmamaktadır.</Text>
            {user && (
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <Text style={styles.createButtonText}>İlk İlanı Oluştur</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {lostAnimals.map((animal) => (
              <AnimalCard key={animal.id} animal={animal} />
            ))}
          </View>
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowCreateModal(false)
          setFormData({
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
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Kayıp Hayvan İlanı Oluştur</Text>
            <TouchableOpacity onPress={() => setShowCreateModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalSubtitle}>
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
  header: {
    padding: 20,
    paddingBottom: 16,
  },
  headerContent: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  filtersContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  filters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  filterButtonActive: {
    backgroundColor: '#FFF7F0',
    borderColor: '#FF7A00',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  cardsContainer: {
    padding: 20,
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
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF7A00',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalSubtitle: {
    fontSize: 14,
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

