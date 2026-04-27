const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

function loadEnv() {
    const envPath = '.env.local';
    try {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split('\n').forEach(line => {
            const [key, value] = line.split('=');
            if (key && value) {
                process.env[key.trim()] = value.trim();
            }
        });
        console.log('Environment loaded from .env.local');
    } catch (err) {
        console.error('Could not load .env.local:', err.message);
    }
}

async function runMigration() {
    loadEnv();
    
    if (!process.env.DATABASE_URL) {
        console.error('DATABASE_URL not found');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        const migrationPath = path.join(__dirname, '../migrations/1714130000000_create_medical_results.sql');
        const migrationSql = fs.readFileSync(migrationPath, 'utf8');
        console.log('Running medical_results migration...');
        await pool.query(migrationSql);
        console.log('✅ Migration successful: medical_results table created.');
    } catch (err) {
        console.error('❌ Migration failed:', err.message);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
