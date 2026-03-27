-- V6: Seed data for Rewards and Promotions
-- Populate some initial active rewards
INSERT INTO rewards (name, description, points_cost, stock, active, created_at, updated_at)
VALUES 
('Copa de Vino de la Casa', 'Disfrutá de una copa de nuestro mejor vino tinto o blanco.', 500, NULL, TRUE, NOW(), NOW()),
('Postre a Elección', 'Cualquier postre de nuestra carta (Budín de pan, Flan casero, etc).', 800, 50, TRUE, NOW(), NOW()),
('Milanesa Gigante para Compartir', 'Nuestra famosa milanesa Bodegón con papas fritas.', 2500, 20, TRUE, NOW(), NOW()),
('Botella de Vino Reserva', 'Vino seleccionado de nuestra cava exclusiva.', 4500, 10, TRUE, NOW(), NOW());

-- Populate some promotions
INSERT INTO promotions (title, description, type, start_at, end_at, status, image_url, created_at, updated_at)
VALUES 
('Happy Hour de Vinos', '2x1 en copas de vino seleccionadas de 18:00 a 20:00.', 'PUBLIC', NOW(), NOW() + INTERVAL '30 days', 'PUBLISHED', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800', NOW(), NOW()),
('Martes de Amigos', '15% de descuento en el total de la cuenta para mesas de 4 o más.', 'PUBLIC', NOW(), NOW() + INTERVAL '60 days', 'PUBLISHED', 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800', NOW(), NOW()),
('Exclusivo VIP: Noche de Cata', 'Evento exclusivo para miembros GOLD. Degustación gratuita de nuevos ingresos.', 'MEMBERS_ONLY', NOW() + INTERVAL '7 days', NOW() + INTERVAL '8 days', 'PUBLISHED', 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=800', NOW(), NOW());
