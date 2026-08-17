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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          cor: string | null
          created_at: string
          id: string
          nome: string
          responsavel_id: string | null
        }
        Insert: {
          cor?: string | null
          created_at?: string
          id?: string
          nome: string
          responsavel_id?: string | null
        }
        Update: {
          cor?: string | null
          created_at?: string
          id?: string
          nome?: string
          responsavel_id?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          created_at: string
          dados_antes: Json | null
          dados_depois: Json | null
          entidade: string
          entidade_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade: string
          entidade_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_antes?: Json | null
          dados_depois?: Json | null
          entidade?: string
          entidade_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          level: Database["public"]["Enums"]["permission_level"]
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          level?: Database["public"]["Enums"]["permission_level"]
          module: Database["public"]["Enums"]["app_module"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          level?: Database["public"]["Enums"]["permission_level"]
          module?: Database["public"]["Enums"]["app_module"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area_id: string | null
          avatar_url: string | null
          cargo: string | null
          created_at: string
          email: string
          id: string
          nome_completo: string
          status: Database["public"]["Enums"]["user_status"]
          ultimo_acesso: string | null
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email: string
          id: string
          nome_completo: string
          status?: Database["public"]["Enums"]["user_status"]
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          avatar_url?: string | null
          cargo?: string | null
          created_at?: string
          email?: string
          id?: string
          nome_completo?: string
          status?: Database["public"]["Enums"]["user_status"]
          ultimo_acesso?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_fk"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          chave: string
          updated_at: string
          valor: Json
        }
        Insert: {
          chave: string
          updated_at?: string
          valor: Json
        }
        Update: {
          chave?: string
          updated_at?: string
          valor?: Json
        }
        Relationships: []
      }
      tool_categories: {
        Row: {
          created_at: string
          id: string
          nome: string
        }
        Insert: {
          created_at?: string
          id?: string
          nome: string
        }
        Update: {
          created_at?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      tool_costs: {
        Row: {
          competencia: string
          created_at: string
          created_by: string | null
          id: string
          moeda: string
          nota_fiscal_url: string | null
          observacao: string | null
          taxa_cambio: number | null
          tool_id: string
          valor: number
          valor_brl: number
        }
        Insert: {
          competencia: string
          created_at?: string
          created_by?: string | null
          id?: string
          moeda?: string
          nota_fiscal_url?: string | null
          observacao?: string | null
          taxa_cambio?: number | null
          tool_id: string
          valor: number
          valor_brl: number
        }
        Update: {
          competencia?: string
          created_at?: string
          created_by?: string | null
          id?: string
          moeda?: string
          nota_fiscal_url?: string | null
          observacao?: string | null
          taxa_cambio?: number | null
          tool_id?: string
          valor?: number
          valor_brl?: number
        }
        Relationships: [
          {
            foreignKeyName: "tool_costs_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_users: {
        Row: {
          ativo: boolean
          created_at: string
          id: string
          nivel_acesso: string | null
          tool_id: string
          user_id: string
        }
        Insert: {
          ativo?: boolean
          created_at?: string
          id?: string
          nivel_acesso?: string | null
          tool_id: string
          user_id: string
        }
        Update: {
          ativo?: boolean
          created_at?: string
          id?: string
          nivel_acesso?: string | null
          tool_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_users_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tools: {
        Row: {
          aprovada_por: string | null
          area_id: string | null
          categoria_id: string | null
          centro_custo: string | null
          ciclo: Database["public"]["Enums"]["billing_cycle"]
          contem_dados_sensiveis: boolean
          contrato_url: string | null
          created_at: string
          created_by: string | null
          criticidade: Database["public"]["Enums"]["criticidade"]
          custo_mensal_brl: number | null
          data_contratacao: string | null
          data_renovacao: string | null
          descricao_uso: string
          forma_pagamento: string | null
          fornecedor: string | null
          id: string
          logo_url: string | null
          moeda: string
          nome: string
          num_licencas: number
          observacoes: string | null
          plano: string | null
          prazo_cancelamento_dias: number | null
          renovacao_automatica: boolean
          responsavel_id: string | null
          site_url: string | null
          status: Database["public"]["Enums"]["tool_status"]
          ultimos_4_digitos: string | null
          updated_at: string
          valor: number
        }
        Insert: {
          aprovada_por?: string | null
          area_id?: string | null
          categoria_id?: string | null
          centro_custo?: string | null
          ciclo?: Database["public"]["Enums"]["billing_cycle"]
          contem_dados_sensiveis?: boolean
          contrato_url?: string | null
          created_at?: string
          created_by?: string | null
          criticidade?: Database["public"]["Enums"]["criticidade"]
          custo_mensal_brl?: number | null
          data_contratacao?: string | null
          data_renovacao?: string | null
          descricao_uso: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          logo_url?: string | null
          moeda?: string
          nome: string
          num_licencas?: number
          observacoes?: string | null
          plano?: string | null
          prazo_cancelamento_dias?: number | null
          renovacao_automatica?: boolean
          responsavel_id?: string | null
          site_url?: string | null
          status?: Database["public"]["Enums"]["tool_status"]
          ultimos_4_digitos?: string | null
          updated_at?: string
          valor?: number
        }
        Update: {
          aprovada_por?: string | null
          area_id?: string | null
          categoria_id?: string | null
          centro_custo?: string | null
          ciclo?: Database["public"]["Enums"]["billing_cycle"]
          contem_dados_sensiveis?: boolean
          contrato_url?: string | null
          created_at?: string
          created_by?: string | null
          criticidade?: Database["public"]["Enums"]["criticidade"]
          custo_mensal_brl?: number | null
          data_contratacao?: string | null
          data_renovacao?: string | null
          descricao_uso?: string
          forma_pagamento?: string | null
          fornecedor?: string | null
          id?: string
          logo_url?: string | null
          moeda?: string
          nome?: string
          num_licencas?: number
          observacoes?: string | null
          plano?: string | null
          prazo_cancelamento_dias?: number | null
          renovacao_automatica?: boolean
          responsavel_id?: string | null
          site_url?: string | null
          status?: Database["public"]["Enums"]["tool_status"]
          ultimos_4_digitos?: string | null
          updated_at?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "tools_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tools_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "tool_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_module_access: {
        Args: {
          _min_level: Database["public"]["Enums"]["permission_level"]
          _module: Database["public"]["Enums"]["app_module"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_module: "ferramentas" | "tarefas" | "admin"
      app_role: "master_admin" | "admin" | "gestor" | "membro" | "visualizador"
      billing_cycle:
        | "mensal"
        | "trimestral"
        | "semestral"
        | "anual"
        | "vitalicio"
        | "uso"
        | "gratuito"
      criticidade: "critica" | "alta" | "media" | "baixa"
      permission_level: "none" | "view" | "edit" | "admin"
      tool_status: "ativa" | "trial" | "em_avaliacao" | "pausada" | "cancelada"
      user_status: "pending" | "active" | "suspended"
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
      app_module: ["ferramentas", "tarefas", "admin"],
      app_role: ["master_admin", "admin", "gestor", "membro", "visualizador"],
      billing_cycle: [
        "mensal",
        "trimestral",
        "semestral",
        "anual",
        "vitalicio",
        "uso",
        "gratuito",
      ],
      criticidade: ["critica", "alta", "media", "baixa"],
      permission_level: ["none", "view", "edit", "admin"],
      tool_status: ["ativa", "trial", "em_avaliacao", "pausada", "cancelada"],
      user_status: ["pending", "active", "suspended"],
    },
  },
} as const
