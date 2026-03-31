# CUTS - Campus Unified Ticketing System (Maseno University)

React (Vite) + Django/DRF full-stack ticketing for multi-school university.

## Windows 11 Setup (Current System)

### Prerequisites
- Python 3.11+ (choco install python or python.org)
- Node.js 20+ (nodejs.org or choco install nodejs)
- Docker Desktop (for Postgres/Redis)
- Git

### 1. Clone/Init
```
git init
git add .
git commit -m "Initial"
```

### 2. Docker DB/Redis (Recommended for Windows)
```
docker compose up -d postgres redis
```

### 3. Backend
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements/development.txt
copy ..\ .env.example .env  # Edit DB_USER/PASS etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 4. Frontend
```
cd frontend
npm install
npm run dev
```

### APIs
- Backend: http://localhost:8000/api/
- Frontend: http://localhost:3000 (proxies /api)

## Tech Stack
- Backend: Django 4+, DRF, Postgres, Redis, Celery, Channels
- Frontend: React 18, Vite, Redux Toolkit, MUI

See TODO.md for phases.

