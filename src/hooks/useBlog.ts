import { useState, useEffect } from 'react'
import { blogAPI } from '../services/api'
import { BlogPost, BlogFilters } from '../types/blog.types'

export function useBlog(filters?: BlogFilters) {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await blogAPI.getAll(filters?.category)
        setPosts(data)
      } catch (err: any) {
        setError('Veriler yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [filters?.category])

  return { posts, loading, error }
}

export function useBlogPost(id: string | number | null) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchPost = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await blogAPI.getById(Number(id))
        setPost(data)
      } catch (err: any) {
        setError('Blog yazısı yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  return { post, loading, error }
}

