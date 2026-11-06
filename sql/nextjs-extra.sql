-- Extra schema required by the Next.js app.
-- Import after the original database.sql:
--   mysql -u root agency_db < sql/nextjs-extra.sql
USE agency_db;

CREATE TABLE IF NOT EXISTS app_sessions (
  token_hash CHAR(64) NOT NULL PRIMARY KEY,
  user_id INT UNSIGNED NULL,
  admin_id INT UNSIGNED NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_sessions_admin FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_admin (admin_id),
  INDEX idx_sessions_expiry (expires_at)
) ENGINE=InnoDB;

INSERT INTO settings (setting_key, setting_value) VALUES
  ('site_notice', ''),
  ('support_email', 'smith14580@gmail.com')
ON DUPLICATE KEY UPDATE setting_value = setting_value;
