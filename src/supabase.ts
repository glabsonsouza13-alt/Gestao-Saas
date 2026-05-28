/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Helper to handle errors uniformly in Supabase operations.
 */
export function handleSupabaseError(error: any, operation: string) {
  console.error(`[Supabase Error] During ${operation}:`, error);
  throw new Error(`Erro Supabase (${operation}): ${error.message || JSON.stringify(error)}`);
}
