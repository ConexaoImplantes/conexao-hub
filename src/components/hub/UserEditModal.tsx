import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { UserProfile, Role, UserStatus, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, User } from 'lucide-react';
import { colorMix } from '../../lib/utils';

interface UserEditModalProps {
  user: UserProfile;
  onClose: () => void;
  onSave: (updatedUser: UserProfile) => Promise<void>;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({ user, onClose, onSave }) => {
  const { t } = useLanguage();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [whatsapp, setWhatsapp] = useState(user.whatsapp);
  const [cro, setCro] = useState(user.cro || '');
  const [role, setRole] = useState<Role>(user.role);
  const [status, setStatus] = useState<UserStatus>(user.status);
  const [allowedTypes, setAllowedTypes] = useState<MaterialType[]>(user.allowedTypes || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...user,
      name, email, whatsapp,
      cro: cro || undefined,
      role, status,
      allowedTypes: allowedTypes.length > 0 ? allowedTypes : undefined
    });
    onClose();
  };

  const toggleType = (type: MaterialType) => {
    setAllowedTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>

        <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                <User style={{ color: 'var(--color-accent)' }} size={20} />
                {t('user.edit')}
            </h3>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gerencie dados pessoais, status e permissões.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: 'var(--color-text-main)' }}>Status</label>
                    <select
                        value={status}
                        onChange={e => setStatus(e.target.value as UserStatus)}
                        className="w-full p-2.5 rounded-lg outline-none font-medium"
                        style={{
                          backgroundColor: status === 'active' ? 'var(--color-success-bg)' :
                            status === 'pending' ? 'var(--color-warning-bg)' :
                            status === 'rejected' ? 'var(--color-error-bg)' : 'var(--color-bg)',
                          color: status === 'active' ? 'var(--color-success)' :
                            status === 'pending' ? 'var(--color-warning)' :
                            status === 'rejected' ? 'var(--color-error)' : 'var(--color-text-muted)',
                        }}
                    >
                        <option value="active">{t('user.status.active')}</option>
                        <option value="pending">{t('user.status.pending')}</option>
                        <option value="inactive">{t('user.status.inactive')}</option>
                        <option value="rejected">{t('user.status.rejected')}</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-semibold mb-1.5 uppercase" style={{ color: 'var(--color-text-main)' }}>Perfil</label>
                    <select
                        value={role}
                        onChange={e => setRole(e.target.value as Role)}
                        className="w-full p-2.5 rounded-lg outline-none"
                        style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
                    >
                        <option value="client">{t('role.client')}</option>
                        <option value="distributor">{t('role.distributor')}</option>
                        <option value="consultant">{t('role.consultant')}</option>
                        <option value="super_admin">{t('role.super_admin')}</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Nome Completo</label>
                        <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full p-2.5 rounded-lg outline-none focus:ring-2" style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg)' }} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>CRO (Opcional)</label>
                        <input type="text" value={cro} onChange={e => setCro(e.target.value)} className="w-full p-2.5 rounded-lg outline-none focus:ring-2" style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg)' }} />
                    </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>E-mail</label>
                        <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2.5 rounded-lg outline-none focus:ring-2" style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg)' }} />
                    </div>
                    <div>
                        <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>WhatsApp</label>
                        <input type="tel" required value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full p-2.5 rounded-lg outline-none focus:ring-2" style={{ color: 'var(--color-text-main)', backgroundColor: 'var(--color-bg)' }} />
                    </div>
                </div>
            </div>

            {status === 'rejected' && user.rejectionReason && (
              <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-error)' }}>Motivo da Recusa</label>
                <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--color-error-bg)', border: '1px solid color-mix(in srgb, var(--color-error) 10%, transparent)' }}>
                  <p className="text-sm" style={{ color: 'var(--color-text-main)' }}>{user.rejectionReason}</p>
                </div>
              </div>
            )}

            <div className="pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                <label className="block text-xs font-bold mb-2 uppercase tracking-wide" style={{ color: 'var(--color-text-main)' }}>{t('user.access.types')}</label>
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{t('user.access.hint')}</p>
                <div className="flex gap-4">
                    {(['pdf', 'image', 'video'] as MaterialType[]).map(type => (
                        <button
                            key={type}
                            type="button"
                            onClick={() => toggleType(type)}
                            className="flex-1 p-3 rounded-lg flex flex-col items-center gap-2 transition-all"
                            style={{
                              backgroundColor: allowedTypes.includes(type) ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'var(--color-bg)',
                              color: allowedTypes.includes(type) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                              opacity: allowedTypes.includes(type) ? 1 : 0.6,
                            }}
                        >
                            {type === 'pdf' && <FileText size={20} />}
                            {type === 'image' && <ImageIcon size={20} />}
                            {type === 'video' && <Video size={20} />}
                            <span className="text-xs font-bold uppercase">{t(`material.type.${type}`)}</span>
                        </button>
                    ))}
                </div>
            </div>
        </form>

        <div className="p-4 flex justify-end gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" style={{ backgroundColor: 'var(--color-bg)' }}>
          <button onClick={onClose} type="button" className="px-5 py-2.5 rounded-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('cancel')}</button>
          <button onClick={handleSubmit} className="px-6 py-2.5 rounded-lg text-white hover:opacity-90 font-medium flex items-center gap-2 shadow-lg" style={{ backgroundColor: 'var(--color-accent)' }}>
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
