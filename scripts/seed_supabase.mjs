import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_MEDICINES, INITIAL_USERS, INITIAL_ORDERS } from '../src/data/initialData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to load environment variables from .env
function loadEnv() {
  const envPath = path.join(rootDir, '.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[key] = val;
      }
    }
  }
  return env;
}

const env = loadEnv();
const supabaseUrl = process.argv[2] || process.env.VITE_SUPABASE_URL || env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.argv[3] || process.env.VITE_SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;

console.log('\n======================================================');
console.log('💊 MEDORA — Supabase Medicine Seeding & Verification');
console.log('======================================================\n');

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.trim() === '') {
  console.error('❌ Supabase credentials are not configured.');
  console.error('\nTo seed and connect:');
  console.error('1. Open your project .env file and set:');
  console.error('   VITE_SUPABASE_URL=https://<your-project-id>.supabase.co');
  console.error('   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...');
  console.error('\nOr pass them directly as arguments:');
  console.error('   node scripts/seed_supabase.mjs "<URL>" "<KEY>"\n');
  process.exit(1);
}

console.log(`🔗 Connecting to Supabase: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim());

function mapMedicineToSnakeCase(med) {
  return {
    id: med.id,
    name: med.name,
    brand_name: med.brandName || null,
    active_ingredient: med.activeIngredient || null,
    strength: med.strength || null,
    power: med.power || null,
    dosage_form: med.dosageForm || 'Tablet',
    therapeutic_class: med.therapeuticClass || null,
    used_for: med.usedFor || null,
    who_should_use: med.whoShouldUse || null,
    dosage_instructions: med.dosageInstructions || null,
    rack: med.rack || 'A',
    shelf: String(med.shelf || '1'),
    quantity: Number(med.quantity) || 0,
    batch_number: med.batchNumber || null,
    expiry_date: med.expiryDate || null,
    price: Number(med.price) || 0,
    low_stock_threshold: Number(med.lowStockThreshold) || 10,
    expected_restock_date: med.expectedRestockDate || null,
    order_status: med.orderStatus || 'None',
    supplier: med.supplier || null,
    is_demo: Boolean(med.isDemo)
  };
}

function mapMedicineToCamelCase(med) {
  return {
    id: med.id,
    name: med.name,
    brandName: med.brandName || null,
    activeIngredient: med.activeIngredient || null,
    strength: med.strength || null,
    power: med.power || null,
    dosageForm: med.dosageForm || 'Tablet',
    therapeuticClass: med.therapeuticClass || null,
    usedFor: med.usedFor || null,
    whoShouldUse: med.whoShouldUse || null,
    dosageInstructions: med.dosageInstructions || null,
    rack: med.rack || 'A',
    shelf: String(med.shelf || '1'),
    quantity: Number(med.quantity) || 0,
    batchNumber: med.batchNumber || null,
    expiryDate: med.expiryDate || null,
    price: Number(med.price) || 0,
    lowStockThreshold: Number(med.lowStockThreshold) || 10,
    expectedRestockDate: med.expectedRestockDate || null,
    orderStatus: med.orderStatus || 'None',
    supplier: med.supplier || null,
    isDemo: Boolean(med.isDemo)
  };
}

async function runSeeding() {
  try {
    // 1. Check current table contents
    console.log('🔍 Checking existing records in "medicines" table...');
    const { data: existingRecords, error: checkError } = await supabase
      .from('medicines')
      .select('id, name, quantity');

    if (checkError) {
      console.error('❌ Could not query "medicines" table:', checkError.message);
      if (checkError.code === '42P01') {
        console.error('💡 The table "medicines" does not exist yet. Please run "supabase_schema_and_seed.sql" in your Supabase SQL Editor.');
      } else if (checkError.code === '42501') {
        console.error('💡 Permission denied by Row Level Security (RLS). Please enable anon access policies or run "supabase_schema_and_seed.sql" in Supabase SQL Editor.');
      }
      process.exit(1);
    }

    const existingCount = existingRecords ? existingRecords.length : 0;
    console.log(`📊 Found ${existingCount} existing record(s) in "medicines".`);

    const existingIds = new Set((existingRecords || []).map((r) => r.id));
    const missingMeds = INITIAL_MEDICINES.filter((m) => !existingIds.has(m.id));

    if (missingMeds.length === 0) {
      console.log('✅ All 16 initial medicines already exist in Supabase! No duplicate insertion performed.');
    } else {
      console.log(`📦 Inserting ${missingMeds.length} missing medicine record(s)...`);
      
      // Try snake_case insertion first (standard PostgreSQL schema)
      const snakeRows = missingMeds.map(mapMedicineToSnakeCase);
      let insertResult = await supabase
        .from('medicines')
        .upsert(snakeRows, { onConflict: 'id', ignoreDuplicates: true });

      if (insertResult.error && insertResult.error.code === '42703') {
        // Fallback to camelCase column names if user created table with camelCase
        console.log('ℹ️ Retrying with camelCase column mapping...');
        const camelRows = missingMeds.map(mapMedicineToCamelCase);
        insertResult = await supabase
          .from('medicines')
          .upsert(camelRows, { onConflict: 'id', ignoreDuplicates: true });
      }

      if (insertResult.error) {
        console.error('❌ Failed to insert medicines:', insertResult.error.message);
        console.error('Details:', insertResult.error);
        process.exit(1);
      }

      console.log(`✅ Successfully seeded ${missingMeds.length} medicine(s) into Supabase!`);
    }

    // 2. Fetch and display final records
    const { data: finalRecords, error: fetchError } = await supabase
      .from('medicines')
      .select('*')
      .order('id', { ascending: true });

    if (fetchError) {
      console.error('❌ Error fetching final records:', fetchError.message);
      process.exit(1);
    }

    console.log(`\n🎉 Verification Passed: Supabase now contains ${finalRecords.length} medicine records.`);
    console.log('\nSample records in database:');
    console.table(
      finalRecords.map((m) => ({
        ID: m.id,
        Name: m.name,
        Brand: m.brand_name || m.brandName,
        Ingredient: m.active_ingredient || m.activeIngredient,
        Rack: m.rack,
        Shelf: m.shelf,
        Stock: m.quantity,
        Batch: m.batch_number || m.batchNumber,
        Expiry: m.expiry_date || m.expiryDate
      }))
    );

    console.log('\n🚀 Supabase integration verified successfully!\n');
  } catch (err) {
    console.error('💥 Unexpected exception during seeding:', err);
    process.exit(1);
  }
}

runSeeding();
