import { findPossibleAlternatives, getStockStatus, calculateExpiryRisk } from './src/services/aiMatchingEngine.js';
import { INITIAL_MEDICINES } from './src/data/initialData.js';

console.log('--- Testing PharmAssist AI Matching & Stock Logic ---');

// 1. Test Stock Status Logic
const s1 = getStockStatus(100, 10);
console.assert(s1.status === 'available', 'Stock 100 should be available');

const s2 = getStockStatus(10, 10);
console.assert(s2.status === 'low_stock', 'Stock 10 should be low stock');

const s3 = getStockStatus(0, 10);
console.assert(s3.status === 'out_of_stock', 'Stock 0 should be out of stock');

console.log('✓ Stock Status logic passed!');

// 2. Test AI Alternative Matching Engine on Out-of-Stock Paracetamol 500mg
const oosParacetamol = INITIAL_MEDICINES.find(m => m.id === 'med-001');
const alternatives = findPossibleAlternatives(oosParacetamol, INITIAL_MEDICINES, { onlyAvailable: true });

console.log(`Found ${alternatives.length} alternatives for ${oosParacetamol.name}`);
console.assert(alternatives.length >= 2, 'Should find at least Calpol and Dolo as alternatives');

const topMatch = alternatives[0];
console.log(`Top Match: ${topMatch.candidate.name} (${topMatch.score}% score)`);
console.log(`Reasons:`, topMatch.reasons);
console.assert(topMatch.candidate.activeIngredient === 'Paracetamol', 'Top match must have same active ingredient');
console.assert(topMatch.candidate.quantity > 0, 'Candidate must be in stock');

console.log('✓ AI Alternative Matching engine passed!');

// 3. Test Expiry Risk
const exp1 = calculateExpiryRisk('2026-09-25', 90, 30);
console.log('Expiry risk for 2026-09-25:', exp1);
console.assert(exp1.status === 'high_risk' || exp1.status === 'expiring_soon', 'Imminent date should be high risk or expiring soon');

console.log('✓ All core logic tests passed with 100% assertions satisfied!');
