import { createClient } from '@supabase/supabase-js';

// NOTA: Este arquivo é apenas referência para seed de dados demo.
// As credenciais aqui são placeholders - substitua pelas suas.
const SUPABASE_URL = 'https://placeholder.supabase.co';
const SERVICE_ROLE_KEY = 'placeholder-service-role-key';

export const seedUsers = async () => {
  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  const users = [
    { email: 'admin@demo.com', password: '123456', role: 'super_admin', name: 'Super Admin' },
    { email: 'client@demo.com', password: '123456', role: 'client', name: 'Cliente Demo' },
    { email: 'distributor@demo.com', password: '123456', role: 'distributor', name: 'Distribuidor Demo' },
    { email: 'consultant@demo.com', password: '123456', role: 'consultant', name: 'Consultor Demo' },
  ];

  const results: string[] = [];

  for (const u of users) {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name }
    });

    let userId = authData.user?.id;
    let msg = '';

    if (authError) {
      const { data: profileData } = await supabaseAdmin.from('profiles').select('id').eq('email', u.email).single();
      if (profileData) {
        userId = profileData.id;
        msg = '(Usuário já existia - Perfil atualizado)';
      } else {
        results.push(`⚠️ ${u.role}: Usuário Auth já existe mas perfil não encontrado. Tente fazer login.`);
        continue;
      }
    } else {
      msg = '(Conta Criada com Sucesso)';
    }

    if (userId) {
      const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: u.email,
        name: u.name,
        role: u.role,
        whatsapp: '11999999999',
        status: 'active',
        preferences: { theme: 'dark', language: 'pt-br' }
      });

      if (profileError) {
        results.push(`❌ ${u.role}: Erro ao criar perfil - ${profileError.message}`);
      } else {
        results.push(`✅ ${u.role} ${msg}`);
      }
    }
  }

  return results.join('\n');
};
