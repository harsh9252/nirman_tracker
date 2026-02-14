const db = require('../config/database');

db.query("DESCRIBE clients", (err, results) => {
    if (err) {
        console.error('❌ Error checking clients table structure:', err);
        process.exit(1);
    }

    console.log('✅ Clients table structure:');
    results.forEach(column => {
        console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
    });
    db.end();
    process.exit(0);
});
