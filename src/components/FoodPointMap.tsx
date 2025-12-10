import React, { useEffect, useRef, useState } from 'react'
import { View, StyleSheet, ActivityIndicator, Text, Alert } from 'react-native'
import Mapbox from '@rnmapbox/maps'
import * as Location from 'expo-location'
import Constants from 'expo-constants'
import { FoodPoint } from '../types/food-point.types'
import { Ionicons } from '@expo/vector-icons'

interface FoodPointMapProps {
  foodPoints: FoodPoint[]
  selectedPointId?: number
  selectedCity?: string
  isAuthenticated?: boolean
  onPointClick?: (point: FoodPoint) => void
  onMapClick?: (lng: number, lat: number) => void
  selectedLocation?: { lng: number; lat: number } | null
}

// Get Mapbox token from config
const MAPBOX_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken || process.env.EXPO_PUBLIC_MAPBOX_TOKEN || ''

// Set Mapbox token
Mapbox.setAccessToken(MAPBOX_TOKEN)

export default function FoodPointMap({
  foodPoints,
  selectedPointId,
  selectedCity,
  isAuthenticated = false,
  onPointClick,
  onMapClick,
  selectedLocation,
}: FoodPointMapProps) {
  const mapRef = useRef<Mapbox.MapView>(null)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(true)
  const [hasLocationPermission, setHasLocationPermission] = useState(false)

  // Request location permission and get user location
  useEffect(() => {
    const requestLocationPermission = async () => {
      try {
        // Check if permission is already granted
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync()
        
        if (existingStatus === 'granted') {
          setHasLocationPermission(true)
          await getCurrentLocation()
          return
        }

        // Request permission
        const { status } = await Location.requestForegroundPermissionsAsync()
        
        if (status !== 'granted') {
          Alert.alert(
            'Konum İzni Gerekli',
            'Mama noktalarını haritada görmek için konum iznine ihtiyacımız var. Lütfen ayarlardan konum iznini açın.',
            [{ text: 'Tamam' }]
          )
          setLocationLoading(false)
          // Default to Istanbul if permission denied
          setUserLocation({
            latitude: 41.0082,
            longitude: 28.9784,
          })
          return
        }

        setHasLocationPermission(true)
        await getCurrentLocation()
      } catch (error) {
        console.error('Konum izni hatası:', error)
        setLocationLoading(false)
        // Default to Istanbul on error
        setUserLocation({
          latitude: 41.0082,
          longitude: 28.9784,
        })
      }
    }

    const getCurrentLocation = async () => {
      try {
        setLocationLoading(true)
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        })
        
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        })

        // Center map on user location
        if (mapRef.current) {
          mapRef.current.setCamera({
            centerCoordinate: [location.coords.longitude, location.coords.latitude],
            zoomLevel: 12,
            animationDuration: 1000,
          })
        }
      } catch (error) {
        console.error('Konum alma hatası:', error)
        // Default to Istanbul if location cannot be obtained
        setUserLocation({
          latitude: 41.0082,
          longitude: 28.9784,
        })
      } finally {
        setLocationLoading(false)
      }
    }

    requestLocationPermission()
  }, [])

  // Handle map click
  const handleMapPress = (feature: any) => {
    if (onMapClick && feature.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates
      onMapClick(lng, lat)
    }
  }

  // Center map on selected location when it changes
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.setCamera({
        centerCoordinate: [selectedLocation.lng, selectedLocation.lat],
        zoomLevel: 15,
        animationDuration: 500,
      })
    }
  }, [selectedLocation])

  if (!MAPBOX_TOKEN) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <Ionicons name="map-outline" size={48} color="#999" />
          <Text style={styles.placeholderTitle}>Mapbox Token Gerekli</Text>
          <Text style={styles.placeholderSubtitle}>
            Lütfen app.json dosyasına Mapbox access token ekleyin
          </Text>
        </View>
      </View>
    )
  }

  if (locationLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholder}>
          <ActivityIndicator size="large" color="#FF7A00" />
          <Text style={styles.placeholderTitle}>Konum Alınıyor</Text>
          <Text style={styles.placeholderSubtitle}>
            Harita yükleniyor...
          </Text>
        </View>
      </View>
    )
  }

  const initialCenter = userLocation 
    ? [userLocation.longitude, userLocation.latitude] as [number, number]
    : [28.9784, 41.0082] as [number, number] // Istanbul default

  return (
    <View style={styles.container}>
      <Mapbox.MapView
        ref={mapRef}
        style={styles.map}
        styleURL={Mapbox.StyleURL.Street}
        onPress={handleMapPress}
      >
        <Mapbox.Camera
          defaultSettings={{
            centerCoordinate: initialCenter,
            zoomLevel: 12,
          }}
        />

        {/* User location marker */}
        {userLocation && (
          <Mapbox.PointAnnotation
            id="user-location"
            coordinate={[userLocation.longitude, userLocation.latitude]}
          >
            <View style={styles.userMarker}>
              <View style={styles.userMarkerInner} />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Selected location marker */}
        {selectedLocation && (
          <Mapbox.PointAnnotation
            id="selected-location"
            coordinate={[selectedLocation.lng, selectedLocation.lat]}
          >
            <View style={styles.selectedMarker}>
              <Ionicons name="location" size={32} color="#FF7A00" />
            </View>
          </Mapbox.PointAnnotation>
        )}

        {/* Food point markers */}
        {foodPoints.map((point) => {
          if (!point.latitude || !point.longitude) return null
          
          const isSelected = selectedPointId === point.id
          
          return (
            <Mapbox.PointAnnotation
              key={point.id}
              id={`food-point-${point.id}`}
              coordinate={[point.longitude, point.latitude]}
              onSelected={() => onPointClick?.(point)}
            >
              <View style={[styles.foodPointMarker, isSelected && styles.foodPointMarkerSelected]}>
                <Ionicons 
                  name={point.type === 'feeding' ? 'restaurant' : 'storefront'} 
                  size={20} 
                  color={isSelected ? '#fff' : '#FF7A00'} 
                />
              </View>
            </Mapbox.PointAnnotation>
          )
        })}
      </Mapbox.MapView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e5e5e5',
  },
  map: {
    flex: 1,
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
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  userMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4285F4',
    borderWidth: 3,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  selectedMarker: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  foodPointMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  foodPointMarkerSelected: {
    backgroundColor: '#FF7A00',
    borderColor: '#fff',
    transform: [{ scale: 1.2 }],
  },
})
