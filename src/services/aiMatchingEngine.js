/**
 * MEDORA AI-Assisted Alternative Medicine Matching Engine
 * 
 * IMPORTANT SAFETY & CLINICAL NOTICE:
 * - This engine searches ONLY the pharmacy's existing local database.
 * - It never invents medicines, suppliers, or stock.
 * - Matching scores represent strictly "Database field & pharmacological attribute similarity", NOT medical safety or automatic prescription substitution.
 * - Human-in-the-loop verification by a qualified pharmacist/authorized staff member is strictly required.
 */

// Helper to normalize strings for comparison
function normalize(str) {
  if (!str) return '';
  return str.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

// Helper to extract numeric strength value and unit
function parseStrength(strengthStr) {
  if (!strengthStr) return { value: null, unit: '' };
  const match = strengthStr.match(/([\d.]+)\s*([a-zA-Z%]+)/);
  if (match) {
    return { value: parseFloat(match[1]), unit: match[2].toLowerCase() };
  }
  return { value: null, unit: '' };
}

/**
 * Searches the pharmacy inventory for possible alternatives for a requested medicine.
 * 
 * @param {Object} requestedMedicine - The out-of-stock or requested medicine object
 * @param {Array} allMedicines - Complete pharmacy inventory list
 * @param {Object} options - Matching configuration options
 * @returns {Array} List of ranked matching alternatives with scores, reasons, and verification flags
 */
export function findPossibleAlternatives(requestedMedicine, allMedicines, options = {}) {
  if (!requestedMedicine || !allMedicines || allMedicines.length === 0) {
    return [];
  }

  const {
    onlyAvailable = true,
    minScoreThreshold = 40,
  } = options;

  const reqIngredientNorm = normalize(requestedMedicine.activeIngredient);
  const reqStrengthObj = parseStrength(requestedMedicine.strength);
  const reqDosageNorm = normalize(requestedMedicine.dosageForm);
  const reqClassNorm = normalize(requestedMedicine.therapeuticClass);

  const potentialMatches = [];

  for (const candidate of allMedicines) {
    // 1. Skip the exact same medicine item
    if (candidate.id === requestedMedicine.id) {
      continue;
    }

    // 2. Strict Filter: Candidate MUST be currently available in inventory with quantity > 0
    if (onlyAvailable && candidate.quantity <= 0) {
      continue;
    }

    const candIngredientNorm = normalize(candidate.activeIngredient);
    const candStrengthObj = parseStrength(candidate.strength);
    const candDosageNorm = normalize(candidate.dosageForm);
    const candClassNorm = normalize(candidate.therapeuticClass);

    let score = 0;
    const reasons = [];
    const matchFactors = {
      ingredient: false,
      strength: false,
      dosageForm: false,
      therapeuticClass: false,
      inStock: candidate.quantity > 0
    };

    // Factor 1: Active Ingredient Match (Max 50 points)
    if (reqIngredientNorm && candIngredientNorm) {
      if (reqIngredientNorm === candIngredientNorm) {
        score += 50;
        matchFactors.ingredient = true;
        reasons.push('Same active ingredient');
      } else if (
        reqIngredientNorm.includes(candIngredientNorm) ||
        candIngredientNorm.includes(reqIngredientNorm)
      ) {
        score += 35;
        matchFactors.ingredient = true;
        reasons.push(`Related active ingredient salt/form: "${candidate.activeIngredient}"`);
      }
    }

    // Factor 2: Strength & Potency Match (Max 25 points)
    if (reqStrengthObj.value !== null && candStrengthObj.value !== null) {
      if (
        reqStrengthObj.value === candStrengthObj.value &&
        reqStrengthObj.unit === candStrengthObj.unit
      ) {
        score += 25;
        matchFactors.strength = true;
        reasons.push('Same strength');
      } else if (reqStrengthObj.unit === candStrengthObj.unit) {
        // Different strength but same unit (e.g. 500mg vs 650mg)
        const ratio = Math.min(reqStrengthObj.value, candStrengthObj.value) / Math.max(reqStrengthObj.value, candStrengthObj.value);
        const partialStrengthScore = Math.round(15 * ratio);
        score += partialStrengthScore;
        reasons.push(`Alternative strength: ${candidate.strength} (Requires pharmacist dosage adjustment)`);
      }
    } else if (normalize(candidate.strength) === normalize(requestedMedicine.strength)) {
      score += 25;
      matchFactors.strength = true;
      reasons.push('Same strength');
    }

    // Factor 3: Dosage Form Match (Max 15 points)
    if (reqDosageNorm && candDosageNorm) {
      if (reqDosageNorm === candDosageNorm) {
        score += 15;
        matchFactors.dosageForm = true;
        reasons.push('Same dosage form');
      } else if (
        (reqDosageNorm.includes('tablet') && candDosageNorm.includes('capsule')) ||
        (reqDosageNorm.includes('capsule') && candDosageNorm.includes('tablet'))
      ) {
        score += 10;
        reasons.push(`Compatible solid oral form: ${candidate.dosageForm} (vs ${requestedMedicine.dosageForm})`);
      }
    }

    // Factor 4: Therapeutic Class & Indication (Max 30 points)
    if (reqClassNorm && candClassNorm) {
      if (reqClassNorm === candClassNorm) {
        score += 30;
        matchFactors.therapeuticClass = true;
        reasons.push(`Same therapeutic category: ${candidate.therapeuticClass}`);
      } else if (
        reqClassNorm.includes(candClassNorm) ||
        candClassNorm.includes(reqClassNorm)
      ) {
        score += 20;
        matchFactors.therapeuticClass = true;
        reasons.push(`Overlapping pharmacological action (${candidate.therapeuticClass})`);
      }
    }

    // Availability factor: Candidate is in current inventory with positive quantity
    score += 5;
    reasons.push('Available in current inventory');

    // Check if this candidate is an exact 3-factor strong match
    const isStrongestMatch = matchFactors.ingredient && matchFactors.strength && matchFactors.dosageForm;

    // Final clean matching reasons list
    const finalReasons = [];
    if (isStrongestMatch) {
      finalReasons.push('Same active ingredient, strength, and dosage form.');
      finalReasons.push('Available in current inventory');
    } else if (matchFactors.ingredient) {
      finalReasons.push('Same active ingredient');
      if (matchFactors.strength) finalReasons.push('Same strength');
      else finalReasons.push(`Alternative strength (${candidate.strength})`);
      if (matchFactors.dosageForm) finalReasons.push('Same dosage form');
      finalReasons.push('Available in current inventory');
    } else {
      // Different active ingredient: clearly state warnings and require verification
      finalReasons.push('⚠ Different active ingredient');
      finalReasons.push('⚠ Pharmacist verification required');
      if (matchFactors.therapeuticClass) {
        finalReasons.push(`Same therapeutic category: ${candidate.therapeuticClass}`);
      }
      finalReasons.push('Available in current inventory');
    }

    // Normalize final score to a maximum of 98% (never 100% to reinforce AI advisory nature)
    const finalScore = Math.min(98, Math.max(10, score));

    // Only include candidate if there is meaningful clinical/database rationale
    // (Must share at least active ingredient OR therapeutic class with >= minScoreThreshold)
    if ((matchFactors.ingredient || matchFactors.therapeuticClass) && finalScore >= minScoreThreshold) {
      potentialMatches.push({
        candidate,
        score: finalScore,
        matchFactors,
        isStrongestMatch,
        reasons: finalReasons,
        matchType: isStrongestMatch
          ? 'Strongest Match'
          : matchFactors.ingredient
          ? (matchFactors.strength ? 'Exact Generic / Bio-Equivalent' : 'Same Ingredient (Different Strength)')
          : 'Different Active Ingredient',
        storageLocation: `Rack ${candidate.rack} → Shelf ${candidate.shelf}`,
        disclaimer: matchFactors.ingredient
          ? 'Database similarity calculation only. Pharmacist verification mandatory before dispensing.'
          : 'Different active ingredient. Pharmacist verification strictly required.'
      });
    }
  }

  // Sort: Strongest 3-factor matches first, then same active ingredient, then highest score, then quantity
  potentialMatches.sort((a, b) => {
    if (a.isStrongestMatch && !b.isStrongestMatch) return -1;
    if (!a.isStrongestMatch && b.isStrongestMatch) return 1;
    if (a.matchFactors.ingredient && !b.matchFactors.ingredient) return -1;
    if (!a.matchFactors.ingredient && b.matchFactors.ingredient) return 1;
    if (b.score !== a.score) return b.score - a.score;
    return b.candidate.quantity - a.candidate.quantity;
  });

  return potentialMatches;
}

/**
 * Returns formatted risk analysis for an expiry date.
 * 
 * @param {string} expiryDateStr - YYYY-MM-DD
 * @param {number} warningDays - Default 90
 * @param {number} highRiskDays - Default 30
 * @returns {Object} { status: 'safe'|'expiring_soon'|'high_risk'|'expired', daysRemaining: number, label: string, color: string }
 */
export function calculateExpiryRisk(expiryDateStr, warningDays = 90, highRiskDays = 30) {
  if (!expiryDateStr) {
    return { status: 'safe', daysRemaining: 999, label: 'SAFE', color: 'green' };
  }

  const now = new Date();
  const expiry = new Date(expiryDateStr);
  const diffTime = expiry - now;
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: 'expired',
      daysRemaining,
      label: 'EXPIRED',
      color: 'red',
      description: `Expired ${Math.abs(daysRemaining)} days ago`
    };
  }

  if (daysRemaining <= highRiskDays) {
    return {
      status: 'high_risk',
      daysRemaining,
      label: 'HIGH EXPIRY RISK',
      color: 'red',
      description: `Expires in ${daysRemaining} days (Critical)`
    };
  }

  if (daysRemaining <= warningDays) {
    return {
      status: 'expiring_soon',
      daysRemaining,
      label: 'EXPIRING SOON',
      color: 'amber',
      description: `Expires in ${daysRemaining} days (~${Math.round(daysRemaining / 30)} months)`
    };
  }

  return {
    status: 'safe',
    daysRemaining,
    label: 'SAFE',
    color: 'emerald',
    description: `Valid for ${daysRemaining} days (~${Math.round(daysRemaining / 30)} months)`
  };
}

/**
 * Computes medicine stock status according to exact rules:
 * - Quantity === 0 => OUT OF STOCK
 * - Quantity <= threshold => LOW STOCK
 * - Quantity > threshold => AVAILABLE
 */
export function getStockStatus(quantity, threshold = 10) {
  const qty = Number(quantity) || 0;
  const thresh = Number(threshold) || 10;

  if (qty <= 0) {
    return {
      status: 'out_of_stock',
      label: 'OUT OF STOCK',
      code: 'red',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-200'
    };
  }

  if (qty <= thresh) {
    return {
      status: 'low_stock',
      label: 'LOW STOCK',
      code: 'amber',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  }

  return {
    status: 'available',
    label: 'AVAILABLE',
    code: 'emerald',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  };
}
