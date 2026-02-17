import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, Eye, EyeOff, Database, AlertTriangle, ChevronRight, Info } from 'lucide-react';
import { seedUsers } from '../lib/seed';
import { Role } from '../types';
import { SqlSetupModal } from '../components/hub/SqlSetupModal';

export const AuthPage: React.FC = () => {
  const { login, register, loginMock, isDbMissing } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();

  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cro, setCro] = useState('');
  const [role, setRole] = useState('client');
  const [invitedRole, setInvitedRole] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const roleParam = searchParams.get('role');
    if (roleParam && ['client', 'distributor', 'consultant'].includes(roleParam)) {
      setIsLogin(false);
      setInvitedRole(roleParam);
      setRole(roleParam);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!isLogin) {
      const demoEmails = ['admin@demo.com', 'client@demo.com', 'distributor@demo.com', 'consultant@demo.com'];
      if (demoEmails.includes(email.trim().toLowerCase())) {
        setError('Este e-mail é reservado para demonstração. Utilize os botões de "Ambiente de Teste".');
        return;
      }
    }
    try {
      if (isLogin) await login(email, password);
      else await register({ name, email, password, whatsapp, role, cro });
    } catch (err: any) {
      let msg = err.message || 'Erro inesperado';
      if (msg === 'Invalid login credentials') msg = 'Email ou senha incorretos.';
      if (msg.includes('already registered')) msg = 'Este e-mail já está cadastrado.';
      if (msg === 'MISSING_DB_SETUP' || msg.includes('relation "public.profiles" does not exist')) {
        msg = 'Tabelas do banco de dados não encontradas.';
        setShowSqlSetup(true);
      }
      setError(msg);
    }
  };

  const handleMockLogin = async (role: Role) => {
    try { await loginMock(role); } catch (e: any) { setError('Erro no login mock: ' + e.message); }
  };

  const handleSeed = async () => {
    if (!window.confirm("Isso tentará criar as contas demo no banco de dados REAL. Continuar?")) return;
    setIsSeeding(true);
    try { const result = await seedUsers(); alert(result); } catch (e: any) { alert("Erro: " + e.message); } finally { setIsSeeding(false); }
  };

  const clearInvite = () => {
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setInvitedRole(null);
    setIsLogin(true);
  };

  const inputClasses = "w-full px-4 py-3.5 rounded-xl bg-primary/5 border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring transition-all text-sm";
  const labelClasses = "block text-xs font-semibold uppercase tracking-wider mb-1.5 pl-0.5 text-muted-foreground";

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background relative overflow-hidden">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="h-16 drop-shadow-lg" />
          ) : (
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground text-2xl font-bold shadow-lg shadow-primary/20">
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl shadow-black/5 p-8">
          {/* Header */}
          <div className="text-center mb-6">
            {!isLogin && invitedRole ? (
              <h2 className="text-xl font-bold text-card-foreground">{t(`landing.${invitedRole}.title`)}</h2>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-card-foreground mb-1">
                  {isLogin ? t('auth.login') : t('auth.register')}
                </h2>
                <p className="text-sm font-medium text-accent">{config.appName}</p>
              </>
            )}
          </div>

          {/* Alerts */}
          {isDbMissing && (
            <button onClick={() => setShowSqlSetup(true)} className="w-full mb-4 bg-destructive/10 border border-destructive/20 rounded-xl p-3 flex items-center gap-3 text-left hover:bg-destructive/15 transition-colors">
              <Database size={16} className="text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-bold text-destructive">Banco Incompleto</p>
                <p className="text-[10px] text-muted-foreground">Clique para corrigir.</p>
              </div>
              <AlertTriangle size={14} className="text-destructive/50" />
            </button>
          )}

          {!isLogin && !invitedRole && !isDbMissing && (
            <div className="mb-4 rounded-xl p-3 bg-accent/5 border border-accent/15 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1 text-accent text-xs font-semibold uppercase tracking-wide">
                <Info size={12} /> Contas Demo
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{t('auth.hint')}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive flex items-start gap-2">
              <AlertTriangle className="shrink-0 mt-0.5" size={14} />
              <div>
                <span className="leading-snug">{error}</span>
                {error.includes('Tabelas') && (
                  <button onClick={() => setShowSqlSetup(true)} className="block text-xs font-bold underline mt-1">Resolver Agora</button>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className={labelClasses}>Nome Completo</label>
                <input type="text" required className={inputClasses} value={name} onChange={(e) => setName(e.target.value)} />
              </div>
            )}

            <div>
              <label className={labelClasses}>Email</label>
              <input type="email" required className={inputClasses} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className={labelClasses}>Senha</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} required className={inputClasses + " pr-11"} value={password} onChange={(e) => setPassword(e.target.value)} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" tabIndex={-1}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className={labelClasses}>WhatsApp</label>
                  <input type="tel" required className={inputClasses} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                </div>
                {!invitedRole && (
                  <div>
                    <label className={labelClasses}>Tipo de Perfil</label>
                    <select className={inputClasses} value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="client">Cliente</option>
                      <option value="distributor">Distribuidor</option>
                      <option value="consultant">Consultor</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className={labelClasses}>CRO (Opcional)</label>
                  <input type="text" className={inputClasses} value={cro} onChange={(e) => setCro(e.target.value)} />
                </div>
              </>
            )}

            <button type="submit" className="w-full bg-accent text-accent-foreground font-semibold py-3.5 rounded-xl hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-accent/20 flex items-center justify-center gap-2 mt-2">
              {!isLogin && invitedRole && <UserPlus size={18} />}
              {isLogin ? 'Entrar na Plataforma' : invitedRole ? 'Confirmar Cadastro' : 'Criar Nova Conta'}
              <ChevronRight size={16} />
            </button>
          </form>

          {/* Footer links */}
          <div className="mt-6 text-center text-sm space-y-4">
            {invitedRole ? (
              <button onClick={clearInvite} className="flex items-center justify-center gap-2 mx-auto text-muted-foreground hover:text-foreground transition-colors text-sm">
                <ArrowLeft size={14} /> Voltar para Login Padrão
              </button>
            ) : (
              <>
                <button onClick={() => setIsLogin(!isLogin)} className="text-accent font-medium hover:underline underline-offset-4">
                  {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
                </button>
                <div>
                  <button onClick={handleSeed} disabled={isSeeding} className="text-[10px] text-muted-foreground/50 hover:text-muted-foreground transition-colors flex items-center justify-center gap-1.5 mx-auto py-1">
                    <Database size={10} />
                    {isSeeding ? 'Criando usuários...' : 'Resetar Banco REAL'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Brand footer */}
        <p className="text-center text-[10px] text-muted-foreground/40 mt-6 tracking-wide">
          {config.appName} &bull; Plataforma Premium
        </p>
      </div>

      {showSqlSetup && <SqlSetupModal onClose={() => setShowSqlSetup(false)} />}
    </div>
  );
};
