import React, { useEffect, useState, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { mockDb, GamificationLevel, CollectionProgress } from "../lib/mockDb";
import {
  Material,
  Language,
  ColorScheme,
  UserProfile,
  Role,
  UserStatus,
  MaterialType,
  AccessLog,
  Collection } from
"../types";
import { useLanguage } from "../contexts/LanguageContext";
import { useBrand } from "../contexts/BrandContext";
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Type,
  Image as ImageIcon,
  Save,
  Monitor,
  Moon,
  Sun,
  Users,
  Share2,
  CheckCircle,
  XCircle,
  Ban,
  MessageCircle,
  Copy,
  Link as LinkIcon,
  Webhook,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Search,
  Filter,
  FileText,
  Video,
  ExternalLink,
  AlertCircle,
  Download,
  Check,
  X,
  BarChart2,
  TrendingUp,
  Calendar,
  Clock,
  Trophy,
  User,
  Briefcase,
  Sparkles,
  BookOpen,
  PlusCircle,
  Layers,
  Star,
  Target,
  Award,
  Upload,
  FolderOpen } from
"lucide-react";
import { MaterialFormModal } from "../components/hub/MaterialFormModal";
import { ThemeEditorPanel } from "../components/hub/ThemeEditorPanel";
import { ViewerModal } from "../components/hub/ViewerModal";
import { UserCommunicationModal } from "../components/hub/UserCommunicationModal";
import { UserEditModal } from "../components/hub/UserEditModal";
import { ConfirmModal } from "../components/hub/ConfirmModal";
import { RejectUserModal } from "../components/hub/RejectUserModal";
import { CollectionFormModal } from "../components/hub/CollectionFormModal";
import { SkeletonTable } from "../components/hub/SkeletonTable";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend } from
"recharts";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";


const AnalyticsDetailModal = ({
  material,
  logs,
  onClose,
  lang





}: {material: Material;logs: AccessLog[];onClose: () => void;lang: Language;}) => {
  return createPortal(
    <div
      className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      style={{ zIndex: 9999 }}>

      <div
        className="rounded-t-2xl sm:rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-slide-up"
        style={{ backgroundColor: "var(--color-surface)" }}>

        <div
          className="px-6 py-4 flex justify-between items-center shadow-sm z-10"
          style={{ backgroundColor: "var(--color-surface)" }}>

          <div>
            <h3 className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
              Histórico de Acesso
            </h3>
            <p className="text-xs max-w-md truncate" style={{ color: "var(--color-text-muted)" }}>
              {material.title[lang] || material.title["pt-br"]}
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full" style={{ color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overflow-x-auto p-0">
          {logs.length === 0 ?
          <div className="p-12 text-center" style={{ color: "var(--color-text-muted)" }}>
              <Clock size={32} className="mx-auto mb-2 opacity-50" /> Nenhum acesso registrado.
            </div> :

          <table className="w-full text-left">
              <thead
              className="text-xs uppercase font-semibold sticky top-0"
              style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                <tr>
                  <th className="p-4">Usuário</th>
                  <th className="p-4">Perfil</th>
                  <th className="p-4">Idioma</th>
                  <th className="p-4 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {logs.map((log) =>
              <tr key={log.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                    <td className="p-4 font-medium">{log.userName}</td>
                    <td className="p-4">
                      <span
                    className="text-[10px] uppercase font-bold px-2 py-1 rounded"
                    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                        {log.userRole}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                    className="text-[10px] uppercase font-bold px-2 py-1 rounded"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                      color: "var(--color-accent)"
                    }}>

                        {log.language}
                      </span>
                    </td>
                    <td className="p-4 text-right tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(log.timestamp).toLocaleString(lang)}
                    </td>
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

  const [activeTab, setActiveTab] = useState<"materials" | "users" | "settings" | "analytics" | "collections">(
    "materials"
  );
  const [settingsTab, setSettingsTab] = useState<"identity" | "integrations" | "themes" | "invites" | "gamification">(
    "identity"
  );
  const [materials, setMaterials] = useState<Material[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<{mat: Material;lang: Language;} | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | "all">("all");
  const [materialStatusFilter, setMaterialStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userComm, setUserComm] = useState<UserProfile | null>(null);
  const [userEditing, setUserEditing] = useState<UserProfile | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<Role | "all">("all");
  const [userStatusFilter, setUserStatusFilter] = useState<UserStatus | "all">("all");
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [analyticsDetail, setAnalyticsDetail] = useState<{material: Material;logs: AccessLog[];} | null>(null);
  const [analyticsTypeFilter, setAnalyticsTypeFilter] = useState<MaterialType | "all">("all");
  const [analyticsRoleFilter, setAnalyticsRoleFilter] = useState<Role | "all">("all");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: "material" | "user" | "collection";id: string;} | null>(
    null
  );
  const [localConfig, setLocalConfig] = useState(config);
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isCollectionFormOpen, setIsCollectionFormOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionSearch, setCollectionSearch] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [collectionProgress, setCollectionProgress] = useState<CollectionProgress[]>([]);
  // Gamification levels state
  const [gamificationLevels, setGamificationLevels] = useState<GamificationLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<GamificationLevel | null>(null);
  const [newLevelName, setNewLevelName] = useState("");
  const [newLevelPoints, setNewLevelPoints] = useState(0);
  const [newLevelColor, setNewLevelColor] = useState("#c9a655");
  const analyticsRef = useRef<HTMLDivElement>(null);
  // Invite tokens state
  const [inviteTokens, setInviteTokens] = useState<any[]>([]);
  const [inviteRole, setInviteRole] = useState<Role>('client');
  const [inviteExpiry, setInviteExpiry] = useState(7);
  const [inviteGenerating, setInviteGenerating] = useState(false);
  // Reject modal state
  const [rejectingUser, setRejectingUser] = useState<UserProfile | null>(null);
  const exportAnalyticsCsv = () => {
    const headers = ['Material', 'Tipo', 'Visualizações', 'Usuários Únicos', 'Último Acesso'];
    const rows = aggregatedMetrics.map((item) => {
      const title = item.material?.title[language] || item.material?.title['pt-br'] || '';
      return [title, item.material?.type || '', String(item.views), String(item.uniqueUsers), item.lastAccess ? new Date(item.lastAccess).toLocaleString('pt-BR') : 'N/A'].
      map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const rankHeaders = ['Posição', 'Usuário', 'Perfil', 'Acessos'];
    const rankRows = activeUsersRanking.map((u, i) =>
    [String(i + 1), u.name, u.role, String(u.count)].map((v) => `"${v}"`).join(',')
    );
    const csv = [
    '=== MÉTRICAS DE MATERIAIS ===', headers.join(','), ...rows, '',
    '=== RANKING DE USUÁRIOS ===', rankHeaders.join(','), ...rankRows].
    join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `metricas_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportAnalyticsPdf = async () => {
    if (!analyticsRef.current) return;
    try {
      const canvas = await html2canvas(analyticsRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 277; // A4 landscape width in mm (minus margins)
      const pageHeight = 190; // A4 landscape height in mm (minus margins)
      const imgHeight = canvas.height * imgWidth / canvas.width;
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      let heightLeft = imgHeight;
      let position = 10; // top margin

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`metricas_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (e) {
      console.error('PDF export error:', e);
      alert('Erro ao gerar PDF. Verifique o console para detalhes.');
    }
  };
  useEffect(() => {
    if (activeTab === "materials") loadMaterials();
    if (activeTab === "users") loadUsers();
    if (activeTab === "analytics") loadAnalytics();
    if (activeTab === "collections") loadCollections();
    if (activeTab === "settings") {
      loadGamificationLevels();
      loadInviteTokens();
    }
  }, [activeTab]);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  const loadMaterials = () => {
    mockDb.getMaterials("super_admin").then(setMaterials);
  };
  const loadUsers = () => {
    mockDb.getUsers().then(setUsers);
  };
  const loadCollections = () => {
    mockDb.getCollections("super_admin").then(setCollections);
  };
  const loadGamificationLevels = () => {
    mockDb.
    getGamificationLevels().
    then(setGamificationLevels).
    catch((e) => console.error(e));
  };
  const loadInviteTokens = () => {
    mockDb.getInviteTokens().then(setInviteTokens).catch((e) => console.error(e));
  };
  const generateInviteToken = async () => {
    setInviteGenerating(true);
    try {
      await mockDb.createInviteToken(inviteRole, inviteExpiry);
      loadInviteTokens();
    } catch (e: any) {
      alert('Erro ao gerar convite: ' + e.message);
    }
    setInviteGenerating(false);
  };
  const deleteInviteToken = async (id: string) => {
    try {
      await mockDb.deleteInviteToken(id);
      loadInviteTokens();
    } catch (e: any) {
      alert('Erro: ' + e.message);
    }
  };
  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    const [logs, mats, cols, colProgress] = await Promise.all([
    mockDb.getAccessLogs(),
    mockDb.getMaterials("super_admin"),
    mockDb.getCollections("super_admin"),
    mockDb.getAllCollectionProgress()]
    );
    setAccessLogs(logs);
    setMaterials(mats);
    setCollections(cols);
    setCollectionProgress(colProgress);
    setAnalyticsLoading(false);
  };

  const handleOpenCreate = () => {
    setEditingMaterial(null);
    setIsFormOpen(true);
  };
  const handleOpenEdit = (material: Material) => {
    setEditingMaterial(material);
    setIsFormOpen(true);
  };

  const handleSaveMaterial = async (materialData: any) => {
    try {
      if (materialData.id) await mockDb.updateMaterial(materialData);else
      await mockDb.createMaterial(materialData);
      loadMaterials();
    } catch (e: any) {
      alert("Erro ao salvar material: " + (e.message || JSON.stringify(e)));
    }
  };

  const handleToggleActive = async (material: Material) => {
    try {
      await mockDb.updateMaterial({ ...material, active: !material.active });
      loadMaterials();
    } catch (e: any) {
      alert("Erro ao atualizar status: " + e.message);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === "material") {
        await mockDb.deleteMaterial(itemToDelete.id);
        loadMaterials();
      } else if (itemToDelete.type === "collection") {
        await mockDb.deleteCollection(itemToDelete.id);
        loadCollections();
      } else {
        await mockDb.deleteUser(itemToDelete.id);
        loadUsers();
      }
    } catch (e: any) {
      alert("Erro ao excluir: " + e.message);
    }
    setIsConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleDeleteMaterial = (id: string) => {
    setItemToDelete({ type: "material", id });
    setIsConfirmOpen(true);
  };

  const handleView = (material: Material) => {
    const langs: Language[] = ["pt-br", "en-us", "es-es"];
    const availableLang = langs.find((l) => material.assets[l]?.url);
    if (availableLang) setViewingMaterial({ mat: material, lang: availableLang });else
    alert(t("no.materials"));
  };

  const filteredMaterials = useMemo(() => {
    return materials.
    filter((mat) => {
      const displayTitle = (
      mat.title[language] ||
      mat.title["pt-br"] ||
      Object.values(mat.title)[0] ||
      "").
      toLowerCase();
      const matchesSearch = displayTitle.includes(materialSearch.toLowerCase());
      const matchesType = materialTypeFilter === "all" || mat.type === materialTypeFilter;
      const matchesStatus =
      materialStatusFilter === "all" ? true : materialStatusFilter === "active" ? mat.active : !mat.active;
      return matchesSearch && matchesType && matchesStatus;
    }).
    sort((a, b) => {
      const titleA = (a.title[language] || a.title["pt-br"] || "").toLowerCase();
      const titleB = (b.title[language] || b.title["pt-br"] || "").toLowerCase();
      return titleA.localeCompare(titleB);
    });
  }, [materials, materialSearch, materialTypeFilter, materialStatusFilter, language]);

  const handleUserStatus = async (userId: string, status: UserStatus, rejectionReason?: string) => {
    try {
      await mockDb.updateUserStatus(userId, status, rejectionReason);
      loadUsers();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  const handleRejectUser = (user: UserProfile) => {
    setRejectingUser(user);
  };

  const handleConfirmReject = async (reason: string) => {
    if (!rejectingUser) return;
    await handleUserStatus(rejectingUser.id, 'rejected', reason);
    setRejectingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setItemToDelete({ type: "user", id: userId });
    setIsConfirmOpen(true);
  };

  const handleSaveUser = async (updatedUser: UserProfile) => {
    try {
      await mockDb.updateUser(updatedUser);
      loadUsers();
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  const handleCopyLink = (url: string, role: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(role);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const filteredUsers = useMemo(() => {
    return users.
    filter((user) => {
      const matchesSearch =
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase());
      const matchesRole = userRoleFilter === "all" || user.role === userRoleFilter;
      const matchesStatus = userStatusFilter === "all" || user.status === userStatusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    }).
    sort((a, b) => a.name.localeCompare(b.name));
  }, [users, userSearch, userRoleFilter, userStatusFilter]);

  const filteredLogs = useMemo(() => {
    return accessLogs.filter((log) => {
      if (analyticsRoleFilter !== "all" && log.userRole !== analyticsRoleFilter) return false;
      if (analyticsTypeFilter !== "all") {
        const mat = materials.find((m) => m.id === log.materialId);
        if (mat?.type !== analyticsTypeFilter) return false;
      }
      return true;
    });
  }, [accessLogs, analyticsRoleFilter, analyticsTypeFilter, materials]);

  const aggregatedMetrics = useMemo(() => {
    const map = new Map<string, {views: number;uniqueUsers: Set<string>;lastAccess: string | null;}>();
    materials.forEach((m) => {
      if (analyticsTypeFilter === "all" || m.type === analyticsTypeFilter)
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
    return Array.from(map.entries()).
    map(([id, stats]) => ({
      id,
      material: materials.find((m) => m.id === id),
      views: stats.views,
      uniqueUsers: stats.uniqueUsers.size,
      lastAccess: stats.lastAccess
    })).
    filter((item) => item.material).
    sort((a, b) => b.views - a.views);
  }, [filteredLogs, materials, analyticsTypeFilter]);

  const activeUsersRanking = useMemo(() => {
    const userCounts: Record<string, {name: string;role: Role;count: number;}> = {};
    filteredLogs.forEach((log) => {
      if (!userCounts[log.userId]) userCounts[log.userId] = { name: log.userName, role: log.userRole, count: 0 };
      userCounts[log.userId].count++;
    });
    return Object.values(userCounts).
    sort((a, b) => b.count - a.count).
    slice(0, 5);
  }, [filteredLogs]);

  const openAnalyticsDetail = (materialId: string) => {
    const mat = materials.find((m) => m.id === materialId);
    const logs = filteredLogs.
    filter((l) => l.materialId === materialId).
    sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (mat) setAnalyticsDetail({ material: mat, logs });
  };

  const handleSaveSettings = async () => {
    try {
      await updateConfig(localConfig);
      alert("Configurações salvas e aplicadas!");
    } catch (e: any) {
      alert("Erro: " + e.message);
    }
  };

  const renderTabButton = (id: typeof activeTab, label: string, Icon: any) =>
  <button
    onClick={() => setActiveTab(id)}
    className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? "liquid-glass-gold shadow-sm" : ""}`}
    style={
    activeTab === id ?
    { color: "var(--color-accent)" } :
    { color: "var(--color-text-muted)" }
    }>

      <div className={`icon-box-sm ${activeTab === id ? '!bg-transparent !border-transparent' : ''}`}>
        <Icon size={14} />
      </div>
      <span className="hidden sm:inline">{label}</span>
    </button>;


  const renderSettingsSidebarItem = (id: typeof settingsTab, label: string, Icon: any) =>
  <button
    onClick={() => setSettingsTab(id)}
    className={`shrink-0 md:w-full flex items-center justify-between px-3 py-2.5 md:px-4 md:py-3 rounded-lg text-xs md:text-sm font-medium transition-colors mb-1 whitespace-nowrap ${settingsTab === id ? "liquid-glass-gold" : ""}`}
    style={settingsTab === id ? { color: "var(--color-accent)" } : { color: "var(--color-text-muted)" }}>

      <div className="flex items-center gap-2 md:gap-3">
        <div className={`icon-box-sm ${settingsTab === id ? '!bg-transparent !border-transparent' : ''}`}>
          <Icon size={14} />
        </div>
        <span className="hidden md:inline">{label}</span>
      </div>
      {settingsTab === id && <ChevronRight size={16} className="opacity-75 hidden md:block" />}
    </button>;


  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
            {t("admin.title")}
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Gerencie materiais, usuários e a aparência da plataforma.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg p-1 gap-1" style={{ backgroundColor: "var(--color-bg)" }}>
          {renderTabButton("materials", t("tab.materials"), ImageIcon)}
          {renderTabButton("users", t("tab.users"), Users)}
          {renderTabButton("collections", "Trilhas", BookOpen)}
          {renderTabButton("analytics", t("tab.analytics"), BarChart2)}
          {renderTabButton("settings", t("tab.settings"), Settings)}
        </div>
      </div>

      {/* Materials Tab */}
      {activeTab === "materials" &&
      <div className="animate-fade-in">
          <div
          className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6"
          style={{ backgroundColor: "var(--color-surface)" }}>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
              type="text"
              placeholder={t("search.placeholder")}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2"
              style={{ color: "var(--color-text-main)" }}
              value={materialSearch}
              onChange={(e) => setMaterialSearch(e.target.value)} />

            </div>
            <div className="flex w-full md:w-auto gap-3">
              <select
              className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none"
              style={{ color: "var(--color-text-main)" }}
              value={materialTypeFilter}
              onChange={(e) => setMaterialTypeFilter(e.target.value as any)}>

                <option value="all">{t("filter.all")}</option>
                <option value="pdf">{t("material.type.pdf")}</option>
                <option value="image">{t("material.type.image")}</option>
                <option value="video">{t("material.type.video")}</option>
              </select>
              <select
              className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none"
              style={{ color: "var(--color-text-main)" }}
              value={materialStatusFilter}
              onChange={(e) => setMaterialStatusFilter(e.target.value as any)}>

                <option value="all">{t("user.filter.status.all")}</option>
                <option value="active">{t("active")}</option>
                <option value="inactive">{t("inactive")}</option>
              </select>
            </div>
            <button
            onClick={handleOpenCreate}
            className="liquid-glass-gold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105 whitespace-nowrap"
            style={{ color: "var(--color-accent)" }}>

              <Plus size={20} />
              <span className="hidden md:inline">{t("add.material")}</span>
            </button>
          </div>

          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
            {/* Mobile card view */}
            <div className="block md:hidden divide-y" style={{ borderColor: "var(--color-border)" }}>
              {filteredMaterials.map((mat) => {
                const displayTitle = mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Untitled";
                return (
                  <div key={mat.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-main)" }} title={displayTitle}>{displayTitle}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs capitalize opacity-75" style={{ color: "var(--color-text-muted)" }}>{mat.type}</span>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${mat.active ? "bg-green-500/10 text-green-600" : ""}`}
                            style={!mat.active ? { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } : {}}>
                            {mat.active ? t("active") : t("inactive")}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                            <Star size={10} /> {mat.points || 0}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleView(mat)} className="p-1.5 rounded-lg" style={{ color: "var(--color-text-muted)" }}><Eye size={16} /></button>
                        <button onClick={() => handleOpenEdit(mat)} className="p-1.5 rounded-lg" style={{ color: "var(--color-accent)" }}><Edit size={16} /></button>
                        <button onClick={() => handleDeleteMaterial(mat.id)} className="p-1.5 rounded-lg text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {mat.allowedRoles.map((r) => (
                        <span key={r} className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>{t(`role.${r}`)}</span>
                      ))}
                      {Object.keys(mat.assets).map((lang) => (
                        <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>{lang.split("-")[0]}</span>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredMaterials.length === 0 && (
                <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>Nenhum material encontrado.</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead
                className="text-xs uppercase font-semibold"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                  <tr>
                    <th className="p-4">{t("title")}</th>
                    <th className="p-4">{t("type")}</th>
                    <th className="p-4 text-center">{t("status")}</th>
                    <th className="p-4">{t("permissions")}</th>
                    <th className="p-4">Assets</th>
                    <th className="p-4 text-center">XP</th>
                    <th className="p-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredMaterials.map((mat) => {
                  const displayTitle =
                  mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Untitled";
                  return (
                    <tr key={mat.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                        <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>
                          {displayTitle}
                        </td>
                        <td className="p-4 capitalize opacity-75">{mat.type}</td>
                        <td className="p-4 text-center">
                          <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${mat.active ? "bg-green-500/10 text-green-600" : "text-gray-400"}`}
                          style={
                          !mat.active ?
                          { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } :
                          {}
                          }>

                            {mat.active ? t("active") : t("inactive")}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex -space-x-1">
                            {mat.allowedRoles.map((r) =>
                          <div
                            key={r}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] uppercase font-bold shadow-sm"
                            title={t(`role.${r}`)}
                            style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                                {r[0]}
                              </div>
                          )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {Object.keys(mat.assets).map((lang) =>
                          <span
                            key={lang}
                            className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold"
                            style={{
                              backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                              color: "var(--color-accent)"
                            }}>

                                {lang.split("-")[0]}
                              </span>
                          )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span
                          className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{
                            backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                            color: "var(--color-accent)"
                          }}>

                            <Star size={12} /> {mat.points || 0}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1">
                            <button
                            onClick={() => handleView(mat)}
                            className="p-2 rounded-lg"
                            style={{ color: "var(--color-text-muted)" }}>

                              <Eye size={18} />
                            </button>
                            <button
                            onClick={() => handleToggleActive(mat)}
                            className="p-2 rounded-lg"
                            style={{ color: mat.active ? "var(--color-text-muted)" : "var(--color-text-muted)" }}>

                              {mat.active ? <Eye size={18} /> : <EyeOff size={18} />}
                            </button>
                            <button
                            onClick={() => handleOpenEdit(mat)}
                            className="p-2 rounded-lg"
                            style={{ color: "var(--color-accent)" }}>

                              <Edit size={18} />
                            </button>
                            <button
                            onClick={() => handleDeleteMaterial(mat.id)}
                            className="p-2 rounded-lg text-red-500">

                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>);

                })}
                  {filteredMaterials.length === 0 &&
                <tr>
                      <td colSpan={7} className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                        Nenhum material encontrado.
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {/* Collections Tab */}
      {activeTab === "collections" &&
      <div className="animate-fade-in space-y-6">
          <div
          className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 rounded-xl shadow-sm"
          style={{ backgroundColor: "var(--color-surface)" }}>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
              type="text"
              placeholder="Buscar coleções..."
              className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
              value={collectionSearch}
              onChange={(e) => setCollectionSearch(e.target.value)} />

            </div>
            <button
            onClick={() => {
              setEditingCollection(null);
              setIsCollectionFormOpen(true);
            }}
            className="liquid-glass-gold flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap"
            style={{ color: "var(--color-accent)" }}>

              <PlusCircle size={16} /> Nova Trilha
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {collections.
          filter((c) =>
          (c.title["pt-br"] || Object.values(c.title)[0] || "").
          toLowerCase().
          includes(collectionSearch.toLowerCase())
          ).
          map((col) => {
            const title = col.title["pt-br"] || Object.values(col.title)[0] || "Sem título";
            return (
              <div
                key={col.id}
                className="rounded-2xl border border-white/10 p-5 space-y-3"
                style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 60%, transparent)" }}>

                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                      className="icon-box">

                          <BookOpen size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-sm" style={{ color: "var(--color-text-main)" }}>
                            {title}
                          </p>
                          <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                            {col.points} XP · {col.active ? "Ativa" : "Inativa"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button
                      onClick={() => {
                        setEditingCollection(col);
                        setIsCollectionFormOpen(true);
                      }}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-accent)" }}>

                          <Edit size={16} />
                        </button>
                        <button
                      onClick={() => {
                        setItemToDelete({ type: "collection", id: col.id });
                        setIsConfirmOpen(true);
                      }}
                      className="p-2 rounded-lg text-red-500">

                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {col.allowedRoles.map((r) =>
                  <span
                    key={r}
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)",
                      color: "var(--color-accent)"
                    }}>

                          {t(`role.${r}`)}
                        </span>
                  )}
                    </div>
                  </div>);

          })}
            {collections.length === 0 &&
          <div className="col-span-3 py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
                <Layers size={40} className="mx-auto mb-3 opacity-30" />
                <p>Nenhuma trilha criada ainda.</p>
              </div>
          }
          </div>
        </div>
      }

      {/* Analytics Tab */}

      {activeTab === "analytics" &&
      <div className="animate-fade-in space-y-6">
          <div
          className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center"
          style={{ backgroundColor: "var(--color-surface)" }}>

            <div
            className="flex items-center gap-2 font-bold uppercase text-xs mr-auto"
            style={{ color: "var(--color-text-muted)" }}>

              <Filter size={16} /> Filtros de Métricas
            </div>
            <select
            className="w-full md:w-auto pl-3 pr-8 py-2.5 rounded-lg text-sm outline-none focus:ring-2 border cursor-pointer appearance-none bg-no-repeat bg-[length:12px] bg-[right_10px_center]"
            style={{ color: "var(--color-text-main)", backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            value={analyticsTypeFilter}
            onChange={(e) => setAnalyticsTypeFilter(e.target.value as any)}>

              <option value="all">Todos os Materiais</option>
              <option value="pdf">{t("material.type.pdf")}</option>
              <option value="image">{t("material.type.image")}</option>
              <option value="video">{t("material.type.video")}</option>
              <option value="trails">Trilhas</option>
            </select>
            <select
            className="w-full md:w-auto pl-3 pr-8 py-2.5 rounded-lg text-sm outline-none focus:ring-2 border cursor-pointer appearance-none bg-no-repeat bg-[length:12px] bg-[right_10px_center]"
            style={{ color: "var(--color-text-main)", backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")` }}
            value={analyticsRoleFilter}
            onChange={(e) => setAnalyticsRoleFilter(e.target.value as any)}>

              <option value="all">Todos os Perfis</option>
              <option value="client">{t("role.client")}</option>
              <option value="distributor">{t("role.distributor")}</option>
              <option value="consultant">{t("role.consultant")}</option>
            </select>
            <div className="flex gap-2">
              <button
              onClick={exportAnalyticsCsv}
              className="liquid-glass-gold px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105 whitespace-nowrap text-sm"
              style={{ color: "var(--color-accent)" }}>

                <Download size={16} />
                <span className="hidden md:inline">CSV</span>
              </button>
              







            </div>
          </div>

          <div ref={analyticsRef} className="space-y-8">

          {/* === ALL KPI CARDS === */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
              <BarChart2 size={14} /> Visão Geral
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><Eye size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.total.views")}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{filteredLogs.length}</p>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><Users size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.unique.users")}</p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{new Set(filteredLogs.map((l) => l.userId)).size}</p>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><TrendingUp size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.top.material")}</p>
                <p className="text-base font-bold truncate" style={{ color: "var(--color-text-main)" }}>
                  {aggregatedMetrics[0]?.material ?
                  aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title["pt-br"] :
                  "N/A"}
                </p>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><Target size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Trilhas Iniciadas</p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{collectionProgress.length}</p>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><Award size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Trilhas Concluídas</p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{collectionProgress.filter((p) => p.status === "completed").length}</p>
              </div>
              <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="icon-box-sm"><TrendingUp size={14} /></div>
                <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>Taxa de Conclusão</p>
                <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
                  {collectionProgress.length > 0 ? Math.round(collectionProgress.filter((p) => p.status === "completed").length / collectionProgress.length * 100) : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* === RANKINGS === */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
              <Trophy size={14} /> Rankings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="px-6 py-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 30%, transparent)" }}>
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                    <Trophy size={18} className="text-yellow-500" />
                    {t("analytics.rank.materials")}
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {aggregatedMetrics.slice(0, 5).map((item, index) => {
                    const mat = item.material;
                    if (!mat) return null;
                    const title = mat.title[language] || mat.title["pt-br"];
                    const percentage = Math.round(item.views / filteredLogs.length * 100) || 0;
                    return (
                      <div key={item.id} className="relative">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium truncate pr-2 flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                            <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? "bg-yellow-100 text-yellow-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : ""}`}
                              style={index > 2 ? { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } : {}}>

                              {index + 1}
                            </span>
                            {title}
                          </span>
                          <span className="font-bold" style={{ color: "var(--color-accent)" }}>{item.views}</span>
                        </div>
                        <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                          <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: "var(--color-accent)" }}></div>
                        </div>
                      </div>);

                  })}
                  {aggregatedMetrics.length === 0 &&
                  <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>Sem dados</p>
                  }
                </div>
              </div>

              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="px-6 py-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 30%, transparent)" }}>
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                    <Users size={18} className="text-blue-500" />
                    {t("analytics.rank.users")}
                  </h3>
                </div>
                <div className="p-5 space-y-2">
                  {activeUsersRanking.map((user, index) =>
                  <div key={index} className="flex items-center justify-between p-2.5 rounded-lg transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium" style={{ color: "var(--color-text-main)" }}>{user.name}</p>
                          <p className="text-[10px] uppercase font-bold" style={{ color: "var(--color-text-muted)" }}>{t(`role.${user.role}`)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold" style={{ color: "var(--color-text-main)" }}>{user.count}</p>
                        <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>acessos</p>
                      </div>
                    </div>
                  )}
                  {activeUsersRanking.length === 0 &&
                  <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>Sem dados</p>
                  }
                </div>
              </div>

              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="px-6 py-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 30%, transparent)" }}>
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                    <BookOpen size={18} className="text-emerald-500" />
                    Ranking de Trilhas
                  </h3>
                </div>
                <div className="p-5 space-y-4">
                  {collections.
                  map((col) => {
                    const colTitle = (col.title as any)[language] || (col.title as any)["pt-br"] || "Sem título";
                    const started = collectionProgress.filter((p) => p.collectionId === col.id).length;
                    const completed = collectionProgress.filter((p) => p.collectionId === col.id && p.status === "completed").length;
                    return { id: col.id, title: colTitle, started, completed, points: col.points || 0 };
                  }).
                  sort((a, b) => b.started - a.started).
                  slice(0, 5).
                  map((trail, index) => {
                    const rate = trail.started > 0 ? Math.round(trail.completed / trail.started * 100) : 0;
                    return (
                      <div key={trail.id} className="relative">
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium truncate pr-2 flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                              <span
                              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${index === 0 ? "bg-emerald-100 text-emerald-700" : index === 1 ? "bg-gray-100 text-gray-700" : index === 2 ? "bg-orange-100 text-orange-700" : ""}`}
                              style={index > 2 ? { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } : {}}>

                                {index + 1}
                              </span>
                              {trail.title}
                            </span>
                            <span className="font-bold text-emerald-600">{trail.started}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }}></div>
                            </div>
                            <span className="text-[10px] font-bold" style={{ color: "var(--color-text-muted)" }}>{rate}%</span>
                          </div>
                        </div>);

                  })}
                  {collections.length === 0 &&
                  <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>Sem dados</p>
                  }
                </div>
              </div>
            </div>
          </div>

          {/* === TABLES === */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
              <FileText size={14} /> Detalhamento
            </h3>
            <div className="space-y-6">
              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="px-6 py-4">
                  <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>Desempenho Geral</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                      <tr>
                        <th className="p-4">{t("title")}</th>
                        <th className="p-4">{t("type")}</th>
                        <th className="p-4 text-center">{t("analytics.col.views")}</th>
                        <th className="p-4 text-center">{t("analytics.col.users")}</th>
                        <th className="p-4 text-right">{t("analytics.col.last_access")}</th>
                        <th className="p-4 text-right">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {aggregatedMetrics.map((item) => {
                        const mat = item.material;
                        if (!mat) return null;
                        const displayTitle = mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Untitled";
                        return (
                          <tr key={item.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                            <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                            <td className="p-4 capitalize opacity-75">{mat.type}</td>
                            <td className="p-4 text-center font-bold">{item.views}</td>
                            <td className="p-4 text-center">{item.uniqueUsers}</td>
                            <td className="p-4 text-right tabular-nums" style={{ color: "var(--color-text-muted)" }}>
                              {item.lastAccess ? new Date(item.lastAccess).toLocaleDateString(language) : "-"}
                            </td>
                            <td className="p-4 text-right">
                              <button onClick={() => openAnalyticsDetail(item.id)} className="p-2 rounded-lg transition-colors" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                                <BarChart2 size={16} />
                              </button>
                            </td>
                          </tr>);

                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="px-6 py-4">
                  <h3 className="font-bold" style={{ color: "var(--color-text-main)" }}>Desempenho por Trilha</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
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
                        const colTitle = (col.title as any)[language] || (col.title as any)["pt-br"] || "Sem título";
                        const started = collectionProgress.filter((p) => p.collectionId === col.id).length;
                        const completed = collectionProgress.filter((p) => p.collectionId === col.id && p.status === "completed").length;
                        const rate = started > 0 ? Math.round(completed / started * 100) : 0;
                        return (
                          <tr key={col.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                            <td className="p-4 font-medium max-w-xs truncate">{colTitle}</td>
                            <td className="p-4 text-center" style={{ color: "var(--color-text-muted)" }}>{col.itemCount || "—"}</td>
                            <td className="p-4 text-center font-bold">{started}</td>
                            <td className="p-4 text-center font-bold text-emerald-600">{completed}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${rate}%` }}></div>
                                </div>
                                <span className="text-xs font-bold" style={{ color: "var(--color-text-muted)" }}>{rate}%</span>
                              </div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                                <Star size={12} /> {col.points || 0}
                              </span>
                            </td>
                          </tr>);

                      })}
                      {collections.length === 0 &&
                      <tr>
                          <td colSpan={6} className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>Nenhuma trilha cadastrada.</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          </div>
        </div>
      }

      {/* Users Tab */}
      {activeTab === "users" &&
      <div className="animate-fade-in space-y-6">
          <div
          className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center"
          style={{ backgroundColor: "var(--color-surface)" }}>

            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
              type="text"
              placeholder="Buscar por nome ou email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none focus:ring-2"
              style={{ color: "var(--color-text-main)" }}
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)} />

            </div>
            <div className="flex w-full md:w-auto gap-3">
              <select
              className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none"
              style={{ color: "var(--color-text-main)" }}
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as any)}>

                <option value="all">{t("user.filter.all")}</option>
                <option value="client">{t("role.client")}</option>
                <option value="distributor">{t("role.distributor")}</option>
                <option value="consultant">{t("role.consultant")}</option>
              </select>
              <select
              className="flex-1 md:w-40 p-2 rounded-lg bg-gray-50 dark:bg-black/20 text-sm outline-none"
              style={{ color: "var(--color-text-main)" }}
              value={userStatusFilter}
              onChange={(e) => setUserStatusFilter(e.target.value as any)}>

                <option value="all">{t("user.filter.status.all")}</option>
                <option value="pending">{t("user.status.pending")}</option>
                <option value="active">{t("user.status.active")}</option>
                <option value="inactive">{t("user.status.inactive")}</option>
                <option value="rejected">{t("user.status.rejected")}</option>
              </select>
            </div>
            <button
            onClick={() => {
              const headers = ['Nome', 'Email', 'WhatsApp', 'CRO', 'Perfil', 'Status', 'Pontos'];
              const rows = filteredUsers.map((u) => [
              u.name,
              u.email,
              u.whatsapp || '',
              u.cro || '',
              u.role,
              u.status,
              String(u.points)].
              map((v) => `"${v.replace(/"/g, '""')}"`).join(','));
              const csv = [headers.join(','), ...rows].join('\n');
              const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `usuarios_${new Date().toISOString().slice(0, 10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
            }}
            className="liquid-glass-gold px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg transition-all hover:scale-105 whitespace-nowrap"
            style={{ color: "var(--color-accent)" }}>

              <Download size={18} />
              <span className="hidden md:inline">Exportar CSV</span>
            </button>
          </div>

          <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
            {/* Mobile card view */}
            <div className="block md:hidden divide-y" style={{ borderColor: "var(--color-border)" }}>
              {filteredUsers.map((user) => (
                <div key={user.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm" style={{ color: "var(--color-text-main)" }}>{user.name}</p>
                      <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{user.email}</p>
                      {user.whatsapp && <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{user.whatsapp}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {user.status === "pending" && (
                        <>
                          <button onClick={() => handleUserStatus(user.id, "active")} className="p-1.5 rounded-lg text-green-500"><CheckCircle size={16} /></button>
                          <button onClick={() => handleRejectUser(user)} className="p-1.5 rounded-lg text-red-500"><XCircle size={16} /></button>
                        </>
                      )}
                      <button onClick={() => setUserEditing(user)} className="p-1.5 rounded-lg" style={{ color: "var(--color-accent)" }}><Edit size={16} /></button>
                      <button onClick={() => handleDeleteUser(user.id)} className="p-1.5 rounded-lg text-red-500"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>{t(`role.${user.role}`)}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                      user.status === "active" ? "bg-green-500/10 text-green-600" :
                      user.status === "pending" ? "bg-yellow-500/10 text-yellow-600" :
                      user.status === "rejected" ? "bg-red-500/10 text-red-600" : ""}`}
                      style={user.status === "inactive" ? { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } : {}}>
                      {t(`user.status.${user.status}`)}
                    </span>
                    {user.cro && <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>CRO: {user.cro}</span>}
                  </div>
                </div>
              ))}
              {filteredUsers.length === 0 && (
                <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>Nenhum usuário encontrado.</div>
              )}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                <thead
                className="text-xs uppercase font-semibold"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                  <tr>
                    <th className="p-4">Usuário</th>
                    <th className="p-4">Contatos</th>
                    <th className="p-4">Perfil</th>
                    <th className="p-4">{t("permissions")}</th>
                    <th className="p-4 text-center">{t("status")}</th>
                    <th className="p-4 text-right">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredUsers.map((user) =>
                <tr key={user.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                      <td className="p-4">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                          {user.cro ? `CRO: ${user.cro}` : "N/A"}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1">
                          <div className="flex items-center gap-1">
                            <span style={{ color: "var(--color-text-muted)" }}>E:</span> {user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <span style={{ color: "var(--color-text-muted)" }}>W:</span> {user.whatsapp}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                      className="text-xs font-bold uppercase tracking-wide px-2 py-1 rounded"
                      style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                          {t(`role.${user.role}`)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {!user.allowedTypes || user.allowedTypes.length === 0 ?
                      <span
                        className="text-[10px] uppercase font-bold px-2 py-1 rounded"
                        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                              Todos
                            </span> :

                      user.allowedTypes.map((type) =>
                      <div
                        key={type}
                        className="p-1 rounded"
                        title={t(`material.type.${type}`)}
                        style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                                {type === "pdf" && <FileText size={14} />}
                                {type === "image" && <ImageIcon size={14} />}
                                {type === "video" && <Video size={14} />}
                              </div>
                      )
                      }
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize
                            ${
                      user.status === "active" ?
                      "bg-green-500/10 text-green-600" :
                      user.status === "pending" ?
                      "bg-yellow-500/10 text-yellow-600" :
                      user.status === "rejected" ?
                      "bg-red-500/10 text-red-600" :
                      ""}
                          `
                      }
                      style={
                      user.status === "inactive" ?
                      { backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" } :
                      {}
                      }>

                          {t(`user.status.${user.status}`)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1 items-center">
                          {user.status === "pending" &&
                      <>
                              <button
                          onClick={() => handleUserStatus(user.id, "active")}
                          className="p-2 rounded-lg text-green-500"
                          title={t("user.action.approve")}>

                                <CheckCircle size={18} />
                              </button>
                              <button
                          onClick={() => handleRejectUser(user)}
                          className="p-2 rounded-lg text-red-500"
                          title={t("user.action.reject")}>

                                <XCircle size={18} />
                              </button>
                            </>
                      }
                          <button
                        onClick={() => setUserEditing(user)}
                        className="p-2 rounded-lg ml-1"
                        title={t("edit")}
                        style={{ color: "var(--color-accent)" }}>

                            <Edit size={18} />
                          </button>
                          <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 rounded-lg text-red-500 ml-1"
                        title={t("delete")}>

                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                )}
                  {filteredUsers.length === 0 &&
                <tr>
                      <td colSpan={6} className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>
                        Nenhum usuário encontrado.
                      </td>
                    </tr>
                }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }

      {/* Settings Tab */}
      {activeTab === "settings" &&
      <div className="animate-fade-in pb-12">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <aside className="w-full md:w-64 shrink-0">
              <div
              className="rounded-xl p-2 shadow-sm md:sticky md:top-4 flex md:flex-col overflow-x-auto md:overflow-visible no-scrollbar gap-1"
              style={{ backgroundColor: "var(--color-surface)" }}>

                <p
                className="hidden md:block px-4 py-2 text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: "var(--color-text-muted)" }}>
                  Opções
                </p>
                {renderSettingsSidebarItem("identity", "Identidade Visual", Type)}
                {renderSettingsSidebarItem("integrations", "Integrações", Webhook)}
                {renderSettingsSidebarItem("themes", "Temas", Palette)}
                {renderSettingsSidebarItem("gamification", "Gamificação", Trophy)}
                {renderSettingsSidebarItem("invites", t("user.invite"), Share2)}
              </div>
            </aside>

            <div className="flex-1 min-w-0 space-y-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                  {settingsTab === "identity" &&
                <>
                      <div className="icon-box"><Type size={20} /></div> Identidade Visual
                    </>
                }
                  {settingsTab === "integrations" &&
                <>
                      <div className="icon-box"><Webhook size={20} /></div> Integrações
                    </>
                }
                  {settingsTab === "themes" &&
                <>
                      <div className="icon-box"><Palette size={20} /></div> Personalização de Temas
                    </>
                }
                  {settingsTab === "invites" &&
                <>
                      <div className="icon-box"><Share2 size={20} /></div> {t("user.invite")}
                    </>
                }
                  {settingsTab === "gamification" &&
                <>
                      <div className="icon-box"><Trophy size={20} /></div> Patentes & XP
                    </>
                }
                </h3>
                {settingsTab !== "invites" && settingsTab !== "gamification" &&
              <button
                onClick={handleSaveSettings}
                className="liquid-glass-gold px-5 py-2 rounded-lg text-sm font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                style={{ color: "var(--color-accent)" }}>

                    <Save size={18} /> Salvar Alterações
                  </button>
              }
              </div>

               {settingsTab === "identity" &&
            <div
              className="p-6 rounded-xl shadow-sm animate-fade-in space-y-6"
              style={{ backgroundColor: "var(--color-surface)" }}>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-main)" }}>
                      Nome da Aplicação
                    </label>
                    <input
                      type="text"
                      value={localConfig.appName}
                      onChange={(e) => setLocalConfig({ ...localConfig, appName: e.target.value })}
                      className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-black/20 focus:ring-2 outline-none"
                      style={{ color: "var(--color-text-main)" }} />
                  </div>

                  {/* Logo Section */}
                  <div>
                    <label className="block text-sm font-medium mb-3" style={{ color: "var(--color-text-main)" }}>
                      Logo da Plataforma
                    </label>
                    
                    {/* Preview */}
                    <div className="mb-4 p-4 rounded-xl flex items-center gap-4" style={{ backgroundColor: "var(--color-bg)" }}>
                      <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden" style={{ backgroundColor: "var(--color-surface)", border: "1px dashed var(--color-border)" }}>
                        {localConfig.logoUrl ? (
                          <img src={localConfig.logoUrl} className="w-full h-full object-contain p-1" alt="Logo preview" />
                        ) : (
                          <ImageIcon size={24} style={{ color: "var(--color-text-muted)" }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "var(--color-text-main)" }}>
                          {localConfig.logoUrl ? localConfig.logoUrl.split('/').pop() || 'Logo configurado' : 'Nenhum logo definido'}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                          Formatos aceitos: PNG, SVG, JPG, WEBP
                        </p>
                      </div>
                      {localConfig.logoUrl && (
                        <button
                          onClick={() => setLocalConfig({ ...localConfig, logoUrl: '' })}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                          title="Remover logo"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>

                    {/* Three options */}
                    <div className="grid gap-3">
                      {/* Option 1: URL */}
                      <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <LinkIcon size={14} style={{ color: "var(--color-accent)" }} />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Link externo</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="https://exemplo.com/logo.png"
                            value={localConfig.logoUrl?.startsWith('/') ? '' : (localConfig.logoUrl || '')}
                            onChange={(e) => setLocalConfig({ ...localConfig, logoUrl: e.target.value })}
                            className="flex-1 p-2 rounded-lg text-sm outline-none focus:ring-2"
                            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }}
                          />
                        </div>
                      </div>

                      {/* Option 2: Public folder reference */}
                      <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <FolderOpen size={14} style={{ color: "var(--color-accent)" }} />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Arquivo local (pasta public)</span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="/logo.png, /images/brand.svg..."
                            value={localConfig.logoUrl?.startsWith('/') ? localConfig.logoUrl : ''}
                            onChange={(e) => {
                              let val = e.target.value;
                              if (val && !val.startsWith('/')) val = '/' + val;
                              setLocalConfig({ ...localConfig, logoUrl: val });
                            }}
                            className="flex-1 p-2 rounded-lg text-sm outline-none focus:ring-2"
                            style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }}
                          />
                        </div>
                        <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                          Ex: /favicon.ico, /logo.png — arquivos na pasta public do projeto
                        </p>
                      </div>

                      {/* Option 3: Upload */}
                      <div className="p-3 rounded-xl" style={{ backgroundColor: "var(--color-bg)" }}>
                        <div className="flex items-center gap-2 mb-2">
                          <Upload size={14} style={{ color: "var(--color-accent)" }} />
                          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-accent)" }}>Fazer upload</span>
                        </div>
                        <label className="flex items-center justify-center gap-2 p-3 rounded-lg cursor-pointer transition-all hover:scale-[1.01]" style={{ backgroundColor: "var(--color-surface)", border: "1px dashed var(--color-border)" }}>
                          <Upload size={16} style={{ color: "var(--color-text-muted)" }} />
                          <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>Clique para selecionar imagem</span>
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml,image/webp"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const ext = file.name.split('.').pop() || 'png';
                                const fileName = `logo-${Date.now()}.${ext}`;
                                const { data: uploadData, error: uploadError } = await (await import('@/integrations/supabase/client')).supabase.storage
                                  .from('branding')
                                  .upload(fileName, file, { upsert: true });
                                if (uploadError) throw uploadError;
                                const { data: urlData } = (await import('@/integrations/supabase/client')).supabase.storage
                                  .from('branding')
                                  .getPublicUrl(uploadData.path);
                                setLocalConfig({ ...localConfig, logoUrl: urlData.publicUrl });
                              } catch (err: any) {
                                alert('Erro ao enviar logo: ' + err.message);
                              }
                            }}
                          />
                        </label>
                        <p className="text-[10px] mt-1.5" style={{ color: "var(--color-text-muted)" }}>
                          O arquivo será salvo no armazenamento da plataforma
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
            }

              {settingsTab === "integrations" &&
            <div
              className="p-6 rounded-xl shadow-sm animate-fade-in"
              style={{ backgroundColor: "var(--color-surface)" }}>

                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-main)" }}>
                      URL do Webhook (N8N)
                    </label>
                    <div className="flex gap-2">
                      <div
                    className="p-3 rounded-l-lg font-bold text-xs flex items-center"
                    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>

                        POST
                      </div>
                      <input
                    type="text"
                    placeholder="https://n8n.seu-dominio.com/webhook/..."
                    value={localConfig.webhookUrl || ""}
                    onChange={(e) => setLocalConfig({ ...localConfig, webhookUrl: e.target.value })}
                    className="flex-1 p-2.5 rounded-r-lg bg-gray-50 dark:bg-black/20 focus:ring-2 outline-none font-mono text-sm"
                    style={{ color: "var(--color-text-main)" }} />

                    </div>
                    <p className="text-xs mt-3 leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      Esta URL será chamada via POST com um payload JSON sempre que uma mensagem for enviada.
                    </p>
                  </div>
                </div>
            }

              {settingsTab === "themes" &&
                <ThemeEditorPanel localConfig={localConfig} setLocalConfig={setLocalConfig} />
              }

              {settingsTab === "invites" &&
            <div
              className="p-6 rounded-xl shadow-sm animate-fade-in space-y-6"
              style={{ backgroundColor: "var(--color-surface)" }}>

                  <div
                className="p-4 rounded-xl flex items-start gap-3"
                style={{
                  backgroundColor: "color-mix(in srgb, var(--color-accent) 8%, transparent)",
                  border: "1px solid color-mix(in srgb, var(--color-accent) 15%, transparent)"
                }}>

                    <LinkIcon size={16} className="shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
                    <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-muted)" }}>
                      Gere <strong style={{ color: "var(--color-text-main)" }}>links únicos e seguros</strong> para cada convite.
                      Cada link só pode ser usado uma vez e possui expiração configurável.
                    </p>
                  </div>

                  {/* Generate Token */}
                  <div className="p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-end" style={{ backgroundColor: "var(--color-bg)" }}>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-text-muted)" }}>Perfil</label>
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value as Role)}
                        className="w-full p-2.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }}
                      >
                        <option value="client">{t("role.client")}</option>
                        <option value="distributor">{t("role.distributor")}</option>
                        <option value="consultant">{t("role.consultant")}</option>
                        <option value="super_admin">{t("role.super_admin")}</option>
                      </select>
                    </div>
                    <div className="w-full sm:w-40">
                      <label className="block text-xs font-bold uppercase tracking-wide mb-1.5" style={{ color: "var(--color-text-muted)" }}>Expiração</label>
                      <select
                        value={inviteExpiry}
                        onChange={(e) => setInviteExpiry(Number(e.target.value))}
                        className="w-full p-2.5 rounded-lg text-sm outline-none"
                        style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }}
                      >
                        <option value={1}>1 dia</option>
                        <option value={7}>7 dias</option>
                        <option value={30}>30 dias</option>
                      </select>
                    </div>
                    <button
                      onClick={generateInviteToken}
                      disabled={inviteGenerating}
                      className="liquid-glass-gold px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                      style={{ color: "var(--color-accent)" }}
                    >
                      <Plus size={16} /> {inviteGenerating ? "Gerando..." : "Gerar Convite"}
                    </button>
                  </div>

                  {/* Tokens List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wide" style={{ color: "var(--color-text-muted)" }}>
                      Convites Gerados ({inviteTokens.length})
                    </h4>
                    {inviteTokens.length === 0 ? (
                      <div className="text-center py-8" style={{ color: "var(--color-text-muted)" }}>
                        <Share2 size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">Nenhum convite gerado ainda.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {inviteTokens.map((tk) => {
                          const isUsed = !!tk.usedAt;
                          const isExpired = new Date(tk.expiresAt) < new Date();
                          const statusLabel = isUsed ? "Usado" : isExpired ? "Expirado" : "Ativo";
                          const statusColor = isUsed ? "text-blue-600 bg-blue-500/10" : isExpired ? "text-red-600 bg-red-500/10" : "text-green-600 bg-green-500/10";
                          const publishedUrl = 'https://conexao-hub.lovable.app';
                          const fullUrl = `${publishedUrl}/?token=${tk.token}`;
                          return (
                            <div key={tk.id} className="p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center gap-3" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div className="flex-1 min-w-0 space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                                    {t(`role.${tk.role}`)}
                                  </span>
                                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${statusColor}`}>
                                    {statusLabel}
                                  </span>
                                </div>
                                <p className="text-[11px] font-mono truncate" style={{ color: "var(--color-text-muted)" }}>{fullUrl}</p>
                                <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
                                  Criado: {new Date(tk.createdAt).toLocaleDateString("pt-BR")} · Expira: {new Date(tk.expiresAt).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                              <div className="flex gap-2 shrink-0">
                                {!isUsed && !isExpired && (
                                  <button
                                    onClick={() => handleCopyLink(fullUrl, tk.id)}
                                    className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-all ${copiedLink === tk.id ? "bg-green-500 text-white" : "liquid-glass-gold"}`}
                                    style={copiedLink !== tk.id ? { color: "var(--color-accent)" } : {}}
                                  >
                                    {copiedLink === tk.id ? <><CheckCircle size={13} /> Copiado!</> : <><Copy size={13} /> Copiar</>}
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteInviteToken(tk.id)}
                                  className="p-2 rounded-lg text-red-500"
                                  title="Excluir convite"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
            }

              {settingsTab === "gamification" &&
            <div
              className="p-6 rounded-xl shadow-sm animate-fade-in"
              style={{ backgroundColor: "var(--color-surface)" }}>

                  <p className="text-sm mb-6" style={{ color: "var(--color-text-muted)" }}>
                    Defina os níveis de gamificação, nomes e pontuação mínima. Use as setas para reordenar.
                  </p>

                  {/* Add new level */}
                  <div className="mb-6 pb-6" style={{ borderBottom: "1px solid var(--color-border)" }}>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--color-text-main)" }}>
                      Adicionar nova patente
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                    type="text"
                    placeholder="Nome da patente"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                    className="flex-1 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }} />

                      <input
                    type="number"
                    placeholder="XP mínimo"
                    value={newLevelPoints || ""}
                    onChange={(e) => setNewLevelPoints(Number(e.target.value))}
                    className="w-32 px-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                    style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }} />

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold" style={{ color: "var(--color-text-muted)" }}>Cor:</label>
                        <div className="relative h-9 w-9 shrink-0">
                          <div className="absolute inset-0 rounded-lg shadow-sm border" style={{ backgroundColor: newLevelColor, borderColor: "var(--color-border)" }} />
                          <input type="color" value={newLevelColor} onChange={(e) => setNewLevelColor(e.target.value)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                      </div>
                      <button
                    onClick={async () => {
                      if (!newLevelName.trim()) return;
                      const nextOrder = gamificationLevels.length;
                      await mockDb.createGamificationLevel(newLevelName.trim(), newLevelPoints, nextOrder, newLevelColor);
                      setNewLevelName("");
                      setNewLevelPoints(0);
                      setNewLevelColor("#c9a655");
                      loadGamificationLevels();
                    }}
                    className="liquid-glass-gold px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
                    style={{ color: "var(--color-accent)" }}>

                        <PlusCircle size={16} /> Adicionar
                      </button>
                    </div>
                  </div>

                  {/* Levels list */}
                  {gamificationLevels.length === 0 ?
              <div className="text-center py-12" style={{ color: "var(--color-text-muted)" }}>
                      <Trophy size={40} className="mx-auto mb-3 opacity-30" />
                      <p>Nenhuma patente configurada.</p>
                    </div> :

              <div className="space-y-2">
                      {gamificationLevels.map((level, idx) =>
                <div
                  key={level.id}
                  className="flex items-center gap-3 p-4 rounded-xl transition-colors"
                  style={{ backgroundColor: "var(--color-bg)" }}>

                          {editingLevel?.id === level.id ?
                  <>
                              <input
                      type="text"
                      value={editingLevel.name}
                      onChange={(e) => setEditingLevel({ ...editingLevel, name: e.target.value })}
                      className="flex-1 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }} />

                              <input
                      type="number"
                      value={editingLevel.minPoints}
                      onChange={(e) =>
                      setEditingLevel({ ...editingLevel, minPoints: Number(e.target.value) })
                      }
                      className="w-28 px-3 py-2 rounded-lg text-sm outline-none focus:ring-2"
                      style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-main)" }} />

                              <div className="relative h-9 w-9 shrink-0">
                                <div className="absolute inset-0 rounded-lg shadow-sm border" style={{ backgroundColor: editingLevel.color, borderColor: "var(--color-border)" }} />
                                <input type="color" value={editingLevel.color} onChange={(e) => setEditingLevel({ ...editingLevel, color: e.target.value })} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                              </div>
                              <button
                      onClick={async () => {
                        await mockDb.updateGamificationLevel(
                          editingLevel.id,
                          editingLevel.name,
                          editingLevel.minPoints,
                          editingLevel.orderIndex,
                          editingLevel.color
                        );
                        setEditingLevel(null);
                        loadGamificationLevels();
                      }}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-success)" }}>

                                <Check size={18} />
                              </button>
                              <button
                      onClick={() => setEditingLevel(null)}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-text-muted)" }}>

                                <X size={18} />
                              </button>
                            </> :

                  <>
                              <div className="flex flex-col gap-0.5">
                                <button
                        disabled={idx === 0}
                        onClick={async () => {
                          const prev = gamificationLevels[idx - 1];
                          await Promise.all([
                          mockDb.updateGamificationLevel(
                            level.id,
                            level.name,
                            level.minPoints,
                            prev.orderIndex
                          ),
                          mockDb.updateGamificationLevel(
                            prev.id,
                            prev.name,
                            prev.minPoints,
                            level.orderIndex
                          )]
                          );
                          loadGamificationLevels();
                        }}
                        className="p-0.5 rounded disabled:opacity-20"
                        style={{ color: "var(--color-text-muted)" }}>

                                  <ChevronUp size={14} />
                                </button>
                                <button
                        disabled={idx === gamificationLevels.length - 1}
                        onClick={async () => {
                          const next = gamificationLevels[idx + 1];
                          await Promise.all([
                          mockDb.updateGamificationLevel(
                            level.id,
                            level.name,
                            level.minPoints,
                            next.orderIndex
                          ),
                          mockDb.updateGamificationLevel(
                            next.id,
                            next.name,
                            next.minPoints,
                            level.orderIndex
                          )]
                          );
                          loadGamificationLevels();
                        }}
                        className="p-0.5 rounded disabled:opacity-20"
                        style={{ color: "var(--color-text-muted)" }}>

                                  <ChevronDown size={14} />
                                </button>
                              </div>
                              <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border"
                      style={{ backgroundColor: `${level.color}20`, borderColor: level.color, color: level.color }}>

                                {idx + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm" style={{ color: "var(--color-text-main)" }}>
                                    {level.name}
                                  </p>
                                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: level.color }} />
                                </div>
                                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                                  {level.minPoints} XP mínimo
                                </p>
                              </div>
                              <button
                      onClick={() => setEditingLevel(level)}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-text-muted)" }}>

                                <Edit size={16} />
                              </button>
                              <button
                      onClick={async () => {
                        if (confirm(`Excluir a patente "${level.name}"?`)) {
                          await mockDb.deleteGamificationLevel(level.id);
                          loadGamificationLevels();
                        }
                      }}
                      className="p-2 rounded-lg"
                      style={{ color: "var(--color-error)" }}>

                                <Trash2 size={16} />
                              </button>
                            </>
                  }
                        </div>
                )}
                    </div>
              }
                </div>
            }
            </div>
          </div>
        </div>
      }

      {isFormOpen &&
      <MaterialFormModal
        initialData={editingMaterial}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSaveMaterial} />

      }
      {viewingMaterial &&
      <ViewerModal
        material={viewingMaterial.mat}
        language={viewingMaterial.lang}
        onClose={() => setViewingMaterial(null)} />

      }
      {userComm && <UserCommunicationModal user={userComm} onClose={() => setUserComm(null)} />}
      {userEditing && <UserEditModal user={userEditing} onClose={() => setUserEditing(null)} onSave={handleSaveUser} />}
      {analyticsDetail && analyticsDetail.material &&
      <AnalyticsDetailModal
        material={analyticsDetail.material}
        logs={analyticsDetail.logs}
        onClose={() => setAnalyticsDetail(null)}
        lang={language} />

      }
      {isCollectionFormOpen &&
      <CollectionFormModal
        initialData={editingCollection}
        onClose={() => setIsCollectionFormOpen(false)}
        onSave={async () => {
          loadCollections();
        }} />

      }
      <ConfirmModal
        isOpen={isConfirmOpen}
        title={t("confirm.delete.title")}
        message={t("confirm.delete.message")}
        onConfirm={confirmDelete}
        onClose={() => setIsConfirmOpen(false)} />

      {rejectingUser && (
        <RejectUserModal
          userName={rejectingUser.name}
          onClose={() => setRejectingUser(null)}
          onConfirm={handleConfirmReject}
        />
      )}

    </div>);

};