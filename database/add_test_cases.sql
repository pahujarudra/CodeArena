-- Add sample test cases to existing problems
-- This script adds test cases for problems that don't have any

-- Problem 7: Two Sum
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (7, '2 7 11 15
9', '0 1', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (7, '3 2 4
6', '1 2', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (7, '3 3
6', '0 1', 0, 50, NOW());

-- Problem 8: Reverse String
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (8, 'hello', 'olleh', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (8, 'Hannah', 'hannaH', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (8, 'CodeArena', 'anerAedoC', 0, 50, NOW());

-- Problem 9: Palindrome Number
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (9, '121', 'true', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (9, '-121', 'false', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (9, '10', 'false', 0, 50, NOW());

-- Problem 10: Longest Substring Without Repeating Characters
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (10, 'abcabcbb', '3', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (10, 'bbbbb', '1', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (10, 'pwwkew', '3', 0, 50, NOW());

-- Problem 11: Container With Most Water
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (11, '1 8 6 2 5 4 8 3 7', '49', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (11, '1 1', '1', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (11, '4 3 2 1 4', '16', 0, 50, NOW());

-- Problem 12: Merge K Sorted Lists
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (12, '3
1 4 5
1 3 4
2 6', '1 1 2 3 4 4 5 6', 1, 20, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (12, '0', '', 0, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (12, '1
0', '', 0, 50, NOW());

-- Problem 35: Hello World
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (35, '', 'Hello, World!', 1, 50, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (35, '', 'Hello, World!', 0, 50, NOW());

-- Problem 36: Print Your Name
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (36, 'Alice', 'Hello, Alice!', 1, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (36, 'Bob', 'Hello, Bob!', 0, 35, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (36, 'Charlie', 'Hello, Charlie!', 0, 35, NOW());

-- Problem 37: Simple Addition
INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (37, '5 3', '8', 1, 30, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (37, '10 20', '30', 0, 35, NOW());

INSERT INTO test_cases (problem_id, input, expected_output, is_sample, points, created_at)
VALUES (37, '0 0', '0', 0, 35, NOW());

-- Verify the test cases were added
SELECT p.problem_id, p.title, COUNT(tc.test_case_id) as total_tests, SUM(tc.is_sample) as sample_tests
FROM problems p
LEFT JOIN test_cases tc ON p.problem_id = tc.problem_id
GROUP BY p.problem_id
ORDER BY p.problem_id;
