interface Skill {
  id: string
  name: string
  description: string
  category: string
  tags: string[]
  version: string
  author: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  capabilities: string[]
  dependencies: string[]
  parameters: any[]
  examples: string[]
  documentation: string
}

interface Pagination {
  total: number
  limit: number
  offset: number
  hasMore: boolean
}

interface SkillsResponse {
  success: boolean
  data: {
    skills: Skill[]
    pagination: Pagination
  }
  query: any
  timestamp: string
}

interface SkillDetailResponse {
  success: boolean
  data: Skill
  timestamp: string
}

interface CategoriesResponse {
  success: boolean
  data: {
    all: string[]
    withCounts: Array<{ _id: string; count: number }>
  }
  timestamp: string
}

interface RiskLevelsResponse {
  success: boolean
  data: Array<{ _id: string; count: number }>
  timestamp: string
}

const API_BASE = '/api/v1'

export const api = {
  // Get all skills with filters
  getSkills: async (params?: {
    category?: string
    riskLevel?: string
    tags?: string[]
    search?: string
    limit?: number
    offset?: number
  }): Promise<SkillsResponse> => {
    const searchParams = new URLSearchParams()
    if (params?.category) searchParams.set('category', params.category)
    if (params?.riskLevel) searchParams.set('riskLevel', params.riskLevel)
    if (params?.tags) searchParams.set('tags', params.tags.join(','))
    if (params?.search) searchParams.set('search', params.search)
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.offset) searchParams.set('offset', params.offset.toString())

    const response = await fetch(`${API_BASE}/skills?${searchParams}`)
    if (!response.ok) throw new Error('Failed to fetch skills')
    return response.json()
  },

  // Get skill by ID
  getSkill: async (id: string): Promise<SkillDetailResponse> => {
    const response = await fetch(`${API_BASE}/skills/${id}`)
    if (!response.ok) throw new Error('Failed to fetch skill')
    return response.json()
  },

  // Get categories
  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await fetch(`${API_BASE}/skills/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  // Get risk levels
  getRiskLevels: async (): Promise<RiskLevelsResponse> => {
    const response = await fetch(`${API_BASE}/skills/risk-levels`)
    if (!response.ok) throw new Error('Failed to fetch risk levels')
    return response.json()
  },
}

export type { Skill, Pagination }