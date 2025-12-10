import { useState, useEffect } from 'react'
import { foodPointsAPI } from '../services/api'
import { FoodPoint, FoodPointFilters } from '../types/food-point.types'

export function useFoodPoints(filters?: FoodPointFilters) {
  const [foodPoints, setFoodPoints] = useState<FoodPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchFoodPoints = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await foodPointsAPI.getAll(filters?.type, filters?.city)
      
      let filtered = data
      
      if (filters?.animalType) {
        filtered = filtered.filter(
          (fp) => fp.animalType === filters.animalType || fp.animalType === 'all'
        )
      }
      
      if (filters?.isActive !== undefined) {
        filtered = filtered.filter((fp) => fp.isActive === filters.isActive)
      }
      
      if (filters?.needsFood) {
        filtered = filtered.filter((fp) => fp.needsFood)
      }
      
      setFoodPoints(filtered)
    } catch (err: any) {
      setError('Veriler yüklenirken bir hata oluştu.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFoodPoints()
  }, [filters?.type, filters?.city, filters?.animalType, filters?.isActive, filters?.needsFood])

  return { foodPoints, loading, error, refetch: fetchFoodPoints }
}

