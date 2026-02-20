import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Collection, Language, Role, MaterialType } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, BookOpen, Users, Shield, Check, Star, Image as ImageIcon, AlertCircle } from 'lucide-react';
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
  // Points are auto-calculated from selected materials
  const [activeTab, setActiveTab] = useState<Language>('pt-br');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Material selection
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
      // points are auto-calculated
      // Load existing items
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

      const calculatedPoints = selectedMaterialIds.reduce((sum, id) => {
        const mat = allMaterials.find((m) => m.id === id);
        return sum + (mat?.points || 0);
      }, 0);

      const payload: any = {
        title: cleanedTitles,
        description: Object.keys(cleanedDescs).length > 0 ? cleanedDescs : undefined,
        coverImage: coverImage.trim() || undefined,
        allowedRoles,
        active,
        points: calculatedPoints
      };

      if (initialData) {
        await mockDb.updateCollection({ ...payload, id: initialData.id, createdAt: initialData.createdAt });
        await mockDb.setCollectionItems(initialData.id, selectedMaterialIds);
      } else {
        // Create then get id from DB
        await mockDb.createCollection(payload);
        // Re-fetch to get the id
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
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>

        <div className="px-6 py-4 flex justify-between items-center shrink-0" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div>
            <h3 className="font-bold text-xl" style={{ color: 'var(--color-text-main)' }}>
              {initialData ? 'Editar Trilha' : 'Nova Trilha de Aprendizagem'}
            </h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Configure a trilha e adicione materiais.</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X size={24} /></button>
        </div>

        {error &&
        <div className="bg-red-50 dark:bg-red-900/20 px-6 py-3 flex items-center gap-2 text-sm text-red-600 font-medium">
            <AlertCircle size={16} />{error}
          </div>
        }

        <form onSubmit={handleSubmit} className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
          {/* Left panel */}
          <div className="w-full md:w-1/3 p-6 overflow-y-auto space-y-6" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* Permissions */}
            <div>
              <label className="text-xs font-bold uppercase mb-3 flex items-center gap-2 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <Users size={14} /> Perfis de acesso
              </label>
              <div className="space-y-2">
                {allRoles.map((role) =>
                <button key={role} type="button" onClick={() => toggleRole(role)}
                className="w-full flex items-center justify-between p-3 rounded-lg transition-all text-sm"
                style={{ backgroundColor: 'var(--color-surface)', color: allowedRoles.includes(role) ? 'var(--color-accent)' : 'var(--color-text-muted)', ...(allowedRoles.includes(role) ? { boxShadow: '0 0 0 1px var(--color-accent)' } : {}) }}>
                    <span className="font-medium">{t(`role.${role}`)}</span>
                    {allowedRoles.includes(role) && <Check size={16} />}
                  </button>
                )}
              </div>
            </div>

            {/* XP Points (auto-calculated) */}
            <div>
              <label className="text-xs font-bold uppercase mb-2 flex items-center gap-2 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <Star size={14} className="text-yellow-400" /> XP Total da Trilha
              </label>
              <div className="w-full p-3 rounded-lg text-lg font-bold" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' }}>
                {selectedMaterialIds.reduce((sum, id) => {
                  const mat = allMaterials.find((m) => m.id === id);
                  return sum + (mat?.points || 0);
                }, 0)} XP
              </div>
              <p className="text-[11px] mt-1" style={{ color: 'var(--color-text-muted)' }}>Calculado automaticamente pela soma dos materiais.</p>
            </div>

            {/* Cover image */}
            <div>
              <label className="text-xs font-bold uppercase mb-2 flex items-center gap-2 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <ImageIcon size={14} /> URL da Capa (opcional)
              </label>
              <input
                type="text"
                placeholder="https://..."
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className="w-full p-3 rounded-lg outline-none text-sm font-mono"
                style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }} />

              {coverImage &&
              <img src={coverImage} alt="Preview" className="mt-2 w-full h-24 object-cover rounded-lg" onError={(e) => e.currentTarget.style.display = 'none'} />
              }
            </div>

            {/* Status */}
            <div>
              <label className="text-xs font-bold uppercase mb-2 flex items-center gap-2 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                <Shield size={14} /> Status
              </label>
              <div onClick={() => setActive(!active)} className={`cursor-pointer p-4 rounded-xl flex items-center justify-between transition-colors ${active ? 'bg-green-500/10 text-green-600' : ''}`} style={!active ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' } : {}}>
                <span className="font-medium">{active ? 'Ativa' : 'Inativa'}</span>
                <div className={`w-10 h-6 rounded-full relative transition-colors ${active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'left-5' : 'left-1'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col min-h-0">
            {/* Language tabs */}
            <div className="flex px-6 pt-4 gap-6 overflow-x-auto shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
              {languages.map((lang) => {
                const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                const label = lang === 'pt-br' ? 'Português' : lang === 'en-us' ? 'English' : 'Español';
                return (
                  <button key={lang} type="button" onClick={() => setActiveTab(lang)}
                  className="pb-4 px-1 relative font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 outline-none"
                  style={{ color: activeTab === lang ? 'var(--color-accent)' : 'var(--color-text-muted)' }}>
                    <span>{flag}</span> {label}
                    {activeTab === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
                  </button>);

              })}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 30%, transparent)' }}>
              <label className="block">
                <span className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--color-text-main)' }}>
                  Título {activeTab === 'pt-br' && <span className="text-red-500">*</span>}
                </span>
                <input type="text" placeholder={`Título da trilha (${activeTab})`}
                className="w-full p-3 rounded-lg outline-none" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                value={titles[activeTab] || ''} onChange={(e) => setTitles((prev) => ({ ...prev, [activeTab]: e.target.value }))} />
              </label>

              <label className="block">
                <span className="text-sm font-semibold mb-1.5 block" style={{ color: 'var(--color-text-main)' }}>Descrição</span>
                <textarea rows={3} placeholder="Descrição da trilha..."
                className="w-full p-3 rounded-lg outline-none resize-none text-sm" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                value={descriptions[activeTab] || ''} onChange={(e) => setDescriptions((prev) => ({ ...prev, [activeTab]: e.target.value }))} />
              </label>

              {/* Materials selection */}
              <div>
                <p className="text-sm font-semibold mb-2" style={{ color: 'var(--color-text-main)' }}>
                  Materiais da Trilha <span className="text-xs font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>({selectedMaterialIds.length} selecionados)</span>
                </p>
                <input type="text" placeholder="Buscar material..." value={matSearch} onChange={(e) => setMatSearch(e.target.value)}
                className="w-full p-2 mb-2 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }} />
                <div className="space-y-1 max-h-48 overflow-y-auto px-[24px] py-[24px] my-[8px] mx-[8px]">
                  {filteredMaterials.map((m) => {
                    const title = m.title['pt-br'] || Object.values(m.title)[0] || 'Sem título';
                    const isSelected = selectedMaterialIds.includes(m.id);
                    return (
                      <button key={m.id} type="button" onClick={() => toggleMaterial(m.id)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg text-sm text-left transition-all my-[16px] border-solid border-2"
                      style={{ backgroundColor: isSelected ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'var(--color-surface)', color: isSelected ? 'var(--color-accent)' : 'var(--color-text-main)', ...(isSelected ? { boxShadow: '0 0 0 1px var(--color-accent)' } : {}) }}>
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isSelected ? '' : 'border'}`} style={isSelected ? { backgroundColor: 'var(--color-accent)' } : { borderColor: 'var(--color-border)' }}>
                          {isSelected && <Check size={10} className="text-white" />}
                        </div>
                        <span className="truncate flex-1">{title}</span>
                        <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{m.type}</span>
                      </button>);

                  })}
                </div>
              </div>
            </div>

            <div className="p-4 flex justify-end gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]" style={{ backgroundColor: 'var(--color-surface)' }}>
              <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium" style={{ color: 'var(--color-text-muted)' }}>Cancelar</button>
              <button type="submit" disabled={isSaving}
              className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center gap-2 shadow-lg transition-all disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-accent)' }}>
                <Save size={18} />{isSaving ? 'Salvando...' : 'Salvar Trilha'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};