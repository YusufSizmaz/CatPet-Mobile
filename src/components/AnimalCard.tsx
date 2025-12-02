import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, Image, TouchableOpacity, Pressable, ActivityIndicator, Alert } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Animal } from '../types/animal.types'
import { ANIMAL_TYPE_LABELS, GENDER_LABELS } from '../utils/constants'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'

interface AnimalCardProps {
  animal: Animal
  favoriteIds?: number[]
  onFavoriteToggle?: () => void
}

export default function AnimalCard({ animal, favoriteIds = [], onFavoriteToggle }: AnimalCardProps) {
  const { user } = useAuth()
  const navigation = useNavigation()
  const [isFavorite, setIsFavorite] = useState(false)
  const [loadingFavorite, setLoadingFavorite] = useState(false)

  useEffect(() => {
    setIsFavorite(favoriteIds.includes(animal.id))
  }, [favoriteIds, animal.id])

  const handleToggleFavorite = async (e: any) => {
    e.stopPropagation()
    
    if (!user) {
      Alert.alert('Giriş Gerekli', 'Favorilere eklemek için giriş yapmalısınız')
      return
    }

    setLoadingFavorite(true)
    try {
      const token = await user.getIdToken()
      await favoritesAPI.toggleFavorite(animal.id, token, !isFavorite)
      setIsFavorite(!isFavorite)
      onFavoriteToggle?.()
    } catch (error: any) {
      Alert.alert('Hata', error.message || 'Bir hata oluştu')
    } finally {
      setLoadingFavorite(false)
    }
  }

  return (
    <Pressable
      style={styles.card}
      onPress={() => navigation.navigate('AnimalDetail' as never, { id: animal.id } as never)}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{
            uri: animal.images && animal.images[0]
              ? animal.images[0]
              : 'https://via.placeholder.com/400x300',
          }}
          style={styles.image}
          resizeMode="cover"
        />
        <TouchableOpacity
          style={styles.favoriteButton}
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
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{animal.name}</Text>
            <View style={styles.location}>
              <Ionicons name="location-outline" size={12} color="#666" />
              <Text style={styles.locationText}>
                {animal.city}{animal.district ? `, ${animal.district}` : ''}
              </Text>
            </View>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {animal.breed || ANIMAL_TYPE_LABELS[animal.type] || animal.type}
            </Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Cinsiyet</Text>
            <Text style={styles.infoValue}>
              {GENDER_LABELS[animal.gender] || animal.gender}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Yaş</Text>
            <Text style={styles.infoValue}>
              {animal.age} {animal.age === 1 ? 'Yaşında' : 'Yaşında'}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Aşı</Text>
            <Text style={styles.infoValue}>
              {animal.isVaccinated ? 'Tam' : 'Eksik'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => navigation.navigate('AnimalDetail' as never, { id: animal.id } as never)}
        >
          <Text style={styles.detailButtonText}>Detayları Gör</Text>
        </TouchableOpacity>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#666',
  },
  badge: {
    backgroundColor: '#FF7A00',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    marginBottom: 12,
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  detailButton: {
    backgroundColor: '#FF7A00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  detailButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
})

