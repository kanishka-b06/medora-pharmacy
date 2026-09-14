# MEDORA — Smart Pharmacy Management System

## Project Overview

MEDORA is a role-based pharmacy management web application designed to make medicine search, stock checking, physical medicine location tracking, and dispensing faster and more organized.

The main workflow is:

Search Medicine → Check Availability → Find Rack/Shelf → Enter Exact Quantity → Validate Stock → Dispense → Automatically Update Stock

## Main Features

* Search medicines by relevant medicine information
* View medicine details such as generic/active ingredient, strength, form, quantity, batch and expiry
* Check whether a medicine is available or out of stock
* View the physical rack and shelf location
* Dispense an exact quantity of medicine
* Automatically deduct the dispensed quantity from stock
* Prevent dispensing more than the available quantity
* Track batches and expiry information
* Owner and Worker role-based access
* AI-assisted alternative medicine suggestions using medicines already present in the pharmacy inventory
* Orders/restocking and inventory management
* Reports/history and expiry-risk information

## How MEDORA Works

1. A worker searches for a medicine.
2. MEDORA shows its availability, quantity and physical rack/shelf location.
3. If the medicine is available, the worker enters the exact quantity to dispense.
4. MEDORA validates that the requested quantity does not exceed available stock.
5. After dispensing, the stock is automatically reduced.
6. The transaction is recorded with the medicine, quantity, remaining stock, worker and date/time.
7. If the requested medicine is unavailable, MEDORA can suggest an alternative from the existing pharmacy inventory.

## User Roles

### Owner

* Manage medicines and inventory
* Manage workers
* View stock and management information
* Handle restocking and other owner-level functions

### Worker

* Search and view medicines
* Check availability and physical location
* Dispense medicines
* Update stock through dispensing
* Use the AI-assisted alternative finder

Workers cannot create their own accounts or access owner-only management functions.

## AI Alternative Feature

When a requested medicine is unavailable, MEDORA searches the medicines already stored in the pharmacy inventory.

The strongest matches are based mainly on:

* Active ingredient
* Strength
* Dosage form

If a suggested medicine has a different active ingredient, MEDORA clearly indicates that pharmacist verification is required.

The AI feature assists with finding inventory alternatives. It does not independently make clinical decisions or invent medicines that are not present in the pharmacy inventory.

## Example Workflow

Example:

Paracetamol 500 mg is out of stock.

MEDORA searches the existing inventory and can identify Calpol 500 mg as a strong inventory match because it has the same active ingredient, strength and dosage form.

The system shows the available quantity and physical location so the worker can verify the medicine before dispensing.

## Technology Used

* React
* Vite
* Tailwind CSS
* Context API
* LocalStorage
* Lucide React

## Demo Login

### Owner

Username: `supervisor`  
Password: `supervisor123`

### Worker

Username: `staff`  
Password: `staff123`

## How to Run

```bash
npm install
npm run dev
```

Then open the local development URL shown by Vite.

## Project Purpose

MEDORA was developed as a college project to demonstrate how a pharmacy management system can combine inventory management, role-based access, medicine search, dispensing logic and AI-assisted inventory alternatives in one application.
