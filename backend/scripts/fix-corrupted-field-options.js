import { query } from '../src/config/database.js';

/**
 * One-time script to fix corrupted field options in the database
 * Run with: node scripts/fix-corrupted-field-options.js
 */

async function fixCorruptedFieldOptions() {
  try {
    console.log('🔍 Finding corrupted field definitions...');

    // Find corrupted field definitions
    const corruptedFields = await query(
      `SELECT id, name, field_type, options
       FROM field_definitions
       WHERE options IS NOT NULL
         AND options NOT LIKE '[%'
         AND options NOT LIKE '{%'`
    );

    if (corruptedFields.length === 0) {
      console.log('✅ No corrupted field definitions found!');
      process.exit(0);
    }

    console.log(`\n⚠️  Found ${corruptedFields.length} corrupted field definition(s):\n`);
    corruptedFields.forEach((field) => {
      console.log(`  - ID: ${field.id}, Name: ${field.name}, Type: ${field.field_type}`);
      console.log(`    Corrupted options: ${field.options}\n`);
    });

    console.log('🔧 Fixing corrupted field definitions...');

    // Update corrupted options to NULL
    const result = await query(
      `UPDATE field_definitions
       SET options = NULL
       WHERE options IS NOT NULL
         AND options NOT LIKE '[%'
         AND options NOT LIKE '{%'`
    );

    console.log(`✅ Fixed ${result.affectedRows} field definition(s)!`);
    console.log('\n📝 Note: You will need to recreate these field definitions with proper options.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing corrupted field options:', error);
    process.exit(1);
  }
}

// Run the script
fixCorruptedFieldOptions();
