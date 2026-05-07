import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, MessageCircle, Send } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const schema = z.object({
  senderName: z.string().trim().min(2, 'Mín. 2 caracteres').max(80, 'Máx. 80 caracteres'),
  recipientName: z.string().trim().min(2, 'Mín. 2 caracteres').max(80, 'Máx. 80 caracteres'),
  recipientPhone: z
    .string()
    .trim()
    .transform((v) => v.replace(/\D/g, ''))
    .refine((v) => v.length >= 10 && v.length <= 15, 'Telefone inválido (use DDI+DDD+número)'),
});

export interface InviteShareData {
  senderName: string;
  recipientName: string;
  recipientPhone: string;
  message: string;
  whatsappUrl: string;
}

interface Props {
  inviteUrl: string;
  onClose: () => void;
  onConfirm: (data: InviteShareData) => Promise<void> | void;
}

const getGreeting = (): string => {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
};

export const InviteShareModal: React.FC<Props> = ({ inviteUrl, onClose, onConfirm }) => {
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ senderName, recipientName, recipientPhone });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || 'Dados inválidos');
      return;
    }
    const data = parsed.data;
    const senderNameV = data.senderName!;
    const recipientNameV = data.recipientName!;
    const recipientPhoneV = data.recipientPhone!;
    const greeting = getGreeting();
    const message = `${greeting} ${recipientNameV}\n\nAqui é o ${senderNameV}\n\nSegue abaixo o link para gerar sua credencial de acesso ao Hub-Conexão.\n\nLink: ${inviteUrl}\n\nQualquer dúvida,\nestou à disposição`;
    const whatsappUrl = `https://wa.me/${recipientPhoneV}?text=${encodeURIComponent(message)}`;

    setLoading(true);
    try {
      await onConfirm({ senderName: senderNameV, recipientName: recipientNameV, recipientPhone: recipientPhoneV, message, whatsappUrl });
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div
        className="rounded-2xl w-full max-w-md shadow-2xl flex flex-col border overflow-hidden animate-slide-up"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}
      >
        <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <MessageCircle size={20} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Gerar link de convite</h3>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Preencha para criar a mensagem do WhatsApp</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={22} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-main)' }}>Nome do remetente</label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-black/20 outline-none focus:ring-2"
              style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-main)' }}>Nome do destinatário</label>
            <input
              type="text"
              required
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-black/20 outline-none focus:ring-2"
              style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--color-text-main)' }}>Celular do destinatário</label>
            <input
              type="tel"
              required
              placeholder="5519988776655"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              className="w-full p-2.5 rounded-lg border bg-black/20 outline-none focus:ring-2 font-mono"
              style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
            />
            <p className="text-[10px] mt-1" style={{ color: 'var(--color-text-muted)' }}>
              Formato: DDI + DDD + número (ex.: 5519988776655)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-transform active:scale-95 disabled:opacity-60"
              style={{ backgroundColor: '#22c55e' }}
            >
              <Send size={16} />
              {loading ? '...' : 'Gerar Link'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
