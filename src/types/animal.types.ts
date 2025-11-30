export interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  gender?: string
  age?: number
  description?: string
  city: string
  address?: string
  images?: string[]
  healthStatus?: string
  ownerId: number
  owner?: {
    id: number
    firstName?: string
    lastName?: string
    profilePhoto?: string
  }
  createdAt: string
  updatedAt: string
}

export interface AnimalFilters {
  type?: string
  city?: string
  page?: number
  limit?: number
}

