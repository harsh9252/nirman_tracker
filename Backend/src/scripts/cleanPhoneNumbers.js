const db = require('../config/database');

console.log('🔄 Starting phone number cleanup...');

// Function to clean phone numbers
function cleanPhoneNumber(phone) {
  if (!phone) return phone;

  // Remove +91 prefix
  let cleaned = phone.replace(/^\+91/, '');

  // Remove 91 prefix if it exists
  cleaned = cleaned.replace(/^91/, '');

  // Remove any non-digit characters
  cleaned = cleaned.replace(/\D/g, '');

  // Ensure it's exactly 10 digits
  if (cleaned.length === 10) {
    return cleaned;
  } else if (cleaned.length > 10) {
    // If longer than 10, take last 10 digits
    return cleaned.slice(-10);
  } else {
    // If shorter than 10, return as is (will be handled by validation)
    return cleaned;
  }
}

// Clean users table
console.log('🧹 Cleaning users table...');
db.query('SELECT id, first_name, last_name, phone FROM users WHERE status != "Deleted"', (err, users) => {
  if (err) {
    console.error('❌ Error fetching users:', err);
    return;
  }

  console.log(`📋 Found ${users.length} users to check`);

  let updatedCount = 0;
  users.forEach(user => {
    const originalPhone = user.phone;
    const cleanedPhone = cleanPhoneNumber(originalPhone);

    if (originalPhone !== cleanedPhone) {
      console.log(`📞 User ${user.first_name} ${user.last_name} (ID: ${user.id}): "${originalPhone}" -> "${cleanedPhone}"`);

      db.query('UPDATE users SET phone = ? WHERE id = ?', [cleanedPhone, user.id], (updateErr) => {
        if (updateErr) {
          console.error(`❌ Error updating user ${user.id}:`, updateErr);
        } else {
          updatedCount++;
          console.log(`✅ Updated user ${user.id}`);
        }
      });
    }
  });

  // Clean leads table
  console.log('🧹 Cleaning leads table...');
  db.query('SELECT id, contact_name, phone FROM leads', (err, leads) => {
    if (err) {
      console.error('❌ Error fetching leads:', err);
      return;
    }

    console.log(`📋 Found ${leads.length} leads to check`);

    leads.forEach(lead => {
      const originalPhone = lead.phone;
      const cleanedPhone = cleanPhoneNumber(originalPhone);

      if (originalPhone !== cleanedPhone) {
        console.log(`📞 Lead ${lead.contact_name} (ID: ${lead.id}): "${originalPhone}" -> "${cleanedPhone}"`);

        db.query('UPDATE leads SET phone = ? WHERE id = ?', [cleanedPhone, lead.id], (updateErr) => {
          if (updateErr) {
            console.error(`❌ Error updating lead ${lead.id}:`, updateErr);
          } else {
            updatedCount++;
            console.log(`✅ Updated lead ${lead.id}`);
          }
        });
      }
    });

    // Clean clients table if it exists
    console.log('🧹 Checking clients table...');
    db.query('SELECT id, name, phone FROM clients', (err, clients) => {
      if (err) {
        console.log('ℹ️ Clients table may not exist or has no phone column');
        return;
      }

      console.log(`📋 Found ${clients.length} clients to check`);

      clients.forEach(client => {
        const originalPhone = client.phone;
        const cleanedPhone = cleanPhoneNumber(originalPhone);

        if (originalPhone !== cleanedPhone) {
          console.log(`📞 Client ${client.name} (ID: ${client.id}): "${originalPhone}" -> "${cleanedPhone}"`);

          db.query('UPDATE clients SET phone = ? WHERE id = ?', [cleanedPhone, client.id], (updateErr) => {
            if (updateErr) {
              console.error(`❌ Error updating client ${client.id}:`, updateErr);
            } else {
              updatedCount++;
              console.log(`✅ Updated client ${client.id}`);
            }
          });
        }
      });

      // Final summary
      setTimeout(() => {
        console.log(`\n🎉 Phone number cleanup completed!`);
        console.log(`📊 Total records updated: ${updatedCount}`);
        console.log('✅ All phone numbers should now be clean 10-digit numbers without +91 or 91 prefixes');

        // Close database connection
        db.end((err) => {
          if (err) {
            console.error('❌ Error closing database connection:', err);
          } else {
            console.log('🔌 Database connection closed');
          }
          process.exit(0);
        });
      }, 2000); // Wait 2 seconds for all updates to complete
    });
  });
});
