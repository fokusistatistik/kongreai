// Migration script to add kapsam field to events table
const { PrismaClient } = require('@prisma/client');

async function migrate() {
  const prisma = new PrismaClient();

  try {
    console.log('Adding kapsam column to events table...');

    await prisma.$executeRawUnsafe(
      `ALTER TABLE events ADD COLUMN kapsam TEXT NOT NULL DEFAULT 'ULUSAL'`
    );

    console.log('✓ Column added successfully');

    // Verify the column was added
    const result = await prisma.$queryRawUnsafe(
      `PRAGMA table_info(events)`
    );

    const kapsamColumn = result.find(col => col.name === 'kapsam');
    if (kapsamColumn) {
      console.log('✓ Verified: kapsam column exists');
      console.log('  Column info:', kapsamColumn);
    } else {
      console.log('✗ Error: kapsam column not found');
    }

  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('✓ Column already exists, skipping...');
    } else {
      console.error('✗ Migration failed:', error.message);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

migrate()
  .catch(console.error)
  .finally(() => process.exit());
