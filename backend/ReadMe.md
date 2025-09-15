# Scholar Base (Backend)

Backend API for a Student Project Datacenter built with FastAPI and SQLModel. It supports JWT authentication, role-based access (Student, Supervisor, Admin), project management with document uploads to Cloudinary, and background cleanup via Celery and Redis.

No Docker instructions are included in this README by request.

---

## Features
- Authentication with JWT (OAuth2 Password Flow)
- Role-based registration and access control (Student, Supervisor, Admin)
- Student profile with matriculation number
- Projects: create, list, read, update, delete, review (approve/reject)
- Tagging and search by tags/metadata
- Cloudinary document uploads with validation (PDF/DOC/DOCX/TXT/PPT/PPTX)
- SQLModel models + Alembic migrations
- OpenAPI docs with JWT security (Swagger at `/docs`)

---

## Tech Stack
- FastAPI, Starlette, Uvicorn
- SQLModel (SQLAlchemy) + Alembic
- SQLite by default (PostgreSQL supported via `DATABASE_URL`)
- python-jose, passlib[bcrypt] for auth
- Celery + Redis for background jobs
- Cloudinary SDK for file storage

---

## Quickstart (Windows PowerShell)

From `backend/`:

```pwsh
# 1) Create and activate a virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# 2) Install dependencies
pip install -r requirements.txt

# 3) Create a local env file
copy .env.example .env

# 4) Start Redis (ensure Redis is installed and running)
# If you have redis-server in PATH, simply run:
redis-server

# 5) Run the API
uvicorn main:app --reload

# 6) In another terminal, start Celery worker and beat
celery -A celery_app worker --loglevel=info
celery -A celery_app beat --loglevel=info
```

Visit `http://127.0.0.1:8000/docs` for interactive API docs.

---

## Environment Variables
Copy `.env.example` to `.env` and set values:

- `ENV_STATE` = `dev` or `prod`
- `DEV_DATABASE_URL` = e.g., `sqlite:///data.db` (default)
- `PROD_DATABASE_URL` = e.g., `postgresql+psycopg2://user:pass@host/db` (optional)
- `REDIS_URL`, `CELERY_BROKER_URL`, `CELERY_RESULT_BACKEND` (default: local Redis)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- `SECRET_KEY` (optional; JWT secret, defaults to a dev value if unset)

Database URL actually used at runtime comes from `config.py` based on `ENV_STATE`.

---

## Database
- Default: SQLite file at `data.db`
- Models are defined with SQLModel (`models/account.py`, `models/projects.py`)
- Alembic migration setup is present in `alembic/`

Common Alembic commands (run from `backend/`):

```pwsh
# Autogenerate a migration after model changes
alembic revision --autogenerate -m "your message"

# Apply migrations
alembic upgrade head
```

---

## Background Jobs (Celery)
- Celery app is configured in `celery_app.py`
- Cleanup task: `tasks.project_cleanup.cleanup_pending_projects`
	- Scheduled daily at 02:00 UTC by Celery Beat
	- Removes Cloudinary documents from projects still in `Pending` status and created more than 1 hour ago
	- Database rows are kept; only the `document_url` is cleared

Run workers locally:

```pwsh
celery -A celery_app worker --loglevel=info
celery -A celery_app beat --loglevel=info
```

---

## API Overview

Base prefix: `/api`

- Auth
	- `POST /api/auth/register/student`
	- `POST /api/auth/register/supervisor`
	- `POST /api/auth/register/admin`
	- `POST /api/auth/login` (OAuth2 form: `username`, `password`)
	- `POST /api/auth/login/json` (JSON body)
	- `GET  /api/auth/me`

- Projects
	- `GET    /api/projects/` (current user's scope: student/supervisor/admin)
	- `GET    /api/projects/all` (admin or any authenticated user per code path)
	- `GET    /api/projects/supervised-projects` (supervisors only)
	- `GET    /api/projects/{project_id}`
	- `POST   /api/projects/` (multipart form)
		- fields: `title`, `description`, `year`, `supervisor_id?`, `file_url?`, `tags[]?`, `document?` (UploadFile)
	- `PATCH  /api/projects/{project_id}` (multipart form; supports updating tags and re-uploading document)
	- `DELETE /api/projects/{project_id}` (supervisor/admin, ownership enforced)
	- `PUT    /api/projects/{project_id}/review?status=Approved|Rejected` (supervisor/admin)

- Tags
	- `GET  /api/tags/`
	- `GET  /api/tags/{project_id}/tags`
	- `DELETE /api/tags/{project_id}/tags` (body: list of enum values)
	- `POST /api/tags/search` (body supports `tags`, `name`, `title`, `matric_no`, `student_name`)

All authenticated routes require a `Bearer` token. The OpenAPI schema marks protected endpoints and supports Authorize via the Swagger UI.

---

## Architecture and Database Design (PDF)
A separate PDF summarizing the system architecture and database design is generated at `docs/architecture_database_design.pdf`.

To (re)generate the PDF locally:

```pwsh
# From backend/
pip install reportlab
python .\docs\generate_architecture_pdf.py
```

---

## Notes
- This README intentionally excludes any Docker content.
- Ensure Redis is running before starting Celery worker/beat.
- Cloudinary credentials must be valid to upload documents.
