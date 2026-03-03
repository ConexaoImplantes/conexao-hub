import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useBrand } from '../../contexts/BrandContext';
import { supabase } from '@/integrations/supabase/client';
import { Clock, XCircle, CheckCircle, LogIn, MessageCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const RegistrationProgress: React.FC = () => {
  const { user, logout } = useAuth();
  const { config } = useBrand();
  const [status, setStatus] = useState(user?.status || 'pending');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [celebrated, setCelebrated] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch initial rejection_reason
    const fetchReason = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('status, rejection_reason')
        .eq('id', user.id)
        .single();
      if (data) {
        setStatus(data.status);
        setRejectionReason(data.rejection_reason);
      }
    };
    fetchReason();

    // Subscribe to realtime changes
    const channel = supabase
      .channel(`profile-status-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newData = payload.new as any;
          setStatus(newData.status);
          setRejectionReason(newData.rejection_reason || null);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  useEffect(() => {
    if (status === 'active' && !celebrated) {
      setCelebrated(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: [getComputedStyle(document.documentElement).getPropertyValue('--color-gradient-start').trim() || '#c9a655', getComputedStyle(document.documentElement).getPropertyValue('--color-gradient-mid').trim() || '#e8d48b', getComputedStyle(document.documentElement).getPropertyValue('--color-gradient-end').trim() || '#a8873a'],
      });
    }
  }, [status, celebrated]);

  const handleLogin = async () => {
    await logout();
  };

  if (!user) return null;

  return (
    <div className="flex items-center justify-center min-h-screen p-4 relative overflow-hidden">
      <div className="absolute inset-0 z-[-2]" style={{ backgroundColor: 'var(--color-bg)' }} />
      <div className="absolute top-0 left-0 w-full h-full z-[-1] overflow-hidden">
        <div className="absolute top-[20%] left-[20%] w-96 h-96 rounded-full blur-[100px] animate-blob" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 20%, transparent)' }} />
        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 rounded-full blur-[100px] animate-blob animation-delay-2000" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }} />
      </div>

      <div className="w-full max-w-md backdrop-blur-2xl p-8 md:p-10 rounded-[2.5rem] shadow-2xl border border-white/10" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 40%, transparent)' }}>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent to-transparent opacity-50" style={{ backgroundImage: 'linear-gradient(to right, transparent, var(--color-accent), transparent)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt="Logo" className="h-16 drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]" />
          ) : (
            <div className="w-16 h-16 text-3xl rounded-2xl flex items-center justify-center text-white font-bold shadow-2xl ring-4 ring-white/10" style={{ background: 'linear-gradient(135deg, #c9a655 0%, #e8d48b 40%, #a8873a 70%, #c9a655 100%)' }}>
              {config.appName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* PENDING */}
        {status === 'pending' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
              <Clock size={36} style={{ color: 'var(--color-accent)' }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Cadastro em Análise</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Seu cadastro foi recebido com sucesso! Um administrador irá analisar e aprovar sua conta em breve.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--color-accent)' }} />
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Atualização automática — esta página será atualizada quando houver uma resposta.</p>
            </div>
          </div>
        )}

        {/* REJECTED */}
        {status === 'rejected' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-red-500/10">
              <XCircle size={36} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Cadastro Recusado</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Infelizmente seu cadastro não foi aprovado.
              </p>
            </div>
            {rejectionReason && (
              <div className="p-4 rounded-xl text-left bg-red-500/5 border border-red-500/15">
                <p className="text-xs font-bold uppercase mb-1 text-red-500">Motivo da recusa</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-main)' }}>{rejectionReason}</p>
              </div>
            )}
            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 text-sm transition-all hover:opacity-80"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}
            >
              <LogIn size={18} /> Voltar ao Login
            </button>
          </div>
        )}

        {/* ACTIVE */}
        {status === 'active' && (
          <div className="text-center space-y-6 animate-fade-in">
            <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center bg-green-500/10">
              <CheckCircle size={36} className="text-green-500" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>Cadastro Aprovado!</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                Parabéns! Sua conta foi aprovada. Clique no botão abaixo para acessar a plataforma.
              </p>
            </div>
            <button
              onClick={handleLogin}
              className="w-full py-4 rounded-xl text-white font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #c9a655 0%, #e8d48b 40%, #a8873a 70%, #c9a655 100%)' }}
            >
              <span className="text-zinc-900 flex items-center gap-2">
                <LogIn size={20} /> Fazer Login
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
