const db = require('../config/database');

const migration = `
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS party_type ENUM('Worker', 'Contractor', 'Supplier', 'Consultant') DEFAULT 'Worker' AFTER project_id,
ADD COLUMN IF NOT EXISTS party_id_custom VARCHAR(50) AFTER party_type,
ADD COLUMN IF NOT EXISTS father_name VARCHAR(255) AFTER name,
ADD COLUMN IF NOT EXISTS address TEXT AFTER email,
ADD COLUMN IF NOT EXISTS pf_number VARCHAR(50) AFTER pan_number,
ADD COLUMN IF NOT EXISTS uan_number VARCHAR(50) AFTER pf_number,
ADD COLUMN IF NOT EXISTS esi_number VARCHAR(50) AFTER uan_number,
ADD COLUMN IF NOT EXISTS salary_period VARCHAR(50) AFTER salary,
ADD COLUMN IF NOT EXISTS shift_hours DECIMAL(5, 2) AFTER salary_period,
ADD COLUMN IF NOT EXISTS shift_period VARCHAR(50) AFTER shift_hours,
ADD COLUMN IF NOT EXISTS overtime_amount DECIMAL(15, 2) AFTER shift_period,
ADD COLUMN IF NOT EXISTS overtime_period VARCHAR(50) AFTER overtime_amount,
ADD COLUMN IF NOT EXISTS cost_code VARCHAR(50) AFTER designation,
ADD COLUMN IF NOT EXISTS salary_calculation_method VARCHAR(50) AFTER cost_code;
`;

console.log('🚀 Running migration: Expand employees table to support parties...');

db.query(migration, (err, result) => {
    if (err) {
        if (err.code === 'ER_CANT_DROP_FIELD_OR_KEY') {
            console.log('⚠️ Some columns might already exist. Skipping error.');
        } else {
            console.error('❌ Migration failed:', err);
            process.exit(1);
        }
    }
    console.log('✅ Migration completed successfully!');
    db.end();
    process.exit(0);
});
