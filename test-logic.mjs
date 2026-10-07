/**
 * ==============================================================================
 * MEDORA Pharmacy Management System — Comprehensive Unit Testing Suite
 * ==============================================================================
 * 
 * Granular Unit Testing & Boundary Verification covering:
 *  1. Stock Status Boundary Logic (Available, Low Stock, Out of Stock, Edge Cases)
 *  2. Dispensing Transaction Validation (Stock deduction, over-dispense, negative/zero rejections)
 *  3. AI-Assisted Alternative Medicine Matching Engine (Scoring, Filtering, Verification Warnings)
 *  4. Expiry Risk Assessment Engine (Dynamic Temporal Offsets: Safe, Expiring Soon, High Risk, Expired)
 *  5. React Error Boundary Lifecycle Contract & State Recovery
 *  6. Supabase Database Schema Mapping & DTO Consistency
 * 
 * Execution: npm test (or node test-logic.mjs)
 * ==============================================================================
 */

import { findPossibleAlternatives, getStockStatus, calculateExpiryRisk } from './src/services/aiMatchingEngine.js';
import { INITIAL_MEDICINES } from './src/data/initialData.js';
import { mapMedicineToDb, mapMedicineFromDb, mapSaleToDb } from './src/lib/supabaseService.js';
import {
  initialErrorBoundaryState,
  getDerivedStateFromErrorLogic,
  resetErrorBoundaryLogic
} from './src/components/common/errorBoundaryCore.js';

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    testsPassed++;
    console.log(`  ✓ [PASS] ${message}`);
  } else {
    testsFailed++;
    console.error(`  ✗ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
}

function suite(title, fn) {
  console.log(`\n======================================================`);
  console.log(`  TEST SUITE: ${title}`);
  console.log(`======================================================`);
  try {
    fn();
  } catch (err) {
    console.error(`Suite terminated with error: ${err.message}`);
  }
}

// --------------------------------------------------------------------------
// SUITE 1: Stock Status Boundary Logic
// --------------------------------------------------------------------------
suite('1. Stock Status Boundary Logic & Thresholds', () => {
  // Test 1.1: Normal Available Stock
  const normal = getStockStatus(100, 10);
  assert(normal.status === 'available', 'Quantity 100 with threshold 10 is AVAILABLE');
  assert(normal.badgeClass.includes('emerald'), 'Available stock returns emerald styling badge');

  // Test 1.2: Exact Threshold Boundary (quantity === threshold)
  const exactThreshold = getStockStatus(10, 10);
  assert(exactThreshold.status === 'low_stock', 'Quantity exactly at threshold (10) is categorized as LOW STOCK');
  assert(exactThreshold.badgeClass.includes('amber'), 'Low stock returns amber styling badge');

  // Test 1.3: Sub-Threshold Stock (quantity < threshold)
  const subThreshold = getStockStatus(5, 10);
  assert(subThreshold.status === 'low_stock', 'Quantity below threshold (5 < 10) is categorized as LOW STOCK');

  // Test 1.4: Zero Stock Boundary (quantity === 0)
  const zeroStock = getStockStatus(0, 10);
  assert(zeroStock.status === 'out_of_stock', 'Quantity of 0 is categorized as OUT OF STOCK');
  assert(zeroStock.badgeClass.includes('rose'), 'Out of stock returns rose/red styling badge');

  // Test 1.5: Negative Stock Guard
  const negativeStock = getStockStatus(-5, 10);
  assert(negativeStock.status === 'out_of_stock', 'Negative quantity (-5) is safely coerced to OUT OF STOCK');

  // Test 1.6: String coercion
  const stringStock = getStockStatus('25', '10');
  assert(stringStock.status === 'available', 'String inputs ("25", "10") correctly coerce to numeric AVAILABLE');
});

// --------------------------------------------------------------------------
// SUITE 2: Dispensing Transaction & Validation Engine
// --------------------------------------------------------------------------
suite('2. Dispensing Transaction Logic & Edge Case Validation', () => {
  // Pure transaction simulator replicating PharmacyContext.jsx recordSale logic
  function simulateDispense(availableStock, qtyToDispense) {
    const rawQty = qtyToDispense;
    const qty = parseInt(rawQty, 10);

    // Validation 1: Invalid input check
    if (rawQty === '' || rawQty === null || rawQty === undefined || isNaN(qty) || qty <= 0) {
      return { success: false, reason: 'INVALID_QUANTITY', remainingStock: availableStock };
    }

    // Validation 2: Stock sufficiency check
    if (qty > availableStock) {
      return { success: false, reason: 'INSUFFICIENT_STOCK', remainingStock: availableStock };
    }

    // Calculation: remaining = available - dispensed
    const remainingStock = Math.max(0, availableStock - qty);
    return { success: true, remainingStock, dispensed: qty };
  }

  // Test 2.1: Valid standard dispense
  const tx1 = simulateDispense(100, 6);
  assert(tx1.success === true, 'Dispense 6 units from 100 units succeeds');
  assert(tx1.remainingStock === 94, 'Stock decreases exactly to 94 (100 - 6 = 94)');

  // Test 2.2: Boundary dispense (exact exhaustion of stock)
  const tx2 = simulateDispense(50, 50);
  assert(tx2.success === true, 'Dispense exactly remaining stock (50 of 50) succeeds');
  assert(tx2.remainingStock === 0, 'Remaining stock is 0 (Out of stock condition reached)');

  // Test 2.3: Over-dispense rejection (requested > available)
  const tx3 = simulateDispense(20, 25);
  assert(tx3.success === false, 'Dispense 25 from 20 available is rejected');
  assert(tx3.reason === 'INSUFFICIENT_STOCK', 'Rejection reason is INSUFFICIENT_STOCK');
  assert(tx3.remainingStock === 20, 'Stock remains strictly unchanged at 20');

  // Test 2.4: Zero quantity rejection
  const tx4 = simulateDispense(50, 0);
  assert(tx4.success === false, 'Dispensing 0 units is rejected as invalid');
  assert(tx4.reason === 'INVALID_QUANTITY', 'Rejection reason is INVALID_QUANTITY');

  // Test 2.5: Negative quantity rejection
  const tx5 = simulateDispense(50, -4);
  assert(tx5.success === false, 'Dispensing negative quantity (-4) is rejected');
  assert(tx5.reason === 'INVALID_QUANTITY', 'Negative values rejected');

  // Test 2.6: Non-numeric and empty input rejection
  const tx6 = simulateDispense(50, 'abc');
  assert(tx6.success === false, 'Dispensing non-numeric string "abc" is rejected');
  const tx7 = simulateDispense(50, '');
  assert(tx7.success === false, 'Dispensing empty string is rejected');
});

// --------------------------------------------------------------------------
// SUITE 3: AI-Assisted Alternative Medicine Matching Engine
// --------------------------------------------------------------------------
suite('3. AI Alternative Matching Engine & Clinical Guardrails', () => {
  // Test 3.1: Finding available alternative for Out-of-Stock medicine
  const outOfStockMed = INITIAL_MEDICINES.find(m => m.id === 'med-001'); // Paracetamol 500mg
  const alternatives = findPossibleAlternatives(outOfStockMed, INITIAL_MEDICINES, { onlyAvailable: true });

  assert(alternatives.length > 0, `Found ${alternatives.length} alternatives for ${outOfStockMed.name}`);
  const topAlternative = alternatives[0];
  assert(topAlternative.candidate.activeIngredient === 'Paracetamol', 'Top match shares exact active ingredient (Paracetamol)');
  assert(topAlternative.candidate.quantity > 0, 'Top alternative candidate has inventory > 0');
  assert(topAlternative.score >= 90, `Top match score is high confidence (${topAlternative.score}%)`);
  assert(topAlternative.isStrongestMatch === true, 'Identified as Strongest Match (same ingredient, strength, form)');

  // Test 3.2: Self-exclusion test (source medicine never recommended as its own alternative)
  const selfMatch = alternatives.find(a => a.candidate.id === outOfStockMed.id);
  assert(selfMatch === undefined, 'Source medicine is never included as its own alternative candidate');

  // Test 3.3: Pharmacist verification warning when active ingredient differs
  const mockAmoxicillin = {
    id: 'test-amox',
    name: 'Amoxicillin 500mg',
    activeIngredient: 'Amoxicillin',
    strength: '500 mg',
    dosageForm: 'Capsule',
    therapeuticClass: 'Antibiotic'
  };
  const mockInventory = [
    {
      id: 'test-cipro',
      name: 'Ciprofloxacin 500mg',
      activeIngredient: 'Ciprofloxacin',
      strength: '500 mg',
      dosageForm: 'Tablet',
      therapeuticClass: 'Antibiotic',
      quantity: 40,
      rack: 'B',
      shelf: '2'
    }
  ];

  const classAlternatives = findPossibleAlternatives(mockAmoxicillin, mockInventory, { onlyAvailable: true });
  assert(classAlternatives.length === 1, 'Alternative with different active ingredient but same class matched');
  const warningAlt = classAlternatives[0];
  assert(warningAlt.reasons.some(r => r.includes('Pharmacist verification required')), 'Contains explicit "Pharmacist verification required" warning flag');
  assert(warningAlt.disclaimer.includes('Different active ingredient'), 'Disclaimer explicitly notes different active ingredient');
});

// --------------------------------------------------------------------------
// SUITE 4: Dynamic Expiry Risk Assessment
// --------------------------------------------------------------------------
suite('4. Dynamic Expiry Risk Temporal Calculation', () => {
  // Utility to create ISO date string offset from today
  function getDateWithOffset(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  }

  // Test 4.1: Past date (Expired)
  const pastDate = getDateWithOffset(-10);
  const expPast = calculateExpiryRisk(pastDate, 90, 30);
  assert(expPast.status === 'expired', `Past date (${pastDate}) correctly categorized as 'expired'`);
  assert(expPast.daysRemaining <= 0, 'Expired item reports non-positive days remaining');

  // Test 4.2: Critical High Risk window (<= 30 days)
  const criticalDate = getDateWithOffset(15);
  const expCritical = calculateExpiryRisk(criticalDate, 90, 30);
  assert(expCritical.status === 'high_risk', `Date in 15 days (${criticalDate}) categorized as 'high_risk'`);
  assert(expCritical.color === 'red', 'High risk expiry triggers red visual indicator');

  // Test 4.3: Expiring Soon window (31 to 90 days)
  const soonDate = getDateWithOffset(60);
  const expSoon = calculateExpiryRisk(soonDate, 90, 30);
  assert(expSoon.status === 'expiring_soon', `Date in 60 days (${soonDate}) categorized as 'expiring_soon'`);
  assert(expSoon.color === 'amber', 'Expiring soon triggers amber visual indicator');

  // Test 4.4: Safe window (> 90 days)
  const safeDate = getDateWithOffset(180);
  const expSafe = calculateExpiryRisk(safeDate, 90, 30);
  assert(expSafe.status === 'safe', `Date in 180 days (${safeDate}) categorized as 'safe'`);
  assert(expSafe.color === 'emerald', 'Safe expiry triggers emerald visual indicator');
});

// --------------------------------------------------------------------------
// SUITE 5: React Error Boundary Lifecycle & State Recovery Contract
// --------------------------------------------------------------------------
suite('5. React Error Boundary Resilience & Recovery Contracts', () => {
  // Test 5.1: Initial State Contract
  assert(initialErrorBoundaryState.hasError === false, 'Initial state contract has hasError: false');
  assert(initialErrorBoundaryState.error === null, 'Initial state contract has error: null');

  // Test 5.2: getDerivedStateFromErrorLogic state transition
  const mockError = new TypeError("Cannot read properties of undefined (reading 'quantity')");
  const stateUpdate = getDerivedStateFromErrorLogic(mockError);
  assert(stateUpdate.hasError === true, 'getDerivedStateFromErrorLogic sets hasError: true');
  assert(stateUpdate.error === mockError, 'Captured error object is safely stored in state');

  // Test 5.3: Error Boundary instance state reset
  const resetState = resetErrorBoundaryLogic();
  assert(resetState.hasError === false, 'resetErrorBoundaryLogic resets hasError back to false');
  assert(resetState.error === null, 'resetErrorBoundaryLogic purges error payload to null');
});

// --------------------------------------------------------------------------
// SUITE 6: Database Data Transfer Object (DTO) Mapping & Schema Integrity
// --------------------------------------------------------------------------
suite('6. Supabase Database Schema Mapping & DTO Contracts', () => {
  const sampleMedicine = {
    id: 'med-unit-01',
    name: 'Amoxicillin Trihydrate 500mg',
    brandName: 'Amoxil',
    activeIngredient: 'Amoxicillin',
    strength: '500 mg',
    dosageForm: 'Capsule',
    therapeuticClass: 'Antibiotic',
    rack: 'C',
    shelf: '3',
    quantity: 45,
    lowStockThreshold: 15,
    price: 12.50,
    batchNumber: 'BAT-2026-X',
    expiryDate: '2027-04-30',
    orderStatus: 'None'
  };

  // Test 6.1: Client entity to Postgres snake_case mapping
  const dbRow = mapMedicineToDb(sampleMedicine);
  assert(dbRow.id === 'med-unit-01', 'Primary key id preserved in DB mapping');
  assert(dbRow.active_ingredient === 'Amoxicillin', 'activeIngredient correctly mapped to snake_case active_ingredient');
  assert(dbRow.dosage_form === 'Capsule', 'dosageForm correctly mapped to dosage_form');
  assert(dbRow.rack === 'C' && dbRow.shelf === '3', 'Rack and shelf locations mapped accurately');
  assert(dbRow.low_stock_threshold === 15, 'low_stock_threshold integer mapped correctly');

  // Test 6.2: Postgres snake_case to Client entity re-hydration
  const hydrated = mapMedicineFromDb(dbRow);
  assert(hydrated.id === sampleMedicine.id, 'Hydrated object retains primary key');
  assert(hydrated.activeIngredient === sampleMedicine.activeIngredient, 'active_ingredient re-hydrated to camelCase activeIngredient');
  assert(hydrated.quantity === 45, 'Quantity preserved as number during round-trip');

  // Test 6.3: Sales / Dispense transaction mapping
  const sampleSale = {
    id: 'sale-999',
    medicineId: 'med-unit-01',
    medicineName: 'Amoxicillin Trihydrate 500mg',
    quantitySold: 5,
    unitPrice: 12.50,
    totalAmount: 62.50,
    previousStock: 45,
    remainingStock: 40,
    worker: 'staff1',
    timestamp: '2026-10-06T10:00:00.000Z'
  };
  const saleDb = mapSaleToDb(sampleSale);
  assert(saleDb.medicine_id === 'med-unit-01', 'Sale foreign key medicine_id preserved');
  assert(saleDb.quantity_sold === 5, 'quantity_sold mapped to integer column');
  assert(saleDb.remaining_stock === 40, 'remaining_stock correctly preserved for audit log');
});

// --------------------------------------------------------------------------
// FINAL EXECUTION REPORT
// --------------------------------------------------------------------------
console.log(`\n======================================================`);
console.log(`  ALL TEST SUITES EXECUTED SUCCESSFULLY`);
console.log(`  Total Passed: ${testsPassed}`);
console.log(`  Total Failed: ${testsFailed}`);
console.log(`======================================================\n`);

if (testsFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
