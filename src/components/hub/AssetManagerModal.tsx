import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialAsset } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, Upload, Link as LinkIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { colorMix } from '../../lib/utils';

interface AssetManagerModalProps {
  material: Material;
  onClose: () => void;
  onSave: (updatedMaterial: Material) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({ material, onClose, onSave }) => {
  const { t, language } = useLanguage();
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];
  const [assets, setAssets] = useState<Partial<Record<Language, MaterialAsset>>>(material.assets);
  const [htmlInputMode, setHtmlInputMode] = useState<Record<Language, 'upload' | 'url'>>({ 'pt-br': 'upload', 'en-us': 'upload', 'es-es': 'upload' });
  const [uploading, setUploading] = useState<Partial<Record<Language, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  const fileRefs = useRef<Partial<Record<Language, HTMLInputElement | null>>>({});

  const handleChange = (lang: Language, field: keyof MaterialAsset, value: string) => {
    setAssets(prev => {
      const currentLangAsset = prev[lang] || { url: '' };
      return { ...prev, [lang]: { ...currentLangAsset, [field]: value } };
    });
  };

  const handleHtmlUpload = async (lang: Language, file: File) => {
    if (!file.name.match(/\.(html|htm)$/i)) {
      setError('Apenas arquivos .html ou .htm são permitidos.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5MB.');
      return;
    }
    setUploading(prev => ({ ...prev, [lang]: true }));
    setError(null);
    const filePath = `html/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('materials').upload(filePath, file, { contentType: 'text/html', upsert: false });
    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`);
      setUploading(prev => ({ ...prev, [lang]: false }));
      return;
    }
    const { data } = supabase.storage.from('materials').getPublicUrl(filePath);
    handleChange(lang, 'url', data.publicUrl);
    setUploading(prev => ({ ...prev, [lang]: false }));
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
  const isHtml = material.type === 'html';

  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] border animate-slide-up" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="p-4 border-b flex justify-between items-center rounded-t-xl" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
          <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>{t('edit.assets.title')} <span style={{ color: 'var(--color-accent)' }}>{displayTitle}</span></h3>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="px-4 py-2 text-sm font-medium" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 space-y-6" style={{ backgroundColor: 'var(--color-surface)' }}>
          <p className="text-sm italic mb-4" style={{ color: 'var(--color-text-muted)' }}>{t('empty.url.hint')}</p>

          {languages.map(lang => (
            <div key={lang} className="p-4 rounded-lg border" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase px-2 py-1 rounded border" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)', borderColor: 'var(--color-border)' }}>
                  {lang}
                </span>
                {material.type === 'video' && <span className="text-xs text-amber-600 font-medium">Video</span>}
                {isHtml && <span className="text-xs font-medium" style={{ color: 'var(--color-accent)' }}>HTML</span>}
              </div>
              <div className="space-y-3">
                {isHtml && (
                  <div className="flex items-center gap-2 mb-1">
                    <button type="button" onClick={() => setHtmlInputMode(prev => ({ ...prev, [lang]: 'upload' }))}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: htmlInputMode[lang] === 'upload' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                        color: htmlInputMode[lang] === 'upload' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                      <Upload size={12} className="inline mr-1" /> Upload
                    </button>
                    <button type="button" onClick={() => setHtmlInputMode(prev => ({ ...prev, [lang]: 'url' }))}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: htmlInputMode[lang] === 'url' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                        color: htmlInputMode[lang] === 'url' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                      <LinkIcon size={12} className="inline mr-1" /> URL
                    </button>
                  </div>
                )}

                {isHtml && htmlInputMode[lang] === 'upload' ? (
                  <div>
                    <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Arquivo HTML</label>
                    <div
                      className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors hover:opacity-80"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
                      onClick={() => fileRefs.current[lang]?.click()}
                    >
                      <input
                        ref={el => { fileRefs.current[lang] = el; }}
                        type="file"
                        accept=".html,.htm"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) handleHtmlUpload(lang, f);
                        }}
                      />
                      <Upload size={20} className="mx-auto mb-1" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-xs" style={{ color: 'var(--color-text-main)' }}>
                        {uploading[lang] ? 'Enviando...' : 'Clique para selecionar .html'}
                      </p>
                      {assets[lang]?.url && (
                        <p className="text-xs mt-1 font-mono truncate" style={{ color: 'var(--color-success)' }}>
                          ✓ {assets[lang]!.url.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
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
                )}

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
