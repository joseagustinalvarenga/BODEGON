-- Ensure admin@bodegon.com always has ADMIN role
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@bodegon.com';

-- Insert admin if it doesn't exist yet
INSERT INTO users (id, full_name, email, password_hash, role, status, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'Administrador',
    'admin@bodegon.com',
    '$2a$10$S4m5QDiqMbeX0BQA2CSg3eKFvNYQaGsnA7sLB5UQN.zU20nXdZxmG',
    'ADMIN',
    'ACTIVE',
    NOW(),
    NOW()
) ON CONFLICT (email) DO UPDATE SET role = 'ADMIN';
