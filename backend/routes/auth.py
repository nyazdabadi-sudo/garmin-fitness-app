"""
Authentication routes for Garmin Connect login.
"""

from flask import Blueprint, request, jsonify
from services.garmin_client import garmin_client

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login to Garmin Connect.

    Request body:
    {
        "email": "garmin_email",
        "password": "garmin_password"
    }
    """
    data = request.get_json()

    if not data:
        return jsonify({"error": "No data provided"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    result = garmin_client.login(email, password)

    if result["success"]:
        return jsonify(result), 200
    else:
        return jsonify(result), 401


@auth_bp.route('/status', methods=['GET'])
def status():
    """Check authentication status."""
    return jsonify({
        "authenticated": garmin_client.is_authenticated
    })


@auth_bp.route('/logout', methods=['POST'])
def logout():
    """Logout from Garmin Connect."""
    garmin_client.client = None
    garmin_client.is_authenticated = False
    return jsonify({"success": True, "message": "Logged out successfully"})
