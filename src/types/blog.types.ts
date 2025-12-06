export interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  authorId: number
  author?: string | {
    id: number
    firstName?: string
    lastName?: string
    profilePhoto?: string | null
    showGooglePhoto?: boolean
    userSettings?: {
      showGooglePhoto?: boolean
    }
  }
  authorPhoto?: string
  coverImage?: string
  excerpt?: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface BlogFilters {
  category?: string
  page?: number
  limit?: number
}

