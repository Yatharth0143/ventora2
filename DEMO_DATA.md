# Ventora — Demo Credentials & Test Data

This document contains pre-configured, verified hardcoded demo credentials and test data for both **Innovators (Founders)** and **Investors** across the Ventora platform.

---

## 1. Hardcoded Account Credentials

### A. Innovator / Founder Accounts

| Attribute | Primary Innovator | Alternate Pro Innovator |
| :--- | :--- | :--- |
| **Email** | `innovator@ventora.in` | `priya@example.com` |
| **Password** | `Password@123` | `Password@123` |
| **Full Name** | Priya Sharma (Innovator) | Priya Sharma |
| **Role** | `innovator` / `founder` | `innovator` / `founder` |
| **Tier** | Free Founder | Free Founder |
| **Primary Language** | Hindi (`hi`) & English (`en`) | Hindi (`hi`) |
| **Tech Preferences** | `software`, `ai`, `fintech` | `software`, `fintech` |
| **Sample Deck Attached** | FinFlow SME Payment Automation | FinFlow Seed Pitch Deck |

### B. Investor Accounts

| Attribute | Primary Investor | Alternate Pro Investor |
| :--- | :--- | :--- |
| **Email** | `investor@ventora.in` | `vikram@example.com` |
| **Password** | `Password@123` | `Password@123` |
| **Full Name** | Vikram Mehta (Investor) | Vikram Mehta |
| **Role** | `investor` | `investor` |
| **Verification Status** | Verified VC Partner (`verified: true`) | Verified VC (`verified: true`) |
| **Investor Type** | Early Stage & Seed VC | Institutional Micro-VC |
| **Investment Range** | ₹50L – ₹2Cr ($60K – $240K) | ₹1Cr – ₹5Cr ($120K – $600K) |
| **Sector Mandates** | Software, Artificial Intelligence, Hardware, FinTech | FinTech, SaaS, AI |
| **Feed Preferences** | `software`, `ai`, `hardware`, `fintech` | `software`, `ai`, `fintech` |

---

## 2. API Authentication Payloads

### Legacy REST API (`/api/login`)
```bash
# Innovator Login
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "innovator@ventora.in", "password": "Password@123"}'

# Investor Login
curl -X POST http://localhost:5001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email": "investor@ventora.in", "password": "Password@123"}'
```

### Modern FastAPI Backend (`/api/auth/demo-login`)
```bash
# Instant Token Generation
curl -X POST http://localhost:8000/api/auth/demo-login \
  -H "Content-Type: application/json" \
  -d '{"email": "innovator@ventora.in", "name": "Priya Sharma", "role": "founder"}'
```

---

## 3. Web UI Access Instructions (Port 5173 / React Vite)

1. Open `http://localhost:5173/login` in your browser.
2. Under **"1-Click Demo Personas"**:
   - Click **"Priya Sharma"** to enter the **Founder Dashboard** with an audited pitch deck.
   - Click **"Vikram Mehta"** to enter the **Investor Desk & Pitch Stream**.
3. Or type the credentials above into the **Custom Sign-in** form.

---

## 4. Key Feature Paths

- **Instagram-Style Pitch Feed**: `/feed` (ranked by user's tech preferences, includes video playback)
- **Market Intelligence & Gaps Explorer**: `/market-analysis` (TAM/SAM/SOM, India ₹ vs Global $, Ideal Investors)
- **Pitch Deck Upload with Optional Video**: `/upload` (PDF slide parsing + MP4/WebM pitch reel)
- **Admin & 7-Day Pitch Verdicts**: `/admin` (Garbage deck retention, investor warning & block SLA)
- **Profile & Preference Tuning**: `/profile` (Manage sector tags: Software, AI, Hardware, FinTech)
