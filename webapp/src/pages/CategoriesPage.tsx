import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { api } from '../api'
import { Grid, ArrowRight } from 'lucide-react'

export default function CategoriesPage() {
  const { data: categoriesData, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.getCategories(),
  })

  const { data: riskLevelsData } = useQuery({
    queryKey: ['riskLevels'],
    queryFn: () => api.getRiskLevels(),
  })

  const categories = categoriesData?.data.withCounts || []
  const riskLevels = riskLevelsData?.data || []

  const categoryColors: { [key: string]: string } = {
    security: 'from-red-500 to-orange-500',
    infrastructure: 'from-blue-500 to-cyan-500',
    'data-ai': 'from-purple-500 to-pink-500',
    development: 'from-green-500 to-emerald-500',
    testing: 'from-yellow-500 to-amber-500',
    general: 'from-gray-500 to-slate-500',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Categories
        </h1>
        <p className="text-lg text-muted-foreground">
          Browse skills by category and risk level
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">{categories.reduce((sum, cat) => sum + cat.count, 0)}</div>
          <div className="text-muted-foreground mt-1">Total Skills</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">{categories.length}</div>
          <div className="text-muted-foreground mt-1">Categories</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">{riskLevels.length}</div>
          <div className="text-muted-foreground mt-1">Risk Levels</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="text-3xl font-bold text-primary">
            {categories.reduce((sum, cat) => sum + (cat.riskLevel || 0), 0)}
          </div>
          <div className="text-muted-foreground mt-1">Average/Skill</div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <Grid className="w-6 h-6 text-primary" />
          <span>All Categories</span>
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                to={`/skills?category=${category._id}`}
                className="group bg-gradient-to-br bg-muted border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg hover:shadow-primary/5 relative overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${categoryColors[category._id] || 'from-purple-500 to-pink-500'} opacity-0 group-hover:opacity-5 transition-opacity`}
                />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-semibold group-hover:text-primary transition-colors capitalize">
                      {category._id}
                    </h3>
                    <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{category.count}</div>
                  <div className="text-muted-foreground text-sm mt-1">
                    {category.count === 1 ? 'skill' : 'skills'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Risk Levels */}
      {riskLevels.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-6">Risk Levels</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {riskLevels.map((level) => {
              const riskColors: { [key: string]: string } = {
                low: 'from-green-500 to-emerald-500',
                medium: 'from-yellow-500 to-amber-500',
                high: 'from-orange-500 to-red-500',
                critical: 'from-red-500 to-pink-500',
              }

              return (
                <Link
                  key={level._id}
                  to={`/skills?riskLevel=${level._id}`}
                  className="block bg-gradient-to-br bg-muted border border-border rounded-xl p-6 hover:border-primary/50 transition-all hover:shadow-lg"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${riskColors[level._id] || 'from-gray-500 to-slate-500'} opacity-5`}
                  />
                  <div className="relative z-10">
                    <h3 className="text-xl font-semibold capitalize mb-2">
                      {level._id} Risk
                    </h3>
                    <div className="text-4xl font-bold text-primary">
                      {level.count}
                    </div>
                    <div className="text-muted-foreground text-sm mt-1">
                      {level.count === 1 ? 'skill' : 'skills'}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}