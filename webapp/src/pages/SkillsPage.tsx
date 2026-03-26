import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'react-router-dom'
import { api, Skill } from '../api'
import { Search, Filter, ChevronDown, Shield, AlertTriangle, AlertCircle, Zap } from 'lucide-react'

const riskLevelIcons = {
  low: { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10' },
  medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
  high: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10' },
  critical: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-400/10' },
}

const riskLevels = ['low', 'medium', 'high', 'critical'] as const

export default function SkillsPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)

  const { data: skillsData, isLoading, error } = useQuery({
    queryKey: ['skills', { search, category: selectedCategory, riskLevel: selectedRiskLevel }],
    queryFn: () => api.getSkills({
      search: search || undefined,
      category: selectedCategory || undefined,
      riskLevel: selectedRiskLevel || undefined,
      limit: 50,
    }),
  })

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const categories = categoriesData?.data.all || []

  const skills = skillsData?.data.skills || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Skills Explorer
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse and discover powerful AI skills for your workflows
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-card rounded-xl p-6 border border-border space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-muted border border-border rounded-lg hover:bg-muted/80 transition-all flex items-center gap-2"
          >
            <Filter className="w-5 h-5" />
            <span>Filters</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="pt-4 border-t border-border space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Risk Level</label>
                <select
                  value={selectedRiskLevel}
                  onChange={(e) => setSelectedRiskLevel(e.target.value)}
                  className="w-full px-4 py-2 bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Risk Levels</option>
                  {riskLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedCategory('')
                setSelectedRiskLevel('')
                setSearch('')
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {skillsData && (
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          <span>Found {skillsData.data.pagination.total} skills</span>
          {selectedCategory && <span>• Category: {selectedCategory}</span>}
          {selectedRiskLevel && <span>• Risk: {selectedRiskLevel}</span>}
          {search && <span>• Search: "{search}"</span>}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading skills...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 text-center">
          <p className="text-red-400">Failed to load skills. Please try again.</p>
        </div>
      )}

      {/* Skills Grid */}
      {!isLoading && !error && skills.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-xl">No skills found</p>
          <p className="mt-2">Try adjusting your filters or search query</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {skills.map((skill) => {
          const riskIcon = riskLevelIcons[skill.riskLevel]
          const RiskIcon = riskIcon.icon

          return (
            <Link
              key={skill.id}
              to={`/skills/${skill.id}`}
              className="group bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                  {skill.name}
                </h3>
                <div className={`p-2 rounded-lg ${riskIcon.bg}`}>
                  <RiskIcon className={`w-5 h-5 ${riskIcon.color}`} />
                </div>
              </div>

              <p className="text-muted-foreground line-clamp-3 mb-4">
                {skill.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                  {skill.category}
                </span>
                {skill.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>v{skill.version}</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                  View details →
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}