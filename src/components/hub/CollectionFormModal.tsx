import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Collection, Language, Role } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, Users, Check, Star, Image as ImageIcon, AlertCircle, Search } from 'lucide-react';
import { mockDb } from '../../lib/mockDb';
import { Material } from '../../types';

interface CollectionFormModalProps {
  initialData?: Collection | null;
  onClose: () => void;
  onSave: () => Promise<void>;
}

export const CollectionFormModal: React.FC<CollectionFormModalProps> = ({ initialData, onClose, onSave }) => {
  const { t } = useLanguage();
  const allRoles: Role[] = ['client', 'distributor', 'consultant'];
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];

  const [titles, setTitles] = useState<Partial<Record<Language, string>>>({ 'pt-br': '' });
  const [descriptions, setDescriptions] = useState<Partial<Record<Language, string>>>({});
  const [coverImage, setCoverImage] = useState('');
  const [allowedRoles, setAllowedRoles] = useState<Role[]>(['client']);
  const [active, setActive] = useState(true);
  const [activeTab, setActiveTab] = useState<Language>('pt-br');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [allMaterials, setAllMaterials] = useState<Material[]>([]);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);
  const [matSearch, setMatSearch] = useState('');

  useEffect(() => {
    mockDb.getMaterials('super_admin').then(setAllMaterials);
    if (initialData) {
      setTitles(initialData.title);
      setDescriptions(initialData.description || {});
      setCoverImage(initialData.coverImage || '');
      setAllowedRoles(initialData.allowedRoles);
      setActive(initialData.active);
      mockDb.getCollectionItems(initialData.id).then((items) => {
        setSelectedMaterialIds(items.sort((a, b) => a.orderIndex - b.orderIndex).map((i) => i.materialId));
      });
    }
  }, [initialData]);

  const toggleRole = (role: Role) => {
    setAllowedRoles((prev) => prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]);
  };

  const toggleMaterial = (id: string) => {
    setSelectedMaterialIds((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  const filteredMaterials = allMaterials.filter((m) => {
    const title = m.title['pt-br'] || Object.values(m.title)[0] || '';
    return title.toLowerCase().includes(matSearch.toLowerCase());
  });

  const calculatedXP = selectedMaterialIds.reduce((sum, id) => {
    const mat = allMaterials.find((m) => m.id === id);
    return sum + (mat?.points || 0);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedTitles: Partial<Record<Language, string>> = {};
    languages.forEach((lang) => {
      if (titles[lang]?.trim()) cleanedTitles[lang] = titles[lang]!.trim();
    });

    if (!cleanedTitles['pt-br']) {
      setError('O título em Português é obrigatório.');
      return;
    }
    if (allowedRoles.length === 0) {
      setError('Selecione pelo menos um perfil de acesso.');
      return;
    }

    setIsSaving(true);
    try {
      const cleanedDescs: Partial<Record<Language, string>> = {};
      languages.forEach((lang) => {
        if (descriptions[lang]?.trim()) cleanedDescs[lang] = descriptions[lang]!.trim();
      });

      const payload: any = {
        title: cleanedTitles,
        description: Object.keys(cleanedDescs).length > 0 ? cleanedDescs : undefined,
        coverImage: coverImage.trim() || undefined,
        allowedRoles,
        active,
        points: calculatedXP
      };

      if (initialData) {
        await mockDb.updateCollection({ ...payload, id: initialData.id, createdAt: initialData.createdAt });
        await mockDb.setCollectionItems(initialData.id, selectedMaterialIds);
      } else {
        await mockDb.createCollection(payload);
        const cols = await mockDb.getCollections('super_admin');
        const newCol = cols.find((c) => (c.title as any)['pt-br'] === cleanedTitles['pt-br']);
        if (newCol) await mockDb.setCollectionItems(newCol.id, selectedMaterialIds);
      }

      await onSave();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar coleção.');
    } finally {
      setIsSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>
            {initialData ? 'Editar Trilha' : 'Nova Trilha de Aprendizagem'}
          </h3>
          <button onClick={onClose} className="p-2 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="px-6 py-2.5 flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
            <AlertCircle size={16} />{error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-6">

            {/* Section 1: Status + Permissions + XP — single row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Status toggle */}
              <div className="sm:w-32">
                <label className="text-[11px] font-bold uppercase mb-2 block tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <div
                  onClick={() => setActive(!active)}
                  className="cursor-pointer p-3 rounded-xl flex items-center justify-between transition-colors h-[52px]"
                  style={{ backgroundColor: active ? 'var(--color-success-bg)' : 'var(--color-bg)', color: active ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                >
                  <span className="text-sm font-medium">{active ? 'Ativa' : 'Inativa'}</span>
                  <div className="w-9 h-5 rounded-full relative transition-colors shrink-0" style={{ backgroundColor: active ? 'var(--color-success)' : 'var(--color-border)' }}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>

              {/* Permissions */}
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  <Users size={12} /> Perfis de acesso
                </label>
                <div className="flex gap-2">
                  {allRoles.map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg transition-all text-sm h-[52px]"
                      style={{
                        backgroundColor: allowedRoles.includes(role) ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-bg)',
                        color: allowedRoles.includes(role) ? 'var(--color-accent)' : 'var(--color-text-muted)',
                        ...(allowedRoles.includes(role) ? { boxShadow: '0 0 0 1.5px var(--color-accent)' } : {})
                      }}
                    >
                      {allowedRoles.includes(role) && <Check size={14} />}
                      <span className="font-medium text-xs">{t(`role.${role}`)}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* XP (auto) */}
              <div className="sm:w-28">
                <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  <Star size={12} style={{ color: 'var(--color-warning)' }} /> XP Total
                </label>
                <div className="h-[52px] rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-accent)' }}>
                  {calculatedXP}
                </div>
                <p className="text-[10px] mt-0.5 text-center" style={{ color: 'var(--color-text-muted)' }}>auto</p>
              </div>
            </div>

            {/* Section 2: Cover image */}
            <div>
              <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <ImageIcon size={12} /> Capa (opcional)
              </label>
              <div className="flex gap-3 items-start">
                <input
                  type="text"
                  placeholder="https://..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="flex-1 p-3 rounded-lg outline-none text-sm font-mono focus:ring-2"
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
                />
                {coverImage && (
                  <img src={coverImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg shrink-0" onError={(e) => e.currentTarget.style.display = 'none'} />
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

            {/* Section 3: Content by language */}
            <div>
              <div className="flex gap-4 mb-4">
                {languages.map((lang) => {
                  const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                  const label = lang === 'pt-br' ? 'Português' : lang === 'en-us' ? 'English' : 'Español';
                  return (
                    <button key={lang} type="button" onClick={() => setActiveTab(lang)}
                      className="pb-2 relative font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 outline-none"
                      style={{ color: activeTab === lang ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                      <span className="text-base">{flag}</span> {label}
                      {activeTab === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3 animate-fade-in rounded-xl p-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)' }}>
                <label className="block">
                  <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-main)' }}>
                    Título {activeTab === 'pt-br' && <span className="text-red-500">*</span>}
                  </span>
                  <input type="text" placeholder={`Título da trilha (${activeTab})`}
                    className="w-full p-3 rounded-lg outline-none shadow-sm focus:ring-2" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                    value={titles[activeTab] || ''} onChange={(e) => setTitles((prev) => ({ ...prev, [activeTab]: e.target.value }))} />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-main)' }}>Descrição</span>
                  <textarea rows={2} placeholder="Descrição da trilha..."
                    className="w-full p-3 rounded-lg outline-none resize-none text-sm shadow-sm focus:ring-2" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                    value={descriptions[activeTab] || ''} onChange={(e) => setDescriptions((prev) => ({ ...prev, [activeTab]: e.target.value }))} />
                </label>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

            {/* Section 4: Material selection */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-main)' }}>
                  Materiais da Trilha
                </p>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                  {selectedMaterialIds.length} selecionados
                </span>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-2.5" size={16} style={{ color: 'var(--color-text-muted)' }} />
                <input type="text" placeholder="Buscar material..." value={matSearch} onChange={(e) => setMatSearch(e.target.value)}
                  className="w-full pl-9 pr-4 p-2.5 rounded-lg text-sm outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }} />
              </div>

              <div className="space-y-1.5 max-h-52 overflow-y-auto rounded-xl p-2" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)' }}>
                {filteredMaterials.map((m) => {
                  const title = m.title['pt-br'] || Object.values(m.title)[0] || 'Sem título';
                  const isSelected = selectedMaterialIds.includes(m.id);
                  return (
                    <button key={m.id} type="button" onClick={() => toggleMaterial(m.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-left transition-all"
                      style={{
                        backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 8%, transparent)' : 'var(--color-surface)',
                        color: isSelected ? 'var(--color-accent)' : 'var(--color-text-main)',
                        ...(isSelected ? { boxShadow: '0 0 0 1.5px var(--color-accent)' } : {})
                      }}>
                      <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isSelected ? '' : 'border'}`} style={isSelected ? { backgroundColor: 'var(--color-accent)' } : { borderColor: 'var(--color-border)' }}>
                        {isSelected && <Check size={10} className="text-white" />}
                      </div>
                      <span className="truncate flex-1">{title}</span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{m.type}</span>
                        {m.points > 0 && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                            <Star size={8} /> {m.points}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
                {filteredMaterials.length === 0 && (
                  <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Nenhum material encontrado.</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 shrink-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium transition-colors" style={{ color: 'var(--color-text-muted)' }}>Cancelar</button>
          <button onClick={handleSubmit} disabled={isSaving}
            className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            <Save size={18} />{isSaving ? 'Salvando...' : 'Salvar Trilha'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
