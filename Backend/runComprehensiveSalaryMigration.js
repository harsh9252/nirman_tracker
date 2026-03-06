const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'src', 'scripts', 'comprehensiveSalarySystem.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const statements = sql.split(';').filter(stmt => stmt.trim());

async function runSQL(statement) {
    return new Promise((resolve, reject) => {
        db.query(statement, (err, result) => {
            if (err) resolve({ success: false, error: err });
            else resolve({ success: true, result });
        });
    });
}

async function checkColumn(table, column) {
    return new Promise((resolve) => {
        db.query(`SHOW COLUMNS FROM ${table} LIKE '${column}'`, (err, rows) => {
            if (err) resolve(false);
            else resolve(rows.length > 0);
        });
    });
}

async function runMigration() {
    console.log('--- Starting Comprehensive Salary System Migration ---');

    // 1. Run the main SQL file (table creations and seeds)
    console.log('\nCreating tables and seeding data...');
    for (let statement of statements) {
        const res = await runSQL(statement);
        if (res.success) {
            console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
        } else {
            console.warn(`! Skipped/Error: ${res.error.message}`);
        }
    }

    // 2. Safely Update Employees table
    console.log('\nUpdating Employees table...');
    const hasSalaryTypeId = await checkColumn('employees', 'salary_type_id');
    if (!hasSalaryTypeId) {
        const res = await runSQL('ALTER TABLE employees ADD COLUMN salary_type_id INT NOT NULL DEFAULT 1, ADD FOREIGN KEY (salary_type_id) REFERENCES salary_types(id)');
        if (res.success) console.log('✓ Added salary_type_id to employees');
        else console.error('Failed to add salary_type_id to employees:', res.error.message);
    } else {
        console.log('- employees.salary_type_id already exists');
    }

    // 3. Safely Update Attendance table
    console.log('\nUpdating Attendance table...');
    const attendanceUpdates = [
        { col: 'check_in_time', sql: 'ALTER TABLE attendance ADD COLUMN check_in_time TIME' },
        { col: 'check_out_time', sql: 'ALTER TABLE attendance ADD COLUMN check_out_time TIME' },
        { col: 'applied_rate', sql: 'ALTER TABLE attendance ADD COLUMN applied_rate DECIMAL(10,2)' },
        { col: 'calculated_amount', sql: 'ALTER TABLE attendance ADD COLUMN calculated_amount DECIMAL(10,2)' },
        { col: 'shift_hours_mod', sql: 'ALTER TABLE attendance MODIFY COLUMN shift_hours DECIMAL(5,2)', check: 'shift_hours' }
    ];

    for (let update of attendanceUpdates) {
        const checkCol = update.check || update.col;
        if (update.check === 'shift_hours' || !(await checkColumn('attendance', checkCol))) {
            const res = await runSQL(update.sql);
            if (res.success) console.log(`✓ Applied: ${update.sql}`);
            else console.error(`Failed: ${update.sql} - ${res.error.message}`);
        } else {
            console.log(`- attendance.${update.col} already exists`);
        }
    }

    console.log('\n--- Migration process finished ---');
    process.exit(0);
}

runMigration();
