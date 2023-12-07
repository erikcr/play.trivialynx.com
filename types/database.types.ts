export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      events_stag_100: {
        Row: {
          date_of_event: string | null
          description: string | null
          id: number
          inserted_at: string
          location: string | null
          name: string | null
          owner: string | null
          updated_at: string
        }
        Insert: {
          date_of_event?: string | null
          description?: string | null
          id?: number
          inserted_at?: string
          location?: string | null
          name?: string | null
          owner?: string | null
          updated_at?: string
        }
        Update: {
          date_of_event?: string | null
          description?: string | null
          id?: number
          inserted_at?: string
          location?: string | null
          name?: string | null
          owner?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_stag_100_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events_stag_200: {
        Row: {
          date_of_event: string | null
          description: string | null
          id: number
          inserted_at: string
          location: string | null
          name: string | null
          updated_at: string
        }
        Insert: {
          date_of_event?: string | null
          description?: string | null
          id?: number
          inserted_at?: string
          location?: string | null
          name?: string | null
          updated_at?: string
        }
        Update: {
          date_of_event?: string | null
          description?: string | null
          id?: number
          inserted_at?: string
          location?: string | null
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      questions_stag_100: {
        Row: {
          answer: string | null
          id: number
          inserted_at: string
          points: number | null
          question: string | null
          round_id: number | null
          updated_at: string
        }
        Insert: {
          answer?: string | null
          id?: number
          inserted_at?: string
          points?: number | null
          question?: string | null
          round_id?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string | null
          id?: number
          inserted_at?: string
          points?: number | null
          question?: string | null
          round_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      responses_stag_100: {
        Row: {
          id: number
          inserted_at: string
          is_correct: boolean | null
          question_id: number | null
          submitted_answer: string | null
          team_id: number | null
          updated_at: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_correct?: boolean | null
          question_id?: number | null
          submitted_answer?: string | null
          team_id?: number | null
          updated_at?: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_correct?: boolean | null
          question_id?: number | null
          submitted_answer?: string | null
          team_id?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      rounds_stag_100: {
        Row: {
          description: string | null
          event_id: number | null
          id: number
          inserted_at: string
          name: string | null
          status: Database["public"]["Enums"]["round_status"]
          updated_at: string
        }
        Insert: {
          description?: string | null
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Update: {
          description?: string | null
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Relationships: []
      }
      rounds_stag_200: {
        Row: {
          description: string | null
          event_id: number | null
          id: number
          inserted_at: string
          name: string | null
          status: Database["public"]["Enums"]["round_status"] | null
          updated_at: string
        }
        Insert: {
          description?: string | null
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          status?: Database["public"]["Enums"]["round_status"] | null
          updated_at?: string
        }
        Update: {
          description?: string | null
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          status?: Database["public"]["Enums"]["round_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rounds_stag_200_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_stag_200"
            referencedColumns: ["id"]
          }
        ]
      }
      teams_stag_100: {
        Row: {
          event_id: number | null
          id: number
          inserted_at: string
          name: string | null
          updated_at: string
        }
        Insert: {
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          event_id?: number | null
          id?: number
          inserted_at?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      v0_events_stag: {
        Row: {
          date_of_event: string
          description: string | null
          id: number
          inserted_at: string
          join_code: number
          location: string | null
          name: string
          owner: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          date_of_event: string
          description?: string | null
          id?: number
          inserted_at?: string
          join_code?: number
          location?: string | null
          name: string
          owner: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          date_of_event?: string
          description?: string | null
          id?: number
          inserted_at?: string
          join_code?: number
          location?: string | null
          name?: string
          owner?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "v0_events_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      v0_questions_stag: {
        Row: {
          answer: string
          id: number
          inserted_at: string
          owner: string
          points: number
          question: string
          round_id: number
          updated_at: string
        }
        Insert: {
          answer: string
          id?: number
          inserted_at?: string
          owner: string
          points: number
          question: string
          round_id: number
          updated_at?: string
        }
        Update: {
          answer?: string
          id?: number
          inserted_at?: string
          owner?: string
          points?: number
          question?: string
          round_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v0_questions_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "v0_questions_stag_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "v0_rounds_stag"
            referencedColumns: ["id"]
          }
        ]
      }
      v0_rounds_stag: {
        Row: {
          description: string | null
          event_id: number
          id: number
          inserted_at: string
          name: string
          order_num: number
          owner: string
          status: Database["public"]["Enums"]["round_status"]
          updated_at: string
        }
        Insert: {
          description?: string | null
          event_id: number
          id?: number
          inserted_at?: string
          name: string
          order_num: number
          owner: string
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Update: {
          description?: string | null
          event_id?: number
          id?: number
          inserted_at?: string
          name?: string
          order_num?: number
          owner?: string
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v0_rounds_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      v0_teams_stag: {
        Row: {
          event_id: number
          id: number
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          event_id: number
          id?: number
          inserted_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          event_id?: number
          id?: number
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      v001_events_stag: {
        Row: {
          date_of_event: string
          description: string | null
          id: number
          inserted_at: string
          join_code: number
          location: string | null
          name: string
          owner: string
          status: Database["public"]["Enums"]["event_status"]
          updated_at: string
          venue: string | null
        }
        Insert: {
          date_of_event: string
          description?: string | null
          id?: number
          inserted_at?: string
          join_code?: number
          location?: string | null
          name: string
          owner: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
        }
        Update: {
          date_of_event?: string
          description?: string | null
          id?: number
          inserted_at?: string
          join_code?: number
          location?: string | null
          name?: string
          owner?: string
          status?: Database["public"]["Enums"]["event_status"]
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "v001_events_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      v001_questions_stag: {
        Row: {
          answer: string
          id: number
          inserted_at: string
          owner: string
          points: number
          question: string
          round_id: number
          status: Database["public"]["Enums"]["question_status"]
          updated_at: string
        }
        Insert: {
          answer: string
          id?: number
          inserted_at?: string
          owner: string
          points: number
          question: string
          round_id: number
          status?: Database["public"]["Enums"]["question_status"]
          updated_at?: string
        }
        Update: {
          answer?: string
          id?: number
          inserted_at?: string
          owner?: string
          points?: number
          question?: string
          round_id?: number
          status?: Database["public"]["Enums"]["question_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v001_questions_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "v001_questions_stag_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "v001_rounds_stag"
            referencedColumns: ["id"]
          }
        ]
      }
      v001_responses_stag: {
        Row: {
          id: number
          inserted_at: string
          is_correct: boolean | null
          question_id: number
          submitted_answer: string
          team_id: number
          updated_at: string
        }
        Insert: {
          id?: number
          inserted_at?: string
          is_correct?: boolean | null
          question_id: number
          submitted_answer: string
          team_id: number
          updated_at?: string
        }
        Update: {
          id?: number
          inserted_at?: string
          is_correct?: boolean | null
          question_id?: number
          submitted_answer?: string
          team_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v001_responses_stag_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "v001_questions_stag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "v001_responses_stag_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "v001_teams_stag"
            referencedColumns: ["id"]
          }
        ]
      }
      v001_rounds_stag: {
        Row: {
          description: string | null
          event_id: number
          id: number
          inserted_at: string
          name: string
          order_num: number
          owner: string
          status: Database["public"]["Enums"]["round_status"]
          updated_at: string
        }
        Insert: {
          description?: string | null
          event_id: number
          id?: number
          inserted_at?: string
          name: string
          order_num: number
          owner: string
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Update: {
          description?: string | null
          event_id?: number
          id?: number
          inserted_at?: string
          name?: string
          order_num?: number
          owner?: string
          status?: Database["public"]["Enums"]["round_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v001_rounds_stag_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v001_events_stag"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "v001_rounds_stag_owner_fkey"
            columns: ["owner"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      v001_teams_stag: {
        Row: {
          event_id: number
          id: number
          inserted_at: string
          name: string
          updated_at: string
        }
        Insert: {
          event_id: number
          id?: number
          inserted_at?: string
          name: string
          updated_at?: string
        }
        Update: {
          event_id?: number
          id?: number
          inserted_at?: string
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "v001_teams_stag_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "v001_events_stag"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      event_status: "PENDING" | "ONGOING" | "COMPLETE"
      question_status: "PENDING" | "ONGOING" | "COMPLETE"
      round_status: "PENDING" | "ONGOING" | "COMPLETE"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

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
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
