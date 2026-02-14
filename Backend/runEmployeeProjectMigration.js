const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlPath = path.join(__dirname, 'src', 'scripts', 'addProjectIdToEmployees.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

// Split by semicolon to handle multiple statements
const statements = sql.split(';').filter(stmt => stmt.trim());

console.log('Running database migration for Employee Project assignment...');

let errors = 0;

// Execute statements sequentially
async function runMigration() {
    for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
            try {
                await new Promise((resolve, reject) => {
                    db.query(statement, (err, result) => {
                        if (err) reject(err);
                        else resolve(result);
                    });
                });
                console.log(`✓ Statement ${i + 1} executed successfully`);
            } catch (err) {
                console.error(`Error executing statement ${i + 1}:`, err.message);
                errors++;
            }
        }
    }

    if (errors > 0) {
        console.error(`\n❌ Migration completed with ${errors} errors.`);
    } else {
        console.log('\n✅ Migration completed successfully!');
    }
    process.exit(0);
}

runMigration();
