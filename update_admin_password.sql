USE codearena;

-- Update admin password to 'admin123'
UPDATE users 
SET password_hash = '$2a$10$HwcER2zlk.IklzB4m2Aj2exLSazg0V7a8AJv38geDUlB2ZOnV1kRG' 
WHERE email = 'admin@codearena.com';

-- Verify the update
SELECT user_id, username, email, role, 
       CONCAT(LEFT(password_hash, 7), '...', RIGHT(password_hash, 7)) as password_preview
FROM users 
WHERE email = 'admin@codearena.com';
