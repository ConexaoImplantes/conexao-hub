import React, { useEffect, useState, useMemo } from "react";
import { mockDb, CollectionProgress, GamificationLevel } from "../lib/mockDb";
import {
  Material,
  Language,
  UserProfile,
  Role,
  MaterialType,
  AccessLog,
  Collection,
  CollectionItem,
} from "../types";
import { colorMix } from "../lib/utils";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Eye,
  Users,
  Search,
  Filter,
  Image as ImageIcon,
  BarChart2,
  TrendingUp,
  Clock,
  Trophy,
  BookOpen,
  Layers,
  Star,
  Target,
  Award,
  X,
  FileText,
  Video,
  Headphones,
  Globe,
  ChevronRight,
} from "lucide-react";
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
  Legend,
} from "recharts";
import { SkeletonTable } from "../components/hub/SkeletonTable";

export const ManagerDashboard: React.FC = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"materials" | "users" | "collections" | "analytics">("materials");
  const [materials, setMaterials] = useState<Material[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [collectionProgress, setCollectionProgress] = useState<CollectionProgress[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialTypeFilter, setMaterialTypeFilter] = useState<MaterialType | "all">("all");
  const [materialSortOrder, setMaterialSortOrder] = useState<"asc" | "desc">("asc");
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<Role | "all">("all");

  // Trail detail
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [collectionItems, setCollectionItems] = useState<CollectionItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === "materials") {
        const mats = await mockDb.getMaterials("manager");
        setMaterials(mats);
      } else if (activeTab === "users") {
        const u = await mockDb.getUsers();
        setUsers(u);
      } else if (activeTab === "collections") {
        const cols = await mockDb.getCollections("manager");
        setCollections(cols);
      } else if (activeTab === "analytics") {
        const [logs, mats, colProgress, cols] = await Promise.all([
          mockDb.getAccessLogs(),
          mockDb.getMaterials("manager"),
          mockDb.getAllCollectionProgress(),
          mockDb.getCollections("manager"),
        ]);
        setAccessLogs(logs);
        setMaterials(mats);
        setCollectionProgress(colProgress);
        setCollections(cols);
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const openTrailDetail = async (col: Collection) => {
    setSelectedCollection(col);
    setLoadingItems(true);
    try {
      const items = await mockDb.getCollectionItems(col.id);
      setCollectionItems(items);
    } catch (e) {
      console.error(e);
    }
    setLoadingItems(false);
  };

  // Filtered data
  const filteredMaterials = useMemo(() => {
    return materials
      .filter((mat) => {
        const title = (mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "").toLowerCase();
        const matchesSearch = title.includes(materialSearch.toLowerCase());
        const matchesType = materialTypeFilter === "all" || mat.type === materialTypeFilter;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const tA = (a.title[language] || a.title["pt-br"] || "").toLowerCase();
        const tB = (b.title[language] || b.title["pt-br"] || "").toLowerCase();
        return materialSortOrder === "asc" ? tA.localeCompare(tB) : tB.localeCompare(tA);
      });
  }, [materials, materialSearch, materialTypeFilter, materialSortOrder, language]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((u) => {
        const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
        const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
        return matchesSearch && matchesRole;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [users, userSearch, userRoleFilter]);

  // Analytics computed
  const aggregatedMetrics = useMemo(() => {
    const map = new Map<string, { views: number; uniqueUsers: Set<string>; lastAccess: string | null }>();
    materials.forEach((m) => map.set(m.id, { views: 0, uniqueUsers: new Set(), lastAccess: null }));
    accessLogs.forEach((log) => {
      const stats = map.get(log.materialId);
      if (stats) {
        stats.views++;
        stats.uniqueUsers.add(log.userId);
        if (!stats.lastAccess || new Date(log.timestamp) > new Date(stats.lastAccess)) stats.lastAccess = log.timestamp;
      }
    });
    return Array.from(map.entries())
      .map(([id, stats]) => ({
        id,
        material: materials.find((m) => m.id === id),
        views: stats.views,
        uniqueUsers: stats.uniqueUsers.size,
        lastAccess: stats.lastAccess,
      }))
      .filter((item) => item.material)
      .sort((a, b) => b.views - a.views);
  }, [accessLogs, materials]);

  const activeUsersRanking = useMemo(() => {
    const userCounts: Record<string, { name: string; role: Role; count: number }> = {};
    accessLogs.forEach((log) => {
      if (!userCounts[log.userId]) userCounts[log.userId] = { name: log.userName, role: log.userRole, count: 0 };
      userCounts[log.userId].count++;
    });
    return Object.values(userCounts).sort((a, b) => b.count - a.count).slice(0, 5);
  }, [accessLogs]);

  const typeIcon = (type: string) => {
    if (type === "pdf") return <FileText size={14} />;
    if (type === "image") return <ImageIcon size={14} />;
    if (type === "video") return <Video size={14} />;
    if (type === "audio") return <Headphones size={14} />;
    if (type === "html") return <Globe size={14} />;
    return <FileText size={14} />;
  };

  const renderTabButton = (id: typeof activeTab, label: string, Icon: any) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeTab === id ? "liquid-glass-gold shadow-sm" : ""}`}
      style={activeTab === id ? { color: "var(--color-accent)" } : { color: "var(--color-text-muted)" }}
    >
      <div className={`icon-box-sm ${activeTab === id ? "!bg-transparent !border-transparent" : ""}`}>
        <Icon size={14} />
      </div>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
            Painel do Gestor
          </h2>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Visualize materiais, usuários, trilhas e métricas da plataforma.
          </p>
        </div>
        <div className="flex flex-wrap rounded-lg p-1 gap-1" style={{ backgroundColor: "var(--color-bg)" }}>
          {renderTabButton("materials", t("tab.materials"), ImageIcon)}
          {renderTabButton("users", t("tab.users"), Users)}
          {renderTabButton("collections", "Trilhas", BookOpen)}
          {renderTabButton("analytics", t("tab.analytics"), BarChart2)}
        </div>
      </div>

      {/* ===== MATERIALS TAB ===== */}
      {activeTab === "materials" && (
        <div className="animate-fade-in">
          <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6" style={{ backgroundColor: "var(--color-surface)" }}>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
                value={materialSearch}
                onChange={(e) => setMaterialSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full md:w-40 p-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
              value={materialTypeFilter}
              onChange={(e) => setMaterialTypeFilter(e.target.value as any)}
            >
              <option value="all">{t("filter.all")}</option>
              <option value="pdf">{t("material.type.pdf")}</option>
              <option value="image">{t("material.type.image")}</option>
              <option value="video">{t("material.type.video")}</option>
              <option value="audio">{t("material.type.audio")}</option>
              <option value="html">{t("material.type.html")}</option>
            </select>
          </div>

          {loading ? (
            <SkeletonTable />
          ) : (
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
              {/* Mobile */}
              <div className="block md:hidden divide-y" style={{ borderColor: "var(--color-border)" }}>
                {filteredMaterials.map((mat) => {
                  const displayTitle = mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Untitled";
                  return (
                    <div key={mat.id} className="p-4 space-y-2">
                      <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-main)" }}>{displayTitle}</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs capitalize opacity-75" style={{ color: "var(--color-text-muted)" }}>{mat.type}</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: mat.active ? 'var(--color-success-bg)' : 'var(--color-bg)',
                            color: mat.active ? 'var(--color-success)' : 'var(--color-text-muted)',
                          }}>
                          {mat.active ? t("active") : t("inactive")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                          <Star size={10} /> {mat.points || 0}
                        </span>
                      </div>
                      <div className="flex gap-1 flex-wrap">
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
                  <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>{t("material.none.found")}</div>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                    <tr>
                      <th className="p-4">{t("title")}</th>
                      <th className="p-4">{t("type")}</th>
                      <th className="p-4 text-center">{t("status")}</th>
                      <th className="p-4">{t("permissions")}</th>
                      <th className="p-4">Assets</th>
                      <th className="p-4 text-center">XP</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredMaterials.map((mat) => {
                      const displayTitle = mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Untitled";
                      return (
                        <tr key={mat.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                          <td className="p-4 font-medium max-w-xs truncate" title={displayTitle}>{displayTitle}</td>
                          <td className="p-4 capitalize opacity-75">{mat.type}</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                              style={{
                                backgroundColor: mat.active ? 'var(--color-success-bg)' : 'var(--color-bg)',
                                color: mat.active ? 'var(--color-success)' : 'var(--color-text-muted)',
                              }}>
                              {mat.active ? t("active") : t("inactive")}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex -space-x-1">
                              {mat.allowedRoles.map((r) => (
                                <div key={r} className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] uppercase font-bold shadow-sm"
                                  title={t(`role.${r}`)} style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                                  {r[0]}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              {Object.keys(mat.assets).map((lang) => (
                                <span key={lang} className="text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold"
                                  style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                                  {lang.split("-")[0]}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                              <Star size={12} /> {mat.points || 0}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMaterials.length === 0 && (
                      <tr><td colSpan={6} className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>{t("material.none.found")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== USERS TAB ===== */}
      {activeTab === "users" && (
        <div className="animate-fade-in">
          <div className="p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center mb-6" style={{ backgroundColor: "var(--color-surface)" }}>
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5" size={18} style={{ color: "var(--color-text-muted)" }} />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                className="w-full pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:ring-2"
                style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full md:w-40 p-2 rounded-lg text-sm outline-none"
              style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-main)" }}
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value as any)}
            >
              <option value="all">{t("user.filter.all")}</option>
              <option value="client">{t("role.client")}</option>
              <option value="distributor">{t("role.distributor")}</option>
              <option value="consultant">{t("role.consultant")}</option>
              <option value="manager">{t("role.manager")}</option>
            </select>
          </div>

          {loading ? (
            <SkeletonTable />
          ) : (
            <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
              {/* Mobile */}
              <div className="block md:hidden divide-y" style={{ borderColor: "var(--color-border)" }}>
                {filteredUsers.map((u) => (
                  <div key={u.id} className="p-4 space-y-2">
                    <p className="font-medium text-sm" style={{ color: "var(--color-text-main)" }}>{u.name}</p>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{u.email}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {u.whatsapp && <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>{u.whatsapp}</span>}
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>{t(`role.${u.role}`)}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{
                          backgroundColor: u.status === "active" ? "var(--color-success-bg)" :
                            u.status === "pending" ? "var(--color-warning-bg)" :
                            u.status === "rejected" ? "var(--color-error-bg)" : "var(--color-bg)",
                          color: u.status === "active" ? "var(--color-success)" :
                            u.status === "pending" ? "var(--color-warning)" :
                            u.status === "rejected" ? "var(--color-error)" : "var(--color-text-muted)",
                        }}>
                        {t(`user.status.${u.status}`)}
                      </span>
                    </div>
                  </div>
                ))}
                {filteredUsers.length === 0 && (
                  <div className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>{t("user.none.found")}</div>
                )}
              </div>

              {/* Desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="text-xs uppercase font-semibold" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                    <tr>
                      <th className="p-4">Usuário</th>
                      <th className="p-4">Contatos</th>
                      <th className="p-4">Perfil</th>
                      <th className="p-4">Permissões</th>
                      <th className="p-4 text-center">{t("status")}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="transition-colors" style={{ color: "var(--color-text-main)" }}>
                        <td className="p-4">
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{u.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>{u.whatsapp || "—"}</p>
                        </td>
                        <td className="p-4">
                          <span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text-muted)" }}>
                            {t(`role.${u.role}`)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1 flex-wrap">
                            {(u.allowedTypes && u.allowedTypes.length > 0) ? u.allowedTypes.map((type) => (
                              <span key={type} className="text-[10px] px-1.5 py-0.5 rounded font-bold capitalize" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                                {type}
                              </span>
                            )) : (
                              <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>Todos</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold"
                            style={{
                              backgroundColor: u.status === "active" ? "var(--color-success-bg)" :
                                u.status === "pending" ? "var(--color-warning-bg)" :
                                u.status === "rejected" ? "var(--color-error-bg)" : "var(--color-bg)",
                              color: u.status === "active" ? "var(--color-success)" :
                                u.status === "pending" ? "var(--color-warning)" :
                                u.status === "rejected" ? "var(--color-error)" : "var(--color-text-muted)",
                            }}>
                            {t(`user.status.${u.status}`)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr><td colSpan={5} className="p-8 text-center" style={{ color: "var(--color-text-muted)" }}>{t("user.none.found")}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== COLLECTIONS / TRAILS TAB ===== */}
      {activeTab === "collections" && (
        <div className="animate-fade-in space-y-6">
          {selectedCollection ? (
            // Timeline view
            <div className="space-y-6">
              <button
                onClick={() => { setSelectedCollection(null); setCollectionItems([]); }}
                className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
                style={{ color: "var(--color-accent)" }}
              >
                ← {t("trail.back")}
              </button>

              <div className="p-6 rounded-2xl" style={{ backgroundColor: "var(--color-surface)" }}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="icon-box"><BookOpen size={20} /></div>
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: "var(--color-text-main)" }}>
                      {selectedCollection.title[language] || selectedCollection.title["pt-br"] || Object.values(selectedCollection.title)[0]}
                    </h3>
                    <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {selectedCollection.points} XP · {collectionItems.length} {collectionItems.length === 1 ? "material" : "materiais"}
                    </p>
                  </div>
                </div>
              </div>

              {loadingItems ? (
                <SkeletonTable />
              ) : collectionItems.length === 0 ? (
                <div className="text-center py-16" style={{ color: "var(--color-text-muted)" }}>
                  <Layers size={40} className="mx-auto mb-3 opacity-30" />
                  <p>{t("trail.no.materials")}</p>
                </div>
              ) : (
                <div className="relative pl-8 space-y-0">
                  {/* Timeline line */}
                  <div className="absolute left-[15px] top-4 bottom-4 w-0.5 rounded-full" style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 20%, transparent)" }} />

                  {collectionItems.map((item, idx) => {
                    const mat = item.material;
                    if (!mat) return null;
                    const title = mat.title[language] || mat.title["pt-br"] || Object.values(mat.title)[0] || "Sem título";
                    return (
                      <div key={item.id} className="relative flex items-start gap-4 py-4">
                        {/* Timeline dot */}
                        <div className="absolute -left-8 top-5 w-[14px] h-[14px] rounded-full border-2 z-10"
                          style={{ borderColor: "var(--color-accent)", backgroundColor: "var(--color-surface)" }} />

                        <div className="flex-1 p-4 rounded-xl border transition-colors"
                          style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)", borderColor: "color-mix(in srgb, var(--color-border) 50%, transparent)" }}>
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="icon-box-sm shrink-0">{typeIcon(mat.type)}</div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm truncate" style={{ color: "var(--color-text-main)" }}>{title}</p>
                                <p className="text-[10px] capitalize" style={{ color: "var(--color-text-muted)" }}>{mat.type}</p>
                              </div>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                              style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                              <Star size={10} /> {mat.points || 0} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            // Collection cards
            <>
              {loading ? (
                <SkeletonTable />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {collections.map((col) => {
                    const title = col.title[language] || col.title["pt-br"] || Object.values(col.title)[0] || "Sem título";
                    return (
                      <button
                        key={col.id}
                        onClick={() => openTrailDetail(col)}
                        className="text-left rounded-2xl border border-white/10 p-5 space-y-3 transition-all hover:scale-[1.02] hover:shadow-lg"
                        style={{ backgroundColor: "color-mix(in srgb, var(--color-surface) 60%, transparent)" }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="icon-box"><BookOpen size={20} /></div>
                          <div>
                            <p className="font-bold text-sm" style={{ color: "var(--color-text-main)" }}>{title}</p>
                            <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                              {col.points} XP · {col.active ? "Ativa" : "Inativa"}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 flex-wrap">
                          {col.allowedRoles.map((r) => (
                            <span key={r} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                              style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                              {t(`role.${r}`)}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-medium" style={{ color: "var(--color-accent)" }}>
                          Ver timeline <ChevronRight size={14} />
                        </div>
                      </button>
                    );
                  })}
                  {collections.length === 0 && (
                    <div className="col-span-3 py-16 text-center" style={{ color: "var(--color-text-muted)" }}>
                      <Layers size={40} className="mx-auto mb-3 opacity-30" />
                      <p>{t("trail.none.created")}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== ANALYTICS TAB ===== */}
      {activeTab === "analytics" && (
        <div className="animate-fade-in space-y-6">
          {loading ? (
            <SkeletonTable />
          ) : (
            <div className="space-y-8">
              {/* KPI Cards */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                  <BarChart2 size={14} /> {t("analytics.overview")}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><Eye size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.total.views")}</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{accessLogs.length}</p>
                  </div>
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><Users size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.unique.users")}</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{new Set(accessLogs.map((l) => l.userId)).size}</p>
                  </div>
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><TrendingUp size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.top.material")}</p>
                    <p className="text-base font-bold truncate" style={{ color: "var(--color-text-main)" }}>
                      {aggregatedMetrics[0]?.material ? aggregatedMetrics[0].material.title[language] || aggregatedMetrics[0].material.title["pt-br"] : "N/A"}
                    </p>
                  </div>
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><Target size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.trails.started")}</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{collectionProgress.length}</p>
                  </div>
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><Award size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.trails.completed")}</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>{collectionProgress.filter((p) => p.status === "completed").length}</p>
                  </div>
                  <div className="p-5 rounded-xl shadow-sm flex flex-col gap-2" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="icon-box-sm"><TrendingUp size={14} /></div>
                    <p className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{t("analytics.completion.rate")}</p>
                    <p className="text-2xl font-bold" style={{ color: "var(--color-text-main)" }}>
                      {collectionProgress.length > 0 ? Math.round(collectionProgress.filter((p) => p.status === "completed").length / collectionProgress.length * 100) : 0}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Rankings */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                  <Trophy size={14} /> {t("analytics.rankings")}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Top Materials */}
                  <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="px-6 py-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 30%, transparent)" }}>
                      <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                        <Trophy size={18} style={{ color: "var(--color-warning)" }} /> {t("analytics.rank.materials")}
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {aggregatedMetrics.slice(0, 5).map((item, index) => {
                        const mat = item.material;
                        if (!mat) return null;
                        const title = mat.title[language] || mat.title["pt-br"];
                        const percentage = accessLogs.length > 0 ? Math.round(item.views / accessLogs.length * 100) : 0;
                        return (
                          <div key={item.id} className="relative">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium truncate pr-2 flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                  style={{
                                    backgroundColor: index === 0 ? "var(--color-warning-bg)" : index === 1 ? "var(--color-bg)" : index === 2 ? "var(--color-warning-bg)" : "var(--color-bg)",
                                    color: index === 0 ? "var(--color-warning)" : index === 1 ? "var(--color-text-muted)" : index === 2 ? "var(--color-warning)" : "var(--color-text-muted)",
                                  }}>
                                  {index + 1}
                                </span>
                                {title}
                              </span>
                              <span className="font-bold" style={{ color: "var(--color-accent)" }}>{item.views}</span>
                            </div>
                            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: "var(--color-accent)" }} />
                            </div>
                          </div>
                        );
                      })}
                      {aggregatedMetrics.length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>{t("analytics.no.data")}</p>
                      )}
                    </div>
                  </div>

                  {/* Top Users */}
                  <div className="rounded-xl shadow-sm overflow-hidden" style={{ backgroundColor: "var(--color-surface)" }}>
                    <div className="px-6 py-4" style={{ backgroundColor: "color-mix(in srgb, var(--color-bg) 30%, transparent)" }}>
                      <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                        <Users size={18} style={{ color: "var(--color-accent)" }} /> {t("analytics.rank.users")}
                      </h3>
                    </div>
                    <div className="p-5 space-y-4">
                      {activeUsersRanking.map((u, index) => {
                        const maxCount = activeUsersRanking[0]?.count || 1;
                        const percentage = Math.round(u.count / maxCount * 100);
                        return (
                          <div key={index} className="relative">
                            <div className="flex justify-between text-sm mb-1.5">
                              <span className="font-medium truncate pr-2 flex items-center gap-2" style={{ color: "var(--color-text-main)" }}>
                                <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
                                  style={{
                                    backgroundColor: index === 0 ? "var(--color-warning-bg)" : index === 1 ? "var(--color-bg)" : index === 2 ? "var(--color-warning-bg)" : "var(--color-bg)",
                                    color: index === 0 ? "var(--color-warning)" : index === 1 ? "var(--color-text-muted)" : index === 2 ? "var(--color-warning)" : "var(--color-text-muted)",
                                  }}>
                                  {index + 1}
                                </span>
                                {u.name}
                              </span>
                              <span className="font-bold" style={{ color: "var(--color-accent)" }}>{u.count}</span>
                            </div>
                            <div className="w-full rounded-full h-1.5 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div className="h-full rounded-full" style={{ width: `${percentage}%`, backgroundColor: "var(--color-accent)" }} />
                            </div>
                          </div>
                        );
                      })}
                      {activeUsersRanking.length === 0 && (
                        <p className="text-sm text-center py-4" style={{ color: "var(--color-text-muted)" }}>{t("analytics.no.data")}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Trail Metrics */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2" style={{ color: "var(--color-text-muted)" }}>
                  <Layers size={14} /> Métricas por Trilha
                </h3>
                {collections.length === 0 ? (
                  <div className="rounded-xl shadow-sm p-8 text-center" style={{ backgroundColor: "var(--color-surface)", color: "var(--color-text-muted)" }}>
                    <Layers size={40} className="mx-auto mb-3 opacity-30" />
                    <p>Nenhuma trilha cadastrada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {collections.map((col) => {
                      const colTitle = typeof col.title === "object" ? (col.title as any)[language] || (col.title as any)["pt-br"] || Object.values(col.title)[0] : col.title;
                      const trailProgress = collectionProgress.filter((p) => p.collectionId === col.id);
                      const started = trailProgress.length;
                      const completed = trailProgress.filter((p) => p.status === "completed").length;
                      const inProgress = started - completed;
                      const completionRate = started > 0 ? Math.round((completed / started) * 100) : 0;
                      const uniqueUsers = new Set(trailProgress.map((p) => p.userId)).size;

                      return (
                        <div key={col.id} className="rounded-xl shadow-sm p-5 space-y-4" style={{ backgroundColor: "var(--color-surface)" }}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="icon-box-sm flex-shrink-0"><BookOpen size={14} /></div>
                              <h4 className="font-bold text-sm truncate" style={{ color: "var(--color-text-main)" }} title={String(colTitle)}>
                                {String(colTitle)}
                              </h4>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                              <Star size={10} /> {col.points || 0} XP
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span style={{ color: "var(--color-text-muted)" }}>Taxa de conclusão</span>
                              <span className="font-bold" style={{ color: "var(--color-accent)" }}>{completionRate}%</span>
                            </div>
                            <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: "var(--color-bg)" }}>
                              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${completionRate}%`, backgroundColor: "var(--color-accent)" }} />
                            </div>
                          </div>

                          {/* Stats grid */}
                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
                              <p className="text-lg font-bold" style={{ color: "var(--color-text-main)" }}>{uniqueUsers}</p>
                              <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Usuários</p>
                            </div>
                            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
                              <p className="text-lg font-bold" style={{ color: "var(--color-warning)" }}>{inProgress}</p>
                              <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Em progresso</p>
                            </div>
                            <div className="text-center p-2 rounded-lg" style={{ backgroundColor: "var(--color-bg)" }}>
                              <p className="text-lg font-bold" style={{ color: "var(--color-success)" }}>{completed}</p>
                              <p className="text-[10px] font-medium" style={{ color: "var(--color-text-muted)" }}>Concluídas</p>
                            </div>
                          </div>

                          {/* Roles */}
                          <div className="flex gap-1 flex-wrap">
                            {col.allowedRoles.map((r) => (
                              <span key={r} className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                style={{ backgroundColor: "color-mix(in srgb, var(--color-accent) 10%, transparent)", color: "var(--color-accent)" }}>
                                {t(`role.${r}`)}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};