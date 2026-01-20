import { useState } from 'react'
import { RefreshCw, BarChart3 } from 'lucide-react'
import { useInsights } from '../hooks/useGarminData'
import InsightsPanel from '../components/InsightsPanel'
import { MultiLineChart } from '../components/ActivityChart'

function Insights() {
  const [period, setPeriod] = useState('weekly')
  const { data, loading, error, refetch } = useInsights(period)

  // Prepare sleep chart data
  const sleepChartData = data?.sleep?.available ? [
    ...(data.sleep.best_night ? [{
      label: 'Best Night',
      date: data.sleep.best_night.date,
      duration: data.sleep.best_night.duration_hours,
      score: data.sleep.best_night.sleep_score
    }] : []),
    ...(data.sleep.worst_night ? [{
      label: 'Worst Night',
      date: data.sleep.worst_night.date,
      duration: data.sleep.worst_night.duration_hours,
      score: data.sleep.worst_night.sleep_score
    }] : [])
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-8 h-8 text-garmin-blue" />
          <h1 className="text-2xl font-bold">Insights</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Toggle */}
          <div className="flex bg-garmin-dark rounded-lg p-1 border border-garmin-accent/30">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'weekly'
                  ? 'bg-garmin-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === 'monthly'
                  ? 'bg-garmin-blue text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
          </div>

          <button
            onClick={refetch}
            className="btn-secondary inline-flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-garmin-blue mb-4"></div>
          <p className="text-gray-400">Analyzing your {period} data...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card max-w-md mx-auto text-center py-10">
          <p className="text-garmin-danger mb-4">Error loading insights: {error}</p>
          <button onClick={refetch} className="btn-primary inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && data && (
        <>
          <InsightsPanel data={data} period={period} />

          {/* Best/Worst Sleep Comparison */}
          {sleepChartData.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Sleep Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.sleep?.best_night && (
                  <div className="bg-garmin-success/10 p-4 rounded-lg border border-garmin-success/30">
                    <p className="text-garmin-success font-medium mb-2">Best Night</p>
                    <p className="text-2xl font-bold">{data.sleep.best_night.duration_hours} hrs</p>
                    <p className="text-sm text-gray-400">
                      Score: {data.sleep.best_night.sleep_score} |{' '}
                      {new Date(data.sleep.best_night.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {data.sleep?.worst_night && (
                  <div className="bg-garmin-danger/10 p-4 rounded-lg border border-garmin-danger/30">
                    <p className="text-garmin-danger font-medium mb-2">Worst Night</p>
                    <p className="text-2xl font-bold">{data.sleep.worst_night.duration_hours} hrs</p>
                    <p className="text-sm text-gray-400">
                      Score: {data.sleep.worst_night.sleep_score} |{' '}
                      {new Date(data.sleep.worst_night.date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Stress Distribution */}
          {data.stress?.available && data.stress.stress_distribution && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Stress Distribution</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-garmin-success/10 rounded-lg">
                  <p className="text-3xl font-bold text-garmin-success">
                    {data.stress.stress_distribution.low}
                  </p>
                  <p className="text-sm text-gray-400">Low Stress Days</p>
                </div>
                <div className="text-center p-4 bg-garmin-warning/10 rounded-lg">
                  <p className="text-3xl font-bold text-garmin-warning">
                    {data.stress.stress_distribution.medium}
                  </p>
                  <p className="text-sm text-gray-400">Medium Stress Days</p>
                </div>
                <div className="text-center p-4 bg-garmin-danger/10 rounded-lg">
                  <p className="text-3xl font-bold text-garmin-danger">
                    {data.stress.stress_distribution.high}
                  </p>
                  <p className="text-sm text-gray-400">High Stress Days</p>
                </div>
              </div>
            </div>
          )}

          {/* Body Battery Stats */}
          {data.body_battery?.available && (
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Body Battery Patterns</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Avg Max Level</p>
                  <p className="text-2xl font-bold">{data.body_battery.average_max_level}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Avg Min Level</p>
                  <p className="text-2xl font-bold">{data.body_battery.average_min_level}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Fully Charged Days</p>
                  <p className="text-2xl font-bold text-garmin-success">{data.body_battery.days_reached_full}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Depleted Days</p>
                  <p className="text-2xl font-bold text-garmin-danger">{data.body_battery.days_depleted}</p>
                </div>
              </div>
            </div>
          )}

          {/* Most Active Type */}
          {data.activities?.most_active_type && (
            <div className="card bg-gradient-to-r from-garmin-blue/10 to-garmin-accent/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Most Active Type This {period === 'weekly' ? 'Week' : 'Month'}</p>
                  <p className="text-2xl font-bold capitalize">{data.activities.most_active_type}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400">Activities</p>
                  <p className="text-2xl font-bold">{data.activities.total_activities}</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Insights
