import { Lightbulb, AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react'

function Recommendations({ data }) {
  if (!data || !data.recommendations?.length) {
    return null
  }

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-garmin-danger" />
      case 'medium':
        return <Info className="w-5 h-5 text-garmin-warning" />
      default:
        return <Lightbulb className="w-5 h-5 text-garmin-blue" />
    }
  }

  const getTypeIcon = (type) => {
    switch (type) {
      case 'rest':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'training':
        return <Zap className="w-5 h-5 text-garmin-blue" />
      default:
        return <Lightbulb className="w-5 h-5 text-garmin-warning" />
    }
  }

  const getPriorityBorder = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-4 border-l-garmin-danger'
      case 'medium':
        return 'border-l-4 border-l-garmin-warning'
      default:
        return 'border-l-4 border-l-garmin-blue'
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="w-6 h-6 text-garmin-blue" />
        <h2 className="text-xl font-semibold">Recommendations</h2>
      </div>

      {/* Recovery Status */}
      {data.recovery_status && (
        <div className={`card mb-4 ${
          data.recovery_status.level === 'good' ? 'bg-garmin-success/10' :
          data.recovery_status.level === 'moderate' ? 'bg-garmin-warning/10' :
          'bg-garmin-danger/10'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`text-xl font-bold ${
              data.recovery_status.level === 'good' ? 'text-garmin-success' :
              data.recovery_status.level === 'moderate' ? 'text-garmin-warning' :
              'text-garmin-danger'
            }`}>
              Recovery: {data.recovery_status.level.charAt(0).toUpperCase() + data.recovery_status.level.slice(1)}
            </div>
            <span className="text-gray-400">Score: {data.recovery_status.score}/100</span>
          </div>
        </div>
      )}

      {/* Recommendations List */}
      <div className="space-y-4">
        {data.recommendations.map((rec, index) => (
          <div
            key={index}
            className={`card ${getPriorityBorder(rec.priority)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                {getPriorityIcon(rec.priority)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{rec.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    rec.priority === 'high' ? 'bg-garmin-danger/20 text-garmin-danger' :
                    rec.priority === 'medium' ? 'bg-garmin-warning/20 text-garmin-warning' :
                    'bg-garmin-blue/20 text-garmin-blue'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <p className="text-gray-300">{rec.description}</p>

                {rec.reasons && rec.reasons.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-400 mb-1">Based on:</p>
                    <ul className="text-sm text-gray-400 list-disc list-inside">
                      {rec.reasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {rec.suggested_activities && rec.suggested_activities.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {rec.suggested_activities.map((activity, i) => (
                      <span
                        key={i}
                        className="bg-garmin-accent/50 text-gray-300 px-3 py-1 rounded-full text-sm"
                      >
                        {activity}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Recommendations
