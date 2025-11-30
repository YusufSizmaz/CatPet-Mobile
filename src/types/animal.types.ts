export interface Animal {
  id: number
  name: string
  type: string
  breed?: string
  gender?: string
  age?: number
  description?: string
  city: string
  district?: string
  address?: string
  images?: string[]
  healthStatus?: string
  isSpayed?: boolean
  isVaccinated?: boolean
  characteristics?: {
    getsAlongWithHumans?: boolean
    getsAlongWithChildren?: boolean
    getsAlongWithCats?: boolean
    getsAlongWithDogs?: boolean
    isHouseTrained?: boolean
    isPlayful?: boolean
  }
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

