# Garmin Fitness Analysis App

A full-stack fitness analysis application with a Flask backend (using garminconnect) and React PWA frontend (Tailwind CSS).

## Features

- **Dashboard**: Overview of sleep, body battery, stress, and daily stats
- **Activities**: View and filter activities by type, track progress over time
- **Insights**: Weekly/monthly analysis with trend detection
- **Best Performances**: Track your PRs per activity type
- **Recommendations**: Training suggestions based on recovery status
- **PWA Support**: Install as a native app on mobile devices

## Project Structure

```
garmin-fitness-app/
├── backend/
│   ├── app.py                 # Flask app entry point
│   ├── config.py              # Configuration
│   ├── requirements.txt       # Python dependencies
│   ├── services/
│   │   ├── garmin_client.py   # Garmin Connect API wrapper
│   │   ├── data_processor.py  # Data aggregation & insights
│   │   └── recommendations.py # Training recommendations
│   ├── models/
│   │   └── activities.py      # Activity type definitions
│   └── routes/
│       ├── auth.py            # Authentication
│       ├── metrics.py         # Sleep, body battery, stress
│       └── activities.py      # Activities & insights
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── hooks/             # Custom hooks
│   │   └── services/          # API client
│   └── public/                # Static assets & PWA config
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.9+
- Node.js 18+
- Garmin Connect account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy the environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

5. Start the backend server:
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev -- --host
   ```

The app will be available at `http://localhost:5173`.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with Garmin credentials
- `GET /api/auth/status` - Check auth status
- `POST /api/auth/logout` - Logout

### Metrics
- `GET /api/metrics/sleep?days=7` - Sleep data
- `GET /api/metrics/body-battery?days=7` - Body battery
- `GET /api/metrics/stress?days=7` - Stress levels
- `GET /api/metrics/stats` - Daily stats

### Activities
- `GET /api/activities?type=running&days=30` - Activities by type
- `GET /api/activity-types` - Available activity types

### Insights
- `GET /api/insights?period=weekly` - Aggregated insights
- `GET /api/best-performances?type=running` - Best performances
- `GET /api/recommendations` - Training recommendations

## Adding New Activity Types

Activity types are defined in `backend/models/activities.py`. To add a new type:

```python
ACTIVITY_TYPES = {
    # ... existing types ...
    "tennis": {
        "garmin_types": ["tennis", "racquet_sports"],
        "metrics": ["duration", "calories", "heart_rate"],
        "display_name": "Tennis",
        "icon": "tennis"
    }
}
```

## Tech Stack

### Backend
- Flask
- flask-cors
- garminconnect
- python-dotenv

### Frontend
- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide React (icons)
- React Router

## License

MIT
