# 💊 MEDORA — Smart Pharmacy Management System

[![Build & Unit Tests](https://img.shields.io/badge/Unit%20Tests-56%2F56%20Passed-emerald.svg)](https://github.com/kanishka-b06/medora-pharmacy)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-purple.svg)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Database-Supabase%20Postgres-3ECF8E.svg)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC.svg)](https://tailwindcss.com/)

---

## 📋 Project Overview

**MEDORA** is a full-featured, role-based pharmacy operations web application developed under **Project Better Tomorrow (Continuation Track — Review 2)**. It solves critical daily pharmacy workflow challenges: instant medicine lookup, stock validation, physical shelf tracking, exact quantity dispensing, automatic inventory updates, expiry risk containment, and AI-assisted inventory alternative discovery.

### Core Pharmacy Operational Workflow
```
[Search Medicine] ➔ [Check Availability] ➔ [Locate Rack/Shelf] ➔ [Enter Exact Quantity] ➔ [Validate Stock] ➔ [Dispense & Deduct Stock] ➔ [Sync DB & Audit Log]
```

---

## 🚀 Key Functional Capabilities

* **Role-Based Portals:** Dedicated authenticated spaces for **Owner/Supervisor** (inventory control, restock POs, expiry monitoring, user management, analytics) and **Worker/Staff** (speed medicine lookup, stock verification, shelf navigation, dispensing, AI alternatives).
* **Deterministic Dispensing:** Real-time stock validation preventing dispensing above available quantity; automatic stock deduction (`remainingStock = availableStock - dispensedQuantity`).
* **Physical Location Tracking:** Clear grid navigation mapping every SKU to its physical **Rack** (A–F) and **Shelf** (1–5).
* **AI-Assisted Alternative Matching Engine:** Clinical decision support engine analyzing active chemical ingredients, dosage forms, strengths, and therapeutic categories from **current in-stock inventory** with human-in-the-loop verification guardrails.
* **Proactive Expiry-Risk Monitor:** Dynamic temporal categorization of batches into Safe, Expiring Soon (≤90 days), High Expiry Risk (≤30 days), and Expired.
* **Dual Persistence Architecture:** Cloud-synchronized Supabase PostgreSQL backend with automatic offline fallback to browser `LocalStorage`.
* **Fault-Tolerant React Error Boundaries:** Multi-level UI error boundaries preventing catastrophic application crashes with instant self-healing retry triggers.

---

## 🏗️ Technical Architecture & System Design

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (React 18)                  │
│                                                                        │
│   ┌─────────────────────┐   ┌──────────────────────────────────────┐  │
│   │ Owner / Admin Pages │   │  Worker / Staff Dispenser Interface  │  │
│   └──────────┬──────────┘   └──────────────────┬───────────────────┘  │
│              └─────────────────┬───────────────┘                      │
│                                │ Wrapped in                           │
│                      ┌─────────▼─────────┐                            │
│                      │   ErrorBoundary   │  <-- Traps runtime UI bugs │
│                      └─────────┬─────────┘                            │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                    BUSINESS & STATE LAYER (Context API)                │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │ PharmacyContext: State Store, Transactions, Validation Engine  │  │
│   └──────┬──────────────────────────────────────────────────┬──────┘  │
│          │                                                  │         │
│   ┌──────▼─────────────────────────┐          ┌─────────────▼──────┐  │
│   │   AI Matching Engine Service   │          │  Expiry Calculator │  │
│   │ (Deterministic Scoring & Rules)│          │  (Temporal Offsets)│  │
│   └────────────────────────────────┘          └────────────────────┘  │
└────────────────────────────────┬───────────────────────────────────────┘
                                 │
┌────────────────────────────────▼───────────────────────────────────────┐
│                 DATA ACCESS & PERSISTENCE LAYER                        │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐  │
│   │  supabaseService.js (DTO Mappers, CRUD, Seeding, Error Fallback)│  │
│   └───────────────┬────────────────────────────────┬───────────────┘  │
│                   │ (Primary Online)               │ (Offline Guard)  │
│   ┌───────────────▼──────────────┐   ┌─────────────▼──────────────┐   │
│   │ Supabase PostgreSQL Database │   │ Browser LocalStorage Cache │   │
│   └──────────────────────────────┘   └────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema & Data Models

MEDORA uses a relational PostgreSQL schema deployed on Supabase (and replicated in `supabase_schema_and_seed.sql`). All entities enforce primary keys, foreign key constraints, default timestamps, and normalized column types.

### 1. `medicines` Table (Inventory Catalog)
Stores complete SKU metadata, physical warehouse locations, stock thresholds, and batch expiry.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique SKU identifier (e.g., `med-001`) |
| `name` | `TEXT` | `NOT NULL` | Commercial brand name with strength |
| `brand_name` | `TEXT` | `NULLABLE` | Manufacturer brand name |
| `active_ingredient` | `TEXT` | `NOT NULL` | Chemical entity (e.g., `Paracetamol`) |
| `strength` | `TEXT` | `NOT NULL` | Dosage strength (e.g., `500 mg`, `650 mg`) |
| `power` | `TEXT` | `NULLABLE` | Potency rating / formulation notes |
| `dosage_form` | `TEXT` | `DEFAULT 'Tablet'` | Form (`Tablet`, `Capsule`, `Syrup`, `Ointment`) |
| `therapeutic_class` | `TEXT` | `NOT NULL` | Category (`Analgesic`, `Antibiotic`, `Antacid`) |
| `used_for` | `TEXT` | `NULLABLE` | Primary clinical indications |
| `who_should_use` | `TEXT` | `NULLABLE` | Patient demographic suitability guidelines |
| `dosage_instructions`| `TEXT` | `NULLABLE` | Standard administration directives |
| `rack` | `TEXT` | `DEFAULT 'A'` | Physical storage rack identifier (`A` - `F`) |
| `shelf` | `TEXT` | `DEFAULT '1'` | Physical storage shelf tier (`1` - `5`) |
| `quantity` | `INTEGER` | `DEFAULT 0` | Available on-hand quantity |
| `batch_number` | `TEXT` | `NULLABLE` | Batch/lot code (e.g., `BAT-2026-001`) |
| `expiry_date` | `TEXT` | `NULLABLE` | ISO date string (`YYYY-MM-DD`) |
| `price` | `NUMERIC(10,2)`| `DEFAULT 0.00` | Unit selling price |
| `low_stock_threshold`| `INTEGER` | `DEFAULT 10` | Reorder alert trigger quantity |
| `order_status` | `TEXT` | `DEFAULT 'None'` | Restock status (`None`, `Order Required`, `Ordered`) |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Record creation timestamp |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT NOW()` | Last update timestamp |

### 2. `sales` Table (Dispensing Audit Ledger)
Tracks every dispensing transaction, inventory deductions, and worker accountability.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique transaction ID (`sale-17281...`) |
| `medicine_id` | `TEXT` | `FK -> medicines.id` | Reference to dispensed medicine SKU |
| `medicine_name` | `TEXT` | `NOT NULL` | Name snapshot at time of dispensing |
| `quantity_sold` | `INTEGER` | `NOT NULL` | Exact units dispensed |
| `unit_price` | `NUMERIC(10,2)`| `NOT NULL` | Unit rate at time of transaction |
| `total_amount` | `NUMERIC(10,2)`| `NOT NULL` | Total cost (`quantity * unit_price`) |
| `customer_type` | `TEXT` | `DEFAULT 'Walk-in'`| Recipient category |
| `previous_stock` | `INTEGER` | `NOT NULL` | Stock balance immediately prior to dispense |
| `remaining_stock` | `INTEGER` | `NOT NULL` | New verified stock balance (`previous - sold`) |
| `recorded_by` | `TEXT` | `NOT NULL` | User identifier of dispensing staff/owner |
| `timestamp` | `TIMESTAMPTZ` | `DEFAULT NOW()` | ISO audit timestamp |

### 3. `orders` Table (Procurement & Restocking)
Tracks purchase orders created by the pharmacy owner for depleted stock.

| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Purchase order identifier (`po-001`) |
| `medicine_id` | `TEXT` | `FK -> medicines.id` | SKU being replenished |
| `medicine_name` | `TEXT` | `NOT NULL` | Target medicine title |
| `supplier` | `TEXT` | `NOT NULL` | Pharmaceutical distributor |
| `ordered_quantity`| `INTEGER` | `NOT NULL` | Units requested |
| `order_date` | `TEXT` | `NOT NULL` | Date PO was placed |
| `expected_arrival_date` | `TEXT` | `NULLABLE` | Projected delivery date |
| `status` | `TEXT` | `DEFAULT 'Ordered'`| `Pending`, `Ordered`, `Received` |
| `estimated_cost` | `NUMERIC(10,2)`| `DEFAULT 0.00` | Estimated invoice charge |

### 4. `users` Table (Role-Based Access Control)
| Column Name | Data Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `TEXT` | `PRIMARY KEY` | Unique user identity code (`user-01`) |
| `username` | `TEXT` | `UNIQUE, NOT NULL` | Login account credential |
| `name` | `TEXT` | `NOT NULL` | Full legal name |
| `role` | `TEXT` | `NOT NULL` | Authorization role: `supervisor`, `owner`, `worker` |
| `role_title` | `TEXT` | `NULLABLE` | Display title (`Pharmacy Owner`, `Staff Dispenser`) |
| `status` | `TEXT` | `DEFAULT 'active'` | Operational status (`active`, `inactive`) |

### 5. `activities` Table (System-Wide Event Log)
Records all CRUD operations, inventory updates, role switches, and dispensing events with timestamps and user attributions for regulatory audit readiness.

---

## 🔌 API & Data Access Layer (Supabase Integration)

All backend communication is abstracted into [`src/lib/supabaseService.js`](file:///Users/kani_06/Pharmacy%20website/src/lib/supabaseService.js), ensuring complete decoupling of UI components from underlying database drivers.

| Function Endpoint | Operation | Target Entity | Description & Behavior |
| :--- | :--- | :--- | :--- |
| `fetchMedicinesFromDb()` | `SELECT *` | `medicines` | Queries active inventory ordered alphabetically. Hydrates Postgres snake_case into React camelCase objects. Falls back to LocalStorage if offline. |
| `updateMedicineStockInDb(id, qty, status)` | `UPDATE` | `medicines` | Atomic update of stock quantity and order status. Gracefully recovers if database columns use camelCase or snake_case conventions. |
| `recordSaleInDb(salePayload)` | `INSERT` | `sales` | Commits audit-compliant dispensing record with previous and remaining stock snapshot. |
| `seedInitialDataIfEmpty()` | `UPSERT` | Multi-table | Idempotent initial migration checking if tables require default SKUs. Safe against primary key collisions (`ON CONFLICT (id) DO NOTHING`). |
| `mapMedicineToDb(med)` | Transform | Memory | Data Transfer Object (DTO) mapper converting camelCase frontend model to snake_case Postgres record. |
| `mapMedicineFromDb(row)` | Transform | Memory | Re-hydrates raw relational row into typed frontend entity. |

---

## 🛡️ React Error Boundary Architecture & Fault Tolerance

To ensure hospital and pharmacy grade resilience, MEDORA implements React Error Boundaries ([`src/components/common/ErrorBoundary.jsx`](file:///Users/kani_06/Pharmacy%20website/src/components/common/ErrorBoundary.jsx)) across root and route levels.

```
       [ React Component Tree ]
                  │
      ┌───────────▼───────────┐
      │  ErrorBoundary Wrapper│
      └───────────┬───────────┘
                  │
         Runtime Exception?
        ┌─────────┴─────────┐
       Yes                  No
        │                   │
┌───────▼────────┐   ┌──────▼──────┐
│Fallback Card UI│   │ Render Page │
│- Stack snippet │   └─────────────┘
│- "Try Again"   │
│- "Reload Page" │
└────────────────┘
```

### Key Technical Mechanisms
1. **`static getDerivedStateFromError(error)`**: Captures uncaught runtime exceptions thrown during child component rendering, lifecycle methods, or constructors, transitioning internal state to `{ hasError: true, error }`.
2. **`componentDidCatch(error, errorInfo)`**: Logs granular stack traces and component stack trees for diagnostic analysis.
3. **Graceful Degradation UI**: Instead of an uninformative white screen, users are presented with a styled fallback card containing error descriptions, a non-destructive state reset button ("Try Again"), and a full application recovery button ("Reload Page").
4. **Isolated Route Sandboxing**: Each view in `App.jsx` is keyed to its route (`<ErrorBoundary key={currentRoute}>`), preventing a localized error on one screen from interrupting active workflows on other pages.

---

## 🧪 Granular Unit Testing Suite & Verification

MEDORA includes a dedicated, zero-dependency unit testing suite in [`test-logic.mjs`](file:///Users/kani_06/Pharmacy%20website/test-logic.mjs) verifying all mission-critical business rules, boundary conditions, and state contracts.

### Executing the Test Suite
```bash
npm test
```

### Test Suite Modules (56 Automated Assertions)

#### 1. Stock Status Boundary Logic & Thresholds
* **Normal Quantity:** Verified quantity `100` with threshold `10` is classified as `available` with emerald visual styling.
* **Exact Threshold Boundary:** Verified quantity `10` (equal to threshold) immediately switches status to `low_stock` with amber styling.
* **Sub-Threshold:** Verified quantity `5` (< threshold) triggers `low_stock`.
* **Zero Boundary:** Verified quantity `0` is strictly categorized as `out_of_stock` with rose/red alert styling.
* **Defensive Coercion:** Verified negative inputs (e.g., `-5`) and string numbers (`"25"`) are handled gracefully without runtime exceptions.

#### 2. Dispensing Transaction & Boundary Validation
* **Standard Dispense:** Verified `100 - 6 = 94` units remaining stock.
* **Stock Exhaustion Boundary:** Dispensing exactly `50` units from `50` available succeeds and sets remaining stock to `0` (`out_of_stock`).
* **Over-Dispense Rejection:** Requesting `25` units from `20` available is rejected (`INSUFFICIENT_STOCK`) with stock remaining unaltered at `20`.
* **Negative/Zero Rejection:** Dispensing `0`, `-4`, empty strings, or non-numeric values (`"abc"`) is immediately blocked (`INVALID_QUANTITY`).

#### 3. AI Alternative Matching Engine & Clinical Guardrails
* **Exact Molecule Affinity:** Matching out-of-stock Paracetamol 500 mg against inventory prioritizes Calpol 500 mg (score: 98%, exact match: ingredient + strength + form).
* **Self-Exclusion Rule:** Verified the queried medicine is never suggested as its own alternative.
* **Human-in-the-Loop Clinical Warning:** When candidates share therapeutic class but differ in chemical ingredient, the engine injects mandatory `⚠ Pharmacist verification required` warning banners and disclaimers.

#### 4. Dynamic Expiry Risk Temporal Calculation
* **Dynamic Time Horizons:** Evaluated against `Date.now()` offsets:
  - Expired: date offset by -10 days -> `expired`
  - Critical/High Risk: date offset by +15 days (≤ 30 days) -> `high_risk`
  - Expiring Soon: date offset by +60 days (≤ 90 days) -> `expiring_soon`
  - Safe: date offset by +180 days (> 90 days) -> `safe`

#### 5. React Error Boundary Lifecycle State Contracts
* **State Transition:** Verified `getDerivedStateFromErrorLogic` transitions `hasError: false` to `true` with error preservation.
* **Self-Healing Reset:** Verified `resetErrorBoundaryLogic` restores state to `{ hasError: false, error: null }`.

#### 6. Database DTO Mapping & Schema Integrity
* **Round-Trip Integrity:** Verified bi-directional conversion between JavaScript camelCase models and PostgreSQL snake_case rows (`active_ingredient`, `dosage_form`, `quantity_sold`, etc.) preserves all keys and values.

---

## 👥 Demo Access & Role Credentials

The application includes pre-configured demo credentials on the login screen for rapid evaluation:

### 👨💼 Pharmacy Owner / Supervisor
* **Role:** Full Administrative & Clinical Authority
* **Capabilities:** Master inventory catalog, restock PO creation, batch expiry oversight, staff accounts, system settings.
* **Username:** `supervisor`
* **Password:** `supervisor123`

### 👨⚕️ Pharmacy Staff / Dispenser
* **Role:** Frontline Dispensing & Inventory Lookup
* **Capabilities:** Medicine lookup, shelf location tracking, stock validation, exact quantity dispensing, AI alternative finder.
* **Username:** `staff`
* **Password:** `staff123`

---

## 💻 Local Setup & Development

### Prerequisites
* Node.js (v18.0.0 or higher)
* npm (v9.0.0 or higher)

### Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/kanishka-b06/medora-pharmacy.git
cd medora-pharmacy

# 2. Install dependencies
npm install

# 3. Run unit tests
npm test

# 4. Start local development server
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 📊 Milestone Progress (Review 1 ➔ Review 2)

| Review Milestone | Key Focus Areas | Completion Status |
| :--- | :--- | :--- |
| **Review 1 (Baseline)** | Empathize & Define, initial React/Tailwind prototype, medicine search, basic dispensing workflow, local state. | Completed (Score: 92% / 32.2/35) |
| **Review 2 (Current)** | Supabase cloud synchronization, granular unit testing suite (56 tests), React Error Boundary architecture, exhaustive schema & API documentation, boundary validation. | **100% Implemented & Verified** |
