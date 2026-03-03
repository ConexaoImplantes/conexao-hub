import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { UserPlus, ArrowLeft, Eye, EyeOff, Shield, Sparkles, Briefcase, User, Database, AlertTriangle, ChevronRight, Loader2 } from 'lucide-react';
import { Role } from '../types';
import { SqlSetupModal } from '../components/hub/SqlSetupModal';
import { mockDb } from '../lib/mockDb';
import { toast } from 'sonner';

export const AuthPage: React.FC = () => {
  const { login, register, isDbMissing } = useAuth();
  const { t } = useLanguage();
  const { config } = useBrand();

  const [isLogin, setIsLogin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return !params.has('token') && !params.has('role');
  });
  const [error, setError] = useState('');
  const [showSqlSetup, setShowSqlSetup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cro, setCro] = useState('');
  const [role, setRole] = useState('client');
  const [invitedRole, setInvitedRole] = useState<string | null>(null);
  const [inviteToken, setInviteToken] = useState<{ id: string; token: string; role: string } | null>(null);
  const [tokenValidating, setTokenValidating] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tokenParam = searchParams.get('token');
    const roleParam = searchParams.get('role');

    if (tokenParam) {
      setTokenValidating(true);
      setIsLogin(false);
      mockDb.validateInviteToken(tokenParam).then((result) => {
        if (result) {
          setInviteToken(result);
          setInvitedRole(result.role);
          setRole(result.role);
          setTokenError(null);
        } else {
          setTokenError('Este link de convite é inválido ou expirou.');
        }
        setTokenValidating(false);
      });
    } else if (roleParam) {
      // Cadastro sem token não é permitido — redireciona para login
      setTokenError('Cadastro permitido apenas via link de convite válido.');
      setIsLogin(false);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin) {
    }

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, whatsapp, role, cro, inviteTokenId: inviteToken?.id });
      }
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


  const clearInvite = () => {
    const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
    window.history.pushState({ path: newUrl }, '', newUrl);
    setInvitedRole(null);
    setIsLogin(true);
  };

  const renderLogo = (size: "normal" | "large" = "normal") =>
  <div className="flex items-center gap-3 justify-center mb-8 animate-float">
        {config.logoUrl ?
    <img src={config.logoUrl} alt="Logo" className={`${size === "large" ? "h-28" : "h-16"} drop-shadow-[0_0_25px_rgba(255,255,255,0.3)] transition-all duration-500 hover:scale-105`} /> :

    <div className={`${size === "large" ? "w-24 h-24 text-5xl" : "w-16 h-16 text-3xl"} rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl ring-4 ring-white/10 backdrop-blur-xl transition-transform duration-700 hover:rotate-12`} style={{ background: `linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)`, boxShadow: '0 25px 50px -12px color-mix(in srgb, var(--color-gradient-start) 40%, transparent)' }}>
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
    }
     </div>;


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-[-2]" style={{ backgroundColor: 'var(--color-bg)' }}></div>
      <div className="absolute top-0 left-0 w-full h-full z-[-1] overflow-hidden">
          <div className="absolute top-[20%] left-[20%] rounded-full animate-blob" style={{ width: 'var(--env-blob-size)', height: 'var(--env-blob-size)', backgroundColor: 'var(--env-blob1-color)', opacity: 'var(--env-blob-opacity)', filter: 'blur(var(--env-blob-blur))' }}></div>
          <div className="absolute bottom-[20%] right-[20%] rounded-full animate-blob animation-delay-2000" style={{ width: 'var(--env-blob-size)', height: 'var(--env-blob-size)', backgroundColor: 'var(--env-blob2-color)', opacity: 'var(--env-blob-opacity)', filter: 'blur(var(--env-blob-blur))' }}></div>
          <div className="absolute top-[40%] left-[60%] rounded-full animate-blob" style={{ width: 'var(--env-blob-size)', height: 'var(--env-blob-size)', backgroundColor: 'var(--env-blob3-color)', opacity: 'var(--env-blob-opacity)', filter: 'blur(var(--env-blob-blur))', animationDelay: '4s' }}></div>
          <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border rounded-full opacity-20 animate-pulse" style={{ borderColor: 'color-mix(in srgb, var(--env-blob1-color) 10%, transparent)' }}></div>
      </div>

      <div className={`w-full max-w-[480px] backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10 relative overflow-hidden group transition-all duration-500 ${invitedRole ? 'bg-black/80' : ''}`} style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}>

        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50" style={{ backgroundImage: `linear-gradient(to right, transparent, var(--color-accent), transparent)` }}></div>

        {renderLogo()}

        <div className="text-center mb-8 relative z-10">
          {!isLogin && invitedRole ?
          <div className="animate-fade-in">
              <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: 'var(--color-text-main)' }}>
                Cadastro de {invitedRole === 'client' ? 'Clientes' : invitedRole === 'distributor' ? 'Distribuidores' : invitedRole === 'consultant' ? 'Consultores' : invitedRole === 'manager' ? 'Gestores' : 'Administradores'}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Acesse materiais exclusivos e acompanhe as novidades da plataforma {config.appName}.
              </p>
            </div> :

          <>
              <h2 className="text-3xl font-bold mb-3 tracking-tight" style={{ color: 'var(--color-text-main)' }}>{isLogin ? t('auth.login') : t('auth.register')}</h2>
              <p className="text-lg font-medium bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-gradient-start), var(--color-gradient-mid), var(--color-gradient-end), var(--color-gradient-start))' }}>{config.appName}</p>
            </>
          }
        </div>

        <div className="space-y-4 mb-6 relative z-10">
            {tokenValidating && (
              <div className="rounded-xl p-6 text-center animate-fade-in" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
                <Loader2 size={24} className="animate-spin mx-auto mb-2" style={{ color: 'var(--color-accent)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>Validando convite...</p>
              </div>
            )}

            {tokenError && (
              <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl text-center animate-slide-up space-y-4">
                <div className="p-3 bg-red-500/20 rounded-full w-fit mx-auto">
                  <AlertTriangle size={28} className="text-red-500" />
                </div>
                <p className="text-sm font-semibold text-red-400 leading-snug">{tokenError}</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Solicite um novo link de cadastro ao administrador.</p>
                <button
                  onClick={clearInvite}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', border: '1px solid var(--color-border)' }}
                >
                  <ArrowLeft size={16} /> Voltar ao Login
                </button>
              </div>
            )}

            {isDbMissing &&
          <button
            onClick={() => setShowSqlSetup(true)}
            className="w-full bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-left hover:bg-red-500/20 transition-all group/alert hover:scale-[1.02]">

                    <div className="p-2 bg-red-500/20 rounded-lg text-red-500 shrink-0 animate-pulse">
                        <Database size={18} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Banco Incompleto</p>
                        <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>Clique para corrigir e liberar o acesso.</p>
                    </div>
                    <AlertTriangle size={16} className="ml-auto text-red-500/50" />
                </button>
          }

            {error &&
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex flex-col gap-2 animate-slide-up">
                <div className="flex items-start gap-3">
                    <AlertTriangle className="shrink-0 mt-0.5" size={16} />
                    <span className="leading-snug">{error}</span>
                </div>
                {error.includes('Tabelas') &&
            <button onClick={() => setShowSqlSetup(true)} className="text-xs font-bold underline text-left mt-1 hover:text-red-500">
                        Resolver Agora
                    </button>
            }
            </div>
          }
        </div>

        {!tokenError && !tokenValidating && (isLogin || inviteToken) && (
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
          {!isLogin &&
          <div className="group">
              <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 pl-1" style={{ color: 'var(--color-text-muted)' }}>Nome Completo</label>
              <input type="text" required className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:ring-2 outline-none transition-all shadow-inner hover:bg-white/10" style={{ color: 'var(--color-text-main)' }} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          }

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 pl-1" style={{ color: 'var(--color-text-muted)' }}>Email</label>
            <input type="email" required className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:ring-2 outline-none transition-all shadow-inner hover:bg-white/10" style={{ color: 'var(--color-text-main)' }} value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>

          <div className="group">
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 pl-1" style={{ color: 'var(--color-text-muted)' }}>Senha</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                className="w-full p-4 pr-12 rounded-xl border border-white/10 bg-white/5 focus:ring-2 outline-none transition-all shadow-inner hover:bg-white/10"
                style={{ color: 'var(--color-text-main)' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)} />

              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 focus:outline-none transition-colors" style={{ color: 'var(--color-text-muted)' }} tabIndex={-1}>
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {!isLogin &&
          <>
              <div className="group">
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 pl-1" style={{ color: 'var(--color-text-muted)' }}>WhatsApp</label>
                <input type="tel" required className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:ring-2 outline-none transition-all shadow-inner hover:bg-white/10" style={{ color: 'var(--color-text-main)' }} value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 gap-5">
                 {invitedRole &&
              <div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
                      <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)', color: 'var(--color-accent)' }}>
                        <Shield size={16} />
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--color-accent)' }}>Perfil pré-definido</p>
                        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-main)' }}>
                          {invitedRole === 'client' ? 'Cliente' : invitedRole === 'distributor' ? 'Distribuidor' : invitedRole === 'consultant' ? 'Consultor' : invitedRole === 'manager' ? 'Gestor' : 'Administrador'}
                        </p>
                      </div>
                    </div>
              }
                 {(role === 'client') &&
              <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 pl-1" style={{ color: 'var(--color-text-muted)' }}>CRO (Opcional)</label>
                    <input type="text" className="w-full p-4 rounded-xl border border-white/10 bg-white/5 focus:ring-2 outline-none transition-all shadow-inner hover:bg-white/10" style={{ color: 'var(--color-text-main)' }} value={cro} onChange={(e) => setCro(e.target.value)} />
                 </div>
              }
              </div>
            </>
          }

          <button type="submit" className="w-full relative overflow-hidden text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group/btn mt-6 hover:scale-[1.02] active:scale-95" style={{ background: `linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 40%, var(--color-gradient-end) 70%, var(--color-gradient-start) 100%)`, boxShadow: '0 10px 25px -5px color-mix(in srgb, var(--color-gradient-start) 30%, transparent)' }}>
             <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out rounded-xl"></div>
             <span className="relative z-10 flex items-center gap-2 text-zinc-900">
                {!isLogin && invitedRole && <UserPlus size={20} />}
                {isLogin ? 'Entrar na Plataforma' : 'Confirmar Cadastro'}
                <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
             </span>
          </button>
        </form>
        )}


        {showSqlSetup && <SqlSetupModal onClose={() => setShowSqlSetup(false)} />}
    </div>
    </div>);

};