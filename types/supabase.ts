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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          role_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          role_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          role_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      roles: {
        Row: {
          id: string
          name: 'user' | 'admin'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: 'user' | 'admin'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: 'user' | 'admin'
          description?: string | null
          created_at?: string
        }
      }
      plans: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          currency: string
          interval: 'month' | 'year' | 'one-time' | null
          features: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          currency?: string
          interval?: 'month' | 'year' | 'one-time' | null
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          currency?: string
          interval?: 'month' | 'year' | 'one-time' | null
          features?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          paystack_reference: string
          amount: number
          currency: string
          status: 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded' | 'disputed'
          plan_id: string | null
          paystack_response: Json | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          paystack_reference: string
          amount: number
          currency?: string
          status?: 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded' | 'disputed'
          plan_id?: string | null
          paystack_response?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          paystack_reference?: string
          amount?: number
          currency?: string
          status?: 'pending' | 'success' | 'failed' | 'abandoned' | 'refunded' | 'disputed'
          plan_id?: string | null
          paystack_response?: Json | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          changes: Json
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          changes?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          changes?: Json
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']