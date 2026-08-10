const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const connectionString = 'postgres://postgres.lnrchirwppzgjbndmegl:CwI8WOyQ5I3SQRd8@aws-1-eu-central-1.pooler.supabase.com:6543/postgres';

async function migrate() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database");

    const migrationsToRun = [
      '044_chat_messaging.sql',
      '045_forum_threads.sql',
      '047_mentorship_and_live.sql'
    ];

    for (const file of migrationsToRun) {
      console.log(`Executing ${file}...`);
      const sql = fs.readFileSync(path.join(__dirname, 'supabase', 'migrations', file), 'utf8');
      await client.query(sql);
      console.log(`${file} executed successfully!`);
    }

  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await client.end();
  }
}

migrate();
