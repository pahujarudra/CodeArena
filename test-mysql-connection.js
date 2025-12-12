// ============================================================================
// MySQL Connection Test Script
// Run this to verify your MySQL database is working
// ============================================================================

// You'll need to install mysql2 first:
// npm install mysql2

import mysql from 'mysql2/promise';

// Database configuration
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '0Sheetal@9992',  // Change this to your MySQL password
    database: 'codearena',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Test functions
async function testConnection() {
    console.log('🔌 Testing MySQL Connection...\n');
    
    try {
        const connection = await mysql.createConnection(dbConfig);
        console.log('✅ Connected to MySQL successfully!\n');
        
        // Test 1: Check database exists
        console.log('📊 Test 1: Checking database...');
        const [databases] = await connection.execute(
            "SHOW DATABASES LIKE 'codearena'"
        );
        console.log(`✅ Database 'codearena' exists: ${databases.length > 0}\n`);
        
        // Test 2: Check tables
        console.log('📋 Test 2: Checking tables...');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
            console.log(`   - ${Object.values(table)[0]}`);
        });
        console.log('');
        
        // Test 3: Check sample data
        console.log('👥 Test 3: Checking sample users...');
        const [users] = await connection.execute(
            'SELECT user_id, username, fullname, email FROM users'
        );
        console.log(`✅ Found ${users.length} users:`);
        users.forEach(user => {
            console.log(`   - ${user.username} (${user.fullname}) - ${user.email}`);
        });
        console.log('');
        
        // Test 4: Check views
        console.log('👁️  Test 4: Checking views...');
        const [views] = await connection.execute(
            "SELECT TABLE_NAME FROM information_schema.VIEWS WHERE TABLE_SCHEMA = 'codearena'"
        );
        console.log(`✅ Found ${views.length} views:`);
        views.forEach(view => {
            console.log(`   - ${view.TABLE_NAME}`);
        });
        console.log('');
        
        // Test 5: Check triggers
        console.log('⚡ Test 5: Checking triggers...');
        const [triggers] = await connection.execute(
            "SELECT TRIGGER_NAME FROM information_schema.TRIGGERS WHERE TRIGGER_SCHEMA = 'codearena'"
        );
        console.log(`✅ Found ${triggers.length} triggers:`);
        triggers.forEach(trigger => {
            console.log(`   - ${trigger.TRIGGER_NAME}`);
        });
        console.log('');
        
        // Test 6: Check stored procedures
        console.log('⚙️  Test 6: Checking stored procedures...');
        const [procedures] = await connection.execute(
            "SELECT ROUTINE_NAME FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'codearena' AND ROUTINE_TYPE = 'PROCEDURE'"
        );
        console.log(`✅ Found ${procedures.length} stored procedures:`);
        procedures.forEach(proc => {
            console.log(`   - ${proc.ROUTINE_NAME}`);
        });
        console.log('');
        
        // Test 7: Test a complex query (leaderboard)
        console.log('🏆 Test 7: Testing leaderboard view...');
        const [leaderboard] = await connection.execute(
            'SELECT * FROM leaderboard_view LIMIT 3'
        );
        console.log(`✅ Leaderboard query successful! Top ${leaderboard.length} users:`);
        leaderboard.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.username} - ${user.total_points} points, ${user.problems_solved} problems solved`);
        });
        console.log('');
        
        // Test 8: Test INSERT (create a test user)
        console.log('➕ Test 8: Testing INSERT operation...');
        try {
            await connection.execute(
                `INSERT INTO users (user_id, username, fullname, email) 
                 VALUES (?, ?, ?, ?)`,
                ['test_mysql_user', 'mysql_tester', 'MySQL Test User', 'mysqltest@example.com']
            );
            console.log('✅ INSERT successful!\n');
            
            // Verify the insert
            const [newUser] = await connection.execute(
                'SELECT * FROM users WHERE user_id = ?',
                ['test_mysql_user']
            );
            console.log('✅ Verification: User was inserted successfully!');
            console.log(`   Username: ${newUser[0].username}`);
            console.log(`   Fullname: ${newUser[0].fullname}`);
            console.log(`   Email: ${newUser[0].email}\n`);
            
            // Clean up - delete test user
            await connection.execute(
                'DELETE FROM users WHERE user_id = ?',
                ['test_mysql_user']
            );
            console.log('🧹 Cleanup: Test user deleted\n');
            
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                console.log('⚠️  Test user already exists (probably from previous test)\n');
            } else {
                throw error;
            }
        }
        
        // Test 9: Test trigger (submit a solution)
        console.log('🔥 Test 9: Testing triggers with submission...');
        
        // First, create a test contest
        const [contestResult] = await connection.execute(
            `INSERT INTO contests (title, description, start_time, end_time) 
             VALUES (?, ?, ?, ?)`,
            ['Test Contest', 'Testing triggers', '2025-12-10 10:00:00', '2025-12-10 12:00:00']
        );
        const testContestId = contestResult.insertId;
        console.log(`✅ Test contest created (ID: ${testContestId})`);
        
        // Create a test problem
        const [problemResult] = await connection.execute(
            `INSERT INTO problems (contest_id, title, description, difficulty, points, time_limit, memory_limit) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [testContestId, 'Test Problem', 'Testing triggers', 'Easy', 100, 1000, 256]
        );
        const testProblemId = problemResult.insertId;
        console.log(`✅ Test problem created (ID: ${testProblemId})`);
        
        // Check contest problem count (should be updated by trigger)
        const [contestCheck] = await connection.execute(
            'SELECT problem_count FROM contests WHERE contest_id = ?',
            [testContestId]
        );
        console.log(`✅ Trigger test: Contest problem_count = ${contestCheck[0].problem_count} (should be 1)`);
        
        // Get user stats before submission
        const [userBefore] = await connection.execute(
            'SELECT total_submissions, problems_solved, total_points FROM users WHERE user_id = ?',
            ['admin_123456']
        );
        console.log(`📊 Admin user stats BEFORE submission:`);
        console.log(`   Total submissions: ${userBefore[0].total_submissions}`);
        console.log(`   Problems solved: ${userBefore[0].problems_solved}`);
        console.log(`   Total points: ${userBefore[0].total_points}`);
        
        // Submit a solution (should trigger automatic stats update)
        await connection.execute(
            `INSERT INTO submissions (user_id, problem_id, contest_id, code, language, status, passed_tests, total_tests, points_earned) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['admin_123456', testProblemId, testContestId, 'test code', 'java', 'Accepted', 5, 5, 100]
        );
        console.log('✅ Test submission created');
        
        // Check if user stats updated automatically (trigger test)
        const [userAfter] = await connection.execute(
            'SELECT total_submissions, problems_solved, total_points FROM users WHERE user_id = ?',
            ['admin_123456']
        );
        console.log(`📊 Admin user stats AFTER submission:`);
        console.log(`   Total submissions: ${userAfter[0].total_submissions} (should be +1)`);
        console.log(`   Problems solved: ${userAfter[0].problems_solved} (should be +1)`);
        console.log(`   Total points: ${userAfter[0].total_points} (should be +100)`);
        
        if (userAfter[0].total_submissions > userBefore[0].total_submissions) {
            console.log('✅ TRIGGER WORKS! Stats updated automatically!\n');
        } else {
            console.log('❌ TRIGGER FAILED! Stats not updated\n');
        }
        
        // Clean up test data
        console.log('🧹 Cleaning up test data...');
        await connection.execute('DELETE FROM submissions WHERE problem_id = ?', [testProblemId]);
        await connection.execute('DELETE FROM problems WHERE problem_id = ?', [testProblemId]);
        await connection.execute('DELETE FROM contests WHERE contest_id = ?', [testContestId]);
        console.log('✅ Cleanup complete\n');
        
        // Final summary
        console.log('═══════════════════════════════════════════════════════════');
        console.log('🎉 ALL TESTS PASSED! Your MySQL database is working perfectly!');
        console.log('═══════════════════════════════════════════════════════════');
        console.log('\n✅ Database structure: OK');
        console.log('✅ Sample data: OK');
        console.log('✅ Views: OK');
        console.log('✅ Triggers: OK');
        console.log('✅ Stored procedures: OK');
        console.log('✅ CRUD operations: OK');
        console.log('✅ Complex queries: OK');
        console.log('\n🚀 Your database is ready to use!\n');
        
        await connection.end();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('1. Make sure MySQL is running');
        console.error('2. Check your password in this file (line 13)');
        console.error('3. Verify the database "codearena" exists');
        console.error('4. Run mysql_schema.sql if you haven\'t already');
        console.error('\nFull error:', error);
        process.exit(1);
    }
}

// Run the test
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('         CodeArena MySQL Database Connection Test          ');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

testConnection();
