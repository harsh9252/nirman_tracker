require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'nirman_tracker_db',
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to database:', err);
        process.exit(1);
    }
    console.log('Connected to database.');

    const addLatitudeColumn = `
    ALTER TABLE tasks
    ADD COLUMN latitude DECIMAL(10, 8) NULL;
  `;

    const addLongitudeColumn = `
    ALTER TABLE tasks
    ADD COLUMN longitude DECIMAL(11, 8) NULL;
  `;

    db.query(addLatitudeColumn, (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_FIELDNAME') {
                console.log('Column latitude already exists.');
            } else {
                console.error('Error adding latitude column:', err);
            }
        } else {
            console.log('Column latitude added successfully.');
        }

        db.query(addLongitudeColumn, (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_FIELDNAME') {
                    console.log('Column longitude already exists.');
                } else {
                    console.error('Error adding longitude column:', err);
                }
            } else {
                console.log('Column longitude added successfully.');
            }

            db.end();
        });
    });
});
