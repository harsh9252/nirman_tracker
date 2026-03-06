const db = require('./src/config/database');

const createInventoryTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS material_inventory (
        id INT AUTO_INCREMENT PRIMARY KEY,
        project_id INT NOT NULL,
        material_name VARCHAR(255) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        unit VARCHAR(50) NOT NULL,
        type ENUM('In', 'Out', 'Return') NOT NULL,
        transaction_date DATE NOT NULL,
        description TEXT,
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB;
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error creating material_inventory table:', err);
            process.exit(1);
        }
        console.log('material_inventory table created or already exists.');
        process.exit(0);
    });
};

createInventoryTable();
