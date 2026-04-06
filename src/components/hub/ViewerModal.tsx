import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Material, Language, MaterialType } from '../../types';
import { X, ExternalLink, RefreshCw, Youtube, Headphones, Globe } from 'lucide-react';
import { colorMix } from '../../lib/utils';

interface ViewerModalProps {
  material: Material | null;
  language: Language;
  onClose: () => void;
}

const getEmbedConfig = (url: string) => {
  if (!url) return { isEmbed: false, url: '', provider: '', originalUrl: '', embedUrl: '', nativeUrl: '' };
  const cleanUrl = url.trim();
  const youtubeMatch = cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    return { isEmbed: true, provider: 'YouTube', originalUrl: cleanUrl, embedUrl: `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&rel=0&modestbranding=1`, nativeUrl: '' };
  }
  const driveIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || cleanUrl.match(/id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    const id = driveIdMatch[1];
    return { isEmbed: true, provider: 'Google Drive', originalUrl: cleanUrl, embedUrl: `https://drive.google.com/file/d/${id}/preview`, nativeUrl: `https://drive.google.com/uc?export=download&id=${id}` };
  }
  return { isEmbed: false, provider: 'Direct', originalUrl: cleanUrl, embedUrl: cleanUrl, nativeUrl: cleanUrl };
};

const getResolvedUrl = (url: string, type: MaterialType): string => {
  const driveMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
  if (!driveMatch?.[1]) return url;
  const id = driveMatch[1];
  if (type === 'image') return `https://lh3.googleusercontent.com/d/${id}=s2000`;
  if (type === 'pdf') return `https://drive.google.com/file/d/${id}/preview`;
  return url;
};

export const ViewerModal: React.FC<ViewerModalProps> = ({ material, language, onClose }) => {
  const [_forceNativeDrive] = useState(false); // kept for hook order stability
  const [htmlContent, setHtmlContent] = useState<string | null>(null);

  useEffect(() => {
    if (material?.type === 'html') {
      const url = material.assets[language]?.url;
      if (url) {
        fetch(url).
        then((res) => res.text()).
        then((text) => setHtmlContent(text)).
        catch(() => setHtmlContent(null));
      }
    }
  }, [material?.type, material?.assets, language]);

  const asset = material?.assets[language] ?? null;
  const displayTitle = material ? material.title[language] || material.title['pt-br'] || Object.values(material.title)[0] || 'Untitled' : '';
  const embedConfig = useMemo(() => getEmbedConfig(asset?.url || ''), [asset?.url]);
  const resolvedUrl = useMemo(() => getResolvedUrl(asset?.url || '', material?.type || 'pdf'), [asset?.url, material?.type]);

  if (!material || !asset) return null;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black flex flex-col animate-fade-in select-none"
      style={{ zIndex: 9999 }}
      onContextMenu={handleContextMenu}>

      <div className="absolute top-0 left-0 right-0 p-3 sm:p-4 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/50 to-transparent z-50 pointer-events-none">
        <div className="pointer-events-auto flex flex-col gap-2 max-w-[70%] sm:max-w-[80%]">
          <h3 className="font-bold text-lg text-white drop-shadow-md leading-tight line-clamp-2">{displayTitle}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-black bg-white px-2 py-0.5 rounded shadow uppercase">{language}</span>
            {embedConfig.provider === 'YouTube' &&
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded backdrop-blur-md uppercase font-bold border border-red-500/30 shadow-lg flex items-center gap-1">
                    <Youtube size={12} fill="currentColor" /> YouTube
                </span>
            }
            {embedConfig.provider === 'Google Drive' &&
            <>
                










                







               </>
            }
          </div>
        </div>
        <button
          onClick={onClose}
          className="pointer-events-auto p-2 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-sm transition-colors border border-white/10 shrink-0 ml-4">

          <X size={24} />
        </button>
      </div>

      <div className="flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden relative">
        {(() => {
          if (material.type === 'html') {
            return (
              <div className="w-full h-full pt-16 sm:pt-20 pb-4 px-2 sm:px-4">
                {htmlContent ?
                <iframe
                  srcDoc={htmlContent}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full rounded-lg bg-white shadow-2xl"
                  title="Interactive Page"
                  style={{ border: 'none' }} /> :


                <iframe
                  src={asset.url}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="w-full h-full rounded-lg bg-white shadow-2xl"
                  title="Interactive Page"
                  style={{ border: 'none' }} />

                }
              </div>);

          }
          if (material.type === 'audio') {
            if (embedConfig.provider === 'Google Drive') {
              return (
                <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-8 gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                    <div className="relative w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Headphones size={64} className="text-purple-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-white text-center">{displayTitle}</h3>
                  <iframe
                    src={embedConfig.embedUrl}
                    className="w-full max-w-lg h-20 rounded-lg"
                    title="Audio Player"
                    allow="autoplay; encrypted-media"
                    sandbox="allow-scripts allow-same-origin allow-popups"
                    style={{ border: 'none' }} />
                  
                </div>);

            }
            return (
              <div className="w-full h-full flex flex-col items-center justify-center max-w-2xl mx-auto p-8 gap-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 blur-3xl rounded-full"></div>
                  <div className="relative w-32 h-32 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
                    
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white text-center">{displayTitle}</h3>
                <audio
                  controls
                  controlsList="nodownload"
                  className="w-full max-w-lg"
                  autoPlay
                  preload="metadata">
                  
                  <source src={asset.url} />
                  <p className="text-white text-center">Seu navegador não suporta o player de áudio.</p>
                </audio>
              </div>);

          }
          if (material.type === 'image') {
            return (
              <div className="relative w-full h-full flex items-center justify-center p-4">
                        <img src={resolvedUrl} alt={displayTitle} className="max-w-full max-h-full object-contain shadow-2xl pointer-events-none" draggable="false" />
                    </div>);

          }
          if (material.type === 'pdf') {
            return (
              <div className="w-full h-full max-w-6xl mx-auto pt-16 sm:pt-20 pb-4 px-2 sm:px-4">
                <iframe src={`${resolvedUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="w-full h-full rounded-lg bg-white shadow-2xl" title="PDF Viewer" />
              </div>);
          }
          // --- VIDEO HANDLING ---
          if (material.type === 'video' || embedConfig.provider === 'YouTube' || embedConfig.provider === 'Google Drive') {
            // YouTube: always use YouTube embed
            if (embedConfig.provider === 'YouTube') {
              return (
                <div className="w-full h-full flex items-center justify-center max-w-screen-2xl mx-auto p-0 md:p-8 aspect-video">
                  <iframe src={embedConfig.embedUrl} className="w-full h-full rounded-lg shadow-2xl bg-black" title="YouTube Video Player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen frameBorder="0" />
                </div>);
            }
            // Google Drive: ALWAYS use iframe preview (never <video> tag — Drive URLs trigger download)
            if (embedConfig.provider === 'Google Drive') {
              return (
                <div className="w-full h-full flex flex-col items-center justify-center relative pt-16 sm:pt-20">
                  <div className="absolute text-sm text-center px-4 animate-pulse z-0" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Carregando vídeo...
                  </div>
                  <iframe
                    key={embedConfig.embedUrl}
                    src={embedConfig.embedUrl}
                    className="w-full h-full border-none bg-transparent relative z-10"
                    title="Google Drive Video Player"
                    allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                    sandbox="allow-forms allow-presentation allow-same-origin allow-scripts allow-popups"
                    referrerPolicy="no-referrer"
                    allowFullScreen
                  />
                </div>);
            }
            // Direct URL: use native <video> tag
            return (
              <div className="w-full h-full flex items-center justify-center max-w-7xl mx-auto p-0 md:p-8 pt-16 sm:pt-20">
                <video
                  key={asset.url}
                  controls
                  controlsList="nodownload noremoteplayback"
                  disablePictureInPicture
                  className="w-full max-h-full aspect-video shadow-2xl rounded-lg bg-black outline-none"
                  autoPlay
                  playsInline
                  preload="metadata"
                >
                  <source src={asset.url} />
                  {asset.subtitleUrl && <track kind="subtitles" src={asset.subtitleUrl} label={language} default />}
                </video>
              </div>);
          }
          // Fallback for any unknown type
          return (
            <div className="w-full h-full flex items-center justify-center p-8">
              <p className="text-white text-center">Tipo de material não suportado.</p>
            </div>);

        })()}
      </div>
    </div>,
    document.body
  );
};