# Phase 6: Storage, Database, And Admin Auth

## Decisions

- Database: PostgreSQL managed through Prisma.
- Admin authentication: Auth.js with a credentials provider for one admin user.
- Media storage: Cloudinary for production image, audio, and video uploads.
- Local media uploads into `public/uploads` are intentionally not used for production because many hosts treat application filesystems as ephemeral.

## Environment

Use `.env.example` as the template for required variables:

- `DATABASE_URL`
- `AUTH_SECRET`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `MEDIA_STORAGE_PROVIDER`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `CLOUDINARY_UPLOAD_FOLDER`

## Notes

The admin dashboard is now protected by Auth.js. Media upload requests should go through `POST /api/admin/media`, which requires an authenticated admin session and stores files in Cloudinary.

Prisma schema validation and client generation are part of verification. Apply database migrations only when the target PostgreSQL database is confirmed.
