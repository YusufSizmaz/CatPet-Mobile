import React, { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { ANIMAL_TYPE_LABELS } from '../utils/constants'

const ANIMAL_TYPES = [
  { value: 'cat', emoji: '🐱', label: 'Kedi' },
  { value: 'dog', emoji: '🐶', label: 'Köpek' },
  { value: 'rabbit', emoji: '🐰', label: 'Tavşan' },
  { value: 'bird', emoji: '🐦', label: 'Kuş' },
  { value: 'hamster', emoji: '🐹', label: 'Hamster' },
  { value: 'other', emoji: '🐾', label: 'Diğer' },
]

const AGE_RANGES = [
  { value: 'yavru', label: 'Yavru (0-1 Yaş)' },
  { value: 'genc', label: 'Genç (1-3 Yaş)' },
  { value: 'yetişkin', label: 'Yetişkin (3+ Yaş)' },
]

const GENDERS = [
  { value: 'female', label: 'Dişi' },
  { value: 'male', label: 'Erkek' },
]

const CITIES = ['Tüm Şehirler', 'İstanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya']

interface AnimalFiltersProps {
  onFilterChange?: (filters: {
    type?: string
    age?: string[]
    gender?: string[]
    city?: string
  }) => void
}

export default function AnimalFilters({ onFilterChange }: AnimalFiltersProps) {
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedAges, setSelectedAges] = useState<string[]>([])
  const [selectedGenders, setSelectedGenders] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState<string>('')

  const handleTypeClick = (type: string) => {
    const newType = selectedType === type ? '' : type
    setSelectedType(newType)
    updateFilters(newType, selectedAges, selectedGenders, selectedCity)
  }

  const handleAgeToggle = (age: string) => {
    const newAges = selectedAges.includes(age)
      ? selectedAges.filter(a => a !== age)
      : [...selectedAges, age]
    setSelectedAges(newAges)
    updateFilters(selectedType, newAges, selectedGenders, selectedCity)
  }

  const handleGenderToggle = (gender: string) => {
    const newGenders = selectedGenders.includes(gender)
      ? selectedGenders.filter(g => g !== gender)
      : [...selectedGenders, gender]
    setSelectedGenders(newGenders)
    updateFilters(selectedType, selectedAges, newGenders, selectedCity)
  }

  const handleCityChange = (city: string) => {
    const newCity = city === 'Tüm Şehirler' ? '' : city
    setSelectedCity(newCity)
    updateFilters(selectedType, selectedAges, selectedGenders, newCity)
  }

  const updateFilters = (type: string, ages: string[], genders: string[], city: string) => {
    onFilterChange?.({
      type: type || undefined,
      age: ages.length > 0 ? ages : undefined,
      gender: genders.length > 0 ? genders : undefined,
      city: city || undefined,
    })
  }

  const clearFilters = () => {
    setSelectedType('')
    setSelectedAges([])
    setSelectedGenders([])
    setSelectedCity('')
    updateFilters('', [], [], '')
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Filtrele</Text>
        <TouchableOpacity onPress={clearFilters}>
          <Text style={styles.clearButton}>Temizle</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Animal Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hayvan Türü</Text>
          <View style={styles.typeGrid}>
            {ANIMAL_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeButton,
                  selectedType === type.value && styles.typeButtonActive,
                ]}
                onPress={() => handleTypeClick(type.value)}
              >
                {type.emoji && <Text style={styles.typeEmoji}>{type.emoji}</Text>}
                <Text
                  style={[
                    styles.typeButtonText,
                    selectedType === type.value && styles.typeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Age */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yaş</Text>
          {AGE_RANGES.map((age) => (
            <TouchableOpacity
              key={age.value}
              style={styles.checkboxRow}
              onPress={() => handleAgeToggle(age.value)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedAges.includes(age.value) && styles.checkboxChecked,
                ]}
              >
                {selectedAges.includes(age.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{age.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gender */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cinsiyet</Text>
          {GENDERS.map((gender) => (
            <TouchableOpacity
              key={gender.value}
              style={styles.checkboxRow}
              onPress={() => handleGenderToggle(gender.value)}
            >
              <View
                style={[
                  styles.checkbox,
                  selectedGenders.includes(gender.value) && styles.checkboxChecked,
                ]}
              >
                {selectedGenders.includes(gender.value) && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </View>
              <Text style={styles.checkboxLabel}>{gender.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* City */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Konum</Text>
          <View style={styles.cityContainer}>
            {CITIES.map((city) => (
              <TouchableOpacity
                key={city}
                style={[
                  styles.cityButton,
                  (selectedCity === city || (city === 'Tüm Şehirler' && !selectedCity)) &&
                    styles.cityButtonActive,
                ]}
                onPress={() => handleCityChange(city)}
              >
                <Text
                  style={[
                    styles.cityButtonText,
                    (selectedCity === city || (city === 'Tüm Şehirler' && !selectedCity)) &&
                      styles.cityButtonTextActive,
                  ]}
                >
                  {city}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FF7A00',
  },
  scrollView: {
    maxHeight: 500,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    width: '30%',
    minWidth: 88,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  typeButtonActive: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7F0',
  },
  typeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
  },
  typeButtonTextActive: {
    fontWeight: '600',
    color: '#FF7A00',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    marginRight: 12,
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
    fontSize: 14,
    color: '#1a1a1a',
  },
  cityContainer: {
    gap: 8,
  },
  cityButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  cityButtonActive: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7F0',
  },
  cityButtonText: {
    fontSize: 14,
    color: '#666',
  },
  cityButtonTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
})

