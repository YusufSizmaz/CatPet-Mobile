import { useState, useEffect } from 'react'
import { animalsAPI } from '../services/api'
import { Animal, AnimalFilters } from '../types/animal.types'

export function useAnimals(filters?: AnimalFilters) {
  const [animals, setAnimals] = useState<Animal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAnimals = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await animalsAPI.getAll(filters?.type, filters?.city)
        setAnimals(data)
      } catch (err: any) {
        setError('Veriler yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimals()
  }, [filters?.type, filters?.city])

  const refetch = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await animalsAPI.getAll(filters?.type, filters?.city)
      setAnimals(data)
    } catch (err: any) {
      setError('Veriler yüklenirken bir hata oluştu.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  return { animals, loading, error, refetch }
}

export function useAnimal(id: string | number | null) {
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchAnimal = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await animalsAPI.getById(Number(id))
        setAnimal(data)
      } catch (err: any) {
        setError('Hayvan bilgileri yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnimal()
  }, [id])

  return { animal, loading, error }
}

