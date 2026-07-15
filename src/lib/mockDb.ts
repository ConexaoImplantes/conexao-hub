import { supabase } from './supabaseClient';
import { Material, UserProfile, Role, SystemConfig, ColorScheme, UserStatus, AccessLog, Language, MaterialAsset, Collection, CollectionItem, UserProgress, EnvironmentThemes } from '../types';
import { DEFAULT_DARK, mergeScheme, DEFAULT_ENVIRONMENT_THEMES } from './themeDefaults';
import { normalizeName } from './nameUtils';

export interface CollectionProgress {
  id: string;
  userId: string;
  collectionId: string;
  status: 'started' | 'completed';
  startedAt: string;
  completedAt?: string;
}

export interface GamificationLevel {
  id: string;
  name: string;
  minPoints: number;
  orderIndex: number;
  color: string;
  createdAt: string;
  updatedAt: string;
}


let isMockMode = false;

const localUsers: UserProfile[] = [
    { id: 'mock-client', name: 'Cliente Exemplo', email: 'client@demo.com', role: 'client', whatsapp: '11988888888', cro: '12345', status: 'active', points: 150, preferences: { language: 'pt-br' } },
    { id: 'mock-distrib', name: 'Distribuidor Demo', email: 'distributor@demo.com', role: 'distributor', whatsapp: '11977777777', status: 'active', points: 320, preferences: { language: 'pt-br' } },
    { id: 'mock-consult', name: 'Consultor Demo', email: 'consultant@demo.com', role: 'consultant', whatsapp: '11966666666', status: 'active', points: 780, preferences: { language: 'pt-br' } },
    { id: 'mock-manager', name: 'Gestor Demo', email: 'manager@demo.com', role: 'manager', whatsapp: '11955555555', status: 'active', points: 0, preferences: { language: 'pt-br' } }
];

const mapProfileFromDb = (data: any): UserProfile => ({
  id: data.id,
  name: data.name,
  email: data.email,
  role: data.user_roles?.[0]?.role || data.role || 'client',
  whatsapp: data.whatsapp,
  cro: data.cro,
  status: data.status,
  allowedTypes: data.allowed_types,
  points: data.points || 0,
  preferences: data.preferences || { language: 'pt-br' },
  rejectionReason: data.rejection_reason,
});

const mapMaterialFromDb = (data: any): Material => {
    const assetsObj: Partial<Record<Language, MaterialAsset>> = {};
    if (data.material_assets && Array.isArray(data.material_assets)) {
        data.material_assets.forEach((asset: any) => {
            assetsObj[asset.language as Language] = {
                url: asset.url,
                subtitleUrl: asset.subtitle_url,
                status: asset.status
            };
        });
    }
    return {
        id: data.id,
        title: data.title,
        type: data.type,
        allowedRoles: data.allowed_roles,
        assets: assetsObj,
        active: data.active,
        createdAt: data.created_at,
        points: data.points || 0,
        tags: data.tags || [],
        category: data.category || undefined,
        downloadable: data.downloadable ?? false,
    };
};

export const mockDb = {

  enableMockMode: () => {
      console.log("🟡 MOCK MODE ACTIVATED");
      isMockMode = true;
  },

  disableMockMode: () => {
      isMockMode = false;
  },

  getSystemConfig: async (): Promise<SystemConfig> => {
    const { data, error } = await supabase.from('system_config_public').select('*').eq('id', 1).single();

    const defaults: SystemConfig = {
        appName: 'Hub Conexão',
        themeDark: DEFAULT_DARK,
    };

    if (error || !data) {
        return defaults;
    }

    return {
      appName: data.app_name,
      logoUrl: data.logo_url,
      themeDark: mergeScheme(data.theme_dark as unknown as Partial<ColorScheme>, DEFAULT_DARK),
      environmentThemes: (data as any).environment_themes && Object.keys((data as any).environment_themes).length > 0
        ? { ...DEFAULT_ENVIRONMENT_THEMES, ...(data as any).environment_themes }
        : DEFAULT_ENVIRONMENT_THEMES,
      environmentMaintenance: ((data as any).environment_maintenance ?? {}) as any,
    };
  },

  updateSystemConfig: async (config: SystemConfig): Promise<void> => {
    const { error } = await supabase
      .from('system_config')
      .update({
        app_name: config.appName,
        logo_url: config.logoUrl,
        webhook_url: config.webhookUrl,
        theme_dark: config.themeDark as any,
        environment_themes: config.environmentThemes as any,
        environment_maintenance: (config.environmentMaintenance ?? {}) as any,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', 1);

    if (error) throw error;
  },

  getProfileById: async (id: string): Promise<UserProfile | null> => {
    if (id.startsWith('mock-')) return localUsers.find(u => u.id === id) || null;

    const [profileResult, roleResult] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('user_roles').select('role').eq('user_id', id).limit(1).single()
    ]);

    if (profileResult.error) {
        if (profileResult.error.code === 'PGRST116') return null;
        if (profileResult.error.code === '42P01') throw profileResult.error;
        console.error("DB Read Error:", profileResult.error);
        return null;
    }

    const data = {
      ...profileResult.data,
      user_roles: roleResult.data ? [roleResult.data] : []
    };
    return mapProfileFromDb(data);
  },

  updateUserStatus: async (userId: string, status: UserStatus, rejectionReason?: string): Promise<void> => {
    const updateData: any = { status };
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }
    if (status === 'active') {
      updateData.rejection_reason = null;
    }
    const { data, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select('id');
    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error('Sem permissão para alterar este usuário (nenhuma linha atualizada).');
    }
  },

  updateUser: async (updatedUser: UserProfile): Promise<void> => {
    const { error } = await supabase
      .from('profiles')
      .update({
        name: normalizeName(updatedUser.name),
        email: updatedUser.email,
        whatsapp: updatedUser.whatsapp,
        cro: updatedUser.cro,
        status: updatedUser.status,
        allowed_types: updatedUser.allowedTypes,
        preferences: updatedUser.preferences
      })
      .eq('id', updatedUser.id);
    if (error) throw error;

    // Update role in the separate user_roles table
    const { error: roleError } = await supabase
      .from('user_roles')
      .update({ role: updatedUser.role as any })
      .eq('user_id', updatedUser.id);
    if (roleError) throw roleError;
  },

  deleteUser: async (userId: string): Promise<void> => {
    const { data, error } = await supabase.functions.invoke('delete-user', {
      body: { userId },
    });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
  },

  createMaterial: async (material: Omit<Material, 'id' | 'createdAt'>): Promise<Material> => {
    const { data: matData, error: matError } = await supabase
      .from('materials')
      .insert({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        active: material.active,
        points: material.points || 0,
        tags: material.tags || [],
        category: material.category || null,
        downloadable: material.downloadable ?? false,
      })
      .select()
      .single();

    if (matError) throw matError;

    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
        material_id: matData.id,
        language: lang as 'pt-br' | 'en-us' | 'es-es',
        url: (asset as MaterialAsset).url,
        subtitle_url: (asset as MaterialAsset).subtitleUrl,
        status: (asset as MaterialAsset).status as 'draft' | 'review' | 'published'
    }));

    if (assetsToInsert.length > 0) {
        const { error: assetError } = await supabase.from('material_assets').insert(assetsToInsert);
        if (assetError) throw assetError;
    }

    return { ...mapMaterialFromDb(matData), assets: material.assets };
  },

  updateMaterial: async (material: Material): Promise<void> => {
    const { error: matError } = await supabase
      .from('materials')
      .update({
        title: material.title,
        type: material.type,
        allowed_roles: material.allowedRoles,
        active: material.active,
        points: material.points || 0,
        tags: material.tags || [],
        category: material.category || null,
      })
      .eq('id', material.id);

    if (matError) throw matError;

    const { error: delError } = await supabase.from('material_assets').delete().eq('material_id', material.id);
    if (delError) throw delError;

    const assetsToInsert = Object.entries(material.assets).map(([lang, asset]) => ({
        material_id: material.id,
        language: lang as 'pt-br' | 'en-us' | 'es-es',
        url: (asset as MaterialAsset).url,
        subtitle_url: (asset as MaterialAsset).subtitleUrl,
        status: (asset as MaterialAsset).status as 'draft' | 'review' | 'published'
    }));

    if (assetsToInsert.length > 0) {
        const { error: assetError } = await supabase.from('material_assets').insert(assetsToInsert);
        if (assetError) throw assetError;
    }
  },

  deleteMaterial: async (id: string): Promise<void> => {
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
  },

  getUsers: async (): Promise<UserProfile[]> => {
    const { data: profiles, error } = await supabase.from('profiles').select('*').order('name');
    if (error) throw error;
    
    const { data: roles } = await supabase.from('user_roles').select('user_id, role');
    const roleMap = new Map((roles || []).map((r: any) => [r.user_id, r.role]));
    
    return (profiles || [])
      .map((p: any) => mapProfileFromDb({
        ...p,
        user_roles: roleMap.has(p.id) ? [{ role: roleMap.get(p.id) }] : []
      }))
      // Super admin credentials must never appear in any user listing (security).
      .filter((u: UserProfile) => u.role !== 'super_admin');
  },

  getMaterials: async (role: Role): Promise<Material[]> => {
    let query = supabase.from('materials').select(`*, material_assets (*)`).order('created_at', { ascending: false });

    if (role !== 'super_admin' && role !== 'manager') {
      query = query.eq('active', true).contains('allowed_roles', [role]);
    }

    const { data, error } = await query;
    if (error) {
       if (error.code === '42P01') throw error;
       throw error;
    }
    return (data || []).map(mapMaterialFromDb);
  },

  logAccess: async (materialId: string, userId: string, language: Language, role?: Role): Promise<void> => {
    // Skip mock accounts and super_admin — they never appear in metrics.
    if (!userId || userId.startsWith('mock-') || role === 'super_admin') return;
    const { error } = await supabase.from('access_logs').insert({ material_id: materialId, user_id: userId, language: language });
    if (error) console.error("Error logging access:", error);
  },

  getAccessLogs: async (): Promise<AccessLog[]> => {
    const { data: logs, error } = await supabase
      .from('access_logs')
      .select('id, material_id, user_id, language, timestamp')
      .order('timestamp', { ascending: false })
      .limit(5000);

    if (error) {
        if (error.code === '42P01') throw error;
        throw error;
    }

    const rows = logs || [];
    const materialIds = Array.from(new Set(rows.map((r: any) => r.material_id).filter(Boolean)));
    const userIds = Array.from(new Set(rows.map((r: any) => r.user_id).filter(Boolean)));

    const [matsRes, profsRes, rolesRes] = await Promise.all([
      materialIds.length ? supabase.from('materials').select('id, title').in('id', materialIds) : Promise.resolve({ data: [] as any[] }),
      userIds.length ? supabase.from('profiles').select('id, name').in('id', userIds) : Promise.resolve({ data: [] as any[] }),
      userIds.length ? supabase.from('user_roles').select('user_id, role').in('user_id', userIds) : Promise.resolve({ data: [] as any[] }),
    ]);

    const matMap = new Map<string, any>((matsRes.data || []).map((m: any) => [m.id, m]));
    const profMap = new Map<string, any>((profsRes.data || []).map((p: any) => [p.id, p]));
    const roleMap = new Map<string, any>((rolesRes.data || []).map((r: any) => [r.user_id, r.role]));

    return rows
      .map((log: any) => {
        const mat = matMap.get(log.material_id);
        const prof = profMap.get(log.user_id);
        const title = mat?.title || {};
        return {
          id: log.id,
          materialId: log.material_id,
          materialTitle: title['pt-br'] || title['en-us'] || title['es-es'] || 'Item Excluído',
          userId: log.user_id,
          userName: prof?.name || 'Desconhecido',
          userRole: roleMap.get(log.user_id) || 'client',
          language: log.language,
          timestamp: log.timestamp,
        };
      })
      // Exclude mock accounts and super_admin from analytics.
      .filter((l: AccessLog) => l.userRole !== 'super_admin' && !(typeof l.userId === 'string' && l.userId.startsWith('mock-')));
  },


  // ---- Collections ----

  getCollections: async (role: Role): Promise<Collection[]> => {
    let query = supabase.from('collections').select('*').order('created_at', { ascending: false });
    if (role !== 'super_admin' && role !== 'manager') {
      query = query.eq('active', true).contains('allowed_roles', [role]);
    }
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      coverImage: c.cover_image,
      allowedRoles: c.allowed_roles,
      active: c.active,
      points: c.points || 0,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));
  },

  getCollectionItems: async (collectionId: string): Promise<CollectionItem[]> => {
    const { data, error } = await supabase
      .from('collection_items')
      .select(`*, materials(*, material_assets(*))`)
      .eq('collection_id', collectionId)
      .order('order_index');
    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id,
      collectionId: item.collection_id,
      materialId: item.material_id,
      orderIndex: item.order_index,
      material: item.materials ? {
        id: item.materials.id,
        title: item.materials.title,
        type: item.materials.type,
        allowedRoles: item.materials.allowed_roles,
        assets: (() => {
          const a: any = {};
          (item.materials.material_assets || []).forEach((asset: any) => { a[asset.language] = { url: asset.url, subtitleUrl: asset.subtitle_url, status: asset.status }; });
          return a;
        })(),
        active: item.materials.active,
        createdAt: item.materials.created_at,
        points: item.materials.points || 0,
        tags: item.materials.tags || [],
        category: item.materials.category,
        downloadable: item.materials.downloadable ?? false,
      } : undefined,
    }));
  },

  createCollection: async (collection: Omit<Collection, 'id' | 'createdAt'>): Promise<void> => {
    const { error } = await supabase.from('collections').insert({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active,
      points: collection.points,
    });
    if (error) throw error;
  },

  updateCollection: async (collection: Collection): Promise<void> => {
    const { error } = await supabase.from('collections').update({
      title: collection.title,
      description: collection.description,
      cover_image: collection.coverImage,
      allowed_roles: collection.allowedRoles,
      active: collection.active,
      points: collection.points,
    }).eq('id', collection.id);
    if (error) throw error;
  },

  deleteCollection: async (id: string): Promise<void> => {
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
  },

  setCollectionItems: async (collectionId: string, materialIds: string[]): Promise<void> => {
    await supabase.from('collection_items').delete().eq('collection_id', collectionId);
    if (materialIds.length === 0) return;
    const items = materialIds.map((materialId, idx) => ({ collection_id: collectionId, material_id: materialId, order_index: idx }));
    const { error } = await supabase.from('collection_items').insert(items);
    if (error) throw error;
  },

  // ---- User Progress ----

  getUserProgress: async (userId: string): Promise<UserProgress[]> => {
    const { data, error } = await supabase.from('user_progress').select('*').eq('user_id', userId);
    if (error) throw error;
    return (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      materialId: p.material_id,
      collectionId: p.collection_id || undefined,
      status: p.status,
      completedAt: p.completed_at,
      createdAt: p.created_at,
    }));
  },

  upsertProgress: async (userId: string, materialId: string, status: 'started' | 'completed', collectionId?: string): Promise<void> => {
    const payload: any = { user_id: userId, material_id: materialId, status, collection_id: collectionId || null };
    if (status === 'completed') payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from('user_progress').upsert(payload, { onConflict: 'user_id,material_id,collection_id' });
    if (error) console.error('Error upserting progress:', error);
  },

  addPoints: async (userId: string, points: number): Promise<void> => {
    const { data: profile } = await supabase.from('profiles').select('points').eq('id', userId).single();
    const currentPoints = (profile?.points || 0) + points;
    await supabase.from('profiles').update({ points: currentPoints }).eq('id', userId);
  },

  // ---- Gamification Levels ----

  getGamificationLevels: async (): Promise<GamificationLevel[]> => {
    const { data, error } = await supabase.from('gamification_levels').select('*').order('order_index');
    if (error) throw error;
    return (data || []).map((l: any) => ({
      id: l.id,
      name: l.name,
      minPoints: l.min_points,
      orderIndex: l.order_index,
      color: l.color || '#c9a655',
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    }));
  },

  createGamificationLevel: async (name: string, minPoints: number, orderIndex: number, color: string = '#c9a655'): Promise<void> => {
    const { error } = await supabase.from('gamification_levels').insert({ name, min_points: minPoints, order_index: orderIndex, color });
    if (error) throw error;
  },

  updateGamificationLevel: async (id: string, name: string, minPoints: number, orderIndex: number, color?: string): Promise<void> => {
    const payload: any = { name, min_points: minPoints, order_index: orderIndex };
    if (color !== undefined) payload.color = color;
    const { error } = await supabase.from('gamification_levels').update(payload).eq('id', id);
    if (error) throw error;
  },

  deleteGamificationLevel: async (id: string): Promise<void> => {
    const { error } = await supabase.from('gamification_levels').delete().eq('id', id);
    if (error) throw error;
  },

  // ---- Collection Progress ----

  getCollectionProgress: async (userId?: string): Promise<CollectionProgress[]> => {
    let query = supabase.from('collection_progress').select('*');
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) { console.error('Error fetching collection progress:', error); return []; }
    return (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      collectionId: p.collection_id,
      status: p.status,
      startedAt: p.started_at,
      completedAt: p.completed_at,
    }));
  },

  getAllCollectionProgress: async (): Promise<CollectionProgress[]> => {
    const { data, error } = await supabase.from('collection_progress').select('*');
    if (error) { console.error('Error fetching all collection progress:', error); return []; }
    return (data || []).map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      collectionId: p.collection_id,
      status: p.status,
      startedAt: p.started_at,
      completedAt: p.completed_at,
    }));
  },

  upsertCollectionProgress: async (userId: string, collectionId: string, status: 'started' | 'completed'): Promise<void> => {
    const payload: any = { user_id: userId, collection_id: collectionId, status };
    if (status === 'completed') payload.completed_at = new Date().toISOString();
    const { error } = await supabase.from('collection_progress').upsert(payload, { onConflict: 'user_id,collection_id' });
    if (error) console.error('Error upserting collection progress:', error);
  },

  // ---- Invite Tokens ----

  getInviteTokens: async () => {
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((t: any) => ({
      id: t.id,
      token: t.token,
      role: t.role,
      status: t.status || (t.used_at ? 'used' : new Date(t.expires_at) < new Date() ? 'expired' : 'active'),
      usedBy: t.used_by,
      usedAt: t.used_at,
      expiresAt: t.expires_at,
      createdAt: t.created_at,
      senderName: t.sender_name,
      recipientName: t.recipient_name,
      recipientPhone: t.recipient_phone,
      recipientMessage: t.recipient_message,
      sharePreparedAt: t.share_prepared_at,
      sharedAt: t.shared_at,
    }));
  },

  prepareInviteShare: async (
    tokenId: string,
    payload: { senderName: string; recipientName: string; recipientPhone: string; message: string }
  ) => {
    const { error } = await supabase
      .from('invite_tokens')
      .update({
        sender_name: payload.senderName,
        recipient_name: payload.recipientName,
        recipient_phone: payload.recipientPhone,
        recipient_message: payload.message,
        share_prepared_at: new Date().toISOString(),
      } as any)
      .eq('id', tokenId);
    if (error) throw error;
  },

  markInviteShared: async (tokenId: string) => {
    const { error } = await supabase
      .from('invite_tokens')
      .update({ shared_at: new Date().toISOString() } as any)
      .eq('id', tokenId);
    if (error) throw error;
  },

  createInviteToken: async (role: string, expiresInDays: number = 7) => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({ role: role as any, expires_at: expiresAt.toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteInviteToken: async (id: string) => {
    const { error } = await supabase.from('invite_tokens').delete().eq('id', id);
    if (error) throw error;
  },

  validateInviteToken: async (token: string) => {
    const { data, error } = await (supabase as any)
      .rpc('validate_invite_token', { _token: token });
    if (error || !data || data.length === 0) return null;
    const row = data[0];
    return { id: row.id, token, role: row.role, expiresAt: row.expires_at };
  },

  markInviteTokenUsed: async (tokenId: string, userId: string, tokenValue?: string) => {
    if (!tokenValue) {
      console.error('Token value required to consume invite');
      return;
    }
    const { error } = await (supabase as any).rpc('consume_invite_token', {
      _token: tokenValue,
      _user_id: userId,
    });
    if (error) console.error('Error marking token as used:', error);
  },

  login: async () => {},
  register: async () => {},
  loginMock: async () => {},
};

