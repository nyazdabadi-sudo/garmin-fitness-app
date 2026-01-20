"""
Activities routes for fetching and analyzing activity data.
"""

from flask import Blueprint, request, jsonify
from services.garmin_client import garmin_client
from services.data_processor import DataProcessor
from services.recommendations import RecommendationsEngine
from models.activities import get_all_activity_types, get_activity_config

activities_bp = Blueprint('activities', __name__, url_prefix='/api')


@activities_bp.route('/activities', methods=['GET'])
def get_activities():
    """
    Get activities, optionally filtered by type.

    Query params:
    - type: Activity type filter (e.g., 'running', 'gym')
    - days: Number of days to look back (default: 30)
    - limit: Maximum number of activities (default: 100)
    """
    try:
        activity_type = request.args.get('type')
        days = request.args.get('days', 30, type=int)
        limit = request.args.get('limit', 100, type=int)

        days = min(max(days, 1), 365)
        limit = min(max(limit, 1), 500)

        data = garmin_client.get_activities(
            activity_type=activity_type,
            days=days,
            limit=limit
        )

        return jsonify({
            "success": True,
            "data": data,
            "count": len(data),
            "filters": {
                "type": activity_type,
                "days": days,
                "limit": limit
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@activities_bp.route('/activity-types', methods=['GET'])
def get_activity_types():
    """Get all supported activity types and their configurations."""
    types = get_all_activity_types()
    configs = {t: get_activity_config(t) for t in types}

    return jsonify({
        "success": True,
        "types": types,
        "configurations": configs
    })


@activities_bp.route('/insights', methods=['GET'])
def get_insights():
    """
    Get aggregated insights.

    Query params:
    - period: 'weekly' or 'monthly' (default: 'weekly')
    """
    try:
        period = request.args.get('period', 'weekly')
        processor = DataProcessor(garmin_client)

        if period == 'monthly':
            data = processor.get_monthly_insights()
        else:
            data = processor.get_weekly_insights()

        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@activities_bp.route('/best-performances', methods=['GET'])
def get_best_performances():
    """
    Get best performances per activity type.

    Query params:
    - type: Optional activity type filter
    """
    try:
        activity_type = request.args.get('type')
        processor = DataProcessor(garmin_client)

        data = processor.get_best_performances(activity_type)

        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@activities_bp.route('/recommendations', methods=['GET'])
def get_recommendations():
    """Get training recommendations based on recovery status."""
    try:
        engine = RecommendationsEngine(garmin_client)
        data = engine.get_recommendations()

        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
