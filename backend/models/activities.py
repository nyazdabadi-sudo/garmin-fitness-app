"""
Activity type definitions - extensible design for adding new activity types.
To add a new activity type, simply add an entry to the ACTIVITY_TYPES dictionary.
"""

ACTIVITY_TYPES = {
    "running": {
        "garmin_types": ["running", "trail_running", "treadmill_running"],
        "metrics": ["distance", "pace", "heart_rate_zones", "cadence", "elevation"],
        "display_name": "Running",
        "icon": "running"
    },
    "cycling": {
        "garmin_types": ["cycling", "road_biking", "mountain_biking", "indoor_cycling"],
        "metrics": ["distance", "speed", "power", "cadence", "elevation"],
        "display_name": "Cycling",
        "icon": "cycling"
    },
    "swimming": {
        "garmin_types": ["swimming", "lap_swimming", "open_water_swimming"],
        "metrics": ["distance", "pace", "strokes", "swolf"],
        "display_name": "Swimming",
        "icon": "swimming"
    },
    "gym": {
        "garmin_types": ["strength_training", "gym", "fitness_equipment"],
        "metrics": ["sets", "reps", "duration", "calories"],
        "display_name": "Gym/Strength",
        "icon": "gym"
    },
    "football": {
        "garmin_types": ["soccer", "football"],
        "metrics": ["duration", "calories", "intensity", "heart_rate_zones"],
        "display_name": "Football/Soccer",
        "icon": "football"
    },
    "walking": {
        "garmin_types": ["walking", "hiking"],
        "metrics": ["distance", "steps", "elevation", "duration"],
        "display_name": "Walking/Hiking",
        "icon": "walking"
    },
    "yoga": {
        "garmin_types": ["yoga", "pilates"],
        "metrics": ["duration", "calories", "heart_rate"],
        "display_name": "Yoga/Pilates",
        "icon": "yoga"
    },
    "cardio": {
        "garmin_types": ["cardio", "elliptical", "stair_climbing"],
        "metrics": ["duration", "calories", "heart_rate_zones"],
        "display_name": "Cardio",
        "icon": "cardio"
    }
}


def get_activity_config(activity_type: str) -> dict | None:
    """Get configuration for a specific activity type."""
    return ACTIVITY_TYPES.get(activity_type.lower())


def get_all_activity_types() -> list[str]:
    """Get list of all supported activity types."""
    return list(ACTIVITY_TYPES.keys())


def get_garmin_types_for_activity(activity_type: str) -> list[str]:
    """Get Garmin activity type names for a given activity type."""
    config = get_activity_config(activity_type)
    return config["garmin_types"] if config else []


def find_activity_type_by_garmin_type(garmin_type: str) -> str | None:
    """Find our activity type category for a given Garmin activity type."""
    garmin_type_lower = garmin_type.lower().replace(" ", "_")
    for activity_type, config in ACTIVITY_TYPES.items():
        if garmin_type_lower in [t.lower() for t in config["garmin_types"]]:
            return activity_type
    return None
