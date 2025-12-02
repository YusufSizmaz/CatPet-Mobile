export interface FoodPoint {
  id: number
  name: string
  type: 'feeding' | 'supply'
  city: string
  address?: string
  latitude: number
  longitude: number
  animalType?: 'cat' | 'dog' | 'all'
  isActive?: boolean
  needsFood?: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FoodPointFilters {
  type?: 'feeding' | 'supply'
  city?: string
  animalType?: 'cat' | 'dog' | 'all'
  isActive?: boolean
  needsFood?: boolean
}

