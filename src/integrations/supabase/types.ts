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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          beneficial_owners: Json | null
          birth_date: string | null
          birth_place: string | null
          citizenship: string | null
          city: string | null
          commission: number | null
          commission_type: string | null
          company_fiscal_code: string | null
          company_name: string | null
          compensation_type: string | null
          contract_date: string | null
          counterparty_area_province: string | null
          created_by: string | null
          document_issue_date: string | null
          document_issue_place: string | null
          document_issued_by: string | null
          document_number: string | null
          document_type: string | null
          email: string | null
          fax: string | null
          financing_duration: string | null
          first_name: string | null
          fiscal_code: string | null
          gender: string | null
          id: string
          instruction_fees: number | null
          interest_rate_type: string | null
          last_name: string | null
          legal_address: string | null
          legal_city: string | null
          legal_province: string | null
          legal_representative: Json | null
          legal_zip_code: string | null
          main_activity_province: string | null
          mediator_compensation: number | null
          notes: string | null
          pec: string | null
          phone: string | null
          professional_activity: string | null
          province: string | null
          relationship_destination_province: string | null
          requested_capital: number | null
          requested_product: string | null
          residence_locality: string | null
          status: string
          type: string
          vat_number: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          beneficial_owners?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          citizenship?: string | null
          city?: string | null
          commission?: number | null
          commission_type?: string | null
          company_fiscal_code?: string | null
          company_name?: string | null
          compensation_type?: string | null
          contract_date?: string | null
          counterparty_area_province?: string | null
          created_by?: string | null
          document_issue_date?: string | null
          document_issue_place?: string | null
          document_issued_by?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          fax?: string | null
          financing_duration?: string | null
          first_name?: string | null
          fiscal_code?: string | null
          gender?: string | null
          id?: string
          instruction_fees?: number | null
          interest_rate_type?: string | null
          last_name?: string | null
          legal_address?: string | null
          legal_city?: string | null
          legal_province?: string | null
          legal_representative?: Json | null
          legal_zip_code?: string | null
          main_activity_province?: string | null
          mediator_compensation?: number | null
          notes?: string | null
          pec?: string | null
          phone?: string | null
          professional_activity?: string | null
          province?: string | null
          relationship_destination_province?: string | null
          requested_capital?: number | null
          requested_product?: string | null
          residence_locality?: string | null
          status?: string
          type: string
          vat_number?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          beneficial_owners?: Json | null
          birth_date?: string | null
          birth_place?: string | null
          citizenship?: string | null
          city?: string | null
          commission?: number | null
          commission_type?: string | null
          company_fiscal_code?: string | null
          company_name?: string | null
          compensation_type?: string | null
          contract_date?: string | null
          counterparty_area_province?: string | null
          created_by?: string | null
          document_issue_date?: string | null
          document_issue_place?: string | null
          document_issued_by?: string | null
          document_number?: string | null
          document_type?: string | null
          email?: string | null
          fax?: string | null
          financing_duration?: string | null
          first_name?: string | null
          fiscal_code?: string | null
          gender?: string | null
          id?: string
          instruction_fees?: number | null
          interest_rate_type?: string | null
          last_name?: string | null
          legal_address?: string | null
          legal_city?: string | null
          legal_province?: string | null
          legal_representative?: Json | null
          legal_zip_code?: string | null
          main_activity_province?: string | null
          mediator_compensation?: number | null
          notes?: string | null
          pec?: string | null
          phone?: string | null
          professional_activity?: string | null
          province?: string | null
          relationship_destination_province?: string | null
          requested_capital?: number | null
          requested_product?: string | null
          residence_locality?: string | null
          status?: string
          type?: string
          vat_number?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          expire: string
          sess: Json
          sid: string
        }
        Insert: {
          expire: string
          sess: Json
          sid: string
        }
        Update: {
          expire?: string
          sess?: Json
          sid?: string
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          password: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          password: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          password?: string
          updated_at?: string | null
        }
        Relationships: []
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
