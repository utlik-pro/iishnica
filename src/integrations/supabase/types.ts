export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      bot_users: {
        Row: {
          id: number
          tg_user_id: number
          username: string | null
          first_name: string | null
          last_name: string | null
          phone_number: string | null
          first_seen_at: string
          points: number
          warns: number
          banned: boolean
          source: string | null
          utm_source: string | null
          utm_medium: string | null
          utm_campaign: string | null
          referrer: string | null
        }
        Insert: {
          id?: number
          tg_user_id: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          first_seen_at?: string
          points?: number
          warns?: number
          banned?: boolean
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer?: string | null
        }
        Update: {
          id?: number
          tg_user_id?: number
          username?: string | null
          first_name?: string | null
          last_name?: string | null
          phone_number?: string | null
          first_seen_at?: string
          points?: number
          warns?: number
          banned?: boolean
          source?: string | null
          utm_source?: string | null
          utm_medium?: string | null
          utm_campaign?: string | null
          referrer?: string | null
        }
        Relationships: []
      }
      bot_events: {
        Row: {
          id: number
          title: string
          description: string | null
          event_date: string
          city: string
          location: string | null
          location_url: string | null
          speakers: string | null
          max_participants: number | null
          registration_deadline: string | null
          is_active: boolean
          created_at: string
          created_by: number | null
          web_event_id: string | null
        }
        Insert: {
          id?: number
          title: string
          description?: string | null
          event_date: string
          city?: string
          location?: string | null
          location_url?: string | null
          speakers?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: number | null
          web_event_id?: string | null
        }
        Update: {
          id?: number
          title?: string
          description?: string | null
          event_date?: string
          city?: string
          location?: string | null
          location_url?: string | null
          speakers?: string | null
          max_participants?: number | null
          registration_deadline?: string | null
          is_active?: boolean
          created_at?: string
          created_by?: number | null
          web_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_events_web_event_id_fkey"
            columns: ["web_event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_registrations: {
        Row: {
          id: number
          event_id: number
          user_id: number
          registered_at: string
          status: string
          notes: string | null
          registration_version: string
          confirmed: boolean
          confirmation_requested_at: string | null
          reminder_sent: boolean
          reminder_sent_at: string | null
        }
        Insert: {
          id?: number
          event_id: number
          user_id: number
          registered_at?: string
          status?: string
          notes?: string | null
          registration_version?: string
          confirmed?: boolean
          confirmation_requested_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
        }
        Update: {
          id?: number
          event_id?: number
          user_id?: number
          registered_at?: string
          status?: string
          notes?: string | null
          registration_version?: string
          confirmed?: boolean
          confirmation_requested_at?: string | null
          reminder_sent?: boolean
          reminder_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bot_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "bot_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "bot_users"
            referencedColumns: ["id"]
          },
        ]
      }
      bot_feedback: {
        Row: {
          id: number
          event_id: number
          user_id: number
          speaker1_rating: number | null
          speaker2_rating: number | null
          comment: string | null
          interested_topics: string | null
          created_at: string
        }
        Insert: {
          id?: number
          event_id: number
          user_id: number
          speaker1_rating?: number | null
          speaker2_rating?: number | null
          comment?: string | null
          interested_topics?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          event_id?: number
          user_id?: number
          speaker1_rating?: number | null
          speaker2_rating?: number | null
          comment?: string | null
          interested_topics?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bot_feedback_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "bot_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bot_feedback_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "bot_users"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          id: string
          name: string
          address: string | null
          photo_url: string | null
          yandex_map_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          photo_url?: string | null
          yandex_map_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          photo_url?: string | null
          yandex_map_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      admins: {
        Row: {
          created_at: string
          id: string
          password: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password?: string
          username?: string
        }
        Relationships: []
      }
      event_speakers: {
        Row: {
          id: string
          event_id: string
          speaker_id: string
          talk_title: string | null
          talk_description: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          speaker_id: string
          talk_title?: string | null
          talk_description?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          speaker_id?: string
          talk_title?: string | null
          talk_description?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_speakers_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_speakers_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_program: {
        Row: {
          id: string
          event_id: string
          time_start: string
          time_end: string
          title: string
          description: string | null
          type: string
          speaker_id: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          time_start: string
          time_end: string
          title: string
          description?: string | null
          type?: string
          speaker_id?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          time_start?: string
          time_end?: string
          title?: string
          description?: string | null
          type?: string
          speaker_id?: string | null
          order_index?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_program_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_program_speaker_id_fkey"
            columns: ["speaker_id"]
            isOneToOne: false
            referencedRelation: "speakers"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sponsors: {
        Row: {
          event_id: string | null
          id: string
          sponsor_id: string | null
        }
        Insert: {
          event_id?: string | null
          id?: string
          sponsor_id?: string | null
        }
        Update: {
          event_id?: string | null
          id?: string
          sponsor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sponsors_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sponsors_sponsor_id_fkey"
            columns: ["sponsor_id"]
            isOneToOne: false
            referencedRelation: "sponsors"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          date: string
          description: string | null
          duration_minutes: number
          id: string
          is_published: boolean
          location_address: string | null
          location_name: string | null
          price: number
          registration_info: string | null
          speaker: string | null
          slug: string | null
          telegram_bot_url: string | null
          title: string
          updated_at: string
          yandex_map_url: string | null
        }
        Insert: {
          created_at?: string
          date: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          location_address?: string | null
          location_name?: string | null
          price?: number
          registration_info?: string | null
          speaker?: string | null
          slug?: string | null
          telegram_bot_url?: string | null
          title: string
          updated_at?: string
          yandex_map_url?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_published?: boolean
          location_address?: string | null
          location_name?: string | null
          price?: number
          registration_info?: string | null
          speaker?: string | null
          slug?: string | null
          telegram_bot_url?: string | null
          title?: string
          updated_at?: string
          yandex_map_url?: string | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          is_archived: boolean
          name: string
          notes: string | null
          phone: string
          status: Database["public"]["Enums"]["lead_status"]
          ticket_sent: boolean
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_archived?: boolean
          name: string
          notes?: string | null
          phone: string
          status?: Database["public"]["Enums"]["lead_status"]
          ticket_sent?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_archived?: boolean
          name?: string
          notes?: string | null
          phone?: string
          status?: Database["public"]["Enums"]["lead_status"]
          ticket_sent?: boolean
        }
        Relationships: []
      }
      speakers: {
        Row: {
          id: string
          name: string
          title: string | null
          description: string | null
          photo_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          title?: string | null
          description?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          title?: string | null
          description?: string | null
          photo_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sponsors: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          website_url?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          content: string
          excerpt: string | null
          category: "blog" | "news" | "article"
          featured_image_url: string | null
          meta_title: string | null
          meta_description: string | null
          og_image_url: string | null
          author: string | null
          is_published: boolean
          published_at: string | null
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          content: string
          excerpt?: string | null
          category?: "blog" | "news" | "article"
          featured_image_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          author?: string | null
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          content?: string
          excerpt?: string | null
          category?: "blog" | "news" | "article"
          featured_image_url?: string | null
          meta_title?: string | null
          meta_description?: string | null
          og_image_url?: string | null
          author?: string | null
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      send_ticket: {
        Args: { lead_id: string }
        Returns: boolean
      }
    }
    Enums: {
      lead_status:
        | "new"
        | "contacted"
        | "paid"
        | "not_paid"
        | "will_attend"
        | "will_not_attend"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      lead_status: [
        "new",
        "contacted",
        "paid",
        "not_paid",
        "will_attend",
        "will_not_attend",
      ],
    },
  },
} as const
