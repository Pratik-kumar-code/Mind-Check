# MInd-Check
A Online Mental Health Assessment &amp; Wellness Checker.

## Run locally

The frontend and API run as separate local services. Start both before logging
in:

```bash
# terminal 1 (API, port 5000)
npm run dev:backend

# terminal 2 (frontend, port 5173)
npm run dev
```

MongoDB must be available at `mongodb://127.0.0.1:27017/mindwell`, or set
`MONGODB_URI` for the backend. The login page sends `POST /login` to
`http://localhost:5000`; CORS permits the Vite local origin.
# Week 1 - Backend Database Schema



