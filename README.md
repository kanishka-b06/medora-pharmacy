# PharmAssist (MEDORA)

### AI-Powered Medicine Retrieval, Stock & Expiry Risk Assistant with Alternative Medicine Support for Small Pharmacies

PharmAssist is a modern, responsive, role-based web application designed to solve critical operational bottlenecks in local pharmacies:
1. **Slow manual lookup** in paper/Excel sheets for less-frequently purchased medicines.
2. **Missing storage coordinates** resulting in delayed customer service.
3. **Difficult generic substitution** when requested brands are out of stock.
4. **Expiry waste** through lack of automated batch risk monitoring.

---

## 🌟 Key Functional Features

- ⚡ **Instant Medicine Retrieval**: Search by commercial brand, generic name, active ingredient, strength, or batch number with instant **Rack & Shelf** storage location display (`Rack B → Shelf 3`).
- 🤖 **AI Alternative Medicine Finder**: Multi-factor matching engine scanning local pharmacy inventory for exact generics and therapeutic equivalents with explainability bullets and percentage similarity scores.
- 🛡️ **Human-in-the-Loop Governance**: Strict prohibition of automatic medicine substitution; pharmacist authorization (**✓ Approve**, **✕ Reject**, **Ignore**) is mandatory.
- 📊 **Connected Stock Logic**: Real-time deduction equation: `Previous Stock − Quantity Sold = Remaining Stock` with automatic threshold triggers (🟢 Available, 🟠 Low Stock, 🔴 Out of Stock).
- ⏳ **Expiry Risk Monitor**: Days-remaining tracking categorized into 🟢 **SAFE**, 🟡 **EXPIRING SOON** ($\le 90$ days), and 🔴 **HIGH EXPIRY RISK** ($\le 30$ days).
- 🚚 **Supply Chain & Restock Workflow**: Purchase order tracking (`Order Required` → `Ordered` → `In Transit` → `Arrived`) and stock replenishment.
- 👥 **Dual Role-Based Portals**: Separate **Owner / Admin** and **Worker / Staff** experiences with client-side permission guards.

---

## 🔑 Demo Login Accounts

| Portal | Username | Password | Role Description |
| :--- | :--- | :--- | :--- |
| **Owner / Admin** | `supervisor` (or 1-click button) | `supervisor123` | Full stock control, purchase orders, expiry risk monitor, AI audit log, staff management |
| **Worker / Staff** | `staff` (or 1-click button) | `staff123` | Rapid retrieval, counter sales dispensing, AI alternative finder, physical shelf coordinates |

---

## 🛠️ Technology Stack

- **Frontend**: React 18 (Hooks, Context API, responsive LocalStorage state synchronization)
- **Tooling**: Vite 6 (ultra-fast build and HMR)
- **Styling**: Tailwind CSS (custom healthcare teal/mint tokens, responsive layouts)
- **Icons**: Lucide React

---

## 🚀 How to Run Locally

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/` in your browser.

3. **Build production bundle**:
   ```bash
   npm run build
   ```

---

## 🗺️ Project Architecture

```
PharmAssist
├── src/
│   ├── components/
│   │   ├── common/        # Badges, StatCards, Modals, Toasts, Architecture Diagrams
│   │   ├── layout/        # Header, Sidebar, RoleBasedLayout
│   │   └── modals/        # Add/Edit Medicine, Record Sale, Restock, PO Orders
│   ├── context/           # PharmacyContext.jsx (Client state & LocalStorage sync)
│   ├── services/          # aiMatchingEngine.js (Similarity scoring & explainability)
│   ├── data/              # initialData.js (Demonstration inventory data)
│   ├── pages/
│   │   ├── auth/          # LoginPage.jsx (Dual portal login & quick access)
│   │   ├── admin/         # Dashboard, Inventory, Stock, Orders, Expiry, AI Audit, Settings
│   │   └── worker/        # WorkerSearch, RecordSalePage, WorkerAlternativeFinder, MedicineInfoPage
│   ├── App.jsx            # Dynamic client-side routing & role guards
│   ├── main.jsx           # Provider mounting
│   └── index.css          # Theme tokens & custom scrollbars
```

---

## 🧪 Demonstration Test Scenarios

### Scenario 1: Out-of-Stock Medicine & AI Alternative Dispensing
1. Log in as **Worker** (`staff` or click "Worker Portal").
2. Search for **"Paracetamol 500 mg"** $\rightarrow$ Notice it is 🔴 **OUT OF STOCK** with an expected arrival date.
3. Click **"Find Alternatives"** $\rightarrow$ AI scans store inventory and finds **Calpol 500 mg** (98% match) located at **Rack C → Shelf 2** (35 units available).
4. Review *"Why was this suggested?"* $\rightarrow$ Click **"Verify & Approve"** $\rightarrow$ Click **"Dispense Alternative Now"**.
5. Sell 5 units $\rightarrow$ Observe live deduction from `35 → 30 units`.

### Scenario 2: Supply Chain Restock Flow
1. Log in as **Owner** (`supervisor` or click "Owner Portal").
2. Navigate to **Orders & Restock** $\rightarrow$ Locate the pending purchase order for **Paracetamol 500 mg**.
3. Click **"Receive & Restock"** $\rightarrow$ Confirm arrival of 150 units with Batch `B102-R`.
4. Return to **Dashboard / Inventory** $\rightarrow$ Observe status changes to 🟢 **150 AVAILABLE** and critical alert clears automatically.
