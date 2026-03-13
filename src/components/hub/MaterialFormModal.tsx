import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialType, Role, MaterialAsset } from '../../types';
import { useLanguage } from '../../contexts/LanguageContext';
import { X, Save, FileText, Image as ImageIcon, Video, Check, Users, Shield, Link as LinkIcon, AlertCircle, Star, Headphones, Globe, Upload, Languages, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { TagInput } from './TagInput';
import { supabase } from '@/integrations/supabase/client';
import { colorMix } from '../../lib/utils';
import { toast } from '@/hooks/use-toast';

interface TypeCardProps {
  value: MaterialType;
  icon: any;
  label: string;
  currentType: MaterialType;
  onSelect: (val: MaterialType) => void;
}

const TypeCard = ({ value, icon: Icon, label, currentType, onSelect }: TypeCardProps) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`
      relative flex-1 flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200
      ${currentType === value
        ? 'shadow-sm ring-2'
        : 'hover:opacity-80'}
    `}
    style={{
      backgroundColor: currentType === value ? 'color-mix(in srgb, var(--color-accent) 5%, transparent)' : 'var(--color-surface)',
      color: currentType === value ? 'var(--color-accent)' : 'var(--color-text-muted)',
      ...(currentType === value ? { ringColor: 'var(--color-accent)' } : {})
    }}
  >
    <Icon size={20} className="mb-1" />
    <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
    {currentType === value && (
      <div className="absolute top-1.5 right-1.5" style={{ color: 'var(--color-accent)' }}>
        <Check size={12} />
      </div>
    )}
  </button>
);

const VideoPreview = ({ url }: { url: string }) => {
  if (!url) return null;

  let embedUrl = '';
  const cleanUrl = url.trim();

  const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
     embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`;
  } else if (cleanUrl.includes('drive.google.com')) {
      const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
      if (driveIdMatch && driveIdMatch[1]) {
          embedUrl = `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`;
      }
  } else if (cleanUrl.match(/\.(mp4|webm|ogg)$/i)) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video relative shadow-lg">
             <video src={cleanUrl} controls className="w-full h-full object-contain" />
        </div>
      );
  }

  if (embedUrl) {
      return (
        <div className="mt-3 rounded-xl overflow-hidden bg-black aspect-video relative shadow-lg group">
             <iframe src={embedUrl} className="w-full h-full" allowFullScreen title="Preview" />
             <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-md pointer-events-none">
                Preview
             </div>
        </div>
      );
  }

  return (
    <div className="mt-3 rounded-xl p-3 flex items-center justify-center gap-2 text-sm" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
        <AlertCircle size={16} />
        Não foi possível gerar preview para este link, mas ele será salvo.
    </div>
  );
};

interface MaterialFormModalProps {
  initialData?: Material | null;
  onClose: () => void;
  onSave: (material: any) => Promise<void>;
}

export const MaterialFormModal: React.FC<MaterialFormModalProps> = ({ initialData, onClose, onSave }) => {
  const { t } = useLanguage();
  const languages: Language[] = ['pt-br', 'en-us', 'es-es'];
  const allRoles: Role[] = ['client', 'distributor', 'consultant'];

  const [titles, setTitles] = useState<Partial<Record<Language, string>>>({ 'pt-br': '' });
  const [type, setType] = useState<MaterialType>('pdf');
  const [allowedRoles, setAllowedRoles] = useState<Role[]>(['client']);
  const [active, setActive] = useState(true);
  const [assets, setAssets] = useState<Partial<Record<Language, MaterialAsset>>>({});
  const [activeTab, setActiveTab] = useState<Language>('pt-br');
  const [error, setError] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const defaultPointsByType: Record<MaterialType, number> = { pdf: 150, image: 50, video: 100, audio: 150, html: 100 };
  const [points, setPoints] = useState(defaultPointsByType['pdf']);
  const [htmlInputMode, setHtmlInputMode] = useState<'upload' | 'url'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [translateInput, setTranslateInput] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translations, setTranslations] = useState<Record<string, string> | null>(null);
  const [copiedLang, setCopiedLang] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitles(initialData.title);
      setType(initialData.type);
      setAllowedRoles(initialData.allowedRoles);
      setActive(initialData.active);
      setAssets(initialData.assets);
      setTags(initialData.tags || []);
      setPoints(initialData.points || 0);
    }
  }, [initialData]);

  const handleTitleChange = (lang: Language, value: string) => {
    setTitles(prev => ({ ...prev, [lang]: value }));
  };

  const handleUrlPasteOrChange = (lang: Language, value: string) => {
    let finalValue = value;
    if (value.includes('<iframe') && value.includes('src=')) {
        const srcMatch = value.match(/src=["'](.*?)["']/);
        if (srcMatch && srcMatch[1]) {
            finalValue = srcMatch[1];
        }
    }
    setAssets(prev => {
      const current = prev[lang] || { url: '', status: 'published' as const };
      return { ...prev, [lang]: { ...current, url: finalValue } };
    });
  };

  const handleSubtitleChange = (lang: Language, value: string) => {
    setAssets(prev => {
      const current = prev[lang] || { url: '', status: 'published' as const };
      return { ...prev, [lang]: { ...current, subtitleUrl: value } };
    });
  };

  const toggleRole = (role: Role) => {
    setAllowedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedAssets: Partial<Record<Language, MaterialAsset>> = {};
    const cleanedTitles: Partial<Record<Language, string>> = {};
    let hasAtLeastOneValidVersion = false;

    languages.forEach(lang => {
        const url = assets[lang]?.url?.trim();
        const title = titles[lang]?.trim();
        if (url && title) {
            hasAtLeastOneValidVersion = true;
            cleanedAssets[lang] = { url, subtitleUrl: assets[lang]?.subtitleUrl?.trim(), status: assets[lang]?.status || 'published' };
            cleanedTitles[lang] = title;
        }
    });

    if (!hasAtLeastOneValidVersion) {
        setError('Preencha o Título e a URL para pelo menos um idioma.');
        return;
    }
    if (allowedRoles.length === 0) {
        setError('Selecione pelo menos um perfil de acesso.');
        return;
    }

    const payload = {
      ...(initialData || {}),
      title: cleanedTitles,
      type,
      allowedRoles,
      active,
      assets: cleanedAssets,
      tags,
      points,
    };

    await onSave(payload);
    onClose();
  };

  const hasContent = (lang: Language) => {
    return (titles[lang]?.length || 0) > 0 || (assets[lang]?.url?.length || 0) > 0;
  };

  const getUrlPlaceholder = () => {
    if (type === 'video') return "Cole o link do YouTube, Drive ou MP4 aqui...";
    if (type === 'audio') return t('url.placeholder.audio');
    if (type === 'image') return t('url.placeholder.image');
    if (type === 'html') return "URL da página HTML interativa...";
    return t('url.placeholder.pdf');
  };

  const handleHtmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.match(/\.(html|htm)$/i)) {
      setError('Apenas arquivos .html ou .htm são permitidos.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('O arquivo deve ter no máximo 5MB.');
      return;
    }
    setUploading(true);
    setError(null);
    const filePath = `html/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from('materials').upload(filePath, file, { contentType: 'text/html', upsert: false });
    if (uploadError) {
      setError(`Erro no upload: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filePath);
    handleUrlPasteOrChange(activeTab, publicUrlData.publicUrl);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTranslate = async () => {
    if (!translateInput.trim()) return;
    setTranslating(true);
    setTranslations(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('translate-title', {
        body: { text: translateInput.trim() },
      });
      if (fnError) throw fnError;
      if (data?.translations) {
        setTranslations(data.translations);
      } else if (data?.error) {
        toast({ title: 'Erro na tradução', description: data.error, variant: 'destructive' });
      }
    } catch (err: any) {
      toast({ title: 'Erro na tradução', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setTranslating(false);
    }
  };

  const handleCopyTranslation = (lang: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLang(lang);
    setTimeout(() => setCopiedLang(null), 1500);
  };

  const handleApplyAllTranslations = () => {
    if (!translations) return;
    const langs: Language[] = ['pt-br', 'en-us', 'es-es'];
    langs.forEach(lang => {
      if (translations[lang]) {
        handleTitleChange(lang, translations[lang]);
      }
    });
    toast({ title: 'Títulos aplicados!', description: 'Todos os idiomas foram preenchidos.' });
  };

  return createPortal(
    <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm transition-all animate-fade-in" style={{ zIndex: 9999 }}>
      <div className="rounded-t-2xl sm:rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>

        {/* Header */}
        <div className="px-6 py-4 flex justify-between items-center shrink-0 border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div>
            <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>
              {initialData ? t('edit.material') : t('add.material')}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-full transition-colors hover:opacity-70" style={{ color: 'var(--color-text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
            <div className="px-6 py-2.5 flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
                <AlertCircle size={16} />
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0">
          <div className="p-6 space-y-6">

            {/* Section 1: Type + Status + XP — single row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Type selector */}
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase mb-2 block tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Tipo</label>
                <div className="flex gap-2">
                  {(['pdf', 'image', 'video', 'audio', 'html'] as MaterialType[]).map(t => {
                    const icons = { pdf: FileText, image: ImageIcon, video: Video, audio: Headphones, html: Globe };
                    const labels = { pdf: 'PDF', image: 'IMG', video: 'Video', audio: 'Áudio', html: 'HTML' };
                    return <TypeCard key={t} value={t} icon={icons[t]} label={labels[t]} currentType={type} onSelect={(val) => { setType(val); if (!initialData) setPoints(defaultPointsByType[val]); }} />;
                  })}
                </div>
              </div>

              {/* Status toggle */}
              <div className="sm:w-32">
                <label className="text-[11px] font-bold uppercase mb-2 block tracking-wider" style={{ color: 'var(--color-text-muted)' }}>Status</label>
                <div
                  onClick={() => setActive(!active)}
                  className="cursor-pointer p-3 rounded-xl flex items-center justify-between transition-colors h-[68px]"
                  style={{ backgroundColor: active ? 'var(--color-success-bg)' : 'var(--color-bg)', color: active ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                >
                  <span className="text-sm font-medium">{active ? t('active') : t('inactive')}</span>
                  <div className="w-9 h-5 rounded-full relative transition-colors shrink-0" style={{ backgroundColor: active ? 'var(--color-success)' : 'var(--color-border)' }}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-200 shadow-sm ${active ? 'left-[18px]' : 'left-0.5'}`} />
                  </div>
                </div>
              </div>

              {/* XP Points */}
              <div className="sm:w-28">
                <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  <Star size={12} style={{ color: 'var(--color-warning)' }} /> XP
                </label>
                <input
                  type="number"
                  min={0}
                  max={500}
                  value={points}
                  onChange={e => setPoints(Number(e.target.value))}
                  className="w-full p-3 rounded-xl outline-none transition-all h-[68px] text-center text-lg font-bold"
                  style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }}
                />
              </div>
            </div>

            {/* Section 2: Permissions + Tags — single row */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Permissions */}
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  <Users size={12} /> {t('permissions')}
                </label>
                <div className="flex gap-2">
                  {allRoles.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => toggleRole(role)}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-lg transition-all text-sm"
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

              {/* Tags */}
              <div className="flex-1">
                <label className="text-[11px] font-bold uppercase mb-2 block tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                  Tags
                </label>
                <TagInput tags={tags} onChange={setTags} />
              </div>
            </div>

            {/* AI Translation Helper */}
            <div className="rounded-xl p-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 5%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
              <label className="text-[11px] font-bold uppercase mb-2 flex items-center gap-1.5 tracking-wider" style={{ color: 'var(--color-accent)' }}>
                <Languages size={12} /> Tradutor de Títulos (IA)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Digite o nome do material em qualquer idioma..."
                  className="flex-1 p-2.5 rounded-lg outline-none text-sm focus:ring-2"
                  style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                  value={translateInput}
                  onChange={e => setTranslateInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleTranslate(); } }}
                />
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={translating || !translateInput.trim()}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all disabled:opacity-40 hover:opacity-90"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
                >
                  {translating ? <Loader2 size={14} className="animate-spin" /> : <Languages size={14} />}
                  {translating ? 'Traduzindo...' : 'Traduzir'}
                </button>
              </div>

              {translations && (
                <div className="space-y-1.5 animate-fade-in">
                  {(['pt-br', 'en-us', 'es-es'] as Language[]).map(lang => {
                    const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                    const text = translations[lang] || '';
                    return (
                      <div key={lang} className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                        <span className="text-sm">{flag}</span>
                        <span className="flex-1 text-sm truncate" style={{ color: 'var(--color-text-main)' }}>{text}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyTranslation(lang, text)}
                          className="p-1.5 rounded-md transition-colors hover:opacity-70"
                          style={{ color: copiedLang === lang ? 'var(--color-success)' : 'var(--color-text-muted)' }}
                          title="Copiar"
                        >
                          {copiedLang === lang ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                        </button>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleApplyAllTranslations}
                    className="w-full mt-1 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-success) 15%, transparent)', color: 'var(--color-success)' }}
                  >
                    <CheckCircle2 size={12} /> Aplicar todos nos campos de título
                  </button>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: 'var(--color-border)' }} />

            {/* Section 3: Content by language */}
            <div>
              {/* Language tabs */}
              <div className="flex gap-4 mb-4">
                {languages.map(lang => {
                  const isCompleted = hasContent(lang);
                  const label = lang === 'pt-br' ? 'Português' : lang === 'en-us' ? 'English' : 'Español';
                  const flag = lang === 'pt-br' ? '🇧🇷' : lang === 'en-us' ? '🇺🇸' : '🇪🇸';
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setActiveTab(lang)}
                      className="pb-2 relative font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-1.5 outline-none"
                      style={{ color: activeTab === lang ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
                    >
                      <span className="text-base">{flag}</span> {label}
                      {isCompleted && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-success)' }} title="Conteúdo inserido"></span>}
                      {activeTab === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t-full" style={{ backgroundColor: 'var(--color-accent)' }} />}
                    </button>
                  );
                })}
              </div>

              {/* Language content fields */}
              <div className="space-y-3 animate-fade-in rounded-xl p-4" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 50%, transparent)' }}>
                <label className="block">
                  <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-main)' }}>
                    {t('title')} <span className="text-red-500">*</span>
                  </span>
                  <input
                    type="text"
                    placeholder={`Ex: Catálogo 2024 (${activeTab})`}
                    className="w-full p-3 rounded-lg outline-none transition-all shadow-sm focus:ring-2"
                    style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                    value={titles[activeTab] || ''}
                    onChange={e => handleTitleChange(activeTab, e.target.value)}
                  />
                </label>

                {/* HTML type: toggle between upload and URL */}
                {type === 'html' && (
                  <div className="flex items-center gap-3 mb-1">
                    <button type="button" onClick={() => setHtmlInputMode('upload')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: htmlInputMode === 'upload' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                        color: htmlInputMode === 'upload' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                      <Upload size={12} className="inline mr-1" /> Upload de arquivo
                    </button>
                    <button type="button" onClick={() => setHtmlInputMode('url')}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                      style={{
                        backgroundColor: htmlInputMode === 'url' ? 'color-mix(in srgb, var(--color-accent) 10%, transparent)' : 'transparent',
                        color: htmlInputMode === 'url' ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      }}>
                      <LinkIcon size={12} className="inline mr-1" /> URL externa
                    </button>
                  </div>
                )}

                {type === 'html' && htmlInputMode === 'upload' ? (
                  <div className="block">
                    <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-main)' }}>
                      Arquivo HTML <span className="text-red-500">*</span>
                    </span>
                    <div
                      className="relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:opacity-80"
                      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      <input ref={fileInputRef} type="file" accept=".html,.htm" className="hidden" onChange={handleHtmlFileUpload} onClick={(e) => e.stopPropagation()} />
                      <Upload size={24} className="mx-auto mb-2" style={{ color: 'var(--color-text-muted)' }} />
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>
                        {uploading ? 'Enviando...' : 'Clique para selecionar um arquivo .html'}
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>Máximo 5MB</p>
                      {assets[activeTab]?.url && (
                        <p className="text-xs mt-2 font-mono truncate" style={{ color: 'var(--color-success)' }}>
                          ✓ {assets[activeTab]!.url.split('/').pop()}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                <label className="block">
                  <span className="text-sm font-semibold mb-1 flex items-center justify-between" style={{ color: 'var(--color-text-main)' }}>
                     <span>URL <span className="text-red-500">*</span></span>
                     {type === 'video' && (
                         <span className="text-[10px] font-normal px-2 py-0.5 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                             Aceita Embed Codes e Links
                         </span>
                     )}
                  </span>
                  <div className="relative">
                      <input
                        type="text"
                        placeholder={getUrlPlaceholder()}
                        className="w-full p-3 pl-10 rounded-lg outline-none transition-all font-mono text-sm shadow-sm focus:ring-2"
                        style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                        value={assets[activeTab]?.url || ''}
                        onChange={(e) => handleUrlPasteOrChange(activeTab, e.target.value)}
                      />
                      <LinkIcon className="absolute left-3 top-3 transition-colors" size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                </label>
                )}

                {type === 'video' && assets[activeTab]?.url && (
                    <div className="animate-fade-in">
                        <VideoPreview url={assets[activeTab]!.url!} />
                    </div>
                )}

                {type === 'video' && (
                  <label className="block animate-fade-in">
                    <span className="text-sm font-semibold mb-1 block" style={{ color: 'var(--color-text-main)' }}>
                      {t('asset.subtitle')} <span className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>(Opcional)</span>
                    </span>
                    <input
                      type="text"
                      placeholder="https://exemplo.com/legenda.vtt"
                      className="w-full p-3 rounded-lg outline-none transition-all font-mono text-sm shadow-sm focus:ring-2"
                      style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }}
                      value={assets[activeTab]?.subtitleUrl || ''}
                      onChange={(e) => handleSubtitleChange(activeTab, e.target.value)}
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 flex justify-end gap-3 shrink-0 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium transition-colors" style={{ color: 'var(--color-text-muted)' }}>
            {t('cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg text-white hover:opacity-90 font-medium flex items-center gap-2 shadow-lg transition-transform active:scale-95"
            style={{ backgroundColor: 'var(--color-accent)' }}
          >
            <Save size={18} />
            {t('save')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
