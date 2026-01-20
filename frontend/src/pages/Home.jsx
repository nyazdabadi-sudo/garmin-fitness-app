import { RefreshCw } from 'lucide-react'
import Dashboard from '../components/Dashboard'
import { useDashboardData } from '../hooks/useGarminData'

function Home() {
  const { sleep, bodyBattery, stress, stats, recommendations, loading, error, refetch } = useDashboardData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-garmin-blue mb-4"></div>
        <p className="text-gray-400">Loading your fitness data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card max-w-md mx-auto text-center py-10">
        <p className="text-garmin-danger mb-4">Error loading data: {error}</p>
        <button onClick={refetch} className="btn-primary inline-flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <button
          onClick={refetch}
          className="btn-secondary inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      <Dashboard
        sleep={sleep}
        bodyBattery={bodyBattery}
        stress={stress}
        stats={stats}
        recommendations={recommendations}
      />
    </div>
  )
}

export default Home
