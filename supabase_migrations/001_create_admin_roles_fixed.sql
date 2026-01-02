-- Migration: Create admin_roles table for role-based access control
-- Fixed version: handles already existing policies
-- Execute this in Supabase Dashboard → SQL Editor

-- Создать таблицу ролей администраторов (если не существует)
CREATE TABLE IF NOT EXISTS admin_roles (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES bot_users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'volunteer')),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by BIGINT REFERENCES bot_users(id),
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Создать комментарии для таблицы и колонок
COMMENT ON TABLE admin_roles IS 'Роли пользователей для доступа к административным функциям и чекину';
COMMENT ON COLUMN admin_roles.user_id IS 'ID пользователя из таблицы bot_users';
COMMENT ON COLUMN admin_roles.role IS 'Роль: admin (полный доступ) или volunteer (только чекин)';
COMMENT ON COLUMN admin_roles.granted_at IS 'Время назначения роли';
COMMENT ON COLUMN admin_roles.granted_by IS 'Кто назначил роль (user_id)';
COMMENT ON COLUMN admin_roles.is_active IS 'Активна ли роль (для отзыва прав без удаления записи)';
COMMENT ON COLUMN admin_roles.notes IS 'Заметки о назначении роли';

-- Создать индексы (если не существуют)
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_id ON admin_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_roles_active ON admin_roles(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_admin_roles_user_role ON admin_roles(user_id, role) WHERE is_active = true;

-- RLS политики
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Удалить существующие политики (если есть) и создать заново
DROP POLICY IF EXISTS "Allow read active admin_roles" ON admin_roles;
DROP POLICY IF EXISTS "Allow admin manage admin_roles" ON admin_roles;

-- Создать политики заново
CREATE POLICY "Allow read active admin_roles" ON admin_roles
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Allow admin manage admin_roles" ON admin_roles
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Вывести успешное сообщение
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Table admin_roles is ready to use.';
END $$;
