# PayPilot AI — AI Merchant Growth Agent

> **Built for the Razorpay AI Builder Internship — Track 1: AI Growth & Agentic Commerce**

PayPilot AI is an agentic food & product commerce platform designed to help merchants increase their **Average Order Value (AOV)** and **Revenue** through deterministic order co-occurrence analysis, natural-language Groq AI cart recommendations, and an integrated **Razorpay Test Mode** payment verification flow.

---

## ⚡ Core Story & End-to-End Demo Flow

1. **Merchant Order History**: Store historical data (~75 past orders) contains purchasing patterns (e.g., Gourmet Cheeseburger + Crispy Garlic Fries are frequently bought together).
2. **Deterministic Co-Occurrence Engine**: When a customer adds an item to their cart, Express calculates co-occurrence frequencies over historical orders.
3. **Groq AI Cart Upsell**: Groq Llama 3 phrases the top co-occurring item into an appetizing, natural-language offer (*"Pairs perfectly with your Gourmet Cheeseburger — add Crispy Garlic Fries for just ₹90!"*).
4. **Razorpay Test Mode Checkout**: Customer accepts the upsell, and completes test payment via Razorpay Checkout.
5. **HMAC SHA256 Verification**: Backend verifies the Razorpay signature against Key Secret and marks the Firestore order status as `paid`.
6. **Merchant Dashboard & Growth Agent**: Merchant views real-time metrics (Revenue, AOV, Best Sellers, Upsell Acceptance Rate) and asks the **Groq AI Growth Advisor** for actionable business strategies.

---

## 🏗️ Architecture & Tech Stack

```
React Frontend (Vite + Tailwind CSS)
       │
       ▼
Node.js + Express Backend Service (Single Express Server)
   ├── /api/products         → Firestore Catalog CRUD
   ├── /api/orders           → Firestore Orders & Aggregations
   ├── /api/recommend        → Express Co-occurrence + Groq Llama 3 Phrasing
   ├── /api/insight          → Deterministic Store Summary + Groq Strategy
   ├── /api/create-order     → Razorpay Orders API (Test Mode)
   └── /api/verify-payment   → HMAC SHA256 Signature Verification
       │
       ▼
Firebase Firestore (Data) + Razorpay Test API (Payments) + Groq API (AI)
```

- **Frontend**: React, Vite, Tailwind CSS, Lucide Icons, Firebase Auth SDK
- **Backend**: Node.js, Express, Firebase Admin SDK, Razorpay Node SDK, Groq SDK
- **Database**: Firebase Firestore (Native mode) + Zero-Config In-Memory Mock Fallback
- **Payments**: Razorpay Test Mode (`checkout.js` + HMAC-SHA256 signature verification)
- **AI Engine**: Groq API (Llama 3.3 models) for natural language phrasing and strategic insights

---

## 🛠️ Project Setup & Installation Guide

### Prerequisites
- Node.js v18+ and npm installed

### 1. Repository Structure
```
paypilot-ai/
├── client/          # React + Vite + Tailwind CSS
├── server/          # Node.js + Express Backend
├── seed/            # Seeding script for historical order data
└── README.md
```

### 2. Install Dependencies

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 3. Environment Variables Setup

Create `.env` files in both `server/` and `client/` directories based on the `.env.example` templates.

#### `server/.env`
```env
PORT=5000
GROQ_API_KEY=gsk_your_groq_api_key_here
RAZORPAY_KEY_ID=rzp_test_your_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY_HERE\n-----END PRIVATE KEY-----\n"
```

#### `client/.env`
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-app-id
```

> **Note**: PayPilot AI includes a **Zero-Config Fallback Mode**. If API keys are missing, the server will seamlessly run using in-memory mock stores and template-driven responses, allowing instant local testing without setting up external accounts!

---

### 4. Seed the Database

Populate Firestore with 8 gourmet food items and ~75 historical orders containing realistic co-occurrence relationships:

```bash
# Run from root directory
node seed/seedData.js
```

---

### 5. Running the Application Locally

#### Start the Express Backend (Port 5000)
```bash
cd server
npm run dev
```

#### Start the React Frontend (Port 3000)
```bash
cd client
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 🎯 Verification & Demo Workflow

1. **Customer Cart & AI Recommendation**:
   - Navigate to `http://localhost:3000/` (Storefront).
   - Add **Gourmet Cheeseburger** to your cart.
   - Open Cart -> See live **AI Growth Opportunity** banner (*"Pairs perfectly with your Gourmet Cheeseburger — add Crispy Garlic Fries for just ₹90!"*).
   - Click **Add for ₹90**. Notice the total updates dynamically to include the upsell item.

2. **Razorpay Test Payment & Signature Verification**:
   - Click **Pay ₹270 with Razorpay Test**.
   - Complete payment via Razorpay's Test Mode Checkout modal.
   - Observe signature verification confirmation and receipt display.

3. **Merchant Analytics & AI Advisor**:
   - Click **Merchant Login** (or 1-Click Demo Login).
   - View **Dashboard** metrics: Total Revenue, Average Order Value (AOV), Upsell Acceptance Rate, Best Sellers.
   - Go to **AI Growth Insights** -> Click *"How can I grow total sales this month?"* -> View Groq-generated strategic business plan.
   - Go to **Orders List** -> Verify your completed test transaction appears with `PAID` status and Razorpay Payment ID.

---

## 📜 Key Architectural Distinction

- **Deterministic Analytics (Express)**: Co-occurrence frequencies, order totals, revenue aggregations, AOV, and best-seller counts are calculated mathematically in Express. LLMs do not guess numbers.
- **Natural Language Phrasing (Groq API)**: Groq's only job is converting raw co-occurrence data and structured store summaries into natural, appetizing customer offers and executive merchant growth strategies.
