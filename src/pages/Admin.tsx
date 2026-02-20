import React, { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { mockDb, GamificationLevel, CollectionProgress } from '../lib/mockDb';
import { Material, Language, ColorScheme, UserProfile, Role, UserStatus, MaterialType, AccessLog, Collection } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useBrand } from '../contexts/BrandContext';
import { Plus, Trash2, Edit, Eye, EyeOff, Settings, Palette, Type, Image as ImageIcon, Save, Monitor, Moon, Sun, Users, Share2, CheckCircle, XCircle, Ban, MessageCircle, Copy, Link as LinkIcon, Webhook, ChevronRight, ChevronUp, ChevronDown, Search, Filter, FileText, Video, ExternalLink, AlertCircle, Check, X, BarChart2, TrendingUp, Calendar, Clock, Trophy, User, Briefcase, Sparkles, BookOpen, PlusCircle, Layers, Star, Target, Award } from 'lucide-react';
import { MaterialFormModal } from '../components/hub/MaterialFormModal';
import { ViewerModal } from '../components/hub/ViewerModal';
import { UserCommunicationModal } from '../components/hub/UserCommunicationModal';
import { UserEditModal } from '../components/hub/UserEditModal';
import { ConfirmModal } from '../components/hub/ConfirmModal';
import { CollectionFormModal } from '../components/hub/CollectionFormModal';
import { SkeletonTable } from '../components/hub/SkeletonTable';
import { AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';


const ColorInput = ({ label, value, onChange, hint }: {label: string;value: string;onChange: (val: string) => void;hint: string;}) =>
<div className="space-y-1.5">
    <label className="block text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
    <div className="flex items-center gap-2">
      <div className="relative h-9 w-9 shrink-0">
        <div className="absolute inset-0 rounded-lg shadow-sm border" style={{ backgroundColor: value || '#000000', borderColor: 'var(--color-border)' }} />
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
      </div>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm font-mono uppercase focus:ring-2 outline-none" style={{ color: 'var(--color-text-main)' }} />
    </div>
    <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{hint}</p>
  </div>;


const ThemeEditorSection = ({ title, children }: {title: string;children?: React.ReactNode;}) =>
<div className="space-y-3 mb-6">
      <h4 className="text-xs font-bold uppercase tracking-wider pb-2" style={{ color: 'var(--color-text-muted)' }}>{title}</h4>
      <div className="grid grid-cols-2 gap-4">{children}</div>
  </div>;


const LivePreview = ({ themeName, scheme }: {themeName: string;scheme: ColorScheme;}) =>
<div className="rounded-xl overflow-hidden shadow-lg relative transition-all duration-300" style={{ backgroundColor: scheme.background }}>
    <div className="absolute top-2 right-2 px-2 py-1 rounded bg-black/20 text-white text-[10px] font-bold uppercase backdrop-blur-sm z-10">Preview {themeName}</div>
    <div className="p-3 flex items-center justify-between shadow-sm" style={{ backgroundColor: scheme.surface }}>
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] text-white font-bold" style={{ backgroundColor: scheme.accent }}>A</div>
        <div className="h-2 w-16 rounded opacity-80" style={{ backgroundColor: scheme.textMain }}></div>
      </div>
    </div>
    <div className="p-4 space-y-3">
       <div className="flex gap-2 mb-2">
           <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.success, backgroundColor: scheme.success + '20' }}>Ativo</div>
           <div className="h-4 px-2 rounded-full text-[10px] flex items-center font-bold" style={{ color: scheme.warning, backgroundColor: scheme.warning + '20' }}>Pendente</div>
       </div>
       <div className="p-3 rounded-lg shadow-sm" style={{ backgroundColor: scheme.surface }}>
         <div className="flex gap-3 mb-2">
           <div className="w-8 h-8 rounded opacity-10" style={{ backgroundColor: scheme.textMain }}></div>
           <div className="flex-1 space-y-1">
             <div className="h-2 w-3/4 rounded opacity-80" style={{ backgroundColor: scheme.textMain }}></div>
             <div className="h-2 w-1/2 rounded opacity-50" style={{ backgroundColor: scheme.textMuted }}></div>
           </div>
         </div>
         <div className="flex gap-2 mt-3 justify-end">
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.error }}><X size={12} /></div>
            <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ color: scheme.success }}><Check size={12} /></div>
         </div>
       </div>
    </div>
  </div>;


const AnalyticsDetailModal = ({ material, logs, onClose, lang }: {material: Material;logs: AccessLog[];onClose: () => void;lang: Language;}) => {
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" style={{ zIndex: 9999 }}>
            <div className="rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="px-6 py-4 flex justify-between items-center shadow-sm z-10" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div>
                        <h3 className="font-bold text-lg" style={{ color: 'var(--color-text-main)' }}>Histórico de Acesso</h3>
                        <p className="text-xs max-w-md truncate" style={{ color: 'var(--color-text-muted)' }}>{material.title[lang] || material.title['pt-br']}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full" style={{ color: 'var(--color-text-muted)' }}><X size={20} /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-0">
                    {logs.length === 0 ?
          <div className="p-12 text-center" style={{ color: 'var(--color-text-muted)' }}>
                            <Clock size={32} className="mx-auto mb-2 opacity-50" /> Nenhum acesso registrado.
                        </div> :

          <table className="w-full text-left">
                            <thead className="text-xs uppercase font-semibold sticky top-0" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                                <tr>
                                    <th className="p-4">Usuário</th>
                                    <th className="p-4">Perfil</th>
                                    <th className="p-4">Idioma</th>
                                    <th className="p-4 text-right">Data/Hora</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {logs.map((log) =>
              <tr key={log.id} className="transition-colors" style={{ color: 'var(--color-text-main)' }}>
                                        <td className="p-4 font-medium">{log.userName}</td>
                                        <td className="p-4"><span className="text-[10px] uppercase font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{log.userRole}</span></td>
                                        <td className="p-4"><span className="text-[10px] uppercase font-bold px-2 py-1 rounded" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>{log.language}</span></td>
                                        <td className="p-4 text-right tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{new Date(log.timestamp).toLocaleString(lang)}</td>
                                    </tr>
              )}
                            </tbody>
                        </table>
          }
                </div>
            </div>
        </div>,
    document.body
  );
};

export const Admin: React.FC = () => {
  const { t, language } = useLanguage();
  const { config, updateConfig } = useBrand();

  const [activeTab, setActiveTab] = useState<'materials' | 'users' | 'settings' | 'analytics' | 'collections'>('materials');
  const [settingsTab, setSettingsTab] = useState<'identity' | 'integrations' | 'themes' | 'invites' | 'gamification'>('identity');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<{mat: Material;lang: Language;} | null>(null);
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | 'all'>('all');
  const [materialStatusFilter, setMaterialStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userComm, setUserComm] = useState<UserProfile | null>(null);
  const [userEditing, setUserEditing] = useState<UserProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<Role | 'all'>('all');
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | 'all'>('all');
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [analyticsDetail, setAnalyticsDetail] = useState<{material: Material;logs: AccessLog[];} | null>(null);
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<MaterialType | 'all'>('all');
  const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState<Role | 'all'>('all');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'material' | 'user' | 'collection';id: string;} | null>(null);
  const [localConfig, setLocalConfig] = useState(config);
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState<CollectionProgress[]>([]);
  // Gamification levels state
  const [gamificationLevels, setGamificationLevels] = useState<GamificationLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<GamificationLevel | null>(null);
  const [newLevelName, setNewLevelName] = useState('');
  const [newLevelPoints, setNewLevelPoints] = useState(0);
  useEffect(() => {
    if (activeTab === 'materials') loadMaterials();
    if (activeTab === 'users') loadUsers();
    if (activeTab === 'analytics') loadAnalytics();
    if (activeTab === 'collections') loadCollections();
    if (activeTab === 'settings') loadGamificationLevels();
  }, [activeTab]);

  useEffect(() => {setLocalConfig(config);}, [config]);


  const loadMaterials = () => {mockDb.getMaterials('super_admin').then(setMaterials);};
  const loadUsers = () => {mockDb.getUsers().then(setUsers);};
  const loadCollections = () => {mockDb.getCollections('super_admin').then(setCollections);};
  const loadGamificationLevels = () => {mockDb.getGamificationLevels().then(setGamificationLevels).catch(e => console.error(e));};
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    const [logs, mats, cols, colProgress] = await Promise.all([
      mockDb.getAccessLogs(),
      mockDb.getMaterials('super_admin'),
      mockDb.getCollections('super_admin'),
      mockDb.getAllCollectionProgress(),
    ]);
    setAccessLogs(logs);
    setMaterials(mats);
    setCollections(cols);
    setCollectionProgress(colProgress);
    setAnalyticsLoading(false);
  };


  const handleOpenCreate = () => {setEditingMaterial(null);setIsFormOpen(true);};
  const handleOpenEdit = (material: Material) => {setEditingMaterial(material);setIsFormOpen(true);};

  const handleSaveMaterial = async (materialData: any) => {
    try {
      if (materialData.id) await mockDb.updateMaterial(materialData);else
      await mockDb.createMaterial(materialData);
      loadMaterials();
    } catch (e: any) {alert("Erro ao salvar material: " + (e.message || JSON.stringify(e)));}
  };

  const handleToggleActive = async (material: Material) => {
    try {await mockDb.updateMaterial({ ...material, active: !material.active });loadMaterials();}
    catch (e: any) {alert("Erro ao atualizar status: " + e.message);}
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'material') {await mockDb.deleteMaterial(itemToDelete.id);loadMaterials();}
      else if (itemToDelete.type === 'collection') {await mockDb.deleteCollection(itemToDelete.id);loadCollections();}
      else {await mockDb.deleteUser(itemToDelete.id);loadUsers();}
    } catch (e: any) {alert("Erro ao excluir: " + e.message);}
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };


  const handleDeleteMaterial = (id: string) => {setItemToDelete({ type: 'material', id });setIsConfirmOpen(true);};

  const handleView = (material: Material) => {
    const langs: Language[] = ['pt-br', 'en-us', 'es-es'];
    const availableLang = langs.find((l) => material.assets[l]?.url);
    if (availableLang) setViewingMaterial({ mat: material, lang: availableLang });else
    alert(t('no.materials'));
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((mat) => {
      const displayTitle = (mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || '').toLowerCase();
      const matchesSearch = displayTitle.includes(materialSearch.toLowerCase());
      const matchesType = materialTypeFilter === 'all' || mat.type === materialTypeFilter;
      const matchesStatus = materialStatusFilter === 'all' ? true : materialStatusFilter === 'active' ? mat.active : !mat.active;
      return matchesSearch && matchesType && matchesStatus;
    }).sort((a, b) => {
      const titleA = (a.title[language] || a.title['pt-br'] || '').toLowerCase();
      const titleB = (b.title[language] || b.title['pt-br'] || '').toLowerCase();
      return titleA.localeCompare(titleB);
    });
  }, [materials, materialSearch, materialTypeFilter, materialStatusFilter, language]);

  const handleUserStatus = async (userId: string, status: UserStatus) => {
    try {await mockDb.updateUserStatus(userId, status);loadUsers();}
    catch (e: any) {alert("Erro: " + e.message);}
  };

  const handleDeleteUser = (userId: string) => {setItemToDelete({ type: 'user', id: userId });setIsConfirmOpen(true);};

  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {await mockDb.updateUser(updatedUser);loadUsers();}
    catch (e: any) {alert("Erro: " + e.message);}
  };

  const handleCopyLink = (url: string, role: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(role);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name.toLowerCase().includes(userSearch.toLowerCase()) || user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === 'all' || user.role === userRoleFilter;
      const matchesStatus = userStatusFilter === 'all' || user.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    }).sort((a, b) => a.name.localeCompare(b.name));
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredLogs = useMemo(() => {
    return accessLogs.filter((log) => {
      if (analyticsRoleFilter !== 'all' && log.userRole !== analyticsRoleFilter) return false;
      if (analyticsTypeFilter !== 'all') {
        const mat = materials.find((m) => m.id === log.materialId);
        if (mat?.type !== analyticsTypeFilter) return false;
      }
      return true;
    });
  }, [accessLogs, analyticsRoleFilter, analyticsTypeFilter, materials]);

  const aggregatedMetrics = useMemo(() => {
    const map = new Map<string, {views: number;uniqueUsers: Set<string>;lastAccess: string | null;}>();
    materials.forEach((m) => {
      if (analyticsTypeFilter === 'all' || m.type === analyticsTypeFilter)
      map.set(m.id, { views: 0, uniqueUsers: new Set(), lastAccess: null });
    });
    filteredLogs.forEach((log) => {
      const stats = map.get(log.materialId);
      if (stats) {
        stats.views++;
        stats.uniqueUsers.add(log.userId);
        if (!stats.lastAccess || new Date(log.timestamp) > new Date(stats.lastAccess)) stats.lastAccess = log.timestamp;
      }
    });
    return Array.from(map.entries()).map(([id, stats]) => ({
      id, material: materials.find((m) => m.id === id),
      views: stats.views, uniqueUsers: stats.uniqueUsers.size, lastAccess: stats.lastAccess
    })).filter((item) => item.material).sort((a, b) => b.views - a.views);
  }, [filteredLogs, materials, analyticsTypeFilter]);

  const activeUsersRanking = useMemo(() => {
    const userCounts: Record<string, {name: string;role: Role;count: number;}> = {};
    filteredLogs.forEach((log) => {
      if (!userCounts[log.userId]) userCounts[log.userId] = { name: log.userName, role: log.userRole, count: 0 };
      userCounts[log.userId].count++;
    });
    return Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [filteredLogs]);

  const openAnalyticsDetail = (materialId: string) => {
    const mat = materials.find((m) => m.id === materialId);
    const logs = filteredLogs.filter((l) => l.materialId === materialId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (mat) setAnalyticsDetail({ material: mat, logs });
  };

  const handleSaveSettings = async () => {
    try {await updateConfig(localConfig);alert('Configurações salvas e aplicadas!');}
    catch (e: any) {alert("Erro: " + e.message);}
  };

  const renderTabButton = (id: typeof activeTab, label: string, Icon: any) =>
  <button onClick={() => setActiveTab(id)} className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? 'shadow-sm' : ''}`} style={activeTab === id ? { backgroundColor: 'var(--color-surface)', color: 'var(--color-accent)' } : { color: 'var(--color-text-muted)' }}>
      <Icon size={16} /><span className="hidden sm:inline">{label}</span>
    </button>;


  const renderSettingsSidebarItem = (id: typeof settingsTab, label: string, Icon: any) =>
  <button onClick={() => setSettingsTab(id)} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${settingsTab === id ? 'text-white shadow-lg' : ''}`} style={settingsTab === id ? { backgroundColor: 'var(--color-accent)' } : { color: 'var(--color-text-muted)' }}>
      <div className="flex items-center gap-3"><Icon size={18} />{label}</div>
      {settingsTab === id && <ChevronRight size={16} className="opacity-75" />}
    </button>;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{t('admin.title')}</h2>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Gerencie materiais, usuários e a aparência da plataforma.</p>
        </div>
        <div className="flex flex-wrap rounded-lg p-1 gap-1" style={{ backgroundColor: 'var(--color-bg)' }}>
          {renderTabButton('materials', t('tab.materials'), ImageIcon)}
          {renderTabButton('users', t('tab.users'), Users)}
          {renderTabButton('collections', 'Trilhas', BookOpen)}
          {renderTabButton('analytics', t('tab.analytics'), BarChart2)}
          {renderTabButton('settings', t('tab.settings'), Settings)}
        </div>
      </div>

      {/* Materials Tab */}
      {activeTab === 'materials' &&
      <div className="animate-fade-in">
          <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6" style={{ backgroundColor: 'var(--color-surface)' }}>
             <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5" size={18} style={{ color: 'var(--color-text-muted)' }} />
               <input type="text" placeholder={t('search.placeholder')} className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2" style={{ color: 'var(--color-text-main)' }} value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)} />
             </div>
             <div className="flex w-full md:w-auto gap-3">
               <select className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none" style={{ color: 'var(--color-text-main)' }} value={materialTypeFilter} onChange={(e) => setMaterialTypeFilter(e.target.value as any)}>
                 <option value="all">{t('filter.all')}</option>
                 <option value="pdf">{t('material.type.pdf')}</option>
                 <option value="image">{t('material.type.image')}</option>
                 <option value="video">{t('material.type.video')}</option>
               </select>
               <select className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none" style={{ color: 'var(--color-text-main)' }} value={materialStatusFilter} onChange={(e) => setMaterialStatusFilter(e.target.value as any)}>
                 <option value="all">{t('user.filter.status.all')}</option>
                 <option value="active">{t('active')}</option>
                 <option value="inactive">{t('inactive')}</option>
               </select>
            </div>
             <button onClick={handleOpenCreate} className="text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105 whitespace-nowrap" style={{ backgroundColor: 'var(--color-accent)' }}>
               <Plus size={20} /><span className="hidden md:inline">{t('add.material')}</span>
             </button>
          </div>

          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                  <tr>
                    <th className="p-4">{t('title')}</th>
                    <th className="p-4">{t('type')}</th>
                    <th className="p-4 text-center">{t('status')}</th>
                    <th className="p-4">{t('permissions')}</th>
                    <th className="p-4">Assets</th>
                    <th className="p-4 text-center">XP</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMaterials.map((mat) => {
                  const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                  return (
                    <tr key={mat.id} className="transition-colors" style={{ color: 'var(--color-text-main)' }}>
                        <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                        <td className="p-4 capitalize opacity-75">{mat.type}</td>
                        <td className="p-4 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${mat.active ? 'bg-green-500/10 text-green-600' : 'text-gray-400'}`} style={!mat.active ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' } : {}}>
                            {mat.active ? t('active') : t('inactive')}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex -space-x-1">
                            {mat.allowedRoles.map((r) =>
                          <div key={r} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] uppercase font-bold shadow-sm" title={t(`role.${r}`)} style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{r[0]}</div>
                          )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {Object.keys(mat.assets).map((lang) =>
                          <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>{lang.split('-')[0]}</span>
                          )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                            <Star size={12} /> {mat.points || 0}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button onClick={() => handleView(mat)} className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><Eye size={18} /></button>
                            <button onClick={() => handleToggleActive(mat)} className="p-2 rounded-lg" style={{ color: mat.active ? 'var(--color-text-muted)' : 'var(--color-text-muted)' }}>{mat.active ? <Eye size={18} /> : <EyeOff size={18} />}</button>
                            <button onClick={() => handleOpenEdit(mat)} className="p-2 rounded-lg" style={{ color: 'var(--color-accent)' }}><Edit size={18} /></button>
                            <button onClick={() => handleDeleteMaterial(mat.id)} className="p-2 rounded-lg text-red-500"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>);

                })}
                  {filteredMaterials.length === 0 &&
                <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Nenhum material encontrado.</td></tr>
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {/* Collections Tab */}
      {activeTab === 'collections' &&
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl shadow-sm" style={{ backgroundColor: 'var(--color-surface)' }}>
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5" size={18} style={{ color: 'var(--color-text-muted)' }} />
            <input type="text" placeholder="Buscar coleções..." className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }} value={collectionSearch} onChange={e => setCollectionSearch(e.target.value)} />
          </div>
          <button onClick={() => { setEditingCollection(null); setIsCollectionFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-bold text-sm whitespace-nowrap" style={{ backgroundColor: 'var(--color-accent)' }}>
            <PlusCircle size={16} /> Nova Trilha
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {collections.filter(c => (c.title['pt-br'] || Object.values(c.title)[0] || '').toLowerCase().includes(collectionSearch.toLowerCase())).map(col => {
            const title = col.title['pt-br'] || Object.values(col.title)[0] || 'Sem título';
            return (
              <div key={col.id} className="rounded-2xl border border-white/10 p-5 space-y-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-surface) 60%, transparent)' }}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}><BookOpen size={20} /></div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--color-text-main)' }}>{title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{col.points} XP · {col.active ? 'Ativa' : 'Inativa'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => { setEditingCollection(col); setIsCollectionFormOpen(true); }} className="p-2 rounded-lg" style={{ color: 'var(--color-accent)' }}><Edit size={16} /></button>
                    <button onClick={() => { setItemToDelete({ type: 'collection', id: col.id }); setIsConfirmOpen(true); }} className="p-2 rounded-lg text-red-500"><Trash2 size={16} /></button>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {col.allowedRoles.map(r => (<span key={r} className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>{t(`role.${r}`)}</span>))}
                </div>
              </div>
            );
          })}
          {collections.length === 0 && (<div className="col-span-3 py-16 text-center" style={{ color: 'var(--color-text-muted)' }}><Layers size={40} className="mx-auto mb-3 opacity-30" /><p>Nenhuma trilha criada ainda.</p></div>)}
        </div>
      </div>
      }

      {/* Analytics Tab */}

      {activeTab === 'analytics' &&
      <div className="animate-fade-in space-y-6">
            <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="flex items-center gap-2 font-bold uppercase text-xs mr-auto" style={{ color: 'var(--color-text-muted)' }}><Filter size={16} /> Filtros de Métricas</div>
                <select className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2" style={{ color: 'var(--color-text-main)' }} value={analyticsTypeFilter} onChange={(e) => setAnalyticsTypeFilter(e.target.value as any)}>
                    <option value="all">{t('filter.all')}</option>
                    <option value="pdf">{t('material.type.pdf')}</option>
                    <option value="image">{t('material.type.image')}</option>
                    <option value="video">{t('material.type.video')}</option>
                </select>
                <select className="w-full md:w-auto p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2" style={{ color: 'var(--color-text-main)' }} value={analyticsRoleFilter} onChange={(e) => setAnalyticsRoleFilter(e.target.value as any)}>
                    <option value="all">{t('user.filter.all')}</option>
                    <option value="client">{t('role.client')}</option>
                    <option value="distributor">{t('role.distributor')}</option>
                    <option value="consultant">{t('role.consultant')}</option>
                </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500"><Eye size={24} /></div>
                    <div><p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('analytics.total.views')}</p><p className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{filteredLogs.length}</p></div>
                </div>
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500"><Users size={24} /></div>
                    <div><p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('analytics.unique.users')}</p><p className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{new Set(filteredLogs.map((l) => l.userId)).size}</p></div>
                </div>
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500"><TrendingUp size={24} /></div>
                    <div><p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>{t('analytics.top.material')}</p><p className="text-lg font-bold truncate max-w-[200px]" style={{ color: 'var(--color-text-main)' }}>{aggregatedMetrics[0]?.material ? aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title['pt-br'] : 'N/A'}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 30%, transparent)' }}>
                         <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}><Trophy size={18} className="text-yellow-500" />{t('analytics.rank.materials')}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                         {aggregatedMetrics.slice(0, 5).map((item, index) => {
                const mat = item.material;
                if (!mat) return null;
                const title = mat.title[language] || mat.title['pt-br'];
                const percentage = Math.round(item.views / filteredLogs.length * 100) || 0;
                return (
                  <div key={item.id} className="relative">
                                      <div className="flex justify-between text-sm mb-1">
                                          <span className="font-medium truncate pr-2 flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? 'bg-yellow-100 text-yellow-700' : index === 1 ? 'bg-gray-100 text-gray-700' : index === 2 ? 'bg-orange-100 text-orange-700' : ''}`} style={index > 2 ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' } : {}}>{index + 1}</span>
                                              {title}
                                          </span>
                                          <span className="font-bold" style={{ color: 'var(--color-accent)' }}>{item.views}</span>
                                      </div>
                                      <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: 'var(--color-accent)' }}></div>
                                      </div>
                                  </div>);

              })}
                         {aggregatedMetrics.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Sem dados</p>}
                    </div>
                </div>

                <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                     <div className="px-6 py-4 flex justify-between items-center" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 30%, transparent)' }}>
                         <h3 className="font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}><Users size={18} className="text-blue-500" />{t('analytics.rank.users')}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                        {activeUsersRanking.map((user, index) =>
              <div key={index} className="flex items-center justify-between p-2 rounded-lg transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>{user.name.charAt(0)}</div>
                                     <div>
                                         <p className="text-sm font-medium" style={{ color: 'var(--color-text-main)' }}>{user.name}</p>
                                         <p className="text-[10px] uppercase font-bold" style={{ color: 'var(--color-text-muted)' }}>{t(`role.${user.role}`)}</p>
                                     </div>
                                 </div>
                                 <div className="text-right">
                                     <p className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>{user.count}</p>
                                     <p className="text-[10px]" style={{ color: 'var(--color-text-muted)' }}>acessos</p>
                                 </div>
                             </div>
              )}
                        {activeUsersRanking.length === 0 && <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>Sem dados</p>}
                    </div>
                </div>
            </div>

            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="px-6 py-4"><h3 className="font-bold" style={{ color: 'var(--color-text-main)' }}>Desempenho Geral</h3></div>
                <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                    <tr>
                        <th className="p-4">{t('title')}</th>
                        <th className="p-4">{t('type')}</th>
                        <th className="p-4 text-center">{t('analytics.col.views')}</th>
                        <th className="p-4 text-center">{t('analytics.col.users')}</th>
                        <th className="p-4 text-right">{t('analytics.col.last_access')}</th>
                        <th className="p-4 text-right">Detalhes</th>
                    </tr>
                    </thead>
                    <tbody className="text-sm">
                    {aggregatedMetrics.map((item) => {
                  const mat = item.material;
                  if (!mat) return null;
                  const displayTitle = mat.title[language] || mat.title['pt-br'] || Object.values(mat.title)[0] || 'Untitled';
                  return (
                    <tr key={item.id} className="transition-colors" style={{ color: 'var(--color-text-main)' }}>
                            <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                            <td className="p-4 capitalize opacity-75">{mat.type}</td>
                            <td className="p-4 text-center font-bold">{item.views}</td>
                            <td className="p-4 text-center">{item.uniqueUsers}</td>
                            <td className="p-4 text-right tabular-nums" style={{ color: 'var(--color-text-muted)' }}>{item.lastAccess ? new Date(item.lastAccess).toLocaleDateString(language) : '-'}</td>
                            <td className="p-4 text-right">
                                <button onClick={() => openAnalyticsDetail(item.id)} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}><BarChart2 size={16} /></button>
                            </td>
                        </tr>);

                })}
                    </tbody>
                </table>
                </div>
            </div>

            {/* ===== TRAIL METRICS SECTION ===== */}
            <div className="pt-4">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-main)' }}>
                <BookOpen size={20} style={{ color: 'var(--color-accent)' }} /> Métricas de Trilhas
              </h3>

              {/* Trail KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500"><Target size={24} /></div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Trilhas Iniciadas</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{collectionProgress.length}</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Award size={24} /></div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Trilhas Concluídas</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>{collectionProgress.filter(p => p.status === 'completed').length}</p>
                  </div>
                </div>
                <div className="p-6 rounded-xl shadow-sm flex items-center gap-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500"><TrendingUp size={24} /></div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>Taxa de Conclusão</p>
                    <p className="text-2xl font-bold" style={{ color: 'var(--color-text-main)' }}>
                      {collectionProgress.length > 0 ? Math.round((collectionProgress.filter(p => p.status === 'completed').length / collectionProgress.length) * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Trail Performance Table */}
              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
                <div className="px-6 py-4"><h3 className="font-bold" style={{ color: 'var(--color-text-main)' }}>Desempenho por Trilha</h3></div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                      <tr>
                        <th className="p-4">Trilha</th>
                        <th className="p-4 text-center">Materiais</th>
                        <th className="p-4 text-center">Iniciaram</th>
                        <th className="p-4 text-center">Concluíram</th>
                        <th className="p-4 text-center">Taxa</th>
                        <th className="p-4 text-center">XP Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {collections.map((col) => {
                        const colTitle = (col.title as any)[language] || (col.title as any)['pt-br'] || 'Sem título';
                        const started = collectionProgress.filter(p => p.collectionId === col.id).length;
                        const completed = collectionProgress.filter(p => p.collectionId === col.id && p.status === 'completed').length;
                        const rate = started > 0 ? Math.round((completed / started) * 100) : 0;
                        return (
                          <tr key={col.id} className="transition-colors" style={{ color: 'var(--color-text-main)' }}>
                            <td className="p-4 font-medium max-w-xs truncate">{colTitle}</td>
                            <td className="p-4 text-center" style={{ color: 'var(--color-text-muted)' }}>{col.itemCount || '—'}</td>
                            <td className="p-4 text-center font-bold">{started}</td>
                            <td className="p-4 text-center font-bold text-emerald-600">{completed}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }}></div>
                                </div>
                                <span className="text-xs font-bold" style={{ color: 'var(--color-text-muted)' }}>{rate}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 10%, transparent)', color: 'var(--color-accent)' }}>
                                <Star size={12} /> {col.points || 0}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {collections.length === 0 && <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Nenhuma trilha cadastrada.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
        </div>
      }

      {/* Users Tab */}
      {activeTab === 'users' &&
      <div className="animate-fade-in space-y-6">
          <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="relative flex-1 w-full">
               <Search className="absolute left-3 top-2.5" size={18} style={{ color: 'var(--color-text-muted)' }} />
               <input type="text" placeholder="Buscar por nome ou email..." className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2" style={{ color: 'var(--color-text-main)' }} value={userSearch} onChange={(e) => setUserSearch(e.target.value)} />
            </div>
            <div className="flex w-full md:w-auto gap-3">
               <select className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none" style={{ color: 'var(--color-text-main)' }} value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value as any)}>
                 <option value="all">{t('user.filter.all')}</option>
                 <option value="client">{t('role.client')}</option>
                 <option value="distributor">{t('role.distributor')}</option>
                 <option value="consultant">{t('role.consultant')}</option>
               </select>
               <select className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none" style={{ color: 'var(--color-text-main)' }} value={userStatusFilter} onChange={(e) => setUserStatusFilter(e.target.value as any)}>
                 <option value="all">{t('user.filter.status.all')}</option>
                 <option value="pending">{t('user.status.pending')}</option>
                 <option value="active">{t('user.status.active')}</option>
                 <option value="inactive">{t('user.status.inactive')}</option>
                 <option value="rejected">{t('user.status.rejected')}</option>
               </select>
            </div>
          </div>

          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                  <tr>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Contatos</th>
                    <th className="p-4">Perfil</th>
                    <th className="p-4">{t('permissions')}</th>
                    <th className="p-4 text-center">{t('status')}</th>
                    <th className="p-4 text-right">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.map((user) =>
                <tr key={user.id} className="transition-colors" style={{ color: 'var(--color-text-main)' }}>
                      <td className="p-4">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.cro ? `CRO: ${user.cro}` : 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1"><span style={{ color: 'var(--color-text-muted)' }}>E:</span> {user.email}</div>
                          <div className="flex items-center gap-1"><span style={{ color: 'var(--color-text-muted)' }}>W:</span> {user.whatsapp}</div>
                        </div>
                      </td>
                      <td className="p-4">
                         <span className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>{t(`role.${user.role}`)}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {!user.allowedTypes || user.allowedTypes.length === 0 ?
                      <span className="text-[10px] uppercase font-bold px-2 py-1 rounded" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>Todos</span> :

                      user.allowedTypes.map((type) =>
                      <div key={type} className="p-1 rounded" title={t(`material.type.${type}`)} style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>
                                {type === 'pdf' && <FileText size={14} />}
                                {type === 'image' && <ImageIcon size={14} />}
                                {type === 'video' && <Video size={14} />}
                              </div>
                      )
                      }
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                            ${user.status === 'active' ? 'bg-green-500/10 text-green-600' :
                    user.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600' :
                    user.status === 'rejected' ? 'bg-red-500/10 text-red-600' : ''}
                          `} style={user.status === 'inactive' ? { backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' } : {}}>
                            {t(`user.status.${user.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 items-center">
                          
                          {user.status === 'pending' &&
                      <>
                              <button onClick={() => handleUserStatus(user.id, 'active')} className="p-2 rounded-lg text-green-500" title={t('user.action.approve')}><CheckCircle size={18} /></button>
                              <button onClick={() => handleUserStatus(user.id, 'rejected')} className="p-2 rounded-lg text-red-500" title={t('user.action.reject')}><XCircle size={18} /></button>
                            </>
                      }
                          <button onClick={() => setUserEditing(user)} className="p-2 rounded-lg ml-1" title={t('edit')} style={{ color: 'var(--color-accent)' }}><Edit size={18} /></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 rounded-lg text-red-500 ml-1" title={t('delete')}><Trash2 size={18} /></button>
                        </div>
                      </td>
                    </tr>
                )}
                  {filteredUsers.length === 0 &&
                <tr><td colSpan={6} className="p-8 text-center" style={{ color: 'var(--color-text-muted)' }}>Nenhum usuário encontrado.</td></tr>
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {/* Settings Tab */}
      {activeTab === 'settings' &&
      <div className="animate-fade-in pb-12">
           <div className="flex flex-col md:flex-row gap-8">
              <aside className="w-full md:w-64 shrink-0">
                 <div className="rounded-xl p-2 shadow-sm sticky top-4" style={{ backgroundColor: 'var(--color-surface)' }}>
                    <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-muted)' }}>Opções</p>
                    {renderSettingsSidebarItem('identity', 'Identidade Visual', Type)}
                     {renderSettingsSidebarItem('integrations', 'Integrações', Webhook)}
                     {renderSettingsSidebarItem('themes', 'Temas', Palette)}
                     {renderSettingsSidebarItem('gamification', 'Gamificação', Trophy)}
                     {renderSettingsSidebarItem('invites', t('user.invite'), Share2)}
                 </div>
              </aside>

              <div className="flex-1 min-w-0 space-y-6">
                 <div className="flex justify-between items-center mb-2">
                   <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--color-text-main)' }}>
                     {settingsTab === 'identity' && <><Type size={24} style={{ color: 'var(--color-accent)' }} /> Identidade Visual</>}
                     {settingsTab === 'integrations' && <><Webhook size={24} className="text-purple-500" /> Integrações</>}
                     {settingsTab === 'themes' && <><Palette size={24} className="text-orange-500" /> Personalização de Temas</>}
                      {settingsTab === 'invites' && <><Share2 size={24} className="text-green-500" /> {t('user.invite')}</>}
                      {settingsTab === 'gamification' && <><Trophy size={24} className="text-yellow-500" /> Patentes & XP</>}
                   </h3>
                    {settingsTab !== 'invites' && settingsTab !== 'gamification' &&
              <button onClick={handleSaveSettings} className="text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2" style={{ backgroundColor: 'var(--color-accent)' }}>
                        <Save size={18} /> Salvar Alterações
                     </button>
              }
                 </div>

                 {settingsTab === 'identity' &&
            <div className="p-6 rounded-xl shadow-sm animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-main)' }}>Nome da Aplicação</label>
                          <input type="text" value={localConfig.appName} onChange={(e) => setLocalConfig({ ...localConfig, appName: e.target.value })} className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 focus:ring-2 outline-none" style={{ color: 'var(--color-text-main)' }} />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-main)' }}>URL do Logo</label>
                          <div className="flex gap-2">
                            <input type="text" placeholder="https://..." value={localConfig.logoUrl || ''} onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })} className="flex-1 p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 focus:ring-2 outline-none" style={{ color: 'var(--color-text-main)' }} />
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--color-bg)' }}>
                              {localConfig.logoUrl ? <img src={localConfig.logoUrl} className="w-6 h-6 object-contain" /> : <ImageIcon size={16} style={{ color: 'var(--color-text-muted)' }} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
            }

                 {settingsTab === 'integrations' &&
            <div className="p-6 rounded-xl shadow-sm animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div>
                          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-main)' }}>URL do Webhook (N8N)</label>
                          <div className="flex gap-2">
                            <div className="p-3 rounded-l-lg font-bold text-xs flex items-center" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-muted)' }}>POST</div>
                            <input type="text" placeholder="https://n8n.seu-dominio.com/webhook/..." value={localConfig.webhookUrl || ''} onChange={(e) => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })} className="flex-1 p-2.5 rounded-r-lg bg-gray-50 dark:bg-black/20 focus:ring-2 outline-none font-mono text-sm" style={{ color: 'var(--color-text-main)' }} />
                          </div>
                          <p className="text-xs mt-3 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>Esta URL será chamada via POST com um payload JSON sempre que uma mensagem for enviada.</p>
                      </div>
                    </div>
            }

                 {settingsTab === 'themes' &&
            <div className="p-6 rounded-xl shadow-sm animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="space-y-6">
                          <div className="flex items-center gap-2 font-semibold pb-2 border-b" style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}><Sun size={18} className="text-orange-500" /> Tema Light</div>
                          <ThemeEditorSection title="Estrutura Base">
                              <ColorInput label="Background" value={localConfig.themeLight.background} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, background: v } })} hint="Fundo geral" />
                              <ColorInput label="Surface" value={localConfig.themeLight.surface} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, surface: v } })} hint="Cards e headers" />
                              <ColorInput label="Borders" value={localConfig.themeLight.border} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, border: v } })} hint="Linhas divisórias" />
                          </ThemeEditorSection>
                          <ThemeEditorSection title="Tipografia">
                              <ColorInput label="Text Main" value={localConfig.themeLight.textMain} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, textMain: v } })} hint="Títulos" />
                              <ColorInput label="Text Muted" value={localConfig.themeLight.textMuted} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, textMuted: v } })} hint="Legendas" />
                          </ThemeEditorSection>
                          <ThemeEditorSection title="Marca"><ColorInput label="Accent" value={localConfig.themeLight.accent} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, accent: v } })} hint="Botões e destaques" /></ThemeEditorSection>
                          <ThemeEditorSection title="Status">
                              <ColorInput label="Success" value={localConfig.themeLight.success} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, success: v } })} hint="Ativo" />
                              <ColorInput label="Warning" value={localConfig.themeLight.warning} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, warning: v } })} hint="Pendente" />
                              <ColorInput label="Error" value={localConfig.themeLight.error} onChange={(v) => setLocalConfig({ ...localConfig, themeLight: { ...localConfig.themeLight, error: v } })} hint="Perigo" />
                          </ThemeEditorSection>
                          <div className="pt-4"><LivePreview themeName="Light" scheme={localConfig.themeLight} /></div>
                        </div>

                        <div className="space-y-6">
                          <div className="flex items-center gap-2 font-semibold pb-2 border-b" style={{ color: 'var(--color-text-main)', borderColor: 'var(--color-border)' }}><Moon size={18} className="text-blue-400" /> Tema Dark</div>
                          <ThemeEditorSection title="Estrutura Base">
                              <ColorInput label="Background" value={localConfig.themeDark.background} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, background: v } })} hint="Fundo geral" />
                              <ColorInput label="Surface" value={localConfig.themeDark.surface} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, surface: v } })} hint="Cards e headers" />
                              <ColorInput label="Borders" value={localConfig.themeDark.border} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, border: v } })} hint="Linhas divisórias" />
                          </ThemeEditorSection>
                          <ThemeEditorSection title="Tipografia">
                              <ColorInput label="Text Main" value={localConfig.themeDark.textMain} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, textMain: v } })} hint="Títulos" />
                              <ColorInput label="Text Muted" value={localConfig.themeDark.textMuted} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, textMuted: v } })} hint="Legendas" />
                          </ThemeEditorSection>
                          <ThemeEditorSection title="Marca"><ColorInput label="Accent" value={localConfig.themeDark.accent} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, accent: v } })} hint="Botões e destaques" /></ThemeEditorSection>
                          <ThemeEditorSection title="Status">
                              <ColorInput label="Success" value={localConfig.themeDark.success} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, success: v } })} hint="Ativo" />
                              <ColorInput label="Warning" value={localConfig.themeDark.warning} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, warning: v } })} hint="Pendente" />
                              <ColorInput label="Error" value={localConfig.themeDark.error} onChange={(v) => setLocalConfig({ ...localConfig, themeDark: { ...localConfig.themeDark, error: v } })} hint="Perigo" />
                          </ThemeEditorSection>
                          <div className="pt-4"><LivePreview themeName="Dark" scheme={localConfig.themeDark} /></div>
                        </div>
                      </div>
                    </div>
            }

                 {settingsTab === 'invites' &&
            <div className="p-6 rounded-xl shadow-sm animate-fade-in space-y-6" style={{ backgroundColor: 'var(--color-surface)' }}>
                      <div className="p-4 rounded-xl flex items-start gap-3" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)' }}>
                        <LinkIcon size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} />
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                          Compartilhe estes links para que novos usuários se cadastrem com o <strong style={{ color: 'var(--color-text-main)' }}>perfil pré-definido e bloqueado</strong>. O usuário não poderá alterar o tipo de perfil ao se cadastrar pelo link.
                        </p>
                      </div>
                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {([
                          { role: 'client' as Role, icon: User, desc: 'Acesso aos materiais. Pode informar o CRO.' },
                          { role: 'distributor' as Role, icon: Briefcase, desc: 'Distribuidor de produtos e materiais.' },
                          { role: 'consultant' as Role, icon: Sparkles, desc: 'Consultor especializado da plataforma.' },
                          { role: 'super_admin' as Role, icon: Settings, desc: 'Acesso total à plataforma e administração.' },
                        ]).map(({ role, icon: Icon, desc }) => {
                  const publishedUrl = 'https://conexao-hub.lovable.app';
                  const fullUrl = `${publishedUrl}/?role=${role}`;
                  return (
                    <div key={role} className="p-5 rounded-xl flex flex-col gap-3" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid color-mix(in srgb, var(--color-border) 50%, transparent)' }}>
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 12%, transparent)', color: 'var(--color-accent)' }}>
                                  <Icon size={16} />
                                </div>
                                <div>
                                  <p className="text-sm font-bold" style={{ color: 'var(--color-text-main)' }}>{t(`role.${role}`)}</p>
                                  <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
                                </div>
                              </div>
                              <input readOnly value={fullUrl} className="p-2 rounded-lg text-[11px] truncate w-full font-mono outline-none" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} />
                              <div className="flex gap-2">
                                <button onClick={() => window.open(fullUrl, '_blank')} className="flex-1 p-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-semibold transition-colors" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }} title="Abrir link">
                                  <ExternalLink size={13} /> Visualizar
                                </button>
                                <button onClick={() => handleCopyLink(fullUrl, role)} className={`flex-1 p-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-bold text-white transition-all ${copiedLink === role ? 'bg-green-500' : ''}`} style={copiedLink !== role ? { backgroundColor: 'var(--color-accent)' } : {}}>
                                  {copiedLink === role ? <><CheckCircle size={13} /> Copiado!</> : <><Copy size={13} /> Copiar Link</>}
                                </button>
                              </div>
                            </div>);
                })}
                      </div>
                    </div>
            }

                 {settingsTab === 'gamification' &&
            <div className="p-6 rounded-xl shadow-sm animate-fade-in" style={{ backgroundColor: 'var(--color-surface)' }}>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>Defina os níveis de gamificação, nomes e pontuação mínima. Use as setas para reordenar.</p>

              {/* Add new level */}
              <div className="mb-6 pb-6" style={{ borderBottom: '1px solid var(--color-border)' }}>
                <h4 className="text-sm font-semibold mb-3" style={{ color: 'var(--color-text-main)' }}>Adicionar nova patente</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="text" placeholder="Nome da patente" value={newLevelName} onChange={(e) => setNewLevelName(e.target.value)} className="flex-1 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }} />
                  <input type="number" placeholder="XP mínimo" value={newLevelPoints || ''} onChange={(e) => setNewLevelPoints(Number(e.target.value))} className="w-32 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-main)' }} />
                  <button onClick={async () => {
                    if (!newLevelName.trim()) return;
                    const nextOrder = gamificationLevels.length;
                    await mockDb.createGamificationLevel(newLevelName.trim(), newLevelPoints, nextOrder);
                    setNewLevelName(''); setNewLevelPoints(0); loadGamificationLevels();
                  }} className="px-4 py-2 rounded-lg text-sm font-medium text-white flex items-center gap-2" style={{ backgroundColor: 'var(--color-accent)' }}>
                    <PlusCircle size={16} /> Adicionar
                  </button>
                </div>
              </div>

              {/* Levels list */}
              {gamificationLevels.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
                  <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                  <p>Nenhuma patente configurada.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {gamificationLevels.map((level, idx) => (
                    <div key={level.id} className="flex items-center gap-3 p-4 rounded-xl transition-colors" style={{ backgroundColor: 'var(--color-bg)' }}>
                      {editingLevel?.id === level.id ? (
                        <>
                          <input type="text" value={editingLevel.name} onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })} className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }} />
                          <input type="number" value={editingLevel.minPoints} onChange={(e) => setEditingLevel({ ...editingLevel, minPoints: Number(e.target.value) })} className="w-28 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2" style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-main)' }} />
                          <button onClick={async () => { await mockDb.updateGamificationLevel(editingLevel.id, editingLevel.name, editingLevel.minPoints, editingLevel.orderIndex); setEditingLevel(null); loadGamificationLevels(); }} className="p-2 rounded-lg" style={{ color: 'var(--color-success)' }}><Check size={18} /></button>
                          <button onClick={() => setEditingLevel(null)} className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><X size={18} /></button>
                        </>
                      ) : (
                        <>
                          <div className="flex flex-col gap-0.5">
                            <button disabled={idx === 0} onClick={async () => {
                              const prev = gamificationLevels[idx - 1];
                              await Promise.all([
                                mockDb.updateGamificationLevel(level.id, level.name, level.minPoints, prev.orderIndex),
                                mockDb.updateGamificationLevel(prev.id, prev.name, prev.minPoints, level.orderIndex),
                              ]);
                              loadGamificationLevels();
                            }} className="p-0.5 rounded disabled:opacity-20" style={{ color: 'var(--color-text-muted)' }}><ChevronUp size={14} /></button>
                            <button disabled={idx === gamificationLevels.length - 1} onClick={async () => {
                              const next = gamificationLevels[idx + 1];
                              await Promise.all([
                                mockDb.updateGamificationLevel(level.id, level.name, level.minPoints, next.orderIndex),
                                mockDb.updateGamificationLevel(next.id, next.name, next.minPoints, level.orderIndex),
                              ]);
                              loadGamificationLevels();
                            }} className="p-0.5 rounded disabled:opacity-20" style={{ color: 'var(--color-text-muted)' }}><ChevronDown size={14} /></button>
                          </div>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: 'var(--color-accent)' }}>{idx + 1}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm" style={{ color: 'var(--color-text-main)' }}>{level.name}</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{level.minPoints} XP mínimo</p>
                          </div>
                          <button onClick={() => setEditingLevel(level)} className="p-2 rounded-lg" style={{ color: 'var(--color-text-muted)' }}><Edit size={16} /></button>
                          <button onClick={async () => { if (confirm(`Excluir a patente "${level.name}"?`)) { await mockDb.deleteGamificationLevel(level.id); loadGamificationLevels(); } }} className="p-2 rounded-lg" style={{ color: 'var(--color-error)' }}><Trash2 size={16} /></button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            }
              </div>
           </div>
        </div>
      }


      {isFormOpen && <MaterialFormModal initialData={editingMaterial} onClose={() => setIsFormOpen(false)} onSave={handleSaveMaterial} />}
      {viewingMaterial && <ViewerModal material={viewingMaterial.mat} language={viewingMaterial.lang} onClose={() => setViewingMaterial(null)} />}
      {userComm && <UserCommunicationModal user={userComm} onClose={() => setUserComm(null)} />}
      {userEditing && <UserEditModal user={userEditing} onClose={() => setUserEditing(null)} onSave={handleSaveUser} />}
      {analyticsDetail && analyticsDetail.material && <AnalyticsDetailModal material={analyticsDetail.material} logs={analyticsDetail.logs} onClose={() => setAnalyticsDetail(null)} lang={language} />}
      {isCollectionFormOpen && <CollectionFormModal initialData={editingCollection} onClose={() => setIsCollectionFormOpen(false)} onSave={async () => { loadCollections(); }} />}
      <ConfirmModal isOpen={isConfirmOpen} title={t('confirm.delete.title')} message={t('confirm.delete.message')} onConfirm={confirmDelete} onClose={() => setIsConfirmOpen(false)} />
    </div>);


};