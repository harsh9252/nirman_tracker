const db = require('./src/config/database');

const runMigration = async () => {
    console.log('Starting migration: Add lead_id to tasks table...');

    try {
        // 1. Add lead_id column if it doesn't exist
        await new Promise((resolve, reject) => {
            const sql = `
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = '${process.env.DB_NAME || 'nirman_tracker'}'
          AND TABLE_NAME = 'tasks'
          AND COLUMN_NAME = 'lead_id';
      `;

            db.query(sql, (err, results) => {
                if (err) return reject(err);

                if (results.length === 0) {
                    console.log('Adding lead_id column...');
                    const alterSql = 'ALTER TABLE tasks ADD COLUMN lead_id INT NULL';
                    db.query(alterSql, (alterErr) => {
                        if (alterErr) return reject(alterErr);
                        console.log('lead_id column added successfully.');
                        resolve();
                    });
                } else {
                    console.log('lead_id column already exists.');
                    resolve();
                }
            });
        });

        // 2. Backfill lead_id based on leadName matching contact_name in leads table
        console.log('Backfilling lead_id for existing tasks...');
        await new Promise((resolve, reject) => {
            const updateSql = `
        UPDATE tasks t
        JOIN leads l ON t.leadName = l.contact_name
        SET t.lead_id = l.id
        WHERE t.relatedTo = 'Lead' AND t.lead_id IS NULL;
      `;

            db.query(updateSql, (err, result) => {
                if (err) return reject(err);
                console.log(`Backfilled lead_id for ${result.affectedRows} tasks.`);
                resolve();
            });
        });

        console.log('Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

runMigration();
