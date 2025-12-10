import { useState, useEffect } from 'react'
import { forumAPI } from '../services/api'

export interface ForumTopic {
  id: number
  title: string
  content: string
  blogId?: number
  createdUserId: number
  createdUser?: {
    id: number
    firstName?: string
    lastName?: string
    profilePhoto?: string
  }
  blog?: {
    id: number
    title: string
  }
  views: number
  commentCount?: number
  comments?: any[]
  createdAt: string
  updatedAt: string
}

export function useForumTopics(blogId?: number) {
  const [topics, setTopics] = useState<ForumTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await forumAPI.getAllTopics(blogId)
        setTopics(data)
      } catch (err: any) {
        setError('Forum konuları yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopics()
  }, [blogId])

  return { topics, loading, error, refetch: () => fetchTopics() }
}

export function useForumTopic(id: number | string | null) {
  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }

    const fetchTopic = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await forumAPI.getTopicById(Number(id))
        setTopic(data)
      } catch (err: any) {
        setError('Forum konusu yüklenirken bir hata oluştu.')
        console.error('Error:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchTopic()
  }, [id])

  return { topic, loading, error }
}



