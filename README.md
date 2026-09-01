# Invoicer

AI Invoice & Billing sistema: React frontendas ir Express backendas su PostgreSQL ir Gemini AI.

## Struktūra

- `backend/` — Node.js / Express API (klientai, sąskaitos, mokėjimai, ataskaitos, AI)
- `frontend/invoicer/` — Vite + React UI

## Paleidimas

### Backend

```bash
cd backend
npm install
cp .env.example .env
# užpildyk DATABASE_URL, JWT_SECRET ir GEMINI_API_KEY
npm run migrate
npm run seed   # nebūtina
npm run dev    # http://localhost:8000
```

Reikalauja **Node.js 20+**.

### Frontend

```bash
cd frontend/invoicer
npm install
npm run dev    # http://localhost:5173
```

Vite proxy nukreipia `/api` į `http://localhost:8000`.
