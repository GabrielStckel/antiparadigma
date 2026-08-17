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
      project_members: {
        Row: {
          created_at: string
          id: string
          papel: Database["public"]["Enums"]["project_role"]
          project_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          papel?: Database["public"]["Enums"]["project_role"]
          project_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          papel?: Database["public"]["Enums"]["project_role"]
          project_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          area_id: string | null
          arquivado: boolean
          cliente: string | null
          cor: string | null
          created_at: string
          created_by: string | null
          data_fim_prevista: string | null
          data_fim_real: string | null
          data_inicio: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number
          owner_id: string | null
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
        }
        Insert: {
          area_id?: string | null
          arquivado?: boolean
          cliente?: string | null
          cor?: string | null
          created_at?: string
          created_by?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          owner_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Update: {
          area_id?: string | null
          arquivado?: boolean
          cliente?: string | null
          cor?: string | null
          created_at?: string
          created_by?: string | null
          data_fim_prevista?: string | null
          data_fim_real?: string | null
          data_inicio?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          owner_id?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_area_id_fkey"
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
      task_activity: {
        Row: {
          campo: string
          created_at: string
          id: string
          task_id: string
          user_id: string | null
          valor_antes: string | null
          valor_depois: string | null
        }
        Insert: {
          campo: string
          created_at?: string
          id?: string
          task_id: string
          user_id?: string | null
          valor_antes?: string | null
          valor_depois?: string | null
        }
        Update: {
          campo?: string
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string | null
          valor_antes?: string | null
          valor_depois?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_activity_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_assignees: {
        Row: {
          created_at: string
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignees_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_attachments: {
        Row: {
          created_at: string
          id: string
          mime_type: string | null
          nome_arquivo: string
          storage_path: string
          tamanho_bytes: number | null
          task_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          storage_path: string
          tamanho_bytes?: number | null
          task_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          storage_path?: string
          tamanho_bytes?: number | null
          task_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_attachments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_checklist_items: {
        Row: {
          concluido: boolean
          created_at: string
          id: string
          ordem: number
          task_id: string
          texto: string
        }
        Insert: {
          concluido?: boolean
          created_at?: string
          id?: string
          ordem?: number
          task_id: string
          texto: string
        }
        Update: {
          concluido?: boolean
          created_at?: string
          id?: string
          ordem?: number
          task_id?: string
          texto?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_checklist_items_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          conteudo: string
          created_at: string
          editado_em: string | null
          id: string
          mencionados: string[]
          task_id: string
          user_id: string
        }
        Insert: {
          conteudo: string
          created_at?: string
          editado_em?: string | null
          id?: string
          mencionados?: string[]
          task_id: string
          user_id: string
        }
        Update: {
          conteudo?: string
          created_at?: string
          editado_em?: string | null
          id?: string
          mencionados?: string[]
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_comments_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_id: string
          id: string
          task_id: string
          tipo: Database["public"]["Enums"]["dependency_type"]
        }
        Insert: {
          created_at?: string
          depends_on_id: string
          id?: string
          task_id: string
          tipo?: Database["public"]["Enums"]["dependency_type"]
        }
        Update: {
          created_at?: string
          depends_on_id?: string
          id?: string
          task_id?: string
          tipo?: Database["public"]["Enums"]["dependency_type"]
        }
        Relationships: [
          {
            foreignKeyName: "task_dependencies_depends_on_id_fkey"
            columns: ["depends_on_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "task_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_statuses: {
        Row: {
          cor: string
          created_at: string
          id: string
          nome: string
          ordem: number
          project_id: string | null
          tipo: Database["public"]["Enums"]["status_type"]
        }
        Insert: {
          cor?: string
          created_at?: string
          id?: string
          nome: string
          ordem?: number
          project_id?: string | null
          tipo?: Database["public"]["Enums"]["status_type"]
        }
        Update: {
          cor?: string
          created_at?: string
          id?: string
          nome?: string
          ordem?: number
          project_id?: string | null
          tipo?: Database["public"]["Enums"]["status_type"]
        }
        Relationships: [
          {
            foreignKeyName: "task_statuses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_entries: {
        Row: {
          created_at: string
          data: string
          descricao: string | null
          horas: number
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: string
          descricao?: string | null
          horas: number
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: string
          descricao?: string | null
          horas?: number
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_watchers: {
        Row: {
          id: string
          task_id: string
          user_id: string
        }
        Insert: {
          id?: string
          task_id: string
          user_id: string
        }
        Update: {
          id?: string
          task_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_watchers_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          arquivada: boolean
          codigo: string | null
          concluida_em: string | null
          created_at: string
          created_by: string | null
          data_inicio: string | null
          descricao: string | null
          estimativa_horas: number | null
          horas_gastas: number
          id: string
          nivel: number
          ordem: number
          parent_task_id: string | null
          prazo: string | null
          prioridade: Database["public"]["Enums"]["task_priority"]
          progresso: number
          project_id: string
          recorrencia: Json | null
          responsavel_id: string | null
          status_id: string
          tags: string[]
          titulo: string
          updated_at: string
        }
        Insert: {
          arquivada?: boolean
          codigo?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          descricao?: string | null
          estimativa_horas?: number | null
          horas_gastas?: number
          id?: string
          nivel?: number
          ordem?: number
          parent_task_id?: string | null
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["task_priority"]
          progresso?: number
          project_id: string
          recorrencia?: Json | null
          responsavel_id?: string | null
          status_id: string
          tags?: string[]
          titulo: string
          updated_at?: string
        }
        Update: {
          arquivada?: boolean
          codigo?: string | null
          concluida_em?: string | null
          created_at?: string
          created_by?: string | null
          data_inicio?: string | null
          descricao?: string | null
          estimativa_horas?: number | null
          horas_gastas?: number
          id?: string
          nivel?: number
          ordem?: number
          parent_task_id?: string | null
          prazo?: string | null
          prioridade?: Database["public"]["Enums"]["task_priority"]
          progresso?: number
          project_id?: string
          recorrencia?: Json | null
          responsavel_id?: string | null
          status_id?: string
          tags?: string[]
          titulo?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_parent_task_id_fkey"
            columns: ["parent_task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_status_id_fkey"
            columns: ["status_id"]
            isOneToOne: false
            referencedRelation: "task_statuses"
            referencedColumns: ["id"]
          },
        ]
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
      can_access_project: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      can_edit_task: {
        Args: { _task_id: string; _user_id: string }
        Returns: boolean
      }
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
      dependency_type: "bloqueia" | "aguarda" | "relacionada"
      permission_level: "none" | "view" | "edit" | "admin"
      project_role: "owner" | "editor" | "leitor"
      project_status:
        | "planejado"
        | "ativo"
        | "pausado"
        | "concluido"
        | "cancelado"
      status_type:
        | "aberto"
        | "andamento"
        | "revisao"
        | "concluido"
        | "cancelado"
      task_priority: "urgente" | "alta" | "normal" | "baixa"
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
      dependency_type: ["bloqueia", "aguarda", "relacionada"],
      permission_level: ["none", "view", "edit", "admin"],
      project_role: ["owner", "editor", "leitor"],
      project_status: [
        "planejado",
        "ativo",
        "pausado",
        "concluido",
        "cancelado",
      ],
      status_type: ["aberto", "andamento", "revisao", "concluido", "cancelado"],
      task_priority: ["urgente", "alta", "normal", "baixa"],
      tool_status: ["ativa", "trial", "em_avaliacao", "pausada", "cancelada"],
      user_status: ["pending", "active", "suspended"],
    },
  },
} as const
