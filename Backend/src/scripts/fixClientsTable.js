const db = require('../config/database');

const alterTableSql = `
  ALTER TABLE clients 
  MODIFY COLUMN lead_id INT(11) NULL;
`;

console.log('🚀 Running migration: making lead_id nullable in clients table...');

db.query(alterTableSql, (err, result) => {
    if (err) {
        console.error('❌ Error altering clients table:', err);
        process.exit(1);
    } else {
        console.log('✅ Clients table altered successfully: lead_id is now nullable');
        db.end();
        process.exit(0);
    }
});
