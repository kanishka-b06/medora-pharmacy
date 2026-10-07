import { supabase, isSupabaseConfigured } from './supabase.js';
import {
  INITIAL_MEDICINES,
  INITIAL_USERS,
  INITIAL_SALES,
  INITIAL_ORDERS,
  INITIAL_ACTIVITIES,
  INITIAL_AI_SUGGESTIONS,
  INITIAL_SETTINGS
} from '../data/initialData.js';

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

export function mapMedicineToDbCamel(medicine) {
  return {
    id: medicine.id,
    name: medicine.name,
    brandName: medicine.brandName || null,
    activeIngredient: medicine.activeIngredient || null,
    strength: medicine.strength || null,
    power: medicine.power || null,
    dosageForm: medicine.dosageForm || 'Tablet',
    therapeuticClass: medicine.therapeuticClass || null,
    usedFor: medicine.usedFor || null,
    whoShouldUse: medicine.whoShouldUse || null,
    dosageInstructions: medicine.dosageInstructions || null,
    rack: medicine.rack || 'A',
    shelf: String(medicine.shelf || '1'),
    quantity: Number(medicine.quantity) || 0,
    batchNumber: medicine.batchNumber || null,
    expiryDate: medicine.expiryDate || null,
    price: Number(medicine.price) || 0,
    lowStockThreshold: Number(medicine.lowStockThreshold) || 10,
    expectedRestockDate: medicine.expectedRestockDate || null,
    orderStatus: medicine.orderStatus || 'None',
    supplier: medicine.supplier || null,
    isDemo: Boolean(medicine.isDemo)
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
 * Safely seeds initial demo data into Supabase if tables are currently empty or missing records.
 * Uses ON CONFLICT (id) DO NOTHING so existing records are never overwritten and duplicates are prevented.
 */
export async function seedInitialDataIfEmpty() {
  if (!isSupabaseConfigured || !supabase) return { success: false, reason: 'unconfigured' };

  try {
    // 1. Seed Medicines if missing
    const { data: existingMeds, error: medCheckError } = await supabase
      .from('medicines')
      .select('id');

    if (medCheckError) {
      if (medCheckError.code === '42501') {
        console.warn(
          '[MEDORA Supabase Warning] Row Level Security (RLS) is blocking access to "medicines". Run supabase_schema_and_seed.sql in your Supabase SQL Editor to enable access.'
        );
      } else {
        console.warn('[MEDORA] Supabase medicines check error:', medCheckError.message);
      }
    } else {
      const existingIds = new Set((existingMeds || []).map((m) => m.id));
      const missingMeds = INITIAL_MEDICINES.filter((m) => !existingIds.has(m.id));

      if (missingMeds.length > 0) {
        console.info(`[MEDORA] Seeding ${missingMeds.length} initial medicines to Supabase...`);
        const snakeRows = missingMeds.map(mapMedicineToDb);
        let insertRes = await supabase
          .from('medicines')
          .upsert(snakeRows, { onConflict: 'id', ignoreDuplicates: true });

        // Fallback to camelCase if user defined table using camelCase
        if (insertRes.error && insertRes.error.code === '42703') {
          console.info('[MEDORA] Retrying medicine insertion with camelCase columns...');
          const camelRows = missingMeds.map(mapMedicineToDbCamel);
          insertRes = await supabase
            .from('medicines')
            .upsert(camelRows, { onConflict: 'id', ignoreDuplicates: true });
        }

        if (insertRes.error) {
          console.warn('[MEDORA] Supabase medicine insert error:', insertRes.error.message);
        } else {
          console.info('[MEDORA] Medicines successfully seeded to Supabase.');
        }
      }
    }

    // 2. Seed Users if missing
    const { data: existingUsers, error: userCheckError } = await supabase
      .from('users')
      .select('id');

    if (!userCheckError) {
      const existingUserIds = new Set((existingUsers || []).map((u) => u.id));
      const missingUsers = INITIAL_USERS.filter((u) => !existingUserIds.has(u.id));
      if (missingUsers.length > 0) {
        const userRows = missingUsers.map((u) => ({
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
        await supabase.from('users').upsert(userRows, { onConflict: 'id', ignoreDuplicates: true });
      }
    }

    // 3. Seed Orders if empty
    const { data: existingOrders, error: orderCheckError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);

    if (!orderCheckError && (!existingOrders || existingOrders.length === 0)) {
      const orderRows = INITIAL_ORDERS.map(mapOrderToDb);
      await supabase.from('orders').upsert(orderRows, { onConflict: 'id', ignoreDuplicates: true });
    }

    // 4. Seed Sales if empty
    const { data: existingSales, error: salesCheckError } = await supabase
      .from('sales')
      .select('id')
      .limit(1);

    if (!salesCheckError && (!existingSales || existingSales.length === 0)) {
      const saleRows = INITIAL_SALES.map(mapSaleToDb);
      await supabase.from('sales').upsert(saleRows, { onConflict: 'id', ignoreDuplicates: true });
    }

    // 5. Seed Activities if empty
    const { data: existingActs, error: actCheckError } = await supabase
      .from('activities')
      .select('id')
      .limit(1);

    if (!actCheckError && (!existingActs || existingActs.length === 0)) {
      const actRows = INITIAL_ACTIVITIES.map(mapActivityToDb);
      await supabase.from('activities').upsert(actRows, { onConflict: 'id', ignoreDuplicates: true });
    }

    // 6. Seed AI Suggestions if empty
    const { data: existingSugs, error: sugCheckError } = await supabase
      .from('ai_suggestions')
      .select('id')
      .limit(1);

    if (!sugCheckError && (!existingSugs || existingSugs.length === 0)) {
      const sugRows = INITIAL_AI_SUGGESTIONS.map(mapAISuggestionToDb);
      await supabase.from('ai_suggestions').upsert(sugRows, { onConflict: 'id', ignoreDuplicates: true });
    }

    return { success: true };
  } catch (err) {
    console.warn('[MEDORA] Initial data seeding check notice:', err);
    return { success: false, error: err };
  }
}

/**
 * Fetches all medicines directly from Supabase.
 * Returns mapped medicine objects or null if query fails.
 */
export async function fetchMedicinesFromDb() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data, error } = await supabase
      .from('medicines')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.warn('[MEDORA] Supabase fetchMedicines error:', error.message);
      return null;
    }

    if (!data || data.length === 0) return [];
    return data.map(mapMedicineFromDb);
  } catch (err) {
    console.warn('[MEDORA] Supabase fetchMedicines exception:', err);
    return null;
  }
}

/**
 * Updates a medicine's stock quantity and order status in Supabase.
 */
export async function updateMedicineStockInDb(medicineId, newQuantity, orderStatus = 'None') {
  if (!isSupabaseConfigured || !supabase) return { success: false, offline: true };

  try {
    const qty = Number(newQuantity);
    let res = await supabase
      .from('medicines')
      .update({
        quantity: qty,
        order_status: orderStatus
      })
      .eq('id', medicineId);

    // Fallback if column names are camelCase
    if (res.error && res.error.code === '42703') {
      res = await supabase
        .from('medicines')
        .update({
          quantity: qty,
          orderStatus: orderStatus
        })
        .eq('id', medicineId);
    }

    if (res.error) {
      console.warn('[MEDORA] Supabase stock update error:', res.error.message);
      return { success: false, error: res.error };
    }

    return { success: true };
  } catch (err) {
    console.warn('[MEDORA] Supabase stock update exception:', err);
    return { success: false, error: err };
  }
}

/**
 * Inserts a sales / dispensing transaction record into Supabase.
 */
export async function recordSaleInDb(sale) {
  if (!isSupabaseConfigured || !supabase) return { success: false, offline: true };

  try {
    const payload = mapSaleToDb(sale);
    let res = await supabase.from('sales').insert([payload]);

    if (res.error && res.error.code === '42703') {
      // CamelCase fallback
      res = await supabase.from('sales').insert([
        {
          id: sale.id,
          medicineId: sale.medicineId,
          medicineName: sale.medicineName,
          quantitySold: sale.quantitySold || sale.quantityGiven || 0,
          unitPrice: sale.unitPrice,
          totalAmount: sale.totalAmount,
          customerType: sale.customerType,
          previousStock: sale.previousStock,
          remainingStock: sale.remainingStock,
          recordedBy: sale.recordedBy || sale.worker,
          notes: sale.notes,
          timestamp: sale.timestamp
        }
      ]);
    }

    if (res.error) {
      console.warn('[MEDORA] Supabase sale record error:', res.error.message);
      return { success: false, error: res.error };
    }

    return { success: true };
  } catch (err) {
    console.warn('[MEDORA] Supabase sale record exception:', err);
    return { success: false, error: err };
  }
}
