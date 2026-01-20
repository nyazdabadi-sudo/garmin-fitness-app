"""
Metrics routes for sleep, body battery, stress, and stats data.
"""

from flask import Blueprint, request, jsonify
from services.garmin_client import garmin_client

metrics_bp = Blueprint('metrics', __name__, url_prefix='/api/metrics')


@metrics_bp.route('/sleep', methods=['GET'])
def get_sleep():
    """
    Get sleep data.

    Query params:
    - days: Number of days to fetch (default: 7)
    """
    try:
        days = request.args.get('days', 7, type=int)
        days = min(max(days, 1), 30)  # Limit between 1 and 30 days

        data = garmin_client.get_sleep_data(days)
        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@metrics_bp.route('/body-battery', methods=['GET'])
def get_body_battery():
    """
    Get body battery data.

    Query params:
    - days: Number of days to fetch (default: 7)
    """
    try:
        days = request.args.get('days', 7, type=int)
        days = min(max(days, 1), 30)

        data = garmin_client.get_body_battery(days)
        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@metrics_bp.route('/stress', methods=['GET'])
def get_stress():
    """
    Get stress data.

    Query params:
    - days: Number of days to fetch (default: 7)
    """
    try:
        days = request.args.get('days', 7, type=int)
        days = min(max(days, 1), 30)

        data = garmin_client.get_stress_data(days)
        return jsonify({
            "success": True,
            "data": data,
            "count": len(data)
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@metrics_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get today's daily stats summary."""
    try:
        data = garmin_client.get_stats()
        return jsonify({
            "success": True,
            "data": data
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
