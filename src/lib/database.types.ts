export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      audio_clips: {
        Row: {
          audio_file_id: number | null;
          end_time: number | null;
          id: number;
          index: number;
          name: string;
          playback_rate: number;
          start_time: number;
          track_id: number;
        };
        Insert: {
          audio_file_id?: number | null;
          end_time?: number | null;
          id?: never;
          index: number;
          name: string;
          playback_rate?: number;
          start_time?: number;
          track_id: number;
        };
        Update: {
          audio_file_id?: number | null;
          end_time?: number | null;
          id?: never;
          index?: number;
          name?: string;
          playback_rate?: number;
          start_time?: number;
          track_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "audio_clips_audio_file_id_fkey";
            columns: ["audio_file_id"];
            isOneToOne: false;
            referencedRelation: "audio_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "audio_clips_track_id_fkey";
            columns: ["track_id"];
            isOneToOne: false;
            referencedRelation: "tracks";
            referencedColumns: ["id"];
          }
        ];
      };
      audio_files: {
        Row: {
          bpm: number | null;
          bucket: string;
          description: string | null;
          id: number;
          mime_type: string;
          path: string;
          size: number;
        };
        Insert: {
          bpm?: number | null;
          bucket?: string;
          description?: string | null;
          id?: never;
          mime_type: string;
          path: string;
          size: number;
        };
        Update: {
          bpm?: number | null;
          bucket?: string;
          description?: string | null;
          id?: never;
          mime_type?: string;
          path?: string;
          size?: number;
        };
        Relationships: [];
      };
      pool_files: {
        Row: {
          audio_file_id: number;
          project_id: number;
        };
        Insert: {
          audio_file_id: number;
          project_id: number;
        };
        Update: {
          audio_file_id?: number;
          project_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "pool_files_audio_file_id_fkey";
            columns: ["audio_file_id"];
            isOneToOne: false;
            referencedRelation: "audio_files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pool_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
          website: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      projects: {
        Row: {
          bpm: number;
          created_by_user_id: string;
          description: string | null;
          id: number;
          name: string;
          time_signature: string;
        };
        Insert: {
          bpm?: number;
          created_by_user_id: string;
          description?: string | null;
          id?: never;
          name: string;
          time_signature?: string;
        };
        Update: {
          bpm?: number;
          created_by_user_id?: string;
          description?: string | null;
          id?: never;
          name?: string;
          time_signature?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_created_by_user_id_fkey";
            columns: ["created_by_user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      tracks: {
        Row: {
          gain: number;
          id: number;
          name: string | null;
          panning: number;
          position: number;
          project_id: number;
        };
        Insert: {
          gain?: number;
          id?: never;
          name?: string | null;
          panning?: number;
          position: number;
          project_id: number;
        };
        Update: {
          gain?: number;
          id?: never;
          name?: string | null;
          panning?: number;
          position?: number;
          project_id?: number;
        };
        Relationships: [
          {
            foreignKeyName: "tracks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  PublicEnumNameOrOptions extends keyof Database["public"]["Enums"] | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
    ? Database["public"]["Enums"][PublicEnumNameOrOptions]
    : never;
