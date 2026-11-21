# Ventora — Trust Layer for Startup Fundraising

Ventora is an automated trust layer for early-stage startup fundraising in India. Founders upload pitch decks in Hindi, Hinglish, English, or any of the 22 scheduled Indian languages, and receive an audit whose findings are enforced in code: a contradiction or numeric discrepancy is reported **only if both quotes literally exist in the source slide text with page numbers**.

---

## Key Features & USPs

1. **Anti-Hallucination Quote Validator (USP 2):** Pre-emission filter in `/audit` drops any finding whose quote doesn't literally match extracted text.
2. **Deterministic Lakh/Crore Normalization (USP 2):** Normalizes ₹, $, Lakh, Crore, Million, Billion before comparing values.
3. **Deep Multilingual AI Pipeline (USP 12 & 15):** Sarvam AI for slide layout & extraction + Bhashini for 22 scheduled Indian languages. Original text preserved with "translated" badge.
4. **Tamper-Evident SHA-256 Hash Chain (USP 1):** Every deck view, audit run, finding click, and chat message is hashed into an append-only chain. Public `GET /api/verify/chain` verifies integrity live.
5. **Neo4j Conflict Graph & Auto-Ranking (USP 4 & 5):** Flags if an investor has funded a competing startup with public Tracxn evidence links. Conflicted investors are ranked last.
6. **No-Percentages Fit Matrix (USP 3):** Derived purely from parsed slide tokens with explicit page citations.
7. **Freemium Engine (USP 8):** 3 verifiable findings for free (~₹70 cost). Founder Pro at ₹999/month unlocks full report, investor matching, and direct messaging.
8. **Google OAuth + One-Click Persona Login:** Sign in via Google or pre-configured test personas (Priya Sharma, Vikram Mehta).

---

## Tech Stack

- **Backend:** FastAPI (Python 3.11+), Motor (AsyncIO MongoDB), Neo4j Async Driver, PyPDF2, PyJWT.
- **Frontend:** React 18, Vite, TailwindCSS, React Router v6, Axios, Lucide React, Google OAuth.
- **Databases:** MongoDB Atlas + Neo4j AuraDB.
- **AI / Cloud Services:** Sarvam AI, Bhashini (NLTM), Cloudinary.

---

## Quickstart

### 1. Prerequisites
- Python 3.11+
- Node.js 20+ & pnpm
- MongoDB Atlas & Neo4j Aura (credentials in `.env`)

### 2. Environment Setup
```bash
cp .env.example .env
# Fill in API keys (Sarvam, Bhashini, Cloudinary, Mongo, Neo4j)
```

### 3. Backend Setup
```bash
cd backend
pip install -r requirements.txt
python seed/seed_data.py   # Seeds 20 investors, planted conflicts, and sample decks
uvicorn app.main:app --reload --port 8000
```

### 4. Frontend Setup
```bash
cd frontend
pnpm install
pnpm run dev
```
Open [http://localhost:5173](http://localhost:5173).

---

## One-Command Docker Bring-Up
```bash
docker-compose up --build
```
- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173`
- Public hash verification: `http://localhost:8000/api/verify/chain`

