import { supabase, isSupabaseConfigured } from './supabase';
import {
  INITIAL_MEDICINES,
  INITIAL_USERS,
  INITIAL_SALES,
  INITIAL_ORDERS,
  INITIAL_ACTIVITIES,
  INITIAL_AI_SUGGESTIONS,
  INITIAL_SETTINGS
} from '../data/initialData';

/**
 * Normalizes camelCase React objects to handle flexible column naming in Postgres
 * (e.g. rack, shelf, activeIngredient / active_ingredient, batchNumber / batch_number).
 */

export function mapMedicineToDb(medicine) {
  return {
    id: medicine.id,
    name: medicine.name,
    brand_name: medicine.brandName || null,
    active_ingredient: medicine.activeIngredient || null,
    strength: medicine.strength || null,
    power: medicine.power || null,
    dosage_form: medicine.dosageForm || null,
    therapeutic_class: medicine.therapeuticClass || null,
    used_for: medicine.usedFor || null,
    who_should_use: medicine.whoShouldUse || null,
    dosage_instructions: medicine.dosageInstructions || null,
    rack: medicine.rack || 'A',
    shelf: String(medicine.shelf || '1'),
    quantity: Number(medicine.quantity) || 0,
    batch_number: medicine.batchNumber || null,
    expiry_date: medicine.expiryDate || null,
    price: Number(medicine.price) || 0,
    low_stock_threshold: Number(medicine.lowStockThreshold) || 10,
    expected_restock_date: medicine.expectedRestockDate || null,
    order_status: medicine.orderStatus || 'None',
    supplier: medicine.supplier || null,
    is_demo: Boolean(medicine.isDemo)
  };
}

export function mapMedicineFromDb(dbRow) {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    name: dbRow.name,
    brandName: dbRow.brand_name !== undefined ? dbRow.brand_name : dbRow.brandName || '',
    activeIngredient: dbRow.active_ingredient !== undefined ? dbRow.active_ingredient : dbRow.activeIngredient || '',
    strength: dbRow.strength || '',
    power: dbRow.power || '',
    dosageForm: dbRow.dosage_form !== undefined ? dbRow.dosage_form : dbRow.dosageForm || 'Tablet',
    therapeuticClass: dbRow.therapeutic_class !== undefined ? dbRow.therapeutic_class : dbRow.therapeuticClass || 'General Medicine',
    usedFor: dbRow.used_for !== undefined ? dbRow.used_for : dbRow.usedFor || '',
    whoShouldUse: dbRow.who_should_use !== undefined ? dbRow.who_should_use : dbRow.whoShouldUse || '',
    dosageInstructions: dbRow.dosage_instructions !== undefined ? dbRow.dosage_instructions : dbRow.dosageInstructions || '',
    rack: dbRow.rack || 'A',
    shelf: String(dbRow.shelf || '1'),
    quantity: Number(dbRow.quantity !== undefined ? dbRow.quantity : 0),
    batchNumber: dbRow.batch_number !== undefined ? dbRow.batch_number : dbRow.batchNumber || '',
    expiryDate: dbRow.expiry_date !== undefined ? dbRow.expiry_date : dbRow.expiryDate || '',
    price: Number(dbRow.price !== undefined ? dbRow.price : 0),
    lowStockThreshold: Number(dbRow.low_stock_threshold !== undefined ? dbRow.low_stock_threshold : dbRow.lowStockThreshold || 10),
    expectedRestockDate: dbRow.expected_restock_date !== undefined ? dbRow.expected_restock_date : dbRow.expectedRestockDate || '',
    orderStatus: dbRow.order_status !== undefined ? dbRow.order_status : dbRow.orderStatus || 'None',
    supplier: dbRow.supplier || '',
    isDemo: Boolean(dbRow.is_demo !== undefined ? dbRow.is_demo : dbRow.isDemo)
  };
}

export function mapSaleToDb(sale) {
  return {
    id: sale.id,
    medicine_id: sale.medicineId,
    medicine_name: sale.medicineName || sale.medicine,
    quantity_sold: sale.quantitySold || sale.quantityGiven || 0,
    unit_price: Number(sale.unitPrice) || 0,
    total_amount: Number(sale.totalAmount) || 0,
    customer_type: sale.customerType || 'Walk-in Customer',
    previous_stock: Number(sale.previousStock !== undefined ? sale.previousStock : sale.availableStock) || 0,
    remaining_stock: Number(sale.remainingStock) || 0,
    recorded_by: sale.recordedBy || sale.worker || 'Worker',
    notes: sale.notes || '',
    timestamp: sale.timestamp || new Date().toISOString()
  };
}

export function mapSaleFromDb(dbRow) {
  if (!dbRow) return null;
  const qty = Number(dbRow.quantity_sold !== undefined ? dbRow.quantity_sold : dbRow.quantitySold || 0);
  const remaining = Number(dbRow.remaining_stock !== undefined ? dbRow.remaining_stock : dbRow.remainingStock || 0);
  const prev = Number(dbRow.previous_stock !== undefined ? dbRow.previous_stock : dbRow.previousStock || (remaining + qty));
  const ts = dbRow.timestamp || new Date().toISOString();
  const dateObj = new Date(ts);

  return {
    id: dbRow.id,
    medicineId: dbRow.medicine_id || dbRow.medicineId,
    medicineName: dbRow.medicine_name || dbRow.medicineName || dbRow.medicine || '',
    medicine: dbRow.medicine_name || dbRow.medicineName || '',
    quantitySold: qty,
    quantityDispensed: qty,
    quantityGiven: qty,
    availableStock: prev,
    previousStock: prev,
    remainingStock: remaining,
    worker: dbRow.recorded_by || dbRow.recordedBy || dbRow.worker || 'staff',
    recordedBy: dbRow.recorded_by || dbRow.recordedBy || 'staff',
    date: dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    timestamp: ts,
    transactionType: 'Dispense',
    type: 'Dispense',
    unitPrice: Number(dbRow.unit_price !== undefined ? dbRow.unit_price : dbRow.unitPrice || 0),
    totalAmount: Number(dbRow.total_amount !== undefined ? dbRow.total_amount : dbRow.totalAmount || 0),
    customerType: dbRow.customer_type || dbRow.customerType || 'Walk-in Customer',
    notes: dbRow.notes || ''
  };
}

export function mapOrderToDb(order) {
  return {
    id: order.id,
    medicine_id: order.medicineId,
    medicine_name: order.medicineName,
    supplier: order.supplier,
    ordered_quantity: Number(order.orderedQuantity) || 0,
    order_date: order.orderDate || new Date().toISOString().split('T')[0],
    expected_arrival_date: order.expectedArrivalDate || null,
    status: order.status || 'Ordered',
    estimated_cost: Number(order.estimatedCost) || 0,
    notes: order.notes || '',
    created_by: order.createdBy || 'Supervisor'
  };
}

export function mapOrderFromDb(dbRow) {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    medicineId: dbRow.medicine_id || dbRow.medicineId,
    medicineName: dbRow.medicine_name || dbRow.medicineName,
    supplier: dbRow.supplier || '',
    orderedQuantity: Number(dbRow.ordered_quantity !== undefined ? dbRow.ordered_quantity : dbRow.orderedQuantity || 0),
    orderDate: dbRow.order_date || dbRow.orderDate || '',
    expectedArrivalDate: dbRow.expected_arrival_date !== undefined ? dbRow.expected_arrival_date : dbRow.expectedArrivalDate || '',
    status: dbRow.status || 'Ordered',
    estimatedCost: Number(dbRow.estimated_cost !== undefined ? dbRow.estimated_cost : dbRow.estimatedCost || 0),
    notes: dbRow.notes || '',
    createdBy: dbRow.created_by || dbRow.createdBy || 'Supervisor'
  };
}

export function mapActivityToDb(act) {
  return {
    id: act.id,
    timestamp: act.timestamp || new Date().toISOString(),
    user_name: act.user || act.performedBy || 'System',
    role: act.role || 'staff',
    action: act.action || 'Activity',
    medicine: act.medicine || act.target || '—',
    details: act.details || ''
  };
}

export function mapActivityFromDb(dbRow) {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    timestamp: dbRow.timestamp || new Date().toISOString(),
    user: dbRow.user_name || dbRow.user || dbRow.performedBy || 'System',
    performedBy: dbRow.user_name || dbRow.user || dbRow.performedBy || 'System',
    role: dbRow.role || 'staff',
    action: dbRow.action || 'Activity',
    medicine: dbRow.medicine || dbRow.target || '—',
    target: dbRow.medicine || dbRow.target || '—',
    details: dbRow.details || ''
  };
}

export function mapAISuggestionToDb(sug) {
  return {
    id: sug.id,
    requested_medicine_id: sug.requestedMedicineId || null,
    requested_medicine_name: sug.requestedMedicineName || '',
    requested_status: sug.requestedStatus || 'Out of Stock',
    suggested_medicine_id: sug.suggestedMedicineId || null,
    suggested_medicine_name: sug.suggestedMedicineName || '',
    match_score: Number(sug.matchScore) || 0,
    match_reason: sug.matchReason || '',
    decision: sug.decision || sug.pharmacistDecision || 'Approved',
    reviewed_by: sug.reviewedBy || 'Pharmacist',
    notes: sug.notes || sug.pharmacistNotes || '',
    timestamp: sug.timestamp || new Date().toISOString()
  };
}

export function mapAISuggestionFromDb(dbRow) {
  if (!dbRow) return null;
  return {
    id: dbRow.id,
    requestedMedicineId: dbRow.requested_medicine_id || dbRow.requestedMedicineId,
    requestedMedicineName: dbRow.requested_medicine_name || dbRow.requestedMedicineName,
    requestedStatus: dbRow.requested_status || dbRow.requestedStatus,
    suggestedMedicineId: dbRow.suggested_medicine_id || dbRow.suggestedMedicineId,
    suggestedMedicineName: dbRow.suggested_medicine_name || dbRow.suggestedMedicineName,
    matchScore: Number(dbRow.match_score !== undefined ? dbRow.match_score : dbRow.matchScore || 0),
    matchReason: dbRow.match_reason || dbRow.matchReason || '',
    decision: dbRow.decision || 'Approved',
    pharmacistDecision: dbRow.decision || 'Approved',
    reviewedBy: dbRow.reviewed_by || dbRow.reviewedBy || 'Pharmacist',
    notes: dbRow.notes || dbRow.pharmacistNotes || '',
    pharmacistNotes: dbRow.notes || dbRow.pharmacistNotes || '',
    timestamp: dbRow.timestamp || new Date().toISOString()
  };
}

/**
 * Seeds initial demo data into Supabase if tables are currently empty.
 * Never overwrites existing records.
 */
export async function seedInitialDataIfEmpty() {
  if (!isSupabaseConfigured || !supabase) return;

  try {
    // 1. Seed Medicines if none exist
    const { data: existingMeds, error: medCheckError } = await supabase
      .from('medicines')
      .select('id')
      .limit(1);

    if (!medCheckError && (!existingMeds || existingMeds.length === 0)) {
      console.info('[MEDORA] Seeding initial medicines to Supabase...');
      const dbRows = INITIAL_MEDICINES.map(mapMedicineToDb);
      await supabase.from('medicines').insert(dbRows);
    }

    // 2. Seed Users if none exist
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('users')
      .select('id')
      .limit(1);

    if (!userCheckError && (!existingUsers || existingUsers.length === 0)) {
      console.info('[MEDORA] Seeding initial users to Supabase...');
      const userRows = INITIAL_USERS.map((u) => ({
        id: u.id,
        username: u.username,
        name: u.name,
        role: u.role,
        email: u.email,
        status: u.status,
        last_active: u.lastActive,
        avatar_color: u.avatarColor,
        role_title: u.roleTitle
      }));
      await supabase.from('users').insert(userRows);
    }

    // 3. Seed Orders if none exist
    const { data: existingOrders } = await supabase.from('orders').select('id').limit(1);
    if (!existingOrders || existingOrders.length === 0) {
      const orderRows = INITIAL_ORDERS.map(mapOrderToDb);
      await supabase.from('orders').insert(orderRows);
    }

    // 4. Seed Sales if none exist
    const { data: existingSales } = await supabase.from('sales').select('id').limit(1);
    if (!existingSales || existingSales.length === 0) {
      const saleRows = INITIAL_SALES.map(mapSaleToDb);
      await supabase.from('sales').insert(saleRows);
    }

    // 5. Seed Activities if none exist
    const { data: existingActs } = await supabase.from('activities').select('id').limit(1);
    if (!existingActs || existingActs.length === 0) {
      const actRows = INITIAL_ACTIVITIES.map(mapActivityToDb);
      await supabase.from('activities').insert(actRows);
    }

    // 6. Seed AI Suggestions if none exist
    const { data: existingSugs } = await supabase.from('ai_suggestions').select('id').limit(1);
    if (!existingSugs || existingSugs.length === 0) {
      const sugRows = INITIAL_AI_SUGGESTIONS.map(mapAISuggestionToDb);
      await supabase.from('ai_suggestions').insert(sugRows);
    }
  } catch (err) {
    console.warn('[MEDORA] Non-critical error during initial data seeding check:', err);
  }
}
