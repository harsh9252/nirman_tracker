const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env in the same directory
dotenv.config({ path: path.join(__dirname, '.env') });

async function migrate() {
    console.log("Starting migration...");
    console.log("DB_HOST:", process.env.DB_HOST);
    console.log("DB_NAME:", process.env.DB_NAME);

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("Connected to database.");

        // Add 'Office Member' to the enum
        const sql = "ALTER TABLE employees MODIFY COLUMN role ENUM('Admin', 'Manager', 'Employee', 'Office Member') DEFAULT 'Employee'";
        console.log("Executing:", sql);

        await connection.execute(sql);
        console.log("Migration successful!");

        // Verify columns
        const [rows] = await connection.execute("DESCRIBE employees");
        const roleColumn = rows.find(r => r.Field === 'role');
        console.log("Current role column definition:", roleColumn.Type);

    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        await connection.end();
    }
}

migrate();
