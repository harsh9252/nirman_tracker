const db = require('../config/database');

const migrate = () => {
    const query = "ALTER TABLE material_requests MODIFY COLUMN status ENUM('Pending', 'Approved', 'Rejected', 'Fulfilled', 'Arrived') DEFAULT 'Pending'";

    console.log('Running migration: Adding "Arrived" to status ENUM...');

    db.query(query, (err, result) => {
        if (err) {
            console.error('Migration failed:', err);
            process.exit(1);
        }
        console.log('Migration successful: Status ENUM updated.');
        process.exit(0);
    });
};

migrate();
