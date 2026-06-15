# DigiQuest Studio — Pre-Production Brief System
## Backend Presentation & Technical Guide (Mid-Term Review)

This document serves as your complete guide for your **Day 19 Mid-Term Presentation**. It summarizes the backend architecture, database design, API endpoints, and core business rules built for DigiQuest Studio.

---

## 1. Project Overview & Scope
DigiQuest Studio is a film and media production house. Before kickoff, clients/staff submit production briefs (covering scripts, visual references, brand guidelines, deadlines, budget, and contacts). 

**The Backend Solution**:
A robust REST API built with Node.js and Express that stores briefs in a portable SQLite database, enforces creative gatekeeping (completeness scoring), and automates alerts for overdue items.

---

## 2. Database Schema (SQLite)
The database contains **4 interconnected tables** optimized with primary keys, foreign keys, and indexes:

*   **`clients`**: Stores client company data (Company name, contact person, email, phone, address).
*   **`briefs`**: Stores the creative brief details (Title, type, script text, file paths for uploaded script/brand guides/references, delivery format, budget, status, completeness score).
*   **`audit_logs`**: Logs every status transition and brief field modification for accountability.
*   **`alerts`**: Stores system-generated alerts for deadlines, incomplete briefs, or stale review cycles.

```
    clients [1] <─── submits ───> [*] briefs [1] <─── tracks ───> [*] audit_logs
                                    [1] <─── generates ───> [*] alerts
```

---

## 3. Core Business Logic Engine (`briefEngine.js`)
This is the core value-add of the system. It runs validation gates automatically:

### Rule 1 — Real-Time Completeness Score (0-100)
A brief is scored dynamically based on detail level:
*   **Script** (Text or uploaded file): **20 points**
*   **Visual References** (Text description or files): **15 points**
*   **Brand Guidelines** (Text or document): **15 points**
*   **Delivery Format** preset: **15 points**
*   **Approval Contacts** (≥1 valid stakeholder): **15 points**
*   **Kickoff Deadline** set: **10 points**
*   **Budget Tier**: **5 points**
*   **Special Requirements**: **5 points**

### Rule 2 — Validation Gates
*   **Kickoff Gate**: A brief's status **cannot** be changed to `approved` or `in_production` unless its completeness score is **80% or higher**.
*   **Draft Gate**: A brief cannot be changed to `submitted` unless it scores at least **50%** and has at least **1 contact**.

---

## 4. API Endpoints List (18/18 Tested & Active)

### 📂 Brief Management
*   `POST /api/briefs` — Create new brief (supports JSON or multipart form-data for uploads).
*   `GET /api/briefs` — List briefs (with full search, sorting, and pagination).
*   `GET /api/briefs/:id` — Get single brief parameters.
*   `GET /api/briefs/:id/detail` — Get brief + client data + audit history + alerts.
*   `PUT /api/briefs/:id` — Update brief content (supports file uploads).
*   `PATCH /api/briefs/:id/status` — Modify brief status (triggers audit log).
*   `DELETE /api/briefs/:id` — Archiving a brief.

### 🏢 Client Registry
*   `POST /api/clients` — Onboard new studio client.
*   `GET /api/clients` — List all clients with brief counts.
*   `GET /api/clients/:id` — Fetch client profile + briefs list.

### 📊 Dashboard & Reports
*   `GET /api/dashboard/summary` — Key KPIs (totals, pending reviews, avg completeness).
*   `GET /api/dashboard/alerts` — Fetch unread workflow warnings.
*   `PATCH /api/dashboard/alerts/:id/read` — Dismiss an alert.
*   `GET /api/reports/summary` — Status counts, average completeness score.
*   `GET /api/reports/by-type` — Grouped stats by project type.
*   `GET /api/reports/by-client` — Briefs per client.
*   `GET /api/reports/completeness` — Score distribution.
*   `GET /api/reports/export` — Download full database as a **CSV report**.

---

## 5. How to Live Demo for Reviewers

Ensure your database is seeded first:
1.  Navigate to the directory:
    ```cmd
    cd C:\Users\Admin\Documents\digiquest-brief-system\backend
    ```
2.  Install packages:
    ```cmd
    npm install
    ```
3.  Populate test data:
    ```cmd
    npm run seed
    ```
4.  Start server:
    ```cmd
    npm run dev
    ```
5.  Open your browser or Postman and go to:
    *   `http://localhost:3001/health` (Health check)
    *   `http://localhost:3001/api/dashboard/summary` (Analytics summary)
    *   `http://localhost:3001/api/briefs/1/detail` (Workflow audit trail demo)
