const db = require('../config/database');

console.log('🔍 Checking database tables and structure...');

// Check if notifications table exists
db.query("SHOW TABLES LIKE 'notifications'", (err, results) => {
  if (err) {
    console.error('❌ Error checking notifications table:', err);
    return;
  }

  if (results.length === 0) {
    console.log('❌ Notifications table does not exist. Creating it...');

    const createNotificationsTable = `
      CREATE TABLE notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) NOT NULL,
        related_id INT NULL,
        assignByName VARCHAR(255) NULL,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    db.query(createNotificationsTable, (err, result) => {
      if (err) {
        console.error('❌ Error creating notifications table:', err);
      } else {
        console.log('✅ Notifications table created successfully');
      }
    });
  } else {
    console.log('✅ Notifications table exists');
  }
});

// Check users table structure
db.query("DESCRIBE users", (err, results) => {
  if (err) {
    console.error('❌ Error checking users table structure:', err);
    return;
  }

  console.log('✅ Users table structure:');
  results.forEach(column => {
    console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''}`);
  });
});

// Check leads table structure
db.query("DESCRIBE leads", (err, results) => {
  if (err) {
    console.error('❌ Error checking leads table structure:', err);
    return;
  }

  console.log('✅ Leads table structure:');
  results.forEach(column => {
    console.log(`  - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : ''}`);
  });
});

// Check for phone numbers with +91 or 91 prefix
console.log('\n🔍 Checking for phone numbers with +91 or 91 prefix...');

db.query("SELECT id, first_name, last_name, phone FROM users WHERE phone LIKE '+91%' OR phone LIKE '91%'", (err, users) => {
  if (err) {
    console.error('❌ Error checking users phone numbers:', err);
  } else {
    console.log(`📞 Found ${users.length} users with +91/91 prefix in phone numbers:`);
    users.forEach(user => {
      console.log(`  - ${user.first_name} ${user.last_name} (ID: ${user.id}): ${user.phone}`);
    });
  }
});

db.query("SELECT id, contact_name, phone FROM leads WHERE phone LIKE '+91%' OR phone LIKE '91%'", (err, leads) => {
  if (err) {
    console.error('❌ Error checking leads phone numbers:', err);
  } else {
    console.log(`📞 Found ${leads.length} leads with +91/91 prefix in phone numbers:`);
    leads.forEach(lead => {
      console.log(`  - ${lead.contact_name} (ID: ${lead.id}): ${lead.phone}`);
    });
  }

  // Close connection after all checks
  setTimeout(() => {
    console.log('\n🎯 Database check completed');
    db.end((err) => {
      if (err) {
        console.error('❌ Error closing database connection:', err);
      } else {
        console.log('🔌 Database connection closed');
      }
      process.exit(0);
    });
  }, 1000);
});
