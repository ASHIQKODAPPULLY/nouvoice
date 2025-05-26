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
      fine_tuning_examples: {
        Row: {
          id: string;
          prompt: string;
          completion: string;
          created_at: string;
          used_in_training: boolean;
          source: string;
          quality_score: number;
        };
        Insert: {
          id?: string;
          prompt: string;
          completion: string;
          created_at?: string;
          used_in_training?: boolean;
          source?: string;
          quality_score?: number;
        };
        Update: {
          id?: string;
          prompt?: string;
          completion?: string;
          created_at?: string;
          used_in_training?: boolean;
          source?: string;
          quality_score?: number;
        };
      };
      fine_tuning_jobs: {
        Row: {
          id: string;
          model_name: string;
          provider: string;
          status: string;
          created_at: string;
          completed_at: string | null;
          examples_count: number;
          validation_loss: number | null;
          training_loss: number | null;
          fine_tuned_model_id: string | null;
          metadata: Json | null;
        };
        Insert: {
          id?: string;
          model_name: string;
          provider: string;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          examples_count?: number;
          validation_loss?: number | null;
          training_loss?: number | null;
          fine_tuned_model_id?: string | null;
          metadata?: Json | null;
        };
        Update: {
          id?: string;
          model_name?: string;
          provider?: string;
          status?: string;
          created_at?: string;
          completed_at?: string | null;
          examples_count?: number;
          validation_loss?: number | null;
          training_loss?: number | null;
          fine_tuned_model_id?: string | null;
          metadata?: Json | null;
        };
      };
    };
  };
}
