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
      client_logos: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          name: string
          sort_order: number
          url: string | null
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url: string
          name?: string
          sort_order?: number
          url?: string | null
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          sort_order?: number
          url?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          content: string
          id: string
          type: string
          updated_at: string
        }
        Insert: {
          content?: string
          id?: string
          type: string
          updated_at?: string
        }
        Update: {
          content?: string
          id?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          commission_mode: string
          commission_value: number
          created_at: string
          id: string
          install_discount_enabled: boolean
          install_discount_mode: string
          install_discount_value: number
          monthly_discount_enabled: boolean
          monthly_discount_mode: string
          monthly_discount_value: number
          representative_id: string | null
        }
        Insert: {
          active?: boolean
          code: string
          commission_mode?: string
          commission_value?: number
          created_at?: string
          id?: string
          install_discount_enabled?: boolean
          install_discount_mode?: string
          install_discount_value?: number
          monthly_discount_enabled?: boolean
          monthly_discount_mode?: string
          monthly_discount_value?: number
          representative_id?: string | null
        }
        Update: {
          active?: boolean
          code?: string
          commission_mode?: string
          commission_value?: number
          created_at?: string
          id?: string
          install_discount_enabled?: boolean
          install_discount_mode?: string
          install_discount_value?: number
          monthly_discount_enabled?: boolean
          monthly_discount_mode?: string
          monthly_discount_value?: number
          representative_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coupons_representative_id_fkey"
            columns: ["representative_id"]
            isOneToOne: false
            referencedRelation: "representatives"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          address_cep: string | null
          address_city: string | null
          address_complement: string | null
          address_neighborhood: string | null
          address_note: string | null
          address_number: string | null
          address_street: string | null
          address_uf: string | null
          birth_date: string | null
          cancellation_reason: string | null
          cnpj: string | null
          collected_at: string
          coupon_code: string | null
          coupon_description: string | null
          cpf: string
          created_at: string
          doc1_name: string | null
          doc1_url: string | null
          doc2_name: string | null
          doc2_url: string | null
          email: string
          emergency_name: string | null
          emergency_phone: string | null
          emergency_relationship: string | null
          financial_email: string | null
          financial_name: string | null
          financial_phone: string | null
          form_type: string
          full_name: string
          geolocation: string | null
          id: string
          ie: string | null
          ie_isento: boolean | null
          install_address_choice: string | null
          install_cep: string | null
          install_city: string | null
          install_complement: string | null
          install_neighborhood: string | null
          install_note: string | null
          install_number: string | null
          install_periods: string | null
          install_street: string | null
          install_uf: string | null
          install_value: string | null
          installation_paid: boolean
          installation_payment: string | null
          ip_address: string | null
          monthly_due_day: string | null
          monthly_payment: string | null
          monthly_value: string | null
          nome_fantasia: string | null
          notes: string | null
          phone_primary: string
          phone_secondary: string | null
          plan_name: string | null
          platform_username: string | null
          razao_social: string | null
          remote_blocking: string | null
          rg: string
          status: string
          user_agent: string | null
          user_agent_friendly: string | null
          vehicle_brand: string | null
          vehicle_color: string | null
          vehicle_fuel: string | null
          vehicle_max_days: string | null
          vehicle_model: string | null
          vehicle_plate: string | null
          vehicle_type: string | null
          vehicle_year: string | null
        }
        Insert: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_note?: string | null
          address_number?: string | null
          address_street?: string | null
          address_uf?: string | null
          birth_date?: string | null
          cancellation_reason?: string | null
          cnpj?: string | null
          collected_at?: string
          coupon_code?: string | null
          coupon_description?: string | null
          cpf: string
          created_at?: string
          doc1_name?: string | null
          doc1_url?: string | null
          doc2_name?: string | null
          doc2_url?: string | null
          email: string
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          financial_email?: string | null
          financial_name?: string | null
          financial_phone?: string | null
          form_type?: string
          full_name: string
          geolocation?: string | null
          id?: string
          ie?: string | null
          ie_isento?: boolean | null
          install_address_choice?: string | null
          install_cep?: string | null
          install_city?: string | null
          install_complement?: string | null
          install_neighborhood?: string | null
          install_note?: string | null
          install_number?: string | null
          install_periods?: string | null
          install_street?: string | null
          install_uf?: string | null
          install_value?: string | null
          installation_paid?: boolean
          installation_payment?: string | null
          ip_address?: string | null
          monthly_due_day?: string | null
          monthly_payment?: string | null
          monthly_value?: string | null
          nome_fantasia?: string | null
          notes?: string | null
          phone_primary: string
          phone_secondary?: string | null
          plan_name?: string | null
          platform_username?: string | null
          razao_social?: string | null
          remote_blocking?: string | null
          rg: string
          status?: string
          user_agent?: string | null
          user_agent_friendly?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_fuel?: string | null
          vehicle_max_days?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Update: {
          address_cep?: string | null
          address_city?: string | null
          address_complement?: string | null
          address_neighborhood?: string | null
          address_note?: string | null
          address_number?: string | null
          address_street?: string | null
          address_uf?: string | null
          birth_date?: string | null
          cancellation_reason?: string | null
          cnpj?: string | null
          collected_at?: string
          coupon_code?: string | null
          coupon_description?: string | null
          cpf?: string
          created_at?: string
          doc1_name?: string | null
          doc1_url?: string | null
          doc2_name?: string | null
          doc2_url?: string | null
          email?: string
          emergency_name?: string | null
          emergency_phone?: string | null
          emergency_relationship?: string | null
          financial_email?: string | null
          financial_name?: string | null
          financial_phone?: string | null
          form_type?: string
          full_name?: string
          geolocation?: string | null
          id?: string
          ie?: string | null
          ie_isento?: boolean | null
          install_address_choice?: string | null
          install_cep?: string | null
          install_city?: string | null
          install_complement?: string | null
          install_neighborhood?: string | null
          install_note?: string | null
          install_number?: string | null
          install_periods?: string | null
          install_street?: string | null
          install_uf?: string | null
          install_value?: string | null
          installation_paid?: boolean
          installation_payment?: string | null
          ip_address?: string | null
          monthly_due_day?: string | null
          monthly_payment?: string | null
          monthly_value?: string | null
          nome_fantasia?: string | null
          notes?: string | null
          phone_primary?: string
          phone_secondary?: string | null
          plan_name?: string | null
          platform_username?: string | null
          razao_social?: string | null
          remote_blocking?: string | null
          rg?: string
          status?: string
          user_agent?: string | null
          user_agent_friendly?: string | null
          vehicle_brand?: string | null
          vehicle_color?: string | null
          vehicle_fuel?: string | null
          vehicle_max_days?: string | null
          vehicle_model?: string | null
          vehicle_plate?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          ip_address: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          ip_address: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          ip_address?: string
        }
        Relationships: []
      }
      representatives: {
        Row: {
          active: boolean
          cpf: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          phone: string | null
          pix_key: string | null
        }
        Insert: {
          active?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          phone?: string | null
          pix_key?: string | null
        }
        Update: {
          active?: boolean
          cpf?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          pix_key?: string | null
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_rate_limits: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_coupon: {
        Args: { coupon_code: string }
        Returns: {
          code: string
          id: string
          install_discount_enabled: boolean
          install_discount_mode: string
          install_discount_value: number
          monthly_discount_enabled: boolean
          monthly_discount_mode: string
          monthly_discount_value: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
