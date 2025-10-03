const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'app.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

async function setupDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      console.log('Connected to SQLite database');
    });

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');

    db.exec(schema, async (err) => {
      if (err) {
        console.error('Error creating schema:', err);
        reject(err);
        return;
      }

      console.log('Database schema created successfully');

      const hashedPassword = await bcrypt.hash('admin123', 10);

      db.run(
        'INSERT OR IGNORE INTO users (username, password_hash, email, role) VALUES (?, ?, ?, ?)',
        ['admin', hashedPassword, 'admin@localhost.com', 'admin'],
        (err) => {
          if (err) {
            console.error('Error creating default admin user:', err);
          } else {
            console.log('Default admin user created (username: admin, password: admin123)');
          }

          db.close((err) => {
            if (err) {
              console.error('Error closing database:', err);
              reject(err);
            } else {
              console.log('Database setup completed successfully');
              resolve();
            }
          });
        }
      );
    });
  });
}

if (require.main === module) {
  setupDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Setup failed:', err);
      process.exit(1);
    });
}

module.exports = { setupDatabase };
