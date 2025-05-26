export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      invoices: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          invoice_number: string;
          date: string;
          due_date: string;
          client_name: string;
          client_email: string;
          client_address: string;
          company_name: string;
          company_address: string;
          company_email: string;
          company_abn: string | null;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          notes: string | null;
          status: string;
          reminder_sent: boolean;
          user_id: string;
          team_id: string | null;
          created_by: string;
          last_modified_by: string;
          line_items: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          invoice_number: string;
          date: string;
          due_date: string;
          client_name: string;
          client_email: string;
          client_address: string;
          company_name: string;
          company_address: string;
          company_email: string;
          company_abn?: string | null;
          subtotal: number;
          tax_rate: number;
          tax_amount: number;
          total: number;
          notes?: string | null;
          status?: string;
          reminder_sent?: boolean;
          user_id: string;
          team_id?: string | null;
          created_by: string;
          last_modified_by: string;
          line_items: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          invoice_number?: string;
          date?: string;
          due_date?: string;
          client_name?: string;
          client_email?: string;
          client_address?: string;
          company_name?: string;
          company_address?: string;
          company_email?: string;
          company_abn?: string | null;
          subtotal?: number;
          tax_rate?: number;
          tax_amount?: number;
          total?: number;
          notes?: string | null;
          status?: string;
          reminder_sent?: boolean;
          user_id?: string;
          team_id?: string | null;
          created_by?: string;
          last_modified_by?: string;
          line_items?: Json;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "invoices_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      teams: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          name: string;
          owner_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name: string;
          owner_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          name?: string;
          owner_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "teams_owner_id_fkey";
            columns: ["owner_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      team_members: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          team_id: string;
          user_id: string;
          role: string;
          invite_accepted: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          team_id: string;
          user_id: string;
          role: string;
          invite_accepted?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          team_id?: string;
          user_id?: string;
          role?: string;
          invite_accepted?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_members_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      team_invites: {
        Row: {
          id: string;
          created_at: string;
          team_id: string;
          email: string;
          role: string;
          invited_by: string;
          token: string;
          expires_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          team_id: string;
          email: string;
          role: string;
          invited_by: string;
          token: string;
          expires_at: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          team_id?: string;
          email?: string;
          role?: string;
          invited_by?: string;
          token?: string;
          expires_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "team_invites_team_id_fkey";
            columns: ["team_id"];
            referencedRelation: "teams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "team_invites_invited_by_fkey";
            columns: ["invited_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          name?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          name?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "users_id_fkey";
            columns: ["id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
