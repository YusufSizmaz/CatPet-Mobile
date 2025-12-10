import React, { useEffect, useRef } from 'react'
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { FoodPoint } from '../types/food-point.types'

interface FoodPointMapProps {
  foodPoints: FoodPoint[]
  selectedPointId?: number
  selectedCity?: string
  isAuthenticated?: boolean
  onPointClick?: (point: FoodPoint) => void
  onMapClick?: (lng: number, lat: number) => void
  selectedLocation?: { lng: number; lat: number } | null
}

export default function FoodPointMap({
  foodPoints,
  selectedPointId,
  selectedCity,
  isAuthenticated = false,
  onPointClick,
  onMapClick,
  selectedLocation,
}: FoodPointMapProps) {
  const mapRef = useRef<any>(null)

  // For now, show a placeholder
  // Mapbox GL JS integration will be added later
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <ActivityIndicator size="large" color="#FF7A00" />
        <View style={styles.placeholderText}>
          <Text style={styles.placeholderTitle}>Harita Yükleniyor</Text>
          <Text style={styles.placeholderSubtitle}>
            Mapbox entegrasyonu yakında eklenecek
          </Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  placeholderText: {
    marginTop: 20,
    alignItems: 'center',
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
})

