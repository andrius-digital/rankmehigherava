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
      ava_knowledge: {
        Row: {
          id: string
          category: 'company' | 'vsl' | 'reel' | 'style' | 'faq'
          title: string
          content: string
          embedding: string | null
          metadata: Record<string, any> | null
          is_active: boolean
          priority: 'high' | 'medium' | 'low'
          tags: string[]
          created_at: string
          updated_at: string
          last_used_at: string | null
          use_count: number
        }
        Insert: {
          id?: string
          category: 'company' | 'vsl' | 'reel' | 'style' | 'faq'
          title: string
          content: string
          embedding?: string | null
          metadata?: Record<string, any> | null
          is_active?: boolean
          priority?: 'high' | 'medium' | 'low'
          tags?: string[]
          created_at?: string
          updated_at?: string
          last_used_at?: string | null
          use_count?: number
        }
        Update: {
          id?: string
          category?: 'company' | 'vsl' | 'reel' | 'style' | 'faq'
          title?: string
          content?: string
          embedding?: string | null
          metadata?: Record<string, any> | null
          is_active?: boolean
          priority?: 'high' | 'medium' | 'low'
          tags?: string[]
          created_at?: string
          updated_at?: string
          last_used_at?: string | null
          use_count?: number
        }
        Relationships: []
      }
      ava_training_queue: {
        Row: {
          id: string
          knowledge_id: string
          action_type: 'update' | 'review' | 'verify' | 'expand'
          reason: string | null
          priority: 'high' | 'medium' | 'low'
          status: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          assigned_to: string | null
          due_date: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          knowledge_id: string
          action_type: 'update' | 'review' | 'verify' | 'expand'
          reason?: string | null
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          knowledge_id?: string
          action_type?: 'update' | 'review' | 'verify' | 'expand'
          reason?: string | null
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'in_progress' | 'completed' | 'dismissed'
          assigned_to?: string | null
          due_date?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ava_training_queue_knowledge_id_fkey"
            columns: ["knowledge_id"]
            isOneToOne: false
            referencedRelation: "ava_knowledge"
            referencedColumns: ["id"]
          }
        ]
      }
      agents: {
        Row: {
          client_id: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      call_logs: {
        Row: {
          agent_id: string
          call_date: string
          calls_answered: number
          calls_made: number
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          call_date?: string
          calls_answered?: number
          calls_made?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          call_date?: string
          calls_answered?: number
          calls_made?: number
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          campaign_budget: number
          campaign_length: number
          campaign_start_date: string
          created_at: string
          daily_rate: number
          email: string | null
          id: string
          company_name: string | null
          website_url: string | null
          brand_voice: string | null
          primary_services: string[] | null
          target_audience: string | null
          location_data: Json | null
          status: string
          name: string
          phone: string | null
          updated_at: string
          weeks_paid: number
        }
        Insert: {
          campaign_budget?: number
          campaign_length?: number
          campaign_start_date?: string
          created_at?: string
          daily_rate?: number
          email?: string | null
          id?: string
          company_name?: string | null
          website_url?: string | null
          brand_voice?: string | null
          primary_services?: string[] | null
          target_audience?: string | null
          location_data?: Json | null
          status?: string
          name: string
          phone?: string | null
          updated_at?: string
          weeks_paid?: number
        }
        Update: {
          campaign_budget?: number
          campaign_length?: number
          campaign_start_date?: string
          created_at?: string
          daily_rate?: number
          email?: string | null
          id?: string
          company_name?: string | null
          website_url?: string | null
          brand_voice?: string | null
          primary_services?: string[] | null
          target_audience?: string | null
          location_data?: Json | null
          status?: string
          name?: string
          phone?: string | null
          updated_at?: string
          weeks_paid?: number
        }
        Relationships: []
      }
      global_checklist_items: {
        Row: {
          id: string
          label: string
          description: string
          display_order: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_checklist_status: {
        Row: {
          id: string
          client_id: string
          checklist_item_id: string
          checked: boolean
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          checklist_item_id: string
          checked?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          checklist_item_id?: string
          checked?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_checklist_status_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "global_checklist_items"
            referencedColumns: ["id"]
          }
        ]
      }
      global_client_services: {
        Row: {
          id: string
          label: string
          description: string
          display_order: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_services_status: {
        Row: {
          id: string
          client_id: string
          service_item_id: string
          checked: boolean
          notes: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          service_item_id: string
          checked?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          service_item_id?: string
          checked?: boolean
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_services_status_service_item_id_fkey"
            columns: ["service_item_id"]
            isOneToOne: false
            referencedRelation: "global_client_services"
            referencedColumns: ["id"]
          }
        ]
      }
      global_tech_stack_items: {
        Row: {
          id: string
          label: string
          description: string
          display_order: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          label: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          label?: string
          description?: string
          display_order?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_tech_stack_status: {
        Row: {
          id: string
          client_id: string
          tech_stack_item_id: string
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          tech_stack_item_id: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          tech_stack_item_id?: string
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_tech_stack_status_tech_stack_item_id_fkey"
            columns: ["tech_stack_item_id"]
            isOneToOne: false
            referencedRelation: "global_tech_stack_items"
            referencedColumns: ["id"]
          }
        ]
      }
      client_tech_stack_choices: {
        Row: {
          id: string
          client_id: string
          framework: 'react' | 'html' | null
          hosting: 'vercel' | 'namecheap' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          framework?: 'react' | 'html' | null
          hosting?: 'vercel' | 'namecheap' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          framework?: 'react' | 'html' | null
          hosting?: 'vercel' | 'namecheap' | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          id: string
          created_at: string
          client_id: string
          title: string
          status: string
          category: string | null
          content: Json | null
          seo_metadata: Json | null
          image_url: string | null
          word_count: number | null
          scheduled_date: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          client_id: string
          title: string
          status?: string
          category?: string | null
          content?: Json | null
          seo_metadata?: Json | null
          image_url?: string | null
          word_count?: number | null
          scheduled_date?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          client_id?: string
          title?: string
          status?: string
          category?: string | null
          content?: Json | null
          seo_metadata?: Json | null
          image_url?: string | null
          word_count?: number | null
          scheduled_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          }
        ]
      }
      leads: {
        Row: {
          agent_id: string
          booked_at: string
          client_address: string | null
          client_id: string | null
          client_name: string
          client_phone: string | null
          created_at: string
          id: string
          job_name: string
          notes: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          booked_at?: string
          client_address?: string | null
          client_id?: string | null
          client_name: string
          client_phone?: string | null
          created_at?: string
          id?: string
          job_name: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          booked_at?: string
          client_address?: string | null
          client_id?: string | null
          client_name?: string
          client_phone?: string | null
          created_at?: string
          id?: string
          job_name?: string
          notes?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          assignee_id: string | null
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          order_index: number | null
          task_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number | null
          task_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          order_index?: number | null
          task_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subtasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subtasks_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      task_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          mentions: string[] | null
          task_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          mentions?: string[] | null
          task_id?: string
          updated_at?: string
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
          {
            foreignKeyName: "task_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_id: string | null
          attachments_count: number | null
          created_at: string
          created_by_id: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          labels: Json | null
          order_index: number | null
          priority: string | null
          project: string | null
          status: string
          subtasks_count: number | null
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          attachments_count?: number | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: Json | null
          order_index?: number | null
          priority?: string | null
          project?: string | null
          status?: string
          subtasks_count?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          attachments_count?: number | null
          created_at?: string
          created_by_id?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labels?: Json | null
          order_index?: number | null
          priority?: string | null
          project?: string | null
          status?: string
          subtasks_count?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_id_fkey"
            columns: ["assignee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_id_fkey"
            columns: ["created_by_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_member_rates: {
        Row: {
          clockify_user_id: string
          created_at: string
          hourly_rate: number
          id: string
          member_name: string | null
          updated_at: string
        }
        Insert: {
          clockify_user_id: string
          created_at?: string
          hourly_rate?: number
          id?: string
          member_name?: string | null
          updated_at?: string
        }
        Update: {
          clockify_user_id?: string
          created_at?: string
          hourly_rate?: number
          id?: string
          member_name?: string | null
          updated_at?: string
        }
        Relationships: []
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
      website_submissions: {
        Row: {
          business_email: string
          company_name: string
          created_at: string
          form_data: Json
          id: string
        }
        Insert: {
          business_email: string
          company_name: string
          created_at?: string
          form_data: Json
          id?: string
        }
        Update: {
          business_email?: string
          company_name?: string
          created_at?: string
          form_data?: Json
          id?: string
        }
        Relationships: []
      }
      work_days: {
        Row: {
          client_id: string
          created_at: string
          id: string
          work_date: string
          worked: boolean
        }
        Insert: {
          client_id: string
          created_at?: string
          id?: string
          work_date: string
          worked?: boolean
        }
        Update: {
          client_id?: string
          created_at?: string
          id?: string
          work_date?: string
          worked?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "work_days_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: { Args: { _user_id: string }; Returns: boolean }
      is_authenticated: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "user" | "moderator"
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
      app_role: ["admin", "user", "moderator"],
    },
  },
} as const
