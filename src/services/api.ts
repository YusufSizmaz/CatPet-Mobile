import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import Constants from 'expo-constants'

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3002'

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from AsyncStorage if needed
    // const token = await AsyncStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// API Helper Functions
async function fetchAPI<T>(endpoint: string, options?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosInstance.request<T>({
      url: endpoint,
      ...options,
    })
    return response.data
  } catch (error: any) {
    if (error.response) {
      // Server responded with error status
      throw new Error(`API Error: ${error.response.status} ${error.response.statusText}`)
    } else if (error.request) {
      // Request made but no response received
      throw new Error('API Error: No response received from server')
    } else {
      // Something else happened
      throw new Error(`API Error: ${error.message}`)
    }
  }
}

// Animals API
export const animalsAPI = {
  getAll: (type?: string, city?: string) => {
    return fetchAPI<any[]>('/animals', {
      method: 'GET',
      params: {
        ...(type && { type }),
        ...(city && { city }),
      },
    })
  },
  
  getById: (id: number) => fetchAPI<any>(`/animals/${id}`, { method: 'GET' }),
  
  create: (data: any) => fetchAPI<any>('/animals', {
    method: 'POST',
    data,
  }),
  
  update: (id: number, data: any) => fetchAPI<any>(`/animals/${id}`, {
    method: 'PUT',
    data,
  }),
  
  delete: (id: number) => fetchAPI<void>(`/animals/${id}`, {
    method: 'DELETE',
  }),
}

// Blog API
export const blogAPI = {
  getAll: (category?: string) => {
    return fetchAPI<any[]>('/blog', {
      method: 'GET',
      params: {
        ...(category && { category }),
      },
    })
  },
  
  getById: (id: number) => fetchAPI<any>(`/blog/${id}`, { method: 'GET' }),
  
  create: (data: any) => fetchAPI<any>('/blog', {
    method: 'POST',
    data,
  }),
  
  update: (id: number, data: any) => fetchAPI<any>(`/blog/${id}`, {
    method: 'PUT',
    data,
  }),
  
  delete: (id: number) => fetchAPI<void>(`/blog/${id}`, {
    method: 'DELETE',
  }),
}

// Food Points API
export const foodPointsAPI = {
  getAll: (type?: string, city?: string) => {
    return fetchAPI<any[]>('/food-points', {
      method: 'GET',
      params: {
        ...(type && { type }),
        ...(city && { city }),
      },
    })
  },
  
  getById: (id: number) => fetchAPI<any>(`/food-points/${id}`, { method: 'GET' }),
  
  create: (data: any) => fetchAPI<any>('/food-points', {
    method: 'POST',
    data,
  }),
  
  update: (id: number, data: any) => fetchAPI<any>(`/food-points/${id}`, {
    method: 'PUT',
    data,
  }),
  
  delete: (id: number) => fetchAPI<void>(`/food-points/${id}`, {
    method: 'DELETE',
  }),
}

// Auth API
export const authAPI = {
  verifyToken: (token: string) => fetchAPI<any>('/auth/verify', {
    method: 'POST',
    data: { token },
  }),
  
  getCurrentUser: async (idToken: string) => {
    try {
      const result = await fetchAPI<any>('/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      })
      return result
    } catch (error: any) {
      console.error('❌ [API] getCurrentUser hatası:', error.message)
      throw error
    }
  },
}

// Users API
export const usersAPI = {
  getAll: () => fetchAPI<any[]>('/users', { method: 'GET' }),
  
  getById: (id: number) => fetchAPI<any>(`/users/${id}`, { method: 'GET' }),
  
  create: (data: any) => fetchAPI<any>('/users', {
    method: 'POST',
    data,
  }),
  
  update: (id: number, data: any, token?: string) => fetchAPI<any>(`/users/${id}`, {
    method: 'PUT',
    data,
    headers: token ? {
      'Authorization': `Bearer ${token}`,
    } : undefined,
  }),
}

// User Settings API
export const userSettingsAPI = {
  getByUserId: (userId: number) => fetchAPI<any>(`/user-settings/user/${userId}`, { method: 'GET' }),
  
  updateByUserId: (userId: number, data: { showGooglePhoto?: boolean; useNickname?: boolean }) => 
    fetchAPI<any>(`/user-settings/user/${userId}`, {
      method: 'PUT',
      data,
    }),
  
  update: (id: number, data: { showGooglePhoto?: boolean; useNickname?: boolean }) => 
    fetchAPI<any>(`/user-settings/${id}`, {
      method: 'PUT',
      data,
    }),
}

// Favorites API
export const favoritesAPI = {
  toggleFavorite: async (animalId: number, token: string, isFavorite?: boolean) => {
    return fetchAPI<any>('/favorites/toggle', {
      method: 'POST',
      data: { animalId, isFavorite },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  getMyFavorites: async (token: string) => {
    return fetchAPI<any[]>('/favorites/my-favorites', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  checkFavorite: async (animalId: number, token: string) => {
    return fetchAPI<{ isFavorite: boolean }>(`/favorites/check/${animalId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  getMyFavoriteIds: async (token: string) => {
    return fetchAPI<{ favoriteIds: number[] }>('/favorites/my-favorite-ids', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

// Forum API
export const forumAPI = {
  getAllTopics: (blogId?: number, page?: number, limit?: number) => {
    const params: any = {}
    if (blogId) params.blogId = blogId
    if (page) params.page = page
    if (limit) params.limit = limit
    return fetchAPI<any[]>('/forum/topics', {
      method: 'GET',
      params,
    })
  },
  
  getTopicById: (id: number) => fetchAPI<any>(`/forum/topics/${id}`, { method: 'GET' }),
  
  createTopic: async (data: { title: string; content: string; blogId?: number }, token: string) => {
    return fetchAPI<any>('/forum/topics', {
      method: 'POST',
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  getComments: (topicId: number) => fetchAPI<any[]>(`/forum/topics/${topicId}/comments`, { method: 'GET' }),
  
  createComment: async (data: { forumId: number; content: string }, token: string) => {
    return fetchAPI<any>('/forum/comments', {
      method: 'POST',
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  updateComment: async (id: number, data: { content: string }, token: string) => {
    return fetchAPI<any>(`/forum/comments/${id}`, {
      method: 'PUT',
      data,
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  deleteComment: async (id: number, token: string) => {
    return fetchAPI<void>(`/forum/comments/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  
  getPopularTopics: (limit?: number) => {
    const params: any = {}
    if (limit) params.limit = limit
    return fetchAPI<any[]>('/forum/topics/popular', {
      method: 'GET',
      params,
    })
  },
  
  getActiveUsers: (limit?: number) => {
    const params: any = {}
    if (limit) params.limit = limit
    return fetchAPI<any[]>('/forum/users/active', {
      method: 'GET',
      params,
    })
  },
}

// Animals API - Additional endpoints
export const animalsAPIExtended = {
  ...animalsAPI,
  getOwnerPhone: async (id: number, token: string) => {
    return fetchAPI<any>(`/animals/${id}/owner-phone`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  findByOwnerId: async (ownerId: number, token: string) => {
    return fetchAPI<any[]>(`/animals/owner/${ownerId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
  updateStatus: async (id: number, isActive: boolean, token: string) => {
    return fetchAPI<any>(`/animals/${id}/status`, {
      method: 'PUT',
      data: { isActive },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    })
  },
}

