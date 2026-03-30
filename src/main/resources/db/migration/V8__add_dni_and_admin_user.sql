-- Add DNI column to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS dni VARCHAR(20) UNIQUE;

-- Create default admin user (password: Admin1234, bcrypt hash)
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
) ON CONFLICT (email) DO NOTHING;
