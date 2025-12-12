-- Add More Problems to Contests
USE codearena;

-- ============================================
-- Contest 1, 4: Weekly Contest #1 (Easy Problems)
-- ============================================
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at) VALUES
(1, 'Sum of Two Numbers', 'Write a program that takes two integers as input and returns their sum.\n\nInput Format:\nTwo space-separated integers a and b\n\nOutput Format:\nA single integer representing a + b\n\nConstraints:\n-10^9 ≤ a, b ≤ 10^9', 'Easy', 50, 1000, 256, 3, 0, 0.0, NOW()),
(1, 'Even or Odd', 'Given an integer n, determine if it is even or odd.\n\nInput Format:\nA single integer n\n\nOutput Format:\nPrint "Even" if n is even, otherwise print "Odd"\n\nConstraints:\n-10^9 ≤ n ≤ 10^9', 'Easy', 50, 1000, 256, 3, 0, 0.0, NOW()),
(1, 'Maximum of Three', 'Given three integers, find the maximum among them.\n\nInput Format:\nThree space-separated integers a, b, and c\n\nOutput Format:\nA single integer representing the maximum\n\nConstraints:\n-10^9 ≤ a, b, c ≤ 10^9', 'Easy', 75, 1000, 256, 3, 0, 0.0, NOW());

-- Same problems for contest 4
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at)
SELECT 4, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, NOW()
FROM problems WHERE contest_id = 1;

-- ============================================
-- Contest 2, 5: Monthly Challenge (Medium-Hard Problems)
-- ============================================
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at) VALUES
(2, 'Binary Search', 'Given a sorted array of integers and a target value, return the index of the target if found, otherwise return -1.\n\nInput Format:\nFirst line: n (size of array) and target\nSecond line: n space-separated sorted integers\n\nOutput Format:\nIndex of target (0-based) or -1\n\nConstraints:\n1 ≤ n ≤ 10^5\n-10^9 ≤ array[i], target ≤ 10^9', 'Medium', 150, 2000, 256, 3, 0, 0.0, NOW()),
(2, 'Valid Parentheses', 'Given a string containing just the characters "(", ")", "{", "}", "[" and "]", determine if the input string is valid.\n\nInput Format:\nA single string s\n\nOutput Format:\n"true" if valid, "false" otherwise\n\nConstraints:\n1 ≤ length(s) ≤ 10^4', 'Medium', 175, 2000, 256, 3, 0, 0.0, NOW()),
(2, 'Longest Increasing Subsequence', 'Find the length of the longest strictly increasing subsequence in an array.\n\nInput Format:\nFirst line: n (size of array)\nSecond line: n space-separated integers\n\nOutput Format:\nLength of longest increasing subsequence\n\nConstraints:\n1 ≤ n ≤ 2500\n-10^6 ≤ array[i] ≤ 10^6', 'Hard', 300, 3000, 512, 3, 0, 0.0, NOW());

-- Same problems for contest 5
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at)
SELECT 5, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, NOW()
FROM problems WHERE contest_id = 2;

-- ============================================
-- Contest 3, 6, 9, 12: Beginner Bootcamp (Very Easy)
-- ============================================
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at) VALUES
(3, 'Hello World', 'Print "Hello, World!" to the console.\n\nInput Format:\nNo input\n\nOutput Format:\nPrint exactly: Hello, World!\n\nConstraints:\nNone', 'Easy', 25, 1000, 256, 3, 0, 0.0, NOW()),
(3, 'Print Your Name', 'Read a name from input and print "Hello, [name]!"\n\nInput Format:\nA single string (the name)\n\nOutput Format:\nPrint: Hello, [name]!\n\nConstraints:\n1 ≤ length(name) ≤ 100', 'Easy', 30, 1000, 256, 3, 0, 0.0, NOW()),
(3, 'Simple Addition', 'Add two numbers and print the result.\n\nInput Format:\nTwo space-separated integers a and b\n\nOutput Format:\nThe sum a + b\n\nConstraints:\n0 ≤ a, b ≤ 100', 'Easy', 40, 1000, 256, 3, 0, 0.0, NOW());

-- Copy to other beginner contests
INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at)
SELECT 6, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, NOW()
FROM problems WHERE contest_id = 3;

INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at)
SELECT 9, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, NOW()
FROM problems WHERE contest_id = 3;

INSERT INTO problems (contest_id, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, created_at)
SELECT 12, title, description, difficulty, max_score, time_limit, memory_limit, created_by, total_submissions, acceptance_rate, NOW()
FROM problems WHERE contest_id = 3;

-- ============================================
-- Add Test Cases for New Problems
-- ============================================

-- Get problem IDs (we'll use LAST_INSERT_ID approach)
-- Sum of Two Numbers test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '5 3', '8', 1, 10, NOW() FROM problems WHERE title = 'Sum of Two Numbers' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '-10 20', '10', 1, 10, NOW() FROM problems WHERE title = 'Sum of Two Numbers' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '0 0', '0', 1, 10, NOW() FROM problems WHERE title = 'Sum of Two Numbers' AND contest_id = 1 LIMIT 1;

-- Even or Odd test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '4', 'Even', 1, 10, NOW() FROM problems WHERE title = 'Even or Odd' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '7', 'Odd', 1, 10, NOW() FROM problems WHERE title = 'Even or Odd' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '-2', 'Even', 1, 10, NOW() FROM problems WHERE title = 'Even or Odd' AND contest_id = 1 LIMIT 1;

-- Maximum of Three test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '5 10 3', '10', 1, 15, NOW() FROM problems WHERE title = 'Maximum of Three' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '-5 -10 -3', '-3', 1, 15, NOW() FROM problems WHERE title = 'Maximum of Three' AND contest_id = 1 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '100 100 100', '100', 1, 15, NOW() FROM problems WHERE title = 'Maximum of Three' AND contest_id = 1 LIMIT 1;

-- Binary Search test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '5 7\n1 3 5 7 9', '3', 1, 20, NOW() FROM problems WHERE title = 'Binary Search' AND contest_id = 2 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '5 6\n1 3 5 7 9', '-1', 1, 20, NOW() FROM problems WHERE title = 'Binary Search' AND contest_id = 2 LIMIT 1;

-- Valid Parentheses test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '()', 'true', 1, 20, NOW() FROM problems WHERE title = 'Valid Parentheses' AND contest_id = 2 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '()[]{}', 'true', 1, 20, NOW() FROM problems WHERE title = 'Valid Parentheses' AND contest_id = 2 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '(]', 'false', 1, 20, NOW() FROM problems WHERE title = 'Valid Parentheses' AND contest_id = 2 LIMIT 1;

-- Hello World test case
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '', 'Hello, World!', 1, 25, NOW() FROM problems WHERE title = 'Hello World' AND contest_id = 3 LIMIT 1;

-- Print Your Name test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, 'Alice', 'Hello, Alice!', 1, 15, NOW() FROM problems WHERE title = 'Print Your Name' AND contest_id = 3 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, 'Bob', 'Hello, Bob!', 1, 15, NOW() FROM problems WHERE title = 'Print Your Name' AND contest_id = 3 LIMIT 1;

-- Simple Addition test cases
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '5 3', '8', 1, 10, NOW() FROM problems WHERE title = 'Simple Addition' AND contest_id = 3 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '10 20', '30', 1, 10, NOW() FROM problems WHERE title = 'Simple Addition' AND contest_id = 3 LIMIT 1;
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
SELECT problem_id, '0 0', '0', 1, 10, NOW() FROM problems WHERE title = 'Simple Addition' AND contest_id = 3 LIMIT 1;

COMMIT;

-- Show summary
SELECT 'Problems added successfully!' as Status;
SELECT contest_id, COUNT(*) as problem_count FROM problems GROUP BY contest_id ORDER BY contest_id;
