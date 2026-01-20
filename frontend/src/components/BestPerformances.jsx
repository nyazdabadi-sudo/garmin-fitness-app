import { Trophy, Calendar, Clock, Flame, Ruler } from 'lucide-react'

function BestPerformances({ data }) {
  if (!data?.performances || Object.keys(data.performances).length === 0) {
    return (
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-6 h-6 text-garmin-warning" />
          <h2 className="text-xl font-semibold">Best Performances</h2>
        </div>
        <p className="text-gray-400">No performance records found. Start logging activities to track your PRs!</p>
      </div>
    )
  }

  const getIcon = (metric) => {
    switch (metric) {
      case 'longest_distance':
        return <Ruler className="w-5 h-5" />
      case 'fastest_pace':
        return <Clock className="w-5 h-5" />
      case 'longest_duration':
        return <Clock className="w-5 h-5" />
      case 'highest_calories':
        return <Flame className="w-5 h-5" />
      default:
        return <Trophy className="w-5 h-5" />
    }
  }

  const formatMetricName = (metric) => {
    return metric
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Trophy className="w-6 h-6 text-garmin-warning" />
        <h2 className="text-xl font-semibold">Best Performances</h2>
      </div>

      <div className="space-y-6">
        {Object.entries(data.performances).map(([activityType, bests]) => (
          <div key={activityType} className="card">
            <h3 className="text-lg font-semibold capitalize mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-garmin-blue"></span>
              {activityType}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(bests).map(([metric, record]) => (
                <div
                  key={metric}
                  className="bg-garmin-dark p-4 rounded-lg border border-garmin-accent/30"
                >
                  <div className="flex items-center gap-2 mb-2 text-garmin-warning">
                    {getIcon(metric)}
                    <span className="text-sm font-medium">{formatMetricName(metric)}</span>
                  </div>

                  <div className="mb-2">
                    <span className="text-2xl font-bold">{record.value}</span>
                    <span className="text-gray-400 ml-1">{record.unit}</span>
                  </div>

                  <div className="text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(record.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                    {record.activity_name && (
                      <p className="mt-1 truncate" title={record.activity_name}>
                        {record.activity_name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BestPerformances
