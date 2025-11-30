import { useState, useEffect } from 'react'
import { foodPointsAPI } from '../services/api'
import { FoodPoint, FoodPointFilters } from '../types/food-point.types'

export function useFoodPoints(filters?: FoodPointFilters) {
  const [foodPoints, setFoodPoints] = useState<FoodPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFoodPoints = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await foodPointsAPI.getAll(filters?.type, filters?.city)
        setFoodPoints(data)
      } catch (err: any) {
        setError('Veriler yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFoodPoints()
  }, [filters?.type, filters?.city])

  return { foodPoints, loading, error }
}

