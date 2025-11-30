export interface User {
  id: number
  firstName?: string
  lastName?: string
  email: string
  fireBaseUUID?: string
  profilePhoto?: string
  verify: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

