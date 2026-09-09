// Initial Demo Pharmacy Dataset for MEDORA
// Clearly identified as DEMO INVENTORY for a small local pharmacy.

export const INITIAL_USERS = [
  {
    id: 'usr-supervisor',
    username: 'supervisor',
    name: 'Sarah',
    role: 'owner',
    email: 'kanishka.b6906@gmail.com',
    status: 'active',
    lastActive: 'Just now',
    avatarColor: 'bg-teal-600',
    roleTitle: 'Pharmacy Owner'
  },
  {
    id: 'usr-staff',
    username: 'staff',
    name: 'Arun',
    role: 'staff',
    email: 'staff@medora.local',
    status: 'active',
    lastActive: '5 mins ago',
    avatarColor: 'bg-blue-600',
    roleTitle: 'Pharmacy Staff Dispenser'
  },
  {
    id: 'usr-stockkeeper',
    username: 'stockkeeper',
    name: 'Kavitha',
    role: 'stockkeeper',
    email: 'stockkeeper@medora.local',
    status: 'active',
    lastActive: 'Just now',
    avatarColor: 'bg-teal-700',
    roleTitle: 'Stock Keeper & Batch Manager'
  }
];

export const INITIAL_MEDICINES = [
  {
    id: 'med-001',
    name: 'Paracetamol 500 mg',
    brandName: 'Crocin Pain Relief',
    activeIngredient: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Analgesic / Antipyretic',
    rack: 'B',
    shelf: '3',
    quantity: 0, // OUT OF STOCK to demonstrate AI alternative & restock workflow!
    batchNumber: 'B102',
    expiryDate: '2027-08-15',
    price: 25.00,
    lowStockThreshold: 15,
    expectedRestockDate: '2026-09-10',
    orderStatus: 'Ordered',
    supplier: 'Apex Pharma Distributors',
    isDemo: true
  },
  {
    id: 'med-002',
    name: 'Calpol 500 mg',
    brandName: 'Calpol Fast-Acting',
    activeIngredient: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Analgesic / Antipyretic',
    rack: 'C',
    shelf: '2',
    quantity: 35, // AVAILABLE - Excellent exact match for Paracetamol 500mg!
    batchNumber: 'CP504',
    expiryDate: '2027-11-20',
    price: 30.00,
    lowStockThreshold: 10,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Glaxo Health India',
    isDemo: true
  },
  {
    id: 'med-003',
    name: 'Dolo 650 mg',
    brandName: 'Dolo Fever Care',
    activeIngredient: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Analgesic / Antipyretic',
    rack: 'B',
    shelf: '4',
    quantity: 85, // AVAILABLE - Strong alternative match (same ingredient, 650mg)
    batchNumber: 'DL901',
    expiryDate: '2028-01-10',
    price: 32.00,
    lowStockThreshold: 20,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Micro Labs Ltd',
    isDemo: true
  },
  {
    id: 'med-004',
    name: 'Cetirizine 10 mg',
    brandName: 'Cetzine Allergy',
    activeIngredient: 'Cetirizine Hydrochloride',
    strength: '10 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Antihistamine / Anti-allergy',
    rack: 'A',
    shelf: '2',
    quantity: 6, // LOW STOCK (<= 10)
    batchNumber: 'CT883',
    expiryDate: '2027-05-30',
    price: 18.50,
    lowStockThreshold: 10,
    expectedRestockDate: '2026-09-12',
    orderStatus: 'Order Required',
    supplier: 'Dr. Reddy Labs',
    isDemo: true
  },
  {
    id: 'med-005',
    name: 'Alerid 10 mg',
    brandName: 'Alerid Relief',
    activeIngredient: 'Cetirizine Hydrochloride',
    strength: '10 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Antihistamine / Anti-allergy',
    rack: 'A',
    shelf: '3',
    quantity: 42, // AVAILABLE
    batchNumber: 'AL402',
    expiryDate: '2027-09-18',
    price: 19.00,
    lowStockThreshold: 10,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Cipla Ltd',
    isDemo: true
  },
  {
    id: 'med-006',
    name: 'Omeprazole 20 mg',
    brandName: 'Omez Gastro Relief',
    activeIngredient: 'Omeprazole',
    strength: '20 mg',
    dosageForm: 'Capsule',
    therapeuticClass: 'Proton Pump Inhibitor (Antacid)',
    rack: 'D',
    shelf: '1',
    quantity: 3, // LOW STOCK & EXPIRING SOON!
    batchNumber: 'OM209',
    expiryDate: '2026-09-25', // High expiry risk
    price: 45.00,
    lowStockThreshold: 10,
    expectedRestockDate: '2026-09-08',
    orderStatus: 'Ordered',
    supplier: 'Dr. Reddy Labs',
    isDemo: true
  },
  {
    id: 'med-007',
    name: 'Pantoprazole 40 mg',
    brandName: 'Pan-40 Tablets',
    activeIngredient: 'Pantoprazole Sodium',
    strength: '40 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Proton Pump Inhibitor (Antacid)',
    rack: 'D',
    shelf: '2',
    quantity: 65, // AVAILABLE - Related therapeutic alternative for Omeprazole
    batchNumber: 'PN441',
    expiryDate: '2027-12-05',
    price: 55.00,
    lowStockThreshold: 15,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Alkem Laboratories',
    isDemo: true
  },
  {
    id: 'med-008',
    name: 'Ibuprofen 200 mg',
    brandName: 'Brufen Pain Buster',
    activeIngredient: 'Ibuprofen',
    strength: '200 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'NSAID / Anti-inflammatory',
    rack: 'B',
    shelf: '1',
    quantity: 50, // AVAILABLE
    batchNumber: 'IB772',
    expiryDate: '2026-10-15',
    price: 22.00,
    lowStockThreshold: 12,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Abbott Healthcare',
    isDemo: true
  },
  {
    id: 'med-009',
    name: 'Ibuprofen 400 mg',
    brandName: 'Brufen Forte',
    activeIngredient: 'Ibuprofen',
    strength: '400 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'NSAID / Anti-inflammatory',
    rack: 'B',
    shelf: '2',
    quantity: 70, // AVAILABLE
    batchNumber: 'IB990',
    expiryDate: '2028-03-20',
    price: 34.00,
    lowStockThreshold: 15,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Abbott Healthcare',
    isDemo: true
  },
  {
    id: 'med-010',
    name: 'Azithromycin 500 mg',
    brandName: 'Azee Antibiotic',
    activeIngredient: 'Azithromycin',
    strength: '500 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Macrolide Antibiotic',
    rack: 'C',
    shelf: '4',
    quantity: 18, // AVAILABLE
    batchNumber: 'AZ331',
    expiryDate: '2027-04-10',
    price: 115.00,
    lowStockThreshold: 8,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Cipla Ltd',
    isDemo: true
  },
  {
    id: 'med-011',
    name: 'Amoxicillin 500 mg',
    brandName: 'Mox 500',
    activeIngredient: 'Amoxicillin Trihydrate',
    strength: '500 mg',
    dosageForm: 'Capsule',
    therapeuticClass: 'Penicillin Antibiotic',
    rack: 'C',
    shelf: '3',
    quantity: 0, // OUT OF STOCK
    batchNumber: 'AM552',
    expiryDate: '2027-02-18',
    price: 78.00,
    lowStockThreshold: 10,
    expectedRestockDate: '2026-09-14',
    orderStatus: 'Ordered',
    supplier: 'Sun Pharma',
    isDemo: true
  },
  {
    id: 'med-012',
    name: 'Amoxicillin + Clavulanic Acid 625 mg',
    brandName: 'Augmentin 625 Duo',
    activeIngredient: 'Amoxicillin + Clavulanic Acid',
    strength: '500mg + 125mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Penicillin Antibiotic',
    rack: 'C',
    shelf: '3',
    quantity: 28, // AVAILABLE
    batchNumber: 'AG625',
    expiryDate: '2027-10-15',
    price: 198.00,
    lowStockThreshold: 10,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'GlaxoSmithKline',
    isDemo: true
  },
  {
    id: 'med-013',
    name: 'ORS Electrolyte Powder 21.8 g',
    brandName: 'Electral Sachet',
    activeIngredient: 'Oral Rehydration Salts',
    strength: '21.8 g / Sachet',
    dosageForm: 'Powder Sachet',
    therapeuticClass: 'Electrolyte Replenisher',
    rack: 'A',
    shelf: '1',
    quantity: 120, // AVAILABLE
    batchNumber: 'EL109',
    expiryDate: '2028-06-30',
    price: 22.50,
    lowStockThreshold: 25,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'FDC Limited',
    isDemo: true
  },
  {
    id: 'med-014',
    name: 'Vitamin C 500 mg Chewable',
    brandName: 'Limcee Orange',
    activeIngredient: 'Ascorbic Acid (Vitamin C)',
    strength: '500 mg',
    dosageForm: 'Chewable Tablet',
    therapeuticClass: 'Nutritional Supplement',
    rack: 'A',
    shelf: '4',
    quantity: 8, // LOW STOCK
    batchNumber: 'LC440',
    expiryDate: '2027-01-20',
    price: 24.00,
    lowStockThreshold: 15,
    expectedRestockDate: '2026-09-15',
    orderStatus: 'Order Required',
    supplier: 'Abbott Healthcare',
    isDemo: true
  },
  {
    id: 'med-015',
    name: 'Metformin 500 mg',
    brandName: 'Glycomet 500',
    activeIngredient: 'Metformin Hydrochloride',
    strength: '500 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Anti-diabetic / Biguanide',
    rack: 'D',
    shelf: '3',
    quantity: 95, // AVAILABLE
    batchNumber: 'GM501',
    expiryDate: '2027-08-30',
    price: 28.00,
    lowStockThreshold: 20,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'USV Private Limited',
    isDemo: true
  },
  {
    id: 'med-016',
    name: 'Levocetirizine 5 mg',
    brandName: 'Levocet 5',
    activeIngredient: 'Levocetirizine Dihydrochloride',
    strength: '5 mg',
    dosageForm: 'Tablet',
    therapeuticClass: 'Antihistamine / Anti-allergy',
    rack: 'A',
    shelf: '2',
    quantity: 30, // AVAILABLE - Great alternative for Cetirizine
    batchNumber: 'LC051',
    expiryDate: '2027-11-12',
    price: 26.00,
    lowStockThreshold: 10,
    expectedRestockDate: '',
    orderStatus: 'None',
    supplier: 'Hetero Healthcare',
    isDemo: true
  }
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-101',
    medicineId: 'med-001',
    medicineName: 'Paracetamol 500 mg',
    supplier: 'Apex Pharma Distributors',
    orderedQuantity: 150,
    orderDate: '2026-09-02',
    expectedArrivalDate: '2026-09-10',
    status: 'Ordered', // Order Required | Ordered | In Transit | Arrived | Cancelled
    estimatedCost: 3750,
    notes: 'Urgent refill for high-velocity counter demand.',
    createdBy: 'Sarah'
  },
  {
    id: 'ord-102',
    medicineId: 'med-006',
    medicineName: 'Omeprazole 20 mg',
    supplier: 'Dr. Reddy Labs',
    orderedQuantity: 80,
    orderDate: '2026-09-01',
    expectedArrivalDate: '2026-09-08',
    status: 'In Transit',
    estimatedCost: 3600,
    notes: 'Replacing expiring batch OM209.',
    createdBy: 'Sarah'
  },
  {
    id: 'ord-103',
    medicineId: 'med-011',
    medicineName: 'Amoxicillin 500 mg',
    supplier: 'Sun Pharma',
    orderedQuantity: 60,
    orderDate: '2026-09-03',
    expectedArrivalDate: '2026-09-14',
    status: 'Ordered',
    estimatedCost: 4680,
    notes: 'Prescription antibiotic stockout replenishment.',
    createdBy: 'Sarah'
  }
];

export const INITIAL_SALES = [
  {
    id: 'sale-901',
    medicineId: 'med-003',
    medicineName: 'Dolo 650 mg',
    quantitySold: 5,
    unitPrice: 32.00,
    totalAmount: 160.00,
    customerType: 'Walk-in Customer',
    previousStock: 90,
    remainingStock: 85,
    timestamp: '2026-09-04T12:30:00+05:30',
    recordedBy: 'Arun (staff)',
    notes: 'Fever prescription counter issue'
  },
  {
    id: 'sale-902',
    medicineId: 'med-002',
    medicineName: 'Calpol 500 mg',
    quantitySold: 10,
    unitPrice: 30.00,
    totalAmount: 300.00,
    customerType: 'Walk-in Customer',
    previousStock: 45,
    remainingStock: 35,
    timestamp: '2026-09-04T11:15:00+05:30',
    recordedBy: 'Arun (staff)',
    notes: 'Alternative dispensed after customer agreed'
  },
  {
    id: 'sale-903',
    medicineId: 'med-013',
    medicineName: 'ORS Electrolyte Powder 21.8 g',
    quantitySold: 6,
    unitPrice: 22.50,
    totalAmount: 135.00,
    customerType: 'Walk-in Customer',
    previousStock: 126,
    remainingStock: 120,
    timestamp: '2026-09-04T09:40:00+05:30',
    recordedBy: 'Arun (staff)',
    notes: 'Dehydration treatment counter sale'
  }
];

export const INITIAL_AI_SUGGESTIONS = [
  {
    id: 'ai-sug-501',
    requestedMedicineId: 'med-001',
    requestedMedicineName: 'Paracetamol 500 mg (Crocin)',
    requestedStatus: 'Out of Stock',
    suggestedMedicineId: 'med-002',
    suggestedMedicineName: 'Calpol 500 mg',
    matchScore: 94,
    matchReason: 'Same active ingredient (Paracetamol), identical strength (500 mg), identical dosage form (Tablet), currently in stock (35 units) at Rack C, Shelf 2.',
    decision: 'Approved', // Approved | Rejected | Ignored | Pending
    reviewedBy: 'Sarah (supervisor)',
    timestamp: '2026-09-04T11:10:00+05:30',
    notes: 'Customer accepted Calpol 500mg as exact generic equivalent. Sale recorded.'
  },
  {
    id: 'ai-sug-502',
    requestedMedicineId: 'med-001',
    requestedMedicineName: 'Paracetamol 500 mg (Crocin)',
    requestedStatus: 'Out of Stock',
    suggestedMedicineId: 'med-003',
    suggestedMedicineName: 'Dolo 650 mg',
    matchScore: 82,
    matchReason: 'Same active ingredient (Paracetamol), higher strength (650 mg vs 500 mg), same dosage form (Tablet). Requires supervisor dosage verification.',
    decision: 'Approved',
    reviewedBy: 'Sarah (supervisor)',
    timestamp: '2026-09-04T10:05:00+05:30',
    notes: 'Doctor prescription verified for 650mg dosage.'
  },
  {
    id: 'ai-sug-503',
    requestedMedicineId: 'med-006',
    requestedMedicineName: 'Omeprazole 20 mg',
    requestedStatus: 'Low Stock & Expiring',
    suggestedMedicineId: 'med-007',
    suggestedMedicineName: 'Pantoprazole 40 mg',
    matchScore: 72,
    matchReason: 'Therapeutic equivalent (Proton Pump Inhibitor class for gastric acid reduction). Different active molecule. Supervisor authorization required.',
    decision: 'Approved',
    reviewedBy: 'Sarah (supervisor)',
    timestamp: '2026-09-03T16:20:00+05:30',
    notes: 'Consulted prescribing physician before substitution.'
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'act-001',
    timestamp: '2026-09-04T12:30:00+05:30',
    user: 'Arun (staff)',
    role: 'staff',
    action: 'Sale Recorded',
    medicine: 'Dolo 650 mg',
    details: 'Sold 5 units. Stock updated from 90 → 85.'
  },
  {
    id: 'act-002',
    timestamp: '2026-09-04T11:15:00+05:30',
    user: 'Arun (staff)',
    role: 'staff',
    action: 'AI Alternative Dispensed',
    medicine: 'Calpol 500 mg',
    details: 'Dispensed 10 units of Calpol 500mg following Paracetamol 500mg stockout.'
  },
  {
    id: 'act-003',
    timestamp: '2026-09-04T11:10:00+05:30',
    user: 'Sarah (supervisor)',
    role: 'supervisor',
    action: 'AI Suggestion Approved',
    medicine: 'Calpol 500 mg',
    details: 'Verified 94% similarity match for out-of-stock Paracetamol 500mg.'
  },
  {
    id: 'act-004',
    timestamp: '2026-09-04T09:40:00+05:30',
    user: 'Arun (staff)',
    role: 'staff',
    action: 'Sale Recorded',
    medicine: 'ORS Electrolyte Powder 21.8 g',
    details: 'Sold 6 units. Stock updated from 126 → 120.'
  },
  {
    id: 'act-005',
    timestamp: '2026-09-03T18:00:00+05:30',
    user: 'Sarah (supervisor)',
    role: 'supervisor',
    action: 'Order Placed',
    medicine: 'Amoxicillin 500 mg',
    details: 'Ordered 60 units from Sun Pharma. Expected arrival 14 Sep 2026.'
  },
  {
    id: 'act-006',
    timestamp: '2026-09-02T15:30:00+05:30',
    user: 'Sarah (supervisor)',
    role: 'supervisor',
    action: 'Order Placed',
    medicine: 'Paracetamol 500 mg',
    details: 'Ordered 150 units from Apex Pharma. Expected arrival 10 Sep 2026.'
  }
];

export const INITIAL_SETTINGS = {
  pharmacyName: 'MEDORA Health Pharmacy',
  licenseNumber: 'DL-MEDORA-2026-9901',
  address: 'Suite #102, Central Healthcare Plaza',
  phone: '+91 98765 43210',
  leadPharmacist: 'Sarah',
  lowStockThresholdDefault: 10,
  expiryWarningDays: 90,
  highRiskExpiryDays: 30,
  aiMatchingSensitivity: 'Balanced', // Strict | Balanced | Broad
  requireSupervisorApprovalForAlternatives: true,
  enableSoundAlerts: false,
  currencySymbol: '₹'
};

export const INITIAL_BATCHES = [
  {
    id: 'batch-001',
    medicineId: 'med-001',
    medicineName: 'Paracetamol 500 mg',
    activeIngredient: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    batchNumber: 'B102',
    expiryDate: '2027-08-15',
    quantity: 0, // Previous batch depleted to 0
    rack: 'B',
    shelf: '3',
    status: 'Arranged', // 'Arranged' | 'Unarranged'
    arrangedAt: '2026-08-20T10:00:00+05:30',
    notes: 'Initial operational stock'
  },
  {
    id: 'batch-002',
    medicineId: 'med-001',
    medicineName: 'Paracetamol 500 mg',
    activeIngredient: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    batchNumber: 'B103',
    expiryDate: '2028-02-15',
    quantity: 100, // Ready for arrangement! (Triggers Stock-Zero workflow when B102 is 0)
    rack: '',
    shelf: '',
    status: 'Unarranged',
    arrangedAt: null,
    notes: 'Received from Apex Pharma Distributors. Awaiting physical shelving.'
  },
  {
    id: 'batch-003',
    medicineId: 'med-002',
    medicineName: 'Calpol 500 mg',
    activeIngredient: 'Paracetamol',
    strength: '500 mg',
    dosageForm: 'Tablet',
    batchNumber: 'CP504',
    expiryDate: '2027-11-20',
    quantity: 35,
    rack: 'C',
    shelf: '2',
    status: 'Arranged',
    arrangedAt: '2026-08-15T11:00:00+05:30',
    notes: 'Arranged in Antibiotics/Analgesics row'
  },
  {
    id: 'batch-004',
    medicineId: 'med-003',
    medicineName: 'Dolo 650 mg',
    activeIngredient: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Tablet',
    batchNumber: 'DL901',
    expiryDate: '2028-01-10',
    quantity: 85,
    rack: 'B',
    shelf: '4',
    status: 'Arranged',
    arrangedAt: '2026-08-10T14:30:00+05:30',
    notes: 'Fast-moving counter stock'
  },
  {
    id: 'batch-005',
    medicineId: 'med-003',
    medicineName: 'Dolo 650 mg',
    activeIngredient: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Tablet',
    batchNumber: 'DL905',
    expiryDate: '2028-06-20',
    quantity: 80,
    rack: '',
    shelf: '',
    status: 'Unarranged',
    arrangedAt: null,
    notes: 'Secondary batch received from Micro Labs'
  },
  {
    id: 'batch-006',
    medicineId: 'med-004',
    medicineName: 'Cetirizine 10 mg',
    activeIngredient: 'Cetirizine Hydrochloride',
    strength: '10 mg',
    dosageForm: 'Tablet',
    batchNumber: 'CT883',
    expiryDate: '2027-05-30',
    quantity: 6,
    rack: 'A',
    shelf: '2',
    status: 'Arranged',
    arrangedAt: '2026-07-15T09:30:00+05:30',
    notes: 'Low stock'
  },
  {
    id: 'batch-007',
    medicineId: 'med-011',
    medicineName: 'Amoxicillin 500 mg',
    activeIngredient: 'Amoxicillin Trihydrate',
    strength: '500 mg',
    dosageForm: 'Capsule',
    batchNumber: 'AM553',
    expiryDate: '2027-09-10',
    quantity: 50,
    rack: '',
    shelf: '',
    status: 'Unarranged',
    arrangedAt: null,
    notes: 'Backup batch for out-of-stock Amoxicillin'
  },
  {
    id: 'batch-008',
    medicineId: 'med-007',
    medicineName: 'Pantoprazole 40 mg',
    activeIngredient: 'Pantoprazole Sodium',
    strength: '40 mg',
    dosageForm: 'Tablet',
    batchNumber: 'PN441',
    expiryDate: '2027-12-05',
    quantity: 65,
    rack: 'D',
    shelf: '2',
    status: 'Arranged',
    arrangedAt: '2026-08-01T15:00:00+05:30',
    notes: 'Gastrointestinal aisle'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-001',
    recipientRole: 'stockkeeper',
    title: 'New Batch Available for Arrangement',
    message: 'Paracetamol 500 mg (Batch B103, 100 units) has arrived and is waiting for physical shelf placement.',
    medicineId: 'med-001',
    medicineName: 'Paracetamol 500 mg',
    batchNumber: 'B103',
    quantity: 100,
    timestamp: '2026-09-04T12:00:00+05:30',
    read: false,
    actionRoute: 'stock-arrange'
  },
  {
    id: 'notif-002',
    recipientRole: 'owner',
    title: 'Restock Required',
    message: 'Omeprazole 20 mg has reached critical low stock (3 units remaining, batch expiring soon) and NO backup batch is in the pharmacy.',
    medicineId: 'med-006',
    medicineName: 'Omeprazole 20 mg',
    batchNumber: 'OM209',
    quantity: 3,
    timestamp: '2026-09-04T09:15:00+05:30',
    read: false,
    actionRoute: 'admin-orders'
  }
];
