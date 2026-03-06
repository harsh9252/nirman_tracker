const db = require('./src/config/database');

console.log('Running database migration to add assigned_to to Projects...');

async function runMigration() {
    try {
        // Add assigned_to column if it doesn't exist
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE projects ADD COLUMN assigned_to INT AFTER created_by', (err, result) => {
                if (err) {
                    if (err.code === 'ER_DUP_COLUMN_NAME') {
                        console.log('✓ Column assigned_to already exists');
                        resolve();
                    } else {
                        reject(err);
                    }
                } else {
                    console.log('✓ Column assigned_to added successfully');
                    resolve(result);
                }
            });
        });

        // Add foreign key
        await new Promise((resolve, reject) => {
            db.query('ALTER TABLE projects ADD CONSTRAINT fk_projects_assigned_to FOREIGN KEY (assigned_to) REFERENCES users(id)', (err, result) => {
                if (err) {
                    if (err.code === 'ER_FK_DUP_NAME' || err.code === 'ER_DUP_KEY') {
                        console.log('✓ Foreign key fk_projects_assigned_to already exists');
                        resolve();
                    } else {
                        reject(err);
                    }
                } else {
                    console.log('✓ Foreign key fk_projects_assigned_to added successfully');
                    resolve(result);
                }
            });
        });

        console.log('\n✅ Migration completed successfully!');
    } catch (err) {
        console.error('\n❌ Migration failed:', err.message);
    } finally {
        process.exit(0);
    }
}

runMigration();
