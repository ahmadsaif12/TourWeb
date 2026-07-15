# HamroTour

HamroTour is a rebuilt travel marketplace with:

- Django REST backend
- Next.js frontend
- Amazon S3 media storage in place of Cloudinary
- Docker Compose for local orchestration

## Layout

- `backend/` Django project and REST API
- `frontend/` Next.js app router frontend
- `docker-compose.yml` local stack

## Local setup

1. Copy `.env.example` to `.env`.
2. Fill in your database and optional AWS S3 values.
3. Run `docker compose up --build`.

## Backend

The backend exposes:

- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `POST /api/auth/refresh/`
- `POST /api/auth/logout/`
- `GET /api/auth/me/`
- `GET/POST /api/listings/`
- `GET/PATCH/DELETE /api/listings/:slug/`
- `POST/DELETE /api/listings/:slug/wishlist/`
- `GET/POST /api/bookings/`
- `GET/POST /api/reviews/`
- `POST /api/contact/`

## Notes

- Set `USE_S3=1` and the AWS variables to store uploads in S3.
- The frontend proxies `/api/*` to the Django backend through Next.js rewrites.
