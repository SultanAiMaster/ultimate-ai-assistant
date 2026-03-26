import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api'
import { Shield, AlertTriangle, AlertCircle, Zap, ArrowLeft, ExternalLink, Download, Play, Copy, CheckCircle, Code, AlertOctagon } from 'lucide-react'

const riskLevelIcons = {
  low: { icon: Shield, color: 'text-green-400', bg: 'bg-green-400/10', label: 'Low Risk' },
  medium: { icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-400/10', label: 'Medium Risk' },
  high: { icon: AlertTriangle, color: 'text-orange-400', bg: 'bg-orange-400/10', label: 'High Risk' },
  critical: { icon: AlertOctagon, color: 'text-red-400', bg: 'bg-red-400/10', label: 'Critical Risk' },
}

export default function SkillDetailPage() {
  const { id } = useParams<{ id: string }>()

  const { data: skillData, isLoading, error } = useQuery({
    queryKey: ['skill', id],
    queryFn: () => api.getSkill(id!),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading skill details...</p>
        </div>
      </div>
    )
  }

  if (error || !skillData) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-400 mb-2">Skill Not Found</h2>
        <p className="text-muted-foreground">The skill you're looking for doesn't exist.</p>
      </div>
    )
  }

  const skill = skillData.data
  const riskIcon = riskLevelIcons[skill.riskLevel]
  const RiskIcon = riskIcon.icon

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <a
        href="/skills"
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Skills</span>
      </a>

      {/* Header */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold">{skill.name}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskIcon.bg} ${riskIcon.color}`}>
                <RiskIcon className="w-4 h-4 inline mr-1" />
                {riskIcon.label}
              </span>
            </div>
            <p className="text-xl text-muted-foreground">{skill.description}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`https://github.com/search?q=${skill.name}`, '_blank')}
              className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg flex items-center gap-2 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>GitHub</span>
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Code className="w-4 h-4" />
            <span>v{skill.version}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle className="w-4 h-4" />
            <span>{skill.category}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>Author: {skill.author}</span>
          </div>
        </div>

        {/* Tags */}
        {skill.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skill.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-muted text-muted-foreground text-sm rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Capabilities */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6 text-primary" />
          <span>Capabilities</span>
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {skill.capabilities.map((capability, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-muted-foreground"
            >
              <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <span>{capability}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Examples */}
      {skill.examples.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" />
            <span>Examples</span>
          </h2>
          <div className="space-y-4">
            {skill.examples.map((example, idx) => (
              <div
                key={idx}
                className="bg-muted rounded-lg p-4 border border-border"
              >
                <pre className="whitespace-pre-wrap text-sm text-foreground">
                  {example}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dependencies */}
      {skill.dependencies.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
          <div className="flex flex-wrap gap-2">
            {skill.dependencies.map((dep) => (
              <span
                key={dep}
                className="px-3 py-1 bg-muted text-sm rounded-lg font-mono"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Documentation */}
      {skill.documentation && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <Download className="w-6 h-6 text-primary" />
            <span>Documentation</span>
          </h2>
          <div className="prose prose-invert max-w-none">
            <div
              className="text-muted-foreground whitespace-pre-wrap"
              dangerouslySetInnerHTML={{
                __html: skill.documentation
                  .replace(/```[\s\S]*?```/g, (match) => {
                    const code = match.replace(/```\w?\n?/g, '')
                    return `<pre class="bg-muted p-4 rounded-lg my-4 overflow-x-auto"><code class="text-sm">${code}</code></pre>`
                  })
                  .replace(/`([^`]+)`/g, '<code class="bg-muted px-1 rounded">$1</code>')
                  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                  .replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>')
                  .replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
                  .replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-8 mb-4">$1</h1>')
                  .replace(/^- (.+)$/gm, '<li class="ml-4">$1</li>'),
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}