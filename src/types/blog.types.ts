export interface BlogPost {
  id: number
  title: string
  content: string
  category: string
  authorId: number
  author?: {
    id: number
    firstName?: string
    lastName?: string
  }
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface BlogFilters {
  category?: string
  page?: number
  limit?: number
}

