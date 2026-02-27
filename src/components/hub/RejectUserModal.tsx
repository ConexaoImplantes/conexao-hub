import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

interface RejectUserModalProps {
  userName: string;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
}

export const RejectUserModal: React.FC<RejectUserModalProps> = ({ userName, onClose, onConfirm }) => {
  const { t } = useLanguage();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);
    try {
      await onConfirm(reason.trim());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>
        
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertTriangle size={18} className="text-red-500" />
            </div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>Recusar Cadastro</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{userName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'var(--color-text-main)' }}>
              Motivo da Recusa *
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explique o motivo da recusa para o usuário..."
              className="w-full p-3 rounded-xl text-sm outline-none focus:ring-2 resize-none"
              style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
            />
            <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Este motivo será exibido ao usuário na tela de progresso do cadastro.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg font-medium text-sm"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!reason.trim() || loading}
              className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50"
            >
              {loading ? 'Recusando...' : 'Confirmar Recusa'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
