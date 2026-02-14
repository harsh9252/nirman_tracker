const db = require('./src/config/database');
const fs = require('fs');
const path = require('path');

const sqlPath = path.join(__dirname, 'src', 'scripts', 'createAttendanceTable.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

const statements = sql.split(';').filter(stmt => stmt.trim());

async function runMigration() {
    console.log('Creating Attendance table...');
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
            }
        }
    }
    console.log('Migration process finished.');
    process.exit(0);
}

runMigration();
