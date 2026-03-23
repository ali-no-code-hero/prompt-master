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
      prompts: {
        Row: {
          id: string;
          prompt_text: string;
          target_brand: string;
          competitors: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_text: string;
          target_brand: string;
          competitors?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_text?: string;
          target_brand?: string;
          competitors?: string[];
          created_at?: string;
        };
        Relationships: [];
      };
      ai_runs: {
        Row: {
          id: string;
          prompt_id: string;
          model_name: string;
          full_response: string;
          summary: string | null;
          sentiment: string | null;
          recommendation_context: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          prompt_id: string;
          model_name: string;
          full_response: string;
          summary?: string | null;
          sentiment?: string | null;
          recommendation_context?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          prompt_id?: string;
          model_name?: string;
          full_response?: string;
          summary?: string | null;
          sentiment?: string | null;
          recommendation_context?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_runs_prompt_id_fkey";
            columns: ["prompt_id"];
            isOneToOne: false;
            referencedRelation: "prompts";
            referencedColumns: ["id"];
          },
        ];
      };
      brand_mentions: {
        Row: {
          id: string;
          run_id: string;
          brand_name: string;
          mention_count: number;
          is_target: boolean;
        };
        Insert: {
          id?: string;
          run_id: string;
          brand_name: string;
          mention_count: number;
          is_target?: boolean;
        };
        Update: {
          id?: string;
          run_id?: string;
          brand_name?: string;
          mention_count?: number;
          is_target?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "brand_mentions_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "ai_runs";
            referencedColumns: ["id"];
          },
        ];
      };
      sources: {
        Row: {
          id: string;
          run_id: string;
          url: string;
          category: string;
        };
        Insert: {
          id?: string;
          run_id: string;
          url: string;
          category: string;
        };
        Update: {
          id?: string;
          run_id?: string;
          url?: string;
          category?: string;
        };
        Relationships: [
          {
            foreignKeyName: "sources_run_id_fkey";
            columns: ["run_id"];
            isOneToOne: false;
            referencedRelation: "ai_runs";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
