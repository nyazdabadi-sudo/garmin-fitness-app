import { Moon, Battery, Brain, Footprints, Flame, Heart } from 'lucide-react'
import MetricsCard from './MetricsCard'
import ActivityChart from './ActivityChart'
import Recommendations from './Recommendations'

function Dashboard({ sleep, bodyBattery, stress, stats, recommendations }) {
  // Get latest values
  const latestSleep = sleep?.[0]
  const latestBattery = bodyBattery?.[0]
  const latestStress = stress?.[0]

  // Determine trends (compare to previous day)
  const getSleepTrend = () => {
    if (sleep?.length >= 2) {
      const diff = (sleep[0]?.duration_hours || 0) - (sleep[1]?.duration_hours || 0)
      return diff > 0.5 ? 'up' : diff < -0.5 ? 'down' : 'stable'
    }
    return null
  }

  const getStressTrend = () => {
    if (stress?.length >= 2) {
      const diff = (stress[0]?.average_stress || 0) - (stress[1]?.average_stress || 0)
      // Lower stress is better
      return diff < -5 ? 'up' : diff > 5 ? 'down' : 'stable'
    }
    return null
  }

  const getBatteryTrend = () => {
    if (bodyBattery?.length >= 2) {
      const diff = (bodyBattery[0]?.max_level || 0) - (bodyBattery[1]?.max_level || 0)
      return diff > 5 ? 'up' : diff < -5 ? 'down' : 'stable'
    }
    return null
  }

  return (
    <div className="space-y-8">
      {/* Quick Stats */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Sleep"
            value={latestSleep?.duration_hours?.toFixed(1) || '--'}
            unit="hrs"
            icon={Moon}
            trend={getSleepTrend()}
            subtitle={latestSleep?.sleep_score ? `Score: ${latestSleep.sleep_score}` : null}
            color="blue"
          />

          <MetricsCard
            title="Body Battery"
            value={latestBattery?.max_level || '--'}
            unit="%"
            icon={Battery}
            trend={getBatteryTrend()}
            subtitle={latestBattery ? `Min: ${latestBattery.min_level}%` : null}
            color="green"
          />

          <MetricsCard
            title="Stress"
            value={latestStress?.average_stress || '--'}
            unit="avg"
            icon={Brain}
            trend={getStressTrend()}
            subtitle={latestStress ? `Peak: ${latestStress.max_stress}` : null}
            color={latestStress?.average_stress > 50 ? 'red' : 'yellow'}
          />

          <MetricsCard
            title="Steps"
            value={stats?.total_steps?.toLocaleString() || '--'}
            icon={Footprints}
            subtitle={stats ? `${(stats.total_distance_meters / 1000).toFixed(1)} km` : null}
            color="blue"
          />
        </div>
      </section>

      {/* Secondary Stats */}
      {stats && (
        <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricsCard
              title="Active Calories"
              value={stats.active_calories || '--'}
              unit="kcal"
              icon={Flame}
              color="yellow"
            />

            <MetricsCard
              title="Resting HR"
              value={stats.resting_heart_rate || '--'}
              unit="bpm"
              icon={Heart}
              color="red"
            />

            <MetricsCard
              title="Floors"
              value={stats.floors_climbed || '--'}
              color="blue"
            />

            <MetricsCard
              title="Intensity Min"
              value={stats.intensity_minutes || '--'}
              unit="min"
              color="green"
            />
          </div>
        </section>
      )}

      {/* Charts */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ActivityChart
          data={sleep}
          type="bar"
          dataKey="duration_hours"
          title="Sleep Duration (7 days)"
          color="#007dba"
        />

        <ActivityChart
          data={stress}
          type="line"
          dataKey="average_stress"
          title="Stress Levels (7 days)"
          color="#f59e0b"
        />
      </section>

      {/* Recommendations */}
      {recommendations && (
        <section>
          <Recommendations data={recommendations} />
        </section>
      )}
    </div>
  )
}

export default Dashboard
