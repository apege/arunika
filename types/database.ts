export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'member' | 'admin';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'PENDING' | 'PAID' | 'FAILED';
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
export type TestimonialStatus = 'pending' | 'approved' | 'rejected';

export interface Profile {
  id: string; // uuid
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: number; // bigint
  name: string;
  robux: number;
  price: number; // bigint in rupiah
  is_active: boolean;
  image_path: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbOrder {
  id: number; // bigint
  order_code: string;
  product_id: number | null;
  user_id: string | null;
  roblox_username: string;
  customer_phone: string;
  robux: number;
  price: number; // bigint
  payment_method: string;
  payment_status: string;
  payment_proof_path: string | null;
  order_status: string;
  created_at: string;
  updated_at: string;
  roblox_user_id: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  expires_at: string | null;
}

export interface DbBlacklist {
  id: number;
  roblox_username: string;
  reason: string | null;
  created_at: string;
  roblox_user_id: string | null;
  phone: string | null;
}

export interface DbStorageCleanupLog {
  id: number;
  cleaned_count: number;
  order_codes: string[];
  mode: string;
  executed_by: string | null;
  details: Json | null;
  created_at: string | null;
}

export interface AdminReplyData {
  adminName: string;
  message: string;
  repliedAt?: string;
}

export interface DbTestimonial {
  id: number; // bigint
  user_id: string | null;
  name: string;
  message: string;
  rating: number;
  image_path: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  admin_reply: AdminReplyData | Json | null;
  order_code: string | null;
  robux?: number | null;
  package_name?: string | null;
}

// Convenient Type Aliases
export type ProductRow = DbProduct;
export type OrderRow = DbOrder;
export type BlacklistRow = DbBlacklist;
export type TestimonialRow = DbTestimonial;
export type StorageCleanupLogRow = DbStorageCleanupLog;
export type ProfileRow = Profile;

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          role?: UserRole;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: DbProduct;
        Insert: {
          id?: number;
          name: string;
          robux: number;
          price: number;
          is_active?: boolean;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          robux?: number;
          price?: number;
          is_active?: boolean;
          image_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: DbOrder;
        Insert: {
          id?: number;
          order_code: string;
          product_id?: number | null;
          user_id?: string | null;
          roblox_username: string;
          customer_phone: string;
          robux: number;
          price: number;
          payment_method: string;
          payment_status?: string;
          payment_proof_path?: string | null;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
          roblox_user_id?: string | null;
          customer_notes?: string | null;
          admin_notes?: string | null;
          expires_at?: string | null;
        };
        Update: {
          id?: number;
          order_code?: string;
          product_id?: number | null;
          user_id?: string | null;
          roblox_username?: string;
          customer_phone?: string;
          robux?: number;
          price?: number;
          payment_method?: string;
          payment_status?: string;
          payment_proof_path?: string | null;
          order_status?: string;
          created_at?: string;
          updated_at?: string;
          roblox_user_id?: string | null;
          customer_notes?: string | null;
          admin_notes?: string | null;
          expires_at?: string | null;
        };
        Relationships: [];
      };
      blacklists: {
        Row: DbBlacklist;
        Insert: {
          id?: number;
          roblox_username: string;
          reason?: string | null;
          created_at?: string;
          roblox_user_id?: string | null;
          phone?: string | null;
        };
        Update: {
          id?: number;
          roblox_username?: string;
          reason?: string | null;
          created_at?: string;
          roblox_user_id?: string | null;
          phone?: string | null;
        };
        Relationships: [];
      };
      testimonials: {
        Row: DbTestimonial;
        Insert: {
          id?: number;
          user_id?: string | null;
          name: string;
          message: string;
          rating?: number;
          image_path?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          admin_reply?: AdminReplyData | Json | null;
          order_code?: string | null;
        };
        Update: {
          id?: number;
          user_id?: string | null;
          name?: string;
          message?: string;
          rating?: number;
          image_path?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          admin_reply?: AdminReplyData | Json | null;
          order_code?: string | null;
        };
        Relationships: [];
      };
      storage_cleanup_logs: {
        Row: DbStorageCleanupLog;
        Insert: {
          id?: number;
          cleaned_count: number;
          order_codes: string[];
          mode: string;
          executed_by?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Update: {
          id?: number;
          cleaned_count?: number;
          order_codes?: string[];
          mode?: string;
          executed_by?: string | null;
          details?: Json | null;
          created_at?: string | null;
        };
        Relationships: [];
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
