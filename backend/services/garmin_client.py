"""
Garmin Connect API wrapper service.
Handles authentication and data fetching from Garmin Connect.
"""

from datetime import datetime, timedelta
from garminconnect import Garmin, GarminConnectAuthenticationError
from models.activities import get_garmin_types_for_activity, find_activity_type_by_garmin_type


class GarminClient:
    def __init__(self):
        self.client = None
        self.is_authenticated = False

    def login(self, email: str, password: str) -> dict:
        """Authenticate with Garmin Connect."""
        try:
            self.client = Garmin(email, password)
            self.client.login()
            self.is_authenticated = True

            # Get user profile info
            try:
                profile = self.client.get_full_name()
            except:
                profile = email

            return {
                "success": True,
                "message": "Successfully logged in",
                "user": profile
            }
        except GarminConnectAuthenticationError as e:
            self.is_authenticated = False
            return {
                "success": False,
                "message": f"Authentication failed: {str(e)}"
            }
        except Exception as e:
            self.is_authenticated = False
            return {
                "success": False,
                "message": f"Login error: {str(e)}"
            }

    def _ensure_authenticated(self):
        """Check if client is authenticated."""
        if not self.is_authenticated or not self.client:
            raise Exception("Not authenticated. Please login first.")

    def get_sleep_data(self, days: int = 7) -> list[dict]:
        """Fetch sleep data for the specified number of days."""
        self._ensure_authenticated()

        sleep_data = []
        end_date = datetime.now()

        for i in range(days):
            date = end_date - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")

            try:
                data = self.client.get_sleep_data(date_str)
                if data:
                    daily_sleep = data.get("dailySleepDTO", data)
                    sleep_data.append({
                        "date": date_str,
                        "duration_seconds": daily_sleep.get("sleepTimeSeconds", 0),
                        "duration_hours": round(daily_sleep.get("sleepTimeSeconds", 0) / 3600, 2),
                        "deep_sleep_seconds": daily_sleep.get("deepSleepSeconds", 0),
                        "light_sleep_seconds": daily_sleep.get("lightSleepSeconds", 0),
                        "rem_sleep_seconds": daily_sleep.get("remSleepSeconds", 0),
                        "awake_seconds": daily_sleep.get("awakeSleepSeconds", 0),
                        "sleep_score": daily_sleep.get("sleepScores", {}).get("overall", {}).get("value") if isinstance(daily_sleep.get("sleepScores"), dict) else None,
                        "quality_score": daily_sleep.get("sleepScores", {}).get("qualityScore", {}).get("value") if isinstance(daily_sleep.get("sleepScores"), dict) else None
                    })
            except Exception:
                continue

        return sleep_data

    def get_body_battery(self, days: int = 7) -> list[dict]:
        """Fetch body battery data for the specified number of days."""
        self._ensure_authenticated()

        battery_data = []
        end_date = datetime.now()

        for i in range(days):
            date = end_date - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")

            try:
                data = self.client.get_body_battery(date_str)
                if data:
                    # Handle different response formats
                    if isinstance(data, list) and len(data) > 0:
                        daily_data = data[0]
                    elif isinstance(data, dict):
                        daily_data = data
                    else:
                        continue

                    battery_data.append({
                        "date": date_str,
                        "charged": daily_data.get("charged", 0),
                        "drained": daily_data.get("drained", 0),
                        "max_level": daily_data.get("bodyBatteryStatList", [{}])[0].get("max", daily_data.get("bodyBatteryMax", 0)) if daily_data.get("bodyBatteryStatList") else daily_data.get("bodyBatteryMax", 0),
                        "min_level": daily_data.get("bodyBatteryStatList", [{}])[0].get("min", daily_data.get("bodyBatteryMin", 0)) if daily_data.get("bodyBatteryStatList") else daily_data.get("bodyBatteryMin", 0)
                    })
            except Exception:
                continue

        return battery_data

    def get_stress_data(self, days: int = 7) -> list[dict]:
        """Fetch stress data for the specified number of days."""
        self._ensure_authenticated()

        stress_data = []
        end_date = datetime.now()

        for i in range(days):
            date = end_date - timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")

            try:
                data = self.client.get_stress_data(date_str)
                if data:
                    stress_data.append({
                        "date": date_str,
                        "average_stress": data.get("overallStressLevel", data.get("averageStressLevel", 0)),
                        "max_stress": data.get("maxStressLevel", 0),
                        "low_stress_duration": data.get("lowStressDuration", 0),
                        "medium_stress_duration": data.get("mediumStressDuration", 0),
                        "high_stress_duration": data.get("highStressDuration", 0),
                        "rest_stress_duration": data.get("restStressDuration", 0)
                    })
            except Exception:
                continue

        return stress_data

    def get_activities(self, activity_type: str = None, days: int = 30, limit: int = 100) -> list[dict]:
        """
        Fetch activities, optionally filtered by type.
        """
        self._ensure_authenticated()

        try:
            # Fetch activities - the API returns activities in reverse chronological order
            activities = self.client.get_activities(0, limit)

            if not activities:
                return []

            # Filter by date range
            start_date = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")

            # Filter by activity type if specified
            garmin_types = []
            if activity_type:
                garmin_types = get_garmin_types_for_activity(activity_type)

            processed_activities = []
            for activity in activities:
                # Get activity date
                activity_date = activity.get("startTimeLocal", "")[:10] if activity.get("startTimeLocal") else ""

                # Filter by date
                if activity_date and activity_date < start_date:
                    continue

                garmin_type = activity.get("activityType", {}).get("typeKey", "") if isinstance(activity.get("activityType"), dict) else ""

                # Filter by type if specified
                if activity_type and garmin_type.lower() not in [t.lower() for t in garmin_types]:
                    continue

                # Determine our category for this activity
                category = find_activity_type_by_garmin_type(garmin_type) or "other"

                processed_activities.append({
                    "id": activity.get("activityId"),
                    "name": activity.get("activityName", ""),
                    "type": category,
                    "garmin_type": garmin_type,
                    "date": activity_date,
                    "start_time": activity.get("startTimeLocal", ""),
                    "duration_seconds": activity.get("duration", 0),
                    "duration_minutes": round(activity.get("duration", 0) / 60, 1),
                    "distance_meters": activity.get("distance", 0),
                    "distance_km": round(activity.get("distance", 0) / 1000, 2) if activity.get("distance") else 0,
                    "calories": activity.get("calories", 0),
                    "avg_heart_rate": activity.get("averageHR"),
                    "max_heart_rate": activity.get("maxHR"),
                    "avg_speed": activity.get("averageSpeed"),
                    "elevation_gain": activity.get("elevationGain"),
                    "training_effect_aerobic": activity.get("aerobicTrainingEffect"),
                    "training_effect_anaerobic": activity.get("anaerobicTrainingEffect")
                })

            return processed_activities
        except Exception as e:
            raise Exception(f"Error fetching activities: {str(e)}")

    def get_stats(self) -> dict:
        """Get user's daily stats summary."""
        self._ensure_authenticated()

        try:
            date_str = datetime.now().strftime("%Y-%m-%d")
            stats = self.client.get_stats(date_str)

            return {
                "date": date_str,
                "total_steps": stats.get("totalSteps", 0),
                "total_distance_meters": stats.get("totalDistanceMeters", 0),
                "active_calories": stats.get("activeKilocalories", 0),
                "total_calories": stats.get("totalKilocalories", 0),
                "resting_heart_rate": stats.get("restingHeartRate"),
                "min_heart_rate": stats.get("minHeartRate"),
                "max_heart_rate": stats.get("maxHeartRate"),
                "floors_climbed": stats.get("floorsAscended", 0),
                "intensity_minutes": (stats.get("moderateIntensityMinutes", 0) or 0) + (stats.get("vigorousIntensityMinutes", 0) or 0)
            }
        except Exception as e:
            raise Exception(f"Error fetching stats: {str(e)}")


# Singleton instance for the application
garmin_client = GarminClient()
