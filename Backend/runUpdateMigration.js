const fs = require('fs');
const path = require('path');
const db = require('./src/config/database');

const runMigration = () => {
    const sqlFile = path.join(__dirname, 'src', 'scripts', 'updateMaterialRequestsTable.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    console.log('Running migration: Add assigned_to to material_requests...');

    // Simple script execution - may not handle complex multiple statements perfectly but fine for single ALTER
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Migration failed:', err.message);
            process.exit(1);
        }
        console.log('Migration successful!');
        process.exit(0);
    });
};

runMigration();
