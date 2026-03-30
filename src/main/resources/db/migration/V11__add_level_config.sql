CREATE TABLE IF NOT EXISTS level_configs (
    level     VARCHAR(20) PRIMARY KEY,
    threshold INT         NOT NULL DEFAULT 0,
    perks     TEXT        NOT NULL DEFAULT '[]'
);

INSERT INTO level_configs (level, threshold, perks) VALUES
('BRONZE', 0,    '["Acceso al programa de puntos","Recompensas del catálogo básico","Promociones exclusivas para miembros"]'),
('SILVER', 1000, '["Todo lo de Bronce","Acceso a recompensas exclusivas Plata","Descuentos especiales en productos seleccionados"]'),
('GOLD',   5000, '["Todo lo de Plata","Acceso VIP a recompensas premium","Prioridad en beneficios y eventos especiales"]')
ON CONFLICT (level) DO NOTHING;
