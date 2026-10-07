-- ====================================================================
-- MEDORA Pharmacy Database Schema & Seed Migration Script
-- Safe to execute directly in Supabase SQL Editor.
-- Fully idempotent (uses ON CONFLICT (id) DO NOTHING).
-- ====================================================================

-- 1. Create medicines table
CREATE TABLE IF NOT EXISTS medicines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    brand_name TEXT,
    active_ingredient TEXT,
    strength TEXT,
    power TEXT,
    dosage_form TEXT DEFAULT 'Tablet',
    therapeutic_class TEXT,
    used_for TEXT,
    who_should_use TEXT,
    dosage_instructions TEXT,
    rack TEXT DEFAULT 'A',
    shelf TEXT DEFAULT '1',
    quantity INTEGER DEFAULT 0,
    batch_number TEXT,
    expiry_date TEXT,
    price NUMERIC(10, 2) DEFAULT 0.00,
    low_stock_threshold INTEGER DEFAULT 10,
    expected_restock_date TEXT,
    order_status TEXT DEFAULT 'None',
    supplier TEXT,
    is_demo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT,
    status TEXT DEFAULT 'active',
    last_active TEXT,
    avatar_color TEXT,
    role_title TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create sales / dispensing transactions table
CREATE TABLE IF NOT EXISTS sales (
    id TEXT PRIMARY KEY,
    medicine_id TEXT REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    quantity_sold INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) DEFAULT 0.00,
    total_amount NUMERIC(10, 2) DEFAULT 0.00,
    customer_type TEXT DEFAULT 'Walk-in Customer',
    previous_stock INTEGER,
    remaining_stock INTEGER,
    recorded_by TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create orders / restock table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    medicine_id TEXT REFERENCES medicines(id) ON DELETE SET NULL,
    medicine_name TEXT NOT NULL,
    supplier TEXT,
    ordered_quantity INTEGER NOT NULL,
    order_date TEXT,
    expected_arrival_date TEXT,
    status TEXT DEFAULT 'Ordered',
    estimated_cost NUMERIC(10, 2) DEFAULT 0.00,
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create activities audit log table
CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    user_name TEXT,
    role TEXT,
    action TEXT,
    medicine TEXT,
    details TEXT
);

-- 6. Create AI suggestions review table
CREATE TABLE IF NOT EXISTS ai_suggestions (
    id TEXT PRIMARY KEY,
    requested_medicine_id TEXT,
    requested_medicine_name TEXT,
    requested_status TEXT,
    suggested_medicine_id TEXT,
    suggested_medicine_name TEXT,
    match_score NUMERIC(5, 2),
    match_reason TEXT,
    decision TEXT DEFAULT 'Approved',
    reviewed_by TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Create settings table
CREATE TABLE IF NOT EXISTS settings (
    id TEXT PRIMARY KEY,
    pharmacy_name TEXT,
    license_number TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    low_stock_default_threshold INTEGER,
    expiry_warning_days INTEGER,
    critical_expiry_days INTEGER,
    tax_rate NUMERIC(5, 2),
    enable_sound_alerts BOOLEAN,
    enable_ai_suggestions BOOLEAN
);

-- ====================================================================
-- Enable Row Level Security (RLS) & Grant Access to Anon Key
-- ====================================================================

ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Medicines Policies
DROP POLICY IF EXISTS "Allow anon read medicines" ON medicines;
CREATE POLICY "Allow anon read medicines" ON medicines FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert medicines" ON medicines;
CREATE POLICY "Allow anon insert medicines" ON medicines FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update medicines" ON medicines;
CREATE POLICY "Allow anon update medicines" ON medicines FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow anon delete medicines" ON medicines;
CREATE POLICY "Allow anon delete medicines" ON medicines FOR DELETE USING (true);

-- Sales Policies
DROP POLICY IF EXISTS "Allow anon read sales" ON sales;
CREATE POLICY "Allow anon read sales" ON sales FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert sales" ON sales;
CREATE POLICY "Allow anon insert sales" ON sales FOR INSERT WITH CHECK (true);

-- Orders Policies
DROP POLICY IF EXISTS "Allow anon read orders" ON orders;
CREATE POLICY "Allow anon read orders" ON orders FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert orders" ON orders;
CREATE POLICY "Allow anon insert orders" ON orders FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update orders" ON orders;
CREATE POLICY "Allow anon update orders" ON orders FOR UPDATE USING (true);

-- Users Policies
DROP POLICY IF EXISTS "Allow anon read users" ON users;
CREATE POLICY "Allow anon read users" ON users FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert users" ON users;
CREATE POLICY "Allow anon insert users" ON users FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow anon update users" ON users;
CREATE POLICY "Allow anon update users" ON users FOR UPDATE USING (true);

-- Activities Policies
DROP POLICY IF EXISTS "Allow anon read activities" ON activities;
CREATE POLICY "Allow anon read activities" ON activities FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert activities" ON activities;
CREATE POLICY "Allow anon insert activities" ON activities FOR INSERT WITH CHECK (true);

-- AI Suggestions Policies
DROP POLICY IF EXISTS "Allow anon read ai_suggestions" ON ai_suggestions;
CREATE POLICY "Allow anon read ai_suggestions" ON ai_suggestions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon insert ai_suggestions" ON ai_suggestions;
CREATE POLICY "Allow anon insert ai_suggestions" ON ai_suggestions FOR INSERT WITH CHECK (true);

-- Settings Policies
DROP POLICY IF EXISTS "Allow anon read settings" ON settings;
CREATE POLICY "Allow anon read settings" ON settings FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow anon upsert settings" ON settings;
CREATE POLICY "Allow anon upsert settings" ON settings FOR ALL USING (true);

-- ====================================================================
-- SEED DATA: Exactly 16 MEDORA initial medicines (Idempotent)
-- ====================================================================

INSERT INTO medicines (
    id, name, brand_name, active_ingredient, strength, power, dosage_form,
    therapeutic_class, used_for, who_should_use, dosage_instructions,
    rack, shelf, quantity, batch_number, expiry_date, price,
    low_stock_threshold, expected_restock_date, order_status, supplier, is_demo
) VALUES
(
    'med-001', 'Paracetamol 500 mg', 'Crocin Pain Relief', 'Paracetamol', '500 mg',
    '500 mg (Standard Adult Analgesic Power)', 'Tablet', 'Analgesic / Antipyretic',
    'Fever, headache, toothache, muscle aches, post-vaccine fever, and mild-to-moderate pain relief',
    'Adults & adolescents aged 12+ (Weight > 40 kg). Safe in pregnancy under supervision. Caution in liver dysfunction.',
    '1 to 2 tablets every 4-6 hours as needed with water after food. Maximum 4000 mg (8 tablets) in 24 hours.',
    'B', '3', 0, 'B102', '2027-08-15', 25.00, 15, '2026-09-10', 'Ordered', 'Apex Pharma Distributors', true
),
(
    'med-002', 'Calpol 500 mg', 'Calpol Fast-Acting', 'Paracetamol', '500 mg',
    '500 mg (Rapid Release Antipyretic)', 'Tablet', 'Analgesic / Antipyretic',
    'High fever relief, viral body aches, toothache, earache, and headache',
    'Adults, seniors, and teenagers aged 12+. Safe for gastric ulcer patients. Avoid combining with other paracetamol products.',
    '1 tablet every 4 to 6 hours with water. Do not exceed 4 tablets in 24 hours without medical consultation.',
    'C', '2', 35, 'CP504', '2027-11-20', 30.00, 10, '', 'None', 'Glaxo Health India', true
),
(
    'med-003', 'Dolo 650 mg', 'Dolo Fever Care', 'Paracetamol', '650 mg',
    '650 mg (Extra Strength / High Fever Power)', 'Tablet', 'Analgesic / Antipyretic',
    'Persistent high fevers, intense viral headaches, joint and body pains, dengue/flu-related chills',
    'Adults and adolescents aged 16+ weighing over 50 kg requiring higher analgesic dosage.',
    '1 tablet every 6 to 8 hours after meals. Maintain minimum 6 hours gap between doses. Do not exceed 3 tablets daily.',
    'B', '4', 85, 'DL901', '2028-01-10', 32.00, 20, '', 'None', 'Micro Labs Ltd', true
),
(
    'med-004', 'Cetirizine 10 mg', 'Cetzine Allergy', 'Cetirizine Hydrochloride', '10 mg',
    '10 mg (Standard 2nd-Gen Antihistamine)', 'Tablet', 'Antihistamine / Anti-allergy',
    'Allergic rhinitis, persistent sneezing, runny nose, watery itchy eyes, hives, and skin rashes',
    'Adults and children aged 12+. Caution: May cause mild drowsiness; avoid heavy machinery operation or driving.',
    '1 tablet once daily in the evening or at bedtime with or without food.',
    'A', '2', 6, 'CT883', '2027-05-30', 18.50, 10, '2026-09-12', 'Order Required', 'Dr. Reddy Labs', true
),
(
    'med-005', 'Alerid 10 mg', 'Alerid Relief', 'Cetirizine Hydrochloride', '10 mg',
    '10 mg (24-Hour Allergy Defense Power)', 'Tablet', 'Antihistamine / Anti-allergy',
    'Seasonal hay fever, dust/pollen allergies, insect bite reactions, eczema-induced itching, and chronic urticaria',
    'Adults and adolescents aged 12+. Suitable for seasonal allergy sufferers. Caution in kidney disease.',
    '1 tablet once daily with water. Preferred at bedtime to minimize daytime sedation.',
    'A', '3', 42, 'AL402', '2027-09-18', 19.00, 10, '', 'None', 'Cipla Ltd', true
),
(
    'med-006', 'Omeprazole 20 mg', 'Omez Gastro Relief', 'Omeprazole', '20 mg',
    '20 mg (Proton Pump Inhibitor Power)', 'Capsule', 'Proton Pump Inhibitor (Antacid)',
    'Heartburn, gastroesophageal reflux disease (GERD), acid indigestion, stomach & duodenal ulcers',
    'Adults experiencing frequent acid reflux, stomach burning, or on NSAID painkiller therapy to prevent ulcers.',
    '1 capsule daily in the morning, 30-60 minutes before breakfast. Swallow whole with water; do not crush.',
    'D', '1', 3, 'OM209', '2026-09-25', 45.00, 10, '2026-09-08', 'Ordered', 'Dr. Reddy Labs', true
),
(
    'med-007', 'Pantoprazole 40 mg', 'Pan-40 Tablets', 'Pantoprazole Sodium', '40 mg',
    '40 mg (Targeted Gastric Acid Blocker Power)', 'Tablet', 'Proton Pump Inhibitor (Antacid)',
    'Severe erosive esophagitis, hyperacidity, persistent acid reflux, and Zollinger-Ellison syndrome',
    'Adults requiring potent stomach acid suppression. Safe for long-term GERD maintenance under medical care.',
    '1 tablet once daily 30 minutes before the morning meal. Swallow whole with a glass of water.',
    'D', '2', 65, 'PN441', '2027-12-05', 55.00, 15, '', 'None', 'Alkem Laboratories', true
),
(
    'med-008', 'Ibuprofen 200 mg', 'Brufen Pain Buster', 'Ibuprofen', '200 mg',
    '200 mg (Mild-to-Moderate NSAID Power)', 'Tablet', 'NSAID / Anti-inflammatory',
    'Headache, dental pain, backache, menstrual cramps, muscular strain, and mild swelling',
    'Adults and children over 12 years. Caution in asthma, heart disease, or past stomach ulcer history.',
    '1 to 2 tablets every 4 to 6 hours strictly with or immediately after food or milk to protect the stomach.',
    'B', '1', 50, 'IB772', '2026-10-15', 22.00, 12, '', 'None', 'Abbott Healthcare', true
),
(
    'med-009', 'Ibuprofen 400 mg', 'Brufen Forte', 'Ibuprofen', '400 mg',
    '400 mg (High Anti-Inflammatory Power)', 'Tablet', 'NSAID / Anti-inflammatory',
    'Severe dental pain, arthritis joint inflammation, acute sports sprains, severe dysmenorrhea, and swelling',
    'Adults and adolescents over 18 years. Not recommended for pregnant women in 3rd trimester or active ulcer patients.',
    '1 tablet every 6 to 8 hours with meals. Maximum 1200 mg (3 tablets) per day unless prescribed higher by doctor.',
    'B', '2', 70, 'IB990', '2028-03-20', 34.00, 15, '', 'None', 'Abbott Healthcare', true
),
(
    'med-010', 'Azithromycin 500 mg', 'Azee Antibiotic', 'Azithromycin', '500 mg',
    '500 mg (Broad Spectrum Macrolide Power)', 'Tablet', 'Macrolide Antibiotic',
    'Bacterial throat infections, tonsillitis, bronchitis, sinusitis, pneumonia, skin infections, and typhoid',
    'Prescription-only for adults and teenagers with diagnosed bacterial infections. Not effective against viral colds.',
    '1 tablet once daily for 3 or 5 days, taken 1 hour before or 2 hours after meals with water. Complete full course.',
    'C', '4', 18, 'AZ331', '2027-04-10', 115.00, 8, '', 'None', 'Cipla Ltd', true
),
(
    'med-011', 'Amoxicillin 500 mg', 'Mox 500', 'Amoxicillin Trihydrate', '500 mg',
    '500 mg (Penicillin-Class Antibiotic Power)', 'Capsule', 'Penicillin Antibiotic',
    'Ear infections (otitis media), chest infections, urinary tract infections (UTI), dental abscesses, and throat infections',
    'Prescription patients with bacterial infections. STRICT CONTRAINDICATION: Anyone with penicillin or beta-lactam allergy.',
    '1 capsule every 8 hours (3 times a day) with plenty of water. Must finish complete course.',
    'C', '3', 0, 'AM552', '2027-02-18', 78.00, 10, '2026-09-14', 'Ordered', 'Sun Pharma', true
),
(
    'med-012', 'Amoxicillin + Clavulanic Acid 625 mg', 'Augmentin 625 Duo', 'Amoxicillin + Clavulanic Acid', '500mg + 125mg',
    '625 mg (Enhanced Beta-Lactamase Resistant Antibiotic)', 'Tablet', 'Penicillin Antibiotic',
    'Resistant bacterial respiratory infections, acute sinusitis, severe dental bone infections, complicated UTIs, and skin cellulitis',
    'Prescription use for adults and children over 12 (weight > 40kg). Strict warning: Penicillin-allergic individuals must not take this.',
    '1 tablet twice daily (every 12 hours) at the start of a meal to optimize absorption and minimize gastrointestinal upset.',
    'C', '3', 28, 'AG625', '2027-10-15', 198.00, 10, '', 'None', 'GlaxoSmithKline', true
),
(
    'med-013', 'ORS Electrolyte Powder 21.8 g', 'Electral Sachet', 'Oral Rehydration Salts', '21.8 g / Sachet',
    '21.8 g WHO-Formula (Rapid Oral Rehydration Power)', 'Powder Sachet', 'Electrolyte Replenisher',
    'Severe dehydration from diarrhoea, vomiting, heat stroke, intense sports dehydration, and cholera',
    'Safe and essential for ALL age groups: infants, children, pregnant women, adults, and elderly persons.',
    'Dissolve entire 21.8g packet in exactly 1 liter of fresh, clean drinking water. Sip continuously throughout the day.',
    'A', '1', 120, 'EL109', '2028-06-30', 22.50, 25, '', 'None', 'FDC Limited', true
),
(
    'med-014', 'Vitamin C 500 mg Chewable', 'Limcee Orange', 'Ascorbic Acid (Vitamin C)', '500 mg',
    '500 mg (High Potency Antioxidant Power)', 'Chewable Tablet', 'Nutritional Supplement',
    'Immune system strengthening, prevention of scurvy, wound healing, collagen synthesis, and iron absorption boost',
    'Suitable for adults and children aged 6+ needing dietary antioxidant supplementation or recovering from illness.',
    'Chew or dissolve 1 tablet in the mouth daily after meals. Safe for daily preventative use.',
    'A', '4', 8, 'LC440', '2027-01-20', 24.00, 15, '2026-09-15', 'Order Required', 'Abbott Healthcare', true
),
(
    'med-015', 'Metformin 500 mg', 'Glycomet 500', 'Metformin Hydrochloride', '500 mg',
    '500 mg (Standard Insulin-Sensitizing Power)', 'Tablet', 'Anti-diabetic / Biguanide',
    'Type 2 Diabetes Mellitus glycemic management, insulin resistance reduction, and PCOS metabolic regulation',
    'Adults diagnosed with Type 2 diabetes as prescribed by a physician. Not for Type 1 diabetes or acute diabetic ketoacidosis.',
    '1 tablet once or twice daily with or immediately after meals to reduce stomach discomfort. Swallow whole.',
    'D', '3', 95, 'GM501', '2027-08-30', 28.00, 20, '', 'None', 'USV Private Limited', true
),
(
    'med-016', 'Levocetirizine 5 mg', 'Levocet 5', 'Levocetirizine Dihydrochloride', '5 mg',
    '5 mg (Active R-Enantiomer Antihistamine Power)', 'Tablet', 'Antihistamine / Anti-allergy',
    'Severe allergic rhinitis, chronic hay fever, skin allergy itching, and perennial allergies',
    'Adults & adolescents aged 12+ looking for potent non-sedating relief. Dose reduction required in renal disease.',
    '1 tablet once daily in the evening with water, with or without food.',
    'A', '2', 30, 'LC051', '2027-11-12', 26.00, 10, '', 'None', 'Hetero Healthcare', true
)
ON CONFLICT (id) DO NOTHING;

-- Seed Users
INSERT INTO users (id, username, name, role, email, status, last_active, avatar_color, role_title)
VALUES
('usr-supervisor', 'supervisor', 'Sarah', 'owner', 'kanishka.b6906@gmail.com', 'active', 'Just now', 'bg-teal-600', 'Pharmacy Owner'),
('usr-staff', 'staff', 'Arun', 'staff', 'staff@medora.local', 'active', '5 mins ago', 'bg-blue-600', 'Pharmacy Staff Dispenser')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Order
INSERT INTO orders (id, medicine_id, medicine_name, supplier, ordered_quantity, order_date, expected_arrival_date, status, estimated_cost, notes, created_by)
VALUES
('ord-101', 'med-001', 'Paracetamol 500 mg', 'Apex Pharma Distributors', 150, '2026-09-02', '2026-09-10', 'Ordered', 3750.00, 'Urgent stock replenishment', 'Supervisor')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Settings
INSERT INTO settings (id, pharmacy_name, license_number, phone, email, address, low_stock_default_threshold, expiry_warning_days, critical_expiry_days, tax_rate, enable_sound_alerts, enable_ai_suggestions)
VALUES
('medora-default-settings', 'MEDORA Pharmacy Care', 'DL-TN-2024-99881', '+91 98400 12345', 'support@medora-pharmacy.com', '12 Hospital Road, Anna Nagar, Chennai 600040', 10, 90, 30, 0.00, true, true)
ON CONFLICT (id) DO NOTHING;
