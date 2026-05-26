export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      access_logs: {
        Row: {
          id: string
          language: Database["public"]["Enums"]["app_language"]
          material_id: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          material_id?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          material_id?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "access_logs_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_items: {
        Row: {
          collection_id: string
          id: string
          material_id: string
          order_index: number
        }
        Insert: {
          collection_id: string
          id?: string
          material_id: string
          order_index?: number
        }
        Update: {
          collection_id?: string
          id?: string
          material_id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collection_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      collection_progress: {
        Row: {
          collection_id: string
          completed_at: string | null
          created_at: string
          id: string
          started_at: string
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          started_at?: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "collection_progress_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          active: boolean
          allowed_roles: Database["public"]["Enums"]["app_role"][]
          cover_image: string | null
          created_at: string
          description: Json | null
          id: string
          points: number
          title: Json
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["app_role"][]
          cover_image?: string | null
          created_at?: string
          description?: Json | null
          id?: string
          points?: number
          title?: Json
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["app_role"][]
          cover_image?: string | null
          created_at?: string
          description?: Json | null
          id?: string
          points?: number
          title?: Json
          updated_at?: string
        }
        Relationships: []
      }
      gamification_levels: {
        Row: {
          color: string
          created_at: string
          id: string
          min_points: number
          name: string
          order_index: number
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          min_points?: number
          name: string
          order_index?: number
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          min_points?: number
          name?: string
          order_index?: number
          updated_at?: string
        }
        Relationships: []
      }
      invite_tokens: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          recipient_message: string | null
          recipient_name: string | null
          recipient_phone: string | null
          role: Database["public"]["Enums"]["app_role"]
          sender_name: string | null
          share_prepared_at: string | null
          shared_at: string | null
          status: string
          token: string
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          recipient_message?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          role: Database["public"]["Enums"]["app_role"]
          sender_name?: string | null
          share_prepared_at?: string | null
          shared_at?: string | null
          status?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          recipient_message?: string | null
          recipient_name?: string | null
          recipient_phone?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          sender_name?: string | null
          share_prepared_at?: string | null
          shared_at?: string | null
          status?: string
          token?: string
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invite_tokens_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      material_assets: {
        Row: {
          created_at: string
          id: string
          language: Database["public"]["Enums"]["app_language"]
          material_id: string
          status: Database["public"]["Enums"]["translation_status"]
          subtitle_url: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          material_id: string
          status?: Database["public"]["Enums"]["translation_status"]
          subtitle_url?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: Database["public"]["Enums"]["app_language"]
          material_id?: string
          status?: Database["public"]["Enums"]["translation_status"]
          subtitle_url?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_assets_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      materials: {
        Row: {
          active: boolean
          allowed_roles: Database["public"]["Enums"]["app_role"][]
          category: string | null
          created_at: string
          id: string
          points: number
          tags: string[]
          title: Json
          type: Database["public"]["Enums"]["material_type"]
          updated_at: string
        }
        Insert: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["app_role"][]
          category?: string | null
          created_at?: string
          id?: string
          points?: number
          tags?: string[]
          title?: Json
          type?: Database["public"]["Enums"]["material_type"]
          updated_at?: string
        }
        Update: {
          active?: boolean
          allowed_roles?: Database["public"]["Enums"]["app_role"][]
          category?: string | null
          created_at?: string
          id?: string
          points?: number
          tags?: string[]
          title?: Json
          type?: Database["public"]["Enums"]["material_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allowed_types: Database["public"]["Enums"]["material_type"][] | null
          created_at: string
          cro: string | null
          email: string
          id: string
          name: string
          points: number
          preferences: Json
          rejection_reason: string | null
          status: Database["public"]["Enums"]["app_status"]
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          allowed_types?: Database["public"]["Enums"]["material_type"][] | null
          created_at?: string
          cro?: string | null
          email: string
          id: string
          name: string
          points?: number
          preferences?: Json
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          allowed_types?: Database["public"]["Enums"]["material_type"][] | null
          created_at?: string
          cro?: string | null
          email?: string
          id?: string
          name?: string
          points?: number
          preferences?: Json
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["app_status"]
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      system_config: {
        Row: {
          app_name: string
          environment_themes: Json
          id: number
          logo_url: string | null
          theme_dark: Json
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          app_name?: string
          environment_themes?: Json
          id?: number
          logo_url?: string | null
          theme_dark?: Json
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          app_name?: string
          environment_themes?: Json
          id?: number
          logo_url?: string | null
          theme_dark?: Json
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          collection_id: string | null
          completed_at: string | null
          created_at: string
          id: string
          material_id: string
          status: Database["public"]["Enums"]["progress_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          collection_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          collection_id?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          material_id?: string
          status?: Database["public"]["Enums"]["progress_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "materials"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      system_config_public: {
        Row: {
          app_name: string | null
          environment_themes: Json | null
          id: number | null
          logo_url: string | null
          theme_dark: Json | null
          updated_at: string | null
        }
        Insert: {
          app_name?: string | null
          environment_themes?: Json | null
          id?: number | null
          logo_url?: string | null
          theme_dark?: Json | null
          updated_at?: string | null
        }
        Update: {
          app_name?: string | null
          environment_themes?: Json | null
          id?: number | null
          logo_url?: string | null
          theme_dark?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_invite_token: {
        Args: { _token: string }
        Returns: {
          expires_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
        }[]
      }
    }
    Enums: {
      app_language: "pt-br" | "en-us" | "es-es"
      app_role:
        | "client"
        | "distributor"
        | "consultant"
        | "super_admin"
        | "manager"
      app_status: "pending" | "active" | "inactive" | "rejected"
      material_type: "pdf" | "image" | "video" | "audio" | "html"
      progress_status: "started" | "completed"
      translation_status: "draft" | "review" | "published"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_language: ["pt-br", "en-us", "es-es"],
      app_role: [
        "client",
        "distributor",
        "consultant",
        "super_admin",
        "manager",
      ],
      app_status: ["pending", "active", "inactive", "rejected"],
      material_type: ["pdf", "image", "video", "audio", "html"],
      progress_status: ["started", "completed"],
      translation_status: ["draft", "review", "published"],
    },
  },
} as const
