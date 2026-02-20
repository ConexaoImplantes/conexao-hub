import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialAsset } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save } from 'lucide-react';

interface AssetManagerModalProps {
  material: Material;
  onClose: () => void;
  onSave: (updatedMaterial: Material) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({ material, onClose, onSave }) => {
  const { t, language } = useLanguage();
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];
  const [assets, setAssets] = useState<Partial<Record<Language, MaterialAsset>>>(material.assets);

  const handleChange = (lang: Language, field: keyof MaterialAsset, value: string) => {
    setAssets(prev => {
      const currentLangAsset = prev[lang] || { url: '' };
      return { ...prev, [lang]: { ...currentLangAsset, [field]: value } };
    });
  };

  const handleSave = () => {
    const cleanedAssets: Partial<Record<Language, MaterialAsset>> = {};
    Object.entries(assets).forEach(([key, asset]) => {
      const lang = key as Language;
      const materialAsset = asset as MaterialAsset | undefined;
      if (materialAsset?.url && materialAsset.url.trim() !== '') {
        cleanedAssets[lang] = materialAsset;
      }
    });
    onSave({ ...material, assets: cleanedAssets });
  };

  const displayTitle = material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled';

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border animate-slide-up" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b flex justify-between items-center rounded-t-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>{t('edit.assets.title')} <span style={{ color: 'var(--color-accent)' }}>{displayTitle}</span></h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <p className="text-sm italic mb-4" style={{ color: 'var(--color-text-muted)' }}>{t('empty.url.hint')}</p>

          {languages.map(lang => (
            <div key={lang} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase px-2 py-1 rounded border" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                  {lang}
                </span>
                {material.type === 'video' && <span className="text-xs text-amber-600 font-medium">Video</span>}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{t('asset.url')}</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    className="w-full text-sm p-2 rounded border outline-none focus:ring-2"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
                    value={assets[lang]?.url || ''}
                    onChange={(e) => handleChange(lang, 'url', e.target.value)}
                  />
                </div>
                {material.type === 'video' && (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{t('asset.subtitle')}</label>
                    <input
                      type="text"
                      placeholder="https://... (vtt/srt)"
                      className="w-full text-sm p-2 rounded border outline-none focus:ring-2"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}
                      value={assets[lang]?.subtitleUrl || ''}
                      onChange={(e) => handleChange(lang, 'subtitleUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t rounded-b-xl flex justify-end gap-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <button onClick={onClose} className="px-4 py-2 rounded transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            {t('cancel')}
          </button>
          <button onClick={handleSave} className="px-4 py-2 rounded text-white hover:opacity-90 flex items-center gap-2 shadow-sm" style={{ backgroundColor: 'var(--color-accent)' }}>
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
