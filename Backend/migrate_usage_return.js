const db = require('./src/config/database');

const migrateUsageReturn = () => {
    const queries = [
        `ALTER TABLE material_inventory MODIFY COLUMN type ENUM('In', 'Out', 'Return', 'Usage_Return') NOT NULL;`,
        `ALTER TABLE material_inventory ADD COLUMN related_id INT DEFAULT NULL;`,
        `ALTER TABLE material_inventory ADD CONSTRAINT fk_related_inventory FOREIGN KEY (related_id) REFERENCES material_inventory(id) ON DELETE SET NULL;`
    ];

    const runQueries = (index) => {
        if (index >= queries.length) {
            console.log('Migration completed successfully.');
            process.exit(0);
        }

        db.query(queries[index], (err) => {
            if (err) {
                // If column exists or error occurs, log and continue for some queries
                if (err.code === 'ER_DUP_FIELDNAME' || err.code === 'ER_BAD_TABLE_ERROR') {
                    console.log(`Query ${index} skipped or already applied:`, err.message);
                    runQueries(index + 1);
                } else {
                    console.error(`Error executing query ${index}:`, err);
                    process.exit(1);
                }
            } else {
                console.log(`Query ${index} executed successfully.`);
                runQueries(index + 1);
            }
        });
    };

    runQueries(0);
};

migrateUsageReturn();
