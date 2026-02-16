export type Role = 'client' | 'distributor' | 'consultant' | 'super_admin';
export type Language = 'pt-br' | 'en-us' | 'es-es';
export type MaterialType = 'image' | 'pdf' | 'video';
export type UserStatus = 'pending' | 'active' | 'inactive' | 'rejected';
export type TranslationStatus = 'draft' | 'review' | 'published';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  whatsapp: string;
  cro?: string;
  status: UserStatus;
  allowedTypes?: MaterialType[];
  preferences: {
    theme: 'light' | 'dark';
    language: Language;
  };
}

export interface MaterialAsset {
  url: string;
  subtitleUrl?: string;
  status: TranslationStatus;
}

export interface Material {
  id: string;
  title: Partial<Record<Language, string>>;
  type: MaterialType;
  allowedRoles: Role[];
  assets: Partial<Record<Language, MaterialAsset>>;
  active: boolean;
  createdAt: string;
}

export interface Collection {
  id: string;
  title: Partial<Record<Language, string>>;
  description?: Partial<Record<Language, string>>;
  coverImage?: string;
  allowedRoles: Role[];
  active: boolean;
  createdAt: string;
}

export interface CollectionItem {
  id: string;
  collectionId: string;
  materialId: string;
  orderIndex: number;
}

export interface UserProgress {
  userId: string;
  materialId: string;
  status: 'started' | 'completed';
  completedAt: string;
}

export interface AccessLog {
  id: string;
  materialId: string;
  materialTitle: string;
  userId: string;
  userName: string;
  userRole: Role;
  language: Language;
  timestamp: string;
}

export interface ColorScheme {
  background: string;
  surface: string;
  textMain: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
}

export interface SystemConfig {
  appName: string;
  logoUrl?: string;
  webhookUrl?: string;
  themeLight: ColorScheme;
  themeDark: ColorScheme;
}
