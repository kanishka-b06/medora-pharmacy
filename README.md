# MEDORA — Smart Pharmacy Operations

### AI-Assisted Medicine Retrieval, Inventory Visibility, Dispensing Accuracy & Physical Location Tracking System

---

## 📋 Project Description

**MEDORA** is an AI-assisted pharmacy management web application designed to improve medicine retrieval, inventory visibility, dispensing accuracy, physical medicine location tracking, stock monitoring, and alternative-medicine discovery.

The core operational workflow of MEDORA is:

```
Search Medicine
      ↓
Check Availability
      ↓
View Rack / Shelf
      ↓
Enter Exact Quantity
      ↓
Validate Stock
      ↓
Dispense
      ↓
Automatically Deduct Stock
      ↓
Record Transaction
```

When a requested medicine is unavailable, MEDORA searches the existing pharmacy inventory for possible alternatives using an explainable matching process. Human/pharmacist verification remains strictly required before substitution.

---

## 🌟 Key Features

### 1. Medicine Search & Instant Location Retrieval
- **Multi-Attribute Search**: Search across commercial brand name, generic name, active ingredient, strength, power specification, therapeutic indication, and batch number.
- **Physical Coordinates**: Instantly displays specific **Rack** and **Shelf** location identifiers (e.g., `Rack B → Shelf 3`) for rapid physical retrieval behind the pharmacy counter.
- **Stock Visibility**: Clear badges reflecting current stock status and exact available unit counts.

### 2. Exact Quantity Dispensing
- **Worker-Controlled Input**: Staff enter the exact quantity requested by or prescribed to the customer.
- **Strict Stock Validation**: Validates the input before processing:
  - Prevents dispensing quantities greater than available stock.
  - Rejects zero, negative numbers, empty inputs, and non-numeric characters.
  - Generates clear validation messages (e.g., *"Insufficient stock. Only 10 units are available."*).
- **Automatic Stock Calculation**: Applies the standard formula:
  $$\text{Remaining Stock} = \text{Previous Stock} - \text{Quantity Dispensed}$$
  Never allows stock counts to drop below zero.

### 3. Automatic Stock Updates & Thresholds
- **Status Classification**:
  - 🟢 **Available**: Stock exceeds the low-stock threshold.
  - 🟠 **Low Stock**: Stock is greater than zero but less than or equal to threshold (e.g., $\le 10$ units).
  - 🔴 **Out of Stock**: Stock count reaches exactly $0$.
- **State Synchronization**: Automatically triggers order alerts upon zero inventory and persists stock updates across the entire application.

### 4. Comprehensive Transaction History
- Every dispensing operation automatically logs an immutable transaction record with:
  - **Medicine name**
  - **Quantity dispensed** (quantity given)
  - **Remaining stock**
  - **Worker identifier** (staff member who performed the dispensation)
  - **Date**
  - **Time**
  - **Transaction type** (`Dispense`)
- Viewable in the Worker Shift Log and Admin Audit Trail, with receipt generation and CSV export capabilities.

### 5. AI Alternative Medicine Finder
- **Grounded in Real Inventory**: Searches strictly within the stored pharmacy inventory; never invents or hallucinates medicine names.
- **Hierarchical Priority Matching**: Prioritizes candidates by:
  1. Same active ingredient
  2. Same strength
  3. Same dosage form
  4. Real-time in-stock availability (`quantity > 0`)
- **Transparent Match Explanations**: Provides granular, factor-by-factor reasons for why each medicine is suggested.
- **No Inventions Guarantee**: If no viable match exists in inventory, explicitly displays: *"No suitable alternative found in current inventory."*

### 6. Human-in-the-Loop AI Governance
- **No Automatic Substitution**: The AI functions strictly as a decision-support advisory tool. It does not auto-substitute prescriptions or medications.
- **Mandatory Pharmacist Verification**: Human pharmacists must review, verify, and approve or reject any suggested alternative.
- **Different Active Ingredient Safeguard**: If an alternative shares a therapeutic class but has a different active ingredient:
  - It is **not** labelled as an automatic equivalent.
  - Displays a prominent callout: *"Pharmacist verification required"*.
  - Requires clinical review of therapeutic suitability by authorized personnel.

### 7. Owner / Administrator Portal
- **Inventory Management**: Complete catalog control to register, edit, or adjust medicine batches, thresholds, and clinical data.
- **Stock Management & Analytics**: Overall store stock distribution, category breakdowns, and low-stock overview.
- **Purchase Orders & Restocking**: Create replenishment orders, monitor supplier status (`Ordered` $\rightarrow$ `In Transit` $\rightarrow$ `Arrived`), and receive incoming stock into live inventory.
- **Expiry Risk Monitoring**: Dashboard highlighting upcoming expiry dates and batches requiring clearance.
- **Audit & Activity History**: Chronological system-wide logging of sales, dispensations, restock events, and AI suggestions.
- **Worker & Role Oversight**: Overview of active staff accounts and assigned privileges.

### 8. Worker / Dispenser Portal
- **Counter Search Desk**: Fast medicine lookups with prominent rack/shelf coordinates.
- **Medicine Information View**: Clinical power, intended use, target demographics, and usage directions for patient queries.
- **Counter Sales & Dispensing**: Exact quantity issuing, live deduction calculations, and printable receipts.
- **AI Alternative Finder**: Fast generic substitution assistance for out-of-stock items.
- **Shift Activity**: Individual shift timeline showing all dispensations logged by the current worker.

### 9. Expiry Risk Monitoring
- Real-time date calculation categorizing batches into:
  - 🟢 **SAFE**: More than 90 days remaining until expiry.
  - 🟡 **EXPIRING SOON**: Between 30 and 90 days remaining.
  - 🔴 **HIGH EXPIRY RISK**: 30 days or fewer remaining (or already expired).

### 10. Supply Chain & Restock Workflow
- Standardized replenishment pipeline:
  - Out-of-stock or low-stock triggers order recommendations.
  - Purchase orders generated with expected delivery dates and supplier details.
  - One-action stock reception updates physical quantities and clears low-stock alerts.

---

## 🔑 Demo Login Credentials

Authentication is role-based. The **Owner Portal** and **Worker Portal** buttons select the intended role, and authentication is completed through the **Login** action using the selected role and valid credentials.

| Role | Username | Password | Purpose & Access Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `supervisor` | `supervisor123` | Full inventory control, purchasing, restock orders, store analytics, expiry tracking, audit history |
| **Worker** | `staff` | `staff123` | Medicine lookup, rack/shelf navigation, exact quantity dispensing, AI alternative finder, shift history |

> **Note**: The portal buttons select the intended role. Authentication is performed through the Login action using the selected role and credentials.

---

## 💡 AI Alternative Example

The AI matching engine utilizes real inventory records to identify viable generic alternatives when a requested product is unavailable.

### Demonstration Scenario:
- **Requested Medicine**: `Paracetamol 500 mg Tablet` (Status: 🔴 Out of Stock, 0 units)
- **MEDORA Inventory Scan**: Evaluates available medicines in the local database.
- **Identified Alternative**: `Calpol 500 mg Tablet`
- **Matching Rationale**:
  - **Active ingredient**: Paracetamol (Identical)
  - **Strength**: 500 mg (Identical)
  - **Dosage form**: Tablet (Identical)
  - **Current availability**: 35 units in stock
  - **Location**: Rack C → Shelf 2
- **Matching Assessment**:
  > *"Strong match based on matching active ingredient, strength, dosage form, and current inventory availability."*

If the only available item has a different active ingredient (such as another therapeutic class analgesic):
- MEDORA explicitly flags: **⚠ Different active ingredient**
- Prominently displays: **Pharmacist verification required**
- Leaves full clinical discretion with the attending pharmacist.

---

## 🛡️ Responsible AI Principles

MEDORA is built following healthcare-grade Responsible AI guidelines:

1. **Inventory-Grounded Recommendations**: Recommendations are limited strictly to medicines cataloged in the pharmacy's real inventory with positive stock (`quantity > 0`).
2. **Explainable Matching Factors**: Rather than providing an opaque prediction, every recommendation presents the precise factors (active ingredient, strength, dosage form, availability) behind the match.
3. **Zero Hallucination / No Invented Medicines**: The system does not synthesize or invent non-existent drugs, brands, or suppliers.
4. **No Automatic Medicine Substitution**: The AI cannot finalize or dispense an alternative independently. Human pharmacist authorization is technically enforced.
5. **Additional Safeguards for Different Ingredients**: Medicines that do not share the identical active ingredient are never claimed as bio-equivalents.
6. **No Unsupported Medical Claims**: The matching engine computes database field and pharmacological attribute similarities; it makes no unsupported medical efficacy guarantees.
7. **Human-in-the-Loop Decision Making**: The qualified pharmacist retains ultimate oversight and legal responsibility for every dispensed item.

---

## 🗺️ Project Architecture

The codebase follows a modular React component structure with centralized state management:

```
src/
├── components/
│   ├── common/             # Reusable UI widgets: Badges, StatCards, RackShelfBadge, Toasts
│   ├── layout/             # Header, Sidebar, RoleBasedLayout, Fixed navigation containers
│   └── modals/             # Action dialogs: Add/Edit Medicine, Record Sale, Restock, Orders
├── context/
│   └── PharmacyContext.jsx # Central application state, dispensing logic, and LocalStorage sync
├── data/
│   └── initialData.js      # Baseline demonstration pharmacy dataset (15 medicines across Racks A-D)
├── pages/
│   ├── auth/
│   │   └── LoginPage.jsx   # Role selection (Owner vs Worker) and credential authentication
│   ├── admin/
│   │   ├── AdminDashboard.jsx    # Store overview KPIs, low stock alerts, quick links
│   │   ├── MedicineInventory.jsx # Complete medicine table with search, filter, and CRUD
│   │   ├── StockManagement.jsx   # Rack/Shelf distribution and quantity correction
│   │   ├── OrderManagement.jsx   # Supplier purchase orders and restock receiving
│   │   ├── ExpiryTracking.jsx    # Batch expiry risk timeline and categorization
│   │   └── ActivityHistory.jsx   # System-wide audit log with CSV export
│   └── worker/
│       ├── WorkerSearch.jsx            # Clinical search desk with shelf coordinates
│       ├── MedicineInfoPage.jsx        # Patient guidance (power, used for, who should use)
│       ├── RecordSalePage.jsx          # Fast counter dispensing form with live deduction
│       ├── WorkerAlternativeFinder.jsx # AI alternative matching with pharmacist approval
│       └── WorkerActivity.jsx          # Worker shift log and dispensing records
├── services/
│   └── aiMatchingEngine.js # Grounded similarity calculation, rule-based matching & explanations
├── App.jsx                 # Client-side routing, route authentication guards & scroll reset
├── main.jsx                # Application root mounting
└── index.css               # Design system tokens, color variables & custom scrollbars
```

### Module Responsibilities:
- **`PharmacyContext.jsx`**: Manages all shared state (`medicines`, `sales`, `orders`, `activities`, `currentUser`). Houses the core `recordSale` dispensing function, validation rules, stock deductions, and browser persistence routines.
- **`aiMatchingEngine.js`**: Core algorithmic service implementing explainable matching, strength normalization, dosage form compatibility checks, and expiry risk calculations.
- **`RecordSalePage.jsx` & `RecordSaleModal.jsx`**: User interfaces for entering quantities, rendering live calculation preview (`Available - Dispensing = Remaining`), and validating stock boundaries.
- **`WorkerAlternativeFinder.jsx`**: Provides interactive search for unavailable medicines, displaying candidate comparisons, storage coordinates, match reasons, and human verification controls.

---

## 🧪 Demonstration & Evaluation Workflows

### Scenario 1: Medicine Retrieval, AI Alternative Discovery & Dispensing
1. Navigate to the login page.
2. Select **Worker Portal**.
3. Enter username `staff` and password `staff123`, then click **Login**.
4. In **Medicine Search**, search for `"Paracetamol 500 mg"` $\rightarrow$ Observe that it is marked as **OUT OF STOCK** (0 units available).
5. Click **"Find Alternatives with AI"**.
6. MEDORA searches the existing inventory and suggests **Calpol 500 mg** located at **Rack C → Shelf 2** (35 units available).
7. Review the matching explanations:
   - `✓ Same active ingredient (Paracetamol)`
   - `✓ Same strength (500 mg)`
   - `✓ Same dosage form (Tablet)`
   - `✓ Available in current inventory`
8. Click **"Verify & Approve"** to complete human verification.
9. Click **"Dispense Alternative Now"**.
10. Enter exact quantity: `6`. Observe the live calculation preview: `35 - 6 = 29 units remaining`.
11. Click **"Dispense / Complete Sale"**.
12. Verify the generated invoice receipt with medicine, quantity given (6), remaining stock (29), worker (staff), date, time, and type (`Dispense`).
13. Open **My Activity** $\rightarrow$ Verify the dispensing transaction is logged.

### Scenario 2: Owner Restocking & Inventory Management
1. Select **Owner Portal**.
2. Enter username `supervisor` and password `supervisor123`, then click **Login**.
3. Navigate to **Orders & Restock**.
4. Locate the pending order for the out-of-stock medicine.
5. Click **"Receive & Restock"**.
6. Confirm the incoming quantity (e.g., 100 units).
7. Open **Medicine Inventory** or **Stock Management** $\rightarrow$ Verify that stock is immediately updated and the item transitions to 🟢 **Available**.

---

## 🔬 Validation & Verification Test Cases

The core dispensing and matching routines support the following test cases:

| # | Test Scenario | Input & Conditions | System Response & Output | Validation Result |
|---|---------------|--------------------|--------------------------|:-----------------:|
| **1** | **Valid Dispensing** | Available = 100, Enter = 6 | Stock updates to 94; transaction logged (Given: 6, Remaining: 94) | **PASS** |
| **2** | **Insufficient Stock** | Available = 10, Enter = 15 | Rejects transaction; displays *"Insufficient stock. Only 10 units are available."*; stock remains 10 | **PASS** |
| **3** | **Exact Stock Quantity** | Available = 10, Enter = 10 | Dispenses 10; remaining stock = 0; status updates to 🔴 **Out of Stock** | **PASS** |
| **4** | **Zero Quantity** | Available = 10, Enter = 0 | Rejects input; displays *"Quantity to dispense must be at least 1."*; no stock change | **PASS** |
| **5** | **Negative Quantity** | Available = 10, Enter = -2 | Rejects input; displays validation error; stock remains untouched | **PASS** |
| **6** | **Unavailable Medicine Scan** | Requested medicine has 0 units | Scans existing inventory; filters only candidates with `quantity > 0` | **PASS** |
| **7** | **Strong AI Match** | Requested: Paracetamol 500mg Tablet | Calpol 500mg Tablet matched on ingredient, strength & form; displays *"Same active ingredient, strength, and dosage form."* | **PASS** |
| **8** | **Different Active Ingredient** | Requested: Omeprazole 20mg | Pantoprazole identified as therapeutic class alternative; displays *"Pharmacist verification required"* | **PASS** |
| **9** | **No Suitable Alternative** | Requested drug has no inventory equivalent | Returns 0 candidates; displays *"No suitable alternative found in current inventory."* | **PASS** |
| **10** | **Persistence Across Refresh** | Dispense 100 $\rightarrow$ 94, Refresh browser | Stored inventory preserves 94 units; does not revert to 100 | **PASS** |

---

## 🛠️ Technology Stack

- **Core Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (Vanilla utilities with custom healthcare palette)
- **Icons**: Lucide React
- **State Management**: React Context API
- **Data Persistence**: Browser LocalStorage synchronization

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (Node Package Manager)

### Step-by-Step Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kanishka-b06/medora-pharmacy.git
   cd medora-pharmacy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production bundle locally**:
   ```bash
   npm run preview
   ```

---

## 📄 License & Academic Note

This project is developed as an AI and software engineering academic evaluation prototype demonstrating grounded AI assistance, explainable rule-based clinical matching, and inventory integrity for retail pharmacy operations.
