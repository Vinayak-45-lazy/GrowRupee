# PayPilot AI — AI Merchant Growth Agent

> **Built for the Razorpay AI Builder Internship — Track 1: AI Growth & Agentic Commerce**

PayPilot AI is an agentic food & product commerce platform that helps merchants increase **Average Order Value (AOV)** and **Revenue** through deterministic order co-occurrence analysis, natural-language Groq AI cart recommendations, and an integrated **Razorpay Test Mode** payment verification flow.

---

## 🎯 Problem Statement & Track 1 Alignment

Traditional e-commerce platforms treat cross-selling and growth advice as passive, static rule sets or separate back-office reports. 

**PayPilot AI turns commerce into an active agentic growth loop**:
- **Deterministic Analytics Engine**: Computes real item co-occurrence frequencies from past merchant orders in Express.
- **Agentic Checkout Upsell**: Uses Groq Llama 3 to phrase high-converting, personalized complementary offers directly inside the customer's cart.
- **Razorpay Test Payments**: Seamlessly processes orders with end-to-end HMAC-SHA256 signature verification.
- **AI Growth Advisor**: Summarizes store performance metrics into structured data and prompts Groq Llama 3 to output actionable strategies (bundling, pricing, AOV optimization) for the merchant.

> [!NOTE]
> **Razorpay Integration Notice**: This application uses **Razorpay Test Mode APIs only** (Key ID / Secret). No real payments or credit cards are involved.

---

## ✨ Key Features

1. **AI Co-Occurrence Cart Upsell**:
   - Analyzes cart items against historical order patterns.
   - Groq Llama 3 phrases appetizing complementary offers (*"Pairs perfectly with your Gourmet Cheeseburger — add Crispy Garlic Fries for just ₹90!"*).
   - One-click upsell acceptance with dynamic total recalculation.

2. **Razorpay Test Mode Checkout & Verification**:
   - Backend calls Razorpay Orders API (`/api/create-order`) to generate a valid `razorpay_order_id`.
   - Opens official `Checkout.js` modal on the customer frontend.
   - HMAC-SHA256 signature verification (`/api/verify-payment`) confirms payment validity and updates order status to `paid` or `failed`.

3. **Merchant Growth Dashboard**:
   - Computes Total Revenue, Average Order Value (AOV), Upsell Acceptance Rate, and Best-Selling Products deterministically from Firestore data.
   - Highlights top co-occurrence pair opportunities (e.g. *Burger + Garlic Fries*).

4. **AI Merchant Growth Advisor**:
   - Interactive panel allowing merchants to ask strategic questions (*"How can I boost my AOV?"*).
   - Express aggregates raw store numbers into a compact summary, and Groq generates executive business plans.

5. **Merchant Orders Management**:
   - Live transaction tracking table with order items, base amount vs AI upsell impact, Razorpay payment IDs, and status badges (`PAID`, `CREATED`, `FAILED`).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│             React Frontend (Vite + Tailwind)           │
│     Storefront • Cart Drawer • Merchant Dashboard      │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│             Node.js + Express Backend Service          │
│  ├── /api/products   → Firestore Catalog CRUD          │
│  ├── /api/orders     → Deterministic Analytics         │
│  ├── /api/recommend  → Co-occurrence + Groq Phrasing   │
│  ├── /api/insight    → Stats Summary + Groq Strategy   │
│  ├── /api/create-order   → Razorpay Orders API (Test)  │
│  └── /api/verify-payment → HMAC-SHA256 Verification    │
└──────────┬───────────────────┬───────────────────┬─────┘
           │                   │                   │
           ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│ Firebase Admin   │ │ Razorpay Test    │ │ Groq Llama 3 API │
│ Firestore Data   │ │ Checkout SDK     │ │ AI Agent Engine  │
└──────────────────┘ └──────────────────┘ └──────────────────┘
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Firebase JS SDK
- **Backend**: Node.js, Express, Firebase Admin SDK, Razorpay Node SDK, Groq SDK
- **Database**: Firebase Firestore (Native mode) + Zero-Config Local Mock DB Fallback
- **Payments**: Razorpay Test Mode (`checkout.js` modal + HMAC-SHA256 verification)
- **AI Engine**: Groq API (`llama-3.3-70b-versatile` model)

---

## 🚀 Setup & Installation Guide

### 1. Clone & Install Dependencies

```bash
# Clone the repository
git clone https://github.com/Vinayak-45-lazy/GrowRupee.git
cd GrowRupee

# Install Backend Dependencies
cd server
npm install

# Install Frontend Dependencies
cd ../client
npm install
```

### 2. Environment Variables Configuration

Copy template files in both `server/` and `client/`:

#### Server Configuration (`server/.env`)
```env
PORT=5000
GROQ_API_KEY=gsk_your_groq_api_key_here
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### Client Configuration (`client/.env`)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
```

> [!TIP]
> **Zero-Config Fallback Mode**: If environment variables are omitted, PayPilot AI automatically runs in local mock mode so evaluators can instantly test the app out-of-the-box!

---

### 3. Seed Firestore Database

Populate the database with 8 gourmet products and **75 realistic order histories** with co-occurrence data:

```bash
# Run seeding script from root directory
node seed/seedData.js
```

---

### 4. Run Locally

```bash
# Start Backend Server (Port 5000)
cd server
npm start

# Start Frontend App (Port 3000)
cd client
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 🌐 Live Deployment Instructions

- **Frontend Hosting**: Vercel (`client` folder, Vite preset)
- **Backend Hosting**: Render Web Service (`server` folder, Node.js)

### Demo Evaluation Steps:
1. Open Storefront → Add **Gourmet Cheeseburger** to cart.
2. Open Cart → Observe live **AI Co-Occurrence Recommendation** (*Crispy Garlic Fries*).
3. Click **Add for ₹90** → Notice dynamic subtotal calculation.
4. Click **Pay with Razorpay Test** → Complete transaction via Razorpay modal.
5. Click **Merchant Login** (or 1-Click Demo Login) → View **Dashboard Analytics** & **AI Growth Insights**.

---

## 📜 Architectural Integrity

- **Math is Math (Express)**: Revenue, AOV, best-seller counts, and co-occurrence matrix frequencies are calculated mathematically in Express. LLMs never invent numbers.
- **Language is Language (Groq)**: Groq's sole responsibility is converting raw co-occurrence data into natural customer offers and executive merchant growth strategies.
