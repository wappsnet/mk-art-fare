# Database Migrations

## How to run migrations

### Using MySQL CLI:
```bash
mysql -u your_username -p your_database < migrations/add_moderation_fields.sql
```

### Using Node.js script:
```bash
node -e "
const mysql = require('mysql2/promise');
const fs = require('fs');

(async () => {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'your_username',
    password: 'your_password',
    database: 'art_fare',
    multipleStatements: true
  });

  const sql = fs.readFileSync('./migrations/add_moderation_fields.sql', 'utf8');
  await connection.query(sql);
  console.log('Migration completed successfully!');
  await connection.end();
})();
"
```

## Migrations

### add_moderation_fields.sql
Adds moderation functionality for organizations and products:
- `moderation_status` - ENUM('pending', 'approved', 'declined')
- `moderation_note` - TEXT (optional note from admin)
- `moderated_by` - INT (foreign key to users table)
- `moderated_at` - TIMESTAMP (when moderation occurred)

Creates indexes for better query performance on moderation_status fields.
