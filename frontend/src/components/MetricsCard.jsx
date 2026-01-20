import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

function MetricsCard({ title, value, unit, icon: Icon, trend, subtitle, color = 'blue' }) {
  const colorClasses = {
    blue: 'text-garmin-blue',
    green: 'text-garmin-success',
    yellow: 'text-garmin-warning',
    red: 'text-garmin-danger'
  }

  const TrendIcon = trend === 'up' ? TrendingUp :
                    trend === 'down' ? TrendingDown : Minus

  const trendClass = trend === 'up' ? 'trend-up' :
                     trend === 'down' ? 'trend-down' : 'trend-stable'

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 rounded-lg bg-garmin-accent/50 ${colorClasses[color]}`}>
              <Icon className="w-5 h-5" />
            </div>
          )}
          <span className="metric-label">{title}</span>
        </div>
        {trend && (
          <TrendIcon className={`w-5 h-5 ${trendClass}`} />
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="metric-value">{value}</span>
        {unit && <span className="text-gray-400 text-lg">{unit}</span>}
      </div>

      {subtitle && (
        <p className="text-gray-400 text-sm mt-2">{subtitle}</p>
      )}
    </div>
  )
}

export default MetricsCard
