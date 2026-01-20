import { useState, useEffect } from 'react'
import { RefreshCw, Filter, Calendar, Clock, Flame, Ruler, Heart } from 'lucide-react'
import { useActivities, useActivityTypes, useBestPerformances } from '../hooks/useGarminData'
import ActivityChart from '../components/ActivityChart'
import BestPerformances from '../components/BestPerformances'

function Activities() {
  const [selectedType, setSelectedType] = useState(null)
  const [days, setDays] = useState(30)

  const { data: activities, loading, error, refetch } = useActivities(selectedType, days)
  const { data: activityTypesData } = useActivityTypes()
  const { data: bestPerformances } = useBestPerformances(selectedType)

  const activityTypes = activityTypesData?.types || []

  // Prepare chart data
  const chartData = activities?.reduce((acc, activity) => {
    const date = activity.date
    if (!acc[date]) {
      acc[date] = { date, duration: 0, calories: 0, distance: 0 }
    }
    acc[date].duration += activity.duration_minutes || 0
    acc[date].calories += activity.calories || 0
    acc[date].distance += activity.distance_km || 0
    return acc
  }, {})

  const chartDataArray = chartData ? Object.values(chartData).sort((a, b) => a.date.localeCompare(b.date)) : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Activities</h1>

        <div className="flex flex-wrap items-center gap-3">
          {/* Activity Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={selectedType || ''}
              onChange={(e) => setSelectedType(e.target.value || null)}
              className="bg-garmin-dark border border-garmin-accent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garmin-blue"
            >
              <option value="">All Types</option>
              {activityTypes.map(type => (
                <option key={type} value={type} className="capitalize">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Days Filter */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-garmin-dark border border-garmin-accent rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-garmin-blue"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>

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
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-garmin-blue"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="card text-center py-10">
          <p className="text-garmin-danger mb-4">Error: {error}</p>
          <button onClick={refetch} className="btn-primary">Try Again</button>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Activities</p>
              <p className="text-2xl font-bold">{activities?.length || 0}</p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Time</p>
              <p className="text-2xl font-bold">
                {((activities?.reduce((sum, a) => sum + (a.duration_minutes || 0), 0) || 0) / 60).toFixed(1)} hrs
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Distance</p>
              <p className="text-2xl font-bold">
                {(activities?.reduce((sum, a) => sum + (a.distance_km || 0), 0) || 0).toFixed(1)} km
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-gray-400 mb-1">Total Calories</p>
              <p className="text-2xl font-bold">
                {(activities?.reduce((sum, a) => sum + (a.calories || 0), 0) || 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ActivityChart
              data={chartDataArray}
              type="bar"
              dataKey="duration"
              title="Daily Activity Duration (minutes)"
              color="#007dba"
            />
            <ActivityChart
              data={chartDataArray}
              type="bar"
              dataKey="calories"
              title="Daily Calories Burned"
              color="#f59e0b"
            />
          </div>

          {/* Best Performances */}
          <BestPerformances data={bestPerformances} />

          {/* Activities List */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Recent Activities</h2>

            {activities?.length === 0 ? (
              <p className="text-gray-400 text-center py-8">No activities found for the selected filters</p>
            ) : (
              <div className="space-y-3">
                {activities?.slice(0, 20).map(activity => (
                  <div
                    key={activity.id}
                    className="bg-garmin-dark p-4 rounded-lg border border-garmin-accent/30 hover:border-garmin-blue/50 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{activity.name || 'Unnamed Activity'}</span>
                          <span className="bg-garmin-accent/50 text-xs px-2 py-0.5 rounded capitalize">
                            {activity.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(activity.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {activity.duration_minutes?.toFixed(0)} min
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        {activity.distance_km > 0 && (
                          <div className="flex items-center gap-1">
                            <Ruler className="w-4 h-4 text-garmin-blue" />
                            <span>{activity.distance_km} km</span>
                          </div>
                        )}
                        {activity.calories > 0 && (
                          <div className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-garmin-warning" />
                            <span>{activity.calories} kcal</span>
                          </div>
                        )}
                        {activity.avg_heart_rate && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-4 h-4 text-garmin-danger" />
                            <span>{activity.avg_heart_rate} bpm</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default Activities
