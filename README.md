# My Personal Blog

My personal blog website, built with a React frontend and Django REST Framework backend.

🌐 **Live Blog:** [https://blog.imranansari.in](https://blog.imranansari.in)  
⚙️ **Backend API:** [https://blog-api.imranansari.in](https://blog-api.imranansari.in)  
📚 **Production API Documentation (Swagger):** [https://blog-api.imranansari.in/api/docs/](https://blog-api.imranansari.in/api/docs/)

## Features

- **React frontend** for the blog experience
- **Django REST Framework API**
- **User authentication** with JWT and email OTP verification
- **Blog management** with rich-text content and image uploads
- **Comments and likes** on blog posts
- **PostgreSQL** for data storage
- **Redis caching** for improved API performance
- **Interactive API documentation** with Swagger UI and ReDoc

## Tech Stack

- **Frontend:** React
- **Backend:** Python, Django, Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT, SimpleJWT, email OTP
- **Caching:** Redis
- **Deployment:** Docker, Gunicorn
- **API documentation:** drf-spectacular

## Run Locally

### 1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

### 2. Set up the backend

Use Python 3.10 for the pinned backend dependencies.

```bash
python3.10 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Create a `.env` file in the backend project directory and configure the required Django secret, database, email, and Redis settings. Use the environment variable names expected by your `settings.py`; never commit real credentials.

### 3. Set up the database and migrations

Make sure PostgreSQL and Redis are running and configured in your environment.

```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Follow the frontend's own setup instructions and environment configuration to run the React app locally.

## Production

- **Website:** [blog.imranansari.in](https://blog.imranansari.in)
- **Backend API:** [blog-api.imranansari.in](https://blog-api.imranansari.in)
- **Swagger API Docs:** [blog-api.imranansari.in/api/docs/](https://blog-api.imranansari.in/api/docs/)

Production deployment uses the project's configured services and environment variables. Keep `DEBUG=False` in production and store secrets outside the repository.
