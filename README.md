# AI-Powered Digital Marketing Analytics and Campaign Optimization System
## Master of Computer Applications (MCA) Academic Capstone Project

An academic-grade, full-stack digital marketing analytics and campaign optimization platform engineered for digital advertising agencies. The system facilitates client onboarding, omnichannel campaign management, daily performance metric logging, automated mathematical KPI evaluation, lead pipeline tracking, cross-campaign comparison, rule-based optimization recommendations, and AI-driven econometric budget allocation.

---

## 1. System Architecture

The application adopts a decoupled **Three-Tier Architecture**:

```
 ┌─────────────────────────────────────────────────────────────┐
 │                Presentation Tier (Frontend)                 │
 │            Angular 18+ (Standalone Components)             │
 │          Tailwind CSS · Reactive Forms · Chart.js           │
 │                   http://localhost:4200                     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ JSON REST API (HTTP)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                 Application Tier (Backend)                  │
 │             Node.js · Express.js · TypeScript               │
 │           Controllers · Services · Auth Middleware          │
 │                   http://localhost:5000                     │
 └──────────────────────────────┬──────────────────────────────┘
                                │ pg Connection Pool (port 5432)
                                ▼
 ┌─────────────────────────────────────────────────────────────┐
 │                   Data Tier (Database)                      │
 │                 Local PostgreSQL Database                   │
 │           7 Normalized Relational Tables (3NF)              │
 │                localhost:5432 / PostgreSQL                  │
 └─────────────────────────────────────────────────────────────┘
```

---

## 2. Directory Structure

```text
├── frontend/                          # Angular 18 Single Page Application
│   ├── angular.json                  # Angular CLI Workspace Configuration
│   ├── package.json                  # Angular dependencies (Angular 18, Tailwind, Chart.js)
│   ├── tsconfig.json                 # TypeScript compiler options
│   ├── tailwind.config.js            # Tailwind CSS design system config
│   └── src/
│       ├── index.html                # HTML entry point
│       ├── styles.css                # Global Tailwind CSS definitions
│       ├── main.ts                   # Bootstrap Application (Angular standalone)
│       └── app/
│           ├── app.config.ts         # Application providers (Router, HttpClient)
│           ├── app.routes.ts         # Angular routes with lazy standalone components
│           ├── app.component.ts      # Shell layout component
│           ├── auth/                 # Admin Login (Reactive Forms, JWT)
│           ├── dashboard/            # Executive Dashboard (8 KPIs, trends)
│           ├── clients/              # Client Management CRUD
│           ├── campaigns/            # Campaign Management CRUD
│           ├── marketing-data/       # Daily performance entry & automated KPIs
│           ├── leads/                # Lead tracking & conversion funnel
│           ├── analytics/            # Multi-dimensional analytics slicer
│           ├── campaign-comparison/  # Comparative matrix with best/worst highlights
│           ├── ai-insights/          # AI briefing & budget allocation simulator
│           ├── recommendations/      # Rule-based campaign recommendation engine
│           ├── reports/              # Printable audit reports & CSV export
│           ├── layout/               # Sidebar & Topbar standalone components
│           └── core/
│               ├── guards/auth.guard.ts
│               ├── services/api.service.ts
│               ├── services/auth.service.ts
│               └── models/types.ts
│
├── backend/                           # Node.js + Express REST API Server
│   ├── package.json                  # Express backend dependencies (pg, bcryptjs, jwt)
│   ├── tsconfig.json                 # Backend TypeScript config
│   └── src/
│       ├── server.ts                 # Express HTTP Server entry point (port 5000)
│       ├── config/db.ts              # PostgreSQL pg.Pool with dual-mode fallback
│       ├── database/
│       │   ├── schema.sql            # PostgreSQL DDL table definitions (7 tables)
│       │   └── seed.sql              # Pre-seeded test records
│       ├── controllers/              # REST API Controllers
│       ├── routes/                   # Express modular routers
│       ├── middleware/auth.ts        # JWT token verification & role authorization
│       ├── services/
│       │   ├── recommendationEngine.ts # Rule-based optimization heuristics
│       │   └── aiService.ts          # AI insights & budget distribution logic
│       └── utils/kpiCalculator.ts     # Safe zero-division KPI formula engine
│
├── .env.example                       # Environment configuration template
└── README.md                          # Documentation and Viva Defense Guide
```

---

## 3. How to Run Locally in VS Code

### Step 1: Clone and Configure Environment
Open the project root in VS Code and copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 2: Set Up Local PostgreSQL Database
Ensure your local PostgreSQL service is running on `localhost:5432`:
```bash
# Create the database
createdb -U postgres marketing_analytics_db

# Run the DDL schema and initial seeds
psql -U postgres -d marketing_analytics_db -f backend/src/database/schema.sql
psql -U postgres -d marketing_analytics_db -f backend/src/database/seed.sql
```

*(Note: If PostgreSQL is not installed locally, the backend automatically activates an in-memory transactional ACID store so the entire application still runs 100% without crashing!)*

### Step 3: Run the Express Backend
Open a terminal in VS Code:
```bash
cd backend
npm install
npm run dev
```
*Backend will start on `http://localhost:5000`.*

### Step 4: Run the Angular 18 Frontend
Open a second terminal in VS Code:
```bash
cd frontend
npm install
npm start
```
*Angular application will start on `http://localhost:4200`.*

---

## 4. Default Admin Credentials

- **Email**: `admin@marketing.com`
- **Password**: `admin123`
- **Role**: `admin`
- **Password Security**: Hashed via `bcrypt` (10 salt rounds)
- **Token**: Signed JWT token with 24-hour expiration

---

## 5. Automated Mathematical KPI Formulas

All metrics are evaluated in `backend/src/utils/kpiCalculator.ts` with division-by-zero guards:

| Metric | Formula | Zero Division Guard |
| :--- | :--- | :--- |
| **CTR** (Click-Through Rate) | $\frac{\text{Clicks}}{\text{Impressions}} \times 100$ | If impressions = 0 $\rightarrow 0.00\%$ |
| **CPC** (Cost Per Click) | $\frac{\text{Ad Spend}}{\text{Clicks}}$ | If clicks = 0 $\rightarrow ₹0.00$ |
| **CPL** (Cost Per Lead) | $\frac{\text{Ad Spend}}{\text{Leads}}$ | If leads = 0 $\rightarrow ₹0.00$ |
| **Conversion Rate** | $\frac{\text{Conversions}}{\text{Leads}} \times 100$ | If leads = 0 $\rightarrow 0.00\%$ |
| **CAC** (Customer Acquisition Cost) | $\frac{\text{Ad Spend}}{\text{Conversions}}$ | If conversions = 0 $\rightarrow ₹0.00$ |
| **ROAS** (Return on Ad Spend) | $\frac{\text{Revenue}}{\text{Ad Spend}}$ | If spend = 0 $\rightarrow 0.00x$ |
| **ROI** (Return on Investment) | $\frac{\text{Revenue} - \text{Spend}}{\text{Spend}} \times 100$ | If spend = 0 $\rightarrow 0.00\%$ |

---

## 6. Rule-Based Recommendation Engine

The engine programmatically triggers actionable recommendations based on empirical thresholds:
1. **Low CTR (< 1.2%)**: Flags ad creative fatigue and audience targeting mismatch.
2. **Elevated CPC (> ₹45)**: Recommends switching to automated Target CPA bidding and negative keyword pruning.
3. **High CPL (> ₹350)**: Recommends reducing form friction on landing page and using native instant lead forms.
4. **Lead Volume High (> 20) with Low Conversion (< 10%)**: Flags poor audience intent or slow SDR sales turnaround.
5. **High ROAS (>= 3.8x)**: Triggers an **Opportunity** alert suggesting a 20-30% gradual budget increase.
6. **Low ROAS (< 1.6x)**: Flags unprofitable ad groups and advises budget reallocation.

---

## 7. PostgreSQL Database Tables (3NF Schema)

1. `users`: System administrator credentials, bcrypt password hash, and role permissions.
2. `clients`: Client business profiles, contact information, industry verticals, and contract status.
3. `campaigns`: Marketing campaigns, platform, budget, start/end dates, and objectives.
4. `campaign_metrics`: Daily observations (impressions, clicks, spend, leads, conversions, revenue, computed KPIs).
5. `leads`: Prospective buyers tracked through the 6-stage funnel (`New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Converted` / `Lost`).
6. `customers`: Successfully converted clients with lifetime value and acquisition cost metrics.
7. `recommendations`: Operational optimization alerts generated by rule triggers.

---

## 8. Academic Viva Preparation Summary

- **Q: Why Angular 18 Standalone Components?**  
  *A:* Standalone components eliminate NgModule boilerplate, improve tree-shaking performance, and enable simple route-level lazy loading (`loadComponent`).
- **Q: How does the backend communicate with PostgreSQL?**  
  *A:* The backend uses the Node.js `pg` driver with a `Pool` connection to handle concurrent queries safely on `localhost:5432`.
- **Q: How is AI functionality isolated?**  
  *A:* The AI service (`aiService.ts`) is fully isolated in the backend. It uses an environment-configured API key with a fallback heuristic regression model, ensuring the platform runs reliably even if external AI APIs are offline.
