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

When a requested medicine is unavailable, MEDORA searches the existing pharmacy inventory for possible alternatives using an explainable matching process comparing real inventory attributes. Human pharmacist verification remains strictly required before substitution.

---

## 🌟 Key Features

MEDORA includes the following fully implemented features:

1. **Medicine Search**: Fast search across commercial brand name, generic name, active ingredient, strength, therapeutic indication, and batch number.
2. **Medicine Details & Availability**: Live stock status badges (Available, Low Stock, Out of Stock) with comprehensive dosage, power, and manufacturer details.
3. **Physical Rack & Shelf Location**: Instantly displays specific **Rack** and **Shelf** location identifiers (e.g., `Rack B → Shelf 2`) for rapid physical retrieval behind the pharmacy counter.
4. **Batch & Expiry Information**: Tracks unique batch numbers and expiry dates for each inventory item.
5. **Exact Quantity Dispensing**: Workers enter the exact quantity to give; validates against available inventory and prevents negative stock.
6. **Automatic Stock Deduction**: Automatically calculates `remainingStock = availableStock - quantityDispensed` and immediately updates inventory across all views.
7. **Comprehensive Transaction History**: Automatically logs immutable records (medicine name, quantity given, remaining stock, worker, date, time, and type) with receipt generation.
8. **LocalStorage Persistence**: All stock adjustments, dispensing operations, restock records, and activities persist reliably in browser LocalStorage across page reloads.
9. **AI Alternative Medicine Finder**: Searches strictly among medicines already present in MEDORA inventory based on attribute comparisons (active ingredient, strength, dosage form, and therapeutic class).
10. **Pharmacist Verification**: Human-in-the-loop clinical governance. Suggested alternatives require human authorization, and items with differing active ingredients require explicit pharmacist verification.
11. **Orders & Restock**: Create distributor purchase orders, track shipping status (`Ordered` → `In Transit` → `Arrived`), and receive incoming stock into live inventory.
12. **Expiry Risk Monitor**: Calculates remaining days until expiry and categorizes batches into Safe, Expiring Soon, and High Expiry Risk.
13. **Reports & Activity History**: Chronological system-wide audit logging of sales, dispensations, restock events, and AI suggestions with CSV export.
14. **AI Copilot (Interactive Assistant)**: Embedded query assistant for quick stock lookups, expiry queries, and store operational guidance.
15. **Role-Based Portals**: Dedicated portals for **Owner** (administrative oversight, inventory control, purchasing, analytics) and **Worker** (fast medicine search, shelf retrieval, counter dispensing).

---

## 🔑 Demo Login

Authentication in MEDORA is role-based. To log in:
1. **Select the appropriate portal** (Owner Portal or Worker Portal)
2. **Enter the credentials**
3. Click **Login**

| Portal Role | Username | Password | Purpose & Access Scope |
| :--- | :--- | :--- | :--- |
| **Owner** | `supervisor` | `supervisor123` | Full inventory control, purchasing, restock orders, store analytics, expiry tracking, and audit history |
| **Worker** | `staff` | `staff123` | Medicine lookup, physical rack/shelf location, exact quantity dispensing, AI alternative finder, and shift history |

> **Note**: Selecting a portal role highlights that portal and loads the appropriate credentials. The user must click **Login** to authenticate and enter the dashboard. If the wrong portal is selected for a set of credentials, login is rejected and the user remains on the login page.

---

## 💡 AI Alternative Matching Engine

The AI matching engine utilizes real inventory records to identify viable alternatives when a requested product is unavailable.

### Attribute-Based Comparison
The matching engine evaluates existing inventory records by comparing specific medicine attributes:
- **Active ingredient**: Compares chemical/generic compound identity
- **Strength**: Compares dosage concentration (e.g., 500 mg vs 650 mg)
- **Dosage form**: Compares physical delivery form (Tablet, Capsule, Syrup, etc.)
- **Therapeutic class**: Compares clinical indication category when active ingredients differ
- **Inventory availability**: Filters strictly for items currently in stock (`quantity > 0`)

> **Important**: AI similarity scores reflect **inventory attribute similarity** (active ingredient, strength, and form alignment). They are not medical confidence or clinical safety scores. All suggestions are drawn strictly from medicines already present in the local pharmacy inventory; the system never invents medicines, stock levels, or rack locations.

### Human-in-the-Loop Clinical Rule
- **No Automatic Substitution**: The AI does not automatically substitute medicines or alter prescriptions.
- **Pharmacist Verification Required**: If an alternative shares a therapeutic purpose but contains a **different active ingredient**, MEDORA prominently displays:
  > **"Pharmacist verification required"**
- A qualified human pharmacist must review the clinical suitability and make the final decision before dispensing.

### Demonstration Scenario:
- **Requested Medicine**: `Paracetamol 500 mg Tablet` (Status: 🔴 Out of Stock, 0 units)
- **MEDORA Inventory Scan**: Evaluates available medicines in the local database.
- **Identified Alternative**: `Calpol 500 mg Tablet`
- **Matching Attributes**:
  - Active ingredient: Paracetamol (Identical)
  - Strength: 500 mg (Identical)
  - Dosage form: Tablet (Identical)
  - Current availability: 35 units in stock
  - Location: Rack C → Shelf 2
- **Matching Assessment**:
  > *"Strong inventory match based on identical active ingredient, strength, dosage form, and current stock availability."*
- **Dispensing Action**:
  - Worker enters quantity: `5` units
  - Calculation: `35 - 5 = 30 units remaining`
  - Stock updates from **35 → 30 units** across the application, and a transaction receipt is generated.

---

## 🧪 Demonstration & Evaluation Walkthrough

### Scenario 1: Medicine Search, AI Alternative Discovery & Dispensing
1. On the login page, select **Worker Portal**.
2. Enter username `staff` and password `staff123`, then click **Login**.
3. In **Medicine Search**, search for `"Paracetamol 500 mg"` → Observe that it is marked as **OUT OF STOCK** (0 units available).
4. Click **"Find Alternatives with AI"**.
5. MEDORA searches the existing inventory and suggests **Calpol 500 mg** located at **Rack C → Shelf 2** (35 units available).
6. Review the attribute comparison:
   - `✓ Same active ingredient (Paracetamol)`
   - `✓ Same strength (500 mg)`
   - `✓ Same dosage form (Tablet)`
   - `✓ Available in current inventory`
7. Click **"Verify & Approve"** to complete human verification.
8. Click **"Dispense Alternative Now"**.
9. Enter exact quantity: `5`. Observe the calculation preview: `35 - 5 = 30 units remaining`.
10. Click **"Dispense / Complete Sale"**.
11. Observe the invoice receipt showing medicine name, quantity given (5), remaining stock (30), worker (staff), date, time, and transaction type (`Dispense`).
12. Open **My Activity** to confirm the transaction is logged in the shift history.

### Scenario 2: Owner Restocking & Inventory Management
1. Select **Owner Portal**.
2. Enter username `supervisor` and password `supervisor123`, then click **Login**.
3. Navigate to **Orders & Restock**.
4. Locate the pending order for the out-of-stock medicine.
5. Click **"Receive & Restock"**.
6. Confirm the incoming quantity (e.g., 100 units).
7. Open **Medicine Inventory** or **Stock Management** → Verify that stock is updated and the item transitions to 🟢 **Available**.

---

## 🔬 Validation & Verification Test Cases

| # | Test Scenario | Input & Conditions | System Response & Output | Result |
|---|---|---|---|:---:|
| **1** | **Owner Login** | Select Owner Portal, enter `supervisor` / `supervisor123` | Authenticates and opens Owner Dashboard | **PASS** |
| **2** | **Worker Login** | Select Worker Portal, enter `staff` / `staff123` | Authenticates and opens Worker Dashboard | **PASS** |
| **3** | **Wrong Role Login** | Select Worker Portal with Owner credentials (or vice versa) | Login rejected before user state changes; stays on login page | **PASS** |
| **4** | **Wrong Password** | Enter incorrect password | Login rejected with error; stays on login page | **PASS** |
| **5** | **Medicine Search** | Search by brand, generic name, or active ingredient | Displays matching medicines with rack/shelf coordinates | **PASS** |
| **6** | **Exact Dispensing** | Available = 35, Enter = 5 | Stock updates from 35 → 30 units; receipt logged | **PASS** |
| **7** | **Insufficient Stock** | Available = 10, Enter = 15 | Rejects transaction; displays *"Only 10 units are available."*; stock remains 10 | **PASS** |
| **8** | **Zero / Negative Quantity** | Enter 0 or negative value | Rejects input; displays validation error; stock untouched | **PASS** |
| **9** | **Stock Persistence** | Dispense 5 units (35 → 30), refresh page | Stock remains 30 units via LocalStorage | **PASS** |
| **10**| **AI Alternative Scan** | Requested medicine has 0 units | Evaluates existing inventory items with `quantity > 0` | **PASS** |
| **11**| **Strong Inventory Match**| Requested: Paracetamol 500mg | Calpol 500mg matched on ingredient, strength, and form | **PASS** |
| **12**| **Different Active Ingredient** | Requested: Omeprazole 20mg | Displays prominent *"Pharmacist verification required"* warning | **PASS** |
| **13**| **Logout** | Click Logout in header / navigation | Clears active session and returns to login page | **PASS** |

---

## 🛠️ Technology Stack

MEDORA is built using the following technologies:

- **React**: Component-based user interface architecture
- **Vite**: Modern frontend tooling and fast development server
- **Tailwind CSS**: Utility-first CSS styling with a healthcare-focused teal/slate palette
- **Lucide React**: UI and action iconography
- **Context API**: Centralized state management for inventory, sales, activities, and authentication
- **LocalStorage**: Browser-based client-side data persistence across refreshes

---

## 💻 Local Development Setup

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm (Node Package Manager)

### Running Locally

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kanishka-b06/medora-pharmacy.git
   cd medora-pharmacy
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production bundle**:
   ```bash
   npm run preview
   ```

---

## 📄 Academic Project Summary

MEDORA is designed as a college engineering demonstration project showing how explainable, inventory-grounded AI decision support combined with disciplined stock accounting and physical location tracking can streamline real-world pharmacy operations.
