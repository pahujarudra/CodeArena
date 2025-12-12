#!/usr/bin/env node

/**
 * Database Setup Script
 * This script creates the MySQL database without needing MySQL command-line tools
 * Just run: node setup-database.js
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n🚀 CodeArena Database Setup\n');
  
  // Read credentials
  const host = await question('MySQL Host (default: localhost): ') || 'localhost';
  const user = await question('MySQL User (default: root): ') || 'root';
  const password = await question('MySQL Password: ');
  
  if (!password) {
    console.error('❌ Password is required!');
    process.exit(1);
  }

  console.log('\n📊 Connecting to MySQL...');

  let connection;
  
  try {
    // Connect to MySQL (without specifying database)
    connection = await mysql.createConnection({
      host: host,
      user: user,
      password: password,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL!\n');

    // Read the schema file
    console.log('📖 Reading schema file...');
    const schemaPath = path.join(__dirname, 'database', 'mysql_schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('⚙️  Creating database and tables...');
    
    // Execute the schema
    await connection.query(schema);

    console.log('✅ Database setup complete!\n');
    console.log('📊 Database: codearena');
    console.log('📋 Tables created:');
    console.log('   - users');
    console.log('   - contests');
    console.log('   - problems');
    console.log('   - test_cases');
    console.log('   - submissions');
    console.log('   - contest_participants');
    console.log('   - user_activities\n');
    
    // Verify database
    await connection.query('USE codearena');
    const [tables] = await connection.query('SHOW TABLES');
    
    console.log('✅ Verification: Found', tables.length, 'tables\n');
    
    // Update .env file
    console.log('📝 Updating backend/.env file...');
    const envPath = path.join(__dirname, 'backend', '.env');
    let envContent = fs.readFileSync(envPath, 'utf8');
    
    // Update database credentials
    envContent = envContent.replace(/DB_HOST=.*/, `DB_HOST=${host}`);
    envContent = envContent.replace(/DB_USER=.*/, `DB_USER=${user}`);
    envContent = envContent.replace(/DB_PASSWORD=.*/, `DB_PASSWORD=${password}`);
    
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Updated backend/.env\n');
    
    console.log('🎉 Setup complete! You can now start the backend server:\n');
    console.log('   cd backend && npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('\n💡 Tip: Check your MySQL username and password');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure MySQL server is running');
      console.error('   macOS: brew services start mysql');
    }
    
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
    rl.close();
  }
}

setupDatabase();
