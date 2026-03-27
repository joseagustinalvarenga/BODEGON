-- PASSWORD: Admin123! (BCrypt hashed)
-- Use a tool or online generator to get the hash. 
-- For this example, I'll use a placeholder standard bcrypt hash for 'Admin123!'

-- INSERT ADMIN
INSERT INTO users (id, full_name, email, password_hash, role, status)
VALUES (
    uuid_generate_v4(), 
    'Admin Bodegon', 
    'admin@bodegon.com', 
    '$2a$10$y.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X.X', -- REPLACE THIS IN CODE or use a fixed known hash.
    'ADMIN',
    'ACTIVE'
);

-- REWARDS
INSERT INTO rewards (name, description, points_cost, stock, active)
VALUES 
('Cerveza Artesanal Pinta', 'Una pinta de cerveza artesanal a elección', 500, NULL, TRUE),
('Hamburguesa Clásica', 'Hamburguesa con queso y papas', 1200, 50, TRUE),
('Postre de la Casa', 'Flan mixto o helado', 400, NULL, TRUE);

-- PROMOTIONS
INSERT INTO promotions (title, description, type, start_at, end_at, status)
VALUES 
('2x1 en Pintas', 'Todos los martes de 18 a 21hs', 'PUBLIC', NOW(), NOW() + INTERVAL '30 days', 'PUBLISHED'),
('Cena Gratis Cumpleaños', 'Si es tu mes, vení a cenar gratis', 'MEMBERS_ONLY', NOW(), NOW() + INTERVAL '90 days', 'PUBLISHED'),
('Sorteo Mensual', 'Participá por un viaje', 'MEMBERS_ONLY', NOW(), NOW() + INTERVAL '10 days', 'DRAFT');
