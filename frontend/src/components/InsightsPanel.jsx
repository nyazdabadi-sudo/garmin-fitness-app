import { TrendingUp, TrendingDown, Minus, Moon, Brain, Battery, Activity } from 'lucide-react'

function InsightsPanel({ data, period = 'weekly' }) {
  if (!data) {
    return (
      <div className="card">
        <p className="text-gray-400">Loading insights...</p>
      </div>
    )
  }

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-garmin-success" />
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-garmin-danger" />
      default:
        return <Minus className="w-5 h-5 text-gray-400" />
    }
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-garmin-success'
      case 'declining':
        return 'text-garmin-danger'
      default:
        return 'text-gray-400'
    }
  }

  return (
    <div className="space-y-6">
      {/* Summary Header */}
      <div className="card bg-gradient-to-r from-garmin-blue/20 to-garmin-accent/20">
        <h2 className="text-xl font-semibold mb-2">
          {period === 'weekly' ? 'Weekly' : 'Monthly'} Insights
        </h2>
        <p className="text-gray-400">
          Analysis of {data.days_analyzed} days of data
        </p>
      </div>

      {/* Trends Overview */}
      {data.trends && Object.keys(data.trends).length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Trends</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.trends.sleep && (
              <div className="flex items-center gap-3 p-3 bg-garmin-dark rounded-lg">
                <Moon className="w-6 h-6 text-garmin-blue" />
                <div>
                  <p className="text-sm text-gray-400">Sleep</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(data.trends.sleep)}
                    <span className={getTrendColor(data.trends.sleep)}>
                      {data.trends.sleep.charAt(0).toUpperCase() + data.trends.sleep.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {data.trends.stress && (
              <div className="flex items-center gap-3 p-3 bg-garmin-dark rounded-lg">
                <Brain className="w-6 h-6 text-garmin-warning" />
                <div>
                  <p className="text-sm text-gray-400">Stress</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(data.trends.stress)}
                    <span className={getTrendColor(data.trends.stress)}>
                      {data.trends.stress.charAt(0).toUpperCase() + data.trends.stress.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {data.trends.body_battery && (
              <div className="flex items-center gap-3 p-3 bg-garmin-dark rounded-lg">
                <Battery className="w-6 h-6 text-garmin-success" />
                <div>
                  <p className="text-sm text-gray-400">Body Battery</p>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(data.trends.body_battery)}
                    <span className={getTrendColor(data.trends.body_battery)}>
                      {data.trends.body_battery.charAt(0).toUpperCase() + data.trends.body_battery.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sleep Insights */}
      {data.sleep?.available && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Moon className="w-6 h-6 text-garmin-blue" />
            <h3 className="text-lg font-semibold">Sleep Analysis</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Avg Duration</p>
              <p className="text-2xl font-bold">{data.sleep.average_duration_hours} hrs</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Avg Score</p>
              <p className="text-2xl font-bold">{data.sleep.average_score}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Deep Sleep</p>
              <p className="text-2xl font-bold">{data.sleep.deep_sleep_percentage}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Under 7h</p>
              <p className="text-2xl font-bold">{data.sleep.nights_under_7h} nights</p>
            </div>
          </div>
        </div>
      )}

      {/* Stress Insights */}
      {data.stress?.available && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-6 h-6 text-garmin-warning" />
            <h3 className="text-lg font-semibold">Stress Analysis</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-400">Avg Stress</p>
              <p className="text-2xl font-bold">{data.stress.average_daily_stress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Peak Stress</p>
              <p className="text-2xl font-bold">{data.stress.peak_stress}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">High Stress Days</p>
              <p className="text-2xl font-bold text-garmin-danger">{data.stress.high_stress_days}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Low Stress Days</p>
              <p className="text-2xl font-bold text-garmin-success">{data.stress.low_stress_days}</p>
            </div>
          </div>
        </div>
      )}

      {/* Activity Insights */}
      {data.activities?.available && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-6 h-6 text-garmin-success" />
            <h3 className="text-lg font-semibold">Activity Summary</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <p className="text-sm text-gray-400">Total Activities</p>
              <p className="text-2xl font-bold">{data.activities.total_activities}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total Time</p>
              <p className="text-2xl font-bold">{data.activities.total_duration_hours} hrs</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Distance</p>
              <p className="text-2xl font-bold">{data.activities.total_distance_km} km</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Calories</p>
              <p className="text-2xl font-bold">{data.activities.total_calories?.toLocaleString()}</p>
            </div>
          </div>

          {/* Activity Breakdown */}
          {data.activities.breakdown && Object.keys(data.activities.breakdown).length > 0 && (
            <div>
              <p className="text-sm text-gray-400 mb-3">Activity Breakdown</p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Object.entries(data.activities.breakdown).map(([type, stats]) => (
                  <div key={type} className="bg-garmin-dark p-3 rounded-lg">
                    <p className="font-medium capitalize">{type}</p>
                    <p className="text-sm text-gray-400">{stats.count} activities</p>
                    <p className="text-sm text-gray-400">{stats.total_duration_minutes} min</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default InsightsPanel
