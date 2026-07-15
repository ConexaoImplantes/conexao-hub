
INSERT INTO public.permissions (key, module, label, description, sort_order) VALUES
  ('audit.view', 'audit', 'Visualizar auditoria', 'Acessar o log de auditoria do sistema', 80)
ON CONFLICT (key) DO NOTHING;

-- Grant to super_admin
INSERT INTO public.role_permissions (role, permission_key)
VALUES ('super_admin', 'audit.view')
ON CONFLICT DO NOTHING;
