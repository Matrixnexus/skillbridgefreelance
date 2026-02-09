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
      job_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          job_count: number
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          job_count?: number
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          job_count?: number
          name?: string
        }
        Relationships: []
      }
      job_submissions: {
        Row: {
          admin_feedback: string | null
          created_at: string
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          google_drive_file_id: string | null
          id: string
          job_id: string
          payment_amount: number
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["submission_status"]
          submission_content: string
          submission_url: string | null
          updated_at: string
          user_id: string
          worker_file_name: string | null
          worker_file_url: string | null
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          google_drive_file_id?: string | null
          id?: string
          job_id: string
          payment_amount: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_content: string
          submission_url?: string | null
          updated_at?: string
          user_id: string
          worker_file_name?: string | null
          worker_file_url?: string | null
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          google_drive_file_id?: string | null
          id?: string
          job_id?: string
          payment_amount?: number
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["submission_status"]
          submission_content?: string
          submission_url?: string | null
          updated_at?: string
          user_id?: string
          worker_file_name?: string | null
          worker_file_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          category_id: string | null
          created_at: string
          current_submissions: number
          deadline: string | null
          description: string
          difficulty: Database["public"]["Enums"]["job_difficulty"]
          estimated_time: string | null
          id: string
          instructions: string
          is_active: boolean
          job_file_name: string | null
          job_file_type: string | null
          job_file_url: string | null
          max_submissions: number | null
          payment_amount: number
          required_tier: Database["public"]["Enums"]["membership_tier"]
          submission_format: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          current_submissions?: number
          deadline?: string | null
          description: string
          difficulty?: Database["public"]["Enums"]["job_difficulty"]
          estimated_time?: string | null
          id?: string
          instructions: string
          is_active?: boolean
          job_file_name?: string | null
          job_file_type?: string | null
          job_file_url?: string | null
          max_submissions?: number | null
          payment_amount: number
          required_tier?: Database["public"]["Enums"]["membership_tier"]
          submission_format?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          current_submissions?: number
          deadline?: string | null
          description?: string
          difficulty?: Database["public"]["Enums"]["job_difficulty"]
          estimated_time?: string | null
          id?: string
          instructions?: string
          is_active?: boolean
          job_file_name?: string | null
          job_file_type?: string | null
          job_file_url?: string | null
          max_submissions?: number | null
          payment_amount?: number
          required_tier?: Database["public"]["Enums"]["membership_tier"]
          submission_format?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "job_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          paypal_order_id: string | null
          plan: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          paypal_order_id?: string | null
          plan: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          paypal_order_id?: string | null
          plan?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      paypal_orders: {
        Row: {
          amount: number
          capture_data: Json | null
          captured_at: string | null
          created_at: string
          custom_id: string | null
          id: string
          order_id: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          capture_data?: Json | null
          captured_at?: string | null
          created_at?: string
          custom_id?: string | null
          id?: string
          order_id: string
          status: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          capture_data?: Json | null
          captured_at?: string | null
          created_at?: string
          custom_id?: string | null
          id?: string
          order_id?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved_earnings: number
          avatar_url: string | null
          created_at: string
          daily_tasks_used: number
          email: string
          full_name: string | null
          id: string
          last_task_reset_date: string
          membership_expires_at: string | null
          membership_tier: Database["public"]["Enums"]["membership_tier"]
          pending_earnings: number
          rating: number | null
          referral_code: string | null
          referral_earnings: number | null
          referred_by: string | null
          task_earnings: number | null
          tasks_completed: number
          total_earnings: number
          updated_at: string
        }
        Insert: {
          approved_earnings?: number
          avatar_url?: string | null
          created_at?: string
          daily_tasks_used?: number
          email: string
          full_name?: string | null
          id: string
          last_task_reset_date?: string
          membership_expires_at?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          pending_earnings?: number
          rating?: number | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          task_earnings?: number | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
        }
        Update: {
          approved_earnings?: number
          avatar_url?: string | null
          created_at?: string
          daily_tasks_used?: number
          email?: string
          full_name?: string | null
          id?: string
          last_task_reset_date?: string
          membership_expires_at?: string | null
          membership_tier?: Database["public"]["Enums"]["membership_tier"]
          pending_earnings?: number
          rating?: number | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          task_earnings?: number | null
          tasks_completed?: number
          total_earnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          bonus_amount: number
          created_at: string
          credited_at: string | null
          id: string
          referred_id: string
          referred_tier: Database["public"]["Enums"]["membership_tier"]
          referrer_id: string
          status: string
          updated_at: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          credited_at?: string | null
          id?: string
          referred_id: string
          referred_tier?: Database["public"]["Enums"]["membership_tier"]
          referrer_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          credited_at?: string | null
          id?: string
          referred_id?: string
          referred_tier?: Database["public"]["Enums"]["membership_tier"]
          referrer_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          paypal_order_id: string | null
          paypal_payer_id: string | null
          plan: string
          plan_name: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          plan: string
          plan_name: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          paypal_order_id?: string | null
          paypal_payer_id?: string | null
          plan?: string
          plan_name?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          reference_id: string | null
          status: string
          type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          reference_id?: string | null
          status?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          balance_type: string
          completed_at: string | null
          created_at: string
          id: string
          payment_details: Json | null
          payment_method: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          balance_type: string
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          balance_type?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          payment_details?: Json | null
          payment_method?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      admin_submissions_view: {
        Row: {
          created_at: string | null
          display_file_name: string | null
          display_file_url: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string | null
          job_id: string | null
          job_title: string | null
          payment_amount: number | null
          status: Database["public"]["Enums"]["submission_status"] | null
          submission_content: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
          worker_file_name: string | null
          worker_file_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_submissions_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      generate_referral_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_referral_code: { Args: { p_code: string }; Returns: string }
      process_withdrawal_safely: {
        Args: { p_amount: number; p_user_id: string }
        Returns: {
          message: string
          new_approved_balance: number
          success: boolean
        }[]
      }
      update_submission_earnings_atomically: {
        Args: {
          p_new_status: Database["public"]["Enums"]["submission_status"]
          p_payment_amount: number
          p_submission_id: string
        }
        Returns: {
          message: string
          success: boolean
          updated_total_earnings: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "freelancer"
      job_difficulty: "easy" | "medium" | "hard"
      membership_tier: "none" | "regular" | "pro" | "vip"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "freelancer"],
      job_difficulty: ["easy", "medium", "hard"],
      membership_tier: ["none", "regular", "pro", "vip"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
