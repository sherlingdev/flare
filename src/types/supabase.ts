/**
 * TypeScript types for Supabase database tables
 * These types match the database schema in Supabase
 */

export interface Currency {
    id: number;
    code: string;
    name: string;
    symbol: string | null;
    flag: string | null; // Note: column name in DB is 'flag', not 'flag_url'
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Rate {
    id: number;
    currency_id: number;
    rate: number;
    created_at: string;
    updated_at: string;
}

export interface Historical {
    id: number;
    currency_id: number;
    rate: number;
    date: string;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    api_key: string;
    is_active: boolean;
    created_at: string;
}

export interface RateLimit {
    id: number;
    identifier: string;
    timestamp: number;
    is_authenticated: boolean;
    created_at?: string;
    updated_at?: string;
}

/**
 * Database types for Supabase client
 */
export interface Database {
    public: {
        Tables: {
            currencies: {
                Row: Currency;
                Insert: Omit<Currency, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Currency, 'id' | 'created_at'>>;
            };
            rates: {
                Row: Rate;
                Insert: Omit<Rate, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Rate, 'id' | 'created_at'>>;
            };
            historicals: {
                Row: Historical;
                Insert: Omit<Historical, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<Historical, 'id' | 'created_at'>>;
            };
            users: {
                Row: User;
                Insert: Omit<User, 'id' | 'created_at'>;
                Update: Partial<Omit<User, 'id' | 'created_at'>>;
            };
            rate_limits: {
                Row: RateLimit;
                Insert: Omit<RateLimit, 'id' | 'created_at' | 'updated_at'>;
                Update: Partial<Omit<RateLimit, 'id' | 'created_at'>>;
            };
        };
    };
}

