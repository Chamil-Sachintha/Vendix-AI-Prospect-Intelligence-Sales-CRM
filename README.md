# Vendix Prospect Intelligence & Sales CRM

Enterprise prospect research, competitor intelligence, buying intent scoring, and sales pipeline platform built for **Vendix AI (Pvt) Limited**.

---

## 🌟 Executive Summary

Vendix Prospect Intelligence empowers Vendix AI's commercial and leadership teams to systematically identify businesses using competing Sales Force Automation (SFA) systems, research their field operations and technology stacks, identify key C-level decision-makers, track 0–100 buying-intent signals, and accelerate the sales pipeline.

### Core Capabilities

- **Account & Company Intelligence**: Detailed corporate profiles across Sri Lanka and international markets (UAE, Malaysia, Kenya), tracking field sales scale, van sales operations, distributor networks, and retail execution fit.
- **Competitor SFA Displacement Radar**: In-depth competitor repository (Bizom, FieldAssist, Repsly, Salesforce Consumer Goods Cloud, Zoho, and legacy in-house SFA), tracking pain points, renewal schedules, and customer references.
- **Dynamic Buying Intent Scoring (0–100)**: Configurable scoring engine that ingests observed signals (SFA replacement RFPs, hiring field reps, operational dissatisfaction, digital transformation mandates) with recency decay.
- **16-Stage Sales Pipeline**: Interactive Kanban board and tabular views with multi-currency tracking (LKR, USD, AED, EUR, GBP) and weighted revenue calculations.
- **Activity & Follow-up Queue**: Prioritized queue for tasks, demos, calls, and outreach touches with overdue notifications and instant task completion.
- **Contacts & Decision-Makers Directory**: Mapped leaders (CEO, Head of Sales Ops, Commercial Director, CIO) with purchasing committee roles and verification status.
- **CSV Data Import & Export Hub**: Bulk prospect ingestion with field mapping, validation preview, and duplicate detection (skip vs. update), plus CSV exports.
- **Role-Based Access Control (RBAC)**: Enforced server-side permissions across Administrator, Sales Manager, Business Development, and Read-Only Analyst roles.

---

## 🎨 Visual Identity & Brand Design

- **Primary Blue**: `#0033BF`
- **Deep Indigo**: `#3730A3`
- **Dark Purple**: `#26158F`
- **Bright Blue**: `#2768FF`
- **Accent Blue**: `#4482FF`
- **Background**: `#F8FAFC`
- **Text Primary**: `#0F172A`
- **Font**: Google Poppins

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher (v22 recommended)
- **npm** or package manager

### 2. Installation

```bash
# Clone the repository
git clone https://github.com/Chamil-Sachintha/Vendix-AI-Prospect-Intelligence-Sales-CRM.git
cd Vendix-AI-Prospect-Intelligence-Sales-CRM

# Install dependencies
npm install
```

### 3. Database Setup & Seeding

The application uses Prisma ORM with SQLite for instant zero-config local persistence (and is also 100% compatible with PostgreSQL via `DATABASE_URL` in `.env`).

```bash
# Synchronize Prisma schema with the database
npm run prisma:push

# Seed realistic enterprise accounts, competitors, decision-makers, and pipeline deals
npx tsx prisma/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Production Build

```bash
npm run build
npm start
```

---

## 👥 Default Demo Personas (RBAC Testing)

The top navigation bar contains an interactive Persona Switcher to immediately test role-based access:

| User | Role | Capabilities |
| :--- | :--- | :--- |
| **Chamil Sachintha** | `ADMIN` | Full system access, competitor management, user roles & settings configuration |
| **Samantha Perera** | `SALES_MANAGER` | Team oversight, pipeline velocity, competitor editing, analytics reports |
| **Dilshan Silva** | `BUSINESS_DEVELOPMENT` | Prospect research, logging outreach touches, scheduling follow-ups |
| **Ruwani Fernando** | `READ_ONLY_ANALYST` | View-only access across database, reports, and intelligence |

---

## 📂 Navigation Overview

1. `/` — **Executive Dashboard**: Real-time KPI cards, pipeline stages chart, competitor market share, and follow-up queue.
2. `/prospects` — **Target Prospect Prioritization**: Ranked prospects by intent score, SFA vulnerability, and field capacity.
3. `/companies` — **Company Database**: Searchable, filterable accounts with Table/Card views and preset Saved Views.
4. `/companies/[id]` — **Dedicated Account Profile**: Full 360° company overview across Identity, Size, Operations, Software Stack, Contacts, Signals, Deals, and Audit Timeline.
5. `/contacts` — **Decision-Makers Directory**: Purchasing committee leaders, verified contacts, and preferred channels.
6. `/competitors` — **Competitor SFA Directory**: Market footprint, competitor vulnerabilities, and mapped accounts.
7. `/intent` — **Buying Intent Engine**: Observed signals list and scoring rules breakdown.
8. `/pipeline` — **16-Stage Sales Pipeline**: Kanban board and Table view with multi-currency weighted totals.
9. `/activities` — **Follow-up Tasks & Outreach**: Overdue alerts, calendar filters, and touchpoint history.
10. `/reports` — **Analytics & Market Maps**: Visual graphs and exportable performance data.
11. `/import-export` — **CSV Data Hub**: Upload wizard with duplicate detection and single-click exports.
12. `/settings` — **System Settings**: Configurable scoring weights, pipeline stages, RBAC matrix, and integration connectors.

---

## 🔒 Security & Data Hygiene

- All data mutations enforce server-side validation.
- Soft handling and detection of duplicate accounts on CSV import.
- No storage of passwords or sensitive personal payment data.
- Structured evidence citation for all competitor software usage.
