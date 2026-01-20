"""
Training recommendations engine.
Provides rule-based recommendations based on recovery status, stress levels, and activity patterns.
"""

from datetime import datetime, timedelta


class RecommendationsEngine:
    def __init__(self, garmin_client):
        self.garmin = garmin_client

    def get_recommendations(self) -> dict:
        """Generate training recommendations based on current recovery status."""
        # Fetch recent data
        sleep_data = self.garmin.get_sleep_data(days=3)
        stress_data = self.garmin.get_stress_data(days=3)
        battery_data = self.garmin.get_body_battery(days=3)
        recent_activities = self.garmin.get_activities(days=7)

        # Analyze current status
        recovery_status = self._assess_recovery_status(sleep_data, stress_data, battery_data)
        activity_load = self._assess_activity_load(recent_activities)

        # Generate recommendations
        recommendations = []

        # Recovery-based recommendations
        if recovery_status["level"] == "poor":
            recommendations.append({
                "type": "rest",
                "priority": "high",
                "title": "Rest Day Recommended",
                "description": "Your recovery metrics indicate you need rest. Consider taking a full rest day or doing light stretching.",
                "reasons": recovery_status["concerns"]
            })
        elif recovery_status["level"] == "moderate":
            recommendations.append({
                "type": "active_recovery",
                "priority": "medium",
                "title": "Active Recovery Suggested",
                "description": "Your body is still recovering. Light activities like walking, yoga, or swimming at low intensity would be beneficial.",
                "suggested_activities": ["walking", "yoga", "swimming"],
                "reasons": recovery_status["concerns"]
            })
        else:
            recommendations.append({
                "type": "training",
                "priority": "normal",
                "title": "Good to Train",
                "description": "Your recovery looks good! You're ready for a regular training session.",
                "reasons": ["Good sleep quality", "Low stress levels", "Body battery well charged"]
            })

        # Activity load recommendations
        if activity_load["consecutive_intense_days"] >= 3:
            recommendations.append({
                "type": "deload",
                "priority": "high",
                "title": "Consider a Deload",
                "description": f"You've had {activity_load['consecutive_intense_days']} consecutive intense training days. A lighter day would help prevent overtraining.",
                "reasons": [f"{activity_load['consecutive_intense_days']} intense days in a row"]
            })

        if activity_load["days_since_last_activity"] >= 3:
            recommendations.append({
                "type": "motivation",
                "priority": "medium",
                "title": "Time to Move!",
                "description": f"It's been {activity_load['days_since_last_activity']} days since your last recorded activity. A light workout could help maintain your fitness.",
                "suggested_activities": self._suggest_based_on_history(recent_activities)
            })

        # Activity variety recommendations
        if activity_load["most_common_type"] and activity_load["type_count"].get(activity_load["most_common_type"], 0) >= 5:
            other_types = [t for t in activity_load["type_count"].keys() if t != activity_load["most_common_type"]]
            if other_types:
                recommendations.append({
                    "type": "variety",
                    "priority": "low",
                    "title": "Mix It Up",
                    "description": f"You've done a lot of {activity_load['most_common_type']} recently. Adding variety can improve overall fitness and reduce injury risk.",
                    "suggested_activities": other_types[:3]
                })

        # Sleep recommendations
        if sleep_data:
            avg_sleep = sum(d.get("duration_hours", 0) for d in sleep_data) / len(sleep_data)
            if avg_sleep < 6.5:
                recommendations.append({
                    "type": "sleep",
                    "priority": "high",
                    "title": "Prioritize Sleep",
                    "description": f"Your average sleep has been only {avg_sleep:.1f} hours. Aim for 7-9 hours for optimal recovery and performance.",
                    "reasons": [f"Average sleep: {avg_sleep:.1f} hours"]
                })

        return {
            "generated_at": datetime.now().isoformat(),
            "recovery_status": recovery_status,
            "activity_load": activity_load,
            "recommendations": recommendations
        }

    def _assess_recovery_status(self, sleep_data: list, stress_data: list, battery_data: list) -> dict:
        """Assess overall recovery status based on multiple metrics."""
        concerns = []
        score = 100  # Start at 100, deduct for issues

        # Check sleep
        if sleep_data:
            latest_sleep = sleep_data[0]
            sleep_hours = latest_sleep.get("duration_hours", 0)
            sleep_score = latest_sleep.get("sleep_score", 0)

            if sleep_hours < 6:
                concerns.append(f"Poor sleep duration ({sleep_hours:.1f}h)")
                score -= 30
            elif sleep_hours < 7:
                concerns.append(f"Below optimal sleep ({sleep_hours:.1f}h)")
                score -= 15

            if sleep_score and sleep_score < 60:
                concerns.append(f"Low sleep quality score ({sleep_score})")
                score -= 20
            elif sleep_score and sleep_score < 75:
                concerns.append(f"Moderate sleep quality ({sleep_score})")
                score -= 10

        # Check stress
        if stress_data:
            latest_stress = stress_data[0]
            avg_stress = latest_stress.get("average_stress", 0)

            if avg_stress > 60:
                concerns.append(f"High stress levels ({avg_stress})")
                score -= 25
            elif avg_stress > 45:
                concerns.append(f"Elevated stress ({avg_stress})")
                score -= 10

        # Check body battery
        if battery_data:
            latest_battery = battery_data[0]
            max_level = latest_battery.get("max_level", 0)

            if max_level < 50:
                concerns.append(f"Low body battery max ({max_level}%)")
                score -= 25
            elif max_level < 70:
                concerns.append(f"Moderate body battery ({max_level}%)")
                score -= 10

        # Determine level
        if score >= 80:
            level = "good"
        elif score >= 60:
            level = "moderate"
        else:
            level = "poor"

        return {
            "level": level,
            "score": max(0, score),
            "concerns": concerns if concerns else ["All recovery metrics look good"]
        }

    def _assess_activity_load(self, activities: list) -> dict:
        """Assess recent activity load."""
        if not activities:
            return {
                "total_activities": 0,
                "consecutive_intense_days": 0,
                "days_since_last_activity": 7,
                "most_common_type": None,
                "type_count": {}
            }

        # Count activities by type
        type_count = {}
        for activity in activities:
            act_type = activity.get("type", "other")
            type_count[act_type] = type_count.get(act_type, 0) + 1

        most_common = max(type_count.keys(), key=lambda k: type_count[k]) if type_count else None

        # Calculate consecutive intense days
        # Consider a day intense if total duration > 45 min or high training effect
        activities_by_date = {}
        for activity in activities:
            date = activity.get("date", "")
            if date not in activities_by_date:
                activities_by_date[date] = []
            activities_by_date[date].append(activity)

        consecutive_intense = 0
        today = datetime.now()
        for i in range(7):
            date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            if date_str in activities_by_date:
                day_duration = sum(a.get("duration_minutes", 0) for a in activities_by_date[date_str])
                if day_duration >= 45:
                    consecutive_intense += 1
                else:
                    break
            else:
                break

        # Days since last activity
        if activities:
            last_activity_date = max(a.get("date", "") for a in activities)
            try:
                last_date = datetime.strptime(last_activity_date, "%Y-%m-%d")
                days_since = (datetime.now() - last_date).days
            except:
                days_since = 0
        else:
            days_since = 7

        return {
            "total_activities": len(activities),
            "consecutive_intense_days": consecutive_intense,
            "days_since_last_activity": days_since,
            "most_common_type": most_common,
            "type_count": type_count
        }

    def _suggest_based_on_history(self, activities: list) -> list:
        """Suggest activities based on user's history."""
        if not activities:
            return ["walking", "gym", "yoga"]

        # Return the types they've done before
        types = set(a.get("type", "other") for a in activities)
        return list(types)[:3] if types else ["walking", "gym", "yoga"]
