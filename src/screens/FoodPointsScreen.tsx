import React, { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert, Picker } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFoodPoints } from '../hooks/useFoodPoints'
import { FoodPoint } from '../types/food-point.types'
import { FOOD_POINT_TYPE_LABELS } from '../utils/constants'
import { Ionicons } from '@expo/vector-icons'
import FoodPointMap from '../components/FoodPointMap'
import { useAuth } from '../contexts/AuthContext'
import { foodPointsAPI } from '../services/api'
import { TURKEY_CITIES } from '../utils/turkeyCities'

export default function FoodPointsScreen() {
  const { user } = useAuth()
  const insets = useSafeAreaInsets()
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedAnimalType, setSelectedAnimalType] = useState<string>('')
  const [showActiveOnly, setShowActiveOnly] = useState(true)
  const [showNeedsFood, setShowNeedsFood] = useState(false)
  const [selectedPointId, setSelectedPointId] = useState<number | undefined>()
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCity, setSelectedCity] = useState<string>('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'feeding' as 'feeding' | 'supply',
    address: '',
    city: '',
    animalType: 'all' as 'all' | 'cat' | 'dog',
  })
  const [submitting, setSubmitting] = useState(false)

  const { foodPoints, loading, error } = useFoodPoints({
    type: selectedType ? (selectedType as 'feeding' | 'supply') : undefined,
    city: selectedCity || undefined,
    isActive: showActiveOnly ? true : undefined,
    needsFood: showNeedsFood ? true : undefined,
  })

  return (
    <View style={styles.container}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <FoodPointMap
          foodPoints={foodPoints}
          selectedPointId={selectedPointId}
          selectedCity={selectedCity}
          isAuthenticated={!!user}
          onPointClick={(point) => setSelectedPointId(point.id)}
          onMapClick={(lng, lat) => {
            if (!user) {
              Alert.alert('Giriş Gerekli', 'Konum seçmek için lütfen giriş yapın.')
              return
            }
            setSelectedLocation({ lat, lng })
            setSelectedPointId(undefined)
          }}
          selectedLocation={selectedLocation}
        />
      </View>

      {/* Floating Filter Button */}
      <TouchableOpacity
        style={[styles.filterFloatingButton, { top: Math.max(insets.top, 20) }]}
        onPress={() => setShowFilters(true)}
      >
        <Ionicons name="options-outline" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { paddingBottom: Math.max(insets.bottom, 0) }]}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>Mama Noktaları</Text>
          <Text style={styles.bottomSheetSubtitle}>
            {foodPoints.length} nokta bulundu
          </Text>
        </View>
        <ScrollView style={styles.pointsList} showsVerticalScrollIndicator={false}>
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#FF7A00" />
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : foodPoints.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Mama noktası bulunamadı.</Text>
            </View>
          ) : (
            foodPoints.map((point) => (
              <FoodPointCard
                key={point.id}
                point={point}
                isSelected={selectedPointId === point.id}
                onPress={() => setSelectedPointId(point.id)}
              />
            ))
          )}
        </ScrollView>
        <View style={styles.bottomSheetFooter}>
          {!user ? (
            <>
              <TouchableOpacity
                style={[styles.addButton, styles.addButtonDisabled]}
                onPress={() => {
                  Alert.alert('Giriş Gerekli', 'Yeni nokta eklemek için lütfen giriş yapın.')
                }}
              >
                <Ionicons name="lock-closed-outline" size={20} color="#999" />
                <Text style={styles.addButtonTextDisabled}>Giriş Yaparak Nokta Ekle</Text>
              </TouchableOpacity>
              <Text style={styles.footerHint}>
                Yeni nokta eklemek için giriş yapmanız gerekmektedir
              </Text>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.addButton, !selectedLocation && styles.addButtonDisabled]}
                onPress={() => {
                  if (!selectedLocation) {
                    Alert.alert('Konum Seçin', 'Lütfen önce haritada bir konum seçin.')
                    return
                  }
                  setShowAddModal(true)
                }}
                disabled={!selectedLocation}
              >
                <Ionicons name="add-circle-outline" size={20} color={selectedLocation ? "#fff" : "#999"} />
                <Text style={[styles.addButtonText, !selectedLocation && styles.addButtonTextDisabled]}>
                  Yeni Nokta Ekle
                </Text>
              </TouchableOpacity>
              {!selectedLocation && (
                <Text style={styles.footerHint}>
                  Önce haritada bir konum seçin
                </Text>
              )}
            </>
          )}
        </View>
      </View>

      {/* Add Food Point Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false)
          setFormData({
            name: '',
            type: 'feeding',
            address: '',
            city: '',
            animalType: 'all',
          })
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Yeni Mama Noktası Ekle</Text>
            <TouchableOpacity onPress={() => {
              setShowAddModal(false)
              setFormData({
                name: '',
                type: 'feeding',
                address: '',
                city: '',
                animalType: 'all',
              })
            }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nokta Adı *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Örn: Park Besleme Noktası"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Nokta Türü *</Text>
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Besleme Noktası" value="feeding" />
                  <Picker.Item label="Mama Temin Noktası" value="supply" />
                </Picker>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Şehir *</Text>
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Şehir Seçin" value="" />
                  {TURKEY_CITIES.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Adres</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Detaylı adres bilgisi"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Hayvan Türü</Text>
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={formData.animalType}
                  onValueChange={(value) => setFormData({ ...formData, animalType: value })}
                  style={styles.picker}
                >
                  <Picker.Item label="Tümü" value="all" />
                  <Picker.Item label="Kedi" value="cat" />
                  <Picker.Item label="Köpek" value="dog" />
                </Picker>
              </View>
            </View>

            {selectedLocation && (
              <View style={styles.formSection}>
                <Text style={styles.formLabel}>Seçilen Konum</Text>
                <Text style={styles.locationText}>
                  Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={async () => {
                if (!formData.name || !formData.city || !selectedLocation) {
                  Alert.alert('Eksik Bilgi', 'Lütfen tüm zorunlu alanları doldurun.')
                  return
                }

                if (!user) {
                  Alert.alert('Giriş Gerekli', 'Yeni nokta eklemek için lütfen giriş yapın.')
                  return
                }

                setSubmitting(true)
                try {
                  const idToken = await user.getIdToken()
                  await foodPointsAPI.create({
                    name: formData.name,
                    type: formData.type,
                    latitude: selectedLocation.lat,
                    longitude: selectedLocation.lng,
                    address: formData.address,
                    city: formData.city,
                    animalType: formData.animalType,
                    isActive: true,
                    needsFood: false,
                  }, idToken)

                  Alert.alert('Başarılı', 'Mama noktası başarıyla eklendi!')
                  setShowAddModal(false)
                  setFormData({
                    name: '',
                    type: 'feeding',
                    address: '',
                    city: '',
                    animalType: 'all',
                  })
                  setSelectedLocation(null)
                } catch (error: any) {
                  Alert.alert('Hata', error.message || 'Nokta eklenirken bir hata oluştu.')
                } finally {
                  setSubmitting(false)
                }
              }}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Kaydet</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Filters Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrele</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Text style={styles.modalClose}>Kapat</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            {/* City Selection */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Şehir</Text>
              <View style={styles.selectContainer}>
                <Picker
                  selectedValue={selectedCity}
                  onValueChange={(value) => setSelectedCity(value)}
                  style={styles.picker}
                >
                  <Picker.Item label="Tüm Şehirler" value="" />
                  {TURKEY_CITIES.map((city) => (
                    <Picker.Item key={city} label={city} value={city} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Animal Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Hayvan Türü</Text>
              <View style={styles.animalTypeGrid}>
                {[
                  { value: '', label: 'Tümü', icon: 'pets' },
                  { value: 'cat', label: 'Kedi', icon: 'paw' },
                  { value: 'dog', label: 'Köpek', icon: 'paw' },
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.animalTypeButton,
                      selectedAnimalType === type.value && styles.animalTypeButtonActive,
                    ]}
                    onPress={() => setSelectedAnimalType(type.value)}
                  >
                    <Ionicons
                      name={type.icon as any}
                      size={24}
                      color={selectedAnimalType === type.value ? '#FF7A00' : '#666'}
                    />
                    <Text
                      style={[
                        styles.animalTypeButtonText,
                        selectedAnimalType === type.value && styles.animalTypeButtonTextActive,
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Point Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Nokta Türü</Text>
              <View style={styles.selectContainer}>
                <Text style={styles.selectLabel}>
                  {selectedType
                    ? FOOD_POINT_TYPE_LABELS[selectedType]
                    : 'Tüm Nokta Türleri'}
                </Text>
                <Ionicons name="chevron-down-outline" size={20} color="#666" />
              </View>
              <View style={styles.selectOptions}>
                {[
                  { value: '', label: 'Tüm Nokta Türleri' },
                  { value: 'feeding', label: 'Besleme Noktası' },
                  { value: 'supply', label: 'Mama Temin Noktası' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={styles.selectOption}
                    onPress={() => setSelectedType(option.value)}
                  >
                    <Text
                      style={[
                        styles.selectOptionText,
                        selectedType === option.value && styles.selectOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {selectedType === option.value && (
                      <Ionicons name="checkmark" size={20} color="#FF7A00" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Durum</Text>
              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setShowActiveOnly(!showActiveOnly)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      showActiveOnly && styles.checkboxChecked,
                    ]}
                  >
                    {showActiveOnly && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Aktif</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.checkboxRow}
                  onPress={() => setShowNeedsFood(!showNeedsFood)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      showNeedsFood && styles.checkboxChecked,
                    ]}
                  >
                    {showNeedsFood && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <Text style={styles.checkboxLabel}>Mama Gerekli</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  )
}

function FoodPointCard({
  point,
  isSelected,
  onPress,
}: {
  point: FoodPoint
  isSelected: boolean
  onPress: () => void
}) {
  return (
    <TouchableOpacity
      style={[styles.pointCard, isSelected && styles.pointCardSelected]}
      onPress={onPress}
    >
      <View style={styles.pointCardHeader}>
        <View style={styles.pointCardTitleContainer}>
          <Text style={styles.pointCardTitle}>{point.name}</Text>
          <View style={styles.pointCardBadge}>
            <Text style={styles.pointCardBadgeText}>
              {FOOD_POINT_TYPE_LABELS[point.type]}
            </Text>
          </View>
        </View>
        {point.needsFood && (
          <View style={styles.needsFoodBadge}>
            <Ionicons name="warning-outline" size={16} color="#ef4444" />
            <Text style={styles.needsFoodText}>Mama Gerekli</Text>
          </View>
        )}
      </View>
      <View style={styles.pointCardLocation}>
        <Ionicons name="location-outline" size={14} color="#666" />
        <Text style={styles.pointCardLocationText}>
          {point.address || point.city}
        </Text>
      </View>
      {point.description && (
        <Text style={styles.pointCardDescription} numberOfLines={2}>
          {point.description}
        </Text>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
  },
  filterFloatingButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomSheetHeader: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bottomSheetSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  pointsList: {
    flex: 1,
    padding: 20,
  },
  pointCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  pointCardSelected: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7F0',
  },
  pointCardHeader: {
    marginBottom: 8,
  },
  pointCardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pointCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    flex: 1,
  },
  pointCardBadge: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  pointCardBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  needsFoodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  needsFoodText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ef4444',
  },
  pointCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  pointCardLocationText: {
    fontSize: 12,
    color: '#666',
  },
  pointCardDescription: {
    fontSize: 12,
    color: '#999',
    lineHeight: 16,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#ef4444',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
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
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7A00',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
  },
  animalTypeGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  animalTypeButton: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  animalTypeButtonActive: {
    borderColor: '#FF7A00',
    backgroundColor: '#FFF7F0',
  },
  animalTypeButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginTop: 4,
  },
  animalTypeButtonTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  selectLabel: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  selectOptions: {
    gap: 8,
  },
  selectOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#666',
  },
  selectOptionTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
  checkboxContainer: {
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
  bottomSheetFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF7A00',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonTextDisabled: {
    color: '#999',
  },
  footerHint: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  picker: {
    width: '100%',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  locationText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  submitButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
})
