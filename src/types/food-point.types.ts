export interface FoodPoint {
  id: number
  name: string
  type: 'feeding' | 'supply'
  city: string
  address?: string
  latitude: number
  longitude: number
  needsFood?: boolean
  description?: string
  createdAt: string
  updatedAt: string
}

export interface FoodPointFilters {
  type?: string
  city?: string
  isActive?: boolean
  needsFood?: boolean
}

