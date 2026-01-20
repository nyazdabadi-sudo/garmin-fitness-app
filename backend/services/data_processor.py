"""
Data aggregation and insights processor.
Handles weekly/monthly aggregations, trend detection, and best performance tracking.
"""

from datetime import datetime, timedelta
from collections import defaultdict


class DataProcessor:
    def __init__(self, garmin_client):
        self.garmin = garmin_client

    def get_weekly_insights(self) -> dict:
        """Generate weekly insights from the past 7 days of data."""
        return self._generate_insights(days=7, period="weekly")

    def get_monthly_insights(self) -> dict:
        """Generate monthly insights from the past 30 days of data."""
        return self._generate_insights(days=30, period="monthly")

    def _generate_insights(self, days: int, period: str) -> dict:
        """Generate insights for a given time period."""
        sleep_data = self.garmin.get_sleep_data(days)
        stress_data = self.garmin.get_stress_data(days)
        battery_data = self.garmin.get_body_battery(days)
        activities = self.garmin.get_activities(days=days)

        return {
            "period": period,
            "days_analyzed": days,
            "generated_at": datetime.now().isoformat(),
            "sleep": self._analyze_sleep(sleep_data),
            "stress": self._analyze_stress(stress_data),
            "body_battery": self._analyze_body_battery(battery_data),
            "activities": self._analyze_activities(activities),
            "trends": self._calculate_trends(sleep_data, stress_data, battery_data)
        }

    def _analyze_sleep(self, sleep_data: list) -> dict:
        """Analyze sleep patterns."""
        if not sleep_data:
            return {"available": False}

        durations = [d["duration_hours"] for d in sleep_data if d.get("duration_hours")]
        scores = [d["sleep_score"] for d in sleep_data if d.get("sleep_score")]

        avg_duration = sum(durations) / len(durations) if durations else 0
        avg_score = sum(scores) / len(scores) if scores else 0

        # Calculate deep sleep percentage
        deep_sleep_total = sum(d.get("deep_sleep_seconds", 0) for d in sleep_data)
        total_sleep = sum(d.get("duration_seconds", 0) for d in sleep_data)
        deep_sleep_pct = (deep_sleep_total / total_sleep * 100) if total_sleep > 0 else 0

        return {
            "available": True,
            "average_duration_hours": round(avg_duration, 2),
            "average_score": round(avg_score, 1),
            "deep_sleep_percentage": round(deep_sleep_pct, 1),
            "best_night": max(sleep_data, key=lambda x: x.get("sleep_score", 0)) if scores else None,
            "worst_night": min(sleep_data, key=lambda x: x.get("sleep_score", 100)) if scores else None,
            "nights_under_7h": sum(1 for d in durations if d < 7),
            "nights_over_8h": sum(1 for d in durations if d >= 8)
        }

    def _analyze_stress(self, stress_data: list) -> dict:
        """Analyze stress patterns."""
        if not stress_data:
            return {"available": False}

        avg_levels = [d["average_stress"] for d in stress_data if d.get("average_stress")]
        max_levels = [d["max_stress"] for d in stress_data if d.get("max_stress")]

        return {
            "available": True,
            "average_daily_stress": round(sum(avg_levels) / len(avg_levels), 1) if avg_levels else 0,
            "peak_stress": max(max_levels) if max_levels else 0,
            "high_stress_days": sum(1 for a in avg_levels if a > 50),
            "low_stress_days": sum(1 for a in avg_levels if a < 30),
            "stress_distribution": {
                "low": sum(1 for a in avg_levels if a < 30),
                "medium": sum(1 for a in avg_levels if 30 <= a <= 50),
                "high": sum(1 for a in avg_levels if a > 50)
            }
        }

    def _analyze_body_battery(self, battery_data: list) -> dict:
        """Analyze body battery patterns."""
        if not battery_data:
            return {"available": False}

        max_levels = [d["max_level"] for d in battery_data if d.get("max_level")]
        min_levels = [d["min_level"] for d in battery_data if d.get("min_level")]

        return {
            "available": True,
            "average_max_level": round(sum(max_levels) / len(max_levels), 1) if max_levels else 0,
            "average_min_level": round(sum(min_levels) / len(min_levels), 1) if min_levels else 0,
            "days_reached_full": sum(1 for m in max_levels if m >= 95),
            "days_depleted": sum(1 for m in min_levels if m <= 10)
        }

    def _analyze_activities(self, activities: list) -> dict:
        """Analyze activity patterns."""
        if not activities:
            return {"available": False, "total_activities": 0}

        # Group by type
        by_type = defaultdict(list)
        for activity in activities:
            by_type[activity["type"]].append(activity)

        # Calculate totals
        total_duration = sum(a.get("duration_minutes", 0) for a in activities)
        total_calories = sum(a.get("calories", 0) for a in activities)
        total_distance = sum(a.get("distance_km", 0) for a in activities)

        # Activity breakdown
        breakdown = {}
        for activity_type, type_activities in by_type.items():
            breakdown[activity_type] = {
                "count": len(type_activities),
                "total_duration_minutes": round(sum(a.get("duration_minutes", 0) for a in type_activities), 1),
                "total_calories": sum(a.get("calories", 0) for a in type_activities),
                "total_distance_km": round(sum(a.get("distance_km", 0) for a in type_activities), 2)
            }

        return {
            "available": True,
            "total_activities": len(activities),
            "total_duration_minutes": round(total_duration, 1),
            "total_duration_hours": round(total_duration / 60, 1),
            "total_calories": total_calories,
            "total_distance_km": round(total_distance, 2),
            "most_active_type": max(by_type.keys(), key=lambda t: len(by_type[t])) if by_type else None,
            "breakdown": breakdown
        }

    def _calculate_trends(self, sleep_data: list, stress_data: list, battery_data: list) -> dict:
        """Calculate trends (improving/declining) for each metric."""
        trends = {}

        # Sleep trend - compare first half to second half of period
        if len(sleep_data) >= 4:
            mid = len(sleep_data) // 2
            first_half_sleep = sum(d.get("sleep_score", 0) for d in sleep_data[:mid]) / mid
            second_half_sleep = sum(d.get("sleep_score", 0) for d in sleep_data[mid:]) / (len(sleep_data) - mid)
            diff = second_half_sleep - first_half_sleep
            trends["sleep"] = "improving" if diff > 3 else "declining" if diff < -3 else "stable"

        # Stress trend
        if len(stress_data) >= 4:
            mid = len(stress_data) // 2
            first_half_stress = sum(d.get("average_stress", 0) for d in stress_data[:mid]) / mid
            second_half_stress = sum(d.get("average_stress", 0) for d in stress_data[mid:]) / (len(stress_data) - mid)
            diff = second_half_stress - first_half_stress
            # Lower stress is better, so flip the comparison
            trends["stress"] = "improving" if diff < -3 else "declining" if diff > 3 else "stable"

        # Body battery trend
        if len(battery_data) >= 4:
            mid = len(battery_data) // 2
            first_half_battery = sum(d.get("max_level", 0) for d in battery_data[:mid]) / mid
            second_half_battery = sum(d.get("max_level", 0) for d in battery_data[mid:]) / (len(battery_data) - mid)
            diff = second_half_battery - first_half_battery
            trends["body_battery"] = "improving" if diff > 5 else "declining" if diff < -5 else "stable"

        return trends

    def get_best_performances(self, activity_type: str = None) -> dict:
        """Get best performances per activity type."""
        activities = self.garmin.get_activities(activity_type=activity_type, days=365, limit=500)

        if not activities:
            return {"performances": []}

        # Group by type
        by_type = defaultdict(list)
        for activity in activities:
            by_type[activity["type"]].append(activity)

        performances = {}
        for act_type, type_activities in by_type.items():
            performances[act_type] = self._calculate_best_for_type(act_type, type_activities)

        return {"performances": performances}

    def _calculate_best_for_type(self, activity_type: str, activities: list) -> dict:
        """Calculate best performances for a specific activity type."""
        bests = {}

        # Distance-based activities
        if activity_type in ["running", "cycling", "swimming", "walking"]:
            distance_activities = [a for a in activities if a.get("distance_km", 0) > 0]
            if distance_activities:
                # Longest distance
                longest = max(distance_activities, key=lambda x: x.get("distance_km", 0))
                bests["longest_distance"] = {
                    "value": longest["distance_km"],
                    "unit": "km",
                    "date": longest["date"],
                    "activity_name": longest["name"]
                }

                # Fastest pace (for running - min per km)
                if activity_type == "running":
                    pace_activities = [a for a in distance_activities if a.get("duration_minutes", 0) > 0 and a.get("distance_km", 0) > 1]
                    if pace_activities:
                        fastest = min(pace_activities, key=lambda x: x["duration_minutes"] / x["distance_km"])
                        pace = fastest["duration_minutes"] / fastest["distance_km"]
                        bests["fastest_pace"] = {
                            "value": round(pace, 2),
                            "unit": "min/km",
                            "date": fastest["date"],
                            "activity_name": fastest["name"]
                        }

        # Duration for all activities
        if activities:
            longest_duration = max(activities, key=lambda x: x.get("duration_minutes", 0))
            bests["longest_duration"] = {
                "value": longest_duration["duration_minutes"],
                "unit": "minutes",
                "date": longest_duration["date"],
                "activity_name": longest_duration["name"]
            }

        # Highest calorie burn
        calorie_activities = [a for a in activities if a.get("calories", 0) > 0]
        if calorie_activities:
            highest_calories = max(calorie_activities, key=lambda x: x.get("calories", 0))
            bests["highest_calories"] = {
                "value": highest_calories["calories"],
                "unit": "kcal",
                "date": highest_calories["date"],
                "activity_name": highest_calories["name"]
            }

        return bests
