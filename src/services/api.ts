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

