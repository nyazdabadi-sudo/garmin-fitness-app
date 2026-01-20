"""
Garmin Fitness Analysis App - Flask Backend
"""

from flask import Flask
from flask_cors import CORS
from config import Config
from routes import auth_bp, metrics_bp, activities_bp


def create_app():
    """Create and configure the Flask application."""
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend communication
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })

    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(metrics_bp)
    app.register_blueprint(activities_bp)

    # Health check endpoint
    @app.route('/api/health')
    def health():
        return {"status": "healthy", "service": "garmin-fitness-api"}

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(
        host=Config.HOST,
        port=Config.PORT,
        debug=Config.DEBUG
    )
