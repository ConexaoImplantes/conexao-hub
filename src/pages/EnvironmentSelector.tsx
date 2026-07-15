import React from 'react';
import { Shield, Briefcase, User as UserIcon, LogOut } from 'lucide-react';
import { ENVIRONMENTS, EnvironmentId } from '../lib/environments';
import { colorMix } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  eligible: EnvironmentId[];
  onSelect: (env: EnvironmentId) => void;
}

const iconMap = {
  shield: Shield,
  briefcase: Briefcase,
  user: UserIcon,
};

export const EnvironmentSelector: React.FC<Props> = ({ eligible, onSelect }) => {
  const { user, logout } = useAuth();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8 sm:mb-12">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4"
            style={{
              backgroundColor: colorMix('var(--color-accent)', 12, 'rgba(201,166,85,0.12)'),
              color: 'var(--color-accent)',
              border: `1px solid ${colorMix('var(--color-accent)', 25, 'rgba(201,166,85,0.25)')}`,
            }}
          >
            Olá, {user?.name?.split(' ')[0]}
          </div>
          <h1 className="text-2xl sm:text-4xl font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>
            Selecione o ambiente de acesso
          </h1>
          <p className="text-sm sm:text-base" style={{ color: 'var(--color-text-muted)' }}>
            Suas permissões liberam acesso a mais de um ambiente. Escolha em qual deseja entrar.
          </p>
        </div>

        <div
          className={`grid gap-4 sm:gap-6 ${
            eligible.length === 1
              ? 'grid-cols-1 max-w-md mx-auto'
              : eligible.length === 2
              ? 'grid-cols-1 sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {eligible.map((envId) => {
            const env = ENVIRONMENTS[envId];
            const Icon = iconMap[env.icon];
            return (
              <button
                key={envId}
                onClick={() => onSelect(envId)}
                className="group text-left p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: colorMix('var(--color-surface)', 90, 'rgba(30,41,59,0.9)'),
                  border: `1px solid ${colorMix('var(--color-border)', 60, 'rgba(255,255,255,0.1)')}`,
                  boxShadow: `0 4px 20px var(--color-shadow, rgba(0,0,0,0.3))`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-accent)';
                  e.currentTarget.style.boxShadow = `0 8px 30px ${colorMix(
                    'var(--color-accent)',
                    20,
                    'rgba(201,166,85,0.2)'
                  )}`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = colorMix(
                    'var(--color-border)',
                    60,
                    'rgba(255,255,255,0.1)'
                  );
                  e.currentTarget.style.boxShadow = `0 4px 20px var(--color-shadow, rgba(0,0,0,0.3))`;
                }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, var(--color-gradient-start) 0%, var(--color-gradient-mid) 50%, var(--color-gradient-end) 100%)`,
                    color: 'var(--color-accent-fg)',
                  }}
                >
                  <Icon size={26} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--color-text-main)' }}>
                  {env.label}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  {env.description}
                </p>
                <div
                  className="mt-4 text-xs font-semibold uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--color-accent)' }}
                >
                  Entrar →
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={logout}
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--color-error)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--color-text-muted)';
            }}
          >
            <LogOut size={14} />
            Sair
          </button>
        </div>
      </div>
    </div>
  );
};
