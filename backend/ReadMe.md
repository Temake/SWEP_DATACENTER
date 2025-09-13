#  Scholar Base (Backend)

This is the backend for the Student Project Datacenter built with **FastAPI + SQLModel**.  
It handles authentication, user roles (Admin, Supervisor, Student), project management, and file uploads.

---

## Features
- User authentication (JWT-based)
- Role-based registration (Admin, Supervisor, Student)
- Student-specific fields (e.g., Matric No)
- CRUD for projects
- Supervisor & admin management
- SQLModel + Alembic migrations
- Auto-generated API docs (Swagger & Redoc)

---

## 🛠 Tech Stack
- **FastAPI** – backend framework
- **SQLModel** – ORM & database models
- **Alembic** – database migrations
- **PostgreSQL** – database (can start with SQLite for dev)
- **JWT** – authentication
- **Uvicorn** – ASGI server

---

##  Setup Instructions

### 1. Clone repo
```bash
git clone https://github.com/Temake/SWEPS_DATACENTER.git
cd backend
```

### Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Install and Start Redis
Celery requires Redis as a message broker. Install Redis:

**On Windows:**
1. Download Redis from https://github.com/microsoftarchive/redis/releases
2. Extract and run `redis-server.exe`

**On Linux/Mac:**
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# MacOS
brew install redis

# Start Redis
redis-server
```

### Create Env File
```bash
cp .env.example .env     # Linux/Mac
copy .env.example .env   # Windows
```

Update your `.env` file with the required Redis and Cloudinary configuration.

### Run The Application

#### 1. Start Redis Server (if not already running)
```bash
redis-server
```

#### 2. Start FastAPI Server
```bash
uvicorn main:app --reload
```

#### 3. Start Celery Worker (in a new terminal)
```bash
# Windows PowerShell
.\start_celery_worker.ps1

# Linux/Mac
./start_celery_worker.sh

# Or manually:
celery -A celery_app worker --loglevel=info
```

#### 4. Start Celery Beat Scheduler (in another new terminal)
```bash
# Windows PowerShell
.\start_celery_beat.ps1

# Linux/Mac
./start_celery_beat.sh

# Or manually:
celery -A celery_app beat --loglevel=info
```

---

## 🔄 Celery Background Tasks

The application includes automated cleanup tasks powered by Celery and Redis:

### Automated Project Cleanup
- **Schedule**: Runs daily at 2:00 AM UTC
- **Purpose**: Cleans up pending projects older than 2 days
- **Action**: Deletes documents from Cloudinary but keeps database records
- **Benefit**: Students can re-submit documents for the same project

### Manual Cleanup
You can trigger manual cleanup for specific projects:
```python
from tasks.project_cleanup import manual_cleanup_project
result = manual_cleanup_project.delay(project_id)
```

### Monitoring Tasks
- Check Celery worker status: Monitor the worker terminal
- View task results: Check logs in the worker terminal
- Failed tasks: Automatically retried up to 3 times

### Management Script
Use the included management script for easier task management:

```bash
# List all pending projects
python manage_tasks.py list

# Show projects that would be cleaned up (older than 2 days)
python manage_tasks.py old

# Trigger full cleanup manually
python manage_tasks.py cleanup

# Clean up a specific project
python manage_tasks.py manual --project-id 123

# Show help
python manage_tasks.py help
```

---