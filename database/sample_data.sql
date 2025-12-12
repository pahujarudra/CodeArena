-- Sample Data for CodeArena
-- This includes: Admin user, Contests, Problems, and Test Cases

USE codearena;

-- Insert Admin User (skip if exists)
-- Password: admin123 (hashed with bcrypt)
INSERT IGNORE INTO users (username, email, password_hash, full_name, role, avatar_url, rating, total_solved, created_at) VALUES
('admin', 'admin@codearena.com', '$2a$10$XQZqZ9J0qYZ0qYZ0qYZ0qeKJH8F9F8F9F8F9F8F9F8F9F8F9F8F9F8', 'Admin User', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', 1500, 0, NOW()),
('johndoe', 'john@example.com', '$2a$10$XQZqZ9J0qYZ0qYZ0qYZ0qeKJH8F9F8F9F8F9F8F9F8F9F8F9F8F9F8', 'John Doe', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=john', 1200, 5, NOW()),
('janedoe', 'jane@example.com', '$2a$10$XQZqZ9J0qYZ0qYZ0qYZ0qeKJH8F9F8F9F8F9F8F9F8F9F8F9F8F9F8', 'Jane Doe', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane', 1350, 8, NOW());

-- Insert Sample Contests
INSERT INTO contests (title, description, start_time, end_time, duration_minutes, created_at) VALUES
('Weekly Contest #1', 'Test your algorithmic skills in this beginner-friendly contest!', 
 DATE_ADD(NOW(), INTERVAL -2 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 10080, NOW()),
 
('Monthly Challenge - December 2025', 'Advanced problems for experienced coders. Prizes for top 3!', 
 DATE_ADD(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 10 DAY), 10080, NOW()),
 
('Beginner Bootcamp', 'Perfect for those just starting their competitive programming journey.', 
 DATE_ADD(NOW(), INTERVAL -7 DAY), DATE_ADD(NOW(), INTERVAL -1 DAY), 8640, NOW());

-- Get contest IDs (get the latest ones we just inserted)
SET @contest1 = (SELECT contest_id FROM contests WHERE title = 'Weekly Contest #1' ORDER BY created_at DESC LIMIT 1);
SET @contest2 = (SELECT contest_id FROM contests WHERE title = 'Monthly Challenge - December 2025' ORDER BY created_at DESC LIMIT 1);
SET @contest3 = (SELECT contest_id FROM contests WHERE title = 'Beginner Bootcamp' ORDER BY created_at DESC LIMIT 1);

-- Insert Sample Problems for Contest 1
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_at) VALUES
(@contest1, 'Two Sum', 
'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].', 
'Easy', 100, 1000, 256, NOW()),

(@contest1, 'Reverse String', 
'Write a function that reverses a string. The input string is given as an array of characters.

You must do this by modifying the input array in-place with O(1) extra memory.

Example:
Input: s = ["h","e","l","l","o"]
Output: ["o","l","l","e","h"]', 
'Easy', 100, 1000, 256, NOW()),

(@contest1, 'Palindrome Number', 
'Given an integer x, return true if x is a palindrome, and false otherwise.

An integer is a palindrome when it reads the same backward as forward.

Example:
Input: x = 121
Output: true
Explanation: 121 reads as 121 from left to right and from right to left.', 
'Easy', 150, 1000, 256, NOW());

-- Insert Sample Problems for Contest 2
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_at) VALUES
(@contest2, 'Longest Substring Without Repeating Characters', 
'Given a string s, find the length of the longest substring without repeating characters.

Example:
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.', 
'Medium', 200, 2000, 256, NOW()),

(@contest2, 'Container With Most Water', 
'You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store.

Example:
Input: height = [1,8,6,2,5,4,8,3,7]
Output: 49
Explanation: The max area is between index 1 and 8.', 
'Medium', 250, 2000, 256, NOW()),

(@contest2, 'Merge K Sorted Lists', 
'You are given an array of k linked-lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Example:
Input: lists = [[1,4,5],[1,3,4],[2,6]]
Output: [1,1,2,3,4,4,5,6]', 
'Hard', 400, 3000, 512, NOW());

-- Get problem IDs for test cases
SET @prob1 = (SELECT problem_id FROM problems WHERE title = 'Two Sum' LIMIT 1);
SET @prob2 = (SELECT problem_id FROM problems WHERE title = 'Reverse String' LIMIT 1);
SET @prob3 = (SELECT problem_id FROM problems WHERE title = 'Palindrome Number' LIMIT 1);

-- Insert Test Cases for Two Sum
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at) VALUES
(@prob1, '4 9\n2 7 11 15', '0 1', 1, 20, NOW()),
(@prob1, '4 6\n3 2 4 1', '1 2', 0, 20, NOW()),
(@prob1, '3 10\n5 5 10', '0 1', 0, 20, NOW()),
(@prob1, '5 15\n1 4 7 11 12', '2 3', 0, 20, NOW()),
(@prob1, '2 5\n2 3', '0 1', 0, 20, NOW());

-- Insert Test Cases for Reverse String
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at) VALUES
(@prob2, 'hello', 'olleh', 1, 20, NOW()),
(@prob2, 'world', 'dlrow', 0, 20, NOW()),
(@prob2, 'a', 'a', 0, 20, NOW()),
(@prob2, 'racecar', 'racecar', 0, 20, NOW()),
(@prob2, 'CodeArena', 'anerAedoC', 0, 20, NOW());

-- Insert Test Cases for Palindrome Number
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at) VALUES
(@prob3, '121', 'true', 1, 30, NOW()),
(@prob3, '-121', 'false', 0, 30, NOW()),
(@prob3, '10', 'false', 0, 20, NOW()),
(@prob3, '12321', 'true', 0, 20, NOW());

-- Update user stats
UPDATE users SET total_solved = 5 WHERE username = 'johndoe';
UPDATE users SET total_solved = 8 WHERE username = 'janedoe';

COMMIT;

SELECT 'Sample data loaded successfully!' as Status;
SELECT COUNT(*) as 'Total Users' FROM users;
SELECT COUNT(*) as 'Total Contests' FROM contests;
SELECT COUNT(*) as 'Total Problems' FROM problems;
SELECT COUNT(*) as 'Total Test Cases' FROM test_cases;
