-- ============================================================
-- El Testamento del Siglo de Oro — esquema de licencias (D1)
-- ============================================================
-- Pega esto en el panel de Cloudflare: Workers & Pages → D1 →
-- tu base de datos → pestaña "Console".

CREATE TABLE IF NOT EXISTS licenses (
  code TEXT PRIMARY KEY,             -- código legible, p.ej. MADRID-7F3K9Q
  stripe_session_id TEXT UNIQUE,     -- sesión de Stripe Checkout que lo generó
  email TEXT,                        -- email del comprador (si Stripe lo capturó)
  status TEXT NOT NULL DEFAULT 'unused',  -- unused | active
  device_id TEXT,                    -- se fija en la primera redención (1 código = 1 dispositivo)
  created_at INTEGER NOT NULL,       -- epoch ms
  activated_at INTEGER               -- epoch ms, null hasta que se redime
);

CREATE INDEX IF NOT EXISTS idx_licenses_session ON licenses(stripe_session_id);

-- --------------------------------------------------------------
-- Consultas de soporte útiles (ejecutar a mano cuando haga falta)
-- --------------------------------------------------------------

-- Ver todos los códigos y su estado:
--   SELECT code, status, email, device_id, datetime(created_at/1000,'unixepoch') FROM licenses ORDER BY created_at DESC;

-- Liberar un código para que un cliente lo reactive en otro móvil
-- (p.ej. perdió el teléfono o borró datos de la app):
--   UPDATE licenses SET status='unused', device_id=NULL WHERE code='MADRID-7F3K9Q';

-- Generar un código manualmente sin pasar por Stripe (regalo, prensa, etc.):
--   INSERT INTO licenses (code, status, created_at) VALUES ('MADRID-REGALO1', 'unused', unixepoch()*1000);
