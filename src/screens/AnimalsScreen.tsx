import React, { useState, useMemo, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useAnimals } from '../hooks/useAnimals'
import AnimalCard from '../components/AnimalCard'
import AnimalFilters from '../components/AnimalFilters'
import Pagination from '../components/Pagination'
import { ANIMAL_TYPE_LABELS } from '../utils/constants'
import { AnimalFilters as AnimalFiltersType } from '../types/animal.types'
import { useAuth } from '../contexts/AuthContext'
import { favoritesAPI } from '../services/api'

const ITEMS_PER_PAGE = 6

export default function AnimalsScreen() {
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<AnimalFiltersType>({})
  const [sortBy, setSortBy] = useState<string>('newest')
  const [showFilters, setShowFilters] = useState(false)
  const insets = useSafeAreaInsets()
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState<number[]>([])

  const { animals, loading, error, refetch } = useAnimals(filters)

  // Load favorite IDs when user is logged in
  useEffect(() => {
    const loadFavoriteIds = async () => {
      if (!user) {
        setFavoriteIds([])
        return
      }

      try {
        const token = await user.getIdToken()
        const result = await favoritesAPI.getMyFavoriteIds(token)
        setFavoriteIds(result.favoriteIds || [])
      } catch (error: any) {
        // 401 hatası kullanıcı henüz backend'de kayıtlı olmayabilir veya token geçersiz
        // Bu durumda sessizce boş array set ediyoruz
        if (error?.message?.includes('401')) {
          console.debug('Favorite IDs: User not authenticated in backend yet')
        } else {
          console.error('Error loading favorite IDs:', error)
        }
        setFavoriteIds([])
      }
    }

    loadFavoriteIds()
  }, [user])

  const filteredAndSortedAnimals = useMemo(() => {
    let result = [...animals]

    // Apply age filters
    if (filters.age && Array.isArray(filters.age) && filters.age.length > 0) {
      result = result.filter((animal) => {
        const ageRanges = filters.age as string[]
        if (ageRanges.includes('yavru') && animal.age <= 1) return true
        if (ageRanges.includes('genc') && animal.age > 1 && animal.age <= 3) return true
        if (ageRanges.includes('yetişkin') && animal.age > 3) return true
        return false
      })
    }

    // Apply gender filters
    if (filters.gender && Array.isArray(filters.gender) && filters.gender.length > 0) {
      result = result.filter((animal) => (filters.gender as string[]).includes(animal.gender))
    }

    // Sort favorites first, then apply other sorting
    result.sort((a, b) => {
      const aIsFavorite = favoriteIds.includes(a.id)
      const bIsFavorite = favoriteIds.includes(b.id)
      
      // Favorites first
      if (aIsFavorite && !bIsFavorite) return -1
      if (!aIsFavorite && bIsFavorite) return 1
      
      // Then apply other sorting
      switch (sortBy) {
        case 'newest':
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA
        case 'oldest':
          const dateAOld = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateBOld = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateAOld - dateBOld
        case 'age-asc':
          return a.age - b.age
        case 'age-desc':
          return b.age - a.age
        default:
          return 0
      }
    })

    return result
  }, [animals, filters, sortBy, favoriteIds])

  const paginatedAnimals = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredAndSortedAnimals.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredAndSortedAnimals, currentPage])

  const totalPages = Math.ceil(filteredAndSortedAnimals.length / ITEMS_PER_PAGE)

  const handleFilterChange = (newFilters: {
    type?: string
    age?: string[]
    gender?: string[]
    city?: string
  }) => {
    setFilters({
      type: newFilters.type,
      city: newFilters.city,
      age: newFilters.age as any,
      gender: newFilters.gender as any,
    } as AnimalFiltersType)
    setCurrentPage(1)
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Sıcak Bir Yuva Arayan Dostlarımız</Text>
          <Text style={styles.subtitle}>
            Hayatınızı değiştirecek o özel dostu bulmak için ilanlarımızı inceleyin.
          </Text>
        </View>
      </View>

      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.countText}>
          {filteredAndSortedAnimals.length}{' '}
          {filters.type
            ? (ANIMAL_TYPE_LABELS[filters.type as keyof typeof ANIMAL_TYPE_LABELS]?.toLowerCase() || 'hayvan')
            : 'hayvan'}{' '}
          dostumuz sıcak bir yuva arıyor
        </Text>
        <View style={styles.topBarActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filtrele</Text>
          </TouchableOpacity>
          <View style={styles.sortContainer}>
            <Text style={styles.sortLabel}>Sırala:</Text>
            <View style={styles.sortSelect}>
              <Text style={styles.sortSelectText}>
                {sortBy === 'newest' && 'En Yeni'}
                {sortBy === 'oldest' && 'En Eski'}
                {sortBy === 'age-asc' && 'Yaş (Artan)'}
                {sortBy === 'age-desc' && 'Yaş (Azalan)'}
              </Text>
            </View>
          </View>
        </View>
      </View>

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
        ) : paginatedAnimals.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>Henüz hayvan ilanı bulunmamaktadır.</Text>
          </View>
        ) : (
          <View style={styles.cardsContainer}>
            {paginatedAnimals.map((animal) => (
              <AnimalCard 
                key={animal.id} 
                animal={animal} 
                favoriteIds={favoriteIds}
                onFavoriteToggle={async () => {
                  if (user) {
                    try {
                      const token = await user.getIdToken()
                      const result = await favoritesAPI.getMyFavoriteIds(token)
                      setFavoriteIds(result.favoriteIds || [])
                    } catch (error: any) {
                      // 401 hatası sessizce handle edilir
                      if (!error?.message?.includes('401')) {
                        console.error('Error refreshing favorite IDs:', error)
                      }
                    }
                  }
                }}
              />
            ))}
          </View>
        )}

        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </ScrollView>

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
            <AnimalFilters onFilterChange={handleFilterChange} />
          </ScrollView>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={false}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <TouchableOpacity style={styles.sortModalOverlay} activeOpacity={1}>
          <View style={styles.sortModalContent}>
            {['newest', 'oldest', 'age-asc', 'age-desc'].map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortBy(option)
                  // Close modal
                }}
              >
                <Text
                  style={[
                    styles.sortOptionText,
                    sortBy === option && styles.sortOptionTextActive,
                  ]}
                >
                  {option === 'newest' && 'En Yeni İlanlar'}
                  {option === 'oldest' && 'En Eski İlanlar'}
                  {option === 'age-asc' && 'Yaşa Göre (Artan)'}
                  {option === 'age-desc' && 'Yaşa Göre (Azalan)'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  topBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  countText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  topBarActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#FF7A00',
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sortContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  sortSelect: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    backgroundColor: '#f9f9f9',
  },
  sortSelectText: {
    fontSize: 14,
    color: '#1a1a1a',
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
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
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
  modalClose: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF7A00',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sortModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    minWidth: 200,
  },
  sortOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#666',
  },
  sortOptionTextActive: {
    color: '#FF7A00',
    fontWeight: '600',
  },
})
