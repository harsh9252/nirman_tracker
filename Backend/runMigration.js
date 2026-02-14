const db = require('./src/config/database');
const fs = require('fs');

// Read the SQL file
const sql = fs.readFileSync('./src/scripts/addUserPermissions.sql', 'utf8');

// Split by semicolon to handle multiple statements
const statements = sql.split(';').filter(stmt => stmt.trim());

console.log('Running database migration...');

// Execute each statement
let completed = 0;
statements.forEach((statement, index) => {
    if (statement.trim()) {
        db.query(statement, (err, result) => {
            if (err) {
                console.error(`Error executing statement ${index + 1}:`, err.message);
            } else {
                console.log(`✓ Statement ${index + 1} executed successfully`);
            }

            completed++;
            if (completed === statements.length) {
                console.log('\n✅ Migration completed!');
                console.log('Please restart your backend server and refresh the frontend.');
                process.exit(0);
            }
        });
    }
});
